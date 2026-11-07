import { createSession, passwordMatches, privateJson, sessionCookie, sessionExpiry, type AuthEnv } from "../lib/scrapbookAuth";
type Statement = { bind(...values: unknown[]): Statement; first<T>(): Promise<T | null>; run(): Promise<unknown> };
type Context = { request: Request; env: AuthEnv & { CLUB_DB?: { prepare(sql: string): Statement } } };

export async function onRequestGet({ request, env }: Context) {
  const expires = await sessionExpiry(request, env);
  if (!expires) return privateJson({ error: "Unlock the scrapbook to view chats." }, 401);
  if (!env.CLUB_DB) return privateJson({ error: "Scrapbook is unavailable." }, 503);
  const matchId = new URL(request.url).searchParams.get("match");
  if (!matchId) return privateJson({ unlocked: true, expires });
  const row = await env.CLUB_DB.prepare("SELECT payload FROM club_records WHERE collection = 'matches' AND record_id = ?").bind(matchId).first<{ payload: string }>();
  if (!row) return privateJson({ error: "Match not found." }, 404);
  return privateJson({ messages: JSON.parse(row.payload).chat ?? [], expires });
}
export async function onRequestPost({ request, env }: Context) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return privateJson({ error: "Request not allowed." }, 403);
  if (!env.SCRAPBOOK_PASSWORD || !env.CLUB_DB) return privateJson({ error: "Scrapbook access has not been configured yet." }, 503);
  if (!request.headers.get("content-type")?.includes("application/json")) return privateJson({ error: "Invalid request." }, 400);
  try {
    // Atomic per-IP, fixed-window limit; persisted across server instances.
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
    const client = Array.from(new Uint8Array(digest), n => n.toString(16).padStart(2, "0")).join("");
    const window = Math.floor(Date.now() / 900000);
    const row = await env.CLUB_DB.prepare(
      "INSERT INTO scrapbook_login_attempts (client, window, attempts) VALUES (?, ?, 1) ON CONFLICT(client) DO UPDATE SET attempts = CASE WHEN window = excluded.window THEN attempts + 1 ELSE 1 END, window = excluded.window RETURNING attempts"
    ).bind(client, window).first<{ attempts: number }>();
    if (!row || row.attempts > 10) return privateJson({ error: "Too many attempts. Try again in 15 minutes." }, 429, { "retry-after": "900" });
    await env.CLUB_DB.prepare("DELETE FROM scrapbook_login_attempts WHERE window < ?").bind(window - 1).run();
    const raw = await request.text();
    if (raw.length > 2048) return privateJson({ error: "Invalid password." }, 400);
    const body = JSON.parse(raw) as { password?: unknown };
    if (typeof body.password !== "string" || !await passwordMatches(body.password, env.SCRAPBOOK_PASSWORD))
      return privateJson({ error: "Incorrect password." }, 401);
    const session = await createSession(env.SCRAPBOOK_PASSWORD);
    return privateJson({ unlocked: true, expires: session.expires }, 200, { "set-cookie": sessionCookie(session.token) });
  } catch {
    return privateJson({ error: "Scrapbook sign-in is unavailable. Please try again later." }, 503);
  }
}
export async function onRequestDelete({ request }: Context) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return privateJson({ error: "Request not allowed." }, 403);
  return privateJson({ unlocked: false }, 200, { "set-cookie": sessionCookie("", 0) });
}
