import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { nextSendAtMs } from "@/lib/personalize";
import { newId } from "./ids";
import { loadSenderStatus } from "./sender";

export type Campaign = {
  id: string;
  userId: string;
  name: string;
  eventName: string | null;
  venue: string | null;
  city: string;
  eventDate: string | null;
  genre: string | null;
  genderFilter: string;
  bioKeywords: string | null;
  seedAccounts: string;
  messageTemplate: string;
  dailyLimit: number;
  status: string;
  discoverStatus: string;
  discoverError: string | null;
  startedAt: string | null;
  createdAt: string;
  queued: number;
  sent: number;
  failed: number;
  replied: number;
  nextSendAt: string | null;
};

export type AudienceRow = {
  id: string;
  campaignId: string | null;
  handle: string;
  displayName: string;
  city: string | null;
  gender: string | null;
  bio: string | null;
  recentPost: string | null;
  genreTags: string | null;
  matchScore: number;
  status: string;
  message: string | null;
  failReason: string | null;
  igPk: string | null;
};

export type OutreachRow = {
  id: string;
  campaignId: string;
  audienceId: string;
  handle: string;
  message: string;
  sentAt: string;
  replied: boolean;
  repliedAt: string | null;
  displayName?: string;
};

function campaignFrom(
  row: Record<string, unknown>,
  counts: { queued: number; sent: number; failed: number; replied: number; nextSendAt: string | null },
): Campaign {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    name: String(row.name),
    eventName: (row.event_name as string | null) ?? null,
    venue: (row.venue as string | null) ?? null,
    city: String(row.city ?? ""),
    eventDate: (row.event_date as string | null) ?? null,
    genre: (row.genre as string | null) ?? null,
    genderFilter: String(row.gender_filter ?? "all"),
    bioKeywords: (row.bio_keywords as string | null) ?? null,
    seedAccounts: String(row.seed_accounts ?? ""),
    messageTemplate: String(row.message_template ?? ""),
    dailyLimit: Number(row.daily_limit ?? 35),
    status: String(row.status),
    discoverStatus: String(row.discover_status ?? "idle"),
    discoverError: (row.discover_error as string | null) ?? null,
    startedAt: row.started_at ? String(row.started_at) : null,
    createdAt: String(row.created_at),
    queued: counts.queued,
    sent: counts.sent,
    failed: counts.failed,
    replied: counts.replied,
    nextSendAt: counts.nextSendAt,
  };
}

async function countsFor(sql: Awaited<ReturnType<typeof getSql>>, userId: string, campaign: Record<string, unknown>) {
  const campaignId = String(campaign.id);
  const rows = await sql<{ status: string; n: number }>`
    select status, count(*)::int as n
    from audience_profiles
    where user_id = ${userId} and campaign_id = ${campaignId}
    group by status
  `;
  const map = Object.fromEntries(rows.map((r) => [r.status, Number(r.n)]));
  const replied = await sql<{ n: number }>`
    select count(*)::int as n from outreach_log
    where user_id = ${userId} and campaign_id = ${campaignId} and replied = true
  `;
  const queued = Number(map.queued ?? 0) + Number(map.sending ?? 0);
  const sent = Number(map.sent ?? 0) + Number(map.replied ?? 0);
  const failed = Number(map.failed ?? 0);
  const total = queued + sent + failed;
  const startedAt = campaign.started_at ? new Date(String(campaign.started_at)).getTime() : Date.now();
  const next = nextSendAtMs({
    startedAtMs: startedAt,
    nowMs: Date.now(),
    dailyLimit: Number(campaign.daily_limit ?? 35),
    audienceCount: total,
    alreadySent: sent,
  });
  return {
    queued,
    sent,
    failed,
    replied: Number(replied[0]?.n ?? 0),
    nextSendAt: campaign.status === "running" && next ? new Date(next).toISOString() : null,
  };
}

function parseSeeds(raw: string | undefined | null): string {
  return (raw || "")
    .split(/[,\s]+/)
    .map((s) => s.replace(/^@+/, "").trim())
    .filter(Boolean)
    .join(", ");
}

function seedsFrom(raw: string): string[] {
  return raw
    .split(/[,\s]+/)
    .map((s) => s.replace(/^@+/, "").trim())
    .filter(Boolean);
}

