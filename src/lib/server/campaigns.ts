import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { AUDIENCE_CATALOG } from "@/data/content";
import {
  expectedSends,
  personalizeTemplate,
  shouldSimulateReply,
} from "@/lib/personalize";
import { newId } from "./ids";

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
  messageTemplate: string;
  dailyLimit: number;
  status: string;
  startedAt: string | null;
  createdAt: string;
  queued: number;
  sent: number;
  replied: number;
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
  counts: { queued: number; sent: number; replied: number },
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
    messageTemplate: String(row.message_template ?? ""),
    dailyLimit: Number(row.daily_limit ?? 35),
    status: String(row.status),
    startedAt: row.started_at ? String(row.started_at) : null,
    createdAt: String(row.created_at),
    queued: counts.queued,
    sent: counts.sent,
    replied: counts.replied,
  };
}

async function countsFor(sql: Awaited<ReturnType<typeof getSql>>, userId: string, campaignId: string) {
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
  return {
    queued: Number(map.queued ?? 0),
    sent: Number(map.sent ?? 0) + Number(map.replied ?? 0),
    replied: Number(replied[0]?.n ?? 0),
  };
}

async function fillCatalogAudience(
  sql: Awaited<ReturnType<typeof getSql>>,
  userId: string,
  campaignId: string,
  opts: { city?: string; gender?: string; genre?: string; keywords?: string; limit?: number },
) {
  const city = (opts.city || "").toLowerCase();
  const gender = (opts.gender || "all").toLowerCase();
  const genre = (opts.genre || "").toLowerCase();
  const keywords = (opts.keywords || "")
    .toLowerCase()
    .split(/[, ]+/)
    .filter(Boolean);
  const limit = Math.min(80, Math.max(8, opts.limit ?? 40));

  const scored = AUDIENCE_CATALOG.map((p) => {
    let score = 55;
    if (city && p.city.toLowerCase() === city) score += 22;
    else if (city && p.city.toLowerCase().includes(city)) score += 10;
    if (gender === "male" || gender === "female") {
      if (p.gender === gender) score += 10;
      else score -= 25;
    }
    if (genre && p.genreTags.some((g) => g.includes(genre) || genre.includes(g))) score += 12;
    const blob = `${p.bio} ${p.recentPost} ${p.genreTags.join(" ")}`.toLowerCase();
    for (const k of keywords) if (blob.includes(k)) score += 6;
    return { p, score: Math.max(20, Math.min(99, score)) };
  })
    .filter((x) => x.score >= 50)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  await sql`
    delete from audience_profiles
    where user_id = ${userId} and campaign_id = ${campaignId} and status = 'queued'
  `;

  for (const { p, score } of scored) {
    const id = newId("aud");
    await sql`
      insert into audience_profiles (
        id, user_id, campaign_id, handle, display_name, city, gender, bio,
        recent_post, genre_tags, match_score, status
      ) values (
        ${id}, ${userId}, ${campaignId}, ${p.handle}, ${p.displayName},
        ${p.city}, ${p.gender}, ${p.bio}, ${p.recentPost}, ${p.genreTags.join(", ")},
        ${score}, ${"queued"}
      )
    `;
  }
  return scored.length;
}

export const listCampaigns = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<Record<string, unknown>>`
      select * from campaigns where user_id = ${context.userId} order by created_at desc
    `;
    const out: Campaign[] = [];
    for (const row of rows) {
      const c = await countsFor(sql, context.userId, String(row.id));
      out.push(campaignFrom(row, c));
    }
    return out;
  });

