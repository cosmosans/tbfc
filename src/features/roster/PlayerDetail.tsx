import RichTextDialog from "../../components/RichTextDialog";
import { storyToHtml } from "../matches/matchStory";
import MatchResultChip from "../../components/MatchResultChip";
import { playerStats } from "./playerStats";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";
import PlayerSummary from "./PlayerSummary";
import {
  PlayerCardFrame,
  PlayerCardInner,
  PlayerCardFront,
} from "./PlayerCard.styles";
import type { ClubData, Player } from "../../model";
import { displayScore } from "../../model";
import moment from "moment";
import OpponentCrest from "../../components/OpponentCrest";
import { opponentFor, opponentName, seasonName } from "../../clubView";
import { canEditClub } from "../../editAccess";
import GoalIcon from "../../img/soccer-ball-variant.svg";
import AssistIcon from "../../img/cleats.svg";
import SaveIcon from "../../img/gloves.svg";
import CardIcon from "../../img/cards.svg";

type HistorySort = "date" | "goals" | "assists" | "cards" | "saves";
const statIndex = { goals: 0, assists: 1, saves: 2, cards: 3 } as const;

export default function PlayerDetail({
  player,
  data,
  update,
}: {
  player: Player;
  data: ClubData;
  update: (data: ClubData) => void;
}) {
  const [bioOpen, setBioOpen] = useState(false);
  const [historySort, setHistorySort] = useState<HistorySort>("date");
  const [descending, setDescending] = useState(true);
  const isGoalkeeper =
    player.preferredPosition === "GK" || player.secondaryPosition === "GK";
  const events = data.events.filter((event) => event.playerId === player.id);
  const counts = playerStats(player, events);
  const history = data.matches
    .filter(
      (match) =>
        match.status !== "scheduled" &&
        (events.some((event) => event.matchId === match.id) ||
          data.lineups.some(
            (lineup) =>
              lineup.matchId === match.id &&
              (lineup.starters.includes(player.id) ||
                lineup.bench.includes(player.id)),
          )),
    )
    .map((match) => {
      const matchEvents = events
        .filter((event) => event.matchId === match.id)
        .sort((a, b) => (a.minute ?? 999) - (b.minute ?? 999));
      return {
        match,
        opponent: opponentFor(data, match),
        matchEvents,
        lineup: data.lineups.find((item) => item.matchId === match.id),
        stats: playerStats(player, matchEvents),
      };
    })
    .sort((a, b) => {
      const comparison =
        historySort === "date"
          ? a.match.date.localeCompare(b.match.date)
          : a.stats[statIndex[historySort]][1] -
            b.stats[statIndex[historySort]][1];
      return (
        (descending ? -comparison : comparison) ||
        b.match.date.localeCompare(a.match.date) ||
        a.match.id.localeCompare(b.match.id)
      );
    });
  function sortHistory(key: HistorySort) {
    if (historySort === key) setDescending(!descending);
    else {
      setHistorySort(key);
      setDescending(true);
    }
  }
  function sortHeading(key: HistorySort, label: string) {
    return (
      <TableSortLabel
        active={historySort === key}
        direction={historySort === key && !descending ? "asc" : "desc"}
        onClick={() => sortHistory(key)}
        sx={{
          color: "text.secondary",
          "&.Mui-active": { color: "primary.main" },
        }}
      >
        {label}
      </TableSortLabel>
    );
  }
  const sortDirection = (key: HistorySort): "asc" | "desc" | false =>
    historySort === key ? (descending ? "desc" : "asc") : false;
  return (
    <Stack gap={3}>
      <PlayerCardFrame>
        <PlayerCardInner flipped={false}>
          <PlayerCardFront as="header" aria-label={player.name}>
            <PlayerSummary player={player} events={events} />
          </PlayerCardFront>
        </PlayerCardInner>
      </PlayerCardFrame>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            sm: `repeat(${isGoalkeeper ? 4 : 3}, 1fr)`,
          },
          gap: 2,
        }}
      >
        {counts
          .filter(([label]) => label !== "PK Saves" || isGoalkeeper)
          .map(([label, count]) => (
            <Card key={label}>
              <CardContent
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {label === "Goals" ? (
                  <img
                    src={GoalIcon}
                    alt="Goals"
                    style={{ marginRight: 8, width: 30, height: 30 }}
                  />
                ) : label === "Assists" ? (
                  <img
                    src={AssistIcon}
                    alt="Assists"
                    style={{ marginRight: 8, width: 30, height: 30 }}
                  />
                ) : label === "PK Saves" ? (
                  <img
                    src={SaveIcon}
                    alt="PK Saves"
                    style={{ marginRight: 8, width: 30, height: 30 }}
                  />
                ) : label === "Yellow Cards" ? (
                  <img
                    src={CardIcon}
                    alt="Yellow Cards"
                    style={{ marginRight: 8, width: 30, height: 30 }}
                  />
                ) : null}

                <Typography
                  variant="h4"
                  color="primary"
                  sx={{ paddingRight: 1 }}
                >
                  {count}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textTransform: "uppercase" }}
                >
                  {label}
                </Typography>
              </CardContent>
            </Card>
          ))}
      </Box>
      <Typography variant="body2" color="text.secondary">
        Career totals include historical player totals and recorded match
        events. Historical totals may not have individual match records.
      </Typography>
      <Card>
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <Typography variant="h6">Bio</Typography>
            {canEditClub && (
              <Button
                onClick={() => {
                  setBioOpen(true);
                }}
              >
                {player.bio ? "Edit Bio" : "Add Bio"}
              </Button>
            )}
          </Stack>
          {player.bio ? (
            <Box
              sx={{ overflowWrap: "anywhere", "& p": { my: 1 } }}
              dangerouslySetInnerHTML={{ __html: storyToHtml(player.bio) }}
            />
          ) : (
            <Typography color="text.secondary">No bio added yet.</Typography>
          )}
        </CardContent>
      </Card>
      <Stack gap={2}>
        <Typography variant="h5">Match History</Typography>
        <Typography variant="body2" color="text.secondary">
          Matches with a saved lineup selection or a recorded event.
        </Typography>
        {!history.length ? (
          <Typography color="text.secondary">
            No match history recorded yet.
          </Typography>
        ) : (
          <TableContainer
            component={Box}
            sx={{ bgcolor: "background.paper", overflowX: "auto" }}
          >
            <Table size="small" sx={{ minWidth: isGoalkeeper ? 1080 : 980 }}>
              <TableHead sx={{ bgcolor: "rgba(255,255,255,.09)" }}>
                <TableRow>
                  <TableCell
                    sx={{ whiteSpace: "nowrap" }}
                    sortDirection={sortDirection("date")}
                  >
                    {sortHeading("date", "Date")}
                  </TableCell>
                  <TableCell>Opponent</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell align="center">Result</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell sx={{ minWidth: 260 }}>Events</TableCell>
                  <TableCell
                    align="center"
                    sortDirection={sortDirection("goals")}
                  >
                    {sortHeading("goals", "Goals")}
                  </TableCell>
                  <TableCell
                    align="center"
                    sortDirection={sortDirection("assists")}
                  >
                    {sortHeading("assists", "Assists")}
                  </TableCell>
                  <TableCell
                    align="center"
                    sortDirection={sortDirection("cards")}
                  >
                    {sortHeading("cards", "Yellow Cards")}
                  </TableCell>
                  {isGoalkeeper && (
                    <TableCell
                      align="center"
                      sortDirection={sortDirection("saves")}
                    >
                      {sortHeading("saves", "PK Saves")}
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map(
                  ({ match, opponent, matchEvents, lineup, stats }) => (
                    <TableRow
                      key={match.id}
                      hover
                      sx={{ "&:last-child td": { borderBottom: 0 } }}
                    >
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "block",
                            letterSpacing: ".08em",
                            textTransform: "uppercase",
                          }}
                        >
                          {seasonName(data, match)}
                        </Typography>
                        {match.date && moment(match.date).isValid()
                          ? moment(match.date).format("MMM D, YYYY")
                          : "Date TBD"}
                      </TableCell>
                      <TableCell component="th" scope="row">
                        <Stack direction="row" alignItems="center" gap={1.5}>
                          <OpponentCrest
                            compact
                            url={opponent?.crestUrl}
                            teamId={opponent?.id}
                            teamName={opponent?.name}
                          />
                          <Button
                            component={Link}
                            to={`/match/${encodeURIComponent(match.id)}`}
                            sx={{
                              color: "text.primary",
                              fontWeight: 700,
                              textAlign: "left",
                              textTransform: "none",
                              whiteSpace: "nowrap",
                              flexShrink: 0,
                            }}
                          >
                            {opponentName(data, match)}
                          </Button>
                        </Stack>
                      </TableCell>
                      <TableCell
                        sx={{
                          whiteSpace: "nowrap",
                          color: "primary.main",
                          fontWeight: 700,
                        }}
                      >
                        {displayScore(match)}
                      </TableCell>
                      <TableCell align="center">
                        <MatchResultChip match={match} />
                      </TableCell>
                      <TableCell>
                        {(lineup?.starters.includes(player.id) ||
                          lineup?.bench.includes(player.id)) && (
                          <Typography variant="body2" color="text.secondary">
                            {lineup.starters.includes(player.id)
                              ? "Starting VII"
                              : "Bench"}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {matchEvents.length ? (
                          <Stack gap={0.5}>
                            {matchEvents.map((event) => (
                              <Typography
                                key={event.id}
                                variant="body2"
                                sx={{
                                  whiteSpace: "pre-wrap",
                                  overflowWrap: "anywhere",
                                }}
                              >
                                <strong style={{ textTransform: "uppercase" }}>
                                  {event.minute != null
                                    ? `${event.minute}′ · `
                                    : ""}
                                  {event.ownGoal
                                    ? "Own Goal"
                                    : event.kind.replaceAll("_", " ")}
                                </strong>
                                {event.note ? ` · ${event.note}` : ""}
                              </Typography>
                            ))}
                          </Stack>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell align="center">{stats[0][1]}</TableCell>
                      <TableCell align="center">{stats[1][1]}</TableCell>
                      <TableCell align="center">{stats[3][1]}</TableCell>
                      {isGoalkeeper && (
                        <TableCell align="center">{stats[2][1]}</TableCell>
                      )}
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Stack>
      {canEditClub && bioOpen && (
        <RichTextDialog
          title="Player Bio"
          value={player.bio ?? ""}
          saveLabel="Save Bio"
          onClose={() => setBioOpen(false)}
          onSave={(bio) => {
            update({
              ...data,
              players: data.players.map((item) =>
                item.id === player.id ? { ...item, bio } : item,
              ),
            });
            setBioOpen(false);
          }}
        />
      )}
    </Stack>
  );
}
