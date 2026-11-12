import * as T from 'three'

// Keep the head, shirt and thighs intact. Fold each shin out from its knee.
const poses=new WeakMap<T.Texture,T.Texture>()
export function kneelingPose(idle:T.Texture){
 const cached=poses.get(idle)
 if(cached)return cached
 const source=idle.image as HTMLImageElement
 const canvas=document.createElement('canvas')
 canvas.width=384;canvas.height=48
 const ctx=canvas.getContext('2d')!
 ctx.imageSmoothingEnabled=false
 for(let face=0;face<8;face++){
  const x=face*48
  ctx.drawImage(source,x,0,48,38,x,7,48,38)
  for(const side of [-1,1]){
   const start=side<0?12:24
   ctx.save()
   ctx.translate(x+(side<0?20:28),44)
   ctx.rotate(-side*Math.PI/2)
   ctx.drawImage(source,x+start,38,12,10,start-(side<0?20:28),0,12,10)
   ctx.restore()
  }
 }
 const map=new T.CanvasTexture(canvas)
 map.minFilter=map.magFilter=T.NearestFilter;map.generateMipmaps=false;map.colorSpace=T.SRGBColorSpace
 map.userData.directionalIdle=true;poses.set(idle,map)
 return map
}
