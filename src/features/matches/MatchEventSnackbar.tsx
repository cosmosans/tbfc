import { Alert, Box, Button, Snackbar, Typography } from "@mui/material";
import type { Match, MatchEvent, Player } from "../../model";
import SoccerBallImage from "../../img/soccer-ball-variant.svg";
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
      ? `${opponent.toUpperCase()} ${opponentScore} - ${tbfcScore} TURF BURNERS FC`
      : `TURF BURNERS FC ${tbfcScore} - ${opponentScore} ${opponent.toUpperCase()}`;
  const creditedToOpponent = notice.team === "opponent";
  console.log("NOTICE", notice);

  return (
    <Snackbar
      open
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      sx={{
        bottom: `calc(${publishBarVisible ? 150 : 68}px + env(safe-area-inset-bottom, 0px))`,
      }}
    >
      <Alert
        severity="info"
        icon={false}
        sx={{
          maxWidth: "min(480px, 94vw)",
          maxHeight: "50vh",
          overflowY: "auto",
          overflowWrap: "anywhere",
          background: "#060606",
        }}
        action={
          <Button
            color="inherit"
            size="small"
            sx={{
              textTransform: "uppercase",
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

        {notice.kind === "goal" && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
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
        )}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {notice.kind === "goal" && (
            <img
              src={SoccerBallImage}
              alt="Goal"
              style={{ width: 24, height: 24 }}
            />
          )}
          <Typography
            sx={{
              textTransform: "uppercase",
              fontWeight: "bold",
            }}
          >
            {notice.minute}&apos; {notice.kind}
            {notice.kind === "goal" && <>!</>}
          </Typography>
        </Box>

        {notice.kind === "goal" && (
          <Typography
            sx={{
              fontSize: 14,
              opacity: 0.6,
              my: 1,
            }}
          >
            {scoreline}
          </Typography>
        )}

        <Typography variant="body2">
          #{player?.number || "—"} · {player?.name || "No player recorded"}
        </Typography>
        <Typography variant="body2">Note: {notice.note || "—"}</Typography>
        <details>
          <summary>Event data</summary>
          <Box component="pre" sx={{ whiteSpace: "pre-wrap", fontSize: 12 }}>
            {JSON.stringify(notice, null, 2)}
          </Box>
        </details>
        {remaining > 0 && (
          <Typography variant="caption">{remaining} more waiting</Typography>
        )}
      </Alert>
    </Snackbar>
  );
}
