import {clubs} from './opponentSquads'
export function scoreRow(a:number,b:number,score:number[]|null,status:string,stage='',headline='vs'){
 const club=(i:number)=>`<span class="lb-side"><img src="${clubs[i].crest}" alt=""><b>${clubs[i].name}</b></span>`
 return `<div class="lb-row">${club(a)}<div class="lb-score"><strong>${score?score.join(' – '):headline}</strong><small>${status}</small></div>${club(b)}</div>${stage?'<small>'+stage+'</small>':''}`
}
export function statRow(label:string,values:(number|string)[]){
 const [home,away]=values.map(value=>parseFloat(String(value)))
 const gap=home-away
 const favorable=label==='Fouls'||label==='Yellow cards'?-gap:gap
 const side=favorable>0?'home':'away'
 // One tick per count or percentage point; distance uses tenths of a mile.
 const units=Math.abs(gap)*(label==='Distance (mi)'?10:1)
 const bar=Number.isFinite(gap)&&gap!==0?`<i class="stat-edge ${side}" aria-hidden="true" style="--units:${units}"></i>`:''
 return `<div class="lb-stat"><b>${values[0]}</b><span>${label}</span><b>${values[1]}</b>${bar}</div>`
}
