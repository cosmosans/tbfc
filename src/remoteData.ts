import { eventOnlyPlayerData } from "./playerData";
import { canEditClub } from "./editAccess";
import type { ClubData } from './model';

const collections = ['matches', 'players', 'opponents', 'seasons', 'locations', 'events', 'lineups', 'boards', 'standings'] as const;

function withFirstChoice(data: ClubData): ClubData {
  return { ...data, firstChoice: Object.fromEntries(data.players.filter(player => player.firstChoicePosition).map(player => [player.firstChoicePosition, player.id])) };
}

function forRemote(data: ClubData): ClubData {
  const players = data.players.map(player => {
    const firstChoicePosition = Object.entries(data.firstChoice ?? {}).find(([, id]) => id === player.id)?.[0] as typeof player.firstChoicePosition;
    const { firstChoicePosition: _old, ...rest } = player;
    return firstChoicePosition ? { ...rest, firstChoicePosition } : rest;
  });
  return { ...data, players };
}


export type RemoteClub = { revision: number; data: ClubData | null; updatedAt?: string; supportsIncremental?: boolean; admin?: boolean };

async function readResponse(response: Response) {
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || `Database request failed (${response.status}).`);
  return body;
}

let baseline: RemoteClub | undefined;
const keyFor = (collection: string, item: Record<string, unknown>) =>
  String(item[collection === 'lineups' || collection === 'boards' ? 'matchId' : collection === 'standings' ? 'seasonId' : 'id']);

export async function fetchClubData(): Promise<RemoteClub> {
  baseline = await readResponse(await fetch('/api/club', { cache: 'no-store' })) as RemoteClub;
  if (canEditClub && baseline.data && baseline.admin === false) throw new Error('The club admin key is not accepted. Check it before editing or publishing, so private chats stay intact.');
  return { ...baseline, data: baseline.data ? withFirstChoice(eventOnlyPlayerData(baseline.data)) : null };
}

export async function publishClubData(data: ClubData, revision: number): Promise<number> {
  if (canEditClub && baseline?.data && baseline.admin === false) throw new Error("The club admin key is not accepted. Reload after correcting it before publishing.");
  data = eventOnlyPlayerData(forRemote(data));
  // Only use a baseline from the exact revision this draft was based on.
  const changes: Array<{ collection: string; id: string; item: unknown }> = [];
  if (baseline?.data && baseline.revision === revision) {
    for (const collection of collections) {
      const rows = data[collection];
      const oldRows = (baseline.data as unknown as Record<string, Record<string, unknown>[]>)[collection] ?? [];
      const previous = new Map(oldRows.map(item => [keyFor(collection, item), JSON.stringify(item)]));
      for (const item of rows as Record<string, unknown>[]) {
        const id = keyFor(collection, item);
        if (previous.get(id) !== JSON.stringify(item)) changes.push({ collection, id, item });
        previous.delete(id);
      }
      for (const id of previous.keys()) changes.push({ collection, id, item: null });
    }
  }
  const incremental = baseline?.supportsIncremental === true && baseline.data && baseline.revision === revision;
  if (incremental && !changes.length) return revision;
  const result = await readResponse(await fetch('/api/club', {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(incremental ? { changes, revision } : { data, revision }),
  }));
  baseline = { data: structuredClone(data), revision: result.revision, supportsIncremental: baseline?.supportsIncremental, admin: baseline?.admin };
  return result.revision as number;
}
