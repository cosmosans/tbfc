import {
  classicRules,
  streetRules,
  streetPreferences,
  type MatchRules,
} from "./matchRules.ts";
import { standardPhysics, snowPhysics } from "./matchPhysics.ts";
import { mysteryModifiers } from "./mysteryMatch.ts";
export const houseModifiers = [
  ["inferno", "Infinite Burn"],
  ["secondWind", "Infinite Stamina"],
  ["noRules", "No Fouls"],
  ["survival", "Survival Eliminations"],
  ["theWall", "Super Keepers"],
  ["weakKeepers", "Weak Keepers"],
  ["superCurve", "Super Curve"],
  ["shootOnSight", "Enhanced Shooting"],
  ["aerialAssist", "Forgiving Aerials"],
  ["superSprint", "Super Sprint"],
] as const;
export type HouseModifier = (typeof houseModifiers)[number][0];
export type HouseConfig = {
  version: 1;
  name: string;
  format: "classic" | "street3" | "street5";
  lifecycle: "timed" | "target" | "golden";
  halfMinutes: 2 | 3.5 | 5;
  target: 3 | 5 | 10 | 15;
  scoring: "standard" | "longRange" | "airBalls";
  speed: 0.65 | 1 | 1.25 | 1.5;
  traction: "normal" | "slippery" | "ice";
  gravity: 0.4 | 0.7 | 1 | 1.25;
  ball: "light" | "normal" | "heavy";
  modifiers: HouseModifier[];
  snow: boolean;
};
export const houseDefaults = (): HouseConfig => ({
  version: 1,
  name: "My House Rules",
  format: "classic",
  lifecycle: "timed",
  halfMinutes: 3.5,
  target: 5,
  scoring: "standard",
  speed: 1,
  traction: "normal",
  gravity: 1,
  ball: "normal",
  modifiers: [],
  snow: false,
});
export const modifierInfo = (id: HouseModifier) => ({
  name: houseModifiers.find((m) => m[0] === id)?.[1] ?? id,
  description:
    mysteryModifiers.find((m) => m.id === id)?.description ??
    {
      survival: "Each goal removes one outfield player from the scoring team.",
      weakKeepers: "Keepers are easier to beat.",
      aerialAssist: "Easier aerial contact and first-time finishing.",
    }[id] ??
    "",
});
export function validateHouse(value: unknown): {
  config: HouseConfig;
  issues: string[];
} {
  const base = houseDefaults(),
    raw =
      value && typeof value === "object"
        ? (value as Record<string, unknown>)
        : {},
    issues: string[] = [];
  const config = { ...base, modifiers: [] as HouseModifier[] };
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
  for (const [key, values] of Object.entries(options)) {
    if (key in raw) {
      if ((values as readonly unknown[]).includes(raw[key]))
        (config as any)[key] = raw[key];
      else issues.push(`${key}: unsupported value replaced with its default.`);
    }
  }
  if (raw.version !== undefined && raw.version !== 1)
    issues.push(
      "This preset uses a different version; supported settings were recovered.",
    );
  config.name =
    typeof raw.name === "string"
      ? raw.name.trim().slice(0, 40) || base.name
      : base.name;
  config.snow = raw.snow === true;
  if (Array.isArray(raw.modifiers))
    for (const id of new Set(raw.modifiers)) {
      if (houseModifiers.some((m) => m[0] === id))
        config.modifiers.push(id as HouseModifier);
      else
        issues.push(
          `Unsupported modifier removed: ${String(id).slice(0, 40)}.`,
        );
    }
  if (
    config.modifiers.includes("theWall") &&
    config.modifiers.includes("weakKeepers")
  ) {
    config.modifiers = config.modifiers.filter((m) => m !== "weakKeepers");
    issues.push("Super goalkeepers replaces Weak goalkeepers.");
  }
  if (config.format !== "classic") {
    const removed = config.modifiers.filter((m) =>
      ["theWall", "weakKeepers", "survival", "aerialAssist"].includes(m),
    );
    config.modifiers = config.modifiers.filter((m) => !removed.includes(m));
    if (removed.length)
      issues.push(
        `Street does not support: ${removed.map((m) => modifierInfo(m).name).join(", ")}.`,
      );
    if (["longRange", "airBalls"].includes(config.scoring)) {
      config.scoring = "standard";
      issues.push(
        "Long Range and Air Balls scoring require a classic pitch. Standard scoring selected.",
      );
    }
    if (config.gravity !== 1) {
      config.gravity = 1;
      issues.push(
        "Street uses normal ball gravity to keep aerial balls within the court.",
      );
    }
    if (config.snow) {
      config.snow = false;
      issues.push("Full snow cover requires a Classic outdoor stadium.");
    }
  }
  return { config, issues };
}
export function resolveHouse(value: unknown) {
  const { config, issues } = validateHouse(value),
    has = (id: HouseModifier) => config.modifiers.includes(id);
  const base =
    config.format === "classic"
      ? classicRules()
      : streetRules({
          ...streetPreferences(),
          teamSize: config.format === "street3" ? 3 : 5,
        });
  const physics = {
    ...standardPhysics,
    ...(config.traction === "ice"
      ? snowPhysics
      : config.traction === "slippery"
        ? {
            traction: 0.65,
            acceleration: 0.9,
            deceleration: 0.65,
            slideDistance: 1.35,
            slideRecovery: 1.1,
          }
        : {}),
  };
  physics.ballSpeed =
    config.ball === "light" ? 1.15 : config.ball === "heavy" ? 0.8 : 1;
  physics.rollingResistance =
    config.ball === "light" ? 0.75 : config.ball === "heavy" ? 1.35 : 1;
  const rules: MatchRules = {
    ...base,
    mode: "houseRules",
    house: config,
    winCondition: config.lifecycle === "timed" ? "timed" : "target",
    targetScore: config.lifecycle === "golden" ? 1 : config.target,
    halfMinutes: config.halfMinutes,
    permanentBurn: has("inferno"),
    staminaDrain: config.lifecycle === "timed" ? base.staminaDrain : 0.7,
    capacityRecovery:
      config.lifecycle === "timed" ? base.capacityRecovery : 0.04,
  };
  return {
    config,
    issues,
    rules,
    physics,
    gravity: config.gravity,
    has,
    keeperFactor: has("theWall") ? 0.72 : has("weakKeepers") ? 1.2 : 1,
    aerial: config.scoring === "airBalls" || has("aerialAssist"),
  };
}
export function houseSummary(value: unknown): string[] {
  const { config: c } = validateHouse(value);
  const traction = { normal: "Normal", slippery: "Slippery", ice: "Black Ice" }[
    c.traction
  ];
  const ball = { light: "Light", normal: "Normal", heavy: "Heavy" }[c.ball];
  return [
    c.name,
    c.format === "classic"
      ? "Classic 7v7"
      : c.format === "street3"
        ? "Street 3v3"
        : "Street 5v5",
    c.lifecycle === "timed"
      ? `${c.halfMinutes} Minute Halves`
      : c.lifecycle === "golden"
        ? "Golden Goal"
        : `First to ${c.target} Points`,
    {
      standard: "Standard Scoring",
      longRange: "Long Range: Outside Goals Worth 2",
      airBalls: "Air Balls: Aerial Finishes and Set Pieces Only",
    }[c.scoring],
    ...c.modifiers
      .filter((m) => !(m === "aerialAssist" && c.scoring === "airBalls"))
      .map((m) => modifierInfo(m).name),
    `Speed ${Math.round(c.speed * 100)}%`,
    `${traction} Traction`,
    `Gravity ${Math.round(c.gravity * 100)}%`,
    `${ball} Ball`,
    ...(c.snow ? ["Full Snow Cover · Outdoor Stadiums Only"] : []),
  ];
}
const preset = (name: string, overrides: Partial<HouseConfig>) =>
  validateHouse({ ...houseDefaults(), name, ...overrides }).config;
