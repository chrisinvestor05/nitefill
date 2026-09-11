import { createHash } from "node:crypto";

/**
 * Shared LIVE-PREVIEW OAuth client (server-only — NEVER import from the client).
 *
 * The sandbox serves each live preview on a dynamic `https://*.grok-sandbox.com`
 * URL, which can't be pre-registered per app. The broker instead exposes ONE
 * shared "preview" client that accepts any
 * `https://*.grok-sandbox.com/api/auth/oauth2/callback/*`
 * (broker: `app-builder-deployer/auth/src/preview-oauth.ts`). Baking it here lets
 * the live preview do REAL sign-in — no demo/mock users — with no platform
 * injection. When deployed the deployer injects a per-app
 * `GROK_AUTH_*` that overrides these (see `server.ts`).
 *
 * These MUST equal the broker's `GROK_PREVIEW_CLIENT_ID` /
 * `GROK_PREVIEW_CLIENT_SECRET` (set in the broker's Vercel env; the broker stores
 * only the secret's `base64url(SHA-256)` hash). This is a dedicated, low-privilege
 * client (preview-only, `*.grok-sandbox.com`) — rotate it by regenerating the
 * broker env var and this constant together.
 */
export const PREVIEW_CLIENT_ID = "grok_preview";
export const PREVIEW_CLIENT_SECRET =
  "8bcdb7fc5a33874ad933ca568918d5790388a0795e44c4d1dea691f801b17ec5";

/** The shared auth broker issuer (OIDC discovery lives under it). */
export const GROK_ISSUER_DEFAULT = "https://auth.grok.me";

/**
 * Host patterns whose callbacks the preview client accepts. Better Auth derives
 * the live preview's real origin from the request host and validates it against
 * this list (wildcard-matched), so the OAuth `redirect_uri` becomes the concrete
 * `https://<preview-host>/api/auth/oauth2/callback/...` the broker allows.
 *
 * `*.vercel.app` is included so a public Vercel host (no BETTER_AUTH_URL inject)
 * can still derive its origin for email/password. The shared Grok preview OAuth
 * client still only accepts `*.grok-sandbox.com` callbacks.
 */
export const PREVIEW_ALLOWED_HOSTS = [
  "*.grok-sandbox.com",
  "*.vercel.app",
] as const;

/**
 * Stable Better Auth signing secret on Vercel when BETTER_AUTH_SECRET is unset.
 * `previewAuthSecret()` is random per process — serverless instances would
 * otherwise fail to decrypt the Google OAuth state cookie on callback.
 */
export function deployedAuthSecret(): string | undefined {
  const deploymentId = process.env.VERCEL_DEPLOYMENT_ID?.trim();
  if (!deploymentId) return undefined;
  return createHash("sha256")
    .update(`nitefill:${PREVIEW_CLIENT_SECRET}:${deploymentId}`)
    .digest("hex");
}
