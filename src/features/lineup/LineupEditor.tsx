import {
  Alert,
  Card,
  CardContent,
  Chip,
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
import { formationSlots } from "./formations";
import LineupPitch from "./LineupPitch";

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
  const benchPlayers = data.players.filter(
    (player) =>
      lineup.bench.includes(player.id) && !lineup.starters.includes(player.id),
  );
  const unavailablePlayers = data.players.filter(
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
  console.log(missingStarters && "23");
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
      <LineupPitch data={data} lineup={lineup} />
      <Card>
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Starting VII</Typography>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Formation</InputLabel>
              <Select
                label="Formation"
                value={lineup.formation}
                onChange={(e) => changeFormation(e.target.value as Formation)}
              >
                <MenuItem value="1-2-3-1">1-2-3-1</MenuItem>
                <MenuItem value="1-3-3">1-3-3</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Players who prefer a role appear first in that slot’s list. You can
            still choose anyone.
          </Typography>
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
                    onChange={(e) => assignStarter(index, e.target.value)}
                  >
                    <MenuItem value="">Empty</MenuItem>
                    {candidatesFor(slot).map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        #{p.number} {p.name}
                        {p.preferredPosition === slot
                          ? " · preferred"
                          : p.secondaryPosition === slot
                            ? " · secondary"
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
            Bench · {benchPlayers.length}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Tap a player to move them to Unavailable.
          </Typography>
          <Stack direction="row" gap={1} flexWrap="wrap">
            {benchPlayers.map((player) => (
              <Chip
                key={player.id}
                label={`#${player.number} ${player.name}`}
                color="primary"
                onClick={() =>
                  save({
                    ...lineup,
                    bench: lineup.bench.filter((id) => id !== player.id),
                  })
                }
              />
            ))}
            {benchPlayers.length === 0 && (
              <Typography color="text.secondary">
                No substitutes selected.
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Unavailable · {unavailablePlayers.length}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Everyone starts here. Tap a player to add them to the bench, or
            choose them for a starting slot above.
          </Typography>
          <Stack direction="row" gap={1} flexWrap="wrap">
            {unavailablePlayers.map((player) => (
              <Chip
                key={player.id}
                label={`#${player.number} ${player.name}`}
                onClick={() =>
                  save({ ...lineup, bench: [...lineup.bench, player.id] })
                }
              />
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
  );
}
