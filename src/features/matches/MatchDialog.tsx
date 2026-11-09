import { useEffect, useState } from "react";
import moment from "moment";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
} from "@mui/material";
import type { Location, Match, Opponent, Season } from "../../model";
import { scoreResult } from "../../model";
import { splitMatchLocation } from "../../matchLocation";
import { isTurfbotReport } from "./reportAttribution";
import { splitCompetition } from "../../matchCompetition";
import { canEditClub } from "../../editAccess";

export default function MatchDialog({
  open,
  match,
  matches,
  teams,
  seasons,
  locations,
  onClose,
  onDelete,
  onSave,
}: {
  open: boolean;
  match: Match;
  matches: Match[];
  teams: Opponent[];
  seasons: Season[];
  locations: Location[];
  onClose: () => void;
  onDelete?: () => void;
  onSave: (match: Match) => void;
}) {
  const [draft, setDraft] = useState(match);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [kickoffValue, setKickoffValue] = useState<moment.Moment | null>(null);
  const [kickoffInvalid, setKickoffInvalid] = useState(false);
  useEffect(() => {
    if (open) {
      setDraft({ ...splitCompetition(match), ...splitMatchLocation(match.venue, match.pitch), matchAuditComplete: match.matchAuditComplete ?? false });
      const parsed = moment(match.kickoff, "h:mm A", true);
      setKickoffValue(match.kickoff && parsed.isValid() ? parsed : null);
      setKickoffInvalid(false);
    }
  }, [open, match.id]);
  const selectedTeamId =
    draft.opponentId ??
    teams.find((team) => team.name === draft.opponent)?.id ??
    "";
  const selectedSeasonId =
    draft.seasonId ??
    seasons.find((season) => season.name === draft.season)?.id ??
    "";
  const competitionOptions = [...new Set(matches.map(item => splitCompetition(item).competition).filter(Boolean))].sort();
  if (confirmDelete && onDelete) {
    return (
      <Dialog open={open} onClose={() => setConfirmDelete(false)} aria-labelledby="delete-match-title">
        <DialogTitle id="delete-match-title">Delete match against {match.opponent}?</DialogTitle>
        <DialogContent>
          The {match.date} match, all its events, lineup, matchboard, report, chat, and media
          will be removed. Team and player stats will update. Publish to apply the deletion for everyone.
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => {
            setConfirmDelete(false);
            onDelete();
          }}>Delete Match</Button>
        </DialogActions>
      </Dialog>
    );
  }
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
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <TimePicker
                label="Kickoff"
                ampm
                format="h:mm A"
                value={kickoffValue}
                onChange={(value) => {
                  setKickoffValue(value);
                  if (value === null) setDraft((current) => ({ ...current, kickoff: "" }));
                  else if (value.isValid()) setDraft((current) => ({ ...current, kickoff: value.format("h:mm A") }));
                }}
                onError={(error) => setKickoffInvalid(error !== null)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
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
            <FormControl fullWidth>
              <InputLabel>League</InputLabel>
              <Select label="League" value={draft.league ?? ""} onChange={(e) => setDraft({ ...draft, league: e.target.value as Match["league"] })}>
                <MenuItem value="">Not recorded</MenuItem>
                <MenuItem value="D5">D5</MenuItem>
                <MenuItem value="D6">D6</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <Autocomplete
            freeSolo
            options={competitionOptions}
            value={draft.competition}
            inputValue={draft.competition}
            onInputChange={(_, value) => setDraft(current => ({ ...current, competition: value }))}
            onChange={(_, value) => setDraft(current => ({ ...current, competition: value ?? "" }))}
            renderInput={(params) => <TextField {...params} label="Competition" helperText="Choose an existing competition or type a new one" />}
          />
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
          {canEditClub && (
            <FormControlLabel
              control={
                <Switch
                  checked={draft.matchAuditComplete ?? false}
                  onChange={(event) => setDraft({ ...draft, matchAuditComplete: event.target.checked })}
                />
              }
              label="Match Audit Complete"
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        {onDelete && <Button color="error" sx={{ mr: "auto" }} onClick={() => setConfirmDelete(true)}>Delete Match</Button>}
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!selectedTeamId || !selectedSeasonId || !draft.date || kickoffInvalid}
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
