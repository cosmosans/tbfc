import { createMusicCue } from '../menuMusic'
import checkMyTeam from '../audio/first-touch/turning_pages-check-my-team-464442.mp3?url'
import eternalArcade from '../audio/first-touch/slimeyfox-eternal-arcade-487325.mp3?url'
import newBark from '../audio/first-touch/turning_pages-new-bark-morning-light-590775.mp3?url'
import secretLevel from '../audio/first-touch/kissan4-secret-level-reggae-571050.mp3?url'

// First Touch only. Order is editable here; this playlist has its own saved cursor.
export const firstTouchTracks = [checkMyTeam, eternalArcade, newBark, secretLevel]
export function firstTouchSoundtrack(enabled: () => boolean) {
 const cue = createMusicCue({playlist: firstTouchTracks, storageKey: 'tbfc.arcade.firstTouch.nextMusicTrack', fadeInMs: 900})
 let playing = false, paused = false, finished = false
 function sync() {
  const shouldPlay = !finished && !paused && !document.hidden && enabled()
  if (shouldPlay === playing) return
  playing = shouldPlay
  if (playing) cue.resume(); else cue.pause()
 }
 function retry() { sync(); if (playing) cue.resume() }
 const hide = () => cue.pause()
 document.addEventListener('visibilitychange',sync)
 document.addEventListener('pointerdown',retry)
 document.addEventListener('keydown',retry)
 window.addEventListener('pagehide',hide)
 window.addEventListener('pageshow',retry)
 sync()
 return {
  update(onPause: boolean) { paused = onPause; sync() },
  finish() {
   finished = true; playing = false
   document.removeEventListener('visibilitychange',sync)
   document.removeEventListener('pointerdown',retry)
   document.removeEventListener('keydown',retry)
   window.removeEventListener('pagehide',hide)
   window.removeEventListener('pageshow',retry)
   cue.finish()
  },
 }
}
