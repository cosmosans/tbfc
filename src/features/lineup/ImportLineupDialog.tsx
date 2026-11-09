import { useState } from "react";
import {
  Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Stack, TextField, Typography,
} from "@mui/material";
import { opponentName, seasonName } from "../../clubView";
import type { ClubData, Lineup, Match } from "../../model";
import { formationSlots } from "./formations";

export default function ImportLineupDialog({ data, match, onClose, onApply }: {
  data: ClubData;
  match: Match;
  onClose: () => void;
  onApply: (lineup: Lineup) => void;
}) {
  const [sourceId, setSourceId] = useState("");
  const lineups = new Map(data.lineups
    .filter(lineup => lineup.starters.some(Boolean) || lineup.bench.length)
    .map(lineup => [lineup.matchId, lineup]));
  const sources = data.matches
    .filter(source => source.id !== match.id && lineups.has(source.id))
    .sort((a, b) => b.date.localeCompare(a.date));
  const selected = sources.find(source => source.id === sourceId);
  const lineup = selected && lineups.get(selected.id);
  const label = (source: Match) =>
    [opponentName(data, source), source.date || "Date TBD", seasonName(data, source)].filter(Boolean).join(" · ");
  function playerLabel(id: string) {
    if (!id) return "Empty";
    const player = data.players.find(item => item.id === id);
    return player ? [player.number && `#${player.number}`, player.name].filter(Boolean).join(" ") : "Unknown player";
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="import-lineup-title">
      <DialogTitle id="import-lineup-title">Import lineup</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Autocomplete
            options={sources}
            value={selected ?? null}
            getOptionLabel={label}
            getOptionKey={source => source.id}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            onChange={(_, source) => setSourceId(source?.id ?? "")}
            openOnFocus
            noOptionsText={sources.length ? "No matching fixtures." : "No other matches have a saved lineup."}
            renderInput={params => <TextField {...params} label="Search matches" placeholder="Opponent, date, or season" />}
          />
          {lineup && (
            <>
              <div>
                <Typography variant="subtitle1" fontWeight={700}>Starting VII · {lineup.formation}</Typography>
                {formationSlots[lineup.formation].map((position, index) => (
                  <Typography key={position}>{position} · {playerLabel(lineup.starters[index])}</Typography>
                ))}
              </div>
              <div>
                <Typography variant="subtitle1" fontWeight={700}>Bench ({lineup.bench.length})</Typography>
                {lineup.bench.map(id => (
                  <Typography key={id}>{lineup.benchPositions?.[id] ?? "Floater"} · {playerLabel(id)}</Typography>
                ))}
              </div>
              <Typography variant="body2" color="text.secondary">
                Apply this lineup to {label(match)}? This replaces its formation, starters, and bench.
              </Typography>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={!lineup} onClick={() => {
          if (lineup) onApply({ ...structuredClone(lineup), matchId: match.id });
        }}>Apply lineup</Button>
      </DialogActions>
    </Dialog>
  );
}
