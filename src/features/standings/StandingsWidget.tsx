import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Alert,
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
  Typography,
} from "@mui/material";
import moment from "moment";
import type { ClubData, Opponent, StandingRow } from "../../model";
import { orderedSeasons } from "../../clubView";
import { parseStandingsCsv } from "../../standingsImport";
import { canEditClub } from "../../editAccess";

function TeamMark({ opponent, tbfc }: { opponent?: Opponent; tbfc: boolean }) {
  const image = tbfc ? "/crests/tbfc.png" : opponent?.crestUrl;
  return image ? (
    <Box
      component="img"
      src={image}
      alt=""
      sx={{ width: 30, height: 30, objectFit: "contain", flexShrink: 0 }}
    />
  ) : (
    <Box
      aria-hidden="true"
      sx={{
        width: 20,
        height: 20,
        bgcolor: opponent?.color || "#555",
        border: "1px solid #ffffff66",
        flexShrink: 0,
      }}
    />
  );
}

export default function StandingsWidget({
  data,
  update,
  initialSeasonId,
}: {
  data: ClubData;
  update: (data: ClubData) => void;
  initialSeasonId?: string;
}) {
  const navigate = useNavigate();
  const seasons = orderedSeasons(data, true).filter(
    (season) => season.id === "season-fall-2026",
  );
  const [requestedSeasonId] = useState(initialSeasonId ?? "");
  const seasonId = seasons.some((season) => season.id === requestedSeasonId)
    ? requestedSeasonId
    : (seasons[0]?.id ?? "");
  const [pending, setPending] = useState<StandingRow[] | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const selectedSeason = data.seasons.find((item) => item.id === seasonId);
  const snapshot = data.standings.find((item) => item.seasonId === seasonId);
  async function chooseFile(file?: File) {
    setPending(null);
    setFileName(file?.name ?? "");
    setError("");
    setMessage("");
    if (!file) return;
    try {
      setPending(parseStandingsCsv(await file.text()));
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not read this standings CSV.",
      );
    }
  }
  function apply() {
    if (!seasonId || !pending) return;
    const today = new Date();
    const updatedOn = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    update({
      ...data,
      standings: [
        ...data.standings.filter((item) => item.seasonId !== seasonId),
        { seasonId, updatedOn, rows: pending },
      ],
    });
    setPending(null);
    setFileName("");
    setMessage(`${selectedSeason?.name ?? "Season"} standings updated.`);
  }
  return (
    <Card
      component="section"
      sx={{ bgcolor: "background.paper", border: 0, minWidth: 0 }}
    >
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ md: "center" }}
          gap={2}
          sx={{ p: { xs: 2, sm: 3 }, gap: 2 }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flex: 1,
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                flex: 1,
                fontSize: 24,
                display: "inline-block",
              }}
              color="text.secondary"
            >
              Standings
            </Typography>
            {snapshot && (
              <Typography
                variant="body2"
                sx={{ textTransform: "uppercase", fontSize: 12 }}
                color="text.secondary"
              >
                Updated {moment(snapshot.updatedOn).fromNow()}
              </Typography>
            )}
          </Box>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ sm: "center" }}
            gap={1}
          >
            {canEditClub && (
              <Button
                component="a"
                href="/templates/tbfc-standings-template.csv"
                download="tbfc-standings-template.csv"
                variant="outlined"
              >
                CSV Template
              </Button>
            )}
            {canEditClub && (
              <Button component="label" variant="contained">
                Upload Standings CSV
                <input
                  hidden
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(event) => {
                    void chooseFile(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
              </Button>
            )}
          </Stack>
        </Stack>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {message && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}
        {pending && (
          <Alert
            severity="info"
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={apply}>
                Update Table
              </Button>
            }
          >
            {fileName}: {pending.length} teams ready. Updating replaces the{" "}
            {selectedSeason?.name} table.
          </Alert>
        )}
        {snapshot?.rows.length ? (
          <>
            <TableContainer
              sx={{ overflowX: "auto", bgcolor: "background.paper" }}
            >
              <Table
                aria-label={`${selectedSeason?.name ?? "Season"} standings`}
                sx={{
                  minWidth: 820,
                  "& .MuiTableCell-root": { px: { xs: 1, sm: 1.5, lg: 2 } },
                }}
              >
                <TableHead sx={{ bgcolor: "action.hover" }}>
                  <TableRow
                    sx={{
                      "& th": {
                        color: "text.primary",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      },
                    }}
                  >
                    <TableCell align="center">#</TableCell>
                    <TableCell>Team</TableCell>
                    <TableCell align="right">W</TableCell>
                    <TableCell align="right">L</TableCell>
                    <TableCell align="right">D</TableCell>
                    <TableCell align="right">Scored</TableCell>
                    <TableCell align="right">Allowed</TableCell>
                    <TableCell align="right">Diff</TableCell>
                    <TableCell align="right">PI</TableCell>
                    <TableCell align="right">Pts</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...snapshot.rows]
                    .sort((a, b) => a.rank - b.rank)
                    .map((row, index) => {
                      const tbfc = ["turf burners fc", "tbfc"].includes(
                        row.team.trim().toLowerCase(),
                      );
                      const opponent = data.opponents.find(
                        (item) =>
                          item.name.trim().toLowerCase() ===
                          row.team.trim().toLowerCase(),
                      );
                      const teamUrl = opponent
                        ? `/team/${encodeURIComponent(opponent.id)}`
                        : tbfc
                          ? "/stats"
                          : undefined;
                      const diff = row.pointsScored - row.pointsAllowed;
                      return (
                        <TableRow
                          key={`${row.rank}-${row.team}`}
                          tabIndex={teamUrl ? 0 : undefined}
                          aria-label={
                            teamUrl ? `View ${row.team} stats` : undefined
                          }
                          onClick={(event) => {
                            if ((event.target as HTMLElement).closest("a"))
                              return;
                            if (teamUrl) navigate(teamUrl);
                          }}
                          onKeyDown={(event) => {
                            if (
                              event.target !== event.currentTarget ||
                              !teamUrl
                            )
                              return;
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              navigate(teamUrl);
                            }
                          }}
                          sx={{
                            height: `75px`,
                            cursor: teamUrl ? "pointer" : "default",
                            "&:focus-visible": {
                              outline: "2px solid",
                              outlineColor: "primary.main",
                              outlineOffset: -2,
                            },
                            bgcolor: tbfc ? "#CA51262b" : "background.paper",
                            transition: "background-color 150ms ease",
                            "& td": {
                              borderBottomWidth: index === 3 ? 5 : 1,
                              borderBottomStyle: "solid",
                              borderBottomColor:
                                index === 3 ? "#CA5126" : "divider",
                              py: 1.5,
                            },
                            "&:hover": {
                              backgroundColor: "rgba(255,255,255,.1)",
                            },
                          }}
                        >
                          <TableCell align="center" sx={{ fontWeight: 800 }}>
                            {row.rank}
                          </TableCell>
                          <TableCell>
                            {opponent ? (
                              <Stack
                                component={Link}
                                to={`/team/${encodeURIComponent(opponent.id)}`}
                                direction="row"
                                alignItems="center"
                                gap={1.25}
                                aria-label={`View ${opponent.name} history`}
                                sx={{
                                  width: "fit-content",
                                  color: "inherit",
                                  textDecoration: "none",
                                  px: 0.5,
                                  py: 0.25,
                                  mx: -0.5,
                                  transition: "background-color 150ms ease",
                                  "&:hover": {
                                    bgcolor: "#ffffff14",
                                    textDecoration: "underline",
                                  },

                                  "&:focus-visible": {
                                    outline: "2px solid #f47730",
                                    outlineOffset: 2,
                                  },
                                }}
                              >
                                <TeamMark opponent={opponent} tbfc={false} />
                                <Typography fontWeight={700}>
                                  {row.team}
                                </Typography>
                              </Stack>
                            ) : (
                              <Stack
                                direction="row"
                                alignItems="center"
                                gap={1.25}
                              >
                                <TeamMark tbfc={tbfc} />
                                <Typography fontWeight={tbfc ? 900 : 700}>
                                  {row.team}
                                </Typography>
                              </Stack>
                            )}
                          </TableCell>
                          <TableCell align="right">{row.wins}</TableCell>
                          <TableCell align="right">{row.losses}</TableCell>
                          <TableCell align="right">{row.draws}</TableCell>
                          <TableCell align="right">
                            {row.pointsScored}
                          </TableCell>
                          <TableCell align="right">
                            {row.pointsAllowed}
                          </TableCell>
                          <TableCell align="right">
                            {diff > 0 ? `+${diff}` : diff}
                          </TableCell>
                          <TableCell align="right">{row.pi ?? "—"}</TableCell>
                          <TableCell
                            align="right"
                            sx={{ color: "#fff", fontWeight: 900 }}
                          >
                            {row.rankingPoints}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          <Alert severity="info">
            No standings saved for this season. Upload a CSV to add the table.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
