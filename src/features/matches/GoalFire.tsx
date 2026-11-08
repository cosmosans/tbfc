import { useEffect, useRef } from "react";

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => value * value * (3 - 2 * value);

// Tileable noise. Advect the coarse currents and their finer ripples at
// different speeds so the tongues of flame continually fold and break apart.
function noiseField() {
  const tile = Float32Array.from({ length: 4096 }, () => Math.random());
  return (x: number, y: number) => {
    const ix = Math.floor(x), iy = Math.floor(y);
    const fx = smooth(x - ix), fy = smooth(y - iy);
    const a = (ix & 63), b = ((ix + 1) & 63);
    const lo = (iy & 63) * 64, hi = ((iy + 1) & 63) * 64;
    const bottom = tile[lo + a] + fx * (tile[lo + b] - tile[lo + a]);
    const top = tile[hi + a] + fx * (tile[hi + b] - tile[hi + a]);
    return bottom + fy * (top - bottom);
  };
}

export default function GoalFire({ started }: { started: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!canvas || motion.matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const noise = noiseField();
    // Coordinates in crest diameters. Keep the fire simulation bounded on
    // high-DPI displays, then draw the incandescent cinders at display scale.
    const field = document.createElement("canvas");
    field.width = 224;
    field.height = 252;
    const painter = field.getContext("2d");
    if (!painter) return;
    const pixels = painter.createImageData(field.width, field.height);
    const scale = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * scale));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * scale));
    const embers = Array.from({ length: 66 }, () => ({
      angle: Math.random() * Math.PI * 2, birth: Math.random() * 2.25,
      speed: 0.24 + Math.random() * 0.58, drift: Math.random() * 0.25 - 0.125,
      life: 0.35 + Math.random() * 0.9, size: 0.003 + Math.random() * 0.006,
    }));
    let frame = 0, previous = -Infinity;
    const render = (now: number) => {
      const t = (now - started) / 1000;
      if (t >= 5 || motion.matches) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      frame = requestAnimationFrame(render);
      if (now - previous < 30) return;
      previous = now;
      const fuel = smooth(clamp(t / 0.19)) * smooth(clamp((2.65 - t) / 0.62));
      const vapor = smooth(clamp((t - 1.85) / 0.75)) * smooth(clamp((5 - t) / 1.45));
      const lift = Math.max(0, t - 2.15) * 0.23;
      for (let row = 0, i = 0; row < field.height; row++) {
        const y = row / field.height * 2.25 - 1.5;
        for (let col = 0; col < field.width; col++, i += 4) {
          const x = col / field.width * 2 - 1;
          const radius = Math.sqrt(x * x + y * y);
          const wave = noise(x * 4, y * 3 + t * 2);
          const plume = noise(x * 14 + wave * 2.8, y * 5 + t * 4.8);
          const grain = noise(x * 32, y * 16 + t * 9);
          const curl = 0.53 * wave + 0.35 * plume + 0.12 * grain;
          // A hot rim follows the badge. Turbulent lift stretches its upper
          // hemisphere into columns while the center stays legible.
          const stretch = 1 + fuel * (0.12 + curl * curl * 2.9);
          const fy = y < 0 ? y / stretch : y;
          const outer = Math.sqrt(x * x + fy * fy);
          const cooling = clamp((radius - 0.49) * 2);
          const filament = clamp(0.7 + 0.45 * plume - cooling * (1.65 - 1.4 * curl));
          const heat = filament * clamp((0.54 - outer + (curl - 0.5) * 0.27) * 8)
            * clamp((radius - 0.34) * 7) * fuel;
          const sy = (y + lift + 0.23) / 0.55;
          const sx = (x - lift * 0.20 - (wave - 0.5) * 0.21) / 0.61;
          const density = clamp((1.15 - sx * sx - sy * sy + (curl - 0.5) * 2.7) * 0.75);
          const smoke = density * vapor * 0.58;
          const fire = clamp(heat * 2.5);
          const alpha = fire + smoke * (1 - fire);
          const mix = alpha ? fire / alpha : 0;
          const ash = 56 + curl * 106;
          pixels.data[i] = (164 + 100 * clamp(heat * 4)) * mix + ash * (1 - mix);
          pixels.data[i + 1] = (22 + 228 * heat) * mix + (ash - 4) * (1 - mix);
          pixels.data[i + 2] = (5 + 177 * heat ** 3) * mix + (ash - 7) * (1 - mix);
          pixels.data[i + 3] = 255 * alpha;
        }
      }
      painter.putImageData(pixels, 0, 0);
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(field, 0, 0, width, height);
      for (const spark of embers) {
        const age = t - spark.birth;
        if (age < 0 || age >= spark.life) continue;
        const x = (1 + Math.cos(spark.angle) * (0.46 + age * 0.10)
          + spark.drift * age + Math.sin(age * 7 + spark.angle) * age * 0.035) * width / 2;
        const y = (1.5 + Math.sin(spark.angle) * 0.45 - age * spark.speed) * height / 2.25;
        const size = spark.size * width;
        ctx.fillStyle = `rgba(255,191,79,${1 - age / spark.life})`;
        ctx.beginPath();
        ctx.ellipse(x, y, size * 0.40, size, spark.drift * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [started]);
  return <canvas ref={ref} className="goal-fire" aria-hidden="true" />;
}
