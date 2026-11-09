import { loadSound } from "../../loadSound";
import { useEffect, useRef } from "react";

export function useGoalSound(matchInProgress: boolean, soundsEnabled: boolean) {
  const play = useRef<() => void>(() => {});
  const playWhistle = useRef<() => void>(() => {});
  const setEnabled = useRef<(enabled: boolean) => void>(() => {});
  const setStadiumActive = useRef<(active: boolean) => void>(() => {});
  useEffect(() => {
    if (!window.AudioContext) return;
    const context = new AudioContext();
    const controller = new AbortController();
    let clip: Promise<AudioBuffer | null> | undefined;
    let stadiumClip: Promise<AudioBuffer | null> | undefined;
    let whistleClip: Promise<AudioBuffer | null> | undefined;
    let source: AudioBufferSourceNode | undefined;
    let whistleSource: AudioBufferSourceNode | undefined;
    let stadiumSource: AudioBufferSourceNode | undefined;
    let active = true;
    let enabled = false;
    let stadiumWanted = false;
    let stadiumRequest = 0;
    let generation = 0;
    let playback = Promise.resolve();
    let whistlePlayback = Promise.resolve();

    function prepare() {
      clip ??= loadSound(context, "/audio/tbfc-goal.mp3", controller.signal)
        .catch(() => {
          clip = undefined;
          return null;
        });
      return clip;
    }
    function prepareStadium() {
      stadiumClip ??= loadSound(context, "/audio/stadium.mp3", controller.signal)
        .catch(() => { stadiumClip = undefined; return null; });
      return stadiumClip;
    }
    function prepareWhistle() {
      whistleClip ??= loadSound(context, "/audio/whistle.mp3", controller.signal)
        .catch(() => {
          whistleClip = undefined;
          return null;
        });
      return whistleClip;
    }
    function stopStadium() {
      stadiumRequest++;
      stadiumSource?.stop();
      stadiumSource = undefined;
    }
    function startStadium() {
      if (!active || !enabled || !stadiumWanted || stadiumSource) return;
      const request = ++stadiumRequest;
      void prepareStadium().then((buffer) => {
        if (
          !buffer ||
          !active ||
          !enabled ||
          !stadiumWanted ||
          request !== stadiumRequest
        )
          return;
        const loop = context.createBufferSource();
        const volume = context.createGain();
        volume.gain.value = 0.35;
        loop.buffer = buffer;
        loop.loop = true;
        loop.connect(volume).connect(context.destination);
        loop.start();
        stadiumSource = loop;
      });
    }
    void prepare();
    void prepareWhistle();
    setStadiumActive.current = (shouldPlay) => {
      stadiumWanted = shouldPlay;
      if (shouldPlay) startStadium();
      else stopStadium();
    };
    function resume() {
      if (enabled && context.state !== "running") void context.resume().catch(() => {});
    }
    function resumeWhenVisible() {
      if (!document.hidden) resume();
    }
    window.addEventListener("click", resume, true);
    window.addEventListener("touchend", resume, true);
    document.addEventListener("visibilitychange", resumeWhenVisible);
    setEnabled.current = (value) => {
      enabled = value;
      if (enabled) {
        resume();
        startStadium();
        return;
      }
      generation++;
      stopStadium();
      source?.stop();
      source = undefined;
      whistleSource?.stop();
      whistleSource = undefined;
    };
    play.current = () => {
      if (!enabled) return;
      resume();
      const requestGeneration = generation;
      playback = playback
        .then(async () => {
          const buffer = await prepare();
          if (
            !buffer ||
            !active ||
            !enabled ||
            requestGeneration !== generation
          )
            return;
          const currentSource = context.createBufferSource();
          source = currentSource;
          currentSource.buffer = buffer;
          currentSource.connect(context.destination);
          currentSource.start();
          await new Promise<void>((resolve) => {
            currentSource.onended = () => {
              if (source === currentSource) source = undefined;
              resolve();
            };
          });
        })
        .catch(() => {});
    };
    playWhistle.current = () => {
      if (!enabled) return;
      resume();
      const requestGeneration = generation;
      whistlePlayback = whistlePlayback
        .then(async () => {
          const buffer = await prepareWhistle();
          if (
            !buffer ||
            !active ||
            !enabled ||
            requestGeneration !== generation
          )
            return;
          const currentSource = context.createBufferSource();
          whistleSource = currentSource;
          currentSource.buffer = buffer;
          currentSource.connect(context.destination);
          currentSource.start();
          await new Promise<void>((resolve) => {
            currentSource.onended = () => {
              if (whistleSource === currentSource) whistleSource = undefined;
              resolve();
            };
          });
        })
        .catch(() => {});
    };
    return () => {
      active = false;
      play.current = () => {};
      playWhistle.current = () => {};
      window.removeEventListener("click", resume, true);
      window.removeEventListener("touchend", resume, true);
      document.removeEventListener("visibilitychange", resumeWhenVisible);
      setEnabled.current = () => {};
      setStadiumActive.current = () => {};
      stopStadium();
      if (source) source.stop();
      if (whistleSource) whistleSource.stop();
      controller.abort();
      void context.close().catch(() => {});
    };
  }, []);
  useEffect(() => {
    setStadiumActive.current(matchInProgress);
  }, [matchInProgress]);
  useEffect(() => {
    setEnabled.current(soundsEnabled);
  }, [soundsEnabled]);
  return { play, playWhistle };
}
