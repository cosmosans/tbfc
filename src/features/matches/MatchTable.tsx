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
  Typography,
} from "@mui/material";
import moment from "moment";
import type { ClubData, Match } from "../../model";
import { displayScore, issues, scoreResult } from "../../model";
import { opponentFor, opponentName, seasonName } from "../../clubView";
import { matchLocation } from "../../matchLocation";
import OpponentCrest from "../../components/OpponentCrest";
import WhiteKitImage from "../../img/white-front.png";
import BlackKitImage from "../../img/black-front.png";

export default function MatchTable({
  data,
  matches,
  upcoming = false,
  showSeasonDividers = false,
  onOpen,
}: {
  data: ClubData;
  matches: Match[];
  upcoming?: boolean;
  showSeasonDividers?: boolean;
  onOpen: (match: Match) => void;
}) {
  return (
    <TableContainer sx={{ bgcolor: "background.paper", overflowX: "auto" }}>
      <Table
        aria-label={upcoming ? "Upcoming fixtures" : "Match history"}
        sx={{ minWidth: 850 }}
      >
        <TableHead sx={{ bgcolor: "action.hover" }}>
          <TableRow>
            <TableCell>Season</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Opponent</TableCell>
            <TableCell>{upcoming ? "Kickoff" : "Score"}</TableCell>
            {!upcoming && <TableCell align="center">Result</TableCell>}
            <TableCell>Venue</TableCell>
            <TableCell>{upcoming ? "Home / Away" : "Kit"}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {matches.map((match, index) => {
            const next = matches[index + 1];
            const endsSeason =
              showSeasonDividers &&
              (next
                ? seasonName(data, match) !== seasonName(data, next)
                : !upcoming);
            const opponent = opponentFor(data, match);
            const result = scoreResult(match);
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
                <TableCell
                  sx={{ color: "text.secondary", whiteSpace: "nowrap" }}
                >
                  {seasonName(data, match)}
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  {match.date && moment(match.date).isValid()
                    ? moment(match.date).format("MMM D, YYYY")
                    : "Date TBD"}
                </TableCell>
                <TableCell component="th" scope="row">
                  <Stack direction="row" alignItems="center" gap={1.5}>
                    <OpponentCrest
                      url={opponent?.crestUrl}
                      compact
                      teamId={opponent?.id}
                      teamName={opponent?.name}
                    />
                    <Button
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpen(match);
                      }}
                      aria-label={`Open ${upcoming ? "fixture" : "match"} against ${opponentName(data, match)}`}
                      sx={{
                        color: "text.primary",
                        fontWeight: 700,
                        textAlign: "left",
                        justifyContent: "flex-start",
                        minWidth: 0,
                      }}
                    >
                      {opponentName(data, match)}
                    </Button>
                  </Stack>
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  <Typography color="primary" fontWeight={700}>
                    {upcoming
                      ? match.kickoff || "Time TBD"
                      : displayScore(match)}
                  </Typography>
                </TableCell>
                {!upcoming && (
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={
                        match.status === "in_progress" ? "In Progress" : result
                      }
                      color={
                        match.status === "in_progress"
                          ? "warning"
                          : result === "W"
                            ? "success"
                            : result === "L"
                              ? "error"
                              : "default"
                      }
                    />
                  </TableCell>
                )}
                <TableCell>
                  <Stack gap={0.5} alignItems="flex-start">
                    <Typography variant="body2" color="text.secondary">
                      {matchLocation(match) || "Venue TBD"}
                    </Typography>
                    {!upcoming && issues(match).length > 0 && (
                      <Chip
                        size="small"
                        color="warning"
                        label="Review Source"
                      />
                    )}
                  </Stack>
                </TableCell>
                <TableCell>
                  {upcoming ? (
                    match.homeAway === "home" ? (
                      "Home"
                    ) : match.homeAway === "away" ? (
                      "Away"
                    ) : (
                      "—"
                    )
                  ) : match.kit === "White" || match.kit === "Black" ? (
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
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
