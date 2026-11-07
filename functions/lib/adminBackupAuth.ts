import { passwordMatches, privateJson } from './scrapbookAuth';

export { passwordMatches, privateJson };
export type AdminEnv = { CLUB_ADMIN_KEY?: string };
const cookieName = '__Host-tbfc-admin-backup';
const sessionSeconds = 4 * 60 * 60;
const encoder = new TextEncoder();

async function signingKey(secret: string) {
  return crypto.subtle.importKey('raw', encoder.encode('tbfc-admin-backup-session:' + secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

function hex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function createAdminSession(secret: string) {
  const expires = Math.floor(Date.now() / 1000) + sessionSeconds;
  const payload = expires + '.' + crypto.randomUUID();
  const signature = hex(await crypto.subtle.sign('HMAC', await signingKey(secret), encoder.encode(payload)));
  return { token: payload + '.' + signature, expires };
}

export function adminSessionCookie(token: string, maxAge = sessionSeconds) {
  return `${cookieName}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

export async function adminSessionExpiry(request: Request, env: AdminEnv): Promise<number | null> {
  if (!env.CLUB_ADMIN_KEY) return null;
  const token = request.headers.get('cookie')?.split(';').map(value => value.trim())
    .find(value => value.startsWith(cookieName + '='))?.slice(cookieName.length + 1);
  if (!token || token.length > 200) return null;
  const [expiration, nonce, signature, extra] = token.split('.');
  const expires = Number(expiration);
  if (extra || !nonce || !/^[a-f0-9]{64}$/.test(signature ?? '') ||
      !Number.isSafeInteger(expires) || expires <= Date.now() / 1000 ||
      expires > Date.now() / 1000 + sessionSeconds + 60) return null;
  const bytes = Uint8Array.from(signature.match(/../g)!, value => parseInt(value, 16));
  const valid = await crypto.subtle.verify('HMAC', await signingKey(env.CLUB_ADMIN_KEY),
    bytes, encoder.encode(expiration + '.' + nonce));
  return valid ? expires : null;
}
