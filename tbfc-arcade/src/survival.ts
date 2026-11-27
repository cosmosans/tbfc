import type { positions } from "./lineup";

export const survivalEliminationLimit = 4;
export type SurvivalActor = { penalty: number };

// A credited goal removes one uniformly selected playable outfielder, provided
// the scoring side can still field two. Goalkeepers never enter this pool.
export function selectSurvivalElimination<T extends SurvivalActor>(
  actors: readonly T[],
  previous: number,
  random = Math.random,
): number {
  if (previous >= survivalEliminationLimit) return -1;
  const eligible = actors
    .map((actor, index) => (!actor.penalty ? index : -1))
    .filter((index) => index >= 0);
  if (eligible.length <= 2) return -1;
  return eligible[
    Math.min(eligible.length - 1, Math.floor(random() * eligible.length))
  ];
}

// The remaining actors occupy a compact shape instead of retaining holes from
// their original eleven-a-side-style formation.
export function survivalAnchors(
  original: ReturnType<typeof positions>,
  count: number,
): ReturnType<typeof positions> {
  if (count >= 6) return original;
  const rows =
    count === 5
      ? [1, 2, 2]
      : count === 4
        ? [1, 1, 2]
        : count === 3
          ? [1, 1, 1]
          : [1, 1];
  const anchors: ReturnType<typeof positions> = [];
  for (let line = 0; line < rows.length; line++)
    for (let slot = 0; slot < rows[line]; slot++) {
      const i = anchors.length,
        width = line === rows.length - 1 ? 6 : 8;
      anchors.push({
        ...original[i],
        front: line === 0,
        back: line === rows.length - 1,
        lane:
          rows[line] === 1 ? 0 : width * ((2 * slot) / (rows[line] - 1) - 1),
        depth: -3 - (10 * line) / (rows.length - 1),
        y: 45 + (35 * line) / (rows.length - 1),
      });
    }
  return anchors;
}
