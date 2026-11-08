import { useState } from "react";
import {
  Alert,
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
import type { MatchVideo } from "../../model";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

function googleDriveFileId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "drive.google.com") return null;
    const fileId = parsed.pathname.match(/^\/file\/d\/([a-zA-Z0-9_-]+)(?:\/|$)/)?.[1];
    return fileId ?? null;
  } catch {
    return null;
  }
}

function DriveVideo({ fileId, title }: { fileId: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
  if (playing || thumbnailFailed) {
    return (
      <Box
        component="iframe"
        src={previewUrl}
        title={title}
        allow="autoplay; fullscreen"
        allowFullScreen
        loading="lazy"
        sx={{ display: "block", width: "100%", aspectRatio: "16 / 9", bgcolor: "#000", border: 0 }}
      />
    );
  }
  return (
    <Box
      component="button"
      type="button"
      aria-label={`Play ${title}`}
      onClick={() => setPlaying(true)}
      sx={{
        position: "relative",
        display: "grid",
        placeItems: "center",
        width: "100%",
        aspectRatio: "16 / 9",
        p: 0,
        border: 0,
        bgcolor: "#000",
        cursor: "pointer",
        overflow: "hidden",
        "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main" },
      }}
    >
      <Box
        component="img"
        src={`https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`}
        alt=""
        onError={() => setThumbnailFailed(true)}
        sx={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
      <Box sx={{ position: "absolute", display: "grid", placeItems: "center", width: 64, height: 64, borderRadius: "50%", bgcolor: "#000b", color: "#fff" }}>
        <PlayArrowIcon sx={{ fontSize: 42 }} />
      </Box>
    </Box>
  );
}

export default function MatchVideoGallery({
  videos,
  onSave,
}: {
  videos: MatchVideo[];
  onSave?: (videos: MatchVideo[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  function addVideo() {
    if (!onSave) return;
    try {
      const parsed = new URL(url.trim());
      if (parsed.protocol !== "https:") throw new Error("Enter a secure HTTPS video URL.");
      onSave([...videos, { id: crypto.randomUUID(), url: parsed.href, title: title.trim() || `Match video ${videos.length + 1}` }]);
      setOpen(false);
      setUrl("");
      setTitle("");
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Enter a valid video URL.");
    }
  }

  if (!onSave && !videos.length) return null;
  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2} sx={{ mb: 2 }}>
          <Typography variant="h6">Videos</Typography>
          {onSave && <Button variant="outlined" onClick={() => setOpen(true)}>+ Add Video URL</Button>}
        </Stack>
        {!videos.length && <Typography color="text.secondary">Add a hosted video from this match.</Typography>}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: 2 }}>
          {videos.map((video) => (
            <Box key={video.id} sx={{ minWidth: 0 }}>
              {googleDriveFileId(video.url) ? (
                <DriveVideo fileId={googleDriveFileId(video.url)!} title={video.title} />
              ) : (
                <Box
                  component="video"
                  src={video.url}
                  controls
                  preload="metadata"
                  playsInline
                  sx={{ display: "block", width: "100%", aspectRatio: "16 / 9", bgcolor: "#000" }}
                />
              )}
              <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                <Typography sx={{ overflowWrap: "anywhere" }}>{video.title}</Typography>
                {onSave && <Button size="small" color="error" onClick={() => {
                  if (window.confirm(`Remove “${video.title}” from this match?`))
                    onSave(videos.filter((item) => item.id !== video.id));
                }}>Remove</Button>}
              </Stack>
            </Box>
          ))}
        </Box>
      </CardContent>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Video URL</DialogTitle>
        <DialogContent>
          <Stack gap={2} sx={{ pt: 1 }}>
            <TextField autoFocus label="Video URL" type="url" fullWidth value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://drive.google.com/file/d/…/view" helperText="Paste a Google Drive sharing link or a direct HTTPS video file URL." />
            <TextField label="Title (optional)" fullWidth value={title} onChange={(event) => setTitle(event.target.value)} />
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={!url.trim()} onClick={addVideo}>Add Video</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
