import TimelineMarker from "../../components/TimelineMarker";
import { tableStyles } from "../../components/tableStyles";
import PanelHeader from "../../components/PanelHeader";
import RichTextDialog from "../../components/RichTextDialog";
import { storyToHtml } from "../matches/matchStory";
import MatchResultChip from "../../components/MatchResultChip";
import { careerEvents, playerStats } from "./playerStats";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
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
  Tooltip,
  Typography,
} from "@mui/material";
import { PlayerPlaceholder } from "./PlayerCard.styles";
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

type HistorySort =
  | "date"
  | "opponent"
  | "goals"
  | "assists"
  | "cards"
  | "saves";
const statIndex = { goals: 0, assists: 1, saves: 2, cards: 3 } as const;

const filterLabels = {
  goals: "Goals",
  assists: "Assists",
  cards: "Yellow Cards",
  saves: "Penalty Saves",
} as const;
type StatFilter = keyof typeof filterLabels;
const filterKeys = Object.keys(filterLabels) as StatFilter[];

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
  const [filters, setFilters] = useState<StatFilter[]>([]);
  const [historySort, setHistorySort] = useState<HistorySort>("date");
  const [descending, setDescending] = useState(true);

  const isGoalkeeper =
    player.preferredPosition === "GK" || player.secondaryPosition === "GK";
  const events = careerEvents(data).filter(
    (event) => event.playerId === player.id,
  );
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
    .filter(
      (row) =>
        !filters.length ||
        filters.some((key) => row.stats[statIndex[key]][1] > 0),
    )
    .sort((a, b) => {
      const comparison =
        historySort === "date"
          ? a.match.date.localeCompare(b.match.date)
          : historySort === "opponent"
            ? opponentName(data, a.match).localeCompare(
                opponentName(data, b.match),
                undefined,
                {
                  sensitivity: "base",
                  numeric: true,
                },
              )
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
      setDescending(key !== "opponent");
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
    <Stack gap={3} sx={{ pt: 3 }}>
      <Card>
        <CardContent
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          {player.photoUrl ? (
            <Box
              component="img"
              src={player.photoUrl}
              alt={player.name}
              sx={{
                marginRight: 2,
                width: {
                  xs: "75px",
                  sm: "120px",
                  md: "150px",
                },
                height: "auto",
              }}
            />
          ) : (
            <PlayerPlaceholder />
          )}
          <Box
            sx={{
              flex: 1,
            }}
          >
            <Box sx={{ display: "flex" }}>
              <Typography
                sx={{
                  gridArea: "number",
                  color: "#d44f25",
                  fontSize: { xs: 72, md: "100px" },
                  lineHeight: 1,
                  letterSpacing: "-.07em",
                  fontWeight: 900,
                  marginRight: 2,
                  mb: {
                    xs: -2,
                    md: -3,
                  },
                  display: {
                    sm: `block`,
                  },
                }}
              >
                {player.number}
              </Typography>
              <Box>
                <Box>
                  <Typography
                    sx={{
                      fontSize: {
                        xs: 32,
                        md: 42,
                      },
                      fontWeight: 800,
                    }}
                  >
                    {player.name}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 16,
                      textTransform: "uppercase",
                      fontWeight: 700,
                      mt: -1,
                    }}
                  >
                    {player.playerType}{" "}
                    <span style={{ fontWeight: "normal", opacity: 0.6 }}>
                      / {player.preferredPosition}
                    </span>
                  </Typography>
                  {player.dateJoined && (
                    <Typography variant="body2" color="text.secondary">
                      Joined{" "}
                      <time dateTime={player.dateJoined}>
                        {moment(player.dateJoined, "YYYY-MM-DD").format(
                          "MMM D, YYYY",
                        )}
                      </time>
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                marginLeft: 0.5,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 5,
                  transform: "translateY(5px)",
                }}
              >
                {counts
                  .filter(([label]) => label !== "Clean Sheets" || player.playerType === "Goal Keeper")
                  .filter(([label]) => label !== "PK Saves" || isGoalkeeper)
                  .map(([label, count]) => (
                    <Tooltip
                      key={label}
                      title={label === "PK Saves" ? "Penalty Saves" : label}
                      describeChild
                      arrow
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mt: {
                          xs: 0,
                          sm: 1,
                        },
                      }}
                    >
                      <Box>
                        {label === "Goals" ? (
                          <img
                            src={GoalIcon}
                            alt="Goals"
                            style={{
                              marginRight: 8,
                              width: 25,
                              height: 25,
                              transform: "translateY(-1px)",
                            }}
                          />
                        ) : label === "Assists" ? (
                          <img
                            src={AssistIcon}
                            alt="Assists"
                            style={{ marginRight: 8, width: 20, height: 20 }}
                          />
                        ) : label === "PK Saves" ? (
                          <img
                            src={SaveIcon}
                            alt="PK Saves"
                            style={{ marginRight: 8, width: 20, height: 20 }}
                          />
                        ) : label === "Yellow Cards" ? (
                          <img
                            src={CardIcon}
                            alt="Yellow Cards"
                            style={{ marginRight: 8, width: 20, height: 20 }}
                          />
                        ) : label === "Clean Sheets" ? <Typography component="span" variant="caption">Clean Sheets</Typography> : null}

                        <Typography
                          variant="h4"
                          color="primary"
                          sx={{ paddingRight: 1 }}
                        >
                          {count}
                        </Typography>
                      </Box>
                    </Tooltip>
                  ))}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

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
      <Stack>
        <PanelHeader title="Match History">
          <FormControl size="small" sx={{ width: { xs: "100%", sm: 280 } }}>
            <InputLabel id="history-filter-label" shrink>
              Only Matches With
            </InputLabel>
            <Select<StatFilter[]>
              multiple
              displayEmpty
              notched
              labelId="history-filter-label"
              label="Only Matches With"
              value={filters}
              onChange={({ target: { value } }) => {
                setFilters(
                  typeof value === "string"
                    ? filterKeys.filter((key) => value.split(",").includes(key))
                    : value,
                );
              }}
              renderValue={(keys) =>
                keys.length
                  ? keys.map((key) => filterLabels[key]).join(", ")
                  : "All Matches"
              }
            >
              {filterKeys.map((key) => (
                <MenuItem key={key} value={key}>
                  <Checkbox
                    checked={filters.includes(key)}
                    size="small"
                    tabIndex={-1}
                  />
                  {filterLabels[key]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </PanelHeader>
        {!history.length ? (
          <Typography color="text.secondary">
            {filters.length
              ? "No matches with the selected stats."
              : "No match history recorded yet."}
          </Typography>
        ) : (
          <TableContainer
            component={Box}
            sx={{ bgcolor: "background.paper", overflowX: "auto" }}
          >
            <Table sx={{ ...tableStyles, minWidth: isGoalkeeper ? 1080 : 980 }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ whiteSpace: "nowrap" }}
                    sortDirection={sortDirection("date")}
                  >
                    {sortHeading("date", "Date")}
                  </TableCell>
                  <TableCell sortDirection={sortDirection("opponent")}>
                    {sortHeading("opponent", "Opponent")}
                  </TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell align="center">Result</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>Events</TableCell>
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
                      sx={{
                        position: "relative",
                        "&:last-child td": { borderBottom: 0 },
                        "& th a:not(.MuiButton-root)": {
                          position: "relative",
                          zIndex: 1,
                        },
                      }}
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
                            aria-label={`Open match against ${opponentName(data, match)} on ${match.date || "date TBD"}`}
                            sx={{
                              position: "static",
                              "&::after": {
                                content: '""',
                                position: "absolute",
                                inset: 0,
                              },
                              "&:focus-visible::after": {
                                outline: "2px solid",
                                outlineColor: "primary.main",
                                outlineOffset: -2,
                              },
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
                                {event.minute != null && <><TimelineMarker minute={event.minute} compact />{" "}</>}
                                <Tooltip title={event.note?.trim() || ""} describeChild arrow>
                                  <Box component="strong" tabIndex={event.note?.trim() ? 0 : undefined}
                                    sx={{
                                      textTransform: "uppercase",
                                      ...(event.note?.trim() && {
                                        position: "relative", zIndex: 1, cursor: "help",
                                        textDecoration: "underline dotted", textUnderlineOffset: "3px",
                                      }),
                                    }}>
                                    {event.ownGoal ? "Own Goal" : event.kind.replaceAll("_", " ")}
                                  </Box>
                                </Tooltip>
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
