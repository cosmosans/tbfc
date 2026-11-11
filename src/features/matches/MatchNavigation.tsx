import { canEditClub } from "../../editAccess";
import { Box, Button, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Link, useSearchParams } from "react-router-dom";
import { seasonName } from "../../clubView";
import type { ClubData, Match } from "../../model";
import { normalizeMatchTab } from "./matchTabs";

function kickoffMinutes(value: string) {
  const parsed = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!parsed) return 0;
  let hour = Number(parsed[1]);
  if (parsed[3])
    hour = (hour % 12) + (parsed[3].toUpperCase() === "PM" ? 12 : 0);
  return hour * 60 + Number(parsed[2]);
}

export default function MatchNavigation({
  data,
  match,
}: {
  data: ClubData;
  match: Match;
}) {
  const [params] = useSearchParams();
  const ordered = [...data.matches].sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      kickoffMinutes(a.kickoff ?? "") - kickoffMinutes(b.kickoff ?? "") ||
      a.id.localeCompare(b.id, undefined, { numeric: true }),
  );
  const index = ordered.findIndex((item) => item.id === match.id);
  const previous = index > 0 ? ordered[index - 1] : undefined;
  const next = index >= 0 ? ordered[index + 1] : undefined;
  const season = seasonName(data, match);
  const matchSuffix = (
    <Box
      component="span"
      sx={{ display: { xs: "none", sm: "inline" }, ml: "0.25em" }}
    >
      Match
    </Box>
  );
  const route = (target: Match) =>
    `/match/${encodeURIComponent(target.id)}?tab=${normalizeMatchTab(params.get("tab"), target.status === "scheduled", canEditClub)}`;
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr minmax(0, auto) 1fr",
        alignItems: "center",
        gap: { xs: 1, sm: 2 },
        my: 1.5,
      }}
    >
      <Button
        component={Link}
        to={previous ? route(previous) : "#"}
        disabled={!previous}
        sx={{ justifySelf: "start" }}
        startIcon={<ArrowBackIcon />}
        variant="outlined"
        title={previous ? `${previous.date} · ${previous.opponent}` : undefined}
      >
        Previous{matchSuffix}
      </Button>
      <Typography
        className="match-nav-season-competition"
        variant="caption"
        align="center"
        sx={{
          textTransform: "uppercase",
          fontWeight: "normal",
          opacity: 0.7,
          lineHeight: { xs: 1.33, sm: 1.66 },
          letterSpacing: ".06em",
        }}
      >
        {season && <span>{season}</span>}
        {season && match.competition && (
          <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
            {" "}
            •{" "}
          </Box>
        )}
        {match.competition && (
          <Box component="span" sx={{ display: { xs: "block", sm: "inline" } }}>
            {match.competition}
          </Box>
        )}
      </Typography>
      <Button
        component={Link}
        to={next ? route(next) : "#"}
        disabled={!next}
        sx={{ justifySelf: "end" }}
        endIcon={<ArrowForwardIcon />}
        variant="outlined"
        title={next ? `${next.date} · ${next.opponent}` : undefined}
      >
        Next{matchSuffix}
      </Button>
    </Box>
  );
}
