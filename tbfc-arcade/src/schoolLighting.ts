import * as T from 'three'

// Pick up the lamp-head locations from the exported Blender lens geometry.
export function schoolLighting(scene:T.Scene,school:T.Object3D,renderer:T.WebGLRenderer,
 fill:T.HemisphereLight,sun:T.DirectionalLight,setSkyTime:(time:'Evening'|'Night')=>void,venue:'school'|'eastside'|'southside'|'westend'){
 const fixtures=new Map<string,T.Box3>()
 const windows=new Set<T.MeshStandardMaterial>()
 const vertex=new T.Vector3()
 school.updateMatrixWorld(true)
 school.traverse(object=>{
  if(!(object instanceof T.Mesh))return
  const material=object.material
  if(!(material instanceof T.MeshStandardMaterial))return
  if(material.name==='Evening glass')windows.add(material)
  if(material.name!=='Warm safety lens')return
  const points=object.geometry.attributes.position
  for(let i=0;i<points.count;i++){
   vertex.fromBufferAttribute(points,i).applyMatrix4(object.matrixWorld)
   if(vertex.y<8)continue
   const quadrant=Math.sign(vertex.x)+','+Math.sign(vertex.z)
   if(!fixtures.has(quadrant))fixtures.set(quadrant,new T.Box3())
   fixtures.get(quadrant)!.expandByPoint(vertex)
  }
 })
 const rig=new T.Group()
 const canvas=document.createElement('canvas')
 canvas.width=canvas.height=64
 const ctx=canvas.getContext('2d')!
 const glow=ctx.createRadialGradient(32,32,0,32,32,32)
 glow.addColorStop(0,'rgba(235,247,255,.75)');glow.addColorStop(.2,'rgba(180,207,255,.27)');glow.addColorStop(1,'rgba(140,174,255,0)')
 ctx.fillStyle=glow;ctx.fillRect(0,0,64,64)
 const halo=new T.SpriteMaterial({map:new T.CanvasTexture(canvas),blending:T.AdditiveBlending,depthWrite:false})
 for(const bounds of fixtures.values()){
  const lamp=new T.SpotLight(0xe4eeff,2900,83,.65,.68,2)
  bounds.getCenter(lamp.position)
  lamp.target.position.set(Math.sign(lamp.position.x)*7,0,Math.sign(lamp.position.z)*2)
  // The light starts just in front of its physical housing.
  lamp.position.addScaledVector(vertex.subVectors(lamp.target.position,lamp.position).normalize(),.55)
  lamp.castShadow=true;lamp.shadow.mapSize.set(512,512);lamp.shadow.normalBias=.035;lamp.shadow.bias=-.0003
  const flare=new T.Sprite(halo);flare.position.copy(lamp.position);flare.scale.set(4.3,2.2,1)
  rig.add(lamp,lamp.target,flare)
 }
 for(const x of venue==='westend'?[-32,16,43]:venue==='southside'?[]:venue==='eastside'?[-23,-7,10,26]:[-12,-4,4]){
  const spill=new T.PointLight(0xffae62,12,7,2)
  spill.position.set(x,venue==='westend'?4.8:2.35,venue==='westend'?-26:venue==='eastside'?-33.7:-18.6);rig.add(spill)
 }
 rig.visible=false
 scene.add(rig)
 const sunsetFill=fill.color.clone(),sunsetGround=fill.groundColor.clone(),sunsetIntensity=fill.intensity
 const sunsetSun=sun.color.clone(),sunsetSunIntensity=sun.intensity
 const sunsetPosition=sun.position.clone()
 function setNight(night:boolean){
  rig.visible=night
  if(night){
   fill.color.setHex(0xa7c7ff);fill.groundColor.setHex(0x646b82);fill.intensity=.46
   sun.color.setHex(0xb4c9ff);sun.position.set(-28,30,-19);sun.intensity=.17
  }else{
   fill.color.copy(sunsetFill);fill.groundColor.copy(sunsetGround);fill.intensity=sunsetIntensity
   sun.color.copy(sunsetSun);sun.position.copy(sunsetPosition);sun.intensity=sunsetSunIntensity
  }
  for(const material of windows)material.emissive.setHex(night?0xffba71:0)
  setSkyTime(night?'Night':'Evening')
  renderer.shadowMap.needsUpdate=true
 }
 return setNight
}
