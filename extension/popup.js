const ig = document.getElementById("ig");
const job = document.getElementById("job");
const err = document.getElementById("err");
const badge = document.getElementById("badge");
const enabled = document.getElementById("enabled");

function paint(s) {
  const paired = Boolean(s.origin && s.token);
  badge.textContent = paired ? "Paired" : "Not paired";
  badge.classList.toggle("off", !paired);
  ig.textContent = s.igHandle
    ? `Instagram @${s.igHandle}`
    : "Open instagram.com in this Chrome and sign in.";
  job.textContent = s.lastJob || "";
  err.textContent = s.lastError || "";
  enabled.checked = s.enabled !== false;
}

async function refresh() {
  const s = await chrome.runtime.sendMessage({ type: "GET_STATE" });
  paint(s || {});
}

enabled.addEventListener("change", async () => {
  const s = await chrome.runtime.sendMessage({ type: "SET_ENABLED", enabled: enabled.checked });
  paint(s || {});
});

document.getElementById("tick").addEventListener("click", async () => {
  err.textContent = "Working…";
  const s = await chrome.runtime.sendMessage({ type: "TICK" });
  paint(s || {});
});

document.getElementById("pairbtn").addEventListener("click", async () => {
  const raw = document.getElementById("pair").value.trim();
  if (!raw) return;
  let origin = "";
  let token = "";
  try {
    if (raw.startsWith("{")) {
      const parsed = JSON.parse(raw);
      origin = parsed.origin;
      token = parsed.token;
    } else if (raw.includes("#")) {
      const i = raw.indexOf("#");
      origin = raw.slice(0, i);
      token = raw.slice(i + 1);
    } else if (raw.includes("|")) {
      const parts = raw.split("|");
      origin = parts[0];
      token = parts.slice(1).join("|");
    }
  } catch {
    err.textContent = "Could not read that pairing code.";
    return;
  }
  if (!origin || !token) {
    err.textContent = "Pairing code should look like https://nitefill.vercel.app#nf1…";
    return;
  }
  const s = await chrome.runtime.sendMessage({ type: "PAIR", origin, token });
  paint(s && s.origin ? s : { origin, token, lastJob: "Paired", lastError: "" });
  err.textContent = "";
});

void refresh();
setInterval(refresh, 1500);
