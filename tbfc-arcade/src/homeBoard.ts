import * as T from "three";
import { clubAccent, type Club } from "./opponentSquads";
import vortex from "./art/ground/board-vortex.png?url";

// Vortex highlight, lettering and outer stroke, in that order.
const inks: Record<string, [string, string, string]> = {
  "Fleet Feet FC": ["#80c9f2", "#071824", "#c3eaff"],
  "One Kick Wonders": ["#9262ce", "#fff5e7", "#a170da"],
  "Goal Dancers FC": ["#df4430", "#190604", "#ffca66"],
  "Inter Your Mom": ["#716653", "#fff6df", "#c69d52"],
  "Whiff City FC": ["#4586ca", "#071326", "#a8dcff"],
  "Trash Pandas FC": ["#8ed14c", "#0f3b34", "#f6e8c3"],
  "Shooting Stars FC": ["#fa328b", "#200a19", "#ffacd6"],
  "Onsider Trading FC": ["#0b7942", "#fff4ca", "#e2b52b"],
  "Atlético Espresso": ["#7b1f2b", "#fff1d5", "#d6aa59"],
  "Grass Assassins": ["#31e728", "#fff8ef", "#f34391"],
  "Net Six & Chill": ["#ed1b32", "#fff7e8", "#b65dd4"],
  "Crossbar Cowboys": ["#005962", "#fff1d3", "#d49b4a"],
  "Sweeper Creepers FC": ["#A939EC", "#9FF6D7", "#190C24"],
  "Cleatwood Mac": ["#902648", "#ffe5ad", "#2a1628"],
  "Goal Diggers": ["#F4A208", "#fff1d0", "#754016"],
};

export async function homeBoard(loader: T.TextureLoader, club: Club) {
  const [pattern, badge] = await Promise.all([
    loader.loadAsync(vortex),
    loader.loadAsync(club.crest),
    document.fonts.load("95px Upheaval"),
  ]);
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  const [highlight, fill, stroke] = inks[club.name] ?? [
    clubAccent(club),
    "#fff5df",
    clubAccent(club),
  ];
  const rgb = [1, 3, 5].map((i) => parseInt(highlight.slice(i, i + 2), 16));
  const image = pattern.image;
  const scale = Math.max(1024 / image.width, 128 / image.height);
  ctx.drawImage(
    image,
    (1024 - image.width * scale) / 2,
    (128 - image.height * scale) / 2,
    image.width * scale,
    image.height * scale,
  );
  const pixels = ctx.getImageData(0, 0, 1024, 128);
  for (let i = 0; i < pixels.data.length; i += 4) {
    const level = (pixels.data[i] * 0.65 + pixels.data[i + 1] * 0.35) / 210;
    for (let channel = 0; channel < 3; channel++)
      pixels.data[i + channel] = rgb[channel] * level;
  }
  ctx.putImageData(pixels, 0, 0);
  // Measure the visible badge so transparent padding never moves a narrow shield.
  const crop = document.createElement("canvas");
  crop.width = badge.image.width;
  crop.height = badge.image.height;
  const bc = crop.getContext("2d")!;
  bc.drawImage(badge.image, 0, 0);
  const data = bc.getImageData(0, 0, crop.width, crop.height).data;
  let left = crop.width,
    right = 0,
    top = crop.height,
    bottom = 0;
  for (let y = 0; y < crop.height; y++)
    for (let x = 0; x < crop.width; x++) {
      if (data[(y * crop.width + x) * 4 + 3] < 16) continue;
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
  const w = right - left + 1,
    h = bottom - top + 1,
    width = (98 * w) / h;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(crop, left, top, w, h, 20, 15, width, 98);
  const label = club.name.toUpperCase();
  ctx.font = "95px Upheaval";
  ctx.letterSpacing = "4.1px";
  const metrics = ctx.measureText(label);
  const start = 20 + width + 18,
    end = 1024 - 27;
  ctx.translate((start + end) / 2, 64);
  ctx.scale(Math.min(1, (end - start) / metrics.width), 1);
  ctx.textAlign = "center";
  ctx.lineJoin = "round";
  ctx.lineWidth = 14;
  const baseline =
    (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;
  ctx.strokeStyle = stroke;
  ctx.strokeText(label, 0, baseline);
  ctx.fillStyle = fill;
  ctx.fillText(label, 0, baseline);
  pattern.dispose();
  badge.dispose();
  return new T.CanvasTexture(canvas);
}
