import { styled } from "@mui/material/styles";
import { nameplateStyles } from "../../components/LineupNameplate";
import type { Marker } from "../../model";

export const Pitch = styled("div")({
  position: "relative",
  width: "100%",
  minHeight: 620,
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
  left: "37.5%",
  width: "25%",
  height: "8.5%",
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
  shouldForwardProp: (prop) => prop !== "team" && prop !== "kit",
})<{ team: Marker["team"]; kit?: string }>(({ team, kit }) => ({
  position: "absolute",
  transform: "translate(-50%,-50%)",
  minWidth: 54,
  height: 45,
  border: "2px solid white",
  borderRadius: "50%",
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
  ...(team === "ball"
    ? {
        width: 54,
        height: "auto",
        minWidth: 0,
        minHeight: 0,
        aspectRatio: "1 / 1",
        padding: 0,
        border: 0,
        background: "transparent",
        boxShadow: "none",
        filter: "drop-shadow(0 3px 5px #0008)",
        display: "grid",
        placeItems: "center",
        fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
        fontSize: 48,
        lineHeight: 1,
        "@media (max-width: 600px)": {
          width: 48,
          minWidth: 0,
          minHeight: 0,
          fontSize: 42,
        },
      }
    : {}),
  ...(team === "tbfc"
    ? {
        ...nameplateStyles(kit),
        width: "22%",
        maxWidth: 160,
        padding: "5px 18px",
      }
    : {}),
}));
