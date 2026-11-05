import type { Match, Pitch } from './model';

const trailingPitch = /(?:,|\s+-)?\s*Pitch\s+([123])\s*$/i;

export function splitMatchLocation(venue: string, pitch?: Pitch): Pick<Match, 'venue' | 'pitch'> {
  const match = trailingPitch.exec(venue);
  const withoutPitch = match ? venue.slice(0, match.index).trim() : venue;
  return {
    venue: withoutPitch.split(/\s+-\s+/)[0].trim(),
    pitch: pitch ?? (match?.[1] as Pitch | undefined),
  };
}

export function matchLocation(match: Pick<Match, 'venue' | 'pitch'>): string {
  const { venue, pitch } = splitMatchLocation(match.venue, match.pitch);
  return [venue, pitch ? `Pitch ${pitch}` : ''].filter(Boolean).join(', ');
}
