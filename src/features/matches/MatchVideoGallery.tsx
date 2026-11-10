import { useMediaOrder } from "./useMediaOrder";
import { useState } from "react";
import {
  Alert,
  IconButton,
  useMediaQuery,
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
import EditIcon from "@mui/icons-material/Edit";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

function driveVideo(url: string) {
  try {
    const source = new URL(url);
    if (source.origin !== "https://drive.google.com") return null;
    const id = source.pathname.match(/^\/file\/d\/([a-zA-Z0-9_-]+)(?:\/|$)/)?.[1]
      ?? (["/open", "/uc"].includes(source.pathname) ? source.searchParams.get("id") : null);
    if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) return null;
    const preview = new URL(`https://drive.google.com/file/d/${id}/preview`);
    const thumbnail = new URL("https://drive.google.com/thumbnail");
    thumbnail.searchParams.set("id", id);
    thumbnail.searchParams.set("sz", "w800");
    const key = source.searchParams.get("resourcekey");
    if (key) {
      preview.searchParams.set("resourcekey", key);
      thumbnail.searchParams.set("resourcekey", key);
    }
    const image = new URL(`https://lh3.googleusercontent.com/d/${id}=w800`);
    if (key) image.searchParams.set("resourcekey", key);
    return { preview: preview.href, thumbnail: thumbnail.href, image: image.href };
  } catch {
    return null;
  }
}

function VideoThumbnail({ video, onPlay }: { video: MatchVideo; onPlay: () => void }) {
  const drive = driveVideo(video.url);
  const [failedUrl, setFailedUrl] = useState("");
  return <Box component="button" type="button" aria-label={`Play ${video.title}`}
    onClick={onPlay} sx={{
      position: "relative", display: "grid", placeItems: "center", width: "100%",
      aspectRatio: "16 / 9", p: 0, overflow: "hidden", border: "1px solid #ffffff26",
      background: "linear-gradient(135deg, #263334, #141b1e 65%, #372820)", cursor: "pointer",
      "&:hover .play-disc, &:focus-visible .play-disc": { bgcolor: "primary.main", color: "#101315" },
      "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main" },
    }}>
    {drive && failedUrl !== video.url && <Box component="img"
      src={failedUrl === drive.image ? drive.thumbnail : drive.image} alt="" referrerPolicy="no-referrer"
      onError={() => setFailedUrl(failedUrl === drive.image ? video.url : drive.image)} sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center" }} />}
    <Box className="play-disc" sx={{ position: "absolute", width: 48, height: 48,
      borderRadius: "50%", bgcolor: "#101315d9", color: "#fff", border: "1px solid #ffffff70",
      display: "grid", placeItems: "center" }}>
      <PlayArrowIcon sx={{ fontSize: 32 }} />
    </Box>
  </Box>;
}

function VideoPlayer({ videos, index, onSelect, onClose }: {
  videos: MatchVideo[]; index: number; onSelect: (id: string) => void; onClose: () => void;
}) {
  const video = videos[index];
  const mobile = useMediaQuery("(max-width: 599px)");
  const drive = driveVideo(video.url);
  const [failedUrl, setFailedUrl] = useState("");
  return <Dialog open onClose={onClose} fullWidth maxWidth="lg" fullScreen={mobile}
    aria-labelledby="match-video-title" slotProps={{ paper: { sx: { bgcolor: "#171b1d", color: "#fff" } } }}>
    <Stack direction="row" alignItems="center" gap={1} sx={{ px: 2, py: 1 }}>
      <DialogTitle id="match-video-title" sx={{ flex: 1, p: 0, overflowWrap: "anywhere" }}>{video.title}</DialogTitle>
      <IconButton component="a" href={video.url} target="_blank" rel="noopener noreferrer"
        aria-label="Open original video" title="Open original video"><OpenInNewIcon /></IconButton>
      <IconButton onClick={onClose} aria-label="Close video player"><CloseIcon /></IconButton>
    </Stack>
    <Box sx={{ display: "grid", placeItems: "center", bgcolor: "#000", minHeight: 0,
      width: "100%", aspectRatio: mobile ? undefined : "16 / 9", maxHeight: mobile ? undefined : "77dvh",
      flex: mobile ? 1 : undefined }}>
      {drive ? <Box component="iframe" title={video.title}
        src={drive.preview} allow="autoplay; fullscreen" allowFullScreen
        sx={{ border: 0, width: "100%", height: "100%", minHeight: 0 }} />
        : failedUrl === video.url ? <Alert severity="warning">This video couldn’t play here. Use “Open original video” to view it.</Alert>
        : <Box component="video" src={video.url} aria-label={video.title} autoPlay controls playsInline
          onError={() => setFailedUrl(video.url)} sx={{ width: "100%", height: "100%", minHeight: 0, objectFit: "contain" }} />}
    </Box>
    {videos.length > 1 && <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} sx={{ py: 0.5 }}>
      <IconButton aria-label="Previous clip" disabled={index === 0}
        onClick={() => onSelect(videos[index - 1].id)}><ChevronLeftIcon /></IconButton>
      <Typography variant="caption" aria-live="polite">Clip {index + 1} of {videos.length}</Typography>
      <IconButton aria-label="Next clip" disabled={index === videos.length - 1}
        onClick={() => onSelect(videos[index + 1].id)}><ChevronRightIcon /></IconButton>
    </Stack>}
  </Dialog>;
}

