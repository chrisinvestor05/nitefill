import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { listCampaigns, type Campaign } from "@/lib/server/campaigns";
import { getSenderStatus, type SenderStatus } from "@/lib/server/sender";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CampaignPlaybook } from "@/components/app/campaign-playbook";
import { listLocalCampaigns, mergeCampaignLists } from "@/lib/client/campaign-store";

export const Route = createFileRoute("/app/campaigns/")({
  component: CampaignsPage,
  head: () => ({ meta: [{ title: "Campaigns – Nitefill" }] }),
});

function CampaignsPage() {
  const [rows, setRows] = useState<Campaign[]>([]);
  const [sender, setSender] = useState<SenderStatus | null>(null);

  async function load() {
    setRows(listLocalCampaigns());
    try {
      const server = await listCampaigns();
      setRows(mergeCampaignLists(server));
    } catch {
      setRows(listLocalCampaigns());
    }
    try {
      setSender(await getSenderStatus());
    } catch {
      /* keep previous */
    }
  }

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">Campaigns</h1>
          <p className="mt-2 text-sm text-muted">
            {sender?.online
              ? `Sender online${sender.instagramHandle ? ` as @${sender.instagramHandle}` : ""}.`
              : "Sender offline — real DMs wait until Chrome is signed into Instagram."}
          </p>
        </div>
        <Link to="/app/campaigns/new">
          <Button>New campaign</Button>
        </Link>
      </div>
      <CampaignPlaybook compact />
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-fg/15 p-10 text-center">
          <p className="text-muted">Nothing running. Create a campaign with seed Instagram accounts.</p>
          <div className="mt-4 flex justify-center gap-3">
            <Link to="/app/campaigns/new">
              <Button>New campaign</Button>
            </Link>
            <Link to="/app/connect" className="text-sm text-teal hover:underline self-center">
              Connect Instagram first
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-fg/8">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-surface text-xs text-subtle">
              <tr>
                {["Name", "City", "Status", "Queued", "Sent", "Failed"].map((h) => (
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
                  <td className="px-4 py-3 tabular-nums">{c.failed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
