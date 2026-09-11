const DEFAULTS = {
  origin: "",
  token: "",
  enabled: true,
  igHandle: "",
  lastError: "",
  lastJob: "",
  tickCount: 0,
  localJobs: [],
  doneDiscover: [],
  lastSendAt: 0,
};

async function state() {
  const cur = await chrome.storage.local.get(DEFAULTS);
  return { ...DEFAULTS, ...cur };
}

async function patch(partial) {
  await chrome.storage.local.set(partial);
  return state();
}

async function api(path, options = {}) {
  const s = await state();
  if (!s.origin || !s.token) throw new Error("Not paired with Nitefill. Open your Nitefill dashboard.");
  const url = `${s.origin.replace(/\/$/, "")}/api/ext/${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${s.token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Nitefill ${res.status}`);
  return json;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function broadcast(payload) {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (!tab.id) continue;
    try {
      await chrome.tabs.sendMessage(tab.id, { type: "DASH_EVENT", payload });
    } catch {
      /* tab has no content script */
    }
  }
}

async function igTabs() {
  return chrome.tabs.query({ url: "https://www.instagram.com/*" });
}

async function ensureIgTab() {
  const existing = await igTabs();
  if (existing[0]?.id) return existing[0];
  const tab = await chrome.tabs.create({ url: "https://www.instagram.com/", active: true });
  await waitComplete(tab.id);
  await sleep(900);
  return tab;
}

function waitComplete(tabId) {
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve(), 12000);
    const listener = (id, info) => {
      if (id === tabId && info.status === "complete") {
        chrome.tabs.onUpdated.removeListener(listener);
        clearTimeout(t);
        resolve();
      }
    };
    chrome.tabs.onUpdated.addListener(listener);
  });
}

async function sendToTab(tabId, message) {
  try {
    return await chrome.tabs.sendMessage(tabId, message);
  } catch {
    await chrome.scripting.executeScript({ target: { tabId }, files: ["content-ig.js"] });
    await sleep(150);
    return chrome.tabs.sendMessage(tabId, message);
  }
}

async function heartbeat() {
  const s = await state();
  if (!s.origin || !s.token) return;
  let handle = s.igHandle;
  let igPk = "";
  try {
    const tab = (await igTabs())[0];
    if (tab?.id) {
      const me = await sendToTab(tab.id, { type: "WHOAMI" });
      if (me?.ok) {
        handle = me.handle || handle;
        igPk = me.igPk || "";
        await patch({ igHandle: handle, lastError: "" });
      } else if (me?.error) {
        await patch({ lastError: me.error });
      }
    }
  } catch (err) {
    await patch({ lastError: err instanceof Error ? err.message : String(err) });
  }
  try {
    await api("heartbeat", { method: "POST", body: JSON.stringify({ handle, igPk }) });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (!/invalid pairing/i.test(message)) {
      await patch({ lastError: message });
    }
  }
}

function takeRows(rows, seen, profiles, limit) {
  if (!Array.isArray(rows)) return;
  for (const p of rows) {
    const handle = String(p.handle || "").toLowerCase();
    if (!handle || seen.has(handle) || p.isPrivate) continue;
    seen.add(handle);
    profiles.push(p);
    if (profiles.length >= limit) return;
  }
}

