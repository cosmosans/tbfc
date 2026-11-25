import matchConfirmMarkup from "./matchConfirm.html?raw";
import type { Fixture } from "./opponentSquads";
import {
  selectableDivisions,
  preferredDivision,
  profiles,
  type Division,
} from "./difficulty";
export const settingsOptions = {
  difficulty: selectableDivisions,
  speed: [20, 10, 5],
  time: ["Day", "Evening", "Night"],
  weather: ["Sun", "Clouds", "Rain", "Snow"],
} as const;
export type MatchSettings = {
  difficulty: Division;
  speed: 5 | 10 | 20;
  time: "Day" | "Evening" | "Night";
  weather: "Sun" | "Clouds" | "Rain" | "Snow";
};
export const defaultSettings = (): MatchSettings => ({
  difficulty: preferredDivision(),
  speed: 10,
  time: "Day",
  weather: "Sun",
});
export const halfMinutesForSpeed: Record<MatchSettings["speed"], number> = {
  5: 5,
  10: 3.5,
  20: 2,
};
export const halfDurationLabel = (speed: MatchSettings["speed"]) =>
  `${halfMinutesForSpeed[speed]} min`;

export function matchConfirmDialog(
  fixture: Fixture,
  settings: MatchSettings,
  skipWarmup: boolean,
) {
  const template = document.createElement("template");
  template.innerHTML = matchConfirmMarkup;
  const dialog = template.content.querySelector("dialog")!;
  const option = template.content
    .querySelector<HTMLTemplateElement>("#match-setting-option")!
    .content.querySelector("button")!;

  for (const side of ["home", "away"] as const) {
    const club = dialog.querySelector(`[data-club="${side}"]`)!;
    club.querySelector("img")!.src = fixture[side].crest;
    club.querySelector("strong")!.textContent = fixture[side].name;
  }
  for (const group of dialog.querySelectorAll<HTMLElement>("[data-options]")) {
    const key = group.dataset.options as keyof MatchSettings;
    for (const value of settingsOptions[key]) {
      const button = option.cloneNode(true) as HTMLButtonElement;
      button.dataset.setting = key;
      button.value = String(value);
      button.setAttribute("aria-pressed", String(settings[key] === value));
      if (typeof value === "number")
        button.textContent = halfDurationLabel(value);
      else if (key === "difficulty")
        button.textContent =
          value === "beginners" ? "Beginners" : value.toUpperCase();
      else button.textContent = value;
      group.append(button);
    }
  }
  dialog.querySelector(".lu-division-detail")!.textContent =
    profiles[settings.difficulty].label;
  return dialog;
}
