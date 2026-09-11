import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { expectedSends, nextSendAtMs, personalizeTemplate } from "@/lib/personalize";
import { newId } from "./ids";

const ONLINE_MS = 25_000;

export function mintExtensionToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  let hex = "";
  for (const b of bytes) hex += b.toString(16).padStart(2, "0");
  return `nf_${hex}`;
}

function senderOnline(lastSeen: string | null | undefined): boolean {
  if (!lastSeen) return false;
  return Date.now() - new Date(lastSeen).getTime() < ONLINE_MS;
}

export type SenderStatus = {
  token: string | null;
  tokenHint: string | null;
  online: boolean;
  lastSeen: string | null;
  instagramHandle: string | null;
  instagramConnected: boolean;
};

export async function loadSenderStatus(
  sql: Awaited<ReturnType<typeof getSql>>,
  userId: string,
): Promise<SenderStatus> {
  const rows = await sql<Record<string, unknown>>`
    select extension_token, sender_last_seen, instagram_handle, instagram_connected
    from profiles where user_id = ${userId} limit 1
  `;
  const row = rows[0];
  if (!row) {
    return {
      token: null,
      tokenHint: null,
      online: false,
      lastSeen: null,
      instagramHandle: null,
      instagramConnected: false,
    };
  }
  const token = row.extension_token ? String(row.extension_token) : null;
  return {
    token,
    tokenHint: token ? token.slice(-6) : null,
    online: senderOnline(row.sender_last_seen ? String(row.sender_last_seen) : null),
    lastSeen: row.sender_last_seen ? String(row.sender_last_seen) : null,
    instagramHandle: row.instagram_handle ? String(row.instagram_handle) : null,
    instagramConnected: Boolean(row.instagram_connected),
  };
}

export async function userIdForToken(token: string): Promise<string | null> {
  const trimmed = token.trim();
  if (!trimmed.startsWith("nf_")) return null;
  const sql = await getSql();
  const rows = await sql<{ user_id: string }>`
    select user_id from profiles where extension_token = ${trimmed} limit 1
  `;
  return rows[0]?.user_id ?? null;
}

export const getSenderStatus = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return loadSenderStatus(sql, context.userId);
  });

export const ensureExtensionToken = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const existing = await sql<{ extension_token: string | null }>`
      select extension_token from profiles where user_id = ${context.userId} limit 1
    `;
    if (!existing[0]) throw new Error("Profile not ready");
    if (existing[0].extension_token) {
      return { token: String(existing[0].extension_token) };
    }
    const token = mintExtensionToken();
    await sql`
      update profiles set extension_token = ${token} where user_id = ${context.userId}
    `;
    return { token };
  });

export const rotateExtensionToken = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const token = mintExtensionToken();
    await sql`
      update profiles set extension_token = ${token} where user_id = ${context.userId}
    `;
    return { token };
  });

export type DiscoveredProfile = {
  handle: string;
  displayName: string;
  bio?: string;
  city?: string;
  igPk?: string;
  isPrivate?: boolean;
  recentPost?: string;
};

export async function recordHeartbeat(
  userId: string,
  data: { handle?: string; igPk?: string },
) {
  const sql = await getSql();
  const handle = (data.handle || "").replace(/^@+/, "").trim() || null;
  const pk = data.igPk?.trim() || null;
  const now = new Date().toISOString();
  if (handle) {
    await sql`
      update profiles set
        sender_last_seen = ${now},
        instagram_connected = true,
        instagram_handle = ${handle},
        sender_ig_pk = coalesce(${pk}, sender_ig_pk)
      where user_id = ${userId}
    `;
  } else {
    await sql`
      update profiles set sender_last_seen = ${now}
      where user_id = ${userId}
    `;
  }
  return { ok: true as const, now, handle };
}

