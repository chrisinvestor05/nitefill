import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { listCampaigns, listOutreach, processSends, type Campaign, type OutreachRow } from "@/lib/server/campaigns";

export const Route = createFileRoute("/app/analytics")({
  component: AnalyticsPage,
  head: () => ({ meta: [{ title: "Analytics – Nitefill" }] }),
});

function AnalyticsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [logs, setLogs] = useState<OutreachRow[]>([]);

  useEffect(() => {
    void processSends({ data: {} }).then(() =>
      Promise.all([listCampaigns(), listOutreach({ data: {} })]).then(([c, o]) => {
        setCampaigns(c);
        setLogs(o);
      }),
    );
  }, []);

  const totals = useMemo(() => {
    const sent = logs.length;
    const replied = logs.filter((l) => l.replied).length;
    return {
      sent,
      replied,
      rate: sent ? Math.round((replied / sent) * 100) : 0,
    };
  }, [logs]);

  const byCampaign = campaigns.map((c) => ({
    name: c.name,
    sent: c.sent,
    replied: c.replied,
    rate: c.sent ? Math.round((c.replied / c.sent) * 100) : 0,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Analytics</h1>
        <p className="mt-2 text-sm text-muted">The only five numbers that matter, minus two.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Sent", totals.sent],
          ["Replied", totals.replied],
          ["Reply rate", `${totals.rate}%`],
        ].map(([l, v]) => (
          <div key={String(l)} className="rounded-2xl border border-fg/8 bg-surface p-5">
            <p className="text-xs text-subtle">{l}</p>
            <p className="mt-2 font-display text-3xl tabular-nums">{v}</p>
          </div>
        ))}
      </div>
      <section>
        <h2 className="mb-4 text-xl">By campaign</h2>
        {byCampaign.length === 0 ? (
          <p className="text-sm text-muted">Launch a campaign to see hooks and cities land.</p>
        ) : (
          <ul className="space-y-3">
            {byCampaign.map((c) => (
              <li key={c.name} className="rounded-2xl border border-fg/8 bg-surface p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-sm text-teal tabular-nums">{c.rate}%</p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-panel">
                  <div
                    className="h-full rounded-full bg-teal"
                    style={{ width: `${Math.min(100, c.rate)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-subtle">
                  {c.sent} sent · {c.replied} replies
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
