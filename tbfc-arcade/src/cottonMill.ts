import * as T from 'three'
import type {MatchSettings} from './matchSettings'

export function cottonMill(scene:T.Scene,model:T.Object3D,settings:MatchSettings,
 fill:T.HemisphereLight,sun:T.DirectionalLight,setSkyTime:(time:MatchSettings['time'])=>void){
 const fans=model.children.filter(node=>node.name.startsWith('MillFan'))
 const walls=['north','south','east','west'].map(side=>model.getObjectByName('01_Wall_'+side)!)
 const roof=model.getObjectByName('01_Rafters_skylights_and_pendants')!
 // The high chase and celebration cameras can cross the building envelope.
 scene.onBeforeRender=(_renderer,_scene,camera)=>{
  const {x,y,z}=camera.position
  walls[0].visible=z>-30.7;walls[1].visible=z<30.7
  walls[2].visible=x<39.7;walls[3].visible=x>-39.7
  roof.visible=y<15.3
 }
 const fixtures:T.PointLight[]=[]
 for(const x of [-24,-8,8,24])for(const z of [-9,9]){
  const lamp=new T.PointLight(0xe9f2ff,165,27,1.7)
  lamp.position.set(x,11.55,z);scene.add(lamp);fixtures.push(lamp)
 }
 for(const x of [-24,0,23]){
  const sconce=new T.PointLight(0xffb260,34,13,1.6)
  sconce.position.set(x,3.3,-24);scene.add(sconce)
 }
 const overcast=settings.weather!=='Sun'
 function time(t:MatchSettings['time']){
  const night=t==='Night',evening=t==='Evening'
  setSkyTime(t)
  fill.color.setHex(night?0xb4bfda:overcast?0xc2d0da:0xf2e4d0)
  fill.groundColor.setHex(0x9798a3);fill.intensity=night?.89:1.35
  sun.color.setHex(evening?0xffba88:0xe5efff);sun.intensity=night?.07:overcast?.45:1.55
  for(const lamp of fixtures)lamp.intensity=night?225:155
 }
 time(settings.time)
 return {setSchoolNight:(on:boolean)=>time(on?'Night':'Evening'),update:(dt:number)=>{
  for(const fan of fans)fan.rotation.y+=dt*.65
 }}
}