async function requeueStale(sql: Awaited<ReturnType<typeof getSql>>, userId: string) {
  const cutoff = new Date(Date.now() - 90_000).toISOString();
  try {
    await sql`
      update audience_profiles
      set status = ${"queued"}, sending_at = ${null}
      where user_id = ${userId}
        and status = ${"sending"}
        and (sending_at is null or sending_at < ${cutoff})
    `;
  } catch {
    await sql`
      update audience_profiles
      set status = ${"queued"}
      where user_id = ${userId} and status = ${"sending"}
    `;
  }
}

export async function pullWork(userId: string) {
  const sql = await getSql();
  await requeueStale(sql, userId);

  const discover = await sql<Record<string, unknown>>`
    select * from campaigns
    where user_id = ${userId} and discover_status = ${"pending"}
    order by created_at asc
    limit 1
  `;
  if (discover[0]) {
    const camp = discover[0];
    await sql`
      update campaigns set discover_status = ${"running"}
      where id = ${String(camp.id)} and user_id = ${userId}
    `;
    return {
      kind: "discover" as const,
      campaignId: String(camp.id),
      seeds: String(camp.seed_accounts || "")
        .split(/[,\s]+/)
        .map((s) => s.replace(/^@+/, "").trim())
        .filter(Boolean),
      keywords: String(camp.bio_keywords || "")
        .split(/[,\s]+/)
        .filter(Boolean),
      gender: String(camp.gender_filter || "all"),
      city: String(camp.city || ""),
      genre: String(camp.genre || ""),
      limit: 50,
    };
  }

  const running = await sql<Record<string, unknown>>`
    select * from campaigns
    where user_id = ${userId} and status = ${"running"}
    order by started_at asc
    limit 8
  `;

  for (const camp of running) {
    const campaignId = String(camp.id);
    const audience = await sql<Record<string, unknown>>`
      select * from audience_profiles
      where user_id = ${userId} and campaign_id = ${campaignId}
      order by match_score desc, created_at asc
    `;
    const queued = audience.filter((a) => a.status === "queued");
    const already = audience.filter((a) => a.status === "sent" || a.status === "replied").length;
    if (queued.length === 0) {
      if (audience.length > 0) {
        await sql`
          update campaigns set status = ${"completed"}
          where id = ${campaignId} and user_id = ${userId}
        `;
      }
      continue;
    }
    const startedAt = camp.started_at ? new Date(String(camp.started_at)).getTime() : Date.now();
    const dailyLimit = Number(camp.daily_limit ?? 35);
    const target = expectedSends({
      startedAtMs: startedAt,
      nowMs: Date.now(),
      dailyLimit,
      audienceCount: audience.length,
    });
    const nextAt = nextSendAtMs({
      startedAtMs: startedAt,
      nowMs: Date.now(),
      dailyLimit,
      audienceCount: audience.length,
      alreadySent: already,
    });
    if (already >= target) {
      return {
        kind: "wait" as const,
        campaignId,
        nextSendAt: nextAt,
        already,
        target,
      };
    }
    const person = queued[0]!;
    const event = String(camp.event_name || camp.name || "a night");
    const city = String(camp.city || "town");
    const stored = String(person.message || "").trim();
    const message =
      stored ||
      personalizeTemplate(
        String(camp.message_template || ""),
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
    if (!stored) {
      await sql`
        update audience_profiles set message = ${message}
        where id = ${String(person.id)} and user_id = ${userId}
      `;
    }
    const now = new Date().toISOString();
    try {
      await sql`
        update audience_profiles
        set status = ${"sending"}, sending_at = ${now}
        where id = ${String(person.id)} and user_id = ${userId} and status = ${"queued"}
      `;
    } catch {
      await sql`
        update audience_profiles
        set status = ${"sending"}
        where id = ${String(person.id)} and user_id = ${userId} and status = ${"queued"}
      `;
    }    return {
      kind: "send" as const,
      campaignId,
      audienceId: String(person.id),
      handle: String(person.handle),
      displayName: String(person.display_name),
      igPk: person.ig_pk ? String(person.ig_pk) : null,
      message,
    };
  }

  return { kind: "idle" as const };
}

export async function ingestDiscovered(
  userId: string,
  campaignId: string,
  profiles: DiscoveredProfile[],
  error?: string,
) {
  const sql = await getSql();
  const camp = await sql<Record<string, unknown>>`
    select * from campaigns where id = ${campaignId} and user_id = ${userId} limit 1
  `;
  if (!camp[0]) throw new Error("Campaign not found");

  if (error) {
    await sql`
      update campaigns
      set discover_status = ${"error"}, discover_error = ${error}
      where id = ${campaignId} and user_id = ${userId}
    `;
    return { added: 0 };
  }

  const keywords = String(camp[0].bio_keywords || "")
    .toLowerCase()
    .split(/[,\s]+/)
    .filter(Boolean);
  const city = String(camp[0].city || "");
  const genre = String(camp[0].genre || "").toLowerCase();
  let added = 0;

  for (const p of profiles) {
    const handle = p.handle.replace(/^@+/, "").trim().toLowerCase();
    if (!handle) continue;
    if (p.isPrivate) continue;
    const bio = (p.bio || "").trim();
    const blob = `${bio} ${p.recentPost || ""} ${p.displayName}`.toLowerCase();
    let score = 60;
    if (keywords.length) {
      const hits = keywords.filter((k) => blob.includes(k)).length;
      if (hits === 0) score -= 8;
      else score += hits * 8;
    }
    if (genre && blob.includes(genre)) score += 12;
    score = Math.max(30, Math.min(99, score));

    const id = newId("aud");
    const name = p.displayName.trim() || handle;
    try {
      await sql`
        insert into audience_profiles (
          id, user_id, campaign_id, handle, display_name, city, gender, bio,
          recent_post, genre_tags, match_score, status, ig_pk, is_private
        ) values (
          ${id}, ${userId}, ${campaignId}, ${handle}, ${name},
          ${p.city || city || null}, ${null}, ${bio || null},
          ${p.recentPost || null}, ${genre || null}, ${score}, ${"queued"},
          ${p.igPk || null}, ${Boolean(p.isPrivate)}
        )
      `;
      added += 1;
    } catch {
      /* unique handle — skip */
    }
  }

  await sql`
    update campaigns
    set discover_status = ${"done"}, discover_error = ${null}
    where id = ${campaignId} and user_id = ${userId}
  `;
  return { added };
}

export async function completeSend(
  userId: string,
  data: {
    audienceId: string;
    campaignId: string;
    ok: boolean;
    error?: string;
    igPk?: string;
  },
) {
  const sql = await getSql();
  const rows = await sql<Record<string, unknown>>`
    select * from audience_profiles
    where id = ${data.audienceId} and user_id = ${userId} and campaign_id = ${data.campaignId}
    limit 1
  `;
  const person = rows[0];
  if (!person) throw new Error("Audience row not found");

  if (!data.ok) {
    await sql`
      update audience_profiles
      set status = ${"failed"}, fail_reason = ${data.error || "Instagram rejected the send"}, sending_at = ${null}
      where id = ${data.audienceId} and user_id = ${userId}
    `;
    return { ok: false as const };
  }

  const message = String(person.message || "");
  const logId = newId("log");
  await sql`
    insert into outreach_log (id, user_id, campaign_id, audience_id, handle, message)
    values (
      ${logId}, ${userId}, ${data.campaignId}, ${data.audienceId},
      ${String(person.handle)}, ${message}
    )
  `;
  await sql`
    update audience_profiles
    set status = ${"sent"}, ig_pk = coalesce(${data.igPk ?? null}, ig_pk), fail_reason = ${null}, sending_at = ${null}
    where id = ${data.audienceId} and user_id = ${userId}
  `;

  const left = await sql<{ n: number }>`
    select count(*)::int as n from audience_profiles
    where user_id = ${userId} and campaign_id = ${data.campaignId} and status in ('queued', 'sending')
  `;
  if (Number(left[0]?.n ?? 0) === 0) {
    await sql`
      update campaigns set status = ${"completed"}
      where id = ${data.campaignId} and user_id = ${userId}
    `;
  }
  return { ok: true as const };
}

export async function ingestInbox(
  userId: string,
  replies: { handle?: string; text?: string }[],
) {
  const sql = await getSql();
  let matched = 0;
  for (const reply of replies) {
    const handle = (reply.handle || "").replace(/^@+/, "").trim().toLowerCase();
    if (!handle) continue;
    const now = new Date().toISOString();
    const logs = await sql<{ id: string }>`
      select id from outreach_log
      where user_id = ${userId} and lower(handle) = ${handle} and replied = false
      order by sent_at desc
      limit 1
    `;
    if (!logs[0]) continue;
    await sql`
      update outreach_log
      set replied = true, replied_at = ${now}
      where id = ${logs[0].id} and user_id = ${userId}
    `;
    await sql`
      update audience_profiles
      set status = ${"replied"}
      where user_id = ${userId} and lower(handle) = ${handle} and status = ${"sent"}
    `;
    matched += 1;
  }
  return { matched };
}

export const queueTestSend = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { handle: string; message?: string }) => input)
  .handler(async ({ context, data }) => {
    const handle = data.handle.replace(/^@+/, "").trim().toLowerCase();
    if (!handle || !/^[a-z0-9._]{1,30}$/.test(handle)) {
      throw new Error("Enter a real Instagram username.");
    }
    const sql = await getSql();
    const sender = await loadSenderStatus(sql, context.userId);
    let camps = await sql<Record<string, unknown>>`
      select * from campaigns
      where user_id = ${context.userId} and name = ${"Direct test"}
      order by created_at desc
      limit 1
    `;
    let campaignId = camps[0] ? String(camps[0].id) : "";
    if (!campaignId) {
      campaignId = newId("cmp");
      const startedAt = new Date().toISOString();
      await sql`
        insert into campaigns (
          id, user_id, name, event_name, city, message_template, daily_limit, status, started_at, seed_accounts
        ) values (
          ${campaignId}, ${context.userId}, ${"Direct test"}, ${"a test invite"}, ${""},
          ${""}, ${35}, ${"running"}, ${startedAt}, ${handle}
        )
      `;
    } else {
      await sql`
        update campaigns set status = ${"running"}, started_at = coalesce(started_at, ${new Date().toISOString()})
        where id = ${campaignId} and user_id = ${context.userId}
      `;
    }
    const existing = await sql<{ id: string; status: string }>`
      select id, status from audience_profiles
      where user_id = ${context.userId} and campaign_id = ${campaignId} and handle = ${handle}
      limit 1
    `;
    const message =
      (data.message || "").trim() ||
      `hey — testing Nitefill from my account. if you got this, the sender is live.`;
    if (existing[0]) {
      await sql`
        update audience_profiles
        set status = ${"queued"}, message = ${message}, fail_reason = ${null}, sending_at = ${null}
        where id = ${existing[0].id} and user_id = ${context.userId}
      `;
    } else {
      const id = newId("aud");
      await sql`
        insert into audience_profiles (
          id, user_id, campaign_id, handle, display_name, match_score, status, message
        ) values (
          ${id}, ${context.userId}, ${campaignId}, ${handle}, ${handle}, ${99}, ${"queued"}, ${message}
        )
      `;
    }
    return {
      campaignId,
      handle,
      senderOnline: sender.online,
      message: sender.online
        ? `Queued. Keep instagram.com open — Sender will DM @${handle} from your account.`
        : `Queued. Install Nitefill Sender, open Instagram, then this DM goes out as you.`,
    };
  });
