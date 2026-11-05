import { styled } from "@mui/material/styles";
import {
  BottomBox,
  CenterCircle,
  CenterLine,
  TopBox,
} from "../features/board/Matchboard.styles";
import PitchOverlay from "../img/pitch-overlay.png";
import PitchImage from "../img/pitch.png";

const Artwork = styled("img")({
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  pointerEvents: "none",
});

const Markings = styled("div")({
  position: "absolute",
  inset: 0,
  zIndex: 3,
  pointerEvents: "none",
});

export default function PitchSurface() {
  return (
    <>
      <Artwork src={PitchOverlay} alt="" sx={{ opacity: 0.8, zIndex: 1 }} />
      <Artwork
        src={PitchImage}
        alt=""
        sx={{ filter: "grayscale(100%)", opacity: 0.3, zIndex: 2 }}
      />
      <Markings>
        <CenterLine />
        <CenterCircle />
        <TopBox />
        <BottomBox />
      </Markings>
    </>
  );
}
