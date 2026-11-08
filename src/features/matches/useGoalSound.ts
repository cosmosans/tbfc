import { useEffect, useRef } from "react";

export function useGoalSound() {
  const play = useRef<() => void>(() => {});
  const enable = useRef<() => Promise<boolean>>(async () => false);
  const disable = useRef<() => void>(() => {});
  useEffect(() => {
    if (!window.AudioContext) return;
    const context = new AudioContext();
    const controller = new AbortController();
    let clip: Promise<AudioBuffer | null> | undefined;
    let source: AudioBufferSourceNode | undefined;
    let active = true;
    let enabled = false;
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
    void prepare();
    enable.current = async () => {
      try {
        await context.resume();
        enabled = context.state === "running";
        return enabled;
      } catch {
        return false;
      }
    };
    disable.current = () => {
      enabled = false;
      generation++;
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
      if (source) source.stop();
      controller.abort();
      void context.close().catch(() => {});
    };
  }, []);
  return { play, enable, disable };
}
