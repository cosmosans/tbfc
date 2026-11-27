import {supportsMode} from './arenaCapabilities'
import type {GameMode} from './matchRules'
import {menuPad,menuDirection} from './menuPad'
import {audio} from './matchAudio'
import {padBadge} from './screenUI'
import {renderMarkup} from './templates/renderMarkup'
import stadiumLegendTemplate from './templates/street/stadium-legend.html?raw'
import maynard from './art/stadium-previews/maynard.jpg'
import eastside from './art/stadium-previews/eastside.jpg'
import mill from './art/stadium-previews/cottonmill.jpg'
import topdeck from './art/stadium-previews/topdeck.jpg'
import westend from './art/stadium-previews/westend.jpg'
import southside from './art/stadium-previews/southside.jpg'
import './stadiumSelect.css'

export const grounds=[
 {id:'school',name:'Grant Park',area:'High School',surface:'Turf',image:maynard},
 {id:'westend',name:'West End',area:'Transit Station',surface:'Turf',image:westend},
 {id:'southside',name:'Old 4th Ward',area:'Park',surface:'Natural Grass',image:southside},
 {id:'mill',name:'Cabbagetown',area:'Cotton Mill',surface:'Concrete',image:mill},
 {id:'eastside',name:'Candler Park',area:'Neighborhood',surface:'Natural Grass',image:eastside},
 {id:'topdeck',name:'Midtown',area:'Rooftop',surface:'Asphalt',image:topdeck},
] as const
export type StadiumId=typeof grounds[number]['id']|'gulch'
export function stadiumName(id:StadiumId){return id==='gulch'?'The Gulch':grounds.find(g=>g.id===id)!.name}
export function randomStadium():StadiumId{return grounds[Math.floor(Math.random()*grounds.length)].id}
export function homeStadium(club:string):StadiumId{
 if(club==='Goal Dancers FC')return 'westend'
 if(club==='Orange Slices')return 'southside'
 if(club==='Shooting Stars FC')return 'eastside'
 return 'school'
}

export function selectStadium(home?:StadiumId,initial:StadiumId=home??'school',mode:GameMode='classic'):Promise<StadiumId|null>{
 const eligible=grounds.filter(g=>supportsMode(g.id,mode))
 const dialog=document.createElement('dialog')
 dialog.className='stadium-picker'
 dialog.setAttribute('aria-labelledby','stadium-title')
 dialog.innerHTML=`<div class="stadium-inner"><h1 id="stadium-title">Select Stadium</h1>
 <div class="stadium-cards">${eligible.map(g=>`<button type="button" class="stadium-card">
 <img src="${g.image}" alt=""><span class="stadium-copy"><strong>${g.name}</strong><small>${g.area} · ${g.surface}</small></span></button>`).join('')}</div>
 ${renderMarkup(stadiumLegendTemplate, {backHint:padBadge("B"),moveHint:padBadge("LS"),continueHint:padBadge("A")})}</div>`
 document.body.append(dialog);dialog.showModal()
 const cards=Array.from(dialog.querySelectorAll<HTMLButtonElement>('.stadium-card'))
 let index=eligible.findIndex(g=>g.id===initial)
 function select(i:number){
  index=(i+eligible.length)%eligible.length
  cards.forEach((c,n)=>c.setAttribute('aria-pressed',String(n===index)))
  cards[index].focus()
 }
 select(Math.max(0,index))
 return new Promise(resolve=>{
  let frame=0
  function finish(back:boolean){
   cancelAnimationFrame(frame);dialog.close();dialog.remove();audio.menu(back?'nav':'success')
   resolve(back?null:eligible[index].id)
  }
  function cycle(step:number){audio.menu('nav');select(index+step)}
  cards.forEach((c,n)=>{c.onclick=()=>select(n)})
  dialog.querySelector<HTMLButtonElement>('[data-back]')!.onclick=()=>finish(true)
  dialog.querySelector<HTMLButtonElement>('[data-next]')!.onclick=()=>finish(false)
  dialog.oncancel=e=>{e.preventDefault();finish(true)}
  dialog.onkeydown=e=>{
   const arrows:Record<string,number>={ArrowLeft:-1,ArrowRight:1,ArrowUp:-3,ArrowDown:3}
   if(e.key in arrows){e.preventDefault();cycle(arrows[e.key])}
   if(e.key==='Enter'&&cards.includes(document.activeElement as HTMLButtonElement)){
    e.preventDefault();if(!e.repeat){index=cards.indexOf(document.activeElement as HTMLButtonElement);finish(false)}
   }
  }
  function input(){
   const pad=menuPad()
   return {dir:pad?menuDirection(pad):'',ok:!!(pad?.buttons[0]?.pressed||pad?.buttons[9]?.pressed),back:!!pad?.buttons[1]?.pressed}
  }
  let previous=input(),repeatAt=Infinity
  function poll(now:number){
   const current=input()
   if(current.back&&!previous.back){finish(true);return}
   if(current.ok&&!previous.ok){finish(false);return}
   if(current.dir&&(current.dir!==previous.dir||now>=repeatAt)){
    cycle(({l:-1,r:1,u:-3,d:3} as const)[current.dir]);repeatAt=now+(current.dir===previous.dir?230:460)
   }
   previous=current;frame=requestAnimationFrame(poll)
  }
  frame=requestAnimationFrame(poll)
 })
}
