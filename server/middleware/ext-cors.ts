const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

interface Event {
  url: URL;
  req: { method: string; headers: Headers };
}

export default async function extCorsMiddleware(
  event: Event,
  next: () => unknown | Promise<unknown>,
): Promise<unknown> {
  if (!event.url.pathname.startsWith("/api/ext")) return next();
  const method = (event.req.method ?? "GET").toUpperCase();
  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }
  const result = await next();
  if (result instanceof Response) {
    const headers = new Headers(result.headers);
    for (const [k, v] of Object.entries(CORS)) headers.set(k, v);
    return new Response(result.body, {
      status: result.status,
      statusText: result.statusText,
      headers,
    });
  }
  return result;
}
