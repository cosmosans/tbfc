import { freeDrill } from './warmup'
import { menuPad, menuDirection } from './menuPad'
import { template, element, bind } from './tutorial/templates'
import './practiceMenu.css'

export function freePracticeRoster(portraits: Record<string,string>){
 const root=document.createElement('section')
 root.className='practice-menu'
 document.body.append(root)
 const selected=new Set<string>()
 return new Promise<{drill:number,names:string[]}|null>(resolve=>{
  const pad=menuPad()
  let frame=0,previous='',repeatAt=0
  let pressed=!!pad?.buttons[0]?.pressed,backHeld=!!pad?.buttons[1]?.pressed
  let startHeld=!!pad?.buttons[9]?.pressed
  function finish(value:{drill:number,names:string[]}|null){
   cancelAnimationFrame(frame);document.removeEventListener('keydown',key);root.remove();resolve(value)
  }
  function draw(){
   const view = template('free-practice-roster')
   const grid = element(view, '.practice-grid')
   for (const [name, url] of Object.entries(portraits)) {
    const choice = template('free-practice-player')
    const button = element<HTMLButtonElement>(choice, 'button')
    element(choice, 'i').style.backgroundImage = `url('${url}')`
    element(choice, '[data-player-name]').textContent = name
    button.dataset.name = name
    button.onclick = () => { if(selected.has(name)) selected.delete(name); else if(selected.size<7) selected.add(name); sync() }
    grid.append(choice)
   }
   bind(view, '[data-play]', () => finish({drill:freeDrill,names:[...selected]}))
   root.replaceChildren(view)
   sync()
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
  function back(){finish(null)}
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
   if(e.key==='Enter'){
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
   if(start&&!startHeld&&selected.size)root.querySelector<HTMLButtonElement>('[data-play]')?.click()
   else if(a&&!pressed)root.querySelector<HTMLButtonElement>('button:enabled:focus')?.click()
   startHeld=start
   if(b&&!backHeld)back()
   previous=dir;pressed=a;backHeld=b
  }
  document.addEventListener('keydown',key);draw();poll()
 })
}
