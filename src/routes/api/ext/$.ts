import { createFileRoute } from "@tanstack/react-router";
import {
  completeSend,
  ingestDiscovered,
  ingestInbox,
  pullWork,
  recordHeartbeat,
  userIdForToken,
  type DiscoveredProfile,
} from "@/lib/server/sender";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

function bearer(request: Request): string | null {
  const header = request.headers.get("authorization") || "";
  const m = header.match(/^Bearer\s+(.+)$/i);
  return m?.[1]?.trim() || null;
}

async function requireUser(request: Request): Promise<string | Response> {
  const token = bearer(request);
  if (!token) return json({ error: "Missing pairing token" }, 401);
  const userId = await userIdForToken(token);
  if (!userId) return json({ error: "Invalid pairing token" }, 401);
  return userId;
}

async function handle(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/ext\/?/, "").replace(/\/$/, "") || "index";

  const auth = await requireUser(request);
  if (auth instanceof Response) return auth;
  const userId = auth;

  try {
    if (path === "heartbeat" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as { handle?: string; igPk?: string };
      const res = await recordHeartbeat(userId, body);
      return json(res);
    }

    if (path === "work" && request.method === "GET") {
      const work = await pullWork(userId);
      return json(work);
    }

    if (path === "discover" && request.method === "POST") {
      const body = (await request.json()) as {
        campaignId: string;
        profiles?: DiscoveredProfile[];
        error?: string;
      };
      if (!body.campaignId) return json({ error: "campaignId required" }, 400);
      const res = await ingestDiscovered(userId, body.campaignId, body.profiles || [], body.error);
      return json(res);
    }

    if (path === "sent" && request.method === "POST") {
      const body = (await request.json()) as {
        audienceId: string;
        campaignId: string;
        ok: boolean;
        error?: string;
        igPk?: string;
      };
      if (!body.audienceId || !body.campaignId) return json({ error: "ids required" }, 400);
      const res = await completeSend(userId, body);
      return json(res);
    }

    if (path === "inbox" && request.method === "POST") {
      const body = (await request.json()) as { replies?: { handle?: string; text?: string }[] };
      const res = await ingestInbox(userId, body.replies || []);
      return json(res);
    }

    return json({ error: `Unknown extension route: ${path}` }, 404);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Extension API failed";
    return json({ error: message }, 500);
  }
}

export const Route = createFileRoute("/api/ext/$")({
  server: {
    handlers: {
      GET: ({ request }) => handle(request),
      POST: ({ request }) => handle(request),
      OPTIONS: ({ request }) => handle(request),
    },
  },
});
