import type { Vector3 } from "three";

type Point = [number, number, number];
export type IntroShot = {
  name: string;
  seconds: number;
  from: Point;
  to: Point;
  lookFrom: Point;
  lookTo: Point;
  fov: number;
  endFov?: number;
};

export const daytimeSweepAt = 4.9;
const lampShotAt = 2.85;
export const lampSwitchAt = 3.5;
export const montageAt = 4.76;

export function grantParkShots(lamp?: Vector3): IntroShot[] {
  const shots: IntroShot[] = [{
    name: "Trackside", seconds: lamp ? lampShotAt : daytimeSweepAt,
    from: [8.5, .15, -16.3], to: [-5.5, .52, -15.56],
    lookFrom: [1.3, .86, -15.1], lookTo: [-10, .82, -14.7], fov: 69,
  }];
  if (lamp) {
    const x = lamp.x, z = lamp.z;
    const towardField = -Math.sign(z);
    const startZ = z + towardField * 11;
    const stopZ = z + towardField * 9.6;
    const cameraX = x - 2.1;
    shots.push({
      name: "Floodlight", seconds: montageAt - lampShotAt,
      from: [cameraX, 5, startZ], to: [cameraX, 5, stopZ],
      lookFrom: [cameraX, 9.7, startZ - towardField * 10],
      lookTo: [cameraX, 9.7, stopZ - towardField * 10], fov: 39,
    });
  }
  if (!lamp) shots.push(
    { name: "Campus sweep", seconds: 4.8, from: [-8, 1.3, -14], to: [-5, 7, -11],
      lookFrom: [-11, 1, -9], lookTo: [2, .4, 1], fov: 64, endFov: 58 },
  );
  shots.push(
    { name: "Passing and laps", seconds: 7, from: [-9, 34, 4], to: [6, 31, 8],
      lookFrom: [-3, 0, 0], lookTo: [2, 0, 0], fov: 65 },
    { name: "Track runners", seconds: 4, from: [-8, 6, 18], to: [5, 7, 18],
      lookFrom: [-2, .5, 10], lookTo: [5, .6, 7], fov: 65 },
    { name: "Finishing practice", seconds: 6, from: [12, 3, -9], to: [17, 3.7, -8],
      lookFrom: [15, 1, 3], lookTo: [20, 1, .8], fov: 60, endFov: 52 },
    { name: "Taking position", seconds: 6, from: [-5, 15, 20], to: [4, 12, 19],
      lookFrom: [-2, 0, 0], lookTo: [1, 0, 0], fov: 62 },
  );
  return shots;
}

// Stadium-shaped lap with straight touchlines and semicircular ends.
export function lapPosition(time: number, side: number, out: Vector3) {
  const radius = 15.65, straight = 26, bend = Math.PI * radius;
  const length = 2 * (straight + bend);
  let d = (time * 3.8 + side * length / 2) % length;
  if (d < straight) return out.set(-13 + d, 0, radius);
  d -= straight;
  if (d < bend) return out.set(13 + radius * Math.sin(d / radius), 0, radius * Math.cos(d / radius));
  d -= bend;
  if (d < straight) return out.set(13 - d, 0, -radius);
  d -= straight;
  return out.set(-13 - radius * Math.sin(d / radius), 0, -radius * Math.cos(d / radius));
}
