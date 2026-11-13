import * as T from 'three'

// Billboard clouds share one pixel-art texture; only their size, drift and opacity animate.
export function costumeSmoke(scene:T.Scene){
 const canvas=document.createElement('canvas')
 canvas.width=canvas.height=32
 const ctx=canvas.getContext('2d')!
 for(const [x,y,r,color] of [[15,18,13,'#90959e'],[9,18,8,'#c5c8cb'],[22,17,9,'#d6d8d8'],[14,13,10,'#eef0ed'],[12,10,5,'#fffdf2']] as const){
  ctx.fillStyle=color
  for(let j=-r;j<=r;j++){
   const width=Math.floor(Math.sqrt(r*r-j*j))
   ctx.fillRect(x-width,y+j,2*width+1,1)
  }
 }
 const texture=new T.CanvasTexture(canvas)
 texture.colorSpace=T.SRGBColorSpace;texture.minFilter=texture.magFilter=T.NearestFilter
 const group=new T.Group()
 scene.add(group);group.visible=false
 const puffs=Array.from({length:10},(_,i)=>{
  const puff=new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true,depthWrite:false}))
  puff.renderOrder=11000+i;group.add(puff)
  return puff
 })
 return {
  hide(){group.visible=false},
  draw(age:number,feet:T.Vector3){
   group.visible=age>=0&&age<1.05
   if(!group.visible)return
   group.position.copy(feet)
   for(const [i,puff] of puffs.entries()){
    const t=Math.max(0,age-(i%3)*.025),spread=.17+1.1*t
    const angle=i*2.4
    puff.position.set(Math.cos(angle)*spread,.28+(i%4)*.33+t*(.8+i%3*.3),Math.sin(angle)*spread)
    puff.scale.setScalar((1.15+.24*(i%3)+.7*t)*T.MathUtils.smoothstep(t,0,.14))
    puff.material.opacity=1-T.MathUtils.smoothstep(t,.32,.97)
   }
  }
 }
}
