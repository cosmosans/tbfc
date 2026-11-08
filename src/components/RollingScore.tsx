import { useEffect, useRef, useState } from "react";
import { keyframes } from "@emotion/react";
import { Box, useMediaQuery } from "@mui/material";

const rollOut = keyframes`
  from { transform: translateY(0); }
  to { transform: translateY(-100%); }
`;
const rollIn = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;

export default function RollingScore({ value, animate }: { value: number; animate: boolean }) {
  const previous = useRef(value);
  const [change, setChange] = useState<{ from: number; to: number } | null>(null);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    if (previous.current === value) return;
    const from = previous.current;
    previous.current = value;
    if (!animate || reducedMotion) {
      setChange(null);
      return;
    }
    setChange({ from, to: value });
    const timer = window.setTimeout(() => setChange(null), 800);
    return () => window.clearTimeout(timer);
  }, [value, animate, reducedMotion]);

  return (
    <Box
      component="span"
      aria-label={String(value)}
      sx={{ display: "inline-grid", overflow: "hidden", lineHeight: 1.05, fontVariantNumeric: "tabular-nums", "& > span": { gridArea: "1 / 1" } }}
    >
      {change ? (
        <>
          <Box component="span" aria-hidden="true" sx={{ animation: `${rollOut} 800ms ease-in-out forwards` }}>{change.from}</Box>
          <Box component="span" aria-hidden="true" sx={{ animation: `${rollIn} 800ms ease-in-out forwards` }}>{change.to}</Box>
        </>
      ) : (
        <Box component="span" aria-hidden="true">{value}</Box>
      )}
    </Box>
  );
}
