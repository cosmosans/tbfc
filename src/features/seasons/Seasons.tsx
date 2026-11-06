import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { ClubData, Season } from "../../model";
import { record } from "../../model";
import { orderedSeasons } from "../../clubView";
import { CardGrid } from "../../components/layout";
import RecordBar from "../../components/RecordBar";
import { canEditClub } from "../../editAccess";
import SoccerBallIcon from "../../img/soccer-ball-variant.svg";
import GoalsAllowedIcon from "../../img/goal.svg";

export default function Seasons({
  data,
  update,
  openSeason,
}: {
  data: ClubData;
  update: (data: ClubData) => void;
  openSeason: (id: string) => void;
}) {
  const [editing, setEditing] = useState<Season | null>(null);
  const sorted = orderedSeasons(data, true);
  function saveSeason(season: Season) {
    update({
      ...data,
      seasons: data.seasons.some((s) => s.id === season.id)
        ? data.seasons.map((s) => (s.id === season.id ? season : s))
        : [...data.seasons, season],
    });
    setEditing(null);
  }
  return (
    <Stack gap={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Seasons</Typography>
        {canEditClub && (
          <Button variant="outlined" onClick={() => setEditing({ id: crypto.randomUUID(), name: "", notes: "", startsOn: "" })}>
            + Add Season
          </Button>
        )}
      </Stack>
      <CardGrid>
        {sorted.map((season) => {
          const games = data.matches.filter(
            (m) =>
              m.seasonId === season.id ||
              (!m.seasonId && m.season === season.name),
          );
          const r = record(games);
          return (
            <Card key={season.id}>
              <CardContent>
                <Typography variant="h6">{season.name}</Typography>
                <Typography color="text.secondary" variant="body2">
                  {r.played} match{r.played === 1 ? "" : "es"}
                </Typography>

                <Box sx={{ mt: 2, mb: 1 }}>
                  <RecordBar
                    variant="results"
                    wins={r.W}
                    draws={r.D}
                    losses={r.L}
                  />
                </Box>
                <Box sx={{ color: "text.secondary" }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: 12,
                        flex: 1,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <img
                        src={SoccerBallIcon}
                        alt="Goals"
                        style={{
                          width: 16,
                          height: 16,
                          marginRight: 5,
                          position: "relative",
                          top: -1,
                        }}
                      />
                      <strong
                        style={{
                          fontSize: 20,
                          paddingRight: 2.5,
                          color: "white",
                        }}
                      >
                        {r.for}
                      </strong>{" "}
                      Scored
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: 12,
                        flex: 1,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <img
                        src={GoalsAllowedIcon}
                        alt="Goals"
                        style={{
                          width: 16,
                          height: 16,
                          marginRight: 5,
                          position: "relative",
                          top: -1,
                        }}
                      />
                      <strong
                        style={{
                          fontSize: 20,
                          paddingRight: 2.5,
                          color: "white",
                        }}
                      >
                        {r.against}
                      </strong>{" "}
                      Allowed
                    </Typography>
                  </Box>
                </Box>
                {season.notes && (
                  <Typography sx={{ mt: 1 }}>{season.notes}</Typography>
                )}
                <Stack direction="row" gap={1} sx={{ mt: 1 }}>
                  <Button onClick={() => openSeason(season.id)}>
                    View matches
                  </Button>
                  {canEditClub && (
                    <Button onClick={() => setEditing({ ...season })}>
                      Edit
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </CardGrid>
      {canEditClub && (
        <SeasonDialog
          key={editing?.id ?? "closed"}
          season={editing}
          seasons={data.seasons}
          onClose={() => setEditing(null)}
          onSave={saveSeason}
        />
      )}
    </Stack>
  );
}

function SeasonDialog({
  season,
  seasons,
  onClose,
  onSave,
}: {
  season: Season | null;
  seasons: Season[];
  onClose: () => void;
  onSave: (season: Season) => void;
}) {
  const [draft, setDraft] = useState<Season | null>(season);
  const isNew = !seasons.some((item) => item.id === season?.id);
  const duplicateName = seasons.some((item) => item.id !== draft?.id && item.name.trim().toLowerCase() === draft?.name.trim().toLowerCase());
  return (
    <Dialog open={!!season} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isNew ? "Add Season" : "Edit season"}</DialogTitle>
      <DialogContent>
        <Stack gap={2} sx={{ pt: 1 }}>
          <TextField
            label="Season name"
            autoFocus
            required
            error={duplicateName}
            helperText={duplicateName ? "A season with this name already exists." : undefined}
            value={draft?.name ?? ""}
            onChange={(e) =>
              draft && setDraft({ ...draft, name: e.target.value })
            }
          />
          <TextField
            label="Start date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={draft?.startsOn ?? ""}
            onChange={(e) =>
              draft && setDraft({ ...draft, startsOn: e.target.value })
            }
          />
          <TextField
            label="Notes"
            multiline
            minRows={3}
            value={draft?.notes ?? ""}
            onChange={(e) =>
              draft && setDraft({ ...draft, notes: e.target.value })
            }
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!draft?.name.trim() || duplicateName}
          onClick={() => draft && onSave({ ...draft, name: draft.name.trim() })}
        >
          {isNew ? "Add Season" : "Save Season"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
