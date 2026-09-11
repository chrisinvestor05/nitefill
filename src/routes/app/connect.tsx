import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getProfile, updateProfile } from "@/lib/server/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/app/connect")({
  component: ConnectPage,
  head: () => ({ meta: [{ title: "Connect Instagram – Nitefill" }] }),
});

function ConnectPage() {
  const [handle, setHandle] = useState("");
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void getProfile().then((p) => {
      setHandle(p?.instagramHandle ?? "");
      setConnected(Boolean(p?.instagramConnected));
      setLoaded(true);
    });
  }, []);

  async function connect(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    await updateProfile({
      data: {
        instagramHandle: handle.replace(/^@+/, ""),
        instagramConnected: true,
      },
    });
    setConnected(true);
    setBusy(false);
  }

  async function disconnect() {
    setBusy(true);
    await updateProfile({ data: { instagramConnected: false } });
    setConnected(false);
    setBusy(false);
  }

  if (!loaded) return <p className="text-muted">Loading…</p>;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-3xl">Instagram</h1>
        <p className="mt-2 text-sm text-muted">
          Nitefill never asks for your password. In production, Nitefill Sender
          (Chrome) sees which account you're signed into and types the messages
          your campaign writes. Here you can attach the handle the dashboard
          should send as.
        </p>
      </div>
      {connected ? (
        <div className="rounded-2xl border border-fg/8 bg-surface p-6">
          <Badge tone="success">Connected</Badge>
          <p className="mt-3 text-lg text-fg">@{handle}</p>
          <p className="mt-2 text-sm text-muted">
            Campaigns will send as this account, one at a time, while SafeSend is running.
          </p>
          <Button className="mt-6" variant="ghost" onClick={disconnect} disabled={busy}>
            Disconnect
          </Button>
        </div>
      ) : (
        <form onSubmit={connect} className="space-y-4 rounded-2xl border border-fg/8 bg-surface p-6">
          <label className="block text-sm text-muted">
            Instagram handle
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-subtle">@</span>
              <Input
                className="pl-8"
                required
                value={handle}
                onChange={(e) => setHandle(e.target.value.replace(/^@+/, ""))}
                placeholder="yourhandle"
              />
            </div>
          </label>
          <Button type="submit" disabled={busy}>
            {busy ? "Connecting…" : "Connect handle"}
          </Button>
        </form>
      )}
      <p className="text-sm text-subtle">
        Need the browser extension? See the{" "}
        <Link to="/extension" className="text-teal hover:underline">
          setup guide
        </Link>
        .
      </p>
    </div>
  );
}