function clientCampaignId(raw: string | undefined): string {
  const id = String(raw || "").trim();
  if (/^cmp_[a-z0-9-]+$/i.test(id)) return id;
  return newId("cmp");
}

const ZERO_COUNTS = { queued: 0, sent: 0, failed: 0, replied: 0, nextSendAt: null as string | null };

function draftFromInput(
  userId: string,
  id: string,
  data: {
    name: string;
    eventName?: string;
    venue?: string;
    city: string;
    eventDate?: string;
    genre?: string;
    genderFilter?: string;
    bioKeywords?: string;
    seedAccounts?: string;
    messageTemplate?: string;
    dailyLimit?: number;
  },
): Campaign {
  const daily = Math.min(100, Math.max(10, Math.round(data.dailyLimit ?? 35)));
  return {
    id,
    userId,
    name: data.name.trim() || "Untitled campaign",
    eventName: data.eventName ?? null,
    venue: data.venue ?? null,
    city: data.city.trim() || "London",
    eventDate: data.eventDate ?? null,
    genre: data.genre ?? null,
    genderFilter: data.genderFilter ?? "all",
    bioKeywords: data.bioKeywords ?? null,
    seedAccounts: parseSeeds(data.seedAccounts),
    messageTemplate: data.messageTemplate ?? "",
    dailyLimit: daily,
    status: "draft",
    discoverStatus: "pending",
    discoverError: null,
    startedAt: null,
    createdAt: new Date().toISOString(),
    ...ZERO_COUNTS,
  };
}

function discoverJobFrom(
  campaignId: string,
  seeds: string,
  extras: { keywords?: string; gender?: string; city?: string; genre?: string },
) {
  return {
    kind: "discover" as const,
    campaignId,
    seeds: seedsFrom(seeds),
    keywords: String(extras.keywords || "")
      .split(/[,\s]+/)
      .filter(Boolean),
    gender: String(extras.gender || "all"),
    city: String(extras.city || ""),
    genre: String(extras.genre || ""),
    limit: 24,
  };
}

export const listCampaigns = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const sql = await getSql();
      const rows = await sql<Record<string, unknown>>`
        select * from campaigns where user_id = ${context.userId} order by created_at desc
      `;
      const out: Campaign[] = [];
      for (const row of rows) {
        const c = await countsFor(sql, context.userId, row);
        out.push(campaignFrom(row, c));
      }
      return out;
    } catch {
      return [];
    }
  });

export const getCampaign = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: { id: string }) => input)
  .handler(async ({ context, data }) => {
    try {
      const sql = await getSql();
      const rows = await sql<Record<string, unknown>>`
        select * from campaigns where id = ${data.id} and user_id = ${context.userId} limit 1
      `;
      if (!rows[0]) return null;
      const c = await countsFor(sql, context.userId, rows[0]);
      return campaignFrom(rows[0], c);
    } catch {
      return null;
    }
  });

export const createCampaign = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      name: string;
      eventName?: string;
      venue?: string;
      city: string;
      eventDate?: string;
      genre?: string;
      genderFilter?: string;
      bioKeywords?: string;
      seedAccounts?: string;
      messageTemplate?: string;
      dailyLimit?: number;
      id?: string;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const built = draftFromInput(context.userId, clientCampaignId(data.id), data);
    try {
      const sql = await getSql();
      await sql`
        insert into campaigns (
          id, user_id, name, event_name, venue, city, event_date, genre,
          gender_filter, bio_keywords, seed_accounts, message_template, daily_limit, status,
          discover_status
        ) values (
          ${built.id}, ${context.userId}, ${built.name}, ${built.eventName}, ${built.venue},
          ${built.city}, ${built.eventDate}, ${built.genre},
          ${built.genderFilter}, ${built.bioKeywords}, ${built.seedAccounts},
          ${built.messageTemplate}, ${built.dailyLimit}, ${"draft"}, ${"pending"}
        )
      `;
      const rows = await sql<Record<string, unknown>>`
        select * from campaigns where id = ${built.id} and user_id = ${context.userId} limit 1
      `;
      if (rows[0]) return campaignFrom(rows[0], ZERO_COUNTS);
    } catch {
      /* Browser desk is the durable copy on Vercel without Neon. */
    }
    return built;
  });