export const getCampaign = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: { id: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<Record<string, unknown>>`
      select * from campaigns where id = ${data.id} and user_id = ${context.userId} limit 1
    `;
    if (!rows[0]) return null;
    const c = await countsFor(sql, context.userId, data.id);
    return campaignFrom(rows[0], c);
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
      messageTemplate?: string;
      dailyLimit?: number;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const id = newId("cmp");
    const daily = Math.min(100, Math.max(10, Math.round(data.dailyLimit ?? 35)));
    const name = data.name.trim() || "Untitled campaign";
    const city = data.city.trim() || "London";
    await sql`
      insert into campaigns (
        id, user_id, name, event_name, venue, city, event_date, genre,
        gender_filter, bio_keywords, message_template, daily_limit, status
      ) values (
        ${id}, ${context.userId}, ${name}, ${data.eventName ?? null}, ${data.venue ?? null},
        ${city}, ${data.eventDate ?? null}, ${data.genre ?? null},
        ${data.genderFilter ?? "all"}, ${data.bioKeywords ?? null},
        ${data.messageTemplate ?? ""}, ${daily}, ${"draft"}
      )
    `;
    const rows = await sql<Record<string, unknown>>`
      select * from campaigns where id = ${id} and user_id = ${context.userId} limit 1
    `;
    return campaignFrom(rows[0]!, { queued: 0, sent: 0, replied: 0 });
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
      messageTemplate?: string;
      dailyLimit?: number;
      status?: string;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const existing = await sql<Record<string, unknown>>`
      select * from campaigns where id = ${data.id} and user_id = ${context.userId} limit 1
    `;
    if (!existing[0]) throw new Error("Campaign not found");
    const daily =
      typeof data.dailyLimit === "number"
        ? Math.min(100, Math.max(10, Math.round(data.dailyLimit)))
        : null;
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
        message_template = coalesce(${data.messageTemplate ?? null}, message_template),
        daily_limit = coalesce(${daily}, daily_limit),
        status = coalesce(${data.status ?? null}, status)
      where id = ${data.id} and user_id = ${context.userId}
    `;
    const rows = await sql<Record<string, unknown>>`
      select * from campaigns where id = ${data.id} and user_id = ${context.userId} limit 1
    `;
    const c = await countsFor(sql, context.userId, data.id);
    return campaignFrom(rows[0]!, c);
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
      limit?: number;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const campaign = await sql<Record<string, unknown>>`
      select * from campaigns where id = ${data.campaignId} and user_id = ${context.userId} limit 1
    `;
    if (!campaign[0]) throw new Error("Campaign not found");

    const added = await fillCatalogAudience(sql, context.userId, data.campaignId, {
      city: data.city || String(campaign[0].city || ""),
      gender: data.gender || String(campaign[0].gender_filter || "all"),
      genre: data.genre || String(campaign[0].genre || ""),
      keywords: data.keywords || String(campaign[0].bio_keywords || ""),
      limit: data.limit,
    });

    if (data.city || data.gender || data.genre || data.keywords) {
      await sql`
        update campaigns set
          city = coalesce(${data.city ?? null}, city),
          gender_filter = coalesce(${data.gender ?? null}, gender_filter),
          genre = coalesce(${data.genre ?? null}, genre),
          bio_keywords = coalesce(${data.keywords ?? null}, bio_keywords)
        where id = ${data.campaignId} and user_id = ${context.userId}
      `;
    }

    return { added };
  });

export const listAudience = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: { campaignId?: string }) => input)
  .handler(async ({ context, data }) => {
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
      }),
    );
  });

export const startCampaign = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<Record<string, unknown>>`
      select * from campaigns where id = ${data.id} and user_id = ${context.userId} limit 1
    `;
    if (!rows[0]) throw new Error("Campaign not found");
    const queued = await sql<{ n: number }>`
      select count(*)::int as n from audience_profiles
      where user_id = ${context.userId} and campaign_id = ${data.id}
    `;
    if (Number(queued[0]?.n ?? 0) === 0) {
      throw new Error("Discover an audience before launching.");
    }
    const startedAt = rows[0].started_at ? String(rows[0].started_at) : new Date().toISOString();
    await sql`
      update campaigns
      set status = ${"running"}, started_at = ${startedAt}
      where id = ${data.id} and user_id = ${context.userId}
    `;
    return { ok: true as const, startedAt };
  });

export const pauseCampaign = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      update campaigns set status = ${"paused"}
      where id = ${data.id} and user_id = ${context.userId} and status = ${"running"}
    `;
    return { ok: true as const };
  });

