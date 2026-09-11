import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  discoverAudience,
  getCampaign,
  listAudience,
  listOutreach,
  pauseCampaign,
  startCampaign,
  type AudienceRow,
  type Campaign,
  type OutreachRow,
} from "@/lib/server/campaigns";
import { getSenderStatus, type SenderStatus } from "@/lib/server/sender";
import { rewriteInvite } from "@/lib/server/ai";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { personalizeTemplate } from "@/lib/personalize";
import { enqueueSenderJob, useExtensionLive } from "@/components/app/sender-live";

export const Route = createFileRoute("/app/campaigns/$id")({
  component: CampaignDetail,
  head: () => ({ meta: [{ title: "Campaign – Nitefill" }] }),
});

function statusTone(status: string) {
  if (status === "running") return "success" as const;
  if (status === "completed") return "teal" as const;
  if (status === "paused" || status === "failed") return "orange" as const;
  return "muted" as const;
}

function asAudience(campaignId: string, profiles: Array<Record<string, unknown>>): AudienceRow[] {
  const out: AudienceRow[] = [];
  for (const p of profiles) {
    const handle = String(p.handle || "")
      .replace(/^@+/, "")
      .toLowerCase();
    if (!handle) continue;
    out.push({
      id: String(p.igPk || p.id || `local-${handle}`),
      campaignId,
      handle,
      displayName: String(p.displayName || p.display_name || handle),
      city: (p.city as string | null) ?? null,
      gender: null,
      bio: (p.bio as string | null) ?? null,
      recentPost: (p.recentPost as string | null) ?? null,
      genreTags: null,
      matchScore: Number(p.matchScore ?? 70),
      status: "queued",
      message: null,
      failReason: null,
      igPk: p.igPk ? String(p.igPk) : null,
    });
  }
  return out;
}

