import CleanSheetIcon from "../../img/clean.svg";
import { Link } from "react-router-dom";
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

export function PlayerNameNumberInline({ player }: { player: Player }) {
  return (
    <Box
      component={Link}
      to={`/player/${encodeURIComponent(player.id)}`}
      onClick={event => event.stopPropagation()}
      sx={{
        display: "inline-flex",
        color: "inherit",
        textDecoration: "none",
        "&:hover, &:focus-visible": { opacity: 0.7 },
        alignItems: "center",
      }}
    >
      <Typography
        component="span"
        sx={(theme) => ({
          color: theme.palette.primary.main,
          fontWeight: 700,
          fontSize: 22,
        })}
      >
        #{player.number || ""}
      </Typography>

      <Typography
        component="span"
        sx={{
          color: "white",
          fontWeight: 700,
          fontSize: 16,
          paddingLeft: 0.5,
        }}
      >
        {player.name}
      </Typography>
    </Box>
  );
}

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
        bottom: `calc(${publishBarVisible ? 150 : 45}px + env(safe-area-inset-bottom, 0px))`,
        left: 0,
        display: "flex",
        justifyContent: "center",
        width: "min(460px, 100vw)",
        right: 0,
      }}
    >
      <Alert
        severity="info"
        icon={false}
        sx={{
          boxSizing: "border-box",
          position: "relative",
          minWidth: `96vw`,
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
            mb: 1,
          }}
        >
          <TimelineMarker minute={notice.minute} />

          <Box
            sx={{
              px: 0.5,
              transform: "translateY(2px)",
            }}
          >
            {(notice.kind === "penalty_kick" || notice.kind === "missed_penalty") && (
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
            {(notice.kind === "assist" || notice.kind === "clean_sheet") && (
              <img
                src={notice.kind === "assist" ? AssistIcon : CleanSheetIcon}
                alt=""
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
            {notice.opponentPlayerName}
            {!creditedToOpponent && player && (
              <PlayerNameNumberInline player={player} />
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
