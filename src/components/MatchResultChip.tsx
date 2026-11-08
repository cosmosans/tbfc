import { Chip } from "@mui/material";
import { useState } from "react";
import type { Match } from "../model";
import { scoreResult } from "../model";
import { matchPhase } from "../features/matches/matchClock";

export default function MatchResultChip({ match }: { match: Match }) {
  const [viewedAt] = useState(Date.now);
  if (match.status === "in_progress") {
    const phase = matchPhase(match, viewedAt);
    let label = "In Progress";
    if (phase?.label === "HALF TIME") label = "HT";
    else if (phase?.label === "FULL TIME") label = "FT";
    else if (phase) label = `${Math.floor(phase.seconds / 60) + 1}'`;
    return <Chip size="small" label={label} color="warning" />;
  }
  const result = scoreResult(match);
  const color = { W: "success", D: "default", L: "error" } as const;
  return <Chip size="small" label={result} color={color[result]} />;
}
