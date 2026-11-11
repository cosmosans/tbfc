import { opponentName, seasonName } from "../../clubView";
import { isMatchCompleted, type ClubData } from "../../model";

export function timedGoals(data: ClubData) {
  const matches = new Map(data.matches.filter(isMatchCompleted).map(match => [match.id, match]));
  const players = new Map(data.players.map(player => [player.id, player.name]));
  return data.events.flatMap(event => {
    const match = matches.get(event.matchId);
    if (!match || event.kind !== "goal" || event.team === "opponent" ||
        event.minute == null || !Number.isFinite(event.minute) || event.minute < 0) return [];
    return [{
      id: event.id, minute: event.minute, date: match.date, opponent: opponentName(data, match),
      scorer: event.ownGoal ? "Opponent Own Goal" : players.get(event.playerId ?? "") || "Uncredited",
      season: seasonName(data, match) || "Unknown Season",
      half: event.minute <= 25 ? "First Half" : "Second Half", note: event.note,
    }];
  });
}
export type TimedGoal = ReturnType<typeof timedGoals>[number];

export function minuteBuckets(goals: TimedGoal[], played: number, perMatch: boolean) {
  const end = Math.max(50, ...goals.map(goal => goal.minute));
  const buckets = Array.from({ length: Math.ceil(end / 5) }, (_, i) => ({
    label: `${i === 0 ? 0 : i * 5 + 1}–${(i + 1) * 5}′`, goals: 0,
  }));
  for (const goal of goals) buckets[Math.max(0, Math.ceil(goal.minute / 5) - 1)].goals++;
  return buckets.map(bucket => ({
    ...bucket, goals: perMatch && played ? Number((bucket.goals / played).toFixed(2)) : bucket.goals,
  }));
}
