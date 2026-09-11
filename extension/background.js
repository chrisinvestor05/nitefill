const DEFAULTS = {
  origin: "",
  token: "",
  enabled: true,
  igHandle: "",
  lastError: "",
  lastJob: "",
  tickCount: 0,
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

async function igTabs() {
  return chrome.tabs.query({ url: "https://www.instagram.com/*" });
}

async function ensureIgTab() {
  const existing = await igTabs();
  if (existing[0]?.id) return existing[0];
  const tab = await chrome.tabs.create({ url: "https://www.instagram.com/", active: false });
  await waitComplete(tab.id);
  await sleep(1600);
  return tab;
}

function waitComplete(tabId) {
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve(), 18000);
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
    await sleep(250);
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
    await patch({ lastError: err instanceof Error ? err.message : String(err) });
  }
}

async function doDiscover(job) {
  const tab = await ensureIgTab();
  const me = await sendToTab(tab.id, { type: "WHOAMI" });
  if (!me?.ok) throw new Error(me?.error || "Sign in to Instagram in Chrome.");
  const profiles = [];
  const seen = new Set();
  const perSeed = Math.max(8, Math.ceil((job.limit || 50) / Math.max(1, job.seeds.length)));

  for (const seed of job.seeds) {
    let user;
    try {
      user = await sendToTab(tab.id, { type: "LOOKUP", username: seed });
    } catch (err) {
      await patch({ lastError: `Seed @${seed}: ${err instanceof Error ? err.message : String(err)}` });
      continue;
    }
    if (user?.error || user?.ok === false) continue;

    let rows = [];
    try {
      const list = await sendToTab(tab.id, { type: "FOLLOWERS", userId: user.igPk, limit: perSeed });
      rows = Array.isArray(list) ? list : [];
    } catch {
      rows = [];
    }

    if (rows.length === 0) {
      await chrome.tabs.update(tab.id, { url: `https://www.instagram.com/${seed}/` });
      await waitComplete(tab.id);
      await sleep(1800);
      try {
        const list = await sendToTab(tab.id, { type: "FOLLOWERS_DOM", limit: perSeed });
        rows = Array.isArray(list) ? list : [];
      } catch {
        rows = [];
      }
    }

    for (const p of rows) {
      const handle = String(p.handle || "").toLowerCase();
      if (!handle || seen.has(handle) || p.isPrivate) continue;
      seen.add(handle);
      profiles.push(p);
    }
    await sleep(900);
  }

  await api("discover", {
    method: "POST",
    body: JSON.stringify({ campaignId: job.campaignId, profiles }),
  });
  await patch({ lastJob: `Found ${profiles.length} followers` });
}

async function doSend(job) {
  const tab = await ensureIgTab();
  const me = await sendToTab(tab.id, { type: "WHOAMI" });
  if (!me?.ok) throw new Error(me?.error || "Sign in to Instagram in Chrome.");

  let igPk = job.igPk;
  let looked = null;
  if (!igPk) {
    looked = await sendToTab(tab.id, { type: "LOOKUP", username: job.handle });
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
    await chrome.tabs.update(tab.id, { url: `https://www.instagram.com/${job.handle}/` });
    await waitComplete(tab.id);
    await sleep(1800);
    result = await sendToTab(tab.id, { type: "SEND_DOM", text: job.message });
    if (result?.ok === false) {
      throw lastErr || new Error(result.error || "Instagram did not send the message");
    }
  }

  await api("sent", {
    method: "POST",
    body: JSON.stringify({
      audienceId: job.audienceId,
      campaignId: job.campaignId,
      ok: true,
      igPk,
    }),
  });
  await patch({ lastJob: `Sent @${job.handle}`, lastError: "" });
}

async function doInbox() {
  const tab = (await igTabs())[0];
  if (!tab?.id) return;
  const replies = await sendToTab(tab.id, { type: "INBOX" });
  if (!Array.isArray(replies) || replies.length === 0) return;
  await api("inbox", { method: "POST", body: JSON.stringify({ replies }) });
}

let ticking = false;
let lastTick = 0;

async function tick() {
  if (ticking) return;
  const s = await state();
  if (!s.enabled) return;
  if (!s.origin || !s.token) return;
  ticking = true;
  lastTick = Date.now();
  try {
    await heartbeat();
    const work = await api("work");
    if (work.kind === "discover") {
      try {
        await doDiscover(work);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        await api("discover", {
          method: "POST",
          body: JSON.stringify({ campaignId: work.campaignId, profiles: [], error: message }),
        });
        throw err;
      }
    } else if (work.kind === "send") {
      try {
        await doSend(work);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        await api("sent", {
          method: "POST",
          body: JSON.stringify({
            audienceId: work.audienceId,
            campaignId: work.campaignId,
            ok: false,
            error: message,
          }),
        });
        throw err;
      }
    } else if (work.kind === "wait") {
      await patch({ lastJob: "SafeSend waiting for the next gap" });
    } else {
      await patch({ lastJob: "Idle — waiting for a campaign" });
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
  } finally {
    ticking = false;
  }
}

function maybeTick() {
  if (Date.now() - lastTick < 8000) return;
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
