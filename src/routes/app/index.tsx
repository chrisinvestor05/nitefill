import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { dashboardStats, listCampaigns, processSends, seedSampleCampaign, type Campaign } from "@/lib/server/campaigns";
import { getProfile, type Profile } from "@/lib/server/profile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { planById } from "@/data/content";
import { RedeemPromo } from "@/components/app/redeem-promo";
import { CampaignPlaybook } from "@/components/app/campaign-playbook";

export const Route = createFileRoute("/app/")({
  component: OverviewPage,
  head: () => ({ meta: [{ title: "Dashboard – Nitefill" }] }),
});

function OverviewPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Awaited<ReturnType<typeof dashboardStats>> | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const [s, c, p] = await Promise.all([dashboardStats(), listCampaigns(), getProfile()]);
    setStats(s);
    setCampaigns(c);
    setProfile(p);
  }

  useEffect(() => {
    let cancelled = false;
    async function tick() {
      try {
        await processSends({ data: {} });
        if (cancelled) return;
        await load();
      } catch {
        if (!cancelled) await load();
      }
    }
    void tick();
    const timer = setInterval(() => void tick(), 5000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  async function sample() {
    setBusy(true);
    setError(null);
    try {
      const created = await seedSampleCampaign();
      await processSends({ data: { campaignId: created.id } });
      await navigate({ to: "/app/campaigns/$id", params: { id: created.id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start the sample night.");
      setBusy(false);
    }
  }

  const plan = planById(profile?.planId ?? "pro");
  const replyRate =
    stats && stats.sent > 0 ? Math.round((stats.replied / stats.sent) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-teal">Overview</p>
          <h1 className="mt-1 text-3xl">Your room</h1>
          <p className="mt-2 text-sm text-muted">
            {profile?.instagramConnected
              ? `Sending as @${profile.instagramHandle}`
              : "Connect Instagram to send from your own account — or start a sample night now."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={sample} disabled={busy}>
            {busy ? "Launching…" : "Sample rooftop night"}
          </Button>
          <Link to="/app/campaigns/new">
            <Button>New campaign</Button>
          </Link>
        </div>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <CampaignPlaybook />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Invites sent", value: stats?.sent ?? "—" },
          { label: "Replies", value: stats?.replied ?? "—" },
          { label: "Reply rate", value: stats ? `${replyRate}%` : "—" },
          { label: "Queued", value: stats?.queued ?? "—" },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-fg/8 bg-surface p-5">
            <p className="text-xs text-subtle">{c.label}</p>
            <p className="mt-2 font-display text-3xl font-semibold tabular-nums text-fg">{c.value}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Badge>{plan.name}</Badge>
        <Badge tone={profile?.planStatus === "trial" ? "orange" : "success"}>
          {profile?.planStatus === "trial"
            ? "7-day trial"
            : profile?.planStatus === "comp"
              ? "Complimentary"
              : profile?.planStatus ?? "trial"}
        </Badge>
        {profile?.planStatus === "trial" && profile.trialEndsAt && (
          <span className="text-xs text-subtle">
            Trial through {new Date(profile.trialEndsAt).toLocaleDateString()}
          </span>
        )}
      </div>
      {profile && profile.planStatus !== "comp" && (
        <RedeemPromo profile={profile} onRedeemed={setProfile} />
      )}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl">Campaigns</h2>
          <Link to="/app/campaigns" className="text-sm text-teal hover:underline">
            See all
          </Link>
        </div>
        {campaigns.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-fg/15 bg-surface/50 p-8 text-center">
            <p className="text-muted">No campaigns yet. Start with a London rooftop sample — it launches and sends the first wave for you.</p>
            <Button className="mt-5" onClick={sample} disabled={busy}>
              {busy ? "Launching…" : "Run sample rooftop"}
            </Button>
          </div>
        ) : (
          <ul className="space-y-3">
            {campaigns.slice(0, 4).map((c) => (
              <li key={c.id}>
                <Link
                  to="/app/campaigns/$id"
                  params={{ id: c.id }}
                  className="flex items-center justify-between rounded-2xl border border-fg/8 bg-surface px-5 py-4 hover:border-fg/20"
                >
                  <div>
                    <p className="font-medium text-fg">{c.name}</p>
                    <p className="text-xs text-subtle">
                      {c.city} · {c.sent} sent · {c.queued} queued
                    </p>
                  </div>
                  <Badge
                    tone={
                      c.status === "running" ? "success" : c.status === "completed" ? "teal" : "muted"
                    }
                  >
                    {c.status}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
