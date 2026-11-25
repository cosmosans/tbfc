import type { Sprite, Texture } from "three";
import { spriteGroundPadding } from "./spriteGround";

export function showKeeperDive(sprite: Sprite, sheet: Texture, direction: number, progress: number, scale: number) {
  const cell = sheet.image.height / 8;
  const frames = sheet.image.width / cell;
  const column = Math.max(0, Math.min(frames - 1, Math.floor(progress * frames)));
  sheet.repeat.set(1 / frames, 1 / 8);
  sheet.offset.set(column / frames, (7 - direction) / 8);
  sprite.material.map = sheet;
  sprite.material.rotation = 0;
  sprite.scale.setScalar(scale * cell / 48);
  sprite.center.set(.5, spriteGroundPadding(sheet.image, frames, 8, direction, 0, true) / cell);
}
