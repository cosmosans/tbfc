import { Stack } from "@mui/material";
import type { Match, MatchPhoto, MatchVideo } from "../../model";
import MatchGallery from "./MatchGallery";
import MatchVideoGallery from "./MatchVideoGallery";

export default function MatchMedia({
  match,
  onSavePhotos,
  onSaveVideos,
}: {
  match: Match;
  onSavePhotos?: (photos: MatchPhoto[]) => void;
  onSaveVideos?: (videos: MatchVideo[]) => void;
}) {
  return (
    <Stack gap={2}>
      <MatchGallery photos={match.photos ?? []} onSave={onSavePhotos} />
      <MatchVideoGallery videos={match.videos ?? []} onSave={onSaveVideos} />
    </Stack>
  );
}