export const processSends = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { campaignId?: string } = {}) => input)
  .handler(async ({ context, data }) => {
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

    let sentNow = 0;
    for (const camp of campaigns) {
      const campaignId = String(camp.id);
      const audience = await sql<Record<string, unknown>>`
        select * from audience_profiles
        where user_id = ${context.userId} and campaign_id = ${campaignId}
        order by match_score desc, created_at asc
      `;
      const already = audience.filter((a) => a.status === "sent" || a.status === "replied");
      const queued = audience.filter((a) => a.status === "queued");
      const startedAt = camp.started_at ? new Date(String(camp.started_at)).getTime() : Date.now();
      const target = expectedSends({
        startedAtMs: startedAt,
        nowMs: Date.now(),
        dailyLimit: Number(camp.daily_limit ?? 35),
        audienceCount: audience.length,
      });
      const need = Math.max(0, target - already.length);
      const batch = queued.slice(0, Math.min(need, 8));
      const event = String(camp.event_name || camp.name || "a night");
      const city = String(camp.city || "town");
      const template = String(camp.message_template || "");

      for (const person of batch) {
        const message = personalizeTemplate(
          template,
          {
            displayName: String(person.display_name),
            handle: String(person.handle),
            city: String(person.city || city),
            bio: String(person.bio || ""),
            recentPost: String(person.recent_post || ""),
            genreTags: String(person.genre_tags || "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          },
          event,
          city,
        );
        const logId = newId("log");
        const audId = String(person.id);
        const handle = String(person.handle);
        await sql`
          insert into outreach_log (
            id, user_id, campaign_id, audience_id, handle, message
          ) values (
            ${logId}, ${context.userId}, ${campaignId}, ${audId}, ${handle}, ${message}
          )
        `;
        await sql`
          update audience_profiles set status = ${"sent"}
          where id = ${audId} and user_id = ${context.userId}
        `;
        sentNow += 1;
      }

      const remaining = queued.length - batch.length;
      if (remaining <= 0 && audience.length > 0) {
        await sql`
          update campaigns set status = ${"completed"}
          where id = ${campaignId} and user_id = ${context.userId}
        `;
      }

      const logs = await sql<Record<string, unknown>>`
        select * from outreach_log
        where user_id = ${context.userId} and campaign_id = ${campaignId} and replied = false
      `;
      for (const log of logs) {
        const sentAt = new Date(String(log.sent_at)).getTime();
        if (Date.now() - sentAt < 90 * 60 * 1000) continue;
        if (!shouldSimulateReply(String(log.handle), campaignId)) continue;
        const when = new Date(sentAt + 2 * 60 * 60 * 1000).toISOString();
        await sql`
          update outreach_log
          set replied = true, replied_at = ${when}
          where id = ${String(log.id)} and user_id = ${context.userId}
        `;
        await sql`
          update audience_profiles set status = ${"replied"}
          where id = ${String(log.audience_id)} and user_id = ${context.userId}
        `;
      }
    }
    return { sentNow };
  });

export const listOutreach = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: { campaignId?: string } = {}) => input)
  .handler(async ({ context, data }) => {
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
  });

export const dashboardStats = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
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
      select count(*)::int as n from audience_profiles where user_id = ${context.userId} and status = ${"queued"}
    `;
    return {
      campaigns: Number(campaigns[0]?.n ?? 0),
      running: Number(running[0]?.n ?? 0),
      sent: Number(sent[0]?.n ?? 0),
      replied: Number(replied[0]?.n ?? 0),
      queued: Number(queued[0]?.n ?? 0),
    };
  });

export const seedSampleCampaign = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const id = newId("cmp");
    await sql`
      insert into campaigns (
        id, user_id, name, event_name, venue, city, event_date, genre,
        gender_filter, bio_keywords, message_template, daily_limit, status
      ) values (
        ${id}, ${context.userId},
        ${"London rooftop — 14th"},
        ${"a rooftop house night"},
        ${"A small terrace in east London"},
        ${"London"},
        ${"the 14th"},
        ${"house"},
        ${"all"},
        ${"fabric, ministry, rooftop"},
        ${"I'm putting on a rooftop thing, proper house line-up, smaller room. Reckon it'd be your kind of night?"},
        ${35},
        ${"draft"}
      )
    `;
    await fillCatalogAudience(sql, context.userId, id, {
      city: "London",
      gender: "all",
      genre: "house",
      keywords: "fabric, ministry, rooftop",
    });
    return { id };
  });
