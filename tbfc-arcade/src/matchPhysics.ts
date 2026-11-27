import type {GameMode} from './matchRules.ts'
export type PhysicsProfile={traction:number;acceleration:number;deceleration:number;ballSpeed:number;rollingResistance:number;slideDistance:number;slideRecovery:number}
export const standardPhysics:Readonly<PhysicsProfile>=Object.freeze({traction:1,acceleration:1,deceleration:1,ballSpeed:1,rollingResistance:1,slideDistance:1,slideRecovery:1})
export const snowPhysics:Readonly<PhysicsProfile>=Object.freeze({traction:.35,acceleration:.8,deceleration:.35,ballSpeed:1.25,rollingResistance:.5,slideDistance:1.75,slideRecovery:1.25})
export const physicsFor=(mode:GameMode)=>mode==='snowpocalypse'?snowPhysics:standardPhysics
export type Motion={x:number;z:number}
// Exact exponential integration makes braking and steering independent of frame rate.
// Acceleration is responsive immediately; lateral momentum survives a sharp turn.
export function snowMotion(velocity:Motion,desired:Motion,dt:number,profile=snowPhysics):Motion {
 if(dt<=0)return {x:0,z:0}
 const speed=Math.hypot(desired.x,desired.z)
 const nx=speed>.001?desired.x/speed:1,nz=speed>.001?desired.z/speed:0
 const parallel=velocity.x*nx+velocity.z*nz,lateral=-velocity.x*nz+velocity.z*nx
 const alongRate=speed<.001?8*profile.deceleration:parallel<0?8*profile.traction:8*profile.acceleration
 const sideRate=8*(speed<.001?profile.deceleration:profile.traction)
 const alongDecay=Math.exp(-alongRate*dt),sideDecay=Math.exp(-sideRate*dt)
 const alongStep=speed*dt+(parallel-speed)*(1-alongDecay)/alongRate
 const sideStep=lateral*(1-sideDecay)/sideRate
 const nextAlong=speed+(parallel-speed)*alongDecay,nextSide=lateral*sideDecay
 velocity.x=nx*nextAlong-nz*nextSide;velocity.z=nz*nextAlong+nx*nextSide
 return {x:nx*alongStep-nz*sideStep,z:nz*alongStep+nx*sideStep}
}

export function approachVelocity(position:Motion,target:Motion,pace:number):Motion {
 const dx=target.x-position.x,dz=target.z-position.z,d=Math.hypot(dx,dz)
 // AI anticipates braking but shares exactly the same traction as controllers.
 const speed=Math.min(pace,Math.sqrt(2*8*snowPhysics.deceleration*d))
 return d<.08?{x:0,z:0}:{x:dx/d*speed,z:dz/d*speed}
}
export function slideTravel(age:number,profile=standardPhysics){
 const t=Math.max(0,age)
 if(profile===standardPhysics)return 3.5*Math.min(.12,t)
 // Original contact timing and initial lunge, followed by a finite coast.
 const coast=Math.min(1,Math.max(0,(t-.12)/.3))
 return 3.5*Math.min(.12,t)+.42*(profile.slideDistance-1)*(1-(1-coast)**2)
}
