import type { Match } from '../model';

// Fixtures transcribed from the league schedule screenshot supplied on 2026-11-05.
// Stable IDs allow edits made in the browser to override these defaults.
const fallSeason = { seasonId: 'season-fall-2026', season: 'FALL 2026', league: 'D6' as const, competition: 'Regular Season' };
const base = {
  status: 'scheduled' as const,
  resultLabel: '', goalsFor: 0, goalsAgainst: 0,
  shootoutFor: null, shootoutAgainst: null,
  scoreRaw: '', kit: '', scorerNotes: '', report: '',
};

export const upcomingFixtures: Match[] = [
  {
    ...base, ...fallSeason,
    id: 'schedule-2026-11-05-peachy-puffs', date: '2026-11-05', kickoff: '9:50 PM',
    opponentId: 'opponent-peachy-puffs', opponent: 'Peachy Puffs',
    venue: 'Walden Athletic Complex', pitch: '2', homeAway: 'home',
  },
  {
    ...base, ...fallSeason,
    id: 'schedule-2026-11-12-peach-passers', date: '2026-11-12', kickoff: '9:50 PM',
    opponentId: 'opponent-peach-passers', opponent: 'Peach Passers',
    venue: 'Maynard Jackson HS', pitch: '2', homeAway: 'away',
  },
  {
    ...base, ...fallSeason,
    id: 'schedule-2026-11-19-whiff-city-fc', date: '2026-11-19', kickoff: '8:00 PM',
    opponentId: 'opponent-whiff-city-fc', opponent: 'Whiff City FC',
    venue: 'Washington HS', pitch: '2', homeAway: 'away',
  },
];
