import { CardContent, Chip, Stack, Typography } from "@mui/material";
import type { ClubData, Match } from "../../model";
import { displayScore, issues, scoreResult } from "../../model";
import { opponentFor, opponentName, seasonName } from "../../clubView";
import OpponentCrest from "../../components/OpponentCrest";
import { InteractiveCard } from "../../components/layout";
import WhiteKitImage from "../../img/white-front.png";
import BlackKitImage from "../../img/black-front.png";
import { matchLocation } from "../../matchLocation";
import moment from "moment";

type Props = { data: ClubData; match: Match; onOpen: () => void };

export function MatchSummaryCard({ data, match, onOpen }: Props) {
  const result = scoreResult(match);
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
        <Stack direction="row" alignItems="center" gap={1.5} sx={{ my: 1 }}>
          <OpponentCrest
            key={opponent?.crestUrl ?? ""}
            url={opponent?.crestUrl}
            compact
            teamId={opponent?.id}
            teamName={opponent?.name}
          />
          <Typography variant="h6">{opponentName(data, match)}</Typography>
        </Stack>
        <Typography variant="h5" color="primary">
          {displayScore(match)}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1, display: "flex", alignItems: "center", fontSize: 12 }}
        >
          <img
            src={match.kit === "White" ? WhiteKitImage : BlackKitImage}
            alt={`${match.kit} kit`}
            style={{ width: 30, height: 30, marginRight: 5 }}
          />
          {matchLocation(match)}
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
