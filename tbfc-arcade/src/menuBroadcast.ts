import * as T from 'three'

// Pick two eligible outfielders, fill the other four spots from the squad, then deal positions.
export function broadcastStarters(roster:string[],keeper:string,eligible:ReadonlySet<string>){
 const shuffle=(values:string[])=>{
  for(let i=values.length-1;i>0;i--){
   const j=Math.floor(Math.random()*(i+1))
   ;[values[i],values[j]]=[values[j],values[i]]
  }
  return values
 }
 const pool=roster.filter(name=>name!==keeper)
 const required=shuffle(pool.filter(name=>eligible.has(name))).slice(0,2)
 const others=shuffle(pool.filter(name=>!required.includes(name))).slice(0,6-required.length)
 return [...shuffle([...required,...others]),keeper]
}

// A four-second shot can track the ball, but its camera stays on the same side of play.
export function broadcastDirector(){
 const focus=new T.Vector3(),eye=new T.Vector3(),look=new T.Vector3(),heading=new T.Vector3()
 let clock=0,lastCut=-1,goalSide=1
 return function film(camera:T.PerspectiveCamera,elapsed:number,ball:T.Vector3,carrier:T.Vector3|undefined,
   face:number,attack:number,aspect:number){
  clock+=elapsed
  const cut=Math.floor(clock/4)%5,changed=cut!==lastCut
  if(changed){lastCut=cut;goalSide=attack}
  const follow=changed?1:1-Math.exp(-5*elapsed)
  focus.lerp(carrier&&cut===0?carrier:ball,follow)
  focus.y=0
  const angle=face*Math.PI/4
  heading.set(Math.sin(angle),0,Math.cos(angle))
  look.copy(focus);look.y=.85
  let fov=47
  switch(cut){
   case 0: // Offset from the carrier's shoulder, looking into the run.
    eye.copy(focus).addScaledVector(heading,-4.7)
    eye.x+=heading.z*1.35;eye.z-=heading.x*1.35;eye.y=2.7
    look.addScaledVector(heading,1.7);break
   case 1: // Parallel rails keep this a lateral tracking shot throughout.
    eye.set(focus.x,2.8,13.7);look.z=Math.min(focus.z,9.5);break
   case 2: // A fixed post outside the net, panning to follow the approach.
    eye.set(goalSide*24,2.25,-2.9);break
   case 3:
    eye.set(focus.x-3.8*goalSide,2.35,focus.z+5);fov=38;break
   default:
    eye.set(focus.x+5.5*goalSide,3.8,focus.z-4.5);fov=41
  }
  camera.position.lerp(eye,follow)
  camera.lookAt(look)
  if(camera.fov!==fov||camera.aspect!==aspect){camera.fov=fov;camera.aspect=aspect;camera.updateProjectionMatrix()}
  // Convert the billboard facing into the director's current camera space.
  return Math.round(Math.atan2(camera.position.x-look.x,camera.position.z-look.z)/(-Math.PI/4))
 }
}

const shirts:Record<string,number>={
 'Fleet Feet FC':0x79b9de,'One Kick Wonders':0x653496,'Goal Dancers FC':0xd52e25,
 'Inter Your Mom':0x414048,'Whiff City FC':0x529ddb,'Peachy Puffs':0x8cbd8a
}
export function broadcastShirt(texture:T.Texture,team:string){
 const color=shirts[team]
 if(!color)return
 const canvas=document.createElement('canvas')
 canvas.width=texture.image.width;canvas.height=texture.image.height
 const ctx=canvas.getContext('2d')!
 ctx.drawImage(texture.image,0,0)
 const pixels=ctx.getImageData(0,0,canvas.width,canvas.height)
 for(let i=0;i<pixels.data.length;i+=4){
  const [r,g,b]=[pixels.data[i],pixels.data[i+1],pixels.data[i+2]]
  if(r<100||b<g+35||r<b+35)continue
  const shade=(r+g*.45)/219
  pixels.data[i]=(color>>16)*shade;pixels.data[i+1]=(color>>8&255)*shade;pixels.data[i+2]=(color&255)*shade
 }
 ctx.putImageData(pixels,0,0);texture.image=canvas;texture.needsUpdate=true
}
