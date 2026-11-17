import * as T from 'three'

// Layer translucent, shaded lobes into one reusable camera-facing puff.
let smokeMap:T.CanvasTexture|undefined
function puffTexture(){
 if(smokeMap)return smokeMap
 const canvas=document.createElement('canvas')
 canvas.width=canvas.height=128
 const ctx=canvas.getContext('2d')!
 for(let i=0;i<33;i++){
  const angle=i*2.39996
  const spread=32*Math.sqrt((i%11)/10)
  const x=64+Math.cos(angle)*spread,y=64+Math.sin(angle)*spread
  const radius=24+6*Math.cos(i*1.9)
  const shade=Math.round(218-22*Math.sin(angle)*spread/32)
  const gradient=ctx.createRadialGradient(x-3,y-4,0,x,y,radius)
  gradient.addColorStop(0,'rgba(255,255,255,.66)')
  gradient.addColorStop(.55,'rgba('+shade+','+shade+','+shade+',.48)')
  gradient.addColorStop(1,'rgba(175,175,175,0)')
  ctx.fillStyle=gradient
  ctx.fillRect(x-radius,y-radius,2*radius,2*radius)
 }
 smokeMap=new T.CanvasTexture(canvas)
 smokeMap.colorSpace=T.SRGBColorSpace
 return smokeMap
}

export function goalSmoke(parent:T.Group,x:number,z:number){
 const puffs=Array.from({length:12},(_,i)=>{
  const material=new T.SpriteMaterial({map:puffTexture(),transparent:true,depthWrite:false})
  const sprite=new T.Sprite(material)
  parent.add(sprite)
  return sprite
 })
 return (seconds:number,color:T.Color)=>{
  puffs.forEach((sprite,i)=>{
   const t=seconds-i*.14
   sprite.visible=t>0&&t<9
   if(!sprite.visible)return
   const phase=i*2.4+Math.sign(z)
   const lift=1-Math.exp(-t*2)
   const drift=t*.28
   sprite.position.set(
    x+Math.sign(x)*(drift*.65+Math.cos(phase)*lift*.58),
    .5+lift*(.65+.8*Math.sin(phase)**2)+t*.24,
    z+Math.sign(z)*(drift+lift*(.65+Math.sin(phase)*.74))
   )
   sprite.scale.setScalar(.22+lift*(1.3+.35*Math.cos(phase))+t*.36)
   sprite.material.rotation=phase+Math.sin(phase)*t*.09
   sprite.material.color.copy(color)
   sprite.material.opacity=.84*(1-T.MathUtils.smoothstep(t,3.4,9))
  })
 }
}
