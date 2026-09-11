/** HMAC pairing tokens. Stable across Vercel lambdas; no database lookup required. */

function secret(): string {
  const auth =
    typeof process !== "undefined" ? process.env.BETTER_AUTH_SECRET?.trim() || "" : "";
  const deploy =
    typeof process !== "undefined" ? process.env.VERCEL_DEPLOYMENT_ID?.trim() || "" : "";
  return `nitefill-ext-v1:${auth || deploy || "local-preview"}`;
}

function b64url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromB64url(text: string): string {
  const pad = text.length % 4 === 0 ? "" : "=".repeat(4 - (text.length % 4));
  const b64 = text.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

async function hmacHex(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let x = 0;
  for (let i = 0; i < a.length; i += 1) x |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return x === 0;
}

/** `nf1.<userId>.<nonce>.<hmac>` — same user + nonce always yields the same token. */
export async function mintSignedToken(userId: string, nonce = "0"): Promise<string> {
  const payload = b64url(userId);
  const sig = (await hmacHex(`${payload}.${nonce}`)).slice(0, 32);
  return `nf1.${payload}.${nonce}.${sig}`;
}

export async function userIdFromSignedToken(token: string): Promise<string | null> {
  const parts = token.trim().split(".");
  if (parts[0] !== "nf1" || parts.length !== 4) return null;
  const [, payload, nonce, sig] = parts;
  if (!payload || !nonce || !sig) return null;
  const expected = (await hmacHex(`${payload}.${nonce}`)).slice(0, 32);
  if (!safeEq(sig, expected)) return null;
  try {
    const id = fromB64url(payload).trim();
    return id || null;
  } catch {
    return null;
  }
}
