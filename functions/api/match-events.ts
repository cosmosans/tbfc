type Database = {
  prepare(sql: string): {
    bind(matchId: string): {
      all<T>(): Promise<{ results: T[] }>;
    };
  };
};

export async function onRequestGet({ request, env }: { request: Request; env: { CLUB_DB?: Database } }) {
  const headers = { "cache-control": "no-store" };
  const matchId = new URL(request.url).searchParams.get("matchId");
  if (!matchId) return Response.json({ error: "Match ID is required." }, { status: 400, headers });
  if (!env.CLUB_DB) return Response.json({ error: "Database is not connected." }, { status: 503, headers });

  const rows = await env.CLUB_DB.prepare(
    "SELECT payload FROM club_records WHERE collection = 'events' AND json_extract(payload, '$.matchId') = ? ORDER BY record_id"
  ).bind(matchId).all<{ payload: string }>();
  const matchRows = await env.CLUB_DB.prepare(
    "SELECT payload FROM club_records WHERE collection = 'matches' AND record_id = ?"
  ).bind(matchId).all<{ payload: string }>();
  const match = matchRows.results[0] ? JSON.parse(matchRows.results[0].payload) : null;
  if (match) delete match.chat;
  if (match) delete match.matchAuditComplete;
  return Response.json({ match, events: rows.results.map(row => JSON.parse(row.payload)) }, { headers });
}
