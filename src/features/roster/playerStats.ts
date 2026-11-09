import type { ClubData, Player, MatchEvent } from "../../model";

export function careerEvents(data: ClubData) {
  const played = new Set(data.matches.filter(match => match.status !== "scheduled").map(match => match.id));
  return data.events.filter(event => played.has(event.matchId));
}

export function playerStats(player: Player, events: MatchEvent[]) {
  return [
    [
      "Goals",
        events.filter(
          (e) => e.playerId === player.id && e.kind === "goal" && !e.ownGoal && e.team !== "opponent",
        ).length,
    ],
    [
      "Assists",
        events.filter((e) => e.playerId === player.id && e.kind === "assist").length,
    ],
    [
      "PK Saves",
        events.filter((e) => e.playerId === player.id && e.kind === "penalty_save" && e.team !== "opponent")
          .length,
    ],
    [
      "Yellow Cards",
        events.filter((e) => e.playerId === player.id && e.kind === "yellow_card" && e.team !== "opponent")
          .length,
    ],
    ["Clean Sheets", events.filter(e => e.kind === "clean_sheet" && e.playerId === player.id && e.team === "tbfc").length],
  ] as const;
}
