export type ShotResult = 'Goal' | 'Save' | 'Post' | 'Crossbar' | 'Wide' | 'Over'

// x increases from midfield toward the goal. Power is a fraction of a full charge.
export function missChances(shooterX:number, z:number, goalX:number, power:number){
  const forward=Math.max(0,goalX-shooterX)
  const distance=Math.hypot(forward,z)
  const anglePenalty=1-forward/Math.max(.01,distance)
  const range=Math.min(1.4,distance/(goalX*5/6))
  const excessPower=Math.max(0,(power-.55)/.45)
  const total=Math.min(.85,.04+.36*range**1.5+.14*anglePenalty+.12*excessPower**2)
  const highShare=.20+.40*power
  return {wide:total*(1-highShare),over:total*highShare}
}

export function planShot(x:number,z:number,keeperZ:number,power:number,goalX:number,shooterX:number,keeperX:number,random=Math.random,defended=true,target=(random()*2-1)*1.65){
  const progress=Math.min(1,Math.max(0,shooterX/goalX))
  const angle=(goalX-shooterX)/Math.max(.01,Math.hypot(goalX-shooterX,z))
  const placement=Math.min(1,Math.abs(target-keeperZ)/3)
  const goalChance=progress*(.45+.25*power+.14*placement)*(.65+.35*angle)
  const miss=missChances(shooterX,z,goalX,power)
  const roll=random()
  // Resolve woodwork and keeper odds only among shots that survived the accuracy roll.
  const onFrame=(roll-miss.wide-miss.over)/(1-miss.wide-miss.over)
  let result:ShotResult
  if(roll<miss.wide)result='Wide'
  else if(roll<miss.wide+miss.over)result='Over'
  else if(onFrame<.10)result=power>=.5&&onFrame<.05?'Crossbar':'Post'
  else if(defended&&onFrame<1-goalChance)result='Save'
  else if(progress===0)result=target<0?'Wide':'Over'
  else result='Goal'
  const side=target<0?-1:1
  const targetZ=result==='Wide'?side*(3+Math.abs(target)*.45):result==='Post'?side*2:target
  let targetX=goalX
  if(result==='Save')targetX=Math.max(keeperX,Math.min(x+.1,goalX-.18))
  if(result==='Goal')targetX+=.2
  if(result==='Wide'||result==='Over')targetX+=.01
  return {result,targetZ,targetX,duration:Math.max(.15,Math.hypot(targetX-x,targetZ-z)/(12*(1+power)))}
}

export function shotFeedback(result:ShotResult, range:number, power:number, keeperReach:number){
  const ideal=.42+.24*Math.min(range/21,1)
  if(result==='Over')return 'TOO MUCH'
  if(power<ideal-.24||(result==='Save'&&keeperReach<.6&&power<ideal+.08))return ''
  if(result==='Wide')return ''
  const error=Math.abs(power-ideal)
  if(error<=.08&&keeperReach>=.85&&(result==='Goal'||result==='Save'))return 'GREAT SHOT'
  if(error<=.19)return 'GOOD SHOT'
  return ''
}
