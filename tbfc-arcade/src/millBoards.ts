import {streetBoards} from './streetArena.ts'
// Inside faces of the mill's padded panels, inset by the ball radius.
export const millBoards = {x:20.86, north:-11.86, south:11.86, top:.95, radius:.18}

type Point = {x:number,y:number,z:number}

export function millBankAim(ball:Point, x:number, z:number, teammates:Point[],bounds=millBoards,goalHalfWidth=2){
 const length=Math.hypot(x,z)
 if(length<.22)return false
 x/=length;z/=length
 const end=x?(Math.sign(x)*bounds.x-ball.x)/x:Infinity
 const side=z?((z<0?bounds.north:bounds.south)-ball.z)/z:Infinity
 const distance=Math.min(end,side)
 if(distance<0||distance>10)return false
 if(end<=side&&Math.abs(ball.z+z*end)<goalHalfWidth+.2)return false
 // A teammate directly in the passing lane still gets the usual assisted pass.
 return !teammates.some(p=>{
  const dx=p.x-ball.x,dz=p.z-ball.z,along=dx*x+dz*z
  return along>0&&along<distance&&Math.abs(dx*z-dz*x)<.85
 })
}

export function millContact(start:Point,ball:Point,velocity:Point,enclosure?:{halfWidth:number;height:number}){
 if(enclosure)return enclosedContact(start,ball,velocity,enclosure)
 let hit=false
 for(const axis of ['x','z'] as const){
  const delta=ball[axis]-start[axis]
  if(!delta)continue
  const wall=axis==='x'?Math.sign(delta)*millBoards.x:delta<0?millBoards.north:millBoards.south
  const fraction=(wall-start[axis])/delta
  if(fraction<0||fraction>1)continue
  // The panels end at the goalposts. Let balls enter either goal mouth.
  if(axis==='x'&&Math.abs(start.z+(ball.z-start.z)*fraction)<2)continue
  if(start.y+(ball.y-start.y)*fraction>millBoards.top+millBoards.radius)return 'out'
  ball[axis]=wall-(ball[axis]-wall)*.8
  velocity[axis]*=-.8
  hit=true
 }
 return hit?'bounce':'live'
}

type FloorPoint = {x:number,z:number}

function laneBlocked(from:FloorPoint,to:FloorPoint,defenders:FloorPoint[],clearance:number){
 const dx=to.x-from.x,dz=to.z-from.z,lengthSq=dx*dx+dz*dz
 return defenders.some(p=>{
  const t=((p.x-from.x)*dx+(p.z-from.z)*dz)/lengthSq
  return t>0&&t<1&&Math.hypot(p.x-from.x-t*dx,p.z-from.z-t*dz)<clearance
 })
}

// Aim for a point on the padding that accounts for the lost normal velocity.
// Keep enough speed after rolling friction for the ball to reach the receiver.
export function planMillBank(from:FloorPoint,to:FloorPoint,defenders:FloorPoint[],clearance:number,bounds=millBoards,goalHalfWidth=2){
 if(Math.hypot(to.x-from.x,to.z-from.z)<3||!laneBlocked(from,to,defenders,clearance))return null
 if(defenders.some(p=>Math.hypot(p.x-to.x,p.z-to.z)<1.6))return null
 let best:{x:number,z:number,distance:number,power:number}|null=null
 for(const [axis,wall] of [['z',bounds.north],['z',bounds.south],['x',-bounds.x],['x',bounds.x]] as const){
  const along=axis==='z'?'x':'z'
  const first=Math.abs(wall-from[axis]),second=Math.abs(wall-to[axis])
  if(first<.4||second<.4||first>10)continue
  const touch={...from}
  touch[axis]=wall
  touch[along]+= (to[along]-from[along])*first/(first+second/.8)
  if(axis==='x'&&(from.z*to.z<=0||Math.min(Math.abs(from.z),Math.abs(to.z))<goalHalfWidth+1))continue
  const inbound=Math.hypot(touch.x-from.x,touch.z-from.z)
  const outbound=Math.hypot(to.x-touch.x,to.z-touch.z)
  const distance=inbound+outbound
  const retainedSpeedSq=1-(1-.8**2)*(first/inbound)**2
  const speed=Math.sqrt(12*inbound+(12*outbound+5**2)/retainedSpeedSq)
  if(speed>23||best&&distance>=best.distance)continue
  if(defenders.some(p=>Math.hypot(p.x-touch.x,p.z-touch.z)<clearance)||
     laneBlocked(from,touch,defenders,clearance)||laneBlocked(touch,to,defenders,clearance))continue
  best={...touch,distance,power:Math.max(0,(speed-15)/8)}
 }
 return best
}

// Sweep all the way to each impact, then integrate the remaining travel. This
// handles fast diagonal strikes and more than one wall within a frame.
export function enclosedContact(start:Point,ball:Point,velocity:Point,goal:{halfWidth:number;height:number},bounds=streetBoards){
 const p={...start};let travel={x:ball.x-start.x,y:ball.y-start.y,z:ball.z-start.z},hit=false
 for(let step=0;step<12;step++){
  const tx=travel.x?((Math.sign(travel.x)*bounds.x-p.x)/travel.x):Infinity
  const tz=travel.z?(((travel.z<0?bounds.north:bounds.south)-p.z)/travel.z):Infinity
  const axis=tx<tz?'x':'z',t=Math.min(tx,tz)
  if(t<0||t>1||!Number.isFinite(t)){ball.x=p.x+travel.x;ball.y=p.y+travel.y;ball.z=p.z+travel.z;return hit?'bounce':'live'}
  const contact={x:p.x+travel.x*t,y:p.y+travel.y*t,z:p.z+travel.z*t}
  // The whole ball must fit below the bar. The frame itself uses the same data.
  if(axis==='x'&&Math.abs(contact.z)<goal.halfWidth-.08&&contact.y<goal.height-.08){ball.x=p.x+travel.x;ball.y=p.y+travel.y;ball.z=p.z+travel.z;return hit?'bounce':'live'}
  if(contact.y>bounds.fenceTop){Object.assign(ball,contact);return 'out'}
  Object.assign(p,contact);travel.x*=1-t;travel.y*=1-t;travel.z*=1-t
  travel[axis]*=-.8;velocity[axis]*=-.8;p[axis]+=Math.sign(travel[axis])*.0001;hit=true
 }
 // Extreme velocities cannot tunnel out even if they exhaust the sweep budget.
 ball.x=Math.max(-bounds.x,Math.min(bounds.x,p.x));ball.y=p.y;ball.z=Math.max(bounds.north,Math.min(bounds.south,p.z));return 'bounce'
}
