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
import { formationSlots } from "./formations";
import ImportLineupDialog from "./ImportLineupDialog";
import LineupPitch from "./LineupPitch";
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
  const [importFor, setImportFor] = useState<string | null>(null);
  const [activeSquadOnly, setActiveSquadOnly] = useState(false);
  const lineup =
    data.lineups.find((l) => l.matchId === match.id) ?? defaultLineup(match.id);
  if (!canEditClub) {
    return <LineupPitch data={data} lineup={lineup} showTitle={false} />;
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
    save({
      ...lineup,
      formation,
      starters,
      bench: [...lineup.bench, ...displaced],
    });
  }
  function loadFirstChoice() {
    const used = new Set<string>();
    const starters = slots.map(position => {
      const id = data.firstChoice?.[position] ?? "";
      if (!id || used.has(id) || !data.players.some(player => player.id === id && player.active)) return "";
      used.add(id);
      return id;
    });
    save({ ...lineup, starters, bench: lineup.bench.filter(id => !used.has(id)) });
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
  const eligiblePlayers = data.players
    .filter((player) => !activeSquadOnly || player.active)
    .sort(byPlayerNumber);
  const availablePlayers = eligiblePlayers
    .filter(
      (player) =>
        !lineup.starters.includes(player.id) &&
        !lineup.bench.includes(player.id),
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
      {importFor === match.id && (
        <ImportLineupDialog data={data} match={match} onClose={() => setImportFor(null)}
          onApply={next => { save(next); setImportFor(null); }}
        />
      )}
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
                <Typography variant="h6">Starting VII</Typography>
                <Stack direction="row" gap={1} flexWrap="wrap">
                  <Button size="small" variant="outlined" onClick={() => setImportFor(match.id)}>Import lineup</Button>
                  <Button size="small" variant="outlined" disabled={!canEditClub || !lineup.starters.some(Boolean)} onClick={() => save({ ...lineup, starters: lineup.starters.map(() => "") })}>
                    Clear
                  </Button>
                  <Button size="small" variant="contained" disabled={!canEditClub || !data.firstChoice || !Object.values(data.firstChoice).some(Boolean)} onClick={loadFirstChoice}>
                    Load First Choice VII
                  </Button>
                </Stack>
              </Stack>

              <LineupGrid sx={{ mt: 2 }}>
                {lineup.starters.map((id, index) => {
                  const slot = slots[index];
                  const selected = data.players.find(player => player.id === id);
                  const options = [...data.players].sort(byPlayerNumber);
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
                      getOptionKey={player => player.id}
                      isOptionEqualToValue={(player, value) => player.id === value.id}
                      filterOptions={(players, { inputValue }) => {
                        const query = inputValue.trim().toLocaleLowerCase();
                        if (query) return players.filter(player =>
                          playerLabel(player).toLocaleLowerCase().includes(query),
                        );
                        return eligiblePlayers.filter(player =>
                          player.preferredPosition === slot || player.secondaryPosition === slot,
                        );
                      }}
                      onChange={(_, player) => assignStarter(index, player?.id ?? "")}
                      renderOption={({ key, ...props }, player) => (
                        <li key={key} {...props}>
                          {playerLabel(player)}
                          {player.preferredPosition === slot ? " (Primary)" :
                            player.secondaryPosition === slot ? " (Secondary)" : ""}
                        </li>
                      )}
                      noOptionsText="No matches. Search by name or number."
                      renderInput={params => <TextField {...params} label={slot} />}
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
          <LineupPitch
            data={data}
            lineup={lineup}
            onFormationChange={canEditClub ? changeFormation : undefined}
          />
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" sx={{ mb: 1 }}>
                <Typography variant="h6">
                  Available Players ({availablePlayers.length})
                </Typography>
                <FormControlLabel
                  sx={{ ml: "auto", mr: 0 }}
                  label="Active Squad Only"
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
                {availablePlayers.map((player) => (
                  <ButtonBase
                    key={player.id}
                    type="button"
                    disabled={!canEditClub}
                    aria-label={`Move #${player.number} ${player.name} to Bench`}
                    title={`#${player.number} ${player.name}`}
                    sx={{
                      width: 180,
                      maxWidth: "100%",
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
                              bench: [...lineup.bench, player.id],
                            })
                        : undefined
                    }
                  >
                    <LineupNameplate kit={match.kit} sx={{ width: "100%" }}>
                      <NameplateText
                        number={player.number}
                        name={player.name.split(" ")[0]}
                      />
                    </LineupNameplate>
                  </ButtonBase>
                ))}
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
