import { isMatchCompleted, type ClubData, type MatchEvent } from "./model";
import { formationSlots } from "./features/lineup/formations";

export function withCleanSheets(data: ClubData): ClubData {
  const events = data.events.filter(event => event.kind !== "clean_sheet");
  const players = new Set(data.players.map(player => player.id));
  const lineups = new Map(data.lineups.map(lineup => [lineup.matchId, lineup]));
  for (const match of data.matches) {
    if (!isMatchCompleted(match) || match.goalsAgainst !== 0) continue;
    const lineup = lineups.get(match.id);
    if (!lineup) continue;
    const keeper = lineup.starters[formationSlots[lineup.formation]?.indexOf("GK") ?? 0];
    if (!players.has(keeper)) continue;
    const event: MatchEvent = {
      id: "clean-sheet-" + match.id, matchId: match.id, playerId: keeper,
      kind: "clean_sheet", team: "tbfc", minute: 50,
    };
    events.push(event);
  }
  return { ...data, events };
}
