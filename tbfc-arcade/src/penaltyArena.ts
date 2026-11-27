import {showKeeperDive} from "./keeperDive"
import {CurveGesture} from './burnCurve'
import rivalReady from './art/rival-keeper-ready.png?url'
import seanBounceSouth from './art/sean-keeper-bounce.png?url'
import seanBounceNorth from './art/sean-keeper-bounce-north.png?url'
import seanRhythmSouth from './art/sean-keeper-rhythm-south.png?url'
import seanRhythmNorth from './art/sean-keeper-rhythm-north.png?url'
import * as T from 'three'
import {audio} from './matchAudio'
import {menuPad} from './menuPad'
import {padBadge} from './screenUI'
import {shootout,type Kick,type Outcome,type Side} from './shootoutRules'
import {spriteGroundPadding} from './spriteGround'
import './penaltyArena.css'

type Actor={displayName:string,sprite:T.Sprite,maps:T.Texture[],runFrames:number,runRows:number,staminaCapacity:number}
export type KeeperPose='ready'|'shuffleLeft'|'shuffleRight'|'diveLeft'|'diveRight'|'centerBlock'|'saveContact'|'recovery'|'concede'
type Arena={scene:T.Scene,camera:T.PerspectiveCamera,renderer:T.WebGLRenderer,ball:T.Sprite,
 teams:[Actor[],Actor[]],keeperDiveSheet:(idle:T.Texture,quick:boolean)=>T.Texture,keepers:[Actor,Actor],names:[string,string],crests?:[string,string],level:number,
 rating:(actor:Actor,keeping:boolean)=>number,render:(dt:number)=>void,net:(p:T.Vector3,power:number)=>void,
 fire:(seconds:number,side:Side)=>void,dissolve:()=>void,test:boolean,finish:(kicks:Kick[])=>void,attempts?:3|5|7,controllers?:[number|null,number|null],pause?:(kicks:Kick[])=>Promise<boolean>}
