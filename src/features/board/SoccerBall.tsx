import { useLayoutEffect, useRef } from "react";
import type { Point } from "../../model";

type Vec = [number, number, number];
const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const unit = (v: Vec): Vec => { const n = Math.hypot(...v); return v.map(x => x / n) as Vec; };
const phi = (1 + Math.sqrt(5)) / 2;
const vertices: Vec[] = [];
for (const a of [-1, 1]) for (const b of [-phi, phi]) {
  vertices.push(unit([0, a, b]), unit([a, b, 0]), unit([b, 0, a]));
}
const adjacent = (a: Vec, b: Vec) => dot(a, b) > .44 && dot(a, b) < .46;
// Face planes of a truncated icosahedron: twelve pentagons and twenty hexagons.
const panels = vertices.map(v => {
  const neighbor = vertices.find(w => adjacent(v, w))!;
  const corner = unit(v.map((n, i) => (2 * n + neighbor[i]) / 3) as Vec);
  return { normal: v, distance: dot(v, corner), black: true };
});
for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) for (let k = j + 1; k < 12; k++) {
  const a = vertices[i], b = vertices[j], c = vertices[k];
  if (!adjacent(a, b) || !adjacent(b, c) || !adjacent(a, c)) continue;
  const normal = unit(a.map((n, index) => n + b[index] + c[index]) as Vec);
  const corner = unit(a.map((n, index) => (2 * n + b[index]) / 3) as Vec);
  panels.push({ normal, distance: dot(normal, corner), black: false });
}

function rotate(v: Vec, axis: Vec, angle: number): Vec {
  const c = Math.cos(angle), s = Math.sin(angle), d = dot(axis, v) * (1 - c);
  return [
    v[0] * c + (axis[1] * v[2] - axis[2] * v[1]) * s + axis[0] * d,
    v[1] * c + (axis[2] * v[0] - axis[0] * v[2]) * s + axis[1] * d,
    v[2] * c + (axis[0] * v[1] - axis[1] * v[0]) * s + axis[2] * d,
  ];
}

export default function SoccerBall({ point }: { point: Point }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const previous = useRef(point);
  const normals = useRef(panels.map(p => rotate(p.normal, unit([1, 1, 0]), .35)));
  useLayoutEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext('2d');
    const pitch = el?.parentElement?.parentElement;
    if (!el || !ctx || !pitch) return;
    const dx = (point.x - previous.current.x) * pitch.clientWidth / 100;
    const dy = (point.y - previous.current.y) * pitch.clientHeight / 100;
    previous.current = point;
    const distance = Math.hypot(dx, dy);
    if (distance > 0) {
      const axis: Vec = [-dy / distance, dx / distance, 0];
      normals.current = normals.current.map(n => rotate(n, axis, distance / ((el.clientWidth || 48) / 2)));
    }
    const size = 96, radius = 46;
    const image = ctx.createImageData(size, size);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const nx = (x + .5 - size / 2) / radius, ny = (y + .5 - size / 2) / radius;
      const r2 = nx * nx + ny * ny;
      if (r2 >= 1) continue;
      const nz = Math.sqrt(1 - r2);
      const v: Vec = [nx, ny, nz];
      let best = -Infinity, second = -Infinity, face = 0;
      for (let i = 0; i < panels.length; i++) {
        const score = dot(v, normals.current[i]) / panels[i].distance;
        if (score > best) { second = best; best = score; face = i; }
        else if (score > second) second = score;
      }
      const seam = best - second < .008;
      const base = seam ? 60 : panels[face].black ? 27 : 240;
      const light = .38 + .62 * Math.max(0, -nx * .35 - ny * .4 + nz * .84);
      const shine = Math.pow(Math.max(0, -nx * .24 - ny * .3 + nz * .923), 32) * 32;
      const shade = Math.min(255, base * light + shine);
      const offset = (y * size + x) * 4;
      image.data[offset] = shade;
      image.data[offset + 1] = shade;
      image.data[offset + 2] = Math.min(255, shade + 3);
      image.data[offset + 3] = Math.min(255, (1 - Math.sqrt(r2)) * radius * 255);
    }
    ctx.putImageData(image, 0, 0);
  }, [point.x, point.y]);
  return <canvas ref={canvas} width={96} height={96} aria-hidden="true"
    style={{ width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }} />;
}
