import {
  Alert,
  Box,
  ButtonBase,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import type { ClubData, Formation, Match, Player, Position } from "../../model";
import { defaultLineup } from "../../store";
import { LineupGrid } from "../../components/layout";
import {
  LineupNameplate,
  NameplateText,
  goalkeeperPlate,
} from "../../components/LineupNameplate";
import { formationSlots } from "./formations";
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
  const lineup =
    data.lineups.find((l) => l.matchId === match.id) ?? defaultLineup(match.id);
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
  const benchPlayers = data.players
    .filter(
      (player) =>
        lineup.bench.includes(player.id) &&
        !lineup.starters.includes(player.id),
    )
    .sort(byPlayerNumber);
  const unavailablePlayers = data.players
    .filter(
      (player) =>
        !lineup.starters.includes(player.id) &&
        !lineup.bench.includes(player.id),
    )
    .sort(byPlayerNumber);
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
  const candidatesFor = (position: Position) =>
    [...data.players].sort((a, b) => {
      const rank = (player: Player) =>
        player.preferredPosition === position
          ? 0
          : player.secondaryPosition === position
            ? 1
            : 2;
      return rank(a) - rank(b) || a.name.localeCompare(b.name);
    });
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
              >
                <Typography variant="h6">Starting VII</Typography>
              </Stack>

              <LineupGrid sx={{ mt: 2 }}>
                {lineup.starters.map((id, index) => {
                  const slot = slots[index];
                  const label = slot;
                  return (
                    <FormControl key={index} size="small" fullWidth>
                      <InputLabel>{label}</InputLabel>
                      <Select
                        label={label}
                        value={id}
                        disabled={!canEditClub}
                        onChange={(e) => assignStarter(index, e.target.value)}
                      >
                        <MenuItem value="">Empty</MenuItem>
                        {candidatesFor(slot).map((p) => (
                          <MenuItem key={p.id} value={p.id}>
                            #{p.number} {p.name}
                            {p.preferredPosition === slot
                              ? " (Primary)"
                              : p.secondaryPosition === slot
                                ? " (Secondary)"
                                : ""}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
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
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <ButtonBase
                        type="button"
                        disabled={!canEditClub}
                        aria-label={`Move #${player.number} ${player.name} to Unavailable`}
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
                      <FormControl size="small" sx={{}}>
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
                            if (event.target.value)
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
              <Typography variant="h6" gutterBottom>
                Unavailable ({unavailablePlayers.length})
              </Typography>
              <Stack direction="row" gap={1} flexWrap="wrap">
                {unavailablePlayers.map((player) => (
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
                {unavailablePlayers.length === 0 && (
                  <Typography color="text.secondary">
                    Everyone is assigned.
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
