import { goalsByKickoff } from "./goalsByKickoff";
import WhiteKit from "../../img/white-front.png";
import BlackKit from "../../img/black-front.png";
import PanelHeader, { panelBorder } from "../../components/PanelHeader";
import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Select,
  MenuItem,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  Bar,
  Cell,
  BarChart,
  PieChart,
  Pie,
  ComposedChart,
  Line,
  LabelList,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import type { ClubData } from "../../model";
import { isMatchCompleted, record } from "../../model";
import { opponentFor, opponentName, orderedSeasons } from "../../clubView";
import PageHeading from "../../components/PageHeading";



function TeamCrestTick({
  x = 0,
  y = 0,
  payload,
  teams,
  onOpenTeam,
  side = false,
}: {
  side?: boolean;
  x?: number;
  y?: number;
  payload?: { value: string };
  teams: { team: string; id?: string; crestUrl?: string }[];
  onOpenTeam: (id: string) => void;
}) {
  const team = teams.find((item) => item.team === payload?.value);
  const [failedUrl, setFailedUrl] = useState("");
  const crest = team?.crestUrl;
  const open = () => {
    if (team?.id) onOpenTeam(team.id);
  };
  return (
    <g
      transform={`translate(${side ? x - 40 : x - 18}, ${side ? y - 18 : y + 8})`}
      role={team?.id ? "link" : "img"}
      tabIndex={team?.id ? 0 : undefined}
      aria-label={team?.id ? `View ${team.team} team page` : payload?.value}
      onClick={open}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open();
        }
      }}
      style={{ cursor: team?.id ? "pointer" : "default" }}
    >
      <title>{payload?.value}</title>
      {crest && crest !== failedUrl ? (
        <image
          href={crest}
          width={36}
          height={36}
          preserveAspectRatio="xMidYMid meet"
          onError={() => setFailedUrl(crest)}
        />
      ) : (
        <>
          <circle cx={18} cy={18} r={17} fill="#394144" />
          <text
            x={18}
            y={18}
            dy=".35em"
            textAnchor="middle"
            fill="#fff"
            fontSize={12}
          >
            {payload?.value
              .split(/\s+/)
              .slice(0, 2)
              .map((word) => word[0])
              .join("")}
          </text>
        </>
      )}
    </g>
  );
}

