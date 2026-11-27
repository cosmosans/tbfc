import test from "node:test";
import assert from "node:assert/strict";
import {
  houseDefaults,
  validateHouse,
  resolveHouse,
  builtInHousePresets,
  houseShotProfile,
  randomHouse,
  saveHousePreset,
  readHousePresets,
  deleteHousePreset,
  saveHouseResult,
} from "../src/houseRules.ts";
import { targetReached, classicRules } from "../src/matchRules.ts";
import { airGoalEligible } from "../src/airBalls.ts";
import { planShot } from "../src/shooting.ts";
const config = (overrides = {}) => ({ ...houseDefaults(), ...overrides });
test("all built-in and randomized configurations resolve and remain stable", () => {
  for (const c of [
    ...builtInHousePresets,
    ...Array.from({ length: 200 }, () => randomHouse()),
  ]) {
    const validated = validateHouse(c);
    assert.deepEqual(validated.issues, []);
    assert.deepEqual(validated.config, c);
    assert.equal(resolveHouse(c).rules.mode, "houseRules");
  }
});
test("unsupported saved values, conflicting keepers, and Street-only constraints sanitize", () => {
  const { config: c, issues } = validateHouse({
    version: 99,
    format: "street5",
    gravity: 0.4,
    snow: true,
    scoring: "airBalls",
    speed: 900,
    modifiers: ["theWall", "weakKeepers", "survival", "inferno", "unknown"],
  });
  assert.equal(c.format, "street5");
  assert.equal(c.speed, 1);
  assert.equal(c.gravity, 1);
  assert.equal(c.snow, false);
  assert.equal(c.scoring, "standard");
  assert.deepEqual(c.modifiers, ["inferno"]);
  assert.ok(issues.length >= 5);
});
test("formats preserve geometry, lineup size, and boundary behaviour", () => {
  const classic = resolveHouse(config()).rules;
  assert.equal(classic.goalkeepers, 1);
  assert.equal(classic.teamSize, 7);
  assert.deepEqual(classic.goal, classicRules().goal);
  for (const n of [3, 5]) {
    const r = resolveHouse(config({ format: "street" + n })).rules;
    assert.equal(r.teamSize, n);
    assert.equal(r.goalkeepers, 0);
    assert.equal(r.arena, "gulch");
    assert.equal(r.boundary, "enclosed");
  }
});
test("weighted targets allow overshoot; Golden Goal is target one; timed has halftime", () => {
  const r = resolveHouse(
    config({ lifecycle: "target", target: 5, scoring: "longRange" }),
  ).rules;
  assert.equal(targetReached(r, 4, 0), false);
  assert.equal(targetReached(r, 6, 0), true);
  const golden = resolveHouse(config({ lifecycle: "golden" })).rules;
  assert.equal(golden.targetScore, 1);
  assert.ok(targetReached(golden, 0, 2));
  const timed = resolveHouse(config({ halfMinutes: 2 })).rules;
  assert.equal(timed.winCondition, "timed");
  assert.equal(timed.halfMinutes, 2);
  assert.equal(targetReached(timed, 99, 0), false);
});
test("aerial assistance alone preserves standard scoring; aerial-only eligibility remains separate", () => {
  const assist = resolveHouse(config({ modifiers: ["aerialAssist"] }));
  assert.equal(assist.aerial, true);
  assert.equal(assist.config.scoring, "standard");
  const air = resolveHouse(
    config({ scoring: "airBalls", modifiers: ["aerialAssist", "survival"] }),
  );
  assert.equal(air.aerial, true);
  assert.equal(airGoalEligible("GROUNDED"), false);
  assert.ok(airGoalEligible("VOLLEY"));
});
test("dry low traction and snow with normal traction remain independent", () => {
  const ice = resolveHouse(config({ traction: "ice" }));
  assert.equal(ice.config.snow, false);
  assert.equal(ice.physics.traction, 0.35);
  const snow = resolveHouse(config({ snow: true }));
  assert.equal(snow.physics.traction, 1);
  assert.equal(resolveHouse(config({ ball: "light" })).physics.ballSpeed, 1.15);
  assert.equal(
    resolveHouse(config({ ball: "heavy" })).physics.rollingResistance,
    1.35,
  );
});
test("shooting assistance uses maximum bonuses and never compounds speed", () => {
  const c = config({
    scoring: "longRange",
    modifiers: ["shootOnSight", "aerialAssist", "inferno"],
  });
  const p = houseShotProfile(c, true, 1.4);
  assert.equal(p.speed, 1.15);
  assert.equal(p.error / 1.15, 1 / 1.4);
  const solo = houseShotProfile(config(), false, 1);
  assert.deepEqual(solo, { speed: 1, error: 1 });
});
test("super and weak keeper profiles move save probability in opposite directions", () => {
  const count = (factor) =>
    Array.from({ length: 1000 }, (_, i) =>
      planShot(
        15,
        0,
        0,
        0.6,
        21,
        15,
        20,
        () => i / 1000,
        true,
        1.5,
        1,
        2,
        undefined,
        false,
        factor,
      ),
    ).filter((s) => s.result === "Goal").length;
  assert.ok(count(0.72) < count(1));
  assert.ok(count(1.2) > count(1));
});
test("presets support save, load, overwrite, copy, delete, and corrupt storage", () => {
  const memory = new Map();
  globalThis.localStorage = {
    getItem: (k) => memory.get(k) ?? null,
    setItem: (k, v) => memory.set(k, v),
  };
  const a = saveHousePreset(config({ name: "One" }));
  assert.equal(readHousePresets().length, 1);
  saveHousePreset(config({ name: "Edited", target: 10 }), a.id);
  assert.equal(readHousePresets()[0].config.name, "Edited");
  const copy = saveHousePreset(readHousePresets()[0].config);
  assert.notEqual(copy.id, a.id);
  assert.equal(readHousePresets().length, 2);
  deleteHousePreset(a.id);
  assert.equal(readHousePresets().length, 1);
  saveHouseResult(config(), {
    score: [2, 0],
    goals: [{ player: "Example", assist: "Teammate" }],
    elapsed: 42,
    teams: ["Home", "Away"],
  });
  const results = JSON.parse(memory.get("tbfc.house.results.v1"));
  assert.equal(results[0].physicalGoals, 1);
  assert.equal(results[0].score[0], 2);
  assert.equal(results[0].mode, "houseRules");
  memory.set("tbfc.house.presets.v1", "invalid");
  assert.deepEqual(readHousePresets(), []);
});

test("retired Double Points presets fall back to Standard without losing other settings", () => {
  const result = validateHouse(config({ name: "Old preset", scoring: "doublePoints", target: 10, speed: 1.5 }));
  assert.equal(result.config.scoring, "standard");
  assert.equal(result.config.name, "Old preset");
  assert.equal(result.config.target, 10);
  assert.equal(result.config.speed, 1.5);
  assert.ok(result.issues.some(issue => issue.startsWith("scoring:")));
});
