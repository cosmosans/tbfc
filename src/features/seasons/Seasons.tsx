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

export default function Seasons({
  data,
  update,
  openSeason,
}: {
  data: ClubData;
  update: (data: ClubData) => void;
  openSeason: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [startsOn, setStartsOn] = useState("");
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
      {canEditClub && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Seasons
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Each match belongs to a season. Records and goal totals are
              calculated from its games.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
              <TextField
                label="Season name"
                size="small"
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={{ flexGrow: 1 }}
              />
              <TextField
                label="Start date"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={startsOn}
                onChange={(e) => setStartsOn(e.target.value)}
              />
              <Button
                variant="contained"
                disabled={
                  !name.trim() ||
                  data.seasons.some(
                    (s) => s.name.toLowerCase() === name.trim().toLowerCase(),
                  )
                }
                onClick={() => {
                  saveSeason({
                    id: crypto.randomUUID(),
                    name: name.trim(),
                    notes: "",
                    startsOn,
                  });
                  setName("");
                  setStartsOn("");
                }}
              >
                Add season
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}
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
                <Typography color="text.secondary">
                  <Box sx={{ display: "flex", alignItems: "center" }}>
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
                      {r.for !== 1 ? "s" : ""} Scored
                    </Typography>
                  </Box>
                </Typography>
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
          onClose={() => setEditing(null)}
          onSave={saveSeason}
        />
      )}
    </Stack>
  );
}

function SeasonDialog({
  season,
  onClose,
  onSave,
}: {
  season: Season | null;
  onClose: () => void;
  onSave: (season: Season) => void;
}) {
  const [draft, setDraft] = useState<Season | null>(season);
  return (
    <Dialog open={!!season} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit season</DialogTitle>
      <DialogContent>
        <Stack gap={2} sx={{ pt: 1 }}>
          <TextField
            label="Season name"
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
          disabled={!draft?.name.trim()}
          onClick={() => draft && onSave({ ...draft, name: draft.name.trim() })}
        >
          Save Season
        </Button>
      </DialogActions>
    </Dialog>
  );
}
