import {Mesh, Object3D, Triangle, Vector3} from 'three'
import {advanceOutBall} from './perimeter'

// Index the exported surfaces once. Thin fabric, poles and seats can be hit from either side.
export function stadiumBallPhysics(ground:Object3D){
 const cells=new Map<string,Triangle[]>()
 const cell=(n:number)=>Math.floor(n/3)
 ground.updateMatrixWorld(true)
 for(const section of ground.children){
  // Ground motion and the gated fence already have dedicated collision handling.
  if(/^(01|02|03|11)/.test(section.name))continue
  section.traverse(mesh=>{
   if(!(mesh instanceof Mesh))return
   const geometry=mesh.geometry, points=geometry.attributes.position, index=geometry.index
   const vertex=(i:number)=>new Vector3().fromBufferAttribute(points,index?index.getX(i):i).applyMatrix4(mesh.matrixWorld)
   for(let i=0;i<(index?.count??points.count);i+=3){
    const a=vertex(i),b=vertex(i+1),c=vertex(i+2)
    if(Math.max(a.y,b.y,c.y)<.10)continue
    const triangle=new Triangle(a,b,c)
    for(let x=cell(Math.min(a.x,b.x,c.x)-.18);x<=cell(Math.max(a.x,b.x,c.x)+.18);x++){
     for(let z=cell(Math.min(a.z,b.z,c.z)-.18);z<=cell(Math.max(a.z,b.z,c.z)+.18);z++){
      const key=x+','+z
      if(!cells.has(key))cells.set(key,[])
      cells.get(key)!.push(triangle)
     }
    }
   }
  })
 }
 const closest=new Vector3(),normal=new Vector3(),previous=new Vector3()
 return (p:Vector3,v:Vector3,dt:number)=>{
  let impact=false
  const steps=Math.max(1,Math.ceil((v.length()+17*dt)*dt/.09))
  for(let step=0;step<steps;step++){
   previous.copy(p)
   if(advanceOutBall(p,v,dt/steps,true))impact=true
   for(const tri of cells.get(cell(p.x)+','+cell(p.z))??[]){
    tri.closestPointToPoint(p,closest)
    normal.subVectors(p,closest)
    const distance=normal.length()
    if(distance>=.18)continue
    if(distance>.00001)normal.divideScalar(distance)
    else tri.getNormal(normal)
    if(normal.dot(previous)-normal.dot(closest)<0)normal.negate()
    p.copy(closest).addScaledVector(normal,.1801)
    const inward=v.dot(normal)
    if(inward<0){
     v.addScaledVector(normal,-1.68*inward).multiplyScalar(.96)
     if(inward < -1.3)impact=true
    }
   }
  }
  return impact
 }
}
