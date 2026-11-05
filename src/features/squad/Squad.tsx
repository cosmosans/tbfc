import { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { canEditClub } from "../../editAccess";
import type { ClubData, Player, Position } from "../../model";
import PlayerCard, { PositionSelect } from "./PlayerCard";
import { FourColumnGrid } from "../../components/layout";

export default function Squad({
  data,
  update,
}: {
  data: ClubData;
  update: (data: ClubData) => void;
}) {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [preferredPosition, setPreferredPosition] = useState<Position | "">("");
  const [addOpen, setAddOpen] = useState(false);
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
          preferredPosition,
          secondaryPosition: "",
        },
      ],
    });
    closeAdd();
  }
  return (
    <Stack gap={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
        <Typography variant="h5" sx={{ bgcolor: "#111", color: "#fff", px: 2, py: 1 }}>Squad</Typography>
        {canEditClub && <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>Add Player</Button>}
      </Stack>
      {canEditClub && <Dialog open={addOpen} onClose={closeAdd} fullWidth maxWidth="sm">
        <DialogTitle>Add player</DialogTitle>
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
              label="Shirt number"
              fullWidth
              value={number}
              onChange={(e) => setNumber(e.target.value)}
            />
            <PositionSelect
              label="Preferred position"
              value={preferredPosition}
              onChange={setPreferredPosition}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAdd}>Cancel</Button>
          <Button variant="contained" disabled={!name.trim()} onClick={addPlayer}>Add player</Button>
        </DialogActions>
      </Dialog>}
      <FourColumnGrid>
        {data.players.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            events={data.events.filter((event) => event.playerId === player.id)}
            onSave={savePlayer}
          />
        ))}
      </FourColumnGrid>
    </Stack>
  );
}

