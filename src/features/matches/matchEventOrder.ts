import type { MatchEvent } from "../../model";

export function compareMatchEvents(a: MatchEvent, b: MatchEvent) {
  const afterWhistle = Number(a.kind === "clean_sheet") - Number(b.kind === "clean_sheet");
  if (afterWhistle) return afterWhistle;
  const minuteOrder = (a.minute ?? Infinity) - (b.minute ?? Infinity);
  return minuteOrder || Number(a.kind === "assist") - Number(b.kind === "assist");
}