export const updateCampaign = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      id: string;
      name?: string;
      eventName?: string;
      venue?: string;
      city?: string;
      eventDate?: string;
      genre?: string;
      genderFilter?: string;
      bioKeywords?: string;
      seedAccounts?: string;
      messageTemplate?: string;
      dailyLimit?: number;
      status?: string;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    try {
      const sql = await getSql();
      const existing = await sql<Record<string, unknown>>`
        select * from campaigns where id = ${data.id} and user_id = ${context.userId} limit 1
      `;
      if (!existing[0]) return null;
      const daily =
        typeof data.dailyLimit === "number"
          ? Math.min(100, Math.max(10, Math.round(data.dailyLimit)))
          : null;
      const seeds = data.seedAccounts !== undefined ? parseSeeds(data.seedAccounts) : null;
      await sql`
        update campaigns set
          name = coalesce(${data.name ?? null}, name),
          event_name = coalesce(${data.eventName ?? null}, event_name),
          venue = coalesce(${data.venue ?? null}, venue),
          city = coalesce(${data.city ?? null}, city),
          event_date = coalesce(${data.eventDate ?? null}, event_date),
          genre = coalesce(${data.genre ?? null}, genre),
          gender_filter = coalesce(${data.genderFilter ?? null}, gender_filter),
          bio_keywords = coalesce(${data.bioKeywords ?? null}, bio_keywords),
          seed_accounts = coalesce(${seeds}, seed_accounts),
          message_template = coalesce(${data.messageTemplate ?? null}, message_template),
          daily_limit = coalesce(${daily}, daily_limit),
          status = coalesce(${data.status ?? null}, status)
        where id = ${data.id} and user_id = ${context.userId}
      `;
      const rows = await sql<Record<string, unknown>>`
        select * from campaigns where id = ${data.id} and user_id = ${context.userId} limit 1
      `;
      const c = await countsFor(sql, context.userId, rows[0]!);
      return campaignFrom(rows[0]!, c);
    } catch {
      return null;
    }
  });

export const discoverAudience = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      campaignId: string;
      city?: string;
      gender?: string;
      genre?: string;
      keywords?: string;
      seedAccounts?: string;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const seeds = parseSeeds(data.seedAccounts);
    if (!seeds) {
      throw new Error("Add at least one public Instagram seed account whose followers look like your night.");
    }
    let row: Record<string, unknown> | null = null;
    let senderOnline = false;
    try {
      const sql = await getSql();
      const campaign = await sql<Record<string, unknown>>`
        select * from campaigns where id = ${data.campaignId} and user_id = ${context.userId} limit 1
      `;
      row = campaign[0] ?? null;
      const sender = await loadSenderStatus(sql, context.userId);
      senderOnline = sender.online;
      if (row) {
        await sql`
          update campaigns set
            seed_accounts = ${seeds},
            city = coalesce(${data.city ?? null}, city),
            gender_filter = coalesce(${data.gender ?? null}, gender_filter),
            genre = coalesce(${data.genre ?? null}, genre),
            bio_keywords = coalesce(${data.keywords ?? null}, bio_keywords),
            discover_status = ${"pending"},
            discover_error = ${null}
          where id = ${data.campaignId} and user_id = ${context.userId}
        `;
      }
    } catch {
      /* Job still goes to Sender from the seeds in this request. */
    }
    const job = discoverJobFrom(data.campaignId, seeds, {
      keywords: data.keywords ?? (row ? String(row.bio_keywords ?? "") : ""),
      gender: data.gender ?? (row ? String(row.gender_filter ?? "all") : "all"),
      city: data.city ?? (row ? String(row.city ?? "") : ""),
      genre: data.genre ?? (row ? String(row.genre ?? "") : ""),
    });
    return {
      added: 0,
      pending: true as const,
      senderOnline,
      missing: !row,
      job,
      message: senderOnline
        ? "Nitefill Sender is pulling people from Instagram now. Keep the Instagram tab open."
        : "Looking for Sender. Keep this tab and Instagram open — people land here as soon as they are found.",
    };
  });