export const builtInHousePresets = [
  preset("ABSOLUTE CARNAGE", {
    modifiers: ["inferno", "noRules", "secondWind"],
    speed: 1.5,
  }),
  preset("HELL HAS FROZEN OVER", {
    modifiers: ["inferno"],
    traction: "ice",
    snow: true,
  }),
  preset("LUNAR FOOTBALL", {
    gravity: 0.4,
    modifiers: ["aerialAssist", "superCurve"],
  }),
  preset("WORLDIE FACTORY", {
    scoring: "longRange",
    modifiers: ["shootOnSight", "superCurve", "secondWind"],
  }),
  preset("THE LAST BURNER", {
    lifecycle: "target",
    target: 10,
    modifiers: ["survival", "inferno"],
  }),
  preset("STREET FIGHT", {
    format: "street3",
    lifecycle: "target",
    target: 5,
    modifiers: ["noRules", "secondWind", "inferno"],
  }),
  preset("THE IMPOSSIBLE WALL", {
    modifiers: ["theWall", "aerialAssist", "superCurve"],
  }),
  preset("SUNDAY LEAGUE SIMULATOR", { speed: 0.65, ball: "heavy" }),
];
export type HousePreset = {
  id: string;
  created: string;
  updated: string;
  config: HouseConfig;
};
const storageKey = "tbfc.house.presets.v1";
export function readHousePresets(): HousePreset[] {
  try {
    const raw = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    return Array.isArray(raw)
      ? raw
          .filter((p) => p && typeof p.id === "string" && p.config)
          .slice(0, 50)
      : [];
  } catch {
    return [];
  }
}
export function saveHousePreset(value: unknown, id?: string): HousePreset {
  const presets = readHousePresets(),
    existing = presets.find((p) => p.id === id),
    now = new Date().toISOString();
  const result = {
    id: existing?.id ?? crypto.randomUUID(),
    created: existing?.created ?? now,
    updated: now,
    config: validateHouse(value).config,
  };
  localStorage.setItem(
    storageKey,
    JSON.stringify(
      [...presets.filter((p) => p.id !== result.id), result].slice(-50),
    ),
  );
  return result;
}
export function deleteHousePreset(id: string) {
  localStorage.setItem(
    storageKey,
    JSON.stringify(readHousePresets().filter((p) => p.id !== id)),
  );
}
// Shooting assistance takes the strongest benefit. planShot already applies a
// 1.15 accuracy bonus for its enhanced profile, so compensate before calling it.
export function houseShotProfile(
  config: HouseConfig,
  longShot: boolean,
  aerialAccuracy = 1,
) {
  const enhanced = config.modifiers.includes("shootOnSight"),
    profile = longShot || enhanced;
  const accuracy = Math.max(
    1,
    profile ? 1.15 : 1,
    enhanced ? 1 / 0.82 : 1,
    aerialAccuracy,
  );
  return {
    error: (profile ? 1.15 : 1) / accuracy,
    speed: Math.max(
      1,
      longShot ? 1.15 : 1,
      enhanced ? 1.15 : 1,
      aerialAccuracy > 1 ? 1.15 : 1,
    ),
  };
}
export function saveHouseResult(
  config: HouseConfig,
  result: {
    score: number[];
    goals: unknown[];
    elapsed: number;
    teams: string[];
  },
) {
  try {
    const key = "tbfc.house.results.v1",
      stored = JSON.parse(localStorage.getItem(key) ?? "[]");
    const records = Array.isArray(stored) ? stored : [];
    localStorage.setItem(
      key,
      JSON.stringify(
        [
          ...records,
          {
            mode: "houseRules",
            date: new Date().toISOString(),
            config: validateHouse(config).config,
            ...result,
            physicalGoals: result.goals.length,
          },
        ].slice(-50),
      ),
    );
  } catch {
    /* Match completion never depends on browser storage. */
  }
}
export function randomHouse(random = Math.random): HouseConfig {
  const pick = <T>(values: readonly T[]) =>
    values[Math.floor(random() * values.length)];
  const pool = [...houseModifiers]
    .sort(() => random() - 0.5)
    .slice(0, 2 + Math.floor(random() * 3))
    .map((m) => m[0]);
  return validateHouse({
    ...houseDefaults(),
    name: "RANDOM HOUSE",
    format: pick(["classic", "street3", "street5"]),
    lifecycle: pick(["timed", "target", "golden"]),
    scoring: pick(["standard", "longRange", "airBalls"]),
    target: pick([3, 5, 10, 15]),
    speed: pick([0.65, 1, 1.25, 1.5]),
    gravity: pick([0.4, 0.7, 1, 1.25]),
    traction: pick(["normal", "slippery", "ice"]),
    ball: pick(["light", "normal", "heavy"]),
    modifiers: pool,
  }).config;
}
