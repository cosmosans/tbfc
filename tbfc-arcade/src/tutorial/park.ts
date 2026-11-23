import * as T from 'three'
import setup from './scene.json'
/** Cosmetic dressing only; the normal pitch, boundaries and ball simulation remain authoritative. */
export function dressPark(scene: T.Scene) {
 const group = new T.Group(); group.name = 'Candler Park kickaround'; scene.add(group)
 const box = (x:number,y:number,z:number,w:number,h:number,d:number,color:string) => {
  const mesh = new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshStandardMaterial({color,roughness:1}))
  mesh.position.set(x,y,z); group.add(mesh)
 }
 for (const {x,z} of setup.benches) {
  box(x,.65,z,3.2,.16,.6,'#916d42'); box(x,.98,z+.28,3.2,.46,.1,'#916d42')
  for (const dx of [-1.2,1.2]) box(x+dx,.3,z,.14,.6,.5,'#313e35')
 }
 for (const {x,z,color} of setup.bags) {
  box(x,.24,z,.4,.48,.28,color); box(x,.49,z,.2,.08,.1,'#151e1a')
  box(x+.55,.18,z,.13,.36,.13,'#9acfd4'); box(x+.55,.38,z,.1,.05,.1,'#ebd7af')
 }
 for (const {x,z} of setup.cones) {
  const cone = new T.Mesh(new T.ConeGeometry(.16,.4,4),new T.MeshStandardMaterial({color:'#db7132'}))
  cone.position.set(x,.2,z); group.add(cone)
 }
 const lamps = scene.children.filter((node: T.Object3D) => node instanceof T.HemisphereLight || node instanceof T.DirectionalLight) as T.Light[]
 const intensities = lamps.map(light=>light.intensity)
 let evening = 0
 return (dt:number, chapter:number) => {
  evening += (chapter/11 - evening) * Math.min(1,dt/12)
  lamps.forEach((light,i)=>{light.intensity=intensities[i]*(1-.2*evening)})
 }
}
