import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { listCampaigns, processSends, type Campaign } from "@/lib/server/campaigns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/app/campaigns/")({
  component: CampaignsPage,
  head: () => ({ meta: [{ title: "Campaigns – Nitefill" }] }),
});

function CampaignsPage() {
  const [rows, setRows] = useState<Campaign[]>([]);

  useEffect(() => {
    void processSends({ data: {} }).then(() => listCampaigns().then(setRows));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">Campaigns</h1>
          <p className="mt-2 text-sm text-muted">One night, one invite, one list.</p>
        </div>
        <Link to="/app/campaigns/new">
          <Button>New campaign</Button>
        </Link>
      </div>
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-fg/15 p-10 text-center text-muted">
          Nothing running. Create a campaign to find your crowd.
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
                    <Badge tone={c.status === "running" ? "success" : "muted"}>{c.status}</Badge>
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
