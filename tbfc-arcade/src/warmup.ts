import {hint as control} from './screenUI'
export const drills=[
 {name:'Passing triangle',hint:`Aim at {target} with ${control('WASD','LS')}. Tap ${control('J','A')} to pass, or hold for a firmer ball.`},
 {name:'Angle finishing',hint:`Move into range. Hold ${control('K','B')} to build shot power, then release.`},
 {name:'Cross & volley',hint:`Aim toward {target} and press ${control('X','X')} to cross. Hold ${control('K','B')} before the ball arrives.`},
 {name:'Chip the bins',hint:`Aim at the gold rim. Hold ${control('X','X')} for distance and release to chip. A clean drop through the center earns more.`},
 {name:'Free practice',hint:`Move ${control('WASD','LS')} · Pass ${control('J','A')} · Shoot ${control('K','B')} · Through ball ${control('Y','Y')}`}
]
export function warmupPanel(parent:HTMLElement,select:(i:number)=>void,kickoff:()=>void){
 const panel=document.createElement('section');panel.className='training-panel'
 panel.innerHTML=`<div><strong></strong><span aria-live="polite"></span></div><p></p><nav><button data-next>Next ${control('N','RB')}</button><button data-again>Retry ${control('R','View')}</button><button data-start>Match ${control('Enter','Menu')}</button></nav>`
 parent.append(panel)
 let drill=0,points:number[]=[],last=''
 const hint=panel.querySelector('p')!
 function render(name:string){
  panel.querySelector('strong')!.textContent=drills[drill].name
  hint.innerHTML=drills[drill].hint.replace('{target}',name)
  panel.querySelector('span')!.textContent=drill===4?'':(points.length===5?'Final':('Try '+(points.length+1)+'/5'))+' · '+points.reduce((a,b)=>a+b,0)+'/100'+(last?' · '+last:'')
 }
 panel.querySelector('[data-start]')!.addEventListener('click',kickoff)
 panel.querySelector('[data-next]')!.addEventListener('click',()=>select((drill+1)%drills.length))
 panel.querySelector('[data-again]')!.addEventListener('click',()=>select(drill))
 return {panel,render,get drill(){return drill},get count(){return points.length},
 choose(i:number){drill=i;points=[];last=''},
 award(score:number,reason:string){if(points.length>=5)return;points.push(score);last=reason+' +'+score}}
}
export function shotPoints(result:string,distance:number,angle:number,power:number,firstTime:boolean){
 const outcome=({Goal:10,Save:6,Post:5,Crossbar:5} as Record<string,number>)[result]??0
 if(!outcome)return 0
 const difficulty=Math.min(5,Math.round(distance/3+angle*2))
 const ideal=Math.min(.9,.25+distance*.047)
 const technique=Math.max(0,Math.round(5-10*Math.abs(power-ideal)))
 return Math.min(20,outcome+difficulty+technique+(firstTime?2:0))
}
