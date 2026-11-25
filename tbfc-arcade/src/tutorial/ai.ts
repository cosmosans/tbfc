import scene from './scene.json' with { type: 'json' }
export const tutorialAllowsChallenges = (chapter: number) => chapter === 5 || chapter === 11

export function tutorialTouchlineSpot(index: number, away: boolean) {
 return { x: -13 + 5 * index + (away ? 1 : 0), z: away ? -11 : 11 }
}

/** Tutorial intentions feed existing steering. No positions, velocities, or possession are written here. */
export function coachingTarget(chapter: number, name: string, index: number, ball: {x:number;z:number}, chatting: boolean, away = false, defenders: readonly string[] = scene.defendingTeam): {x:number;z:number} | null {
 if (chapter === 11 && !chatting) return null
 if (!isTutorialParticipant(chapter, name, away, defenders)) return tutorialTouchlineSpot(index, away)
 if (away && chapter === 5 && scene.defendingPartners.includes(name)) {
  const lane = scene.defendingPartners.indexOf(name)
  return { x: Math.max(-12, Math.min(12, ball.x + 5)), z: Math.max(-8, Math.min(8, ball.z + (lane - 1) * 4)) }
 }
 if (away) {
  // Defenders keep respectful distance during conversation and every noncompetitive drill.
  if (chatting || !tutorialAllowsChallenges(chapter)) return { x: ball.x + 7, z: (index - 2) * 3 }
  return null
 }
 if (chapter === 5 && !chatting) return { x: ball.x + (index % 2 ? -1.8 : 1.8), z: ball.z + 1.6 }
 if (chatting) return { x: ball.x + (index % 2 ? 3 : -3), z: ball.z + (index - 2) * 1.4 }
 if (chapter <= 3) return { x: ball.x + (index % 2 ? 4 : -4), z: ball.z + (index % 3 - 1) * 4 }
 // Runs, crosses, retrieval and defending use the normal tactical AI thereafter.
 return null
}

/** Each teammate notices new space at their own pace, then commits to that spot.
 * Holding a world-space goal lets the existing steering jog there and settle,
 * instead of translating the whole passing triangle with every player step.
 */
export class TutorialCoaching {
 private intentions = new Map<string, { context: string; until: number; target: {x:number;z:number}; visits: number }>()
 target(chapter: number, name: string, index: number, ball: {x:number;z:number}, chatting: boolean, away: boolean, time: number, defenders: readonly string[] = scene.defendingTeam, looseBall = false) {
  const desired = coachingTarget(chapter, name, index, ball, chatting, away, defenders)
  const key = `${away ? 'away' : 'home'}:${name}`
  if (!desired) { this.intentions.delete(key); return null }
  if (chapter === 5 && looseBall && isTutorialParticipant(chapter, name, away, defenders)) {
   // Chase every live loose ball immediately, rather than waiting on a social
   // positioning timer or retaining a pressure offset from the ball.
   this.intentions.delete(key)
   return { x: ball.x, z: ball.z }
  }
  if (!isTutorialParticipant(chapter, name, away, defenders)) return desired
  const context = `${chapter}:${chatting}`
  const previous = this.intentions.get(key)
  if (previous?.context === context && time < previous.until) return previous.target
  const personality = [...name].reduce((sum, letter) => sum + letter.charCodeAt(0), 0)
  const visits = (previous?.visits ?? 0) + 1
  // Different timing and modest lateral choices keep lanes usable without orbiting in lockstep.
  const angle = personality * .73 + visits * 2.4
  const roam = chatting ? .35 : 1.25
  const target = { x: desired.x + Math.cos(angle) * roam, z: desired.z + Math.sin(angle) * roam }
  const interval = (chatting ? 1.8 : 1.2) + (personality % 11) * .13 + (visits % 3) * .19
  this.intentions.set(key, { context, until: time + interval, target, visits })
  return target
 }
}

export function isTutorialParticipant(chapter: number, name: string, away: boolean, defenders: readonly string[] = scene.defendingTeam) {
 if (chapter === 5 && !away) return defenders.includes(name)
 if (chapter === 5 && away) return scene.defendingPartners.includes(name)
 const arrivals: Record<string, number> = scene.arrivals
 return chapter >= (arrivals[name] ?? (away ? 11 : 0))
}
