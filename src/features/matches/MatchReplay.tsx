import { compareMatchEvents } from "./matchEventOrder";
import { useEffect, useMemo, useRef, useState } from "react";
import ReplayTimeline from "./ReplayTimeline";
import { Button, Stack, Typography } from "@mui/material";
import type { ClubData, Match, MatchEvent } from "../../model";
import { opponentFor, opponentName } from "../../clubView";
import MatchBanner from "./MatchBanner";
import type { ComponentProps } from "react";
import MatchEventSnackbar from "./MatchEventSnackbar";
import { useGoalSound } from "./useGoalSound";
type Props = {
  data: ClubData;
  match: Match;
  enabled: boolean;
  bannerProps: Omit<ComponentProps<typeof MatchBanner>, "data" | "match">;
  publishBarVisible: boolean;
};

export default function MatchReplay(props: Props) {
  const [started, setStarted] = useState<number | null>(null);
  return started === null ? (
    <>
      <MatchBanner data={props.data} match={props.match} {...props.bannerProps} />
      {props.enabled && <Button size="small" onClick={() => setStarted(performance.now())}>
        Replay
      </Button>}
    </>
  ) : (
    <Playback {...props} started={started} stop={() => setStarted(null)} />
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
  const events = useMemo(
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
  const duration = Math.max(50, ...events.map((event) => event.minute!)) * 60;
  const [seconds, setSeconds] = useState(0);
  const [queue, setQueue] = useState<MatchEvent[]>([]);
  const delivered = useRef(new Set<string>());
  const finished = seconds >= duration;
  const { play, playWhistle } = useGoalSound(!finished, !!bannerProps.goalSoundEnabled);
  useEffect(() => {
    if (finished) return;
    const timer = window.setInterval(() => {
      setSeconds(
        Math.min(
          duration,
          Math.floor(((performance.now() - started) * 6) / 1000),
        ),
      );
    }, 150);
    return () => window.clearInterval(timer);
  }, [duration, started, finished]);
  useEffect(() => {
    const due = events.filter(
      (event) =>
        event.minute! * 60 <= seconds && !delivered.current.has(event.id),
    );
    if (!due.length) return;
    for (const event of due) delivered.current.add(event.id);
    setQueue((previous) => [...previous, ...due]);
  }, [events, seconds]);
  useEffect(() => {
    playWhistle.current();
  }, [finished, playWhistle]);
  const notice = queue[0];
  const [score, setScore] = useState({ goalsFor: 0, goalsAgainst: 0 });
  const [goalTime, setGoalTime] = useState<number>();
  const presented = useRef(new Set<string>());
  useEffect(() => {
    if (!notice || presented.current.has(notice.id)) return;
    presented.current.add(notice.id);
    if (notice.kind === "penalty_kick") playWhistle.current();
    if (notice.kind !== "goal") return;
    const field = notice.team === "opponent" ? "goalsAgainst" : "goalsFor";
    setScore(previous => ({ ...previous, [field]: previous[field] + 1 }));
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
      <MatchBanner {...bannerProps} data={data}
        match={finished && !notice && presented.current.size === events.length
          ? match : { ...match, ...score, status: "in_progress" }}
        replaySeconds={seconds} goalTime={goalTime} />
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="caption" sx={{ fontVariantNumeric: "tabular-nums" }}>
          {finished ? "Full time" : "Replay · 6×"} · {Math.floor(seconds / 60)}:
          {String(seconds % 60).padStart(2, "0")}
        </Typography>
        <Button size="small" onClick={stop}>
          {finished ? "Close replay" : "Stop replay"}
        </Button>

        <ReplayTimeline events={events} seconds={seconds} duration={duration} />

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
      </Stack>
    </>
  );
}
