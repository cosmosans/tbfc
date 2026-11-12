import starsCrest from './art/ground/shooting-stars.png?inline'
import danielIdle from './art/daniel-idle.png?inline'
import danielRun from './art/daniel-run.png?inline'
import danielKick from './art/daniel-side-kicks.png?inline'
import {defaultSettings} from './matchSettings'
import clubCrest from './art/ground/crest.png?inline'
import stevenIdle from './art/steven-idle.png?inline'
import stevenRun from './art/steven-run.png?inline'
import stevenKick from './art/steven-side-kicks.png?inline'
import joseIdle from './art/jose-idle.png?inline'
import joseRun from './art/jose-run.png?inline'
import joseKick from './art/jose-side-kicks.png?inline'
import {selectLineup, positions} from './lineup'
import janIdle from './art/jan-idle.png?inline'
import janRun from './art/jan-run.png?inline'
import janKick from './art/jan-side-kicks.png?inline'
import { MatchAudio } from './matchAudio'
import cardSheet from './art/ref-yellow-card.png?inline'
import stubbsKick from './art/stubbs-side-kicks.png?inline'
import mandyKick from './art/mandy-side-kicks.png?inline'
import jeremyKick from './art/jeremy-side-kicks.png?inline'
import seanKick from './art/sean-side-kicks.png?inline'
import blueKick from './art/stars-side-kicks.png?inline'
import tealKick from './art/teal-side-kicks.png?inline'
import tealIdle from './art/teal-idle.png?inline'
import mandyIdle from './art/mandy-idle.png?inline'
import mandyRun from './art/mandy-run.png?inline'
import jeremyIdle from './art/jeremy-idle.png?inline'
import jeremyRun from './art/jeremy-run.png?inline'
import seanIdle from './art/sean-idle.png?inline'
import seanRun from './art/sean-run.png?inline'
import { GoalReplay, strikerView, frameAction, cinematicPlayerSize, cinematicBallSize } from './replay'
import refereeIdle from './art/ref-idle.png?inline'
import refereeRun from './art/ref-run.png?inline'
import { advanceOutBall } from './perimeter'
import pamSideKicks from './art/pam-side-kicks.png?inline'
import chrisSideKicks from './art/chris-side-kicks.png?inline'
import meghanKick from './art/meghan-kick-preview.png?inline'
import awayKeeperEnd from './art/keeper-end.png?inline'
import stubbsIdle from './art/stubbs-idle.png?inline'
import stubbsRun from './art/stubbs-run.png?inline'
import { buildGrounds } from './grounds'
import { createGoal } from './goal'
import keeperImage from './art/practice-keeper.png?inline'
import { planShot, shotFeedback } from './shooting'
import ballSheet from './art/ball-spin.png?inline'
import { kickArc, heightAt } from './ballArc'
import upheavalUrl from './fonts/upheavtt.ttf?inline'
import * as T from 'three'
import pam_idle from './art/pam-idle.png?inline'
import pam_run from './art/pam-run.png?inline'

import blueIdle from './art/stars-idle.png?inline'
import blueRun from './art/stars-run.png?inline'
import chris_idle from './art/chris-idle.png?inline'
import chris_run from './art/chris-run.png?inline'
import meghan_idle from './art/meghan-pixellab-idle.png?inline'
import meghan_run from './art/meghan-pixellab-run.png?inline'
const hudFont = new FontFace('Upheaval', 'url(' + upheavalUrl + ')')
document.fonts.add(hudFont)
void hudFont.load()

