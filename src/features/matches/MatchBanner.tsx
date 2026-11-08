import { Fragment, useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import type { ClubData, Match } from "../../model";
import { record } from "../../model";
import { opponentFor, opponentName } from "../../clubView";
import GoalFire from "./GoalFire";
import OpponentCrest from "../../components/OpponentCrest";
import RecordBar from "../../components/RecordBar";
import PitchIndicator from "../../components/PitchIndicator";
import moment from "moment";
import { splitMatchLocation } from "../../matchLocation";
import WhiteKitImage from "../../img/white-front.png";
import BlackKitImage from "../../img/black-front.png";
import { matchPhase } from "./matchClock";

import { useMatchBannerCollapse } from "./useMatchBannerCollapse";
import "./matchBanner.css";

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
  "@media (max-width: 599.95px)": { width: "auto", fontSize: "1.4rem" },
  textAlign: "center",
});

const HomeCrest = styled("img")({
  width: "min(30vw, 165px)",
  height: "min(30vw, 165px)",
  objectFit: "contain",
  "@media (max-width: 599.95px)": { width: 64, height: 64 },
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
  goalTime,
}: {
  data: ClubData;
  match: Match;
  onOpen?: () => void;
  onEdit?: () => void;
  detail?: boolean;
  goalTime?: number;
}) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (match.status !== "in_progress") return;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [match.status]);
  const phase = match.status === "in_progress" ? matchPhase(match, now) : null;
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
  if (match.status === "in_progress") {
    const liveResult = match.goalsFor > match.goalsAgainst
      ? "W"
      : match.goalsFor < match.goalsAgainst
        ? "L"
        : "D";
    headToHead[liveResult] += 1;
  }
  const clock = match.status === "in_progress" && (
    <Stack spacing={0.5}>
      {phase?.label === "HALF TIME" && (
        <Chip size="small" label="HALF TIME" color="primary" sx={{ textShadow: "none" }} />
      )}
      {phase && phase.label !== "HALF TIME" && (
        <Typography variant="caption" textAlign="center" fontWeight={700}>
          {String(Math.floor(phase.seconds / 60)).padStart(2, "0")}:
          {String(phase.seconds % 60).padStart(2, "0")}
        </Typography>
      )}
      {detail && phase?.label !== "HALF TIME" && (
        <LinearProgress
          variant="indeterminate"
          color="primary"
          aria-label="Match in progress"
          sx={{ transform: "skewX(-15deg)" }}
        />
      )}
    </Stack>
  );
  const bannerRef = useMatchBannerCollapse(detail, match.id, match.status);
  return (
    <Box
      ref={bannerRef}
      className={detail ? "match-banner-detail" : undefined}
      sx={(theme) => ({
        [theme.breakpoints.down("sm")]: {
          mx: -2,
          width: `calc(100% + ${theme.spacing(4)})`,
        },
      })}
    >
      <Panel
        sx={{
          ...(location?.imageUrl
            ? {
                backgroundImage: `linear-gradient(180deg, rgba(12, 14, 16, .6), rgba(12, 14, 16, .98)), url(${JSON.stringify(location.imageUrl)})`,
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
          sx={{
            p: { xs: 1.5, sm: 3 },
            "&:last-child": { pb: { xs: 1.5, sm: 3 } },
          }}
        >
          {detail && onEdit && (
            <Box className="banner-secondary" sx={{ display: "flex", justifyContent: "flex-end", pr: { xs: 1.5, sm: 3 }, mb: 1 }}>
              <Button variant="outlined" onClick={onEdit}>
                Edit Match
              </Button>
            </Box>
          )}

          <Box sx={{ width: "100%", maxWidth: 768, mx: "auto" }}>
            <Box className="banner-secondary" sx={{ minWidth: 0, mt: 0.5 }}>
              <Typography
                sx={{
                  fontSize: { xs: 14, sm: 20 },
                  fontWeight: 700,
                  textShadow: "0 0 6px rgba(0,0,0,0.75)",
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
                  flexWrap: "wrap",
                  justifyContent: "center",
                  "& .MuiTypography-root": { fontSize: { xs: 12, sm: 16 } },
                  mb: 2,
                  textShadow: "0 0 6px rgba(0,0,0,0.75)",
                }}
              >
                <Typography sx={{ textAlign: "inherit" }}>
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
                    <Box sx={{ marginInline: 1 }}>
                      <PitchIndicator pitch={match.pitch} />
                    </Box>
                    <Typography>Pitch {match.pitch}</Typography>
                  </Box>
                )}
              </Box>
            </Box>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              gap={{ xs: 1, sm: 2 }}
              sx={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)",
                width: "100%",
              }}
            >
              {(["left", "right"] as const).map((side) => {
                const isOpponent =
                  side === "left"
                    ? match.homeAway !== "away"
                    : match.homeAway === "away";

                const clubKit =
                  match.homeAway &&
                  (match.kit === "White"
                    ? WhiteKitImage
                    : match.kit === "Black"
                      ? BlackKitImage
                      : undefined);
                const kitImage =
                  detail && isOpponent ? opponent?.kitImageUrl : clubKit;
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
                        <Versus data-banner-move="score">VS</Versus>
                        <Chip
                          className="banner-secondary"
                          size="small"
                          label="Upcoming"
                          color="info"
                          sx={{
                            textTransform: "uppercase",
                            fontSize: { xs: 9, sm: 12 },
                            height: { xs: 20, sm: 24 },
                            "& .MuiChip-label": { px: { xs: 0.75, sm: 1 } },
                          }}
                        />
                      </Box>
                    )}
                    {side === "right" && match.status !== "scheduled" && (
                      <Box>
                        <Typography
                          component="div"
                          data-banner-move="score"
                          sx={{
                            fontWeight: 900,
                            letterSpacing: "-0.08em",
                            fontSize: { xs: "3rem", sm: "4rem" },
                            whiteSpace: "nowrap",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            textShadow: "0 0 6px rgba(0,0,0,0.75)",
                          }}
                        >
                          {isOpponent ? match.goalsFor : match.goalsAgainst}
                          {side === "right" && (
                            <span
                              style={{
                                paddingInline: 10,
                              }}
                            >
                              {detail && match.status === "in_progress" ? (
                                <>
                                  <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>-</Box>
                                  <Box component="span" sx={{ display: { xs: "block", sm: "none" }, letterSpacing: 0 }}>
                                    {clock}
                                  </Box>
                                </>
                              ) : "-"}
                            </span>
                          )}
                          {isOpponent ? match.goalsAgainst : match.goalsFor}
                        </Typography>

                        {side === "right" && (
                          <Box
                            className="banner-secondary"
                            sx={{
                              display: detail && match.status === "in_progress" ? { xs: "none", sm: "flex" } : "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            {match.status === "in_progress" ? (
                              clock
                            ) : (
                              <ResultLabel result={match.resultLabel} />
                            )}
                          </Box>
                        )}
                      </Box>
                    )}
                    <Stack
                      className="banner-team"
                      alignItems="center"
                      gap={1}
                      sx={{
                        minWidth: 0,
                        flex: {
                          xs: "1 1 0",
                          sm: "initial",
                          textShadow: "0 0 6px rgba(0,0,0,0.75)",
                        },
                      }}
                    >
                      <Box data-banner-move={side} sx={{ display: "flex", position: "relative" }}>
                        {isOpponent ? (
                          <OpponentCrest
                            key={opponent?.crestUrl ?? ""}
                            url={opponent?.crestUrl}
                            size={165}
                            mobileSize={64}
                            teamId={opponent?.id}
                            teamName={opponent?.name}
                          />
                        ) : (
                          <>
                            <HomeCrest src="/crests/tbfc.png" alt="TBFC crest" />
                            {goalTime !== undefined && <GoalFire key={goalTime} started={goalTime} />}
                          </>
                        )}
                      </Box>
                      <Typography
                        data-banner-move={side}
                        className="banner-team-name"
                        fontWeight={800}
                        textAlign="center"
                        sx={{
                          fontSize: { xs: 12, sm: 16 },
                          lineHeight: 1.3,
                          overflowWrap: "anywhere",
                        }}
                      >
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
                            mt: -0.9,
                            fontSize: 10,
                          }}
                        >
                          {side === "left" ? "Away" : "Home"}
                        </Typography>
                      )}
                      {kitImage && (
                        <Box
                          component="img"
                          src={kitImage}
                          alt={
                            isOpponent
                              ? (opponent?.name ?? match.opponent) + " kit"
                              : "TBFC " + match.kit + " kit"
                          }
                          sx={{
                            width: { xs: 30, sm: 40 },
                            height: { xs: 36, sm: 48 },
                            objectFit: "contain",
                          }}
                        />
                      )}
                    </Stack>
                  </Fragment>
                );
              })}
            </Stack>
            <Box className="banner-secondary" sx={{ mt: 2, px: { xs: 1.5, sm: 0 } }}>
              <RecordBar
                opponentWins={headToHead.L}
                draws={headToHead.D}
                tbfcWins={headToHead.W}
                opponentColor={opponent?.color}
                reverse={match.homeAway === "away"}
              />
            </Box>
          </Box>
        </CardContent>
      </Panel>
    </Box>
  );
}
