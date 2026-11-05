import { Button, Card, CardContent, Stack, Typography } from "@mui/material";
import type { Match } from "../../model";

export default function MatchHistory({
  match,
  onEdit,
}: {
  match: Match;
  onEdit?: () => void;
}) {
  return (
    <Stack gap={2}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {match.status === "scheduled" ? "Fixture Notes" : "Match Story"}
          </Typography>
          <Typography sx={{ whiteSpace: "pre-wrap" }}>
            {match.report ||
              (match.status === "scheduled"
                ? "No fixture notes yet."
                : "No report yet. Add a match report when the story is ready.")}
          </Typography>
          {!match.report && onEdit && <Button onClick={onEdit} sx={{ mt: 2 }}>
            Add Notes
          </Button>}
        </CardContent>
      </Card>
    </Stack>
  );
}
