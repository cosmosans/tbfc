import { Card, CardContent } from "@mui/material";
import { styled } from "@mui/material/styles";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";

const face = {
  position: "absolute" as const,
  inset: 0,
  width: "100%",
  height: "100%",
  overflow: "hidden",
  backfaceVisibility: "hidden" as const,
  WebkitBackfaceVisibility: "hidden" as const,
  borderRadius: 0,
};

export const PlayerCardFrame = styled("div")({
  height: 480,
  perspective: 1100,
  filter: "drop-shadow(0 7px 7px rgba(0,0,0,.28))",
});
export const PlayerCardInner = styled("div", {
  shouldForwardProp: (prop) => prop !== "flipped",
})<{ flipped: boolean }>(({ flipped }) => ({
  position: "relative",
  width: "100%",
  height: "100%",
  transformStyle: "preserve-3d",
  transition: "transform .65s cubic-bezier(.2,.75,.2,1)",
  transform: flipped
    ? "rotateY(180deg)"
    : "rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))",
  "[data-tilting='true'] > &": {
    transitionDuration: flipped ? ".65s" : ".12s",
  },
  "@media (prefers-reduced-motion: reduce)": {
    transitionDuration: ".01ms",
    transform: flipped ? "rotateY(180deg)" : "none",
  },
}));
export const PlayerCardFront = styled("button")({
  ...face,
  display: "flex",
  flexDirection: "column",
  padding: 0,
  border: 0,
  background: "#000",
  color: "#fff",
  textAlign: "left",
  cursor: "pointer",
  "&::after": {
    content: '""',
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    background:
      "radial-gradient(ellipse at var(--sheen-x, 50%) var(--sheen-y, 50%), rgba(255,255,255,.32) 0%, rgba(255,255,255,.10) 32%, transparent 70%), linear-gradient(125deg, rgba(255,255,255,.10), transparent 45%, rgba(255,255,255,.04))",
    opacity: "calc(var(--sheen-opacity, 0) * .64)",
    transition: "opacity .3s ease",
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,.18)",
  },
  "&[aria-hidden='true']::after": { opacity: 0 },
  "@media (prefers-reduced-motion: reduce)": {
    "&::after": { display: "none" },
  },
  "&:focus-visible": { outline: "3px solid #f47730", outlineOffset: 3 },
});
export const PlayerCardBack = styled(Card)({
  ...face,
  transform: "rotateY(180deg)",
});
export const PlayerCardBackContent = styled(CardContent)({
  height: "100%",
  overflowY: "auto",
});
export const PlayerPhoto = styled("div")({
  display: "grid",
  placeItems: "center",
  flex: 1,
  minHeight: 0,
  background: "#252c2e",
  overflow: "hidden",
  "& img": {
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
});
export const PlayerPlaceholder = styled(PersonOutlineIcon)({
  fontSize: "110px !important",
  color: "#707b7d",
});
export const PlayerInformation = styled("span")({
  minHeight: 116,
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "10px 12px",
  background: "#000",
  fontFamily: "Oxanium, ui-sans-serif, system-ui, sans-serif",
});
export const PlayerNumber = styled("span")({
  color: "#d44f25",
  fontSize: "clamp(2rem, 4vw, 5.5rem)",
  lineHeight: 1,
  letterSpacing: "-.07em",
  fontWeight: 900,
});
export const PlayerIdentity = styled("span")({
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  flex: 1,
});
export const PlayerName = styled("span")({
  display: "block",
  fontSize: "clamp(1.1rem, 1.2vw, 2rem)",
  fontWeight: 900,
  lineHeight: 1,
  textTransform: "uppercase",
  letterSpacing: "-.045em",
  overflowWrap: "anywhere",
});
export const PlayerPositions = styled("span")({
  display: "block",
  color: "#777",
  fontSize: ".9rem",
  lineHeight: 1.2,
});
export const PlayerStatus = styled("span", {
  shouldForwardProp: (prop) => prop !== "active",
})<{ active: boolean }>(({ active }) => ({
  alignSelf: "flex-end",
  color: active ? "#20d262" : "#888",
  fontSize: ".85rem",
  fontWeight: 900,
  whiteSpace: "nowrap",
}));
