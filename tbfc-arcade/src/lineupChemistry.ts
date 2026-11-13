import burnerRatings from './burnerChemistry.json'
import {formations,outOfPosition,type Shape} from './lineupRoles'

// Slots run from the front row back to the keeper, left to right within each row.
const neighbors:Record<Shape,[number,number][]>={
 '1-3-3':[[0,1],[1,2],[0,3],[0,4],[1,4],[2,4],[2,5],[3,4],[4,5],[3,6],[4,6],[5,6]],
 '1-3-1-2':[[0,1],[0,2],[1,2],[2,3],[2,4],[2,5],[3,4],[4,5],[3,6],[4,6],[5,6]],
 '1-2-1-3':[[0,1],[1,2],[0,3],[1,3],[2,3],[3,4],[3,5],[4,5],[4,6],[5,6]],
 '1-2-3-1':[[0,1],[0,2],[0,3],[1,2],[2,3],[1,4],[2,4],[2,5],[3,5],[4,5],[4,6],[5,6]]
}

export function pairRating(club:string,a:string,b:string,bonds:Record<string,number>={}){
 if(club==='Turf Burners FC'){
  const key=[a,b].sort().join('|')
  const override=(burnerRatings as Record<string,number>)[key]
  const base=typeof override==='number' ? override : 75
  return Math.min(100,base+(bonds[key]??0))
 }
 // A seeded roll per unordered pair keeps experiments repeatable across visits.
 let seed=2166136261
 for(const c of [club,...[a,b].sort()].join('|'))seed=Math.imul(seed^c.charCodeAt(0),16777619)
 seed=Math.imul(seed^(seed>>>16),0x85ebca6b)
 return ((seed^(seed>>>13))>>>0)%101
}

export function lineupChemistry(club:string,shape:Shape,slots:(string|null)[],bonds:Record<string,number>={}){
 const links=neighbors[shape].map(([a,b])=>({a,b,rating:pairRating(club,slots[a]!,slots[b]!,bonds)}))
 const strong=new Set(links.filter(l=>l.rating>=70).map(l=>l.a*7+l.b))
 let trios=0
 for(const {a,b} of links){
  if(!strong.has(a*7+b))continue
  for(let c=b+1;c<7;c++)if(strong.has(a*7+c)&&strong.has(b*7+c))trios++
 }
 const average=links.reduce((sum,l)=>sum+l.rating,0)/links.length
 const roles=[...formations[shape].flat(),'GK']
 const misplaced=slots.slice(0,7).filter((name,i):name is string=>outOfPosition(club,name,roles[i]))
 const positionPenalty=2*misplaced.length
 return {links,trios,misplaced,positionPenalty,score:Math.max(0,Math.min(100,Math.round(average+trios*3))-positionPenalty)}
}
