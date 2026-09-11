import { Link } from "@tanstack/react-router";

const STEPS = [
  {
    n: "01",
    t: "Install Nitefill Sender",
    d: "Load the Chrome extension, then sign in to Instagram in that same Chrome. We never ask for your password.",
  },
  {
    n: "02",
    t: "Pick seed accounts",
    d: "Public pages whose followers look like your night. Sender pulls those real followers into your campaign.",
  },
  {
    n: "03",
    t: "Launch SafeSend",
    d: "Keep the Instagram tab open. Invites go out one at a time, from your account, with human gaps.",
  },
] as const;

export function CampaignPlaybook({ compact = false }: { compact?: boolean }) {
  return (
    <section className={compact ? "space-y-3" : "space-y-4"}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs tracking-wide text-teal uppercase">How it actually sends</p>
          {!compact && (
            <h2 className="mt-1 text-xl">Your Instagram. Your Chrome. Real DMs.</h2>
          )}
        </div>
        <Link to="/app/connect" className="text-sm text-teal hover:underline">
          Connect Instagram
        </Link>
      </div>
      <ol className="grid gap-3 md:grid-cols-3">
        {STEPS.map((s) => (
          <li key={s.n} className="rounded-2xl border border-fg/8 bg-surface p-4">
            <p className="text-xs text-orange">{s.n}</p>
            <p className="mt-1 font-medium text-fg">{s.t}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.d}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
