import { useLayoutEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import NotesIcon from "@mui/icons-material/Notes";
import type { MatchEvent } from "../../model";
import ball from "../../img/soccer-ball-variant.svg";
import bomb from "../../img/bomb.svg";
import assist from "../../img/cleats.svg";
import card from "../../img/cards.svg";
import penalty from "../../img/penalty-kick.svg";
import gloves from "../../img/gloves.svg";

const icons = { goal: ball, assist, yellow_card: card, penalty_kick: penalty,
  clean_sheet: gloves, penalty_save: gloves, note: null };
const size = 15;

export default function ReplayTimeline({ events, seconds, duration }: {
  events: MatchEvent[]; seconds: number; duration: number;
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
  const markers = events.map(event => {
    const x = Math.max(0, Math.min(width - size, width * event.minute! * 60 / duration - size / 2));
    let row = ends.findIndex(end => end + 2 <= x);
    if (row < 0) row = ends.length;
    ends[row] = x + size;
    const label = event.minute + "′ " + (event.ownGoal ? "own goal" : event.kind.replaceAll("_", " "));
    const icon = event.ownGoal ? bomb : icons[event.kind];
    return <Box key={event.id} component="span" title={label} aria-label={label} role="img"
      sx={{ position: "absolute", left: x, bottom: 13 + row * 17, width: size, height: size,
        lineHeight: 0, opacity: seconds >= event.minute! * 60 ? 1 : 0.65 }}>
      {icon ? <img src={icon} alt="" width={size} height={size} /> : <NotesIcon sx={{ fontSize: size }} />}
    </Box>;
  });
  return <Box ref={track} sx={{ position: "relative", flex: 1, minWidth: 0, pt: ends.length * 17 + "px" }}>
    {markers}
    <Box sx={{ height: 10, border: "1px solid #e0e0e0", transform: "skew(-15deg)", display: "flex" }}>
      <Box sx={{ width: seconds / duration * 100 + "%", bgcolor: "primary.main" }} />
    </Box>
  </Box>;
}
