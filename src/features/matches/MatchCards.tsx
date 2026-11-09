import { Box, CardContent, Chip, Stack, Typography } from "@mui/material";
import type { ClubData, Match } from "../../model";
import { issues, scoreResult } from "../../model";
import { opponentFor, opponentName, seasonName } from "../../clubView";
import OpponentCrest from "../../components/OpponentCrest";
import { InteractiveCard } from "../../components/layout";
import moment from "moment";

type Props = { data: ClubData; match: Match; onOpen: () => void };

export function MatchSummaryCard({ data, match, onOpen }: Props) {
  const result = scoreResult(match);
  const date = moment(match.date, "YYYY-MM-DD", true);
  const opponent = opponentFor(data, match);
  return (
    <InteractiveCard onClick={onOpen}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" gap={1}>
          <Typography variant="overline" color="text.secondary">
            {seasonName(data, match)}
          </Typography>

          <Chip
            size="small"
            label={match.status === "in_progress" ? "In Progress" : result}
            color={
              match.status === "in_progress"
                ? "warning"
                : result === "W"
                  ? "success"
                  : result === "L"
                    ? "error"
                    : "default"
            }
          />
        </Stack>
        <Box sx={{
          display: "grid",
          gridTemplateColumns: "26px minmax(0, 1fr) auto",
          alignItems: "center",
          gap: 1,
          my: 1,
          pb: 1.25,
          borderBottom: 1,
          borderColor: "divider",
        }}>
          <Box component="img" src="/crests/tbfc.png" alt="" sx={{ width: 26, height: 26, objectFit: "contain" }} />
          <Typography variant="body2" fontWeight={700}>Turf Burners FC</Typography>
          <Typography align="right" fontWeight={700}>{match.goalsFor}</Typography>
          <OpponentCrest
            url={opponent?.crestUrl}
            size={26}
            teamId={opponent?.id}
            teamName={opponent?.name}
          />
          <Typography variant="body2" fontWeight={700}>{opponentName(data, match)}</Typography>
          <Typography align="right" fontWeight={700}>{match.goalsAgainst}</Typography>
        </Box>
        {match.shootoutFor != null && match.shootoutAgainst != null && (
          <Typography variant="caption" color="text.secondary">
            Penalties {match.shootoutFor}–{match.shootoutAgainst}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary">
          {date.isValid() ? date.format("MMM D, YYYY") : "Date TBD"}
        </Typography>
        {issues(match).length > 0 && (
          <Chip
            size="small"
            color="warning"
            label="Review Source"
            sx={{ mt: 1 }}
          />
        )}
      </CardContent>
    </InteractiveCard>
  );
}

export function UpcomingFixtureCard({ data, match, onOpen }: Props) {
  const opponent = opponentFor(data, match);
  return (
    <InteractiveCard onClick={onOpen}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">
          {seasonName(data, match)}
        </Typography>

        <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 0 }}>
          <OpponentCrest
            key={opponent?.crestUrl ?? ""}
            url={opponent?.crestUrl}
            compact
            teamId={opponent?.id}
            teamName={opponent?.name}
          />
          <Typography variant="h6">{opponentName(data, match)}</Typography>
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: "bold", mb: -1, mt: 1 }}
        >
          {moment(match.date).format("MMMM Do")} ·{" "}
          <span
            style={{
              fontWeight: "bold",
              color: "#d7724c",
            }}
          >
            {match.kickoff || "TBD"}
          </span>
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {match.venue}
          {match.homeAway
            ? ` • ${match.homeAway === "home" ? "Home" : "Away"}`
            : ""}
        </Typography>
      </CardContent>
    </InteractiveCard>
  );
}
