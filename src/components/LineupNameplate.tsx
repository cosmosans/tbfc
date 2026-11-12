import { styled } from "@mui/material/styles";
import WhiteLabel from "../img/lineup-label-white.png";
import BlackLabel from "../img/lineup-label-black.png";

import GreenLabel from "../img/lineup-label-gk-green.png";
import PinkLabel from "../img/lineup-label-gk-pink.png";
import BlueLabel from "../img/lineup-label-gk-blue.png";

export type GoalkeeperPlate = "green" | "pink" | "blue";
export const JOSE_GOALKEEPER_TEXT_COLOR = "#003558";
const goalkeeperImages = {
  green: GreenLabel,
  pink: PinkLabel,
  blue: BlueLabel,
};

export function goalkeeperPlate(
  playerId?: string,
  position?: string,
): GoalkeeperPlate | undefined {
  if (position !== "GK") return undefined;
  switch (playerId) {
    case "player-17":
      return "green";
    case "player-1":
      return "pink";
    case "player-27":
      return "blue";
    default:
      return undefined;
  }
}

export const nameplateStyles = (
  kit?: string,
  goalkeeper?: GoalkeeperPlate,
) => ({
  display: "grid",
  placeItems: "center",
  minWidth: 0,
  minHeight: 36,
  height: "auto",
  aspectRatio: "552 / 120",
  boxSizing: "border-box" as const,
  border: 0,
  borderRadius: 0,
  padding: "5px 13%",
  backgroundColor: "transparent",
  backgroundImage: `url(${goalkeeper ? goalkeeperImages[goalkeeper] : kit === "White" ? WhiteLabel : BlackLabel})`,
  backgroundSize: "100% 100%",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center",
  color: goalkeeper
    ? goalkeeper === "blue"
      ? JOSE_GOALKEEPER_TEXT_COLOR
      : "#fff"
    : kit === "White"
      ? "#FD6340"
      : "#f47730",
  boxShadow: "none",
  filter: "drop-shadow(0 3px 4px #0008)",
  textAlign: "center" as const,
  "@media (max-width: 600px)": { minWidth: 0, minHeight: 36, padding: "4px 10%" },
});

export const LineupNameplate = styled("div", {
  shouldForwardProp: (prop) => prop !== "kit" && prop !== "goalkeeper",
})<{ kit?: string; goalkeeper?: GoalkeeperPlate }>(({ kit, goalkeeper }) =>
  nameplateStyles(kit, goalkeeper),
);

const Label = styled("span")({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 3,
  fontFamily: "Oxanium, sans-serif",
  fontSize: "clamp(10px, 1.2vw, 16px)",
  fontWeight: 700,
  lineHeight: 1.25,
  textTransform: "uppercase",
  overflowWrap: "anywhere",
  "& strong": { fontSize: "1.5em", flexShrink: 0 },
  "& span": { minWidth: 0, letterSpacing: "-.04em" },
  "@media (max-width: 600px)": {
    width: "100%",
    fontSize: 9,
    gap: 2,
    "& strong": { fontSize: "1.35em" },
    "& span": { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  },
});

export function NameplateText({
  number,
  name,
}: {
  number?: string;
  name: string;
}) {
  return (
    <Label>
      {number && <strong>{number}</strong>}
      <span>{name}</span>
    </Label>
  );
}
