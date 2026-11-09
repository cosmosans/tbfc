import type { ClubData, Player } from "./model";
import { splitCompetition } from "./matchCompetition";

// Discard obsolete aggregates from old drafts, backups, and server records.
export function withoutLegacyStats(player: Player): Player {
  const clean = { ...player, captain: player.captain === true } as Player & { historicalStats?: unknown };
  delete clean.historicalStats;
  return clean;
}

export function eventOnlyPlayerData(data: ClubData): ClubData {
  return { ...data, players: data.players.map(withoutLegacyStats), matches: data.matches.map(splitCompetition) };
}
