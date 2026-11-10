import CleanSheetIcon from "../../img/clean.svg";
import { compareMatchEvents } from "./matchEventOrder";
import TimelineMarker from "../../components/TimelineMarker";
import AddIcon from "@mui/icons-material/Add";
import { useState, type ReactNode } from "react";
import { goalTotals, updateMatchEvents } from "./eventScore";
import {
  Alert,
  Autocomplete,
  Button,
  Card,
  CardContent,
  Checkbox,
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
import {
  isMatchCompleted,
  type ClubData,
  type Match,
  type MatchEvent,
} from "../../model";
import OpponentCrest from "../../components/OpponentCrest";
import { opponentFor, opponentName } from "../../clubView";
import AssistIcon from "../../img/cleats.svg";
import GoalIcon from "../../img/soccer-ball-variant.svg";
import WhistleIcon from "../../img/whistle.svg";
import PenaltyKick from "../../img/penalty-kick.svg";
import OwnGoalIcon from "../../img/bomb.svg";
import YellowCardIcon from "../../img/cards.svg";
import SaveIcon from "../../img/gloves.svg";
import { canEditClub } from "../../editAccess";
import { PlayerNameNumberInline } from "./MatchEventSnackbar";

function TimelineCard({
  minute,
  children,
}: {
  minute?: number | string;
  children: ReactNode;
}) {
  return (
    <Card sx={{ py: 0.5 }}>
      <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "auto minmax(0, 1fr)",
              lg: "auto minmax(0, 1fr) auto",
            },
            alignItems: "start",
            gap: { xs: 1, sm: 2 },
          }}
        >
          <TimelineMarker compact={true} minute={minute} />
          {children}
        </Box>
      </CardContent>
    </Card>
  );
}

function TimelineBoundary({
  minute,
  label,
  note,
}: {
  minute: number;
  label: string;
  note?: string;
}) {
  return (
    <TimelineCard minute={minute}>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            minHeight: 28,
            fontWeight: 700,
            fontSize: {
              xs: 12,
              sm: 14,
            },
          }}
        >
          <img
            src={WhistleIcon}
            alt=""
            width={16}
            height={16}
            style={{
              transform: "translateY(-4px)",
            }}
          />
          {label}
        </Typography>
        {note && (
          <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
            {note}
          </Typography>
        )}
      </Box>
    </TimelineCard>
  );
}

