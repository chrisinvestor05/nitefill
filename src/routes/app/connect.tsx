import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getSenderStatus, queueTestSend, rotateExtensionToken, type SenderStatus } from "@/lib/server/sender";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/app/connect")({
  component: ConnectPage,
  head: () => ({ meta: [{ title: "Connect Instagram – Nitefill" }] }),
});

function ConnectPage() {
  const [status, setStatus] = useState<SenderStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [handle, setHandle] = useState("");
  const [testNote, setTestNote] = useState<string | null>(null);

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
    const t = setInterval(() => void load(), 4000);
    return () => clearInterval(t);
  }, []);

  async function rotate() {
    setBusy(true);
    await rotateExtensionToken();
    await load();
    setBusy(false);
  }

  async function onTest(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setTestNote(null);
    try {
      const res = await queueTestSend({ data: { handle } });
      setTestNote(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not queue the DM.");
    } finally {
      setBusy(false);
    }
  }

  if (!status) {
    return (
      <div className="space-y-3">
        <p className="text-muted">{error ? error : "Loading…"}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-3xl">Instagram</h1>
        <p className="mt-2 text-sm text-muted">
          Nitefill never asks for your password. Nitefill Sender sits in Chrome,
          uses the Instagram account you are already signed into, and sends the
          invite from that tab — the same way getkrowded does.
        </p>
      </div>

      <div className="rounded-2xl border border-fg/8 bg-surface p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-subtle">Sender</p>
          <Badge tone={status.online ? "success" : "muted"}>
            {status.online ? "online" : "offline"}
          </Badge>
        </div>
        {status.online && status.instagramHandle ? (
          <p className="mt-3 text-lg text-fg">Sending as @{status.instagramHandle}</p>
        ) : (
          <p className="mt-3 text-sm text-muted">
            Install the extension, then keep instagram.com open in this Chrome.
          </p>
        )}
      </div>

      <ol className="space-y-4">
        <li className="rounded-2xl border border-fg/8 bg-surface p-5">
          <p className="text-xs text-orange">01</p>
          <h2 className="mt-1 text-lg">Download Nitefill Sender</h2>
          <p className="mt-2 text-sm text-muted">
            Unzip it. In Chrome open chrome://extensions, turn on Developer mode,
            click Load unpacked, and choose the unzipped folder.
          </p>
          <a href="/nitefill-sender.zip" download className="mt-4 inline-block">
            <Button>Download for Chrome</Button>
          </a>
        </li>
        <li className="rounded-2xl border border-fg/8 bg-surface p-5">
          <p className="text-xs text-orange">02</p>
          <h2 className="mt-1 text-lg">Sign in to Instagram in Chrome</h2>
          <p className="mt-2 text-sm text-muted">
            The real Instagram website, same Chrome as the extension. Leave that
            tab open while a campaign runs. You will see the profile open and the
            message leave.
          </p>
        </li>
        <li className="rounded-2xl border border-fg/8 bg-surface p-5">
          <p className="text-xs text-orange">03</p>
          <h2 className="mt-1 text-lg">Come back here</h2>
          <p className="mt-2 text-sm text-muted">
            This page pairs automatically. When the badge says online, you are
            sending as the Instagram account in that tab.
          </p>
        </li>
      </ol>

      <form onSubmit={onTest} className="rounded-2xl border border-teal/25 bg-teal/5 p-5 space-y-3">
        <h2 className="text-lg">Send a real DM now</h2>
        <p className="text-sm text-muted">
          Pick any public Instagram username you are allowed to message. Sender
          will send it from YOUR logged-in account — not a mock.
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
          {busy ? "Queuing…" : "Queue real DM"}
        </Button>
        {testNote && <p className="text-sm text-teal">{testNote}</p>}
      </form>

      {error && <p className="text-sm text-danger">{error}</p>}

      <p className="text-xs text-subtle">
        Pairing token ends with {status.tokenHint ? `…${status.tokenHint}` : "—"}.{" "}
        <button type="button" className="text-teal hover:underline" onClick={rotate} disabled={busy}>
          Rotate token
        </button>
        . More detail in the{" "}
        <Link to="/extension" className="text-teal hover:underline">
          setup guide
        </Link>
        .
      </p>
    </div>
  );
}