async function doDiscover(job) {
  await broadcast({ kind: "discover-progress", campaignId: job.campaignId, message: "Opening Instagram…" });
  const tab = await ensureIgTab();
  const me = await sendToTab(tab.id, { type: "WHOAMI" });
  if (!me?.ok) throw new Error(me?.error || "Sign in to Instagram in Chrome.");
  const profiles = [];
  const seen = new Set();
  const limit = Math.min(24, job.limit || 24);
  const seeds = (job.seeds || []).filter(Boolean);
  const perSeed = Math.max(8, Math.ceil(limit / Math.max(1, seeds.length)));
  if (me.handle) seen.add(String(me.handle).toLowerCase());
  for (const seed of seeds) seen.add(String(seed).toLowerCase());

  for (const seed of seeds) {
    await broadcast({
      kind: "discover-progress",
      campaignId: job.campaignId,
      message: `Looking up @${seed}…`,
    });
    let user;
    try {
      user = await sendToTab(tab.id, { type: "LOOKUP", username: seed });
    } catch (err) {
      await patch({ lastError: `Seed @${seed}: ${err instanceof Error ? err.message : String(err)}` });
      continue;
    }
    if (user?.error || user?.ok === false) {
      await broadcast({
        kind: "discover-progress",
        campaignId: job.campaignId,
        message: `@${seed} could not be read. Trying the next seed…`,
      });
      continue;
    }
    if (user.isPrivate) {
      await broadcast({
        kind: "discover-progress",
        campaignId: job.campaignId,
        message: `@${seed} is private — skipped.`,
      });
      continue;
    }

    try {
      await broadcast({
        kind: "discover-progress",
        campaignId: job.campaignId,
        message: `Reading @${seed} followers…`,
      });
      takeRows(await sendToTab(tab.id, { type: "FOLLOWERS", userId: user.igPk, limit: perSeed }), seen, profiles, limit);
    } catch {
      /* blocked */
    }
    if (profiles.length >= limit) break;

    try {
      await broadcast({
        kind: "discover-progress",
        campaignId: job.campaignId,
        message: `Reading who @${seed} follows…`,
      });
      takeRows(await sendToTab(tab.id, { type: "FOLLOWING", userId: user.igPk, limit: perSeed }), seen, profiles, limit);
    } catch {
      /* blocked */
    }
    if (profiles.length >= limit) break;

    let mediaIds = Array.isArray(user.mediaIds) ? user.mediaIds : [];
    if (mediaIds.length < 2 && user.igPk) {
      try {
        const extra = await sendToTab(tab.id, { type: "MEDIA_IDS", userId: user.igPk, limit: 6 });
        if (Array.isArray(extra)) mediaIds = extra;
      } catch {
        /* ignore */
      }
    }
    if (mediaIds.length) {
      try {
        await broadcast({
          kind: "discover-progress",
          campaignId: job.campaignId,
          message: `Reading likes and comments on @${seed}…`,
        });
        takeRows(await sendToTab(tab.id, { type: "ENGAGERS", mediaIds, limit: perSeed }), seen, profiles, limit);
      } catch {
        /* blocked */
      }
    }
    if (profiles.length >= limit) break;

    if (profiles.length < 6) {
      await chrome.tabs.update(tab.id, { url: `https://www.instagram.com/${seed}/`, active: true });
      await waitComplete(tab.id);
      await sleep(800);
      try {
        takeRows(await sendToTab(tab.id, { type: "FOLLOWERS_DOM", limit: perSeed }), seen, profiles, limit);
      } catch {
        /* keep what we have */
      }
      if (profiles.length < 6) {
        try {
          takeRows(await sendToTab(tab.id, { type: "FOLLOWING_DOM", limit: perSeed }), seen, profiles, limit);
        } catch {
          /* keep */
        }
      }
    }

    await broadcast({
      kind: "discover-progress",
      campaignId: job.campaignId,
      message: `Found ${profiles.length} people so far…`,
    });
    if (profiles.length >= limit) break;
  }

  try {
    await api("discover", {
      method: "POST",
      body: JSON.stringify({ campaignId: job.campaignId, profiles }),
    });
  } catch {
    /* dashboard still gets the list from DASH_EVENT */
  }

  const s = await state();
  const done = new Set(s.doneDiscover || []);
  if (profiles.length > 0) done.add(job.campaignId);
  await patch({
    lastJob: profiles.length ? `Found ${profiles.length} people` : "No public accounts yet",
    lastError: profiles.length
      ? ""
      : "Instagram hid those lists. Paste handles on the campaign page or try a venue you follow.",
    doneDiscover: [...done],
  });
  await broadcast({
    kind: "discover-done",
    campaignId: job.campaignId,
    profiles,
    message:
      profiles.length > 0
        ? `Found ${profiles.length} people. Launch SafeSend when you are ready.`
        : "Instagram hid those lists. Paste handles on the campaign page, or try a public venue you follow.",
  });
}

async function doSend(job) {
  const tab = await ensureIgTab();
  const me = await sendToTab(tab.id, { type: "WHOAMI" });
  if (!me?.ok) throw new Error(me?.error || "Sign in to Instagram in Chrome.");

  await broadcast({
    kind: "send-progress",
    campaignId: job.campaignId,
    message: `Messaging @${job.handle}…`,
  });

  let igPk = job.igPk;
  if (!igPk) {
    const looked = await sendToTab(tab.id, { type: "LOOKUP", username: job.handle });
    if (looked?.error || looked?.ok === false) throw new Error(looked?.error || `Could not find @${job.handle}`);
    igPk = looked.igPk;
    if (looked.isPrivate) throw new Error("Account is private — skipped");
  }

  let result;
  let lastErr = null;
  try {
    result = await sendToTab(tab.id, { type: "SEND_API", userId: igPk, text: job.message });
    if (result?.ok === false) throw new Error(result.error || "API send failed");
  } catch (err) {
    lastErr = err;
    result = null;
  }

  if (!result?.ok) {
    await chrome.tabs.update(tab.id, { url: `https://www.instagram.com/${job.handle}/`, active: true });
    await waitComplete(tab.id);
    await sleep(800);
    result = await sendToTab(tab.id, { type: "SEND_DOM", text: job.message });
    if (result?.ok === false) {
      throw lastErr || new Error(result.error || "Instagram did not send the message");
    }
  }

  try {
    await api("sent", {
      method: "POST",
      body: JSON.stringify({
        audienceId: job.audienceId,
        campaignId: job.campaignId,
        ok: true,
        igPk,
      }),
    });
  } catch {
    /* local confirmation still stands */
  }
  await patch({ lastJob: `Sent @${job.handle}`, lastError: "" });
  await broadcast({
    kind: "sent",
    campaignId: job.campaignId,
    handle: job.handle,
    message: `Sent @${job.handle}`,
  });
}

