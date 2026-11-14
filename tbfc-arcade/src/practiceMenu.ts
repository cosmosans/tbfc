import { drills, freeDrill } from './warmup'
import { padBadge } from './screenUI'
import { menuPad, menuDirection } from './menuPad'
import blue from './art/blue-side-kicks.png?url'
import finisher from './art/ff-cole-kick.png?url'
import header from './art/gd-rio-idle.png?url'
import ball from './art/ball-spin.png?url'
import './practiceMenu.css'

export function practiceMenu(portraits: Record<string,string>){
 const root=document.createElement('section')
 root.className='practice-menu'
 document.body.append(root)
 const selected=new Set<string>()
 const order=[freeDrill,0,1,2,3,5]
 let roster=false
 const sprite=(url:string,x:number,y:number,frame=0)=>`<i style="left:${x}%;bottom:${y}px;background-image:url('${url}');background-position:-${frame*48}px 0"></i>`
 const illustrations=[
  sprite(blue,14,1,3)+sprite(portraits.Pam,50,17)+sprite(header,75,2),
  sprite(finisher,18,2,3)+'<b class="mini-goal"></b>',
  sprite(blue,4,0,3)+sprite(header,56,17)+'<b class="mini-goal"></b>',
  sprite(finisher,12,1,3)+'<b class="mini-bin"></b>',
  sprite(portraits.Meghan,12,4)+sprite(portraits.Sean,65,6),
  sprite(header,28,12)+sprite(portraits.Nelson,55,7)
 ]
 return new Promise<{drill:number,names:string[]}|null>(resolve=>{
  const pad=menuPad()
  let frame=0,previous='',repeatAt=0
  let pressed=!!pad?.buttons[0]?.pressed,backHeld=!!pad?.buttons[1]?.pressed
  let startHeld=!!pad?.buttons[9]?.pressed
  function finish(value:{drill:number,names:string[]}|null){
   cancelAnimationFrame(frame);document.removeEventListener('keydown',key);root.remove();resolve(value)
  }
  function draw(){
   root.innerHTML=`<div class="practice-shell"><h1>${roster?'Free practice':'Practice'}</h1>${roster?'<p>Choose up to seven Turf Burners</p>':''}<div class="practice-grid ${roster?'roster':''}"></div>${roster?'':`<div class="picker-hints menu-legend"><button data-back>${padBadge('B')} Back</button><span>${padBadge('A')} Select</span></div>`}</div>`
   if(roster){
    const hints=document.createElement('div')
    hints.className='picker-hints menu-legend'
    hints.innerHTML=`<span>${padBadge('A')} Select / Deselect</span><button data-back>${padBadge('B')} Back</button><button data-play><kbd class="key-hint">Enter</kbd>${padBadge('Menu')} Take the Field</button>`
    root.querySelector('.practice-shell')!.append(hints)
   }
   const grid=root.querySelector('.practice-grid')!
   if(roster){
    for(const [name,url] of Object.entries(portraits)){
     const button=document.createElement('button')
     button.innerHTML=sprite(url,0,0)+name
     button.onclick=()=>{if(selected.has(name))selected.delete(name);else if(selected.size<7)selected.add(name);sync()}
     grid.append(button);button.dataset.name=name
    }
    root.querySelector<HTMLButtonElement>('[data-play]')!.onclick=()=>finish({drill:freeDrill,names:[...selected]})
    sync()
   }else for(const i of order){
    const button=document.createElement('button')
    const ballHeight=[7,12,41,34,5,41][i]
    button.innerHTML=`<span class="skill-scene">${illustrations[i]}<em style="background-image:url('${ball}');bottom:${ballHeight}px"></em></span><strong>${drills[i].name}</strong>`
    button.onclick=()=>{if(i===freeDrill){roster=true;draw()}else finish({drill:i,names:[]})}
    grid.append(button)
   }
   root.querySelector<HTMLButtonElement>('[data-back]')!.onclick=back
   root.querySelector<HTMLButtonElement>('button')?.focus()
  }
  function sync(){
   root.querySelectorAll<HTMLButtonElement>('[data-name]').forEach(b=>{
    const on=selected.has(b.dataset.name!)
    b.setAttribute('aria-pressed',String(on));b.disabled=!on&&selected.size===7
   })
   const play=root.querySelector<HTMLButtonElement>('[data-play]')!
   play.disabled=!selected.size
  }
  function back(){if(roster){roster=false;draw()}else finish(null)}
  function navigate(direction:string){
   const buttons=[...root.querySelectorAll<HTMLButtonElement>('button:enabled')]
   const current=document.activeElement as HTMLButtonElement
   if(!buttons.includes(current)){buttons[0]?.focus();return}
   const rect=current.getBoundingClientRect()
   const dx=direction==='r'?1:direction==='l'?-1:0,dy=direction==='d'?1:direction==='u'?-1:0
   let best=Infinity,target=current
   for(const b of buttons){
    const r=b.getBoundingClientRect(),x=r.x+r.width/2-rect.x-rect.width/2,y=r.y+r.height/2-rect.y-rect.height/2
    const forward=x*dx+y*dy,cost=forward+3*Math.abs(x*dy-y*dx)
    if(forward>2&&cost<best){best=cost;target=b}
   }
   target.focus()
  }
  function key(e:KeyboardEvent){
   const direction=({ArrowLeft:'l',ArrowRight:'r',ArrowUp:'u',ArrowDown:'d'} as Record<string,string>)[e.key]
   if(direction){e.preventDefault();navigate(direction)}
   if(roster&&e.key==='Enter'){
    e.preventDefault()
    if(!e.repeat)root.querySelector<HTMLButtonElement>('[data-play]')?.click()
   }
   if(e.key==='Escape')back()
  }
  function poll(){
   frame=requestAnimationFrame(poll)
   const pad=menuPad(),dir=pad?menuDirection(pad):'',a=!!pad?.buttons[0]?.pressed,b=!!pad?.buttons[1]?.pressed
   const now=performance.now(),start=!!pad?.buttons[9]?.pressed
   if(dir&&(dir!==previous||now>=repeatAt)){
    navigate(dir)
    repeatAt=now+(dir===previous?160:380)
   }
   if(start&&!startHeld&&roster&&selected.size)root.querySelector<HTMLButtonElement>('[data-play]')?.click()
   else if((a&&!pressed)||(start&&!startHeld))root.querySelector<HTMLButtonElement>('button:enabled:focus')?.click()
   startHeld=start
   if(b&&!backHeld)back()
   previous=dir;pressed=a;backHeld=b
  }
  document.addEventListener('keydown',key);draw();poll()
 })
}
