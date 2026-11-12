import {
  Alert,
  Autocomplete,
  TextField,
  Box,
  Button,
  ButtonBase,
  Card,
  CardContent,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import type { ClubData, Formation, Match, Position } from "../../model";
import { useState } from "react";
import { defaultLineup } from "../../store";
import { LineupGrid } from "../../components/layout";
import {
  LineupNameplate,
  NameplateText,
  goalkeeperPlate,
} from "../../components/LineupNameplate";
import { fullStrength } from "./fullStrength";
import { formationSlots, normalizeLineupRoles } from "./formations";
import LineupPitch from "./LineupPitch";
import ShareLineupButton from "./ShareLineupButton";
import { canEditClub } from "../../editAccess";
import { byPlayerNumber } from "../../playerOrder";

export default function LineupEditor({
  data,
  match,
  update,
}: {
  data: ClubData;
  match: Match;
  update: (data: ClubData) => void;
}) {
  const [activeSquadOnly, setActiveSquadOnly] = useState(false);
  const lineup = normalizeLineupRoles(
    data.lineups.find((l) => l.matchId === match.id) ?? defaultLineup(match.id));
  const confirmedOutIds = new Set(lineup.confirmedOutIds ?? []);
  if (!canEditClub) {
    return <Stack gap={2} sx={{ mt: 2 }}>
      <ShareLineupButton data={data} match={match} lineup={lineup} />
      <LineupPitch data={data} lineup={lineup} showTitle={false} />
    </Stack>;
  }

  function save(next: typeof lineup) {
    const normalized = {
      ...next,
      benchPositions: Object.fromEntries(
        Object.entries(next.benchPositions ?? {}).filter(
          ([id, position]) =>
            next.bench.includes(id) &&
            !next.starters.includes(id) &&
            formationSlots[next.formation].includes(position),
        ),
      ),
      bench: [...new Set(next.bench)].filter(
        (id) => !next.starters.includes(id),
      ),
    };
    update({
      ...data,
      lineups: [
        ...data.lineups.filter((l) => l.matchId !== match.id),
        normalized,
      ],
    });
  }
  function assignStarter(index: number, playerId: string) {
    save({
      ...lineup,
      starters: lineup.starters.map((id, slot) =>
        slot === index ? playerId : id === playerId && playerId ? "" : id,
      ),
      bench: lineup.bench.filter((id) => id !== playerId),
    });
  }
  function changeFormation(formation: Formation) {
    if (formation === lineup.formation) return;
    const previousRoles = formationSlots[lineup.formation];
    const nextRoles = formationSlots[formation];
    const assignedByRole = new Map(
      previousRoles.map((role, index) => [role, lineup.starters[index] ?? ""]),
    );
    const starters = nextRoles.map((role) => assignedByRole.get(role) ?? "");
    const displaced = lineup.starters.filter(
      (id) => id && !starters.includes(id),
    );
    const empty = nextRoles.findIndex(role => !previousRoles.includes(role));
    if (empty >= 0 && displaced.length) starters[empty] = displaced.shift()!;
    const benchPositions = { ...lineup.benchPositions };
    for (const [id, role] of Object.entries(benchPositions)) {
      if (nextRoles.includes(role)) continue;
      const player = data.players.find(candidate => candidate.id === id);
      benchPositions[id] = player?.secondaryPosition && nextRoles.includes(player.secondaryPosition)
        ? player.secondaryPosition : "CAM";
    }
    save({
      ...lineup,
      formation,
      starters,
      benchPositions,
      bench: [...lineup.bench, ...displaced],
    });
  }
  function loadFirstChoice() {
    save({ ...lineup, ...fullStrength(data, lineup.formation, confirmedOutIds) });
  }
  function toggleConfirmedOut(playerId: string) {
    const next = new Set(confirmedOutIds);
    if (next.has(playerId)) next.delete(playerId);
    else next.add(playerId);
    save({ ...lineup, confirmedOutIds: [...next] });
  }
  const benchPlayers = data.players
    .filter(
      (player) =>
        lineup.bench.includes(player.id) &&
        !lineup.starters.includes(player.id),
    )
    .sort((a, b) => {
      const aFloats = !lineup.benchPositions?.[a.id];
      const bFloats = !lineup.benchPositions?.[b.id];
      return Number(aFloats) - Number(bFloats) || byPlayerNumber(a, b);
    });
  const visiblePlayers = data.players
    .filter((player) => !activeSquadOnly || player.active)
    .sort(byPlayerNumber);
  const eligiblePlayers = visiblePlayers.filter(player => !confirmedOutIds.has(player.id));
  const availablePlayers = visiblePlayers.filter(
    (player) =>
      !lineup.starters.includes(player.id) && !lineup.bench.includes(player.id),
  );
  const duplicated = lineup.starters.filter(
    (id, index) => id && lineup.starters.indexOf(id) !== index,
  );
  let missingStarters = false;
  lineup.starters.forEach((id) => {
    if (!id || !id.length) {
      missingStarters = true;
    }
  });
  const slots = formationSlots[lineup.formation];
  return (
    <Stack gap={2}>
      {missingStarters && (
        <Alert severity="info">
          Choose seven starters. The matchboard loads this saved lineup and
          keeps coaching movements separate.
        </Alert>
      )}
      {duplicated.length > 0 && (
        <Alert severity="warning">
          A player occupies more than one starting slot.
        </Alert>
      )}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            md: "minmax(320px, 2fr) minmax(0, 3fr)",
          },
          gap: 2,
          alignItems: "start",
        }}
      >
        <Stack gap={2} sx={{ minWidth: 0 }}>
          <Card>
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                gap={1}
              >
                <Typography variant="h6">Full Strength Lineup</Typography>
                <Stack direction="row" gap={1} flexWrap="wrap">
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={!canEditClub || !lineup.starters.some(Boolean)}
                    onClick={() =>
                      save({
                        ...lineup,
                        starters: lineup.starters.map(() => ""),
                      })
                    }
                  >
                    Clear
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    disabled={
                      !canEditClub ||
                      !data.players.some(player => player.active && !confirmedOutIds.has(player.id))
                    }
                    onClick={loadFirstChoice}
                  >
                    Load Full Strength
                  </Button>
                </Stack>
              </Stack>

              <LineupGrid sx={{ mt: 2 }}>
                {lineup.starters.map((id, index) => {
                  const slot = slots[index];
                  const selected = data.players.find(
                    (player) => player.id === id,
                  );
                  const options = data.players.filter(player => !confirmedOutIds.has(player.id)).sort(byPlayerNumber);
                  const playerLabel = (player: (typeof options)[number]) =>
                    `#${player.number} ${player.name}`;
                  return (
                    <Autocomplete
                      key={slot}
                      size="small"
                      fullWidth
                      openOnFocus
                      options={options}
                      value={selected ?? null}
                      getOptionLabel={playerLabel}
                      getOptionKey={(player) => player.id}
                      isOptionEqualToValue={(player, value) =>
                        player.id === value.id
                      }
                      filterOptions={(players, { inputValue }) => {
                        const query = inputValue.trim().toLocaleLowerCase();
                        if (query)
                          return players.filter((player) =>
                            playerLabel(player)
                              .toLocaleLowerCase()
                              .includes(query),
                          );
                        return eligiblePlayers.filter(
                          (player) =>
                            player.preferredPosition === slot ||
                            player.secondaryPosition === slot,
                        );
                      }}
                      onChange={(_, player) =>
                        assignStarter(index, player?.id ?? "")
                      }
                      renderOption={({ key, ...props }, player) => (
                        <li key={key} {...props}>
                          {playerLabel(player)}
                          {player.preferredPosition === slot
                            ? " (Primary)"
                            : player.secondaryPosition === slot
                              ? " (Secondary)"
                              : ""}
                        </li>
                      )}
                      noOptionsText="No matches. Search by name or number."
                      renderInput={(params) => (
                        <TextField {...params} label={slot} />
                      )}
                    />
                  );
                })}
              </LineupGrid>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Bench ({benchPlayers.length})
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3 }}
              ></Typography>
              <Stack gap={2}>
                {benchPlayers.map((player) => {
                  return (
                    <Box
                      key={player.id}
                      sx={{
                        display: "flex",
                        gap: 1,
                        alignItems: "center",
                      }}
                    >
                      <ButtonBase
                        type="button"
                        disabled={!canEditClub}
                        aria-label={`Move #${player.number} ${player.name} off the bench`}
                        title={`#${player.number} ${player.name}`}
                        sx={{
                          width: 180,
                          flexShrink: 0,
                          cursor: canEditClub ? "pointer" : "default",
                          "&:focus-visible": {
                            outline: "2px solid",
                            outlineColor: "primary.main",
                            outlineOffset: 2,
                          },
                        }}
                        onClick={
                          canEditClub
                            ? () =>
                                save({
                                  ...lineup,
                                  bench: lineup.bench.filter(
                                    (id) => id !== player.id,
                                  ),
                                })
                            : undefined
                        }
                      >
                        <LineupNameplate
                          kit={match.kit}
                          goalkeeper={goalkeeperPlate(
                            player.id,
                            lineup.benchPositions?.[player.id],
                          )}
                          sx={{ width: "100%" }}
                        >
                          <NameplateText
                            number={player.number}
                            name={player.name.split(" ")[0]}
                          />
                        </LineupNameplate>
                      </ButtonBase>
                      <FormControl size="small" sx={{ flex: 1, minWidth: 0 }}>
                        <InputLabel id={`bench-position-${player.id}`}>
                          Substitute For
                        </InputLabel>
                        <Select
                          labelId={`bench-position-${player.id}`}
                          label="Substitute For"
                          value={
                            lineup.benchPositions?.[player.id] ?? "Floater"
                          }
                          disabled={!canEditClub}
                          onChange={(event) => {
                            const benchPositions = { ...lineup.benchPositions };
                            if (event.target.value !== "Floater")
                              benchPositions[player.id] = event.target
                                .value as Position;
                            else delete benchPositions[player.id];
                            save({ ...lineup, benchPositions });
                          }}
                        >
                          <MenuItem value="Floater">Floater</MenuItem>
                          {slots.map((position, index) => {
                            const starter = data.players.find(
                              (p) => p.id === lineup.starters[index],
                            );
                            return (
                              <MenuItem key={position} value={position}>
                                {position} ·{" "}
                                {starter
                                  ? `#${starter.number} ${starter.name}`
                                  : "Empty"}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </Box>
                  );
                })}
                {benchPlayers.length === 0 && (
                  <Typography color="text.secondary">
                    No substitutes selected.
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
        <Stack gap={2} sx={{ minWidth: 0 }}>
          <ShareLineupButton data={data} match={match} lineup={lineup} />
          <LineupPitch
            data={data}
            lineup={lineup}
            onFormationChange={canEditClub ? changeFormation : undefined}
          />
          <Card>
            <CardContent>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                flexWrap="wrap"
                sx={{ mb: 1 }}
              >
                <Typography variant="h6">
                  Available Players ({availablePlayers.filter(player => !confirmedOutIds.has(player.id)).length})
                </Typography>
                <FormControlLabel
                  sx={{ ml: "auto", mr: 0 }}
                  label="Active Roster Only"
                  control={
                    <Checkbox
                      size="small"
                      checked={activeSquadOnly}
                      onChange={(_, checked) => setActiveSquadOnly(checked)}
                    />
                  }
                />
              </Stack>
              <Stack direction="row" gap={1} flexWrap="wrap">
                {availablePlayers.map((player) => {
                  const isOut = confirmedOutIds.has(player.id);
                  return (
                    <Box
                      key={player.id}
                      sx={{
                        width: 180,
                        maxWidth: "100%",
                        flexShrink: 0,
                        position: "relative",
                        pt: 2,
                        "&:hover .out-toggle, &:focus-within .out-toggle": {
                          opacity: 1,
                          transform: "translateY(0)",
                          pointerEvents: "auto",
                        },
                        "@media (hover: none)": {
                          "& .out-toggle": {
                            opacity: 1,
                            transform: "translateY(0)",
                            pointerEvents: "auto",
                          },
                        },
                      }}
                    >
                      <Button
                        className="out-toggle"
                        size="small"
                        variant={isOut ? "contained" : "outlined"}
                        aria-label={`${isOut ? "Restore" : "Mark"} #${player.number} ${player.name} ${isOut ? "to available players" : "as confirmed out"}`}
                        aria-pressed={isOut}
                        onClick={() => toggleConfirmedOut(player.id)}
                        sx={{
                          position: "absolute",
                          top: 0,
                          right: 8,
                          zIndex: 1,
                          minWidth: 48,
                          height: 20,
                          px: 0.5,
                          py: 0,
                          fontSize: 10,
                          lineHeight: 1,
                          color: isOut ? "#111" : "#fff",
                          borderColor: "#fff",
                          bgcolor: isOut ? "#fff" : "#111",
                          "&:hover": {
                            borderColor: "#fff",
                            bgcolor: isOut ? "#eee" : "#333",
                          },
                          opacity: isOut ? 1 : 0,
                          transform: isOut ? "translateY(0)" : "translateY(8px)",
                          pointerEvents: isOut ? "auto" : "none",
                          transition: "opacity .18s ease, transform .18s ease",
                        }}
                      >
                        Out
                      </Button>
                      <ButtonBase
                        type="button"
                        disabled={isOut}
                        aria-label={`Move #${player.number} ${player.name} to Bench`}
                        title={isOut ? `${player.name} is confirmed out` : `#${player.number} ${player.name}`}
                        sx={{
                          width: "100%",
                          cursor: isOut ? "default" : "pointer",
                          opacity: isOut ? 0.35 : 1,
                          transition: "opacity .18s ease",
                          "&:focus-visible": {
                            outline: "2px solid",
                            outlineColor: "primary.main",
                            outlineOffset: 2,
                          },
                        }}
                        onClick={() => save({ ...lineup, bench: [...lineup.bench, player.id] })}
                      >
                        <LineupNameplate kit={match.kit} sx={{ width: "100%" }}>
                          <NameplateText
                            number={player.number}
                            name={player.name.split(" ")[0]}
                          />
                        </LineupNameplate>
                      </ButtonBase>
                    </Box>
                  );
                })}
                {availablePlayers.length === 0 && (
                  <Typography color="text.secondary">
                    All available players are assigned.
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Stack>
  );
}
