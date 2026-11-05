import type { Pitch } from './model';
import { splitMatchLocation } from './matchLocation';
import { csvRows } from './csv';

export type FixtureRow = {
  row: number;
  date: string;
  opponent: string;
  venue: string;
  pitch?: Pitch;
  kickoff: string;
  homeAway?: 'home' | 'away';
  competition: string;
  kit: string;
  error?: string;
};

function dateValue(value: string): string | null {
  const trimmed = value.trim();
  let year: number, month: number, day: number;
  let match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(trimmed);
  if (match) [, year, month, day] = match.map(Number);
  else {
    match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
    if (!match) return null;
    month = Number(match[1]); day = Number(match[2]); year = Number(match[3]);
  }
  const date = new Date(Date.UTC(year!, month! - 1, day!));
  if (date.getUTCFullYear() !== year! || date.getUTCMonth() + 1 !== month! || date.getUTCDate() !== day!) return null;
  return `${year!}-${String(month!).padStart(2, '0')}-${String(day!).padStart(2, '0')}`;
}

export function parseScheduleCsv(input: string): FixtureRow[] {
  const rows = csvRows(input);
  if (!rows.length) throw new Error('The CSV is empty.');
  const headers = rows[0].map(value => value.trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
  const column = (...names: string[]) => headers.findIndex(header => names.includes(header));
  const dateIndex = column('date', 'matchdate');
  const opponentIndex = column('opponent', 'team', 'opposingteam');
  if (dateIndex < 0 || opponentIndex < 0) throw new Error('The CSV needs Date and Opponent columns.');
  const venueIndex = column('location', 'venue', 'field');
  const pitchIndex = column('pitch');
  const kickoffIndex = column('time', 'kickoff', 'kickofftime');
  const competitionIndex = column('leaguetype', 'competition', 'league');
  const kitIndex = column('kitcolor', 'kit');
  const homeAwayIndex = column('homeaway', 'homevisitor');
  const get = (row: string[], index: number) => index < 0 ? '' : (row[index] ?? '').trim();
  return rows.slice(1).map((row, index) => {
    const rawDate = get(row, dateIndex), opponent = get(row, opponentIndex);
    const date = dateValue(rawDate);
    const side = get(row, homeAwayIndex).toLowerCase();
    const pitchText = get(row, pitchIndex).replace(/^pitch\s*/i, '');
    const pitchValid = !pitchText || ['1', '2', '3'].includes(pitchText);
    const location = splitMatchLocation(get(row, venueIndex), pitchValid && pitchText ? pitchText as Pitch : undefined);
    return {
      row: index + 2, date: date ?? rawDate, opponent,
      venue: location.venue, pitch: location.pitch, kickoff: get(row, kickoffIndex),
      homeAway: side === 'home' ? 'home' : side === 'away' || side === 'visitor' ? 'away' : undefined,
      competition: get(row, competitionIndex), kit: get(row, kitIndex),
      error: !date ? 'Invalid date' : !opponent ? 'Missing opponent' : !pitchValid ? 'Pitch must be 1, 2, or 3' : undefined,
    };
  });
}
