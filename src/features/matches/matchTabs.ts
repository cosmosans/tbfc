export const matchTabs = ["lineup", "events", "story", "matchboard"] as const;
export type MatchTab = (typeof matchTabs)[number];

/** Keep older shared links working while using the visible tab names in new URLs. */
export function normalizeMatchTab(value: string | null, scheduled = false): MatchTab {
  const tab = value === "history" ? "story" : value === "board" ? "matchboard" : value;
  if (scheduled && tab !== "matchboard") return "lineup";
  return matchTabs.find((item) => item === tab) ?? "lineup";
}
