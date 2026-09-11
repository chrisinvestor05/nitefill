import type { AudienceRow, Campaign, OutreachRow } from "../server/campaigns.ts";

function freshId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

const KEY = "nitefill.desk.v1";

export type Desk = {
  campaigns: Campaign[];
  audienceByCampaign: Record<string, AudienceRow[]>;
  logsByCampaign: Record<string, OutreachRow[]>;
};

function emptyDesk(): Desk {
  return { campaigns: [], audienceByCampaign: {}, logsByCampaign: {} };
}

function canStore(): boolean {
  try {
    return typeof globalThis.localStorage !== "undefined" && globalThis.localStorage != null;
  } catch {
    return false;
  }
}

export function readDesk(): Desk {
  if (!canStore()) return emptyDesk();
  try {
    const raw = globalThis.localStorage.getItem(KEY);
    if (!raw) return emptyDesk();
    const parsed = JSON.parse(raw) as Partial<Desk>;
    return {
      campaigns: Array.isArray(parsed.campaigns) ? parsed.campaigns : [],
      audienceByCampaign: parsed.audienceByCampaign && typeof parsed.audienceByCampaign === "object" ? parsed.audienceByCampaign : {},
      logsByCampaign: parsed.logsByCampaign && typeof parsed.logsByCampaign === "object" ? parsed.logsByCampaign : {},
    };
  } catch {
    return emptyDesk();
  }
}

function writeDesk(desk: Desk) {
  if (!canStore()) return;
  try {
    globalThis.localStorage.setItem(KEY, JSON.stringify(desk));
  } catch {
    /* quota */
  }
}

export function parseHandleList(raw: string | undefined | null): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of String(raw || "").split(/[\s,;]+/)) {
    const handle = part.replace(/^@+/, "").trim().toLowerCase();
    if (!handle || seen.has(handle)) continue;
    if (!/^[a-z0-9._]{1,30}$/.test(handle)) continue;
    seen.add(handle);
    out.push(handle);
  }
  return out;
}

export function seedString(handles: string[]): string {
  return handles.join(", ");
}

export function blankCampaign(
  partial: Partial<Campaign> & Pick<Campaign, "id" | "name">,
): Campaign {
  const now = new Date().toISOString();
  return {
    userId: partial.userId || "local",
    eventName: partial.eventName ?? null,
    venue: partial.venue ?? null,
    city: partial.city || "London",
    eventDate: partial.eventDate ?? null,
    genre: partial.genre ?? null,
    genderFilter: partial.genderFilter || "all",
    bioKeywords: partial.bioKeywords ?? null,
    seedAccounts: partial.seedAccounts || "",
    messageTemplate: partial.messageTemplate || "",
    dailyLimit: partial.dailyLimit ?? 35,
    status: partial.status || "draft",
    discoverStatus: partial.discoverStatus || "pending",
    discoverError: partial.discoverError ?? null,
    startedAt: partial.startedAt ?? null,
    createdAt: partial.createdAt || now,
    queued: partial.queued ?? 0,
    sent: partial.sent ?? 0,
    failed: partial.failed ?? 0,
    replied: partial.replied ?? 0,
    nextSendAt: partial.nextSendAt ?? null,
    ...partial,
  };
}

export function sampleRooftop(id = freshId("cmp")): Campaign {
  return blankCampaign({
    id,
    name: "London rooftop — 14th",
    eventName: "a rooftop house night",
    venue: "A small terrace in east London",
    city: "London",
    eventDate: "the 14th",
    genre: "house",
    genderFilter: "all",
    bioKeywords: "fabric, ministry, rooftop, house",
    seedAccounts: "fabriclondon, ministryofsound, boilerroom",
    messageTemplate:
      "I'm putting on a rooftop thing, proper house line-up, smaller room. Reckon it'd be your kind of night?",
    dailyLimit: 35,
    status: "draft",
    discoverStatus: "pending",
  });
}

export function recount(campaign: Campaign, audience: AudienceRow[]): Campaign {
  const queued = audience.filter((a) => a.status === "queued" || a.status === "sending").length;
  const sent = audience.filter((a) => a.status === "sent" || a.status === "replied").length;
  const failed = audience.filter((a) => a.status === "failed").length;
  const replied = audience.filter((a) => a.status === "replied").length;
  return { ...campaign, queued, sent, failed, replied };
}

export function upsertLocalCampaign(campaign: Campaign): Campaign {
  const desk = readDesk();
  const audience = desk.audienceByCampaign[campaign.id] || [];
  const next = recount(campaign, audience);
  const idx = desk.campaigns.findIndex((c) => c.id === campaign.id);
  if (idx >= 0) desk.campaigns[idx] = { ...desk.campaigns[idx], ...next };
  else desk.campaigns.unshift(next);
  writeDesk(desk);
  return next;
}

export function patchLocalCampaign(id: string, patch: Partial<Campaign>): Campaign | null {
  const existing = getLocalCampaign(id);
  if (!existing) return null;
  return upsertLocalCampaign({ ...existing, ...patch, id });
}

