import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import type { ClubData, Match } from "../../model";
import { opponentName, orderedSeasons } from "../../clubView";
import { parseScheduleCsv } from "../../scheduleImport";
import type { FixtureRow } from "../../scheduleImport";

export default function ScheduleImporter({
  data,
  update,
  open,
  onClose,
}: {
  data: ClubData;
  update: (data: ClubData) => void;
  open: boolean;
  onClose: () => void;
}) {
  const seasons = orderedSeasons(data, true);
  const [seasonId, setSeasonId] = useState(seasons[0]?.id ?? "");
  const [rows, setRows] = useState<FixtureRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const selectedSeason = data.seasons.find((item) => item.id === seasonId);
  const keyFor = (date: string, opponent: string, kickoff: string) =>
    `${date}|${opponent.trim().toLowerCase()}|${kickoff.trim().toLowerCase()}`;
  const existing = new Set(
    data.matches
      .filter(
        (match) =>
          match.seasonId === seasonId ||
          (!match.seasonId && match.season === selectedSeason?.name),
      )
      .map((match) =>
        keyFor(match.date, opponentName(data, match), match.kickoff),
      ),
  );
  const seen = new Set<string>();
  const preview = rows.map((row) => {
    const key = keyFor(row.date, row.opponent, row.kickoff);
    const duplicate = !row.error && (existing.has(key) || seen.has(key));
    if (!row.error) seen.add(key);
    return { ...row, duplicate };
  });
  const ready = preview.filter((row) => !row.error && !row.duplicate);
  async function chooseFile(file?: File) {
    setRows([]);
    setError("");
    setMessage("");
    setFileName(file?.name ?? "");
    if (!file) return;
    try {
      setRows(parseScheduleCsv(await file.text()));
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not read the CSV.",
      );
    }
  }
  function importRows() {
    if (!selectedSeason || !ready.length) return;
    const teams = [...data.opponents];
    const locations = [...data.locations];
    const matches: Match[] = ready.map((row) => {
      let team = teams.find(
        (item) => item.name.toLowerCase() === row.opponent.toLowerCase(),
      );
      if (!team) {
        team = {
          id: crypto.randomUUID(),
          name: row.opponent,
          crestUrl: "",
          color: "",
          notes: "",
        };
        teams.push(team);
      }
      let location = locations.find(
        (item) => item.name.toLowerCase() === row.venue.toLowerCase(),
      );
      if (!location && row.venue) {
        location = {
          id: crypto.randomUUID(),
          name: row.venue,
          address: "",
          imageUrl: "",
        };
        locations.push(location);
      }
      return {
        id: crypto.randomUUID(),
        status: "scheduled",
        seasonId: selectedSeason.id,
        season: selectedSeason.name,
        opponentId: team.id,
        opponent: team.name,
        date: row.date,
        venue: row.venue,
        locationId: location?.id,
        pitch: row.pitch,
        kickoff: row.kickoff,
        homeAway: row.homeAway,
        competition: row.competition,
        league: row.league,
        kit: row.kit,
        resultLabel: "",
        goalsFor: 0,
        goalsAgainst: 0,
        shootoutFor: null,
        shootoutAgainst: null,
        scoreRaw: "",
        scorerNotes: "",
        report: "",
      };
    });
    update({
      ...data,
      opponents: teams,
      locations,
      matches: [...data.matches, ...matches],
    });
    setRows([]);
    setFileName("");
    setMessage(
      `${matches.length} upcoming match${matches.length === 1 ? "" : "es"} added to ${selectedSeason.name}.`,
    );
  }
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Upload Schedule</DialogTitle>
      <DialogContent>
        <Stack gap={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Choose a season and CSV. Date and Opponent are required; Time,
              Location, Pitch, Competition, Kit Color, and Home/Away are
              optional. Review the matches before adding them.
            </Typography>
            <Button
              component="a"
              href="/templates/tbfc-schedule-example.csv"
              download="tbfc-schedule-example.csv"
              sx={{ mt: 1, px: 0 }}
            >
              Download Example CSV
            </Button>
            <Button
              component="a"
              href="/templates/tbfc-schedule-example.xlsx"
              download="tbfc-schedule-example.xlsx"
              sx={{ mt: 1, ml: 2, px: 0 }}
            >
              Download Excel Version
            </Button>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              The examples contain fictional matches. Edit the rows before
              importing; save the Excel version as CSV to upload it here.
            </Typography>
          </Box>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            gap={2}
            alignItems={{ sm: "center" }}
          >
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Season</InputLabel>
              <Select
                label="Season"
                value={seasonId}
                onChange={(event) => {
                  setSeasonId(event.target.value);
                  setMessage("");
                }}
              >
                {seasons.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="outlined" component="label">
              Choose CSV
              <input
                hidden
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => {
                  void chooseFile(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
            </Button>
            {fileName && (
              <Typography variant="body2" color="text.secondary">
                {fileName}
              </Typography>
            )}
          </Stack>
          {error && <Alert severity="error">{error}</Alert>}
          {message && <Alert severity="success">{message}</Alert>}
          {rows.length > 0 && (
            <>
              <Typography variant="body2">
                {ready.length} ready ·{" "}
                {preview.filter((row) => row.duplicate).length} duplicate ·{" "}
                {preview.filter((row) => row.error).length} invalid
              </Typography>
              <Box sx={{ maxHeight: 300, overflow: "auto" }}>
                <Stack gap={1}>
                  {preview.map((row) => (
                    <Stack
                      key={row.row}
                      direction="row"
                      gap={1}
                      alignItems="center"
                      flexWrap="wrap"
                    >
                      <Chip
                        size="small"
                        label={
                          row.error ??
                          (row.duplicate ? "Already listed" : "Upcoming")
                        }
                        color={
                          row.error
                            ? "error"
                            : row.duplicate
                              ? "default"
                              : "info"
                        }
                      />
                      <Typography variant="body2">
                        Row {row.row}: {row.date || "No date"} ·{" "}
                        {row.opponent || "No opponent"}
                        {row.kickoff ? ` · ${row.kickoff}` : ""}
                        {row.venue ? ` · ${row.venue}` : ""}
                        {row.pitch ? ` · Pitch ${row.pitch}` : ""}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
              <Button
                variant="contained"
                disabled={!seasonId || ready.length === 0}
                onClick={importRows}
              >
                Add {ready.length} Upcoming Match
                {ready.length === 1 ? "" : "es"}
              </Button>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
