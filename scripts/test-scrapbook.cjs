const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file);
  const exports = {};
  cache.set(file, exports);
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  new Function("exports", "require", code)(exports, name => load(path.resolve(path.dirname(file), name + ".ts")));
  return exports;
}
const auth = load("functions/lib/scrapbookAuth.ts");
const club = load("functions/api/club.ts");
const scrapbook = load("functions/api/scrapbook.ts");
const env = { SCRAPBOOK_PASSWORD: "test-only-password", CLUB_ADMIN_KEY: "test-only-admin" };
const match = { id: "match", report: "Public report", chat: [{ text: "Private fixture", id: "message", playerId: "player" }] };
let attempts = 0;
const db = { prepare(sql) { return {
  bind() { return this; },
  async first() {
    if (sql.includes("club_meta")) return { revision: 1, updated_at: "" };
    if (sql.includes("RETURNING attempts")) return { attempts: ++attempts };
    return { payload: JSON.stringify(match) };
  },
  async all() { return { results: [{ collection: "matches", record_id: "match", payload: JSON.stringify(match) }] }; },
  async run() {},
}; }};
env.CLUB_DB = db;
const request = (cookie, extra = {}) => new Request("https://example.com/api/scrapbook?match=match", {
  ...extra, headers: { ...(cookie ? { cookie: "__Host-tbfc-scrapbook=" + cookie } : {}), ...extra.headers },
});
(async () => {
  const session = await auth.createSession(env.SCRAPBOOK_PASSWORD);
  assert.equal(await auth.sessionExpiry(request(session.token), env), session.expires);
  assert.equal(await auth.sessionExpiry(request(session.token + "x"), env), null);
  assert.equal(await auth.sessionExpiry(request(session.token), { ...env, SCRAPBOOK_PASSWORD: "changed" }), null);
  assert.equal(await auth.sessionExpiry(request(), env), null);
  const now = Date.now;
  Date.now = () => (session.expires + 1) * 1000;
  assert.equal(await auth.sessionExpiry(request(session.token), env), null);
  Date.now = now;
  const publicData = await (await club.onRequestGet({ request: request(), env })).json();
  assert.equal(publicData.data.matches[0].chat, undefined);
  assert.equal(publicData.data.matches[0].report, match.report);
  const loggedInPublicData = await (await club.onRequestGet({ request: request(session.token), env })).json();
  assert.equal(loggedInPublicData.data.matches[0].chat, undefined);
  const adminData = await (await club.onRequestGet({ request: request(null, { headers: { "x-club-admin-key": env.CLUB_ADMIN_KEY } }), env })).json();
  assert.deepEqual(adminData.data.matches[0].chat, match.chat);
  assert.equal((await scrapbook.onRequestGet({ request: request(), env })).status, 401);
  const privateResponse = await scrapbook.onRequestGet({ request: request(session.token), env });
  assert.deepEqual((await privateResponse.json()).messages, match.chat);
  assert.match(privateResponse.headers.get("cache-control"), /no-store/);
  const post = (password, origin = "https://example.com") => request(null, {
    method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify({ password }),
  });
  assert.equal((await scrapbook.onRequestPost({ request: post("wrong"), env })).status, 401);
  assert.equal((await scrapbook.onRequestPost({ request: post(env.SCRAPBOOK_PASSWORD, "https://elsewhere.com"), env })).status, 403);
  const login = await scrapbook.onRequestPost({ request: post(env.SCRAPBOOK_PASSWORD), env });
  assert.equal(login.status, 200);
  for (const flag of ["HttpOnly", "Secure", "SameSite=Strict"]) assert.ok(login.headers.get("set-cookie").includes(flag));
  attempts = 10;
  assert.equal((await scrapbook.onRequestPost({ request: post(env.SCRAPBOOK_PASSWORD), env })).status, 429);
  assert.equal((await scrapbook.onRequestPost({ request: post("anything"), env: {} })).status, 503);
  const logout = await scrapbook.onRequestDelete({ request: request(null, { method: "DELETE", headers: { origin: "https://example.com" } }) });
  assert.match(logout.headers.get("set-cookie"), /Max-Age=0/);
  // A viewing session is never an editing credential.
  assert.equal((await club.onRequestPut({ request: request(session.token, { method: "PUT" }), env })).status, 403);
  console.log("Scrapbook privacy, authentication, expiry, rotation, rate limit, logout, and read-only checks passed.");
})().catch(error => { console.error(error); process.exitCode = 1; });
