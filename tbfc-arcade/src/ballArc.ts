// World units above the ball's resting center. Full charge stays within jumping reach.
const maxLift = 1.8
const gravity = 17
const rebound = 0.48
const totalFlightFactor = 1 + rebound + rebound * rebound

export function kickArc(multiplier: number, availableTime = Infinity) {
  const power = multiplier - 1
  const lift = power < 0.5 ? 0 : 0.45 + (maxLift - 0.45) * (power - 0.5) * 2
  // Leave the last tenth of an assisted pass for the ball to roll into the foot.
  const duration = Math.min(Math.sqrt(8 * lift / gravity), availableTime * 0.9 / totalFlightFactor)
  return { duration, height: gravity * duration * duration / 8 }
}

export function heightAt(arc: ReturnType<typeof kickArc>, seconds: number) {
  let { duration, height } = arc
  for (let hop = 0; hop < 3 && duration > 0; hop++) {
    if (seconds < duration) {
      const progress = seconds / duration
      return 4 * height * progress * (1 - progress)
    }
    seconds -= duration
    duration *= rebound
    height *= rebound * rebound
  }
  return 0
}

export function nextTouch(duration:number,seconds:number){
 let end=duration
 for(let hop=1;hop<=2&&seconds>end;hop++){duration*=rebound;end+=duration}
 return Math.max(seconds,end)
}
