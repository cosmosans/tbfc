import { useState } from "react";
import { panelBorder } from "../../components/PanelHeader";
import { Box, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, Stack, TextField, Typography } from "@mui/material";
import type { Match, MatchPhoto, MatchVideo } from "../../model";
import MatchGallery from "./MatchGallery";
import MatchVideoGallery from "./MatchVideoGallery";

function youtubeId(input: string) {
  try {
    const url = new URL(input.trim());
    if (!["https:", "http:"].includes(url.protocol)) return null;
    const host = url.hostname.replace(/^(www\.|m\.)/, "");
    let id: string | null = null;
    if (host === "youtu.be") id = url.pathname.slice(1);
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      id = url.pathname === "/watch" ? url.searchParams.get("v")
        : url.pathname.match(/^\/(?:embed|live|shorts)\/([^/]+)\/?$/)?.[1] ?? null;
    }
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export default function MatchMedia({
  match,
  onSaveFullMatch,
  onSavePhotos,
  onSaveVideos,
}: {
  match: Match;
  onSaveFullMatch?: (id?: string) => void;
  onSavePhotos?: (photos: MatchPhoto[]) => void;
  onSaveVideos?: (videos: MatchVideo[]) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const id = match.fullMatchYouTubeId;
  const parsed = youtubeId(draft ?? "");
  const editButton = onSaveFullMatch && (
    <Button variant={id ? "outlined" : "contained"} sx={{ alignSelf: "flex-start" }}
      onClick={() => setDraft(id ? `https://www.youtube.com/watch?v=${id}` : "")}>
      {id ? "Edit Video" : "+ Add Full Match Video"}
    </Button>
  );
  return (
    <Stack gap={2}>
      {id ? (
        <Card sx={panelBorder}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">Full Match Video</Typography>
              {editButton}
            </Stack>
            <Box component="iframe" title={`Full match against ${match.opponent}`}
              src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`}
              allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              sx={{ display: "block", width: "100%", maxWidth: 1100, mx: "auto", aspectRatio: "16 / 9", border: 0 }} />
          </CardContent>
        </Card>
      ) : editButton}
      {onSaveFullMatch && <Dialog open={draft !== null} onClose={() => setDraft(null)} fullWidth maxWidth="sm"
        aria-labelledby="full-match-video-title">
        <Box component="form" onSubmit={event => {
          event.preventDefault();
          if (parsed) { onSaveFullMatch(parsed); setDraft(null); }
        }}>
          <DialogTitle id="full-match-video-title">{id ? "Edit" : "Add"} Full Match Video</DialogTitle>
          <DialogContent>
            <TextField autoFocus fullWidth label="YouTube Link" sx={{ mt: 1 }} value={draft ?? ""}
              onChange={event => setDraft(event.target.value)}
              error={!!draft?.trim() && !parsed} helperText={draft?.trim() && !parsed ? "Enter a YouTube video link." : undefined} />
          </DialogContent>
          <DialogActions>
            {id && <Button color="error" sx={{ mr: "auto" }} onClick={() => {
              onSaveFullMatch(undefined); setDraft(null);
            }}>Remove Video</Button>}
            <Button onClick={() => setDraft(null)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={!parsed}>Save</Button>
          </DialogActions>
        </Box>
      </Dialog>}
      <MatchGallery photos={match.photos ?? []} onSave={onSavePhotos} />
      <MatchVideoGallery videos={match.videos ?? []} onSave={onSaveVideos} />
    </Stack>
  );
}
