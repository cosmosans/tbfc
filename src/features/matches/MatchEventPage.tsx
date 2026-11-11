import MatchNavigation from "./MatchNavigation";
import { useSearchParams } from "react-router-dom";
import { Alert, Box, Stack } from "@mui/material";
import type { ClubData, Match } from "../../model";
import { opponentFor } from "../../clubView";
import LineupEditor from "../lineup/LineupEditor";
import Matchboard from "../board/Matchboard";
import MatchBanner from "./MatchBanner";
import { storyToHtml } from "./matchStory";
import { canEditClub } from "../../editAccess";
import { normalizeMatchTab } from "./matchTabs";

export default function MatchEventPage({
  data,
  match,
  update,
  onEdit,
  goalTime,
  goalSoundEnabled,
  onGoalSoundToggle,
  onPreviewGoal,
}: {
  data: ClubData;
  match: Match;
  update: (data: ClubData) => void;
  goalTime?: number;
  goalSoundEnabled?: boolean;
  onGoalSoundToggle?: () => void;
  onPreviewGoal: () => void;
  onEdit?: () => void;
}) {
  const [searchParams] = useSearchParams();
  const view = normalizeMatchTab(searchParams.get("tab"), true, canEditClub);
  const opponent = opponentFor(data, match);
  return (
    <Stack gap={0}>
      <MatchNavigation data={data} match={match} />
      <MatchBanner
        onPreviewGoal={onPreviewGoal}
        goalTime={goalTime}
        goalSoundEnabled={goalSoundEnabled}
        onGoalSoundToggle={onGoalSoundToggle}
        data={data}
        match={match}
        detail
        onEdit={onEdit}
      />
      {match.report && (
        <Box
          sx={{ "& p": { my: 0, mb: 2 }, "& p:last-child": { mb: 0 } }}
          dangerouslySetInnerHTML={{ __html: storyToHtml(match.report) }}
        />
      )}
      {opponent?.notes && (
        <Alert severity="info">
          <strong>Team intel:</strong> {opponent.notes}
        </Alert>
      )}
      {view === "lineup" ? (
        <LineupEditor data={data} match={match} update={update} />
      ) : (
        <Matchboard key={match.id} data={data} match={match} update={update} />
      )}
    </Stack>
  );
}
