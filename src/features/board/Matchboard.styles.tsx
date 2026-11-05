import { styled } from "@mui/material/styles";
import type { Marker } from "../../model";

export const Pitch = styled("div")({
  position: "relative",
  width: "100%",
  minHeight: 620,
  backgroundImage: 'url("/pitch-grass-dark.png")',
  backgroundSize: "cover",
  backgroundPosition: "center",
  borderRadius: 0,
  overflow: "hidden",
  touchAction: "none",
  userSelect: "none",
  "&::before": {
    content: '""',
    position: "absolute",
    inset: "2%",
    border: "2px solid rgba(255,255,255,.65)",
    pointerEvents: "none",
  },
  "@media (max-width: 600px)": { minHeight: 530 },
});
export const CenterLine = styled("div")({
  position: "absolute",
  left: "2%",
  right: "2%",
  top: "50%",
  borderTop: "2px solid rgba(255,255,255,.65)",
  pointerEvents: "none",
});
export const CenterCircle = styled("div")({
  position: "absolute",
  left: "50%",
  top: "50%",
  width: "18%",
  aspectRatio: "1",
  border: "2px solid rgba(255,255,255,.65)",
  borderRadius: "50%",
  transform: "translate(-50%,-50%)",
  pointerEvents: "none",
});
const box = {
  position: "absolute" as const,
  left: "25%",
  width: "50%",
  height: "17%",
  border: "2px solid rgba(255,255,255,.65)",
  pointerEvents: "none" as const,
};
export const TopBox = styled("div")({ ...box, top: "2%", borderTop: 0 });
export const BottomBox = styled("div")({
  ...box,
  bottom: "2%",
  borderBottom: 0,
});
export const PitchMarker = styled("button", {
  shouldForwardProp: (prop) => prop !== "team",
})<{ team: Marker["team"] }>(({ team }) => ({
  position: "absolute",
  transform: "translate(-50%,-50%)",
  minWidth: 54,
  minHeight: 54,
  border: "2px solid white",
  borderRadius: "50%",
  padding: 4,
  font:
    team === "ball"
      ? "700 22px/1.1 Oxanium, sans-serif"
      : "700 12px/1.1 Oxanium, sans-serif",
  cursor: "grab",
  touchAction: "none",
  boxShadow: "0 3px 8px #0008",
  color: team === "ball" ? "inherit" : "#171717",
  background:
    team === "tbfc" ? "#f47730" : team === "opponent" ? "#e6e6e6" : "#fff",
  "&:active": { cursor: "grabbing" },
  "@media (max-width: 600px)": { minWidth: 48, minHeight: 48 },
}));
