import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import DownloadIcon from "@mui/icons-material/Download";
import type { ClubData, Lineup, Match } from "../../model";
import { createShareLineupImage } from "./shareLineupImage";

export default function ShareLineupButton({
  data,
  match,
  lineup,
}: {
  data: ClubData;
  match: Match;
  lineup: Lineup;
}) {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [preview, setPreview] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const filename = `tbfc-${match.date}-${match.opponent.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-lineup.png`;

  useEffect(() => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [blob]);

  async function create() {
    setBusy(true);
    setError("");
    try {
      setBlob(await createShareLineupImage(data, match, lineup));
      setOpen(true);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not create the image.",
      );
    } finally {
      setBusy(false);
    }
  }

  function download() {
    if (!preview) return;
    const link = document.createElement("a");
    link.href = preview;
    link.download = filename;
    link.click();
  }

  async function share() {
    if (!blob) return;
    try {
      await navigator.share({
        files: [new File([blob], filename, { type: "image/png" })],
        title: "Turf Burners FC lineup",
      });
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "AbortError") return;
      setError(
        "Sharing is unavailable here. Download the image and send it in WhatsApp.",
      );
    }
  }

  const canShareFile =
    !!blob &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({
      files: [new File([blob], filename, { type: "image/png" })],
    });

  return (
    <>
      <Stack gap={1} sx={{ alignItems: "flex-end" }}>
        <Button
          variant="contained"
          startIcon={<ShareIcon />}
          disabled={busy}
          onClick={() => void create()}
        >
          {busy ? "Creating Image…" : "Share Lineup"}
        </Button>
        {error && !open && <Alert severity="error">{error}</Alert>}
      </Stack>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        aria-labelledby="lineup-share-title"
      >
        <DialogTitle id="lineup-share-title">Match & Lineup Image</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Ready for WhatsApp stories or chats. Preview the image, then share
            or save it.
          </Typography>
          {preview && (
            <Box
              component="img"
              src={preview}
              alt="Portrait match banner and lineup preview"
              sx={{
                display: "block",
                width: "100%",
                maxWidth: 360,
                mx: "auto",
                border: "1px solid #555",
              }}
            />
          )}
          {error && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ flexWrap: "wrap", gap: 1, p: 2 }}>
          <Button onClick={() => setOpen(false)}>Close</Button>
          <Button
            startIcon={<DownloadIcon />}
            onClick={download}
            disabled={!preview}
          >
            Download PNG
          </Button>
          {canShareFile && (
            <Button
              variant="contained"
              startIcon={<ShareIcon />}
              onClick={() => void share()}
            >
              Share
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
