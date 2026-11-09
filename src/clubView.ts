import type { ClubData, Match, Season } from "./model";

export function opponentFor(data: ClubData, match: Match) {
  return data.opponents.find(
    (o) => o.id === match.opponentId || o.name === match.opponent,
  );
}
export function opponentName(data: ClubData, match: Match) {
  return opponentFor(data, match)?.name || match.opponent || "TBD";
}
function seasonFor(data: ClubData, match: Match) {
  return data.seasons.find(
    (s) => s.id === match.seasonId || s.name === match.season,
  );
}
export function seasonName(data: ClubData, match: Match) {
  return seasonFor(data, match)?.name ?? match.season;
}
export function seasonDate(data: ClubData, season: Season) {
  return (
    season.startsOn ||
    data.matches
      .filter(
        (m) =>
          m.seasonId === season.id || (!m.seasonId && m.season === season.name),
      )
      .map((m) => m.date)
      .filter(Boolean)
      .sort()[0] ||
    ""
  );
}
export function orderedSeasons(data: ClubData, newestFirst: boolean) {
  return [...data.seasons].sort((a, b) => {
    const aDate = seasonDate(data, a);
    const bDate = seasonDate(data, b);
    if (!aDate) return 1;
    if (!bDate) return -1;
    return (
      (newestFirst ? bDate.localeCompare(aDate) : aDate.localeCompare(bDate)) ||
      a.name.localeCompare(b.name)
    );
  });
}
