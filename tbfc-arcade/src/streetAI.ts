import {streetArena,streetBoards} from './streetArena.ts'
type Point={x:number;z:number}
export type StreetTactics={presser:number;cover:number}
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n))
// Roles follow space and possession, with a cost advantage for the incumbent.
// No formation slot is a keeper: cover advances with the ball and rotates.
export function streetTargets(points:Point[],ball:Point,direction:number,carrier:number,possessing:boolean,anchors:Point[],previous:StreetTactics){
 const distance=(p:Point,q:Point)=>Math.hypot(p.x-q.x,p.z-q.z)
 const nearest=points.reduce((best,p,i)=>distance(p,ball)-(i===previous.presser?1.8:0)<distance(points[best],ball)-(best===previous.presser?1.8:0)?i:best,0)
 const candidates=points.map((_,i)=>i).filter(i=>i!==(possessing?carrier:nearest))
 const cover=candidates.reduce((best,i)=>{
  const cost=(j:number)=>points[j].x*direction+Math.abs(points[j].z)*.2-(j===previous.cover?2.5:0)
  return best<0||cost(i)<cost(best)?i:best
 },-1)
 const other=candidates.filter(i=>i!==cover)
 const sx=streetArena.length/42,sz=streetArena.width/24
 const lead=direction*ball.x
 const targets=points.map((p,i)=>{
  if(i===carrier&&possessing)return {x:direction*(streetBoards.x-1.5),z:clamp(p.z*.7,-8*sz,8*sz)}
  if(!possessing&&i===nearest)return {...ball}
  if(i===cover)return {x:direction*clamp(lead-(possessing?6:5),-streetBoards.x+1,10*sx),z:clamp(ball.z*.4,-4,4)}
  const lane=other.indexOf(i),side=lane%2===0?-1:1
  const width=(other.length>2?5+Math.floor(lane/2)*3:6)*sz
  return {x:direction*clamp(lead+(possessing?3+(lane%2)*2:-3-Math.floor(lane/2)*2),-16*sx,streetBoards.x-1.5),z:clamp(ball.z*.3+side*width+(anchors[i]?.z??0)*.15,streetBoards.north+.6,streetBoards.south-.6)}
 })
 return {targets,presser:nearest,cover}
}
