import type { StandingRow } from './model';
import { csvRows } from './csv.ts';

export function parseStandingsCsv(input: string): StandingRow[] {
  const rows = csvRows(input);
  if (rows.length < 2) throw new Error('The CSV needs a header and at least one team.');
  const headers = rows[0].map(value => value.trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
  const column = (...names: string[]) => headers.findIndex(header => names.includes(header));
  const indexes = {
    rank: column('rank', 'position', 'place'),
    team: column('team', 'name'),
    wins: column('wins', 'w'),
    losses: column('losses', 'l'),
    draws: column('draws', 'd'),
    pointsScored: column('pointsscored', 'goalsfor', 'pointsfor', 'scored'),
    pointsAllowed: column('pointsallowed', 'goalsagainst', 'against', 'allowed'),
    pointDiff: column('pointdiff', 'pointsdifference', 'goaldifference', 'gd'),
    pi: column('pi'),
    rankingPoints: column('rankingpoints', 'tablepoints', 'leaguepoints'),
  };
  const required = ['rank', 'team', 'wins', 'losses', 'draws', 'pointsScored', 'pointsAllowed', 'rankingPoints'] as const;
  const missing = required.filter(key => indexes[key] < 0);
  if (missing.length) throw new Error(`Missing columns: ${missing.join(', ')}.`);
  const value = (row: string[], index: number) => index < 0 ? '' : (row[index] ?? '').trim();
  const number = (row: string[], index: number, label: string, rowNumber: number, optional = false): number | null => {
    const raw = value(row, index);
    if (optional && !raw) return null;
    if (!/^\d+$/.test(raw)) throw new Error(`Row ${rowNumber}: ${label} must be a whole number.`);
    return Number(raw);
  };
  const seenRanks = new Set<number>();
  const seenTeams = new Set<string>();
  const parsed = rows.slice(1).map((row, index): StandingRow => {
    const rowNumber = index + 2;
    const rank = number(row, indexes.rank, 'Rank', rowNumber)!;
    const team = value(row, indexes.team);
    if (rank < 1) throw new Error(`Row ${rowNumber}: Rank must be at least 1.`);
    if (!team) throw new Error(`Row ${rowNumber}: Team is required.`);
    if (seenRanks.has(rank)) throw new Error(`Row ${rowNumber}: Rank ${rank} is duplicated.`);
    if (seenTeams.has(team.toLowerCase())) throw new Error(`Row ${rowNumber}: ${team} is duplicated.`);
    seenRanks.add(rank);
    seenTeams.add(team.toLowerCase());
    const wins = number(row, indexes.wins, 'Wins', rowNumber)!;
    const losses = number(row, indexes.losses, 'Losses', rowNumber)!;
    const draws = number(row, indexes.draws, 'Draws', rowNumber)!;
    const pointsScored = number(row, indexes.pointsScored, 'Points Scored', rowNumber)!;
    const pointsAllowed = number(row, indexes.pointsAllowed, 'Points Allowed', rowNumber)!;
    const rankingPoints = number(row, indexes.rankingPoints, 'Ranking Points', rowNumber)!;
    const pi = number(row, indexes.pi, 'PI', rowNumber, true);
    const suppliedDiff = indexes.pointDiff < 0 ? null : value(row, indexes.pointDiff);
    const pointDiff = pointsScored - pointsAllowed;
    if (suppliedDiff !== null && suppliedDiff !== '' && (!/^-?\d+$/.test(suppliedDiff) || Number(suppliedDiff) !== pointDiff)) {
      throw new Error(`Row ${rowNumber}: Point Diff must equal Points Scored minus Points Allowed (${pointDiff}).`);
    }
    return { rank, team, wins, losses, draws, pointsScored, pointsAllowed, pi, rankingPoints };
  });
  return parsed.sort((a, b) => a.rank - b.rank);
}
