import { adminSessionExpiry, type AdminEnv } from '../../lib/adminBackupAuth';

type Statement = { all<T>(): Promise<{ results: T[] }> };
type Context = { request: Request; env: AdminEnv & { CLUB_DB?: { prepare(sql: string): Statement } } };
type RecordRow = { collection: string; payload: string };
const collections = ['matches', 'players', 'opponents', 'seasons', 'locations', 'events', 'lineups', 'boards', 'standings'] as const;

export async function onRequestGet({ request, env }: Context) {
  if (!await adminSessionExpiry(request, env)) return new Response('Admin sign-in required.', { status: 401, headers: { 'cache-control': 'private, no-store' } });
  if (!env.CLUB_DB) return new Response('Database is unavailable.', { status: 503, headers: { 'cache-control': 'private, no-store' } });
  try {
    const rows = await env.CLUB_DB.prepare('SELECT collection, payload FROM club_records').all<RecordRow>();
    const data: Record<string, unknown[]> = Object.fromEntries(collections.map(name => [name, []]));
    for (const row of rows.results) {
      if (Object.hasOwn(data, row.collection)) data[row.collection].push(JSON.parse(row.payload));
    }
    const date = new Date().toISOString().slice(0, 10);
    return new Response(JSON.stringify(data, null, 2), { headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition': `attachment; filename="tbfc-production-backup-${date}.json"`,
      'cache-control': 'private, no-store',
      'vary': 'Cookie',
      'x-content-type-options': 'nosniff',
    } });
  } catch {
    return new Response('Could not prepare backup.', { status: 500, headers: { 'cache-control': 'private, no-store' } });
  }
}
