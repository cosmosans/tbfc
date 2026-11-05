import { Fragment } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import type { ClubData, Match } from "../../model";
import { record } from "../../model";
import { opponentFor, opponentName, seasonName } from "../../clubView";
import OpponentCrest from "../../components/OpponentCrest";
import RecordBar from "../../components/RecordBar";
import moment from "moment";
import { splitMatchLocation } from "../../matchLocation";
import WhiteKitImage from "../../img/white-front.png";
import BlackKitImage from "../../img/black-front.png";

const Panel = styled(Card)({
  borderRadius: 0,
  background: "#171a1c",
  border: 0,
});
const Versus = styled(Typography)({
  fontWeight: 900,
  fontSize: "2rem",
  textTransform: "uppercase",
  width: 135,
  textAlign: "center",
});
const HomeCrest = styled("img")({
  width: "min(30vw, 165px)",
  height: "min(30vw, 165px)",
  objectFit: "contain",
  filter: "drop-shadow(0 3px 5px #0009)",
});
export function ResultLabel({ result }: { result: string }) {
  const style = {
    padding: 1,
    py: 0.5,
  };
  if (result === "W") {
    return (
      <Typography
        variant="caption"
        sx={{
          backgroundColor: "success.main",
          color: "white",
          ...style,
        }}
      >
        WIN
      </Typography>
    );
  }
  if (result === "L") {
    return (
      <Typography
        variant="caption"
        sx={{
          backgroundColor: "error.main",
          ...style,
        }}
      >
        LOSS
      </Typography>
    );
  }

  return (
    <Typography
      sx={{
        backgroundColor: "#666",
        ...style,
      }}
      variant="caption"
    >
      DRAW
    </Typography>
  );
}

