import type { Match } from "../../model";
import { scoreResult } from "../../model";

export function kickoffTime(match: Match): number | null {
  const parts = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(match.kickoff.trim());
  if (!parts || !/^\d{4}-\d{2}-\d{2}$/.test(match.date)) return null;
  const hour = Number(parts[1]);
  const minute = Number(parts[2]);
  if (hour < 1 || hour > 12 || minute > 59) return null;
  const [year, month, day] = match.date.split("-").map(Number);
  const start = new Date(
    year,
    month - 1,
    day,
    (hour % 12) + (parts[3].toUpperCase() === "PM" ? 12 : 0),
    minute,
  );
  return start.getFullYear() === year &&
    start.getMonth() === month - 1 &&
    start.getDate() === day
    ? start.getTime()
    : null;
}

export function matchPhase(match: Match, now: number) {
  const start = kickoffTime(match);
  if (start === null || now < start) return null;
  const elapsed = Math.floor((now - start) / 1000);
  if (elapsed >= 61 * 60)
    return {
      label: "FULL TIME",
      seconds: 50 * 60,
      status: "completed" as const,
    };
  if (elapsed >= 36 * 60)
    return {
      label: "SECOND HALF",
      seconds: Math.min(50 * 60, 25 * 60 + elapsed - 36 * 60),
      status: "in_progress" as const,
    };
  if (elapsed >= 26 * 60)
    return {
      label: "HALF TIME",
      seconds: 25 * 60,
      status: "in_progress" as const,
    };
  return {
    label: "FIRST HALF",
    seconds: Math.min(25 * 60, elapsed),
    status: "in_progress" as const,
  };
}

export function matchAtTime(match: Match, now: number): Match {
  if (match.status !== "scheduled" && match.status !== "in_progress")
    return match;
  const start = kickoffTime(match);
  if (
    match.status === "scheduled" &&
    (start === null || now - start > 24 * 60 * 60 * 1000)
  )
    return match;
  const phase = matchPhase(match, now);
  if (!phase || phase.status === match.status) return match;
  const changed = { ...match, status: phase.status };
  return {
    ...changed,
    resultLabel: phase.status === "completed" ? scoreResult(changed) : "",
  };
}
