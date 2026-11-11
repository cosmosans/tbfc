import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import type { ClubData, Match, Opponent } from "../../model";
import { record } from "../../model";
import OpponentCrest from "../../components/OpponentCrest";
import RecordBar from "../../components/RecordBar";
import { CardGrid } from "../../components/layout";
import { MatchSummaryCard, UpcomingFixtureCard } from "../matches/MatchCards";
import SoccerBallIcon from "../../img/soccer-ball-variant.svg";

const teamImageShadow = "drop-shadow(2px 4px 6px rgba(0,0,0,.4))";

export default function TeamDetail({
  data,
  team,
  onOpenMatch,
}: {
  data: ClubData;
  team: Opponent;
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
      <Card
        sx={{
          mx: { xs: 0, sm: -2, md: -3, lg: -4 },
          bgcolor: team.color
            ? `color-mix(in srgb, ${team.color} 62%, black)`
            : "#171a1c",
          border: 0,
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack
            direction="row"
            gap={{ xs: 1, sm: 2 }}
            justifyContent="center"
            alignItems="center"
            sx={{ my: 2 }}
          >
            <Box
              sx={{
                display: "flex",
                "& img, & svg": { filter: teamImageShadow },
              }}
            >
              <OpponentCrest url={team.crestUrl} size={100} mobileSize={56} />
            </Box>

            <Typography
              variant="h4"
              fontWeight={900}
              textAlign="center"
              sx={{ minWidth: 0, overflowWrap: "anywhere" }}
            >
              {team.name}
            </Typography>

            {team.kitImageUrl && (
              <Box
                component="img"
                src={team.kitImageUrl}
                alt={team.name + " kit"}
                sx={{
                  display: "block",
                  width: { xs: 56, sm: 100 },
                  height: { xs: 64, sm: 108 },
                  flexShrink: 0,
                  objectFit: "contain",
                  filter: teamImageShadow,
                }}
              />
            )}
          </Stack>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              maxWidth: 768,
              mx: "auto",
              mt: "5px",
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
                key={team.id}
                revealOnMount
                opponentCrestUrl={team.crestUrl}
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
          <Typography
            textAlign="center"
            sx={{ mt: 1, textTransform: "uppercase", fontSize: 12 }}
          >
            {results.played} Match{results.played === 1 ? "" : "es"} Played
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
          Match History
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