export default function Stats({
  data,
}: {
  data: ClubData;
  update: (data: ClubData) => void;
  openSeason: (id: string) => void;
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const openTeam = (id?: string) => {
    if (id) navigate(`/team/${encodeURIComponent(id)}`);
  };
  const [metric, setMetric] = useState<"results" | "goals" | "points">(
    "results",
  );
  const [opponentMetric, setOpponentMetric] = useState<
    "teamGoals" | "goalsFor" | "goalsAgainst" | "gdPerMatch"
  >("teamGoals");
  const kickoffData = goalsByKickoff(data.matches);
  const totals = record(data.matches);
  const allTimeStats = [
    ["Matches Played", totals.played],
    ["Wins", totals.W],
    ["Losses", totals.L],
    ["Draws", totals.D],
    ["Goals Scored", totals.for],
    ["Goals Allowed", totals.against],
  ] as const;
  const kits = [
    { name: "White", shirt: WhiteKit },
    { name: "Black", shirt: BlackKit },
  ].map((kit) => {
    const results = record(
      data.matches.filter(
        (match) => match.kit?.trim().toLowerCase() === kit.name.toLowerCase(),
      ),
    );
    return {
      ...kit,
      played: results.played,
      slices: [
        { name: "Wins", value: results.W, fill: theme.palette.success.main },
        { name: "Draws", value: results.D, fill: "#4a4a4a" },
        { name: "Losses", value: results.L, fill: theme.palette.error.main },
      ],
    };
  });
  const seasons = orderedSeasons(data, false).map((s) => ({
    season: s.name,
    ...record(
      data.matches.filter(
        (m) => m.seasonId === s.id || (!m.seasonId && m.season === s.name),
      ),
    ),
  }));
  const seasonPoints = seasons
    .filter((season) => season.played > 0)
    .map((season) => ({
      ...season,
      points: season.W * 3 + season.D,
      ppg: (season.W * 3 + season.D) / season.played,
    }));
  const opponentCounts = new Map<
    string,
    {
      team: string;
      id?: string;
      played: number;
      goalsFor: number;
      goalsAgainst: number;
      crestUrl?: string;
      color?: string;
    }
  >();
  for (const match of data.matches) {
    if (!isMatchCompleted(match)) continue;
    const team = opponentName(data, match).trim();
    if (!team) continue;
    const opponent = opponentFor(data, match);
    const key = opponent?.id ?? team.toLowerCase();
    const current = opponentCounts.get(key);
    opponentCounts.set(key, {
      team,
      id: opponent?.id,
      color: opponent?.color,
      crestUrl: opponent?.crestUrl,
      played: (current?.played ?? 0) + 1,
      goalsFor: (current?.goalsFor ?? 0) + match.goalsFor,
      goalsAgainst: (current?.goalsAgainst ?? 0) + match.goalsAgainst,
    });
  }
  const teams = [...opponentCounts.values()].sort(
    (a, b) => b.played - a.played || a.team.localeCompare(b.team),
  );
  const adjusted = opponentMetric === "gdPerMatch";
  const sortField = opponentMetric === "teamGoals" ? "goalsFor" : opponentMetric;
  const chartTeams = teams
    .filter(team => !adjusted || team.goalsFor > team.goalsAgainst)
    .map(team => ({ ...team, gdPerMatch: (team.goalsFor - team.goalsAgainst) / team.played }))
    .sort((a, b) => b[sortField] - a[sortField] || a.team.localeCompare(b.team));
  const metricName = adjusted ? "GD Per Match" : opponentMetric === "goalsAgainst" ? "Goals Allowed" : "TBFC Goals Scored";
  const horizontalBars = useMediaQuery(theme.breakpoints.down("sm"));
  const seasonsOnLeft = horizontalBars && metric !== "points";
  const seasonData = metric === "points" ? seasonPoints : seasons;
  const seasonUnit =
    metric === "points"
      ? "Total Points"
      : metric === "results"
        ? "Matches"
        : "Goals";
  const crestTick = (
    <TeamCrestTick teams={teams} onOpenTeam={openTeam} side={horizontalBars} />
  );
  return (
    <Stack gap={2}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          alignItems: "start",
        }}
      >
        <PageHeading>Stats</PageHeading>
        <Card
          component="section"
          aria-labelledby="all-time-title"
          sx={{
            width: "100%",
            ...panelBorder,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              px: 2,
              py: 1.5,
            }}
          >
            <Box
              component="img"
              src="/crests/tbfc.png"
              alt=""
              sx={{ width: 32, height: 32 }}
            />
            <Typography
              id="all-time-title"
              component="h2"
              variant="h5"
              color="text.secondary"
              sx={{ fontWeight: 700 }}
            >
              All-Time Record
            </Typography>
          </Box>
          <Box
            component="dl"
            sx={{
              m: 0,
              display: "grid",
              gap: "1px",
              bgcolor: "divider",
              borderTop: 1,
              borderColor: "divider",
              gridTemplateColumns: {
                xs: "repeat(3, minmax(0, 1fr))",
                md: "repeat(6, minmax(0, 1fr))",
              },
            }}
          >
            {allTimeStats.map(([label, value]) => (
              <Box
                key={label}
                sx={{
                  bgcolor: "background.paper",
                  px: { xs: 1.5, sm: 2.5 },
                  py: 2,
                }}
              >
                <Typography
                  component="dt"
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    textTransform: "uppercase",
                  }}
                >
                  {label}
                </Typography>
                <Typography
                  component="dd"
                  sx={{
                    m: 0,
                    mt: 0.5,
                    fontSize: { xs: 32, md: 44 },
                    fontWeight: 900,
                    lineHeight: 1.1,
                    fontVariantNumeric: "tabular-nums",
                    color:
                      label === "Matches Played"
                        ? "primary.main"
                        : "text.primary",
                  }}
                >
                  {value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Card>

        <Box sx={{
          display: "grid", width: "100%", minWidth: 0, gap: "26px", mt: "10px",
          gridTemplateColumns: "minmax(0, 1fr)",
          "@media (width > 1200px)": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
        }}>
        <Card
          sx={{
            minWidth: 0,
            border: 0,
            width: "100%",
          }}
        >
          <PanelHeader
            title="Seasons"
            context={
              metric === "points"
                ? "Points per season (3 × wins + draws). Only completed matches count."
                : undefined
            }
          >
            <Select
              size="small"
              value={metric}
              onChange={(event) =>
                setMetric(event.target.value as "results" | "goals" | "points")
              }
              inputProps={{ "aria-label": "Season chart metric" }}
              sx={{ minWidth: 145, fontSize: ".875rem" }}
            >
              <MenuItem value="results">Results</MenuItem>
              <MenuItem value="goals">Goal Differential</MenuItem>
              <MenuItem value="points">Points</MenuItem>
            </Select>
          </PanelHeader>
          <CardContent>
            {metric === "points" && !seasonPoints.length && (
              <Typography color="text.secondary">
                No completed matches yet.
              </Typography>
            )}
            <Box sx={{ width: "100%", overflowX: "auto" }}>
              <Box
                sx={{
                  minWidth:
                    metric === "points"
                      ? 80 + Math.max(0, seasonData.length - 1) * 64
                      : seasonsOnLeft
                        ? 0
                        : Math.max(600, seasons.length * 110),
                  height: seasonsOnLeft
                    ? Math.max(220, seasonData.length * 56 + 100)
                    : 380,
                }}
              >
                <ResponsiveContainer>
                  <ComposedChart
                    key={metric}
                    data={seasonData}
                    layout={seasonsOnLeft ? "vertical" : "horizontal"}
                    accessibilityLayer
                    maxBarSize={64}
                    margin={{
                      top: 12,
                      right: seasonsOnLeft ? 32 : 12,
                      left: 0,
                      bottom: seasonsOnLeft ? 12 : 30,
                    }}
                  >
                    <CartesianGrid
                      stroke="#394144"
                      vertical={seasonsOnLeft}
                      horizontal={!seasonsOnLeft}
                    />
                    {seasonsOnLeft ? (
                      <XAxis
                        type="number"
                        allowDecimals={false}
                        stroke="#a7afb1"
                        height={48}
                        label={{
                          value: seasonUnit,
                          position: "insideBottom",
                          fill: "#a7afb1",
                        }}
                      />
                    ) : (
                      <XAxis
                        dataKey="season"
                        stroke="#a7afb1"
                        angle={metric === "points" ? -45 : -25}
                        tick={
                          metric === "points" ? { fontSize: 12 } : undefined
                        }
                        textAnchor="end"
                        height={80}
                        interval={0}
                      />
                    )}
                    {seasonsOnLeft ? (
                      <YAxis
                        type="category"
                        dataKey="season"
                        width={100}
                        interval={0}
                        stroke="#a7afb1"
                      />
                    ) : (
                      <YAxis
                        stroke="#a7afb1"
                        allowDecimals={false}
                        label={{
                          value: seasonUnit,
                          angle: -90,
                          position: "insideLeft",
                          fill: "#a7afb1",
                        }}
                      />
                    )}
                    <Legend verticalAlign="top" height={32} itemSorter={null} />
                    <Tooltip
                      content={
                        metric === "points"
                          ? ({ active, payload, label }) => {
                              const season = payload?.[0]?.payload as
                                | (typeof seasonPoints)[number]
                                | undefined;
                              if (!active || !season) return null;
                              return (
                                <Box
                                  sx={{
                                    bgcolor: "#1b2022",
                                    border: "1px solid #394144",
                                    p: 1.5,
                                  }}
                                >
                                  <Typography sx={{ mb: 0.5 }}>
                                    {label}
                                  </Typography>
                                  <Typography color="primary.main">
                                    Total Points: {season.points}
                                  </Typography>
                                  <Typography color="primary.main">
                                    Points Per Game:{" "}
                                    {Number(season.ppg.toFixed(2))}
                                  </Typography>
                                </Box>
                              );
                            }
                          : undefined
                      }
                      cursor={{ fill: "#38383880" }}
                      contentStyle={{
                        background: "#1b2022",
                        border: "1px solid #394144",
                      }}
                    />
                    {metric === "results" ? (
                      (
                        [
                          ["W", "Wins", theme.palette.success.main, "#111"],
                          ["D", "Draws", "#4a4a4a", "#fff"],
                          ["L", "Losses", theme.palette.error.main, "#fff"],
                        ] as const
                      ).map(([key, name, fill, text]) => (
                        <Bar
                          key={key}
                          dataKey={key}
                          name={name}
                          stackId="results"
                          fill={fill}
                          isAnimationActive={false}
                        >
                          <LabelList
                            dataKey={key}
                            position="center"
                            fill={text}
                            fontWeight={800}
                            fontSize={13}
                            formatter={(value) =>
                              Number(value) > 0 ? `${value}${key}` : ""
                            }
                          />
                        </Bar>
                      ))
                    ) : metric === "points" ? (
                      <Line
                        type="linear"
                        dataKey="points"
                        name="Points Per Season"
                        stroke={theme.palette.primary.main}
                        strokeWidth={3}
                        dot={{ r: 5, fill: theme.palette.primary.main }}
                        activeDot={{ r: 7 }}
                        isAnimationActive={false}
                      >
                        <LabelList
                          dataKey="points"
                          position={seasonsOnLeft ? "right" : "top"}
                          fill="#fff"
                          fontWeight={800}
                          fontSize={13}
                        />
                      </Line>
                    ) : (
                      <>
                        <Bar
                          dataKey="for"
                          name="Goals Scored"
                          fill={theme.palette.primary.main}
                          isAnimationActive={false}
                        >
                          <LabelList
                            dataKey="for"
                            position={seasonsOnLeft ? "right" : "top"}
                            fill="#fff"
                            fontWeight={800}
                            fontSize={13}
                          />
                        </Bar>
                        <Bar
                          dataKey="against"
                          name="Goals Allowed"
                          fill={theme.palette.secondary.main}
                          isAnimationActive={false}
                        >
                          <LabelList
                            dataKey="against"
                            position={seasonsOnLeft ? "right" : "top"}
                            fill="#fff"
                            fontWeight={800}
                            fontSize={13}
                          />
                        </Bar>
                      </>
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card component="section" sx={{ width: "100%", minWidth: 0 }}>
          <PanelHeader title="Goals Scored" context="Total Turf Burners goals across all seasons, grouped by match start time.">
            <Select size="small" defaultValue="kickoff" inputProps={{ "aria-label": "Goals Scored grouping" }}>
              <MenuItem value="kickoff">By Kickoff Time</MenuItem>
            </Select>
          </PanelHeader>
          <CardContent>
            {kickoffData.length ? (
              <Box sx={{ overflowX: "auto" }}>
                <Box sx={{ height: 340, minWidth: 80 + kickoffData.length * 78 }}>
                  <ResponsiveContainer>
                    <BarChart data={kickoffData} maxBarSize={64} margin={{ top: 28, right: 36, bottom: 12, left: 0 }} accessibilityLayer>
                      <CartesianGrid stroke="#394144" vertical={false} />
                      <XAxis dataKey="time" interval={0} stroke="#a7afb1" tick={{ fontSize: 12 }}
                        padding={{ left: 20, right: 12 }} />
                      <YAxis allowDecimals={false} stroke="#a7afb1" width={42} />
                      <Tooltip contentStyle={{ background: "#1b2022", border: "1px solid #394144" }} />
                      <Bar dataKey="goals" name="Goals Scored" fill={theme.palette.primary.main} isAnimationActive={false}>
                        <LabelList dataKey="goals" position="top" fill="#fff" fontWeight={800} fontSize={13} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            ) : <Typography color="text.secondary">No recorded kickoff times yet.</Typography>}
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 0, width: "100%", border: 0 }}>
          <PanelHeader
            title="Opponents"
            context={
              adjusted ? "Positive goal differential divided by completed matches against each opponent." : opponentMetric === "teamGoals"
                ? "Goals across all seasons. Turf Burners first, opponent second."
                : opponentMetric === "goalsFor"
                  ? "Goals scored by TBFC against each opponent across all seasons."
                  : "Goals scored against TBFC by each opponent across all seasons."
            }
          >
            <Select
              size="small"
              value={opponentMetric}
              onChange={(event) =>
                setOpponentMetric(
                  event.target.value as
                    | "teamGoals"
                    | "goalsFor"
                    | "goalsAgainst" | "gdPerMatch",
                )
              }
              inputProps={{ "aria-label": "Opponent chart metric" }}
              sx={{ minWidth: 145, fontSize: ".875rem" }}
            >
              <MenuItem value="teamGoals">Goal Differential</MenuItem>
              <MenuItem value="gdPerMatch">GD Per Match</MenuItem>
              <MenuItem value="goalsFor">Goals Scored</MenuItem>
              <MenuItem value="goalsAgainst">Goals Allowed</MenuItem>
            </Select>
          </PanelHeader>
          <CardContent>
            {chartTeams.length ? (
              <Box
                sx={{
                  width: "100%",
                  overflowX: "auto",
                }}
              >
                <Box
                  sx={{
                    minWidth: horizontalBars
                      ? 0
                      : Math.max(
                          600,
                          chartTeams.length *
                            (opponentMetric === "teamGoals" ? 80 : 64),
                        ),
                    height: horizontalBars ? chartTeams.length * 52 + 60 : 400,
                  }}
                >
                  <ResponsiveContainer>
                    <BarChart
                      key={opponentMetric}
                      layout={horizontalBars ? "vertical" : "horizontal"}
                      data={chartTeams}
                      accessibilityLayer
                      margin={{
                        top: 24,
                        right: horizontalBars ? 36 : 16,
                        left: 0,
                        bottom: 8,
                      }}
                      barSize={opponentMetric === "teamGoals" ? 12 : 24}
                      barGap={4}
                    >
                      <CartesianGrid
                        stroke="#394144"
                        vertical={horizontalBars}
                        horizontal={!horizontalBars}
                      />
                      {horizontalBars ? (
                        <XAxis
                          type="number"
                          allowDecimals={adjusted}
                          stroke="#a7afb1"
                        />
                      ) : (
                        <XAxis
                          dataKey="team"
                          height={60}
                          interval={0}
                          tickLine={false}
                          stroke="#a7afb1"
                          tick={crestTick}
                        />
                      )}
                      {horizontalBars ? (
                        <YAxis
                          type="category"
                          dataKey="team"
                          width={48}
                          interval={0}
                          tickLine={false}
                          stroke="#a7afb1"
                          tick={crestTick}
                        />
                      ) : (
                        <YAxis
                          type="number"
                          allowDecimals={adjusted}
                          stroke="#a7afb1"
                        />
                      )}
                      <Tooltip
                        formatter={adjusted ? value => Number(value).toFixed(2) : undefined}
                        cursor={{ fill: "#38383880" }}
                        contentStyle={{
                          background: "#1b2022",
                          border: "1px solid #394144",
                        }}
                      />
                      {opponentMetric === "teamGoals" ? (
                        <>
                          <Bar
                            minPointSize={3}
                            dataKey="goalsFor"
                            name="Turf Burners FC Goals"
                            fill={theme.palette.primary.main}
                            isAnimationActive={false}
                            cursor="pointer"
                            onClick={(entry) => openTeam(entry.payload?.id)}
                          >
                            <LabelList
                              dataKey="goalsFor"
                              position={horizontalBars ? "right" : "top"}
                              fill="#fff"
                              fontWeight={800}
                            />
                          </Bar>
                          <Bar
                            minPointSize={3}
                            dataKey="goalsAgainst"
                            name="Opponent Goals"
                            fill="#a7afb1"
                            isAnimationActive={false}
                            cursor="pointer"
                            onClick={(entry) => openTeam(entry.payload?.id)}
                          >
                            {chartTeams.map((team) => (
                              <Cell
                                key={team.team}
                                fill={team.color || "#a7afb1"}
                              />
                            ))}
                            <LabelList
                              dataKey="goalsAgainst"
                              position={horizontalBars ? "right" : "top"}
                              fill="#fff"
                              fontWeight={800}
                            />
                          </Bar>
                        </>
                      ) : (
                        <Bar
                          minPointSize={3}
                          cursor="pointer"
                          onClick={(entry) => openTeam(entry.payload?.id)}
                          dataKey={sortField}
                          name={metricName}
                          fill={theme.palette.primary.main}
                          isAnimationActive={false}
                        >
                          {chartTeams.map((team) => (
                            <Cell
                              key={team.team}
                              fill={team.color || theme.palette.primary.main}
                            />
                          ))}
                          <LabelList
                            formatter={adjusted ? value => Number(value).toFixed(2) : undefined}
                            dataKey={sortField}
                            position={horizontalBars ? "right" : "top"}
                            fill="#fff"
                            fontWeight={800}
                          />
                        </Bar>
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            ) : (
              <Typography color="text.secondary">
                {adjusted ? "No opponents with a positive goal differential yet." : "No completed matches yet."}
              </Typography>
            )}
          </CardContent>
        </Card>

        <Card
          component="section"
          sx={{ width: "100%", minWidth: 0 }}
        >
          <PanelHeader title="Kit Record" />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              pb: 3,
              px: { xs: 1, sm: 3 },
              maxWidth: 900,
              mx: "auto",
            }}
          >
            {kits.map((kit) => (
              <Stack key={kit.name} alignItems="center" spacing={1}>
                <Typography component="h3" variant="subtitle1" fontWeight={700}>
                  {kit.name} Kit
                </Typography>
                <Box
                  sx={{
                    width: "100%",
                    maxWidth: 250,
                    aspectRatio: "1",
                    position: "relative",
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={
                          kit.played
                            ? kit.slices
                            : [
                                {
                                  name: "No Matches",
                                  value: 1,
                                  fill: theme.palette.divider,
                                },
                              ]
                        }
                        dataKey="value"
                        innerRadius="68%"
                        outerRadius="95%"
                        startAngle={90}
                        endAngle={-270}
                        stroke={theme.palette.background.paper}
                        strokeWidth={2}
                        isAnimationActive={false}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box
                    component="img"
                    src={kit.shirt}
                    alt=""
                    sx={{
                      position: "absolute",
                      inset: "26%",
                      width: "48%",
                      height: "48%",
                      objectFit: "contain",
                      pointerEvents: "none",
                    }}
                  />
                </Box>
                <Stack
                  direction="row"
                  flexWrap="wrap"
                  justifyContent="center"
                  gap={1}
                >
                  {kit.slices.map((slice) => (
                    <Typography
                      key={slice.name}
                      variant="caption"
                      aria-label={`${slice.value} ${slice.name}`}
                      sx={{
                        display: "inline-flex",
                        gap: 0.5,
                        alignItems: "center",
                        fontWeight: 700,
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: slice.fill,
                        }}
                      />
                      {slice.value}
                      {slice.name[0]}
                    </Typography>
                  ))}
                </Stack>
              </Stack>
            ))}
          </Box>
        </Card>
        </Box>
      </Box>
    </Stack>
  );
}
