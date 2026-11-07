import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { isMatchCompleted, type ClubData, type Match } from "../../model";
import { opponentName, orderedSeasons } from "../../clubView";
import MatchTable from "../matches/MatchTable";
import ScheduleImporter from "./ScheduleImporter";
import { matchLocation } from "../../matchLocation";
import { canEditClub } from "../../editAccess";

type Props = {
  data: ClubData;
  update: (data: ClubData) => void;
  season: string;
  setSeason: (season: string) => void;
  onOpen: (match: Match) => void;
  onAddFixture: () => void;
  onManageSeasons: () => void;
};

export default function SchedulePage({
  data,
  update,
  season,
  setSeason,
  onOpen,
  onAddFixture,
  onManageSeasons,
}: Props) {
  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const seasons = useMemo(() => orderedSeasons(data, true), [data]);
  const includes = (match: Match) =>
    (season === "All seasons" ||
      match.seasonId === season ||
      (!match.seasonId &&
        match.season === seasons.find((item) => item.id === season)?.name)) &&
    `${opponentName(data, match)} ${matchLocation(match)} ${match.league ?? ""} ${match.competition}`
      .toLowerCase()
      .includes(search.toLowerCase());
  const upcoming = data.matches
    .filter((match) => match.status === "scheduled" && includes(match))
    .sort((a, b) => a.date.localeCompare(b.date));
  const inProgress = data.matches
    .filter((match) => match.status === "in_progress" && includes(match))
    .sort((a, b) => a.date.localeCompare(b.date));
  const history = data.matches
    .filter((match) => isMatchCompleted(match) && includes(match))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  return (
    <Stack gap={3}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ sm: "center" }}
        gap={2}
      >
        <Typography
          variant="h4"
          sx={{ bgcolor: "#111", color: "#fff", px: 2, py: 1 }}
        >
          Schedule
        </Typography>
        {canEditClub && (
          <Stack direction="row" gap={1} flexWrap="wrap">
            <Button variant="outlined" onClick={onManageSeasons}>
              Manage Seasons
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setUploadOpen(true)}
            >
              Upload Season Schedule
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAddFixture}
            >
              Add Fixture
            </Button>
          </Stack>
        )}
      </Stack>

      {canEditClub && (
        <ScheduleImporter
          data={data}
          update={update}
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
        />
      )}
      {inProgress.length > 0 && (
        <section>
          <Typography variant="h5" sx={{ mb: 2 }}>
            In Progress
          </Typography>
          <MatchTable data={data} matches={inProgress} onOpen={onOpen} />
        </section>
      )}
      {upcoming.length > 0 && (
        <section>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 300,
              display: "inline-block",
              bgcolor: "#111",
              color: "#fff",
              px: 2,
              py: 1,
              mb: 2,
            }}
          >
            Upcoming
          </Typography>
          <MatchTable
            data={data}
            matches={upcoming}
            upcoming
            showSeasonDividers={season === "All seasons" && search === ""}
            onOpen={onOpen}
          />
        </section>
      )}

      <section>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 300,
            display: "inline-block",
            bgcolor: "#111",
            color: "#fff",
            px: 2,
            py: 1,
            mb: 2,
          }}
        >
          Past Results
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          gap={2}
          sx={{ bgcolor: "#111", mb: 2, mt: -1 }}
        >
          <TextField
            label="Search Matches"
            size="small"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              if (event.target.value) setSeason("All seasons");
            }}
            sx={{ flexGrow: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Season</InputLabel>
            <Select
              label="Season"
              value={season}
              onChange={(event) => setSeason(event.target.value)}
            >
              <MenuItem value="All seasons">All Seasons</MenuItem>
              {seasons.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        {history.length ? (
          <MatchTable
            data={data}
            matches={history}
            showSeasonDividers={season === "All seasons" && search === ""}
            onOpen={onOpen}
          />
        ) : (
          <Alert severity="info">No completed matches for this filter.</Alert>
        )}
      </section>
    </Stack>
  );
}
