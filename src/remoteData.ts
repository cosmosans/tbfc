import { clubApiRequest } from "./clubApiRequest";
import { eventOnlyPlayerData } from "./playerData";
import { canEditClub } from "./editAccess";
import type { ClubData, Match, MatchEvent } from './model';

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
  // Match chats are an archival scrapbook. Ordinary club publishing never writes them.
  const matches = data.matches.map(({ chat: _chat, ...match }) => match);
  return { ...data, players, matches };
}


export type RemoteClub = { revision: number; data: ClubData | null; updatedAt?: string; supportsIncremental?: boolean; admin?: boolean };

class ClubApiError extends Error {
  constructor(readonly status: number, message: string) { super(message); }
}

async function readResponse(response: Response) {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ClubApiError(response.status, body?.error || `Club API unavailable (HTTP ${response.status}).`);
  }
  return response.json();
}

async function readPublicApi(path: `/api/${string}`) {
  return readResponse(await clubApiRequest(path, { cache: 'no-store', credentials: 'same-origin' }));
}

type ClubSnapshot = RemoteClub & { access?: string };
type Manifest = ClubSnapshot & { pages?: { start: number; end: number }[]; unchanged?: boolean };

async function readClubSnapshot(previous?: ClubSnapshot): Promise<ClubSnapshot> {
  const query = new URLSearchParams({ view: 'manifest' });
  if (previous?.access) {
    query.set('access', previous.access);
    query.set('revision', String(previous.revision));
  }
  const manifest: Manifest = await readPublicApi(`/api/club?${query}`);
  if (manifest.unchanged && previous && previous.revision === manifest.revision && previous.access === manifest.access) return previous;
  // Older deployments return the full snapshot even when a manifest is requested.
  if (!manifest.pages) return manifest;
  const data = Object.fromEntries(collections.map(name => [name, []])) as unknown as ClubData;
  for (let index = 0; index < manifest.pages.length; index += 3) {
    const slices = await Promise.all(manifest.pages.slice(index, index + 3).map(async ({ start, end }) => {
      const params = new URLSearchParams({
        view: 'page', start: String(start), end: String(end),
        revision: String(manifest.revision), access: manifest.access!,
      });
      const page: ClubSnapshot = await readPublicApi(`/api/club?${params}`);
      if (!page.data || page.revision !== manifest.revision || page.access !== manifest.access) {
        throw new Error('Invalid club data page.');
      }
      return page.data;
    }));
    for (const slice of slices) {
      for (const name of collections) (data[name] as unknown[]).push(...slice[name]);
    }
  }
  return { revision: manifest.revision, updatedAt: manifest.updatedAt, supportsIncremental: manifest.supportsIncremental, admin: manifest.admin, access: manifest.access, data };
}

let baseline: ClubSnapshot | undefined;
const keyFor = (collection: string, item: Record<string, unknown>) =>
  String(item[collection === 'lineups' || collection === 'boards' ? 'matchId' : collection === 'standings' ? 'seasonId' : 'id']);

export async function fetchClubData(): Promise<RemoteClub> {
  let snapshot: ClubSnapshot;
  try {
    snapshot = await readClubSnapshot(baseline);
  } catch (error) {
    if (!(error instanceof ClubApiError) || ![409, 503].includes(error.status)) throw error;
    await new Promise(resolve => setTimeout(resolve, 1000));
    snapshot = await readClubSnapshot(baseline);
  }
  baseline = snapshot;
  if (canEditClub && baseline.data && baseline.admin === false) throw new Error('The club admin key is not accepted. Check it before editing or publishing, so private chats stay intact.');
  return { ...baseline, data: baseline.data ? withFirstChoice(eventOnlyPlayerData(baseline.data)) : null };
}

export async function fetchMatchEvents(matchId: string): Promise<{ match: Match | null; events: MatchEvent[] }> {
  const query = new URLSearchParams({ matchId });
  const { match, events } = await readPublicApi(`/api/match-events?${query}`);
  if (!Array.isArray(events) || !events.every(event => event?.matchId === matchId)) {
    throw new Error('Invalid match events response.');
  }
  if (match && match.id !== matchId) throw new Error('Invalid match response.');
  return { match, events };
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
      const comparableRows = collection === 'matches'
        ? oldRows.map(({ chat: _chat, ...match }) => match)
        : oldRows;
      const previous = new Map(comparableRows.map(item => [keyFor(collection, item), JSON.stringify(item)]));
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
  const result = await readResponse(await clubApiRequest('/api/club', {
    method: 'PUT',
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(incremental ? { changes, revision } : { data, revision }),
  }));
  baseline = { data: structuredClone(data), revision: result.revision, supportsIncremental: baseline?.supportsIncremental, admin: baseline?.admin };
  return result.revision as number;
}
