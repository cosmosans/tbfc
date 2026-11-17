import * as T from 'three'

// The garage roof is at y=0. The top of the street mesh in the Blender model is -16.10.
const streetY=-16.08
function blockLoop(offset:number){
 const x=42+offset,z=30+offset,r=8+offset
 const shape=new T.Shape()
 shape.moveTo(0,z);shape.lineTo(x-r,z);shape.absarc(x-r,z-r,r,Math.PI/2,0,true)
 shape.lineTo(x,-z+r);shape.absarc(x-r,-z+r,r,0,-Math.PI/2,true)
 shape.lineTo(-x+r,-z);shape.absarc(-x+r,-z+r,r,-Math.PI/2,-Math.PI,true)
 shape.lineTo(-x,z-r);shape.absarc(-x+r,z-r,r,Math.PI,Math.PI/2,true);shape.lineTo(0,z)
 return shape
}

export function topDeckTraffic(scene:T.Scene,initialTime:'Day'|'Evening'|'Night'){
 const street=new T.Group()
 street.name='Top Deck street traffic';street.position.y=streetY;scene.add(street)
 const asphalt=new T.MeshStandardMaterial({color:0x454650,roughness:.96})
 const surface=blockLoop(3.25)
 surface.holes.push(blockLoop(-3.25))
 const pavement=new T.Mesh(new T.ShapeGeometry(surface,10),asphalt)
 pavement.rotation.x=-Math.PI/2;street.add(pavement)
 // Use the same centerline to lay out road markings and drive the two lanes.
 const center=blockLoop(0)
 const stripes=new T.InstancedMesh(new T.BoxGeometry(2.3,.018,.11),new T.MeshStandardMaterial({color:0xc9ac76}),39)
 const transform=new T.Object3D()
 for(let i=0;i<stripes.count;i++){
  const t=(i+.5)/stripes.count,p=center.getPointAt(t),v=center.getTangentAt(t)
  transform.position.set(p.x,.025,p.y);transform.rotation.y=-Math.atan2(v.y,v.x)
  transform.updateMatrix();stripes.setMatrixAt(i,transform.matrix)
 }
 street.add(stripes)

 const cube=new T.BoxGeometry()
 function box(parent:T.Object3D,material:T.Material,x:number,y:number,z:number,w:number,h:number,d:number){
  const mesh=new T.Mesh(cube,material)
  mesh.position.set(x,y,z);mesh.scale.set(w,h,d);parent.add(mesh)
 }
 const glass=new T.MeshStandardMaterial({color:0x506480,roughness:.42})
 const tires=new T.MeshStandardMaterial({color:0x202129})
 const wheel=new T.CylinderGeometry(.32,.32,.18,10)
 const fronts=new T.MeshStandardMaterial({color:0xffefc8,emissive:0xffecca})
 const tails=new T.MeshStandardMaterial({color:0xc93330,emissive:0xff3125})
 const canvas=document.createElement('canvas');canvas.width=64;canvas.height=128
 const ctx=canvas.getContext('2d')!
 for(let y=0;y<128;y++){
  const t=y/127,r=4+t*27,shade=ctx.createLinearGradient(32-r,0,32+r,0)
  shade.addColorStop(0,'transparent');shade.addColorStop(.5,'rgba(255,236,188,'+(.66*(1-t)**1.5)+')');shade.addColorStop(1,'transparent')
  ctx.fillStyle=shade;ctx.fillRect(0,y,64,1)
 }
 const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace
 const beam=new T.MeshBasicMaterial({map,transparent:true,depthWrite:false,blending:T.AdditiveBlending})
 const beamShape=new T.PlaneGeometry(3.3,7.8)
 const paints=[0x98716c,0x729398,0xaba8a3,0x465b82,0xb89659]
 const drive=new T.Mesh(new T.BoxGeometry(12,.035,14),asphalt)
 drive.position.set(0,.003,24);street.add(drive)
 const lanes=[-1,1].map((direction,index)=>{
  const lane=blockLoop(direction*1.45)
  // Vehicles enter and leave behind the garage facade; respawns stay out of view.
  const entry=lane.getPointAt(0),path=new T.CurvePath<T.Vector2>()
  const point=(x:number,z:number)=>new T.Vector2(x,z)
  const inGarage=point(-direction*4,17),outGarage=point(direction*4,17)
  path.add(new T.QuadraticBezierCurve(inGarage,point(-direction*4,entry.y),entry))
  if(direction===1)for(const curve of lane.curves)path.add(curve)
  else for(const curve of [...lane.curves].reverse()){
   const points=curve.getPoints(curve instanceof T.LineCurve?1:12).reverse()
   for(let i=1;i<points.length;i++)path.add(new T.LineCurve(points[i-1],points[i]))
  }
  path.add(new T.QuadraticBezierCurve(entry,point(direction*4,entry.y),outGarage))
  const car=new T.Group();street.add(car);car.visible=false
  const paint=new T.MeshStandardMaterial({roughness:.55})
  box(car,paint,0,.59,0,1.68,.62,3.95)
  box(car,glass,0,1.03,-.13,1.43,.52,2.05)
  box(car,paint,0,1.33,-.19,1.32,.1,1.68)
  for(const side of [-1,1]){
   for(const axle of [-1.22,1.22]){
    const w=new T.Mesh(wheel,tires);w.rotation.z=Math.PI/2;w.position.set(side*.79,.34,axle);car.add(w)
   }
   box(car,fronts,side*.58,.65,1.98,.38,.16,.07)
   box(car,tails,side*.61,.71,-1.98,.36,.18,.07)
   const pool=new T.Mesh(beamShape,beam);pool.rotation.x=-Math.PI/2
   pool.position.set(side*.58,.05,5.88);car.add(pool)
  }
  return {car,paint,path,length:path.getLength(),distance:0,speed:0,wait:index*2+Math.random()*5}
 })
 function setTime(time:'Day'|'Evening'|'Night'){
  beam.opacity=time==='Day'?0:time==='Night'?1:.65
  fronts.emissiveIntensity=time==='Day'?.08:2
  tails.emissiveIntensity=time==='Day'?.12:1.8
 }
 setTime(initialTime)
 function update(dt:number){
  for(const lane of lanes){
   if(!lane.car.visible){
    lane.wait-=dt;if(lane.wait>0)continue
    lane.car.visible=true;lane.distance=0;lane.speed=6.5+Math.random()*4
    lane.paint.color.setHex(paints[Math.floor(Math.random()*paints.length)])
   }
   lane.distance+=dt*lane.speed
   if(lane.distance>=lane.length){lane.car.visible=false;lane.wait=2+Math.random()**1.5*18;continue}
   const t=lane.distance/lane.length,p=lane.path.getPoint(t),v=lane.path.getTangent(t)
   lane.car.position.set(p.x,.035,p.y);lane.car.rotation.y=Math.atan2(v.x,v.y)
  }
 }
 return {update,setTime}
}
