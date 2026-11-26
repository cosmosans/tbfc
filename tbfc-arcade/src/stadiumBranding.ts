import * as T from 'three'
import {millBoards} from './millBoards'
import {clubAccent,type Club} from './opponentSquads'

// A venue provides placements; the home club supplies the fabric and crest.
export async function stadiumBranding(scene:T.Scene,club:Club,venue:string,model?:T.Object3D,millSide:'home'|'away'='home'){
 if(venue==='gulch'){
  // The Gulch's environment is deliberately free of lettering, including team prints.
  const anchor=model?.getObjectByName(millSide==='home'?'Gulch_Home_Banner':'Gulch_Away_Banner')
  const panel=new T.Mesh(new T.PlaneGeometry(2.5,.68),new T.MeshStandardMaterial({color:clubAccent(club),roughness:.9}))
  panel.name=club.name+' Gulch colour panel'
  if(anchor)anchor.getWorldPosition(panel.position)
  else panel.position.set(millSide==='home'?-10:10,.48,-9.83)
  scene.add(panel)
  return
 }
 const crest=await new T.TextureLoader().loadAsync(club.crest)
 await document.fonts.load('44px Upheaval')
 const canvas=document.createElement('canvas')
 canvas.width=512;canvas.height=256
 const ctx=canvas.getContext('2d')!
 ctx.fillStyle='#101012';ctx.fillRect(0,0,512,256)
 ctx.fillStyle=clubAccent(club);ctx.fillRect(0,0,512,18);ctx.fillRect(0,238,512,18)
 ctx.strokeStyle=clubAccent(club);ctx.lineWidth=6;ctx.strokeRect(9,27,494,202)
 const image=crest.image as CanvasImageSource & {width:number,height:number}
 const size=Math.min(176,176*image.width/image.height)
 ctx.drawImage(image,316+(176-size)/2,40,size,176)
 const words=club.name.toUpperCase().replace(/ FC$/,'')
 ctx.fillStyle='#fff3e2';ctx.font='44px Upheaval';ctx.textAlign='center';ctx.textBaseline='middle'
 const width=ctx.measureText(words).width
 ctx.save();ctx.translate(158,128);ctx.scale(Math.min(1,284/width),1);ctx.fillText(words,0,0);ctx.restore()
 const fabric=new T.CanvasTexture(canvas)
 fabric.colorSpace=T.SRGBColorSpace;fabric.magFilter=T.NearestFilter
 crest.dispose()
 const material=printedMaterial(fabric)
 if(venue==='mill'){
  const panel=new T.Mesh(new T.PlaneGeometry(2.45,.79),material)
  panel.name=club.name+' board'
  panel.position.set(millSide==='home'?-13.5:13.5,.53,millBoards.north-millBoards.radius+.015)
  scene.add(panel)
  return
 }

 // Eastside's three old team prints are separate materials on one model node.
 // Keep their geometry and replace only the printed surface.
 model?.traverse(node=>{
  if(!(node instanceof T.Mesh))return
  const replace=(mat:T.Material)=>{
   if(mat.name.startsWith('Supporters print'))return material
   if(mat.name==='Goal Dancers scarlet'){
    const branded=mat.clone()
    if(branded instanceof T.MeshStandardMaterial)branded.color.set(clubAccent(club))
    return branded
   }
   return mat
  }
  if(Array.isArray(node.material))node.material=node.material.map(replace)
  else node.material=replace(node.material)
 })

 const flagCanvas=document.createElement('canvas')
 flagCanvas.width=512
 flagCanvas.height=256
 const flagContext=flagCanvas.getContext('2d')!
 flagContext.fillStyle=clubAccent(club)
 flagContext.fillRect(0,0,512,256)
 const crestScale=202/Math.max(image.width,image.height)
 const w=image.width*crestScale,h=image.height*crestScale
 flagContext.drawImage(image,(512-w)/2,(256-h)/2,w,h)
 const flagMap=new T.CanvasTexture(flagCanvas)
 flagMap.colorSpace=T.SRGBColorSpace
 flagMap.magFilter=T.NearestFilter
 const cloth=printedMaterial(flagMap)
 cloth.vertexColors=true
 const updates:((dt:number)=>void)[]=[]
 for(const x of [-15,15]){
  const group=new T.Group()
  group.name='Home club flag'
  const pole=new T.Mesh(new T.CylinderGeometry(.045,.055,3.35,6),new T.MeshStandardMaterial({color:0x929d9a,metalness:.35,roughness:.48}))
  pole.position.set(-1.52,1.675,0)
  group.add(pole)
  const flag=makeFlag(cloth,x)
  flag.mesh.position.set(-1.49,3.24,0)
  group.add(flag.mesh)
  group.position.set(x,0,-13.6)
  scene.add(group)
  updates.push(flag.update)
 }
 return (dt:number)=>{for(const update of updates)update(dt)}
}

function printedMaterial(map:T.Texture){
 const material=new T.MeshBasicMaterial({map,side:T.DoubleSide})
 material.onBeforeCompile=shader=>{
  shader.fragmentShader=shader.fragmentShader.replace(
   '#include <map_fragment>',
   `#ifdef USE_MAP
      vec2 brandUv = vMapUv;
      if (!gl_FrontFacing) brandUv.x = 1.0 - brandUv.x;
      vec4 sampledDiffuseColor = texture2D(map, brandUv);
      diffuseColor *= sampledDiffuseColor;
    #endif`,
  )
 }

 return material
}

// Each row is a strip of fixed-length segments. Damped angular springs let
// the trailing cloth lag behind the gust while the hoist stays on the pole.
function makeFlag(material:T.Material,phase:number){
 const columns=16,rows=4,stride=columns+1
 const geometry=new T.PlaneGeometry(2.85,1.43,columns,rows)
 const position=geometry.attributes.position as T.BufferAttribute
 position.setUsage(T.DynamicDrawUsage)
 const color=new T.BufferAttribute(new Float32Array(position.count*3),3).setUsage(T.DynamicDrawUsage)
 geometry.setAttribute('color',color)
 const angle=new Float32Array(position.count),velocity=new Float32Array(position.count)
 let time=phase
 const update=(elapsed:number)=>{
  const dt=Math.min(elapsed,.1)
  if(dt<=0)return
  const steps=Math.ceil(dt*60),step=dt/steps
  for(let k=0;k<steps;k++){
   time+=step
   for(let row=0;row<=rows;row++){
    const v=row/rows
    let x=0,z=0
    for(let col=0;col<=columns;col++){
     const i=row*stride+col,u=col/columns
     if(col){
      const gust=Math.sin(5*time-7*u+.65*v)
      const flutter=Math.sin(8*time-13*u+1.4*v)
      const target=(.24+.52*u)*gust+.20*u*flutter
      velocity[i]+=(95*(target-angle[i])-10*velocity[i])*step
      angle[i]+=velocity[i]*step
      x+=2.85/columns*Math.cos(angle[i])
      z+=2.85/columns*Math.sin(angle[i])
     }
     if(k===steps-1){
      position.setXYZ(i,x,-1.43*v-.13*u*u+.065*u*Math.sin(4*time-6*u+v),z)
      const shade=.88+.11*Math.sin(angle[i])
      color.setXYZ(i,shade,shade,shade)
     }
    }
   }
  }
  position.needsUpdate=color.needsUpdate=true
 }
 for(let i=0;i<12;i++)update(.05)
 geometry.boundingSphere=new T.Sphere(new T.Vector3(1.4,-.72,0),2.4)
 return {mesh:new T.Mesh(geometry,material),update}
}
