import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import type { ClubData, Formation, Lineup } from "../../model";
import { Pitch } from "../board/Matchboard.styles";
import PitchSurface, { PitchArtwork } from "../../components/PitchSurface";
import {
  LineupNameplate,
  NameplateText,
  goalkeeperPlate,
} from "../../components/LineupNameplate";
import { formationPoints, formationSlots, normalizeLineupRoles } from "./formations";
const roleLabelStyle = {
  color: "#fff",
  fontFamily: "Oxanium, sans-serif",
  fontSize: "clamp(10px, 10cqw, 16px)",
  fontWeight: 700,
  lineHeight: 1.2,
  letterSpacing: ".16em",
  textAlign: "center",
  textShadow: "0 1px 4px rgba(0,0,0,.85)",
} as const;

const plateStyle = {
  minHeight: 0,
  padding: "0 7%",
  "& > span": {
    fontSize: "clamp(10px, 9.5cqw, 17px)",
    lineHeight: 1,
    maxWidth: "100%",
  },
  "& > span strong": { fontSize: "1.35em" },
  "& > span span": {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
};

import RubberDuckIcon from "../../img/rubber-duck.svg";

export default function LineupPitch({
  data,
  lineup: savedLineup,
  showTitle = true,
  onFormationChange,
}: {
  data: ClubData;
  lineup: Lineup;
  showTitle?: boolean;
  onFormationChange?: (formation: Formation) => void;
}) {
  const lineup = normalizeLineupRoles(savedLineup);
  const points = formationPoints[lineup.formation];
  const slots = formationSlots[lineup.formation];
  const benchPlayers = data.players.filter(player =>
    lineup.bench.includes(player.id) && !lineup.starters.includes(player.id));
  const subsBySlot = slots.map(role =>
    benchPlayers.filter(player => lineup.benchPositions?.[player.id] === role));
  let minPitchHeight = lineup.bench.length ? 450 : 280;
  if (lineup.formation === "1-3-1-2" || lineup.formation === "1-2-1-2-1" || lineup.formation === "1-2-1-3") {
    // At the maximum plate width (180px), each plate is at most 40px tall.
    // Reserve the two facing half-stacks plus the lower role's label and a gap.
    const rows = new Map<number, number>();
    points.forEach(([, y], index) => {
      const stackHeight = 40 + subsBySlot[index].length * 44;
      rows.set(y, Math.max(rows.get(y) ?? 0, stackHeight));
    });
    const sortedRows = [...rows].sort(([a], [b]) => a - b);
    sortedRows.forEach(([y, height], index) => {
      const previous = sortedRows[index - 1];
      const required = previous
        ? ((previous[1] + height) / 2 + 34) * 100 / (y - previous[0])
        : (height / 2 + 34) * 100 / y;
      minPitchHeight = Math.max(minPitchHeight, Math.ceil(required));
    });
    const [bottom, height] = sortedRows[sortedRows.length - 1];
    minPitchHeight = Math.max(minPitchHeight, Math.ceil((height / 2 + 8) * 100 / (100 - bottom)));
  }
  // Reserve vertical space for a starter and two substitutes in each central role.
  const centralRoleY: Partial<Record<string, number>> =
    lineup.formation === "1-2-3-1" ? { ST: 22, CAM: 53, GK: 84 } : {};
  const floaters = benchPlayers.filter(player => !lineup.benchPositions?.[player.id]);
  const kit = data.matches.find((match) => match.id === lineup.matchId)?.kit;

  return (
    <Box className="lineup-pitch" sx={{ width: "100%", maxWidth: 1155, minWidth: 0, mx: "auto" }}>
      <Box sx={{ position: "relative", isolation: "isolate" }}>
        <PitchArtwork />
      <Pitch
        sx={{
          aspectRatio: "1.65",
          minHeight: Math.min(minPitchHeight, 700),
          maxHeight: 700,
          touchAction: "auto",
        }}
        aria-label={`${lineup.formation} lineup with substitutes`}
      >
        <PitchSurface showArtwork={false} />

        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 5,
          }}
        >
          {points.map(([x, y], index) => {
            const player = data.players.find(
              (item) => item.id === lineup.starters[index],
            );
            const substitutes = subsBySlot[index];
            return (
              <Stack
                key={`${lineup.formation}-${index}`}
                gap={0.5}
                sx={{
                  position: "absolute",
                  left: `${x}%`,
                  top: `${centralRoleY[slots[index]] ?? y}%`,
                  transform: "translate(-50%, -50%)",
                  width: "26%",
                  maxWidth: 180,
                  containerType: "inline-size",
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
                    ...roleLabelStyle,
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
                    sx={plateStyle}
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
      {floaters.length > 0 && (
        <Stack
          component="section"
          aria-label="Floaters"
          gap={0.5}
          sx={{
            position: "relative",
            zIndex: 2,
            alignItems: "center",
            p: 2,
            pt: 0.5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "26%",
              maxWidth: 180,
              containerType: "inline-size",
            }}
          >
            <img
              src={RubberDuckIcon}
              alt="Rubber Duck"
              style={{
                width: 15,
                height: 15,
                marginRight: 5,
                transform: "translateY(-1px)",
              }}
            />
            <Typography
              variant="caption"
              align="center"
              color="white"
              sx={roleLabelStyle}
            >
              FLOATERS
            </Typography>
          </Box>

          <Stack direction="row" flexWrap="wrap" justifyContent="center" gap={1} sx={{ width: "100%" }}>
          {floaters.map((player) => (
            <LineupNameplate
              key={player.id}
              kit={kit}
              sx={{ ...plateStyle, width: 150, maxWidth: "100%", containerType: "inline-size", px: 1 }}
              aria-label={`Floater: #${player.number} ${player.name}`}
            >
              <NameplateText
                number={player.number}
                name={player.name.split(" ")[0]}
              />
            </LineupNameplate>
          ))}
          </Stack>
        </Stack>
      )}
      </Box>
      {(onFormationChange || showTitle) && (
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          sx={{ mt: 2 }}
        >
          {onFormationChange ? (
            <FormControl size="small" sx={{ width: "100%", maxWidth: 175 }}>
              <InputLabel id="pitch-formation-label">Formation</InputLabel>
              <Select
                labelId="pitch-formation-label"
                label="Formation"
                value={lineup.formation}
                onChange={(event) =>
                  onFormationChange(event.target.value as Formation)
                }
              >
                {Object.keys(formationSlots).map(formation => (
                  <MenuItem key={formation} value={formation}>{formation}</MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            showTitle && (
              <Typography variant="h6" sx={{ mb: 1 }}>
                {lineup.formation}
              </Typography>
            )
          )}
        </Stack>
      )}
    </Box>
  );
}
