import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import type { ClubData, Match, Opponent } from "../../model";
import { record } from "../../model";
import OpponentCrest from "../../components/OpponentCrest";
import RecordBar from "../../components/RecordBar";
import { CardGrid } from "../../components/layout";
import { MatchSummaryCard, UpcomingFixtureCard } from "../matches/MatchCards";
import SoccerBallIcon from "../../img/soccer-ball-variant.svg";

export default function TeamDetail({
  data,
  team,
  onBack,
  onOpenMatch,
}: {
  data: ClubData;
  team: Opponent;
  onBack: () => void;
  onOpenMatch: (match: Match) => void;
}) {
  const matches = data.matches.filter(
    (match) =>
      match.opponentId === team.id ||
      match.opponent.trim().toLowerCase() === team.name.trim().toLowerCase(),
  );
  const played = matches
    .filter((match) => match.status !== "scheduled")
    .sort((a, b) => b.date.localeCompare(a.date));
  const upcoming = matches
    .filter((match) => match.status === "scheduled")
    .sort((a, b) => a.date.localeCompare(b.date));
  const results = record(matches);

  return (
    <Stack gap={3}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={onBack}
        sx={{ alignSelf: "flex-start" }}
      >
        Back to Teams
      </Button>
      <Card sx={{ bgcolor: "#171a1c", border: 0 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="overline" color="primary">
            Head to head · All Seasons
          </Typography>
          <Stack
            direction="row"
            gap={{ xs: 1, sm: 2 }}
            alignItems="center"
            sx={{ my: 2 }}
          >
            <OpponentCrest url={team.crestUrl} size={100} />

            <Typography variant="h4" fontWeight={900} textAlign="center">
              {team.name}
            </Typography>
          </Stack>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mt: `5px`,
              paddingInline: `5px`,
            }}
          >
            <Typography
              sx={{ display: "flex", alignItems: "center", fontSize: 14 }}
              color="text.secondary"
            >
              {" "}
              {results.against}
              <img
                src={SoccerBallIcon}
                alt="Soccer ball"
                style={{
                  width: 15,
                  height: 15,
                  marginInline: 5,
                }}
              />
            </Typography>

            <Box sx={{ flex: 1 }}>
              <RecordBar
                opponentWins={results.L}
                draws={results.D}
                tbfcWins={results.W}
                opponentColor={team.color}
              />
            </Box>

            <Typography
              sx={{ display: "flex", alignItems: "center", fontSize: 14 }}
              color="text.secondary"
            >
              <img
                src={SoccerBallIcon}
                alt="Soccer ball"
                style={{ width: 15, height: 15, marginInline: 5 }}
              />{" "}
              {results.for}
            </Typography>
          </Box>
          <Typography textAlign="center" color="text.secondary" sx={{ mt: 2 }}>
            {results.played} Matches Played
          </Typography>
          {team.notes && (
            <Typography sx={{ mt: 2, whiteSpace: "pre-wrap" }}>
              {team.notes}
            </Typography>
          )}
        </CardContent>
      </Card>
      {upcoming.length > 0 && (
        <section>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Upcoming
          </Typography>
          <CardGrid>
            {upcoming.map((match) => (
              <UpcomingFixtureCard
                key={match.id}
                data={data}
                match={match}
                onOpen={() => onOpenMatch(match)}
              />
            ))}
          </CardGrid>
        </section>
      )}
      <section>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Match History · All Seasons
        </Typography>
        {played.length ? (
          <CardGrid>
            {played.map((match) => (
              <MatchSummaryCard
                key={match.id}
                data={data}
                match={match}
                onOpen={() => onOpenMatch(match)}
              />
            ))}
          </CardGrid>
        ) : (
          <Typography color="text.secondary">
            No completed matches yet.
          </Typography>
        )}
      </section>
    </Stack>
  );
}