export default function MatchVideoGallery({
  videos,
  onSave,
}: {
  videos: MatchVideo[];
  onSave?: (videos: MatchVideo[]) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedIndex = videos.findIndex(video => video.id === selectedId);
  const [rename, setRename] = useState<{ id: string; title: string } | null>(null);
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  function addVideo() {
    if (!onSave) return;
    try {
      const parsed = new URL(url.trim());
      if (!driveVideo(parsed.href))
        throw new Error("Enter a Google Drive video file sharing link.");
      onSave([
        ...videos,
        {
          id: crypto.randomUUID(),
          url: parsed.href,
          title: title.trim() || `Match video ${videos.length + 1}`,
        },
      ]);
      setOpen(false);
      setUrl("");
      setTitle("");
      setError("");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Enter a valid video URL.",
      );
    }
  }

  const order = useMediaOrder(videos, onSave);
  if (!onSave && !videos.length) return null;
  return (
    <Card>
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          gap={2}
          sx={{ mb: 2 }}
        >
          <Typography variant="h6">Videos</Typography>
          {onSave && (
            <Button variant="contained" onClick={() => setOpen(true)}>
              + Add Video URL
            </Button>
          )}
        </Stack>
        {!videos.length && (
          <Typography color="text.secondary">
            Add a Google Drive video from this match.
          </Typography>
        )}
        <Box ref={order.grid}
          sx={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
            gap: 2,
          }}
        >
          {videos.map((video) => (
            <Box key={video.id} data-media-id={video.id} sx={{ outline: order.target === video.id ? "2px solid" : undefined, outlineColor: "primary.main", minWidth: 0 }}>
              <VideoThumbnail video={video} onPlay={() => setSelectedId(video.id)} />
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                gap={1}
              >
                <Typography sx={{ flex: 1, overflowWrap: "anywhere" }}>
                  {video.title}
                </Typography>
              {order.handle(video.id, video.title)}
                {onSave && <IconButton size="small" aria-label={`Edit title of ${video.title}`}
                  title="Edit video title" onClick={() => setRename({ id: video.id, title: video.title })}>
                  <EditIcon fontSize="small" />
                </IconButton>}
                {onSave && (
                  <Button
                    size="small"
                    color="error"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Remove “${video.title}” from this match?`,
                        )
                      )
                        onSave(videos.filter((item) => item.id !== video.id));
                    }}
                  >
                    Remove
                  </Button>
                )}
              </Stack>
            </Box>
          ))}
        </Box>
      </CardContent>
      {onSave && rename && videos.some(video => video.id === rename.id) && (
        <Dialog open onClose={() => setRename(null)} fullWidth maxWidth="xs" aria-labelledby="rename-video-title">
          <Box component="form" onSubmit={event => {
            event.preventDefault();
            const nextTitle = rename.title.trim();
            if (!nextTitle) return;
            onSave(videos.map(video => video.id === rename.id ? { ...video, title: nextTitle } : video));
            setRename(null);
          }}>
            <DialogTitle id="rename-video-title">Edit video title</DialogTitle>
            <DialogContent sx={{ pt: "8px !important" }}>
              <TextField autoFocus fullWidth label="Video title" value={rename.title}
                onChange={event => setRename({ ...rename, title: event.target.value })} />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setRename(null)}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={!rename.title.trim()}>Save title</Button>
            </DialogActions>
          </Box>
        </Dialog>
      )}
      {selectedIndex >= 0 && <VideoPlayer videos={videos} index={selectedIndex} onSelect={setSelectedId} onClose={() => setSelectedId(null)} />}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add Video URL</DialogTitle>
        <DialogContent>
          <Stack gap={2} sx={{ pt: 1 }}>
            <TextField
              autoFocus
              label="Video URL"
              type="url"
              fullWidth
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://drive.google.com/file/d/…/view"
              helperText="Paste the file sharing link from Google Drive."
            />
            <TextField
              label="Title (optional)"
              fullWidth
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={!url.trim()} onClick={addVideo}>
            Add Video
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
