import {planShot,missChances} from '../../tbfc-arcade/src/shooting.ts'
import {writeFileSync} from 'node:fs'
// Previous production planner, preserved for the before/after comparison.
function before(x,z,keeperZ,power,goalX,shooterX,keeperX,random,defended=false,target=(random()*2-1)*1.65,errorMultiplier=1,halfWidth=1.1){
 target*=halfWidth/2
 const progress=Math.min(1,Math.max(0,shooterX/goalX)),angle=(goalX-shooterX)/Math.max(.01,Math.hypot(goalX-shooterX,z)),placement=Math.min(1,Math.abs(target-keeperZ)/3)
 const goalChance=progress*(.45+.25*power+.14*placement)*(.65+.35*angle),miss=missChances(shooterX,z,goalX,power),scale=Math.min(errorMultiplier*2/halfWidth,.99/(miss.wide+miss.over))
 miss.wide*=scale;miss.over*=scale
 const roll=random(),onFrame=(roll-miss.wide-miss.over)/(1-miss.wide-miss.over)
 let result=roll<miss.wide?'Wide':roll<miss.wide+miss.over?'Over':onFrame<.10?power>=.5&&onFrame<.05?'Crossbar':'Post':defended&&onFrame<1-goalChance?'Save':progress===0?target<0?'Wide':'Over':'Goal'
 const side=target<0?-1:1,targetZ=result==='Wide'?side*(3+Math.abs(target)*.45):result==='Post'?side*halfWidth:target
 let targetX=goalX;if(result==='Goal')targetX+=.2;if(result==='Wide'||result==='Over')targetX+=.01
 return {result,targetZ,targetX}
}
const data={}
for(const d of [1,2,4,8,12])for(const p of [.35,.5,.85])for(const angle of [-30,-15,0,15,30]){
 const z=-d*Math.tan(angle*Math.PI/180)
 let seed=431;const random=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296)
 const rows=[]
 for(let i=0;i<60;i++){
  const placement=random(),roll=random();let calls=0
  const a=before(16-d,z,0,p,16,16-d,15,()=>calls++?roll:placement)
  const b=planShot(16-d,z,0,p,16,16-d,15,()=>roll,false,0,1,1.1,0)
  rows.push([a,b].map(s=>({z:+s.targetZ.toFixed(4),x:+(s.targetX-(16-d)).toFixed(4),r:s.result})))
 }
 data[d+':'+p+':'+angle]=rows
}
writeFileSync('work/gulch-shot-review/samples.json',JSON.stringify(data))
for(const d of [1,2,4,8,12]){const rows=data[d+':0.5:0'];console.log(d,rows.reduce((o,r)=>{for(let j=0;j<2;j++){o[j][r[j].r]=(o[j][r[j].r]||0)+1}return o},[{},{}]))}