export const listAudience = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: { campaignId?: string }) => input)
  .handler(async ({ context, data }) => {
    try {
      const sql = await getSql();
      const rows = data.campaignId
        ? await sql<Record<string, unknown>>`
            select * from audience_profiles
            where user_id = ${context.userId} and campaign_id = ${data.campaignId}
            order by match_score desc, created_at desc
          `
        : await sql<Record<string, unknown>>`
            select * from audience_profiles
            where user_id = ${context.userId}
            order by created_at desc
            limit 200
          `;
      return rows.map(
        (row): AudienceRow => ({
          id: String(row.id),
          campaignId: (row.campaign_id as string | null) ?? null,
          handle: String(row.handle),
          displayName: String(row.display_name),
          city: (row.city as string | null) ?? null,
          gender: (row.gender as string | null) ?? null,
          bio: (row.bio as string | null) ?? null,
          recentPost: (row.recent_post as string | null) ?? null,
          genreTags: (row.genre_tags as string | null) ?? null,
          matchScore: Number(row.match_score),
          status: String(row.status),
          message: (row.message as string | null) ?? null,
          failReason: (row.fail_reason as string | null) ?? null,
          igPk: (row.ig_pk as string | null) ?? null,
        }),
      );
    } catch {
      return [];
    }
  });

export const startCampaign = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string; seedAccounts?: string }) => input)
  .handler(async ({ context, data }) => {
    const startedAt = new Date().toISOString();
    try {
      const sql = await getSql();
      const rows = await sql<Record<string, unknown>>`
        select * from campaigns where id = ${data.id} and user_id = ${context.userId} limit 1
      `;
      if (!rows[0]) {
        const seeds = parseSeeds(data.seedAccounts);
        return {
          ok: true as const,
          startedAt,
          missing: true as const,
          discover: seeds
            ? discoverJobFrom(data.id, seeds, {
                keywords: "",
                gender: "all",
                city: "",
                genre: "",
              })
            : null,
        };
      }
      const queued = await sql<{ n: number }>`
        select count(*)::int as n from audience_profiles
        where user_id = ${context.userId} and campaign_id = ${data.id}
      `;
      const seeds = parseSeeds(data.seedAccounts ?? String(rows[0].seed_accounts || ""));
      if (Number(queued[0]?.n ?? 0) === 0 && seeds) {
        await sql`
          update campaigns set discover_status = ${"pending"}, discover_error = ${null}
          where id = ${data.id} and user_id = ${context.userId}
        `;
      }
      const started = rows[0].started_at ? String(rows[0].started_at) : startedAt;
      await sql`
        update campaigns
        set status = ${"running"}, started_at = ${started}
        where id = ${data.id} and user_id = ${context.userId}
      `;
      return {
        ok: true as const,
        startedAt: started,
        missing: false as const,
        discover:
          Number(queued[0]?.n ?? 0) === 0 && seeds
            ? discoverJobFrom(data.id, seeds, {
                keywords: String(rows[0].bio_keywords || ""),
                gender: String(rows[0].gender_filter || "all"),
                city: String(rows[0].city || ""),
                genre: String(rows[0].genre || ""),
              })
            : null,
      };
    } catch {
      const seeds = parseSeeds(data.seedAccounts);
      return {
        ok: true as const,
        startedAt,
        missing: true as const,
        discover: seeds
          ? discoverJobFrom(data.id, seeds, { keywords: "", gender: "all", city: "", genre: "" })
          : null,
      };
    }
  });

export const pauseCampaign = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string }) => input)
  .handler(async ({ context, data }) => {
    try {
      const sql = await getSql();
      await sql`
        update campaigns set status = ${"paused"}
        where id = ${data.id} and user_id = ${context.userId} and status = ${"running"}
      `;
    } catch {
      /* local pause still stands */
    }
    return { ok: true as const };
  });

/** Kept so existing pages still compile. Sending is done by Nitefill Sender, not the server. */
export const processSends = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { campaignId?: string } = {}) => input)
  .handler(async ({ context, data }) => {
    try {
      const sql = await getSql();
      const campaigns = data.campaignId
        ? await sql<Record<string, unknown>>`
            select * from campaigns
            where user_id = ${context.userId} and id = ${data.campaignId} and status = ${"running"}
          `
        : await sql<Record<string, unknown>>`
            select * from campaigns
            where user_id = ${context.userId} and status = ${"running"}
          `;
      for (const camp of campaigns) {
        const left = await sql<{ n: number }>`
          select count(*)::int as n from audience_profiles
          where user_id = ${context.userId} and campaign_id = ${String(camp.id)}
            and status in ('queued', 'sending')
        `;
        const total = await sql<{ n: number }>`
          select count(*)::int as n from audience_profiles
          where user_id = ${context.userId} and campaign_id = ${String(camp.id)}
        `;
        if (Number(left[0]?.n ?? 0) <= 0 && Number(total[0]?.n ?? 0) > 0) {
          await sql`
            update campaigns set status = ${"completed"}
            where id = ${String(camp.id)} and user_id = ${context.userId}
          `;
        }
      }
      const sender = await loadSenderStatus(sql, context.userId);
      return { sentNow: 0, senderOnline: sender.online };
    } catch {
      return { sentNow: 0, senderOnline: false };
    }
  });

