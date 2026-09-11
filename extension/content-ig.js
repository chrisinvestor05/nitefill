const IG_APP_ID = "936619743392459";
let wwwClaim = "0";

function cookie(name) {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : "";
}

function csrf() {
  return cookie("csrftoken") || "";
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function captureClaim(res) {
  const claim = res.headers.get("x-ig-set-www-claim") || res.headers.get("X-IG-Set-WWW-Claim");
  if (claim && claim !== "0") wwwClaim = claim;
}

async function igFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `https://www.instagram.com${path}`;
  const { timeout = 5000, headers: extraHeaders, ...rest } = options;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  const headers = {
    "X-CSRFToken": csrf(),
    "X-IG-App-ID": IG_APP_ID,
    "X-Requested-With": "XMLHttpRequest",
    "X-ASBD-ID": "129477",
    "X-IG-WWW-Claim": wwwClaim || "0",
    Accept: "*/*",
    Referer: location.href,
    ...(extraHeaders || {}),
  };
  try {
    const res = await fetch(url, {
      credentials: "include",
      ...rest,
      headers,
      signal: ctrl.signal,
    });
    captureClaim(res);
    const text = await res.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = { raw: text.slice(0, 400) };
    }
    if (!res.ok) {
      const msg = json?.message || json?.error || json?.spam || `Instagram ${res.status}`;
      throw new Error(typeof msg === "string" ? msg : `Instagram ${res.status}`);
    }
    return json;
  } catch (err) {
    if (err && err.name === "AbortError") throw new Error("Instagram timed out");
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function whoami() {
  try {
    const data = await igFetch("/api/v1/accounts/current_user/?edit=true");
    const user = data.user || data;
    if (user && (user.username || user.pk)) {
      return {
        ok: true,
        handle: String(user.username || ""),
        igPk: String(user.pk || user.id || cookie("ds_user_id") || ""),
      };
    }
  } catch {
    /* fall through */
  }
  const pk = cookie("ds_user_id");
  if (!pk) return { ok: false, error: "Not signed in to Instagram in this tab." };
  try {
    const data = await igFetch(`/api/v1/users/${pk}/info/`);
    const user = data.user || {};
    return { ok: true, handle: String(user.username || ""), igPk: String(user.pk || pk) };
  } catch {
    return { ok: true, handle: "", igPk: pk };
  }
}

async function lookup(username) {
  const handle = String(username || "")
    .replace(/^@+/, "")
    .trim();
  if (!handle) throw new Error("Missing username");
  const data = await igFetch(`/api/v1/users/web_profile_info/?username=${encodeURIComponent(handle)}`);
  const user = data?.data?.user || data?.user;
  if (!user) throw new Error(`Instagram user @${handle} not found`);
  const posts = user.edge_owner_to_timeline_media?.edges || [];
  const caption = posts[0]?.node?.edge_media_to_caption?.edges?.[0]?.node?.text || "";
  return {
    handle: String(user.username),
    displayName: String(user.full_name || user.username),
    bio: String(user.biography || ""),
    igPk: String(user.pk || user.id),
    isPrivate: Boolean(user.is_private),
    followerCount: Number(user.follower_count || user.edge_followed_by?.count || 0),
    recentPost: String(caption || user.biography || ""),
  };
}

async function followersApi(userId, limit = 18) {
  const out = [];
  const qs = new URLSearchParams({
    count: String(Math.min(50, limit)),
    search_surface: "follow_list_page",
  });
  const data = await igFetch(`/api/v1/friendships/${userId}/followers/?${qs.toString()}`, {
    timeout: 4000,
  });
  const users = data.users || data.items || [];
  for (const u of users) {
    out.push({
      handle: String(u.username || ""),
      displayName: String(u.full_name || u.username || ""),
      bio: String(u.biography || ""),
      igPk: String(u.pk || u.id || ""),
      isPrivate: Boolean(u.is_private),
      recentPost: "",
    });
    if (out.length >= limit) break;
  }
  return out;
}

function skipHandle(handle) {
  return (
    !handle ||
    [
      "followers",
      "following",
      "p",
      "reel",
      "reels",
      "stories",
      "direct",
      "accounts",
      "explore",
      "tv",
      "about",
      "legal",
      "privacy",
    ].includes(handle)
  );
}

async function followersDom(limit = 18) {
  const link =
    document.querySelector('a[href$="/followers/"]') ||
    [...document.querySelectorAll("a")].find((a) => /followers/i.test(a.getAttribute("href") || ""));
  if (!link) throw new Error("Could not open the followers list on this profile.");
  link.click();
  await sleep(700);

  const deadline = Date.now() + 4000;
  let dialog = null;
  while (Date.now() < deadline && !dialog) {
    dialog = document.querySelector('div[role="dialog"]');
    if (!dialog) await sleep(120);
  }
  if (!dialog) throw new Error("Instagram did not open the followers dialog.");

  const seen = new Set();
  const out = [];
  let stagnant = 0;
  while (out.length < limit && stagnant < 3) {
    const before = out.length;
    for (const a of dialog.querySelectorAll('a[href^="/"]')) {
      const href = a.getAttribute("href") || "";
      const m = href.match(/^\/([A-Za-z0-9._]+)\/?$/);
      if (!m) continue;
      const handle = m[1].toLowerCase();
      if (skipHandle(handle) || seen.has(handle)) continue;
      seen.add(handle);
      const row = a.closest("div") || a;
      const lines = (row.innerText || "").split("\n").map((s) => s.trim()).filter(Boolean);
      const displayName = lines.find((l) => l.toLowerCase() !== handle) || handle;
      out.push({
        handle,
        displayName,
        bio: "",
        igPk: "",
        isPrivate: false,
        recentPost: "",
      });
      if (out.length >= limit) break;
    }
    if (out.length >= 8) break;
    const scroller =
      [...dialog.querySelectorAll("div")].find((el) => el.scrollHeight - el.clientHeight > 80) || dialog;
    scroller.scrollTop = scroller.scrollHeight;
    await sleep(280);
    if (out.length === before) stagnant += 1;
    else stagnant = 0;
  }
  return out;
}

async function sendApi(userId, text) {
  const ctx = crypto.randomUUID();
  const token = csrf();
  const common = {
    action: "send_item",
    client_context: ctx,
    mutation_token: ctx,
    text: String(text),
    send_attribution: "message_button",
    _csrftoken: token,
    _uuid: ctx,
  };

  try {
    const body = new URLSearchParams({
      ...common,
      recipient_users: JSON.stringify([[String(userId)]]),
    });
    const json = await igFetch("/api/v1/direct_v2/threads/broadcast/text/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (json && json.status && json.status !== "ok") {
      throw new Error(json.message || "Instagram did not accept the DM");
    }
    return { ok: true, via: "api" };
  } catch {
    const created = await igFetch("/api/v1/direct_v2/create_group_thread/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        recipient_users: JSON.stringify([String(userId)]),
        _csrftoken: token,
      }),
    });
    const threadId = created?.thread_id || created?.thread?.thread_id;
    if (!threadId) throw new Error("Could not open an Instagram thread");
    const body = new URLSearchParams({
      ...common,
      thread_ids: JSON.stringify([String(threadId)]),
    });
    const json = await igFetch("/api/v1/direct_v2/threads/broadcast/text/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (json && json.status && json.status !== "ok") {
      throw new Error(json.message || "Instagram did not accept the DM");
    }
    return { ok: true, via: "api-thread" };
  }
}

