import { useEffect, useRef } from "react";

export function useGoalSound(matchId?: string) {
  const play = useRef<() => void>(() => {});
  useEffect(() => {
    if (!matchId || !window.AudioContext) return;
    const context = new AudioContext();
    const controller = new AbortController();
    let clip: Promise<AudioBuffer | null> | undefined;
    let source: AudioBufferSourceNode | undefined;
    let sequence = 0;

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
      const request = ++sequence;
      const started = performance.now();
      void Promise.all([prepare(), context.resume()]).then(([buffer]) => {
        if (!buffer || request !== sequence || performance.now() - started > 2000) return;
        source?.stop();
        source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        source.start();
      }).catch(() => {});
    };
    return () => {
      sequence++;
      play.current = () => {};
      controller.abort();
      window.removeEventListener("pointerup", unlock);
      window.removeEventListener("keydown", unlock);
      void context.close().catch(() => {});
    };
  }, [matchId]);
  return play;
}
