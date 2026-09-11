import { useEffect } from "react";
import { ensureExtensionToken } from "@/lib/server/sender";

/** Publishes the pairing payload so Nitefill Sender (Chrome) can attach itself. */
export function SenderBridge() {
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      for (let i = 0; i < 6 && !cancelled; i += 1) {
        try {
          const res = await ensureExtensionToken();
          if (cancelled || !res?.token) throw new Error("no token");
          const payload = { v: 1, origin: window.location.origin, token: res.token };
          window.__NITEFILL_SENDER__ = payload;
          let el = document.getElementById("nitefill-sender-pair") as HTMLScriptElement | null;
          if (!el) {
            el = document.createElement("script");
            el.id = "nitefill-sender-pair";
            el.type = "application/json";
            document.documentElement.appendChild(el);
          }
          el.textContent = JSON.stringify(payload);
          window.dispatchEvent(new Event("nitefill-sender-pair"));
          return;
        } catch {
          await new Promise((r) => setTimeout(r, 400));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}

declare global {
  interface Window {
    __NITEFILL_SENDER__?: { v: number; origin: string; token: string };
  }
}
