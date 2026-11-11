export const matchTabs = [
  "lineup",
  "events",
  "story",
  "chat",
  "media",
  "matchboard",
] as const;
export type MatchTab = (typeof matchTabs)[number];

export function visibleMatchTabs(scheduled: boolean, manager: boolean) {
  return matchTabs.filter(tab => (manager || (tab !== "matchboard" && tab !== "chat")) &&
    (!scheduled || tab === "lineup" || tab === "matchboard"));
}

/** Keep older shared links working while using the visible tab names in new URLs. */
export function normalizeMatchTab(
  value: string | null,
  scheduled: boolean,
  manager: boolean,
): MatchTab {
  const tab =
    value === "history" ? "story" : value === "board" ? "matchboard" : value;
  return visibleMatchTabs(scheduled, manager).find((item) => item === tab) ?? "lineup";
}