export const listOutreach = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: { campaignId?: string } = {}) => input)
  .handler(async ({ context, data }) => {
    try {
      const sql = await getSql();
      const rows = data.campaignId
        ? await sql<Record<string, unknown>>`
            select o.*, a.display_name
            from outreach_log o
            left join audience_profiles a on a.id = o.audience_id
            where o.user_id = ${context.userId} and o.campaign_id = ${data.campaignId}
            order by o.sent_at desc
            limit 200
          `
        : await sql<Record<string, unknown>>`
            select o.*, a.display_name
            from outreach_log o
            left join audience_profiles a on a.id = o.audience_id
            where o.user_id = ${context.userId}
            order by o.sent_at desc
            limit 200
          `;
      return rows.map(
        (row): OutreachRow => ({
          id: String(row.id),
          campaignId: String(row.campaign_id),
          audienceId: String(row.audience_id),
          handle: String(row.handle),
          message: String(row.message),
          sentAt: String(row.sent_at),
          replied: Boolean(row.replied),
          repliedAt: row.replied_at ? String(row.replied_at) : null,
          displayName: row.display_name ? String(row.display_name) : undefined,
        }),
      );
    } catch {
      return [];
    }
  });

export const dashboardStats = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const sql = await getSql();
      const campaigns = await sql<{ n: number }>`
        select count(*)::int as n from campaigns where user_id = ${context.userId}
      `;
      const running = await sql<{ n: number }>`
        select count(*)::int as n from campaigns where user_id = ${context.userId} and status = ${"running"}
      `;
      const sent = await sql<{ n: number }>`
        select count(*)::int as n from outreach_log where user_id = ${context.userId}
      `;
      const replied = await sql<{ n: number }>`
        select count(*)::int as n from outreach_log where user_id = ${context.userId} and replied = true
      `;
      const queued = await sql<{ n: number }>`
        select count(*)::int as n from audience_profiles where user_id = ${context.userId} and status in ('queued', 'sending')
      `;
      const sender = await loadSenderStatus(sql, context.userId);
      return {
        campaigns: Number(campaigns[0]?.n ?? 0),
        running: Number(running[0]?.n ?? 0),
        sent: Number(sent[0]?.n ?? 0),
        replied: Number(replied[0]?.n ?? 0),
        queued: Number(queued[0]?.n ?? 0),
        senderOnline: sender.online,
        instagramHandle: sender.instagramHandle,
      };
    } catch {
      return {
        campaigns: 0,
        running: 0,
        sent: 0,
        replied: 0,
        queued: 0,
        senderOnline: false,
        instagramHandle: null as string | null,
      };
    }
  });

export const seedSampleCampaign = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id?: string } = {}) => input)
  .handler(async ({ context, data }) => {
    const id = clientCampaignId(data?.id);
    try {
      const sql = await getSql();
      await sql`
        insert into campaigns (
          id, user_id, name, event_name, venue, city, event_date, genre,
          gender_filter, bio_keywords, seed_accounts, message_template, daily_limit, status,
          discover_status
        ) values (
          ${id}, ${context.userId},
          ${"London rooftop — 14th"},
          ${"a rooftop house night"},
          ${"A small terrace in east London"},
          ${"London"},
          ${"the 14th"},
          ${"house"},
          ${"all"},
          ${"fabric, ministry, rooftop, house"},
          ${"fabriclondon, ministryofsound, boilerroom"},
          ${"I'm putting on a rooftop thing, proper house line-up, smaller room. Reckon it'd be your kind of night?"},
          ${35},
          ${"draft"},
          ${"pending"}
        )
      `;
    } catch {
      /* local sample still launches */
    }
    return { id };
  });
