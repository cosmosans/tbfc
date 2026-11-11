import { Link } from "react-router-dom";
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
import type { ClubData, Opponent } from "../../model";
import { record } from "../../model";
import OpponentCrest from "../../components/OpponentCrest";
import { FourColumnGrid } from "../../components/layout";
import RecordBar from "../../components/RecordBar";
import PageHeading from "../../components/PageHeading";

import SoccerBallIcon from "../../img/soccer-ball-variant.svg";
import { canEditClub } from "../../editAccess";

const teamCardImageSize = 58;

async function prepareTeamImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Choose an image file.");
  if (file.size > 10_000_000)
    throw new Error("Choose an image smaller than 10 MB.");
  const image = new Image();
  const objectUrl = URL.createObjectURL(file);
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () =>
        reject(new Error("This image could not be opened."));
      image.src = objectUrl;
    });
    const scale = Math.min(
      1,
      512 / Math.max(image.naturalWidth, image.naturalHeight),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("This image could not be prepared.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function Teams({
  data,
  update,
  onOpen,
}: {
  data: ClubData;
  update: (data: ClubData) => void;
  onOpen: (team: Opponent) => void;
}) {
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<Opponent | null>(null);
  const sorted = [...data.opponents].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  function saveOpponent(opponent: Opponent) {
    update({
      ...data,
      opponents: data.opponents.some((o) => o.id === opponent.id)
        ? data.opponents.map((o) => (o.id === opponent.id ? opponent : o))
        : [...data.opponents, opponent],
    });
    setEditing(null);
  }
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack gap={2}>
        <PageHeading>Teams</PageHeading>

        {canEditClub && (
          <Stack direction="row" gap={2}>
            <TextField
              label="Team Name"
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant="contained"
              disabled={
                !name.trim() ||
                data.opponents.some(
                  (o) => o.name.toLowerCase() === name.trim().toLowerCase(),
                )
              }
              onClick={() => {
                saveOpponent({
                  id: crypto.randomUUID(),
                  name: name.trim(),
                  crestUrl: "",
                  color: "",
                  notes: "",
                });
                setName("");
              }}
            >
              Add Team
            </Button>
          </Stack>
        )}
        <FourColumnGrid>
          {sorted.map((opponent) => {
            const games = data.matches.filter(
              (m) =>
                m.opponentId === opponent.id ||
                (!m.opponentId && m.opponent === opponent.name),
            );
            const r = record(games);
            return (
              <Card
                key={opponent.id}
                component={canEditClub ? "div" : Link}
                {...(!canEditClub && { to: `/team/${encodeURIComponent(opponent.id)}`, "aria-label": opponent.name })}
                sx={{
                  textDecoration: "none",
                  backgroundColor: opponent.color
                    ? `${opponent.color}77`
                    : "transparent",
                }}
              >
                <CardContent sx={{ pt: 2.5, px: 2.5 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    gap={2}
                    sx={{
                      "& a img": {
                        filter: "drop-shadow(2px 4px 6px rgba(0,0,0,.4))",
                      },
                    }}
                  >
                    <OpponentCrest
                      size={teamCardImageSize}
                      key={opponent.crestUrl}
                      url={opponent.crestUrl}
                      teamId={canEditClub ? opponent.id : undefined}
                      teamName={opponent.name}
                    />
                    <Typography
                      variant="h6"
                      sx={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}
                    >
                      {opponent.name}
                    </Typography>
                    {opponent.kitImageUrl && (
                      <Box
                        component="img"
                        src={opponent.kitImageUrl}
                        alt={opponent.name + " kit"}
                        sx={{
                          width: teamCardImageSize,
                          height: teamCardImageSize,
                          flexShrink: 0,
                          objectFit: "contain",
                          objectPosition: "right center",
                          filter: "drop-shadow(2px 4px 6px rgba(0,0,0,.4))",
                        }}
                      />
                    )}
                  </Stack>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mt: `5px`,
                      paddingInline: `5px`,
                    }}
                  >
                    <Typography
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        fontSize: 14,
                      }}
                      color="text.secondary"
                    >
                      {" "}
                      {r.against}
                      <img
                        src={SoccerBallIcon}
                        alt="Soccer ball"
                        style={{
                          width: 15,
                          height: 15,
                          marginInline: 5,
                        }}
                      />
                    </Typography>

                    <Box sx={{ flex: 1 }}>
                      <RecordBar
                opponentCrestUrl={opponent.crestUrl}
                        opponentWins={r.L}
                        draws={r.D}
                        tbfcWins={r.W}
                        opponentColor={opponent.color}
                      />
                    </Box>

                    <Typography
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        fontSize: 14,
                      }}
                      color="text.secondary"
                    >
                      <img
                        src={SoccerBallIcon}
                        alt="Soccer ball"
                        style={{ width: 15, height: 15, marginInline: 5 }}
                      />{" "}
                      {r.for}
                    </Typography>
                  </Box>

                  {opponent.notes && (
                    <Typography
                      variant="body2"
                      sx={{ mt: 1, whiteSpace: "pre-wrap" }}
                    >
                      {opponent.notes}
                    </Typography>
                  )}
                  {canEditClub && (
                  <Stack
                    direction="row"
                    gap={1}
                    sx={{ justifyContent: "space-between", mt: 3, mb: -1 }}
                  >
                      <Button
                        variant="outlined"
                        sx={{ borderColor: "white", color: "white" }}
                        onClick={() => setEditing({ ...opponent })}
                      >
                        Edit
                      </Button>
                    <Button
                      variant="contained"
                      onClick={() => onOpen(opponent)}
                    >
                      View Team
                    </Button>
                  </Stack>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </FourColumnGrid>
        {canEditClub && (
          <OpponentDialog
            key={editing?.id ?? "closed"}
            opponent={editing}
            onClose={() => setEditing(null)}
            onSave={saveOpponent}
          />
        )}
      </Stack>
    </Box>
  );
}

function OpponentDialog({
  opponent,
  onClose,
  onSave,
}: {
  opponent: Opponent | null;
  onClose: () => void;
  onSave: (opponent: Opponent) => void;
}) {
  const [draft, setDraft] = useState<Opponent | null>(opponent);
  const [imageError, setImageError] = useState("");
  const colorValid =
    !draft?.color || /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(draft.color);
  const [uploading, setUploading] = useState(false);
  async function uploadImage(field: "crestUrl" | "kitImageUrl", file?: File) {
    if (!file) return;
    setImageError("");
    setUploading(true);
    try {
      const url = await prepareTeamImage(file);
      setDraft((current) => (current ? { ...current, [field]: url } : current));
    } catch (error) {
      setImageError(
        error instanceof Error ? error.message : "Could not add this image.",
      );
    } finally {
      setUploading(false);
    }
  }
  return (
    <Dialog open={!!opponent} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Team</DialogTitle>
      <DialogContent>
        <Stack gap={2} sx={{ pt: 1 }}>
          <TextField
            label="Team Name"
            value={draft?.name ?? ""}
            onChange={(e) =>
              draft && setDraft({ ...draft, name: e.target.value })
            }
          />
          <Stack direction="row" gap={2} alignItems="center">
            <OpponentCrest key={draft?.crestUrl ?? ""} url={draft?.crestUrl} />
            <Button component="label" variant="outlined" disabled={uploading}>
              Upload Crest
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(e) => {
                  void uploadImage("crestUrl", e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </Button>
          </Stack>
          <TextField
            label="Crest Image URL"
            value={draft?.crestUrl ?? ""}
            onChange={(e) =>
              draft && setDraft({ ...draft, crestUrl: e.target.value })
            }
            helperText="You can also paste a direct image URL."
          />
          <Stack direction="row" gap={2} alignItems="center" flexWrap="wrap">
            {draft?.kitImageUrl && (
              <Box
                component="img"
                src={draft.kitImageUrl}
                alt="Kit preview"
                sx={{ width: 80, height: 80, objectFit: "contain" }}
              />
            )}
            <Button component="label" variant="outlined" disabled={uploading}>
              Upload Kit Image
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(e) => {
                  void uploadImage("kitImageUrl", e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </Button>
            {draft?.kitImageUrl && (
              <Button
                disabled={uploading}
                onClick={() => setDraft({ ...draft, kitImageUrl: "" })}
              >
                Remove Kit Image
              </Button>
            )}
          </Stack>
          {imageError && <Alert severity="error">{imageError}</Alert>}
          <Stack direction="row" gap={2} alignItems="center">
            <TextField
              label="Team Color (Hex)"
              value={draft?.color ?? ""}
              onChange={(e) =>
                draft && setDraft({ ...draft, color: e.target.value.trim() })
              }
              placeholder="#F47730"
              error={!colorValid}
              helperText={
                colorValid
                  ? "Use #RGB or #RRGGBB. Leave blank if unknown."
                  : "Enter a hex color such as #F47730."
              }
              sx={{ flexGrow: 1 }}
            />
            <Box
              aria-label="Team color preview"
              sx={{
                width: 36,
                height: 36,
                bgcolor:
                  colorValid && draft?.color ? draft.color : "transparent",
                border: "1px solid #ffffff55",
                flexShrink: 0,
              }}
            />
          </Stack>
          <TextField
            label="Scouting Notes / Team Intel"
            multiline
            minRows={5}
            value={draft?.notes ?? ""}
            onChange={(e) =>
              draft && setDraft({ ...draft, notes: e.target.value })
            }
            placeholder="Playing style, key players, previous match observations…"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={uploading || !draft?.name.trim() || !colorValid}
          onClick={() =>
            draft &&
            onSave({
              ...draft,
              name: draft.name.trim(),
              color: draft.color.toUpperCase(),
            })
          }
        >
          Save Team
        </Button>
      </DialogActions>
    </Dialog>
  );
}
