import type {Club} from './opponentSquads'
import {menuDirection,menuPad} from './menuPad'
import {hint,reveal} from './screenUI'

type Choice='resume'|'squad'|'simulate'|'quit'
export function pauseMenu(home:Club,away:Club,goals:number[],period:number,seconds:number,canSub:boolean,canSim:boolean,canQuit:boolean):Promise<Choice>{
 const dialog=document.createElement('dialog')
 dialog.className='career-whistle pause-menu';dialog.setAttribute('aria-label','Match Paused')
 const clock=Math.floor(seconds/60)+':'+String(Math.floor(seconds)%60).padStart(2,'0')
 const team=(c:Club)=>`<div><img src="${c.crest}" alt=""><b>${c.name}</b></div>`
 dialog.innerHTML=`<h2>Match Paused</h2><div class="pause-score">${team(home)}<div><small class="pause-clock">${clock}</small><strong>${goals.join(' – ')}</strong><small>${period===1?'First':'Second'} Half</small></div>${team(away)}</div><section></section>`
 document.body.append(dialog);dialog.showModal()
 const section=dialog.querySelector('section')!
 return new Promise(resolve=>{
  let confirming=false,frame=0
  const done=(choice:Choice)=>{cancelAnimationFrame(frame);dialog.close();dialog.remove();resolve(choice)}
  const button=(choice:string,text:string)=>`<button data-choice="${choice}">${text}</button>`
  function draw(){
   section.innerHTML=confirming?
    '<h3>Simulate Rest of Match?</h3><p>The AI will finish both teams’ remaining time. Your score and match events will count, and the final result will be saved before returning to Central.</p>'+button('back','Keep Playing')+button('simulate','Simulate Rest of Match'):
    (canQuit?button('quit','Quit Match'):'')+(canSim?button('ask','Simulate Rest of Match'):'')+(canSub?button('squad','Substitutions'):'')+button('resume','Resume Match')
   section.insertAdjacentHTML('beforeend',`<p>${hint('Esc','Menu')} Resume　${hint('Esc','B')} Back　${hint('Enter','A')} Select</p>`)
   section.querySelector<HTMLButtonElement>(confirming?'[data-choice=back]':'[data-choice=resume]')!.focus()
  }
  function back(){if(confirming){confirming=false;draw()}else done('resume')}
  section.onclick=e=>{const action=(e.target as Element).closest('button')?.dataset.choice
   if(action==='ask'){confirming=true;draw()}else if(action==='back')back();else if(action)done(action as Choice)
  }
  dialog.oncancel=e=>{e.preventDefault();back()}
  function move(step:number){const buttons=Array.from(section.querySelectorAll('button'));buttons[(buttons.indexOf(document.activeElement as HTMLButtonElement)+step+buttons.length)%buttons.length].focus()}
  dialog.onkeydown=e=>{e.stopPropagation();if(e.key.startsWith('Arrow')){e.preventDefault();move(e.key==='ArrowUp'||e.key==='ArrowLeft'?-1:1)}}
  const buttons=(pad=menuPad())=>[0,1,9].map(i=>!!pad?.buttons[i]?.pressed)
  let previous=buttons(),dir=''
  function poll(){
   if(!dialog.isConnected)return
   const pad=menuPad(),pressed=buttons(pad),next=pad?menuDirection(pad):''
   if(next&&next!==dir)move(next==='u'||next==='l'?-1:1)
   if(pressed[2]&&!previous[2])done('resume')
   else if(pressed[1]&&!previous[1])back()
   else if(pressed[0]&&!previous[0])(document.activeElement as HTMLButtonElement)?.click()
   previous=pressed;dir=next;if(dialog.isConnected)frame=requestAnimationFrame(poll)
  }
  draw();reveal(dialog,'h2,.pause-score,section');frame=requestAnimationFrame(poll)
 })
}
