import type { StandingsSnapshot } from '../model';

// League table transcribed from the screenshot supplied on 2026-11-05.
export const seedStandings: StandingsSnapshot[] = [{
  seasonId: 'season-fall-2026',
  updatedOn: '2026-11-05',
  rows: [
    { rank: 1, team: 'Peachy Puffs', wins: 2, losses: 0, draws: 1, pointsScored: 12, pointsAllowed: 3, pi: 4, rankingPoints: 7 },
    { rank: 2, team: 'Inter Your Mom', wins: 1, losses: 0, draws: 2, pointsScored: 6, pointsAllowed: 3, pi: 3, rankingPoints: 5 },
    { rank: 3, team: 'Whiff City FC', wins: 1, losses: 0, draws: 2, pointsScored: 4, pointsAllowed: 2, pi: 4, rankingPoints: 5 },
    { rank: 4, team: 'Turf Burners FC', wins: 1, losses: 1, draws: 1, pointsScored: 4, pointsAllowed: 4, pi: 0, rankingPoints: 4 },
    { rank: 5, team: 'Peach Passers', wins: 1, losses: 1, draws: 1, pointsScored: 3, pointsAllowed: 4, pi: 3, rankingPoints: 4 },
    { rank: 6, team: 'Shooting Stars FC', wins: 1, losses: 1, draws: 1, pointsScored: 8, pointsAllowed: 10, pi: 0, rankingPoints: 4 },
    { rank: 7, team: 'Orange Slices', wins: 1, losses: 2, draws: 0, pointsScored: 4, pointsAllowed: 7, pi: 4, rankingPoints: 3 },
    { rank: 8, team: 'All Luck No Skill', wins: 0, losses: 3, draws: 0, pointsScored: 6, pointsAllowed: 14, pi: 0, rankingPoints: 0 },
  ],
}];