export default function Events({
  data,
  match,
  update,
}: {
  data: ClubData;
  match: Match;
  update: (data: ClubData) => void;
}) {
  const [editorOpen, setEditorOpen] = useState(false);
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
  const playerOptions = [
    { id: "", label: "Unknown" },
    ...(kind === "goal"
      ? [{ id: "team", label: "Team (no player credit)" }]
      : []),
    ...(canSelectTbfcPlayer
      ? data.players.map((player) => ({
          id: player.id,
          label: [player.number && `#${player.number}`, player.name]
            .filter(Boolean)
            .join(" "),
        }))
      : []),
  ];
  const opponent = opponentFor(data, match);
  const events = data.events
    .filter((e) => e.matchId === match.id)
    .sort(compareMatchEvents);
  const timeline = [
    ...events.filter((event) => event.kind !== "clean_sheet"),
    null,
    ...events.filter((event) => event.kind === "clean_sheet"),
  ];
  const opponentGoalNotes = new Map<string, string>();
  const opponentLabel = opponentName(data, match);
  let goalsFor = 0;
  let goalsAgainst = 0;
  for (const event of events) {
    if (event.kind !== "goal") continue;
    if (event.team !== "opponent") {
      goalsFor++;
      continue;
    }
    goalsAgainst++;
    let note = event.note?.trim() ?? "";
    // Older goal notes may begin with the recorded score, including unlogged goals.
    const prefix = /^Turf Burners FC\s+(\d+)\s*[-–]\s*(\d+)\s+/i.exec(note);
    if (prefix) {
      const rest = note.slice(prefix[0].length);
      const tail = rest.slice(opponentLabel.length);
      if (
        rest.toLowerCase().startsWith(opponentLabel.toLowerCase()) &&
        /^(?:$|[.\s])/.test(tail)
      ) {
        goalsFor = Number(prefix[1]);
        goalsAgainst = Number(prefix[2]);
        note = tail.replace(/^\.?\s*/, "");
      }
    }
    const scoreline = `Turf Burners FC ${goalsFor} - ${goalsAgainst} ${opponentLabel}.`;
    opponentGoalNotes.set(event.id, note ? `${scoreline} ${note}` : scoreline);
  }
  const logged = goalTotals(events, match.id);
  function editEvent(event: MatchEvent) {
    setEditingEvent(event);
    setEditorOpen(true);
    setKind(event.kind);
    setPlayerId(event.teamGoal ? "team" : (event.playerId ?? ""));
    setEventTeam(event.team ?? "tbfc");
    setOwnGoal(event.ownGoal ?? false);
    setMinute(event.minute == null ? "" : String(event.minute));
    setNote(event.note ?? "");
  }
  function closeEditor() {
    setEditorOpen(false);
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
    closeEditor();
  }

  const eventForm = (
    <Card
      sx={{
        "& .MuiCardContent-root": {
          paddingTop: `12px !important`,
          paddingBottom: `12px !important`,
        },
      }}
    >
      <CardContent
        sx={{ paddingTop: `12px !important`, paddingBottom: `12px !important` }}
      >
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
          <Autocomplete
            size="small"
            sx={{ width: { xs: "100%", md: 220 } }}
            openOnFocus
            autoHighlight
            options={playerOptions}
            getOptionKey={(option) => option.id}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            value={
              playerOptions.find((option) => option.id === playerId) ?? null
            }
            onChange={(_, option) => setPlayerId(option?.id ?? "")}
            renderInput={(params) => (
              <TextField
                {...params}
                label={kind === "goal" ? "Scorer" : "Player"}
              />
            )}
          />
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
          <Button
            onClick={closeEditor}
            sx={{ width: { xs: "100%", md: "auto" } }}
          >
            Cancel
          </Button>
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
    <Stack gap={1}>
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
      {canEditClub && (
        <>
          <Box
            sx={{
              position: "fixed",
              bottom:
                "calc(var(--event-button-bottom, 85px) + env(safe-area-inset-bottom, 0px))",
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              zIndex: (theme) => theme.zIndex.appBar,
              pointerEvents: "none",
            }}
          >
            {!editorOpen && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  pointerEvents: "auto",
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.5)",
                }}
                onClick={() => setEditorOpen(true)}
              >
                Add Event
              </Button>
            )}
          </Box>

          <Dialog
            open={editorOpen}
            onClose={closeEditor}
            fullWidth
            maxWidth="md"
            aria-label={editingEvent ? "Edit match event" : "Add match event"}
          >
            {eventForm}
          </Dialog>
        </>
      )}
      <TimelineBoundary minute={0} label="KICKOFF" />
      {timeline.map((event) => {
        if (!event)
          return (
            <TimelineBoundary
              key="full-time-whistle"
              minute={50}
              label="FULL TIME"
              note={
                isMatchCompleted(match)
                  ? `Turf Burners FC ${match.goalsFor}-${match.goalsAgainst} ${opponentLabel}`
                  : undefined
              }
            />
          );
        const targetPlayer = data.players.find((p) => p.id === event.playerId);
        const displayNote = opponentGoalNotes.get(event.id) ?? event.note;
        const eventHasTeam =
          event.kind === "clean_sheet" ||
          event.kind === "assist" ||
          event.kind === "goal" ||
          event.kind === "yellow_card" ||
          event.kind === "penalty_save" ||
          event.kind === "penalty_kick";
        const teamName =
          event.team === "opponent"
            ? opponentName(data, match)
            : "Turf Burners FC";

        return (
          <TimelineCard key={event.id} minute={event.minute}>
            <Box
              sx={{
                minWidth: 0,
                display: { xs: "grid", sm: "flex" },
                gap: { xs: 0.75, sm: 2 },
                gridTemplateColumns: "16px minmax(0, 1fr)",
              }}
            >
              <img
                src={
                  event.kind === "penalty_kick"
                    ? PenaltyKick
                    : event.kind === "yellow_card"
                      ? YellowCardIcon
                      : event.kind === "clean_sheet"
                        ? CleanSheetIcon
                        : event.kind === "penalty_save"
                          ? SaveIcon
                          : event.ownGoal
                            ? OwnGoalIcon
                            : event.kind === "assist"
                              ? AssistIcon
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
                  alignSelf: "start",
                  marginTop: 3,
                }}
              />
              <Typography
                sx={{
                  transform: "translateY(2px)",
                  textTransform: "uppercase",
                  fontWeight: "bold",
                  alignSelf: "start",
                  display: "grid",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                  lineHeight: 1.2,
                  "&::before": {
                    content: '"Penalty"',
                    visibility: "hidden",
                    gridArea: "1 / 1",
                  },
                  fontSize: {
                    xs: 12,
                    sm: 14,
                  },
                }}
              >
                <span
                  style={{
                    gridArea: "1 / 1",
                    justifySelf: "start",
                    whiteSpace: "nowrap",
                  }}
                >
                  {event.kind === "penalty_kick"
                    ? "penalty"
                    : event.kind === "penalty_save"
                      ? "PK save"
                      : event.kind.replaceAll("_", " ")}{" "}
                </span>
              </Typography>

              <Box
                sx={{
                  minWidth: 0,
                  gridColumn: "1 / -1",
                  display: event.kind === "penalty_kick" ? "flex" : "block",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                {eventHasTeam && (
                  <Box
                    component="span"
                    role="group"
                    aria-label={teamName}
                    title={teamName}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mt: {
                        xs: 0,
                        sm: event.kind === "penalty_kick" ? 0 : -0.8,
                      },
                      minWidth: 0,
                      flexShrink: 0,
                      "& > div": { minWidth: 0 },
                      "& > div > span": { overflowWrap: "anywhere" },
                    }}
                  >
                    {event.team === "opponent" ? (
                      <OpponentCrest url={opponent?.crestUrl} size={28} />
                    ) : (
                      <Box
                        component="img"
                        src="/crests/tbfc.png"
                        alt=""
                        sx={{ width: 25, height: 25, objectFit: "contain" }}
                      />
                    )}
                    {event.team === "opponent" &&
                      (event.kind === "goal" ||
                        event.kind === "yellow_card") && (
                        <Typography
                          component="span"
                          sx={{
                            bgcolor: opponent?.color || "#555",
                            color: "#fff",
                            px: 1,
                            py: 0.25,
                            fontWeight: 700,
                            fontSize: 14,
                          }}
                        >
                          {teamName}
                        </Typography>
                      )}
                    {targetPlayer && event.kind !== "penalty_kick" && (
                      <PlayerNameNumberInline player={targetPlayer} />
                    )}
                    {event.ownGoal && (
                      <Typography component="span" sx={{ fontWeight: "bold" }}>
                        [OG]
                      </Typography>
                    )}
                  </Box>
                )}

                {displayNote && (
                  <Typography
                    sx={{
                      flex: 1,
                      order: 2,
                      lineHeight: 1.2,
                      mt:
                        opponentGoalNotes.get(event.id) || event.ownGoal
                          ? 1
                          : 0,
                      fontSize: 14,
                      alignSelf:
                        event.kind === "penalty_kick" ? "center" : "start",
                      gridColumn: "1 / -1",
                      overflowWrap: "anywhere",
                      opacity: 0.7,
                      "@media (max-width: 1199px)": {
                        flexBasis: "100%",
                        order: 3,
                      },
                    }}
                  >
                    {displayNote}
                  </Typography>
                )}
              </Box>
            </Box>

            {canEditClub && event.kind !== "clean_sheet" && (
              <Stack
                direction="row"
                sx={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "flex-end",
                  gridColumn: { xs: "1 / -1", lg: "auto" },
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
          </TimelineCard>
        );
      })}
    </Stack>
  );
}
