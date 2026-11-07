import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import type { Location, Match, Opponent, Season } from "../../model";
import { scoreResult } from "../../model";
import { splitMatchLocation } from "../../matchLocation";
import { isTurfbotReport } from "./reportAttribution";

export default function MatchDialog({
  open,
  match,
  teams,
  seasons,
  locations,
  onClose,
  onSave,
}: {
  open: boolean;
  match: Match;
  teams: Opponent[];
  seasons: Season[];
  locations: Location[];
  onClose: () => void;
  onSave: (match: Match) => void;
}) {
  const [draft, setDraft] = useState(match);
  useEffect(() => {
    if (open)
      setDraft({ ...match, ...splitMatchLocation(match.venue, match.pitch) });
  }, [open, match.id]);
  const selectedTeamId =
    draft.opponentId ??
    teams.find((team) => team.name === draft.opponent)?.id ??
    "";
  const selectedSeasonId =
    draft.seasonId ??
    seasons.find((season) => season.name === draft.season)?.id ??
    "";
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {match.sourceRow
          ? "Edit Imported Match"
          : match.status === "scheduled"
            ? "Fixture Details"
            : "Match Details"}
      </DialogTitle>
      <DialogContent>
        <Stack gap={2} sx={{ pt: 1 }}>
          <FormControl fullWidth required>
            <InputLabel>Team</InputLabel>
            <Select
              label="Team"
              value={selectedTeamId}
              onChange={(e) => {
                const team = teams.find((item) => item.id === e.target.value);
                if (team)
                  setDraft({
                    ...draft,
                    opponentId: team.id,
                    opponent: team.name,
                  });
              }}
            >
              {teams.map((team) => (
                <MenuItem key={team.id} value={team.id}>
                  {team.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={draft.status ?? "completed"}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  status: e.target.value as Match["status"],
                })
              }
            >
              <MenuItem value="scheduled">Upcoming</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
          <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
            <TextField
              label="Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={draft.date}
              onChange={(e) => setDraft({ ...draft, date: e.target.value })}
              fullWidth
            />
            <TextField
              label="Kickoff"
              value={draft.kickoff}
              onChange={(e) => setDraft({ ...draft, kickoff: e.target.value })}
              fullWidth
            />
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
            <FormControl fullWidth required>
              <InputLabel>Season</InputLabel>
              <Select
                label="Season"
                value={selectedSeasonId}
                onChange={(e) => {
                  const season = seasons.find(
                    (item) => item.id === e.target.value,
                  );
                  if (season)
                    setDraft({
                      ...draft,
                      seasonId: season.id,
                      season: season.name,
                    });
                }}
              >
                {seasons.map((season) => (
                  <MenuItem key={season.id} value={season.id}>
                    {season.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Competition"
              value={draft.competition}
              onChange={(e) =>
                setDraft({ ...draft, competition: e.target.value })
              }
              fullWidth
            />
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
            <FormControl fullWidth>
              <InputLabel>Location</InputLabel>
              <Select
                label="Location"
                value={
                  draft.locationId ??
                  locations.find((item) => item.name === draft.venue)?.id ??
                  ""
                }
                onChange={(e) => {
                  const location = locations.find(
                    (item) => item.id === e.target.value,
                  );
                  setDraft({
                    ...draft,
                    locationId: location?.id,
                    venue: location?.name ?? "",
                  });
                }}
              >
                <MenuItem value="">Not recorded</MenuItem>
                {locations.map((location) => (
                  <MenuItem key={location.id} value={location.id}>
                    {location.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Pitch</InputLabel>
              <Select
                label="Pitch"
                value={draft.pitch ?? ""}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    pitch: (e.target.value || undefined) as Match["pitch"],
                  })
                }
              >
                <MenuItem value="">Not recorded</MenuItem>
                <MenuItem value="1">Pitch 1</MenuItem>
                <MenuItem value="2">Pitch 2</MenuItem>
                <MenuItem value="3">Pitch 3</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <FormControl fullWidth>
            <InputLabel>Home or Away</InputLabel>
            <Select
              label="Home or Away"
              value={draft.homeAway ?? ""}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  homeAway: (e.target.value || undefined) as Match["homeAway"],
                })
              }
            >
              <MenuItem value="">Not recorded</MenuItem>
              <MenuItem value="home">Home</MenuItem>
              <MenuItem value="away">Away</MenuItem>
            </Select>
          </FormControl>
          {draft.status !== "scheduled" && (
            <>
              <Stack direction="row" gap={2}>
                <TextField
                  label="TBFC Goals"
                  type="number"
                  inputProps={{ min: 0 }}
                  value={draft.goalsFor}
                  onChange={(e) =>
                    setDraft({ ...draft, goalsFor: Number(e.target.value) })
                  }
                  fullWidth
                />
                <TextField
                  label="Opponent Goals"
                  type="number"
                  inputProps={{ min: 0 }}
                  value={draft.goalsAgainst}
                  onChange={(e) =>
                    setDraft({ ...draft, goalsAgainst: Number(e.target.value) })
                  }
                  fullWidth
                />
              </Stack>
              <Stack direction="row" gap={2}>
                <TextField
                  label="Shootout: TBFC"
                  type="number"
                  inputProps={{ min: 0 }}
                  value={draft.shootoutFor ?? ""}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      shootoutFor:
                        e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                  fullWidth
                />
                <TextField
                  label="Shootout: Opponent"
                  type="number"
                  inputProps={{ min: 0 }}
                  value={draft.shootoutAgainst ?? ""}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      shootoutAgainst:
                        e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                  fullWidth
                />
              </Stack>
            </>
          )}
          <TextField
            select
            label="Kit"
            value={draft.kit}
            onChange={(e) => setDraft({ ...draft, kit: e.target.value })}
          >
            {!draft.kit && (
              <MenuItem value="" disabled>
                Choose a kit
              </MenuItem>
            )}
            {draft.kit && draft.kit !== "Black" && draft.kit !== "White" && (
              <MenuItem value={draft.kit} disabled>
                {draft.kit} (historical)
              </MenuItem>
            )}
            <MenuItem value="Black">Black</MenuItem>
            <MenuItem value="White">White</MenuItem>
          </TextField>
          {draft.status === "scheduled" && (
            <TextField
              label="Fixture Notes"
              value={draft.report}
              onChange={(e) => setDraft({ ...draft, report: e.target.value })}
              multiline
              minRows={4}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!selectedTeamId || !selectedSeasonId || !draft.date}
          onClick={() =>
            onSave({
              ...draft,
              reportAuthor: draft.report && isTurfbotReport(match) ? "turfbot" : undefined,
              resultLabel:
                draft.status === "scheduled" || draft.status === "in_progress"
                  ? ""
                  : draft.sourceRow
                    ? draft.resultLabel
                    : scoreResult(draft),
            })
          }
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
