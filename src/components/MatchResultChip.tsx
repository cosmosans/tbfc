import { Chip } from "@mui/material";
import type { Match } from "../model";
import { scoreResult } from "../model";

export default function MatchResultChip({ match }: { match: Match }) {
  if (match.status === "in_progress") {
    return <Chip size="small" label="In Progress" color="warning" />;
  }
  const result = scoreResult(match);
  const color = { W: "success", D: "default", L: "error" } as const;
  return <Chip size="small" label={result} color={color[result]} />;
}
