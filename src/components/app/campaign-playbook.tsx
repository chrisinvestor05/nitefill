import { Link } from "@tanstack/react-router";

const STEPS = [
  {
    n: "01",
    t: "Name the night",
    d: "City, date, one short invite. Or tap Sample rooftop night and skip the form.",
  },
  {
    n: "02",
    t: "Find the room",
    d: "We match people by city, genre and bio — not a bought list. Preview any invite before it goes.",
  },
  {
    n: "03",
    t: "Launch SafeSend",
    d: "The first five go out immediately. The rest drip over a couple of minutes so it doesn't look like a blast.",
  },
] as const;

export function CampaignPlaybook({ compact = false }: { compact?: boolean }) {
  return (
    <section className={compact ? "space-y-3" : "space-y-4"}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs tracking-wide text-teal uppercase">How to run it</p>
          {!compact && (
            <h2 className="mt-1 text-xl">Three steps. Then watch Sent climb.</h2>
          )}
        </div>
        <Link to="/app/campaigns/new" className="text-sm text-teal hover:underline">
          New campaign
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
