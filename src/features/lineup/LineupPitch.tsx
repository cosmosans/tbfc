import { useState } from "react";
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import type { ClubData, Formation, Lineup } from "../../model";
import {
  Pitch,
  CenterLine,
  CenterCircle,
  TopBox,
  BottomBox,
} from "../board/Matchboard.styles";
import {
  LineupNameplate,
  NameplateText,
  goalkeeperPlate,
} from "../../components/LineupNameplate";
import { formationPoints, formationSlots } from "./formations";
import PitchOverlay from "../../img/pitch-overlay.png";
import PitchImage from "../../img/pitch.png";
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
  const kit = data.matches.find((match) => match.id === lineup.matchId)?.kit;

  return (
    <Box className="lineup-pitch">
      <Pitch
        sx={{ minHeight: { xs: 380, sm: 500 }, touchAction: "auto" }}
        aria-label={`${lineup.formation} ${filterToStarters ? "starting formation" : "lineup with substitutes"}`}
      >
        <img
          src={PitchImage}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 2,
            opacity: 0.3,
          }}
        />

        <img
          src={PitchOverlay}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            opacity: 0.8,
            zIndex: 1,
          }}
        />

        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 5,
          }}
        >
          <CenterLine />
          <CenterCircle />
          <TopBox />
          <BottomBox />
          {points.map(([x, y], index) => {
            const player = data.players.find(
              (item) => item.id === lineup.starters[index],
            );
            const substitutes = filterToStarters
              ? []
              : data.players.filter(
                  (p) =>
                    lineup.bench.includes(p.id) &&
                    !lineup.starters.includes(p.id) &&
                    lineup.benchPositions?.[p.id] === slots[index],
                );
            return (
              <Stack
                key={`${lineup.formation}-${index}`}
                gap={0.5}
                sx={{
                  position: "absolute",
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: "translate(-50%, -50%)",
                  width: "22%",
                  maxWidth: 160,
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    position: "absolute",
                    bottom: "100%",
                    left: 0,
                    width: "100%",
                    pb: 0.75,
                    color: "#fff",
                    fontFamily: "Oxanium, sans-serif",
                    fontSize: { xs: 12, sm: 14 },
                    fontWeight: 700,
                    lineHeight: 1.2,
                    letterSpacing: ".16em",
                    textAlign: "center",
                    textShadow: "0 1px 4px rgba(0,0,0,.85)",
                    pointerEvents: "none",
                  }}
                >
                  {slots[index]}
                </Typography>
                {[player, ...substitutes].map((person, row) => (
                  <LineupNameplate
                    key={person?.id ?? "empty"}
                    kit={kit}
                    goalkeeper={goalkeeperPlate(person?.id, slots[index])}
                    data-player-number={person?.number}
                    aria-label={`${slots[index]}${row ? " substitute" : " starter"}: ${person ? `#${person.number} ${person.name}` : "Unassigned"}`}
                  >
                    <NameplateText
                      number={person?.number}
                      name={person ? person.name.split(" ")[0] : ""}
                    />
                  </LineupNameplate>
                ))}
              </Stack>
            );
          })}
        </Box>
      </Pitch>
      {(onFormationChange || showTitle || allowStartersOnly) && (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mt: 2 }}
        >
          {onFormationChange ? (
            <FormControl size="small" sx={{ minWidth: 160 }} fullWidth>
              <InputLabel id="pitch-formation-label">Formation</InputLabel>
              <Select
                labelId="pitch-formation-label"
                label="Formation"
                value={lineup.formation}
                onChange={(event) =>
                  onFormationChange(event.target.value as Formation)
                }
              >
                <MenuItem value="1-2-3-1">1-2-3-1</MenuItem>
                <MenuItem value="1-3-3">1-3-3</MenuItem>
              </Select>
            </FormControl>
          ) : (
            showTitle && (
              <Typography variant="h6" sx={{ mb: 1 }}>
                {lineup.formation}
              </Typography>
            )
          )}
          {allowStartersOnly && (
            <FormControlLabel
              sx={{ flexShrink: 0, marginLeft: 2 }}
              control={
                <Checkbox
                  checked={startersOnly}
                  onChange={(event) => setStartersOnly(event.target.checked)}
                />
              }
              label="Starters Only"
            />
          )}
        </Stack>
      )}
    </Box>
  );
}
