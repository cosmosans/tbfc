import { Capacitor } from "@capacitor/core";

export async function loadSound(context: AudioContext, url: string, signal?: AbortSignal) {
  // Capacitor's iOS asset handler returns an HTTP response for media range requests.
  const headers = Capacitor.getPlatform() === "ios" ? { Range: "bytes=0-" } : undefined;
  const response = await fetch(url, { headers, signal });
  if (!response.ok) throw new Error(`Could not load ${url} (status ${response.status})`);
  return context.decodeAudioData(await response.arrayBuffer());
}
