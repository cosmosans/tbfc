import MatchResultChip from "../../components/MatchResultChip";
import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import moment from "moment";
import type { ClubData, Match } from "../../model";
import { displayScore, issues, scoreResult } from "../../model";
import { opponentFor, opponentName, seasonName } from "../../clubView";
import { matchLocation } from "../../matchLocation";
import OpponentCrest from "../../components/OpponentCrest";
import WhiteKitImage from "../../img/white-front.png";
import BlackKitImage from "../../img/black-front.png";
import CheckIcon from "@mui/icons-material/Check";

type SortColumn = "date" | "opponent" | "score" | "result" | "venue" | "kit";

export default function MatchTable({
  data,
  matches,
  seasonSchedule = false,
  forceCompact = false,
  label = "Match history",
  showSeasonDividers = false,
  showAudit = false,
  onOpen,
}: {
  data: ClubData;
  matches: Match[];
  seasonSchedule?: boolean;
  forceCompact?: boolean;
  label?: string;
  showSeasonDividers?: boolean;
  showAudit?: boolean;
  onOpen: (match: Match) => void;
}) {
  const narrowScreen = useMediaQuery(useTheme().breakpoints.down("lg"));
  const compact = forceCompact || narrowScreen;
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const compareText = (a: string, b: string) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
  const sortedMatches = !sortColumn
    ? matches
    : [...matches].sort((a, b) => {
        let comparison = 0;
        switch (sortColumn) {
          case "date":
            comparison = compareText(a.date, b.date);
            break;
          case "opponent":
            comparison = compareText(
              opponentName(data, a),
              opponentName(data, b),
            );
            break;
          case "score":
            comparison =
              a.goalsFor - b.goalsFor || a.goalsAgainst - b.goalsAgainst;
            break;
          case "result": {
            const rank = (match: Match) =>
              match.status === "scheduled"
                ? -2
                : match.status === "in_progress"
                  ? -1
                  : ({ W: 2, D: 1, L: 0 }[scoreResult(match)] ?? -1);
            comparison = rank(a) - rank(b);
            break;
          }
          case "venue":
            comparison = compareText(matchLocation(a), matchLocation(b));
            break;
          case "kit":
            comparison = compareText(a.kit, b.kit);
            break;
        }
        return (
          (direction === "asc" ? comparison : -comparison) ||
          compareText(b.date, a.date) ||
          compareText(a.id, b.id)
        );
      });
  function header(column: SortColumn, label: string, centered = false) {
    const active = sortColumn === column;
    return (
      <TableCell
        align={centered ? "center" : "left"}
        sortDirection={active ? direction : false}
      >
        <TableSortLabel
          active={active}
          direction={active ? direction : "asc"}
          onClick={() => {
            if (active) setDirection(direction === "asc" ? "desc" : "asc");
            else {
              setSortColumn(column);
              setDirection(
                ["date", "score", "result"].includes(column) ? "desc" : "asc",
              );
            }
          }}
        >
          {label}
        </TableSortLabel>
      </TableCell>
    );
  }
  return (
    <TableContainer
      sx={{
        bgcolor: "background.paper",
        width: "100%",
        maxWidth: "100%",
        overflowX: "auto",
      }}
    >
      <Table
        aria-label={label}
        sx={{
          minWidth: showAudit
            ? { xs: 650, lg: 850 }
            : forceCompact
              ? 0
              : { xs: 0, lg: 850 },
          tableLayout: showAudit ? "auto" : { xs: "fixed", sm: "auto" },
          "& .MuiTableCell-root": { px: { xs: 0.5, sm: 1.5, lg: 2 } },
          "& tr > :first-child": {
            paddingInlineStart: { xs: 1, sm: 1.5, lg: 2 },
          },
          "& tr > :last-child": { paddingInlineEnd: { xs: 1, sm: 1.5, lg: 2 } },
          "& thead th:first-of-type": {
            width: { xs: seasonSchedule ? 57 : "7.75rem", sm: "auto" },
          },
          "& thead th:nth-of-type(3)": {
            width: { xs: seasonSchedule ? 64 : 49, sm: "auto" },
          },
          "& thead th:nth-of-type(4)": {
            width: { xs: seasonSchedule ? 80 : 48, sm: "auto" },
          },
          "& .MuiTableSortLabel-icon": {
            display: { xs: "none", sm: "inline-block" },
          },
        }}
      >
        <TableHead sx={{ bgcolor: "action.hover" }}>
          <TableRow>
            {header("date", "Date")}
            {header("opponent", "Opponent")}
            {header("score", seasonSchedule ? "Score / Kickoff" : "Score")}
            {header("result", "Result", true)}
            {showAudit && (
              <TableCell align="center">Match Audit Complete</TableCell>
            )}
            {!compact && header("venue", "Venue")}
            {!compact && header("kit", "Kit")}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedMatches.map((match, index) => {
            const next = sortedMatches[index + 1];
            const endsSeason =
              showSeasonDividers &&
              (!sortColumn || sortColumn === "date") &&
              (next
                ? seasonName(data, match) !== seasonName(data, next)
                : true);
            const opponent = opponentFor(data, match);
            return (
              <TableRow
                key={match.id}
                hover
                onClick={() => onOpen(match)}
                sx={{
                  cursor: "pointer",
                  ...(endsSeason
                    ? {
                        "& > td, & > th": {
                          borderBottom: "4px solid",
                          borderBottomColor: "primary.main",
                        },
                      }
                    : {
                        "&:last-child td, &:last-child th": { borderBottom: 0 },
                      }),
                }}
              >
                <TableCell>
                  {!seasonSchedule && (
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.secondary"
                      title={seasonName(data, match)}
                      sx={{
                        display: "block",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        letterSpacing: ".08em",
                        textTransform: "uppercase",
                      }}
                    >
                      {seasonName(data, match)}
                    </Typography>
                  )}
                  {match.date && moment(match.date).isValid()
                    ? moment(match.date).format("MMM D")
                    : "Date TBD"}
                </TableCell>
                <TableCell component="th" scope="row">
                  <Stack
                    direction="row"
                    alignItems="center"
                    gap={{ xs: 0.5, sm: 1.5 }}
                  >
                    <OpponentCrest
                      url={opponent?.crestUrl}
                      compact
                      mobileSize={26}
                      teamId={opponent?.id}
                      teamName={opponent?.name}
                    />
                    <Button
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpen(match);
                      }}
                      aria-label={`Open match against ${opponentName(data, match)}`}
                      sx={{
                        color: "text.primary",
                        fontWeight: 700,
                        textAlign: "left",
                        justifyContent: "flex-start",
                        minWidth: 0,
                        px: { xs: 0, sm: 1 },
                      }}
                    >
                      <Box
                        component="span"
                        title={opponentName(data, match)}
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {opponentName(data, match)}
                      </Box>
                    </Button>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography color="primary" fontWeight={700}>
                    {match.status === "scheduled"
                      ? match.kickoff || "TBD"
                      : displayScore(match)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  {match.status === "scheduled" ? (
                    "Upcoming"
                  ) : (
                    <MatchResultChip match={match} />
                  )}
                </TableCell>
                {showAudit && (
                  <TableCell align="center">
                    {match.matchAuditComplete === true && (
                      <CheckIcon
                        aria-label="Match audit complete"
                        fontSize="small"
                        color="success"
                      />
                    )}
                  </TableCell>
                )}
                {!compact && (
                  <TableCell>
                    <Stack gap={0.5} alignItems="flex-start">
                      <Typography variant="body2" color="text.secondary">
                        {matchLocation(match) || "Venue TBD"}
                      </Typography>
                      {issues(match).length > 0 && (
                        <Chip
                          size="small"
                          color="warning"
                          label="Review Source"
                        />
                      )}
                    </Stack>
                  </TableCell>
                )}
                {!compact && (
                  <TableCell>
                    {match.kit === "White" || match.kit === "Black" ? (
                      <Box
                        component="img"
                        src={
                          match.kit === "White" ? WhiteKitImage : BlackKitImage
                        }
                        alt={`${match.kit} kit`}
                        sx={{
                          width: 30,
                          height: 30,
                          objectFit: "contain",
                          display: "block",
                        }}
                      />
                    ) : (
                      match.kit || "—"
                    )}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
