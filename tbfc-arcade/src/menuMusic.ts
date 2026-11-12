import startClick from './audio/start-click.mp3?inline'
import retro from './audio/menu-retro.mp3?inline'
import football from './audio/menu-football.mp3?inline'

export function startMenuMusic(initialSound:boolean,setMatchSound:(on:boolean)=>void){
 const tracks=[retro,football]
 const musicKey='tbfc.arcade.musicMuted'
 let musicEnabled=initialSound,soundEnabled=initialSound
 // Seed both channels from the old combined preference on the first visit.
 try{
  const stored=localStorage.getItem(musicKey)
  if(stored===null)localStorage.setItem(musicKey,musicEnabled?'no':'yes')
  else musicEnabled=stored!=='yes'
 }catch{}
 let index=0,started=false,finished=false
 const music=new Audio()
 music.preload='none';music.src=tracks[0];music.volume=.36;music.muted=!musicEnabled
 const cue=new Audio(startClick)
 cue.preload='auto';cue.volume=.6;cue.muted=!soundEnabled
 const listeners=new AbortController(),options={signal:listeners.signal}
 function play(){
  if(started&&musicEnabled&&!finished&&!document.hidden&&music.paused)void music.play().catch(()=>{})
 }
 function pauseMenu(){music.pause();cue.pause()}
 music.addEventListener('ended',()=>{
  index=(index+1)%tracks.length;music.src=tracks[index];play()
 },options)
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseMenu();else play()},options)
 window.addEventListener('pagehide',pauseMenu,options)
 window.addEventListener('pageshow',play,options)
 return {
  get musicEnabled(){return musicEnabled},
  get soundEnabled(){return soundEnabled},
  start(){
   if(started||finished)return
   started=true
   if(soundEnabled){
    void cue.play().catch(()=>{})
    setMatchSound(true)
   }
   play()
  },
  toggleMusic(){
   musicEnabled=!musicEnabled
   music.muted=!musicEnabled
   try{localStorage.setItem(musicKey,music.muted?'yes':'no')}catch{}
   if(musicEnabled)play()
  },
  toggleSound(){
   soundEnabled=!soundEnabled
   cue.muted=!soundEnabled
   if(!soundEnabled)cue.pause()
   setMatchSound(soundEnabled)
  },
  finish(){
   finished=true;listeners.abort();cue.pause()
   const start=performance.now()
   function fade(){
    const remaining=Math.max(0,1-(performance.now()-start)/450)
    music.volume=.36*remaining
    if(remaining&&!music.paused){requestAnimationFrame(fade);return}
    music.pause();music.removeAttribute('src');music.load()
   }
   fade()
  }
 }
}
export type MenuMusic=ReturnType<typeof startMenuMusic>