function CampaignDetail() {
  const { id } = Route.useParams();
  const live = useExtensionLive();
  const kicked = useRef(false);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [audience, setAudience] = useState<AudienceRow[]>([]);
  const [logs, setLogs] = useState<OutreachRow[]>([]);
  const [sender, setSender] = useState<SenderStatus | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewSource, setPreviewSource] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discoverMsg, setDiscoverMsg] = useState<string | null>(null);

  function discoverJob(c: Campaign) {
    return {
      kind: "discover" as const,
      campaignId: c.id,
      seeds: c.seedAccounts
        .split(/[,\s]+/)
        .map((s) => s.replace(/^@+/, "").trim())
        .filter(Boolean),
      keywords: (c.bioKeywords || "").split(/[,\s]+/).filter(Boolean),
      gender: c.genderFilter || "all",
      city: c.city || "",
      genre: c.genre || "",
      limit: 18,
    };
  }

  async function load() {
    const [c, a, o, s] = await Promise.all([
      getCampaign({ data: { id } }),
      listAudience({ data: { campaignId: id } }),
      listOutreach({ data: { campaignId: id } }),
      getSenderStatus(),
    ]);
    setCampaign(c);
    if (a.length) setAudience(a);
    setLogs(o);
    setSender(s);
    if (c && !kicked.current && (c.discoverStatus === "pending" || c.discoverStatus === "running") && c.seedAccounts) {
      kicked.current = true;
      enqueueSenderJob(discoverJob(c));
      setDiscoverMsg("Finding followers from Instagram…");
    }
  }

  useEffect(() => {
    kicked.current = false;
    void load();
    const timer = setInterval(() => void load(), 5000);
    return () => clearInterval(timer);
  }, [id]);

  useEffect(() => {
    function onEvt(event: Event) {
      const d = (event as CustomEvent).detail || {};
      if (d.campaignId && d.campaignId !== id) return;
      if (d.kind === "discover-progress" || d.message) {
        if (d.message) setDiscoverMsg(String(d.message));
      }
      if (d.kind === "discover-done" && Array.isArray(d.profiles)) {
        const rows = asAudience(id, d.profiles);
        if (rows.length) {
          setAudience((cur) => {
            const seen = new Set(cur.map((r) => r.handle));
            return [...cur, ...rows.filter((r) => !seen.has(r.handle))];
          });
        }
        setDiscoverMsg(String(d.message || `Found ${rows.length} followers`));
      }
      if (d.kind === "discover-error") {
        setError(String(d.message || "Could not read followers."));
      }
      if (d.kind === "sent" && d.handle) {
        setAudience((cur) =>
          cur.map((row) => (row.handle === d.handle ? { ...row, status: "sent" } : row)),
        );
      }
    }
    window.addEventListener("nitefill-ext", onEvt);
    return () => window.removeEventListener("nitefill-ext", onEvt);
  }, [id]);

  async function launch() {
    setBusy(true);
    setError(null);
    try {
      try {
        const res = await startCampaign({ data: { id } });
        if (res.discover) enqueueSenderJob(res.discover);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not mark the campaign running.");
      }
      for (const person of audience.filter((a) => a.status === "queued")) {
        const message =
          person.message ||
          personalizeTemplate(
            campaign?.messageTemplate || "",
            {
              displayName: person.displayName,
              handle: person.handle,
              city: person.city || campaign?.city || "",
              bio: person.bio || "",
              recentPost: person.recentPost || "",
              genreTags: (person.genreTags || "").split(",").map((s) => s.trim()).filter(Boolean),
            },
            campaign?.eventName || campaign?.name || "a night",
            campaign?.city || "",
          );
        enqueueSenderJob({
          kind: "send",
          campaignId: id,
          audienceId: person.id,
          handle: person.handle,
          displayName: person.displayName,
          igPk: person.igPk,
          message,
        });
      }
      await load();
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
    setError(null);
    kicked.current = true;
    try {
      const res = await discoverAudience({
        data: {
          campaignId: id,
          city: campaign.city,
          gender: campaign.genderFilter,
          genre: campaign.genre ?? undefined,
          keywords: campaign.bioKeywords ?? undefined,
          seedAccounts: campaign.seedAccounts,
        },
      });
      enqueueSenderJob(res.job ?? discoverJob(campaign));
      setDiscoverMsg("Finding followers from Instagram…");
      await load();
    } catch (err) {
      enqueueSenderJob(discoverJob(campaign));
      setDiscoverMsg("Finding followers from Instagram…");
      setError(err instanceof Error ? err.message : null);
    } finally {
      setBusy(false);
    }
  }

  async function previewOne(person: AudienceRow) {
    if (!campaign) return;
    setBusy(true);
    const profile = {
      displayName: person.displayName,
      handle: person.handle,
      city: person.city || campaign.city,
      bio: person.bio || "",
      recentPost: person.recentPost || "",
      genreTags: (person.genreTags || "").split(",").map((s) => s.trim()).filter(Boolean),
    };
    const fallback = personalizeTemplate(
      campaign.messageTemplate,
      profile,
      campaign.eventName || campaign.name,
      campaign.city,
    );
    try {
      const res = await rewriteInvite({
        data: {
          template: campaign.messageTemplate,
          event: campaign.eventName || campaign.name,
          city: campaign.city,
          profile,
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

  const total = Math.max(campaign.queued + campaign.sent + campaign.failed, audience.length);
  const sentCount = Math.max(campaign.sent, audience.filter((a) => a.status === "sent" || a.status === "replied").length);
  const pct = total ? Math.round((sentCount / total) * 100) : 0;
  const nextIn =
    campaign.status === "running" && campaign.nextSendAt
      ? Math.max(0, Math.round((new Date(campaign.nextSendAt).getTime() - Date.now()) / 1000))
      : null;
  const senderLive = live.paired || live.igHandle || sender?.online;

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
          {campaign.seedAccounts ? (
            <p className="mt-1 text-xs text-subtle">Seeds @{campaign.seedAccounts.split(", ").join(" · @")}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone={statusTone(campaign.status)}>
            {campaign.status === "running" ? "SafeSend running" : campaign.status}
          </Badge>
          {campaign.status !== "running" && campaign.status !== "completed" && (
            <Button onClick={launch} disabled={busy}>
              {busy ? "Working…" : "Launch SafeSend"}
            </Button>
          )}
          {campaign.status === "running" && (
            <Button variant="ghost" onClick={pause} disabled={busy}>
              Pause
            </Button>
          )}
          <Button variant="ghost" onClick={rediscover} disabled={busy}>
            {busy ? "Finding…" : "Find followers"}
          </Button>
        </div>
      </div>

      {!senderLive && live.installed === false && (
        <aside className="rounded-2xl border border-orange/30 bg-orange/8 p-5">
          <p className="font-medium text-fg">Nitefill Sender is not on this Chrome</p>
          <p className="mt-1 text-sm text-muted">
            Download the extension, Load unpacked, then refresh. Finding followers cannot start without it.
          </p>
          <Link to="/app/connect" className="mt-3 inline-block text-sm text-teal hover:underline">
            Connect Instagram
          </Link>
        </aside>
      )}
      {senderLive && (
        <aside className="rounded-2xl border border-teal/25 bg-teal/8 p-5">
          <p className="text-sm font-medium text-teal">
            Sender {live.igHandle || sender?.instagramHandle ? `online · @${live.igHandle || sender?.instagramHandle}` : "paired"}
          </p>
          <p className="mt-1 text-sm text-muted">
            {campaign.status === "running"
              ? nextIn && nextIn > 0
                ? `Next invite in about ${nextIn}s. Keep instagram.com open.`
                : "SafeSend will send the next due invite from this Chrome."
              : discoverMsg || "Launch SafeSend when the list looks right."}
          </p>
        </aside>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}
      {discoverMsg && <p className="text-sm text-teal">{discoverMsg}</p>}
      {live.lastError && <p className="text-sm text-danger">{live.lastError}</p>}
      {campaign.discoverError && <p className="text-sm text-danger">{campaign.discoverError}</p>}

      {total > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between text-xs text-subtle">
            <span>{pct}% of this list invited</span>
            <span>
              {sentCount} / {total}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-panel">
            <div className="h-full rounded-full bg-teal transition-[width] duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ["Queued", Math.max(campaign.queued, audience.filter((a) => a.status === "queued").length)],
          ["Sent", sentCount],
          ["Failed", campaign.failed],
          ["Replies", campaign.replied],
        ].map(([l, v]) => (
          <div key={String(l)} className="rounded-2xl border border-fg/8 bg-surface p-5">
            <p className="text-xs text-subtle">{l}</p>
            <p className="mt-1 font-display text-2xl tabular-nums" aria-live={l === "Sent" ? "polite" : undefined}>
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
          <p className="text-sm text-muted">
            No followers yet. Keep Instagram open and tap Find followers — the first batch should land in a few seconds.
          </p>
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
                    {p.failReason ? ` · ${p.failReason}` : ""}
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
        <h2 className="mb-3 text-xl">Sent from Instagram</h2>
        {logs.length === 0 ? (
          <p className="text-sm text-muted">
            Nothing has left Instagram yet. Launch SafeSend and keep the Instagram tab open.
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
                  <Badge tone={l.replied ? "success" : "muted"}>{l.replied ? "replied" : "sent"}</Badge>
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
