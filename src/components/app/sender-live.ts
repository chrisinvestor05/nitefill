import { useEffect, useState } from "react";

export type ExtLive = {
  installed: boolean | null;
  paired: boolean;
  igHandle: string;
  lastJob: string;
  lastError: string;
  inFrame: boolean;
};

const EMPTY: ExtLive = {
  installed: null,
  paired: false,
  igHandle: "",
  lastJob: "",
  lastError: "",
  inFrame: false,
};

export function useExtensionLive(): ExtLive {
  const [live, setLive] = useState<ExtLive>({
    ...EMPTY,
    inFrame: typeof window !== "undefined" && window.self !== window.top,
  });

  useEffect(() => {
    const fail = window.setTimeout(() => {
      setLive((cur) => (cur.installed == null ? { ...cur, installed: false } : cur));
    }, 4000);

    function onEvt(event: Event) {
      const d = (event as CustomEvent).detail || {};
      setLive({
        installed: true,
        paired: Boolean(d.paired ?? (d.origin && d.token)),
        igHandle: String(d.igHandle || ""),
        lastJob: String(d.lastJob || d.message || ""),
        lastError: String(d.lastError || ""),
        inFrame: window.self !== window.top,
      });
    }

    window.addEventListener("nitefill-ext", onEvt);
    return () => {
      window.clearTimeout(fail);
      window.removeEventListener("nitefill-ext", onEvt);
    };
  }, []);

  return live;
}

export function enqueueSenderJob(job: Record<string, unknown>) {
  window.dispatchEvent(new CustomEvent("nitefill-enqueue", { detail: job }));
}

export function pairingCode(): string {
  const p = window.__NITEFILL_SENDER__;
  if (!p?.origin || !p?.token) return "";
  return `${p.origin}#${p.token}`;
}
