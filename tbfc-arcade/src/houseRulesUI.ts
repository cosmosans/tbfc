import { screen } from "./kickOff";
import { padBadge } from "./screenUI";
import {
  houseDefaults,
  houseModifiers,
  modifierInfo,
  validateHouse,
  houseSummary,
  builtInHousePresets,
  readHousePresets,
  saveHousePreset,
  deleteHousePreset,
  randomHouse,
  type HouseConfig,
} from "./houseRules";
import "./houseRules.css";
import { settingsOptions, type MatchSettings } from "./matchSettings";
import { courtPresets, type CourtPreset } from "./matchRules";
const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
const options = {
  format: ["classic", "street3", "street5"],
  lifecycle: ["timed", "target", "golden"],
  halfMinutes: [2, 3.5, 5],
  target: [3, 5, 10, 15],
  scoring: ["standard", "longRange", "airBalls"],
  speed: [0.65, 1, 1.25, 1.5],
  traction: ["normal", "slippery", "ice"],
  gravity: [0.4, 0.7, 1, 1.25],
  ball: ["light", "normal", "heavy"],
} as const;
const names: Record<string, string> = {
  classic: "Classic 7v7",
  street3: "Street 3v3",
  street5: "Street 5v5",
  timed: "Timed match",
  target: "First to target",
  golden: "Golden Goal",
  standard: "Standard",
  longRange: "Long Range",
  airBalls: "Air Balls",
  normal: "Normal",
  slippery: "Slippery",
  ice: "Black Ice",
  light: "Light",
  heavy: "Heavy",
};
export function houseBuilder(
  initial: HouseConfig = houseDefaults(),
): Promise<HouseConfig | null> {
  return screen((root, finish) => {
    root.classList.add("house-screen", "house-builder");
    root.setAttribute("aria-label", "House Rules builder");
    let { config, issues } = validateHouse(initial),
      category = "Format",
      selectedId: string | undefined;
    const categories = [
      "Format",
      "Player Mods",
      "Environment",
      "Rules",
      "Presets",
    ];
    const valuesFor = (
      key: keyof typeof options,
    ): readonly (string | number)[] =>
      config.format !== "classic" && key === "scoring"
        ? ["standard"]
        : config.format !== "classic" && key === "gravity"
          ? [1]
          : options[key];
    const field = (
      key: keyof typeof options,
      label: string,
      description: string,
    ) => {
      const values = valuesFor(key);
      return `<fieldset class="house-setting"><legend>${label}</legend><div class="house-options">${values
        .map((value, index) => {
          const display =
            typeof value === "number"
              ? key === "speed" || key === "gravity"
                ? Math.round(value * 100) + "%"
                : String(value)
              : (names[value] ?? value);
          return `<button type="button" data-field="${key}" data-option="${index}" aria-pressed="${config[key] === value}" ${values.length === 1 ? "disabled" : ""}>${escape(display)}</button>`;
        })
        .join("")}</div><small>${description}</small></fieldset>`;
    };
    const toggle = (
      id: string,
      label: string,
      description: string,
      checked: boolean,
      disabled = false,
    ) =>
      `<button class="house-toggle" data-toggle="${id}" aria-pressed="${checked}" ${disabled ? "disabled" : ""}><b>${label}</b><strong>${checked ? "ON" : "OFF"}</strong><small>${description}${disabled ? " Requires Classic 7v7." : ""}</small></button>`;
    function draw(focus?: string) {
      let fields = "";
      if (category === "Format")
        fields = field(
          "format",
          "Team format",
          "Classic uses six regular pitches and keepers. Street uses The Gulch, mini goals and rebound walls.",
        );
      if (category === "Format")
        fields +=
          field(
            "lifecycle",
            "Win condition",
            "Golden Goal ends on the first valid goal. Target scores count points, including weighted goals.",
          ) +
          (config.lifecycle === "timed"
            ? field(
                "halfMinutes",
                "Minutes per half",
                "Normal halftime and side switching.",
              )
            : config.lifecycle === "target"
              ? field(
                  "target",
                  "Goals to win",
                  "No clock or halftime. A two-point winner may exceed the target.",
                )
              : "");
      if (category === "Format")
        fields += field(
          "scoring",
          "Scoring profile",
          "Air Balls includes free kicks and penalties.",
        );
      if (category === "Environment")
        fields =
          field(
            "speed",
            "Gameplay speed",
            "Changes on-pitch action, not menu speed.",
          ) +
          field(
            "traction",
            "Player traction",
            "Slipperiness is independent of weather.",
          ) +
          field(
            "gravity",
            "Ball gravity",
            "Moon 40% · Low 70% · Normal 100% · Heavy 125%. Street uses normal gravity.",
          ) +
          field(
            "ball",
            "Ball responsiveness",
            "Light travels faster; heavy shots and passes need more effort.",
          ) +
          toggle(
            "snow",
            "Start fully snow-covered",
            "Outdoor Classic stadiums only. Traction is configured separately.",
            config.snow,
            config.format !== "classic",
          );
      if (category === "Player Mods" || category === "Rules") {
        const discipline = ["noRules", "survival"];
        fields = houseModifiers
          .filter(([id]) => discipline.includes(id) === (category === "Rules"))
          .map(([id, label]) =>
            toggle(
              id,
              label,
              modifierInfo(id).description,
              config.modifiers.includes(id) ||
                (id === "aerialAssist" && config.scoring === "airBalls"),
              config.format !== "classic" &&
                ["theWall", "weakKeepers", "survival", "aerialAssist"].includes(
                  id,
                ),
            ),
          )
          .join("");
      }
      if (category === "Presets")
        fields = `<label class="house-name">Preset name<input type="text" data-name maxlength="40" value="${escape(config.name)}" placeholder="My House Rules"></label><div class="house-actions"><button data-action="save">${selectedId ? "Overwrite selected preset" : "Save new preset"}</button><button data-action="duplicate">Save a copy</button>${selectedId ? '<button data-action="delete">Delete selected preset</button>' : ""}</div><h3>Built-in presets</h3>${builtInHousePresets.map((p, i) => `<button data-built="${i}">${escape(p.name)}</button>`).join("")}<h3>Your presets</h3>${
          readHousePresets()
            .map(
              (p) =>
                `<button data-saved="${escape(p.id)}">${escape(validateHouse(p.config).config.name)}</button>`,
            )
            .join("") || "<p>No saved presets yet.</p>"
        }`;
      root.innerHTML = `<div class="house-shell"><h1>HOUSE RULES</h1><div class="house-layout"><nav aria-label="Rules categories"><button class="house-bumper" data-tab-step="-1" data-pad-button="4" aria-label="Previous tab">${padBadge("LB")}</button><div class="house-tabs">${categories.map((c) => `<button data-category="${c}" aria-pressed="${c === category}">${c}</button>`).join("")}</div><button class="house-bumper" data-tab-step="1" data-pad-button="5" aria-label="Next tab">${padBadge("RB")}</button></nav><section class="house-fields" aria-label="${category}">${fields}</section><aside aria-label="Current rules"><h2>YOUR RULES</h2><ul>${houseSummary(
        config,
      )
        .slice(1)
        .map((s) => `<li>${escape(s)}</li>`)
        .join(
          "",
        )}</ul><p class="house-notice" role="status">${issues.map(escape).join(" ")}</p></aside></div><footer class="menu-legend controller-legend"><button data-back>${padBadge("B")} Back</button><span>${padBadge("LS")} Cursor</span><span>${padBadge("A")} Click</span><button data-action="random" data-pad-button="2">${padBadge("X")} Randomize</button><button data-action="reset" data-pad-button="3">${padBadge("Y")} Reset</button><button data-next>${padBadge("Menu")} Continue</button></footer></div>`;
      if (focus) root.querySelector<HTMLElement>(focus)?.focus();
    }
    function commit(value: unknown, focus?: string) {
      const checked = validateHouse(value);
      config = checked.config;
      issues = checked.issues;
      draw(focus);
    }
    root.oninput = (e) => {
      const input = e.target as HTMLInputElement;
      if (input.hasAttribute("data-name")) {
        config.name = input.value;
        return;
      }
    };
    root.onclick = (e) => {
      const b = (e.target as HTMLElement).closest<HTMLButtonElement>("button");
      if (!b || b.disabled) return;
      if (b.hasAttribute("data-back")) finish(null);
      else if (b.hasAttribute("data-next"))
        finish(validateHouse(config).config);
      else if (b.dataset.tabStep) {
        category =
          categories[
            (categories.indexOf(category) +
              Number(b.dataset.tabStep) +
              categories.length) %
              categories.length
          ];
        draw(`[data-category="${category}"]`);
      } else if (b.dataset.category) {
        category = b.dataset.category;
        draw(`[data-category="${category}"]`);
      } else if (b.dataset.field) {
        const key = b.dataset.field as keyof typeof options;
        const value = valuesFor(key)[Number(b.dataset.option)];
        if (value !== undefined)
          commit(
            { ...config, [key]: value },
            `[data-field="${key}"][data-option="${b.dataset.option}"]`,
          );
      } else if (b.dataset.toggle) {
        const id = b.dataset.toggle;
        if (id === "snow") {
          commit({ ...config, snow: !config.snow }, '[data-toggle="snow"]');
          return;
        }
        if (id === "aerialAssist" && config.scoring === "airBalls") {
          issues = ["Air Balls scoring requires aerial assistance."];
          draw('[data-toggle="aerialAssist"]');
          return;
        }
        let mods = config.modifiers.filter((m) => m !== id);
        if (!config.modifiers.includes(id as any)) {
          if (id === "theWall") mods = mods.filter((m) => m !== "weakKeepers");
          if (id === "weakKeepers") mods = mods.filter((m) => m !== "theWall");
          mods.push(id as any);
        }
        commit({ ...config, modifiers: mods }, `[data-toggle="${id}"]`);
      } else if (b.dataset.built !== undefined) {
        selectedId = undefined;
        commit(
          builtInHousePresets[Number(b.dataset.built)],
          `[data-built="${b.dataset.built}"]`,
        );
      } else if (b.dataset.saved) {
        const p = readHousePresets().find((p) => p.id === b.dataset.saved);
        if (p) {
          selectedId = p.id;
          commit(p.config, `[data-saved="${p.id}"]`);
        }
      } else if (b.dataset.action) {
        const action = b.dataset.action;
        if (action === "reset") {
          selectedId = undefined;
          commit(houseDefaults(), '[data-action="reset"]');
        } else if (action === "random") {
          selectedId = undefined;
          commit(randomHouse(), '[data-action="random"]');
        } else
          try {
            if (action === "delete" && selectedId) {
              deleteHousePreset(selectedId);
              selectedId = undefined;
              issues = ["Preset deleted."];
            } else {
              const saved = saveHousePreset(
                { ...config, name: config.name || "My House Rules" },
                action === "save" ? selectedId : undefined,
              );
              selectedId = saved.id;
              config = saved.config;
              issues = ["Preset saved."];
            }
            draw('[data-action="save"]');
          } catch {
            issues = [
              "Unable to save presets in this browser. Your current rules are still ready to play.",
            ];
            draw();
          }
      }
    };
    draw('[data-category="Format"]');
  });
}
export function houseRulesReview(config: HouseConfig): Promise<boolean | null> {
  return screen((root, finish) => {
    root.classList.add("house-screen");
    root.innerHTML = `<div class="house-review"><h1>HOUSE RULES</h1><p class="house-rules-text">${houseSummary(config).slice(1).map(escape).join(' • ')}</p><div class="menu-legend controller-legend"><button data-back>${padBadge("B")} Edit Rules</button><button data-next>${padBadge("Menu")} Play Match</button></div></div>`;
    root.querySelector<HTMLButtonElement>("[data-back]")!.onclick = () =>
      finish(null);
    root.querySelector<HTMLButtonElement>("[data-next]")!.onclick = () =>
      finish(true);
  });
}
export function houseEnvironment(
  config: HouseConfig,
  initial: MatchSettings,
  initialCourt: CourtPreset,
  outdoor: boolean,
): Promise<{ settings: MatchSettings; court: CourtPreset } | null> {
  return screen((root, finish) => {
    root.classList.add("house-screen");
    const settings = {
      ...initial,
      weather: config.snow ? "Snow" : outdoor ? initial.weather : "Sun",
    } as MatchSettings;
    let court = initialCourt;
    const group = (key: "time" | "weather" | "difficulty") =>
      `<fieldset><legend>${key === "time" ? "Time of day" : key}</legend>${settingsOptions[
        key
      ]
        .filter(
          (v) =>
            key !== "weather" ||
            (!config.snow && outdoor) ||
            v === settings.weather,
        )
        .map(
          (v) =>
            `<button data-setting="${key}" data-value="${v}" aria-pressed="${settings[key] === v}">${v.toUpperCase()}</button>`,
        )
        .join("")}</fieldset>`;
    function draw(focus?: string) {
      root.innerHTML = `<div class="house-review house-environment"><h1>MATCH SETTINGS</h1>${group("time")}${group("weather")}${group("difficulty")}${config.format !== "classic" ? `<fieldset><legend>Court colour</legend>${courtPresets.map((c) => `<button data-court="${c.id}" aria-pressed="${c.id === court}">${c.name}</button>`).join("")}</fieldset>` : ""}<div class="menu-legend controller-legend"><button data-back>${padBadge("B")} Back</button><span>${padBadge("LS")} Move</span><span>${padBadge("A")} Select</span><button data-next>${padBadge("Menu")} Review Rules</button></div></div>`;
      if (focus) root.querySelector<HTMLElement>(focus)?.focus();
    }
    root.onclick = (e) => {
      const b = (e.target as HTMLElement).closest<HTMLButtonElement>("button");
      if (!b || b.disabled) return;
      if (b.hasAttribute("data-back")) finish(null);
      else if (b.hasAttribute("data-next")) finish({ settings, court });
      else if (b.dataset.court) {
        court = b.dataset.court as CourtPreset;
        draw(`[data-court="${court}"]`);
      } else if (b.dataset.setting) {
        const key = b.dataset.setting as "time" | "weather" | "difficulty";
        Object.assign(settings, { [key]: b.dataset.value });
        draw(`[data-setting="${key}"][data-value="${b.dataset.value}"]`);
      }
    };
    draw();
  });
}
