import type { ClubData } from "./model";
import type { Matchday } from "./remoteData";
import { parseBackup } from "./store";

const clubKey = "tbfc-published-club-v1";
const matchdayKey = "tbfc-matchday-v1";

function readCache<T>(key: string, validate: (value: T) => void): T | undefined {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return undefined;
    const value = JSON.parse(saved) as T;
    validate(value);
    return value;
  } catch {
    return undefined;
  }
}

function writeCache(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be full or disabled. Fresh data can still be displayed.
  }
}

function publicData(data: ClubData): ClubData {
  return {
    ...data,
    matches: data.matches.map(({ chat: _chat, matchAuditComplete: _audit, ...match }) => match),
  };
}

export function readCachedClub() {
  return readCache<ClubData>(clubKey, data => { parseBackup(JSON.stringify(data)); });
}

export function cacheClub(data: ClubData | null) {
  if (data) writeCache(clubKey, publicData(data));
  else {
    try { localStorage.removeItem(clubKey); } catch { /* Storage is unavailable. */ }
  }
}

export function readCachedMatchday() {
  return readCache<Matchday>(matchdayKey, value => {
    parseBackup(JSON.stringify(value.data));
    if (!value.headToHead || typeof value.headToHead.played !== "number") throw new Error("Invalid matchday");
  });
}

export function cacheMatchday(value: Matchday) {
  writeCache(matchdayKey, { ...value, data: publicData(value.data) });
}
