import type { ClubData, Player } from "./model";

// Discard obsolete aggregates from old drafts, backups, and server records.
export function withoutLegacyStats(player: Player): Player {
  const clean = { ...player } as Player & { historicalStats?: unknown };
  delete clean.historicalStats;
  return clean;
}

export function eventOnlyPlayerData(data: ClubData): ClubData {
  return { ...data, players: data.players.map(withoutLegacyStats) };
}
