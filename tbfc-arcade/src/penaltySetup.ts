import {screen} from './kickOff'
import {padBadge} from './screenUI'
import {settingsOptions} from './matchSettings'
import type {Club,Fixture} from './opponentSquads'
import {profiles} from './difficulty'
import './penaltySetup.css'

export type ShootoutLength=3|5|7
export type PenaltySelection={keeper:string;kickers:string[]}
const lengths=[3,5,7] as const
export function fullSquadPenaltySelection(club:Club):PenaltySelection {
 return {keeper:club.keeper,kickers:[...new Set([...club.outfield,...club.bench,club.keeper])]}
}
export function readPenaltyLength():ShootoutLength {
 try {const n=Number(localStorage.getItem('tbfc.penalties.length.v1'));return lengths.includes(n as ShootoutLength)?n as ShootoutLength:5} catch {return 5}
}
export function savePenaltyLength(length:ShootoutLength){try{localStorage.setItem('tbfc.penalties.length.v1',String(length))}catch{}}
export function selectPenaltySettings<T extends {time:string;weather:string;difficulty:string}>(fixture:Fixture,initial:T,initialLength:ShootoutLength=readPenaltyLength()):Promise<{settings:T,length:ShootoutLength}|null>{
 return screen<{settings:T,length:ShootoutLength}>((root,finish)=>{
  root.classList.add('pk-setup','pk-settings-screen')
  const settings={...initial};let length=initialLength;const options={time:settingsOptions.time,weather:settingsOptions.weather,difficulty:settingsOptions.difficulty}
  root.innerHTML=`<div class="pk-settings-shell"><div class="pk-settings-panel"><h1>MATCH SETTINGS</h1><section class="pk-matchup"><div><img src="${fixture.home.crest}" alt=""><strong>${fixture.home.name}</strong></div><b>VS</b><div><img src="${fixture.away.crest}" alt=""><strong>${fixture.away.name}</strong></div></section><fieldset><legend>SHOOTOUT LENGTH</legend><div class="pk-setting-row">${lengths.map(n=>`<button data-length="${n}">${n} KICKS</button>`).join('')}</div></fieldset>${Object.entries(options).map(([key,values])=>`<fieldset><legend>${key==='time'?'TIME OF DAY':key==='difficulty'?'DIVISION DIFFICULTY':'WEATHER'}</legend><div class="pk-setting-row">${values.map(value=>`<button data-setting="${key}" data-value="${value}">${value.toUpperCase()}</button>`).join('')}</div>${key==='difficulty'?'<p class="pk-division-detail"></p>':''}</fieldset>`).join('')}</div><div class="menu-legend controller-legend pk-settings-legend" aria-label="Shootout settings controls"><button data-back>${padBadge('B')} Back</button><span>${padBadge('LS')} Move</span><span>${padBadge('A')} Select</span><button data-next>${padBadge('Menu')} Start Shootout</button></div></div>`
  root.onclick=e=>{const b=(e.target as HTMLElement).closest<HTMLButtonElement>('button');if(!b)return
   if(b.hasAttribute('data-back'))finish(null)
   else if(b.hasAttribute('data-next'))finish({settings,length})
   else if(b.dataset.length){length=Number(b.dataset.length) as ShootoutLength;paint();b.focus()}
   else if(b.dataset.setting){(settings as Record<string,string>)[b.dataset.setting]=b.dataset.value!;paint();b.focus()}}
  function paint(){root.querySelectorAll<HTMLButtonElement>('[data-length]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.length)===length)));root.querySelectorAll<HTMLButtonElement>('[data-setting]').forEach(b=>b.setAttribute('aria-pressed',String((settings as Record<string,string>)[b.dataset.setting!]===b.dataset.value)));root.querySelector<HTMLElement>('.pk-division-detail')!.textContent=profiles[settings.difficulty as keyof typeof profiles]?.label??''}
  paint();root.querySelector<HTMLButtonElement>('[data-length]')?.focus()
 })
}
