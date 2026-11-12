import {homeBoard} from './homeBoard'
import type {Club} from './opponentSquads'
import {matchSky} from './matchSky'
import type {MatchSettings} from './matchSettings'
import { boardX, boardZ, boardHeight, boardThickness } from './perimeter'
import * as T from 'three'
import turfUrl from './art/ground/grass.jpg?url'
import sponsorUrl from './art/ground/sons-of-pitches-board.png?url'

export async function buildGrounds(scene:T.Scene, renderer:T.WebGLRenderer,settings:MatchSettings,home:Club) {
  const loader=new T.TextureLoader()
  const [grass,sponsorMap,homeMap]=await Promise.all([loader.loadAsync(turfUrl),loader.loadAsync(sponsorUrl),homeBoard(loader,home)])
  grass.colorSpace=T.SRGBColorSpace
  grass.wrapS=grass.wrapT=T.MirroredRepeatWrapping
  grass.repeat.set(7,6)
  grass.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy())
  const surface=(w:number,h:number,x:number,y:number,z:number,mat:T.Material)=>{
    const mesh=new T.Mesh(new T.PlaneGeometry(w,h),mat)
    mesh.rotation.x=-Math.PI/2
    mesh.position.set(x,y,z)
    mesh.receiveShadow=true
    scene.add(mesh)
    return mesh
  }
  const night=settings.time==='Night',evening=settings.time==='Evening'
  const overcast=settings.weather!=='Sun'
  scene.add(new T.HemisphereLight(night?0xadcaff:evening?0xffd9b9:0xfff9e8,0x899478,night?.75:1.65))
  const sun=new T.DirectionalLight(night?0xccddff:evening?0xffac70:0xffe5b1,(night?.7:1.9)*(overcast?.48:1))
  sun.position.set(27,evening?5:night?11:24,-16)
  const updateWeather=matchSky(scene,settings,sun)
  if(night||evening){
   for(const x of [-22,22]){
    const lamp=new T.PointLight(0xe8f3ff,night?230:100,90,1.4)
    lamp.position.set(x,8.6,-19.4);scene.add(lamp)
    const glow=new T.Mesh(new T.PlaneGeometry(1.5,.26),new T.MeshBasicMaterial({color:0xfffce0,side:T.DoubleSide}))
    glow.position.set(x,8.58,-19.43);scene.add(glow)
   }
  }
  sun.castShadow=true
  Object.assign(sun.shadow.camera,{left:-38,right:38,top:32,bottom:-32,near:1,far:108})
  sun.shadow.camera.updateProjectionMatrix()
  sun.shadow.mapSize.set(2048,2048)
  sun.shadow.normalBias=.025
  scene.add(sun)
  renderer.shadowMap.enabled=true
  renderer.shadowMap.type=T.PCFShadowMap
  // Only the permanent structures cast these shadows.
  renderer.shadowMap.autoUpdate=false
  renderer.shadowMap.needsUpdate=true

  const lawn=grass.clone()
  lawn.repeat.set(28,21)
  surface(160,100,0,-.055,0,new T.MeshStandardMaterial({map:lawn,color:0x99aa8b,roughness:1}))
  surface(42,24,0,0,0,new T.MeshStandardMaterial({map:grass,color:settings.weather==='Snow'?0xe0ece0:0xc4e0b0,roughness:settings.weather==='Rain'?.90:1,bumpMap:settings.weather==='Rain'?grass:null,bumpScale:.018}))
  const beams:T.Matrix4[]=[], colors:T.Color[]=[]
  const place=(x:number,y:number,z:number,w:number,h:number,d:number,color:number,rx=0)=>{
    const obj=new T.Object3D()
    obj.position.set(x,y,z);obj.rotation.x=rx;obj.scale.set(w,h,d);obj.updateMatrix()
    beams.push(obj.matrix);colors.push(new T.Color(color))
  }
  // Service walk and galvanized grandstands. Gaps between sections are access aisles.
  place(0,0,-17,66,.08,5.9,0xa29c8b)
  for(const x of [-26,-17,-8,8,17,26]){
    for(let row=0;row<4;row++){
      const z=-15.7-row*.8,y=.52+row*.39
      place(x,y,z,7.7,.11,.42,0xb9c3bd)
      place(x,y-.20,z+.36,7.7,.075,.47,0x919a94)
      for(const dx of [-3.5,0,3.5])place(x+dx,y/2,z,.085,y,.09,0x586561)
    }
    for(const dx of [-3.65,0,3.65])place(x+dx,1.55,-18.4,.065,3.05,.065,0x66716a)
    for(const y of [2.28,2.97])place(x,y,-18.4,7.5,.065,.065,0xaab2a9)
  }
  const boards=[homeMap,sponsorMap].map(map=>{
    map.colorSpace=T.SRGBColorSpace
    map.anisotropy=grass.anisotropy
    return new T.MeshBasicMaterial({map})
  })
  for(const end of [false,true]){
    const halfLength=end?boardZ:boardX
    const count=Math.ceil(2*halfLength/6.8),width=2*halfLength/count
    const panel=new T.PlaneGeometry(width-.045,boardHeight-.07)
    for(const sign of [-1,1]){
      const wall=(end?boardX:boardZ)+boardThickness/2
      for(let i=0;i<count;i++){
        const along=-halfLength+(i+.5)*width
        const x=end?sign*wall:along,z=end?along:sign*wall
        place(x,boardHeight/2,z,end?boardThickness:width,boardHeight,end?width:boardThickness,0xb9b7a8)
        // Print each side so both the sideline and end cameras see a readable board.
        for(const normal of [-1,1]){
          const face=new T.Mesh(panel,boards[i%2])
          const offset=normal*(boardThickness/2+.004)
          face.position.set(x+(end?offset:0),boardHeight/2,z+(end?0:offset))
          face.rotation.y=end?normal*Math.PI/2:normal<0?Math.PI:0
          scene.add(face)
        }
      }
    }
  }
  for(const x of [-22,22]){
    place(x,4.2,-19.6,.14,8.4,.14,0x858c80)
    place(x,8.4,-19.6,1.7,.09,.13,0x6d766e)
    for(const dx of [-.55,0,.55]){
      place(x+dx,8.58,-19.62,.47,.32,.25,0x495450)
      place(x+dx,8.57,-19.48,.40,.24,.035,0xffefcd)
    }
  }
  const structures=new T.InstancedMesh(new T.BoxGeometry(),new T.MeshStandardMaterial({roughness:.76,metalness:.23}),beams.length)
  beams.forEach((m,i)=>{structures.setMatrixAt(i,m);structures.setColorAt(i,colors[i])})
  structures.castShadow=structures.receiveShadow=true
  scene.add(structures)
  return updateWeather
}
