import { useState } from "react";
import { Box, Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Stack, Typography } from "@mui/material";
import type { ClubData, Formation, Lineup } from "../../model";
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
  allowStartersOnly = true,
  onFormationChange,
}: {
  data: ClubData;
  lineup: Lineup;
  showTitle?: boolean;
  allowStartersOnly?: boolean;
  onFormationChange?: (formation: Formation) => void;
}) {
  const [startersOnly, setStartersOnly] = useState(false);
  const filterToStarters = allowStartersOnly && startersOnly;
  const points = formationPoints[lineup.formation];
  const slots = formationSlots[lineup.formation];
  return (
    <Box className="lineup-pitch">
      {(onFormationChange || showTitle || allowStartersOnly) && (
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
      {onFormationChange ? (
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="pitch-formation-label">Formation</InputLabel>
          <Select
            labelId="pitch-formation-label"
            label="Formation"
            value={lineup.formation}
            onChange={(event) => onFormationChange(event.target.value as Formation)}
          >
            <MenuItem value="1-2-3-1">1-2-3-1</MenuItem>
            <MenuItem value="1-3-3">1-3-3</MenuItem>
          </Select>
        </FormControl>
      ) : showTitle && (
        <Typography variant="h6" sx={{ mb: 1 }}>
          {lineup.formation}
        </Typography>
      )}
      {allowStartersOnly && <FormControlLabel control={<Checkbox checked={startersOnly} onChange={(event) => setStartersOnly(event.target.checked)} />} label="Starters Only" />}
      </Stack>
      )}
      <Pitch
        sx={{ minHeight: { xs: 380, sm: 500 }, touchAction: "auto" }}
        aria-label={`${lineup.formation} ${filterToStarters ? "starting formation" : "lineup with substitutes"}`}
      >
        <CenterLine />
        <CenterCircle />
        <TopBox />
        <BottomBox />
        {points.map(([x, y], index) => {
          const player = data.players.find(
            (item) => item.id === lineup.starters[index],
          );
          const substitutes = filterToStarters ? [] : data.players.filter((p) =>
            lineup.bench.includes(p.id) && !lineup.starters.includes(p.id) &&
            lineup.benchPositions?.[p.id] === slots[index],
          );
          return (
            <Stack
              key={`${lineup.formation}-${index}`}
              gap={0.5}
              sx={{ position: "absolute", left: `${x}%`, top: `${y}%`,
                transform: "translate(-50%, -50%)", width: "29%", maxWidth: 160 }}
            >
              {[player, ...substitutes].map((person, row) => (
                <PitchMarker
                  as="div"
                  key={person?.id ?? "empty"}
                  team="tbfc"
                  data-player-number={person?.number}
                  sx={{ position: "static", transform: "none", minHeight: 30,
                    minWidth: 0, borderRadius: 0, padding: "6px 4px", textAlign: "center",
                    overflowWrap: "anywhere", cursor: "default", touchAction: "auto",
                    background: row === 0 ? "#f47730" : "#ffd0b5",
                    "&:active": { cursor: "default" },
                    "@media (max-width: 600px)": { minWidth: 0, minHeight: 30 } }}
                  aria-label={`${slots[index]}${row ? " substitute" : " starter"}: ${person ? `#${person.number} ${person.name}` : "Unassigned"}`}
                >
                  {person ? `${person.number ? `#${person.number} ` : ""}${person.name.split(" ")[0]}` : slots[index]}
                </PitchMarker>
              ))}
            </Stack>
          );
        })}
      </Pitch>
    </Box>
  );
}
