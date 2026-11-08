import { useEffect, useRef } from "react";

export function useGoalSound(matchInProgress: boolean) {
  const play = useRef<() => void>(() => {});
  const enable = useRef<() => Promise<boolean>>(async () => false);
  const disable = useRef<() => void>(() => {});
  const setStadiumActive = useRef<(active: boolean) => void>(() => {});
  useEffect(() => {
    if (!window.AudioContext) return;
    const context = new AudioContext();
    const controller = new AbortController();
    let clip: Promise<AudioBuffer | null> | undefined;
    let stadiumClip: Promise<AudioBuffer | null> | undefined;
    let source: AudioBufferSourceNode | undefined;
    let stadiumSource: AudioBufferSourceNode | undefined;
    let active = true;
    let enabled = false;
    let stadiumWanted = false;
    let stadiumRequest = 0;
    let generation = 0;
    let playback = Promise.resolve();

    function prepare() {
      clip ??= fetch("/audio/tbfc-goal.mp3", { signal: controller.signal })
        .then(response => {
          if (!response.ok) throw new Error("Goal sound unavailable");
          return response.arrayBuffer();
        })
        .then(bytes => context.decodeAudioData(bytes))
        .catch(() => { clip = undefined; return null; });
      return clip;
    }
    function prepareStadium() {
      stadiumClip ??= fetch("/audio/stadium.mp3", { signal: controller.signal })
        .then((response) => {
          if (!response.ok) throw new Error("Stadium sound unavailable");
          return response.arrayBuffer();
        })
        .then((bytes) => context.decodeAudioData(bytes))
        .catch(() => { stadiumClip = undefined; return null; });
      return stadiumClip;
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
        if (!buffer || !active || !enabled || !stadiumWanted || request !== stadiumRequest) return;
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
    setStadiumActive.current = (shouldPlay) => {
      stadiumWanted = shouldPlay;
      if (shouldPlay) startStadium();
      else stopStadium();
    };
    enable.current = async () => {
      try {
        await context.resume();
        enabled = context.state === "running";
        startStadium();
        return enabled;
      } catch {
        return false;
      }
    };
    disable.current = () => {
      enabled = false;
      generation++;
      stopStadium();
      source?.stop();
      source = undefined;
    };
    play.current = () => {
      if (!enabled) return;
      const requestGeneration = generation;
      playback = playback.then(async () => {
        const buffer = await prepare();
        if (!buffer || !active || !enabled || requestGeneration !== generation) return;
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
      }).catch(() => {});
    };
    return () => {
      active = false;
      play.current = () => {};
      enable.current = async () => false;
      disable.current = () => {};
      setStadiumActive.current = () => {};
      stopStadium();
      if (source) source.stop();
      controller.abort();
      void context.close().catch(() => {});
    };
  }, []);
  useEffect(() => {
    setStadiumActive.current(matchInProgress);
  }, [matchInProgress]);
  return { play, enable, disable };
}
