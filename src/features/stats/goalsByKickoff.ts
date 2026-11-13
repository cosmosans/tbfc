import moment from "moment";
import { isMatchCompleted, scoreResult, type Match } from "../../model";

export function goalsByKickoff(matches: Match[]) {
  const totals = new Map<number, { time: string; goals: number; points: number; played: number }>();
  for (const match of matches) {
    if (!isMatchCompleted(match)) continue;
    const time = moment(match.kickoff?.trim().toUpperCase(), ["h:mm A", "hh:mm A", "h:mmA", "hh:mmA", "H:mm", "HH:mm"], true);
    if (!time.isValid()) continue;
    const minute = time.hours() * 60 + time.minutes();
    const bucket = totals.get(minute) ?? { time: time.format("h:mm A"), goals: 0, points: 0, played: 0 };
    bucket.goals += match.goalsFor;
    const result = scoreResult(match);
    bucket.points += { W: 3, D: 1, L: 0 }[result];
    bucket.played += 1;
    totals.set(minute, bucket);
  }
  return [...totals.entries()].sort(([a], [b]) => a - b).map(([, bucket]) => bucket);
}
