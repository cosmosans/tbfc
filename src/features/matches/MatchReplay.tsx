import { matchPhase } from "./matchClock";
import { compareMatchEvents } from "./matchEventOrder";
import { useEffect, useMemo, useRef, useState } from "react";
import ReplayTimeline from "./ReplayTimeline";
import { Button, NativeSelect, Stack } from "@mui/material";
import {
  isMatchCompleted,
  type ClubData,
  type Match,
  type MatchEvent,
} from "../../model";
import { opponentFor, opponentName } from "../../clubView";
import MatchBanner from "./MatchBanner";
import type { ComponentProps } from "react";
import MatchEventSnackbar from "./MatchEventSnackbar";
import { useGoalSound } from "./useGoalSound";
type Props = {
  data: ClubData;
  match: Match;
  bannerProps: Omit<ComponentProps<typeof MatchBanner>, "data" | "match">;
  publishBarVisible: boolean;
};

export default function MatchReplay(props: Props) {
  const [started, setStarted] = useState<number | null>(null);
  if (props.match.status === "in_progress") return <LiveMatch {...props} />;
  return started === null ? (
    <MatchBanner data={props.data} match={props.match} {...props.bannerProps}>
      {isMatchCompleted(props.match) && (
        <Stack alignItems="center" sx={{ mt: 1 }}>
          <Button size="small" onClick={() => setStarted(performance.now())}>
            Simulate Match
          </Button>
        </Stack>
      )}
    </MatchBanner>
  ) : (
    <Playback {...props} started={started} stop={() => setStarted(null)} />
  );
}

function useTimelineEvents(data: ClubData, match: Match) {
  return useMemo(
    () =>
      data.events
        .filter(
          (event) =>
            event.matchId === match.id &&
            event.minute !== undefined &&
            event.minute >= 0,
        )
        .sort(compareMatchEvents),
    [data.events, match.id],
  );
}

function LiveMatch({ data, match, bannerProps }: Props) {
  const events = useTimelineEvents(data, match);
  const [now, setNow] = useState(Date.now);
  const [position, setPosition] = useState<number | null>(null);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const latestEvent = (events[events.length - 1]?.minute ?? 0) * 60;
  const liveTime = Math.max(matchPhase(match, now)?.seconds ?? 0, latestEvent);
  let displayedMatch = match;
  if (position !== null) {
    const score = { goalsFor: 0, goalsAgainst: 0 };
    for (const event of events) {
      if (event.kind === "goal" && event.minute! * 60 <= position) {
        score[event.team === "opponent" ? "goalsAgainst" : "goalsFor"]++;
      }
    }
    displayedMatch = { ...match, ...score };
  }
  return (
    <MatchBanner
      {...bannerProps}
      data={data}
      match={displayedMatch}
      goalTime={position === null ? bannerProps.goalTime : undefined}
      replaySeconds={position ?? undefined}
    >
      <ReplayTimeline
        opponentName={opponentName(data, match)}
        players={data.players}
        events={events}
        opponentColor={opponentFor(data, match)?.color}
        opponentCrestUrl={opponentFor(data, match)?.crestUrl}
        seconds={position ?? liveTime}
        duration={Math.max(50 * 60, liveTime)}
        onSeek={(target) => setPosition(target >= liveTime ? null : target)}
      />
      {position !== null && (
        <Stack alignItems="center" sx={{ mt: 1 }}>
          <Button size="small" onClick={() => setPosition(null)}>
            Go to live
          </Button>
        </Stack>
      )}
    </MatchBanner>
  );
}

