import { Button, Stack } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Link, useSearchParams } from "react-router-dom";
import type { Match } from "../../model";
import { normalizeMatchTab } from "./matchTabs";

function kickoffMinutes(value: string) {
  const parsed = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!parsed) return 0;
  let hour = Number(parsed[1]);
  if (parsed[3]) hour = hour % 12 + (parsed[3].toUpperCase() === "PM" ? 12 : 0);
  return hour * 60 + Number(parsed[2]);
}

export default function MatchNavigation({ matches, match }: { matches: Match[]; match: Match }) {
  const [params] = useSearchParams();
  const ordered = [...matches].sort((a, b) =>
    a.date.localeCompare(b.date) ||
    kickoffMinutes(a.kickoff ?? "") - kickoffMinutes(b.kickoff ?? "") ||
    a.id.localeCompare(b.id, undefined, { numeric: true }));
  const index = ordered.findIndex(item => item.id === match.id);
  const previous = index > 0 ? ordered[index - 1] : undefined;
  const next = index >= 0 ? ordered[index + 1] : undefined;
  const route = (target: Match) =>
    `/match/${encodeURIComponent(target.id)}?tab=${normalizeMatchTab(params.get("tab"), target.status === "scheduled")}`;
  return (
    <Stack direction="row" justifyContent="space-between" gap={2} sx={{ my: 2 }}>
      <Button component={Link} to={previous ? route(previous) : "#"} disabled={!previous}
        startIcon={<ArrowBackIcon />} variant="outlined"
        title={previous ? `${previous.date} · ${previous.opponent}` : undefined}>
        Previous Match
      </Button>
      <Button component={Link} to={next ? route(next) : "#"} disabled={!next}
        endIcon={<ArrowForwardIcon />} variant="outlined"
        title={next ? `${next.date} · ${next.opponent}` : undefined}>
        Next Match
      </Button>
    </Stack>
  );
}
