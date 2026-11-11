import type { ClubData, Formation, Player, Position } from "../../model";
import { byPlayerNumber } from "../../playerOrder";
import { formationSlots } from "./formations";

const defaultRoles = {
  Forward: "ST", Midfielder: "CAM", Defender: "CDM", Winger: "LW", "Goal Keeper": "GK",
} as const;

function roleOrder(player: Player, assigned?: Position): Position[] {
  const primary = assigned || player.preferredPosition || player.secondaryPosition ||
    defaultRoles[player.playerType || "Midfielder"];
  const equivalents: Partial<Record<Position, Position[]>> = {
    ST: ["CAM", "LW", "RW"], CDM: ["CAM", "LB", "RB"],
  };
  return [...new Set([primary, player.preferredPosition, player.secondaryPosition,
    ...(equivalents[primary] ?? []), "CAM", "LW", "RW", "CDM", "LB", "RB", "ST", "GK"]
    .filter((role): role is Position => Boolean(role)))];
}

export function fullStrength(data: ClubData, formation: Formation) {
  const slots = formationSlots[formation];
  const active = data.players.filter(player => player.active).sort(byPlayerNumber);
  const remaining = new Set(active);
  const starters = slots.map(role => {
    const pick = active.find(player => player.id === data.firstChoice?.[role]);
    return pick && remaining.delete(pick) ? pick.id : "";
  });

  // Fill open slots with displaced preset starters first, then the closest available players.
  for (const presetOnly of [true, false]) {
    while (remaining.size && starters.includes("")) {
      let best: { player: Player; index: number; rank: number } | undefined;
      for (const player of remaining) {
        const assigned = (Object.keys(data.firstChoice ?? {}) as Position[])
          .find(role => data.firstChoice?.[role] === player.id);
        if (presetOnly && !assigned) continue;
        const roles = roleOrder(player, assigned);
        slots.forEach((role, index) => {
          const rank = roles.indexOf(role);
          if (!starters[index] && (!best || rank < best.rank)) best = { player, index, rank };
        });
      }
      if (!best) break;
      starters[best.index] = best.player.id;
      remaining.delete(best.player);
    }
  }
  const bench = [...remaining].map(player => player.id);
  const benchPositions: Record<string, Position> = {};
  for (const player of remaining) {
    benchPositions[player.id] = roleOrder(player).find(role => slots.includes(role))!;
  }
  return { starters, bench, benchPositions };
}
