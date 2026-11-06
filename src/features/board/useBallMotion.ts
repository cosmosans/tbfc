import { useEffect, useRef } from "react";
import type { Board } from "../../model";
import Kick1 from "../../audio/soccer-ball-kick.mp3";
import Kick2 from "../../audio/soccer-ball-kick-2.mp3";
import Kick3 from "../../audio/soccer-ball-kick-3.mp3";
import Kick4 from "../../audio/soccer-ball-kick-4.mp3";

const MAX_SPEED = 750; // Pixels per second, independent of pitch size.
const KICK_SOUNDS = [Kick1, Kick2, Kick3, Kick4];

export function useBallMotion(
  current: React.RefObject<Board>,
  render: (board: Board) => void,
  save: (board: Board) => void,
) {
  const pitch = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const attached = useRef<{ id: string; x: number; y: number } | null>(null);
  const samples = useRef<{ x: number; y: number; time: number }[]>([]);
  const ignored = useRef<string | null>(null);
  const saveRef = useRef(save);
  const kickAudio = useRef<{ context: AudioContext; buffers: AudioBuffer[] } | null>(null);
  const lastKick = useRef(-1);
  saveRef.current = save;

  function playKick() {
    const audio = kickAudio.current;
    if (!audio?.buffers.length) return;
    const count = audio.buffers.length;
    const index = lastKick.current < 0
      ? Math.floor(Math.random() * count)
      : (lastKick.current + 1 + Math.floor(Math.random() * (count - 1))) % count;
    lastKick.current = index;
    const source = audio.context.createBufferSource();
    source.buffer = audio.buffers[index];
    source.connect(audio.context.destination);
    source.start();
  }

  function stop() {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
  }
  useEffect(() => {
    const context = new AudioContext();
    const audio = { context, buffers: [] as AudioBuffer[] };
    kickAudio.current = audio;
    let active = true;
    void Promise.all(KICK_SOUNDS.map(async (url) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Could not load kick sound: ${url}`);
      return context.decodeAudioData(await response.arrayBuffer());
    })).then((buffers) => {
      if (active) audio.buffers = buffers;
    }).catch(() => {});
    return () => {
      active = false;
      cancelAnimationFrame(frame.current);
      void context.close();
      kickAudio.current = null;
    };
  }, []);

  function sample(x: number, y: number) {
    const time = performance.now();
    samples.current = [...samples.current.filter(s => time - s.time < 100), { x, y, time }];
  }
  function begin(x: number, y: number) {
    stop();
    void kickAudio.current?.context.resume().catch(() => {});
    ignored.current = attached.current?.id ?? null;
    attached.current = null;
    samples.current = [];
    sample(x, y);
  }
  function follow(board: Board): Board {
    const anchor = attached.current;
    if (!anchor) return board;
    const player = board.markers.find(m => m.id === anchor.id);
    if (!player) return board;
    return { ...board, markers: board.markers.map(m => m.team === 'ball'
      ? { ...m, point: { x: Math.max(4, Math.min(96, player.point.x + anchor.x)), y: Math.max(4, Math.min(96, player.point.y + anchor.y)) } } : m) };
  }
  function release() {
    const recent = samples.current.filter(s => performance.now() - s.time < 120);
    const first = recent[0];
    const last = recent[recent.length - 1];
    let vx = 0, vy = 0;
    if (first && last && last.time > first.time) {
      vx = (last.x - first.x) / (last.time - first.time) * 1000;
      vy = (last.y - first.y) / (last.time - first.time) * 1000;
    }
    const speed = Math.hypot(vx, vy);
    if (speed >= 18) playKick();
    const scale = Math.min(1, MAX_SPEED / (speed || 1));
    vx *= scale; vy *= scale;
    let previous = performance.now();
    function tick(now: number) {
      const el = pitch.current;
      const ball = current.current.markers.find(m => m.team === 'ball');
      if (!el || !ball) { stop(); return; }
      const bounds = el.getBoundingClientRect();
      if (!bounds.width || !bounds.height) { stop(); return; }
      const ballEl = el.querySelector<HTMLElement>('[data-ball="true"]');
      const radius = (ballEl?.offsetWidth ?? 48) / 2;
      const minX = Math.max(radius, bounds.width * .02);
      const minY = Math.max(radius, bounds.height * .02);
      let x = ball.point.x / 100 * bounds.width;
      let y = ball.point.y / 100 * bounds.height;
      const dt = Math.min((now - previous) / 1000, .032);
      previous = now;
      let hit: HTMLElement | null = null;
      // Small steps prevent fast flicks from passing through a nameplate.
      const steps = Math.max(1, Math.ceil(Math.hypot(vx, vy) * dt / 6));
      for (let i = 0; i < steps; i++) {
        x += vx * dt / steps; y += vy * dt / steps;
        if (x < minX || x > bounds.width - minX) {
          x = Math.max(minX, Math.min(bounds.width - minX, x)); vx *= -.75;
        }
        if (y < minY || y > bounds.height - minY) {
          y = Math.max(minY, Math.min(bounds.height - minY, y)); vy *= -.75;
        }
        for (const player of el.querySelectorAll<HTMLElement>('[data-player-marker]')) {
          const rect = player.getBoundingClientRect();
          const nearX = Math.max(rect.left - bounds.left, Math.min(rect.right - bounds.left, x));
          const nearY = Math.max(rect.top - bounds.top, Math.min(rect.bottom - bounds.top, y));
          const overlaps = Math.hypot(x - nearX, y - nearY) < radius * .8;
          if (player.dataset.playerMarker === ignored.current) {
            if (!overlaps) ignored.current = null;
            continue;
          }
          if (overlaps) { hit = player; break; }
        }
        if (hit) break;
      }
      const point = { x: x / bounds.width * 100, y: y / bounds.height * 100 };
      const next = { ...current.current, markers: current.current.markers.map(m => m.team === 'ball' ? { ...m, point } : m) };
      current.current = next;
      render(next);
      if (hit) {
        playKick();
        const player = next.markers.find(m => m.id === hit!.dataset.playerMarker)!;
        attached.current = { id: player.id, x: point.x - player.point.x, y: point.y - player.point.y };
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          ballEl?.animate([
            { scale: '1' }, { scale: '1.25 .75' }, { scale: '.88 1.12' }, { scale: '1.06 .94' }, { scale: '1' },
          ], { duration: 430, easing: 'ease-out' });
        }
        stop(); saveRef.current(next); return;
      }
      vx *= Math.exp(-1.25 * dt); vy *= Math.exp(-1.25 * dt);
      if (Math.hypot(vx, vy) < 18) { stop(); saveRef.current(next); return; }
      frame.current = requestAnimationFrame(tick);
    }
    frame.current = requestAnimationFrame(tick);
  }
  function reset() { stop(); attached.current = null; }
  return { pitch, begin, sample, release, follow, stop, reset };
}
