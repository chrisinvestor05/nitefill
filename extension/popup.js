const ig = document.getElementById("ig");
const job = document.getElementById("job");
const err = document.getElementById("err");
const badge = document.getElementById("badge");
const enabled = document.getElementById("enabled");

function paint(s) {
  const paired = Boolean(s.origin && s.token);
  badge.textContent = paired ? "Paired" : "Not paired";
  badge.classList.toggle("off", !paired);
  ig.textContent = s.igHandle ? `Instagram @${s.igHandle}` : "Open instagram.com in this Chrome and sign in.";
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

void refresh();
setInterval(refresh, 2000);
