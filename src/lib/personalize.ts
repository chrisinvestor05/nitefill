import type { CatalogProfile } from "@/data/content";

export type ProfileLike = Pick<
  CatalogProfile,
  "displayName" | "handle" | "city" | "bio" | "recentPost" | "genreTags"
> & { firstName?: string };

/** First real Instagram DM the moment SafeSend launches. */
export const FIRST_WAVE = 1;

/** Minimum gap between real Instagram DMs (SafeSend). */
export const SAFESEND_GAP_MS = 40 * 1000;

export function firstNameOf(displayName: string): string {
  return displayName.trim().split(/\s+/)[0] ?? displayName;
}

const OPENERS = [
  (p: ProfileLike, event: string, city: string) =>
    `hey ${firstNameOf(p.displayName)} — ${hook(p)} I'm putting on ${event} in ${city}. Reckon it'd be your kind of night?`,
  (p: ProfileLike, event: string, city: string) =>
    `${firstNameOf(p.displayName)}! ${hook(p)} I've got ${event} running in ${city} — smaller room, same energy. Fancy it?`,
  (p: ProfileLike, event: string, city: string) =>
    `hey ${firstNameOf(p.displayName)}, ${hook(p)} ${event} in ${city} this week. Thought of you because ${reason(p)}. You around?`,
];

function hook(p: ProfileLike): string {
  const post = (p.recentPost || "").trim();
  if (/fabric/i.test(post)) return "that Fabric clip was unreal.";
  if (/ministry/i.test(post)) return "saw you were at Ministry a couple of weeks back.";
  if (/rooftop/i.test(post) || /rooftop/i.test(p.bio)) return "clocked you looking for a proper rooftop.";
  if (post.length > 12) {
    const clipped = post.replace(/\.$/, "");
    return `saw your note: "${clipped.slice(0, 72)}${clipped.length > 72 ? "…" : ""}".`;
  }
  if (p.city) return `noticed you're often out in ${p.city}.`;
  return "noticed you're often out.";
}

function reason(p: ProfileLike): string {
  const g = p.genreTags[0];
  if (g) return `of the ${g}`;
  if (/house/i.test(p.bio)) return "the house lean in your page";
  return "you actually go to nights like this";
}

export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic, profile-aware rewrite used when the xAI key is unavailable. */
export function personalizeTemplate(
  template: string,
  profile: ProfileLike,
  event: string,
  city: string,
): string {
  const first = firstNameOf(profile.displayName);
  const filled = template
    .replaceAll("{name}", first)
    .replaceAll("{city}", profile.city || city)
    .replaceAll("{event}", event)
    .replaceAll("{handle}", profile.handle);

  if (template.includes("{name}") || template.includes("{event}")) {
    return filled.trim();
  }

  const idx = hashString(profile.handle + event) % OPENERS.length;
  if (!template.trim()) {
    return OPENERS[idx]!(profile, event || "a night", city || profile.city || "town");
  }

  const lead = `${first} — `;
  const notice = hook(profile);
  return `${lead}${notice} ${template.trim()}`.replace(/\s+/g, " ").trim();
}

/**
 * How many Instagram DMs should already have gone for this campaign.
 * First one is due at launch; the rest drip every SAFESEND_GAP_MS so it
 * does not look like a blast (and Instagram is less likely to flag it).
 */
export function expectedSends(options: {
  startedAtMs: number;
  nowMs: number;
  dailyLimit: number;
  audienceCount: number;
}): number {
  const { startedAtMs, nowMs, dailyLimit, audienceCount } = options;
  if (nowMs < startedAtMs || dailyLimit <= 0 || audienceCount <= 0) return 0;
  const elapsed = Math.max(0, nowMs - startedAtMs);
  const due = FIRST_WAVE + Math.floor(elapsed / SAFESEND_GAP_MS);
  return Math.max(0, Math.min(audienceCount, dailyLimit, due));
}

export function nextSendAtMs(options: {
  startedAtMs: number;
  nowMs: number;
  dailyLimit: number;
  audienceCount: number;
  alreadySent: number;
}): number | null {
  const target = expectedSends(options);
  if (options.alreadySent >= Math.min(options.audienceCount, options.dailyLimit)) return null;
  if (options.alreadySent < target) return options.nowMs;
  const nextIndex = options.alreadySent; // 0-based due count already out
  const when = options.startedAtMs + Math.max(0, nextIndex - FIRST_WAVE + 1) * SAFESEND_GAP_MS;
  return when;
}
