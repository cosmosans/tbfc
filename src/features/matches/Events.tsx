import { useState } from "react";
import { goalTotals, updateMatchEvents } from "./eventScore";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Box,
} from "@mui/material";
import { getContrastRatio } from "@mui/material/styles";
import type { ClubData, Match, MatchEvent } from "../../model";
import { opponentFor, opponentName } from "../../clubView";
import GoalIcon from "../../img/soccer-ball-variant.svg";
import WhistleIcon from "../../img/penalty-kick.svg";
import OwnGoalIcon from "../../img/bomb.svg";
import YellowCardIcon from "../../img/cards.svg";
import SaveIcon from "../../img/gloves.svg";
import { canEditClub } from "../../editAccess";

export default function Events({
  data,
  match,
  update,
}: {
  data: ClubData;
  match: Match;
  update: (data: ClubData) => void;
}) {
  const [editingEvent, setEditingEvent] = useState<MatchEvent | null>(null);
  const [kind, setKind] = useState<MatchEvent["kind"]>("goal");
  const [playerId, setPlayerId] = useState("");
  const [eventTeam, setEventTeam] = useState<"tbfc" | "opponent">("tbfc");
  const [ownGoal, setOwnGoal] = useState(false);
  const [minute, setMinute] = useState("");
  const [note, setNote] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const hasTeam =
    kind === "goal" ||
    kind === "yellow_card" ||
    kind === "penalty_kick" ||
    kind === "penalty_save";
  const canSelectTbfcPlayer =
    kind === "goal"
      ? (eventTeam === "tbfc" && !ownGoal) ||
        (eventTeam === "opponent" && ownGoal)
      : !hasTeam || eventTeam === "tbfc";
  const events = data.events
    .filter((e) => e.matchId === match.id)
    .sort((a, b) => (a.minute ?? 999) - (b.minute ?? 999));
  const logged = goalTotals(events, match.id);
  function editEvent(event: MatchEvent) {
    setEditingEvent(event);
    setKind(event.kind);
    setPlayerId(event.teamGoal ? "team" : (event.playerId ?? ""));
    setEventTeam(event.team ?? "tbfc");
    setOwnGoal(event.ownGoal ?? false);
    setMinute(event.minute == null ? "" : String(event.minute));
    setNote(event.note ?? "");
  }
  function closeEditor() {
    setEditingEvent(null);
    setKind("goal");
    setPlayerId("");
    setEventTeam("tbfc");
    setOwnGoal(false);
    setMinute("");
    setNote("");
    setNoteOpen(false);
  }
  function addEvent() {
    if (
      !canEditClub ||
      (minute !== "" &&
        (!Number.isFinite(Number(minute)) || Number(minute) < 0))
    )
      return;
    const event: MatchEvent = {
      ...editingEvent,
      id: editingEvent?.id ?? crypto.randomUUID(),
      matchId: match.id,
      kind,
      team: kind === "assist" ? "tbfc" : hasTeam ? eventTeam : undefined,
      ownGoal: kind === "goal" ? ownGoal : undefined,
      teamGoal: kind === "goal" && playerId === "team" ? true : undefined,
      playerId: playerId && playerId !== "team" ? playerId : undefined,
      minute: minute ? Number(minute) : undefined,
      note: note || undefined,
    };
    update(
      updateMatchEvents(
        data,
        match.id,
        editingEvent
          ? data.events.map((existing) =>
              existing.id === editingEvent.id ? event : existing,
            )
          : [...data.events, event],
      ),
    );
    if (editingEvent) closeEditor();
    setMinute("");
    setNote("");
  }

  const eventForm = (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {editingEvent ? "Edit Event" : "Add Event"}
        </Typography>
        <Stack
          direction={{ xs: "column", md: "row" }}
          gap={2}
          flexWrap="wrap"
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <FormControl
            size="small"
            sx={{ minWidth: { md: 150 }, width: { xs: "100%", md: "auto" } }}
          >
            <InputLabel>Event</InputLabel>
            <Select
              label="Event"
              value={kind}
              onChange={(e) => {
                setKind(e.target.value as MatchEvent["kind"]);
                setPlayerId("");
              }}
            >
              {(
                [
                  "goal",
                  "assist",
                  "yellow_card",
                  "penalty_kick",
                  "penalty_save",
                  "note",
                ] as const
              ).map((k) => (
                <MenuItem key={k} value={k}>
                  {k
                    .replaceAll("_", " ")
                    .replace(/\b\w/g, (char) => char.toUpperCase())}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {hasTeam && (
            <FormControl
              size="small"
              sx={{ minWidth: { md: 180 }, width: { xs: "100%", md: "auto" } }}
            >
              <InputLabel>
                {kind === "goal"
                  ? "Goal For"
                  : kind === "penalty_kick"
                    ? "Awarded To"
                    : "Team"}
              </InputLabel>
              <Select
                label={
                  kind === "goal"
                    ? "Goal For"
                    : kind === "penalty_kick"
                      ? "Awarded To"
                      : "Team"
                }
                value={eventTeam}
                onChange={(e) => {
                  setEventTeam(e.target.value as "tbfc" | "opponent");
                  setPlayerId("");
                }}
              >
                <MenuItem value="tbfc">Turf Burners FC</MenuItem>
                <MenuItem value="opponent">
                  {opponentName(data, match)}
                </MenuItem>
              </Select>
            </FormControl>
          )}
          <FormControl
            size="small"
            sx={{ minWidth: { md: 180 }, width: { xs: "100%", md: "auto" } }}
          >
            <InputLabel>{kind === "goal" ? "Scorer" : "Player"}</InputLabel>
            <Select
              label={kind === "goal" ? "Scorer" : "Player"}
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value)}
            >
              <MenuItem value="">Unknown</MenuItem>
              {kind === "goal" && (
                <MenuItem value="team">Team (no player credit)</MenuItem>
              )}
              {canSelectTbfcPlayer &&
                data.players.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    #{p.number} {p.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          {kind === "goal" && (
            <FormControlLabel
              sx={{ width: { xs: "100%", md: "auto" }, m: 0 }}
              control={
                <Checkbox
                  checked={ownGoal}
                  onChange={(e) => {
                    setOwnGoal(e.target.checked);
                    setPlayerId("");
                  }}
                />
              }
              label="Own Goal"
            />
          )}
          <TextField
            size="small"
            label="Minute"
            type="number"
            inputProps={{ min: 0 }}
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            sx={{ width: { xs: "100%", md: 100 } }}
          />
          <Button
            variant="outlined"
            aria-label={note ? "Edit event note" : "Add event note"}
            onClick={() => {
              setNoteDraft(note);
              setNoteOpen(true);
            }}
            sx={{
              flexGrow: 1,
              minWidth: { md: 160 },
              width: { xs: "100%", md: "auto" },
              maxWidth: { md: 320 },
              justifyContent: "flex-start",
            }}
          >
            <Typography component="span" noWrap sx={{ fontSize: "inherit" }}>
              {note || "Add note"}
            </Typography>
          </Button>
          {editingEvent && (
            <Button
              onClick={closeEditor}
              sx={{ width: { xs: "100%", md: "auto" } }}
            >
              Cancel
            </Button>
          )}
          <Button
            variant="contained"
            onClick={addEvent}
            sx={{ width: { xs: "100%", md: "auto" } }}
            disabled={
              minute !== "" &&
              (!Number.isFinite(Number(minute)) || Number(minute) < 0)
            }
          >
            {editingEvent ? "Save changes" : "Add"}
          </Button>
        </Stack>
        {kind === "penalty_kick" && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            Record a penalty awarded during the match and describe the foul in
            the note. Add a separate Goal, Penalty Save, or Note for the
            outcome. This event does not change goal totals.
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Stack gap={2}>
      {canEditClub && (
        <Dialog
          open={noteOpen}
          onClose={() => setNoteOpen(false)}
          fullWidth
          maxWidth="md"
          aria-labelledby="event-note-title"
        >
          <DialogTitle id="event-note-title">Event Note</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              fullWidth
              multiline
              minRows={8}
              maxRows={18}
              label="Note"
              value={noteDraft}
              onChange={(event) => setNoteDraft(event.target.value)}
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNoteOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={() => {
                setNote(noteDraft);
                setNoteOpen(false);
              }}
            >
              Use Note
            </Button>
          </DialogActions>
        </Dialog>
      )}
      {(logged.for < match.goalsFor || logged.against < match.goalsAgainst) && (
        <Alert severity="info">
          {logged.for} of {match.goalsFor} TBFC goals and {logged.against} of{" "}
          {match.goalsAgainst} opponent goals have event records. Historical
          totals are preserved while missing goals are added. Once accounted
          for, goal events control the score.
        </Alert>
      )}
      {canEditClub &&
        (editingEvent ? (
          <Dialog
            open
            onClose={closeEditor}
            fullWidth
            maxWidth="md"
            aria-label="Edit match event"
          >
            {eventForm}
          </Dialog>
        ) : (
          eventForm
        ))}
      {events.map((event) => {
        const targetPlayer = data.players.find((p) => p.id === event.playerId);
        const number = targetPlayer?.number;
        const name = targetPlayer?.name;
        const eventHasTeam =
          event.kind === "assist" ||
          event.kind === "goal" ||
          event.kind === "yellow_card" ||
          event.kind === "penalty_save" ||
          event.kind === "penalty_kick";
        const teamName =
          event.team === "opponent"
            ? opponentName(data, match)
            : "Turf Burners FC";
        const teamColor =
          event.team === "opponent"
            ? opponentFor(data, match)?.color || "#555"
            : "#f47730";
        const teamLabelBackground =
          getContrastRatio(teamColor, "#000") >=
          getContrastRatio(teamColor, "#fff")
            ? "#000"
            : "#fff";
        const actor = name ? `${number ? `#${number} ` : ""}${name}` : "";

        return (
          <Card key={event.id}>
            <CardContent>
              <Stack
                direction="row"
                alignItems="flex-start"
                gap={2}
                flexWrap="wrap"
              >
                <Chip
                  sx={{
                    height: 28,
                  }}
                  label={
                    event.minute == null ? "Time Unknown" : `${event.minute}′`
                  }
                />
                <Typography sx={{ minWidth: 0, display: "flex", gap: 2 }}>
                  <img
                    src={
                      event.kind === "penalty_kick"
                        ? WhistleIcon
                        : event.kind === "yellow_card"
                          ? YellowCardIcon
                          : event.kind === "penalty_save"
                            ? SaveIcon
                            : event.ownGoal
                              ? OwnGoalIcon
                              : GoalIcon
                    }
                    alt={
                      event.kind === "penalty_kick"
                        ? "penalty"
                        : event.kind.replaceAll("_", " ")
                    }
                    style={{
                      width: 16,
                      height: 16,
                      position: "relative",
                      top: 6,
                    }}
                  />
                  <span
                    style={{
                      transform: "translateY(2px)",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                    }}
                  >
                    {event.kind === "penalty_kick"
                      ? "penalty"
                      : event.kind.replaceAll("_", " ")}{" "}
                  </span>
                  {eventHasTeam ? (
                    <>
                      <Typography
                        component="span"
                        sx={{
                          color: event.team === "opponent" ? "#fff" : teamColor,
                          bgcolor:
                            event.team === "opponent"
                              ? teamColor
                              : teamLabelBackground,
                          fontWeight: 700,

                          px: 1,
                          py: 0.25,
                          borderRadius: 0,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {teamName}
                      </Typography>
                      {actor && <Box sx={{ mt: "2px" }}>{`${actor}`}</Box>}{" "}
                    </>
                  ) : name ? (
                    actor
                  ) : (
                    ""
                  )}
                </Typography>

                <Typography
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    order: 2,
                    lineHeight: 1.2,
                    fontSize: 14,
                    mt: "5px",
                    "@media (max-width: 1199px)": {
                      flexBasis: "100%",
                      order: 3,
                    },
                  }}
                >
                  {event.note}
                </Typography>
                {canEditClub && (
                  <Stack
                    direction="row"
                    sx={{
                      order: 3,
                      "@media (max-width: 1199px)": { order: 2 },
                    }}
                  >
                    <Button onClick={() => editEvent(event)}>Edit</Button>
                    <Button
                      color="error"
                      sx={{
                        order: 3,
                        "@media (max-width: 1199px)": { order: 2 },
                      }}
                      onClick={() =>
                        update(
                          updateMatchEvents(
                            data,
                            match.id,
                            data.events.filter((e) => e.id !== event.id),
                          ),
                        )
                      }
                    >
                      Remove
                    </Button>
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}
