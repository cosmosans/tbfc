import startClick from "./audio/start-click.mp3?url";
import breakTrack from "./audio/half-full-time.mp3?url";

import retro from "./audio/MUSIC_MENU_RETRO.mp3?url";
import arcade from "./audio/MUSIC_MENU_ARCADE.mp3?url";
import football from "./audio/MUSIC_MENU_FOOTBALL.mp3?url";

import hitslab from "./audio/MUSIC_MENU_HIT_LAB.mp3?url";

import hypeJump from "./audio/MUSIC_MENU_HYPE_JUMP.mp3?url";

import pixelChips from "./audio/MUSIC_MENU_PIXEL_CHIPS.mp3?url";

import halfTime from "./audio/MUSIC_HALFTIME_LULL_BEAT.mp3?url";
const tracks = [
  pixelChips,
  hitslab,
  arcade,
  retro,
  football,
  hypeJump,
  halfTime,
];

const cursorKey = "tbfc.arcade.nextMusicTrack";

type Bookmark = { track: string; time: number };
export function createMusicCue(
  { fadeInMs = 0, fadeOutMs = 450, playlist = tracks, storageKey = cursorKey } = {},
  bookmark?: Bookmark,
) {
  let nextIndex = 0;
  const player = new Audio();
  player.preload = "none";
  const volume = 0.36;
  let active = false,
    animation = 0,
    index: number | null = null,
    consumed = false;
  const failedTracks = new Set<number>();
  let blockedWarning = false;
  function skipFailedTrack(failedIndex: number | null) {
    if (
      !active ||
      failedIndex === null ||
      index !== failedIndex ||
      failedTracks.has(failedIndex)
    )
      return;
    failedTracks.add(failedIndex);
    if (failedTracks.size === playlist.length) {
      console.warn("No menu music playlist could be played.");
      return;
    }
    index = (failedIndex + 1) % playlist.length;
    while (failedTracks.has(index)) index = (index + 1) % playlist.length;
    consumed = false;
    player.src = playlist[index];
    play();
  }
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
        const saved = localStorage.getItem(storageKey);
        if (saved !== null && /^\d+$/.test(saved))
          nextIndex = Number(saved) % playlist.length;
      } catch {}
      const savedTrack = bookmark ? playlist.indexOf(bookmark.track) : -1;
      index = savedTrack >= 0 ? savedTrack : nextIndex;
      consumed = false;
      player.src = playlist[index];
      if (bookmark && savedTrack >= 0 && Number.isFinite(bookmark.time))
        player.currentTime = bookmark.time;
      bookmark = undefined;
      player.volume = fadeInMs ? 0 : volume;
    }
    if (player.paused) {
      const attemptedIndex = index;
      void player.play().catch((error) => {
        if (error?.name === "NotAllowedError") {
          if (!blockedWarning)
            console.warn("Music will retry after the next interaction.");
          blockedWarning = true;
        } else if (error?.name !== "AbortError")
          skipFailedTrack(attemptedIndex);
      });
    }
  }
  player.onerror = () => skipFailedTrack(index);
  player.onplaying = () => {
    if (!active || index === null || consumed) return;
    failedTracks.clear();
    blockedWarning = false;
    consumed = true;
    nextIndex = (index + 1) % playlist.length;
    try {
      localStorage.setItem(storageKey, String(nextIndex));
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
        ? { track: playlist[index], time: player.currentTime }
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
  // A returning page can start before the browser has granted audio playback.
  // Retry while the user is actively interacting, without changing their setting.
  document.addEventListener("pointerdown", play);
  document.addEventListener("keydown", play);
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
      else {
        music.pause();
        breakPlayer.pause();
      }
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
        {
          ...history.state,
          arcadeMusic: breakActive ? undefined : music.bookmark(),
        },
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
        return new Promise<void>((resolve) => {
          function fadeOut(now: number) {
            const progress = Math.min(1, (now - start) / 650);
            breakPlayer.volume = volume * (1 - progress);
            if (progress < 1) breakFade = requestAnimationFrame(fadeOut);
            else {
              breakPlayer.pause();
              resolve();
            }
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
