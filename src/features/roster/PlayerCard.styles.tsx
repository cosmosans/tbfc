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
  height: 180,
  "@media (max-width: 599.95px)": { height: 120 },
  "&[data-editing='true']": {
    height: "auto",
    "& > div": { height: "auto" },
    "& .MuiCard-root": { position: "relative", height: "auto" },
  },
  borderBottom: "1px solid rgba(255,255,255,.2)",
});
export const PlayerCardInner = styled("div", {
  shouldForwardProp: (prop) => prop !== "flipped",
})<{ flipped: boolean }>({
  position: "relative",
  width: "100%",
  height: "100%",
  "& [aria-hidden='true']": { display: "none" },
});
export const PlayerCardFront = styled("button")({
  ...face,
  display: "flex",
  flexDirection: "row",
  alignItems: "stretch",
  padding: 0,
  border: 0,
  background: "#171a1c",
  color: "#fff",
  textAlign: "left",
  cursor: "pointer",
  "&:hover": { background: "rgba(255,255,255,.04)" },
  "&:focus-visible": { outline: "3px solid #f47730", outlineOffset: 3 },
});
export const PlayerCardBack = styled(Card)({
  ...face,

});
export const PlayerCardBackContent = styled(CardContent)({
  height: "auto",
  overflowY: "auto",
});
export const PlayerPhoto = styled("div")({
  display: "grid",
  placeItems: "center",
  flex: "0 0 180px",
  width: 180,
  "@media (max-width: 599.95px)": { flexBasis: 100, width: 100 },
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
  flex: 1,
  minWidth: 0,
  display: "grid",
  alignItems: "center",
  gridTemplateColumns: "90px minmax(0, 1fr) minmax(280px, 36%) 80px",
  gridTemplateAreas: '"number identity stats status"',
  gap: 12,
  "@media (max-width: 899.95px)": {
    gridTemplateColumns: "55px minmax(0, 1fr) 65px",
    gridTemplateAreas: '"number identity status" "stats stats stats"',
  },
  padding: "16px 24px",
  "@media (max-width: 599.95px)": { padding: "10px", gap: 8,  },
  background: "transparent",
  fontFamily: "Oxanium, ui-sans-serif, system-ui, sans-serif",
});
export const PlayerNumber = styled("span")({
  gridArea: "number",
  color: "#d44f25",
  fontSize: "clamp(2rem, 4vw, 5.5rem)",
  lineHeight: 1,
  letterSpacing: "-.07em",
  fontWeight: 900,
});
export const PlayerIdentity = styled("span")({
  gridArea: "identity",
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  flex: 1,
});
export const PlayerName = styled("span")({
  display: "block",
  fontSize: "clamp(1.1rem, 1.2vw, 2rem)",
  fontWeight: 900,
  lineHeight: 1.2,
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
  gridArea: "status",
  alignSelf: "center",
  marginLeft: "auto",
  color: active ? "#20d262" : "#888",
  fontSize: ".85rem",
  fontWeight: 900,
  whiteSpace: "nowrap",
}));
