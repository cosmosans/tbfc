import { adminSessionCookie, adminSessionExpiry, createAdminSession, passwordMatches, privateJson, type AdminEnv } from '../../lib/adminBackupAuth';

type Statement = { bind(...values: unknown[]): Statement; first<T>(): Promise<T | null> };
type Context = { request: Request; env: AdminEnv & { CLUB_DB?: { prepare(sql: string): Statement } } };

export async function onRequestGet({ request, env }: Context) {
  const expires = await adminSessionExpiry(request, env);
  return privateJson({ authenticated: !!expires, expires });
}

export async function onRequestPost({ request, env }: Context) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return privateJson({ error: 'Request not allowed.' }, 403);
  if (!env.CLUB_ADMIN_KEY || !env.CLUB_DB) return privateJson({ error: 'Admin backup is unavailable.' }, 503);
  if (!request.headers.get('content-type')?.includes('application/json')) return privateJson({ error: 'Invalid request.' }, 400);
  try {
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('admin-backup:' + ip));
    const client = Array.from(new Uint8Array(digest), n => n.toString(16).padStart(2, '0')).join('');
    const window = Math.floor(Date.now() / 900000);
    const attempt = await env.CLUB_DB.prepare(
      'INSERT INTO scrapbook_login_attempts (client, window, attempts) VALUES (?, ?, 1) ON CONFLICT(client) DO UPDATE SET attempts = CASE WHEN window = excluded.window THEN attempts + 1 ELSE 1 END, window = excluded.window RETURNING attempts'
    ).bind(client, window).first<{ attempts: number }>();
    if (!attempt || attempt.attempts > 5) return privateJson({ error: 'Too many attempts. Try again in 15 minutes.' }, 429, { 'retry-after': '900' });
    const raw = await request.text();
    if (raw.length > 2048) return privateJson({ error: 'Invalid secret.' }, 400);
    const body = JSON.parse(raw) as { secret?: unknown };
    if (typeof body.secret !== 'string' || !await passwordMatches(body.secret, env.CLUB_ADMIN_KEY))
      return privateJson({ error: 'Incorrect admin secret.' }, 401);
    const session = await createAdminSession(env.CLUB_ADMIN_KEY);
    return privateJson({ authenticated: true, expires: session.expires }, 200,
      { 'set-cookie': adminSessionCookie(session.token) });
  } catch {
    return privateJson({ error: 'Admin sign-in is unavailable. Please try again later.' }, 503);
  }
}

export async function onRequestDelete({ request }: Context) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return privateJson({ error: 'Request not allowed.' }, 403);
  return privateJson({ authenticated: false }, 200,
    { 'set-cookie': adminSessionCookie('', 0) });
}
