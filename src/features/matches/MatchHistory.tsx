import { useState } from "react";
import {
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
import type { Match } from "../../model";

export default function MatchHistory({
  match,
  onSaveReport,
}: {
  match: Match;
  onSaveReport?: (report: string) => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const isFixture = match.status === "scheduled";

  function openDialog() {
    setDraft(match.report ?? "");
    setDialogOpen(true);
  }

  function save() {
    onSaveReport?.(draft);
    setDialogOpen(false);
  }

  return (
    <Stack gap={2}>
      <Card>
        <CardContent>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap={2}
            sx={{ mb: 1 }}
          >
            <Typography variant="h6">
              {isFixture ? "Fixture Notes" : "Match Story"}
            </Typography>
            {onSaveReport && (
              <Button variant="outlined" onClick={openDialog}>
                {match.report ? "Edit Story" : "Add Story"}
              </Button>
            )}
          </Stack>
          <Typography sx={{ whiteSpace: "pre-wrap" }}>
            {match.report ||
              (isFixture
                ? "No fixture notes yet."
                : "No report yet. Add a match report when the story is ready.")}
          </Typography>
        </CardContent>
      </Card>
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {isFixture ? "Edit Fixture Notes" : "Edit Match Story"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={10}
            label={isFixture ? "Fixture notes" : "Match story"}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save}>
            Save Story
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
