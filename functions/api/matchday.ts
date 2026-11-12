import { record, type ClubData, type Match } from "../../src/model";
import { matchAtTime } from "../../src/features/matches/matchClock";
import { splitMatchLocation } from "../../src/matchLocation";

type Statement = {
  bind(...values: (string | number)[]): Statement;
  all<T>(): Promise<{ results: T[] }>;
};
type Database = { prepare(sql: string): Statement };
const standingSeason = "season-fall-2026";

// Project in SQLite so embedded photos, private chats and reports never leave D1.
const matchFields = ["id", "status", "date", "kickoff", "opponent", "opponentId",
  "season", "seasonId", "competition", "venue", "locationId", "pitch", "homeAway", "kit",
  "resultLabel", "goalsFor", "goalsAgainst", "shootoutFor", "shootoutAgainst"];
const columns = matchFields.map(key => `json_extract(payload, '$.${key}') AS ${key}`).join(", ");

export async function onRequestGet({ request, env }: { request: Request; env: { CLUB_DB?: Database } }) {
  const db = env.CLUB_DB;
  if (!db) return Response.json({ error: "Database unavailable" }, { status: 503 });
  const offset = Number(new URL(request.url).searchParams.get("offset"));
  if (!Number.isInteger(offset) || Math.abs(offset) > 840) return new Response(null, { status: 400 });
  // Workers run in UTC. Evaluate kickoff against the same local clock as the device.
  const now = Date.now() - offset * 60_000;
  const today = new Date(now).toISOString().slice(0, 10);
  const [scores, standingsRows, seasons] = await Promise.all([
    db.prepare(`SELECT ${columns} FROM club_records WHERE collection='matches' ORDER BY rowid`).all<Match>(),
    db.prepare("SELECT payload FROM club_records WHERE collection='standings' AND record_id=?").bind(standingSeason).all<{payload:string}>(),
    db.prepare("SELECT payload FROM club_records WHERE collection='seasons' AND record_id=?").bind(standingSeason).all<{payload:string}>(),
  ]);
  const matches = scores.results.map(m => matchAtTime(m, now));
  const live = matches.filter(m => m.status === "in_progress").sort((a,b) => b.date.localeCompare(a.date))[0];
  const match = live ?? matches.filter(m => m.status === "scheduled" && m.date >= today)
    .sort((a,b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))[0];
  const standings: ClubData["standings"] = standingsRows.results.map(row => JSON.parse(row.payload));
  const teamNames = standings.flatMap(s => s.rows.map(r => r.team.trim().toLowerCase()));
  teamNames.push(match?.opponent?.trim().toLowerCase() ?? "");
  const [opponents, locations, cover, events, players] = await Promise.all([
    db.prepare(`SELECT record_id AS id, json_extract(payload,'$.name') AS name,
      json_extract(payload,'$.color') AS color, json_extract(payload,'$.crestUrl') AS crestUrl
      FROM club_records WHERE collection='opponents' AND (record_id=? OR
      lower(trim(json_extract(payload,'$.name'))) IN (SELECT value FROM json_each(?)))`)
      .bind(match?.opponentId ?? "", JSON.stringify(teamNames)).all<ClubData["opponents"][number]>(),
    match ? db.prepare(`SELECT payload FROM club_records WHERE collection='locations' AND
      (record_id=? OR lower(json_extract(payload,'$.name'))=lower(?))`)
      .bind(match.locationId ?? "", splitMatchLocation(match.venue).venue).all<{payload:string}>() : {results: []},
    match ? db.prepare(`SELECT photo.value AS payload FROM club_records, json_each(payload,'$.photos') photo
      WHERE collection='matches' AND record_id=? AND json_extract(photo.value,'$.cover')=1 LIMIT 1`)
      .bind(match.id).all<{payload:string}>() : {results: []},
    live ? db.prepare("SELECT payload FROM club_records WHERE collection='events' AND json_extract(payload,'$.matchId')=?")
      .bind(live.id).all<{payload:string}>() : {results: []},
    live ? db.prepare(`SELECT record_id AS id, json_extract(payload,'$.name') AS name,
      json_extract(payload,'$.number') AS number FROM club_records WHERE collection='players'`).all()
      : { results: [] },
  ]);
  const opponent = opponents.results.find(o => o.id === match?.opponentId || o.name === match?.opponent);
  const headToHead = record(matches.filter(m => match && ((opponent && m.opponentId === opponent.id) || (match.opponent && m.opponent === match.opponent))));
  const data = {
    matches: match ? [{ ...match, photos: cover.results.map(r => JSON.parse(r.payload)) }] : [],
    standings, opponents: opponents.results, seasons: seasons.results.map(r => JSON.parse(r.payload)),
    locations: locations.results.map(r => JSON.parse(r.payload)), events: events.results.map(r => JSON.parse(r.payload)),
    players: players.results, lineups: [], boards: [],
  };
  return Response.json({ data, headToHead }, { headers: { "Cache-Control": "no-store" } });
}
