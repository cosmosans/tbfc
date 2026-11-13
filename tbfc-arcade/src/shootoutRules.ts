export type Side = 0 | 1
export type Outcome = 'Goal' | 'Save' | 'Wide' | 'Woodwork'
export type Kick = {side:Side, outcome:Outcome}
export type Score = [number,number]
export function shootout(kicks:readonly Kick[], first:Side=0){
 const score:Score=[0,0], taken:Score=[0,0]
 for(const kick of kicks){
  taken[kick.side]++
  if(kick.outcome==='Goal')score[kick.side]++
 }
 const regulation=taken.every(n=>n<=5)
 const decided=regulation
  ? score.some((goals,i)=>goals>score[1-i]+5-taken[1-i])
  : taken[0]===taken[1]&&score[0]!==score[1]
 const winner:Side|null=decided?(score[0]>score[1]?0:1):null
 const next=(kicks.length%2?1-first:first) as Side
 return {score,taken,winner,next,suddenDeath:kicks.length>=10}
}
export function simulatePenalties(strength:Score,random:()=>number,attribute?:(side:Side,index:number,keeping:boolean)=>number){
 const kicks:Kick[]=[]
 let state=shootout(kicks)
 while(state.winner===null){
  const side=state.next
  const shooting=attribute?.(side,state.taken[side],false)??75
  const keeping=attribute?.((1-side) as Side,0,true)??75
  const chance=Math.min(.89,Math.max(.55,.75+.003*(shooting-keeping)+.035*(strength[side]-strength[1-side])))
  kicks.push({side,outcome:random()<chance?'Goal':random()<.65?'Save':'Wide'})
  state=shootout(kicks)
 }
 return kicks
}
