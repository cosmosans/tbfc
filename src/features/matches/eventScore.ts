import type { ClubData, MatchEvent } from "../../model";

// Goal.team is the beneficiary, including own goals. Missing teams in older
// records mean TBFC. Penalty awards/saves are not goals.
export function goalTotals(events: MatchEvent[], matchId: string) {
  return events.reduce((total, event) => {
    if (event.matchId === matchId && event.kind === "goal") {
      total[event.team === "opponent" ? "against" : "for"]++;
    }
    return total;
  }, { for: 0, against: 0 });
}

export function updateMatchEvents(data: ClubData, matchId: string, events: MatchEvent[]): ClubData {
  const before = goalTotals(data.events, matchId);
  const after = goalTotals(events, matchId);
  // Preserve unaccounted historical goals while they are being backfilled.
  // Once a side's events cover its score, removals can decrease that score too.
  const reconcile = (score: number, previous: number, next: number) =>
    previous === next ? score : previous >= score ? next : Math.max(score, next);
  return {
    ...data,
    events,
    matches: data.matches.map(match => match.id !== matchId ? match : {
      ...match,
      goalsFor: reconcile(match.goalsFor, before.for, after.for),
      goalsAgainst: reconcile(match.goalsAgainst, before.against, after.against),
    }),
  };
}
