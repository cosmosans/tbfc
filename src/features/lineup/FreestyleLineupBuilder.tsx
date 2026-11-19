import { useState } from "react";
import {
  Alert,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { ClubData, Lineup, Match } from "../../model";
import { positions } from "../../model";
import { defaultLineup } from "../../store";
import { formationSlots, normalizeLineupRoles } from "./formations";
import LineupEditor from "./LineupEditor";

const STORAGE_KEY = "tbfc.freestyle-lineup.v1";
const MATCH_ID = "freestyle-lineup";
const practiceMatch: Match = {
  id: MATCH_ID,
  status: "scheduled",
  season: "",
  competition: "",
  date: "",
  opponent: "",
  venue: "",
  kickoff: "",
  resultLabel: "",
  goalsFor: 0,
  goalsAgainst: 0,
  scoreRaw: "",
  kit: "Black",
  scorerNotes: "",
  report: "",
};

function readDraft(): { lineup: Lineup; kit: string } {
  try {
    const draft = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    const lineup = draft?.lineup;
    const strings = (value: unknown): value is string[] =>
      Array.isArray(value) && value.every((item) => typeof item === "string");
    if (
      lineup &&
      Object.hasOwn(formationSlots, lineup.formation) &&
      strings(lineup.starters) &&
      lineup.starters.length === 7 &&
      strings(lineup.bench) &&
      (lineup.confirmedOutIds === undefined ||
        strings(lineup.confirmedOutIds)) &&
      (lineup.benchPositions === undefined ||
        (lineup.benchPositions !== null &&
          typeof lineup.benchPositions === "object" &&
          !Array.isArray(lineup.benchPositions) &&
          Object.values(lineup.benchPositions).every((role) =>
            positions.includes(role as (typeof positions)[number]),
          )))
    ) {
      return {
        lineup: normalizeLineupRoles({ ...lineup, matchId: MATCH_ID }),
        kit: draft.kit === "White" ? "White" : "Black",
      };
    }
  } catch {
    /* Start fresh if local storage is unavailable or the draft is invalid. */
  }
  return { lineup: defaultLineup(MATCH_ID), kit: "Black" };
}

export default function FreestyleLineupBuilder({ data }: { data: ClubData }) {
  const [draft, setDraft] = useState(readDraft);
  const [storageError, setStorageError] = useState(false);
  const match = { ...practiceMatch, kit: draft.kit };
  const practiceData = { ...data, matches: [match], lineups: [draft.lineup] };
  function save(next: typeof draft) {
    setDraft(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }
  return (
    <Stack gap={2}>
      <Typography variant="h4" component="h1" sx={{ pt: 4 }}>
        Lineup Builder
      </Typography>

      {storageError && (
        <Alert severity="warning">
          Your lineup is available for this visit, but could not be saved on
          this device.
        </Alert>
      )}
      <Stack direction="row" gap={2} alignItems="center">
        <TextField
          select
          label="Kit"
          size="small"
          value={draft.kit}
          sx={{ minWidth: 140 }}
          onChange={(event) => save({ ...draft, kit: event.target.value })}
        >
          <MenuItem value="Black">Black</MenuItem>
          <MenuItem value="White">White</MenuItem>
        </TextField>
        <Button
          onClick={() => save({ ...draft, lineup: defaultLineup(MATCH_ID) })}
        >
          Reset Lineup
        </Button>
      </Stack>
      <LineupEditor
        data={practiceData}
        match={match}
        freestyle
        update={(next) =>
          save({
            ...draft,
            lineup: next.lineups.find((lineup) => lineup.matchId === MATCH_ID)!,
          })
        }
      />
    </Stack>
  );
}
