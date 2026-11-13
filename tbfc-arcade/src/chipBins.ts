import * as T from 'three'

const rimHeight=1.22,radius=.67,gravity=12
export function createChipBins(scene:T.Scene){
 const group=new T.Group();scene.add(group);group.visible=false
 const steel=new T.MeshStandardMaterial({color:0x6d7c79,metalness:.45,roughness:.56,side:T.DoubleSide})
 const ribMaterial=new T.MeshStandardMaterial({color:0x88938f,roughness:.5})
 const shell=new T.CylinderGeometry(radius,.49,rimHeight,20,1,true)
 const ring=new T.TorusGeometry(radius,.055,6,24)
 const rib=new T.BoxGeometry(.035,.98,.035)
 const bins=[[9,0],[12,5],[15,-4]].map(([x,z])=>{
  const bin=new T.Group();bin.position.set(x,0,z);group.add(bin)
  const body=new T.Mesh(shell,steel);body.position.y=rimHeight/2;bin.add(body)
  for(let i=0;i<12;i++){
   const a=i*Math.PI/6,strip=new T.Mesh(rib,ribMaterial)
   strip.position.set(.59*Math.sin(a),.61,.59*Math.cos(a))
   strip.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(.15*Math.sin(a),1,.15*Math.cos(a)).normalize())
   bin.add(strip)
  }
  const base=new T.Mesh(new T.CircleGeometry(.49,20),steel);base.rotation.x=-Math.PI/2;base.position.y=.06;bin.add(base)
  const lip=new T.Mesh(ring,new T.MeshBasicMaterial({color:0xb2bcb7}));lip.rotation.x=Math.PI/2;lip.position.y=rimHeight;bin.add(lip)
  return {position:bin.position,lip}
 })
 let target=0,age=0,judged=false,caughtBin=-1
 const roll=new T.Vector3()
 let flying=false
 const origin=new T.Vector3(),velocity=new T.Vector3()
 return {
  landing(ball:T.Vector3,out:T.Vector3){
   const v=judged?roll:velocity,vy=judged?v.y:v.y-gravity*age
   const t=(vy+Math.sqrt(vy*vy+2*gravity*Math.max(0,ball.y-.18)))/gravity
   out.copy(ball).addScaledVector(v,t)
  },
  get flying(){return flying},
  show(index:number){target=[0,1,2,1,2][index%5];group.visible=true;flying=false;bins.forEach((b,i)=>b.lip.material.color.setHex(i===target?0xffbd40:0x9ba7a0))},
  hide(){group.visible=false;flying=false},
  launch(ball:T.Vector3,aimX:number,aimZ:number,power:number){
   origin.copy(ball);const to=bins[target].position
   const dir=new T.Vector2(to.x-ball.x,to.z-ball.z).normalize(),aim=new T.Vector2(aimX,aimZ)
   if(aim.length()>.25){aim.normalize();if(aim.dot(dir)<.88)dir.copy(aim);else dir.lerp(aim,.22).normalize()}
   const speed=4+8*power
   velocity.set(dir.x*speed,4.8+3*power,dir.y*speed);age=0;flying=true;judged=false;caughtBin=-1
  },
  step(ball:T.Vector3,dt:number,finish:(points:number,label:string)=>void){
   if(judged){
    const airborne=ball.y>.181||Math.abs(roll.y)>.01
    ball.addScaledVector(roll,dt)
    if(airborne)roll.y-=gravity*dt
    if(ball.y<=.18){
     ball.y=.18;roll.y=roll.y<-.85?-roll.y*.4:0
     const speed=Math.hypot(roll.x,roll.z),drag=Math.max(0,1-4*dt/Math.max(.001,speed))
     roll.x*=drag;roll.z*=drag
    }
    if(caughtBin>=0){
     const center=bins[caughtBin].position,dx=ball.x-center.x,dz=ball.z-center.z,d=Math.hypot(dx,dz)
     if(d>.32){
      const nx=dx/d,nz=dz/d,impact=Math.max(0,roll.x*nx+roll.z*nz)
      ball.x=center.x+.32*nx;ball.z=center.z+.32*nz;roll.x-=1.4*impact*nx;roll.z-=1.4*impact*nz
     }
    }
    if(ball.y<=.181&&roll.lengthSq()<.01)flying=false
    return
   }
   const previousY=ball.y;age+=dt
   ball.copy(origin).addScaledVector(velocity,age);ball.y-=.5*gravity*age*age
   if(previousY>=rimHeight&&ball.y<rimHeight){
    const contact=(velocity.y+Math.sqrt(velocity.y**2-2*gravity*(rimHeight-origin.y)))/gravity
    const x=origin.x+velocity.x*contact,z=origin.z+velocity.z*contact
    for(const [i,bin] of bins.entries()){
     const offset=Math.hypot(x-bin.position.x,z-bin.position.z)
     if(offset>radius+.18)continue
     judged=true;roll.copy(velocity);roll.y-=gravity*contact;ball.set(x,rimHeight,z)
     if(offset>radius-.12){
      const nx=(x-bin.position.x)/offset,nz=(z-bin.position.z)/offset
      ball.x=bin.position.x+nx*(radius+.19);ball.z=bin.position.z+nz*(radius+.19)
      roll.set(nx*2.5,-roll.y*.48,nz*2.5);finish(i===target?6:2,'Off the rim')
     }else{
      caughtBin=i;roll.x*=.28;roll.z*=.28
      const distance=Math.hypot(x-origin.x,z-origin.z)
      finish(i===target?Math.min(20,12+Math.round(Math.min(4,distance/2))+Math.round(4*(1-offset/radius))):4,i===target?'In the bin':'Other bin')
     }
     return
    }
   }
   if(ball.y<=.18){
    judged=true;ball.y=.18;roll.copy(velocity).multiplyScalar(.57);roll.y=Math.max(0,(gravity*age-velocity.y)*.42)
    finish(0,'Missed the bin')
   }
  }
 }
}
