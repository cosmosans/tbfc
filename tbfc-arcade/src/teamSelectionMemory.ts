const storageKey = 'tbfc.teamSelection.v1';
let sessionSelection: { home: string; away: string } | undefined;

export function rememberTeams(home: { name: string }, away: { name: string }) {
  sessionSelection = { home: home.name, away: away.name };
  try { localStorage.setItem(storageKey, JSON.stringify(sessionSelection)); }
  catch { /* Keep remembering within this session when storage is unavailable. */ }
}

export function restoreTeams<T extends { name: string }>(available: readonly T[], defaults: [T, T]): [T, T] {
  let saved: unknown = sessionSelection;
  try {
    const raw = saved ? null : localStorage.getItem(storageKey);
    if (raw) saved = JSON.parse(raw);
  } catch { /* Fall back to this session or the caller's defaults. */ }
  if (!saved || typeof saved !== 'object') return defaults;
  const names = saved as { home?: unknown; away?: unknown };
  const home = available.find(team => team.name === names.home) ?? defaults[0];
  const away = available.find(team => team.name === names.away && team !== home)
    ?? (defaults[1] !== home ? defaults[1] : available.find(team => team !== home))
    ?? defaults[1];
  return [home, away];
}
