import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Select,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import {
  Bar,
  Cell,
  BarChart,
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
import Seasons from "../seasons/Seasons";

function TeamCrestTick({
  x = 0,
  y = 0,
  payload,
  teams,
  onOpenTeam,
}: {
  x?: number;
  y?: number;
  payload?: { value: string };
  teams: { team: string; id?: string; crestUrl?: string }[];
  onOpenTeam: (id: string) => void;
}) {
  const team = teams.find((item) => item.team === payload?.value);
  const [failedUrl, setFailedUrl] = useState("");
  const crest = team?.crestUrl;
  const open = () => { if (team?.id) onOpenTeam(team.id); };
  return (
    <g
      transform={`translate(${x - 18}, ${y + 8})`}
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
  update,
  openSeason,
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
    "teamGoals" | "goalsFor" | "goalsAgainst"
  >("teamGoals");
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
  const chartTeams =
    opponentMetric === "teamGoals"
      ? [...teams].sort(
          (a, b) =>
            b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst) ||
            a.team.localeCompare(b.team),
        )
      : opponentMetric === "goalsFor"
        ? [...teams].sort(
            (a, b) => b.goalsFor - a.goalsFor || a.team.localeCompare(b.team),
          )
        : opponentMetric === "goalsAgainst"
          ? [...teams].sort(
              (a, b) => b.goalsAgainst - a.goalsAgainst || a.team.localeCompare(b.team),
            )
          : teams;
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
        <Card sx={{ minWidth: 0, width: "100%" }}>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              gap={2}
              sx={{ mb: 1 }}
            >
              <Typography variant="h6">Opponents</Typography>
              <Select
                size="small"
                value={opponentMetric}
                onChange={(event) =>
                  setOpponentMetric(
                    event.target.value as "teamGoals" | "goalsFor" | "goalsAgainst",
                  )
                }
                inputProps={{ "aria-label": "Opponent chart metric" }}
                sx={{ minWidth: 145, fontSize: ".875rem" }}
              >
                <MenuItem value="teamGoals">Goal Differential</MenuItem>
                <MenuItem value="goalsFor">Goals Scored</MenuItem>
                <MenuItem value="goalsAgainst">Goals Allowed</MenuItem>
              </Select>
            </Stack>
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {opponentMetric === "teamGoals"
                  ? "GD across all seasons. Turf Burners goals first, opponent goals second."
                  : opponentMetric === "goalsFor"
                    ? " Goals scored by TBFC against each opponent across all seasons."
                    : opponentMetric === "goalsAgainst"
                      ? "Goals scored against TBFC by each opponent across all seasons."
                      : ""}
              </Typography>
              {teams.length ? (
                <Box
                  sx={{
                    width: "100%",
                    overflowX: "auto",
                  }}
                >
                  <Box sx={{ minWidth: Math.max(600, teams.length * (opponentMetric === "teamGoals" ? 80 : 64)), height: 400 }}>
                  <ResponsiveContainer>
                    <BarChart
                      key={opponentMetric}
                      data={chartTeams}
                      accessibilityLayer
                      margin={{ top: 24, right: 16, left: 0, bottom: 8 }}
                      barSize={opponentMetric === "teamGoals" ? 12 : 24}
                      barGap={4}
                    >
                      <CartesianGrid stroke="#394144" vertical={false} />
                      <XAxis
                        type="category"
                        dataKey="team"
                        height={60}
                        interval={0}
                        tickLine={false}
                        stroke="#a7afb1"
                        tick={<TeamCrestTick teams={teams} onOpenTeam={openTeam} />}
                      />
                      <YAxis type="number" allowDecimals={false} stroke="#a7afb1" />
                      <Tooltip
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
                            name="Turf Burners FC goals"
                            fill={theme.palette.primary.main}
                            isAnimationActive={false}
                            cursor="pointer"
                            onClick={(entry) => openTeam(entry.payload?.id)}
                          >
                            <LabelList
                              dataKey="goalsFor"
                              position="top"
                              fill="#fff"
                              fontWeight={800}
                            />
                          </Bar>
                          <Bar
                            minPointSize={3}
                            dataKey="goalsAgainst"
                            name="Opponent goals"
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
                              position="top"
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
                          dataKey={
                            opponentMetric === "goalsFor"
                              ? "goalsFor"
                              : "goalsAgainst"
                          }
                          name={
                            opponentMetric === "goalsFor"
                              ? "TBFC Goals Scored"
                              : "Goals Allowed"
                          }
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
                            dataKey={
                              opponentMetric === "goalsFor"
                                ? "goalsFor"
                                : "goalsAgainst"
                            }
                            position="top"
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
                  No completed matches yet.
                </Typography>
              )}
            </>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 0, width: "100%", "@media (min-width: 1080px)": { width: "calc((100% - 16px) / 2)" } }}> 
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              gap={2}
              sx={{ mb: 1 }}
            >
              <Typography variant="h6">Seasons</Typography>
              <Select
                size="small"
                value={metric}
                onChange={(event) =>
                  setMetric(
                    event.target.value as "results" | "goals" | "points",
                  )
                }
                inputProps={{ "aria-label": "Season chart metric" }}
                sx={{ minWidth: 145, fontSize: ".875rem" }}
              >
                <MenuItem value="results">Results</MenuItem>
                <MenuItem value="goals">Goal Differential</MenuItem>
                <MenuItem value="points">Points</MenuItem>
              </Select>
            </Stack>
            {metric === "points" && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Total points per season: 3 × wins + draws. Seasons without
                completed matches are excluded.
              </Typography>
            )}
            {metric === "points" && !seasonPoints.length && (
              <Typography color="text.secondary">
                No completed matches yet.
              </Typography>
            )}
            <Box sx={{ width: "100%", overflowX: "auto" }}>
              <Box
                sx={{
                  minWidth: Math.max(600, seasons.length * 110),
                  height: 380,
                }}
              >
                <ResponsiveContainer>
                  <ComposedChart
                    key={metric}
                    data={metric === "points" ? seasonPoints : seasons}
                    accessibilityLayer
                    maxBarSize={64}
                    margin={{ top: 12, right: 12, left: 0, bottom: 30 }}
                  >
                    <CartesianGrid stroke="#394144" vertical={false} />
                    <XAxis
                      dataKey="season"
                      stroke="#a7afb1"
                      angle={-25}
                      textAnchor="end"
                      height={80}
                      interval={0}
                    />
                    <YAxis
                      stroke="#a7afb1"
                      allowDecimals={false}
                      label={{
                        value:
                          metric === "points"
                            ? "Total points"
                            : metric === "results"
                              ? "Matches"
                              : "Goals",
                        angle: -90,
                        position: "insideLeft",
                        fill: "#a7afb1",
                      }}
                    />
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
                          position="top"
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
                            position="top"
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
                            position="top"
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
      </Box>
      <Seasons data={data} update={update} openSeason={openSeason} />
    </Stack>
  );
}
