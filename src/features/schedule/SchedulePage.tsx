import { useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  Box,
} from "@mui/material";
import moment from "moment";
import TuneIcon from "@mui/icons-material/Tune";
import AddIcon from "@mui/icons-material/Add";
import {
  isMatchCompleted,
  scoreResult,
  type ClubData,
  type Match,
} from "../../model";
import {
  opponentName,
  orderedSeasons,
  seasonDate,
  seasonName,
} from "../../clubView";
import MatchTable from "../matches/MatchTable";
import StandingsWidget from "../standings/StandingsWidget";
import ScheduleImporter from "./ScheduleImporter";
import { matchLocation, splitMatchLocation } from "../../matchLocation";
import { canEditClub } from "../../editAccess";
import PageHeading from "../../components/PageHeading";

function HistoryFilter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  const labelId = `history-${label.toLowerCase()}-label`;
  return (
    <FormControl size="small" sx={{ minWidth: 140 }}>
      <InputLabel id={labelId} shrink>
        {label}
      </InputLabel>
      <Select
        labelId={labelId}
        label={label}
        value={value}
        displayEmpty
        notched
        onChange={(event) => onChange(event.target.value)}
      >
        <MenuItem value="">All {label}s</MenuItem>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function filterOptions(values: string[]) {
  return [...new Set(values.filter(Boolean))]
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ value, label: value }));
}

function venueName(match: Match) {
  return splitMatchLocation(match.venue, match.pitch).venue;
}

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
  const mobile = useMediaQuery("(width < 600px)");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const showStandings = useMediaQuery("(width > 1200px)");
  const [search, setSearch] = useState("");
  const [result, setResult] = useState("");
  const [venue, setVenue] = useState("");
  const [kit, setKit] = useState("");
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
  const liveMatch = data.matches.find(
    (match) => match.status === "in_progress",
  );
  const startedSeason = seasons.find((item) => {
    const start = seasonDate(data, item);
    return start && start <= today;
  });
  const currentSeason = liveMatch
    ? seasonName(data, liveMatch)
    : startedSeason?.name;
  // Keep other announced seasons visible when their fixtures are already on the schedule.
  const seasonHeadings = new Set<string>();
  if (currentSeason) seasonHeadings.add(currentSeason);
  for (const match of data.matches) {
    if (!isMatchCompleted(match)) seasonHeadings.add(seasonName(data, match));
  }
  const filtered = data.matches.filter(includes);
  const pastMatches = data.matches.filter(
    (match) => !seasonHeadings.has(seasonName(data, match)),
  );
  const history = pastMatches
    .filter(includes)
    .filter(
      (match) =>
        (!result || scoreResult(match) === result) &&
        (!venue || venueName(match) === venue) &&
        (!kit || match.kit === kit),
    )
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  const activeCount = [season !== "All seasons", result, venue, kit].filter(
    Boolean,
  ).length;

  const filterControls = (
    <>
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel id="history-season-label">Season</InputLabel>
        <Select
          labelId="history-season-label"
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
      <HistoryFilter
        label="Result"
        value={result}
        onChange={setResult}
        options={[
          { value: "W", label: "Win" },
          { value: "D", label: "Draw" },
          { value: "L", label: "Loss" },
        ]}
      />
      <HistoryFilter
        label="Venue"
        value={venue}
        onChange={setVenue}
        options={filterOptions(pastMatches.map(venueName))}
      />
      <HistoryFilter
        label="Kit"
        value={kit}
        onChange={setKit}
        options={filterOptions(pastMatches.map((match) => match.kit))}
      />
      <Button
        variant="outlined"
        onClick={() => {
          setSearch("");
          setSeason("All seasons");
          setResult("");
          setVenue("");
          setKit("");
        }}
      >
        CLEAR
      </Button>
    </>
  );

  return (
    <Stack gap={{ xs: 2, md: 3, lg: 4 }}>
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
              Add Match
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

      <Stack
        direction={showStandings ? "row" : "column"}
        gap={{ xs: 2, md: 3, lg: 4 }}
        alignItems="flex-start"
      >
        <Stack
          sx={{
            flex: 1,
            minWidth: 0,
            width: "100%",
            "& section + section": { mt: 2 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              bgcolor: "background.paper",
              p: { xs: 2, sm: 3 },
              minHeight: { md: canEditClub ? 84 : 80 },
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                flex: 1,
                fontSize: 24,
                display: "inline-block",
              }}
              color="text.secondary"
            >
              Current Season
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textTransform: "uppercase", fontSize: 12 }}
            >
              Updated just now
            </Typography>
          </Box>
          {Array.from(seasonHeadings, (name) => {
            const matches = filtered
              .filter((match) => seasonName(data, match) === name)
              .sort((a, b) => a.date.localeCompare(b.date));
            if (!matches.length) return null;
            return (
              <section key={name} style={{ minWidth: 0, width: "100%" }}>
                <MatchTable
                  data={data}
                  matches={matches}
                  forceCompact={showStandings}
                  seasonSchedule
                  label={name || "Season schedule"}
                  onOpen={onOpen}
                />
              </section>
            );
          })}
        </Stack>
        {showStandings && (
          <Stack sx={{ flex: 1, minWidth: 0 }}>
            <StandingsWidget data={data} update={update} />
          </Stack>
        )}
      </Stack>

      <section style={{ minWidth: 0, marginTop: 5, width: "100%" }}>
        <Stack
          direction="row"
          alignItems="center"
          flexWrap="wrap"
          gap={{ xs: 1, sm: 2 }}
          sx={{ bgcolor: "background.paper", p: { xs: 2, sm: 3 } }}
        >
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{
              flex: 1,
              fontWeight: 700,
              fontSize: 24,
              whiteSpace: "nowrap",
            }}
          >
            Past Results
          </Typography>
          <TextField
            label="Search Matches"
            size="small"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              if (event.target.value) setSeason("All seasons");
            }}
            sx={{ width: { xs: 128, sm: 200 }, maxWidth: 200, minWidth: 0 }}
          />
          {mobile ? (
            <IconButton
              aria-label={`Past results filters, ${activeCount} active`}
              aria-haspopup="dialog"
              color="primary"
              onClick={() => setFiltersOpen(true)}
              sx={{ width: 44, border: 1, borderColor: "primary.main" }}
            >
              <Badge badgeContent={activeCount} color="primary">
                <TuneIcon />
              </Badge>
            </IconButton>
          ) : (
            filterControls
          )}
        </Stack>
        {mobile && (
          <Dialog
            open={filtersOpen}
            onClose={() => setFiltersOpen(false)}
            aria-labelledby="past-results-filter-title"
            fullWidth
            maxWidth="xs"
          >
            <DialogTitle id="past-results-filter-title">
              Past Results filters
            </DialogTitle>
            <DialogContent>
              <Stack gap={2} sx={{ pt: 1 }}>
                {filterControls}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button variant="contained" onClick={() => setFiltersOpen(false)}>
                Show {history.length}{" "}
                {history.length === 1 ? "match" : "matches"}
              </Button>
            </DialogActions>
          </Dialog>
        )}
        {history.length ? (
          <MatchTable
            data={data}
            matches={history}
            showAudit={canEditClub}
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
