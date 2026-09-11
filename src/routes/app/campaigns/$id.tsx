import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  discoverAudience,
  getCampaign,
  listAudience,
  listOutreach,
  pauseCampaign,
  processSends,
  startCampaign,
  type AudienceRow,
  type Campaign,
  type OutreachRow,
} from "@/lib/server/campaigns";
import { rewriteInvite } from "@/lib/server/ai";
import { getProfile, type Profile } from "@/lib/server/profile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { personalizeTemplate } from "@/lib/personalize";

export const Route = createFileRoute("/app/campaigns/$id")({
  component: CampaignDetail,
  head: () => ({ meta: [{ title: "Campaign – Nitefill" }] }),
});

function statusTone(status: string) {
  if (status === "running") return "success" as const;
  if (status === "completed") return "teal" as const;
  if (status === "paused") return "orange" as const;
  return "muted" as const;
}

function CampaignDetail() {
  const { id } = Route.useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [audience, setAudience] = useState<AudienceRow[]>([]);
  const [logs, setLogs] = useState<OutreachRow[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewSource, setPreviewSource] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastWave, setLastWave] = useState(0);

  async function load() {
    const [c, a, o, p] = await Promise.all([
      getCampaign({ data: { id } }),
      listAudience({ data: { campaignId: id } }),
      listOutreach({ data: { campaignId: id } }),
      getProfile(),
    ]);
    setCampaign(c);
    setAudience(a);
    setLogs(o);
    setProfile(p);
  }

  useEffect(() => {
    let cancelled = false;
    async function tick() {
      try {
        const res = await processSends({ data: { campaignId: id } });
        if (cancelled) return;
        if (res.sentNow > 0) setLastWave(res.sentNow);
        await load();
      } catch {
        if (!cancelled) await load();
      }
    }
    void tick();
    const timer = setInterval(() => void tick(), 4000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [id]);

  async function launch() {
    setBusy(true);
    setError(null);
    try {
      await startCampaign({ data: { id } });
      const res = await processSends({ data: { campaignId: id } });
      setLastWave(res.sentNow);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not launch.");
    } finally {
      setBusy(false);
    }
  }

  async function pause() {
    setBusy(true);
    await pauseCampaign({ data: { id } });
    await load();
    setBusy(false);
  }

  async function rediscover() {
    if (!campaign) return;
    setBusy(true);
    await discoverAudience({
      data: {
        campaignId: id,
        city: campaign.city,
        gender: campaign.genderFilter,
        genre: campaign.genre ?? undefined,
        keywords: campaign.bioKeywords ?? undefined,
      },
    });
    await load();
    setBusy(false);
  }

  async function previewOne(person: AudienceRow) {
    if (!campaign) return;
    setBusy(true);
    const profileLike = {
      displayName: person.displayName,
      handle: person.handle,
      city: person.city || campaign.city,
      bio: person.bio || "",
      recentPost: person.recentPost || "",
      genreTags: (person.genreTags || "").split(",").map((s) => s.trim()).filter(Boolean),
    };
    const fallback = personalizeTemplate(
      campaign.messageTemplate,
      profileLike,
      campaign.eventName || campaign.name,
      campaign.city,
    );
    try {
      const res = await rewriteInvite({
        data: {
          template: campaign.messageTemplate,
          event: campaign.eventName || campaign.name,
          city: campaign.city,
          profile: profileLike,
        },
      });
      setPreview(res.text);
      setPreviewSource(res.source);
    } catch {
      setPreview(fallback);
      setPreviewSource("template");
    } finally {
      setBusy(false);
    }
  }

  if (!campaign) {
    return <p className="text-muted">Loading campaign…</p>;
  }

  const canLaunch = campaign.status === "draft" || campaign.status === "paused";
  const running = campaign.status === "running";
  const total = campaign.queued + campaign.sent;
  const progress = total > 0 ? Math.round((campaign.sent / total) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/app/campaigns" className="text-sm text-teal hover:underline">
            Campaigns
          </Link>
          <h1 className="mt-1 text-3xl">{campaign.name}</h1>
          <p className="mt-2 text-sm text-muted">
            {campaign.city}
            {campaign.eventDate ? ` · ${campaign.eventDate}` : ""}
            {campaign.venue ? ` · ${campaign.venue}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={statusTone(campaign.status)}>
            {running ? "SafeSend running" : campaign.status}
          </Badge>
          {canLaunch && (
            <Button onClick={launch} disabled={busy} size="lg">
              {busy ? "Launching…" : campaign.status === "paused" ? "Resume SafeSend" : "Launch SafeSend"}
            </Button>
          )}
          {running && (
            <Button variant="ghost" onClick={pause} disabled={busy}>
              Pause
            </Button>
          )}
          <Button variant="ghost" onClick={rediscover} disabled={busy || running}>
            Refresh audience
          </Button>
        </div>
      </div>

      {canLaunch && (
        <aside className="rounded-2xl border border-orange/30 bg-orange/8 p-5">
          <p className="text-sm font-medium text-fg">Ready to send</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            {audience.length} people are queued. Launch sends the first five personal
            invites now, then drips the rest over a couple of minutes so it doesn't
            look like a blast. Stay on this page — Sent will climb on its own.
          </p>
        </aside>
      )}

      {running && (
        <aside className="rounded-2xl border border-teal/30 bg-teal/8 p-5">
          <p className="text-sm font-medium text-fg">SafeSend is live</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            {lastWave > 0
              ? `Just sent ${lastWave} more. `
              : "First wave is out. "}
            The rest drip with uneven gaps. Replies show up here — you still answer
            them in Instagram.
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-panel">
            <div
              className="h-full rounded-full bg-teal transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-subtle">{progress}% of this list invited</p>
        </aside>
      )}

      {campaign.status === "completed" && (
        <aside className="rounded-2xl border border-fg/8 bg-surface p-5">
          <p className="text-sm font-medium text-fg">This list is done</p>
          <p className="mt-1 text-sm text-muted">
            Everyone queued has been invited. Open a new campaign for the next night,
            or refresh the audience to find another room.
          </p>
        </aside>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      {profile && !profile.instagramConnected && (
        <p className="text-sm text-subtle">
          Invites are simulated in this workspace.{" "}
          <Link to="/app/connect" className="text-teal hover:underline">
            Connect a handle
          </Link>{" "}
          so the dashboard shows who you're sending as.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Queued", campaign.queued],
          ["Sent", campaign.sent],
          ["Replies", campaign.replied],
        ].map(([l, v]) => (
          <div key={String(l)} className="rounded-2xl border border-fg/8 bg-surface p-5">
            <p className="text-xs text-subtle">{l}</p>
            <p className="mt-1 font-display text-2xl tabular-nums" aria-live="polite">
              {v}
            </p>
          </div>
        ))}
      </div>
      {preview && (
        <aside className="rounded-2xl border border-teal/30 bg-teal/5 p-5">
          <p className="text-xs text-teal">
            Preview {previewSource === "ai" ? "· rewritten" : "· template"}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{preview}</p>
        </aside>
      )}
      <section>
        <h2 className="mb-3 text-xl">Audience</h2>
        {audience.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-fg/15 p-8 text-center">
            <p className="text-sm text-muted">No matches yet.</p>
            <Button className="mt-4" onClick={rediscover} disabled={busy}>
              Find people in {campaign.city || "this city"}
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-fg/8 rounded-2xl border border-fg/8">
            {audience.map((p) => (
              <li key={p.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="font-medium text-fg">
                    {p.displayName}{" "}
                    <span className="text-subtle">@{p.handle}</span>
                  </p>
                  <p className="text-xs text-subtle">
                    {p.city} · {p.matchScore}% match · {p.status}
                  </p>
                  <p className="mt-1 text-sm text-muted">{p.bio}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => previewOne(p)} disabled={busy}>
                  Preview invite
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2 className="mb-3 text-xl">Sent</h2>
        {logs.length === 0 ? (
          <p className="text-sm text-muted">
            Nothing sent yet. Launch SafeSend — the first five go out immediately.
          </p>
        ) : (
          <ul className="space-y-3">
            {logs.map((l) => (
              <li key={l.id} className="rounded-2xl border border-fg/8 bg-surface p-4">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-fg">
                    {l.displayName ?? l.handle}{" "}
                    <span className="text-subtle">@{l.handle}</span>
                  </p>
                  <Badge tone={l.replied ? "success" : "muted"}>
                    {l.replied ? "replied" : "sent"}
                  </Badge>
                </div>
                <p className="text-sm leading-relaxed text-muted">{l.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
