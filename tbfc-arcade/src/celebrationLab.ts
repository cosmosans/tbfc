import {hint} from './screenUI'

type LabAction='prev'|'next'|'reset'|'exit'
const keys:Record<string,LabAction>={BracketLeft:'prev',BracketRight:'next',ArrowRight:'next',KeyR:'reset',Escape:'exit'}
const buttons:[number,LabAction][]=[[4,'prev'],[5,'next'],[3,'reset'],[9,'exit']]

export function celebrationControls(parent:HTMLElement,action:(command:LabAction)=>void,initialPad?:Gamepad){
 const panel=document.createElement('section')
 panel.className='celebration-controls'
 panel.setAttribute('aria-label','Goal celebration testing')
 panel.innerHTML='<output aria-live="polite"></output><nav aria-label="Celebration controls">'+
  '<button data-lab="prev" aria-label="Previous scorer">'+hint('[','LB')+' ‹</button>'+
  '<button data-lab="next" aria-label="Next scorer">› '+hint(']','RB')+'</button>'+
  '<span>Hold '+hint('K','B')+' to shoot</span>'+
  '<button data-lab="reset">Reset '+hint('R','Y')+'</button>'+
  '<button data-lab="exit">Exit '+hint('Esc','Menu')+'</button></nav>'
 parent.append(panel)
 panel.onclick=e=>{
  const button=(e.target as Element).closest<HTMLButtonElement>('button[data-lab]')
  if(button)action(button.dataset.lab as LabAction)
 }
 const held=new Set(buttons.filter(([i])=>initialPad?.buttons[i]?.pressed).map(([i])=>i))
 return {
  select(name:string){panel.querySelector('output')!.textContent=name},
  key(e:KeyboardEvent){
   // Enter on a focused button keeps its native activation.
   if(e.code==='Enter'&&e.target instanceof HTMLButtonElement)return true
   const command=keys[e.code]
   if(!command)return false
   e.preventDefault();if(!e.repeat)action(command)
   return true
  },
  poll(pad?:Gamepad){
   for(const [i,command] of buttons){
    if(pad?.buttons[i]?.pressed){if(!held.has(i)){held.add(i);action(command)}}
    else held.delete(i)
   }
  }
 }
}
