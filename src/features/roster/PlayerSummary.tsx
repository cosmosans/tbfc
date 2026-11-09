import { playerStats } from "./playerStats";
import GoalIcon from "../../img/soccer-ball-variant.svg";
import AssistIcon from "../../img/cleats.svg";
import SaveIcon from "../../img/gloves.svg";
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
  return (
    <>
      <PlayerPhoto>
        {player.photoUrl ? (
          <img src={player.photoUrl} alt="" />
        ) : (
          <PlayerPlaceholder />
        )}
      </PlayerPhoto>
      <PlayerInformation>
        <PlayerNumber>{player.number || "—"}</PlayerNumber>
        <PlayerIdentity>
          <PlayerName>{player.name}</PlayerName>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            {player.playerType && (
              <Typography variant="body2" color="white">
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
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: { xs: 1, md: 2 },
            gridArea: "stats",
          }}
        >
          {playerStats(player, events).filter(([label]) => label !== "Clean Sheets" || player.playerType === "Goal Keeper").map(([label, count], index) => (
            <Tooltip key={label} title={label === "PK Saves" ? "Penalty Saves" : label} describeChild arrow>
              <Box
                component="span"
                aria-label={`${count} ${label}`}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.75,
                }}
              >
                <Box
                  component="img"
                  src={[GoalIcon, AssistIcon, SaveIcon, CardIcon, SaveIcon][index]}
                  alt=""
                  sx={{
                    width: { xs: 16, md: 22 },
                    height: { xs: 16, md: 22 },
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
