import {
  Alert,
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
import { CardGrid } from "../../components/layout";
import RecordBar from "../../components/RecordBar";

export default function Stats({ data }: { data: ClubData }) {
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
            Goals by season
          </Typography>
          <Box sx={{ width: "100%", height: 320 }}>
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
        </CardContent>
      </Card>
      <CardGrid>
        {seasons.map((s) => (
          <Card key={s.season}>
            <CardContent>
              <Typography variant="h6">{s.season}</Typography>
              <Box sx={{ my: 1.5 }}>
                <RecordBar
                  variant="results"
                  wins={s.W}
                  draws={s.D}
                  losses={s.L}
                />
              </Box>
              <Typography color="text.secondary">
                {s.for} Scored · {s.against} Allowed
              </Typography>
            </CardContent>
          </Card>
        ))}
      </CardGrid>
      <Alert severity="info">
        Player career totals include the historical player sheet and new
        recorded match events. Historical totals are not assigned to individual
        matches.
      </Alert>
    </Stack>
  );
}
