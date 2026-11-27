export const airBallsProfile = {
  contact: 1.5, inputBufferMs: 600, halfVolleyMs: 500,
  hangTime: 1.2, shotSpeed: 1.15,
  accuracy: { HEADER: 1.3, VOLLEY: 1.35, 'HALF-VOLLEY': 1.25, 'BICYCLE KICK': 1.35 },
} as const;
export type AirFinish = keyof typeof airBallsProfile.accuracy | 'DIRECT FREE KICK' | 'PENALTY' | 'OWN GOAL' | 'GROUNDED';
export function airGoalEligible(finish: AirFinish) { return finish !== 'GROUNDED'; }
export function airAccuracy(finish: AirFinish) {
  return finish in airBallsProfile.accuracy
    ? airBallsProfile.accuracy[finish as keyof typeof airBallsProfile.accuracy] : 1;
}
export function aerialFinish(height:number, bouncedAgoMs=Infinity, bicycle=false):AirFinish {
  if(bouncedAgoMs>=0 && bouncedAgoMs<=airBallsProfile.halfVolleyMs) return 'HALF-VOLLEY';
  if(bicycle) return 'BICYCLE KICK';
  return height>=1.12 ? 'HEADER' : 'VOLLEY';
}
