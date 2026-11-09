const key = "tbfc.appSounds";

export function readSoundPreference() {
  return localStorage.getItem(key) !== "off";
}

export function saveSoundPreference(enabled: boolean) {
  localStorage.setItem(key, enabled ? "on" : "off");
}
