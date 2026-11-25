import { MathUtils, type Sprite } from "three";

export const spinFrames = 32;

// The sheet has four roll directions. Playing a row backwards gives its opposite.
export function rollBall(ball: Sprite, phase: number, dx: number, dz: number, viewTurns: number) {
  const distance = Math.hypot(dx, dz);
  if (distance < .00001) return phase;
  const direction = MathUtils.euclideanModulo(Math.round(Math.atan2(-dz, dx) / (Math.PI / 4) + viewTurns), 8);
  const sign = direction < 4 ? 1 : -1;
  const next = MathUtils.euclideanModulo(phase + sign * distance / (Math.PI * ball.scale.x), 1);
  ball.material.map!.offset.set(Math.floor(next * spinFrames) / spinFrames, (3 - direction % 4) / 4);
  return next;
}
