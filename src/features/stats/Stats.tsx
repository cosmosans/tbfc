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
  LabelList,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "@mui/material/styles";
import type { ClubData } from "../../model";
import { record } from "../../model";
import { opponentFor, opponentName, orderedSeasons } from "../../clubView";
import Seasons from "../seasons/Seasons";

function TeamCrestTick({ x = 0, y = 0, payload, teams }: {
  x?: number;
  y?: number;
  payload?: { value: string };
  teams: { team: string; crestUrl?: string }[];
}) {
  const team = teams.find((item) => item.team === payload?.value);
  const [failedUrl, setFailedUrl] = useState("");
  const crest = team?.crestUrl;
  return (
    <g transform={`translate(${x - 44}, ${y - 18})`} role="img" aria-label={payload?.value}>
      <title>{payload?.value}</title>
      {crest && crest !== failedUrl ? (
        <image href={crest} width={36} height={36} preserveAspectRatio="xMidYMid meet" onError={() => setFailedUrl(crest)} />
      ) : (
        <>
          <circle cx={18} cy={18} r={17} fill="#394144" />
          <text x={18} y={18} dy=".35em" textAnchor="middle" fill="#fff" fontSize={12}>
            {payload?.value.split(/\s+/).slice(0, 2).map((word) => word[0]).join("")}
          </text>
        </>
      )}
    </g>
  );
}

export default function Stats({ data, update, openSeason }: {
  data: ClubData;
  update: (data: ClubData) => void;
  openSeason: (id: string) => void;
}) {
  const theme = useTheme();
  const [metric, setMetric] = useState<"results" | "goals" | "teams">("results");
  const seasons = orderedSeasons(data, false).map((s) => ({
    season: s.name,
    ...record(
      data.matches.filter(
        (m) => m.seasonId === s.id || (!m.seasonId && m.season === s.name),
      ),
    ),
  }));
  const opponentCounts = new Map<string, { team: string; played: number; crestUrl?: string; color?: string }>();
  for (const match of data.matches) {
    if (match.status === "scheduled") continue;
    const team = opponentName(data, match).trim();
    if (!team) continue;
    const key = opponentFor(data, match)?.id ?? team.toLowerCase();
    const current = opponentCounts.get(key);
    opponentCounts.set(key, { team, color: opponentFor(data, match)?.color, crestUrl: opponentFor(data, match)?.crestUrl, played: (current?.played ?? 0) + 1 });
  }
  const teams = [...opponentCounts.values()].sort((a, b) => b.played - a.played || a.team.localeCompare(b.team));
  return (
    <Stack gap={2}>
      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2} sx={{ mb: 1 }}>
            <Typography variant="h6">{metric === "teams" ? "Most Played Teams" : "By Season"}</Typography>
            <Select
              size="small"
              value={metric}
              onChange={(event) => setMetric(event.target.value as "results" | "goals" | "teams")}
              inputProps={{ "aria-label": "Chart metric" }}
              sx={{ minWidth: 145, fontSize: ".875rem" }}
            >
              <MenuItem value="results">Results</MenuItem>
              <MenuItem value="goals">Goal Differential</MenuItem>
              <MenuItem value="teams">Most Played Teams</MenuItem>
            </Select>
          </Stack>
          {metric === "teams" ? (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Completed matches across all seasons</Typography>
              {teams.length ? (
                <Box sx={{ width: "100%", height: Math.max(240, teams.length * 44 + 48) }}>
                  <ResponsiveContainer>
                    <BarChart data={teams} layout="vertical" accessibilityLayer margin={{ top: 8, right: 36, left: 0, bottom: 8 }} barSize={24}>
                      <CartesianGrid stroke="#394144" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} stroke="#a7afb1" />
                      <YAxis type="category" dataKey="team" width={60} interval={0} axisLine={false} tickLine={false} tick={<TeamCrestTick teams={teams} />} />
                      <Tooltip cursor={{ fill: "#38383880" }} contentStyle={{ background: "#1b2022", border: "1px solid #394144" }} />
                      <Bar dataKey="played" name="Matches Played" fill={theme.palette.primary.main} isAnimationActive={false}>
                        {teams.map((team) => <Cell key={team.team} fill={team.color || theme.palette.primary.main} />)}
                        <LabelList dataKey="played" position="right" fill="#fff" fontWeight={800} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              ) : <Typography color="text.secondary">No completed matches yet.</Typography>}
            </>
          ) : <Box sx={{ width: "100%", overflowX: "auto" }}>
          <Box sx={{ minWidth: Math.max(600, seasons.length * 110), height: 380 }}>
            <ResponsiveContainer>
              <BarChart
                key={metric}
                data={seasons}
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
                <YAxis stroke="#a7afb1" allowDecimals={false} label={{ value: metric === "results" ? "Matches" : "Goals", angle: -90, position: "insideLeft", fill: "#a7afb1" }} />
                <Legend verticalAlign="top" height={32} itemSorter={null} />
                <Tooltip
                  cursor={{ fill: "#38383880" }}
                  contentStyle={{
                    background: "#1b2022",
                    border: "1px solid #394144",
                  }}
                />
                {metric === "results" ? ([
                  ["W", "Wins", theme.palette.success.main, "#111"],
                  ["D", "Draws", "#4a4a4a", "#fff"],
                  ["L", "Losses", theme.palette.error.main, "#fff"],
                ] as const).map(([key, name, fill, text]) => (
                  <Bar key={key} dataKey={key} name={name} stackId="results" fill={fill} stroke={theme.palette.background.paper} strokeWidth={4} isAnimationActive={false}>
                    <LabelList dataKey={key} position="center" fill={text} fontWeight={800} fontSize={13} formatter={(value) => Number(value) > 0 ? `${value}${key}` : ""} />
                  </Bar>
                )) : (
                  <>
                    <Bar dataKey="for" name="Goals Scored" fill={theme.palette.primary.main} isAnimationActive={false}>
                      <LabelList dataKey="for" position="top" fill="#fff" fontWeight={800} fontSize={13} />
                    </Bar>
                    <Bar dataKey="against" name="Goals Allowed" fill={theme.palette.secondary.main} isAnimationActive={false}>
                      <LabelList dataKey="against" position="top" fill="#fff" fontWeight={800} fontSize={13} />
                    </Bar>
                  </>
                )}
              </BarChart>
            </ResponsiveContainer>
          </Box>
          </Box>}
        </CardContent>
      </Card>
      <Seasons data={data} update={update} openSeason={openSeason} />
    </Stack>
  );
}
