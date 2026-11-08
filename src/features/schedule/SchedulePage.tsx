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
import moment from "moment";
import AddIcon from "@mui/icons-material/Add";
import { isMatchCompleted, type ClubData, type Match } from "../../model";
import { opponentName, orderedSeasons, seasonDate, seasonName } from "../../clubView";
import MatchTable from "../matches/MatchTable";
import ScheduleImporter from "./ScheduleImporter";
import { matchLocation } from "../../matchLocation";
import { canEditClub } from "../../editAccess";
import PageHeading from "../../components/PageHeading";

const sectionHeading = { fontWeight: 300, display: "inline-block", bgcolor: "#111", color: "#fff", py: 1, mb: 2 };

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
  const today = moment().format("YYYY-MM-DD");
  const liveMatch = data.matches.find((match) => match.status === "in_progress");
  const startedSeason = seasons.find((item) => {
    const start = seasonDate(data, item);
    return start && start <= today;
  });
  const currentSeason = liveMatch ? seasonName(data, liveMatch) : startedSeason?.name;
  // Keep other announced seasons visible when their fixtures are already on the schedule.
  const seasonHeadings = new Set<string>();
  if (currentSeason) seasonHeadings.add(currentSeason);
  for (const match of data.matches) {
    if (!isMatchCompleted(match)) seasonHeadings.add(seasonName(data, match));
  }
  const filtered = data.matches.filter(includes);
  const history = filtered
    .filter((match) => !seasonHeadings.has(seasonName(data, match)))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  return (
    <Stack gap={2}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ sm: "center" }}
        gap={2}
      >
        <PageHeading>Schedule</PageHeading>
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
      {Array.from(seasonHeadings, (name) => {
        const matches = filtered
          .filter((match) => seasonName(data, match) === name)
          .sort((a, b) => a.date.localeCompare(b.date));
        if (!matches.length) return null;
        return (
          <section key={name} style={{ minWidth: 0, width: "100%" }}>
            <Typography variant="h5" sx={sectionHeading}>{name || "Season schedule"}</Typography>
            <MatchTable data={data} matches={matches} seasonSchedule label={name || "Season schedule"} onOpen={onOpen} />
          </section>
        );
      })}

      <section style={{ minWidth: 0, width: "100%" }}>
        <Typography variant="h5" sx={sectionHeading}>Past Results</Typography>
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
