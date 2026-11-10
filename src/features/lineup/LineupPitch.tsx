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
import PitchSurface from "../../components/PitchSurface";
import {
  LineupNameplate,
  NameplateText,
  goalkeeperPlate,
} from "../../components/LineupNameplate";
import { formationPoints, formationSlots } from "./formations";
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
  lineup,
  showTitle = true,
  onFormationChange,
}: {
  data: ClubData;
  lineup: Lineup;
  showTitle?: boolean;
  onFormationChange?: (formation: Formation) => void;
}) {
  const points = formationPoints[lineup.formation];
  const slots = formationSlots[lineup.formation];
  // Reserve vertical space for a starter and two substitutes in each central role.
  const centralRoleY: Partial<Record<string, number>> =
    lineup.formation === "1-2-3-1" ? { ST: 22, CAM: 53, GK: 84 } : {};
  const floaters = data.players.filter(
    (player) =>
      lineup.bench.includes(player.id) &&
      !lineup.starters.includes(player.id) &&
      !lineup.benchPositions?.[player.id],
  );
  const kit = data.matches.find((match) => match.id === lineup.matchId)?.kit;

  return (
    <Box className="lineup-pitch" sx={{ width: "100%", minWidth: 0 }}>
      <Pitch
        sx={{
          aspectRatio: "1.65",
          minHeight: lineup.bench.length ? 450 : 280,
          touchAction: "auto",
        }}
        aria-label={`${lineup.formation} lineup with substitutes`}
      >
        <PitchSurface />

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
            const substitutes = data.players.filter(
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
                    color: "#fff",
                    fontFamily: "Oxanium, sans-serif",
                    fontSize: "clamp(10px, 10cqw, 16px)",
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
          {floaters.length > 0 && (
            <Stack
              component="section"
              aria-label="Floaters"
              gap={0.5}
              sx={{
                position: "absolute",
                right: "30px",
                bottom: "23px",
                width: "28%",
                maxWidth: 170,
                maxHeight: "22%",
                overflowY: "auto",
                containerType: "inline-size",
                p: 2,
                paddingTop: 1.5,
                bgcolor: "rgba(202, 81, 38, 0.75)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
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
                  sx={{ letterSpacing: 1 }}
                >
                  FLOATERS
                </Typography>
              </Box>

              {floaters.map((player) => (
                <LineupNameplate
                  key={player.id}
                  kit={kit}
                  sx={{ ...plateStyle, flexShrink: 0 }}
                  aria-label={`Floater: #${player.number} ${player.name}`}
                >
                  <NameplateText
                    number={player.number}
                    name={player.name.split(" ")[0]}
                  />
                </LineupNameplate>
              ))}
            </Stack>
          )}
        </Box>
      </Pitch>
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
                <MenuItem value="1-2-3-1">1-2-3-1</MenuItem>
                <MenuItem value="1-3-3">1-3-3</MenuItem>
                <MenuItem value="1-3-1-2">1-3-1-2</MenuItem>
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
