import type { Match } from "./model";

export function parseCompetition(competition: string, league = "") {
  const value = competition.trim();
  const combined = /^(D[56])\s*[-–—]\s*(.*)$/i.exec(value || league.trim());
  const standaloneLeague = /^(D[56])$/i.exec(league.trim());
  return {
    league: (standaloneLeague?.[1] || combined?.[1] || "").toUpperCase() as Match["league"],
    competition: value ? (combined && value === combined[0] ? combined[2].trim() : value) : combined?.[2]?.trim() || "",
  };
}

export function splitCompetition(match: Match): Match {
  return {
    ...match,
    ...parseCompetition(match.competition ?? "", match.league ?? ""),
  };
}
