import TimelineMarker from "../../components/TimelineMarker";
import { Alert, Box, Button, Snackbar, Typography } from "@mui/material";
import type { Match, MatchEvent, Player } from "../../model";
import SoccerBallImage from "../../img/soccer-ball-variant.svg";
import AssistIcon from "../../img/cleats.svg";
import PenaltyIcon from "../../img/penalty-kick.svg";

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
  remaining,
  publishBarVisible,
  onDismiss,
}: Props) {
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
          <TimelineMarker minute={notice.minute} />

          <Box
            sx={{
              px: 0.5,
              transform: "translateY(2px)",
            }}
          >
            {notice.kind === "penalty_kick" && (
              <img
                src={PenaltyIcon}
                alt="Penalty"
                style={{
                  width: 15,
                  height: 15,
                }}
              />
            )}

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
              fontWeight: 700,
              flex: 1,
            }}
          >
            {notice.kind.replaceAll("_", " ")}
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
            {!creditedToOpponent && player?.number && (
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
