import type { ClubData } from './model';

const collections = ['matches', 'players', 'opponents', 'seasons', 'locations', 'events', 'lineups', 'boards', 'standings'] as const;

function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, stable(item)]));
}

export function backupMatchesLive(backup: ClubData, live: ClubData): boolean {
  for (const collection of collections) {
    const key = collection === 'lineups' || collection === 'boards' ? 'matchId' : collection === 'standings' ? 'seasonId' : 'id';
    const normalize = (rows: unknown[]) => rows.map(row => {
      if (collection !== 'matches') return row;
      const { chat: _chat, ...match } = row as Record<string, unknown>;
      return match;
    }).sort((a, b) => String((a as Record<string, unknown>)[key]).localeCompare(String((b as Record<string, unknown>)[key])));
    if (JSON.stringify(stable(normalize(backup[collection]))) !== JSON.stringify(stable(normalize(live[collection])))) return false;
  }
  return true;
}
