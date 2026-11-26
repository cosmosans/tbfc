import * as T from 'three'
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js'
import gulchUrl from '../art/stadiums/the-gulch.glb?url'
import {streetArena} from './streetArena'
import {stadiumBranding} from './stadiumBranding'
import type {Club} from './opponentSquads'
import type {MatchSettings} from './matchSettings'

/** Outdoor scenery is independent of the shared STREET collision specification. */
export async function buildGulch(scene:T.Scene,renderer:T.WebGLRenderer,settings:MatchSettings,
 fill:T.HemisphereLight,sun:T.DirectionalLight,setSkyTime:(time:MatchSettings['time'])=>void,home?:Club|null,away?:Club){
 const {scene:model}=await new GLTFLoader().loadAsync(gulchUrl)
 model.traverse(object=>{
  if(!(object instanceof T.Mesh))return
  object.castShadow=true;object.receiveShadow=true
  for(const material of Array.isArray(object.material)?object.material:[object.material]){
   if(!(material instanceof T.MeshStandardMaterial))continue
   if(material.map)material.map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy())
   if(settings.weather==='Rain'&&['STREET Surface Paint','Warm concrete'].includes(material.name))material.roughness=.48
  }
 })
 scene.add(model)
 const fences=['NORTH','SOUTH','WEST','EAST'].map(side=>{
  const node=model.getObjectByName('FENCE_'+side),materials:T.Material[]=[]
  node?.traverse(child=>{
   if(!(child instanceof T.Mesh))return
   child.castShadow=false
   const clone=(material:T.Material)=>{
    const copy=material.clone();copy.transparent=true;copy.depthWrite=false;materials.push(copy);return copy
   }
   child.material=Array.isArray(child.material)?child.material.map(clone):clone(child.material)
  })
  return materials
 })
 const position=new T.Vector3()
 const retainingWall=model.getObjectByName('RETAINING_WALL')
 const wallArt=model.getObjectByName('ENVIRONMENT_MURALS')
 scene.onBeforeRender=(_renderer,_scene,camera)=>{
  const p=camera.getWorldPosition(position),x=streetArena.length/2,z=streetArena.width/2
  const near=[p.z < -z,p.z > z,p.x < -x,p.x > x]
  fences.forEach((materials,i)=>materials.forEach(m=>m.opacity=near[i]&&p.y<16?.12:1))
  // The camera-side retaining wall must never hide a player near the touchline.
  if(retainingWall)retainingWall.visible=p.z<12.8||p.y>15
  if(wallArt)wallArt.visible=p.z<12.8||p.y>15
 }
 const fixtures:T.PointLight[]=[]
 for(const x of [-13,13])for(const z of [-11.1,11.1]){
  const lamp=new T.PointLight(0xd9eaff,200,29,1.5);lamp.position.set(x,6.35,z);scene.add(lamp);fixtures.push(lamp)
 }
 for(const x of [-20,0,20]){
  const lamp=new T.PointLight(0xffba70,40,10,1.6);lamp.position.set(x,3.4,12);scene.add(lamp)
 }
 function time(value:MatchSettings['time']){
  setSkyTime(value)
  const night=value==='Night',evening=value==='Evening',overcast=settings.weather!=='Sun'
  fill.color.setHex(night?0xb8d1ec:0xffe4c7);fill.groundColor.setHex(0x6b7880);fill.intensity=night?1.25:1.6
  sun.color.setHex(night?0xb9cef0:evening?0xffb273:0xffebce)
  sun.intensity=night?.28:(overcast?.7:1.7)
  sun.position.set(24,night?18:evening?9:28,-18)
  fixtures.forEach(lamp=>lamp.intensity=night?240:evening?100:15)
  renderer.shadowMap.needsUpdate=true
 }
 time(settings.time)
 if(home)await stadiumBranding(scene,home,'gulch',model,'home')
 if(away)await stadiumBranding(scene,away,'gulch',model,'away')
 const train=model.getObjectByName('ANIMATED_ENVIRONMENT'),trainX=train?.position.x??0
 train?.traverse(node=>{if(node instanceof T.Mesh)node.castShadow=false})
 const signals:T.MeshStandardMaterial[]=[]
 for(const x of [-29,29]){
  const material=new T.MeshStandardMaterial({color:0xff6738,emissive:0xff3517,emissiveIntensity:2})
  const lens=new T.Mesh(new T.SphereGeometry(.11,8,6),material);lens.position.set(x,4.8,-19.58);scene.add(lens);signals.push(material)
 }
 let elapsed=30
 return {setNight:(on:boolean)=>time(on?'Night':'Evening'),update:(dt:number)=>{
  elapsed+=dt
  if(train)train.position.x=trainX-75+(elapsed%60)*2.5
  signals.forEach((m,i)=>m.emissiveIntensity=(Math.floor(elapsed*1.5)+i)%2?2.5:.25)
 }}
}
