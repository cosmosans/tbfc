import { useRef, useState } from "react";
import { Alert, Box, Button, Card, CardContent, Dialog, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";
import type { MatchPhoto } from "../../model";

async function preparePhoto(file: File): Promise<MatchPhoto> {
  if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) throw new Error(`${file.name}: choose a JPG, PNG, WebP, or GIF image.`);
  if (file.size > 15_000_000) throw new Error(`${file.name}: choose an image smaller than 15 MB.`);
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const scale = Math.min(1, 1280 / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not prepare photo.");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
    let src = canvas.toDataURL("image/jpeg", 0.8);
    for (const quality of [0.65, 0.5, 0.35]) {
      if (src.length <= 200_000) break;
      src = canvas.toDataURL("image/jpeg", quality);
    }
    return { id: crypto.randomUUID(), src, name: file.name };
  } finally { URL.revokeObjectURL(url); }
}

export default function MatchGallery({ photos, onSave }: { photos: MatchPhoto[]; onSave?: (photos: MatchPhoto[]) => void }) {
  const [busy, setBusy] = useState(false);
  const uploading = useRef(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<MatchPhoto | null>(null);
  async function upload(files: File[]) {
    if (!onSave || !files.length || uploading.current) return;
    uploading.current = true;
    setBusy(true);
    setError("");
    try {
      const next = [...photos];
      const errors: string[] = [];
      for (const file of files) {
        try {
          const photo = await preparePhoto(file);
          if (next.reduce((size, item) => size + item.src.length, 0) + photo.src.length > 1_200_000) {
            throw new Error("This gallery is full. Remove a photo before adding more.");
          }
          next.push(photo);
        } catch (cause) { errors.push(cause instanceof Error ? cause.message : `Could not open ${file.name}.`); }
      }
      if (next.length !== photos.length) onSave(next);
      setError(errors.join(" "));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save photos."); }
    finally { uploading.current = false; setBusy(false); }
  }
  if (!onSave && !photos.length) return null;
  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2} sx={{ mb: 2 }}>
          <Typography variant="h6">Photos</Typography>
          {onSave && <Button component="label" variant="outlined" disabled={busy}>
            {busy ? "Adding photos…" : "+ Add Photos"}
            <input hidden type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" disabled={busy} onChange={(event) => {
              void upload(Array.from(event.target.files ?? []));
              event.target.value = "";
            }} />
          </Button>}
        </Stack>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {!photos.length && <Typography color="text.secondary">Add photos from this match.</Typography>}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 240px), 1fr))", gap: 2 }}>
          {photos.map((photo, index) => <Box key={photo.id} sx={{ maxWidth: 360 }}>
            <Box component="button" type="button" aria-label={`View match photo ${index + 1}`} onClick={() => setSelected(photo)} sx={{ display: "block", width: "100%", p: 0, border: 0, bgcolor: "transparent", cursor: "pointer", "&:hover": { opacity: 0.85 }, "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main" } }}>
              <Box component="img" src={photo.src} alt={`Match photo ${index + 1}`} loading="lazy" sx={{ display: "block", width: "100%", aspectRatio: "16 / 9", objectFit: "cover" }} />
            </Box>
            {onSave && <Button size="small" disabled={busy} aria-label={`Remove match photo ${index + 1}`} onClick={() => onSave(photos.filter((item) => item.id !== photo.id))}>Remove</Button>}
          </Box>)}
        </Box>
      </CardContent>
      <Dialog open={!!selected} onClose={() => setSelected(null)} fullWidth maxWidth="lg">
        <DialogTitle><Stack direction="row" justifyContent="space-between" alignItems="center">Match photo<Button onClick={() => setSelected(null)}>Close</Button></Stack></DialogTitle>
        <DialogContent>{selected && <Box component="img" src={selected.src} alt={selected.name} sx={{ display: "block", width: "100%", maxHeight: "75vh", objectFit: "contain" }} />}</DialogContent>
      </Dialog>
    </Card>
  );
}
