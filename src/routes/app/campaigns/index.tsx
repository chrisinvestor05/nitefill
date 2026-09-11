import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { listCampaigns, processSends, type Campaign } from "@/lib/server/campaigns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CampaignPlaybook } from "@/components/app/campaign-playbook";

export const Route = createFileRoute("/app/campaigns/")({
  component: CampaignsPage,
  head: () => ({ meta: [{ title: "Campaigns – Nitefill" }] }),
});

function statusTone(status: string) {
  if (status === "running") return "success" as const;
  if (status === "completed") return "teal" as const;
  if (status === "paused") return "orange" as const;
  return "muted" as const;
}

function CampaignsPage() {
  const [rows, setRows] = useState<Campaign[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function tick() {
      try {
        await processSends({ data: {} });
        const list = await listCampaigns();
        if (!cancelled) setRows(list);
      } catch {
        /* keep last snapshot */
      }
    }
    void tick();
    const timer = setInterval(() => void tick(), 5000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">Campaigns</h1>
          <p className="mt-2 text-sm text-muted">
            One night, one invite, one list. Launch SafeSend and stay on the campaign
            — invites drip out live.
          </p>
        </div>
        <Link to="/app/campaigns/new">
          <Button>New campaign</Button>
        </Link>
      </div>
      <CampaignPlaybook compact />
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-fg/15 p-10 text-center">
          <p className="text-muted">Nothing running yet.</p>
          <p className="mt-2 text-sm text-subtle">
            Create a campaign, or start a London rooftop sample from Overview.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link to="/app/campaigns/new">
              <Button>New campaign</Button>
            </Link>
            <Link to="/app">
              <Button variant="ghost">Back to overview</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-fg/8">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-surface text-xs text-subtle">
              <tr>
                {["Name", "City", "Status", "Queued", "Sent", "Replies"].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-t border-fg/8">
                  <td className="px-4 py-3">
                    <Link
                      to="/app/campaigns/$id"
                      params={{ id: c.id }}
                      className="font-medium text-fg hover:text-teal"
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted">{c.city}</td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{c.queued}</td>
                  <td className="px-4 py-3 tabular-nums">{c.sent}</td>
                  <td className="px-4 py-3 tabular-nums">{c.replied}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
