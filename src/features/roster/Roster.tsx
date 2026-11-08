import { playerStats } from "./playerStats";
import { PlayerInformation } from "./PlayerCard.styles";
import PlayerTypeSelect from "./PlayerTypeSelect";
import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { canEditClub } from "../../editAccess";
import { byPlayerNumber } from "../../playerOrder";
import {
  positions,
  type ClubData,
  type Player,
  type PlayerType,
  type Position,
} from "../../model";
import PlayerCard, { PositionSelect } from "./PlayerCard";
import PageHeading from "../../components/PageHeading";

type SortKey =
  | "number"
  | "name"
  | "goals"
  | "assists"
  | "saves"
  | "cards"
  | "status";
const statColumns = [
  ["goals", "Goals"],
  ["assists", "Assists"],
  ["saves", "PK Saves"],
  ["cards", "Yellow Cards"],
] as const;

export default function Roster({
  data,
  update,
}: {
  data: ClubData;
  update: (data: ClubData) => void;
}) {
  const [playerType, setPlayerType] = useState<PlayerType | "">("");
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [preferredPosition, setPreferredPosition] = useState<Position | "">("");
  const [addOpen, setAddOpen] = useState(false);
  const [startersOpen, setStartersOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("number");
  const [descending, setDescending] = useState(false);
  const rows = data.players
    .map((player) => {
      const events = data.events.filter(
        (event) => event.playerId === player.id,
      );
      return { player, events, stats: playerStats(player, events) };
    })
    .sort((a, b) => {
      let comparison: number;
      if (sortKey === "number") comparison = byPlayerNumber(a.player, b.player);
      else if (sortKey === "name")
        comparison = a.player.name.localeCompare(b.player.name);
      else if (sortKey === "status")
        comparison = Number(b.player.active) - Number(a.player.active);
      else {
        const index = statColumns.findIndex(([key]) => key === sortKey);
        comparison = a.stats[index][1] - b.stats[index][1];
      }
      return (
        (descending ? -comparison : comparison) ||
        byPlayerNumber(a.player, b.player)
      );
    });
  function sortHeader(key: SortKey, label: string) {
    const active = sortKey === key;
    return (
      <Button
        size="small"
        onClick={() => {
          if (active) setDescending(!descending);
          else {
            setSortKey(key);
            setDescending(statColumns.some(([value]) => value === key));
          }
        }}
        aria-label={`Sort by ${label}${active ? (descending ? ", descending" : ", ascending") : ""}`}
        sx={{
          minWidth: 0,
          px: 0.25,
          fontSize: { xs: ".65rem", md: ".75rem" },
          color: active ? "primary.main" : "text.secondary",
        }}
      >
        {label}
        {active ? (descending ? " ↓" : " ↑") : ""}
      </Button>
    );
  }

  const savePlayer = (saved: Player) =>
    update({
      ...data,
      players: data.players.map((p) => (p.id === saved.id ? saved : p)),
    });
  function closeAdd() {
    setAddOpen(false);
    setName("");
    setNumber("");
    setPreferredPosition("");
    setPlayerType("");
  }
  function addPlayer() {
    if (!name.trim()) return;
    update({
      ...data,
      players: [
        ...data.players,
        {
          id: crypto.randomUUID(),
          name: name.trim(),
          number: number.trim(),
          active: true,
          playerType,
          preferredPosition,
          secondaryPosition: "",
        },
      ],
    });
    closeAdd();
  }
  return (
    <Stack gap={2}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        gap={2}
      >
        <PageHeading>Roster</PageHeading>
        {canEditClub && (
          <Stack direction="row" gap={2}>
            <Button variant="outlined" onClick={() => setStartersOpen(true)}>
              Starting XII
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddOpen(true)}
            >
              Add Player
            </Button>
          </Stack>
        )}
      </Stack>
      {canEditClub && (
        <Dialog open={addOpen} onClose={closeAdd} fullWidth maxWidth="sm">
          <DialogTitle>Add Player</DialogTitle>
          <DialogContent>
            <Stack gap={2} sx={{ pt: 1 }}>
              <TextField
                label="Name"
                autoFocus
                required
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                label="Shirt Number"
                fullWidth
                value={number}
                onChange={(e) => setNumber(e.target.value)}
              />
              <PlayerTypeSelect value={playerType} onChange={setPlayerType} />
              <PositionSelect
                label="Primary Position"
                value={preferredPosition}
                onChange={setPreferredPosition}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeAdd}>Cancel</Button>
            <Button
              variant="contained"
              disabled={!name.trim()}
              onClick={addPlayer}
            >
              Add Player
            </Button>
          </DialogActions>
        </Dialog>
      )}
      <Dialog
        open={startersOpen}
        onClose={() => setStartersOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Starting XII</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Set the full strength starter for each position. Load these picks
            into a match from the lineup page.
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: 2,
              pt: 1,
            }}
          >
            {positions.map((position) => (
              <FormControl key={position} size="small" fullWidth>
                <InputLabel>{position}</InputLabel>
                <Select
                  label={position}
                  value={data.firstChoice?.[position] ?? ""}
                  disabled={!canEditClub}
                  onChange={(event) =>
                    update({
                      ...data,
                      firstChoice: {
                        ...data.firstChoice,
                        [position]: event.target.value,
                      },
                    })
                  }
                >
                  <MenuItem value="">None</MenuItem>
                  {[...data.players]
                    .sort(
                      (a, b) =>
                        Number(b.preferredPosition === position) -
                          Number(a.preferredPosition === position) ||
                        Number(b.secondaryPosition === position) -
                          Number(a.secondaryPosition === position) ||
                        byPlayerNumber(a, b),
                    )
                    .map((player) => (
                      <MenuItem key={player.id} value={player.id}>
                        #{player.number} {player.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStartersOpen(false)}>Done</Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ bgcolor: "background.paper", overflow: "hidden" }}>
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
            bgcolor: "rgba(255,255,255,.09)",
            borderBottom: "1px solid rgba(255,255,255,.2)",
          }}
        >
          <Box
            sx={{
              flex: { xs: "0 0 100px", sm: "0 0 180px" },
              color: "text.secondary",
              textAlign: "center",
              fontSize: ".75rem",
            }}
          >
            Photo
          </Box>
          <PlayerInformation as="div" style={{ background: "transparent" }}>
            <Box sx={{ gridArea: "number" }}>
              {sortHeader("number", "Number")}
            </Box>
            <Box sx={{ gridArea: "identity" }}>
              {sortHeader("name", "Name")}
            </Box>
            <Box
              sx={{
                gridArea: "stats",
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: { xs: 1, md: 2 },
              }}
            >
              {statColumns.map(([key, label]) => (
                <Box key={key} sx={{ textAlign: "center" }}>
                  {sortHeader(key, label)}
                </Box>
              ))}
            </Box>
            <Box sx={{ gridArea: "status", textAlign: "right" }}>
              {sortHeader("status", "Status")}
            </Box>
          </PlayerInformation>
        </Box>
        <Stack gap={0}>
          {rows.map(({ player, events }) => (
            <PlayerCard
              key={player.id}
              player={player}
              events={events}
              onSave={savePlayer}
            />
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}
