import * as T from 'three'
import {clubAccent,type Club} from './opponentSquads'
import supportersUrl from './art/eastside-supporters-pink.png?url'

export async function eastsideStreetLife(scene:T.Scene,park:T.Object3D,homeClub:Club|null){
 const source=await new T.TextureLoader().loadAsync(supportersUrl)
 const canvas=document.createElement('canvas')
 canvas.width=source.image.width;canvas.height=source.image.height
 const ctx=canvas.getContext('2d')!
 ctx.drawImage(source.image,0,0)
 const pixels=ctx.getImageData(0,0,canvas.width,canvas.height)
 const hex=homeClub?clubAccent(homeClub):'#888888'
 const color=[1,3,5].map(offset=>parseInt(hex.slice(offset,offset+2),16))
 for(let i=0;i<pixels.data.length;i+=4){
  const [r,g,b]=pixels.data.slice(i,i+3)
  if(r>70&&r>g*1.3&&b>g*1.2){
   const shade=Math.max(.36,Math.min(1,(r+b)/370))
   pixels.data[i]=color[0]*shade
   pixels.data[i+1]=color[1]*shade
   pixels.data[i+2]=color[2]*shade
  }
 }
 ctx.putImageData(pixels,0,0)
 const atlas=new T.CanvasTexture(canvas)
 source.dispose()
 atlas.colorSpace=T.SRGBColorSpace
 atlas.magFilter=T.NearestFilter
 const fans=[
  {x:-16.4,z:-15.1,frame:0,y:0},
  {x:-15.6,z:-15.45,frame:3,y:0},
  {x:17.4,z:-15.87,frame:2,y:.16},
  {x:15.9,z:-15.2,frame:1,y:0},
  {x:-8.9,z:-15.6,frame:1,y:0},
 ]
 for(const fan of fans){
  const map=atlas.clone()
  map.repeat.x=.25;map.offset.x=fan.frame*.25
  const sprite=new T.Sprite(new T.SpriteMaterial({map,alphaTest:.2}))
  sprite.name='Home supporter template'
  sprite.center.set(.5,.025);sprite.scale.setScalar(1.91)
  sprite.position.set(fan.x,fan.y,fan.z)
  scene.add(sprite)
 }

 const parked=park.children.filter(node=>node.name.startsWith('Curbside'))
 const lanes=[-1,1].map(direction=>{
  const passing=new T.Group()
  passing.name='Neighborhood traffic'
  scene.add(passing)
  const models=parked.map(source=>{
   const car=source.clone()
   const center=new T.Box3().setFromObject(car).getCenter(new T.Vector3())
   car.position.x-=center.x;car.position.z-=center.z
   car.traverse(part=>{part.castShadow=false})
   car.visible=false;passing.add(car)
   return car
  })
  passing.rotation.y=direction===1?0:Math.PI
  passing.position.z=direction===1?-30.75:-32.6
  return {direction,passing,models,delay:1+Math.random()*8,speed:0,active:false}
 })
 return (dt:number)=>{
  for(const lane of lanes){
   if(!lane.active){
    lane.delay-=dt
    if(lane.delay>0||!lane.models.length)continue
    const chosen=Math.floor(Math.random()*lane.models.length)
    lane.models.forEach((model,i)=>{model.visible=i===chosen})
    lane.speed=5+Math.random()*3.8
    lane.passing.position.x=-48*lane.direction
    lane.active=true
   }
   lane.passing.position.x+=lane.direction*lane.speed*dt
   if(lane.direction*lane.passing.position.x>48){
    lane.models.forEach(model=>{model.visible=false})
    lane.active=false
    lane.delay=2+Math.random()**1.6*26
   }
  }
 }
}
