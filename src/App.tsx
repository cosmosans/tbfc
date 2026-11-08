import { eventOnlyPlayerData } from "./playerData";
import MatchNavigation from "./features/matches/MatchNavigation";
import { isTurfbotReport } from "./features/matches/reportAttribution";
import PlayerDetail from "./features/roster/PlayerDetail";
import { readDraft, writeDraft } from "./localDraft";
import { backupMatchesLive } from "./backupCompare";
import ClubDataSkeleton from "./components/ClubDataSkeleton";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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
  Typography,
} from "@mui/material";
import type { ClubData, Match, MatchEvent } from "./model";
import { issues } from "./model";
import { defaultLineup, exportData, loadData } from "./store";
import { opponentFor, opponentName } from "./clubView";
import AppHeader from "./components/AppHeader";
import AdminPanel from "./components/AdminPanel";
import DataTransferDialog from "./components/DataTransferDialog";
import { useGoalSound } from "./features/matches/useGoalSound";
import MatchEventSnackbar from "./features/matches/MatchEventSnackbar";
import MatchBanner from "./features/matches/MatchBanner";
import SchedulePage from "./features/schedule/SchedulePage";
import MatchEventPage from "./features/matches/MatchEventPage";
import MatchHistory from "./features/matches/MatchHistory";
import PrivateScrapbook from "./features/matches/PrivateScrapbook";
import { matchTabs, normalizeMatchTab } from "./features/matches/matchTabs";
import { matchAtTime } from "./features/matches/matchClock";
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
import { canEditClub, setManageModeAccess } from "./editAccess";
import { fetchClubData, fetchMatchEvents, publishClubData } from "./remoteData";
import FlameIcon from "./img/flame-white.svg";

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
  league: "",
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
  const manageModeKey = "tbfc-manage-mode";
  const [sourceData, setData] = useState<ClubData>(loadData);
  const [clockTime, setClockTime] = useState(Date.now);
  const data = useMemo(
    () => ({
      ...sourceData,
      matches: sourceData.matches.map((match) => matchAtTime(match, clockTime)),
    }),
    [sourceData, clockTime],
  );
  const [syncState, setSyncState] = useState<
    "loading" | "ready" | "empty" | "error"
  >("loading");
  const [syncMessage, setSyncMessage] = useState("");
  const [dirty, setDirty] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const editVersion = useRef(0);
  const revision = useRef(0);
  const saveQueue = useRef(Promise.resolve());
  useEffect(() => {
    let active = true;
    void (async () => {
      let restoreManageMode = false;
      if (window.localStorage.getItem(manageModeKey) === "on") {
        try {
          const response = await fetch("/api/admin/session", {
            credentials: "same-origin",
            cache: "no-store",
          });
          if (response.ok) {
            const session = await response.json();
            restoreManageMode = session.authenticated === true;
            if (!restoreManageMode) window.localStorage.removeItem(manageModeKey);
          }
        } catch {
          // Keep the preference until the session can be checked again.
        }
      }
      if (!active) return;
      if (restoreManageMode) {
        setManageModeAccess(true, true);
        setAdminAuthenticated(true);
        setManageMode(true);
      }
      const draft = canEditClub
        ? await readDraft().catch(() => undefined)
        : undefined;
      if (!active) return;
      if (draft) {
        setData(eventOnlyPlayerData(draft.data));
        revision.current = draft.revision;
        setDirty(draft.dirty);
      }
      try {
        const remote = await fetchClubData();
        if (!active) return;
        if (!draft?.dirty) {
          revision.current = remote.revision;
          if (remote.data) setData(remote.data);
        }
        setSyncState(remote.data ? "ready" : "empty");
      } catch (error) {
        if (!active) return;
        setSyncMessage(
          error instanceof Error
            ? error.message
            : "Could not connect to the shared database.",
        );
        setSyncState("error");
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  const matchRoute = matchPath("/match/:id", location.pathname);
  const playerRoute = matchPath("/player/:id", location.pathname);
  const selectedPlayer = data.players.find(
    (player) => player.id === playerRoute?.params.id,
  );
  const teamRoute = matchPath("/team/:id", location.pathname);
  const page =
    (Object.keys(pagePaths) as Page[]).find(
      (key) => pagePaths[key] === location.pathname,
    ) ?? null;
  const [season, setSeason] = useState("All seasons");
  const [editing, setEditing] = useState<Match | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newMatch, setNewMatch] = useState<Match>(blankMatch);
  const requestedTab = new URLSearchParams(location.search).get("tab");
  const activeDetailTab = matchTabs.indexOf(normalizeMatchTab(requestedTab));
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
  const [adminBackupOpen, setAdminBackupOpen] = useState(false);
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [manageMode, setManageMode] = useState(false);
  const [backupMessage, setBackupMessage] = useState("");

  async function changeManageMode(enabled: boolean) {
    if (enabled) {
      await saveQueue.current.catch(() => undefined);
      const remote = await fetchClubData();
      if (!remote.admin || !remote.data)
        throw new Error("Admin session has expired. Sign in again.");
      const draft = await readDraft().catch(() => undefined);
      if (draft?.dirty) {
        revision.current = draft.revision;
        setData(eventOnlyPlayerData(draft.data));
        setDirty(true);
      } else {
        revision.current = remote.revision;
        setData(remote.data);
        setDirty(false);
      }
      setManageModeAccess(true, true);
      setManageMode(true);
      window.localStorage.setItem(manageModeKey, "on");
      setSyncMessage("");
    } else {
      setManageModeAccess(false, false);
      setManageMode(false);
      window.localStorage.removeItem(manageModeKey);
      setDirty(false);
      await saveQueue.current.catch(() => undefined);
      const remote = await fetchClubData();
      revision.current = remote.revision;
      if (remote.data) setData(remote.data);
    }
  }

  function changeAdminAuthentication(authenticated: boolean) {
    setAdminAuthenticated(authenticated);
    if (!authenticated) window.localStorage.removeItem(manageModeKey);
    if (!authenticated && manageMode) void changeManageMode(false);
  }

  useEffect(() => {
    if (!manageMode) return;
    const check = () => {
      void fetch("/api/admin/session", {
        credentials: "same-origin",
        cache: "no-store",
      })
        .then((response) => response.json())
        .then((status) => {
          if (!status.authenticated) changeAdminAuthentication(false);
        })
        .catch(() => undefined);
    };
    const timer = window.setInterval(check, 60_000);
    window.addEventListener("focus", check);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", check);
    };
  }, [manageMode]);

  function update(next: ClubData) {
    if (!canEditClub) return;
    editVersion.current += 1;
    setData(next);
    setDirty(true);
    saveQueue.current = saveQueue.current
      .catch(() => undefined)
      .then(() =>
        writeDraft({ data: next, revision: revision.current, dirty: true }),
      );
    void saveQueue.current.catch((error) => {
      setSyncMessage(
        `Local draft could not be saved: ${error instanceof Error ? error.message : String(error)}. Export a backup before refreshing.`,
      );
    });
  }
  useEffect(() => {
    const tick = () => setClockTime(Date.now());
    tick();
    const timer = window.setInterval(tick, 60_000);
    window.addEventListener("focus", tick);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", tick);
    };
  }, []);
  const viewedMatchId = matchRoute?.params.id;
  const goalSound = useGoalSound(viewedMatchId);
  const currentEvents = useRef(sourceData.events);
  useLayoutEffect(() => {
    currentEvents.current = sourceData.events;
  }, [sourceData.events]);
  const [notices, setNotices] = useState<MatchEvent[]>([]);
  const matchNotices = notices.filter(
    (event) => event.matchId === viewedMatchId,
  );
  const notice = matchNotices[0];
  const noticePlayer =
    notice && data.players.find((player) => player.id === notice.playerId);
  const [goalBurst, setGoalBurst] = useState<{
    matchId: string;
    started: number;
  } | null>(null);
  useEffect(() => {
    const matchId = viewedMatchId;
    if (!matchId) return;
    const previewGoal = (key: KeyboardEvent) => {
      if (
        key.key.toLowerCase() !== "g" ||
        key.repeat ||
        key.isComposing ||
        key.ctrlKey ||
        key.metaKey ||
        key.altKey ||
        key.defaultPrevented
      )
        return;
      if (
        key.target instanceof HTMLElement &&
        (key.target.isContentEditable ||
          key.target.closest(
            "input, textarea, select, [role=textbox], [role=dialog]",
          ))
      )
        return;
      const scorer =
        data.players.find((player) => player.active && player.number) ??
        data.players[0];
      const started = performance.now();
      const sample: MatchEvent = {
        id: `preview-${started}`,
        matchId,
        kind: "goal",
        team: "tbfc",
        playerId: scorer?.id,
        minute: 23,
        note: "Preview goal — curled into the top corner.",
      };
      setNotices((queue) => [...queue, sample]);
      goalSound.current();
      setGoalBurst({ matchId, started });
    };
    window.addEventListener("keydown", previewGoal);
    return () => window.removeEventListener("keydown", previewGoal);
  }, [viewedMatchId, data.players, goalSound]);

  console.log(notice);
  useEffect(() => {
    if (!goalBurst) return;
    const timer = window.setTimeout(() => setGoalBurst(null), 5200);
    return () => window.clearTimeout(timer);
  }, [goalBurst]);
  useEffect(() => {
    if (manageMode || dirty) return;
    let active = true;
    let loading = false;
    const refresh = async () => {
      if (loading || document.visibilityState === "hidden") return;
      loading = true;
      try {
        if (viewedMatchId && syncState === "ready") {
          const { match, events } = await fetchMatchEvents(viewedMatchId);
          if (!active) return;
          const known = new Set(
            currentEvents.current
              .filter((event) => event.matchId === viewedMatchId)
              .map((event) => event.id),
          );
          const additions = events.filter((event) => !known.has(event.id));
          if (additions.length)
            setNotices((previous) => [...previous, ...additions]);
          if (
            additions.some(
              (event) => event.kind === "goal" && event.team !== "opponent",
            )
          ) {
            goalSound.current();
            setGoalBurst({
              matchId: viewedMatchId,
              started: performance.now(),
            });
          }
          setData((current) => ({
            ...current,
            events: [
              ...current.events.filter(
                (event) => event.matchId !== viewedMatchId,
              ),
              ...events,
            ],
            matches: match
              ? current.matches.map((existing) =>
                  existing.id === viewedMatchId ? match : existing,
                )
              : current.matches,
          }));
          return;
        }
        const remote = await fetchClubData();
        if (active && remote.data) {
          revision.current = remote.revision;
          setData(remote.data);
          setSyncState("ready");
        }
      } catch {
        // Keep the last available match data and retry at the next interval.
      } finally {
        loading = false;
      }
    };
    const timer = window.setInterval(
      () => void refresh(),
      viewedMatchId ? 30_000 : 60_000,
    );
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [manageMode, dirty, viewedMatchId, syncState, goalSound]);
  async function publishCurrentData() {
    if (!canEditClub || publishing) return;
    setPublishing(true);
    const version = editVersion.current;
    try {
      await saveQueue.current;
      revision.current = await publishClubData(data, revision.current);
      if (version === editVersion.current) {
        await writeDraft({ data, revision: revision.current, dirty: false });
        setDirty(false);
      }
      setSyncState("ready");
      setSyncMessage("");
    } catch (error) {
      setSyncMessage(
        error instanceof Error ? error.message : "Could not publish club data.",
      );
    } finally {
      setPublishing(false);
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
  useEffect(() => {
    if (!selected || !requestedTab) return;
    const canonical = normalizeMatchTab(
      requestedTab,
      selected.status === "scheduled",
    );
    if (requestedTab === canonical) return;
    const params = new URLSearchParams(location.search);
    params.set("tab", canonical);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [selected, requestedTab, location.pathname, location.search, navigate]);
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
        matchTab={
          selected
            ? normalizeMatchTab(requestedTab, selected.status === "scheduled")
            : undefined
        }
        matchTabOptions={
          selected?.status === "scheduled"
            ? ["lineup", "matchboard"]
            : selected
              ? matchTabs
              : undefined
        }
        onMatchTabChange={(tab) => {
          const index = matchTabs.indexOf(tab);
          if (index >= 0) setActiveDetailTab(index);
        }}
        onBack={
          playerRoute
            ? () => navigate("/roster")
            : teamRoute
              ? () => navigate("/teams")
              : matchRoute
                ? () => navigate("/schedule")
                : undefined
        }
        page={
          playerRoute
            ? "roster"
            : page === "seasons"
              ? "stats"
              : teamRoute
                ? "teams"
                : matchRoute
                  ? "schedule"
                  : (page ?? "matches")
        }
        onAdmin={() => setAdminBackupOpen(true)}
        onNavigate={(next) => navigate(pagePaths[next])}
      />
      <Container
        maxWidth={false}
        sx={{
          pt: 0,
          pb: `calc(${canEditClub && dirty ? 164 : 82}px + env(safe-area-inset-bottom, 0px))`,
          px: 0,
        }}
      >
        {canEditClub && dirty && (
          <Box
            component="aside"
            aria-label="Unpublished changes"
            sx={{
              position: "fixed",
              left: 0,
              right: 0,
              bottom: "calc(63px + env(safe-area-inset-bottom, 0px))",
              zIndex: (theme) => theme.zIndex.appBar + 1,
              bgcolor: "#ffad45",
              color: "#21150a",
              boxShadow: "0 -3px 14px #0005",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: { xs: 1.5, sm: 4 },
              px: 1.5,
              py: 1,
            }}
          >
            <Box role="status">
              <Typography fontWeight={800} lineHeight={1.2}>
                Unpublished changes
              </Typography>
              <Typography variant="body2">
                Only visible on this device.
              </Typography>
            </Box>
            <Button
              variant="contained"
              disabled={publishing}
              onClick={() => void publishCurrentData()}
              sx={{
                bgcolor: "#CA5126",
                color: "#fff",
                minHeight: 44,
                flexShrink: 0,
                "&:hover": { bgcolor: "#d75f33" },
              }}
            >
              <img
                src={FlameIcon}
                alt=""
                style={{ marginRight: 10, height: 20 }}
              />
              {publishing ? "Publishing…" : "Publish"}
            </Button>
          </Box>
        )}
        {syncState === "empty" && (
          <Alert
            severity="warning"
            sx={{ mb: 2 }}
            action={
              canEditClub ? (
                <Button onClick={() => void publishCurrentData()}>
                  Publish This Browser’S Data
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
            Shared database unavailable. Showing locally available data.{" "}
            {syncMessage}
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
        {syncState === "loading" ? (
          <ClubDataSkeleton
            view={
              playerRoute
                ? "roster"
                : matchRoute
                  ? "match"
                  : teamRoute
                    ? "team"
                    : (page ?? "matches")
            }
          />
        ) : playerRoute ? (
          selectedPlayer ? (
            <PlayerDetail
              key={selectedPlayer.id}
              player={selectedPlayer}
              data={data}
              update={update}
            />
          ) : (
            <Alert severity="warning">Player not found. </Alert>
          )
        ) : matchRoute && !selected ? (
          <Alert severity="warning">
            Match not found.{" "}
            <Button onClick={() => navigate("/schedule")}>Open Schedule</Button>
          </Alert>
        ) : teamRoute && !selectedTeam ? (
          <Alert severity="warning">
            Team not found.{" "}
            <Button onClick={() => navigate("/teams")}>Open Teams</Button>
          </Alert>
        ) : selectedTeam ? (
          <TeamDetail
            data={data}
            team={selectedTeam}
            onOpenMatch={(match) =>
              navigate(`/match/${encodeURIComponent(match.id)}`)
            }
          />
        ) : selected ? (
          selected.status === "scheduled" ? (
            <MatchEventPage
              key={selected.id}
              goalTime={
                goalBurst?.matchId === selected.id
                  ? goalBurst.started
                  : undefined
              }
              data={data}
              match={selected}
              update={update}
              onEdit={
                canEditClub ? () => setEditing({ ...selected }) : undefined
              }
            />
          ) : (
            <>
              <MatchBanner
                goalTime={
                  goalBurst?.matchId === selected.id
                    ? goalBurst.started
                    : undefined
                }
                data={data}
                match={selected}
                detail
                onEdit={
                  canEditClub ? () => setEditing({ ...selected }) : undefined
                }
              />
              <MatchNavigation matches={data.matches} match={selected} />
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
              {activeDetailTab === 2 && (
                <MatchHistory
                  key={selected.id}
                  match={selected}
                  onSavePhotos={
                    canEditClub
                      ? (photos) =>
                          update({
                            ...data,
                            matches: data.matches.map((match) =>
                              match.id === selected.id
                                ? { ...match, photos }
                                : match,
                            ),
                          })
                      : undefined
                  }
                  onSaveReport={
                    canEditClub
                      ? (report) =>
                          update({
                            ...data,
                            matches: data.matches.map((match) =>
                              match.id === selected.id
                                ? {
                                    ...match,
                                    report,
                                    reportAuthor:
                                      report && isTurfbotReport(match)
                                        ? "turfbot"
                                        : undefined,
                                  }
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
                <PrivateScrapbook
                  key={selected.id}
                  matchId={selected.id}
                  players={data.players}
                />
              )}
              {activeDetailTab === 4 && (
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
                  sx={(theme) => ({
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "minmax(0, 1fr)",
                      lg: nextLineup
                        ? "repeat(2, minmax(0, 1fr))"
                        : "minmax(0, 1fr)",
                    },
                    gap: 3,
                    alignItems: { xs: "start", lg: "stretch" },
                    [theme.breakpoints.down("lg")]: {
                      "& .lineup-pitch > div": {
                        minHeight: nextLineup?.bench.length ? 450 : 290,
                        aspectRatio: "1.9",
                      },
                    },
                    [theme.breakpoints.up("lg")]: {
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
                    },
                  })}
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
                        Edit Lineup
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
      {notice && selected && (
        <MatchEventSnackbar
          key={notice.id}
          notice={notice}
          player={noticePlayer}
          opponent={opponentName(data, selected)}
          opponentCrestUrl={opponentFor(data, selected)?.crestUrl}
          creditedTeamColor={notice.team === "opponent"
            ? opponentFor(data, selected)?.color || "#828892"
            : "#CA5126"}
          match={selected}
          events={data.events}
          remaining={matchNotices.length - 1}
          publishBarVisible={canEditClub && dirty}
          onDismiss={() => setNotices(queue => queue.filter(event => event !== notice))}
        />
      )}
      {canEditClub && (
        <MatchDialog
          open={!!editing || showNew}
          match={editing ?? newMatch}
          matches={data.matches}
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
      <AdminPanel
        open={adminBackupOpen}
        onClose={() => setAdminBackupOpen(false)}
        authenticated={adminAuthenticated}
        manageMode={manageMode}
        onAuthChange={changeAdminAuthentication}
        onManageModeChange={changeManageMode}
        onBackupTools={() => {
          setAdminBackupOpen(false);
          setBackupOpen(true);
        }}
      />
      {canEditClub && (
        <DataTransferDialog
          open={backupOpen}
          onClose={() => setBackupOpen(false)}
          onDownload={() => exportData(data)}
          onRestore={async (backup) => {
            const restored = {
              ...backup,
              locations: backup.locations ?? [],
              standings: backup.standings ?? [],
            };
            await saveQueue.current.catch(() => undefined);
            const remote = await fetchClubData();
            if (remote.data && backupMatchesLive(restored, remote.data)) {
              await writeDraft({
                data: remote.data,
                revision: remote.revision,
                dirty: false,
              });
              revision.current = remote.revision;
              editVersion.current += 1;
              setData(remote.data);
              setDirty(false);
              setSyncMessage("");
              setBackupMessage(
                "Backup matches live data. Loaded the latest production copy.",
              );
            } else {
              await writeDraft({
                data: restored,
                revision: revision.current,
                dirty: true,
              });
              editVersion.current += 1;
              setData(restored);
              setDirty(true);
              setBackupMessage(
                "Backup restored as a local draft. It differs from live data; review before publishing.",
              );
            }
            navigate("/");
          }}
        />
      )}
    </>
  );
}
