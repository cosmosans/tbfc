import { useLayoutEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

const Bar = styled(Box)({
  display: "flex",
  width: "100%",
  minHeight: 28,
  overflow: "hidden",
  borderRadius: 0,
  paddingInline: 5,
});
const Segment = styled(Box, {
  shouldForwardProp: (prop) =>
    prop !== "tone" && prop !== "opponentColor" && prop !== "last",
})<{
  tone: "opponent" | "draw" | "resultDraw" | "tbfc" | "win" | "loss";
  opponentColor?: string;
  last?: boolean;
}>(({ tone, opponentColor, last, theme }) => ({
  border: `1px solid rgba(255,255,255,.2)`,
  display: "grid",
  placeItems: "center",
  transform: "skewX(-10deg)",
  minWidth: 46,
  background:
    tone === "win"
      ? theme.palette.success.main
      : tone === "loss"
        ? theme.palette.error.main
        : tone === "opponent"
          ? opponentColor || "#2d5337"
          : tone === "draw"
            ? "#b6b6b6"
            : tone === "resultDraw"
              ? "#4a4a4a"
              : "#db6033",
  color:
    tone === "win" ||
    tone === "draw" ||
    (tone === "opponent" && opponentColor && lightColor(opponentColor))
      ? "#111"
      : "#fff",
  marginRight: last ? 0 : 5,
}));

function lightColor(hex: string) {
  const digits = hex.slice(1);
  const full =
    digits.length === 3
      ? [...digits].map((char) => char + char).join("")
      : digits;
  const rgb = [0, 2, 4].map((index) =>
    Number.parseInt(full.slice(index, index + 2), 16),
  );
  return rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114 > 160;
}

/** Left is the opponent's wins; right is TBFC's wins. */
type HeadToHeadProps = {
  variant?: "headToHead";
  opponentWins: number;
  draws: number;
  tbfcWins: number;
  opponentColor?: string;
  reverse?: boolean;
  animationKey?: string;
  scoreKey?: string;
};
type ResultsProps = {
  variant: "results";
  wins: number;
  draws: number;
  losses: number;
};

export default function RecordBar(props: HeadToHeadProps | ResultsProps) {
  const previous = useRef<{ animationKey?: string; scoreKey?: string } | null>(null);
  const animationEndsAt = useRef(0);
  const animationKey = props.variant === "results" ? undefined : props.animationKey;
  const scoreKey = props.variant === "results" ? undefined : props.scoreKey;
  const scoreChanged = !!scoreKey && previous.current?.animationKey === animationKey &&
    !!previous.current?.scoreKey && previous.current.scoreKey !== scoreKey;
  const animate = scoreChanged ||
    (previous.current?.animationKey === animationKey && Date.now() < animationEndsAt.current);
  useLayoutEffect(() => {
    if (scoreChanged) animationEndsAt.current = Date.now() + 4000;
    else if (previous.current?.animationKey !== animationKey) animationEndsAt.current = 0;
    previous.current = { animationKey, scoreKey };
  }, [animationKey, scoreKey, scoreChanged]);
  const results = props.variant === "results";
  const reverse = !results && props.reverse;
  const counts = results
    ? [props.wins, props.draws, props.losses]
    : reverse
      ? [props.tbfcWins, props.draws, props.opponentWins]
      : [props.opponentWins, props.draws, props.tbfcWins];
  const total = counts.reduce((sum, count) => sum + count, 0);
  const sizes = total ? counts : [1, 1, 1];
  const segmentTransition = animate ? "flex-grow 4s ease" : "none";
  return (
    <Box
      aria-label={
        results
          ? `Record: ${props.wins} wins, ${props.draws} draws, ${props.losses} losses`
          : `Head to head: opponent ${props.opponentWins} wins, ${props.draws} draws, TBFC ${props.tbfcWins} wins`
      }
    >
      <Bar>
        <Segment
          tone={results ? "win" : reverse ? "tbfc" : "opponent"}
          opponentColor={results ? undefined : props.opponentColor}
          sx={{ flex: sizes[0], transition: segmentTransition }}
        >
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, transform: "skewX(10deg)" }}
          >
            {counts[0]}W
          </Typography>
        </Segment>
        <Segment tone={results ? "resultDraw" : "draw"} sx={{ flex: sizes[1], transition: segmentTransition }}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, transform: "skewX(10deg)" }}
          >
            {counts[1]}D
          </Typography>
        </Segment>
        <Segment
          tone={results ? "loss" : reverse ? "opponent" : "tbfc"}
          opponentColor={results ? undefined : props.opponentColor}
          last
          sx={{ flex: sizes[2], transition: segmentTransition }}
        >
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, transform: "skewX(10deg)" }}
          >
            {counts[2]}
            {results ? "L" : "W"}
          </Typography>
        </Segment>
      </Bar>
    </Box>
  );
}
