import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/site-shell";

export const Route = createFileRoute("/guide")({
  head: () => ({ meta: [{ title: "Guide – Nitefill" }] }),
  component: GuidePage,
});

function GuidePage() {
  const steps = [
    {
      t: "Connect through Chrome",
      d: "Install Nitefill Sender, then sign in to Instagram in that same Chrome. Sends from your account. No password handed over.",
    },
    {
      t: "Pick seed accounts",
      d: "Public accounts whose followers look like your night. Pull more profiles than messages you'll send, but never more than the seed account's following.",
    },
    {
      t: "Write one short personal invite",
      d: "A message without a link converts far better. Mention something real. Ask a question.",
    },
    {
      t: "Set the daily limit",
      d: "Default 35. SafeSend spreads them with uneven gaps. Established accounts can work up to 50–150 a day.",
    },
    {
      t: "Reply in Instagram",
      d: "Nitefill does not answer for you. The dashboard shows which hook started the conversation.",
    },
  ];
  return (
    <SiteShell>
      <main className="mx-auto max-w-3xl px-4 pt-28 pb-20 sm:px-6 sm:pt-32">
        <h1>Fill every floor</h1>
        <p className="mt-4 text-muted">
          No posting and praying. You pick the right audience, write one short
          personal message, and Nitefill sends it to real people who would
          actually turn up — one at a time, from your own account.
        </p>
        <ol className="mt-10 space-y-5">
          {steps.map((s, i) => (
            <li key={s.t} className="rounded-2xl border border-fg/8 bg-surface p-5">
              <p className="text-xs text-orange">{String(i + 1).padStart(2, "0")}</p>
              <h2 className="mt-1 text-lg">{s.t}</h2>
              <p className="mt-2 text-sm text-muted">{s.d}</p>
            </li>
          ))}
        </ol>
      </main>
    </SiteShell>
  );
}