const clamp=T.MathUtils.clamp
function frame(actor:Actor,mode:number,column:number,row:number){
 const map=actor.maps[mode]
 const directionalKick=mode===2&&map.image.height>=384
 const rows=mode===2?(directionalKick?8:map.image.height/48):mode===1?actor.runRows:1
 const cell=map.image.height/rows
 const cols=mode===0?8:mode===1?actor.runFrames:Math.round(map.image.width/cell)
 const face=mode===2&&!directionalKick?(rows===2?row>=4?1:0:0):mode===0?0:row%rows
 const index=((column%cols)+cols)%cols
 map.repeat.set(1/cols,1/rows);map.offset.set(index/cols,(rows-1-face)/rows)
 actor.sprite.material.map=map
 actor.sprite.material.rotation=0
 actor.sprite.scale.setScalar(1.7*cell/48)
 actor.sprite.center.set(.5,spriteGroundPadding(map.image,cols,rows,face,index,true)/cell)
}
// New keeper sheets can replace the temporary poses here.
function keeperPose(a:Actor,pose:KeeperPose,face:number,time:number){
 a.sprite.userData.keeperPose=pose
 const moving=pose.startsWith('shuffle')
 frame(a,moving?1:0,moving?Math.floor(time*10):face,moving?face:0)
}
export function playPenalties(a:Arena){
 function keeperTexture(url:string){
  const texture=new T.TextureLoader().load(url)
  texture.magFilter=texture.minFilter=T.NearestFilter
  texture.generateMipmaps=false;texture.colorSpace=T.SRGBColorSpace
  return texture
 }
 const keeperKit={ready:keeperTexture(rivalReady),seanBounceSouth:keeperTexture(seanBounceSouth),seanBounceNorth:keeperTexture(seanBounceNorth),seanRhythmSouth:keeperTexture(seanRhythmSouth),seanRhythmNorth:keeperTexture(seanRhythmNorth)}
 for(const sheet of Object.values(keeperKit))sheet.repeat.set(1/9,1)
 const limit=a.attempts??5
 const keeperLineX=20.4,goalHalfWidth=1.92,goalHeight=1.94,diveDuration=.78
 const state=()=>shootout(kicks,first,limit)
 function showDive(actor:Actor,elapsed:number,direction:number){
  if(elapsed<0)return
  const dive=a.keeperDiveSheet(actor.maps[0],!direction)
  showKeeperDive(actor.sprite,dive,direction?faceFor(0,direction):faceFor(-1,0),elapsed/diveDuration,1.7)
 }
 let readyTime=0,readyChoice=0,readyPhase=0
 const root=a.renderer.domElement.parentElement!
 root.classList.add('pk-active');root.removeAttribute('data-loading')
 const panel=document.createElement('section');panel.className='pk-ui'
 panel.innerHTML='<div class="pk-status" role="status"></div><div class="pk-power burn-meter" role="progressbar" aria-label="Shot power" aria-valuemin="0" aria-valuemax="100"><span><i></i></span></div><div class="pk-legend menu-legend controller-legend" aria-label="Penalty controls"></div><div data-touch><button data-key="ArrowLeft">◀</button><button data-key="ArrowRight">▶</button><button data-key="ArrowUp">▲</button><button data-key="ArrowDown">▼</button><button data-key="Space">Kick</button></div><div class="pk-end" hidden></div>'
 root.append(panel)
 const status=panel.querySelector<HTMLElement>('.pk-status')!,meter=panel.querySelector<HTMLElement>('.pk-power')!,legend=panel.querySelector<HTMLElement>('.pk-legend')!,end=panel.querySelector<HTMLElement>('.pk-end')!
 const scoreboard=root.querySelector<HTMLElement>('#scoreboard')!
 const homeGoals=root.querySelector<HTMLElement>('#homeGoals')!,awayGoals=root.querySelector<HTMLElement>('#awayGoals')!
 const period=root.querySelector<HTMLElement>('#bugPeriod')!,clock=root.querySelector<HTMLElement>('#bugClock')!
 const pipWrap=root.querySelector<HTMLElement>('.bug-pips')!
 const homePips=root.querySelector<HTMLElement>('#bugPipsHome')!,awayPips=root.querySelector<HTMLElement>('#bugPipsAway')!
 const previousBug={home:homeGoals.textContent,away:awayGoals.textContent,period:period.textContent,clock:clock.textContent,label:scoreboard.getAttribute('aria-label'),title:scoreboard.title}
 homeGoals.textContent='';awayGoals.textContent=''
 homePips.classList.add('bug-pips');awayPips.classList.add('bug-pips')
 homeGoals.append(homePips);awayGoals.append(awayPips)
 scoreboard.dataset.penalties='true'
 scoreboard.dataset.attempts=String(limit)
 function restoreBug(){
  pipWrap.append(homePips,awayPips)
  homePips.classList.remove('bug-pips');awayPips.classList.remove('bug-pips')
  homeGoals.textContent=previousBug.home;awayGoals.textContent=previousBug.away
  period.textContent=previousBug.period;clock.textContent=previousBug.clock
  if(previousBug.label===null)scoreboard.removeAttribute('aria-label');else scoreboard.setAttribute('aria-label',previousBug.label)
  scoreboard.title=previousBug.title
  delete scoreboard.dataset.penalties
  delete scoreboard.dataset.attempts
  delete scoreboard.dataset.suddenDeath
 }
 function setPower(value:number){
  meter.style.setProperty('--burn',String(value));meter.setAttribute('aria-valuenow',String(Math.round(value*100)))
 }
 const keys=new Set<string>(),events=new AbortController(),opts={signal:events.signal}
 const codes=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyW','KeyA','KeyS','KeyD','Space','KeyB','KeyK','KeyH']
 let flying=false,r3Held=false,paused=false,pauseHeld=false,drag:number|null=null
 const cameraAngles=new T.Euler(0,0,0,'YXZ'),move=new T.Vector3()
 const savedPosition=new T.Vector3(),savedRotation=new T.Quaternion()
 const flightKeys=[...codes,'KeyQ','KeyE','ShiftLeft','ShiftRight']
 function toggleFlight(){
  flying=!flying;keys.clear();held=true
  panel.classList.toggle('pk-flying',flying)
  if(flying){
   savedPosition.copy(a.camera.position);savedRotation.copy(a.camera.quaternion)
   cameraAngles.setFromQuaternion(savedRotation,'YXZ')
   if(charging){charging=false;power=0;setPower(0)}
  }else{
   drag=null;a.camera.position.copy(savedPosition);a.camera.quaternion.copy(savedRotation)
  }
 }
 const canvas=a.renderer.domElement
 if(a.test){
  canvas.addEventListener('pointerdown',e=>{
   if(!flying)return
   drag=e.pointerId;canvas.setPointerCapture(drag)
  },opts)
  canvas.addEventListener('pointermove',e=>{
   if(flying&&drag===e.pointerId){cameraAngles.y-=e.movementX*.005;cameraAngles.x=clamp(cameraAngles.x-e.movementY*.005,-1.55,1.55)}
  },opts)
  canvas.addEventListener('lostpointercapture',()=>{drag=null},opts)
 }
 async function openPause(){
  if(paused||!a.pause)return
  paused=true;keys.clear()
  if(charging){charging=false;power=0;setPower(0)}
  let quitting=false
  try{quitting=await a.pause(kicks)}
  finally{if(!quitting){paused=false;last=performance.now();held=shotHeld=keeperHeld=pauseHeld=true}}
 }
 function key(e:KeyboardEvent){
  if(paused)return
  if(e.code==='Escape'&&a.pause){
   e.preventDefault();e.stopImmediatePropagation()
   if(e.type==='keydown'&&!e.repeat)void openPause()
   return
  }
  if(cut>=0&&!flying&&['KeyJ','KeyE','Enter'].includes(e.code)){
   e.preventDefault();e.stopImmediatePropagation();if(e.type==='keydown'&&!e.repeat)advanceCut();return
  }
  if(a.test&&e.code==='KeyF'){
   e.preventDefault();e.stopImmediatePropagation()
   if(e.type==='keydown'&&!e.repeat)toggleFlight()
   return
  }
  if(flying){
   if(!flightKeys.includes(e.code))return
   e.preventDefault();e.stopImmediatePropagation()
   if(e.type==='keydown')keys.add(e.code);else keys.delete(e.code)
   return
  }
  if(e.code==='KeyH'&&(!a.controllers||a.controllers[side]===-1)&&shooting&&phase==='ready'&&cut<0){
   e.preventDefault();e.stopImmediatePropagation()
   if(e.type==='keydown'&&!e.repeat){reticleHidden=!reticleHidden;updateLegend()}
   return
  }
  if(!end.hidden||!codes.includes(e.code))return
  e.preventDefault();e.stopImmediatePropagation()
  if(e.type==='keydown')keys.add(e.code);else keys.delete(e.code)
 }
 addEventListener('keydown',key,{...opts,capture:true});addEventListener('keyup',key,{...opts,capture:true})
 addEventListener('blur',()=>{keys.clear();charging=false},opts)
 for(const b of panel.querySelectorAll<HTMLButtonElement>('[data-key]')){
  b.onpointerdown=e=>{b.setPointerCapture(e.pointerId);keys.add(b.dataset.key!)}
  b.onlostpointercapture=()=>keys.delete(b.dataset.key!)
 }
 const spot=new T.Mesh(new T.CircleGeometry(.12,16),new T.MeshBasicMaterial({color:0xfff1cf}))
 spot.rotation.x=-Math.PI/2;spot.position.set(15,.035,0)
 const reticle=new T.Mesh(new T.RingGeometry(.10,.155,48),new T.MeshBasicMaterial({color:0xffdb48,side:T.DoubleSide,transparent:true,depthTest:false,depthWrite:false}))
 reticle.rotation.y=Math.PI/2;reticle.renderOrder=10000;a.scene.add(spot,reticle)
 let kicks:Kick[]=[],human:Side=0,first:Side=a.attempts?(Math.random()<.5?0:1):0,side:Side=0,shooting=true,defending=false
 let phase:'ready'|'run'|'flight'|'result'|'end'='ready',age=0,time=0,wait=0,power=0,charging=false,held=true,shotHeld=true,keeperHeld=true
 let reticleHidden=false,hideHeld=false,reticleOpacity=1
 function updateLegend(){
  legend.hidden=phase!=='ready'||(!shooting&&!defending)
  if(shooting)legend.innerHTML=`<span>${padBadge('LS')} Aim</span><span>${padBadge('B')} Charge Shot</span><span>${padBadge('RB')} <span class="pk-reticle-action">${reticleHidden?'Show':'Hide'} Reticle</span></span>`
  else if(defending)legend.innerHTML=`<span>${padBadge('LS')} Move</span><span>${padBadge('B')} Dive</span>`
  else legend.replaceChildren()
 }
 let z=0,y=.9,aimReturnAge=-1,aimReturnZ=0,aimReturnY=.9,dive=-1,dir=0,origin=0,extension=0,pose:KeeperPose='ready',hitFrame=false
 let kicker:Actor,keeper:Actor,last=performance.now(),reaction=0,orderOffset=[0,0]
 const curveGesture=new CurveGesture()
 let curveRate=0,aimStartZ=0,aimStartY=0
 const velocity=new T.Vector3(),p=a.ball.position,cam=new T.Vector3(),look=new T.Vector3(19,1,0),target=new T.Vector3()
 // Keep only the current attempt. Replay poses never feed back into scoring.
 const samples:{t:number,ball:T.Vector3,taker:T.Vector3,keeper:T.Vector3,dive:number,direction:number,run:boolean}[]=[]
 let cut=-1,cutAge=0,recordTime=0,goalTime=0,skipHeld=false
 const skip=document.createElement('button');skip.className='pk-skip';skip.textContent='A · Skip';skip.hidden=true;panel.append(skip)
 skip.onclick=()=>{if(cut>=0&&!flying)advanceCut()}
 let nextRunner:Actor|null=null
 const nextFrom=new T.Vector3(),returnFrom=new T.Vector3(),returnTo=new T.Vector3(),goalVelocity=new T.Vector3()
 function sample(){
  samples.push({t:recordTime,ball:p.clone(),taker:kicker.sprite.position.clone(),keeper:keeper.sprite.position.clone(),dive,direction:dir,run:phase==='run'&&age<.50})
 }
 function faceFor(dx:number,dz:number){
  a.camera.getWorldDirection(cameraForward)
  return T.MathUtils.euclideanModulo(Math.round((Math.PI+Math.atan2(cameraForward.z,cameraForward.x)-Math.atan2(dz,dx))/(Math.PI/4)),8)
 }
 function advanceCut(){
  a.dissolve();cut=kicks.at(-1)?.outcome==='Save'?4:cut+1;cutAge=0
  if(cut===3){
   const result=state(),other=result.next
   nextRunner=result.winner===null?a.teams[other][(result.taken[other]+orderOffset[other])%a.teams[other].length]:null
   if(nextRunner)nextFrom.copy(nextRunner.sprite.position)
   returnFrom.set(8,0,-1)
   const slot=a.teams[side].filter(actor=>actor!==a.keepers[side]).indexOf(kicker)
   returnTo.set(slot<0?21:0,0,slot<0?7:(side===0?-1:1)*(3.8+slot*1.28))
   // Open the scorer's place in the line while the next player runs out.
   for(const watcher of watchers){
    const index=a.teams[side].filter(actor=>actor!==a.keepers[side]).indexOf(watcher.actor)
    if(index>=0)watcher.actor.sprite.position.z=(side===0?-1:1)*(3.8+1.28*index)
   }
  }else if(cut===4){
   cut=-1;a.fire(-1,side);skip.hidden=true;nextRunner=null
   if(state().winner===null)begin();else actions()
   held=true
  }
 }
 function playCut(dt:number){
  cutAge+=dt
  if(cut===0){
   a.fire(cutAge,side);kicker.sprite.position.x-=8*dt
   frame(kicker,1,Math.floor(cutAge*12),faceFor(-1,0))
   p.addScaledVector(goalVelocity,dt)
   if(p.x>=22.05&&goalVelocity.x>0){a.net(p,power);goalVelocity.set(-.4,-.5,0)}
   p.y=Math.max(.13,p.y)
   if(cutAge>=1.5)advanceCut()
  }else if(cut===1||cut===2){
   const right=cut===1
   a.camera.position.set(right?14:22.8,right?3.1:1.7,right?5.7:-1.55)
   a.camera.lookAt(right?19:15,.8,0)
   const t=cutAge*.72
   let i=samples.findIndex(s=>s.t>=t)
   if(i<0)i=samples.length-1
   const b=samples[i],prev=samples[Math.max(0,i-1)]
   const f=clamp((t-prev.t)/Math.max(.001,b.t-prev.t),0,1)
   p.lerpVectors(prev.ball,b.ball,f);keeper.sprite.position.lerpVectors(prev.keeper,b.keeper,f)
   kicker.sprite.position.lerpVectors(prev.taker,b.taker,f)
   keeper.sprite.center.set(.5,2/48);keeper.sprite.scale.setScalar(1.7)
   frame(keeper,0,faceFor(-1,0),0)
   showDive(keeper,b.dive,b.direction)
   const boot=t>=.50&&t<.82
   frame(kicker,boot?2:b.run?1:0,boot?Math.min(6,Math.floor((t-.5)*24)):b.run?Math.floor(t*14):faceFor(1,0),faceFor(1,0))
   const after=Math.max(0,t-goalTime)
   const saved=kicks.at(-1)?.outcome==='Save'
   if(saved&&t>=goalTime&&(cutAge-dt)*.72<goalTime)audio.play('post',.85)
   if(!saved&&after){p.x=Math.min(22.05,p.x+after*5);kicker.sprite.position.x-=after*8;frame(kicker,1,Math.floor(after*12),faceFor(-1,0))}
   a.fire(!saved&&t>=goalTime?after:-1,side)
   if(t>=goalTime+.65)advanceCut()
  }else{
   a.fire(-1,side);a.camera.position.set(5,10,22);a.camera.lookAt(6,0,0)
   const f=clamp(cutAge/3,0,1)
   kicker.sprite.position.lerpVectors(returnFrom,returnTo,f)
   frame(kicker,1,Math.floor(cutAge*10),faceFor(returnTo.x-returnFrom.x,returnTo.z-returnFrom.z))
   if(nextRunner){
    nextRunner.sprite.position.lerpVectors(nextFrom,target.set(13.5,0,.15),f)
    frame(nextRunner,1,Math.floor(cutAge*11),faceFor(13.5-nextFrom.x,.15-nextFrom.z))
   }
   if(f>=1)advanceCut()
  }
 }
 function board(){
  const s=state()
  scoreboard.dataset.suddenDeath=String(s.suddenDeath)
  scoreboard.setAttribute('aria-label',`${a.names[0]} ${s.score[0]}, ${a.names[1]} ${s.score[1]}. ${s.suddenDeath?'Sudden death':'Penalties'}`)
  scoreboard.title=scoreboard.getAttribute('aria-label')??''
  period.textContent=s.suddenDeath?'SUDDEN DEATH':'PENALTIES'
  clock.textContent=s.suddenDeath?'ROUND '+(Math.floor(Math.min(...s.taken)-limit)+1):`(${limit})`
  for(const i of [0,1] as const){
   const row=i===0?homePips:awayPips
   const all=kicks.filter(k=>k.side===i),results=s.suddenDeath?all.slice(-limit):all
   if(row.children.length!==limit)row.replaceChildren(...Array.from({length:limit},()=>document.createElement('i')))
   for(const [n,pip] of [...row.children].entries()){
    const outcome=results[n]?.outcome
    pip.textContent=outcome&&outcome!=='Goal'?'×':''
    pip.className=outcome==='Goal'?'filled':outcome?'miss':''
    pip.toggleAttribute('data-current',!outcome&&n===results.length&&s.next===i&&s.winner===null)
   }
  }
 }
 const watchers:{actor:Actor,heading:number}[]=[]
 const cameraForward=new T.Vector3()
 function renderArena(dt:number){
  a.camera.getWorldDirection(cameraForward)
  const awayFromView=Math.atan2(cameraForward.z,cameraForward.x)
  for(const {actor,heading} of watchers){
   if(cut===3&&actor===nextRunner)continue
   const face=T.MathUtils.euclideanModulo(Math.round((Math.PI+awayFromView-heading)/(Math.PI/4)),8)
   frame(actor,0,face,0)
  }
  a.render(dt)
 }
 function begin(){
  samples.length=0;recordTime=0;readyTime=0
  const s=state();side=s.next;shooting=a.controllers?a.controllers[side]!==null:side===human;defending=a.controllers?a.controllers[1-side]!==null:side!==human
  for(const actor of new Set([...a.teams.flat(),...a.keepers])){actor.sprite.visible=true;actor.sprite.center.set(.5,2/48);actor.sprite.scale.setScalar(1.7);actor.sprite.material.rotation=0}
  kicker=a.teams[side][(s.taken[side]+orderOffset[side])%a.teams[side].length];keeper=a.keepers[1-side]
  watchers.length=0
  for(const [team,actors] of a.teams.entries()){
   let slot=0
   for(const actor of new Set([...actors,a.keepers[team]])){
    if(actor===kicker||actor===keeper)continue
    const waitingKeeper=actor===a.keepers[team]
    const z=waitingKeeper?7:(team===0?-1:1)*(3.8+1.28*slot++)
    actor.sprite.position.set(waitingKeeper?21:0,0,z)
    watchers.push({actor,heading:Math.atan2(-z,21-actor.sprite.position.x)})
   }
  }
  kicker.sprite.position.set(13.5,0,.15);keeper.sprite.position.set(keeperLineX,0,0)
  p.set(15,.16,0);a.ball.visible=true;a.ball.scale.setScalar(.36)
  curveRate=0;phase='ready';age=0;dive=-1;dir=0;extension=0;pose='ready';z=0;y=.9;aimReturnAge=-1;power=0;charging=false;held=shotHeld=keeperHeld=true;hitFrame=false;readyTime=0;readyPhase=0;readyChoice=Math.random()<.5?0:1
  reticleHidden=false;reticleOpacity=1;reticle.material.opacity=1;updateLegend()
  wait=1.6+Math.random()*.8-a.level*.12
  if(!shooting&&keeper.displayName==='Sean')wait+=3
  reaction=.23-a.level*.038+Math.random()*.07
  meter.hidden=!shooting;setPower(0);end.hidden=true;board()
  status.textContent=''
  panel.querySelector('[data-key="Space"]')!.textContent=shooting?'Kick':'Dive'
  audio.state(false,true);audio.play('whistle',.45)
 }
 function commit(direction:number){dir=Math.abs(direction)<.22?0:Math.sign(direction);origin=keeper.sprite.position.z;dive=0}
 function resolve(outcome:Outcome){
  kicks.push({side,outcome,kicker:kicker.displayName,keeper:keeper.displayName});board();phase='result';age=0
  status.textContent=outcome==='Goal'?'GOAL!':outcome==='Save'?'SAVED!':outcome==='Woodwork'?'OFF THE FRAME!':'MISS!'
  if(outcome==='Goal'){
   pose='concede';audio.goalFire();goalTime=recordTime;sample()
   cut=0;cutAge=0;goalVelocity.copy(velocity).multiplyScalar(.55);meter.hidden=true;reticle.visible=false;skip.hidden=false;a.fire(0,side)
  }
  else{
   audio.nearGoal()
   if(outcome==='Save'){goalTime=recordTime;pose='saveContact';audio.play('post',.85)}
  }
 }
 function actions(){
  const s=state();phase='end';end.hidden=false;end.replaceChildren()
  const title=document.createElement('strong');title.textContent=a.names[s.winner!]+' wins!';end.append(title)
  const score=document.createElement('p');score.textContent='Shootout complete · Penalties '+s.score.join(' – ');end.append(score)
  audio.menu('success');audio.play('cheer',1)
  const nav=document.createElement('nav');end.append(nav)
  const button=(label:string,act:()=>void)=>{const b=document.createElement('button');b.textContent=label;b.onclick=act;nav.append(b)}
  if(a.test){
   const restart=(swap:boolean)=>{if(swap)human=human===0?1:0;first=human;kicks=[];begin()}
   button('Play again',()=>restart(false));button('Switch sides',()=>restart(true))
   button('Back to menu',()=>{history.replaceState({...history.state,arcadeMenu:true},'');location.reload()})
  }else button('Continue',()=>{
   for(const sheet of Object.values(keeperKit))sheet.dispose();events.abort();restoreBug();panel.remove();root.classList.remove('pk-active');a.scene.remove(spot,reticle)
   for(const mesh of [spot,reticle]){mesh.geometry.dispose();mesh.material.dispose()}
   a.finish(kicks)
  })
  end.querySelector('button')?.focus()
 }
 function launch(){
  phase='flight';age=0
  const rating=a.rating(kicker,false),error=.09+(100-rating)*.006+(100-kicker.staminaCapacity)*.002+power*power*.33
  const duration=.70-.34*power
  velocity.set(6/duration,(y+(Math.random()-.5)*error-.16)/duration+2*duration,(z+(Math.random()-.5)*error)/duration)
  audio.state(false,false);audio.kick(power)
 }
 function physics(dt:number){
  if(curveRate&&!hitFrame){
   const angle=curveRate*dt,c=Math.cos(angle),s=Math.sin(angle)
   const forward=velocity.x*c-velocity.z*s
   velocity.z=velocity.x*s+velocity.z*c;velocity.x=forward
   curveRate*=Math.exp(-1.25*dt)
  }
  const prior=p.x;p.addScaledVector(velocity,dt);velocity.y-=4*dt
  if(p.y<.13){p.y=.13;velocity.y=Math.abs(velocity.y)*.3}
  const reach=a.rating(keeper,true)/100
  if(prior<=keeperLineX&&p.x>=keeperLineX){
   const lateral=(p.z-keeper.sprite.position.z)/(.30+.16*reach+.20*extension)
   const vertical=(p.y-(.76+keeper.sprite.position.y))/(.79+.12*reach)
   if(lateral*lateral+vertical*vertical<=1){velocity.x*=-.27;velocity.z+=dir*2;resolve('Save');return}
  }
  if(!hitFrame&&p.x>=20.86&&p.x<21.15){
   const post=Math.abs(Math.abs(p.z)-2)<.15&&p.y<=2.12
   const bar=Math.abs(p.y-2)<.15&&Math.abs(p.z)<=2.12
   if(post||bar){
    hitFrame=true;audio.play(bar?'bar':'post',.85)
    const offset=bar?p.y-2:Math.abs(p.z)-2
    velocity.x*=offset<-.055?.42:-.42
    if(bar)velocity.y=Math.sign(offset)*3;else velocity.z=Math.sign(p.z)*Math.sign(offset)*4
    if(velocity.x<0){resolve('Woodwork');return}
   }
  }
  if(p.x>=21.15){
   if(Math.abs(p.z)<1.92&&p.y<1.94){resolve('Goal');velocity.multiplyScalar(.55)}
   else resolve(hitFrame?'Woodwork':'Wide')
  }
 }
 function tick(now:number){
  if(!panel.isConnected)return
  const dt=Math.min(.04,(now-last)/1000);last=now
  const padFor=(team:Side)=>{const device=a.controllers?.[team];return device===undefined?menuPad():device===null||device<0?undefined:navigator.getGamepads?.()[device]??undefined}
  const pad=padFor(side),defendPad=padFor((1-side) as Side),menu=menuPad(),pressed=(i:number)=>!!(pad?.buttons[i]?.pressed||defendPad?.buttons[i]?.pressed||menu?.buttons[i]?.pressed)
  const axis=(v:number)=>Math.abs(v)>.17?v:0
  const pauseDown=pressed(9),pauseEdge=pauseDown&&!pauseHeld;pauseHeld=pauseDown
  const hideDown=!!pad?.buttons[5]?.pressed
  if(!paused&&cut<0&&phase==='ready'&&shooting&&hideDown&&!hideHeld){reticleHidden=!reticleHidden;updateLegend()}
  hideHeld=hideDown
  if(pauseEdge)void openPause()
  if(paused){last=now;requestAnimationFrame(tick);return}
  if(a.test&&pressed(11)&&!r3Held)toggleFlight()
  r3Held=pressed(11)
  if(flying){
   const keyAxis=(positive:string,negative:string)=>Number(keys.has(positive))-Number(keys.has(negative))
   cameraAngles.y-=(axis(pad?.axes[2]??0)+keyAxis('ArrowRight','ArrowLeft'))*dt*2
   cameraAngles.x=clamp(cameraAngles.x+(keyAxis('ArrowUp','ArrowDown')-axis(pad?.axes[3]??0))*dt*2,-1.55,1.55)
   a.camera.quaternion.setFromEuler(cameraAngles)
   move.set(keyAxis('KeyD','KeyA')+axis(pad?.axes[0]??0),0,keyAxis('KeyS','KeyW')+axis(pad?.axes[1]??0)).applyQuaternion(a.camera.quaternion)
   move.y+=keyAxis('KeyE','KeyQ')+Number(pressed(5))-Number(pressed(4))
   move.clampLength(0,1)
   a.camera.position.addScaledVector(move,dt*(keys.has('ShiftLeft')||keys.has('ShiftRight')?20:6))
   renderArena(0);requestAnimationFrame(tick);return
  }
  const skipDown=pressed(0)
  const skipEdge=skipDown&&!skipHeld;skipHeld=skipDown
  if(cut>=0){
   if(skipEdge)advanceCut();else playCut(dt)
   renderArena(dt);requestAnimationFrame(tick);return
  }
  age+=dt;time+=dt
  if(phase==='run'||phase==='flight')recordTime+=dt
  const axisFor=(team:Side,p:Gamepad|undefined,left:number,right:number,upButton:number,downButton:number)=>{
   const keyboard=!a.controllers||a.controllers[team]===-1
   const button=(index:number)=>!!p?.buttons[index]?.pressed
   const rightHeld=(keyboard&&(keys.has('ArrowRight')||keys.has('KeyD')))||button(right)
   const leftHeld=(keyboard&&(keys.has('ArrowLeft')||keys.has('KeyA')))||button(left)
   const upHeld=(keyboard&&(keys.has('ArrowUp')||keys.has('KeyW')))||button(upButton)
   const downHeld=(keyboard&&(keys.has('ArrowDown')||keys.has('KeyS')))||button(downButton)
   const kickHeld=(keyboard&&(keys.has('Space')||keys.has('KeyK')||keys.has('KeyB')))||button(1)
   return [clamp(Number(rightHeld)-Number(leftHeld)+axis(p?.axes[0]??0),-1,1),clamp(Number(upHeld)-Number(downHeld)-axis(p?.axes[1]??0),-1,1),kickHeld] as const
  }
  const [x,up,down]=axisFor(side,pad,14,15,12,13)
  const [keeperX,,keeperDown]=axisFor((1-side) as Side,defendPad,14,15,12,13)
  if(phase==='end'){
   const buttons=Array.from(end.querySelectorAll('button')),idx=buttons.indexOf(document.activeElement as HTMLButtonElement)
   const nav=pressed(14)||pressed(15)||pressed(0)
   if(nav&&!held){if(pressed(0))buttons[Math.max(0,idx)]?.click();else buttons[(idx+(pressed(15)?1:-1)+buttons.length)%buttons.length]?.focus()}
   held=nav
  }else{
   if(phase==='ready'&&shooting){
    if(down&&!shotHeld){
     charging=true;curveGesture.reset(0);aimStartZ=z;aimStartY=y
    }
    if(charging&&down)curveGesture.sample(x,-up,now)
    if(charging&&curveGesture.engaged){z=aimStartZ;y=aimStartY;aimReturnAge=-1}
    else if(Math.hypot(x,up)>.17){
     aimReturnAge=-1
     z=clamp(z+x*dt*2.4,-2.7,2.7);y=clamp(y+up*dt*1.9,.13,2.65)
    }else{
     if(aimReturnAge<0){aimReturnAge=0;aimReturnZ=z;aimReturnY=y}
     aimReturnAge=Math.min(1,aimReturnAge+dt)
     z=T.MathUtils.lerp(aimReturnZ,0,aimReturnAge)
     y=T.MathUtils.lerp(aimReturnY,.9,aimReturnAge)
     if(charging){aimStartZ=z;aimStartY=y}
    }
    if(charging){power=clamp(power+dt*.88,.08,1);setPower(power)}
    const reticleRadius=.155*(1+1.8*power)
    z=clamp(z,-goalHalfWidth+reticleRadius,goalHalfWidth-reticleRadius)
    y=clamp(y,.13+reticleRadius,goalHeight-reticleRadius)
    if(charging&&!down){
     const strike=curveGesture.finish(false)
     curveRate=strike?.rate??0
     if(strike)status.textContent=strike.style
     phase='run';age=0;charging=false
    }
   }else if(phase==='ready'&&age>wait){
    const spread=1.25-a.level*.17
    const lane=Math.floor(Math.random()*3)-1
    z=lane===0?(Math.random()-.5)*.45:lane*(1.62+(Math.random()-.5)*spread)
    y=.2+Math.random()*(2.1-a.level*.08);power=.45+Math.random()*.48+a.level*.02;phase='run';age=0
   }
   if(defending&&dive<0&&phase!=='result'){
    keeper.sprite.position.z=clamp(keeper.sprite.position.z-keeperX*dt*2.6,-1.9,1.9)
    pose=keeperX<0?'shuffleLeft':keeperX>0?'shuffleRight':'ready'
    if(keeperDown&&!keeperHeld)commit(-keeperX)
   }
   if(phase==='flight'&&!defending&&age>=reaction&&dive<0){
    // Pick left, center, or right without reading the shot trajectory.
    // Reaction time and keeper rating still determine whether the guess reaches the ball.
    commit(Math.floor(Math.random()*3)-1)
   }
   if(dive>=0){
    dive+=dt
    if(dive>=diveDuration){
     // The last frames stand the keeper up; a fresh button press can start another dive.
     dive=-1;dir=0;extension=0;keeper.sprite.position.y=0
     keeper.sprite.position.z=clamp(keeper.sprite.position.z,-1.9,1.9)
     if(phase!=='result')pose='ready'
    }else{
     extension=Math.sin(Math.PI*clamp(dive/(.76+a.level*.015),0,1))
     const lateralDive=dir!==0
     // The feet touch down on frame 12. Keep horizontal travel separate from lift.
     const flight=clamp(dive/(diveDuration*11/17),0,1)
     const travel=lateralDive?1-(1-flight)**2:extension
     keeper.sprite.position.z=origin+dir*travel*(1.33+.45*a.rating(keeper,true)/100)
     keeper.sprite.position.y=lateralDive?4*flight*(1-flight)*.29:extension*(dir?.29:.12)
     if(phase!=='result')pose=dive>.58?'recovery':dir<0?'diveLeft':dir>0?'diveRight':'centerBlock'
    }
   }
   if(phase==='run'){
    kicker.sprite.position.x=13.5+1.24*Math.min(1,age/.50)
    if(age>=.62)launch()
   }
   if(phase==='flight'){
    for(let remain=dt;remain>.000001&&phase==='flight';remain-=1/240)physics(Math.min(remain,1/240))
   }else if(phase==='result'){
    if(age<.65){
     p.addScaledVector(velocity,dt);velocity.y-=7*dt;p.y=Math.max(.13,p.y)
     if(kicks.at(-1)?.outcome==='Goal'&&velocity.x>0&&p.x>=22.05){a.net(p,power);velocity.set(-.55,-.4,0)}
    }
    if(kicks.at(-1)?.outcome==='Save'&&age>=.65){
     a.dissolve();cut=2;cutAge=0;meter.hidden=true;skip.hidden=false
    }else if(age>1.5){if(state().winner!==null)actions();else begin()}
   }
   held=down;shotHeld=down;keeperHeld=keeperDown
  }
  const face=shooting?4:0
  if(phase==='run'&&age<.5)frame(kicker,1,Math.floor(age*14),face)
  else if(phase==='run'||phase==='flight'&&age<.18)frame(kicker,2,phase==='run'?Math.min(3,Math.floor((age-.5)*25)):Math.min(6,4+Math.floor(age*15)),faceFor(1,0))
  else frame(kicker,0,face,0)
  keeperPose(keeper,pose,shooting?0:4,time)
  keeper.sprite.center.x=.5
  if(keeper.displayName==='Sean'&&pose==='ready'&&phase==='ready') {
   readyTime+=dt
   const cycle=readyTime-readyPhase
   if(cycle>=2.8){readyPhase=readyTime;readyChoice=Math.random()<.5?0:1}
   const active=cycle<1.8
   const sheet=readyChoice===0?(shooting?keeperKit.seanRhythmSouth:keeperKit.seanRhythmNorth):(shooting?keeperKit.seanBounceSouth:keeperKit.seanBounceNorth)
   if(active&&sheet.image){
    const column=Math.min(8,Math.floor(cycle/.2))
    sheet.offset.x=column/9;keeper.sprite.material.map=sheet
    keeper.sprite.scale.setScalar(1.7*68/48)
    keeper.sprite.center.set(.5,spriteGroundPadding(sheet.image,9,1,0,column,true)/68)
   }
  }else if(!keeper.maps[0].userData.seanKeeper&&!keeper.maps[0].userData.keeperName&&!shooting&&pose==='ready'&&phase==='ready'){
   const readySheet=keeperKit.ready
   readyTime+=dt
   const frameTime=readyTime%3
   if(readyTime>=3&&frameTime<1.8&&readySheet.image){
    readySheet.offset.x=Math.floor(frameTime/.2)/9
    keeper.sprite.material.map=readySheet
    keeper.sprite.scale.x=keeper.sprite.scale.y*56/48
   }else keeper.sprite.scale.x=keeper.sprite.scale.y
  }else{readyTime=0;keeper.sprite.scale.x=keeper.sprite.scale.y}
  showDive(keeper,dive,dir)
  if(phase==='result'&&kicks.at(-1)?.outcome==='Save'){recordTime=goalTime+age;sample()}
  else if(phase==='run'||phase==='flight')sample()
  if(shooting&&phase==='ready')reticleOpacity=clamp(reticleOpacity+(reticleHidden?-1:1)*dt/.6,0,1)
  else reticleOpacity=0
  reticle.material.opacity=reticleOpacity
  reticle.visible=shooting&&phase==='ready'&&reticleOpacity>0;reticle.position.set(20.92,y,z);reticle.scale.setScalar(1+1.8*power)
  legend.hidden=phase!=='ready'||(!shooting&&!defending)
  const duel=!!a.controllers?.every(device=>device!==null)
  const straightOn=duel||shooting
  cam.set(straightOn?10:25.3,straightOn?3.6:4.6,0);target.set(straightOn?20:16,.85,0)
  const blend=1-Math.exp(-dt*9);a.camera.position.lerp(cam,blend);look.lerp(target,blend);a.camera.lookAt(look)
  a.camera.fov=37;a.camera.updateProjectionMatrix();renderArena(dt);requestAnimationFrame(tick)
 }
 begin()
 if(a.test){
  end.hidden=false;phase='end';end.innerHTML='<strong>Penalty Shootout Test</strong><label>First taker <select></select></label><label>First kick <select><option>Take the kick</option><option>Defend</option></select></label><button>Start shootout</button>'
  const [takers,start]=end.querySelectorAll('select')
  for(const actor of a.teams[0])takers.add(new Option(actor.displayName))
  end.querySelector('button')!.onclick=()=>{orderOffset[0]=takers.selectedIndex;first=start.selectedIndex as Side;begin()}
  end.querySelector('button')!.focus()
 }
 requestAnimationFrame(tick)
}
