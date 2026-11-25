import * as T from 'three'

// Pick up the lamp-head locations from the exported Blender lens geometry.
export function schoolLighting(scene:T.Scene,school:T.Object3D,renderer:T.WebGLRenderer,
 fill:T.HemisphereLight,sun:T.DirectionalLight,setSkyTime:(time:'Evening'|'Night')=>void,venue:'school'|'eastside'|'southside'|'westend'|'topdeck'){
 const fixtures=new Map<string,T.Box3>()
 const lensMeshes:T.Mesh<T.BufferGeometry,T.MeshStandardMaterial>[]=[]
 const quadrantOf=(p:T.Vector3)=>Math.sign(p.x)+','+Math.sign(p.z)
 const windows=new Set<T.MeshStandardMaterial>()
 const vertex=new T.Vector3()
 school.updateMatrixWorld(true)
 school.traverse(object=>{
  if(!(object instanceof T.Mesh))return
  const material=object.material
  if(!(material instanceof T.MeshStandardMaterial))return
  if(material.name==='Evening glass')windows.add(material)
  if(material.name!=='Warm safety lens')return
  if(venue==='school')lensMeshes.push(object as T.Mesh<T.BufferGeometry,T.MeshStandardMaterial>)
  const points=object.geometry.attributes.position
  for(let i=0;i<points.count;i++){
   vertex.fromBufferAttribute(points,i).applyMatrix4(object.matrixWorld)
   if(vertex.y<8)continue
   const quadrant=quadrantOf(vertex)
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
 const banks:{lamp:T.SpotLight,flare:T.Sprite}[]=[]
 for(const bounds of fixtures.values()){
  const lamp=new T.SpotLight(0xe4eeff,2900,83,.65,.68,2)
  bounds.getCenter(lamp.position)
  lamp.target.position.set(Math.sign(lamp.position.x)*7,0,Math.sign(lamp.position.z)*2)
  // The light starts just in front of its physical housing.
  lamp.position.addScaledVector(vertex.subVectors(lamp.target.position,lamp.position).normalize(),.55)
  lamp.castShadow=true;lamp.shadow.mapSize.set(512,512);lamp.shadow.normalBias=.035;lamp.shadow.bias=-.0003
  const flare=new T.Sprite(halo);flare.position.copy(lamp.position);flare.scale.set(4.3,2.2,1)
  banks.push({lamp,flare})
  rig.add(lamp,lamp.target,flare)
 }
 for(const x of venue==='topdeck'?[-19,3]:venue==='westend'?[-32,16,43]:venue==='southside'?[]:venue==='eastside'?[-23,-7,10,26]:[-12,-4,4]){
  const spill=new T.PointLight(0xffae62,12,7,2)
  spill.position.set(x,venue==='westend'?4.8:2.35,venue==='westend'?-26:venue==='topdeck'?-15.9:venue==='eastside'?-33.7:-18.6);rig.add(spill)
 }
 rig.visible=false
 scene.add(rig)
 const sunsetFill=fill.color.clone(),sunsetGround=fill.groundColor.clone(),sunsetIntensity=fill.intensity
 const sunsetSun=sun.color.clone(),sunsetSunIntensity=sun.intensity
 const sunsetPosition=sun.position.clone()
 function setNight(night:boolean){
  rig.visible=night||venue==='topdeck'
  if(night){
   fill.color.setHex(0xa7c7ff);fill.groundColor.setHex(0x646b82);fill.intensity=.46
   sun.color.setHex(0xb4c9ff);sun.position.set(-28,30,-19);sun.intensity=.17
  }else{
   fill.color.copy(sunsetFill);fill.groundColor.copy(sunsetGround);fill.intensity=sunsetIntensity
   sun.color.copy(sunsetSun);sun.position.copy(sunsetPosition);sun.intensity=sunsetSunIntensity
  }
  if(venue==='topdeck'&&!night){
   fill.color.setHex(0xbdbcf5);fill.intensity=.75
   sun.color.setHex(0xffbdaf);sun.intensity=.55
  }
  for(const material of windows)material.emissive.setHex(night?0xffba71:0)
  setSkyTime(night?'Night':'Evening')
  renderer.shadowMap.needsUpdate=true
 }
 banks.sort((a,b)=>a.lamp.position.z-b.lamp.position.z||a.lamp.position.x-b.lamp.position.x)
 // Feature the far-side bank and its diagonal opposite before lighting the rest.
 if(venue==='school'&&banks.length===4){
  const opposite=banks.findIndex(({lamp})=>lamp.position.x*banks[0].lamp.position.x<0&&lamp.position.z*banks[0].lamp.position.z<0)
  if(opposite>0)banks.splice(1,0,banks.splice(opposite,1)[0])
 }
 const darkLens=new T.MeshBasicMaterial({color:0x13171b})
 const liveLens=new T.MeshBasicMaterial({color:0xfff8db,toneMapped:false})
 let lit=-1
 // Several banks share a single exported mesh. Give each bank its own
 // material slot while retaining the original material on other fixtures.
 function splitLensFaces(mesh:T.Mesh<T.BufferGeometry,T.MeshStandardMaterial>){
  const geometry=mesh.geometry.clone(), points=geometry.attributes.position
  const indices=geometry.index, count=indices?.count??points.count
  const slots=new Map(banks.map(({lamp},i)=>[quadrantOf(lamp.position),i+1]))
  let start=0,slot=-1
  geometry.clearGroups()
  for(let i=0;i<count;i+=3){
   vertex.fromBufferAttribute(points,indices?indices.getX(i):i).applyMatrix4(mesh.matrixWorld)
   const next=vertex.y<8?0:slots.get(quadrantOf(vertex))??0
   if(next!==slot){
    if(i>start)geometry.addGroup(start,i-start,slot)
    start=i;slot=next
   }
  }
  geometry.addGroup(start,count-start,slot)
  mesh.geometry=geometry
  const materials:T.Material[]=[mesh.material,...banks.map(()=>darkLens)]
  ;(mesh as T.Mesh).material=materials
  return materials
 }
 let lensSlots:T.Material[][]=[]

 function lightBanks(count:number){
  if(count===lit)return
  if(lit<0)lensSlots=lensMeshes.map(splitLensFaces)
  lit=count
  for(const materials of lensSlots)banks.forEach((_,i)=>{materials[i+1]=i<count?liveLens:darkLens})
  rig.visible=true
  banks.forEach(({lamp,flare},i)=>{lamp.visible=flare.visible=i<count})
  renderer.shadowMap.needsUpdate=true
 }
 return {setNight,positions:banks.map(bank=>bank.lamp.position.clone()),lightBanks}
}
