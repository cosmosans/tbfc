import {playPenalties} from './penaltyArena'
import type {Kick} from './shootoutRules'
import {fixtureRequiresWinner} from './careerSeason'
import {costumeSmoke} from './costumeSmoke'
import meghanGoalUrl from './art/meghan-hockey-goal.png?url'
import meghanSkateUrl from './art/meghan-skate.png?url'
import nelsonGoalUrl from './art/nelson-goal.png?url'
import janGoalUrl from './art/jan-goal.png?url'
import stubbsSlideUrl from './art/stubbs-slide.png?url'
import {careerRating,type Attribute} from './careerDevelopment'
import {playerRatings,ratingLabels} from './playerRatings'
import {scoreRow,statRow} from './leagueBoard'
import './fullTime.css'
import {careerHub,headshots,ratings,type Ticket} from './careerHub'
import {pauseMenu} from './pauseMenu'
import {simulateRemainder,scoreboardAt,finishRound,opponent,type Report} from './careerSeason'
import {saveSlot} from './careerStore'
import {createBurningBall} from './burningBall'
import {outOfPosition} from './lineupRoles'
import {pairRating} from './lineupChemistry'
import { profiles } from './difficulty'
import {celebrationControls} from './celebrationLab'
import {broadcastDirector,broadcastShirt,broadcastStarters} from './menuBroadcast'
import {hint,reveal} from './screenUI'
import {createChipBins} from './chipBins'
import {practiceMenu} from './practiceMenu'
import {freeDrill,aerialDrill,warmupPanel,shotPoints} from './warmup'
import {startMenuMusic,type MenuMusic} from './menuMusic'
import {mainMenu,mountMenuBackdrop} from './mainMenu'
import {goalCannons} from './goalCannons'
import {kneelingPose} from './kneelingPose'
import mandyGoalUrl from './art/mandy-goal.png?url'
import pamGoalUrl from './art/pam-goal.png?url'
import nadiaIdle from './art/nadia-idle.png?url'
import nadiaRun from './art/nadia-run.png?url'
import nadiaKick from './art/nadia-side-kicks.png?url'
import nadiaFall from './art/nadia-fall.png?url'
import nelsonIdle from './art/nelson-idle.png?url'
import nelsonRun from './art/nelson-run.png?url'
import nelsonKick from './art/nelson-side-kicks.png?url'
import nelsonFall from './art/nelson-fall.png?url'
import stubbsFall from './art/stubbs-fall.png?url'
import meghanFall from './art/meghan-fall.png?url'
import chrisFall from './art/chris-fall.png?url'
import mandyFall from './art/mandy-fall.png?url'
import seanFall from './art/sean-fall.png?url'
import danielFall from './art/daniel-fall.png?url'
import stevenFall from './art/steven-fall.png?url'
import joseFall from './art/jose-fall.png?url'
import starsFall from './art/stars-fall.png?url'
import rivalKeeperFall from './art/rival-keeper-fall.png?url'
import {rivalSprites} from './rivalSprites'
import {clubAccent,burners,clubs,type Club,type Fixture} from './opponentSquads'
import {selectSides,playerColor,type Seat} from './sideSelect'
import {selectTeams} from './teamSelect'
import {menuDirection,menuPad} from './menuPad'
import type {Selection} from './lineup'
import trainingIdle from './art/blue-chris-idle.png?url'
import trainingRun from './art/blue-chris-run.png?url'
import trainingKick from './art/blue-side-kicks.png?url'
import danielIdle from './art/daniel-idle.png?url'
import danielRun from './art/daniel-run.png?url'
import danielKick from './art/daniel-side-kicks.png?url'
import {defaultSettings} from './matchSettings'
import stevenIdle from './art/steven-idle.png?url'
import stevenRun from './art/steven-run.png?url'
import stevenKick from './art/steven-side-kicks.png?url'
import spiderIdleUrl from './art/spider-jose-idle.png?url'
import spiderRunUrl from './art/spider-jose-run.png?url'
import joseIdle from './art/jose-idle.png?url'
import joseRun from './art/jose-run.png?url'
import joseKick from './art/jose-side-kicks.png?url'
import {selectLineup, positions, bios, burnerEligibility} from './lineup'
import janIdle from './art/jan-idle.png?url'
import janRun from './art/jan-run.png?url'
import janKick from './art/jan-side-kicks.png?url'
import { audio } from './matchAudio'
import cardSheet from './art/ref-yellow-card.png?url'
import stubbsKick from './art/stubbs-side-kicks.png?url'
import mandyKick from './art/mandy-side-kicks.png?url'
import jeremyKick from './art/jeremy-side-kicks.png?url'
import seanKick from './art/sean-side-kicks.png?url'
import blueKick from './art/stars-side-kicks.png?url'
import tealKick from './art/teal-side-kicks.png?url'
import tealIdle from './art/teal-idle.png?url'
import mandyIdle from './art/mandy-idle.png?url'
import mandyRun from './art/mandy-run.png?url'
import jeremyIdle from './art/jeremy-idle.png?url'
import jeremyRun from './art/jeremy-run.png?url'
import seanIdle from './art/sean-idle.png?url'
import seanRun from './art/sean-run.png?url'
import { GoalReplay, strikerView, frameAction, cinematicPlayerSize, cinematicBallSize } from './replay'
import refereeIdle from './art/ref-idle.png?url'
import refereeRun from './art/ref-run.png?url'
import { advanceOutBall } from './perimeter'
import pamSideKicks from './art/pam-side-kicks.png?url'
import chrisSideKicks from './art/chris-side-kicks.png?url'
import meghanKick from './art/meghan-kick-preview.png?url'
import awayKeeperEnd from './art/keeper-end.png?url'
import stubbsIdle from './art/stubbs-idle.png?url'
import stubbsRun from './art/stubbs-run.png?url'
import { buildGrounds } from './grounds'
import { createGoal } from './goal'
import keeperImage from './art/practice-keeper.png?url'
import { planShot, shotFeedback } from './shooting'
import ballSheet from './art/ball-spin.png?url'
import { kickArc, heightAt, nextTouch } from './ballArc'
import oxaniumUrl from './fonts/oxanium.ttf?url'
import upheavalUrl from './fonts/upheavtt.ttf?url'
import * as T from 'three'
import pam_idle from './art/pam-idle.png?url'
import pam_run from './art/pam-run.png?url'

import blueIdle from './art/stars-idle.png?url'
import blueRun from './art/stars-run.png?url'
import chris_idle from './art/chris-idle.png?url'
import chris_run from './art/chris-run.png?url'
import meghan_idle from './art/meghan-pixellab-idle.png?url'
import meghan_run from './art/meghan-pixellab-run.png?url'
const uiFont = new FontFace('Oxanium', 'url(' + oxaniumUrl + ')', {weight:'200 800', display:'swap'})
document.fonts.add(uiFont)
void uiFont.load()
const hudFont = new FontFace('Upheaval', 'url(' + upheavalUrl + ')')
document.fonts.add(hudFont)
void hudFont.load()

