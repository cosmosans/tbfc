import { rosterStats } from "./playerStats";
import GoalIcon from "../../img/soccer-ball-variant.svg";
import AssistIcon from "../../img/cleats.svg";
import CardIcon from "../../img/cards.svg";
import { Box, Tooltip, Typography } from "@mui/material";
import type { MatchEvent, Player } from "../../model";
import {
  PlayerPhoto,
  PlayerPlaceholder,
  PlayerInformation,
  PlayerNumber,
  PlayerIdentity,
  PlayerName,
  PlayerPositions,
  PlayerStatus,
} from "./PlayerCard.styles";

export default function PlayerSummary({
  player,
  events,
}: {
  player: Player;
  events: MatchEvent[];
}) {
  if (player.name.includes("Wet")) {
    console.log(player);
  }
  return (
    <>
      <PlayerPhoto
        sx={{
          position: "relative",
          "&::after": {
            content: player.active ? "none" : '""',
            position: "absolute",
            top: 0,
            right: 0,
            width: 20,
            height: 20,
            bgcolor: "orange",
            clipPath: "polygon(0 0, 100% 0, 100% 100%)",
            pointerEvents: "none",
          },
        }}
      >
        {player.photoUrl ? (
          <img src={player.photoUrl} alt="" />
        ) : (
          <PlayerPlaceholder />
        )}
      </PlayerPhoto>
      <PlayerInformation>
        <PlayerNumber>{player.number || "—"}</PlayerNumber>
        <PlayerIdentity>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {player.captain && (
              <Typography
                sx={(theme) => ({
                  fontWeight: "bold",
                  color: theme.palette.primary.main,
                  fontSize: { xs: 11, sm: 16 },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `2px solid ${theme.palette.primary.main}`,
                  //  backgroundColor: theme.palette.primary.main,
                  width: { xs: 18, sm: 25 },
                  height: { xs: 18, sm: 25 },
                  position: "relative",
                  top: -1,
                })}
              >
                <span
                  style={{
                    position: "relative",
                    top: `1px`,
                  }}
                >
                  C
                </span>
              </Typography>
            )}
            <PlayerName>{player.name}</PlayerName>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            {player.playerType && (
              <Typography
                variant="body2"
                color="white"
                sx={{ textTransform: "uppercase", fontSize: { xs: 12, sm: 16 } }}
              >
                {player.playerType}
              </Typography>
            )}

            <PlayerPositions>
              {[player.preferredPosition, player.secondaryPosition]
                .filter(Boolean)
                .join(" / ") || ""}
            </PlayerPositions>
          </Box>
        </PlayerIdentity>
        <Box
          component="span"
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: { xs: 1, md: 2 },
            gridArea: "stats",
          }}
        >
          {rosterStats(player, events).map(([label, count], index) => (
            <Tooltip key={label} title={label} describeChild arrow>
              <Box
                component="span"
                aria-label={`${count} ${label}`}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: { xs: "center", sm: "flex-start" },
                  gap: 0.75,
                }}
              >
                <Box
                  component="img"
                  src={[GoalIcon, AssistIcon, CardIcon][index]}
                  alt=""
                  sx={{
                    display: { xs: "block", sm: "none" },
                    width: 20,
                    height: 20,
                    objectFit: "contain",
                  }}
                />
                <Box
                  component="span"
                  sx={{ fontSize: { xs: 16, md: 24 }, fontWeight: 800 }}
                >
                  {count}
                </Box>
              </Box>
            </Tooltip>
          ))}
        </Box>
        <PlayerStatus active={player.active}>
          {player.active ? "Active" : "Inactive"}
        </PlayerStatus>
      </PlayerInformation>
    </>
  );
}
