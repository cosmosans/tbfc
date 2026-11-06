import { playerStats } from "./playerStats";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import type { ClubData, Player } from "../../model";
import { displayScore } from "../../model";
import { opponentName, seasonName } from "../../clubView";
import { canEditClub } from "../../editAccess";

export default function PlayerDetail({
  player,
  data,
  update,
}: {
  player: Player;
  data: ClubData;
  update: (data: ClubData) => void;
}) {
  const [bioOpen, setBioOpen] = useState(false);
  const [bio, setBio] = useState("");
  const events = data.events.filter((event) => event.playerId === player.id);
  const counts = playerStats(player, events);
  const history = data.matches
    .filter(
      (match) =>
        match.status !== "scheduled" &&
        (events.some((event) => event.matchId === match.id) ||
          data.lineups.some(
            (lineup) =>
              lineup.matchId === match.id &&
              (lineup.starters.includes(player.id) ||
                lineup.bench.includes(player.id)),
          )),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  return (
    <Stack gap={3}>
      <Button
        component={Link}
        to="/roster"
        startIcon={<ArrowBackIcon />}
        sx={{ alignSelf: "flex-start" }}
      >
        Back to Roster
      </Button>
      <Card>
        <CardContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            gap={3}
            alignItems={{ sm: "center" }}
          >
            {player.photoUrl ? (
              <Box
                component="img"
                src={player.photoUrl}
                alt={player.name}
                sx={{
                  width: { xs: "100%", sm: 200 },
                  maxHeight: 280,
                  objectFit: "cover",
                }}
              />
            ) : (
              <PersonOutlineIcon
                sx={{ fontSize: 120, color: "text.secondary" }}
              />
            )}
            <Stack gap={1}>
              <Typography color="primary" variant="h4">
                #{player.number || "—"}
              </Typography>
              <Typography variant="h4">{player.name}</Typography>
              {player.playerType && (
                <Typography>{player.playerType}</Typography>
              )}
              <Typography color="text.secondary">
                {[player.preferredPosition, player.secondaryPosition]
                  .filter(Boolean)
                  .join(" / ") || "Position not set"}
              </Typography>
              <Chip
                label={player.active ? "Active" : "Inactive"}
                color={player.active ? "success" : "default"}
                sx={{ alignSelf: "flex-start" }}
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
          gap: 2,
        }}
      >
        {counts.map(([label, count]) => (
          <Card key={label}>
            <CardContent>
              <Typography variant="h4" color="primary">
                {count}
              </Typography>
              <Typography>{label}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
      <Typography variant="body2" color="text.secondary">
        Career totals include historical player totals and recorded match
        events. Historical totals may not have individual match records.
      </Typography>
      <Card>
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <Typography variant="h6">Bio</Typography>
            {canEditClub && (
              <Button
                onClick={() => {
                  setBio(player.bio ?? "");
                  setBioOpen(true);
                }}
              >
                {player.bio ? "Edit Bio" : "Add Bio"}
              </Button>
            )}
          </Stack>
          <Typography
            variant="body2"
            sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
            color={player.bio ? "text.primary" : "text.secondary"}
          >
            {player.bio || "No bio added yet."}
          </Typography>
        </CardContent>
      </Card>
      <Stack gap={2}>
        <Typography variant="h5">Match History</Typography>
        <Typography variant="body2" color="text.secondary">
          Matches with a saved lineup selection or a recorded event.
        </Typography>
        {!history.length && (
          <Typography color="text.secondary">
            No match history recorded yet.
          </Typography>
        )}
        {history.map((match) => {
          const lineup = data.lineups.find((item) => item.matchId === match.id);

          console.log(lineup, match);
          return (
            <Card key={match.id}>
              <CardContent>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  gap={1}
                >
                  <Button
                    component={Link}
                    to={`/match/${encodeURIComponent(match.id)}`}
                    sx={{ justifyContent: "flex-start" }}
                  >
                    {match.date} · {opponentName(data, match)} ·{" "}
                    {displayScore(match)}
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    {seasonName(data, match)} ·{" "}
                    {lineup?.starters.includes(player.id)
                      ? "Starting Lineup"
                      : lineup?.bench.includes(player.id)
                        ? "Bench"
                        : "Event"}
                  </Typography>
                </Stack>
                {events
                  .filter((event) => event.matchId === match.id)
                  .sort((a, b) => (a.minute ?? 999) - (b.minute ?? 999))
                  .map((event) => (
                    <Typography
                      key={event.id}
                      sx={{
                        mt: 1,
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                      }}
                    >
                      <strong>
                        {event.minute != null ? `${event.minute}′ · ` : ""}
                        {event.ownGoal
                          ? "Own goal"
                          : event.kind.replaceAll("_", " ")}
                      </strong>
                      {event.note ? ` — ${event.note}` : ""}
                    </Typography>
                  ))}
              </CardContent>
            </Card>
          );
        })}
      </Stack>
      <Dialog
        open={bioOpen}
        onClose={() => setBioOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Player Bio</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            multiline
            minRows={6}
            fullWidth
            label="Bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBioOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              update({
                ...data,
                players: data.players.map((item) =>
                  item.id === player.id ? { ...item, bio: bio.trim() } : item,
                ),
              });
              setBioOpen(false);
            }}
          >
            Save Bio
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
