import * as T from 'three'
import {courtPresets,type CourtPreset} from './matchRules.ts'
// The painted playing surface is separate from the surrounding concrete slab.
// Clone just its material; surface scuffs, markings and roughness remain intact.
export function customizeCourt(scene:T.Scene,preset:CourtPreset){
 const color=new T.Color(courtPresets.find(c=>c.id===preset)!.color)
 scene.traverse(node=>{
  if(!(node instanceof T.Mesh))return
  const replace=(m:T.Material)=>{
   if(!['STREET Surface Paint','rubber_tiles','Scuffed blue'].includes(m.name)||!(m instanceof T.MeshStandardMaterial))return m
   if(preset==='blue'&&m.name!=='STREET Surface Paint')return m
   const material=m.clone();material.color.copy(color);if(m.name==='Scuffed blue')material.color.multiplyScalar(1.15);return material
  }
  node.material=Array.isArray(node.material)?node.material.map(replace):replace(node.material)
 })
}
export function streetGoalSurrounds(scene:T.Scene,halfWidth:number,height:number){
 const material=new T.MeshStandardMaterial({color:0x434c54,roughness:.9});
 for(const x of [-21,21])for(const sign of [-1,1]){
  const panel=new T.Mesh(new T.BoxGeometry(.28,.95,2-halfWidth),material);panel.position.set(x,.475,sign*(halfWidth+(2-halfWidth)/2));scene.add(panel)
 }
 // Extend the existing goal opening with visible fencing above the small frame.
 const coordinates:number[]=[];
 for(const x of [-21,21]){
  for(let y=height+.12;y<=5;y+=.25)coordinates.push(x,y,-2,x,y,2)
  for(let z=-2;z<=2;z+=.25)coordinates.push(x,height+.12,z,x,5,z)
 }
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(coordinates,3));scene.add(new T.LineSegments(geometry,new T.LineBasicMaterial({color:0x7a8588,transparent:true,opacity:.45})))
}
