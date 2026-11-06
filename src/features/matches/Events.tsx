import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { getContrastRatio } from "@mui/material/styles";
import type { ClubData, Match, MatchEvent } from "../../model";
import { opponentFor, opponentName } from "../../clubView";
import GoalIcon from "../../img/soccer-ball-variant.svg";
import WhistleIcon from "../../img/penalty-kick.svg";
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
  const [kind, setKind] = useState<MatchEvent["kind"]>("goal");
  const [playerId, setPlayerId] = useState("");
  const [eventTeam, setEventTeam] = useState<"tbfc" | "opponent">("tbfc");
  const [ownGoal, setOwnGoal] = useState(false);
  const [minute, setMinute] = useState("");
  const [note, setNote] = useState("");
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
  const loggedGoals = events.filter(
    (e) => e.kind === "goal" && e.team !== "opponent",
  ).length;
  function addEvent() {
    const event: MatchEvent = {
      id: crypto.randomUUID(),
      matchId: match.id,
      kind,
      team: hasTeam ? eventTeam : undefined,
      ownGoal: kind === "goal" ? ownGoal : undefined,
      teamGoal: kind === "goal" && playerId === "team" ? true : undefined,
      playerId: playerId && playerId !== "team" ? playerId : undefined,
      minute: minute ? Number(minute) : undefined,
      note: note || undefined,
    };
    update({ ...data, events: [...data.events, event] });
    setMinute("");
    setNote("");
  }

  return (
    <Stack gap={2}>
      {loggedGoals !== match.goalsFor && (
        <Alert severity="info">
          {loggedGoals} of {match.goalsFor} TBFC goals have an event record.
          Older matches may have unknown scorers; the score remains complete.
        </Alert>
      )}
      {canEditClub && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Add Event
            </Typography>
            <Stack
              direction={{ xs: "column", md: "row" }}
              gap={2}
              flexWrap="wrap"
              alignItems="center"
            >
              <FormControl size="small" sx={{ minWidth: 150 }}>
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
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>
                    {kind === "goal"
                      ? "Goal for"
                      : kind === "penalty_kick"
                        ? "Awarded to"
                        : "Team"}
                  </InputLabel>
                  <Select
                    label={
                      kind === "goal"
                        ? "Goal for"
                        : kind === "penalty_kick"
                          ? "Awarded to"
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
              <FormControl size="small" sx={{ minWidth: 180 }}>
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
                  control={
                    <Checkbox
                      checked={ownGoal}
                      onChange={(e) => {
                        setOwnGoal(e.target.checked);
                        setPlayerId("");
                      }}
                    />
                  }
                  label="Own goal"
                />
              )}
              <TextField
                size="small"
                label="Minute"
                type="number"
                inputProps={{ min: 0 }}
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                sx={{ width: 100 }}
              />
              <TextField
                size="small"
                label="Note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                sx={{ flexGrow: 1 }}
              />
              <Button variant="contained" onClick={addEvent}>
                Add
              </Button>
            </Stack>
            {kind === "penalty_kick" && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1.5 }}
              >
                Record a penalty awarded during the match and describe the foul
                in the note. Add a separate Goal, Penalty Save, or Note for the
                outcome. This event does not change goal totals.
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
      {events.map((event) => {
        const targetPlayer = data.players.find((p) => p.id === event.playerId);
        const number = targetPlayer?.number;
        const name = targetPlayer?.name;
        const eventHasTeam =
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
        const actor = event.ownGoal
          ? "OG"
          : name
            ? `${number ? `#${number} ` : ""}${name}`
            : "";

        return (
          <Card key={event.id}>
            <CardContent>
              <Stack
                direction="row"
                alignItems="center"
                gap={2}
                flexWrap="wrap"
              >
                <Chip
                  label={
                    event.minute == null ? "Time unknown" : `${event.minute}′`
                  }
                />
                <Typography
                  sx={{ flex: 1, minWidth: 0, display: "flex", gap: 2 }}
                >
                  {event.kind === "goal" && (
                    <img
                      src={GoalIcon}
                      alt="Goal"
                      style={{
                        width: 16,
                        height: 16,
                        position: "relative",
                        marginRight: -8,
                        top: 2,
                      }}
                    />
                  )}
                  {event.kind === "penalty_kick" && (
                    <img
                      src={WhistleIcon}
                      alt="Penalty Kick"
                      style={{
                        width: 16,
                        height: 16,
                        position: "relative",
                        marginRight: -8,
                        top: 2,
                      }}
                    />
                  )}{" "}
                  <span
                    style={{ textTransform: "uppercase", fontWeight: "bold" }}
                  >
                    {" "}
                    {event.kind === "penalty_kick"
                      ? "PENALTY!"
                      : event.kind === "goal"
                        ? "GOAL!"
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
                      {`${actor}`}
                    </>
                  ) : name ? (
                    actor
                  ) : (
                    ""
                  )}
                </Typography>

                {event.note && (
                  <Typography
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      order: 2,
                      "@media (max-width: 1199px)": {
                        flexBasis: "100%",
                        order: 3,
                      },
                    }}
                  >
                    {event.note}
                  </Typography>
                )}
                {canEditClub && (
                  <Button
                    color="error"
                    sx={{
                      order: 3,
                      "@media (max-width: 1199px)": { order: 2 },
                    }}
                    onClick={() =>
                      update({
                        ...data,
                        events: data.events.filter((e) => e.id !== event.id),
                      })
                    }
                  >
                    Remove
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}
