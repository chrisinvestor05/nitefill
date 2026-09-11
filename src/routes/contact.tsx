import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { submitContact } from "@/lib/server/contact";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact – Nitefill" }] }),
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("general");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await submitContact({ data: { name, email, topic, message } });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send that.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteShell>
      <main className="px-4 pt-28 pb-20 sm:px-6 sm:pt-32">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-teal">Contact</p>
            <h1 className="mt-2">Talk to the team</h1>
            <p className="mt-4 text-muted">
              Questions about a campaign, The Room, or a partnership. We read
              every message. You can also email{" "}
              <a className="text-teal hover:underline" href="mailto:hello@nitefill.com">
                hello@nitefill.com
              </a>
              .
            </p>
          </div>
          <div className="rounded-2xl border border-fg/10 bg-surface p-6 sm:p-8">
            {done ? (
              <p className="text-muted">
                Sent. We'll get back to {email} as soon as we can.
              </p>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <label className="block text-sm text-muted">
                  Name
                  <Input className="mt-1.5" required value={name} onChange={(e) => setName(e.target.value)} />
                </label>
                <label className="block text-sm text-muted">
                  Email
                  <Input className="mt-1.5" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>
                <label className="block text-sm text-muted">
                  Topic
                  <select
                    className="mt-1.5 h-11 w-full rounded-xl border border-fg/12 bg-surface px-4 text-sm text-fg"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  >
                    <option value="general">General</option>
                    <option value="billing">Billing</option>
                    <option value="pro">Nitefill Pro</option>
                    <option value="room">The Room</option>
                    <option value="agency">Agency</option>
                  </select>
                </label>
                <label className="block text-sm text-muted">
                  Message
                  <Textarea className="mt-1.5" required minLength={10} value={message} onChange={(e) => setMessage(e.target.value)} />
                </label>
                {error && <p className="text-sm text-danger">{error}</p>}
                <Button type="submit" disabled={busy} className="w-full">
                  {busy ? "Sending…" : "Send message"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
