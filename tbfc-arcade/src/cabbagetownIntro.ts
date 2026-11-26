import type {IntroShot} from './grantParkIntro'

// The supplied opener hits on its first beat. Cut to the pitch at track start.
export const millSwitchTimes = [2.5, 3.85, 5.2]
export const millBeatAt = 6.25
export const millOpening: IntroShot[] = [
  {name:'Court sweep', seconds:2.15, from:[-18,.30,9], to:[-7,.85,5],
   lookFrom:[-7,.58,4], lookTo:[7,1.7,-5], fov:66},
  {name:'West light bay', seconds:1.35, from:[-17,7.3,2], to:[-17.9,7.5,2.6],
   lookFrom:[-24,11.8,-9], lookTo:[-24,11.8,-9], fov:52},
  {name:'Center light bay', seconds:1.35, from:[-4,6.7,1], to:[-3,6.9,1.4],
   lookFrom:[0,11.8,-9], lookTo:[0,11.8,-9], fov:74},
  {name:'East light bay', seconds:millBeatAt-4.85, from:[16,7.3,2], to:[17,7.5,2.6],
   lookFrom:[24,11.8,-9], lookTo:[24,11.8,-9], fov:52},
]
