function readPair() {
  const cfg = window.__NITEFILL_SENDER__;
  if (cfg && cfg.token && cfg.origin) {
    return { origin: String(cfg.origin), token: String(cfg.token) };
  }
  const el = document.getElementById("nitefill-sender-pair");
  if (el) {
    try {
      const parsed = JSON.parse(el.textContent || "{}");
      if (parsed.token && parsed.origin) return parsed;
    } catch {
      /* ignore */
    }
  }
  return null;
}

function publish(detail) {
  try {
    window.dispatchEvent(new CustomEvent("nitefill-ext", { detail }));
  } catch {
    /* ignore */
  }
}

function askState() {
  try {
    chrome.runtime.sendMessage({ type: "GET_STATE" }, (s) => {
      if (!s) return;
      publish({
        kind: "state",
        paired: Boolean(s.origin && s.token),
        origin: s.origin,
        token: s.token,
        igHandle: s.igHandle,
        lastJob: s.lastJob,
        lastError: s.lastError,
      });
    });
  } catch {
    /* extension reloading */
  }
}

function pairNow() {
  const pair = readPair();
  if (!pair) return;
  try {
    chrome.runtime.sendMessage({ type: "PAIR", origin: pair.origin, token: pair.token }, () => {
      askState();
    });
  } catch {
    /* extension reloading */
  }
}

function enqueue(job) {
  if (!job || !job.kind) return;
  try {
    chrome.runtime.sendMessage({ type: "ENQUEUE", job }, () => askState());
  } catch {
    /* ignore */
  }
}

pairNow();
askState();
setInterval(pairNow, 2000);
setInterval(askState, 3000);
window.addEventListener("nitefill-sender-pair", pairNow);
window.addEventListener("nitefill-enqueue", (event) => {
  enqueue(event.detail);
});

try {
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === "DASH_EVENT" && msg.payload) {
      publish(msg.payload);
      if (msg.payload.kind === "state" || msg.payload.paired != null) return;
      askState();
    }
  });
} catch {
  /* not in extension context */
}
