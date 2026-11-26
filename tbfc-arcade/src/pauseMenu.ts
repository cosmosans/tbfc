import {renderMarkup} from './templates/renderMarkup'
import pauseScoreTemplate from './templates/street/pause-score.html?raw'
import pauseTemplate from './templates/street/pause.html?raw'
import {settingsOptions} from './matchSettings'
import type {WeatherPlayground} from './weatherPlayground'
import type {Club} from './opponentSquads'
import {menuDirection,menuPad} from './menuPad'
import {hint,reveal} from './screenUI'

type Choice='resume'|'squad'|'sides'|'simulate'|'quit'
export function pauseMenu(home:Club,away:Club,goals:number[],period:number,seconds:number,canSub:boolean,canSim:boolean,canQuit:boolean,practice=false,playground?:WeatherPlayground,formatLabel?:string):Promise<Choice>{
 const dialog=document.createElement('dialog')
 dialog.className='career-whistle pause-menu';dialog.setAttribute('aria-label',practice?'Practice Paused':'Match Paused')
 const clock=Math.floor(seconds/60)+':'+String(Math.floor(seconds)%60).padStart(2,'0')
 const team=(c:Club)=>`<div><img src="${c.crest}" alt=""><b>${c.name}</b></div>`
 dialog.innerHTML=renderMarkup(pauseTemplate, {
  modeLabel: practice?'Practice':'Match',
  score: practice?'':renderMarkup(pauseScoreTemplate, {
  homeTeam: team(home),
  clock: clock,
  score: goals.join(' – '),
  formatLabel: formatLabel??((period===1?'First':'Second')+' Half'),
  awayTeam: team(away)
})
})
 document.body.append(dialog);dialog.showModal()
 const section=dialog.querySelector('section')!
 return new Promise(resolve=>{
  let confirming=false,frame=0
  const done=(choice:Choice)=>{cancelAnimationFrame(frame);dialog.close();dialog.remove();resolve(choice)}
  const button=(choice:string,text:string)=>`<button data-choice="${choice}">${text}</button>`
  function draw(){
   section.innerHTML=confirming?
    '<h3>Simulate Rest of Match?</h3><p>The AI will finish both teams’ remaining time. Your score and match events will count, and the final result will be saved before returning to Central.</p>'+button('simulate','Simulate Rest of Match'):
    (canQuit?button('quit',practice?'Quit Practice':'Quit Match'):'')+(canSim?button('ask','Simulate Rest of Match')+button('sides','Side Select'):'')+(canSub?button('squad','Substitutions'):'')
   if(playground && !confirming){
    const panel=document.createElement('fieldset')
    panel.className='weather-tuning'
    panel.innerHTML='<legend>Weather Playground</legend>'
    const cycle=document.createElement('button')
    cycle.type='button'
    const labelWeather=()=>{cycle.textContent='Weather · '+playground.settings.weather}
    labelWeather()
    cycle.onclick=()=>{
     const options=settingsOptions.weather
     playground.settings.weather=options[(options.indexOf(playground.settings.weather)+1)%options.length]
     playground.refresh();labelWeather()
    }
    panel.append(cycle)
    const controls=[
     ['wetSlowdown','Wet grass slowdown',0,60],
     ['puddleDrag','Speed lost per second in a puddle',0,90],
     ['puddleSize','Puddle size',50,180],
    ] as const
    for(const [key,title,min,max] of controls){
     const label=document.createElement('label')
     const output=document.createElement('output')
     const input=document.createElement('input')
     input.type='range';input.min=String(min);input.max=String(max);input.step='5'
     input.value=String(playground.tuning[key])
     output.value=input.value+'%'
     input.setAttribute('aria-label',title)
     input.oninput=()=>{
      playground.tuning[key]=Number(input.value)
      output.value=input.value+'%'
      playground.refresh()
     }
     label.append(title,output,input);panel.append(label)
    }
    section.prepend(panel)
   }
   section.insertAdjacentHTML('beforeend',`<div class="menu-legend controller-legend"><button data-choice="back">${hint('Esc','B')} Back</button><span>${hint('Arrows','LS')} Move</span><span>${hint('Enter','A')} Select</span><button data-choice="resume">${hint('Esc','Menu')} Resume</button></div>`)
   section.querySelector<HTMLButtonElement>(confirming?'[data-choice=back]':'[data-choice=resume]')!.focus()
  }
  function back(){if(confirming){confirming=false;draw()}else done('resume')}
  section.onclick=e=>{const action=(e.target as Element).closest('button')?.dataset.choice
   if(action==='ask'){confirming=true;draw()}else if(action==='back')back();else if(action)done(action as Choice)
  }
  dialog.oncancel=e=>{e.preventDefault();back()}
  function move(step:number){const buttons=Array.from(section.querySelectorAll<HTMLElement>('button,input'));buttons[(buttons.indexOf(document.activeElement as HTMLButtonElement)+step+buttons.length)%buttons.length].focus()}
  dialog.onkeydown=e=>{
   e.stopPropagation()
   if(e.key==='Escape'){
    e.preventDefault()
    if(!e.repeat)back()
   }else if(e.key.startsWith('Arrow')){
    e.preventDefault()
    if(document.activeElement instanceof HTMLInputElement && (e.key==='ArrowLeft'||e.key==='ArrowRight'))adjust(e.key==='ArrowLeft'?-1:1)
    else move(e.key==='ArrowUp'||e.key==='ArrowLeft'?-1:1)
   }
  }
  function adjust(step:number){
   const input=document.activeElement as HTMLInputElement
   input.stepUp(step);input.dispatchEvent(new Event('input'))
  }
  const buttons=(pad=menuPad())=>[0,1,9].map(i=>!!pad?.buttons[i]?.pressed)
  let previous=buttons(),dir=''
  function poll(){
   if(!dialog.isConnected)return
   const pad=menuPad(),pressed=buttons(pad),next=pad?menuDirection(pad):''
   if(next&&next!==dir){
    if(document.activeElement instanceof HTMLInputElement && (next==='l'||next==='r'))adjust(next==='l'?-1:1)
    else move(next==='u'||next==='l'?-1:1)
   }
   if(pressed[2]&&!previous[2])done('resume')
   else if(pressed[1]&&!previous[1])back()
   else if(pressed[0]&&!previous[0])(document.activeElement as HTMLButtonElement)?.click()
   previous=pressed;dir=next;if(dialog.isConnected)frame=requestAnimationFrame(poll)
  }
  draw();reveal(dialog,'h2,.pause-score,section');frame=requestAnimationFrame(poll)
 })
}
