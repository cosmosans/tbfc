import {bios} from './lineupRoles.ts'
import {playerRatings} from './playerRatings.ts'
import {shootout,simulatePenalties,type Kick} from './shootoutRules.ts'
import type {Attribute} from './careerDevelopment'
import {varyMessages} from './careerPhrases.ts'
// Club indices use the arcade club list. Scores always follow the fixture's listed order.
export const tiers = ['beginners','d6','d5','d4'] as const
type Tier = typeof tiers[number]
export type Sheet = {shape:'1-3-3'|'1-3-1-2'|'1-2-1-3'|'1-2-3-1',starters:string[],bench:string[]}
type Goal = {minute:number,club:number,player:string}
export type PlayerPerformance={name:string,goals:number,assists:number,passes:number,xpBefore:number,xpAfter:number}
export type Report = {kicks?:Kick[],simulatedFrom?:number,performance?:PlayerPerformance,score:[number,number],goals:Goal[],shots:[number,number],played:string[],simulated:boolean,pens?:[number,number]}
export type Game = {requiresWinner?:boolean,kicks?:Kick[],kickoff?:number,timeline?:[number[],number[]],a:number,b:number,score?:[number,number],pens?:[number,number]}
type Vote = {name:string,day:number,answer:'Yes'|'No'|'Maybe'|'Late',message:string}
type Conditions={time:"Day"|"Night",weather:"Rain"|"Clouds"|"Sun"}
export type Week = {conditions:Conditions,events:Vote[],sheet:Sheet}
export type Career = {
 upgrades?:Partial<Record<Attribute,number>>
 version:1,id:string,revision:number,player:string,division:Tier,seed:number,season:number,round:number,day:number,
 schedule:Game[][],week:Week,reports:Report[],reaction:string,history:{season:number,division:Tier,place:number,points:number,reports:Report[],schedule:Game[][]}[],
 bonds:Record<string,number>,chat:{name:string,text:string,date:string}[],speed:5|10|20,stats:Record<string,{apps:number,goals:number}>,xp:number,chaos:boolean,simulate:boolean
}
function roll(c:Career){c.seed=(Math.imul(c.seed,1664525)+1013904223)>>>0;return c.seed/4294967296}
function shuffle<T>(c:Career,items:T[]){const copy=items.slice();for(let i=copy.length-1;i>0;i--){const j=Math.floor(roll(c)*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}return copy}
function fixtures(c:Career,clubs:number){
 const ring=[0,...shuffle(c,Array.from({length:clubs-1},(_,i)=>i+1))]
 const rounds:Game[][]=[]
 for(let i=1;i<clubs;i++){
  const games:Game[]=[]
  for(let j=0;j<clubs/2;j++){const a=ring[j],b=ring[clubs-1-j];games.push(i%2?{a,b}:{a:b,b:a})}
  rounds.push(games);ring.splice(1,0,ring.pop()!)
 }
 return rounds.slice(0,6)
}
// Sample once per fixture without consuming the attendance or result random stream.
export function matchConditions(seed:number):Conditions{
 const weather=['Rain','Clouds','Sun'] as const
 const sample=(Math.imul(seed,1664525)+1013904223)>>>0
 const lighting=(Math.imul(sample,1664525)+1013904223)>>>0
 return {time:lighting<0x80000000?'Day':'Night',weather:weather[Math.floor(sample/4294967296*weather.length)]}
}
function makeWeek(c:Career,roster:string[],women:Set<string>):Week {
 const order=shuffle(c,roster)
 const womenFirst=order.filter(n=>women.has(n))
 const confirmed=[...new Set([c.player,...womenFirst.slice(0,2),...order])].slice(0,11)
 const keeper=confirmed.includes('Sean')?'Sean':confirmed.includes('José')?'José':confirmed.find(n=>!women.has(n))!
 const field=[...new Set([...womenFirst.filter(n=>confirmed.includes(n)).slice(0,2),c.player,...confirmed])].filter(n=>n!==keeper).slice(0,6)
 const starters=[...field,keeper],bench=confirmed.filter(n=>!starters.includes(n))
 const events:Vote[]=order.flatMap((name,i)=>{
  const coming=confirmed.includes(name), day=i<3?0:1+Math.floor(roll(c)*5)
  const final:Vote={name,day,answer:coming?'Yes':'No',message:roll(c)<(coming?.8:.6)?'pending':''}
  if(day>1 && roll(c)<(c.chaos?.65:.2))return [{name,day:day-1,answer:'Maybe',message:'Checking my schedule. Will confirm.'} as Vote,final]
  return [final]
 })
 if(c.chaos && bench.length)events.push({name:bench[0],day:5,answer:'Late',message:'This traffic sucks! Start without me. I’ll be there.'})
 varyMessages(events,c.seed)
 return {conditions:matchConditions(c.seed),events:events.sort((a,b)=>a.day-b.day),sheet:{shape:'1-3-3',starters,bench}}
}
export function createCareer(player:string,division:Tier,seed:number,roster:string[],women:Set<string>,clubs:number,chaos:boolean,simulate:boolean):Career{
 const c:Career={version:1,id:crypto.randomUUID(),revision:0,player,division,seed,season:1,round:0,day:0,schedule:[],week:null!,reports:[],reaction:'',history:[],bonds:{},chat:[],speed:10,stats:{},xp:0,chaos,simulate}
 c.schedule=fixtures(c,clubs);c.week=makeWeek(c,roster,women);return c
}
export function opponent(c:Career){const g=c.schedule[c.round].find(g=>g.a===0||g.b===0)!;return g.a||g.b}
export function table(c:Career,through=c.reports.length){
 const rows=Array.from({length:c.schedule[0].length*2},(_,club)=>({club,p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}))
 for(const round of c.schedule.slice(0,Math.min(6,through)))for(const g of round){
  if(!g.score)continue
  for(const [club,f,a] of [[g.a,...g.score],[g.b,g.score[1],g.score[0]]]){
   const row=rows[club];row.p++;row.gf+=f;row.ga+=a
   if(f>a){row.w++;row.pts+=3}else if(f===a){row.d++;row.pts++}else row.l++
  }
 }
 return rows.sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf||a.club-b.club)
}
function simulatedGoals(c:Career,strength:number){
 let goals=0;for(let chance=0;chance<8;chance++)if(roll(c)<Math.max(.07,Math.min(.65,.25+strength*.045)))goals++
 return goals
}
export function simulateMatch(c:Career,ratings:number[],chemistry:number,rivals:string[],development=0):Report{
 const rival=opponent(c),advantage=development+ratings[0]-ratings[rival]+(chemistry-50)/24+1-tiers.indexOf(c.division)
 const score:[number,number]=[simulatedGoals(c,advantage),simulatedGoals(c,-advantage)]
 const goals:Goal[]=[]
 for(const [i,count] of score.entries())for(let k=0;k<count;k++){
  const names=i?rivals:c.week.sheet.starters.slice(0,6)
  goals.push({club:i?rival:0,minute:1+Math.floor(roll(c)*50),player:names[Math.floor(roll(c)*names.length)]})
 }
 return {score,goals:goals.sort((a,b)=>a.minute-b.minute),shots:[score[0]+Math.floor(roll(c)*6),score[1]+Math.floor(roll(c)*6)],played:[...c.week.sheet.starters],simulated:true}
}
export function simulateRemainder(c:Career,report:Report,elapsedSeconds:number,homePlayers:string[],awayPlayers:string[],ratings:number[]){
 const rival=opponent(c),minute=Math.min(50,Math.max(0,elapsedSeconds/60))
 report.simulatedFrom=minute
 // Roll chances only for the unplayed fraction of each remaining match minute.
 for(let m=Math.floor(minute)+1;m<=50;m++){
  const fraction=Math.min(1,m-minute)
  for(const side of [0,1] as const){
   const squad=side===0?homePlayers:awayPlayers
   if(!squad.length||roll(c)>=fraction*.19)continue
   report.shots[side]++
   const gap=(ratings[0]-ratings[rival]+1-tiers.indexOf(c.division))*(side===0?1:-1)
   if(roll(c)>=Math.min(.6,Math.max(.08,.28+.035*gap)))continue
   report.score[side]++
   report.goals.push({minute:m,club:side===0?0:rival,player:squad[Math.floor(roll(c)*squad.length)]})
  }
 }
}
const kickoffSlots=[20*60,20*60+30,20*60+50,21*60+50]
export function scheduleKickoffs(c:Career){
 // Local random stream keeps legacy saves repeatable until their next autosave.
 let seed=c.seed
 for(const round of c.schedule)for(const game of round){
  if(game.score||kickoffSlots.includes(game.kickoff??-1))continue
  seed=(Math.imul(seed,1664525)+1013904223)>>>0
  game.kickoff=kickoffSlots[Math.floor(seed/4294967296*kickoffSlots.length)]
 }
}
export function bookRound(c:Career,ratings:number[]){
 scheduleKickoffs(c)
 for(const g of c.schedule[c.round]){
  if(g.a===0||g.b===0||g.timeline)continue
  const gap=ratings[g.a]-ratings[g.b]
  const minutes=(edge:number)=>Array.from({length:simulatedGoals(c,edge)},()=>1+Math.floor(roll(c)*50)).sort((a,b)=>a-b)
  g.timeline=[minutes(gap),minutes(-gap)]
 }
}
export function scoreboardAt(g:Game,clock:number){
 const elapsed=clock-g.kickoff!
 if(elapsed<0)return {label:kickoffTime(g.kickoff!),score:null}
 return {label:elapsed>=50?'FINAL':'LIVE '+elapsed+'′',score:g.timeline!.map(goals=>goals.filter(m=>m<=elapsed).length)}
}
export function kickoffTime(minute:number){return ((Math.floor(minute/60)+11)%12+1)+':'+String(minute%60).padStart(2,'0')+' PM'}
export function finishRound(c:Career,report:Report,ratings:number[]){
 if(c.reports.length!==c.round||c.day!==5)throw Error('This fixture is already settled or is not due.')
 bookRound(c,ratings)
 for(const g of c.schedule[c.round]){
  if(g.a===0)g.score=[...report.score]
  else if(g.b===0)g.score=[report.score[1],report.score[0]]
  else g.score=[g.timeline![0].length,g.timeline![1].length]
 }
 for(const g of c.schedule[c.round]){
  if(!fixtureRequiresWinner(c,g)||g.score![0]!==g.score![1])continue
  const ours=g.a===0||g.b===0
  const orient=(kicks:Kick[])=>kicks.map(k=>({...k,side:g.b===0?(k.side===0?1:0) as 0|1:k.side}))
  const attribute=(side:0|1,index:number,keeping:boolean)=>{
   const club=side===0?g.a:g.b
   if(club!==0)return 65+ratings[club]*4
   const starters=c.week.sheet.starters
   const name=keeping?starters.at(-1)!:starters[index%starters.length]
   return (playerRatings[bios[name]?.[0]]?.[keeping?5:2]??75)+(name===c.player?(c.upgrades?.[keeping?'Keeping':'Shooting']??0):0)
  }
  g.kicks=ours&&report.kicks?orient(report.kicks):simulatePenalties([ratings[g.a],ratings[g.b]],()=>roll(c),attribute)
  g.pens=shootout(g.kicks).score
  if(ours){report.kicks=orient(g.kicks);report.pens=shootout(report.kicks).score}
 }
 if(c.round===5){
  const [a,b,d,e,f,h,i,j]=table(c,6).map(row=>row.club)
  c.schedule.push([{a,b:e},{a:b,b:d},{a:f,b:j},{a:h,b:i}].map(g=>({...g,requiresWinner:true})))
 }
 if(c.round===6){
  const pair=(a:number,b:number)=>({a,b,requiresWinner:true})
  const [topA,topB,lowA,lowB]=c.schedule[6].map(outcome)
  c.schedule.push([pair(topA[0],topB[0]),pair(topA[1],topB[1]),pair(lowA[0],lowB[0]),pair(lowA[1],lowB[1])])
 }
 c.reports.push(report)
 for(const name of new Set(report.played)){const stats=c.stats[name]??={apps:0,goals:0};stats.apps++;stats.goals+=report.goals.filter(g=>g.club===0&&g.player===name).length}
 for(let i=0;i<c.week.sheet.starters.length;i++){
  for(const mate of c.week.sheet.starters.slice(i+1)){
   const key=[c.week.sheet.starters[i],mate].sort().join('|')
   c.bonds[key]=Math.min(10,(c.bonds[key]??0)+1)
  }
 }
 const [f,a]=report.pens??report.score
 c.xp+=10+Number(report.played.includes(c.player))*10+report.goals.filter(g=>g.club===0&&g.player===c.player).length*5+(f>a?5:0)
 const author=shuffle(c,report.played)[0]
 const scoring=report.goals.find(g=>g.club===0)
 c.reaction=author+' · '+(f>a?(scoring?scoring.player+' on the scoresheet! Three points.':'Three points! Great work everyone.'):f<a?'Shake it off guys, we’ll get ’em next time.':'I’ll take the point. See you next week.')
}
export function nextWeek(c:Career,roster:string[],women:Set<string>,promote=false){
 if(c.reports.length!==c.round+1)throw Error('Finish this fixture first.')
 for(const e of c.week.events)if(e.message)c.chat.push({name:e.name,text:e.message,date:calendarDate(c,e.day)})
 c.chat.push({name:'Full time',text:c.reaction,date:calendarDate(c,5)})
 c.chat=c.chat.slice(-80)
 if(c.reports.length===c.schedule.length){
  const standings=table(c),place=c.schedule[7].flatMap(outcome).indexOf(0)+1
  c.history.push({season:c.season,division:c.division,place,points:standings.find(r=>r.club===0)!.pts,reports:c.reports,schedule:c.schedule})
  if(promote&&place===1)c.division=tiers[Math.min(3,tiers.indexOf(c.division)+1)]
  c.season++;c.schedule=fixtures(c,standings.length);c.reports=[];c.round=0
 }else c.round++
 c.day=c.round===0?-8:-1;c.week=makeWeek(c,roster,women)
}

export function outcome(g:Game):number[]{
 const score=g.pens??g.score!
 return score[0]>score[1]?[g.a,g.b]:[g.b,g.a]
}
export function stage(round:number,index:number){
 if(round<6)return 'League · Week '+(round+1)
 if(round===6)return index<2?'Championship semifinal':'Best of the Rest semifinal'
 return ['Championship final','Third-place match','Best of the Rest final','Seventh-place match'][index]
}
export function seasonName(season:number){
 return ['Spring','Summer','Fall','Winter'][(season-1)%4]+' '+(2027+Math.floor((season-1)/4))
}
export function calendarTime(c:Career,day=c.day){return Date.UTC(2027,1,27+(c.season-1)*63+c.round*7+day)}
export function calendarDate(c:Career,day=c.day){
 return new Date(calendarTime(c,day)).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',timeZone:'UTC'})
}

// Older saves predate the fixture flag.
export function fixtureRequiresWinner(c:Career,g:Game){return g.requiresWinner??(c.round>=6)}
