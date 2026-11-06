import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ClubData } from "../../model";
import { record } from "../../model";
import { orderedSeasons } from "../../clubView";
import Seasons from "../seasons/Seasons";

export default function Stats({ data, update, openSeason }: {
  data: ClubData;
  update: (data: ClubData) => void;
  openSeason: (id: string) => void;
}) {
  const seasons = orderedSeasons(data, false).map((s) => ({
    season: s.name,
    ...record(
      data.matches.filter(
        (m) => m.seasonId === s.id || (!m.seasonId && m.season === s.name),
      ),
    ),
  }));
  return (
    <Stack gap={2}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Goals by Season
          </Typography>
          <Box sx={{ width: "100%", overflowX: "auto" }}>
          <Box sx={{ minWidth: 600, height: 320 }}>
            <ResponsiveContainer>
              <BarChart
                data={seasons}
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
                <YAxis stroke="#a7afb1" />
                <Tooltip
                  contentStyle={{
                    background: "#1b2022",
                    border: "1px solid #394144",
                  }}
                />
                <Bar dataKey="for" name="Scored" fill="#f47730" />
                <Bar dataKey="against" name="Allowed" fill="#8fc7a2" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
          </Box>
        </CardContent>
      </Card>
      <Seasons data={data} update={update} openSeason={openSeason} />
    </Stack>
  );
}
