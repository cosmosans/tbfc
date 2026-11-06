import { useEffect, useMemo, useRef, useState } from "react";
import {
  Navigate,
  Link,
  matchPath,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import type { ClubData, Match } from "./model";
import { issues } from "./model";
import { defaultLineup, exportData, loadData, saveData } from "./store";
import { opponentFor, opponentName, orderedSeasons } from "./clubView";
import AppHeader from "./components/AppHeader";
import DataTransferDialog from "./components/DataTransferDialog";
import MatchBanner from "./features/matches/MatchBanner";
import SchedulePage from "./features/schedule/SchedulePage";
import MatchEventPage from "./features/matches/MatchEventPage";
import MatchHistory from "./features/matches/MatchHistory";
import MatchDialog from "./features/matches/MatchDialog";
import Events from "./features/matches/Events";
import LineupEditor from "./features/lineup/LineupEditor";
import LineupPitch from "./features/lineup/LineupPitch";
import StandingsWidget from "./features/standings/StandingsWidget";
import Matchboard from "./features/board/Matchboard";
import Stats from "./features/stats/Stats";
import Roster from "./features/roster/Roster";
import Teams from "./features/teams/Teams";
import TeamDetail from "./features/teams/TeamDetail";
import Locations from "./features/locations/Locations";
import { splitMatchLocation } from "./matchLocation";
import { canEditClub } from "./editAccess";
import { fetchClubData, publishClubData } from "./remoteData";

type Page =
  | "matches"
  | "schedule"
  | "stats"
  | "roster"
  | "tactics"
  | "teams"
  | "locations"
  | "seasons";
const pagePaths: Record<Page, string> = {
  matches: "/",
  schedule: "/schedule",
  stats: "/stats",
  roster: "/roster",
  tactics: "/tactics",
  teams: "/teams",
  locations: "/locations",
  seasons: "/seasons",
};
const blankMatch = (): Match => ({
  id: crypto.randomUUID(),
  status: "scheduled",
  season: "",
  competition: "",
  date: new Date().toISOString().slice(0, 10),
  opponent: "",
  venue: "",
  pitch: undefined,
  kickoff: "",
  homeAway: undefined,
  resultLabel: "",
  goalsFor: 0,
  goalsAgainst: 0,
  shootoutFor: null,
  shootoutAgainst: null,
  scoreRaw: "",
  kit: "",
  scorerNotes: "",
  report: "",
});

export default function App() {
  const [data, setData] = useState<ClubData>(loadData);
  const [syncState, setSyncState] = useState<
    "loading" | "ready" | "empty" | "error"
  >("loading");
  const [syncMessage, setSyncMessage] = useState("");
  const revision = useRef(0);
  const saveQueue = useRef(Promise.resolve());
  useEffect(() => {
    let active = true;
    fetchClubData()
      .then((remote) => {
        if (!active) return;
        revision.current = remote.revision;
        if (remote.data) {
          setData(remote.data);
          setSyncState("ready");
        } else {
          setSyncState("empty");
        }
      })
      .catch((error) => {
        if (!active) return;
        setSyncMessage(
          error instanceof Error
            ? error.message
            : "Could not connect to the shared database.",
        );
        setSyncState("error");
      });
    return () => {
      active = false;
    };
  }, []);
  const navigate = useNavigate();
  const location = useLocation();
  const matchRoute = matchPath("/match/:id", location.pathname);
  const teamRoute = matchPath("/team/:id", location.pathname);
  const page =
    (Object.keys(pagePaths) as Page[]).find(
      (key) => pagePaths[key] === location.pathname,
    ) ?? null;
  const [season, setSeason] = useState(
    () => orderedSeasons(data, true)[0]?.id ?? "All seasons",
  );
  const [editing, setEditing] = useState<Match | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newMatch, setNewMatch] = useState<Match>(blankMatch);
  const matchTabs = ["history", "events", "lineup", "board"];
  const requestedTab = new URLSearchParams(location.search).get("tab");
  const activeDetailTab = Math.max(
    0,
    matchTabs.indexOf(requestedTab ?? "history"),
  );
  function setActiveDetailTab(index: number) {
    navigate(
      index === 0
        ? location.pathname
        : `${location.pathname}?tab=${matchTabs[index]}`,
      { replace: true },
    );
  }
  const [tacticsMatchId, setTacticsMatchId] = useState<string | null>(null);
  const [backupOpen, setBackupOpen] = useState(false);
  const [backupMessage, setBackupMessage] = useState("");

  function update(next: ClubData) {
    if (!canEditClub) return;
    setData(next);
    saveData(next);
    if (syncState === "ready") {
      saveQueue.current = saveQueue.current
        .catch(() => undefined)
        .then(async () => {
          revision.current = await publishClubData(next, revision.current);
          setSyncMessage("");
        })
        .catch((error) => {
          setSyncMessage(
            error instanceof Error
              ? error.message
              : "Could not save to the shared database.",
          );
        });
    }
  }
  async function publishCurrentData() {
    try {
      revision.current = await publishClubData(data, revision.current);
      setSyncState("ready");
      setSyncMessage("");
    } catch (error) {
      setSyncMessage(
        error instanceof Error ? error.message : "Could not publish club data.",
      );
    }
  }
  const upcoming = useMemo(
    () =>
      data.matches
        .filter((m) => m.status === "scheduled")
        .sort(
          (a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id),
        ),
    [data.matches],
  );
  const selected = data.matches.find((m) => m.id === matchRoute?.params.id);
  const selectedTeam = data.opponents.find(
    (team) => team.id === teamRoute?.params.id,
  );
  const currentDate = new Date();
  const today = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
  const nextMatch = upcoming.find((match) => match.date >= today);
  const nextLineup = nextMatch
    ? (data.lineups.find((lineup) => lineup.matchId === nextMatch.id) ??
      defaultLineup(nextMatch.id))
    : null;
  const tacticsMatches = [
    ...(nextMatch ? [nextMatch] : []),
    ...data.matches
      .filter((match) => match.status !== "scheduled")
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5),
  ];
  const tacticsMatch =
    tacticsMatches.find((match) => match.id === tacticsMatchId) ??
    tacticsMatches[0];

  function saveMatch(match: Match) {
    if (!canEditClub) return;
    const existing = data.opponents.find(
      (o) =>
        o.id === match.opponentId ||
        o.name.toLowerCase() === match.opponent.trim().toLowerCase(),
    );
    const opponent = existing ?? {
      id: crypto.randomUUID(),
      name: match.opponent.trim(),
      crestUrl: "",
      color: "",
      notes: "",
    };
    const existingSeason = data.seasons.find(
      (s) =>
        s.id === match.seasonId ||
        s.name.toLowerCase() === match.season.trim().toLowerCase(),
    );
    const seasonRecord = existingSeason ?? {
      id: crypto.randomUUID(),
      name: match.season.trim(),
      notes: "",
    };
    const linked = {
      ...match,
      ...splitMatchLocation(match.venue, match.pitch),
      opponentId: opponent.id,
      opponent: opponent.name,
      seasonId: seasonRecord.id,
      season: seasonRecord.name,
    };
    const next = {
      ...data,
      opponents: existing ? data.opponents : [...data.opponents, opponent],
      seasons: existingSeason ? data.seasons : [...data.seasons, seasonRecord],
      matches: data.matches.some((m) => m.id === match.id)
        ? data.matches.map((m) => (m.id === match.id ? linked : m))
        : [...data.matches, linked],
    };
    update(next);
    setEditing(null);
    setShowNew(false);
    navigate(`/match/${encodeURIComponent(match.id)}`);
  }

  return (
    <>
      <AppHeader
        page={
          page === "seasons"
            ? "stats"
            : teamRoute
              ? "teams"
              : matchRoute
                ? "schedule"
                : (page ?? "matches")
        }
        onBackup={canEditClub ? () => setBackupOpen(true) : undefined}
        onNavigate={(next) => navigate(pagePaths[next])}
      />
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 } }}>
        {syncState === "loading" && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Loading shared club data…
          </Alert>
        )}
        {syncState === "empty" && (
          <Alert
            severity="warning"
            sx={{ mb: 2 }}
            action={
              canEditClub ? (
                <Button onClick={() => void publishCurrentData()}>
                  Publish this browser’s data
                </Button>
              ) : undefined
            }
          >
            The shared database is empty.{" "}
            {canEditClub
              ? "Review this browser’s records, then publish them for the team."
              : "Club records will appear after the first import."}
          </Alert>
        )}
        {syncState === "error" && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Shared database unavailable. Showing bundled data. {syncMessage}
          </Alert>
        )}
        {syncState !== "error" && syncMessage && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() => setSyncMessage("")}
          >
            {syncMessage}
          </Alert>
        )}
        {backupMessage && (
          <Alert
            severity="success"
            onClose={() => setBackupMessage("")}
            sx={{ mb: 2 }}
          >
            {backupMessage}
          </Alert>
        )}
        {matchRoute && !selected ? (
          <Alert severity="warning">
            Match not found.{" "}
            <Button onClick={() => navigate("/schedule")}>Open schedule</Button>
          </Alert>
        ) : teamRoute && !selectedTeam ? (
          <Alert severity="warning">
            Team not found.{" "}
            <Button onClick={() => navigate("/teams")}>Open teams</Button>
          </Alert>
        ) : selectedTeam ? (
          <TeamDetail
            data={data}
            team={selectedTeam}
            onBack={() => navigate("/teams")}
            onOpenMatch={(match) =>
              navigate(`/match/${encodeURIComponent(match.id)}`)
            }
          />
        ) : selected ? (
          selected.status === "scheduled" ? (
            <MatchEventPage
              key={selected.id}
              data={data}
              match={selected}
              update={update}
              onBack={() => navigate("/schedule")}
              onEdit={
                canEditClub ? () => setEditing({ ...selected }) : undefined
              }
            />
          ) : (
            <>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate("/schedule")}
                sx={{ mb: 2, bgcolor: "#111", color: "#fff" }}
              >
                Back to Schedule
              </Button>
              <MatchBanner
                data={data}
                match={selected}
                detail
                onEdit={
                  canEditClub ? () => setEditing({ ...selected }) : undefined
                }
              />
              {opponentFor(data, selected)?.notes && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <strong>Team intel:</strong>{" "}
                  {opponentFor(data, selected)?.notes}
                </Alert>
              )}
              {issues(selected).map((issue) => (
                <Alert key={issue} severity="warning" sx={{ mt: 2 }}>
                  {issue}. Source row {selected.sourceRow ?? "new"} is preserved
                  for review.
                </Alert>
              ))}
              <Tabs
                value={activeDetailTab}
                onChange={(_, value) => setActiveDetailTab(value)}
                sx={{
                  mt: 3,
                  mb: 2,
                  bgcolor: "#111",
                  px: 2,
                }}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Lineup" />
                <Tab label="Events" />
                <Tab label="Story" />
                <Tab label="Matchboard" />
              </Tabs>
              {activeDetailTab === 2 && (
                <MatchHistory
                  match={selected}
                  onSaveReport={
                    canEditClub
                      ? (report) =>
                          update({
                            ...data,
                            matches: data.matches.map((match) =>
                              match.id === selected.id
                                ? { ...match, report }
                                : match,
                            ),
                          })
                      : undefined
                  }
                />
              )}
              {activeDetailTab === 1 && (
                <Events data={data} match={selected} update={update} />
              )}
              {activeDetailTab === 0 && (
                <LineupEditor data={data} match={selected} update={update} />
              )}
              {activeDetailTab === 3 && (
                <Matchboard data={data} match={selected} update={update} />
              )}
            </>
          )
        ) : page === null ? (
          <Alert severity="warning">
            Page not found.{" "}
            <Button onClick={() => navigate("/")}>Open Matchday</Button>
          </Alert>
        ) : (
          <>
            {page === "matches" && (
              <Stack gap={3} sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "minmax(0, 1fr)",
                      lg: nextLineup
                        ? "repeat(2, minmax(0, 1fr))"
                        : "minmax(0, 1fr)",
                    },
                    gap: 3,
                    alignItems: "stretch",
                    gridAutoRows: "1fr",
                    "& > *": {
                      display: "flex",
                      flexDirection: "column",
                      minWidth: 0,
                    },
                    "& > * > .MuiCard-root": {
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                    },
                    "& .match-banner-content": {
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                    },
                    "& .match-banner-info": {
                      mt: "auto",
                      pt: { xs: 2, sm: 4 },
                    },
                    "& .lineup-pitch": {
                      flex: 1,
                      width: "100%",
                      minWidth: 0,
                      display: "flex",
                      flexDirection: "column",
                    },
                    "& .lineup-pitch > div": { flex: 1 },
                  }}
                >
                  {nextMatch && (
                    <MatchBanner
                      data={data}
                      match={nextMatch}
                      onOpen={() =>
                        navigate(`/match/${encodeURIComponent(nextMatch.id)}`)
                      }
                    />
                  )}
                  {nextMatch && nextLineup && (
                    <Box
                      component={Link}
                      to={`/match/${encodeURIComponent(nextMatch.id)}?tab=lineup`}
                      aria-label={`Open lineup for ${opponentName(data, nextMatch)}`}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "stretch",
                        width: "100%",
                        minWidth: 0,
                        textDecoration: "none",
                        p: 0,
                        border: 0,
                        bgcolor: "transparent",
                        color: "inherit",
                        cursor: "pointer",
                        textAlign: "left",
                        "&:focus-visible": {
                          outline: "3px solid #f47730",
                          outlineOffset: 3,
                        },
                      }}
                    >
                      <LineupPitch
                        data={data}
                        lineup={nextLineup}
                        showTitle={false}
                      />
                    </Box>
                  )}
                </Box>
                <StandingsWidget
                  data={data}
                  update={update}
                  initialSeasonId={nextMatch?.seasonId}
                />
              </Stack>
            )}
            {page === "schedule" && (
              <SchedulePage
                data={data}
                update={update}
                season={season}
                setSeason={setSeason}
                onOpen={(match) => {
                  navigate(`/match/${encodeURIComponent(match.id)}`);
                }}
                onAddFixture={() => {
                  setNewMatch(blankMatch());
                  setShowNew(true);
                }}
                onManageSeasons={() => navigate("/stats")}
              />
            )}
            {page === "tactics" && (
              <Stack gap={2}>
                <Typography
                  variant="h5"
                  sx={{
                    bgcolor: "#111",
                    color: "#fff",
                    px: 2,
                    py: 1,
                    alignSelf: "flex-start",
                  }}
                >
                  Tactics
                </Typography>
                {tacticsMatch ? (
                  <>
                    <FormControl
                      sx={{
                        minWidth: 280,
                        alignSelf: "flex-start",
                        bgcolor: "#111",
                      }}
                    >
                      <InputLabel>Match</InputLabel>
                      <Select
                        label="Match"
                        value={tacticsMatch.id}
                        onChange={(event) =>
                          setTacticsMatchId(event.target.value)
                        }
                      >
                        {tacticsMatches.map((match) => (
                          <MenuItem key={match.id} value={match.id}>
                            {match.date} · {opponentName(data, match)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {canEditClub && (
                      <Button
                        variant="outlined"
                        sx={{ alignSelf: "flex-start" }}
                        onClick={() => {
                          navigate(
                            `/match/${encodeURIComponent(tacticsMatch.id)}?tab=lineup`,
                          );
                        }}
                      >
                        Edit lineup
                      </Button>
                    )}
                    <Matchboard
                      key={tacticsMatch.id}
                      data={data}
                      match={tacticsMatch}
                      update={update}
                    />
                  </>
                ) : (
                  <Alert severity="info">
                    Add a fixture to start a coaching board.
                  </Alert>
                )}
              </Stack>
            )}
            {page === "stats" && (
              <Stats
                data={data}
                update={update}
                openSeason={(id) => {
                  setSeason(id);
                  navigate("/schedule");
                }}
              />
            )}
            {page === "roster" && <Roster data={data} update={update} />}
            {page === "teams" && (
              <Teams
                data={data}
                update={update}
                onOpen={(team) =>
                  navigate(`/team/${encodeURIComponent(team.id)}`)
                }
              />
            )}
            {page === "locations" && <Locations data={data} update={update} />}
            {page === "seasons" && <Navigate to="/stats" replace />}
          </>
        )}
      </Container>
      {canEditClub && (
        <MatchDialog
          open={!!editing || showNew}
          match={editing ?? newMatch}
          teams={data.opponents}
          seasons={data.seasons}
          locations={data.locations}
          onClose={() => {
            setEditing(null);
            setShowNew(false);
          }}
          onSave={saveMatch}
        />
      )}
      {canEditClub && (
        <DataTransferDialog
          open={backupOpen}
          onClose={() => setBackupOpen(false)}
          onDownload={() => exportData(data)}
          onRestore={(backup) => {
            saveData(backup);
            const restored = loadData();
            update(restored);
            navigate("/");
            setBackupMessage(
              syncState === "ready"
                ? "Backup restored. Syncing it to the shared database…"
                : "Backup restored in this browser. Publish it when the shared database is ready.",
            );
          }}
        />
      )}
    </>
  );
}