function Playback({
  data,
  match,
  bannerProps,
  publishBarVisible,
  started,
  stop,
}: Props & { started: number; stop: () => void }) {
  const events = useTimelineEvents(data, match);
  const duration = Math.max(50, ...events.map((event) => event.minute!)) * 60;
  const eventTime = (event: MatchEvent) =>
    event.kind === "clean_sheet" ? duration : event.minute! * 60;
  const [seconds, setSeconds] = useState(0);
  const [clock, setClock] = useState({ since: started, offset: 0, speed: 5 });
  function changeSpeed(speed: number) {
    const now = performance.now();
    setClock((previous) => ({
      since: now,
      speed,
      offset:
        previous.offset + ((now - previous.since) * previous.speed) / 1000,
    }));
  }
  const [queue, setQueue] = useState<MatchEvent[]>([]);
  const delivered = useRef(new Set<string>());
  const finished = seconds >= duration;
  const { play, playWhistle } = useGoalSound(
    !finished,
    !!bannerProps.goalSoundEnabled,
  );
  useEffect(() => {
    if (finished) return;
    const timer = window.setInterval(() => {
      setSeconds(
        Math.min(
          duration,
          Math.floor(
            clock.offset +
              ((performance.now() - clock.since) * clock.speed) / 1000,
          ),
        ),
      );
    }, 150);
    return () => window.clearInterval(timer);
  }, [duration, clock, finished]);
  useEffect(() => {
    const due = events.filter(
      (event) =>
        (event.kind === "clean_sheet"
          ? finished
          : event.minute! * 60 <= seconds) && !delivered.current.has(event.id),
    );
    if (!due.length) return;
    for (const event of due) delivered.current.add(event.id);
    setQueue((previous) => [...previous, ...due]);
  }, [events, seconds, finished]);
  useEffect(() => {
    playWhistle.current();
  }, [playWhistle]);
  useEffect(() => {
    if (finished) playWhistle.current();
  }, [finished, playWhistle]);
  const notice = queue[0];
  const [score, setScore] = useState({ goalsFor: 0, goalsAgainst: 0 });
  const [goalTime, setGoalTime] = useState<number>();
  const presented = useRef(new Set<string>());
  function seek(target: number) {
    const before = events.filter((event) => eventTime(event) < target);
    const atTarget = events.filter((event) => eventTime(event) === target);
    const nextScore = { goalsFor: 0, goalsAgainst: 0 };
    for (const event of before) {
      if (event.kind === "goal")
        nextScore[event.team === "opponent" ? "goalsAgainst" : "goalsFor"]++;
    }
    presented.current = new Set(before.map((event) => event.id));
    delivered.current = new Set([
      ...presented.current,
      ...atTarget.map((event) => event.id),
    ]);
    setScore(nextScore);
    setGoalTime(undefined);
    setQueue(atTarget);
    const since = performance.now();
    setClock((previous) => ({ ...previous, since, offset: target }));
    setSeconds(target);
  }
  useEffect(() => {
    if (!notice || presented.current.has(notice.id)) return;
    presented.current.add(notice.id);
    if (notice.kind === "penalty_kick") playWhistle.current();
    if (notice.kind !== "goal") return;
    const field = notice.team === "opponent" ? "goalsAgainst" : "goalsFor";
    setScore((previous) => ({ ...previous, [field]: previous[field] + 1 }));
    if (field === "goalsFor") {
      setGoalTime(performance.now());
      play.current();
    }
  }, [notice, play, playWhistle]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(
      () =>
        setQueue((previous) =>
          previous.filter((event) => event.id !== notice.id),
        ),
      4500,
    );
    return () => window.clearTimeout(timer);
  }, [notice]);
  const opponent = opponentFor(data, match);
  return (
    <>
      <MatchBanner
        {...bannerProps}
        data={data}
        match={
          finished && !notice && presented.current.size === events.length
            ? match
            : { ...match, ...score, status: "in_progress" }
        }
        replaySeconds={seconds}
        goalTime={goalTime}
      >
        <ReplayTimeline
          opponentName={opponentName(data, match)}
          players={data.players}
          opponentColor={opponent?.color}
          opponentCrestUrl={opponent?.crestUrl}
          events={events}
          seconds={seconds}
          duration={duration}
          onSeek={seek}
        />
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={1}
          sx={{ mt: 1 }}
        >
          {!finished && (
            <NativeSelect
              value={clock.speed}
              inputProps={{ "aria-label": "Replay speed" }}
              onChange={(event) => changeSpeed(Number(event.target.value))}
            >
              {[5, 10, 20].map((speed) => (
                <option key={speed} value={speed}>
                  {speed}×
                </option>
              ))}
            </NativeSelect>
          )}
          <Button size="small" onClick={stop}>
            End Simulation
          </Button>
        </Stack>
      </MatchBanner>

      {notice && (
        <MatchEventSnackbar
          key={notice.id}
          notice={notice}
          player={data.players.find((player) => player.id === notice.playerId)}
          opponent={opponentName(data, match)}
          opponentCrestUrl={opponent?.crestUrl}
          creditedTeamColor={
            notice.team === "opponent"
              ? opponent?.color || "#828892"
              : "#CA5126"
          }
          match={match}
          events={events}
          remaining={queue.length - 1}
          publishBarVisible={publishBarVisible}
          onDismiss={() =>
            setQueue((previous) =>
              previous.filter((event) => event.id !== notice.id),
            )
          }
        />
      )}
    </>
  );
}
