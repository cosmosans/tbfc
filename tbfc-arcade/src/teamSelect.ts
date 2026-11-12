import {hint,reveal} from './screenUI'
import {clubs,type Fixture} from './opponentSquads'
import {menuPad,menuDirection,padStatus} from './menuPad'
import css from './teamSelect.css?inline'
const accents=['#f47738','#88c6ed','#9c6cdb','#e74939','#e0b859','#599de0','#9dce90','#f1529d']
export function selectTeams(previous?:Fixture,standings?:ReadonlyMap<string,number>):Promise<Fixture|null>{
 const picks=[previous?.home??clubs[0],previous?.away??clubs[clubs.length-1]]
 const root=document.createElement('section');root.id='team-select';root.setAttribute('aria-label','Select teams')
 const style=document.createElement('style');style.textContent=css
 root.innerHTML=`<div class="ts-wrap"><header class="ts-heading"><h1>Select teams</h1><small class="ts-pad" role="status"></small></header><div class="ts-match"><article></article><span class="ts-vs">VS</span><article></article></div><div class="ts-foot"><button class="ts-back">‹ Main menu</button><span>${hint('↑ ↓','LS ↕')} Club · ${hint('← →','LS ↔')} Side · ${hint('Enter','A')} Continue</span><button class="ts-next">Lineup select ▸</button></div></div>`
 root.prepend(style);document.body.append(root)
 const main=document.querySelector('main')!;main.inert=true
 const cards=Array.from(root.querySelectorAll('article'))
 let side=1,frame=0
 function paint(i:number){
  const club=picks[i],card=cards[i],role=i?'Away':'Home'
  const rank=standings?.get(club.name)
  card.style.setProperty('--club',accents[clubs.indexOf(club)])
  card.innerHTML=`<div class="ts-side">${role}</div><div class="ts-crest"><button data-step="-1" aria-label="Previous ${role} club">▴</button><img src="${club.crest}" alt=""><button data-step="1" aria-label="Next ${role} club">▾</button></div><h2>${club.name}</h2><div class="ts-stars" aria-label="${club.stars} out of 5 stars"><span>${'★'.repeat(club.stars)}</span>${'☆'.repeat(5-club.stars)}</div>${rank==null?'':`<small>League position · ${rank}</small>`}`
 }
 function focusSide(i:number){side=i;cards.forEach((c,j)=>c.dataset.active=String(j===side));cards[i].querySelector('button')!.focus({preventScroll:true})}
 function cycle(i:number,step:number){
  let index=clubs.indexOf(picks[i])
  do{index=(index+step+clubs.length)%clubs.length}while(clubs[index]===picks[1-i])
  picks[i]=clubs[index];paint(i);focusSide(i)
 }
 cards.forEach((card,i)=>{paint(i);card.onclick=e=>{const btn=(e.target as HTMLElement).closest('button');if(btn)cycle(i,Number(btn.dataset.step));else focusSide(i)}})
 root.addEventListener('focusin',e=>{const i=cards.findIndex(c=>c.contains(e.target as Node));if(i>=0){side=i;cards.forEach((c,j)=>c.dataset.active=String(i===j))}})
 focusSide(side)
 reveal(root,'.ts-heading,article,.ts-foot')
 return new Promise(resolve=>{
  function finish(back=false){cancelAnimationFrame(frame);window.removeEventListener('keydown',key);root.remove();main.inert=false;resolve(back?null:{home:picks[0],away:picks[1]})}
  root.querySelector<HTMLButtonElement>('.ts-next')!.onclick=()=>finish()
  root.querySelector<HTMLButtonElement>('.ts-back')!.onclick=()=>finish(true)
  function navigate(dir:string){if(dir==='u'||dir==='d')cycle(side,dir==='u'?-1:1);else focusSide(dir==='l'?0:1)}
  function key(e:KeyboardEvent){
   const dir=({ArrowLeft:'l',ArrowRight:'r',ArrowUp:'u',ArrowDown:'d'} as Record<string,string>)[e.key]
   if(dir){e.preventDefault();navigate(dir)}
   if(e.key==='Escape'){e.preventDefault();finish(true);return}
   if(e.key==='Enter' && document.activeElement!==root.querySelector('.ts-back')){e.preventDefault();finish()}
  }
  window.addEventListener('keydown',key)
  let last='',next=0,pressed=!!menuPad()?.buttons.some((b,i)=>(i===0||i===9)&&b.pressed)
  let backHeld=!!menuPad()?.buttons[1]?.pressed
  function poll(now:number){const pad=menuPad(),dir=pad?menuDirection(pad):''
   const status=root.querySelector('.ts-pad')!
   const statusText=pad?padStatus:'';if(status.textContent!==statusText)status.textContent=statusText
   if(dir&&(dir!==last||now>=next)){navigate(dir);next=now+(dir===last?190:330)}last=dir
   const back=!!pad?.buttons[1]?.pressed;if(back&&!backHeld){finish(true);return}backHeld=back
   const down=!!(pad?.buttons[0]?.pressed||pad?.buttons[9]?.pressed)
   if(down&&!pressed){finish();return}pressed=down;frame=requestAnimationFrame(poll)
  }
  frame=requestAnimationFrame(poll)
 })
}
