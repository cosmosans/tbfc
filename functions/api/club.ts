import { isAdmin } from "../lib/scrapbookAuth";
import { adminSessionExpiry } from "../lib/adminBackupAuth";
type Statement = {
  bind(...values: unknown[]): Statement;
  all<T>(): Promise<{ results: T[] }>;
  first<T>(): Promise<T | null>;
};
type Database = {
  prepare(query: string): Statement;
  batch(statements: Statement[]): Promise<unknown>;
};
type Env = { CLUB_DB?: Database; CLUB_ADMIN_KEY?: string };
type Context = { request: Request; env: Env };
type RecordRow = { collection: string; record_id: string; payload: string };
type MetaRow = { revision: number; updated_at: string };

const collections = ['matches', 'players', 'opponents', 'seasons', 'locations', 'events', 'lineups', 'boards', 'standings'] as const;
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});

function validData(value: unknown): value is Record<(typeof collections)[number], Array<Record<string, unknown>>> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const data = value as Record<string, unknown>;
  return collections.every(collection => Array.isArray(data[collection]) &&
    (data[collection] as unknown[]).every(item => item && typeof item === 'object' && !Array.isArray(item) &&
      typeof (item as Record<string, unknown>)[collection === 'lineups' || collection === 'boards' ? 'matchId' : collection === 'standings' ? 'seasonId' : 'id'] === 'string'));
}

function recordId(collection: string, item: Record<string, unknown>): string {
  return String(item[collection === 'lineups' || collection === 'boards' ? 'matchId' : collection === 'standings' ? 'seasonId' : 'id']);
}

async function current(db: Database) {
  const meta = await db.prepare('SELECT revision, updated_at FROM club_meta WHERE id = 1').first<MetaRow>();
  return meta ?? { revision: 0, updated_at: '' };
}

export async function onRequestGet({ request, env }: Context): Promise<Response> {
  if (!env.CLUB_DB) return json({ error: 'Database is not connected.' }, 503);
  try {
    const headerAdmin = isAdmin(request, env);
    const sessionAdmin = !!await adminSessionExpiry(request, env);
    const meta = await current(env.CLUB_DB);
    const access = headerAdmin ? 'header' : sessionAdmin ? 'session' : 'public';
    const metadata = { revision: meta.revision, updatedAt: meta.updated_at, supportsIncremental: true, admin: headerAdmin || sessionAdmin, access };
    if (meta.revision === 0) return json({ ...metadata, data: null });
    const params = new URL(request.url).searchParams;
    if (params.get('view') === 'manifest') {
      if (!headerAdmin && params.get('revision') === String(meta.revision) && params.get('access') === access) {
        return json({ ...metadata, unchanged: true });
      }
      // Plan by stored bytes: a single crest or photo can exceed the size of hundreds of matches.
      const sizes = await env.CLUB_DB.prepare('SELECT rowid AS id, length(CAST(payload AS BLOB)) AS bytes FROM club_records ORDER BY rowid').all<{ id: number; bytes: number }>();
      const pages: { start: number; end: number }[] = [];
      let bytes = 0;
      for (const row of sizes.results) {
        if (!pages.length || bytes + row.bytes > 768 * 1024) {
          pages.push({ start: row.id, end: row.id });
          bytes = 0;
        }
        pages[pages.length - 1].end = row.id;
        bytes += row.bytes;
      }
      return json({ ...metadata, pages });
    }
    const paged = params.get('view') === 'page';
    if (paged && (params.get('revision') !== String(meta.revision) || params.get('access') !== access)) {
      return json({ error: 'Club data changed during loading.' }, 409);
    }
    // Redact private match fields in D1. Other payloads are already JSON and can be returned verbatim.
    const payload = headerAdmin ? 'payload' : `CASE WHEN collection = 'matches' THEN json_remove(payload, '$.chat'${sessionAdmin ? '' : ", '$.matchAuditComplete'"}) ELSE payload END`;
    const sql = `SELECT collection, ${payload} AS payload FROM club_records`;
    let statement = env.CLUB_DB.prepare(sql);
    if (paged) {
      const start = Number(params.get('start'));
      const end = Number(params.get('end'));
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start <= 0 || end < start) return json({ error: 'Invalid page.' }, 400);
      statement = env.CLUB_DB.prepare(sql + ' WHERE rowid BETWEEN ? AND ? ORDER BY rowid').bind(start, end);
    }
    const rows = await statement.all<{ collection: string; payload: string }>();
    if (paged && (await current(env.CLUB_DB)).revision !== meta.revision) return json({ error: 'Club data changed during loading.' }, 409);
    const data: Record<string, string[]> = Object.fromEntries(collections.map(name => [name, []]));
    for (const row of rows.results) {
      if (Object.hasOwn(data, row.collection)) data[row.collection].push(row.payload);
    }
    const fields = collections.map(name => `"${name}":[${data[name].join(',')}]`);
    return new Response(`{"data":{${fields.join(',')}},${JSON.stringify(metadata).slice(1)}`, {
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'private, no-store' },
    });
  } catch (error) {
    console.error('Could not read club data', error);
    return json({ error: 'Could not read club data.' }, 500);
  }
}

