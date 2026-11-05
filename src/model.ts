export type Pitch = "1" | "2" | "3";

export type Match = {
  id: string;
  status?: "scheduled" | "completed";
  seasonId?: string;
  opponentId?: string;
  season: string;
  competition: string;
  date: string;
  opponent: string;
  venue: string;
  locationId?: string;
  pitch?: Pitch;
  kickoff: string;
  homeAway?: "home" | "away";
  resultLabel: string;
  goalsFor: number;
  goalsAgainst: number;
  shootoutFor?: number | null;
  shootoutAgainst?: number | null;
  scoreRaw: string;
  kit: string;
  scorerNotes: string;
  report: string;
  sourceRow?: number;
};

export const positions = [
  "ST",
  "CAM",
  "CDM",
  "LW",
  "LB",
  "RW",
  "RB",
  "GK",
] as const;
export type Position = (typeof positions)[number];
export type Player = {
  id: string;
  name: string;
  number: string;
  active: boolean;
  photoUrl?: string;
  preferredPosition?: Position | "";
  secondaryPosition?: Position | "";
  historicalStats?: {
    goals: number;
    assists: number;
    penaltySaves: number;
    yellowCards: number;
  };
};
export type Opponent = {
  id: string;
  name: string;
  crestUrl: string;
  color: string;
  notes: string;
};
export type Season = {
  id: string;
  name: string;
  notes: string;
  startsOn?: string;
};
export type Location = {
  id: string;
  name: string;
  address: string;
  imageUrl: string;
};
export type StandingRow = {
  rank: number;
  team: string;
  wins: number;
  losses: number;
  draws: number;
  pointsScored: number;
  pointsAllowed: number;
  pi: number | null;
  rankingPoints: number;
};
export type StandingsSnapshot = {
  seasonId: string;
  updatedOn: string;
  rows: StandingRow[];
};
export type MatchEvent = {
  id: string;
  matchId: string;
  kind: "goal" | "assist" | "yellow_card" | "penalty_save" | "note";
  /** Team credited with a goal, or assigned to a card or penalty save. Older events belong to TBFC. */
  team?: "tbfc" | "opponent";
  ownGoal?: boolean;
  /** A goal credited to the team when no individual scorer is known. */
  teamGoal?: boolean;
  playerId?: string;
  minute?: number;
  note?: string;
};
export type Point = { x: number; y: number };
export type Marker = {
  id: string;
  label: string;
  playerNumber?: string;
  team: "tbfc" | "opponent" | "ball";
  point: Point;
};
export type Board = {
  matchId: string;
  formation?: Formation;
  markers: Marker[];
  notes: string;
};
export type Formation = "1-2-3-1" | "1-3-3";
export type Lineup = {
  matchId: string;
  formation: Formation;
  starters: string[];
  bench: string[];
  benchPositions?: Record<string, Position>;
};
export type ClubData = {
  matches: Match[];
  players: Player[];
  opponents: Opponent[];
  seasons: Season[];
  locations: Location[];
  events: MatchEvent[];
  lineups: Lineup[];
  boards: Board[];
  standings: StandingsSnapshot[];
};

export function scoreResult(match: Match): "W" | "L" | "D" {
  if (match.goalsFor > match.goalsAgainst) return "W";
  if (match.goalsFor < match.goalsAgainst) return "L";
  if (match.shootoutFor != null && match.shootoutAgainst != null) {
    return match.shootoutFor > match.shootoutAgainst
      ? "W"
      : match.shootoutFor < match.shootoutAgainst
        ? "L"
        : "D";
  }
  return "D";
}

export function record(matches: Match[]) {
  return matches.reduce(
    (acc, match) => {
      if (match.status === "scheduled") return acc;
      acc.played += 1;
      acc[scoreResult(match)] += 1;
      acc.for += match.goalsFor;
      acc.against += match.goalsAgainst;
      return acc;
    },
    { played: 0, W: 0, L: 0, D: 0, for: 0, against: 0 },
  );
}

export function displayScore(match: Match): string {
  const regular = `${match.goalsFor} – ${match.goalsAgainst}`;
  return match.shootoutFor != null && match.shootoutAgainst != null
    ? `${regular} (${match.shootoutFor}–${match.shootoutAgainst})`
    : regular;
}

export function issues(match: Match): string[] {
  const result: string[] = [];
  if (match.status === "scheduled") return result;
  if (match.resultLabel && match.resultLabel !== scoreResult(match))
    result.push("Result label differs from score");
  if (match.scoreRaw.includes("(") && match.shootoutFor == null)
    result.push("Score contains an unparsed notation");
  return result;
}
