import { eventOnlyPlayerData, withoutLegacyStats } from "./playerData";
import seedMatches from './data/seedMatches.json';
import { seedPlayers } from './data/seedPlayers';
import { upcomingFixtures } from './data/upcomingFixtures';
import { seedStandings } from './data/seedStandings';
import type { Board, ClubData, Lineup, Location, Marker, Match, Opponent, Position, Season } from './model';
import { positions } from './model';
import { formationPoints } from './features/lineup/formations';
import { splitMatchLocation } from './matchLocation';
import { splitCompetition } from './matchCompetition';

const STORAGE_KEY = 'tbfc-club-data-v1';
const excludedMatchIds = new Set(['import-52']);
const importedMatches = (seedMatches as Match[]).map(splitCompetition);
const crestByName: Record<string, string> = {
  'Whiff City FC': '/crests/whiff-city-fc.png',
  'Peachy Puffs': '/crests/peachy-puffs.png',
  'Peach Passers': '/crests/peach-passers.png',
  'Inter Your Mom': '/crests/inter-your-mom.png',
  'Goal Dancers FC': '/crests/goal-dancers-fc-v2.png',
  'Barely United': '/crests/barely-united.png',
  'Shooting Stars FC': '/crests/shooting-stars-fc.png',
  'Peach Pit FC': '/crests/peach-pit-fc.png',
  'AFC ATL': '/crests/afc-atl.png',
  'Peachtree Press FC': '/crests/peachtree-press-fc.png',
  'Onsider Trading FC': '/crests/onsider-trading-fc.png',
};
const seedOpponents: Opponent[] = [
  ...new Map(importedMatches.map(m => [m.opponentId, { id: m.opponentId!, name: m.opponent, crestUrl: crestByName[m.opponent] ?? '', color: m.opponent === 'Peachy Puffs' ? '#2d5337' : '', notes: '' }])).values(),
  { id: 'opponent-all-luck-no-skill', name: 'All Luck No Skill', crestUrl: '/crests/all-luck-no-skill.png', color: '', notes: '' },
];
const seedSeasons: Season[] = [...new Map(importedMatches.map(m => [m.seasonId, { id: m.seasonId!, name: m.season, notes: '', startsOn: importedMatches.filter(other => other.seasonId === m.seasonId).map(other => other.date).sort()[0] }])).values()];
const seedLocations: Location[] = [...new Map([...importedMatches, ...upcomingFixtures]
  .map(match => splitMatchLocation(match.venue).venue.trim())
  .filter(Boolean)
  .map(name => [name.toLowerCase(), { id: `location-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, name, address: '', imageUrl: '' }])).values()];
const seed: ClubData = {
  matches: [...importedMatches, ...upcomingFixtures].map(match => {
    const location = splitMatchLocation(match.venue, match.pitch);
    return { ...match, ...location, locationId: seedLocations.find(item => item.name.toLowerCase() === location.venue.toLowerCase())?.id };
  }), players: seedPlayers, opponents: seedOpponents, seasons: seedSeasons, locations: seedLocations, events: [], lineups: [], boards: [], standings: seedStandings,
};

export function loadData(): ClubData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved) as Partial<ClubData>;
      const sourceById = new Map(seed.matches.map(m => [m.id, m]));
      const mergeById = <T extends { id: string }>(defaults: T[], existing: T[] | undefined): T[] => {
        const merged = new Map(defaults.map(item => [item.id, item]));
        for (const item of existing ?? []) if (item.id) merged.set(item.id, { ...merged.get(item.id), ...item });
        return [...merged.values()];
      };
      const seasons = mergeById(seed.seasons, data.seasons);
      const rawLocations = mergeById(seed.locations, data.locations);
      for (const match of data.matches ?? []) {
        const name = splitMatchLocation(match.venue).venue.trim();
        if (name && !rawLocations.some(item => splitMatchLocation(item.name).venue.toLowerCase() === name.toLowerCase())) {
          rawLocations.push({ id: `location-${crypto.randomUUID()}`, name, address: '', imageUrl: '' });
        }
      }
      const locationsByName = new Map<string, Location>();
      const canonicalIdById = new Map<string, string>();
      for (const item of rawLocations) {
        const name = splitMatchLocation(item.name).venue.trim();
        if (!name) continue;
        const key = name.toLowerCase();
        const current = locationsByName.get(key);
        if (!current) {
          locationsByName.set(key, { ...item, name });
        } else {
          const plain = item.name.trim().toLowerCase() === key;
          locationsByName.set(key, {
            ...(plain ? item : current),
            id: current.id,
            name: current.name,
            address: (plain ? item.address : current.address) || current.address || item.address || '',
            imageUrl: (plain ? item.imageUrl : current.imageUrl) || current.imageUrl || item.imageUrl || '',
          });
        }
      }
      for (const item of rawLocations) {
        const canonical = locationsByName.get(splitMatchLocation(item.name).venue.toLowerCase());
        if (canonical) canonicalIdById.set(item.id, canonical.id);
      }
      const locations = [...locationsByName.values()];
      const opponents = mergeById(seed.opponents, data.opponents).map(opponent => ({
        ...opponent,
        crestUrl: opponent.crestUrl === '/crests/goal-dancers-fc.png'
          ? '/crests/goal-dancers-fc-v2.png'
          : opponent.crestUrl || seed.opponents.find(item => item.id === opponent.id)?.crestUrl || '',
        color: opponent.color || seed.opponents.find(item => item.id === opponent.id)?.color || '',
        notes: opponent.notes ?? '',
      }));
      const normalizePosition = (value: unknown): Position | '' => value === 'Goalkeeper' ? 'GK' : positions.includes(value as Position) ? value as Position : '';
      const players = (data.players ?? seed.players).map(player => ({
        ...withoutLegacyStats(player),
        preferredPosition: normalizePosition(player.preferredPosition),
        secondaryPosition: normalizePosition(player.secondaryPosition),
      }));
      const savedMatches = (data.matches ?? importedMatches).filter(match => !excludedMatchIds.has(match.id));
      const sameFixture = (a: Match, b: Match) => a.season === b.season && a.date === b.date && a.opponent.trim().toLowerCase() === b.opponent.trim().toLowerCase();
      const newFixtures = upcomingFixtures.filter(fixture => !savedMatches.some(match => match.id === fixture.id || sameFixture(match, fixture)));
      const matches = [...savedMatches, ...newFixtures].map(rawMatch => {
        const match = splitCompetition(rawMatch);
        const source = sourceById.get(match.id);
        const withSource = source ? { ...source, ...match } : match;
        const location = splitMatchLocation(withSource.venue, withSource.pitch);
        return {
          ...withSource,
          ...location,
          locationId: (withSource.locationId && canonicalIdById.get(withSource.locationId)) ?? locations.find(item => item.name.toLowerCase() === location.venue.toLowerCase())?.id,
          status: withSource.status ?? 'completed',
          seasonId: withSource.seasonId ?? seasons.find(s => s.name === withSource.season)?.id,
          opponentId: withSource.opponentId ?? opponents.find(o => o.name === withSource.opponent)?.id,
          shootoutFor: withSource.shootoutFor ?? source?.shootoutFor ?? null,
          shootoutAgainst: withSource.shootoutAgainst ?? source?.shootoutAgainst ?? null,
        };
      });
      return {
        matches,
        players,
        opponents,
        seasons,
        locations,
        events: (data.events ?? []).filter(event => !excludedMatchIds.has(event.matchId)),
        firstChoice: data.firstChoice ?? {},
        lineups: (data.lineups ?? []).filter(lineup => !excludedMatchIds.has(lineup.matchId)).map(lineup => ({
          ...lineup,
          formation: Object.hasOwn(formationPoints, lineup.formation) ? lineup.formation : '1-2-3-1',
        })),
        boards: (data.boards ?? []).filter(board => !excludedMatchIds.has(board.matchId)),
        standings: data.standings ?? seed.standings,
      };
    }
  } catch (error) { console.warn('Could not load local club data', error); }
  return structuredClone(seed);
}

export function saveData(data: ClubData) { localStorage.setItem(STORAGE_KEY, JSON.stringify(eventOnlyPlayerData(data))); }
export function parseBackup(text: string): ClubData {
  const value: unknown = JSON.parse(text);
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('This is not a TBFC backup.');
  const data = value as Record<string, unknown>;
  const collections = ['matches', 'players', 'opponents', 'seasons', 'events', 'lineups', 'boards'];
  if (collections.some(key => !Array.isArray(data[key])) || (data.locations !== undefined && !Array.isArray(data.locations)) || (data.standings !== undefined && !Array.isArray(data.standings))) {
    throw new Error('This backup is missing required TBFC data.');
  }
  const rows = (key: string) => data[key] as Record<string, unknown>[];
  const validRows = (key: string, fields: string[]) => rows(key).every(row =>
    row && typeof row === 'object' && !Array.isArray(row) && fields.every(field => typeof row[field] === 'string')
  );
  if (!validRows('matches', ['id', 'date', 'opponent', 'venue']) ||
      !validRows('players', ['id', 'name']) ||
      !validRows('opponents', ['id', 'name']) ||
      !validRows('seasons', ['id', 'name']) ||
      !validRows('events', ['id', 'matchId']) ||
      !validRows('lineups', ['matchId']) ||
      !validRows('boards', ['matchId']) ||
      (data.locations !== undefined && !(data.locations as unknown[]).every(row => row && typeof row === 'object' && !Array.isArray(row) && typeof (row as Record<string, unknown>).id === 'string' && typeof (row as Record<string, unknown>).name === 'string')) ||
      rows('lineups').some(row => !Array.isArray(row.starters) || !Array.isArray(row.bench)) ||
      rows('boards').some(row => !Array.isArray(row.markers)) ||
      (data.standings !== undefined && (data.standings as unknown[]).some(row => !row || typeof row !== 'object' || Array.isArray(row) || typeof (row as Record<string, unknown>).seasonId !== 'string' || !Array.isArray((row as Record<string, unknown>).rows)))) {
    throw new Error('This backup contains invalid TBFC records.');
  }
  return eventOnlyPlayerData(data as ClubData);
}
export function exportData(data: ClubData) {
  const blob = new Blob([JSON.stringify(eventOnlyPlayerData(data), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `tbfc-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function defaultLineup(matchId: string): Lineup {
  return { matchId, formation: '1-2-3-1', starters: Array(7).fill(''), bench: [] };
}

export function defaultBoard(matchId: string, lineup: Lineup, data: ClubData): Board {
  const positions = formationPoints[lineup.formation];
  const markers: Marker[] = lineup.starters.map((playerId, index) => ({
    id: `slot-${index}`,
    label: data.players.find(p => p.id === playerId)?.name.split(' ')[0] || `${index + 1}`,
    playerNumber: data.players.find(p => p.id === playerId)?.number,
    team: 'tbfc',
    point: { x: positions[index][0], y: positions[index][1] },
  }));
  // Pair an opponent marker with each outfield slot, slightly toward the far goal.
  positions.slice(1).forEach(([x, y], index) => {
    markers.push({
      id: `opponent-${index + 1}`,
      label: '',
      playerNumber: String(index + 1),
      team: 'opponent',
      point: { x: Math.max(8, Math.min(92, x + (index % 2 === 0 ? -3 : 3))), y: y - 13 },
    });
  });
  markers.push({ id: 'ball', label: '⚽', team: 'ball', point: { x: 59, y: 47 } });
  return { matchId, formation: lineup.formation, markers, notes: '' };
}
