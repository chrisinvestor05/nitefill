import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { personalizeTemplate, type ProfileLike } from "@/lib/personalize";

export const rewriteInvite = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      template: string;
      event: string;
      city: string;
      profile: ProfileLike;
    }) => input,
  )
  .handler(async ({ data }) => {
    const fallback = personalizeTemplate(
      data.template,
      data.profile,
      data.event,
      data.city,
    );
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return { ok: true as const, text: fallback, source: "template" as const };
    }

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 180,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content:
              "You write short Instagram DMs for nightlife invites. One message, 2–4 sentences, lowercase-friendly, no emoji, no link, no hashtags, no sales language. Mention one real public detail from the person's profile. End with a question. Return only the message.",
          },
          {
            role: "user",
            content: [
              `Event: ${data.event}`,
              `City: ${data.city}`,
              `Source message: ${data.template || "(none — invent a warm invite)"}`,
              `Person: ${data.profile.displayName} (@${data.profile.handle})`,
              `Their city: ${data.profile.city}`,
              `Bio: ${data.profile.bio}`,
              `Recent public post: ${data.profile.recentPost}`,
              `Genres: ${data.profile.genreTags.join(", ")}`,
            ].join("\n"),
          },
        ],
      }),
    });
    if (!res.ok) {
      return { ok: true as const, text: fallback, source: "template" as const };
    }
    const body = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = body.choices?.[0]?.message?.content?.trim();
    if (!text) return { ok: true as const, text: fallback, source: "template" as const };
    return { ok: true as const, text, source: "ai" as const };
  });
