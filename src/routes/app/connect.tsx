import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getSenderStatus, queueTestSend, type SenderStatus } from "@/lib/server/sender";
import { enqueueSenderJob, pairingCode, useExtensionLive } from "@/components/app/sender-live";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/app/connect")({
  component: ConnectPage,
  head: () => ({ meta: [{ title: "Connect Instagram – Nitefill" }] }),
});

function ConnectPage() {
  const live = useExtensionLive();
  const [status, setStatus] = useState<SenderStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [handle, setHandle] = useState("");
  const [testNote, setTestNote] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function load() {
    try {
      setStatus(await getSenderStatus());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load sender status.");
    }
  }

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 8000);
    return () => clearInterval(t);
  }, []);

  const paired = live.paired || Boolean(status?.online);
  const online = Boolean(live.igHandle) || Boolean(status?.online && status?.instagramHandle);
  const who = live.igHandle || status?.instagramHandle || "";

  async function copyPair() {
    const code = pairingCode();
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  async function onTest(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setTestNote(null);
    try {
      const res = await queueTestSend({ data: { handle } });
      if (res.job) enqueueSenderJob(res.job);
      setTestNote(
        live.paired
          ? `Sending to @${res.handle} now. Watch the Instagram tab.`
          : res.message,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not queue the DM.");
    } finally {
      setBusy(false);
    }
  }

  if (!status && !error) {
    return <p className="text-muted">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-3xl">Instagram</h1>
        <p className="mt-2 text-sm text-muted">
          Nitefill never asks for your password. Sender uses the Instagram account
          already signed in on this Chrome.
        </p>
      </div>

      {live.inFrame && (
        <aside className="rounded-2xl border border-orange/30 bg-orange/8 p-5">
          <p className="font-medium text-fg">Open this in a real Chrome tab</p>
          <p className="mt-1 text-sm text-muted">
            Pairing inside a preview frame is unreliable. Open{" "}
            <a className="text-teal hover:underline" href="https://nitefill.vercel.app/app/connect" target="_blank" rel="noreferrer">
              nitefill.vercel.app/app/connect
            </a>{" "}
            in Chrome, then load the extension.
          </p>
        </aside>
      )}

      <div className="rounded-2xl border border-fg/8 bg-surface p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-subtle">Sender</p>
          <Badge tone={online ? "success" : paired ? "teal" : "muted"}>
            {online ? "online" : paired ? "paired" : live.installed === false ? "not found" : "waiting"}
          </Badge>
        </div>
        {online && who ? (
          <p className="mt-3 text-lg text-fg">Sending as @{who}</p>
        ) : paired ? (
          <p className="mt-3 text-sm text-muted">Paired. Open instagram.com in this Chrome and sign in.</p>
        ) : live.installed === false ? (
          <p className="mt-3 text-sm text-muted">
            Chrome does not see Nitefill Sender yet. Download it, Load unpacked, then refresh this page.
          </p>
        ) : (
          <p className="mt-3 text-sm text-muted">Waiting for the extension on this page…</p>
        )}
        {live.lastJob ? <p className="mt-2 text-xs text-teal">{live.lastJob}</p> : null}
        {live.lastError ? <p className="mt-2 text-xs text-danger">{live.lastError}</p> : null}
      </div>

      <ol className="space-y-4">
        <li className="rounded-2xl border border-fg/8 bg-surface p-5">
          <p className="text-xs text-orange">01</p>
          <h2 className="mt-1 text-lg">Download Nitefill Sender 1.3</h2>
          <p className="mt-2 text-sm text-muted">
            If you already installed an older copy, remove it first. Unzip, then
            chrome://extensions → Developer mode → Load unpacked.
          </p>
          <a href="/nitefill-sender.zip" download className="mt-4 inline-block">
            <Button>Download for Chrome</Button>
          </a>
        </li>
        <li className="rounded-2xl border border-fg/8 bg-surface p-5">
          <p className="text-xs text-orange">02</p>
          <h2 className="mt-1 text-lg">Sign in to Instagram in Chrome</h2>
          <p className="mt-2 text-sm text-muted">
            Leave that tab open. Sender reads the crowd around your seeds and sends from it.
          </p>
        </li>
        <li className="rounded-2xl border border-fg/8 bg-surface p-5">
          <p className="text-xs text-orange">03</p>
          <h2 className="mt-1 text-lg">Pair</h2>
          <p className="mt-2 text-sm text-muted">
            This page pairs automatically. If it does not, copy the code and paste
            it in the extension popup under “Pair manually”.
          </p>
          <Button variant="ghost" className="mt-3" type="button" onClick={copyPair}>
            {copied ? "Copied" : "Copy pairing code"}
          </Button>
        </li>
      </ol>

      <form onSubmit={onTest} className="rounded-2xl border border-teal/25 bg-teal/5 p-5 space-y-3">
        <h2 className="text-lg">Send a real DM now</h2>
        <p className="text-sm text-muted">
          Any public username you are allowed to message. Goes out from YOUR account.
        </p>
        <label className="block text-sm text-muted">
          Instagram username
          <Input
            className="mt-1.5"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="someone.you.know"
            required
          />
        </label>
        <Button type="submit" disabled={busy || !handle.trim()}>
          {busy ? "Sending…" : "Send now"}
        </Button>
        {testNote && <p className="text-sm text-teal">{testNote}</p>}
      </form>

      {error && <p className="text-sm text-danger">{error}</p>}

      <p className="text-xs text-subtle">
        More detail in the{" "}
        <Link to="/extension" className="text-teal hover:underline">
          setup guide
        </Link>
        .
      </p>
    </div>
  );
}
