import * as T from 'three'
import {millBoards} from './millBoards'
import {clubAccent,type Club} from './opponentSquads'

// A venue provides placements; the home club supplies the fabric and crest.
export async function stadiumBranding(scene:T.Scene,club:Club,venue:string,model?:T.Object3D,millSide:'home'|'away'='home'){
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
 const material=new T.MeshBasicMaterial({map:fabric,side:T.DoubleSide})

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

 const offsets:Record<string,number[]>={
  standard:[-15,15],school:[-15,15],eastside:[-15,15],southside:[-15,15],westend:[-15,15],topdeck:[-15,15]
 }
 for(const x of offsets[venue]??offsets.standard){
  const group=new T.Group();group.name='Home club flag template'
  const pole=new T.Mesh(new T.CylinderGeometry(.045,.055,3.35,6),new T.MeshStandardMaterial({color:0x929d9a,metalness:.6,roughness:.48}))
  pole.position.set(-1.52,1.68,0);group.add(pole)
  const flag=new T.Mesh(new T.PlaneGeometry(2.85,1.43),material)
  flag.position.set(0,2.53,.02);group.add(flag)
  group.position.set(x,0,-13.6)
  scene.add(group)
 }
}
