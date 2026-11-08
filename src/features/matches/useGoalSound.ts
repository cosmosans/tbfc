import { useEffect, useRef } from "react";

export function useGoalSound() {
  const play = useRef<() => void>(() => {});
  useEffect(() => {
    if (!window.AudioContext) return;
    const context = new AudioContext();
    const controller = new AbortController();
    let clip: Promise<AudioBuffer | null> | undefined;
    let source: AudioBufferSourceNode | undefined;
    let active = true;
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
    function unlock() {
      if (context.state !== "running") void context.resume().catch(() => {});
    }
    void prepare();
    window.addEventListener("pointerup", unlock);
    window.addEventListener("keydown", unlock);
    play.current = () => {
      playback = playback.then(async () => {
        const [buffer] = await Promise.all([prepare(), context.resume()]);
        if (!buffer || !active) return;
        source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        source.start();
        await new Promise<void>((resolve) => {
          if (source) source.onended = () => resolve();
        });
      }).catch(() => {});
    };
    return () => {
      active = false;
      play.current = () => {};
      source?.stop();
      controller.abort();
      window.removeEventListener("pointerup", unlock);
      window.removeEventListener("keydown", unlock);
      void context.close().catch(() => {});
    };
  }, []);
  return play;
}