export function getLocalCampaign(id: string): Campaign | null {
  return readDesk().campaigns.find((c) => c.id === id) ?? null;
}

export function listLocalCampaigns(): Campaign[] {
  const desk = readDesk();
  return desk.campaigns.map((c) => recount(c, desk.audienceByCampaign[c.id] || []));
}

export function mergeCampaignLists(server: Campaign[]): Campaign[] {
  const map = new Map<string, Campaign>();
  for (const c of server) map.set(c.id, c);
  for (const local of listLocalCampaigns()) {
    const prev = map.get(local.id);
    if (!prev) {
      map.set(local.id, local);
      continue;
    }
    map.set(local.id, {
      ...prev,
      ...local,
      queued: Math.max(prev.queued, local.queued),
      sent: Math.max(prev.sent, local.sent),
      failed: Math.max(prev.failed, local.failed),
      replied: Math.max(prev.replied, local.replied),
      nextSendAt: local.nextSendAt || prev.nextSendAt,
    });
  }
  return [...map.values()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function profilesToAudience(
  campaignId: string,
  profiles: Array<Record<string, unknown>>,
): AudienceRow[] {
  const out: AudienceRow[] = [];
  const seen = new Set<string>();
  for (const p of profiles) {
    const handle = String(p.handle || "")
      .replace(/^@+/, "")
      .toLowerCase();
    if (!handle || seen.has(handle)) continue;
    seen.add(handle);
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
      status: String(p.status || "queued"),
      message: (p.message as string | null) ?? null,
      failReason: (p.failReason as string | null) ?? null,
      igPk: p.igPk ? String(p.igPk) : null,
    });
  }
  return out;
}

export function handlesToAudience(campaignId: string, raw: string): AudienceRow[] {
  return parseHandleList(raw).map((handle) => ({
    id: `local-${handle}`,
    campaignId,
    handle,
    displayName: handle,
    city: null,
    gender: null,
    bio: null,
    recentPost: null,
    genreTags: null,
    matchScore: 70,
    status: "queued",
    message: null,
    failReason: null,
    igPk: null,
  }));
}

export function listLocalAudience(campaignId?: string): AudienceRow[] {
  const desk = readDesk();
  if (campaignId) return desk.audienceByCampaign[campaignId] || [];
  return Object.values(desk.audienceByCampaign).flat();
}

export function mergeLocalAudience(campaignId: string, rows: AudienceRow[]): AudienceRow[] {
  const desk = readDesk();
  const cur = desk.audienceByCampaign[campaignId] || [];
  const seen = new Set(cur.map((r) => r.handle));
  const next = [...cur];
  for (const row of rows) {
    if (!row.handle || seen.has(row.handle)) continue;
    seen.add(row.handle);
    next.push({ ...row, campaignId });
  }
  desk.audienceByCampaign[campaignId] = next;
  const camp = desk.campaigns.find((c) => c.id === campaignId);
  if (camp) {
    const recounted = recount(camp, next);
    const idx = desk.campaigns.findIndex((c) => c.id === campaignId);
    desk.campaigns[idx] = recounted;
  }
  writeDesk(desk);
  return next;
}

export function setLocalAudienceStatus(
  campaignId: string,
  handle: string,
  status: string,
  extra: Partial<AudienceRow> = {},
): AudienceRow[] {
  const desk = readDesk();
  const rows = (desk.audienceByCampaign[campaignId] || []).map((row) =>
    row.handle === handle ? { ...row, status, ...extra } : row,
  );
  desk.audienceByCampaign[campaignId] = rows;
  const camp = desk.campaigns.find((c) => c.id === campaignId);
  if (camp) {
    const idx = desk.campaigns.findIndex((c) => c.id === campaignId);
    desk.campaigns[idx] = recount(camp, rows);
  }
  writeDesk(desk);
  return rows;
}

export function listLocalLogs(campaignId?: string): OutreachRow[] {
  const desk = readDesk();
  if (campaignId) return desk.logsByCampaign[campaignId] || [];
  return Object.values(desk.logsByCampaign).flat();
}

export function appendLocalLog(row: OutreachRow): OutreachRow[] {
  const desk = readDesk();
  const cur = desk.logsByCampaign[row.campaignId] || [];
  if (cur.some((l) => l.id === row.id || (l.handle === row.handle && l.message === row.message))) {
    return cur;
  }
  const next = [row, ...cur];
  desk.logsByCampaign[row.campaignId] = next;
  writeDesk(desk);
  return next;
}

export function senderDiscoverJob(c: Pick<Campaign, "id" | "seedAccounts" | "bioKeywords" | "genderFilter" | "city" | "genre">) {
  return {
    kind: "discover" as const,
    campaignId: c.id,
    seeds: parseHandleList(c.seedAccounts),
    keywords: parseHandleList(c.bioKeywords || "").length
      ? String(c.bioKeywords || "")
          .split(/[,\s]+/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
    gender: c.genderFilter || "all",
    city: c.city || "",
    genre: c.genre || "",
    limit: 24,
  };
}

export function clearDesk() {
  if (!canStore()) return;
  try {
    globalThis.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