function visible(el) {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
}

function findByText(selector, text) {
  const needle = text.toLowerCase();
  return [...document.querySelectorAll(selector)].find((el) => {
    const t = (el.innerText || el.getAttribute("aria-label") || "").trim().toLowerCase();
    return t === needle || t.includes(needle);
  });
}

function findComposer() {
  return (
    document.querySelector('div[role="textbox"][contenteditable="true"]') ||
    document.querySelector('[aria-label="Message"][contenteditable="true"]') ||
    document.querySelector('textarea[placeholder*="Message"]') ||
    document.querySelector('p[aria-label="Message"]') ||
    document.querySelector('[contenteditable="true"][aria-label*="essage"]')
  );
}

async function typeInto(box, text) {
  box.focus();
  await sleep(80);
  if (box.tagName === "TEXTAREA" || box.tagName === "INPUT") {
    const proto = Object.getOwnPropertyDescriptor(
      box.tagName === "INPUT" ? HTMLInputElement.prototype : HTMLTextAreaElement.prototype,
      "value",
    );
    proto?.set?.call(box, text);
    box.dispatchEvent(new Event("input", { bubbles: true }));
    return;
  }
  document.execCommand("selectAll", false);
  document.execCommand("delete", false);
  const words = String(text).split(/(\s+)/);
  for (const word of words) {
    document.execCommand("insertText", false, word);
    box.dispatchEvent(new InputEvent("input", { bubbles: true, data: word }));
    await sleep(18 + Math.floor(Math.random() * 35));
  }
}

