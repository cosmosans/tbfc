import {menuPad,menuDirection} from './menuPad'
import {audio} from './matchAudio'
import {hint} from './screenUI'
import maynard from './art/stadium-previews/maynard.jpg'
import eastside from './art/stadium-previews/eastside.jpg'
import westend from './art/stadium-previews/westend.jpg'
import southside from './art/stadium-previews/southside.jpg'
import './stadiumSelect.css'

const grounds=[
 {id:'school',name:'Maynard Jackson High School',details:'Running track · Floodlights',image:maynard},
 {id:'eastside',name:'Eastside Commons',details:'Neighborhood park · Natural grass',image:eastside},
 {id:'southside',name:'Southside Diamond',details:'Baseball outfield · Georgia clay',image:southside},
 {id:'westend',name:'Station Soccer West End',details:'Transit station · Night turf',image:westend},
] as const
export type StadiumId=typeof grounds[number]['id']
export function homeStadium(club:string):StadiumId{
 if(club==='Goal Dancers FC')return 'westend'
 if(club==='Orange Slices')return 'southside'
 if(club==='Shooting Stars FC')return 'eastside'
 return 'school'
}

export function selectStadium(home:StadiumId,initial=home):Promise<StadiumId|null>{
 const dialog=document.createElement('dialog')
 dialog.className='stadium-picker'
 dialog.setAttribute('aria-labelledby','stadium-title')
 dialog.innerHTML=`<div class="stadium-inner"><h1 id="stadium-title">Select Stadium</h1>
 <div class="stadium-cards">${grounds.map(g=>`<button type="button" class="stadium-card">
 <img src="${g.image}" alt=""><span class="stadium-copy"><strong>${g.name}</strong><small>${g.details}</small></span>
 ${g.id===home?'<span class="stadium-home">Home field</span>':''}</button>`).join('')}</div>
 <div class="stadium-nav"><button data-back>Back</button><span>${hint('← →','LS ↔')} Choose field</span><button data-next>Continue ${hint('Enter','A')}</button></div></div>`
 document.body.append(dialog);dialog.showModal()
 const cards=Array.from(dialog.querySelectorAll<HTMLButtonElement>('.stadium-card'))
 let index=grounds.findIndex(g=>g.id===initial)
 function select(i:number){
  index=(i+grounds.length)%grounds.length
  cards.forEach((c,n)=>c.setAttribute('aria-pressed',String(n===index)))
  cards[index].focus()
 }
 select(index)
 return new Promise(resolve=>{
  let frame=0
  function finish(back:boolean){
   cancelAnimationFrame(frame);dialog.close();dialog.remove();audio.menu(back?'nav':'success')
   resolve(back?null:grounds[index].id)
  }
  function cycle(step:number){audio.menu('nav');select(index+step)}
  cards.forEach((c,n)=>{c.onclick=()=>select(n)})
  dialog.querySelector<HTMLButtonElement>('[data-back]')!.onclick=()=>finish(true)
  dialog.querySelector<HTMLButtonElement>('[data-next]')!.onclick=()=>finish(false)
  dialog.oncancel=e=>{e.preventDefault();finish(true)}
  dialog.onkeydown=e=>{
   if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();cycle(e.key==='ArrowLeft'?-1:1)}
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
   if((current.dir==='l'||current.dir==='r')&&(current.dir!==previous.dir||now>=repeatAt)){
    cycle(current.dir==='l'?-1:1);repeatAt=now+(current.dir===previous.dir?230:460)
   }
   previous=current;frame=requestAnimationFrame(poll)
  }
  frame=requestAnimationFrame(poll)
 })
}
