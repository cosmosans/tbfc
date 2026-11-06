import { playerStats } from "./playerStats";
import GoalIcon from "../../img/soccer-ball-variant.svg";
import AssistIcon from "../../img/cleats.svg";
import SaveIcon from "../../img/gloves.svg";
import CardIcon from "../../img/cards.svg";
import PlayerTypeSelect from "./PlayerTypeSelect";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { canEditClub } from "../../editAccess";

import {
  PlayerCardFrame,
  PlayerCardInner,
  PlayerCardFront,
  PlayerCardBack,
  PlayerCardBackContent,
  PlayerPhoto,
  PlayerPlaceholder,
  PlayerInformation,
  PlayerNumber,
  PlayerIdentity,
  PlayerName,
  PlayerPositions,
  PlayerStatus,
} from "./PlayerCard.styles";
import type { Player, Position, MatchEvent } from "../../model";
import { positions } from "../../model";

async function preparePlayerPhoto(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Choose an image file.");
  if (file.size > 8_000_000)
    throw new Error("Choose an image smaller than 8 MB.");
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
      900 / Math.max(image.naturalWidth, image.naturalHeight),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("This image could not be prepared.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.82);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function PlayerCard({
  player,
  events,
  onSave,
}: {
  player: Player;
  events: MatchEvent[];
  onSave: (player: Player) => void;
}) {
  const navigate = useNavigate();
  const [flipped, setFlipped] = useState(false);
  const [draft, setDraft] = useState<Player>({ ...player });
  const [photoError, setPhotoError] = useState("");
  function openEdit() {
    if (!canEditClub) { navigate(`/player/${encodeURIComponent(player.id)}`); return; }
    setDraft({ ...player });
    setPhotoError("");
    setFlipped(true);
  }
  function save() {
    if (!draft.name.trim()) return;
    onSave({ ...draft, name: draft.name.trim(), number: draft.number.trim() });
    setFlipped(false);
  }
  async function addPhoto(file?: File) {
    if (!file) return;
    setPhotoError("");
    try {
      const photoUrl = await preparePlayerPhoto(file);
      setDraft((current) => ({ ...current, photoUrl }));
    } catch (error) {
      setPhotoError(
        error instanceof Error ? error.message : "Could not add this image.",
      );
    }
  }
  return (
    <PlayerCardFrame
      data-editing={flipped}
    >
      <PlayerCardInner flipped={flipped}>
        <PlayerCardFront
          type="button"
          onClick={openEdit}
          aria-label={canEditClub ? `Edit ${player.name}` : `View ${player.name}`}
          aria-hidden={flipped}
          inert={flipped}
        >
          <PlayerPhoto>
            {player.photoUrl ? (
              <img src={player.photoUrl} alt="" />
            ) : (
              <PlayerPlaceholder />
            )}
          </PlayerPhoto>
          <PlayerInformation>
            <PlayerNumber>{player.number || "—"}</PlayerNumber>
            <PlayerIdentity>
              <PlayerName>{player.name}</PlayerName>

              <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                {player.playerType && <Typography variant="body2" color="white" >
                  {player.playerType}
                </Typography>}

                <PlayerPositions>
                  {[player.preferredPosition, player.secondaryPosition]
                    .filter(Boolean)
                    .join(" / ") || ""}
                </PlayerPositions>
              </Box>
            </PlayerIdentity>
            <Box component="span" sx={{
              display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: { xs: 1, md: 2 }, gridArea: "stats",
            }}>
              {playerStats(player, events).map(([label, count], index) => (
                <Box component="span" key={label} title={label} aria-label={`${count} ${label}`}
                  sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: .75 }}>
                  <Box component="img" src={[GoalIcon, AssistIcon, SaveIcon, CardIcon][index]} alt=""
                    sx={{ width: { xs: 16, md: 22 }, height: { xs: 16, md: 22 }, objectFit: "contain" }} />
                  <Box component="span" sx={{ fontSize: { xs: 16, md: 24 }, fontWeight: 800 }}>{count}</Box>
                </Box>
              ))}
            </Box>
            <PlayerStatus active={player.active}>
              {player.active ? "Active" : "Inactive"}
            </PlayerStatus>
          </PlayerInformation>
        </PlayerCardFront>
        <PlayerCardBack aria-hidden={!flipped} inert={!flipped}>
          <PlayerCardBackContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Edit Player
            </Typography>
            <Box sx={{
              display: "grid",
              gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" },
              gap: 1.5,
              alignItems: "center",
            }}>
              <Box
                sx={{
                  display: "flex",
                  gap: ".4rem",
                }}
              >
                <TextField
                  label="#"
                  size="small"
                  type="number"
                  value={draft.number}
                  sx={{ width: "80px" }}
                  onChange={(e) =>
                    setDraft({ ...draft, number: e.target.value })
                  }
                />
                <TextField
                  label="Name"
                  size="small"
                  sx={{ flex: 1, minWidth: 0 }}
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  required
                />
              </Box>

              <PlayerTypeSelect value={draft.playerType ?? ""} onChange={(playerType) => setDraft({ ...draft, playerType })} />
              <FormControl size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={draft.active ? "active" : "inactive"}
                  onChange={(e) =>
                    setDraft({ ...draft, active: e.target.value === "active" })
                  }
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
              <PositionSelect
                label="Primary Position"
                value={draft.preferredPosition ?? ""}
                onChange={(position) =>
                  setDraft({
                    ...draft,
                    preferredPosition: position,
                    secondaryPosition:
                      draft.secondaryPosition === position
                        ? ""
                        : draft.secondaryPosition,
                  })
                }
              />
              <PositionSelect
                label="Secondary Position"
                value={draft.secondaryPosition ?? ""}
                onChange={(position) =>
                  setDraft({ ...draft, secondaryPosition: position })
                }
                exclude={draft.preferredPosition || undefined}
              />
              {!draft.photoUrl && (
                <Button component="label" variant="outlined" size="small">
                  Add Image
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      void addPhoto(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </Button>
              )}
              {draft.photoUrl && (
                <Button
                  size="small"
                  onClick={() => setDraft({ ...draft, photoUrl: "" })}
                >
                  Remove Image
                </Button>
              )}
              {photoError && <Alert severity="error" sx={{ gridColumn: "1 / -1" }}>{photoError}</Alert>}
            </Box>
            <Stack direction="row" gap={1} sx={{ mt: 2, ml: "auto", maxWidth: { sm: 400 } }}>
              <Button variant="outlined" fullWidth onClick={() => navigate(`/player/${encodeURIComponent(player.id)}`)}>
                View Player
              </Button>
              <Button
                variant="contained"
                fullWidth
                disabled={!draft.name.trim()}
                onClick={save}
              >
                Save
              </Button>
            </Stack>
          </PlayerCardBackContent>
        </PlayerCardBack>
      </PlayerCardInner>
    </PlayerCardFrame>
  );
}

export function PositionSelect({
  label,
  value,
  onChange,
  exclude,
}: {
  label: string;
  value: Position | "";
  onChange: (position: Position | "") => void;
  exclude?: Position;
}) {
  return (
    <FormControl size="small" sx={{ minWidth: 170, flexGrow: 1 }}>
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        value={value}
        onChange={(event) => onChange(event.target.value as Position | "")}
      >
        <MenuItem value="">Not set</MenuItem>
        {positions
          .filter((position) => position !== exclude)
          .map((position) => (
            <MenuItem key={position} value={position}>
              {position}
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  );
}