async function sendDom(text) {
  let messageBtn =
    findByText('div[role="button"]', "message") ||
    findByText("button", "message") ||
    document.querySelector('svg[aria-label="New message"]')?.closest("div[role='button'], a, button") ||
    document.querySelector('a[href*="/direct/t/"]') ||
    document.querySelector('svg[aria-label="Direct"]')?.closest("div[role='button'], a, button");

  if (messageBtn) {
    messageBtn.click();
    await sleep(1400);
  }

  const deadline = Date.now() + 14000;
  let box = null;
  while (Date.now() < deadline && !box) {
    box = findComposer();
    if (!box || !visible(box)) {
      box = null;
      await sleep(250);
    }
  }
  if (!box) throw new Error("Could not find Instagram's message box. Open Direct and try again.");

  await typeInto(box, text);
  await sleep(350);

  const sendBtn =
    document.querySelector('div[role="button"][aria-label="Send"]') ||
    findByText('div[role="button"]', "send") ||
    findByText("button", "send");
  if (sendBtn) sendBtn.click();
  else {
    box.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", code: "Enter", keyCode: 13, bubbles: true }),
    );
  }
  await sleep(900);
  return { ok: true, via: "dom" };
}

async function readInbox() {
  const data = await igFetch("/api/v1/direct_v2/inbox/?persistentBadging=true&folder=inbox");
  const me = cookie("ds_user_id");
  const threads = data?.inbox?.threads || [];
  const replies = [];
  for (const t of threads) {
    const users = t.users || [];
    const last = (t.items || [])[0];
    if (!last) continue;
    const fromThem = me && String(last.user_id) !== String(me);
    if (!fromThem) continue;
    const handle = String(users[0]?.username || "").toLowerCase();
    if (!handle) continue;
    replies.push({
      handle,
      text: String(last.text || last.item_type || ""),
      at: last.timestamp ? String(last.timestamp) : "",
    });
  }
  return replies;
}

function pingBackground() {
  try {
    chrome.runtime.sendMessage({ type: "KEEPALIVE" });
  } catch {
    /* extension reloading */
  }
}

pingBackground();
setInterval(pingBackground, 10000);

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    if (msg?.type === "PING") return { ok: true };
    if (msg?.type === "WHOAMI") return whoami();
    if (msg?.type === "LOOKUP") return lookup(msg.username);
    if (msg?.type === "FOLLOWERS") return followersApi(msg.userId, msg.limit || 50);
    if (msg?.type === "FOLLOWERS_DOM") return followersDom(msg.limit || 50);
    if (msg?.type === "SEND_API") return sendApi(msg.userId, msg.text);
    if (msg?.type === "SEND_DOM") return sendDom(msg.text);
    if (msg?.type === "INBOX") return readInbox();
    throw new Error(`Unknown message ${msg?.type}`);
  })()
    .then(sendResponse)
    .catch((err) => sendResponse({ ok: false, error: err instanceof Error ? err.message : String(err) }));
  return true;
});
