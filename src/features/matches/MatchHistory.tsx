import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Stack,
  Typography,
} from "@mui/material";
import RichTextDialog from "../../components/RichTextDialog";
import type { Match } from "../../model";
import { storyToHtml } from "./matchStory";
import { isTurfbotReport } from "./reportAttribution";

export default function MatchHistory({
  match,
  onSaveReport,
  onAuditChange,
}: {
  match: Match;
  onSaveReport?: (report: string) => void;
  onAuditChange?: (complete: boolean) => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const reportHtml = useMemo(
    () => storyToHtml(match.report ?? ""),
    [match.report],
  );
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
            <Typography variant="h6">{"Match Report"}</Typography>
            {onSaveReport && (
              <Button variant="outlined" onClick={() => setDialogOpen(true)}>
                {match.report ? "Edit Report" : "Add Report"}
              </Button>
            )}
          </Stack>
          {reportHtml.trim() ? (
            <Box
              sx={{
                overflowWrap: "anywhere",
                "& p": { my: 0, mb: 2 },
                "& p:last-child": { mb: 0 },
                "& ul, & ol": { pl: 3 },
                "& blockquote": {
                  borderLeft: "3px solid",
                  borderColor: "primary.main",
                  pl: 2,
                  ml: 0,
                },
              }}
              dangerouslySetInnerHTML={{ __html: reportHtml }}
            />
          ) : (
            <Typography>No report yet.</Typography>
          )}
          {isTurfbotReport(match) && (
            <Stack
              component="footer"
              direction="row"
              alignItems="center"
              gap={1}
              sx={{ mt: 3, color: "primary.main" }}
            >
              <Typography
                component="span"
                sx={{
                  fontSize: "12px",
                  letterSpacing: "0.04em",
                  lineHeight: 1.4,
                }}
              >
                WRITTEN BY FOOTBOT
              </Typography>
            </Stack>
          )}
          {onAuditChange && (
            <FormControlLabel
              sx={{ mt: 2 }}
              control={
                <Checkbox
                  checked={match.matchAuditComplete === true}
                  onChange={(event) => onAuditChange(event.target.checked)}
                />
              }
              label="Match Audit Complete"
            />
          )}
        </CardContent>
      </Card>
      {dialogOpen && onSaveReport && <RichTextDialog title="Edit Match Report" value={match.report ?? ""}
        saveLabel="Save Report" onClose={() => setDialogOpen(false)}
        onSave={value => { onSaveReport(value); setDialogOpen(false); }} />}
    </Stack>
  );
}