export default function MatchBanner({
  data,
  match,
  onOpen,
  onEdit,
  detail = false,
}: {
  data: ClubData;
  match: Match;
  onOpen?: () => void;
  onEdit?: () => void;
  detail?: boolean;
}) {
  const opponent = opponentFor(data, match);
  const location =
    data.locations.find((item) => item.id === match.locationId) ??
    data.locations.find(
      (item) =>
        item.name.toLowerCase() ===
        splitMatchLocation(match.venue).venue.toLowerCase(),
    );
  const headToHead = record(
    data.matches.filter(
      (item) =>
        item.opponentId === opponent?.id || item.opponent === match.opponent,
    ),
  );
  console.log(data, match, detail);
  return (
    <Box>
      <Panel
        sx={{
          ...(location?.imageUrl
            ? {
                backgroundImage: `linear-gradient(180deg, rgba(12, 14, 16, .58), rgba(12, 14, 16, .88)), url(${JSON.stringify(location.imageUrl)})`,
                backgroundSize: "cover",
                backgroundPosition: "bottom",
              }
            : {}),
          ...(onOpen
            ? {
                cursor: "pointer",
                transition: "transform .15s ease",
                "&:hover": { transform: "translateY(-2px)" },
                "&:focus-visible": {
                  outline: "3px solid #f47730",
                  outlineOffset: 3,
                },
              }
            : {}),
        }}
        role={onOpen ? "button" : undefined}
        tabIndex={onOpen ? 0 : undefined}
        aria-label={
          onOpen
            ? `Open match event for ${opponentName(data, match)}`
            : undefined
        }
        onClick={onOpen}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (onOpen && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            onOpen();
          }
        }}
      >
        <CardContent
          className="match-banner-content"
          sx={{ p: { xs: 2, sm: 3 } }}
        >
          {detail && (
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              gap={2}
              sx={{ mb: 2 }}
            >
              <Typography
                variant="overline"
                color="primary"
                sx={{ background: "black", paddingInline: 1 }}
              >
                {seasonName(data, match)} · {match.competition}
              </Typography>

              {onEdit && (
                <Button variant="outlined" onClick={onEdit}>
                  EDIT MATCH
                </Button>
              )}
            </Stack>
          )}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            gap={{ xs: 1, sm: 2 }}
          >
            {(["left", "right"] as const).map((side) => {
              const isOpponent =
                side === "left"
                  ? match.homeAway !== "away"
                  : match.homeAway === "away";

              return (
                <Fragment key={side}>
                  {side === "right" && match.status === "scheduled" && (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Versus>VS</Versus>
                      <Chip
                        size="small"
                        label="Upcoming"
                        color="info"
                        sx={{ textTransform: "uppercase" }}
                      />
                    </Box>
                  )}
                  {side === "right" && match.status === "completed" && (
                    <Box sx={{}}>
                      <Typography
                        sx={{
                          fontWeight: 900,
                          fontSize: "4rem",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {isOpponent ? match.goalsFor : match.goalsAgainst}
                        {side === "right" && <> - </>}
                        {isOpponent ? match.goalsAgainst : match.goalsFor}
                      </Typography>

                      {side === "right" && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <ResultLabel result={match.resultLabel} />
                        </Box>
                      )}
                    </Box>
                  )}
                  <Stack alignItems="center" gap={1} sx={{ minWidth: 0 }}>
                    {isOpponent ? (
                      <OpponentCrest
                        key={opponent?.crestUrl ?? ""}
                        url={opponent?.crestUrl}
                        size={165}
                        teamId={opponent?.id}
                        teamName={opponent?.name}
                      />
                    ) : (
                      <HomeCrest src="/crests/tbfc.png" alt="TBFC crest" />
                    )}
                    <Typography fontWeight={800} textAlign="center">
                      {isOpponent
                        ? opponentName(data, match)
                        : "Turf Burners FC"}
                    </Typography>
                    {match.homeAway && (
                      <Typography
                        textAlign="center"
                        color="text.secondary"
                        sx={{
                          textTransform: "uppercase",
                          letterSpacing: 1,
                          fontSize: 10,
                        }}
                      >
                        {side === "left" ? "Away" : "Home"}
                      </Typography>
                    )}
                  </Stack>
                </Fragment>
              );
            })}
          </Stack>
          <Box sx={{ mt: 2 }}>
            <RecordBar
              opponentWins={headToHead.L}
              draws={headToHead.D}
              tbfcWins={headToHead.W}
              opponentColor={opponent?.color}
              reverse={match.homeAway === "away"}
            />
          </Box>

          <Box
            className="match-banner-info"
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              mt: 2,
            }}
          >
            {match.kit === "White" && (
              <img style={{ width: 80 }} src={WhiteKitImage} alt="White kit" />
            )}

            {match.kit === "Black" && (
              <img style={{ width: 80 }} src={BlackKitImage} alt="Black kit" />
            )}

            <Box sx={{ marginLeft: 1 }}>
              <Typography
                sx={{
                  fontSize: 20,
                  fontWeight: 700,
                  textShadow: "0 0 3px rgba(0,0,0,0.3)",
                  textAlign: "center",
                }}
              >
                {moment(match.date).format("MMMM Do YYYY")}{" "}
                <span style={{ color: "#db6337" }}>
                  {match.kickoff || "Time TBD"}
                </span>
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  textAlign: "center",
                  gap: 0.5,
                  textShadow: "0 0 3px rgba(0,0,0,0.3)",
                }}
              >
                <Typography textAlign="center">
                  {match.venue || "Venue TBD"}
                </Typography>

                {match.pitch && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        gap: 0.5,
                        marginInline: 1,
                      }}
                    >
                      <Box
                        sx={{
                          height: 20,
                          width: 10,
                          transform: "skewX(-10deg)",
                          backgroundColor:
                            match.pitch === "1" ? "#db6337" : "#b6b6b6",
                        }}
                      ></Box>
                      <Box
                        sx={{
                          height: 20,
                          width: 10,
                          transform: "skewX(-10deg)",
                          border:
                            match.pitch === "2"
                              ? "1px solid rgba(255,255,255,0.2)"
                              : "1px solid #b6b6b6",
                          backgroundColor:
                            match.pitch === "2" ? "#db6337" : "#b6b6b6",
                        }}
                      ></Box>
                      <Box
                        sx={{
                          height: 20,
                          width: 10,
                          transform: "skewX(-10deg)",
                          border:
                            match.pitch === "3"
                              ? "1px solid #fff"
                              : "1px solid #b6b6b6",
                          backgroundColor:
                            match.pitch === "3" ? "#db6337" : "#b6b6b6",
                        }}
                      ></Box>
                    </Box>
                    <Typography>Pitch {match.pitch}</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Panel>
    </Box>
  );
}
