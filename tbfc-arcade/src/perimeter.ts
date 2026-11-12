// Inside faces of the advertising boards, measured from the center spot.
export const boardX=23.5, boardZ=13.25, boardHeight=1, boardThickness=.14
const radius=.18

export function advanceOutBall(p:{x:number,y:number,z:number},v:{x:number,y:number,z:number},dt:number){
  let hitBoard=false
  const old={x:p.x,y:p.y,z:p.z}
  p.x+=v.x*dt;p.z+=v.z*dt
  p.y+=v.y*dt-8.5*dt*dt;v.y-=17*dt
  // Test the crossing height so a lob can clear the top of a board.
  for(const axis of ['x','z'] as const){
    const other=axis==='x'?'z':'x'
    const wall=(axis==='x'?boardX:boardZ)-radius
    const span=(axis==='x'?boardZ:boardX)+radius
    const sign=Math.sign(v[axis])
    if(!sign||old[axis]*sign>wall||p[axis]*sign<wall)continue
    const fraction=(sign*wall-old[axis])/(p[axis]-old[axis])
    const hitTime=dt*fraction
    if(old.y+(v.y+17*dt)*hitTime-8.5*hitTime*hitTime>boardHeight+radius ||
       Math.abs(old[other]+(p[other]-old[other])*fraction)>span)continue
    hitBoard=true
    p[axis]=sign*wall-(p[axis]-sign*wall)*.66
    v[axis]*=-.66;v[other]*=.89
  }
  if(p.y<=radius){
    p.y=radius
    v.y=v.y < -1.4 ? -v.y*.38 : 0
  }
  const damping=Math.exp(-(p.y<=radius+.01?1.25:.18)*dt)
  v.x*=damping;v.z*=damping
  return hitBoard
}
