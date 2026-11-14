import startClick from './audio/start-click.mp3?url'
import retro from './audio/menu-retro.mp3?url'
import football from './audio/menu-football.mp3?url'
import pixelChiptune from './audio/menu-pixel-chiptune.mp3?url'
import hitslab from './audio/hitslab-chiptune-457939.mp3?url'
import monume from './audio/monume-retro-arcade-629774.mp3?url'
import arpmedia from './audio/arpmedia-retro-arcade-577821.mp3?url'
import synthFeelGood from './audio/menu-synth-feel-good.mp3?url'
import carsSport from './audio/menu-cars-sport.mp3?url'

const tracks=[retro,football,pixelChiptune,hitslab,monume,arpmedia,synthFeelGood,carsSport]
const cursorKey='tbfc.arcade.nextMusicTrack'
let nextIndex=0

type Bookmark={track:string,time:number}
export function createMusicCue({fadeInMs=0,fadeOutMs=450}={},bookmark?:Bookmark){
 const player=new Audio()
 player.preload='none'
 const volume=.36
 let active=false,animation=0,index:number|null=null,consumed=false
 function fade(to:number,ms:number,done?:()=>void){
  cancelAnimationFrame(animation)
  const from=player.volume,start=performance.now()
  function step(){
   const t=ms>0?Math.min(1,(performance.now()-start)/ms):1
   player.volume=from+(to-from)*t
   if(t<1)animation=requestAnimationFrame(step)
   else done?.()
  }
  step()
 }
 function play(){
  if(!active||document.hidden)return
  if(index===null){
   try{
    const saved=localStorage.getItem(cursorKey)
    if(saved!==null&&/^\d+$/.test(saved))nextIndex=Number(saved)%tracks.length
   }catch{}
   const savedTrack=bookmark?tracks.indexOf(bookmark.track):-1
   index=savedTrack>=0?savedTrack:nextIndex;consumed=false;player.src=tracks[index]
   if(bookmark&&savedTrack>=0&&Number.isFinite(bookmark.time))player.currentTime=bookmark.time
   bookmark=undefined
   player.volume=fadeInMs?0:volume
  }
  if(player.paused)void player.play().catch(()=>{})
 }
 player.onplaying=()=>{
  if(!active||index===null||consumed)return
  consumed=true;nextIndex=(index+1)%tracks.length
  try{localStorage.setItem(cursorKey,String(nextIndex))}catch{}
  fade(volume,fadeInMs)
 }
 player.onended=()=>{index=null;play()}
 return {
  bookmark():Bookmark|undefined{return index!==null&&consumed?{track:tracks[index],time:player.currentTime}:bookmark},
  resume(){active=true;play()},
  pause(){active=false;player.pause()},
  finish(){
   active=false
   fade(0,player.paused?0:fadeOutMs,()=>{
    player.pause();player.removeAttribute('src');player.load();index=null
   })
  }
 }
}

export function startMenuMusic(initialSound:boolean,setMatchSound:(on:boolean)=>void){
 const musicKey='tbfc.arcade.musicMuted'
 let musicEnabled=initialSound,soundEnabled=initialSound
 // Seed both channels from the old combined preference on the first visit.
 try{
  const stored=localStorage.getItem(musicKey)
  if(stored===null)localStorage.setItem(musicKey,musicEnabled?'no':'yes')
  else musicEnabled=stored!=='yes'
 }catch{}
 const saved=history.state?.arcadeMusic as Bookmark|undefined
 if(saved)history.replaceState({...history.state,arcadeMusic:undefined},'')
 let started=false
 let music=createMusicCue({fadeInMs:saved?900:0},saved)
 const cue=new Audio(startClick)
 cue.preload='auto';cue.volume=.6;cue.muted=!soundEnabled

 function play(){
  if(started&&musicEnabled&&!document.hidden)music.resume()
 }
 function pauseMenu(){music.pause();cue.pause()}
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseMenu();else play()})
 window.addEventListener('pagehide',pauseMenu)
 window.addEventListener('pageshow',play)
 return {
  get musicEnabled(){return musicEnabled},
  get soundEnabled(){return soundEnabled},
  start(playStartCue=true){
   if(started)return
   started=true
   if(soundEnabled){
    if(playStartCue)void cue.play().catch(()=>{})
    setMatchSound(true)
   }
   play()
  },
  toggleMusic(){
   musicEnabled=!musicEnabled
   try{localStorage.setItem(musicKey,musicEnabled?'no':'yes')}catch{}
   if(musicEnabled)play();else music.pause()
  },
  toggleSound(){
   soundEnabled=!soundEnabled
   cue.muted=!soundEnabled
   if(!soundEnabled)cue.pause()
   setMatchSound(soundEnabled)
  },
  startBreak(){
   if(started)return
   started=true;music=createMusicCue({fadeInMs:900,fadeOutMs:650});play()
  },
  carryOver(){
   history.replaceState({...history.state,arcadeMusic:music.bookmark()},'')
  },
  finish(){
   if(!started)return
   started=false;cue.pause()
   music.finish()
  }
 }
}
export type MenuMusic=ReturnType<typeof startMenuMusic>