async function doInbox() {
  const tab = (await igTabs())[0];
  if (!tab?.id) return;
  const replies = await sendToTab(tab.id, { type: "INBOX" });
  if (!Array.isArray(replies) || replies.length === 0) return;
  try {
    await api("inbox", { method: "POST", body: JSON.stringify({ replies }) });
  } catch {
    /* best-effort */
  }
}

let ticking = false;
let lastTick = 0;

async function nextJob() {
  const s = await state();
  const local = Array.isArray(s.localJobs) ? [...s.localJobs] : [];
  if (local[0]) {
    const job = local[0];
    await patch({ localJobs: local.slice(1) });
    return job;
  }
  try {
    return await api("work");
  } catch {
    return { kind: "idle" };
  }
}

async function tick() {
  if (ticking) return;
  const s = await state();
  if (!s.enabled) return;
  if (!s.origin || !s.token) return;
  ticking = true;
  lastTick = Date.now();
  try {
    await heartbeat();
    const work = await nextJob();
    if (work.kind === "discover") {
      const done = new Set((await state()).doneDiscover || []);
      if (done.has(work.campaignId)) {
        await patch({ lastJob: "Followers already loaded" });
      } else {
        try {
          await doDiscover(work);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          try {
            await api("discover", {
              method: "POST",
              body: JSON.stringify({ campaignId: work.campaignId, profiles: [], error: message }),
            });
          } catch {
            /* ignore */
          }
          await broadcast({ kind: "discover-error", campaignId: work.campaignId, message });
          throw err;
        }
      }
    } else if (work.kind === "send") {
      const gap = 40_000;
      const last = Number(s.lastSendAt) || 0;
      if (work.local && last && Date.now() - last < gap) {
        const cur = await state();
        const rest = Array.isArray(cur.localJobs) ? cur.localJobs : [];
        await patch({
          localJobs: [work, ...rest],
          lastJob: `Next DM in ${Math.ceil((gap - (Date.now() - last)) / 1000)}s`,
        });
      } else {
        try {
          await doSend(work);
          await patch({ lastSendAt: Date.now() });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          try {
            await api("sent", {
              method: "POST",
              body: JSON.stringify({
                audienceId: work.audienceId,
                campaignId: work.campaignId,
                ok: false,
                error: message,
              }),
            });
          } catch {
            /* ignore */
          }
          throw err;
        }
      }
    } else if (work.kind === "wait") {
      await patch({ lastJob: "SafeSend waiting for the next gap" });
    } else {
      await patch({ lastJob: s.lastJob || "Paired — waiting for a campaign" });
    }
    const next = (Number(s.tickCount) || 0) + 1;
    await patch({ tickCount: next });
    if (next % 4 === 0) {
      try {
        await doInbox();
      } catch {
        /* inbox is best-effort */
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await patch({ lastError: message });
    await broadcast({ kind: "error", lastError: message, message });
  } finally {
    ticking = false;
  }
}

function maybeTick() {
  if (Date.now() - lastTick < 4000) return;
  void tick();
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("nitefill-tick", { periodInMinutes: 1 });
});
chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create("nitefill-tick", { periodInMinutes: 1 });
});
chrome.alarms.onAlarm.addListener((a) => {
  if (a.name === "nitefill-tick") void tick();
});
chrome.tabs.onUpdated.addListener((_id, info, tab) => {
  if (info.status === "complete" && tab.url && tab.url.includes("instagram.com")) void tick();
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    if (msg?.type === "PAIR" && msg.token && msg.origin) {
      await patch({ origin: String(msg.origin), token: String(msg.token), lastError: "" });
      void tick();
      return { ok: true };
    }
    if (msg?.type === "ENQUEUE" && msg.job) {
      const cur = await state();
      const jobs = Array.isArray(cur.localJobs) ? [...cur.localJobs] : [];
      const incoming = msg.job;
      const dup = jobs.some(
        (j) => j.kind === incoming.kind && j.campaignId === incoming.campaignId && j.handle === incoming.handle,
      );
      if (!dup) jobs.push(incoming);
      const done =
        incoming.kind === "discover"
          ? (cur.doneDiscover || []).filter((id) => id !== incoming.campaignId)
          : cur.doneDiscover || [];
      await patch({
        localJobs: jobs,
        doneDiscover: done,
        lastJob: incoming.kind === "discover" ? "Finding people…" : "Queued",
      });
      void tick();
      return { ok: true, queued: jobs.length };
    }
    if (msg?.type === "KEEPALIVE") {
      maybeTick();
      return { ok: true };
    }
    if (msg?.type === "GET_STATE") return state();
    if (msg?.type === "SET_ENABLED") {
      await patch({ enabled: Boolean(msg.enabled) });
      if (msg.enabled) void tick();
      return state();
    }
    if (msg?.type === "TICK") {
      lastTick = 0;
      await tick();
      return state();
    }
    return { ok: false };
  })()
    .then(sendResponse)
    .catch((err) => sendResponse({ error: err instanceof Error ? err.message : String(err) }));
  return true;
});

void tick();
