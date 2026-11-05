import { useRef, useState, type PointerEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import CleatsIcon from "../../img/cleats.svg";
import { canEditClub } from "../../editAccess";
import SoccerBallIcon from "../../img/soccer-ball-variant.svg";
import KeeperIcon from "../../img/gloves.svg";
import CardsIcon from "../../img/cards.svg";

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
import type { MatchEvent, Player, Position } from "../../model";
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
  const [flipped, setFlipped] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<Player>({ ...player });
  const [photoError, setPhotoError] = useState("");
  const counts = {
    goals:
      (player.historicalStats?.goals ?? 0) +
      events.filter(
        (e) => e.kind === "goal" && !e.ownGoal && e.team !== "opponent",
      ).length,
    assists:
      (player.historicalStats?.assists ?? 0) +
      events.filter((e) => e.kind === "assist").length,
    cards:
      (player.historicalStats?.yellowCards ?? 0) +
      events.filter((e) => e.kind === "yellow_card" && e.team !== "opponent")
        .length,
    saves:
      (player.historicalStats?.penaltySaves ?? 0) +
      events.filter((e) => e.kind === "penalty_save" && e.team !== "opponent")
        .length,
  };
  function resetTilt() {
    const frame = frameRef.current;
    if (!frame) return;
    frame.style.setProperty("--tilt-x", "0deg");
    frame.style.setProperty("--tilt-y", "0deg");
    frame.style.setProperty("--sheen-opacity", "0");
    delete frame.dataset.tilting;
  }
  function updateTilt(event: PointerEvent<HTMLDivElement>) {
    if (
      flipped ||
      event.pointerType !== "mouse" ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    // Measure the stationary frame so the tilt cannot feed back into cursor position.
    const frame = event.currentTarget;
    const bounds = frame.getBoundingClientRect();
    const x = Math.max(
      0,
      Math.min(1, (event.clientX - bounds.left) / bounds.width),
    );
    const y = Math.max(
      0,
      Math.min(1, (event.clientY - bounds.top) / bounds.height),
    );
    frame.style.setProperty("--tilt-x", `${(0.5 - y) * 16}deg`);
    frame.style.setProperty("--tilt-y", `${(x - 0.5) * 16}deg`);
    frame.style.setProperty("--sheen-x", `${x * 100}%`);
    frame.style.setProperty("--sheen-y", `${y * 100}%`);
    frame.style.setProperty("--sheen-opacity", "1");
    frame.dataset.tilting = "true";
  }
  function openEdit() {
    if (!canEditClub) return;
    resetTilt();
    setDraft({ ...player });
    setPhotoError("");
    setFlipped(true);
  }
  function cancel() {
    setDraft({ ...player });
    setPhotoError("");
    setFlipped(false);
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
      ref={frameRef}
      onPointerEnter={updateTilt}
      onPointerMove={updateTilt}
      onPointerLeave={resetTilt}
      onPointerCancel={resetTilt}
      onBlur={resetTilt}
    >
      <PlayerCardInner flipped={flipped}>
        <PlayerCardFront
          type="button"
          disabled={!canEditClub}
          onClick={openEdit}
          aria-label={canEditClub ? `Edit ${player.name}` : player.name}
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

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body2" color="white">
                  FORWARD
                </Typography>

                <PlayerPositions>
                  {[player.preferredPosition, player.secondaryPosition]
                    .filter(Boolean)
                    .join(" / ") || ""}
                </PlayerPositions>
              </Box>
            </PlayerIdentity>
            <PlayerStatus active={player.active}>
              {player.active ? "ACTIVE" : "INACTIVE"}
            </PlayerStatus>
          </PlayerInformation>
        </PlayerCardFront>
        <PlayerCardBack aria-hidden={!flipped} inert={!flipped}>
          <PlayerCardBackContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Edit player
            </Typography>
            <Stack gap={1.4}>
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

              <PositionSelect
                label="Preferred position"
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
                label="Secondary position"
                value={draft.secondaryPosition ?? ""}
                onChange={(position) =>
                  setDraft({ ...draft, secondaryPosition: position })
                }
                exclude={draft.preferredPosition || undefined}
              />
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
                  Remove image
                </Button>
              )}
              {photoError && <Alert severity="error">{photoError}</Alert>}
            </Stack>
            <Divider sx={{ my: 1.5 }} />

            <Box sx={{}}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontSize: 12,
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={SoccerBallIcon}
                    alt="Goals"
                    style={{
                      width: 16,
                      height: 16,
                      marginRight: 5,
                      position: "relative",
                      top: -1,
                    }}
                  />
                  <strong
                    style={{ fontSize: 20, paddingRight: 2.5, color: "white" }}
                  >
                    {counts.goals}
                  </strong>{" "}
                  Goal{counts.goals !== 1 ? "s" : ""}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    flex: 1,
                    fontSize: 12,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={CleatsIcon}
                    alt="Assists"
                    style={{ width: 16, height: 16, marginRight: 4 }}
                  />
                  <strong
                    style={{ fontSize: 20, paddingRight: 2.5, color: "white" }}
                  >
                    {counts.assists}
                  </strong>{" "}
                  Assist{counts.assists !== 1 ? "s" : ""}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    fontSize: 12,
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={KeeperIcon}
                    alt="Penalty Saves"
                    style={{
                      width: 16,
                      height: 16,
                      marginRight: 5,
                      position: "relative",
                      top: -1,
                    }}
                  />
                  <strong
                    style={{ fontSize: 20, paddingRight: 2.5, color: "white" }}
                  >
                    {counts.saves}
                  </strong>{" "}
                  PK Save{counts.saves !== 1 ? "s" : ""}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: 12,
                    flex: 1,
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={CardsIcon}
                    alt="Yellow Cards"
                    style={{
                      width: 16,
                      height: 16,
                      marginRight: 5,
                      position: "relative",
                      top: -1,
                    }}
                  />
                  <strong
                    style={{ fontSize: 20, paddingRight: 2.5, color: "white" }}
                  >
                    {counts.cards}
                  </strong>{" "}
                  Yellow Card{counts.cards !== 1 ? "s" : ""}
                </Typography>
              </Box>
            </Box>

            <Stack direction="row" gap={1} sx={{ mt: 2 }}>
              <Button variant="outlined" fullWidth onClick={cancel}>
                Cancel
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
