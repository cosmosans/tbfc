import retro from './audio/menu-retro.mp3?inline'
import football from './audio/menu-football.mp3?inline'

export function startMenuMusic(setMatchSound:(on:boolean)=>void){
 const tracks=[retro,football]
 let index=0,enabled=false,finished=false
 const music=new Audio()
 music.preload='none';music.src=tracks[0];music.volume=.36
 const listeners=new AbortController(),options={signal:listeners.signal}
 function play(){if(enabled&&!document.hidden&&!finished)void music.play().catch(()=>{})}
 music.addEventListener('ended',()=>{index=(index+1)%tracks.length;music.src=tracks[index];play()},options)
 document.addEventListener('visibilitychange',()=>{if(document.hidden)music.pause();else play()},options)
 return {
  get playing(){return enabled&&!music.paused},
  toggle(){
   enabled=!this.playing
   setMatchSound(enabled)
   if(enabled)play();else music.pause()
  },
  finish(){
   finished=true;listeners.abort()
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
