import { Alert, Box, Button, Snackbar, Typography } from "@mui/material";
import type { Match, MatchEvent, Player } from "../../model";
import SoccerBallImage from "../../img/soccer-ball-variant.svg";
import AssistIcon from "../../img/cleats.svg";

import OpponentCrest from "../../components/OpponentCrest";

type Props = {
  notice: MatchEvent;
  player?: Player;
  opponent: string;
  opponentCrestUrl?: string;
  creditedTeamColor: string;
  match: Match;
  events: MatchEvent[];
  remaining: number;
  publishBarVisible: boolean;
  onDismiss: () => void;
};

export default function MatchEventSnackbar({
  notice,
  player,
  opponent,
  opponentCrestUrl,
  creditedTeamColor,
  match,
  events,
  remaining,
  publishBarVisible,
  onDismiss,
}: Props) {
  const goals = events
    .filter((event) => event.matchId === match.id && event.kind === "goal")
    .sort((a, b) => (a.minute ?? 999) - (b.minute ?? 999));
  const goalIndex = goals.findIndex((event) => event.id === notice.id);
  const goalsAfter = goalIndex < 0 ? [] : goals.slice(goalIndex + 1);
  const tbfcScore =
    goalIndex < 0
      ? match.goalsFor + (notice.team === "opponent" ? 0 : 1)
      : Math.max(
          0,
          match.goalsFor -
            goalsAfter.filter((event) => event.team !== "opponent").length,
        );
  const opponentScore =
    goalIndex < 0
      ? match.goalsAgainst + (notice.team === "opponent" ? 1 : 0)
      : Math.max(
          0,
          match.goalsAgainst -
            goalsAfter.filter((event) => event.team === "opponent").length,
        );
  const scoreline =
    match.homeAway === "away"
      ? `${opponent} ${opponentScore} - ${tbfcScore} Turf Burners FC`
      : `Turf Burners FC ${tbfcScore} - ${opponentScore} ${opponent}`;
  const creditedToOpponent = notice.team === "opponent";

  return (
    <Snackbar
      open
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      sx={{
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.5)",
        bottom: `calc(${publishBarVisible ? 150 : 68}px + env(safe-area-inset-bottom, 0px))`,
        justifyContent: "normal",
      }}
    >
      <Alert
        severity="info"
        icon={false}
        sx={{
          width: "min(460px, 96vw)",
          boxSizing: "border-box",
          position: "relative",
          maxHeight: "50vh",
          overflowY: "auto",
          overflowWrap: "anywhere",
          background: "#060606",
          "& .MuiAlert-message": { width: "100%", minWidth: 0, pt: 7 },
          "& .MuiAlert-action": {
            position: "absolute",
            top: 8,
            right: 12,
            zIndex: 1,
            m: 0,
            p: 0,
          },
        }}
        action={
          <Button
            color="inherit"
            size="small"
            sx={{
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontWeight: 400,

              fontSize: 12,
            }}
            onClick={onDismiss}
          >
            Dismiss
          </Button>
        }
      >
        <Box
          sx={{
            backgroundColor: creditedTeamColor ?? "#060606",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            p: 1,
            px: 2,
            pr: 12,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {creditedToOpponent ? (
              <OpponentCrest url={opponentCrestUrl} size={36} />
            ) : (
              <Box
                component="img"
                src="/crests/tbfc.png"
                alt=""
                sx={{ width: 36, height: 36, objectFit: "contain" }}
              />
            )}
            <Typography
              fontWeight={700}
              sx={{ textTransform: "uppercase", color: "#fff" }}
            >
              {creditedToOpponent ? opponent : "Turf Burners FC"}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            boxSizing: "border-box",
            gap: 0.5,
            p: 1,
          }}
        >
          <Typography
            sx={{
              backgroundColor: "#c4c4c4",
              px: 0.5,
              paddingRight: 0.25,
              lineHeight: 1.4,
              pt: 0.2,
              marginTop: `-1px`,
              fontSize: 12,
              fontWeight: "bold",
              color: "black",
            }}
          >
            {notice.minute}&apos;
          </Typography>

          <Box
            sx={{
              px: 0.5,
              transform: "translateY(2px)",
            }}
          >
            {notice.kind === "goal" && (
              <img
                src={SoccerBallImage}
                alt="Goal"
                style={{
                  width: 15,
                  height: 15,
                }}
              />
            )}
            {notice.kind === "assist" && (
              <img
                src={AssistIcon}
                alt="Assist"
                style={{
                  width: 15,
                  height: 15,
                }}
              />
            )}
          </Box>
          <Typography
            sx={{
              textTransform: "uppercase",
              fontSize: 14,
              flex: 1,
            }}
          >
            {notice.kind}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "#CA5126",
              fontWeight: 900,
              fontSize: 24,
              display: "flex",
              alignItems: "center",
            }}
          >
            {!creditedToOpponent && (
              <>
                #{player?.number || ""}{" "}
                <Typography
                  component="span"
                  sx={{
                    color: "white",
                    fontWeight: 700,
                    fontSize: 16,
                    paddingLeft: 0.5,
                  }}
                >
                  {player?.name}
                </Typography>
              </>
            )}
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ fontSize: 12 }}>
          {notice.kind === "goal" && <>{scoreline}. </>}
          {notice.note}
        </Typography>
        {remaining > 0 && (
          <Box sx={{ mt: 1, opacity: 0.6 }}>
            <Typography sx={{ textTransform: "uppercase" }} variant="caption">
              +{remaining} More
            </Typography>
          </Box>
        )}
      </Alert>
    </Snackbar>
  );
}
