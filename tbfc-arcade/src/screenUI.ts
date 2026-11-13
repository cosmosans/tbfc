export function padBadge(button:string){
 const glyph:Record<string,string>={Menu:'☰',View:'⧉'}
 return `<kbd class="pad-hint" data-pad="${button}" aria-label="${button==='Menu'?'Start':button}">${glyph[button]??button}</kbd>`
}
export function hint(key:string,pad:string){
 const [button,direction]=pad.split(" ")
 return `<kbd class="key-hint">${key}</kbd>${padBadge(button)}${direction ? `<span class="pad-direction">${direction}</span>` : ""}`
}

// A repeating ordered-dither tile reveals opaque square pixels in eight passes.
const order=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5]
let masks:Keyframe[]|undefined
export function reveal(root:HTMLElement,selector=':scope > *'){
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return
 if(!masks){
  masks=Array.from({length:9},(_,i)=>{
   const cv=document.createElement('canvas');cv.width=cv.height=32
   const ctx=cv.getContext('2d')!
   order.forEach((n,k)=>{if(n<i*2)ctx.fillRect(k%4*8,Math.floor(k/4)*8,8,8)})
   return {maskImage:'url('+cv.toDataURL()+')',maskSize:'32px 32px',maskRepeat:'repeat',easing:'steps(1,end)'}
  })
 }
 root.animate(masks,{duration:260})
 root.querySelectorAll<HTMLElement>(selector).forEach((el,i)=>el.animate(masks!,{duration:300,delay:i*72,fill:'backwards'}))
}