export async function onRequestPut({ request, env }: Context): Promise<Response> {
  if (!env.CLUB_DB) return json({ error: 'Database is not connected.' }, 503);
  const headerAdmin = isAdmin(request, env);
  const sessionAdmin = !headerAdmin && !!await adminSessionExpiry(request, env);
  if (!headerAdmin && !sessionAdmin) return json({ error: 'Write access denied.' }, 403);
  if (sessionAdmin && request.headers.get('origin') !== new URL(request.url).origin)
    return json({ error: 'Request not allowed.' }, 403);
  if (sessionAdmin && !request.headers.get('content-type')?.includes('application/json'))
    return json({ error: 'Invalid request.' }, 400);
  try {
    const body = await request.json() as { revision?: unknown; data?: unknown; changes?: Array<{ collection: string; id: string; item: Record<string, unknown> | null }> };
    if (!Number.isSafeInteger(body.revision) || (!validData(body.data) && !Array.isArray(body.changes))) return json({ error: 'Invalid club data.' }, 400);
    const meta = await current(env.CLUB_DB);
    if (body.revision !== meta.revision) return json({ error: 'Club data changed on another device. Reload before saving.', revision: meta.revision }, 409);
    const statements: Statement[] = [];
    if (body.changes) {
      for (const change of body.changes) {
        if (!change || !collections.includes(change.collection as typeof collections[number]) ||
            typeof change.id !== 'string' ||
            (change.item !== null && (!change.item || typeof change.item !== 'object' ||
              recordId(change.collection, change.item) !== change.id))) return json({ error: 'Invalid change.' }, 400);
        if (change.item === null) {
          statements.push(env.CLUB_DB.prepare('DELETE FROM club_records WHERE collection = ? AND record_id = ?').bind(change.collection, change.id));
        } else {
          if (change.collection === 'matches' && !Object.hasOwn(change.item, 'chat')) {
            const stored = await env.CLUB_DB.prepare('SELECT payload FROM club_records WHERE collection = ? AND record_id = ?')
              .bind('matches', change.id).first<{ payload: string }>();
            if (stored) {
              const existing = JSON.parse(stored.payload) as Record<string, unknown>;
              if (Object.hasOwn(existing, 'chat')) change.item = { ...change.item, chat: existing.chat };
            }
          }
          statements.push(env.CLUB_DB.prepare('INSERT OR REPLACE INTO club_records (collection, record_id, payload) VALUES (?, ?, ?)')
            .bind(change.collection, change.id, JSON.stringify(change.item)));
        }
      }
    } else {
      const data = body.data as Record<string, Array<Record<string, unknown>>>;
      const existing = await env.CLUB_DB.prepare('SELECT collection, record_id, payload FROM club_records').all<RecordRow>();
      const previous = new Map(existing.results.map(row => [JSON.stringify([row.collection, row.record_id]), row]));
      for (const collection of collections) {
        for (const item of data[collection]) {
          const id = recordId(collection, item);
          const key = JSON.stringify([collection, id]);
          const stored = previous.get(key);
          const existing = stored && collection === 'matches' ? JSON.parse(stored.payload) as Record<string, unknown> : null;
          const complete = existing && !Object.hasOwn(item, 'chat') && Object.hasOwn(existing, 'chat')
            ? { ...item, chat: existing.chat } : item;
          const payload = JSON.stringify(complete);
          if (previous.get(key)?.payload !== payload) {
            statements.push(env.CLUB_DB.prepare('INSERT OR REPLACE INTO club_records (collection, record_id, payload) VALUES (?, ?, ?)')
              .bind(collection, id, payload));
          }
          previous.delete(key);
        }
      }
      for (const row of previous.values()) statements.push(env.CLUB_DB.prepare('DELETE FROM club_records WHERE collection = ? AND record_id = ?').bind(row.collection, row.record_id));
    }
    statements.push(env.CLUB_DB.prepare('UPDATE club_meta SET revision = revision + 1, updated_at = CURRENT_TIMESTAMP WHERE id = 1'));
    await env.CLUB_DB.batch(statements);
    return json({ revision: meta.revision + 1 });
  } catch (error) {
    console.error('Could not save club data', error);
    return json({ error: 'Could not save club data.' }, 500);
  }
}
