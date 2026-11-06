import type { Player, MatchEvent } from "../../model";

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
  ] as const;
}
