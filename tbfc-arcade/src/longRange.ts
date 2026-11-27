export const longRangeBox=Object.freeze({fieldX:21,depth:6.8,halfWidth:6.05})
export const longRangeBalance=Object.freeze({distancePenalty:.5,accuracyBonus:.15,velocity:1.15,curve:1.2,keeperDelay:1.1,maxShotSpeed:45,minAiExpectedPoints:.38})
// The line belongs to the one-point area. Coordinates refer to the ball at contact.
export function longRangeEligible(x:number,z:number,attackSign:number,box=longRangeBox){
 return attackSign*x < box.fieldX-box.depth || Math.abs(z)>box.halfWidth
}
export function goalValue(mode:string,x:number,z:number,attackSign:number){
 return mode==='longRange'&&longRangeEligible(x,z,attackSign)?2:1
}
