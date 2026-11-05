import { useSearchParams } from "react-router-dom";
import { Alert, Button, Stack, Tab, Tabs, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import type { ClubData, Match } from "../../model";
import { opponentFor } from "../../clubView";
import LineupEditor from "../lineup/LineupEditor";
import Matchboard from "../board/Matchboard";
import MatchBanner from "./MatchBanner";

export default function MatchEventPage({
  data,
  match,
  update,
  onBack,
  onEdit,
}: {
  data: ClubData;
  match: Match;
  update: (data: ClubData) => void;
  onBack: () => void;
  onEdit: () => void;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get("tab") === "board" ? "board" : "lineup";
  const opponent = opponentFor(data, match);
  return (
    <Stack gap={2}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={onBack}
        sx={{ alignSelf: "flex-start", bgcolor: "#111", color: "#fff" }}
      >
        Back
      </Button>
      <MatchBanner data={data} match={match} detail onEdit={onEdit} />
      {match.report && (
        <Typography sx={{ whiteSpace: "pre-wrap" }}>{match.report}</Typography>
      )}
      {opponent?.notes && (
        <Alert severity="info">
          <strong>Team intel:</strong> {opponent.notes}
        </Alert>
      )}
      <Tabs
        value={view}
        onChange={(_, next) =>
          setSearchParams(next === "board" ? { tab: "board" } : {}, {
            replace: true,
          })
        }
        sx={{ bgcolor: "#111", px: 2 }}
      >
        <Tab value="lineup" label="Lineup" />
        <Tab value="board" label="Matchboard" />
      </Tabs>
      {view === "lineup" ? (
        <LineupEditor data={data} match={match} update={update} />
      ) : (
        <Matchboard key={match.id} data={data} match={match} update={update} />
      )}
    </Stack>
  );
}
