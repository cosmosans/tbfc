import { Box, Typography } from "@mui/material";
import type { ClubData, Lineup } from "../../model";
import {
  Pitch,
  CenterLine,
  CenterCircle,
  TopBox,
  BottomBox,
  PitchMarker,
} from "../board/Matchboard.styles";
import { formationPoints, formationSlots } from "./formations";

export default function LineupPitch({
  data,
  lineup,
  showTitle = true,
}: {
  data: ClubData;
  lineup: Lineup;
  showTitle?: boolean;
}) {
  const points = formationPoints[lineup.formation];
  const slots = formationSlots[lineup.formation];
  return (
    <Box className="lineup-pitch">
      {showTitle && (
        <Typography variant="h6" sx={{ mb: 1 }}>
          {lineup.formation}
        </Typography>
      )}
      <Pitch
        sx={{ minHeight: { xs: 380, sm: 500 }, touchAction: "auto" }}
        aria-label={`${lineup.formation} starting formation`}
      >
        <CenterLine />
        <CenterCircle />
        <TopBox />
        <BottomBox />
        {points.map(([x, y], index) => {
          const player = data.players.find(
            (item) => item.id === lineup.starters[index],
          );
          const label = player?.name.split(" ")[0] ?? slots[index];
          return (
            <PitchMarker
              as="div"
              key={`${lineup.formation}-${index}`}
              team="tbfc"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                cursor: "default",
                display: "grid",
                placeItems: "center",
              }}
              aria-label={`${slots[index]}: ${player?.name ?? "Unassigned"}`}
            >
              {label}
            </PitchMarker>
          );
        })}
      </Pitch>
    </Box>
  );
}
