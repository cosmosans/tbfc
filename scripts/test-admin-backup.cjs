const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file);
  const exports = {};
  cache.set(file, exports);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  new Function('exports', 'require', code)(exports, name => load(path.resolve(path.dirname(file), name + '.ts')));
  return exports;
}
const auth = load('functions/lib/adminBackupAuth.ts');
const session = load('functions/api/admin/session.ts');
const backup = load('functions/api/admin/backup.ts');
const club = load('functions/api/club.ts');
let revision = 1;
let attempts = 0;
let match = { id: 'match', report: 'Original', chat: [{ id: 'memory', playerId: 'player', text: 'Private memory' }] };
const env = { CLUB_ADMIN_KEY: 'test-only-admin', CLUB_DB: {
  prepare(sql) { return {
    sql, values: [], bind(...values) { this.values = values; return this; },
    async first() {
      if (sql.includes('club_meta')) return { revision, updated_at: '' };
      if (sql.includes('RETURNING attempts')) return { attempts: ++attempts };
      if (sql.includes('SELECT payload')) return { payload: JSON.stringify(match) };
      return null;
    },
    async all() { return { results: [{ collection: 'matches', record_id: 'match', payload: JSON.stringify(match) }] }; },
  }; },
  async batch(statements) {
    for (const statement of statements) {
      if (statement.sql.includes('INSERT OR REPLACE') && statement.values[0] === 'matches') match = JSON.parse(statement.values[2]);
      if (statement.sql.includes('UPDATE club_meta')) revision++;
    }
  },
} };
const url = 'https://example.com/api/admin/session';
const request = (method = 'GET', cookie, body) => new Request(url, {
  method, headers: { ...(cookie ? { cookie } : {}), ...(method !== 'GET' ? { origin: 'https://example.com', 'content-type': 'application/json' } : {}) },
  ...(body ? { body: JSON.stringify(body) } : {}),
});
(async () => {
  assert.equal((await backup.onRequestGet({ request: request(), env })).status, 401);
  assert.equal((await session.onRequestPost({ request: request('POST', null, { secret: 'wrong' }), env })).status, 401);
  const login = await session.onRequestPost({ request: request('POST', null, { secret: env.CLUB_ADMIN_KEY }), env });
  assert.equal(login.status, 200);
  const cookie = login.headers.get('set-cookie').split(';')[0];
  for (const flag of ['HttpOnly', 'Secure', 'SameSite=Strict']) assert.ok(login.headers.get('set-cookie').includes(flag));
  assert.equal((await session.onRequestGet({ request: request('GET', cookie), env })).status, 200);
  const download = await backup.onRequestGet({ request: request('GET', cookie), env });
  assert.equal(download.status, 200);
  assert.deepEqual((await download.json()).matches[0].chat, match.chat);
  assert.match(download.headers.get('cache-control'), /no-store/);
  assert.equal((await backup.onRequestGet({ request: request('GET', cookie), env: { ...env, CLUB_ADMIN_KEY: 'changed' } })).status, 401);
  assert.equal((await session.onRequestDelete({ request: request('DELETE', cookie) })).status, 200);
  const edit = new Request('https://example.com/api/club', {
    method: 'PUT', headers: { 'x-club-admin-key': env.CLUB_ADMIN_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({ revision, changes: [{ collection: 'matches', id: 'match', item: { id: 'match', report: 'Changed' } }] }),
  });
  assert.equal((await club.onRequestPut({ request: edit, env })).status, 200);
  assert.equal(match.report, 'Changed');
  assert.deepEqual(match.chat, [{ id: 'memory', playerId: 'player', text: 'Private memory' }]);
  const fullData = Object.fromEntries(['matches', 'players', 'opponents', 'seasons', 'locations', 'events', 'lineups', 'boards', 'standings'].map(name => [name, []]));
  fullData.matches = [{ id: 'match', report: 'Changed again' }];
  const fullEdit = new Request('https://example.com/api/club', {
    method: 'PUT', headers: { 'x-club-admin-key': env.CLUB_ADMIN_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({ revision, data: fullData }),
  });
  assert.equal((await club.onRequestPut({ request: fullEdit, env })).status, 200);
  assert.equal(match.report, 'Changed again');
  assert.deepEqual(match.chat, [{ id: 'memory', playerId: 'player', text: 'Private memory' }]);
  console.log('Admin backup authentication and chat-preserving match save passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
