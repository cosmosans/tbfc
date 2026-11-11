import { useState } from "react";
import { Box, MenuItem, Select, Stack, Tooltip, Typography } from "@mui/material";
import type { TimedGoal } from "./timedGoals";

export default function GoalTimeline({ goals }: { goals: TimedGoal[] }) {
  const [axis, setAxis] = useState<"all" | "scorer">("all");
  const [color, setColor] = useState<"scorer" | "half" | "season">("half");
  const rows = new Map<string, TimedGoal[]>();
  for (const goal of goals) {
    const key = axis === "all" ? "All Matches" : goal.scorer;
    const row = rows.get(key) ?? [];
    row.push(goal);
    rows.set(key, row);
  }
  const groups = [...new Set(goals.map(goal => goal[color]))].sort();
  const colors = new Map(groups.map((group, index) => [group,
    index === 0 ? "#ee7842" : `hsl(${(index * 137 + 24) % 360} 65% 65%)`]));
  const max = Math.ceil(Math.max(50, ...goals.map(g => g.minute)) / 5) * 5;
  if (!goals.length) return <Typography>No goals with recorded minutes yet.</Typography>;
  return <Stack gap={2}>
    <Stack direction="row" flexWrap="wrap" gap={1.5}>{groups.map(group =>
      <Typography variant="caption" key={group}><Box component="span" sx={{ color: colors.get(group) }}>● </Box>{group}</Typography>)}</Stack>
    <Box sx={{ maxHeight: 440, overflow: "auto" }}>
      <Box sx={{ minWidth: max * 13 + (axis === "scorer" ? 104 : 0) + 32, px: 2 }}>
        {[...rows.keys()].sort().map(key => {
          const counts = new Map<number, number>();
          const dots = [...rows.get(key)!].sort((a,b) => a.date.localeCompare(b.date)).map(goal => {
            const lane = counts.get(goal.minute) ?? 0;
            counts.set(goal.minute, lane + 1);
            const detail = `${goal.minute}′ · ${goal.scorer} · vs ${goal.opponent} · ${goal.date} · ${goal.season}${goal.note ? " · " + goal.note : ""}`;
            return <Tooltip key={goal.id} title={detail} arrow><Box tabIndex={0} aria-label={detail}
              sx={{ position: "absolute", left: (goal.minute / max * 100) + "%", bottom: 4 + lane * 15, width: 11, height: 11,
                borderRadius: "50%", transform: "translateX(-50%)", bgcolor: colors.get(goal[color]) }} /></Tooltip>;
          });
          return <Box key={key} sx={{ display: "grid", gridTemplateColumns: axis === "scorer" ? "104px 1fr" : "1fr", alignItems: "center", borderBottom: 1, borderColor: "divider" }}>
            {axis === "scorer" && <Typography variant="caption" sx={{ pr: 1 }}>{key}</Typography>}
            <Box sx={{ position: "relative", height: Math.max(30, Math.max(...counts.values()) * 15 + 12) }}>{dots}</Box>
          </Box>;
        })}
        <Box sx={{ position: "sticky", bottom: 0, bgcolor: "background.paper", ml: axis === "scorer" ? "104px" : 0, height: 26 }}>
          {Array.from({length: 6}, (_, i) => <Typography key={i} variant="caption" sx={{ position: "absolute", left: i * 20 + "%", transform: "translateX(-50%)" }}>{i * max / 5}′</Typography>)}
        </Box>
      </Box>
    </Box>
    <Stack direction="row" justifyContent="center" gap={1} flexWrap="wrap">
      <Select size="small" value={axis} inputProps={{ "aria-label": "Timeline rows" }} onChange={e => setAxis(e.target.value as typeof axis)}>
        <MenuItem value="all">All Matches</MenuItem><MenuItem value="scorer">By Player</MenuItem>
      </Select>
      <Select size="small" value={color} inputProps={{ "aria-label": "Goal color grouping" }} onChange={e => setColor(e.target.value as typeof color)}>
        <MenuItem value="half">Color by Half</MenuItem><MenuItem value="scorer">Color by Scorer</MenuItem><MenuItem value="season">Color by Season</MenuItem>
      </Select>
    </Stack>
  </Stack>;
}
