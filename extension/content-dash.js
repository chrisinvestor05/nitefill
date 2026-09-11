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

function push() {
  const pair = readPair();
  if (!pair) return;
  try {
    chrome.runtime.sendMessage({ type: "PAIR", origin: pair.origin, token: pair.token });
  } catch {
    /* extension reloading */
  }
}

push();
setInterval(push, 2500);
window.addEventListener("nitefill-sender-pair", push);
