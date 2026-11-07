export type AuthEnv = { SCRAPBOOK_PASSWORD?: string; CLUB_ADMIN_KEY?: string };
export const sessionSeconds = 30 * 24 * 60 * 60;
const cookieName = "__Host-tbfc-scrapbook";
const encoder = new TextEncoder();
export const privateJson = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: {
    "content-type": "application/json", "cache-control": "private, no-store",
    "vary": "Cookie", "x-content-type-options": "nosniff", ...headers,
  } });
export function isAdmin(request: Request, env: AuthEnv) {
  return !!env.CLUB_ADMIN_KEY && request.headers.get("x-club-admin-key") === env.CLUB_ADMIN_KEY;
}
async function signingKey(password: string) {
  return crypto.subtle.importKey("raw", encoder.encode("tbfc-scrapbook-session:" + password),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}
function hex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, "0")).join("");
}
export async function passwordMatches(input: string, expected: string) {
  const a = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(input)));
  const b = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(expected)));
  let difference = 0;
  for (let i = 0; i < a.length; i++) difference |= a[i] ^ b[i];
  return difference === 0;
}
export async function createSession(password: string) {
  const expires = Math.floor(Date.now() / 1000) + sessionSeconds;
  const payload = expires + "." + crypto.randomUUID();
  const signature = hex(await crypto.subtle.sign("HMAC", await signingKey(password), encoder.encode(payload)));
  return { token: payload + "." + signature, expires };
}
export function sessionCookie(token: string, maxAge = sessionSeconds) {
  return cookieName + "=" + token + "; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=" + maxAge;
}
export async function sessionExpiry(request: Request, env: AuthEnv): Promise<number | null> {
  if (!env.SCRAPBOOK_PASSWORD) return null;
  const token = request.headers.get("cookie")?.split(";").map(value => value.trim())
    .find(value => value.startsWith(cookieName + "="))?.slice(cookieName.length + 1);
  if (!token || token.length > 200) return null;
  const [expiration, nonce, signature, extra] = token.split(".");
  const expires = Number(expiration);
  if (extra || !nonce || !/^[a-f0-9]{64}$/.test(signature ?? "") ||
      !Number.isSafeInteger(expires) || expires <= Date.now() / 1000 ||
      expires > Date.now() / 1000 + sessionSeconds + 60) return null;
  const bytes = Uint8Array.from(signature.match(/../g)!, value => parseInt(value, 16));
  const valid = await crypto.subtle.verify("HMAC", await signingKey(env.SCRAPBOOK_PASSWORD),
    bytes, encoder.encode(expiration + "." + nonce));
  return valid ? expires : null;
}
