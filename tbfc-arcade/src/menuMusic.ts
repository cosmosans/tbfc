import startClick from "./audio/start-click.mp3?url";
import breakTrack from "./audio/half-full-time.mp3?url";

import retro from "./audio/MUSIC_MENU_RETRO.mp3?url";
import arcade from "./audio/MUSIC_MENU_ARCADE.mp3?url";
import football from "./audio/MUSIC_MENU_FOOTBALL.mp3?url";

import hitslab from "./audio/MUSIC_MENU_HIT_LAB.mp3?url";

import hypeJump from "./audio/MUSIC_MENU_HYPE_JUMP.aiff?url";

import pixelChips from "./audio/MUSIC_MENU_PIXEL_CHIPS.mp3?url";
import sport from "./audio/MUSIC_MENU_SPORT.mp3?url";

import halfTime from "./audio/MUSIC_HALFTIME_LULL_BEAT.mp3?url";
const tracks = [
  hitslab,
  arcade,
  retro,
  football,
  hypeJump,
  pixelChips,
  sport,
  halfTime,
];

const cursorKey = "tbfc.arcade.nextMusicTrack";
let nextIndex = 0;

type Bookmark = { track: string; time: number };
export function createMusicCue(
  { fadeInMs = 0, fadeOutMs = 450 } = {},
  bookmark?: Bookmark,
) {
  const player = new Audio();
  player.preload = "none";
  const volume = 0.36;
  let active = false,
    animation = 0,
    index: number | null = null,
    consumed = false;
  function fade(to: number, ms: number, done?: () => void) {
    cancelAnimationFrame(animation);
    const from = player.volume,
      start = performance.now();
    function step() {
      const t = ms > 0 ? Math.min(1, (performance.now() - start) / ms) : 1;
      player.volume = from + (to - from) * t;
      if (t < 1) animation = requestAnimationFrame(step);
      else done?.();
    }
    step();
  }
  function play() {
    if (!active || document.hidden) return;
    if (index === null) {
      try {
        const saved = localStorage.getItem(cursorKey);
        if (saved !== null && /^\d+$/.test(saved))
          nextIndex = Number(saved) % tracks.length;
      } catch {}
      const savedTrack = bookmark ? tracks.indexOf(bookmark.track) : -1;
      index = savedTrack >= 0 ? savedTrack : nextIndex;
      consumed = false;
      player.src = tracks[index];
      if (bookmark && savedTrack >= 0 && Number.isFinite(bookmark.time))
        player.currentTime = bookmark.time;
      bookmark = undefined;
      player.volume = fadeInMs ? 0 : volume;
    }
    if (player.paused) void player.play().catch(() => {});
  }
  player.onplaying = () => {
    if (!active || index === null || consumed) return;
    consumed = true;
    nextIndex = (index + 1) % tracks.length;
    try {
      localStorage.setItem(cursorKey, String(nextIndex));
    } catch {}
    fade(volume, fadeInMs);
  };
  player.onended = () => {
    index = null;
    play();
  };
  return {
    bookmark(): Bookmark | undefined {
      return index !== null && consumed
        ? { track: tracks[index], time: player.currentTime }
        : bookmark;
    },
    resume() {
      active = true;
      play();
    },
    pause() {
      active = false;
      player.pause();
    },
    finish() {
      active = false;
      fade(0, player.paused ? 0 : fadeOutMs, () => {
        player.pause();
        player.removeAttribute("src");
        player.load();
        index = null;
      });
    },
  };
}

export function startMenuMusic(
  initialSound: boolean,
  setMatchSound: (on: boolean) => void,
) {
  const musicKey = "tbfc.arcade.musicMuted";
  let musicEnabled = initialSound,
    soundEnabled = initialSound;
  // Seed both channels from the old combined preference on the first visit.
  try {
    const stored = localStorage.getItem(musicKey);
    if (stored === null)
      localStorage.setItem(musicKey, musicEnabled ? "no" : "yes");
    else musicEnabled = stored !== "yes";
  } catch {}
  const saved = history.state?.arcadeMusic as Bookmark | undefined;
  if (saved)
    history.replaceState({ ...history.state, arcadeMusic: undefined }, "");
  let started = false;
  const music = createMusicCue({ fadeInMs: saved ? 900 : 0 }, saved);
  const breakPlayer = new Audio(breakTrack);
  breakPlayer.loop = true;
  breakPlayer.preload = "none";
  let breakActive = false;
  let breakFade = 0;
  const cue = new Audio(startClick);
  cue.preload = "auto";
  cue.volume = 0.6;
  cue.muted = !soundEnabled;

  function play() {
    if (!started || !musicEnabled || document.hidden) return;
    if (breakActive) void breakPlayer.play().catch(() => {});
    else music.resume();
  }
  function pauseMenu() {
    music.pause();
    breakPlayer.pause();
    cue.pause();
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pauseMenu();
    else play();
  });
  window.addEventListener("pagehide", pauseMenu);
  window.addEventListener("pageshow", play);
  return {
    get musicEnabled() {
      return musicEnabled;
    },
    get soundEnabled() {
      return soundEnabled;
    },
    start(playStartCue = true) {
      if (started) return;
      started = true;
      if (soundEnabled) {
        if (playStartCue) void cue.play().catch(() => {});
        setMatchSound(true);
      }
      play();
    },
    toggleMusic() {
      musicEnabled = !musicEnabled;
      try {
        localStorage.setItem(musicKey, musicEnabled ? "no" : "yes");
      } catch {}
      if (musicEnabled) play();
      else { music.pause(); breakPlayer.pause(); }
    },
    toggleSound() {
      soundEnabled = !soundEnabled;
      cue.muted = !soundEnabled;
      if (!soundEnabled) cue.pause();
      setMatchSound(soundEnabled);
    },
    startBreak() {
      if (started) return;
      started = true;
      breakActive = true;
      cancelAnimationFrame(breakFade);
      breakPlayer.currentTime = 0;
      breakPlayer.volume = 0.36;
      play();
    },
    carryOver() {
      history.replaceState(
        { ...history.state, arcadeMusic: breakActive ? undefined : music.bookmark() },
        "",
      );
    },
    finish() {
      if (!started) return Promise.resolve();
      started = false;
      cue.pause();
      if (breakActive) {
        breakActive = false;
        cancelAnimationFrame(breakFade);
        const volume = breakPlayer.volume;
        const start = performance.now();
        return new Promise<void>(resolve => {
          function fadeOut(now: number) {
            const progress = Math.min(1, (now - start) / 650);
            breakPlayer.volume = volume * (1 - progress);
            if (progress < 1) breakFade = requestAnimationFrame(fadeOut);
            else { breakPlayer.pause(); resolve(); }
          }
          breakFade = requestAnimationFrame(fadeOut);
        });
      }
      music.finish();
      return Promise.resolve();
    },
  };
}
export type MenuMusic = ReturnType<typeof startMenuMusic>;
