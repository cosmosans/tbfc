// Inside faces of the mill's padded panels, inset by the ball radius.
export const millBoards = {x:20.86, north:-11.86, south:11.86, top:.95, radius:.18}

type Point = {x:number,y:number,z:number}

export function millBankAim(ball:Point, x:number, z:number, teammates:Point[]){
 const length=Math.hypot(x,z)
 if(length<.22)return false
 x/=length;z/=length
 const end=x?(Math.sign(x)*millBoards.x-ball.x)/x:Infinity
 const side=z?((z<0?millBoards.north:millBoards.south)-ball.z)/z:Infinity
 const distance=Math.min(end,side)
 if(distance<0||distance>10)return false
 if(end<=side&&Math.abs(ball.z+z*end)<2.2)return false
 // A teammate directly in the passing lane still gets the usual assisted pass.
 return !teammates.some(p=>{
  const dx=p.x-ball.x,dz=p.z-ball.z,along=dx*x+dz*z
  return along>0&&along<distance&&Math.abs(dx*z-dz*x)<.85
 })
}

export function millContact(start:Point,ball:Point,velocity:Point){
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
export function planMillBank(from:FloorPoint,to:FloorPoint,defenders:FloorPoint[],clearance:number){
 if(Math.hypot(to.x-from.x,to.z-from.z)<3||!laneBlocked(from,to,defenders,clearance))return null
 if(defenders.some(p=>Math.hypot(p.x-to.x,p.z-to.z)<1.6))return null
 let best:{x:number,z:number,distance:number,power:number}|null=null
 for(const [axis,wall] of [['z',millBoards.north],['z',millBoards.south],['x',-millBoards.x],['x',millBoards.x]] as const){
  const along=axis==='z'?'x':'z'
  const first=Math.abs(wall-from[axis]),second=Math.abs(wall-to[axis])
  if(first<.4||second<.4||first>10)continue
  const touch={...from}
  touch[axis]=wall
  touch[along]+= (to[along]-from[along])*first/(first+second/.8)
  if(axis==='x'&&(from.z*to.z<=0||Math.min(Math.abs(from.z),Math.abs(to.z))<3))continue
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