const el=(id:string)=>document.getElementById(id)!
async function start(){
 const kits:Record<string,[string,string,string]>={Meghan:[meghan_idle,meghan_run,meghanKick],Pam:[pam_idle,pam_run,pamSideKicks],Jan:[janIdle,janRun,janKick],Mandy:[mandyIdle,mandyRun,mandyKick],Jeremy:[jeremyIdle,jeremyRun,jeremyKick],Chris:[chris_idle,chris_run,chrisSideKicks],Sean:[seanIdle,seanRun,seanKick],Stubbs:[stubbsIdle,stubbsRun,stubbsKick],José:[joseIdle,joseRun,joseKick],Steven:[stevenIdle,stevenRun,stevenKick],Daniel:[danielIdle,danielRun,danielKick]}
 const portraits=Object.fromEntries(Object.entries(kits).map(([name,kit])=>[name,kit[0]]))
 const settings=defaultSettings()
 const lineup=await selectLineup(portraits,undefined,settings)
 const homeShape=positions(lineup.shape)
 const renderer=new T.WebGLRenderer({canvas:document.querySelector('canvas')!,antialias:true})
 const scene=new T.Scene(); scene.background=new T.Color(0x284b37)
 const camera=new T.PerspectiveCamera(strikerView.fov,1,.1,140)
 const distance=Math.hypot(strikerView.along,strikerView.side)
 const views=[
  {...strikerView,label:'End to end',end:true,along:-distance,side:0},
  {...strikerView,label:'Sideline',end:false,along:0,side:distance}
 ]
 let viewIndex=0
 let view=views[0]
 const screenPoint=new T.Vector3()
 const screenUp=new T.Vector3(0,1,0)
 const sprintSeconds=2, rechargeSeconds=8, capacityLossPerSecond=2.1, exhaustedLossPerSecond=10
 const kickPoseTimes=[0,.035,.065,.095,.12,.19,.30]
 const sprintCadence=1.2
 const fieldX=21,fieldZ=12
 function box(x:number,y:number,z:number,w:number,h:number,d:number,color:number){
  const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshBasicMaterial({color}))
  mesh.position.set(x,y,z);scene.add(mesh);return mesh
 }
 const updateWeather=await buildGrounds(scene,renderer,settings)
 const lines=0xb8d9b1
 for(const z of [-fieldZ,fieldZ])box(0,.01,z,42,.02,.07,lines)
 for(const x of [-fieldX,0,fieldX])box(x,.01,0,.07,.02,24,lines)
 for(const sign of [-1,1]){
  for(const z of [-4.6,4.6])box(sign*18.8,.02,z,4.4,.02,.07,lines)
  box(sign*16.6,.02,0,.07,.02,9.2,lines)
  if(sign===1)box(fieldX,.025,0,.12,.02,4,0xffebad)
 }
 const homeGoal=createGoal(scene,-fieldX)
 const attackingGoal=createGoal(scene,fieldX)
 let aerial:{index:number,style:string,age:number}|null=null
 let shotDirection=1
 let netTravel=false
 const circle=new T.Mesh(new T.RingGeometry(2.9,2.97,64),new T.MeshBasicMaterial({color:lines,side:T.DoubleSide}));circle.rotation.x=-Math.PI/2;circle.position.y=.035;scene.add(circle)
 async function createPlayer(name:string, displayName:string, urls:string[], runRows=8, frameSeconds=0, westKickRow=3){
  const maps=await Promise.all(urls.map(async url=>{
  const tex=await new T.TextureLoader().loadAsync(url);tex.magFilter=tex.minFilter=T.NearestFilter;tex.generateMipmaps=false;tex.colorSpace=T.SRGBColorSpace;return tex
 }))

  const shirt=new T.SpriteMaterial({map:maps[0],transparent:true,depthWrite:false})
  const sprite=new T.Sprite(shirt);sprite.center.set(.5,2/48);sprite.scale.setScalar(2.5);scene.add(sprite)
  const runFrames=maps[1]?maps[1].image.width/(maps[1].image.height/runRows):1
  return {name,displayName,sprintCharge:100,staminaCapacity:100,sprintTime:0,sprite,maps,westKickRow,lastSideFace:2,runFrames,runRows,frameSeconds,runClock:0,world:new T.Vector3(),face:2,drawFace:2,turnCandidate:2,turnTime:0,lateChallenges:0,penalty:0,age:-1,tackling:false,shooting:false,travel:0,moving:false,goal:new T.Vector3(),velocity:new T.Vector3()}
 }
 const crossingDrill=false
 let attackSign=1,half=1,matchSeconds=0,homeScore=0,awayScore=0
 let phase:'kickoff'|'freeKick'|'play'|'halftime'|'fulltime'='kickoff'
 let centerPass=false
 let kickoffBlue=false,breakSeconds=0,lastBlue=false
 const scoreboard=el('scoreboard')
 ;(el('awayCrest') as HTMLImageElement).src=starsCrest
 ;(el('bugCrest') as HTMLImageElement).src=clubCrest
 function updateScore(){
  const seconds=Math.min(1500,Math.floor(matchSeconds))
  const text='TBFC '+homeScore+' – '+awayScore+' SHOOTING STARS FC  ·  '+(phase==='fulltime'?'FT':phase==='halftime'?'HT':half+'H')+'  '+Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0')
  if(scoreboard.getAttribute('aria-label')===text)return
  scoreboard.setAttribute('aria-label',text);scoreboard.title=text
  el('homeGoals').textContent=String(homeScore);el('awayGoals').textContent=String(awayScore)
  el('bugPeriod').textContent=phase==='fulltime'?'FT':phase==='halftime'?'HT':half===1?'1ST':'2ND'
  el('bugClock').textContent=Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0')
 }
 const labels:Record<string,string>={Meghan:'#6 Meghan Wahlstrom',Pam:'#8 Pam Williams',Stubbs:'#12 STUBBS'}
 const makeBurner=(name:string)=>createPlayer(labels[name]??name,name,kits[name],8,name==='Sean'?.14:.2,name==='Meghan'?3:1)
 const players=await Promise.all(lineup.starters.slice(0,6).map(makeBurner))
 const lanes=[-10,0,10,-7,0,7]
 const opponents=await Promise.all((crossingDrill?[]:lanes).map((_,i)=>createPlayer('Stars '+(i+1),'Shooting Stars FC',[blueIdle,blueRun,blueKick],8,.2,1)))
 const outfield=[...players,...opponents]
 const referee=await createPlayer('Referee','Referee',[refereeIdle,refereeRun],8,.16)
 const sean=await makeBurner(lineup.starters[6])
 const homeSlots=[...players,sean]
 const reserves=await Promise.all(lineup.bench.map(makeBurner))
 reserves.forEach(m=>scene.remove(m.sprite))
 const matchBench=lineup.bench.slice()
 // Keep the pitch slot, ball action and replay sprite stable; identity and fitness travel together.
 const identity=(m:typeof sean)=>({name:m.name,displayName:m.displayName,maps:m.maps,westKickRow:m.westKickRow,
  runFrames:m.runFrames,runRows:m.runRows,frameSeconds:m.frameSeconds,sprintCharge:m.sprintCharge,
  staminaCapacity:m.staminaCapacity,lateChallenges:m.lateChallenges,penalty:m.penalty})
 const squad=new Map([...homeSlots,...reserves].map(m=>[m.displayName,identity(m)]))
 function applyTeam(starters:string[],bench:string[]){
  for(const m of homeSlots)squad.set(m.displayName,identity(m))
  for(const [i,name] of starters.entries()){
   const slot=homeSlots[i]
   if(slot.displayName===name)continue
   Object.assign(slot,squad.get(name));slot.sprite.name=name;slot.sprite.material.map=slot.maps[0]
  }
  matchBench.splice(0,matchBench.length,...bench)
 }
 let squadOpen=false
 const awayGK=await createPlayer('Stars keeper','Stars keeper',[tealIdle,blueRun,tealKick],8,.2,1)
 const pitchActors=[...outfield,referee,sean,awayGK]
 let blueCarrier=-1,pressTime=0,pressing=-1,turnoverGrace=0,noticeTime=0
 // Z lanes stay distinct as the block slides toward the ball.

 let bluePass:{receiver:number,start:T.Vector3,end:T.Vector3,age:number,duration:number,loft?:number}|null=null
 let blueDecisionTime=0
 let dribbleSide=1
 const previousPassPosition=new T.Vector3()
 const keeperHomeX=fieldX-1.4
 const keeper=awayGK.sprite
 keeper.position.x=keeperHomeX
 const homeKeeper=sean.sprite
 homeKeeper.position.x=-keeperHomeX
 keeper.name="Stars keeper";homeKeeper.name=sean.displayName
 const keepers=[keeper,homeKeeper]
 keeper.visible=!crossingDrill
 const drillKeeper=keeper
 // A soft contact shadow grounds each billboard while its artwork stays unlit.
 const shadowCanvas=document.createElement('canvas')
 shadowCanvas.width=shadowCanvas.height=64
 const paint=shadowCanvas.getContext('2d')!
 const fade=paint.createRadialGradient(32,32,0,32,32,31)
 fade.addColorStop(0,'rgba(18,26,17,.48)');fade.addColorStop(1,'rgba(18,26,17,0)')
 paint.fillStyle=fade;paint.fillRect(0,0,64,64)
 const contactMaterial=new T.MeshBasicMaterial({map:new T.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false})
 const footprint=new T.PlaneGeometry(1.8,1.05)
 const contactShadows=pitchActors.map(p=>p.sprite).filter(sprite=>sprite.visible).map(sprite=>{
  const mesh=new T.Mesh(footprint,contactMaterial)
  mesh.rotation.x=-Math.PI/2;mesh.renderOrder=-1;scene.add(mesh)
  return {mesh,sprite}
 })
 let shot:ReturnType<typeof planShot>|null=null
 const shotStart=new T.Vector3()
 const switchButton=el('switchPlayer') as HTMLButtonElement
 let reboundRunner=-1
 let reboundVY=0
 let outBall:{remaining:number,goalEnd:number,spot:T.Vector3,blueRestart:boolean,corner:boolean}|null=null
 const outVelocity=new T.Vector3()
 function ballOut(dx:number,dy:number,dz:number,miss?:'Wide'|'Over'){
  const goalEnd=Math.abs(ball.position.x)>fieldX?Math.sign(ball.position.x):0
  const corner=!!goalEnd&&(goalEnd===attackSign?lastBlue:!lastBlue)
  outBall={remaining:.95,goalEnd,spot:ball.position.clone(),blueRestart:!lastBlue,corner}
  outVelocity.set(dx,dy,dz)
  cancelCharge();endFollowUpRuns()
  inFlight=false;held=false;windupReceiver=-1;blueCarrier=-1;bluePass=null;lastSender=-1;noticeTime=0
  el('shotResult').textContent=goalEnd?(corner?'CORNER':miss?miss.toUpperCase()+' · GOAL KICK':'GOAL KICK'):'OUT OF TOUCH'
 }
 let keeperRestart:{age:number,start:T.Vector3,end:T.Vector3,punt?:boolean,blueBuild?:boolean}|null=null
 let struckLoose=false,afterChallenge=-Infinity,suppressTap=false
 let clearanceLoose=false
 let keeperStartX=keeperHomeX
 let keeperStart=0,resultTime=0,ballPlayer=0
 const playerScale=1
 const ballOffsetX=.77*playerScale,ballOffsetZ=.52*playerScale
 const ring=new T.Mesh(new T.RingGeometry(.48*playerScale,.58*playerScale,32),new T.MeshBasicMaterial({color:0xffce58,side:T.DoubleSide}))
 ring.rotation.x=-Math.PI/2;scene.add(ring)
 const spinFrames=32
 const ballMap=await new T.TextureLoader().loadAsync(ballSheet)
 ballMap.magFilter=ballMap.minFilter=T.NearestFilter
 ballMap.generateMipmaps=false
 ballMap.colorSpace=T.SRGBColorSpace
 ballMap.repeat.set(1/spinFrames,1/4)
 const ball=new T.Sprite(new T.SpriteMaterial({map:ballMap,transparent:true,depthWrite:false}))
 ball.center.set(.5,.22)
 scene.add(ball)
 const replay=new GoalReplay([...pitchActors.map(m=>m.sprite),ball],ball,pitchActors,fieldX)
 let celebrating=false
 const goalBanner=el('goalBanner'),replayPanel=el('replayPanel')
 function clearReplay(){
  replay.clear();celebrating=false
  goalBanner.hidden=replayPanel.hidden=true
  ring.visible=true;nameplate.hidden=true
  switchButton.disabled=false
  homeGoal.poseAt(Infinity);attackingGoal.poseAt(Infinity)
 }
 const lastBallPosition=new T.Vector3()
 let spinPhase=0
 function updateSpin(){
  const dx=ball.position.x-lastBallPosition.x,dz=ball.position.z-lastBallPosition.z
  lastBallPosition.copy(ball.position)
  const distance=Math.hypot(dx,dz)
  if(distance<.00001)return
  const direction=(Math.round(Math.atan2(-dz,dx)/(Math.PI/4))+8+screenRotation())%8
  const sign=direction<4?1:-1
  spinPhase=T.MathUtils.euclideanModulo(spinPhase+sign*distance/(Math.PI*ball.scale.x),1)
  ballMap.offset.set(Math.floor(spinPhase*spinFrames)/spinFrames,(3-direction%4)/4)
 }
 const shadow=new T.Mesh(new T.CircleGeometry(.29,16),new T.MeshBasicMaterial({color:0x203b2d}))
 shadow.rotation.x=-Math.PI/2
 scene.add(shadow)
 const dirs=[[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1],[-1,0],[-1,1]].map(([x,z])=>[x/Math.hypot(x,z),z/Math.hypot(x,z)]),keys=new Set<string>()
 let active=0,held=true,inFlight=false,paused=false,vx=0,vz=0,axisX=0,axisZ=0,joy:number|null=null,lastPause=false
 let lastSender=-1,passTime=0,passDuration=.5,shotMultiplier=1
 const restingHeight=.18
 let arc=kickArc(1),shotTime=0
 const passStart=new T.Vector3()
 const camTarget=new T.Vector3()
 type PassKind='pass'|'cross'|'through'
 type Action=PassKind|'shot'
 let windupReceiver=-1
 let passPower=.4
 let passKind:PassKind='pass',crossLift=0
 const receiverLaunch=new T.Vector3(),passTarget=new T.Vector3(),assistOffset=new T.Vector3()
 const passHeading=new T.Vector3()
 const turfDeceleration=4
 let launchSpeed=0
 const faceActions:Action[]=['pass','shot','cross','through']
 const padHeld=faceActions.map(()=>false)
 let queued:{action:Action,power:number}|null=null
 let charge:{action:Action,source:string,start:number}|null=null
 let rushSource:string|null=null
 let puntHold:{source:string,start:number}|null=null
 let puntPower:number|null=null
 let keeperGather=0
 function cancelRush(){rushSource=null;puntHold=null;puntPower=null}
 function canRush(){
  return !paused&&!crossingDrill&&!held&&!inFlight&&!outBall&&!keeperRestart&&keeperGather<=0&&resultTime<=0&&
   (!shot||shotDirection!==attackSign)&&attackSign*ball.position.x<0
 }
 const nameplate=el('nameplate'),nameText=el('controlled'),energy=el('staminaFill'),capacity=el('staminaCapacity'),meter=el('meter'),fill=el('powerFill'),headScreen=new T.Vector3()
 function showPower(fraction:number){
  fill.style.transform='scaleX('+fraction+')'
  meter.hidden=charge===null&&queued===null
  meter.setAttribute('aria-valuenow',String(Math.round(fraction*100)))
 }
 function heldPower(start:number){return T.MathUtils.clamp((performance.now()-start)/1000,0,1)}
 let rollingPass=false
 function cancelCharge(){suppressTap=false;rollingPass=false;queued=null;charge=null;showPower(0)}
 function canChargeLooseShot(){
  return phase==='play'&&!paused&&!celebrating&&!held&&!inFlight&&blueCarrier<0&&!bluePass&&
   !outBall&&!keeperRestart&&keeperGather<=0&&resultTime<=0&&(!shot||shotDirection===attackSign)
 }
 function press(action:Action,source:string){
  audio.unlock()
  if(replay.cut>=0&&action==='pass'){
   if(!paused&&!replay.nextAngle())reset(shotDirection===attackSign)
   return
  }
  if(freeKick&&(freeKick.blue||freeKick.wait>0))return
  if(celebrating||replay.cut>=0||phase==='halftime'||phase==='fulltime'||phase==='kickoff'&&(kickoffBlue||action==='shot'))return
  if(!paused&&action==='through'&&!held&&!inFlight){rushSource=source;return}
  if(action==='shot'&&rushSource&&canRush()){
   if(!puntHold)puntHold={source,start:performance.now()}
   return
  }
  if(action==='shot'&&canTackle()&&!players[active].penalty){
   const defender=players[active]
   if(defender.age<0){
    const [x,z]=readAim(Array.from(navigator.getGamepads?.()??[]).find(Boolean))
    defender.face=Math.hypot(x,z)>.22?facing(x,z):facing(ball.position.x-defender.sprite.position.x,ball.position.z-defender.sprite.position.z,defender.face)
    defender.age=0;defender.tackling=true;defender.shooting=false
   }
   return
  }
  const looseShot=action==='shot'&&canChargeLooseShot()
  if(active!==ballPlayer&&!looseShot)return
  const incoming=inFlight||windupReceiver>=0||rollingPass||looseShot
  if(paused||(!incoming&&(!held||players[active].age>=0))||charge||queued!==null)return
  suppressTap=action==='shot'&&held&&!incoming&&performance.now()-afterChallenge<350
  charge={action,source,start:performance.now()}
  showPower(0)
 }
 function release(source:string){
  if(source===rushSource){cancelRush();return}
  if(source===puntHold?.source){puntPower=heldPower(puntHold.start);puntHold=null;return}
  if(!charge||charge.source!==source)return
  const fraction=heldPower(charge.start)
  const {action}=charge
  if(suppressTap&&fraction<.16){afterChallenge=performance.now();cancelCharge();return}
  if(inFlight||windupReceiver>=0||rollingPass||(action==='shot'&&canChargeLooseShot())){
   queued={action,power:fraction};charge=null
   showPower(fraction)
   return
  }
  cancelCharge()
  if(freeKick){
   if(action!=='shot'&&!players.some((m,i)=>i!==active&&!m.penalty))return
   kickSpot=freeKick.spot;freeKick=null;phase='play';turnoverGrace=.65
   el('shotResult').textContent=''
  }
  const multiplier=1+fraction
  if(action!=='shot')pass(multiplier,action)
  else{shotMultiplier=multiplier;kick()}
 }
 function facing(x:number,z:number,previous?:number){
  const angle=Math.atan2(x,z),sector=Math.PI/4
  if(previous!==undefined){
   if(x*x+z*z<.001)return previous
   const delta=angle-previous*sector
   if(Math.abs(Math.atan2(Math.sin(delta),Math.cos(delta)))<=sector*.65)return previous
  }
  return (Math.round(angle/sector)+8)%8
 }
 function carry(){
  if(kickSpot){ball.position.copy(kickSpot);return}
  if(centerPass){ball.position.set(0,restingHeight,0);return}
  const p=players[ballPlayer], [dx,dz]=dirs[p.face]
  ball.position.set(p.sprite.position.x+dx*ballOffsetX,restingHeight,p.sprite.position.z+dz*ballOffsetZ)
 }
 const avoidPlayers=[...outfield.map(actor=>actor.sprite),...keepers.filter(goalie=>goalie.visible)]
 const previousFeet=avoidPlayers.map(sprite=>sprite.position.clone())
 const steer=new T.Vector3()
 function updateReferee(dt:number){
  if(dt<=0)return
  const pos=referee.sprite.position
  // Trail on the far shoulder, moving toward the center when play reaches a boundary.
  const trailing=blueCarrier>=0||bluePass?-attackSign:attackSign
  const x=T.MathUtils.clamp(ball.position.x-trailing*4,-fieldX+2,fieldX-2)
  const z=T.MathUtils.clamp(ball.position.z*.72-3.8,-fieldZ+2,fieldZ-2)
  steer.set(x-pos.x,0,z-pos.z).multiplyScalar(1.6).clampLength(0,5.3)
  for(const [i,actor] of avoidPlayers.entries()){
   if(!actor.visible)continue
   const foot=actor.position,last=previousFeet[i]
   const lead=.32/dt
   const dx=pos.x-foot.x-T.MathUtils.clamp((foot.x-last.x)*lead,-1.7,1.7)
   const dz=pos.z-foot.z-T.MathUtils.clamp((foot.z-last.z)*lead,-1.7,1.7)
   const distance=Math.hypot(dx,dz)
   if(distance<3){
    const weight=(3-distance)*3.5/Math.max(.01,distance)
    steer.x+=dx*weight;steer.z+=dz*weight
   }
   last.copy(foot)
  }
  steer.clampLength(0,5.8)
  referee.velocity.lerp(steer,1-Math.exp(-9*dt))
  pos.addScaledVector(referee.velocity,dt)
  for(const actor of avoidPlayers){
   if(!actor.visible)continue
   const dx=pos.x-actor.position.x,dz=pos.z-actor.position.z,d=Math.hypot(dx,dz)
   if(d<1.25){
    pos.x=actor.position.x+(d?dx/d:1)*1.25
    pos.z=actor.position.z+(d?dz/d:0)*1.25
   }
  }
  pos.x=T.MathUtils.clamp(pos.x,-fieldX+.5,fieldX-.5);pos.z=T.MathUtils.clamp(pos.z,-fieldZ+.5,fieldZ-.5)
  referee.moving=referee.velocity.lengthSq()>.22
  referee.face=referee.moving?facing(referee.velocity.x,referee.velocity.z,referee.face):facing(ball.position.x-pos.x,ball.position.z-pos.z,referee.face)
  referee.runClock=referee.moving?referee.runClock+dt:0
 }
 let supportOwner=-1,runner=-1,runSide=1,supportTimer=0,returnRunTime=0
 function organizeAttack(dt:number){
  returnRunTime=Math.max(0,returnRunTime-dt)
  if(crossingDrill||!held||windupReceiver>=0||players[active].age>=0){
   supportOwner=-1
   return
  }
  const carrier=players[active].sprite.position
  if(supportOwner!==active){
   supportOwner=active;supportTimer=0
   const options=players.map((_,i)=>i).filter(i=>i!==active&&!players[i].penalty)
   if(!options.length)return
   runner=returnRunTime>0&&options.includes(lastSender)?lastSender:
    options.reduce((a,b)=>attackSign*(players[a].sprite.position.x-players[b].sprite.position.x)>=0?a:b)
   runSide=(players[runner].sprite.position.z>=carrier.z)?1:-1
   if(Math.abs(carrier.z)>7)runSide=carrier.z>0?-1:1
  }
  if(Math.abs(carrier.z)>6)runSide=carrier.z>0?-1:1
  supportTimer-=dt
  if(supportTimer>0)return
  supportTimer=.45
  for(const [i,mate] of players.entries()){
   if(mate.penalty||i===active||i===lastSender&&returnRunTime>0)continue
   if(homeShape[i].back&&i!==runner){
    mate.goal.set(attackSign*T.MathUtils.clamp(attackSign*carrier.x-(homeShape[i].lane===0?9:6),-18,homeShape[i].lane===0?1:7),0,homeShape[i].lane+carrier.z*.10)
    continue
   }
   const deep=i===runner,side=homeShape[i].lane===0?(deep?runSide:-runSide):Math.sign(homeShape[i].lane)
   let best=-Infinity,bestX=0,bestZ=0
   for(const ahead of deep?[7,9,11]:[-2,1,3]){
    for(const width of [8.3,9.5,10.5]){
     const x=T.MathUtils.clamp(carrier.x+attackSign*ahead,-19,19)
     let z=side*width
     if(Math.abs(carrier.z)>6){
      if(deep&&attackSign*carrier.x>7)z=side*(width-8)
      else if(!deep)z=carrier.z*.35+side*(width-9)
     }
     if(!deep&&homeShape[i].lane===0)z=carrier.z*.24
     const dx=x-carrier.x,dz=z-carrier.z,lengthSq=dx*dx+dz*dz
     let open=5,lane=4
     for(const o of opponents){
      if(o.penalty)continue
      const foot=o.sprite.position
      open=Math.min(open,Math.hypot(foot.x-x,foot.z-z))
      const t=T.MathUtils.clamp(((foot.x-carrier.x)*dx+(foot.z-carrier.z)*dz)/Math.max(.01,lengthSq),.12,1)
      lane=Math.min(lane,Math.hypot(foot.x-carrier.x-t*dx,foot.z-carrier.z-t*dz))
     }
     const score=open*.9+lane*(deep?.7:1.7)-.16*Math.abs(width-9.5)

     const value=score-.15*Math.hypot(x-mate.sprite.position.x,z-mate.sprite.position.z)
       -.22*Math.abs(ahead-(deep?9:1))-.12*Math.hypot(x-mate.goal.x,z-mate.goal.z)
       -Math.max(0,3-Math.sqrt(lengthSq))*2
     if(value>best){best=value;bestX=x;bestZ=z}
    }
   }
   if(!homeShape[i].front&&!homeShape[i].back&&!deep){bestX=carrier.x-attackSign*2;bestZ=homeShape[i].lane*.8+carrier.z*.18}
   mate.goal.set(T.MathUtils.clamp(bestX,-19,19),0,bestZ)
  }
 }
 function reset(blue=false){
  afterChallenge=-Infinity;struckLoose=false;finishCard();clearReplay();freeKick=null;kickSpot=null
  recentHomeKicker=null;homeLateTime=0;sean.age=awayGK.age=-1;recentKicker=-1;lateTime=0;feedbackActor=null;callout.hidden=true;aerial=null;marks=null;centerPass=false;kickoffBlue=blue;phase='kickoff';breakSeconds=.9;lastBlue=blue
  supportOwner=-1;returnRunTime=0
  if(crossingDrill){
   active=0
   players[0].sprite.position.set(-10,0,1)
   players[0].face=6
   players[1].sprite.position.set(-16.6,0,.25)
   players[1].face=6
  }else{
   const forwards=homeShape.map((p,i)=>({p,i})).filter(({p,i})=>p.front&&!players[i].penalty)
   active=forwards.sort((a,b)=>Math.abs(a.p.lane)-Math.abs(b.p.lane))[0]?.i??Math.max(0,players.findIndex(m=>!m.penalty))
   homeShape.forEach(({depth,lane},i)=>players[i].sprite.position.set(depth*attackSign,0,lane))
   players[active].sprite.position.set(blue?-4*attackSign:0,0,0)
   for(const m of players)m.face=attackSign===1?2:6
  }
  cancelRush();keeperGather=0;outBall=null;windupReceiver=-1;keeperRestart=null;clearanceLoose=false
  bluePass=null;blueDecisionTime=0;blueCarrier=-1;pressTime=0;pressing=-1;turnoverGrace=.65;noticeTime=0
  const blueShape=lanes.map((z,i)=>[i>=3?12:i===1?(blue?0:4):6,z])
  opponents.forEach((o,i)=>{
   o.sprite.position.set(blueShape[i][0]*attackSign,0,blueShape[i][1])
   o.face=attackSign===1?6:2;o.goal.copy(o.sprite.position);o.moving=false
  })
  if(blue&&opponents[1]?.penalty){const i=opponents.findIndex(o=>!o.penalty);if(i>=0)opponents[i].sprite.position.set(0,0,0)}
  shotDirection=1;netTravel=false;reboundRunner=-1;cancelCharge();lastSender=-1;ballPlayer=active;shot=null;resultTime=0
  el('shotResult').textContent=''
  awayGK.face=attackSign===1?6:2
  keeper.position.set(attackSign*keeperHomeX,0,0);homeKeeper.position.set(-attackSign*keeperHomeX,0,0)
  for(const goalie of keepers)goalie.material.rotation=0
  const p=players[active];held=true;inFlight=false;vx=vz=0
  players.forEach(q=>{q.age=-1;q.goal.copy(q.sprite.position);q.velocity.set(0,0,0)})
  outfield.forEach(m=>{m.tackling=false;m.moving=false;m.sprintTime=0;m.runClock=0;m.age=-1})
  ball.position.set(0,restingHeight,0);lastBallPosition.copy(ball.position);camTarget.copy(ball.position)
  el('message').textContent=blue?'Shooting Stars kickoff':players[active].displayName+' · pass to kick off'
  nameText.textContent=players[active].displayName;ring.position.copy(players[active].sprite.position);ring.position.y=.045
  updateScore()
  referee.sprite.position.set(T.MathUtils.clamp(ball.position.x-attackSign*4,-fieldX+2,fieldX-2),0,
   T.MathUtils.clamp(ball.position.z*.72-3.8,-fieldZ+2,fieldZ-2))
  referee.velocity.set(0,0,0);referee.runClock=0;referee.moving=false
  avoidPlayers.forEach((sprite,i)=>previousFeet[i].copy(sprite.position))
 }
 function startFollowUpRuns(shooter:number){
  const nearSide=players[shooter].sprite.position.z>=0?1:-1
  const nearPost=new T.Vector3(attackSign*(fieldX-2.8),0,nearSide*1.4)
  let shortest=Infinity
  for(const [i,mate] of players.entries()){
   if(mate.penalty||i===shooter)continue
   const distance=mate.sprite.position.distanceToSquared(nearPost)
   if(distance<shortest){shortest=distance;reboundRunner=i}
  }
  let farPostFilled=false,trailers=0
  for(const [i,mate] of players.entries()){
   if(mate.penalty||i===shooter)continue
   if(i===reboundRunner)mate.goal.copy(nearPost)
   else if(!farPostFilled){mate.goal.set(attackSign*(fieldX-4.2),0,-nearSide*2.1);farPostFilled=true}
   else {
    mate.goal.set(attackSign*(fieldX-7-trailers*2),0,trailers===0?0:nearSide*3)
    trailers++
   }
  }
 }
 function endFollowUpRuns(){
  reboundRunner=-1
  for(const mate of players)mate.goal.copy(mate.sprite.position)
 }
 const lateTackleWindow=.35
 let recentHomeKicker:typeof sean|null=null,homeLateTime=0
 let recentKicker=-1,lateTime=0
 const callout=el('shotFeedback')
 let feedbackActor:typeof players[number]|null=null,feedbackTime=0
 const shotCounts=Array.from({length:3},()=>[0,0,0,0])
 let shotZone=0
 // Keep roster indices stable across a temporary dismissal.
 function nearestEligible(team:typeof players,spot:T.Vector3){
  let best=-1,distance=Infinity
  team.forEach((mate,i)=>{
   const d=mate.sprite.position.distanceToSquared(spot)
   if(!mate.penalty&&d<distance){best=i;distance=d}
  })
  return best
 }
 let freeKick:{spot:T.Vector3,blue:boolean,wait:number,taker:number}|null=null
 let kickSpot:T.Vector3|null=null
 const audio=new MatchAudio()
 const soundButton=el('sound') as HTMLButtonElement
 function soundLabel(){soundButton.textContent=audio.muted?'Sound off':'Sound on';soundButton.setAttribute('aria-pressed',String(!audio.muted))}
 soundLabel()
 soundButton.onclick=()=>{audio.toggle();soundLabel()}
 const unlockAudio=()=>audio.unlock()
 addEventListener('pointerdown',unlockAudio)
 addEventListener('keydown',unlockAudio)
 document.addEventListener('visibilitychange',()=>{audio.state(document.hidden||paused,replay.cut>=0)})
 const cardMap=await new T.TextureLoader().loadAsync(cardSheet)
 cardMap.minFilter=cardMap.magFilter=T.NearestFilter;cardMap.generateMipmaps=false;cardMap.colorSpace=T.SRGBColorSpace
 cardMap.repeat.set(1/9,1/8)
 let cardScene:{offender:typeof sean,time:number}|null=null
 function finishCard(){
  if(cardScene)cardScene.offender.sprite.visible=!cardScene.offender.penalty
  cardScene=null;referee.moving=false
 }
 function advanceCard(dt:number){
  if(!cardScene)return false
  const ref=referee.sprite.position,offender=cardScene.offender.sprite.position
  const dx=offender.x-ref.x,dz=offender.z-ref.z,dist=Math.hypot(dx,dz)
  referee.face=facing(dx,dz,referee.face)
  if(dist>1.5){
   const step=Math.min(dist-1.48,8*dt)/dist
   ref.x+=dx*step;ref.z+=dz*step;referee.moving=true;referee.runClock+=dt
  }else{
   referee.moving=false;cardScene.time+=dt
   if(cardScene.time>=1.55){finishCard();return false}
  }
  return true
 }
 function awardFreeKick(offender:typeof sean,victim:typeof sean){
  const blue=players.includes(offender),team=blue?opponents:players
  const spot=victim.sprite.position.clone();spot.y=restingHeight
  const taker=team.indexOf(victim)
  lateChallenge(offender)
  audio.play('whistle',.72)
  if(offender.lateChallenges===3){cardScene={offender,time:0};offender.sprite.visible=true}
  phase='freeKick';freeKick={spot,blue,taker,wait:offender.penalty?2.1:1}
  held=false;inFlight=false;centerPass=false;lastSender=windupReceiver=blueCarrier=-1
  bluePass=null;shot=null;keeperRestart=null;outBall=null;keeperGather=resultTime=0
  vx=vz=reboundVY=0;clearanceLoose=false;homeLateTime=lateTime=0
  cancelCharge();cancelRush();endFollowUpRuns()
  for(const actor of pitchActors){actor.age=-1;actor.moving=false;actor.tackling=false;actor.velocity.set(0,0,0)}
  ball.position.copy(spot);feedbackActor=null;callout.hidden=true
  el('shotResult').textContent=(offender.penalty?callout.dataset.grade+' · '+offender.name:'LATE TACKLE')+' · '+(blue?'STARS':'TBFC')+' FREE KICK'
 }
 function prepareFreeKick(){
  const restart=freeKick!
  const {blue,taker,spot}=restart,team=blue?opponents:players,sign=blue?-attackSign:attackSign
  const foot=team[taker].sprite.position
  foot.set(spot.x-sign*.48,0,spot.z);team[taker].face=sign===1?2:6
  for(const rival of blue?players:opponents){
   const pos=rival.sprite.position
   if(!rival.penalty&&Math.hypot(pos.x-spot.x,pos.z-spot.z)<2.4){
    pos.x=T.MathUtils.clamp(spot.x+sign*2.5,-20.7,20.7)
    if(Math.abs(pos.x-spot.x)<2.4)pos.z=spot.z+(spot.z>0?-2.5:2.5)
    rival.goal.copy(pos)
   }
  }
  if(!blue){
   active=ballPlayer=taker;held=true;lastBlue=false
   nameText.textContent=team[taker].displayName;ring.position.copy(foot);ring.position.y=.045
   el('shotResult').textContent='FREE KICK · PASS OR SHOOT'
   return
  }
  let receiver=-1,best=-Infinity
  for(const [i,mate] of team.entries()){
   if(i===taker||mate.penalty)continue
   const to=mate.sprite.position
   const space=Math.min(6,...players.filter(m=>!m.penalty).map(m=>m.sprite.position.distanceTo(to)))
   const score=space-.28*spot.distanceTo(to)+.12*sign*(to.x-spot.x)
   if(score>best){best=score;receiver=i}
  }
  phase='play';freeKick=null;lastBlue=true;turnoverGrace=.55
  if(receiver<0){blueWins(taker,'STARS BALL');return}
  const end=team[receiver].sprite.position.clone();end.y=restingHeight
  team[taker].face=facing(end.x-spot.x,end.z-spot.z);team[taker].shooting=true;team[taker].age=.12
  audio.kick(.45)
  bluePass={receiver,start:spot.clone(),end,age:0,duration:Math.max(.2,end.distanceTo(spot)/8)}
  el('shotResult').textContent=''
 }
 function lateChallenge(actor:typeof sean){
  actor.lateChallenges++
  const red=actor.lateChallenges>=6,yellow=actor.lateChallenges===3
  feedbackActor=actor;feedbackTime=1.05;callout.hidden=false
  callout.dataset.grade=red?'RED CARD':yellow?'YELLOW CARD':'WARNING'
  callout.textContent=red||yellow?callout.dataset.grade:'LATE TACKLE · '+((actor.lateChallenges-1)%3+1)+'/3'
  if(!red&&!yellow)return
  actor.penalty=red?Infinity:120
  actor.sprite.visible=false;actor.moving=false;actor.age=-1;actor.tackling=false
  actor.goal.copy(actor.sprite.position);marks=null;supportOwner=-1
  if(actor===players[active]){
   const replacement=nearestEligible(players,ball.position)
   if(replacement>=0)active=replacement
   cancelCharge()
  }
 }
 function updatePenalties(seconds:number){
  const rows:[string[],string[]]=[[],[]]
  for(const actor of outfield){
   if(!actor.penalty)continue
   actor.penalty=Math.max(0,actor.penalty-seconds)
   if(actor.penalty===0){
    actor.sprite.visible=true
    actor.sprite.position.set(0,0,fieldZ-.6);actor.goal.copy(actor.sprite.position)
    supportOwner=-1;marks=null
   }else{
    const t=Math.ceil(actor.penalty)
    const home=players.includes(actor),red=!Number.isFinite(t)
    const time=red?'RED':Math.floor(t/60)+':'+String(t%60).padStart(2,'0')
    rows[home?0:1].push(`<span class="card-time${red?' red':''}">${home?actor.displayName:actor.name} <b>${time}</b></span>`)
   }
  }
  for(const [i,id] of ['homePenalties','awayPenalties'].entries()){
   const panel=el(id),html=rows[i].join('')
   if(panel.innerHTML!==html)panel.innerHTML=html
  }
 }
 function recordAttempt(result:ReturnType<typeof planShot>['result']){
  const counts=shotCounts[shotZone]
  const column=result==='Goal'?0:result==='Save'?1:result==='Post'||result==='Crossbar'?3:2
  counts[column]++
  const total=counts.reduce((a,b)=>a+b,0)
  const cells=el('shotStats').querySelectorAll('tbody tr')[shotZone].querySelectorAll('td')
  cells[0].textContent=String(total)
  counts.forEach((count,i)=>cells[i+1].textContent=count+' ('+Math.round(100*count/total)+'%)')
 }
 function claimDribble(){
  held=false;lastSender=-1;noticeTime=0
  cancelCharge();endFollowUpRuns()
  drillKeeper.position.z=T.MathUtils.clamp(ball.position.z,-1.85,1.85)
  drillKeeper.position.x=attackSign*T.MathUtils.clamp(attackSign*ball.position.x,keeperHomeX,fieldX-.35)
  const start=drillKeeper.position.clone()
  start.x-=attackSign*.4;start.y=restingHeight
  startBlueBuild(start,'KEEPER BALL')
 }
 function startBlueBuild(start:T.Vector3,label:string){
  cancelCharge()
  held=false;inFlight=false;blueCarrier=-1;bluePass=null;clearanceLoose=false
  vx=vz=reboundVY=0;lastBlue=true
  keeperRestart={start,end:start.clone(),age:0,blueBuild:true}
  keeper.position.set(start.x+attackSign*.45,0,start.z)
  ball.position.copy(start);el('shotResult').textContent=label
 }
 function releaseBlueBuild(start:T.Vector3){
  let best=-Infinity,receiver=-1
  for(const [i,mate] of opponents.entries()){
   if(mate.penalty)continue
   const foot=mate.sprite.position,dx=foot.x-start.x,dz=foot.z-start.z,length=dx*dx+dz*dz
   if(length<9||attackSign*dx>=0)continue
   let space=6,lane=5
   for(const rival of players){
    if(rival.penalty)continue
    const pos=rival.sprite.position
    space=Math.min(space,Math.hypot(pos.x-foot.x,pos.z-foot.z))
    const t=((pos.x-start.x)*dx+(pos.z-start.z)*dz)/length
    if(t>0&&t<1)lane=Math.min(lane,Math.hypot(pos.x-start.x-t*dx,pos.z-start.z-t*dz))
   }
   const short=i>=3
   const score=space*1.8+lane*(short?.9:.35)+(short?1.3:0)+Math.random()*1.2
   if(score>best){best=score;receiver=i}
  }
  if(receiver<0){keeperRestart={age:0,start,end:new T.Vector3(0,restingHeight,0)};return}
  const end=opponents[receiver].sprite.position.clone()
  end.y=restingHeight
  const long=start.distanceTo(end)>16
  audio.kick(.45)
  bluePass={receiver,start:start.clone(),end,age:0,duration:start.distanceTo(end)/(long?13:8),loft:long?2.1:0}
  keeperRestart=null;awayGK.face=facing(end.x-start.x,end.z-start.z)
  awayGK.shooting=true;awayGK.age=.12
  el('shotResult').textContent=long?'LONG DISTRIBUTION':'SHORT DISTRIBUTION';noticeTime=.8
 }
 function gatherPunt(){
  if(!opponents.length||attackSign*ball.position.x<fieldX-3||Math.abs(ball.position.z)>2.6||ball.position.y>1.55)return false
  const start=ball.position.clone()
  start.x=attackSign*Math.min(fieldX-1,attackSign*start.x);start.y=restingHeight
  startBlueBuild(start,'KEEPER BALL')
  return true
 }
 function keeperTouch(){
  const power=puntHold?heldPower(puntHold.start):puntPower
  cancelRush();cancelCharge();endFollowUpRuns()
  blueCarrier=-1;bluePass=null;shot=null;held=false;lastSender=-1;clearanceLoose=false
  vx=vz=reboundVY=0;homeKeeper.position.y=0;homeKeeper.material.rotation=0
  const foot=homeKeeper.position
  ball.position.set(foot.x+attackSign*.42,restingHeight,foot.z)
  if(power===null){
   keeperGather=.65
   el('shotResult').textContent='KEEPER BALL'
  }else{
   const end=new T.Vector3(attackSign*Math.min(fieldX-1,attackSign*foot.x+16+16*power),restingHeight,foot.z*.55)
   sean.face=attackSign===1?2:6;sean.age=.12;sean.shooting=true
   audio.kick(power)
   keeperRestart={age:.45,start:ball.position.clone(),end,punt:true}
   el('shotResult').textContent='PUNT'
  }
  noticeTime=0
 }
 function distributeKeeperBall(){
  audio.kick(.32)
  sean.face=attackSign===1?2:6;sean.age=.12;sean.shooting=true
  const receiver=nearestEligible(players,ball.position)
  if(receiver<0){held=false;return}
  active=ballPlayer=receiver;passKind='pass';inFlight=true;passTime=0
  passStart.copy(ball.position);passStart.y=restingHeight
  receiverLaunch.copy(players[receiver].sprite.position);passTarget.copy(players[receiver].sprite.position);passTarget.y=restingHeight
  passDuration=Math.max(.2,passStart.distanceTo(passTarget)/9)
  arc=kickArc(1);el('shotResult').textContent=''
 }
 function ownBox(pos:T.Vector3){
  return attackSign*pos.x<=-16.6&&Math.abs(pos.z)<=4.6
 }
 function clearanceFace(){
  const [x,z]=readAim(Array.from(navigator.getGamepads?.()??[]).find(Boolean))
  return Math.hypot(x,z)>.22?facing(x,z):facing(attackSign,0)
 }
 function releaseLooseStrike(dx:number,dz:number,power:number){
  const speed=7+11*power,length=Math.hypot(dx,dz)||1
  vx=speed*dx/length;vz=speed*dz/length
  reboundVY=power>=.5?3+3*power:0
  clearanceLoose=struckLoose=true;held=inFlight=false;shot=null
 }
 function kick(){
  const p=players[active]
  if(paused||p.age>=0||!held||ballPlayer!==active)return
  p.face=ownBox(p.sprite.position)?clearanceFace():facing(attackSign*fieldX-p.sprite.position.x,-p.sprite.position.z)
  p.shooting=true;p.age=0
 }
 function receivePass(collector:number,aerialFinish:boolean){
  const intent=charge?{action:charge.action,power:heldPower(charge.start)}:queued
  const intended=collector===ballPlayer
  cancelCharge()
  active=ballPlayer=collector;held=true;inFlight=false
  if(intent?.action==='shot'){
   const actor=players[collector],goalX=attackSign*fieldX
   const backToGoal=dirs[actor.face][0]*attackSign<-.35
   const style=aerialFinish?(ball.position.y>.85&&backToGoal&&intent.power>=.65?'BICYCLE KICK':ball.position.y>=1.12?'HEADER':'VOLLEY'):null
   if(style){aerial={index:collector,style,age:0};el('shotResult').textContent=style;noticeTime=.65}
   if(ownBox(actor.sprite.position))actor.face=clearanceFace()
   else if(style!=='BICYCLE KICK')actor.face=facing(goalX-actor.sprite.position.x,-actor.sprite.position.z)
   actor.age=.12;actor.shooting=true;shotMultiplier=1+intent.power
   launchShot(actor)
  }else{
   carry()
   if(intent&&intended){players[collector].age=-1;pass(1+intent.power,intent.action)}
  }
 }
 function launchShot(shooter:typeof players[number]){
  audio.kick(shotMultiplier-1)
  kickSpot=null
  recentHomeKicker=shooter;homeLateTime=lateTackleWindow
  replay.markStrike(shooter.sprite,ball.position)
  held=false;inFlight=false;lastBlue=false
  shotStart.copy(ball.position)
  const power=shotMultiplier-1
  if(ownBox(shooter.sprite.position)){
   const [dx,dz]=dirs[shooter.face]
   releaseLooseStrike(dx,dz,power);el('shotResult').textContent='CLEARANCE';noticeTime=.65
   return
  }
  const dx=attackSign*fieldX-ball.position.x
  if(Math.hypot(dx,ball.position.z)>(7+11*power)**2/12){
   releaseLooseStrike(dx,-ball.position.z,power)
   return
  }
  const defendingKeeper=keeper
  keeperStartX=defendingKeeper.position.x
  keeperStart=defendingKeeper.position.z
  const range=Math.hypot(fieldX-attackSign*shooter.sprite.position.x,shooter.sprite.position.z)
  shotZone=range<7?0:range<14?1:2
  shotDirection=attackSign
  shot=planShot(attackSign*ball.position.x,ball.position.z,keeperStart,shotMultiplier-1,fieldX,attackSign*shooter.sprite.position.x,attackSign*keeperStartX,Math.random,defendingKeeper.visible)
  const grade=shotFeedback(shot.result,range,shotMultiplier-1,Math.abs(shot.targetZ-keeperStart))
  feedbackActor=grade?shooter:null;feedbackTime=1.05;callout.hidden=!grade
  if(grade){callout.textContent=grade;callout.dataset.grade=grade}
  shot.targetX*=attackSign
  startFollowUpRuns(active)
  arc=kickArc(shotMultiplier);shotTime=0
 }
 function canTackle(){
  return phase==='play'&&!paused&&!held&&!inFlight&&!shot&&!outBall&&!keeperRestart&&keeperGather<=0&&resultTime<=0&&(blueCarrier>=0||bluePass!==null)
 }
 function canSwitch(){return phase==='play'&&!paused&&keeperGather<=0&&!outBall&&!held&&!inFlight&&!shot&&resultTime<=0&&(!keeperRestart||keeperRestart.age>=.45)}
 function switchPlayer(){
  if(!canSwitch())return
  const nearest=nearestEligible(players,ball.position)
  if(nearest<0)return
  players[active].goal.copy(players[active].sprite.position)
  active=nearest
 }
 function blueWins(index:number,reason:string){
  windupReceiver=-1;cancelCharge();endFollowUpRuns();returnRunTime=0
  lastBlue=true;bluePass=null;blueDecisionTime=.65;blueCarrier=index;held=false;inFlight=false;lastSender=-1
  pressTime=0;turnoverGrace=.7;dribbleSide=opponents[index].sprite.position.z>0?-1:1
  el('shotResult').textContent=reason;noticeTime=.9
 }
 function spendSprint(actor:typeof sean,dt:number){
  const charged=Math.min(dt,actor.sprintCharge*sprintSeconds/100)
  const remaining=Math.max(0,actor.staminaCapacity-charged*capacityLossPerSecond)
  const extra=Math.min(dt-charged,remaining/exhaustedLossPerSecond)
  actor.sprintCharge=Math.max(0,actor.sprintCharge-charged*100/sprintSeconds)
  actor.staminaCapacity=Math.max(0,remaining-extra*exhaustedLossPerSecond)
  return charged+extra
 }
 function hasEscapeLane(carrier:typeof sean,distance:number){
  if(distance<2||carrier.staminaCapacity<=0)return false
  const continuing=carrier.sprintTime>0
  if(!continuing&&carrier.sprintCharge<Math.min(25,carrier.staminaCapacity))return false
  const dx=carrier.velocity.x/distance,dz=carrier.velocity.z/distance
  let chased=false
  for(const defender of players){
   if(defender.penalty)continue
   const x=defender.sprite.position.x-carrier.sprite.position.x,z=defender.sprite.position.z-carrier.sprite.position.z
   const along=x*dx+z*dz,side=Math.abs(z*dx-x*dz)
   if(along>.25&&along<4.5&&side<1.75)return false
   const reach=carrier.sprintCharge<=.001?2.8:continuing?5:3.8
   if(along<=.25&&side<2.4&&Math.hypot(x,z)<reach)chased=true
  }
  return chased&&(carrier.sprintCharge>.001||carrier.staminaCapacity>30)
 }
 function moveBlue(dt:number){
  const ballPos=ball.position
  // Favor the current presser until another defender is clearly better placed.
  const cost=(i:number)=>opponents[i].penalty?Infinity:Math.hypot(opponents[i].sprite.position.x-ballPos.x,
   opponents[i].sprite.position.z-ballPos.z)+.32*Math.abs(lanes[i]-ballPos.z)-(i===pressing?1.6:0)
  const nearest=opponents.reduce((best,_,i)=>cost(i)<cost(best)?i:best,0)
  if(nearest!==pressing){pressing=nearest;pressTime=0}
  for(const [i,o] of opponents.entries()){
   const pos=o.sprite.position
   if(o.penalty||o.age>=0){o.moving=false;o.sprintTime=0;continue}
   if(keeperRestart?.blueBuild){
    const depth=i<3?[-5,-8,-5][i]:[12,8,12][i-3]
    o.goal.set(attackSign*depth,0,lanes[i])
   }else if(blueCarrier===i){
    if(attackSign*pos.x>-17)o.goal.set(-18*attackSign,0,T.MathUtils.clamp(pos.z+dribbleSide*2,-9,9))
    else{
     if(Math.abs(pos.z-dribbleSide*9)<.5)dribbleSide*=-1
     o.goal.set(-18.5*attackSign,0,dribbleSide*9)
    }
   }else if(blueCarrier>=0||bluePass){
    const lead=bluePass?bluePass.end:opponents[blueCarrier].sprite.position
    if(bluePass?.receiver===i)o.goal.copy(bluePass.end)
    else{
     const depth=i<3?5:-6
     o.goal.set(-attackSign*T.MathUtils.clamp(-attackSign*lead.x+depth,i<3?-12:-18,i<3?18:10),0,lanes[i]+lead.z*.08)

    }
   }else if(i===nearest){
    o.goal.set(ballPos.x,0,ballPos.z)
   }else{
    o.goal.set(attackSign*T.MathUtils.clamp(attackSign*ballPos.x+(i>=3?7:-1),-13,18),0,
     lanes[i]+T.MathUtils.clamp(ballPos.z*.28,-2.5,2.5))
   }
   o.goal.x=T.MathUtils.clamp(o.goal.x,-20.4,20.4);o.goal.z=T.MathUtils.clamp(o.goal.z,-11.4,11.4)
   o.velocity.subVectors(o.goal,pos)
   const distance=o.velocity.length()
   o.moving=distance>(o.moving?.10:.32)
   if(o.moving){
    o.face=facing(o.velocity.x,o.velocity.z,o.face)
    o.sprintTime=i===blueCarrier&&hasEscapeLane(o,distance)?spendSprint(o,dt):0
    const pace=i===blueCarrier?2.9:i===nearest?3.65:2.8
    pos.addScaledVector(o.velocity,Math.min(1,(pace*dt+(6-pace)*o.sprintTime)/distance))
   }else{o.sprintTime=0;o.face=facing(ballPos.x-pos.x,ballPos.z-pos.z,o.face)}
  }
  const carrier=held?players[ballPlayer]:homeLateTime>.18?recentHomeKicker:null
  const defender=opponents[nearest]
  if(carrier&&turnoverGrace<=0&&!defender.penalty&&defender.age<0){
   const target=held?ballPos:carrier.sprite.position
   const dx=target.x-defender.sprite.position.x,dz=target.z-defender.sprite.position.z
   pressTime=Math.hypot(dx,dz)<1.85?pressTime+dt:0
   if(pressTime>=.12){
    defender.face=facing(dx,dz,defender.face)
    defender.age=0;defender.tackling=true;defender.shooting=false;defender.moving=false
    pressTime=0
   }
  }else pressTime=0
 }
 let marks:number[]|null=null
 const lanePoint=new T.Vector3()
 let nearCover=-1,farCover=-1
 function defendSean(threat:T.Vector3,carrier:number,loose:boolean){
  const ai=players.map((_,i)=>i).filter(i=>i!==active&&!players[i].penalty)
  const next=players.map(()=>-1)
  function assign(x:number,z:number,previous=-1,cover=false){
   let pick=-1,best=Infinity
   for(const i of ai){
    const p=players[i].sprite.position
    const cost=Math.hypot(p.x-x,p.z-z)-(previous===i?1.3:0)-(cover&&homeShape[i].back?.9:0)
    if(cost<best){pick=i;best=cost}
   }
   if(pick>=0){ai.splice(ai.indexOf(pick),1);players[pick].goal.set(x,0,z)}
   return pick
  }
  const depth=T.MathUtils.clamp(attackSign*threat.x,-fieldX,0)
  const side=threat.z<0?-1:1
  const userPressing=players[active].sprite.position.distanceToSquared(threat)<3.5**2
  if(userPressing)next[active]=carrier
  // Leave a covering player even if the side is temporarily two players down.
  const coverX=attackSign*Math.max(-fieldX+1.9,depth-5)
  nearCover=assign(coverX,side*Math.min(3.4,1.2+Math.abs(threat.z)*.20),nearCover,true)
  if(!userPressing&&(carrier>=0||loose)){
   const i=assign(T.MathUtils.clamp(threat.x,-20.6,20.6),T.MathUtils.clamp(threat.z,-11.6,11.6))
   if(i>=0)next[i]=carrier
  }
  farCover=assign(attackSign*Math.max(-fieldX+2.5,depth-4),-side*2.4,farCover,true)
  // Track the most advanced remaining runners on their goal side.
  const runners=opponents.map((_,i)=>i).filter(i=>i!==carrier&&!opponents[i].penalty)
   .sort((i,j)=>attackSign*(opponents[i].sprite.position.x-opponents[j].sprite.position.x))
  for(const j of runners){
   if(!ai.length)break
   const runner=opponents[j].sprite.position
   const x=attackSign*T.MathUtils.clamp(Math.min(attackSign*runner.x-1,depth+4),-fieldX+2,0)
   const i=assign(x,T.MathUtils.clamp(runner.z*.8+threat.z*.1,-9,9))
   next[i]=j
  }
  for(const i of ai)players[i].goal.set(attackSign*Math.max(-17,depth-1),0,homeShape[i].lane*.65)
  marks=next
 }
 function organizeDefense(){
  const incomingShot=!!shot&&shotDirection===-attackSign
  const loose=!held&&!inFlight&&!shot&&clearanceLoose
  const threatPoint=bluePass&&attackSign*bluePass.end.x<attackSign*ball.position.x?bluePass.end:ball.position
  if(!held&&!outBall&&!keeperRestart&&!keeperGather&&resultTime<=0&&
    (incomingShot||attackSign*threatPoint.x<0&&(loose||bluePass||blueCarrier>=0))){
   defendSean(threatPoint,bluePass?.receiver??blueCarrier,loose)
   return
  }
  nearCover=farCover=-1
  if(blueCarrier<0&&!bluePass){marks=null;return}
  const threat=bluePass?.receiver??blueCarrier
  const pressingBall=players[active].sprite.position.distanceTo(opponents[threat].sprite.position)<4
  const next=players.map(()=>-1)
  const available=new Set(opponents.map((_,i)=>i).filter(i=>!opponents[i].penalty))
  if(pressingBall){next[active]=threat;available.delete(threat)}
  while(available.size){
   let best=Infinity,defender=-1,target=-1
   for(const [i,mate] of players.entries()){
    if(mate.penalty||next[i]>=0)continue
    for(const j of available){
     const cost=mate.sprite.position.distanceTo(opponents[j].sprite.position)+(marks&&marks[i]!==j?1.25:0)
     if(cost<best){best=cost;defender=i;target=j}
    }
   }
   if(defender<0)break
   next[defender]=target;available.delete(target)
  }
  marks=next
  players.forEach((mate,i)=>{
   if(mate.penalty||i===active)return
   if(next[i]<0){mate.goal.set(ball.position.x-attackSign*4,0,homeShape[i].lane*.7);return}
   const mark=opponents[next[i]].sprite.position
   if(bluePass&&next[i]===threat){
    // Attack the earliest remaining point reachable before the ball passes it.
    mate.goal.copy(bluePass.end)
    for(let time=bluePass.age;time<bluePass.duration;time+=.05){
     lanePoint.lerpVectors(bluePass.start,bluePass.end,time/bluePass.duration);lanePoint.y=0
     if(mate.sprite.position.distanceTo(lanePoint)<=.55+4.6*(time-bluePass.age)){
      mate.goal.copy(lanePoint);break
     }
    }
   }else if(next[i]===blueCarrier){
    mate.goal.copy(mark)
   }else{
    lanePoint.copy(ball.position).sub(mark);lanePoint.y=0
    lanePoint.multiplyScalar(.30).clampLength(0,1.75)
    mate.goal.copy(mark).add(lanePoint);mate.goal.x-=attackSign*.35
   }
   mate.goal.y=0
   mate.goal.x=T.MathUtils.clamp(mate.goal.x,-20.5,20.5)
   mate.goal.z=T.MathUtils.clamp(mate.goal.z,-11.5,11.5)
  })
 }
 function tryBlueShot(){
  const carrier=opponents[blueCarrier],from=carrier.sprite.position
  let target=0,best=-Infinity
  const dx=-attackSign*fieldX-ball.position.x
  for(const z of [-1.5,0,1.5]){
   const dz=z-ball.position.z
   const length=dx*dx+dz*dz
   let clearance=4
   for(const defender of players){
    if(defender.penalty)continue
    const pos=defender.sprite.position
    const t=T.MathUtils.clamp(((pos.x-ball.position.x)*dx+(pos.z-ball.position.z)*dz)/Math.max(.001,length),0,1)
    clearance=Math.min(clearance,Math.hypot(pos.x-ball.position.x-t*dx,pos.z-ball.position.z-t*dz))
   }
   if(clearance<.8)continue
   const score=clearance-.025*length**.5+.17*Math.abs(z-homeKeeper.position.z)
   if(score>best){best=score;target=z}
  }
  if(best===-Infinity)return false
  const range=Math.hypot(dx,target-ball.position.z)
  keeperStartX=homeKeeper.position.x;keeperStart=homeKeeper.position.z
  shotMultiplier=1+T.MathUtils.clamp(range/15,.28,.85)
  audio.kick(shotMultiplier-1)
  if(range>(7+11*(shotMultiplier-1))**2/12){
   carrier.face=facing(dx,target-ball.position.z);carrier.age=.12;carrier.shooting=true
   recentKicker=blueCarrier;lateTime=lateTackleWindow;blueCarrier=-1;lastBlue=true
   releaseLooseStrike(dx,target-ball.position.z,shotMultiplier-1)
   return true
  }
  shot=planShot(-attackSign*ball.position.x,ball.position.z,keeperStart,shotMultiplier-1,fieldX,-attackSign*from.x,-attackSign*keeperStartX,Math.random,homeKeeper.visible,target)
  shot.targetX*=-attackSign
  replay.markStrike(carrier.sprite,ball.position)
  shotDirection=-attackSign;shotStart.copy(ball.position);shotTime=0;arc=kickArc(shotMultiplier)
  carrier.face=facing(shot.targetX-from.x,shot.targetZ-from.z)
  carrier.age=.12;carrier.shooting=true
  recentKicker=blueCarrier;lateTime=lateTackleWindow
  blueCarrier=-1;noticeTime=0;el('shotResult').textContent=''
  return true
 }
 function decideBlueAttack(dt:number){
  blueDecisionTime-=dt
  if(blueDecisionTime>0)return
  const carrier=opponents[blueCarrier],from=carrier.sprite.position
  blueDecisionTime=.18
  const inFinalThird=attackSign*from.x<=-fieldX/3
  if(inFinalThird&&tryBlueShot())return
  if(carrier.sprintTime>0)return
  if(!inFinalThird&&!players.some(m=>!m.penalty&&m.sprite.position.distanceToSquared(from)<3.7**2)&&Math.random()>.11)return
  let receiver=-1,best=-Infinity
  for(const [i,mate] of opponents.entries()){
   if(mate.penalty)continue
   if(i===blueCarrier)continue
   const to=mate.sprite.position,dx=to.x-from.x,dz=to.z-from.z
   const length=dx*dx+dz*dz
   if(length<2.5**2||length>23**2)continue
   let space=Infinity,lane=Infinity
   for(const defender of players){
    if(defender.penalty)continue
    const pos=defender.sprite.position
    space=Math.min(space,pos.distanceTo(to))
    const along=((pos.x-from.x)*dx+(pos.z-from.z)*dz)/length
    if(along>0&&along<1)lane=Math.min(lane,Math.hypot(pos.x-from.x-along*dx,pos.z-from.z-along*dz))
   }
   if(space<1.5||lane<.8)continue
   const score=Math.min(space,5)+Math.min(lane,3)-.1*Math.sqrt(length)-attackSign*dx*.14
   if(score>best){best=score;receiver=i}
  }
  if(receiver<0)return
  const end=opponents[receiver].sprite.position.clone()
  end.y=restingHeight
  const start=ball.position.clone()
  carrier.age=.12;carrier.shooting=true
  recentKicker=blueCarrier;lateTime=lateTackleWindow
  audio.kick(.45)
  bluePass={receiver,start,end,age:0,duration:start.distanceTo(end)/7.5}
  carrier.face=facing(end.x-from.x,end.z-from.z)
  blueCarrier=-1
 }
 function winBack(index:number,reason:string){
  if(reason==='WON BACK'||reason==='TACKLE WON')afterChallenge=performance.now()
  lastBlue=false
  cancelCharge();endFollowUpRuns()
  blueCarrier=-1;bluePass=null;active=ballPlayer=index;held=true;lastSender=-1;turnoverGrace=1
  el('shotResult').textContent=reason;noticeTime=.8
  carry()
 }
 function interceptPass(start:T.Vector3,end:T.Vector3,defenders=opponents,exclude=-1,radius=.6,maxHeight=.84){
  const dx=end.x-start.x,dz=end.z-start.z,length=dx*dx+dz*dz
  let earliest=Infinity,winner=-1
  for(const [i,o] of defenders.entries()){
   if(o.penalty||i===exclude||o.tackling)continue
   const pos=o.sprite.position
   const t=length?T.MathUtils.clamp(((pos.x-start.x)*dx+(pos.z-start.z)*dz)/length,0,1):0
   const height=start.y+(end.y-start.y)*t
   if(height>maxHeight||Math.hypot(pos.x-start.x-t*dx,pos.z-start.z-t*dz)>radius)continue
   if(t<earliest){earliest=t;winner=i}
  }
  return winner
 }
 function readAim(pad:Gamepad|null|undefined){
   const x=Number(keys.has('KeyD'))-Number(keys.has('ArrowLeft')||keys.has('KeyA'))+axisX+(pad?.axes[0]??0)
   const z=Number(keys.has('ArrowDown')||keys.has('KeyS'))-Number(keys.has('ArrowUp')||keys.has('KeyW'))+axisZ+(pad?.axes[1]??0)+Number(!!pad?.buttons[13]?.pressed)-Number(!!pad?.buttons[12]?.pressed)
  return view.end?[-z*attackSign,x*attackSign]:[x,z]
 }
 function pass(multiplier:number,kind:PassKind){
  if(paused||!held||players[active].age>=0)return
  if(phase==='kickoff'){centerPass=true;phase='play';el('message').textContent=''}
  const sender=players[active],from=sender.sprite.position
  const [aimX,aimZ]=readAim(Array.from(navigator.getGamepads?.()??[]).find(Boolean))
  const aimed=Math.hypot(aimX,aimZ)>.22
  let best=-Infinity,target=-1
  players.forEach((mate,i)=>{
   if(mate.penalty||i===active)return
   const dx=mate.sprite.position.x-from.x,dz=mate.sprite.position.z-from.z
   const distance=Math.max(.01,Math.hypot(dx,dz))
   const alignment=(dx*aimX+dz*aimZ)/(distance*(Math.hypot(aimX,aimZ)||1))
   const crossRun=kind==='cross'&&!aimed&&Math.abs(from.z)>6&&attackSign*from.x>6?attackSign*mate.sprite.position.x*.6-Math.abs(mate.sprite.position.z)*.6:0
   const score=crossRun+(aimed?alignment*8:(i===lastSender&&distance<9?4:0))-distance*.35
   if(score>best){best=score;target=i}
  })
  if(target<0)return
  const to=players[target].sprite.position
  passKind=kind
  passStart.copy(ball.position);passTime=0
  receiverLaunch.copy(to)
  passTarget.copy(to);passTarget.y=restingHeight
  passDuration=Math.max(.06,ball.position.distanceTo(to)/8)/multiplier
  if(kind==='through'){
   const [faceX,faceZ]=dirs[sender.face]
   passHeading.set(aimed?aimX:faceX,0,aimed?aimZ:faceZ).normalize()
   launchSpeed=6+11*(multiplier-1)
   passDuration=launchSpeed/turfDeceleration
  }
  if(kind==='cross'){
   crossLift=1.35+.45*(multiplier-1)
   if(!crossingDrill&&Math.abs(from.z)>6&&attackSign*from.x>6){
    // Land a few steps beyond the receiver so a run across the flight meets it in the air.
    const line=passTarget.clone().sub(passStart);line.y=0;line.normalize()
    passTarget.addScaledVector(line,2.4)
    passTarget.x=T.MathUtils.clamp(passTarget.x,-fieldX+.5,fieldX-.5)
    passTarget.z=T.MathUtils.clamp(passTarget.z,-fieldZ+.5,fieldZ-.5)
   }
   passDuration=Math.max(.55,passDuration*1.35)
  }
  arc=kickArc(multiplier,passDuration)
  sender.face=kind==='through'?facing(passHeading.x,passHeading.z):facing(to.x-from.x,to.z-from.z)
  passPower=multiplier-1
  sender.shooting=!!sender.maps[2]
  sender.age=sender.shooting?0:.12
  const forward=attackSign*(attackSign*from.x>15?-1:1)
  sender.goal.set(T.MathUtils.clamp(Math.max(from.x*forward+4,to.x*forward+2)*forward,-19,19),0,
   T.MathUtils.clamp(to.z+(from.z>=to.z?3:-3),-10,10))
  if(sender.shooting)windupReceiver=target
  else launchPass(target)
 }
 function launchPass(target:number){
  audio.kick(passPower)
  kickSpot=null
  centerPass=false;windupReceiver=-1;returnRunTime=1.6;supportOwner=-1
  passStart.copy(ball.position);passTime=0;vx=vz=0
  recentHomeKicker=players[active];homeLateTime=lateTackleWindow
  lastSender=active;ballPlayer=active=target;held=false;inFlight=true
 }
 async function matchMenu(){
  if(squadOpen||phase==='fulltime')return
  if(replay.cut>=0||celebrating){pause(!paused);return}
  pause(true);squadOpen=true;audio.state(true,false)
  const current={shape:lineup.shape,starters:homeSlots.map(m=>m.displayName),bench:matchBench}
  try{
   const unavailable=new Set(homeSlots.filter(m=>m.penalty>0).map(m=>m.displayName))
   const result=await selectLineup(portraits,{current,unavailable})
   applyTeam(result.starters,result.bench)
   nameText.textContent=players[active].displayName
   pause(document.hidden)
  }finally{squadOpen=false;padIndex=null}
 }
 function pause(on:boolean){if(phase==='fulltime')return;cancelRush();cancelCharge();paused=on;keys.clear();axisX=axisZ=0;el('knob').style.transform='';el('pause').textContent=on?'Resume':'Pause';el('message').textContent=on?'Match paused':phase==='halftime'?'Halftime':phase==='kickoff'?(kickoffBlue?'Shooting Stars kickoff':players[active].displayName+' · pass to kick off'):''}
 function snap(value:number,step:number){return Math.round(value/step)*step}
 function screenRotation(){return view.end?2*attackSign:0}
 function resize(){
  const ratio=window.devicePixelRatio||1
  camera.fov=view.fov
  camera.aspect=16/9
  camera.updateProjectionMatrix()
  renderer.setPixelRatio(Math.min(ratio,1.5));renderer.setSize(renderer.domElement.parentElement!.clientWidth,renderer.domElement.parentElement!.clientHeight,false)
  const canvas=renderer.domElement
  canvas.style.width='100%';canvas.style.height='100%';canvas.style.imageRendering='auto'
  for(const goalie of keepers)goalie.scale.setScalar(cinematicPlayerSize)
  ball.scale.setScalar(cinematicBallSize)
  pitchActors.forEach(player=>player.sprite.scale.setScalar(cinematicPlayerSize))
 }

 function cycleView(step:number){
  if(celebrating||replay.cut>=0)return
  viewIndex=(viewIndex+step+views.length)%views.length
  view=views[viewIndex]
  awayGK.face=attackSign===1?6:2
  el('changeView').textContent=view.label
  resize()
 }
 el('skipReplay').onclick=()=>{if(replay.cut>=0||celebrating)reset(shotDirection===attackSign)}
 el('changeView').onclick=()=>cycleView(1)
 new ResizeObserver(resize).observe(renderer.domElement.parentElement!);resize();reset()
 el('switchPlayer').onclick=switchPlayer
 el('reset').onclick=()=>{
  audio.clear();half=1;attackSign=1;matchSeconds=homeScore=awayScore=0;paused=false;el('pause').textContent='Pause';el('pause').removeAttribute('disabled')
  applyTeam(lineup.starters,lineup.bench)
  for(const data of squad.values()){data.penalty=data.lateChallenges=0;data.sprintCharge=data.staminaCapacity=100}
  for(const m of [...outfield,sean]){m.penalty=m.lateChallenges=0;m.sprite.visible=true;m.sprintCharge=m.staminaCapacity=100}
  shotCounts.forEach(row=>row.fill(0));el('shotStats').querySelectorAll('td').forEach(c=>c.textContent='0')
  keys.clear();reset()
 };el('pause').onclick=()=>void matchMenu()
 scoreboard.onclick=()=>{if(replay.cut>=0){if(!replay.nextAngle())reset(shotDirection===attackSign)}else void matchMenu()}
 addEventListener('keydown',e=>{if(squadOpen||e.target instanceof HTMLButtonElement&&e.code==='Space')return
 if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault()
 if(e.code==='Comma'||e.code==='Period'||[',','.','<','>'].includes(e.key)){
  e.preventDefault()
  if(!e.repeat)cycleView(e.code==='Comma'||e.key===','||e.key==='<'?-1:1)
  return
 }
 if(e.code==='ArrowRight'){if(!e.repeat)switchPlayer();return}
 keys.add(e.code);if(!e.repeat){if(e.code==='KeyX')press('cross',e.code);if(e.code==='KeyY')press('through',e.code);if(['KeyE','KeyJ'].includes(e.code))press('pass',e.code);if(['KeyB','KeyK','Space'].includes(e.code))press('shot',e.code);if(e.code==='Escape')void matchMenu()}})
 addEventListener('keyup',e=>{keys.delete(e.code);release(e.code)});addEventListener('blur',()=>pause(true))
 const utilityButtons=[4,14,15]
 const utilityHeld=[false,false,false]
 let padIndex:number|null=null
 function updatePadStatus(text:string){const badge=el('padStatus');if(badge.textContent!==text)badge.textContent=text}
 addEventListener('gamepaddisconnected',event=>{
  if(event.gamepad.index!==padIndex)return
  padIndex=null;pause(true);updatePadStatus('Controller disconnected')
 })
 const stick=el('stick')
 function moveStick(e:PointerEvent){if(e.pointerId!==joy)return;const r=stick.getBoundingClientRect();axisX=(e.clientX-r.left-r.width/2)/36;axisZ=(e.clientY-r.top-r.height/2)/36;const m=Math.max(1,Math.hypot(axisX,axisZ));axisX/=m;axisZ/=m;el('knob').style.transform='translate('+axisX*28+'px,'+axisZ*28+'px)'}
 stick.onpointerdown=e=>{joy=e.pointerId;stick.setPointerCapture(joy);moveStick(e)};stick.onpointermove=moveStick;stick.onlostpointercapture=()=>{joy=null;axisX=axisZ=0;el('knob').style.transform=''}
 for(const [id,action] of [['kick','shot'],['pass','pass'],['cross','cross'],['through','through']] as const){
  const button=el(id)
  button.onpointerdown=e=>{e.preventDefault();button.setPointerCapture(e.pointerId);press(action,'pointer'+e.pointerId)}
  button.onpointerup=e=>release('pointer'+e.pointerId)
  button.onlostpointercapture=e=>{const source='pointer'+e.pointerId;if(charge?.source===source)cancelCharge();if(rushSource===source||puntHold?.source===source)cancelRush()}
 }
 let last=performance.now()
 function tick(now:number){
  const elapsed=(now-last)/1000,dt=Math.min(.04,elapsed)*(celebrating?.38:1);last=now
  if(squadOpen){requestAnimationFrame(tick);return}
  if(!paused)updateWeather(dt)
  const pad=Array.from(navigator.getGamepads?.()??[]).find(Boolean)
  if(pad&&padIndex!==pad.index){
   utilityButtons.forEach((n,i)=>utilityHeld[i]=!!pad.buttons[n]?.pressed)
   padIndex=pad.index;faceActions.forEach((_,i)=>padHeld[i]=!!pad.buttons[i]?.pressed);lastPause=!!pad.buttons[9]?.pressed
   updatePadStatus(pad.mapping==='standard'?'Controller connected':'Controller connected · check layout')
  }
  const menu=!!pad?.buttons[9]?.pressed
  if(menu&&!lastPause)void matchMenu()
  lastPause=menu
  utilityButtons.forEach((n,i)=>{
   const down=!!pad?.buttons[n]?.pressed
   if(down&&!utilityHeld[i]){
    if(n===4)switchPlayer()
    else cycleView(n===14?-1:1)
   }
   utilityHeld[i]=down
  })
  for(const i of [3,0,1,2]){
   const action=faceActions[i]
   const down=!!pad?.buttons[i]?.pressed
   if(down&&!padHeld[i])press(action,'pad'+i)
   if(!down&&padHeld[i])release('pad'+i)
   padHeld[i]=down
  }
  audio.state(paused||document.hidden,celebrating||replay.cut>=0)
  if(replay.cut>=0){
   if(!paused&&!replay.advance(Math.min(elapsed,.10))){
    reset(shotDirection===attackSign)
   }else{
    el('replayLabel').textContent=replay.label+(replay.cut===2?' · A: Kickoff':' · A: Next angle')
    const net=shotDirection===1?attackingGoal:homeGoal
    replay.draw(16/9,shotDirection,t=>net.poseAt(t))
    for(const {mesh,sprite} of contactShadows)mesh.position.set(sprite.position.x+.18,.024,sprite.position.z+.12)
    shadow.position.set(ball.position.x,.03,ball.position.z)
    shadow.scale.setScalar(1.15-.16*(ball.position.y-restingHeight))
    for(const {mesh} of contactShadows)mesh.scale.setScalar(.7)
    replay.render(renderer,scene)
    for(const {mesh} of contactShadows)mesh.scale.setScalar(1)
    requestAnimationFrame(tick)
    return
   }
  }
  updatePenalties(!paused&&!celebrating&&phase==='play'?elapsed:0)
  if(!clearanceLoose||held||inFlight||blueCarrier>=0||shot||keeperRestart||outBall)struckLoose=false
  const keeperX=homeKeeper.position.x,keeperZ=homeKeeper.position.z
  if(!paused&&freeKick){
   camTarget.lerp(freeKick.spot,1-Math.exp(-9*dt))
   if(freeKick.wait>0){
    if(cardScene){if(!advanceCard(dt))freeKick.wait=0}
    else freeKick.wait=Math.max(0,freeKick.wait-elapsed)
    if(freeKick.wait===0)prepareFreeKick()
   }else if(charge)showPower(heldPower(charge.start))
  }
  if(!paused&&phase==='kickoff'){
   if(charge)showPower(heldPower(charge.start))
   if(kickoffBlue&&(breakSeconds-=elapsed)<=0){
    const taker=nearestEligible(opponents,ball.position)
    const receiver=opponents.findIndex((o,i)=>!o.penalty&&i!==taker)
    if(receiver<0){phase='play';held=false;if(taker>=0)blueWins(taker,'STARS BALL')}
    else{
    const end=opponents[receiver].sprite.position.clone();end.y=restingHeight
    opponents[taker].age=.12;opponents[taker].shooting=true;opponents[taker].face=facing(end.x-ball.position.x,end.z-ball.position.z)
    audio.kick(.45)
  bluePass={receiver,start:ball.position.clone(),end,age:0,duration:ball.position.distanceTo(end)/8}
    phase='play';held=false;el('message').textContent=''
    }
   }
  }else if(!paused&&phase==='halftime'&&(breakSeconds-=elapsed)<=0){
   half=2;matchSeconds=0;attackSign=-1;reset(true)
  }
  if(!paused&&!celebrating&&phase==='play'){
   matchSeconds=Math.min(1500,matchSeconds+elapsed*settings.speed)
   if(matchSeconds>=1500){
    audio.play('whistle',.75,half===1?1:.88)
    phase=half===1?'halftime':'fulltime';breakSeconds=3;cancelCharge();cancelRush()
    el('message').textContent=half===1?'Halftime':'Full time · TBFC '+homeScore+' – '+awayScore+' Shooting Stars FC'
    if(phase==='fulltime')el('pause').setAttribute('disabled','')
   }
   updateScore()
  }
  if(!paused&&phase==='play'){
   homeLateTime=Math.max(0,homeLateTime-dt)
   lateTime=Math.max(0,lateTime-dt)
   if(charge)showPower(heldPower(charge.start))
   let [x,z]=readAim(pad)
   const p=players[active],pos=p.sprite.position
   if(inFlight&&passKind==='through'&&Math.max(Math.abs(x),Math.abs(z))<=.22){
    const stopDistance=launchSpeed*passDuration/2
    const ahead=(pos.x-passStart.x)*passHeading.x+(pos.z-passStart.z)*passHeading.z
    const chase=T.MathUtils.clamp(Math.max(ahead+.65,ball.position.distanceTo(passStart)),0,stopDistance)
    const dx=passStart.x+passHeading.x*chase-pos.x,dz=passStart.z+passHeading.z*chase-pos.z
    if(Math.hypot(dx,dz)>.2){x=dx;z=dz}
   }
   p.moving=p.age<0&&Math.max(Math.abs(x),Math.abs(z))>(p.moving?.18:.24)
   const wantsSprint=p.moving&&(keys.has('ShiftLeft')||keys.has('ShiftRight')||!!pad?.buttons[7]?.pressed)
   for(const mate of players)mate.sprintTime=0
   const burst=p.sprintTime=wantsSprint?spendSprint(p,dt):0
   const strideTime=dt+burst*(sprintCadence-1)
   if(p.moving){
    p.face=facing(x,z,p.face);const [dx,dz]=dirs[p.face]
    const distance=4*dt+2*burst
    pos.x=T.MathUtils.clamp(pos.x+dx*distance,-20.7,20.7)
    pos.z=T.MathUtils.clamp(pos.z+dz*distance,-11.7,11.7);p.travel+=4*strideTime
   }
   organizeAttack(dt)
   organizeDefense()
   for(const [i,partner] of players.entries()){
    if(partner.penalty||i===active)continue
    const other=partner.sprite.position
    if(nearCover<0&&i===reboundRunner&&canSwitch()){
     // Lead a moving rebound briefly, then close on the resting ball.
     partner.goal.set(T.MathUtils.clamp(ball.position.x+vx*.25,-20.7,20.7),0,
      T.MathUtils.clamp(ball.position.z+vz*.25,-11.7,11.7))
    }
   if((partner.shooting||partner.tackling)&&partner.age>=0){partner.moving=false;partner.velocity.set(0,0,0);continue}
   const distance=other.distanceTo(partner.goal)
   partner.moving=distance>(partner.moving?.08:.28)
   partner.velocity.set(0,0,0)
   if(partner.moving){
    partner.velocity.subVectors(partner.goal,other).multiplyScalar(Math.min(i===reboundRunner||nearCover>=0&&(other.x-partner.goal.x)*attackSign>2?6:4.6,distance/dt)/distance)
    other.addScaledVector(partner.velocity,dt);partner.travel+=partner.velocity.length()*dt
    partner.face=facing(partner.velocity.x,partner.velocity.z,partner.face)
   }else if(i!==reboundRunner){
    const watch=marks?ball.position:pos
    partner.face=facing(watch.x-other.x,watch.z-other.z,partner.face)
   }
   }
   const rushing=!!rushSource&&canRush()
   if(!rushing){puntHold=null;puntPower=null}
   if(rushing){
    const foot=homeKeeper.position
    const dx=ball.position.x-foot.x,dz=ball.position.z-foot.z
    const step=Math.min(1,6.4*dt/Math.max(.001,Math.hypot(dx,dz)))
    foot.x+=dx*step;foot.z+=dz*step;foot.y=0;homeKeeper.material.rotation=0
   }
   if(!shot&&!keeperRestart&&resultTime<=0){
    const cover=T.MathUtils.clamp(ball.position.z*.45,-1.55,1.55)
    for(const goalie of keepers){
     if(goalie===homeKeeper&&(rushing||keeperGather>0))continue
     const homeX=attackSign*(goalie===keeper?keeperHomeX:-keeperHomeX)
     goalie.position.x+=T.MathUtils.clamp(homeX-goalie.position.x,-6*dt,6*dt)
     goalie.material.rotation*=Math.exp(-7*dt);goalie.position.y*=Math.exp(-7*dt)
     goalie.position.z+=T.MathUtils.clamp(cover-goalie.position.z,-3*dt,3*dt)
    }
   }
   if(held){
    lastBlue=false;carry()
    if(!kickSpot&&drillKeeper.visible&&p.age<0&&attackSign*ball.position.x>=fieldX-1.35&&Math.abs(ball.position.z)<=2)claimDribble()
    else if(Math.abs(ball.position.x)>fieldX||Math.abs(ball.position.z)>fieldZ){
     const [dx,dz]=dirs[p.face];ballOut(dx*4,0,dz*4)
    }
   }
   turnoverGrace=Math.max(0,turnoverGrace-dt)
   if(noticeTime>0){
    noticeTime-=dt
    if(noticeTime<=0)el('shotResult').textContent=''
   }
   if(opponents.length&&!outBall&&!shot&&resultTime<=0)moveBlue(dt)
   else opponents.forEach(o=>{o.moving=false;o.sprintTime=0})
   for(const actor of pitchActors){
    if(actor.age<0)continue
    const prev=actor.age;actor.age+=dt
    if(actor.tackling){
     const foot=actor.sprite.position,[dx,dz]=dirs[actor.face]
     const step=3.5*(Math.min(.12,actor.age)-Math.min(.12,prev))
     foot.x=T.MathUtils.clamp(foot.x+dx*step,-20.7,20.7)
     foot.z=T.MathUtils.clamp(foot.z+dz*step,-11.7,11.7)
     if(prev<.12&&actor.age>=.12){
      const reaches=(point:T.Vector3)=>{
       const x=point.x-foot.x,z=point.z-foot.z
       return x*dx+z*dz>=-.15&&Math.hypot(x-dx*.5,z-dz*.5)<=.93
      }
      const blueIndex=opponents.indexOf(actor),isBlue=blueIndex>=0
      const playable=isBlue?!outBall&&!shot&&!keeperRestart&&keeperGather<=0&&resultTime<=0&&(held||inFlight):canTackle()
      const latePlayer=isBlue?(homeLateTime>0&&(!held||recentHomeKicker!==players[ballPlayer])?recentHomeKicker:null):
       (!held&&lateTime>0&&recentKicker!==blueCarrier?opponents[recentKicker]:null)
      if(playable&&ball.position.y<.85&&reaches(ball.position)){
       audio.kick(.25)
       if(isBlue)blueWins(blueIndex,'STARS TACKLE WON')
       else winBack(players.indexOf(actor),'TACKLE WON')
      }else if(latePlayer&&reaches(latePlayer.sprite.position)&&!reaches(ball.position)){
       awardFreeKick(actor,latePlayer)
       requestAnimationFrame(tick);return
      }
     }
     if(actor.age>=.42){actor.age=-1;actor.tackling=false}
     continue
    }
    if(actor===players[ballPlayer]&&held&&prev<.12&&actor.age>=.12){
     if(windupReceiver>=0){launchPass(windupReceiver);continue}
     held=false;inFlight=false
     ball.position.x=attackSign*Math.min(attackSign*ball.position.x,fieldX-.45)
     shotStart.copy(ball.position)
     launchShot(actor)
    }
    if(actor.age>=.37)actor.age=-1
   }
   const canCollect=()=>rushing&&canRush()&&ball.position.y<=1.35&&
    Math.hypot(ball.position.x-homeKeeper.position.x,ball.position.z-homeKeeper.position.z)<1.05
   if(canCollect())keeperTouch()
   if(keeperGather>0){
    keeperGather-=dt
    ball.position.set(homeKeeper.position.x+attackSign*.38,.82,homeKeeper.position.z)
    if(keeperGather<=0)distributeKeeperBall()
   }else if(outBall){
    if(advanceOutBall(ball.position,outVelocity,dt))audio.play('board',.42)
    outBall.remaining-=dt
    if(outBall.remaining<=0){
     const {goalEnd:end,spot,blueRestart,corner}=outBall
     outBall=null
     if(end&&!corner){
      lastBlue=end===attackSign
      const side=Math.sign(ball.position.z)||1
      const start=new T.Vector3(end*(fieldX-1.5),restingHeight,side*1.5)
      if(end===attackSign&&opponents.length)startBlueBuild(start,'GOAL KICK')
      else keeperRestart={age:0,start,
       end:new T.Vector3(-end*4,restingHeight,side*3)}
     }else{
      const x=corner?end*(fieldX-1):T.MathUtils.clamp(spot.x,-fieldX+1,fieldX-1)
      const z=(Math.sign(spot.z)||1)*(fieldZ-1)
      const team=blueRestart?opponents:players
      const pos=new T.Vector3(x,0,z)
      const taker=nearestEligible(team,pos)
      if(taker>=0){
      team[taker].sprite.position.copy(pos);team[taker].face=facing(-x,-z)
      ball.position.set(x,restingHeight,z);lastBlue=blueRestart
      if(blueRestart)blueWins(taker,corner?'STARS CORNER':'STARS KICK-IN')
      else winBack(taker,corner?'TBFC CORNER':'TBFC KICK-IN')
      }
     }
    }
   }else if(keeperRestart?.blueBuild){
    keeperRestart.age+=dt
    const forwards=opponents.slice(0,3).filter(o=>!o.penalty)
    const runners=forwards.filter(o=>attackSign*o.sprite.position.x < -2)
    if(keeperRestart.age>=.85&&runners.length>=Math.min(2,forwards.length))releaseBlueBuild(keeperRestart.start)
   }else if(keeperRestart){
    const restart=keeperRestart
    if(restart.age<.33&&restart.age+dt>=.33){
     const taker=restart.start.x*attackSign>0?awayGK:sean
     taker.face=facing(restart.end.x-restart.start.x,restart.end.z-restart.start.z)
     taker.age=0;taker.shooting=true
    }
    if(restart.age<.45&&restart.age+dt>=.45)audio.kick(.75)
    restart.age+=dt
    if(restart.age<.45){
     ball.position.copy(restart.start)
     ball.position.y=restingHeight+.70*(1-T.MathUtils.smoothstep(restart.age,.25,.45))
    }else{
     const t=Math.min(1,(restart.age-.45)/1.65)
     el('shotResult').textContent=restart.punt?'PUNT':'GOAL KICK'
     ball.position.lerpVectors(restart.start,restart.end,t)
     ball.position.y+=1.8*4*t*(1-t)
     if(restart.punt&&gatherPunt()){ /* Blue has gathered the clearance. */ }
     else if(t===1){
      vx=(restart.end.x-restart.start.x)*.24;vz=(restart.end.z-restart.start.z)*.24
      reboundVY=2.4;clearanceLoose=true;keeperRestart=null;noticeTime=.6
     }
    }
   }else if(inFlight){
    passTime=Math.min(passDuration,passTime+dt)
    const fraction=passTime/passDuration
    previousPassPosition.copy(ball.position)
    if(passKind==='through'){
     const distance=(launchSpeed-.5*turfDeceleration*passTime)*passTime
     ball.position.copy(passStart).addScaledVector(passHeading,distance)
     ball.position.y=restingHeight
    }else{
     // Only the final yard can bend toward a moving receiver.
     assistOffset.copy(players[ballPlayer].sprite.position).sub(receiverLaunch)
     assistOffset.y=0;assistOffset.clampLength(0,1)
     ball.position.lerpVectors(passStart,passTarget,fraction).addScaledVector(assistOffset,fraction*fraction)
     ball.position.y=restingHeight+(passKind==='cross'?4*crossLift*fraction*(1-fraction):heightAt(arc,passTime))
    }
    const interceptor=interceptPass(previousPassPosition,ball.position)
    const wantsFinish=passKind==='cross'&&(charge?.action==='shot'||queued?.action==='shot')
    const collector=interceptPass(previousPassPosition,ball.position,players,lastSender,wantsFinish?1.15:.78,wantsFinish?2:.84)
    if(Math.abs(ball.position.x)>fieldX||Math.abs(ball.position.z)>fieldZ){
     const step=Math.max(.000001,dt)
     ballOut((ball.position.x-previousPassPosition.x)/step,(ball.position.y-previousPassPosition.y)/step,(ball.position.z-previousPassPosition.z)/step)
    }
    else if(interceptor>=0)blueWins(interceptor,'INTERCEPTED')
    else if(collector>=0){
     lastBlue=false
     receivePass(collector,wantsFinish)
    }else if(fraction===1){
     inFlight=false;rollingPass=true;clearanceLoose=true;reboundVY=0
     // Unmet assisted passes roll on. A through ball has already spent its momentum.
     vx=passKind==='through'?0:(passTarget.x-passStart.x)/passDuration*.65
     vz=passKind==='through'?0:(passTarget.z-passStart.z)/passDuration*.65
    }
   }else if(shot){
    previousPassPosition.copy(ball.position)
    shotTime+=dt
    const t=Math.min(1,shotTime/shot.duration)
    ball.position.x=T.MathUtils.lerp(shotStart.x,shot.targetX,t)
    ball.position.z=T.MathUtils.lerp(shotStart.z,shot.targetZ,t)
    ball.position.y=restingHeight+heightAt(arc,shotTime)+(shotStart.y-restingHeight)*(1-t)
    if(shot.result==='Over'){
     const clearanceHeight=2.65+.6*(shotMultiplier-1)
     ball.position.y=shotStart.y+(clearanceHeight-shotStart.y)*t+2.2*t*(1-t)
    }
    if(shot.result==='Crossbar')ball.position.y=Math.max(ball.position.y,restingHeight+1.8*t)
    if(!(rushing&&shotDirection!==attackSign)){
     const goalie=shotDirection===attackSign?keeper:homeKeeper
     const dive=T.MathUtils.smoothstep(t,.25,1)
     const reach=shot.result==='Goal' ? shot.targetZ-Math.sign(shot.targetZ-keeperStart||1)*1.2 : shot.targetZ
     if(shot.result==='Save')goalie.position.x=T.MathUtils.lerp(keeperStartX,shot.targetX,dive)
     goalie.position.z=T.MathUtils.lerp(keeperStart,T.MathUtils.clamp(reach,-2,2),dive)
     goalie.material.rotation=(keeperStart-goalie.position.z)*.35
     goalie.position.y=shot.result==='Save'?dive*Math.min(.85,ball.position.y*.65):0
    }
    const blocker=shotDirection!==attackSign?interceptPass(previousPassPosition,ball.position,players):-1
    if(canCollect())keeperTouch()
    else if(blocker>=0){
     shot=null;winBack(blocker,'BLOCKED')
    }else if(t===1){
     if(shotDirection===attackSign)recordAttempt(shot.result)
     el('shotResult').textContent=shotDirection!==attackSign&&shot.result==='Goal'?'STARS GOAL':shot.result.toUpperCase()
     if(shot.result==='Wide'||shot.result==='Over'){
      ballOut((shot.targetX-shotStart.x)/shot.duration,
       (ball.position.y-previousPassPosition.y)/Math.max(dt,.000001),(shot.targetZ-shotStart.z)/shot.duration,shot.result)
     }else if(shot.result==='Goal'){
      cancelCharge()
      if(shotDirection===attackSign){homeScore++;audio.play('goal',.72)}else awayScore++
      updateScore();endFollowUpRuns()
      celebrating=true;replay.goal=replay.time
      goalBanner.hidden=false;replayPanel.hidden=false;el('replayLabel').textContent=shotDirection===attackSign?'TBFC':'STARS'
      el('shotResult').textContent=''
      netTravel=true
      vx=(shot.targetX-shotStart.x)/shot.duration
      vz=(shot.targetZ-shotStart.z)/shot.duration
      resultTime=.52
     }else{
      if(shot.result==='Save')audio.kick(.13)
      else audio.play(shot.result==='Post'?'post':'bar',.48)
      vx=-shotDirection*(shot.result==='Save'?7:5)*shotMultiplier
      lastBlue=shot.result==='Save'?shotDirection===attackSign:shotDirection!==attackSign
      clearanceLoose=shotDirection!==attackSign
      vz=(shot.targetZ>=0?1:-1)*(shot.result==='Post'?-2:2.5)
      reboundVY=shot.result==='Crossbar'?-2:2
      lastSender=-1
     }
     shot=null
    }
   }else if(resultTime>0){
    if(netTravel){
     ball.position.x+=shotDirection*Math.max(5,vx*shotDirection)*dt
     ball.position.z+=vz*dt
     const net=shotDirection===1?attackingGoal:homeGoal
     const contact=net.contactX(ball.position.y)
     if(shotDirection*(ball.position.x-contact)>=0||Math.abs(ball.position.z)>=1.85){
      ball.position.x=shotDirection*Math.min(shotDirection*ball.position.x,shotDirection*contact)
      ball.position.z=T.MathUtils.clamp(ball.position.z,-1.85,1.85)
      audio.play('net',.48)
      net.strike(ball.position.x,ball.position.y,ball.position.z,shotMultiplier-1)
      netTravel=false
      vx=-1.6*shotDirection
     }
    }else{
     ball.position.x+=vx*dt
     vx*=Math.exp(-5*dt)
     ball.position.y=Math.max(restingHeight,ball.position.y-2.2*dt)
    }
    resultTime-=dt

   }else if(bluePass){
    previousPassPosition.copy(ball.position)
    bluePass.age+=dt
    const t=Math.min(1,bluePass.age/bluePass.duration)
    ball.position.lerpVectors(bluePass.start,bluePass.end,t)
    ball.position.y+=4*(bluePass.loft??0)*t*(1-t)
    const cut=interceptPass(previousPassPosition,ball.position,players)
    if(cut>=0)winBack(cut,'INTERCEPTED')
    else if(t===1){
     blueCarrier=bluePass.receiver;bluePass=null;blueDecisionTime=.75
    }
   }else if(blueCarrier>=0){
    lastBlue=true
    const o=opponents[blueCarrier],foot=o.sprite.position
    const [dx,dz]=dirs[o.face]
    ball.position.set(foot.x+dx*.48,restingHeight,foot.z+dz*.38)
    if(turnoverGrace<=0&&p.moving&&Math.hypot(pos.x-foot.x,pos.z-foot.z)<1.05){
     winBack(active,'WON BACK')
    }else{
     const tackler=players.findIndex((mate,i)=>!mate.penalty&&i!==active&&marks?.[i]===blueCarrier&&mate.age<0&&mate.sprite.position.distanceTo(foot)<.70)
     if(turnoverGrace<=0&&tackler>=0)winBack(tackler,'WON BACK')
     else decideBlueAttack(dt)
    }
   }else if(!held){
    if(reboundVY!==0||ball.position.y>restingHeight){
     reboundVY-=17*dt
     ball.position.y+=reboundVY*dt
     if(ball.position.y<=restingHeight){
      ball.position.y=restingHeight
      if(reboundVY < -1.5)audio.play('bounce',Math.min(.38,-reboundVY*.045))
      reboundVY=reboundVY < -1.5 ? -reboundVY*.35 : 0
     }
    }
    if(struckLoose){
     const speed=Math.hypot(vx,vz)
     if(speed>0){
      const travelTime=Math.min(dt,speed/6),factor=travelTime*(1-3*travelTime/speed)
      ball.position.x+=vx*factor;ball.position.z+=vz*factor
      const remaining=Math.max(0,1-6*travelTime/speed)
      vx*=remaining;vz*=remaining
     }
    }else{
     ball.position.x+=vx*dt;ball.position.z+=vz*dt
     const drag=Math.exp(-1.25*dt);vx*=drag;vz*=drag
    }
    if(clearanceLoose&&attackSign*vx>0&&gatherPunt()){ /* Keeper takes possession before the line. */ }
    else if(Math.abs(ball.position.x)>fieldX||Math.abs(ball.position.z)>fieldZ)ballOut(vx,reboundVY,vz)
    else if(ball.position.y<=restingHeight+.28){
     let collector=-1,closest=.8
     for(const [i,mate] of players.entries()){
      if(mate.penalty||mate.age>=0)continue
      const foot=mate.sprite.position
      const distance=Math.hypot(ball.position.x-foot.x,ball.position.z-foot.z)
      if(distance<closest){closest=distance;collector=i}
     }
     let blueCollector=-1
     if(clearanceLoose){
      opponents.forEach((o,i)=>{
       const distance=Math.hypot(ball.position.x-o.sprite.position.x,ball.position.z-o.sprite.position.z)
       if(!o.penalty&&o.age<0&&distance<closest){blueCollector=i;closest=distance}
      })
     }
     if(blueCollector>=0){
      clearanceLoose=false;vx=vz=reboundVY=0
      blueWins(blueCollector,'STARS BALL')
     }else if(collector>=0){
      lastBlue=false;clearanceLoose=false
      endFollowUpRuns()
      vx=vz=reboundVY=0
      players[collector].moving=false
      el('shotResult').textContent=''
      if(charge?.action==='shot'||queued?.action==='shot'||(rollingPass&&collector!==lastSender))receivePass(collector,false)
      else{cancelCharge();active=ballPlayer=collector;held=true;carry()}
      lastSender=-1
     }
    }
   }
   if(canCollect())keeperTouch()
   for(const actor of outfield){
    const running=actor.moving&&actor.age<0
    if(actor.sprintTime===0){
     actor.sprintCharge=Math.min(actor.staminaCapacity,actor.sprintCharge+dt*actor.staminaCapacity/rechargeSeconds)
    }
    actor.runClock=running?actor.runClock+dt+actor.sprintTime*(sprintCadence-1):0
   }
   if(aerial&&(aerial.age+=dt)>.42)aerial=null
   updateReferee(dt)
   if(feedbackActor&&(feedbackTime-=dt)<=0){feedbackActor=null;callout.hidden=true}
   const controlled=players[active]
   if(nameText.textContent!==controlled.displayName)nameText.textContent=controlled.displayName
   capacity.style.transform='scaleX('+controlled.staminaCapacity/100+')'
   capacity.setAttribute('aria-valuenow',String(Math.round(controlled.staminaCapacity)))
   energy.style.transform='scaleX('+controlled.sprintCharge/100+')'
   energy.setAttribute('aria-valuenow',String(Math.round(controlled.sprintCharge)))
   ring.position.copy(players[active].sprite.position);ring.position.y=.045
   homeGoal.update(dt);attackingGoal.update(dt)
   updateSpin()
   camTarget.lerp(ball.position,1-Math.exp(-9*dt))
  }
  if(!paused){
   const dx=homeKeeper.position.x-keeperX,dz=homeKeeper.position.z-keeperZ
   sean.moving=phase==='play'&&homeKeeper.position.y<.05&&Math.hypot(dx,dz)>.15*dt
   if(sean.age<0)sean.face=sean.moving?facing(dx,dz,sean.face):facing(ball.position.x-homeKeeper.position.x,ball.position.z-homeKeeper.position.z,sean.face)
   sean.runClock=sean.moving?sean.runClock+dt:0
  }
  const kickLabel=canTackle()&&!(rushSource&&canRush())?'TACKLE':held&&ownBox(players[active].sprite.position)?'CLEAR':'KICK'
  if(el('kick').textContent!==kickLabel)el('kick').textContent=kickLabel
  switchButton.disabled=!canSwitch()
  for(const {mesh,sprite} of contactShadows){
   mesh.visible=sprite.visible
   mesh.position.set(sprite.position.x+.18,.024,sprite.position.z+.12)
   mesh.scale.setScalar(.7)
  }
  shadow.scale.setScalar(1.15-.16*(ball.position.y-restingHeight))
  shadow.position.set(ball.position.x,.03,ball.position.z)
  for(const actor of pitchActors){
    const running=actor.moving&&actor.age<0
    // Adjacent walking poses must persist briefly; strikes and decisive turns read immediately.
    const turn=Math.abs(actor.face-actor.drawFace)
    if(actor.age>=0||phase!=='play'||(turn>1&&turn<7))actor.drawFace=actor.face
    else if(actor.face!==actor.drawFace){
     if(actor.turnCandidate!==actor.face){actor.turnCandidate=actor.face;actor.turnTime=0}
     if(!paused)actor.turnTime+=dt
     if(actor.turnTime>=.065)actor.drawFace=actor.face
    }else{actor.turnCandidate=actor.face;actor.turnTime=0}
    const spriteFace=(actor.drawFace+screenRotation()+8)%8
    if(actor===referee){
     const showing=cardScene&&cardScene.time>0
     actor.sprite.scale.setScalar(cinematicPlayerSize*(showing?64/48:1));actor.sprite.center.y=2/(showing?64:48)
     if(showing){
      const col=Math.min(8,Math.floor(cardScene!.time/.09))
      cardMap.offset.set(col/9,(7-spriteFace)/8)
      actor.sprite.material.map=cardMap;continue
     }
    }
    if(spriteFace!==0&&spriteFace!==4)actor.lastSideFace=spriteFace<4?2:6
    const kickRow=actor.lastSideFace===2?0:actor.westKickRow
    const mode=actor.age>=0&&(actor.shooting||actor.tackling)&&actor.maps[2]?2:(running||actor.tackling)&&actor.maps[1]?1:0
    const cols=[8,actor.runFrames,kickPoseTimes.length][mode],rows=mode===2?actor.maps[2].image.height/48:mode===1?actor.runRows:1
    const runFrame=actor.tackling?Math.min(actor.runFrames-1,Math.floor(actor.age/.42*actor.runFrames)):actor.frameSeconds?Math.floor(actor.runClock/actor.frameSeconds):Math.floor(actor.travel/.28)
    const col=mode===2?kickPoseTimes.findLastIndex(time=>actor.age>=time):mode===1?runFrame%cols:spriteFace
    const row=mode===2?kickRow:mode===0?0:spriteFace
    const tex=actor.maps[mode]
    tex.repeat.set(1/cols,1/rows)
    tex.offset.set(col/cols,(rows-1-row)/rows)
    actor.sprite.material.map=tex
   }
  frameAction(camera,view,camTarget,16/9,view.end?attackSign:1,view.end?.8:0)
  camera.updateMatrixWorld()
  const canvas=renderer.domElement
  for(const actor of pitchActors){
   actor.world.copy(actor.sprite.position)
   if(actor!==sean&&actor!==awayGK)actor.sprite.material.rotation=0
   if(aerial&&actor===players[aerial.index]){
    const jump=Math.sin(Math.PI*Math.min(1,aerial.age/.42))
    actor.sprite.position.y+=jump*(aerial.style==='VOLLEY'?.22:.72)
    actor.sprite.material.rotation=jump*(aerial.style==='BICYCLE KICK'?2.25:aerial.style==='HEADER'?.23:.13)*(actor.lastSideFace===2?-1:1)
   }
   screenPoint.copy(actor.sprite.position).project(camera)
   screenPoint.x=snap(screenPoint.x,2/canvas.width)
   screenPoint.y=snap(screenPoint.y,2/canvas.height)
   actor.sprite.position.copy(screenPoint.unproject(camera))
  }
  const selected=players[active].sprite
  screenUp.setFromMatrixColumn(camera.matrixWorld,1)
  headScreen.copy(selected.position).addScaledVector(screenUp,selected.scale.y*(1-selected.center.y)).project(camera)
  nameplate.style.left=Math.round((headScreen.x+1)*canvas.clientWidth/2)+'px'
  nameplate.style.top=Math.round((1-headScreen.y)*canvas.clientHeight/2-3)+'px'
  nameplate.hidden=false
  if(feedbackActor){
   const sprite=feedbackActor.sprite
   headScreen.copy(sprite.position).addScaledVector(screenUp,sprite.scale.y*(1-sprite.center.y)).project(camera)
   callout.style.left=Math.round((headScreen.x+1)*canvas.clientWidth/2)+'px'
   callout.style.top=Math.round((1-headScreen.y)*canvas.clientHeight/2-(feedbackActor===players[active]?58:8)-8*(1-feedbackTime/1.05))+'px'
   callout.style.opacity=String(Math.min(1,feedbackTime/.22))
  }
  if(!paused&&phase==='play')replay.record(dt,(shotDirection===1?attackingGoal:homeGoal).rippleTime)
  renderer.render(scene,camera)
  for(const actor of pitchActors)actor.sprite.position.copy(actor.world)
  if(celebrating&&resultTime<=0){
   celebrating=false
   if(replay.begin()){
    goalBanner.hidden=true;el('replayLabel').textContent=replay.label+(replay.cut===2?' · A: Kickoff':' · A: Next angle')
    ring.visible=false;nameplate.hidden=true;callout.hidden=true;switchButton.disabled=true
    el('shotResult').textContent=''
   }else reset(shotDirection===attackSign)
  }
  requestAnimationFrame(tick)
 }
 requestAnimationFrame(tick)
}
start().catch(()=>{el('message').textContent='The pitch needs WebGL. Open this file in a browser with hardware acceleration enabled.'})
