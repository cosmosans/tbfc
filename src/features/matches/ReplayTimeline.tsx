import CleanSheetIcon from "../../img/clean.svg";
import { useLayoutEffect, useRef, useState } from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import TimelineMarker from "../../components/TimelineMarker";
import { PlayerNameNumberInline } from "./MatchEventSnackbar";
import OpponentCrest from "../../components/OpponentCrest";
import NotesIcon from "@mui/icons-material/Notes";
import type { MatchEvent, Player } from "../../model";
import ball from "../../img/soccer-ball-variant.svg";
import bomb from "../../img/bomb.svg";
import assist from "../../img/cleats.svg";
import card from "../../img/cards.svg";
import penalty from "../../img/penalty-kick.svg";
import gloves from "../../img/gloves.svg";

const icons = {
  goal: ball,
  assist,
  yellow_card: card,
  penalty_kick: penalty,
  missed_penalty: penalty,
  clean_sheet: CleanSheetIcon,
  penalty_save: gloves,
  note: null,
};
const size = 15;
const iconGap = 3;
const rowHeight = size + iconGap;
const trackHeight = 10;

export default function ReplayTimeline({
  events,
  players,
  seconds,
  duration,
  opponentName,
  opponentColor,
  opponentCrestUrl,
  onSeek,
}: {
  events: MatchEvent[];
  players: Player[];
  seconds: number;
  duration: number;
  opponentName: string;
  opponentColor?: string;
  opponentCrestUrl?: string;
  onSeek: (seconds: number) => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const node = track.current;
    if (!node) return;
    const measure = () => setWidth(node.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const ends: number[] = [];
  const groups = new Map<number, MatchEvent[]>();
  for (const event of events) {
    const minute = event.minute!;
    const group = groups.get(minute);
    if (group) group.push(event);
    else groups.set(minute, [event]);
  }
  const markers = Array.from(groups, ([minute, group]) => {
    const pairedAssists = new Set<string>();
    const markersForMinute = group.flatMap(event => {
      if (pairedAssists.has(event.id)) return [];
      const team = event.team ?? "tbfc";
      const assist = event.kind === "goal" && group.find(candidate =>
        candidate.kind === "assist" && (candidate.team ?? "tbfc") === team &&
        !pairedAssists.has(candidate.id)
      );
      if (!assist) return [{ event, showCrest: true, crestOffset: 0 }];
      pairedAssists.add(assist.id);
      return [
        { event, showCrest: true, crestOffset: (size + iconGap) / 2 },
        { event: assist, showCrest: false, crestOffset: 0 },
      ];
    });
    const groupWidth = size * group.length + iconGap * (group.length - 1);
    const center = (width * minute * 60) / duration;
    const x = Math.max(
      0,
      Math.min(width - groupWidth, center - groupWidth / 2),
    );
    let row = ends.findIndex((end) => end + 2 <= x);
    if (row < 0) row = ends.length;
    ends[row] = x + groupWidth;
    return (
      <Box
        key={minute}
        onClick={() => onSeek(minute * 60)}
        sx={{
          position: "absolute",
          left: x,
          top: trackHeight + iconGap + row * rowHeight,
          display: "flex",
          cursor: "pointer",
          gap: iconGap + "px",
          opacity: seconds >= minute * 60 ? 1 : 0.65,
        }}
      >
        {markersForMinute.map(({ event, showCrest, crestOffset }) => {
          const team = event.team ?? (event.kind === "note" ? undefined : "tbfc");
          const player = players.find(player => player.id === event.playerId);
          const playerLabel = event.opponentPlayerName || player && [player.number && "#" + player.number, player.name].filter(Boolean).join(" ");
          const kind = event.ownGoal ? "own goal" : event.kind.replaceAll("_", " ");
          const teamLabel = team && (team === "tbfc" ? "Turf Burners FC" : opponentName);
          const accent = team === "opponent" ? opponentColor || "#828892" : "primary.main";
          const label = [minute + "′ " + kind, teamLabel, playerLabel].filter(Boolean).join(" · ");
          const icon = event.ownGoal ? bomb : icons[event.kind];
          return (
            <Tooltip key={event.id} arrow placement="bottom"
              enterDelay={180}
              slotProps={{
                tooltip: { sx: { bgcolor: "#060606", color: "#fff", p: 0,
                  borderRadius: 1,
                  boxShadow: "0 4px 14px #0007" } },
                arrow: { sx: { color: teamLabel ? accent : "#060606" } },
              }}
              title={<>
                {teamLabel && <Box sx={{ px: 1.25, py: 0.5, bgcolor: accent,
                  borderTopLeftRadius: 4, borderTopRightRadius: 4,
                  color: team === "tbfc" ? "#000" : "#fff", fontSize: 12, fontWeight: 700, textAlign: "center", textTransform: "capitalize" }}>
                  {teamLabel}
                </Box>}
                <Box sx={{ px: 1.25, py: 0.85 }}>
                  <Typography component="div" sx={{ display: "flex", alignItems: "center", gap: 0.75, fontSize: 13, fontWeight: 700 }}>
                    <TimelineMarker minute={minute} compact /> {kind.toUpperCase()}
                  </Typography>
                  {event.opponentPlayerName && <Typography>{event.opponentPlayerName}</Typography>}
                  {player && <Box sx={{ mt: 0.5 }}>
                    <PlayerNameNumberInline player={player} />
                  </Box>}
                </Box>
              </>}>
              <Box
                component="span"
                role="button"
                tabIndex={0}
                onKeyDown={key => {
                  if (key.key === "Enter" || key.key === " ") {
                    key.preventDefault();
                    onSeek(minute * 60);
                  }
                }}
                aria-label={label}
                sx={{ position: "relative", width: size, height: size, lineHeight: 0 }}
              >
                {team && showCrest && (
                  <Box component="span" sx={{ position: "absolute", left: crestOffset,
                    bottom: size + trackHeight + 2 * (iconGap + row * rowHeight) }}>
                    <OpponentCrest size={size} url={team === "tbfc" ? "/crests/tbfc.png" : opponentCrestUrl} />
                  </Box>
                )}
                {icon ? (
                  <img src={icon} alt="" width={size} height={size} />
                ) : (
                  <NotesIcon sx={{ fontSize: size }} />
                )}
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    );
  });
  return (
    <Box
      ref={track}
      sx={{
        position: "relative",
        flex: 1,
        minWidth: 0,
        margin: `0 auto`,
        mt: 3,
        maxWidth: `700px`,
        py: ends.length * rowHeight + "px",
      }}
    >
      <Box sx={{ position: "relative" }}>
      {markers}
      <Box
        sx={(theme) => ({
          height: trackHeight,
          boxSizing: "border-box",
          border: `1px solid ${theme.palette.primary.main}`,
          transform: "skew(-15deg)",
          display: "flex",
        })}
      >
        <Box
          sx={{
            width: (seconds / duration) * 100 + "%",
            bgcolor: "primary.main",
          }}
        />
      </Box>
      <Box
        component="input"
        type="range"
        min={0}
        max={duration}
        step={1}
        value={seconds}
        aria-label="Seek match timeline"
        aria-valuetext={
          Math.floor(seconds / 60) + " minutes " + (seconds % 60) + " seconds"
        }
        onChange={(event) => onSeek(Number(event.target.value))}
        sx={{
          position: "absolute",
          top: -4,
          left: 0,
          width: "100%",
          height: 17,
          m: 0,
          opacity: 0,
          cursor: "pointer",
        }}
      />
      </Box>
    </Box>
  );
}
