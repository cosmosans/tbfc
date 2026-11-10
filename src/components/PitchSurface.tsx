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
  "&::before": {
    content: '""',
    position: "absolute",
    inset: "2%",
    border: "2px solid rgba(255,255,255,.65)",
    pointerEvents: "none",
  },
  pointerEvents: "none",
});

export function PitchArtwork() {
  return (
    <>
      <Artwork src={PitchOverlay} alt="" sx={{ opacity: 0.8, zIndex: 1 }} />
      <Artwork
        src={PitchImage}
        alt=""
        sx={{ filter: "grayscale(10%)", opacity: 0.5, zIndex: 1 }}
      />
    </>
  );
}

export default function PitchSurface({ showArtwork = true }: { showArtwork?: boolean }) {
  return (
    <>
      {showArtwork && <PitchArtwork />}
      <Markings>
        <CenterLine />
        <CenterCircle />
        <TopBox />
        <BottomBox />
      </Markings>
    </>
  );
}