const el=(id:string)=>document.getElementById(id)!
async function start(){
 const kits:Record<string,[string,string,string]>={Meghan:[meghan_idle,meghan_run,meghanKick],Pam:[pam_idle,pam_run,pamSideKicks],Jan:[janIdle,janRun,janKick],Mandy:[mandyIdle,mandyRun,mandyKick],Jeremy:[jeremyIdle,jeremyRun,jeremyKick],Chris:[chris_idle,chris_run,chrisSideKicks],Sean:[seanIdle,seanRun,seanKick],Stubbs:[stubbsIdle,stubbsRun,stubbsKick],José:[joseIdle,joseRun,joseKick],Steven:[stevenIdle,stevenRun,stevenKick],Daniel:[danielIdle,danielRun,danielKick],Nelson:[nelsonIdle,nelsonRun,nelsonKick],Nadia:[nadiaIdle,nadiaRun,nadiaKick]}
 const fallSheets:Record<string,string|undefined>={Nadia:nadiaFall,Stubbs:stubbsFall,Meghan:meghanFall,Chris:chrisFall,Mandy:mandyFall,Sean:seanFall,Daniel:danielFall,Steven:stevenFall,José:joseFall}
 const settings=defaultSettings()
 const difficulty=()=>profiles[settings.difficulty]
 const burnerPortraits=Object.fromEntries(Object.entries(kits).map(([name,kit])=>[name,kit[0]]))
 let fixture:Fixture|undefined,lineup:Selection|null=null,portraits=burnerPortraits
 audio.state(true,false)
 let music:MenuMusic|undefined
 let ticket:Ticket|null=null
 let selectedDrill=-1,practiceNames:string[]=[]
 let standalonePractice=false
 let seats:Seat[]|null=null
 let simulation=false
 let penaltyLab=false
 let burnLab=false
 let celebrationLab=false
 const broadcast=new URLSearchParams(location.search).get('broadcast')==='1'
 if(broadcast){
  document.documentElement.dataset.broadcast=''
  settings.weather='Rain'
  fixture={home:burners,away:clubs[1+Math.floor(Math.random()*(clubs.length-1))]}
  lineup={shape:'1-3-3',starters:broadcastStarters(Object.keys(kits),burners.keeper,burnerEligibility),bench:[]}
 }else{
  music=startMenuMusic(!audio.muted,on=>audio.setMuted(!on))
  const returning=history.state?.arcadeMenu===true
  if(returning||history.state?.arcadeCareer!==undefined){
   history.replaceState({...history.state,arcadeMenu:false},'')
   music.start(false)
  }
  const removeBackdrop=mountMenuBackdrop()
  let resume=history.state?.arcadeCareer as number|undefined
  let destination=resume!==undefined?'career':history.state?.practiceMenu?'practice':await mainMenu(music,!returning)
  do{
   seats=null;simulation=false
   if(destination==='career'){
    ticket=await careerHub(burnerPortraits,settings,resume)
    resume=undefined
    history.replaceState({...history.state,arcadeCareer:ticket?.slot},'')
    if(!ticket){destination=await mainMenu(music);continue}
    fixture=ticket.fixture;lineup=ticket.lineup
    portraits=Object.fromEntries([...lineup.starters,...lineup.bench].map(n=>[n,burnerPortraits[n]]))
    break
   }
   if(destination==='simulate'){
    simulation=true
    const home=clubs[Math.floor(Math.random()*clubs.length)]
    const visitors=clubs.filter(club=>club!==home)
    fixture={home,away:visitors[Math.floor(Math.random()*visitors.length)]}
    lineup={shape:'1-3-3',starters:[...home.outfield,home.keeper],bench:[...home.bench]}
    break
   }
   if(destination==='burnLab'||destination==='penalties'){
    burnLab=destination==='burnLab';penaltyLab=destination==='penalties'
    fixture={home:burners,away:clubs[clubs.length-1]}
    lineup={shape:'1-3-3',starters:[...burners.outfield,burners.keeper],bench:[...burners.bench]}
    break
   }
   if(destination==='celebrations'){
    celebrationLab=true
    fixture={home:burners,away:clubs[clubs.length-1]}
    lineup={shape:'1-3-3',starters:[...burners.outfield,burners.keeper],bench:[]}
    break
   }
   if(destination==='practice'){
    history.replaceState({...history.state,practiceMenu:false},'')
    const choice=await practiceMenu(burnerPortraits)
    if(!choice){destination=await mainMenu(music);continue}
    selectedDrill=choice.drill;practiceNames=choice.names;standalonePractice=true;fixture={home:burners,away:clubs[clubs.length-1]};lineup={shape:'1-3-3',starters:[...burners.outfield,burners.keeper],bench:[...burners.bench],warmup:true};break}
   const selected=await selectTeams(fixture)
   if(!selected){destination=await mainMenu(music);continue}
   fixture=selected
   seats=await selectSides(fixture)
   if(!seats)continue
   simulation=seats.length===0
   const club=fixture.home
   portraits=club===burners?burnerPortraits:Object.fromEntries([...club.outfield,...club.bench,club.keeper].map(n=>[n,rivalSprites(club,n)?.idle??(n===club.keeper?tealIdle:trainingIdle)]))
   lineup=await selectLineup(portraits,fixture,undefined,settings)
  }while(!lineup)
  removeBackdrop()
  music.finish()
 }
 // Only earned points modify the existing match tuning. Substitutions move the bonus with the player.
 const gains=new Map<Attribute,number>()
 if(ticket){
  const c=ticket.career,base=playerRatings[bios[c.player][0]]!
  ratingLabels.forEach((stat,i)=>gains.set(stat,careerRating(c,c.player,stat,base[i])-base[i]))
 }
 function trainingFactor(name:string,stat:Attribute){
  return ticket&&name===ticket.career.player?1+(gains.get(stat)??0)*.01:1
 }
 const aiHome=broadcast||simulation||!!seats&&!seats.some(s=>s.side===-1)
 const {home,away:matchOpponent}=fixture
 const homeLabel=home===burners?'TBFC':home.name
 const freePractice=selectedDrill===freeDrill
 const homeShape=positions(lineup.shape)
 const renderer=new T.WebGLRenderer({canvas:document.querySelector('canvas')!,antialias:true})
 const scene=new T.Scene(); scene.background=new T.Color(0x284b37)
 const camera=new T.PerspectiveCamera(strikerView.fov,1,.1,140)
 const distance=Math.hypot(strikerView.along,strikerView.side)
 const views=[
  {...strikerView,label:'End to end',end:true,along:-distance,side:0},
  {...strikerView,label:'Sideline',end:false,along:0,side:distance}
 ]
 let viewIndex=1
 let view=views[viewIndex]
 el('changeView').textContent=view.label
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
 const updateWeather=await buildGrounds(scene,renderer,settings,home)
 const lines=0xb8d9b1
 for(const z of [-fieldZ,fieldZ])box(0,.01,z,42,.02,.07,lines)
 for(const x of [-fieldX,0,fieldX])box(x,.01,0,.07,.02,24,lines)
 for(const sign of [-1,1]){
  for(const z of [-4.6,4.6])box(sign*18.8,.02,z,4.4,.02,.07,lines)
  box(sign*16.6,.02,0,.07,.02,9.2,lines)
  if(sign===1)box(fieldX,.025,0,.12,.02,4,0xffebad)
 }
 const westCannons=goalCannons(scene,-fieldX),eastCannons=goalCannons(scene,fieldX)
 let fireEnd=0
 function showGoalFire(time:number){
  westCannons(fireEnd===-1?time:-1);eastCannons(fireEnd===1?time:-1)
 }
 const matchView=renderer.domElement.parentElement!
 const freezeFrame=document.createElement('canvas')
 freezeFrame.className='replay-backdrop';freezeFrame.setAttribute('aria-hidden','true')
 const reducedReplayMotion=matchMedia('(prefers-reduced-motion: reduce)')
 const dissolveLayer=document.createElement('canvas')
 dissolveLayer.className='replay-dissolve';dissolveLayer.setAttribute('aria-hidden','true')
 const dissolveContext=dissolveLayer.getContext('2d')!
 let lastAngle=-1,lastCursor=0,outgoing:{angle:number,cursor:number,age:number}|null=null
 function endDissolve(){outgoing=null;dissolveLayer.remove()}
 function renderReplayView(){
    for(const {mesh,sprite} of contactShadows)mesh.position.set(sprite.position.x+.18,.024,sprite.position.z+.12)
    shadow.position.set(ball.position.x,.03,ball.position.z)
    shadow.scale.setScalar(1.15-.16*(ball.position.y-restingHeight))
    for(const {mesh} of contactShadows)mesh.scale.setScalar(.7)
    replay.render(renderer,scene)
    for(const {mesh} of contactShadows)mesh.scale.setScalar(1)
 }
 function endReplayInset(){
  matchView.classList.remove('replay-inset');freezeFrame.remove()
 }
 function beginReplayInset(){
  matchView.classList.add('in-replay')
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return
  const live=renderer.domElement
  freezeFrame.width=live.width;freezeFrame.height=live.height
  freezeFrame.getContext('2d')?.drawImage(live,0,0)
  matchView.prepend(freezeFrame);matchView.classList.add('replay-inset')
 }
 renderer.domElement.addEventListener('animationend',e=>{if(e.animationName==='broadcast-in')endReplayInset()})
 const homeGoal=createGoal(scene,-fieldX)
 const attackingGoal=createGoal(scene,fieldX)
 let aerial:{index:number,style:string,age:number}|null=null
 let shotDirection=1
 let netTravel=false
 const circle=new T.Mesh(new T.RingGeometry(2.9,2.97,64),new T.MeshBasicMaterial({color:lines,side:T.DoubleSide}));circle.rotation.x=-Math.PI/2;circle.position.y=.035;scene.add(circle)
 async function createPlayer(name:string, displayName:string, urls:string[], runRows=8, frameSeconds=0, westKickRow=3){
  const maps=await Promise.all(urls.map(async url=>{
  const tex=await new T.TextureLoader().loadAsync(url);tex.magFilter=tex.minFilter=T.NearestFilter;tex.generateMipmaps=false;tex.colorSpace=T.SRGBColorSpace;
  if(broadcast&&guestSheets.includes(url))broadcastShirt(tex,matchOpponent.name)
  return tex
 }))

  // Measure the front idle pose without its transparent cell padding.
  const idle=maps[0],size=idle.image.height,measure=document.createElement('canvas')
  measure.width=measure.height=size
  const ctx=measure.getContext('2d')!
  ctx.drawImage(idle.image,0,0,size,size,0,0,size,size)
  const pixels=ctx.getImageData(0,0,size,size).data
  let left=size,right=-1
  for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(pixels[(y*size+x)*4+3]>32){left=Math.min(left,x);right=Math.max(right,x)}
  idle.userData.bodyWidth=right>=left?(right-left+1)/size:.55
  const shirt=new T.SpriteMaterial({map:maps[0],transparent:true,depthWrite:false})
  const sprite=new T.Sprite(shirt);sprite.center.set(.5,2/48);sprite.scale.setScalar(2.5);scene.add(sprite)
  const runFrames=maps[1]?maps[1].image.width/(maps[1].image.height/runRows):1
  return {name,displayName,sprintCharge:100,staminaCapacity:100,sprintTime:0,sprite,maps,westKickRow,lastSideFace:2,runFrames,runRows,frameSeconds,runClock:0,world:new T.Vector3(),face:2,drawFace:2,turnCandidate:2,turnTime:0,lateChallenges:0,penalty:0,age:-1,tackling:false,shooting:false,travel:0,moving:false,goal:new T.Vector3(),velocity:new T.Vector3()}
 }
 let crossingDrill=false
 let attackSign=1,half=1,matchSeconds=0,homeScore=0,awayScore=0
 let phase:'kickoff'|'freeKick'|'play'|'halftime'|'fulltime'='kickoff'
 let centerPass=false
 let kickoffBlue=false,breakSeconds=0,lastBlue=false
 const scoreboard=el('scoreboard')
 ;(el('awayCrest') as HTMLImageElement).src=matchOpponent.crest
 ;(el('bugCrest') as HTMLImageElement).src=home.crest
 scoreboard.querySelector('.bug-long')!.textContent=home.name
 scoreboard.querySelector('.bug-short')!.textContent=home===burners?'TBFC':home.name.split(' ').filter(w=>w!=='FC').map(w=>w[0]).join('')
 scoreboard.querySelector('.bug-away-name')!.textContent=matchOpponent.name
 el('awayPenalties').setAttribute('aria-label',matchOpponent.name+' penalties')
 el('homePenalties').setAttribute('aria-label',home.name+' penalties')
 renderer.domElement.setAttribute('aria-label',home.name+' versus '+matchOpponent.name)
 function updateScore(){
  const seconds=Math.min(1500,Math.floor(matchSeconds))
  const text=homeLabel+' '+homeScore+' – '+awayScore+' '+matchOpponent.name+'  ·  '+(phase==='fulltime'?'FT':phase==='halftime'?'HT':half+'H')+'  '+Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0')
  if(scoreboard.getAttribute('aria-label')===text)return
  scoreboard.setAttribute('aria-label',text);scoreboard.title=text
  el('homeGoals').textContent=String(homeScore);el('awayGoals').textContent=String(awayScore)
  el('bugPeriod').textContent=phase==='fulltime'?'FT':phase==='halftime'?'HT':half===1?'1ST':'2ND'
  el('bugClock').textContent=Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0')
 }
 const labels:Record<string,string>={Meghan:'#6 Meghan',Pam:'#8 Pam',Stubbs:'#12 STUBBS'}
 const makeBurner=(name:string)=>{
  const fall=fallSheets[name]
  return createPlayer(labels[name]??name,name,fall?[...kits[name],fall]:kits[name],8,name==='Sean'?.14:.2,name==='Meghan'?3:1)
 }
 const trainingSheets=[trainingIdle,trainingRun,trainingKick]
 const guestSheets=[blueIdle,blueRun,blueKick,starsFall]
 const keeperSheets=[tealIdle,trainingRun,tealKick,rivalKeeperFall]
 function makeRival(club:Club,name:string,fallback:string[]){
  const art=rivalSprites(club,name)
  const sheets=art?[art.idle,art.run,art.kick,...fallback.slice(3)]:fallback
  return createPlayer(name,name,sheets,8,.2,1)
 }
 const makeHomePlayer=(name:string)=>home===burners?makeBurner(name):makeRival(home,name,name===home.keeper?keeperSheets:trainingSheets)
 const fieldPlayers=freePractice?practiceNames:celebrationLab?Object.keys(kits).filter(n=>n!==home.keeper):lineup.starters.slice(0,6)
 const players=await Promise.all(fieldPlayers.map(makeHomePlayer))
 const lanes=celebrationLab||freePractice?[]:[-10,0,10,-7,0,7]
 const opponents=await Promise.all((crossingDrill?[]:lanes).map((_,i)=>matchOpponent===burners?makeBurner(matchOpponent.outfield[i]):makeRival(matchOpponent,matchOpponent.outfield[i],guestSheets)))
 const outfield=[...players,...opponents]
 const referee=await createPlayer('Referee','Referee',[refereeIdle,refereeRun],8,.16)
 const sean=await makeHomePlayer(lineup.starters[6])
 const homeSlots=[...players,sean]
 const reserves=await Promise.all(lineup.bench.map(makeHomePlayer))
 reserves.forEach(m=>scene.remove(m.sprite))
 const matchBench=lineup.bench.slice()
 // Keep the pitch slot, ball action and replay sprite stable; identity and fitness travel together.
 const identity=(m:typeof sean)=>({name:m.name,displayName:m.displayName,maps:m.maps,westKickRow:m.westKickRow,
  runFrames:m.runFrames,runRows:m.runRows,frameSeconds:m.frameSeconds,sprintCharge:m.sprintCharge,
  staminaCapacity:m.staminaCapacity,lateChallenges:m.lateChallenges,penalty:m.penalty})
 const squad=new Map([...homeSlots,...reserves].map(m=>[m.displayName,identity(m)]))
 const careerGoals:Report['goals']=[]
 const careerShots:[number,number]=[0,0],onTarget=[0,0],woodwork=[0,0]
 const highlights:{clip:GoalReplay,direction:number,label:string,angle:number,card:boolean}[]=[]
 const newFacts=()=>({fouls:[0,0],corners:[0,0],yellow:[0,0],tackles:[0,0],passes:[0,0],control:[0,0],metres:[0,0],personalPasses:0,assists:0})
 let facts=newFacts()
 let lastDelivery:{sender:string,receiver:string}|null=null,homePasser=''
 let goalEvent:{label:string,start:number,direction:number}|null=null
 function keepEvent(clip:GoalReplay|null,label:string,direction:number,card=false){
  if(!clip)return
  const first=Math.floor(Math.random()*4),second=(first+1+Math.floor(Math.random()*3))%4
  for(const angle of [first,second])highlights.push({clip,label,direction,angle,card})
 }
 function finishGoalEvent(){
  if(!goalEvent)return
  keepEvent(replay.highlight(goalEvent.start),goalEvent.label,goalEvent.direction)
  goalEvent=null
 }
 let fullTimeScreen=false
 const appearances=new Set(lineup.starters)
 function applyTeam(starters:string[],bench:string[]){
  if(ticket)for(const name of starters)appearances.add(name)
  for(const m of homeSlots)squad.set(m.displayName,identity(m))
  for(const [i,name] of starters.entries()){
   const slot=homeSlots[i]
   if(slot.displayName===name)continue
   Object.assign(slot,squad.get(name));slot.sprite.name=name;slot.sprite.material.map=slot.maps[0]
  }
  matchBench.splice(0,matchBench.length,...bench)
 }
 let squadOpen=false
 const awayGK=await (matchOpponent===burners?makeBurner(matchOpponent.keeper):makeRival(matchOpponent,matchOpponent.keeper,keeperSheets))
 const pitchActors=[...outfield,referee,sean,awayGK]
 const exhaustionMarkers=[...outfield,sean,awayGK].map(actor=>{
  const icon=document.createElement('span')
  icon.className='exhaustion-marker';icon.hidden=true
  icon.innerHTML='<b>Z</b><b>Z</b><small>zzz…</small>'
  renderer.domElement.parentElement!.append(icon)
  return {actor,icon}
 })
 let blueCarrier=-1,pressTime=0,pressing=-1,turnoverGrace=0,noticeTime=0
 // Z lanes stay distinct as the block slides toward the ball.

 let bluePass:{sender:string,receiver:number,start:T.Vector3,end:T.Vector3,age:number,duration:number,loft?:number}|null=null
 let blueDecisionTime=0
 let dribbleSide=1
 const previousPassPosition=new T.Vector3()
 const keeperHomeX=fieldX-1.4
 const keeper=awayGK.sprite
 keeper.position.x=keeperHomeX
 const homeKeeper=sean.sprite
 homeKeeper.position.x=-keeperHomeX
 keeper.name=matchOpponent.keeper;homeKeeper.name=sean.displayName
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
 const burnHud=el('burnHud')
 const burnEnabled=!celebrationLab&&!broadcast&&!standalonePractice
 burnHud.hidden=!burnEnabled
 const meters=[home,matchOpponent].map((club,i)=>{
  const node=document.createElement('div')
  node.className='burn-meter'
  node.style.setProperty('--club',clubAccent(club))
  node.innerHTML='<span><i></i></span>'
  node.setAttribute('role','meter');node.setAttribute('aria-label',club.name+' Burn')
  node.setAttribute('aria-valuemin','0');node.setAttribute('aria-valuemax','100')
  burnHud.append(node)
  if(i===0){const title=document.createElement('b');title.className='burn-title';title.textContent='BURN';burnHud.append(title)}
  return {node,value:burnLab&&i===0?100:0,seconds:0,pair:'',chain:new Set<string>()}
 })
 let aerialWindup=false
 let blastShooter:typeof sean|null=null,blastWindup=0,impactTime=0,blastFlying=false
 function renderBurn(side:number){
  const m=meters[side]
  m.node.style.setProperty('--burn',String(m.value/100))
  m.node.setAttribute('aria-valuenow',String(m.value))
  m.node.toggleAttribute('data-on-fire',m.value===100)
 }
 function resetBurn(side?:number){
  for(const i of side===undefined?[0,1]:[side]){
   const m=meters[i];m.value=burnLab&&i===0?100:0;m.seconds=0;renderBurn(i)
  }
 }
 function changeBurn(delta:number,side=0){
  const m=meters[side]
  if(!burnEnabled||crossingDrill||m.value===100||!delta)return
  m.value=T.MathUtils.clamp(m.value+delta,0,100)
  if(m.value===100)m.seconds=20
  renderBurn(side)
 }
 resetBurn()
 function passBurn(side:number,from:string,to:string,base:number,fitCost=0,perfect=false){
  const m=meters[side],pair=[from,to].sort().join('|')
  const club=side===0?home:matchOpponent
  const link=pairRating(club.name,from,to,side===0?ticket?.career.bonds:undefined)
  m.chain.add(from);m.chain.add(to)
  changeBurn(pair===m.pair?1:base+(link>=70?5-fitCost:0)+(perfect?3:0)+(m.chain.size===4?5:0),side)
  if(m.chain.size>=4){m.chain.clear();m.chain.add(to)}
  m.pair=pair
 }
 function creditPass(receiver:number,oneTouch:boolean){
  if(lastSender<0||receiver===lastSender||!burnEnabled||crossingDrill)return
  const from=players[lastSender].displayName,to=players[receiver].displayName
  const fitCost=Number(outOfPosition(home.name,from,homeShape[lastSender]?.role??'GK'))+
   Number(outOfPosition(home.name,to,homeShape[receiver]?.role??'GK'))
  passBurn(0,from,to,passKind==='through'?12:oneTouch?8:5,fitCost,perfectPass)
 }
 const shotStart=new T.Vector3()
 const switchButton=el('switchPlayer') as HTMLButtonElement
 let reboundRunner=-1
 let reboundVY=0
 let outBall:{remaining:number,goalEnd:number,spot:T.Vector3,blueRestart:boolean,corner:boolean}|null=null
 const outVelocity=new T.Vector3()
 function ballOut(dx:number,dy:number,dz:number,miss?:'Wide'|'Over'){
  const goalEnd=Math.abs(ball.position.x)>fieldX?Math.sign(ball.position.x):0
  const corner=!!goalEnd&&(goalEnd===attackSign?lastBlue:!lastBlue)
  lastDelivery=null;homePasser=''
  if(ticket&&corner)facts.corners[lastBlue?0:1]++
  outBall={remaining:freePractice?2:.95,goalEnd,spot:ball.position.clone(),blueRestart:!lastBlue,corner}
  outVelocity.set(dx,dy,dz)
  cancelCharge();endFollowUpRuns();clearPassCall();perfectPass=false
  inFlight=false;held=false;windupReceiver=-1;blueCarrier=-1;bluePass=null;lastSender=-1;noticeTime=0
  if(freePractice){
   if(goalEnd&&Math.abs(ball.position.z)<2&&ball.position.y<2){
    const net=goalEnd===1?attackingGoal:homeGoal
    net.strike(ball.position.x,ball.position.y,ball.position.z,.5)
    audio.play('net',.48);outVelocity.multiplyScalar(.15)
   }
   return
  }
  el('shotResult').textContent=goalEnd?(corner?'CORNER':miss?miss.toUpperCase()+' · GOAL KICK':'GOAL KICK'):'OUT OF TOUCH'
 }
 let keeperRestart:{age:number,start:T.Vector3,end:T.Vector3,punt?:boolean,blueBuild?:boolean,goalKick?:boolean}|null=null
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
 const burningBall=createBurningBall(scene)
 const flames=Array.from({length:12},(_,i)=>{
  const sprite=new T.Sprite(new T.SpriteMaterial({color:i<4?0xffdd54:0xff5616,transparent:true,depthWrite:false,opacity:1-i/14,blending:T.AdditiveBlending}))
  sprite.visible=false;scene.add(sprite);return sprite
 })
 const replay=new GoalReplay([...pitchActors.map(m=>m.sprite),ball],ball,pitchActors,fieldX,[burningBall.fire,...flames])
 async function celebrationSheet(url:string){
  const map=await new T.TextureLoader().loadAsync(url)
  map.minFilter=map.magFilter=T.NearestFilter;map.generateMipmaps=false;map.colorSpace=T.SRGBColorSpace
  map.repeat.set(48/map.image.width,1)
  return map
 }
 const [pamGoal,mandyGoal,spiderIdle,spiderRun,meghanGoal,nelsonGoal,janGoal,meghanSkate,stubbsSlide]=await Promise.all([
  pamGoalUrl,mandyGoalUrl,spiderIdleUrl,spiderRunUrl,meghanGoalUrl,nelsonGoalUrl,janGoalUrl,meghanSkateUrl,stubbsSlideUrl
 ].map(celebrationSheet))
 stubbsSlide.repeat.y=1/8;stubbsSlide.userData.directionalRun=true
 spiderIdle.userData.directionalIdle=true
 spiderRun.repeat.y=1/8;spiderRun.userData.directionalRun=true
 meghanSkate.repeat.y=1/8
 meghanSkate.userData.directionalRun=true
 mandyGoal.repeat.y=1/8
 mandyGoal.userData.directionalCelebration=true
 const celebrations:Partial<Record<string,T.Texture>>={Pam:pamGoal,Mandy:mandyGoal,José:spiderIdle,Meghan:meghanGoal,Nelson:nelsonGoal,Jan:janGoal}
 const costumeChange=costumeSmoke(scene)
 const costumeRevealTime=.20
 let costumeReveal=false
 let runCelebration:T.Texture|undefined
 const slideDuration=6
 const slideDistanceAt=(age:number)=>fieldX*(1-(1-Math.min(1,Math.max(0,age/slideDuration)))**2)
 let slideX=0,slideZ=0
 let goalMap:T.Texture|undefined
 let celebrationRunSeconds=3.5
 let groupStarted=false
 // The camera flashes on frame nine of Mandy’s 200 ms-per-frame animation.
 const photoAt=3,photoStart=photoAt-9*.2
 const frontRow=new Set<typeof sean>()
 let scorer:typeof sean|null=null,goalAge=0
 let celebrant:typeof sean|null=null
 let walks:{actor:typeof sean,target:T.Vector3,gather:boolean}[]=[]
 let celebrating=false
 const goalBanner=el('goalBanner'),replayPanel=el('replayPanel')
 function clearReplay(){
  finishGoalEvent()
  endDissolve();lastAngle=-1
  costumeChange.hide()
  endReplayInset();matchView.classList.remove('in-replay');fireEnd=0;showGoalFire(-1)
  replay.clear();celebrating=false;celebrant=null;walks=[]
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
 let passWasFirstTime=false
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
  return !paused&&!freePractice&&!crossingDrill&&!held&&!inFlight&&!outBall&&!keeperRestart&&keeperGather<=0&&resultTime<=0&&
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
  return phase==='play'&&!paused&&!celebrating&&!held&&!inFlight&&blueCarrier<0&&(!bluePass||!!bluePass.loft)&&
   !outBall&&(!keeperRestart||!keeperRestart.blueBuild&&keeperRestart.age>=.45)&&keeperGather<=0&&resultTime<=0&&(!shot||shotDirection===attackSign)
 }
 const blastMultiplier=1.95
 function canBlast(actor:typeof sean){return meters[0].value===100&&!crossingDrill&&!ownBox(actor.sprite.position)}
 const jumps=new Map<typeof sean,number>()
 function jumpHeight(actor:typeof sean){
  const age=jumps.get(actor)
  return age===undefined?0:Math.sin(Math.PI*Math.min(1,age/.72))*.94
 }
 function jump(actor:typeof sean){
  if(phase==='play'&&!paused&&!celebrating&&!freeKick&&!outBall&&!shot&&replay.cut<0&&!blastShooter&&
     !actor.penalty&&actor.age<0&&!jumps.has(actor))jumps.set(actor,0)
 }
 function claimAirball(){
  const ballPos=ball.position
  if(ballPos.y<.60||Math.abs(ballPos.x)>fieldX||Math.abs(ballPos.z)>fieldZ)return false
  let closest=.95,winner:typeof sean|undefined
  for(const actor of outfield){
   if(!actor.sprite.visible||actor.penalty||actor.age>=0||inFlight&&actor===players[lastSender])continue
   const pos=actor.sprite.position,distance=Math.hypot(pos.x-ballPos.x,pos.z-ballPos.z)
   if(ballPos.y>1&&ballPos.y<2.5&&distance<1.5)jump(actor)
   const lift=jumpHeight(actor)
   if(lift<.15||ballPos.y>1.35+lift||distance>=closest)continue
   closest=distance;winner=actor
  }
  if(!winner)return false
  keeperRestart=null;clearanceLoose=struckLoose=false;vx=vz=reboundVY=0
  const i=players.indexOf(winner)
  if(crossingDrill&&training.drill===aerialDrill){
   if(i!==active){finishRep(0,'Defender won the duel');return true}
   if((charge??queued)?.action!=='shot'){finishRep(5,'Claimed · charge B before contact');return true}
   firstTimeCross=true
  }
  if(i<0)blueWins(opponents.indexOf(winner),'AIR BALL')
  else{
   if(i!==active)cancelCharge()
   if(!inFlight)homePasser=''
   bluePass=null;blueCarrier=-1;lastBlue=false
   receivePass(i,true)
  }
  return true
 }
 function press(action:Action,source:string){
  if(blastShooter)return
  if(!broadcast)audio.unlock()
  if(crossingDrill&&(bins.flying||repReset>=0||training.count===5))return
  if(replay.cut>=0&&action==='pass'){
   if(!paused&&!replay.nextAngle())reset(shotDirection===attackSign,true)
   return
  }
  if(freeKick&&(freeKick.blue||freeKick.wait>0))return
  if(celebrating||replay.cut>=0||phase==='halftime'||phase==='fulltime'||phase==='kickoff'&&(kickoffBlue||action==='shot'))return
  if(!paused&&action==='through'&&!held&&!inFlight){rushSource=source;return}
  if(action==='shot'&&rushSource&&canRush()){
   if(!puntHold)puntHold={source,start:performance.now()}
   return
  }
  if(action==='shot'&&canTackle()&&!bluePass?.loft&&!players[active].penalty){
   const defender=players[active]
   if(defender.age<0){
    const [x,z]=readAim(menuPad())
    defender.face=Math.hypot(x,z)>.22?facing(x,z):facing(ball.position.x-defender.sprite.position.x,ball.position.z-defender.sprite.position.z,defender.face)
    defender.age=0;defender.tackling=true;defender.shooting=false
   }
   return
  }
  const looseShot=action==='shot'&&canChargeLooseShot()
  if(active!==ballPlayer&&!looseShot)return
  const incoming=inFlight||windupReceiver>=0||rollingPass||looseShot
  if(paused||(!incoming&&(!held||players[active].age>=0))||charge||queued!==null)return
  if(action==='shot'&&canBlast(players[active])){
   if(incoming){
    queued={action,power:blastMultiplier-1}
   }else{
    prepareSetPiece()
    launchShot(players[active])
   }
   return
  }
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
  if(freeKick&&action!=='shot'&&!players.some((m,i)=>i!==active&&!m.penalty))return
  prepareSetPiece()
  const multiplier=1+fraction
  if(crossingDrill&&training.drill===3){
   if(action!=='cross'){finishRep(0,'Use X / Cross');return}
   const [x,z]=readAim(menuPad());bins.launch(ball.position,x,z,fraction);audio.kick(fraction)
   const actor=players[active];actor.moving=false;actor.shooting=true;actor.age=.12;held=false
   return
  }
  if(action!=='shot')pass(multiplier,action)
  else{shotMultiplier=multiplier;kick()}
 }
 function prepareSetPiece(){
  if(!freeKick)return
  kickSpot=freeKick.spot;freeKick=null;phase='play';turnoverGrace=.65
  el('shotResult').textContent=''
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
 const passCall=el('passCall')
 let passCallIndex=-1,passCallAt=0,passCallCooldown=0,perfectPass=false
 function clearPassCall(){passCallIndex=-1;passCall.hidden=true}
 function passingSpace(x:number,z:number,from:T.Vector3){
  const dx=x-from.x,dz=z-from.z,lengthSq=dx*dx+dz*dz
  let open=6,lane=4
  for(const opponent of opponents){
   if(opponent.penalty)continue
   const foot=opponent.sprite.position
   open=Math.min(open,Math.hypot(foot.x-x,foot.z-z))
   const t=T.MathUtils.clamp(((foot.x-from.x)*dx+(foot.z-from.z)*dz)/Math.max(.01,lengthSq),0,1)
   lane=Math.min(lane,Math.hypot(foot.x-from.x-t*dx,foot.z-from.z-t*dz))
  }
  return {open,lane}
 }
 function organizeAttack(dt:number){
  returnRunTime=Math.max(0,returnRunTime-dt)
  if(crossingDrill||!held||windupReceiver>=0||players[active].age>=0){
   supportOwner=-1;clearPassCall()
   return
  }
  const carrier=players[active].sprite.position
  if(supportOwner!==active){
   clearPassCall()
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
  supportTimer=.35
  const occupied=[carrier]
  for(const [i,mate] of players.entries()){
   if(mate.penalty||i===active||i===lastSender&&returnRunTime>0)continue
   const role=homeShape[i],deep=i===runner
   const side=role.lane===0?(deep?runSide:-runSide):Math.sign(role.lane)
   const aheadOptions=deep?[6,9,12]:role.back?[-10,-7,-4]:role.front?[1,4,7]:[-4,-1,2,5]
   const widths=role.lane===0?[0,side*3.5,-side*3.5,side*6]:[role.lane,role.lane*.75,role.lane+side*1.2]
   let best=-Infinity,bestX=0,bestZ=0
   for(const ahead of aheadOptions){
    for(const width of widths){
     const x=T.MathUtils.clamp(carrier.x+attackSign*ahead,-19,19)
     const z=T.MathUtils.clamp(width+carrier.z*(role.back?.08:.16),-10.7,10.7)
     const dx=x-carrier.x,dz=z-carrier.z,lengthSq=dx*dx+dz*dz
     const {open,lane}=passingSpace(x,z,carrier)
     const crowding=occupied.reduce((cost,spot)=>Math.max(cost,Math.max(0,4-Math.hypot(x-spot.x,z-spot.z))),0)
     const stagger=role.lane<-.5?-2.3:role.lane>.5?2.3:i%2?1.2:-1.2
     const preferred=(deep?9:role.back?-7:role.front?4:0)+(deep?0:stagger)
     const value=open*.9+lane*1.35-crowding*3
       -.1*Math.abs(z-role.lane)-.12*Math.abs(ahead-preferred)
       -.13*Math.hypot(x-mate.sprite.position.x,z-mate.sprite.position.z)
       -.1*Math.hypot(x-mate.goal.x,z-mate.goal.z)
       -Math.max(0,3-Math.sqrt(lengthSq))*2
     if(value>best){best=value;bestX=x;bestZ=z}
    }
   }
   mate.goal.set(T.MathUtils.clamp(bestX,-19,19),0,bestZ)
   occupied.push(mate.goal)
  }
  const now=performance.now()
  if(passCallIndex>=0&&now-passCallAt>1500){clearPassCall();passCallCooldown=now+350}
  if(passCallIndex<0&&now>=passCallCooldown){
   let best=-Infinity,target=-1
   for(const [i,mate] of players.entries()){
    if(i===active||mate.penalty||mate.age>=0)continue
    const foot=mate.sprite.position,distance=Math.hypot(foot.x-carrier.x,foot.z-carrier.z)
    if(distance<3||distance>17)continue
    const {open,lane}=passingSpace(foot.x,foot.z,carrier)
    if(open<2.4||lane<1.15)continue
    const score=open+lane*1.5-distance*.18+attackSign*(foot.x-carrier.x)*.1
    if(score>best){best=score;target=i}
   }
   if(target>=0){passCallIndex=target;passCallAt=now;passCall.hidden=false}
  }
 }
 const goalCard=document.createElement('div')
 goalCard.className='match-goal-card';goalCard.setAttribute('role','status');goalCard.hidden=true
 matchView.append(goalCard)
 function showGoalCard(){
  const club=shotDirection===attackSign?home:matchOpponent
  const name=scorer?.displayName??club.name
  const portrait=club===burners?headshots[name]:undefined
  goalCard.innerHTML='<div><strong>Goal</strong><i></i><span></span><em></em></div>'
  goalCard.querySelector('i')!.style.backgroundImage='url('+ballSheet+')'
  const face=goalCard.querySelector('span')!
  if(portrait)face.style.backgroundImage='url('+portrait+')'
  else if(scorer){
   face.style.backgroundImage='url('+scorer.maps[0].image.src+')'
   face.className='match-goal-sprite'
  }else face.hidden=true
  goalCard.querySelector('em')!.textContent=name
  goalCard.hidden=false
 }
 function showKickoffPrompt(blue:boolean){
  const tag=document.createElement('span');tag.className='kickoff-prompt'
  tag.textContent=(blue?matchOpponent.name:homeLabel)+' Kick Off'
  el('message').replaceChildren(tag)
 }
 function reset(blue=false,afterGoal=false){
  goalCard.hidden=!afterGoal
  lastDelivery=null;homePasser=''
  burningBall.clear()
  jumps.clear();aerialWindup=false;blastShooter=null;blastFlying=false;impactTime=0;for(const m of meters){m.chain.clear();m.pair=''}
  afterChallenge=-Infinity;struckLoose=false;finishCard();clearReplay();freeKick=null;kickSpot=null
  recentHomeKicker=null;homeLateTime=0;sean.age=awayGK.age=-1;recentKicker=-1;lateTime=0;feedbackActor=null;callout.hidden=true;aerial=null;marks=null;centerPass=false;kickoffBlue=blue;phase='kickoff';breakSeconds=.9;lastBlue=blue
  supportOwner=-1;returnRunTime=0;clearPassCall();perfectPass=false
  if(freePractice){
   active=0
   const spots=[[0,0],[4,-4],[-4,4],[8,3],[-8,-3],[1,8],[-1,-8]]
   players.forEach((actor,i)=>{actor.sprite.position.set(spots[i][0],0,spots[i][1]);actor.face=2})
  }else if(crossingDrill){
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
  showKickoffPrompt(blue)
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
 let freeKick:{spot:T.Vector3,blue:boolean,wait:number,taker:number,victimName:string,fallAge:number}|null=null
 let kickSpot:T.Vector3|null=null

 const soundButton=el('sound') as HTMLButtonElement
 function soundLabel(){soundButton.textContent=audio.muted?'Sound off':'Sound on';soundButton.setAttribute('aria-pressed',String(!audio.muted))}
 soundLabel()
 soundButton.onclick=()=>{audio.setMuted(!audio.muted);soundLabel()}
 const unlockAudio=()=>{if(!broadcast)audio.unlock()}
 addEventListener('pointerdown',unlockAudio)
 addEventListener('keydown',unlockAudio)
 document.addEventListener('visibilitychange',()=>{audio.state(document.hidden||paused,replay.cut>=0)})
 const cardMap=await new T.TextureLoader().loadAsync(cardSheet)
 cardMap.minFilter=cardMap.magFilter=T.NearestFilter;cardMap.generateMipmaps=false;cardMap.colorSpace=T.SRGBColorSpace
 cardMap.repeat.set(1/9,1/8);cardMap.userData.directionalCelebration=true
 let cardScene:{offender:typeof sean,time:number,start:number}|null=null
 function finishCard(){
  if(cardScene){
   if(ticket&&cardScene.time>0)keepEvent(replay.highlight(Math.max(cardScene.start-1,replay.time-3.5),referee.sprite),
    Math.min(50,(half-1)*25+Math.ceil(matchSeconds/60))+'′ · '+cardScene.offender.displayName+' · Yellow Card',attackSign,true)
   cardScene.offender.sprite.visible=!cardScene.offender.penalty
  }
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
  lastDelivery=null;homePasser=''
  if(ticket)facts.fouls[blue?0:1]++
  lateChallenge(offender)
  if(ticket&&offender.lateChallenges===3)facts.yellow[blue?0:1]++
  audio.play('whistle',.72)
  if(offender.lateChallenges===3){cardScene={offender,time:0,start:replay.time};offender.sprite.visible=true}
  phase='freeKick';freeKick={spot,blue,taker,victimName:victim.displayName,fallAge:0,wait:offender.penalty?2.1:1}
  held=false;inFlight=false;centerPass=false;lastSender=windupReceiver=blueCarrier=-1
  bluePass=null;shot=null;keeperRestart=null;outBall=null;keeperGather=resultTime=0
  vx=vz=reboundVY=0;clearanceLoose=false;homeLateTime=lateTime=0
  cancelCharge();cancelRush();endFollowUpRuns()
  for(const actor of pitchActors){actor.age=-1;actor.moving=false;actor.tackling=false;actor.velocity.set(0,0,0)}
  ball.position.copy(spot);feedbackActor=null;callout.hidden=true
  el('shotResult').textContent=(offender.penalty?callout.dataset.grade+' · '+offender.name:'LATE TACKLE')+' · '+(blue?matchOpponent.name:homeLabel)+' FREE KICK'
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
  if(receiver<0){blueWins(taker,matchOpponent.name+' BALL');return}
  const end=team[receiver].sprite.position.clone();end.y=restingHeight
  team[taker].face=facing(end.x-spot.x,end.z-spot.z);team[taker].shooting=true;team[taker].age=.12
  audio.kick(.45)
  bluePass={sender:team[taker].displayName,receiver,start:spot.clone(),end,age:0,duration:Math.max(.2,end.distanceTo(spot)/8)}
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
  lastDelivery=null;homePasser=''
  cancelCharge()
  held=false;inFlight=false;blueCarrier=-1;bluePass=null;clearanceLoose=false
  vx=vz=reboundVY=0;lastBlue=true
  keeperRestart={start,end:start.clone(),age:0,blueBuild:true,goalKick:label==='GOAL KICK'}
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
  const long=keeperRestart?.goalKick||start.distanceTo(end)>16
  audio.kick(.45)
  bluePass={sender:awayGK.displayName,receiver,start:start.clone(),end,age:0,duration:long?Math.max(2.1,start.distanceTo(end)/10):start.distanceTo(end)/8,loft:long?3.6:0}
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
  if(ticket&&shot&&shotDirection!==attackSign){careerShots[1]++;onTarget[1]++}
  lastDelivery=null;homePasser=''
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
  homePasser=sean.displayName;lastDelivery=null
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
  const [x,z]=readAim(menuPad())
  return Math.hypot(x,z)>.22?facing(x,z):facing(attackSign,0)
 }
 function releaseLooseStrike(dx:number,dz:number,power:number){
  const speed=7+11*power,length=Math.hypot(dx,dz)||1
  vx=speed*dx/length;vz=speed*dz/length
  reboundVY=power>=.5?6+5*power:0
  clearanceLoose=struckLoose=true;held=inFlight=false;shot=null
 }
 function kick(){
  const p=players[active]
  if(paused||p.age>=0||!held||ballPlayer!==active)return
  p.face=freePractice?p.face:ownBox(p.sprite.position)?clearanceFace():facing(attackSign*fieldX-p.sprite.position.x,-p.sprite.position.z)
  p.shooting=true;p.age=0
 }
 function receivePass(collector:number,aerialFinish:boolean){
  const receiver=players[collector].displayName
  if(ticket&&homePasser&&homePasser!==receiver&&(inFlight||rollingPass)){
   facts.passes[0]++
   if(homePasser===ticket.career.player)facts.personalPasses++
   lastDelivery={sender:homePasser,receiver}
  }
  homePasser=''
  const intent=charge?{action:charge.action,power:heldPower(charge.start)}:queued
  const intended=collector===ballPlayer
  if(inFlight&&intended)creditPass(collector,passWasFirstTime)
  if(crossingDrill&&inFlight){
   if(training.drill===0){
    const distance=passStart.distanceTo(players[collector].sprite.position)
    const correct=collector===practiceTarget&&passKind==='pass'
    finishRep(correct?Math.min(20,12+Math.round(distance/2)+Math.max(0,3-Math.round(Math.abs(passPower-.3)*6))):0,correct?'Connected':'Wrong pass')
   }else if(training.drill===2){
    firstTimeCross=collector===practiceTarget&&passKind==='cross'&&intent?.action==='shot'
    if(!firstTimeCross)finishRep(0,'Set up the first touch')
   }
  }
  cancelCharge()
  active=ballPlayer=collector;held=true;inFlight=false
  if(intent?.action==='shot'){
   const actor=players[collector],goalX=attackSign*fieldX
   const backToGoal=dirs[actor.face][0]*attackSign<-.35
   const style=aerialFinish?(ball.position.y>.85&&backToGoal&&intent.power>=.65?'BICYCLE KICK':ball.position.y>=1.12?'HEADER':'VOLLEY'):null
   if(style){aerial={index:collector,style,age:0};el('shotResult').textContent=style;noticeTime=.65}
   if(!freePractice){
    if(ownBox(actor.sprite.position))actor.face=clearanceFace()
    else if(style!=='BICYCLE KICK')actor.face=facing(goalX-actor.sprite.position.x,-actor.sprite.position.z)
   }
   actor.age=.12;actor.shooting=true;shotMultiplier=1+intent.power
   if(style&&!freePractice&&!canBlast(actor)&&!(crossingDrill&&training.drill===aerialDrill)){
    held=false;blastShooter=actor;aerialWindup=true;blastWindup=0;audio.play('blast',.85)
   }else{if(style&&crossingDrill&&training.drill===aerialDrill)audio.play('blast',.7);launchShot(actor)}
  }else{
   carry()
   if(intent&&intended){players[collector].age=-1;pass(1+intent.power,intent.action,true)}
  }
 }
 function launchShot(shooter:typeof players[number],blast=false){
  if(!blast&&canBlast(shooter)){
   shooter.face=facing(attackSign*fieldX-shooter.sprite.position.x,-shooter.sprite.position.z)
   held=false;inFlight=false;blastShooter=shooter;blastWindup=0
   shooter.age=.065;shooter.shooting=true
   audio.play('blast',.95)
   return
  }
  if(blast){shotMultiplier=blastMultiplier;impactTime=.08;blastFlying=true;if(aerial)audio.kick(1)}
  else audio.kick(shotMultiplier-1)
  kickSpot=null
  recentHomeKicker=shooter;homeLateTime=lateTackleWindow
  scorer=shooter;replay.markStrike(shooter.sprite,ball.position)
  held=false;inFlight=false;lastBlue=false
  shotStart.copy(ball.position)
  const power=shotMultiplier-1
  if(freePractice){
   const [x,z]=dirs[shooter.face]
   releaseLooseStrike(x,z,power)
   return
  }
  if(crossingDrill&&training.drill===0)finishRep(0,'Use a ground pass')
  if(ownBox(shooter.sprite.position)){
   if(crossingDrill)finishRep(0,'Outside shooting range')
   const [dx,dz]=dirs[shooter.face]
   releaseLooseStrike(dx,dz,power);el('shotResult').textContent='CLEARANCE';noticeTime=.65
   return
  }
  const dx=attackSign*fieldX-ball.position.x
  if(!blast&&Math.hypot(dx,ball.position.z)>(7+11*power)**2/12){
   if(crossingDrill)finishRep(0,'Short of goal')
   releaseLooseStrike(dx,-ball.position.z,power)
   return
  }
  const defendingKeeper=keeper
  keeperStartX=defendingKeeper.position.x
  keeperStart=defendingKeeper.position.z
  const range=Math.hypot(fieldX-attackSign*shooter.sprite.position.x,shooter.sprite.position.z)
  shotZone=range<7?0:range<14?1:2
  shotDirection=attackSign
  shot=planShot(attackSign*ball.position.x,ball.position.z,keeperStart,shotMultiplier-1,fieldX,attackSign*shooter.sprite.position.x,attackSign*keeperStartX,Math.random,defendingKeeper.visible,blast?(keeperStart>=0?-1:1)*(1.1+Math.random()*.52):undefined,blast?0:1/trainingFactor(shooter.displayName,'Shooting'))
  if(blast)shot.duration=T.MathUtils.clamp(shot.duration*.46,.17,.38)
  const grade=shotFeedback(shot.result,range,shotMultiplier-1,Math.abs(shot.targetZ-keeperStart))
  feedbackActor=grade?shooter:null;feedbackTime=1.05;callout.hidden=!grade
  if(grade){callout.textContent=grade;callout.dataset.grade=grade}
  shot.targetX*=attackSign
  if(!celebrationLab)startFollowUpRuns(active)
  arc=kickArc(shotMultiplier,blast?shot.duration:Infinity);shotTime=0
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
  lastDelivery=null;homePasser=''
  if(!lastBlue)changeBurn(-15)
  if(reason.includes('TACKLE WON')||reason==='INTERCEPTED')changeBurn(6,1)
  meters[0].chain.clear();meters[0].pair=''
  windupReceiver=-1;cancelCharge();endFollowUpRuns();returnRunTime=0;clearPassCall();perfectPass=false
  lastBlue=true;bluePass=null;blueDecisionTime=difficulty().reactionDelayMs/1000;blueCarrier=index;held=false;inFlight=false;lastSender=-1
  pressTime=0;turnoverGrace=.7;dribbleSide=opponents[index].sprite.position.z>0?-1:1
  el('shotResult').textContent=reason;noticeTime=.9
 }
 function spendSprint(actor:typeof sean,dt:number){
  const duration=sprintSeconds*trainingFactor(actor.displayName,'Stamina')
  const charged=Math.min(dt,actor.sprintCharge*duration/100)
  const remaining=Math.max(0,actor.staminaCapacity-charged*capacityLossPerSecond)
  const extra=Math.min(dt-charged,remaining/exhaustedLossPerSecond)
  actor.sprintCharge=Math.max(0,actor.sprintCharge-charged*100/duration)
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
   const human=owner(1,i)
   if(human){driveSeat(human,dt);continue}
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
     T.MathUtils.lerp(ballPos.z,lanes[i]+T.MathUtils.clamp(ballPos.z*.28,-2.5,2.5),difficulty().defensiveShape))
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
  if(!owner(1,nearest)&&carrier&&turnoverGrace<=0&&!defender.penalty&&defender.age<0){
   const target=held?ballPos:carrier.sprite.position
   const dx=target.x-defender.sprite.position.x,dz=target.z-defender.sprite.position.z
   pressTime=Math.hypot(dx,dz)<1.85?pressTime+dt:0
   if(pressTime>=difficulty().reactionDelayMs/1000){
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
 function tryBlueShot(blast=false,human=false){
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
  if(!blast&&meters[1].value===100){
   blastShooter=carrier;blastWindup=0;carrier.face=facing(dx,-from.z);carrier.shooting=true;carrier.age=.065
   audio.play('blast',.95);return true
  }
  if(best===-Infinity&&!blast&&!human)return false
  const range=Math.hypot(dx,target-ball.position.z)
  keeperStartX=homeKeeper.position.x;keeperStart=homeKeeper.position.z
  shotMultiplier=blast?blastMultiplier:1+T.MathUtils.clamp(range/15,.28,.85)
  audio.kick(shotMultiplier-1)
  if(!blast&&range>(7+11*(shotMultiplier-1))**2/12){
   carrier.face=facing(dx,target-ball.position.z);carrier.age=.12;carrier.shooting=true
   recentKicker=blueCarrier;lateTime=lateTackleWindow;blueCarrier=-1;lastBlue=true
   releaseLooseStrike(dx,target-ball.position.z,shotMultiplier-1)
   return true
  }
  shot=planShot(-attackSign*ball.position.x,ball.position.z,keeperStart,shotMultiplier-1,fieldX,-attackSign*from.x,-attackSign*keeperStartX,Math.random,homeKeeper.visible,blast?(keeperStart>=0?-1:1)*(1.1+Math.random()*.52):target,blast?0:difficulty().shootingError)
  if(blast){shot.duration=T.MathUtils.clamp(shot.duration*.46,.17,.38);blastFlying=true;impactTime=.08}
  shot.targetX*=-attackSign
  scorer=carrier;replay.markStrike(carrier.sprite,ball.position)
  shotDirection=-attackSign;shotStart.copy(ball.position);shotTime=0;arc=kickArc(shotMultiplier,blast?shot.duration:Infinity)
  carrier.face=facing(shot.targetX-from.x,shot.targetZ-from.z)
  carrier.age=.12;carrier.shooting=true
  recentKicker=blueCarrier;lateTime=lateTackleWindow
  blueCarrier=-1;noticeTime=0;el('shotResult').textContent=''
  return true
 }
 function decideBlueAttack(dt:number,human?:Seat){
  if(!human&&owner(1,blueCarrier))return
  blueDecisionTime-=dt
  if(!human&&blueDecisionTime>0)return
  const carrier=opponents[blueCarrier],from=carrier.sprite.position
  blueDecisionTime=difficulty().reactionDelayMs/1000
  const inFinalThird=attackSign*from.x<=-fieldX/3
  if(!human&&inFinalThird&&tryBlueShot())return
  if(!human&&carrier.sprintTime>0)return
  if(!human&&!inFinalThird&&!players.some(m=>!m.penalty&&m.sprite.position.distanceToSquared(from)<3.7**2)&&Math.random()>.11)return
  let receiver=-1,best=-Infinity
  for(const [i,mate] of opponents.entries()){
   if(mate.penalty)continue
   if(i===blueCarrier)continue
   const to=mate.sprite.position,dx=to.x-from.x,dz=to.z-from.z
   const length=dx*dx+dz*dz
   if(human){
    const [x,z]=seatAim(human),aim=Math.hypot(x,z)>.2?[x,z]:dirs[carrier.face]
    const score=(dx*aim[0]+dz*aim[1])/Math.max(.01,Math.sqrt(length))-.01*Math.sqrt(length)
    if(score>best){best=score;receiver=i}
    continue
   }
   if(length<2.5**2||length>23**2)continue
   let space=Infinity,lane=Infinity
   for(const defender of players){
    if(defender.penalty)continue
    const pos=defender.sprite.position
    space=Math.min(space,pos.distanceTo(to))
    const along=((pos.x-from.x)*dx+(pos.z-from.z)*dz)/length
    if(along>0&&along<1)lane=Math.min(lane,Math.hypot(pos.x-from.x-along*dx,pos.z-from.z-along*dz))
   }
   if(space<1.5||lane<difficulty().laneClearance)continue
   const score=Math.min(space,5)+Math.min(lane,3)-.1*Math.sqrt(length)-attackSign*dx*.14
   if(score>best){best=score;receiver=i}
  }
  if(receiver<0)return
  const end=opponents[receiver].sprite.position.clone()
  const scatter=(.12+.035*from.distanceTo(end))*difficulty().passingError
  end.z=T.MathUtils.clamp(end.z+(Math.random()*2-1)*scatter,-11.5,11.5)
  end.y=restingHeight
  const start=ball.position.clone()
  carrier.age=.12;carrier.shooting=true
  recentKicker=blueCarrier;lateTime=lateTackleWindow
  audio.kick(.45)
  bluePass={sender:carrier.displayName,receiver,start,end,age:0,duration:start.distanceTo(end)/7.5}
  carrier.face=facing(end.x-from.x,end.z-from.z)
  blueCarrier=-1
 }
 function winBack(index:number,reason:string){
  lastDelivery=null;homePasser=''
  if(lastBlue)changeBurn(-15,1)
  meters[1].chain.clear();meters[1].pair=''
  if(ticket&&(reason==='WON BACK'||reason==='TACKLE WON'))facts.tackles[0]++
  if(['WON BACK','TACKLE WON','INTERCEPTED'].includes(reason))changeBurn(6)
  if(reason==='WON BACK'||reason==='TACKLE WON')afterChallenge=performance.now()
  lastBlue=false
  cancelCharge();endFollowUpRuns()
  blueCarrier=-1;bluePass=null;active=ballPlayer=index;held=true;lastSender=-1;turnoverGrace=1
  el('shotResult').textContent=reason;noticeTime=.8
  carry()
 }
 // Protect roughly three feet of ground travel off the boot.
 const blastClearance = .9
 const exposedStart = new T.Vector3()
 function blastBlocker(previous:T.Vector3, current:T.Vector3){
  const distanceFromBoot = (point:T.Vector3) => Math.hypot(point.x-shotStart.x, point.z-shotStart.z)
  const endDistance = distanceFromBoot(current)
  if(endDistance <= blastClearance)return -1
  const startDistance = distanceFromBoot(previous)
  if(startDistance >= blastClearance)return interceptPass(previous,current)
  // Only test the part of this frame's path beyond the protected distance.
  exposedStart.lerpVectors(previous,current,(blastClearance-startDistance)/(endDistance-startDistance))
  return interceptPass(exposedStart,current)
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
 let autoX=0,autoZ=0
 const couchKeys=new Set<string>()
 const buttons=new Map<Seat,boolean[]>()
 const seatLabels=new Map<Seat,HTMLElement>()
 let lastHome=-1,lastAway=-1
 function teamActors(s:Seat){return s.side===-1?players:opponents}
 function owner(side:number,i:number){return seats?.find(s=>s.side===side&&s.actor===i)}
 function claim(side:number,index:number){
  if(index<0||owner(side,index))return
  const group=seats?.filter(s=>s.side===side)
  if(group?.length)group.reduce((a,b)=>a.actor<0?a:b.actor<0?b:teamActors(a)[a.actor].sprite.position.distanceToSquared(ball.position)<teamActors(b)[b.actor].sprite.position.distanceToSquared(ball.position)?a:b).actor=index
 }
 function syncSeats(){
  if(!seats)return
  if(active!==lastHome){claim(-1,active);lastHome=active}
  if(blueCarrier!==lastAway){claim(1,blueCarrier);lastAway=blueCarrier}
  for(const s of seats){
   const actors=teamActors(s)
   if(!actors[s.actor]||actors[s.actor].penalty)s.actor=actors.findIndex((a,i)=>!a.penalty&&!owner(s.side,i))
  }
 }
 function seatAim(s:Seat){
  const pad=s.device<0?null:navigator.getGamepads()[s.device]
  const key=(k:string)=>s.device<0&&couchKeys.has(k)
  const x=(pad?.axes[0]??0)+Number(!!pad?.buttons[15]?.pressed||key('ArrowRight')||key('KeyD'))-Number(!!pad?.buttons[14]?.pressed||key('ArrowLeft')||key('KeyA'))
  const z=(pad?.axes[1]??0)+Number(!!pad?.buttons[13]?.pressed||key('ArrowDown')||key('KeyS'))-Number(!!pad?.buttons[12]?.pressed||key('ArrowUp')||key('KeyW'))
  return view.end?[-z*attackSign,x*attackSign]:[x,z]
 }
 function driveSeat(s:Seat,dt:number){
  const actor=teamActors(s)[s.actor],pos=actor.sprite.position,[x,z]=seatAim(s)
  actor.moving=actor.age<0&&Math.hypot(x,z)>.24
  if(!actor.moving)return
  actor.face=facing(x,z,actor.face)
  const [dx,dz]=dirs[actor.face]
  const sprint=s.device<0?couchKeys.has('ShiftLeft'):navigator.getGamepads()[s.device]?.buttons[7]?.pressed
  const step=4*dt+(sprint?2*spendSprint(actor,dt):0)
  pos.x=T.MathUtils.clamp(pos.x+dx*step,-20.7,20.7);pos.z=T.MathUtils.clamp(pos.z+dz*step,-11.7,11.7);actor.travel+=step
 }
 function couchInput(s:Seat,index:number,down:boolean){
  const source='seat'+s.number+'-'+index
  if(!down){release(source);return}
  if(index===9){void matchMenu();return}
  if(paused||squadOpen||s.actor<0)return
  if(index===4){
   const actors=teamActors(s)
   for(let n=1;n<actors.length;n++){
    const i=(s.actor+n)%actors.length
    if(!actors[i].penalty&&!owner(s.side,i)){
     s.actor=i
     if(s.side===-1&&!held&&!inFlight){active=i;lastHome=i}
     break
    }
   }
   return
  }
  if(index>3)return
  if(s.side===-1&&s.actor===active){press(faceActions[index],source);return}
  const actor=teamActors(s)[s.actor]
  if(phase!=='play'||celebrating||replay.cut>=0||blastShooter||outBall||keeperRestart||actor.age>=0)return
  if(s.side===1&&s.actor===blueCarrier){
   if(index===1)tryBlueShot(false,true)
   else decideBlueAttack(0,s)
  }else if(index===1&&(s.side===1?held:canTackle())){
   actor.age=0;actor.tackling=true;actor.shooting=false
  }
 }
 function readAim(pad:Gamepad|null|undefined){
   if(seats){
    const s=owner(-1,active)
    return s?seatAim(s):[autoX,autoZ]
   }
   if(aiHome)return [autoX,autoZ]
   const x=Number(keys.has('KeyD'))-Number(keys.has('ArrowLeft')||keys.has('KeyA'))+axisX+(pad?.axes[0]??0)
   const z=Number(keys.has('ArrowDown')||keys.has('KeyS'))-Number(keys.has('ArrowUp')||keys.has('KeyW'))+axisZ+(pad?.axes[1]??0)+Number(!!pad?.buttons[13]?.pressed)-Number(!!pad?.buttons[12]?.pressed)
  return view.end?[-z*attackSign,x*attackSign]:[x,z]
 }
 function pass(multiplier:number,kind:PassKind,firstTime=false){
  if(paused||!held||players[active].age>=0)return
  if(phase==='kickoff'){centerPass=true;phase='play';el('message').textContent=''}
  const sender=players[active],from=sender.sprite.position
  const [aimX,aimZ]=readAim(broadcast?undefined:menuPad())
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
  if(kind==='pass'&&!aimed&&passCallIndex>=0&&!players[passCallIndex].penalty)target=passCallIndex
  if(target<0&&freePractice){
   const [x,z]=dirs[sender.face]
   releaseLooseStrike(aimed?aimX:x,aimed?aimZ:z,multiplier-1)
   reboundVY=kind==='cross'?5+4*(multiplier-1):0
   sender.shooting=true;sender.age=.12;audio.kick(multiplier-1)
   return
  }
  if(target<0)return
  const to=players[target].sprite.position
  const perfectDuration=Math.max(.16,ball.position.distanceTo(to)/16)
  const windupDuration=sender.maps[2]?.12:0
  perfectPass=kind==='pass'&&target===passCallIndex&&performance.now()+(perfectDuration+windupDuration)*1000-passCallAt<=1500
  clearPassCall()
  passWasFirstTime=firstTime
  passKind=kind
  passStart.copy(ball.position);passTime=0
  receiverLaunch.copy(to)
  passTarget.copy(to);passTarget.y=restingHeight
  passDuration=Math.max(.06,ball.position.distanceTo(to)/8)/multiplier
  if(perfectPass)passDuration=perfectDuration
  if(kind==='through'){
   const [faceX,faceZ]=dirs[sender.face]
   passHeading.set(aimed?aimX:faceX,0,aimed?aimZ:faceZ).normalize()
   launchSpeed=(6+11*(multiplier-1))*trainingFactor(sender.displayName,'Passing')
   passDuration=launchSpeed/turfDeceleration
  }
  if(kind==='cross'){
   const boxApproach=T.MathUtils.smoothstep(Math.max(attackSign*from.x,attackSign*to.x),fieldX-10,fieldX-4)
   crossLift=1.35+.45*(multiplier-1)+.45*boxApproach
   if(!crossingDrill&&Math.abs(from.z)>6&&attackSign*from.x>6){
    // Land a few steps beyond the receiver so a run across the flight meets it in the air.
    const line=passTarget.clone().sub(passStart);line.y=0;line.normalize()
    passTarget.addScaledVector(line,2.4)
    passTarget.x=T.MathUtils.clamp(passTarget.x,-fieldX+.5,fieldX-.5)
    passTarget.z=T.MathUtils.clamp(passTarget.z,-fieldZ+.5,fieldZ-.5)
   }
   passDuration=Math.max(.55,passDuration*(1.35+.15*boxApproach))
  }
  if(kind!=='through')passDuration/=trainingFactor(sender.displayName,'Passing')
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
  if(crossingDrill&&training.drill===1)finishRep(0,'Shoot from the setup')
  audio.kick(passPower)
  kickSpot=null
  centerPass=false;windupReceiver=-1;returnRunTime=1.6;supportOwner=-1
  passStart.copy(ball.position);passTime=0;vx=vz=0
  recentHomeKicker=players[active];homeLateTime=lateTackleWindow
  homePasser=players[active].displayName;lastDelivery=null
  lastSender=active;ballPlayer=active=target;held=false;inFlight=true
 }
 function exitSimulation(){
  history.replaceState({...history.state,arcadeMenu:true},'')
  music?.carryOver();location.reload()
 }
 async function matchMenu(){
  if(simulation&&phase==='fulltime'){exitSimulation();return}
  if(freePractice||crossingDrill){endWarmup();return}
  if(squadOpen||phase==='fulltime'||celebrationLab||broadcast)return
  audio.menu('open');pause(true);squadOpen=true;audio.state(true,false)
  try{
   const choice=await pauseMenu(home,matchOpponent,[homeScore,awayScore],half,matchSeconds,!simulation&&replay.cut<0&&!celebrating,!!ticket?.career.simulate,!ticket)
   if(choice==='quit'){exitSimulation();return}
   if(choice==='abandon'&&ticket){
    const c=structuredClone(ticket.career)
    const report:Report={score:[homeScore,awayScore],shots:[...careerShots],goals:[...careerGoals],played:[...appearances],simulated:false}
    simulateRemainder(c,report,(half-1)*1500+matchSeconds,players.filter(p=>!p.penalty).map(p=>p.displayName),opponents.filter(p=>!p.penalty).map(p=>p.displayName),ratings)
    finishRound(c,report,ratings)
    report.performance={name:c.player,goals:report.goals.filter(g=>g.club===0&&g.player===c.player).length,assists:facts.assists,passes:facts.personalPasses,xpBefore:ticket.career.xp,xpAfter:c.xp}
    try{saveSlot(ticket.slot,c)}catch(e){el('message').textContent='Save Failed · '+String(e);return}
    fullTimeScreen=true;audio.finishMatch();location.reload();return
   }
   if(choice==='resume'){pause(false);return}
  const current={shape:lineup.shape,starters:homeSlots.map(m=>m.displayName),bench:matchBench}
   const unavailable=new Set(homeSlots.filter(m=>m.penalty>0).map(m=>m.displayName))
   const matchdayPlayers=[...matchBench.map(name=>squad.get(name)!),...homeSlots]
   const stamina=new Map(matchdayPlayers.map(p=>[p.displayName,{charge:p.sprintCharge,capacity:p.staminaCapacity}]))
   const exhausted = new Set(matchdayPlayers.filter(player => player.staminaCapacity <= 0).map(player => player.displayName))
   const result=await selectLineup(portraits,fixture!,{current,unavailable,exhausted,stamina,music:music!},settings,undefined,ticket?.career.bonds,ticket?.career)
   if(!result){pause(false);return}
   applyTeam(result.starters,result.bench)
   nameText.textContent=players[active].displayName
   audio.menu('close');pause(document.hidden);reveal(matchView,':scope > canvas,.bug-stack')
  }finally{squadOpen=false;padIndex=null;lastPause=!!menuPad()?.buttons[9]?.pressed
   for(const seat of seats??[])if(seat.device>=0)buttons.set(seat,Array.from(navigator.getGamepads()[seat.device]?.buttons??[],b=>b.pressed))
  }
 }
 function pause(on:boolean){if(phase==='fulltime')return;cancelRush();cancelCharge();paused=on;matchView.toggleAttribute('data-paused',on);keys.clear();axisX=axisZ=0;el('knob').style.transform='';el('pause').textContent=on?'Resume':'Pause';if(!on&&phase==='kickoff')showKickoffPrompt(kickoffBlue);else el('message').textContent=!on&&phase==='halftime'?'Halftime':''}
 function snap(value:number,step:number){return Math.round(value/step)*step}
 function screenRotation(){return broadcast?broadcastRotation:view.end?2*attackSign:0}
 function resize(){
  const ratio=window.devicePixelRatio||1
  camera.fov=view.fov
  camera.aspect=broadcast?innerWidth/innerHeight:16/9
  camera.updateProjectionMatrix()
  renderer.setPixelRatio(Math.min(ratio,broadcast?1:1.5));renderer.setSize(renderer.domElement.parentElement!.clientWidth,renderer.domElement.parentElement!.clientHeight,false)
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
 let labIndex=0
 let labControls:ReturnType<typeof celebrationControls>|undefined
 el('skipReplay').onclick=()=>{if(replay.cut>=0||celebrating)reset(shotDirection===attackSign,true)}
 el('changeView').onclick=()=>cycleView(1)
 let restorePracticeIds=()=>{}
 const matchPlayers=players.slice(),matchRivals=opponents.slice()
 const bins=createChipBins(scene)
 const targetRing=new T.Mesh(new T.RingGeometry(.52,.57,32),new T.MeshBasicMaterial({color:0x7ce7ff,side:T.DoubleSide}))
 targetRing.rotation.x=-Math.PI/2;targetRing.visible=false;scene.add(targetRing)
 let practiceTarget=1,repReset=-1,firstTimeCross=false,lastRetry=false
 const repVelocity=new T.Vector3()
 let repNet=false
 const training=warmupPanel(matchView,chooseDrill,endWarmup)
 if(standalonePractice){
  const exit=training.panel.querySelector<HTMLButtonElement>('[data-start]')!
  exit.firstChild!.textContent='Drills '
 }
 training.panel.hidden=true
 function finishRep(points:number,reason:string){
  if(repReset>=0||training.count===5)return
  if(training.drill!==4)training.award(points,reason)
  training.render(players[practiceTarget].displayName)
  repReset=training.drill===aerialDrill?3:.85
  if(training.drill===aerialDrill){
   if(outBall)repVelocity.copy(outVelocity);else repVelocity.set(vx,reboundVY,vz)
   repNet=reason==='Goal'
   if(shot){
    repVelocity.set((shot.targetX-shotStart.x)/shot.duration,0,(shot.targetZ-shotStart.z)/shot.duration)
    if(reason==='Save'||reason==='Post'||reason==='Crossbar'){
     repVelocity.set(-attackSign*(reason==='Save'?7:5),reason==='Crossbar'?-2:2,Math.sign(shot.targetZ||1)*2)
     audio.play(reason==='Save'?'bounce':reason==='Post'?'post':'bar',.5)
    }else if(repNet)audio.play('cheer',.55)
   }
   el('shotResult').textContent=reason.toUpperCase()
  }
 }
 function chooseDrill(index:number){audio.menu('nav');training.choose(index);setupRep()}
 function setupRep(){
  const duel=training.drill===aerialDrill
  opponents.splice(0,opponents.length,...(duel?matchRivals.slice(0,1):[]))
  for(const rival of matchRivals)rival.sprite.visible=opponents.includes(rival)
  players.forEach((actor,i)=>{actor.sprite.visible=!duel||i===0})
  reset();phase='play';active=ballPlayer=0
  if(training.drill===3)bins.show(training.count);else bins.hide()
  practiceTarget=training.drill===0?1+training.count%2:1
  const x=training.drill===1?17-training.count*1.4:training.drill===2?13:4
  const z=training.drill===2?9:training.drill===1?(training.count%2?-1:1)*(1+training.count):0
  const coords=[[x,z],[training.drill===2?17:x+4,training.drill===2?0:-4],[x-3,5]]
  players.forEach((a,i)=>{a.sprite.position.set(coords[i][0],0,coords[i][1]);a.goal.copy(a.sprite.position);a.face=2})
  carry();camTarget.copy(ball.position);el('message').textContent=''
  if(duel){
   const lane=[0,2,-2,1,-1][training.count]
   const start=new T.Vector3(fieldX-1.5,restingHeight,0),end=new T.Vector3(12,restingHeight,lane)
   keeper.position.copy(start);keeper.position.y=0
   const meet=start.clone().lerp(end,.85)
   targetRing.position.set(meet.x,.04,meet.z)
   players[0].sprite.position.set(meet.x,0,meet.z)
   const challenger=opponents[0]
   if(challenger){challenger.sprite.position.set(meet.x-.65,0,meet.z+.28);challenger.goal.copy(challenger.sprite.position)}
   held=false;ball.position.copy(start);keeperRestart={start,end,age:0}
   camTarget.copy(players[0].sprite.position)
  }
  repReset=-1;firstTimeCross=false;training.render(players[practiceTarget].displayName)
 }
 function endWarmup(){
  if(standalonePractice){
   history.replaceState({...history.state,practiceMenu:true,arcadeMenu:true},'')
   music?.carryOver();location.reload();return
  }
  audio.menu('success')
  reveal(matchView,':scope > canvas,.bug-stack')
  bins.hide();restorePracticeIds();crossingDrill=false;training.panel.hidden=true;matchView.classList.remove('training')
  players.splice(0,players.length,...matchPlayers);opponents.splice(0,opponents.length,...matchRivals)
  for(const actor of pitchActors){actor.sprite.visible=true;actor.sprintTime=0;actor.sprintCharge=actor.staminaCapacity=100}
  keys.clear();paused=false;matchView.removeAttribute('data-paused');reset()
 }
 new ResizeObserver(resize).observe(renderer.domElement.parentElement!);resize();reset()
 function enterPenalties(finish:(kicks:Kick[])=>void){
  updateScore()
  fullTimeScreen=true;ring.visible=false;homeGoal.setVisible(false);referee.sprite.visible=false
  for(const actor of pitchActors)actor.sprite.visible=false
  const eligible=(actors:typeof homeSlots)=>actors.filter(actor=>Number.isFinite(actor.penalty))
  const teams:[typeof homeSlots,typeof homeSlots]=[eligible(homeSlots),eligible([...opponents,awayGK])]
  audio.restartMatch()
  playPenalties({scene,camera,renderer,ball,teams,keepers:[teams[0].at(-1)!,teams[1].at(-1)!],
   names:[homeLabel,matchOpponent.name],test:penaltyLab,finish,
   level:['beginners','d6','d5','d4'].indexOf(settings.difficulty),
   rating:(actor,keeping)=>{
    const base=playerRatings[bios[actor.displayName]?.[0]]?.[keeping?5:2]??(65+matchOpponent.stars*4)
    return base*trainingFactor(actor.displayName,keeping?'Keeping':'Shooting')
   },
   fire:eastCannons,
   dissolve:()=>{
    if(reducedReplayMotion.matches)return
    const live=renderer.domElement
    renderer.render(scene,camera)
    dissolveLayer.width=live.width;dissolveLayer.height=live.height
    dissolveContext.drawImage(live,0,0);live.after(dissolveLayer)
    for(const anim of dissolveLayer.getAnimations())anim.cancel()
    dissolveLayer.style.opacity='1'
    const fade=dissolveLayer.animate([{opacity:1},{opacity:0}],{duration:650})
    fade.onfinish=()=>dissolveLayer.remove()
   },
   net:(p,power)=>attackingGoal.strike(p.x,p.y,p.z,power),
   render:dt=>{
    for(const {mesh,sprite} of contactShadows){mesh.visible=sprite.visible;mesh.position.set(sprite.position.x,.024,sprite.position.z)}
    shadow.position.set(ball.position.x,.03,ball.position.z);updateSpin();attackingGoal.update(dt);updateWeather(dt);renderer.render(scene,camera)
   }})
 }
 if(penaltyLab){homeScore=awayScore=2;phase='fulltime';matchSeconds=1500;enterPenalties(()=>{});return}
 if(freePractice){
  renderer.domElement.setAttribute('aria-label','Free practice pitch')
  phase='play';active=ballPlayer=0;carry()
  el('message').textContent=''
  for(const actor of pitchActors)actor.sprite.visible=players.includes(actor)
  matchView.classList.add('training','free-practice')
  training.choose(freeDrill);training.render('');training.panel.hidden=false
 }else if(lineup.warmup){
  crossingDrill=true
  const attackNames=home===burners?['Meghan','Pam','Stubbs','Daniel','Steven','Nelson','José','Jeremy','Nadia']:home.outfield.slice(0,3)
  const available=[...matchPlayers,...reserves]
  const trio=available.filter(a=>attackNames.includes(a.displayName)).slice(0,3)
  for(const name of attackNames){
   if(trio.length===3)break
   if(trio.some(a=>a.displayName===name))continue
   const actor=await makeHomePlayer(name);scene.remove(actor.sprite)
   squad.set(name,identity(actor));trio.push(actor)
  }
  // Use existing pitch sprites so camera, contact shadows and input all share the match code.
  const previous=matchPlayers.slice(0,3).map(identity),practiceIds=trio.map(identity)
  matchPlayers.slice(0,3).forEach((slot,i)=>Object.assign(slot,practiceIds[i]))
  restorePracticeIds=()=>matchPlayers.slice(0,3).forEach((slot,i)=>Object.assign(slot,previous[i]))
  players.splice(3);opponents.splice(0)
  for(const actor of pitchActors)actor.sprite.visible=players.includes(actor)||actor===awayGK
  training.panel.hidden=false;matchView.classList.add('training');training.choose(standalonePractice?selectedDrill:[0,1,2,3,aerialDrill][Math.floor(Math.random()*5)]);setupRep()
 }
 if(simulation)matchView.dataset.simulation=''
 let revealFirstFrame=!broadcast
 el('switchPlayer').onclick=switchPlayer
 el('reset').onclick=()=>{
  if(standalonePractice){endWarmup();return}
  goalEvent=null;audio.restartMatch();facts=newFacts();lastDelivery=null;homePasser=''
  if(ticket){careerGoals.length=0;highlights.length=0;careerShots.fill(0);onTarget.fill(0);woodwork.fill(0);appearances.clear()}
  music?.finish();audio.clear();resetBurn();half=1;attackSign=1;matchSeconds=homeScore=awayScore=0;paused=false;matchView.removeAttribute('data-paused');el('pause').textContent='Pause';el('pause').removeAttribute('disabled')
  applyTeam(lineup.starters,lineup.bench)
  for(const data of squad.values()){data.penalty=data.lateChallenges=0;data.sprintCharge=data.staminaCapacity=100}
  for(const m of [...outfield,sean]){m.penalty=m.lateChallenges=0;m.sprite.visible=true;m.sprintCharge=m.staminaCapacity=100}
  shotCounts.forEach(row=>row.fill(0));el('shotStats').querySelectorAll('td').forEach(c=>c.textContent='0')
  keys.clear();reset()
 };el('pause').onclick=()=>void matchMenu()
 scoreboard.onclick=()=>{if(replay.cut>=0){if(!replay.nextAngle())reset(shotDirection===attackSign,true)}else void matchMenu()}
 addEventListener('keydown',e=>{if(fullTimeScreen)return;if(celebrationLab){
  if(labControls?.key(e))return
  keys.add(e.code)
  if(['KeyB','KeyK','Space'].includes(e.code)){e.preventDefault();if(!e.repeat)press('shot',e.code)}
  return
 }
 if(seats){
  if(e.code==='Escape'){if(!e.repeat)void matchMenu();return}
  couchKeys.add(e.code)
  const s=seats.find(s=>s.device===-1)
  if(s&&!e.repeat)couchInput(s,keyButton(e.code),true)
  if(e.code.startsWith('Arrow')||e.code==='Space'||e.code==='Tab')e.preventDefault()
  return
 }
 if(simulation&&e.code==='Escape'){e.preventDefault();if(!e.repeat)void matchMenu();return}
 if(broadcast||squadOpen||e.target instanceof HTMLButtonElement&&e.code==='Space')return
 if((freePractice||crossingDrill)&&e.code==='Enter'){e.preventDefault();if(!e.repeat)endWarmup();return}
 if(crossingDrill&&e.code==='KeyR'){if(!e.repeat)chooseDrill(training.drill);return}
 if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault()
 if(e.code==='Comma'||e.code==='Period'||[',','.','<','>'].includes(e.key)){
  e.preventDefault()
  if(!e.repeat)cycleView(e.code==='Comma'||e.key===','||e.key==='<'?-1:1)
  return
 }
 if(simulation)return
 if(e.code==='ArrowRight'){if(!e.repeat)switchPlayer();return}
 keys.add(e.code);if(!e.repeat){if(e.code==='KeyX')press('cross',e.code);if(e.code==='KeyY')press('through',e.code);if(['KeyE','KeyJ'].includes(e.code))press('pass',e.code);if(['KeyB','KeyK','Space'].includes(e.code))press('shot',e.code);if(e.code==='Escape'){e.preventDefault();void matchMenu()}}})
 function keyButton(code:string){return ({KeyE:0,KeyJ:0,Space:1,KeyB:1,KeyK:1,KeyX:2,KeyY:3,Tab:4,KeyQ:4} as Record<string,number>)[code]??99}
 addEventListener('blur',()=>couchKeys.clear())
 addEventListener('keyup',e=>{couchKeys.delete(e.code);const s=seats?.find(s=>s.device===-1);if(s)couchInput(s,keyButton(e.code),false);keys.delete(e.code);release(e.code)});addEventListener('blur',()=>{if(celebrationLab||freePractice){keys.clear();axisX=axisZ=0;cancelCharge()}else if(!aiHome&&!squadOpen&&!crossingDrill)void matchMenu()})
 const utilityButtons=[4,14,15,11,1]
 const utilityHeld=utilityButtons.map(()=>false)
 let padIndex:number|null=null
 function updatePadStatus(text:string){const badge=el('padStatus');if(badge.textContent!==text)badge.textContent=text}
 addEventListener('gamepaddisconnected',event=>{
  if(simulation||celebrationLab||event.gamepad.index!==padIndex)return
  padIndex=null;if(!squadOpen&&!crossingDrill&&!freePractice)void matchMenu();updatePadStatus('Controller disconnected')
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
 function resetLab(){
  goalCard.hidden=true;matchView.classList.remove('lab-kickoff')
  clearReplay();goalMap=undefined;groupStarted=false;goalAge=resultTime=0
  netTravel=false;fireEnd=0;showGoalFire(-1);audio.clear()
  cancelCharge();cancelRush();clearanceLoose=struckLoose=false
  shot=null;outBall=null;keeperRestart=null;feedbackActor=null;callout.hidden=true
  vx=vz=reboundVY=0;windupReceiver=lastSender=-1
  centerPass=false;phase='play';active=ballPlayer=labIndex;held=true;inFlight=false
  ball.visible=shadow.visible=true
  homeSlots.forEach((actor,i)=>{
   actor.sprite.position.set(7+(i%4)*2,0,-5+Math.floor(i/4)*3.5)
   actor.face=actor.drawFace=2;actor.age=-1;actor.moving=false;actor.runClock=0
   actor.tackling=actor.shooting=false;actor.velocity.set(0,0,0)
   actor.sprite.material.rotation=0
  })
  homeSlots[labIndex].sprite.position.set(fieldX-4.5,0,0)
  endFollowUpRuns();carry()
  camTarget.copy(homeSlots[labIndex].sprite.position)
  goalBanner.hidden=true;el('shotResult').textContent='';el('message').textContent=''
  labControls?.select(homeSlots[labIndex].displayName)
 }
 if(celebrationLab){
  // Sean takes shots like an outfielder here. His sprite is already among the pitch actors.
  players.push(sean)
  matchView.classList.add('celebration-lab')
  referee.sprite.visible=awayGK.sprite.visible=false
  viewIndex=1;view=views[viewIndex];resize()
  labIndex=homeSlots.findIndex(actor=>actor.displayName==='José')
  labControls=celebrationControls(matchView,command=>{
   audio.menu('nav')
   if(command==='prev'||command==='next'){
    labIndex=(labIndex+(command==='next'?1:-1)+homeSlots.length)%homeSlots.length
    resetLab()
   }else if(command==='reset')resetLab()
   else location.reload()
  },menuPad())
  resetLab()
 }
 let last=performance.now()
 function startGoalScene(){
  const homeGoalScored=shotDirection===attackSign
  const winners=homeGoalScored?homeSlots:[...opponents,awayGK]
  const losers=homeGoalScored?opponents:players
  celebrant=scorer
  goalMap=scorer&&(homeGoalScored?home:matchOpponent)===burners?celebrations[scorer.displayName]:undefined
  runCelebration=(homeGoalScored?home:matchOpponent)===burners?(scorer?.displayName==='Stubbs'?stubbsSlide:scorer?.displayName==='Meghan'?meghanSkate:scorer?.displayName==='José'?spiderRun:undefined):undefined
  costumeReveal=runCelebration===meghanSkate||runCelebration===spiderRun
  celebrationRunSeconds=runCelebration===stubbsSlide?slideDuration:3.5
  slideX=-shotDirection;slideZ=0
  groupStarted=false
  frontRow.clear()
  goalAge=0;aerial=null;callout.hidden=true;feedbackActor=null
  for(const actor of pitchActors){
   actor.moving=false;actor.tackling=false;actor.shooting=false
   actor.age=-1;actor.runClock=0;actor.sprite.material.rotation=0;actor.sprite.position.y=0
  }
  walks=losers.filter(a=>a.sprite.visible&&!a.penalty).map((actor,i)=>({
   actor,gather:false,target:new T.Vector3(-shotDirection*(1+Math.floor(i/3)),0,2*(i%3-1))
  }))
  // Gathering targets are offsets from the scorer, so the chase follows every turn.
  const keeper=homeGoalScored?sean:awayGK
  const mates=winners.filter(a=>a!==celebrant&&a!==keeper&&a.sprite.visible&&!a.penalty)
  mates.forEach((actor,i)=>{
   const angle=2*Math.PI*i/mates.length
   walks.push({actor,gather:true,target:new T.Vector3(1.8*Math.cos(angle),0,1.8*Math.sin(angle))})
  })
  resultTime=celebrationRunSeconds+2.8
 }
 function startGroupCelebration(){
  groupStarted=true
  if(!celebrant)return
  celebrant.moving=false;celebrant.runClock=0
  if(goalMap===spiderIdle)celebrant.face=celebrant.drawFace=0
  resultTime=goalMap===pamGoal||goalMap===nelsonGoal||goalMap===janGoal?2*goalMap.image.width/48*.2:goalMap===meghanGoal?goalMap.image.width/48*.2:2.8
  if(goalMap!==mandyGoal)return
  const center=celebrant.sprite.position
  const mates=walks.filter(w=>w.gather)
  const toward=new T.Vector2(-center.x,-center.z)
  if(toward.lengthSq()<.01)toward.set(-shotDirection,0)
  toward.normalize()
  celebrant.face=celebrant.drawFace=facing(toward.x,toward.y)
  const frontCount=Math.ceil(mates.length/2)
  mates.forEach(({actor,target},i)=>{
   const front=i<frontCount
   if(front)frontRow.add(actor)
   const count=front?frontCount:mates.length-frontCount
   const lateral=((front?i:i-frontCount)-(count-1)/2)*1.65+(front?0:.30)
   const depth=front?2.5:3.85
   target.set(toward.x*depth-toward.y*lateral,0,toward.y*depth+toward.x*lateral)
  })
 }
 function advanceGoalScene(dt:number,realDt:number,pad:Gamepad|undefined){
  goalAge+=realDt;resultTime-=realDt;showGoalFire(goalAge)
  if(celebrant&&!groupStarted&&!(costumeReveal&&goalAge<costumeRevealTime)){
   const pos=celebrant.sprite.position
   const userScored=shotDirection===attackSign&&!aiHome
   const [x,z]=userScored?readAim(pad):[-shotDirection*.65,(Math.sign(shotStart.z||1)*9-pos.z)*.3]
   celebrant.moving=Math.hypot(x,z)>.22
   if(runCelebration===stubbsSlide){
    if(celebrant.moving){const length=Math.hypot(x,z);slideX=x/length;slideZ=z/length}
    const step=slideDistanceAt(goalAge)-slideDistanceAt(goalAge-realDt)
    pos.x=T.MathUtils.clamp(pos.x+slideX*step,-fieldX+.5,fieldX-.5)
    pos.z=T.MathUtils.clamp(pos.z+slideZ*step,-fieldZ+.5,fieldZ-.5)
    celebrant.face=facing(slideX,slideZ,celebrant.face)
   }else if(celebrant.moving){
    celebrant.face=facing(x,z,celebrant.face)
    const [dx,dz]=dirs[celebrant.face],step=4.6*realDt
    pos.x=T.MathUtils.clamp(pos.x+dx*step,-fieldX+.5,fieldX-.5)
    pos.z=T.MathUtils.clamp(pos.z+dz*step,-fieldZ+.5,fieldZ-.5)
    celebrant.travel+=step;celebrant.runClock+=realDt
   }else celebrant.runClock=0
  }
  if(!groupStarted&&goalAge>=celebrationRunSeconds)startGroupCelebration()
  for(const {actor,target,gather} of walks){
   const center=gather?celebrant?.sprite.position:undefined
   const pos=actor.sprite.position
   const dx=T.MathUtils.clamp(target.x+(center?.x??0),-fieldX+.25,fieldX-.25)-pos.x
   const dz=T.MathUtils.clamp(target.z+(center?.z??0),-fieldZ+.25,fieldZ-.25)-pos.z
   const d=Math.hypot(dx,dz)
   actor.moving=d>(actor.moving?.08:.35)
   if(!actor.moving){
    if(center&&groupStarted)actor.face=facing(center.x-pos.x,center.z-pos.z,actor.face)
    continue
   }
   const step=Math.min(d,realDt*(gather?6:1.65))
   pos.x+=step*dx/d;pos.z+=step*dz/d;actor.face=facing(dx,dz,actor.face)
   actor.travel+=step;actor.runClock+=realDt*(gather?1.2:.55)
  }
  if(groupStarted&&goalMap===mandyGoal){
   const groupAge=goalAge-celebrationRunSeconds
   resultTime=photoStart+mandyGoal.image.width/48*.2+.35-groupAge
   const cue=['ONE…','TWO…','THREE…','CHEESE!'][Math.min(3,Math.floor(groupAge))]
   el('shotResult').textContent=cue
  }
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
  homeGoal.update(dt);attackingGoal.update(dt);updateSpin()
  if(celebrant)camTarget.lerp(celebrant.sprite.position,1-Math.exp(-4*realDt))
  if(costumeReveal&&celebrant)costumeChange.draw(goalAge,celebrant.sprite.position)
  if(goalAge>(costumeReveal?.14:.85))goalBanner.hidden=true
 }
 function setReplayHint(){
  const label=el('replayLabel')
  if(label.dataset.angle===replay.label&&label.querySelector('kbd'))return
  label.dataset.angle=replay.label;label.innerHTML=replay.label+' · '+hint('J','A')+(replay.cut===3?' End replay':' Next angle')
 }
 const film=broadcastDirector()
 let broadcastRotation=0,decisionIn=.5
 function playForHome(dt:number){
  decisionIn-=dt
  if(phase==='fulltime'){if(simulation||seats)return;music?.finish();resetBurn();half=1;matchSeconds=homeScore=awayScore=0;reset();return}
  if(celebrating||phase==='halftime'||outBall||keeperRestart||keeperGather>0||resultTime>0)return
  const player=players[active],pos=player.sprite.position
  if(freeKick){
   if(!freeKick.blue&&freeKick.wait===0){press('pass','auto');release('auto')}
   return
  }
  if(phase==='kickoff'&&kickoffBlue)return
  if(held&&ballPlayer===active){
   autoX=attackSign;autoZ=-pos.z*.065
   if(player.age>=0||decisionIn>0)return
   decisionIn=.85+Math.random()*.9
   const range=Math.hypot(fieldX-pos.x*attackSign,pos.z)
   if(phase==='play'&&range<12){shotMultiplier=1.7+Math.random()*.3;kick();return}
   const pressure=opponents.some(o=>!o.penalty&&o.sprite.position.distanceTo(pos)<3.4)
   if(phase==='kickoff'||pressure||Math.random()<.52){
    let best=-Infinity
    for(const mate of players){
     if(mate===player||mate.penalty)continue
     const to=mate.sprite.position,dx=to.x-pos.x,dz=to.z-pos.z,dist=Math.hypot(dx,dz)
     const space=Math.min(6,...opponents.filter(o=>!o.penalty).map(o=>o.sprite.position.distanceTo(to)))
     const score=space+.55*dx*attackSign-.25*dist+Math.random()*1.8
     if(score>best){best=score;autoX=dx/(dist||1);autoZ=dz/(dist||1)}
    }
    pass(1.65,Math.abs(pos.z)>7&&range<17?'cross':'pass')
   }
  }else{
   if(canSwitch()&&decisionIn<=0){switchPlayer();decisionIn=.5}
   const foot=players[active].sprite.position
   const dx=ball.position.x-foot.x,dz=ball.position.z-foot.z,length=Math.hypot(dx,dz)
   autoX=length>.3?dx/length:0;autoZ=length>.3?dz/length:0
   if(canTackle()&&length<1.15)press('shot','auto')
  }
 }
 function matchCard(status:string){
  const rival=opponent(ticket!.career),control=facts.control[0]+facts.control[1]
  const percent=control?Math.round(100*facts.control[0]/control):0
  const scorers=[0,rival].map(club=>{
   const entries=careerGoals.filter(g=>g.club===club).map(g=>{
    const face=club===0?`<img src="${headshots[g.player]}" alt="">`:
     `<span class="ft-rival" style="background-image:url('${rivalSprites(matchOpponent,g.player)?.idle??blueIdle}')"></span>`
    return `<li>${face}<b>${g.player}</b> ${g.minute}′</li>`
   }).join('')
   return '<ul aria-label="'+(club===0?home.name:matchOpponent.name)+' scorers">'+(entries||'<li>No goals</li>')+'</ul>'
  }).join('')
  return `<div style="--stat-home:${clubAccent(home)};--stat-away:${clubAccent(matchOpponent)}">`+scoreRow(0,rival,[homeScore,awayScore],status)+'<div class="ft-scorers">'+scorers+'</div>'+
   statRow('Possession',control?[percent+'%',100-percent+'%']:['—','—'])+
   statRow('Total shots',careerShots)+statRow('Shots on target',onTarget)+
   statRow('Saves',[onTarget[1]-awayScore,onTarget[0]-homeScore])+statRow('Woodwork',woodwork)+
   statRow('Passes completed',facts.passes)+statRow('Tackles won',facts.tackles)+statRow('Fouls',facts.fouls)+
   statRow('Corner kicks',facts.corners)+statRow('Yellow cards',facts.yellow)+
   statRow('Distance (mi)',facts.metres.map(m=>(m/1609.344).toFixed(2)))+'</div>'

 }
 function halfTimeLeague(){
  const c=ticket!.career,dialog=document.createElement('dialog')
  const rows=c.schedule[c.round].filter(g=>g.a&&g.b).map(g=>{
   const kickoff=c.schedule[c.round].find(match=>match.a===0||match.b===0)!.kickoff!
   const at=scoreboardAt(g,kickoff+25)
   return scoreRow(g.a,g.b,at.score,at.label)
  }).join('')
  dialog.className='career-whistle half-time'
  dialog.innerHTML='<h2>Half time</h2>'+matchCard('HT')+'<h3>Around the League</h3>'+rows+'<button>START SECOND HALF ▸</button>'
  document.body.append(dialog);dialog.showModal();reveal(dialog,'h2,h3,button');squadOpen=true
  const go=()=>{dialog.close();dialog.remove();squadOpen=false;keys.clear();breakSeconds=0;last=performance.now()}
  dialog.querySelector('button')!.onclick=go;dialog.scrollTop=0
  dialog.oncancel=e=>{e.preventDefault();go()}
  let held=!!menuPad()?.buttons[0]?.pressed
  function poll(){if(!dialog.isConnected)return;const pad=menuPad(),down=!!pad?.buttons[0]?.pressed;if(pad&&Math.abs(pad.axes[3]??0)>.2)dialog.scrollTop+=pad.axes[3]*9;if(down&&!held){go();return}held=down;requestAnimationFrame(poll)}
  requestAnimationFrame(poll)
 }
 function showFullTime(performanceReport:NonNullable<Report['performance']>,pens:Report['pens']){
  const summary=document.createElement('dialog')
  summary.className='career-whistle full-time'
  summary.innerHTML='<small>FULL TIME</small><h2></h2><p></p><div class="reel-actions"></div>'
  summary.querySelector('h2')!.outerHTML='<div class="ft-card">'+matchCard(pens?'FINAL · '+pens.join('–')+' PENS':'FINAL')+'</div>'
  const c=ticket!.career,{name,goals,xpAfter}=performanceReport
  const personal=document.createElement('section');personal.className='ft-player'
  personal.innerHTML=`<span class="ft-sprite" style="background-image:url('${burnerPortraits[name]}')"></span><div><small>Player-manager</small><h3>${name}</h3><div>Goals ${goals} · Assists ${facts.assists} · Completed passes ${facts.personalPasses}</div><b class="ft-xp"></b><progress max="100" aria-label="Progress to next level"></progress></div>`
  summary.querySelector('p')!.replaceWith(personal)
  document.body.append(summary);summary.showModal()
  const start=performance.now(),meter=personal.querySelector('progress')!,xpText=personal.querySelector('.ft-xp')!
  function animateXP(now:number){
   const t=matchMedia('(prefers-reduced-motion: reduce)').matches?1:Math.min(1,(now-start)/1100)
   const xp=Math.floor(c.xp+(xpAfter-c.xp)*t)
   xpText.textContent='Level '+(1+Math.floor(xp/100))+' · '+xp+' XP · +'+(xpAfter-c.xp)+' XP'
   meter.value=xp%100
   if(t<1)requestAnimationFrame(animateXP)
  }
  animateXP(start)
  summary.oncancel=e=>e.preventDefault()
  const actions=summary.querySelector('.reel-actions')!
  let cycle=0,slide=0,started=0,watching=false
  const caption=document.createElement('div');caption.className='career-caption';matchView.append(caption);matchView.classList.add('ft-footage');caption.hidden=true
  function finish(){cancelAnimationFrame(cycle);music?.carryOver();location.reload()}
  function openSummary(){
   watching=false;caption.hidden=true;summary.classList.remove('watching')
   watch.hidden=!highlights.length;skip.hidden=true;nextClip.hidden=true;proceed.hidden=false
   reveal(summary,':scope > small,.ft-card,.ft-player,.reel-actions')
   if(highlights.length)watch.focus({preventScroll:true})
   summary.scrollTop=0
  }
  let transition:{index:number,start:number,time:number}|null=null
  function advanceClip(now:number){
   if(!reducedReplayMotion.matches&&highlights.length>1){
    transition={index:slide,start:started,time:now};renderer.domElement.after(dissolveLayer)
   }
   slide++;started=now
   if(slide===highlights.length){slide=0;if(watching)openSummary()}
  }
  function drawClip(index:number,elapsed:number){
   const h=highlights[index]
   return h.clip.playHighlight(elapsed,h.angle,h.card,renderer.domElement.width/renderer.domElement.height,h.direction,renderer,scene)
  }
  function show(now:number){
   if(transition){
    const age=(now-transition.time)/1000
    if(age>=1){transition=null;endDissolve()}
    else{
     const live=renderer.domElement
     if(dissolveLayer.width!==live.width||dissolveLayer.height!==live.height){dissolveLayer.width=live.width;dissolveLayer.height=live.height}
     drawClip(transition.index,(now-transition.start)/1000);dissolveContext.drawImage(live,0,0)
     dissolveLayer.style.opacity=String(1-age)
    }
   }
   if(watching)caption.textContent=highlights[slide].label
   if(!drawClip(slide,(now-started)/1000))advanceClip(now)
   cycle=requestAnimationFrame(show)
  }
  const button=(label:string,fn:()=>void)=>{const b=document.createElement('button');b.textContent=label;b.onclick=fn;actions.append(b);return b}
  const watch=button('Watch Highlights',()=>{
   transition=null;endDissolve();slide=0;started=performance.now();watching=true;caption.hidden=false;summary.classList.add('watching')
   watch.hidden=true;skip.hidden=false;nextClip.hidden=false;proceed.hidden=true;nextClip.focus()
  })
  const nextClip=button('Next Clip',()=>advanceClip(performance.now()))
  nextClip.innerHTML=hint('Enter','A')+' Next Clip'
  const skip=button('Back to Summary',openSummary)
  skip.innerHTML=hint('Esc','B')+' Back to Summary'
  summary.oncancel=e=>{e.preventDefault();if(watching)openSummary()}
  const proceed=button('League Results ▸',finish)
  openSummary()
  if(highlights.length){started=performance.now();cycle=requestAnimationFrame(show)}
  ;(watch.hidden?proceed:watch).focus({preventScroll:true});summary.scrollTop=0
  let held=!!menuPad()?.buttons[0]?.pressed,backHeld=!!menuPad()?.buttons[1]?.pressed,direction=''
  function poll(){
   const pad=menuPad(),down=!!pad?.buttons[0]?.pressed,dir=pad?menuDirection(pad):''
   if(pad&&Math.abs(pad.axes[3]??0)>.2)summary.scrollTop+=pad.axes[3]*9
   if(!watching&&dir&&dir!==direction){const choices=[watch,skip,proceed].filter(b=>!b.hidden);choices[(choices.indexOf(document.activeElement as HTMLButtonElement)+1)%choices.length].focus()}
   const back=!!pad?.buttons[1]?.pressed
   if(watching&&back&&!backHeld)openSummary()
   else if(watching&&down&&!held)advanceClip(performance.now())
   else if(down&&!held)(document.activeElement as HTMLButtonElement)?.click()
   backHeld=back;held=down;direction=dir;requestAnimationFrame(poll)
  }
  requestAnimationFrame(poll)
 }
 const landingRing=new T.Mesh(new T.RingGeometry(.42,.50,32),new T.MeshBasicMaterial({color:0xffffff,side:T.DoubleSide}))
 landingRing.rotation.x=-Math.PI/2;landingRing.visible=false;scene.add(landingRing)
 function updateLandingRing(){
  const pos=ball.position,mark=landingRing.position
  landingRing.visible=false
  if(pos.y<=restingHeight+.025||phase!=='play'||celebrating||replay.cut>=0)return
  if(bins.flying)bins.landing(pos,mark)
  else if(crossingDrill&&training.drill===aerialDrill&&repReset>=0||outBall||(!held&&!inFlight&&!bluePass&&!shot&&!keeperRestart&&keeperGather<=0)){
   const aftermath=crossingDrill&&training.drill===aerialDrill&&repReset>=0
   const v=aftermath?repVelocity:outBall?outVelocity:null
   const vertical=v?.y??reboundVY,t=(vertical+Math.sqrt(vertical**2+34*(pos.y-restingHeight)))/17
   const speed=Math.hypot(vx,vz),travel=struckLoose?Math.min(t,speed/6):t
   const distance=v?(1-Math.exp(-.18*t))/.18:struckLoose?travel*(1-3*travel/Math.max(.001,speed)):(1-Math.exp(-1.25*t))/1.25
   mark.set(pos.x+(v?.x??vx)*distance,0,pos.z+(v?.z??vz)*distance)
  }else if(keeperRestart&&keeperRestart.age>=.45&&!keeperRestart.blueBuild)mark.copy(keeperRestart.end)
  else if(bluePass?.loft)mark.copy(bluePass.end)
  else if(inFlight&&!perfectPass){
   const t=passKind==='cross'?1:Math.min(1,nextTouch(arc.duration,passTime)/passDuration)
   mark.lerpVectors(passStart,passTarget,t).addScaledVector(assistOffset,t*t)
  }else if(shot){
   const t=shotStart.y<=restingHeight+.01&&shot.result!=='Over'&&shot.result!=='Crossbar'?Math.min(1,nextTouch(arc.duration,shotTime)/shot.duration):1
   mark.set(T.MathUtils.lerp(shotStart.x,shot.targetX,t),0,T.MathUtils.lerp(shotStart.z,shot.targetZ,t))
  }else return
  mark.y=.048;landingRing.visible=true
 }
 function tick(now:number){
  const elapsed=(now-last)/1000,dt=Math.min(.04,elapsed)*(blastShooter?0:impactTime>0?.08:celebrating?.38:1);last=now
  if(fullTimeScreen)return
  if(squadOpen){requestAnimationFrame(tick);return}
  if(aiHome&&document.hidden){requestAnimationFrame(tick);return}
  if(!paused&&!squadOpen&&!document.hidden){
   impactTime=Math.max(0,impactTime-elapsed)
   if(blastShooter){
    blastWindup+=elapsed
    if(blastWindup>=.65){
     const shooter=blastShooter;blastShooter=null;shooter.age=.12
     if(aerialWindup){aerialWindup=false;impactTime=.08;launchShot(shooter)}
     else if(opponents.includes(shooter))tryBlueShot(true);else launchShot(shooter,true)
    }
   }
  }
  if(!paused)updateWeather(dt)
  syncSeats()
  for(const s of seats??[]){
   if(s.device<0)continue
   const pad=navigator.getGamepads()[s.device]
   const next=Array.from(pad?.buttons??[],b=>b.pressed),prev=buttons.get(s)
   if(prev)for(const i of [0,1,2,3,4])if(!!next[i]!==!!prev[i])couchInput(s,i,!!next[i])
   buttons.set(s,next)
  }
  if((aiHome||seats&&!owner(-1,active))&&!paused&&replay.cut<0)playForHome(dt)
  const connectedPad=broadcast?undefined:menuPad()
  const inputPad=seats?.length?undefined:connectedPad
  labControls?.poll(inputPad)
  const pad=celebrationLab||simulation?undefined:inputPad
  const controlsPad=celebrationLab?undefined:inputPad
  if(controlsPad&&padIndex!==controlsPad.index){
   utilityButtons.forEach((n,i)=>utilityHeld[i]=!!controlsPad.buttons[n]?.pressed)
   padIndex=controlsPad.index;faceActions.forEach((_,i)=>padHeld[i]=!!pad?.buttons[i]?.pressed)
   updatePadStatus(controlsPad.mapping==='standard'?'Controller connected':'Controller connected · check layout')
  }
  const menu=!!connectedPad?.buttons[9]?.pressed
  if(crossingDrill&&training.count===5&&pad?.buttons[0]?.pressed&&!padHeld[0])chooseDrill(training.drill)
  const retry=!!pad?.buttons[8]?.pressed
  if(crossingDrill&&retry&&!lastRetry)chooseDrill(training.drill)
  lastRetry=retry
  if(menu&&!lastPause){lastPause=true;void matchMenu();if(squadOpen){requestAnimationFrame(tick);return}}
  lastPause=menu
  utilityButtons.forEach((n,i)=>{
   const down=!!controlsPad?.buttons[n]?.pressed
   if(down&&!utilityHeld[i]){
    if(n===1){if(simulation&&(paused||phase==='fulltime'))exitSimulation()}
    else if(n===4){if(!simulation)switchPlayer()}
    else cycleView(n===14?-1:1)
   }
   utilityHeld[i]=down
  })
  for(const i of [3,0,1,2]){
   const action=faceActions[i]
   const down=celebrationLab?i===1&&!!inputPad?.buttons[1]?.pressed:!!pad?.buttons[i]?.pressed
   if(down&&!padHeld[i])press(action,'pad'+i)
   if(!down&&padHeld[i])release('pad'+i)
   padHeld[i]=down
  }
  audio.state(paused||document.hidden,celebrating||replay.cut>=0)
  if(replay.cut>=0){
   landingRing.visible=false
   for(const {icon} of exhaustionMarkers)icon.hidden=true
   if(!paused&&!replay.advance(Math.min(elapsed,.10))){
    reset(shotDirection===attackSign,true)
   }else{
    setReplayHint()
    const net=shotDirection===1?attackingGoal:homeGoal
    showGoalFire(replay.cursor-replay.goal)
    const poseNet=(time:number)=>net.poseAt(time)
    if(lastAngle>=0&&lastAngle!==replay.cut&&!reducedReplayMotion.matches){
     outgoing={angle:lastAngle,cursor:lastCursor,age:0}
     endReplayInset()
     renderer.domElement.after(dissolveLayer)
    }
    if(outgoing){
     if(!paused){outgoing.age+=elapsed;outgoing.cursor+=Math.min(elapsed,.1)*(outgoing.angle===3?.55:1.35)}
     if(outgoing.age>=1||reducedReplayMotion.matches)endDissolve()
     else{
      const live=renderer.domElement
      if(dissolveLayer.width!==live.width||dissolveLayer.height!==live.height){
       dissolveLayer.width=live.width;dissolveLayer.height=live.height
      }
      replay.drawAngle(outgoing.angle,outgoing.cursor,16/9,shotDirection,poseNet)
      renderReplayView()
      dissolveContext.drawImage(live,0,0)
      dissolveLayer.style.opacity=String(1-outgoing.age)
     }
    }
    replay.draw(16/9,shotDirection,poseNet)
    renderReplayView()
    lastAngle=replay.cut;lastCursor=replay.cursor
    requestAnimationFrame(tick)
    return
   }
  }
  if(!crossingDrill)updatePenalties(!paused&&!celebrating&&phase==='play'?elapsed:0)
  if(!clearanceLoose||held||inFlight||blueCarrier>=0||shot||keeperRestart||outBall)struckLoose=false
  const keeperX=homeKeeper.position.x,keeperZ=homeKeeper.position.z
  if(!paused&&freeKick){
   camTarget.lerp(freeKick.spot,1-Math.exp(-9*dt))
   if(freeKick.wait>0){
    freeKick.fallAge+=elapsed
    if(cardScene){if(!advanceCard(cardScene.time>0?dt*.65:dt))freeKick.wait=0}
    else freeKick.wait=Math.max(0,freeKick.wait-elapsed)
    if(freeKick.wait===0)prepareFreeKick()
   }else if(charge)showPower(heldPower(charge.start))
  }
  if(phase!=='kickoff'&&!celebrating&&replay.cut<0)goalCard.hidden=true
  if(!paused&&phase==='kickoff'){
   if(charge)showPower(heldPower(charge.start))
   if(kickoffBlue&&(breakSeconds-=elapsed)<=0){
    if(celebrationLab){resetLab();requestAnimationFrame(tick);return}
    const taker=nearestEligible(opponents,ball.position)
    const receiver=opponents.findIndex((o,i)=>!o.penalty&&i!==taker)
    if(receiver<0){phase='play';held=false;if(taker>=0)blueWins(taker,matchOpponent.name+' BALL')}
    else{
    const end=opponents[receiver].sprite.position.clone();end.y=restingHeight
    opponents[taker].age=.12;opponents[taker].shooting=true;opponents[taker].face=facing(end.x-ball.position.x,end.z-ball.position.z)
    audio.kick(.45)
  bluePass={sender:opponents[taker].displayName,receiver,start:ball.position.clone(),end,age:0,duration:ball.position.distanceTo(end)/8}
    phase='play';held=false;el('message').textContent=''
    }
   }
  }else if(!paused&&phase==='halftime'&&(breakSeconds-=elapsed)<=0){
   music?.finish();half=2;matchSeconds=0;attackSign=-1;reset(true)
  }
  if(!blastShooter&&!celebrationLab&&!freePractice&&!crossingDrill&&!paused&&!celebrating&&phase==='play'){
   if(!document.hidden&&!outBall&&!keeperRestart)for(const [side,m] of meters.entries()){
    if(m.seconds<=0)continue
    const previous=Math.ceil(m.seconds);m.seconds=Math.max(0,m.seconds-elapsed)
    if(m.seconds===0)resetBurn(side)
    else if(previous!==Math.ceil(m.seconds))renderBurn(side)
   }
   if(ticket&&!outBall&&!keeperRestart){
    if(held||inFlight||keeperGather>0)facts.control[0]+=dt
    else if(blueCarrier>=0||bluePass)facts.control[1]+=dt
   }
   matchSeconds=Math.min(1500,matchSeconds+elapsed*settings.speed)
   if(matchSeconds>=1500){
    audio.play('whistle',.75,half===1?1:.88)
    phase=half===1?'halftime':'fulltime';breakSeconds=3;cancelCharge();cancelRush()
    el('message').textContent=half===1?'Halftime':'Full time · '+homeLabel+' '+homeScore+' – '+awayScore+' '+matchOpponent.name
    if(phase==='halftime'){music?.startBreak();if(ticket)halfTimeLeague()}
    if(phase==='fulltime'){
     if(!ticket)music?.startBreak()
     audio.finishMatch()
     el('pause').setAttribute('disabled','')
     if(ticket){
      const complete=structuredClone(ticket.career)
      const settle=(kicks?:Kick[])=>{
      music?.startBreak();audio.finishMatch()
      finishRound(complete,{kicks,score:[homeScore,awayScore],goals:careerGoals,shots:careerShots,played:[...appearances],simulated:false},ratings)
      const report=complete.reports[complete.round],name=complete.player
      const performanceReport=report.performance={name,goals:careerGoals.filter(g=>g.club===0&&g.player===name).length,assists:facts.assists,passes:facts.personalPasses,xpBefore:ticket.career.xp,xpAfter:complete.xp}
      const persist=()=>{
       try{
        saveSlot(ticket!.slot,complete)
        fullTimeScreen=true
        showFullTime(performanceReport,report.pens)
       }
       catch(e){el('message').textContent='Career result could not be saved. '+String(e);el('pause').removeAttribute('disabled');el('pause').textContent='Retry save';el('pause').onclick=persist}
      }
      persist()
      }
      const game=complete.schedule[complete.round].find(g=>g.a===0||g.b===0)!
      if(homeScore===awayScore&&fixtureRequiresWinner(complete,game)){enterPenalties(settle);return}
      settle()
     }
    }
   }
   updateScore()
  }
  if(crossingDrill&&!paused&&(outBall||keeperRestart&&training.drill!==aerialDrill||keeperGather>0))finishRep(0,'Ball out of play')
  if(crossingDrill&&training.drill!==aerialDrill&&repReset>=0&&!bins.flying&&!paused&&training.count<5){repReset-=dt;if(repReset<=0)setupRep()}
  if(!paused&&celebrating)advanceGoalScene(dt,Math.min(elapsed,.10),inputPad)
  else if(!paused&&crossingDrill&&training.drill===aerialDrill&&repReset>=0){
   if(repReset>0){
    if(advanceOutBall(ball.position,repVelocity,dt))audio.play('board',.42)
    if(repNet&&ball.position.x>=attackingGoal.contactX(ball.position.y)){
     ball.position.x=attackingGoal.contactX(ball.position.y)
     attackingGoal.strike(ball.position.x,ball.position.y,ball.position.z,shotMultiplier-1)
     audio.play('net',.48);repVelocity.set(-.65,-.4,0);repNet=false
    }
    for(const [actor,age] of jumps){if(age+dt>=.92)jumps.delete(actor);else jumps.set(actor,age+dt)}
    if(aerial&&(aerial.age+=dt)>.42)aerial=null
    for(const actor of pitchActors)if(actor.age>=0&&(actor.age+=dt)>.42)actor.age=-1
    attackingGoal.update(dt);updateSpin();camTarget.lerp(ball.position,1-Math.exp(-6*dt))
    repReset=Math.max(0,repReset-dt)
   }
   if(repReset===0&&training.count<5)setupRep()
  }
  else if(!paused&&crossingDrill&&bins.flying){
   bins.step(ball.position,dt,finishRep);updateSpin()
   const actor=players[active];if(actor.age>=0&&(actor.age+=dt)>.42)actor.age=-1
   camTarget.lerp(ball.position,1-Math.exp(-6*dt))
  }
  else if(!paused&&!blastShooter&&phase==='play'&&(!crossingDrill||repReset<0&&training.count<5)){
   if(ticket)for(const actor of pitchActors)actor.world.copy(actor.sprite.position)
   for(const [actor,age] of jumps){if(age+dt>=.92)jumps.delete(actor);else jumps.set(actor,age+dt)}
   homeLateTime=Math.max(0,homeLateTime-dt)
   lateTime=Math.max(0,lateTime-dt)
   if(charge)showPower(heldPower(charge.start))
   let [x,z]=readAim(inputPad)
   const p=players[active],pos=p.sprite.position
   if(inFlight&&passKind==='through'&&Math.max(Math.abs(x),Math.abs(z))<=.22){
    const stopDistance=launchSpeed*passDuration/2
    const ahead=(pos.x-passStart.x)*passHeading.x+(pos.z-passStart.z)*passHeading.z
    const chase=T.MathUtils.clamp(Math.max(ahead+.65,ball.position.distanceTo(passStart)),0,stopDistance)
    const dx=passStart.x+passHeading.x*chase-pos.x,dz=passStart.z+passHeading.z*chase-pos.z
    if(Math.hypot(dx,dz)>.2){x=dx;z=dz}
   }
   p.moving=p.age<0&&Math.max(Math.abs(x),Math.abs(z))>(p.moving?.18:.24)
   const driver=owner(-1,active)
   const couchSprint=driver&&(driver.device<0?couchKeys.has("ShiftLeft"):navigator.getGamepads()[driver.device]?.buttons[7]?.pressed)
   const wantsSprint=p.moving&&(couchSprint||(keys.has('ShiftLeft')||keys.has('ShiftRight')||!!pad?.buttons[7]?.pressed))
   for(const mate of players)mate.sprintTime=0
   const burst=p.sprintTime=wantsSprint?spendSprint(p,dt):0
   const strideTime=dt+burst*(sprintCadence-1)
   if(p.moving){
    p.face=facing(x,z,p.face);const [dx,dz]=dirs[p.face]
    const distance=(4*dt+2*burst)*trainingFactor(p.displayName,'Pace')
    pos.x=T.MathUtils.clamp(pos.x+dx*distance,-20.7,20.7)
    pos.z=T.MathUtils.clamp(pos.z+dz*distance,-11.7,11.7);p.travel+=4*strideTime
   }
   if(!celebrationLab&&!freePractice){organizeAttack(dt);organizeDefense()}
   for(const [i,partner] of players.entries()){
    if(partner.penalty||i===active)continue
    const human=owner(-1,i)
    if(human){driveSeat(human,dt);continue}
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
    partner.velocity.subVectors(partner.goal,other).multiplyScalar(Math.min((i===reboundRunner||nearCover>=0&&(other.x-partner.goal.x)*attackSign>2?6:4.6)*trainingFactor(partner.displayName,'Pace'),distance/dt)/distance)
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
   if(!celebrationLab&&!shot&&!keeperRestart&&resultTime<=0){
    for(const goalie of keepers){
     const cover=T.MathUtils.clamp(ball.position.z*(goalie===keeper?difficulty().keeperTracking:.45),-1.55,1.55)
     if(goalie===homeKeeper&&(rushing||keeperGather>0))continue
     const homeX=attackSign*(goalie===keeper?keeperHomeX:-keeperHomeX)
     goalie.position.x+=T.MathUtils.clamp(homeX-goalie.position.x,-6*dt,6*dt)
     goalie.material.rotation*=Math.exp(-7*dt);goalie.position.y*=Math.exp(-7*dt)
     const lateral=3*dt*(goalie===homeKeeper?trainingFactor(sean.displayName,'Keeping'):1)
     goalie.position.z+=T.MathUtils.clamp(cover-goalie.position.z,-lateral,lateral)
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
   if(opponents.length&&!(crossingDrill&&training.drill===aerialDrill)&&!outBall&&!shot&&resultTime<=0)moveBlue(dt)
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
      const reaches=(point:T.Vector3,reach=.93)=>{
       const x=point.x-foot.x,z=point.z-foot.z
       return x*dx+z*dz>=-.15&&Math.hypot(x-dx*.5,z-dz*.5)<=reach
      }
      const blueIndex=opponents.indexOf(actor),isBlue=blueIndex>=0
      const playable=isBlue?!outBall&&!shot&&!keeperRestart&&keeperGather<=0&&resultTime<=0&&(held||inFlight):canTackle()
      const latePlayer=isBlue?(homeLateTime>0&&(!held||recentHomeKicker!==players[ballPlayer])?recentHomeKicker:null):
       (!held&&lateTime>0&&recentKicker!==blueCarrier?opponents[recentKicker]:null)
      if(playable&&ball.position.y<.85&&reaches(ball.position,.93*trainingFactor(actor.displayName,'Tackling'))){
       audio.kick(.25)
       if(isBlue){if(ticket)facts.tackles[1]++;blueWins(blueIndex,matchOpponent.name+' TACKLE WON')}
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
   const canCollect=()=>!perfectPass&&rushing&&canRush()&&ball.position.y<=1.35&&
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
     if(celebrationLab){resetLab();requestAnimationFrame(tick);return}
     const {goalEnd:end,spot,blueRestart,corner}=outBall
     outBall=null
     if(freePractice){
      ballPlayer=active;lastBlue=false;held=true;clearanceLoose=struckLoose=false
      vx=vz=reboundVY=0;carry()
     }else if(end&&!corner){
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
      if(blueRestart)blueWins(taker,corner?matchOpponent.name+' CORNER':matchOpponent.name+' KICK-IN')
      else winBack(taker,homeLabel+(corner?' CORNER':' KICK-IN'))
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
     const t=Math.min(1,(restart.age-.45)/2.45)
     el('shotResult').textContent=restart.punt?'PUNT':'GOAL KICK'
     ball.position.lerpVectors(restart.start,restart.end,t)
     ball.position.y+=3.8*4*t*(1-t)
     if(claimAirball()){ /* Claimed in flight. */ }
     else if(restart.punt&&gatherPunt()){ /* Blue has gathered the clearance. */ }
     else if(t===1&&crossingDrill&&training.drill===aerialDrill){
      vx=(restart.end.x-restart.start.x)/2.45;vz=(restart.end.z-restart.start.z)/2.45;reboundVY=2.4
      keeperRestart=null;finishRep(0,'Ball landed · meet it sooner')
     }else if(t===1){
      vx=(restart.end.x-restart.start.x)*.24;vz=(restart.end.z-restart.start.z)*.24
      reboundVY=2.4;clearanceLoose=true;keeperRestart=null;noticeTime=.6
     }
    }
   }else if(inFlight){
    passTime=Math.min(passDuration,passTime+dt)
    const fraction=passTime/passDuration
    previousPassPosition.copy(ball.position)
    if(perfectPass){
     ball.position.lerpVectors(passStart,players[ballPlayer].sprite.position,fraction)
     ball.position.y=restingHeight
    }else if(passKind==='through'){
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
    const interceptor=perfectPass?-1:interceptPass(previousPassPosition,ball.position)
    const wantsFinish=passKind==='cross'&&(charge?.action==='shot'||queued?.action==='shot')
    const collector=perfectPass?(fraction===1?ballPlayer:-1):interceptPass(previousPassPosition,ball.position,players,lastSender,wantsFinish?1.15:.78,wantsFinish?2:.84)
    if(Math.abs(ball.position.x)>fieldX||Math.abs(ball.position.z)>fieldZ){
     const step=Math.max(.000001,dt)
     ballOut((ball.position.x-previousPassPosition.x)/step,(ball.position.y-previousPassPosition.y)/step,(ball.position.z-previousPassPosition.z)/step)
    }
    else if(!perfectPass&&claimAirball()){ /* Claimed in flight. */ }
    else if(interceptor>=0)blueWins(interceptor,'INTERCEPTED')
    else if(collector>=0){
     lastBlue=false
     const completedPerfectPass=perfectPass&&performance.now()-passCallAt<=1500
     receivePass(collector,wantsFinish)
     if(!inFlight&&windupReceiver<0)perfectPass=false
     if(completedPerfectPass){
      feedbackActor=players[collector];feedbackTime=1.05
      callout.textContent='PERFECT PASS!';callout.dataset.grade='PERFECT PASS';callout.hidden=false
     }
    }else if(fraction===1){
     perfectPass=false
     if(crossingDrill&&training.drill!==4)finishRep(0,'Missed receiver')
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
    const blocker=shotDirection!==attackSign?interceptPass(previousPassPosition,ball.position,players):blastFlying?blastBlocker(previousPassPosition,ball.position):-1
    if(canCollect())keeperTouch()
    else if(blocker>=0){
     shot=null
     if(ticket)careerShots[shotDirection===attackSign?0:1]++
     if(blastFlying&&shotDirection===attackSign){blastFlying=false;blueWins(blocker,'BLOCKED')}
     else winBack(blocker,'BLOCKED')
    }else if(t===1){
     if(crossingDrill){
      const distance=Math.hypot(fieldX-shotStart.x,shotStart.z),angle=Math.atan2(Math.abs(shotStart.z),Math.max(.1,fieldX-shotStart.x))
      const valid=training.drill===1||(training.drill===2||training.drill===aerialDrill)&&firstTimeCross
      finishRep(valid?shotPoints(shot.result,distance,angle,shotMultiplier-1,firstTimeCross):0,shot.result)
      shot=null
     }else{
     const shootingSide=shotDirection===attackSign?0:1
     if(!blastFlying)changeBurn(shot.result==='Save'?10:0,shootingSide)
     if(shot.result==='Goal'){
      const wasOnFire=meters[shootingSide].value===100
      for(const [i,m] of meters.entries())if(m.value===100)resetBurn(i)
      if(!wasOnFire)changeBurn(20,shootingSide)
     }
     if(ticket){
      const side=shotDirection===attackSign?0:1
      careerShots[side]++
      if(shot.result==='Goal'||shot.result==='Save')onTarget[side]++
      if(shot.result==='Post'||shot.result==='Crossbar')woodwork[side]++
      if(shot.result!=='Goal')lastDelivery=null
      if(shot.result==='Goal'){
       replay.record(1/30,0)
       goalEvent={start:replay.time-6,direction:shotDirection,label:Math.min(50,(half-1)*25+Math.ceil(matchSeconds/60))+'′ · '+(scorer?.displayName??'Team')+' · Goal'}
      }
     }
     if(shotDirection===attackSign)recordAttempt(shot.result)
     el('shotResult').textContent=shotDirection!==attackSign&&shot.result==='Goal'?matchOpponent.name+' GOAL':shot.result.toUpperCase()
     if(shot.result==='Wide'||shot.result==='Over'){
      ballOut((shot.targetX-shotStart.x)/shot.duration,
       (ball.position.y-previousPassPosition.y)/Math.max(dt,.000001),(shot.targetZ-shotStart.z)/shot.duration,shot.result)
     }else if(shot.result==='Goal'){
      cancelCharge()
      if(ticket&&shotDirection===attackSign&&lastDelivery&&lastDelivery.receiver===scorer?.displayName&&lastDelivery.sender===ticket.career.player)facts.assists++
      if(ticket)careerGoals.push({minute:Math.min(50,(half-1)*25+Math.ceil(matchSeconds/60)),club:shotDirection===attackSign?0:opponent(ticket.career),player:scorer?.displayName??'Team goal'})
      if(shotDirection===attackSign)homeScore++;else awayScore++
      const burnersScored=(shotDirection===attackSign?home:matchOpponent)===burners
      audio.play('cheer',burnersScored?.38:.58)
      fireEnd=burnersScored?shotDirection:0;showGoalFire(0)
      if(burnersScored)audio.play('goal',.72)
      updateScore();endFollowUpRuns()
      celebrating=true;replay.goal=replay.time
      goalBanner.hidden=false;replayPanel.hidden=false;el('replayLabel').textContent=shotDirection===attackSign?homeLabel:matchOpponent.name
      el('shotResult').textContent=''
      netTravel=true
      vx=(shot.targetX-shotStart.x)/shot.duration
      vz=(shot.targetZ-shotStart.z)/shot.duration
      showGoalCard();startGoalScene()
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
    }
   }else if(resultTime>0){
    resultTime-=dt

   }else if(bluePass){
    previousPassPosition.copy(ball.position)
    bluePass.age+=dt
    const t=Math.min(1,bluePass.age/bluePass.duration)
    ball.position.lerpVectors(bluePass.start,bluePass.end,t)
    ball.position.y+=4*(bluePass.loft??0)*t*(1-t)
    const cut=interceptPass(previousPassPosition,ball.position,players)
    if(bluePass.loft&&claimAirball()){ /* Claimed in flight. */ }
    else if(cut>=0)winBack(cut,'INTERCEPTED')
    else if(t===1){
     passBurn(1,bluePass.sender,opponents[bluePass.receiver].displayName,bluePass.loft?8:5)
     if(ticket)facts.passes[1]++
     blueCarrier=bluePass.receiver;bluePass=null;blueDecisionTime=difficulty().reactionDelayMs/1000
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
    if(clearanceLoose&&claimAirball()){ /* Claimed in flight. */ }
    else if(clearanceLoose&&attackSign*vx>0&&gatherPunt()){ /* Keeper takes possession before the line. */ }
    else if(Math.abs(ball.position.x)>fieldX||Math.abs(ball.position.z)>fieldZ)ballOut(vx,reboundVY,vz)
    else if(ball.position.y<=restingHeight+.28){
     let collector=-1,closest=.8
     for(const [i,mate] of players.entries()){
      if(mate.penalty||mate.age>=0||(celebrationLab&&i!==labIndex))continue
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
      blueWins(blueCollector,matchOpponent.name+' BALL')
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
   if(ticket&&!outBall&&!keeperRestart&&!celebrating){
    for(const actor of pitchActors){
     if(actor===referee||actor.penalty||!actor.sprite.visible)continue
     const pos=actor.sprite.position,distance=Math.hypot(pos.x-actor.world.x,pos.z-actor.world.z)
     // Exclude restart placements. Pitch units approximate metres.
     if(distance<=10*dt+.01)facts.metres[homeSlots.includes(actor)?0:1]+=distance
    }
   }
   for(const actor of celebrationLab?homeSlots:outfield){
    const running=actor.moving&&actor.age<0
    if(actor.sprintTime===0){
     actor.sprintCharge=Math.min(actor.staminaCapacity,actor.sprintCharge+dt*actor.staminaCapacity/rechargeSeconds)
    }
    actor.runClock=running?actor.runClock+dt+actor.sprintTime*(sprintCadence-1):0
   }
   if(aerial&&(aerial.age+=dt)>.42)aerial=null
   updateReferee(dt)
   if(feedbackActor&&(feedbackTime-=dt)<=0){feedbackActor=null;callout.hidden=true}
   if(passCallIndex>=0&&(paused||phase!=='play'||!held||performance.now()-passCallAt>1500))clearPassCall()
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
  if(!paused&&!celebrating&&!celebrationLab){
   const dx=homeKeeper.position.x-keeperX,dz=homeKeeper.position.z-keeperZ
   sean.moving=phase==='play'&&homeKeeper.position.y<.05&&Math.hypot(dx,dz)>.15*dt
   if(sean.age<0)sean.face=sean.moving?facing(dx,dz,sean.face):facing(ball.position.x-homeKeeper.position.x,ball.position.z-homeKeeper.position.z,sean.face)
   sean.runClock=sean.moving?sean.runClock+dt:0
  }
  const kickLabel=canTackle()&&!(rushSource&&canRush())?'TACKLE':held&&ownBox(players[active].sprite.position)?'CLEAR':'KICK'
  if(el('kick').textContent!==kickLabel)el('kick').textContent=kickLabel
  updateLandingRing()
  targetRing.visible=crossingDrill&&(training.drill===0||training.drill===2||training.drill===aerialDrill&&!!keeperRestart)&&training.count<5
  if(targetRing.visible&&training.drill!==aerialDrill){targetRing.position.copy(players[practiceTarget].sprite.position);targetRing.position.y=.04}
  switchButton.disabled=!canSwitch()
  for(const {mesh,sprite} of contactShadows){
   mesh.visible=sprite.visible
   mesh.position.set(sprite.position.x+.18,.024,sprite.position.z+.12)
   mesh.scale.setScalar(.7)
  }
  shadow.scale.setScalar(1.15-.16*(ball.position.y-restingHeight))
  shadow.position.set(ball.position.x,.03,ball.position.z)
  if(broadcast){
   const carrier=blueCarrier>=0?opponents[blueCarrier]:held?players[ballPlayer]:undefined
   const attack=lastBlue?-attackSign:attackSign
   broadcastRotation=film(camera,elapsed,ball.position,carrier?.sprite.position,carrier?.face??(attack===1?2:6),attack,innerWidth/innerHeight)
   ring.visible=false
  }
  for(const actor of pitchActors){
    if(celebrating&&actor===celebrant&&runCelebration===spiderRun&&goalAge>=costumeRevealTime&&(groupStarted||!actor.moving)){
     spiderIdle.offset.x=((actor.face+screenRotation()+8)%8)/8
     actor.sprite.material.map=spiderIdle;continue
    }
    if(celebrating&&actor===celebrant&&!groupStarted&&runCelebration&&(!costumeReveal||goalAge>=costumeRevealTime)){
     const frames=runCelebration.image.width/48
     if(runCelebration===stubbsSlide)runCelebration.offset.set(Math.min(frames-1,Math.floor(goalAge/.2))/frames,(7-(actor.face+screenRotation()+8)%8)/8)
     else runCelebration.offset.set(Math.floor(actor.runClock/.12)%frames/frames,(7-(actor.face+screenRotation()+8)%8)/8)
     actor.sprite.material.map=runCelebration;continue
    }
    if(celebrating&&groupStarted&&!actor.moving&&actor!==celebrant&&actor.displayName==='Jan'&&walks.some(w=>w.actor===actor&&w.gather)){
     const frames=janGoal.image.width/48
     janGoal.offset.x=Math.floor((goalAge-celebrationRunSeconds)/.2)%frames/frames
     actor.sprite.material.map=janGoal;continue
    }
    if(celebrating&&groupStarted&&!actor.moving&&actor!==celebrant&&actor.displayName==='Nelson'&&walks.some(w=>w.actor===actor&&w.gather)){
     const frames=nelsonGoal.image.width/48
     nelsonGoal.offset.x=Math.floor((goalAge-celebrationRunSeconds)/.2)%frames/frames
     actor.sprite.material.map=nelsonGoal;continue
    }
    if(celebrating&&actor===celebrant&&goalMap&&groupStarted){
     const groupAge=groupStarted?goalAge-celebrationRunSeconds:goalAge
     const frames=goalMap.image.width/48
     const frame=goalMap===mandyGoal
      ? Math.min(frames-1,Math.floor(Math.max(0,groupAge-photoStart)/.2))
      : Math.floor(groupAge/.2)%frames
     if(goalMap===mandyGoal)goalMap.offset.y=(7-(actor.face+screenRotation()+8)%8)/8
     goalMap.offset.x=frame/frames
     actor.sprite.material.map=goalMap;continue
    }
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
    // Play the contact reaction during the whistle, including a brief recovery before the restart.
    if(freeKick && freeKick.wait>0 && freeKick.fallAge<.94 && actor.maps[3] &&
       actor===(freeKick.blue?opponents:players)[freeKick.taker] && actor.displayName===freeKick.victimName){
     const age=freeKick.fallAge
     const frame=age<.73?Math.min(6,Math.floor(age/.085)):Math.max(0,5-Math.floor((age-.73)/.035))
     const map=actor.maps[3]
     map.repeat.set(1/7,1/8)
     map.offset.set(frame/7,(7-spriteFace)/8)
     actor.sprite.material.map=map
     continue
    }
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
    const tex=celebrating&&groupStarted&&goalMap===mandyGoal&&frontRow.has(actor)&&!actor.moving&&mode===0? kneelingPose(actor.maps[0]):actor.maps[mode]
    tex.repeat.set(1/cols,1/rows)
    tex.offset.set(col/cols,(rows-1-row)/rows)
    actor.sprite.material.map=tex
   }
  if(cardScene&&cardScene.time>0){
   const center=referee.sprite.position,t=cardScene.time/1.55,yaw=Math.atan2(cardScene.offender.sprite.position.x-center.x,cardScene.offender.sprite.position.z-center.z)+.65
   camera.position.set(center.x+Math.sin(yaw)*(6-1.4*t),2.4-.5*t,center.z+Math.cos(yaw)*(6-1.4*t));camera.lookAt(center.x,.9,center.z)
  }else if(!broadcast)frameAction(camera,view,camTarget,16/9,view.end?attackSign:1,view.end?.8:0)
  camera.updateMatrixWorld()
  const canvas=renderer.domElement
  for(const actor of pitchActors){
   actor.world.copy(actor.sprite.position)
   actor.sprite.position.y+=jumpHeight(actor)
   if(actor!==sean&&actor!==awayGK)actor.sprite.material.rotation=0
   if(aerial&&actor===players[aerial.index]){
    const jump=Math.sin(Math.PI*Math.min(1,aerial.age/.42))
    actor.sprite.position.y+=jump*(aerial.style==='VOLLEY'?.19:.61)
    actor.sprite.material.rotation=jump*(aerial.style==='BICYCLE KICK'?2.25:aerial.style==='HEADER'?.23:.13)*(actor.lastSideFace===2?-1:1)
   }
   if(celebrating){
    // Sort overlapping sprites by their feet with stable ties while the camera follows the scorer.
    actor.sprite.renderOrder=10_000+Math.round(screenPoint.copy(actor.world).applyMatrix4(camera.matrixWorldInverse).z*20)
    continue
   }
   actor.sprite.renderOrder=0
   screenPoint.copy(actor.sprite.position).project(camera)
   screenPoint.x=snap(screenPoint.x,2/canvas.width)
   screenPoint.y=snap(screenPoint.y,2/canvas.height)
   actor.sprite.position.copy(screenPoint.unproject(camera))
  }
  const selected=players[active].sprite
  screenUp.setFromMatrixColumn(camera.matrixWorld,1)
  headScreen.copy(selected.position).addScaledVector(screenUp,selected.scale.y*(1-selected.center.y)).project(camera)
  const depth=-screenPoint.copy(selected.position).applyMatrix4(camera.matrixWorldInverse).z
  const cellWidth=selected.scale.x*canvas.clientWidth*camera.projectionMatrix.elements[0]/(2*Math.max(.1,depth))
  const visibleFraction=players[active].maps[0].userData.bodyWidth??.55
  const plateWidth=Math.min(canvas.clientWidth*.34,cellWidth*visibleFraction*2.25)
  nameplate.style.width=plateWidth+'px'
  nameplate.style.fontSize=Math.max(7,Math.min(18,plateWidth/(Math.max(5,nameText.textContent?.length??5)*.9)))+'px'
  nameplate.style.left=Math.round((headScreen.x+1)*canvas.clientWidth/2)+'px'
  nameplate.style.top=Math.round((1-headScreen.y)*canvas.clientHeight/2-3)+'px'
  for(const s of seats??[]){
   if(seats!.length<2)break
   let label=seatLabels.get(s)
   if(!label){label=document.createElement('span');label.textContent='P'+s.number;label.style.cssText='position:absolute;pointer-events:none;transform:translate(-50%,-100%);font:18px Upheaval,monospace;color:white;text-align:center;min-width:2em;padding:2px 4px';label.style.backgroundColor=playerColor(s.number);matchView.append(label);seatLabels.set(s,label)}
   const sprite=teamActors(s)[s.actor]?.sprite
   label.hidden=!sprite?.visible||celebrating||replay.cut>=0
   if(!label.hidden){headScreen.copy(sprite.position).addScaledVector(screenUp,sprite.scale.y*(1-sprite.center.y)).project(camera);label.style.left=(headScreen.x+1)*canvas.clientWidth/2+'px';label.style.top=((1-headScreen.y)*canvas.clientHeight/2-(sprite===selected?nameplate.offsetHeight+5:4))+'px'}
  }
  nameplate.hidden=celebrating
  if(celebrating)ring.visible=false
  for(const {actor,icon} of exhaustionMarkers){
   const sprite=actor.sprite
   icon.hidden=actor.staminaCapacity>0||!sprite.visible
   if(icon.hidden)continue
   icon.title=actor.displayName+' · stamina depleted'
   headScreen.copy(sprite.position).addScaledVector(screenUp,sprite.scale.y*(1-sprite.center.y)).project(camera)
   icon.style.left=Math.round((headScreen.x+1)*canvas.clientWidth/2)+'px'
   const gap=sprite===selected?nameplate.offsetHeight+19:4
   icon.style.top=Math.round((1-headScreen.y)*canvas.clientHeight/2-gap)+'px'
  }
  if(feedbackActor){
   const sprite=feedbackActor.sprite
   headScreen.copy(sprite.position).addScaledVector(screenUp,sprite.scale.y*(1-sprite.center.y)).project(camera)
   callout.style.left=Math.round((headScreen.x+1)*canvas.clientWidth/2)+'px'
   callout.style.top=Math.round((1-headScreen.y)*canvas.clientHeight/2-(feedbackActor===players[active]?58:8)-8*(1-feedbackTime/1.05))+'px'
   callout.style.opacity=String(Math.min(1,feedbackTime/.22))
  }
  if(passCallIndex>=0){
   const sprite=players[passCallIndex].sprite
   headScreen.copy(sprite.position).addScaledVector(screenUp,sprite.scale.y*(1-sprite.center.y)).project(camera)
   passCall.style.left=Math.round((headScreen.x+1)*canvas.clientWidth/2)+'px'
   passCall.style.top=Math.round((1-headScreen.y)*canvas.clientHeight/2-8)+'px'
  }

  const burningPossession=((meters[0].value===100&&blueCarrier<0&&!bluePass&&(held||inFlight||rollingPass&&!lastBlue))||(meters[1].value===100&&(blueCarrier>=0||!!bluePass)))&&phase==='play'&&!crossingDrill&&!celebrating&&!outBall&&!keeperRestart&&!shot&&!blastShooter
  burningBall.update(ball.position,burningPossession,ball.position.y<=restingHeight+.25,paused?0:dt)
  if(!shot)blastFlying=false
  for(const [i,ember] of flames.entries()){
   ember.visible=(!!blastShooter||blastFlying)&&replay.cut<0
   if(!ember.visible)continue
   if(blastShooter){
    const angle=i*Math.PI/6+blastWindup*9,radius=.12+.8*(1-Math.min(1,blastWindup/.65))
    ember.position.copy(ball.position);ember.position.x+=radius*Math.cos(angle);ember.position.y+=radius*Math.sin(angle)
    ember.scale.setScalar(.08+blastWindup*.17)
   }else{
    ember.position.copy(ball.position).lerp(shotStart,Math.min(1,i*.014/Math.max(.1,shotTime/(shot?.duration||1))))
    ember.scale.setScalar(.36*(1-i/14))
   }
  }
  if(!celebrationLab&&!broadcast&&!paused&&(phase==='play'||cardScene))replay.record(celebrating||blastShooter?Math.min(elapsed,.10):dt,(shotDirection===1?attackingGoal:homeGoal).rippleTime)
  renderer.render(scene,camera)
  if(revealFirstFrame||broadcast&&!matchView.dataset.live)matchView.removeAttribute('data-loading')
  if(revealFirstFrame){
   revealFirstFrame=false
   reveal(matchView,crossingDrill?':scope > canvas,.training-panel':':scope > canvas,.bug-stack')
  }
  if(broadcast&&!matchView.dataset.live){matchView.dataset.live="true";window.frameElement?.classList.add("feed-live")}
  for(const actor of pitchActors)actor.sprite.position.copy(actor.world)
  if(celebrating&&resultTime<=0){
   finishGoalEvent()
   celebrating=false
   if(celebrationLab){
    reset(true,true);breakSeconds=6;matchView.classList.add('lab-kickoff')
   }
   else if(!broadcast&&replay.begin()){
    for(const actor of pitchActors)actor.sprite.renderOrder=0
    beginReplayInset()
    goalBanner.hidden=true;setReplayHint()
    ring.visible=false;nameplate.hidden=true;callout.hidden=true;clearPassCall();switchButton.disabled=true
    el('shotResult').textContent=''
   }else reset(shotDirection===attackSign,true)
  }
  requestAnimationFrame(tick)
 }
 requestAnimationFrame(tick)
}
start().catch(()=>{el('pitchError').hidden=false})
