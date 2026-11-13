import {padBadge} from './screenUI'
import type { Fixture } from './opponentSquads'
import keyboardIcon from './art/device-keyboard.png'
import gamepadIcon from './art/device-gamepad.png'
import css from './teamSelect.css?inline'

const colors=['#e67732','#1987c4','#229621','#d62828','#9344ae','#168779']
export function playerColor(number:number){return colors[(number-1)%colors.length]}

export type Seat = { device:number; side:-1|1; number:number; actor:number }
export function selectSides(fixture:Fixture):Promise<Seat[]|null>{
 const root=document.createElement('section')
 root.id='team-select'
 root.className='side-select'
 root.innerHTML=`<style>${css}</style><div class="ts-wrap"><h1>Side Select</h1><div class="ts-match"></div><div class="ts-foot"><button class="ts-back">${padBadge("B")} Back</button><span>← → Choose Side · Enter / Start to Continue</span><button class="ts-next">${padBadge("Menu")} Continue</button></div></div>`
 const grid=root.querySelector('.ts-match')!
 const sides=new Map<number,number>([[-1,0]])
 const held=new Map<number,string>()
 const badges=new Map<number,HTMLElement>()
 const numbers=new Map<number,number>()
 const columns=[-1,0,1].map(side=>{
  const card=document.createElement('article')
  if(side){
   const club=side===-1?fixture.home:fixture.away
   card.innerHTML='<img class="side-crest" src="'+club.crest+'" alt=""><h2>'+club.name+'</h2><p class="side-cpu">CPU</p>'
  }
  card.onclick=()=>{sides.set(-1,side);paint()}
  grid.append(card)
  return card
 })
 const layer=document.createElement('div')
 layer.className='side-badges'
 grid.append(layer)
 function paint(){
  for(const [device,badge] of badges)if(!sides.has(device)){
   badge.remove();badges.delete(device);numbers.delete(device)
  }
  const counts=[0,0,0]
  for(const [device,side] of sides){
   let badge=badges.get(device)
   if(!badge){
    let n=1
    while([...numbers.values()].includes(n))n++
    numbers.set(device,n)
    badge=document.createElement('span')
    badge.className='side-badge'
    const label='P'+n
    badge.setAttribute('aria-label',label+' '+(device===-1?'Keyboard':'Controller '+(device+1)))
    badge.innerHTML='<b>'+label+'</b><i><img alt="" src="'+(device===-1?keyboardIcon:gamepadIcon)+'"></i>'
    badge.style.setProperty('--player-color',playerColor(n))
    badges.set(device,badge);layer.append(badge)
   }
   const column=side+1
   const row=side?counts[column]:numbers.get(device)!-1
   counts[column]++
   badge.dataset.side=String(side)
   badge.style.left=['var(--home-center)','50%','calc(100% - var(--home-center))'][column]
   badge.style.top='calc('+row+' * var(--slot-height) + '+(side?'var(--team-offset)':'0px')+')'
  }
  layer.style.height='calc(var(--slot-height) * '+Math.max(4,...numbers.values(),counts[0],counts[2])+' + var(--team-offset))'
  for(const i of [0,2])columns[i].querySelector<HTMLElement>('.side-cpu')!.hidden=counts[i]>0
 }
 document.body.append(root)
 return new Promise(resolve=>{
  let frame=0,done=false
  function finish(back=false){
   if(done)return
   done=true;cancelAnimationFrame(frame);removeEventListener('keydown',key);root.remove()
   resolve(back?null:[...sides].flatMap(([device,side])=>side?[{device,side:side as -1|1,number:numbers.get(device)!,actor:-1}]:[]))
  }
  function move(id:number,dir:number){sides.set(id,Math.max(-1,Math.min(1,(sides.get(id)??0)+dir)));paint()}
  function key(e:KeyboardEvent){
   if(e.repeat)return
   if(e.code==='Escape')finish(true)
   else if(e.code==='Enter')finish()
   else if(['ArrowLeft','KeyA','ArrowRight','KeyD'].includes(e.code)){e.preventDefault();move(-1,['ArrowLeft','KeyA'].includes(e.code)?-1:1)}
  }
  function poll(){
   const pads=Array.from(navigator.getGamepads?.()??[]).filter((p):p is Gamepad=>!!p)
   for(const id of sides.keys())if(id>=0&&!pads.some(p=>p.index===id)){sides.delete(id);held.delete(id);paint()}
   for(const p of pads){
    const cmd=p.buttons[9]?.pressed?'start':p.buttons[1]?.pressed?'back':p.buttons[14]?.pressed||p.axes[0]<-.6?'left':p.buttons[15]?.pressed||p.axes[0]>.6?'right':''
    if(!sides.has(p.index)){sides.set(p.index,0);paint()}
    else if(cmd&&held.get(p.index)!==cmd){
     if(cmd==='start'||cmd==='back'){finish(cmd==='back');return}
     move(p.index,cmd==='left'?-1:1)
    }
    held.set(p.index,cmd)
   }
   frame=requestAnimationFrame(poll)
  }
  root.querySelector('.ts-back')!.addEventListener('click',()=>finish(true))
  root.querySelector('.ts-next')!.addEventListener('click',()=>finish())
  addEventListener('keydown',key);paint();poll()
 })
}
