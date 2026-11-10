import type { MatchEvent } from "../../model";

export function compareMatchEvents(a: MatchEvent, b: MatchEvent) {
  const minuteOrder = (a.minute ?? Infinity) - (b.minute ?? Infinity);
  return minuteOrder || Number(a.kind === "assist") - Number(b.kind === "assist");
}
