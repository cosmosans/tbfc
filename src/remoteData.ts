import type { ClubData } from './model';

export type RemoteClub = { revision: number; data: ClubData | null; updatedAt?: string };

async function readResponse(response: Response) {
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || `Database request failed (${response.status}).`);
  return body;
}

export async function fetchClubData(): Promise<RemoteClub> {
  return readResponse(await fetch('/api/club', { cache: 'no-store' })) as Promise<RemoteClub>;
}

export async function publishClubData(data: ClubData, revision: number): Promise<number> {
  const result = await readResponse(await fetch('/api/club', {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ data, revision }),
  }));
  return result.revision as number;
}
