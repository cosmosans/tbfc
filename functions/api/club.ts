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

export async function onRequestGet({ env }: Context): Promise<Response> {
  if (!env.CLUB_DB) return json({ error: 'Database is not connected.' }, 503);
  try {
    const meta = await current(env.CLUB_DB);
    if (meta.revision === 0) return json({ revision: 0, data: null, updatedAt: meta.updated_at });
    const rows = await env.CLUB_DB.prepare('SELECT collection, record_id, payload FROM club_records').all<RecordRow>();
    const data: Record<string, unknown[]> = Object.fromEntries(collections.map(name => [name, []]));
    for (const row of rows.results) {
      if (Object.hasOwn(data, row.collection)) data[row.collection].push(JSON.parse(row.payload));
    }
    return json({ revision: meta.revision, data, updatedAt: meta.updated_at });
  } catch (error) {
    console.error('Could not read club data', error);
    return json({ error: 'Could not read club data.' }, 500);
  }
}

export async function onRequestPut({ request, env }: Context): Promise<Response> {
  if (!env.CLUB_DB) return json({ error: 'Database is not connected.' }, 503);
  if (!env.CLUB_ADMIN_KEY || request.headers.get('x-club-admin-key') !== env.CLUB_ADMIN_KEY) {
    return json({ error: 'Write access denied.' }, 403);
  }
  try {
    const body = await request.json() as { revision?: unknown; data?: unknown };
    if (!Number.isSafeInteger(body.revision) || !validData(body.data)) return json({ error: 'Invalid club data.' }, 400);
    const meta = await current(env.CLUB_DB);
    if (body.revision !== meta.revision) return json({ error: 'Club data changed on another device. Reload before saving.', revision: meta.revision }, 409);
    const data = body.data;
    const statements: Statement[] = [env.CLUB_DB.prepare('DELETE FROM club_records')];
    for (const collection of collections) {
      for (const item of data[collection]) {
        statements.push(env.CLUB_DB.prepare('INSERT INTO club_records (collection, record_id, payload) VALUES (?, ?, ?)')
          .bind(collection, recordId(collection, item), JSON.stringify(item)));
      }
    }
    statements.push(env.CLUB_DB.prepare('UPDATE club_meta SET revision = revision + 1, updated_at = CURRENT_TIMESTAMP WHERE id = 1'));
    await env.CLUB_DB.batch(statements);
    return json({ revision: meta.revision + 1 });
  } catch (error) {
    console.error('Could not save club data', error);
    return json({ error: 'Could not save club data.' }, 500);
  }
}
