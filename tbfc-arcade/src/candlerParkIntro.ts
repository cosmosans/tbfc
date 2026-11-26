import { CubicBezierCurve3, MathUtils, Vector3 } from 'three'
import type { IntroShot } from './grantParkIntro'

export const parkBeatAt = 7
const releaseAt = 4
const speed = 5.6
const streetZ = -30.75
const carX = (seconds: number) => -38 + seconds * speed
const releaseX = carX(releaseAt)

// Enter the swing on the car's tangent, then climb past the north touchline.
const swing = new CubicBezierCurve3(
  new Vector3(releaseX - 6, 2.25, streetZ - 1),
  new Vector3(releaseX + 2, 2.25, streetZ - 1),
  new Vector3(-11, 4.6, -18),
  new Vector3(-6, 6.4, -12),
)
export const parkOpening: IntroShot = {
  name: 'Neighborhood chase', seconds: 8.5, fov: 62,
  from: [0,0,0], to: [0,0,0], lookFrom: [0,0,0], lookTo: [0,0,0],
}
const supporters = new Vector3(-8.9, 1.2, -15.6)
const center = new Vector3(2, 0.65, 0)
export function parkCamera(seconds: number, eye: Vector3, aim: Vector3) {
  const x = carX(seconds)
  eye.set(x - 6, 2.25, streetZ - 1)
  aim.set(x, 0.85, streetZ)
  if (seconds > releaseAt) {
    swing.getPoint((seconds - releaseAt) / (parkOpening.seconds - releaseAt), eye)
    aim.lerp(supporters, MathUtils.smoothstep(seconds, releaseAt, 6))
    aim.lerp(center, MathUtils.smoothstep(seconds, 6, parkBeatAt + 0.55))
  }
  return x
}
