import blast from './audio/burner-blast.wav?url'
import post from './audio/post.wav?url'
import cheer from './audio/goal-crowd.mp3?url'
import stadium from './audio/stadium.mp3?url'
import goal from './audio/tbfc-goal.mp3?url'
import whistle from './audio/whistle.mp3?url'
import kick1 from './audio/soccer-ball-kick.mp3?url'
import kick2 from './audio/soccer-ball-kick-2.mp3?url'
import kick3 from './audio/soccer-ball-kick-3.mp3?url'
import kick4 from './audio/soccer-ball-kick-4.mp3?url'

import nav from './audio/01_UI_Nav_Standard.wav?url'
import success from './audio/13_UI_Success_Bloop.wav?url'
import open from './audio/06_UI_Menu_Open.wav?url'
import close from './audio/07_UI_Menu_Close.wav?url'

type MenuCue='nav'|'success'|'open'|'close'
const recordings={blast,post,nav,success,open,close,stadium,goal,cheer,whistle,kick1,kick2,kick3,kick4}
type Impact='post'|'bar'|'board'|'bounce'|'net'
type Sound=keyof typeof recordings|Impact

export class MatchAudio {
 private ctx?:AudioContext
 private master?:GainNode
 private menuBus?:GainNode
 private menuVoice?:AudioBufferSourceNode
 private bed?:GainNode
 private buffers=new Map<Sound,AudioBuffer>()
 private voices=new Set<AudioBufferSourceNode>()
 private stopped=false
 private finalWhistle=false
 private quiet=false
 private kickIndex=0
 muted=false

 constructor(){
  try{this.muted=localStorage.getItem('tbfc.arcade.muted')==='yes'}catch{}
 }
 unlock(){
  if(!window.AudioContext)return
  if(!this.ctx){
   const ctx=this.ctx=new AudioContext()
   this.menuBus=ctx.createGain();this.menuBus.connect(ctx.destination)
   this.master=ctx.createGain();this.master.connect(ctx.destination)
   this.bed=ctx.createGain();this.bed.connect(this.master)
   this.sync()
   for(const [key,url] of Object.entries(recordings)){
    void fetch(url).then(r=>r.arrayBuffer()).then(b=>ctx.decodeAudioData(b)).then(buffer=>{
     this.buffers.set(key as Sound,buffer)
     if(key==='post')this.buffers.set('bar',buffer)
     if(key==='stadium'){
      const crowd=ctx.createBufferSource()
      crowd.buffer=buffer;crowd.loop=true;crowd.connect(this.bed!);crowd.start()
     }
    }).catch(()=>{})
   }
   for(const kind of ['post','bar','board','bounce','net'] as Impact[]){
    const buffer=ctx.createBuffer(1,Math.floor(ctx.sampleRate*.42),ctx.sampleRate)
    const data=buffer.getChannelData(0)
    let seed=1843,smooth=0
    for(let i=0;i<data.length;i++){
     const t=i/ctx.sampleRate
     seed=(Math.imul(seed,1664525)+1013904223)>>>0
     const noise=seed/2147483648-1
     smooth=.65*smooth+.35*noise
     const f=kind==='post'?910:kind==='bar'?625:kind==='board'?142:195
     const metal=kind==='post'||kind==='bar'
     const sound=kind==='net'?smooth*(1+.5*Math.sin(190*t)):Math.sin(2*Math.PI*f*t)*.54+
      (metal?Math.sin(2*Math.PI*f*2.72*t)*.28:smooth*.5)
     data[i]=sound*Math.min(1,t/.002)*Math.exp(-t*(metal?13:kind==='bounce'?45:27))
    }
    this.buffers.set(kind,buffer)
   }
  }
  if(this.ctx.state==='suspended')void this.ctx.resume().catch(()=>{})
 }
 private sync(){
  if(!this.ctx)return
  const gain=this.master!.gain,now=this.ctx.currentTime
  this.menuBus!.gain.setValueAtTime(this.muted?0:.48,now)
  gain.cancelScheduledValues(now)
  if(this.stopped||this.muted)gain.setValueAtTime(0,now)
  else gain.setTargetAtTime(.83,now,.012)
  this.bed!.gain.setTargetAtTime(this.finalWhistle?0:this.quiet?.09:.23,this.ctx.currentTime,.2)
 }
 finishMatch(){this.finalWhistle=true;this.sync()}
 restartMatch(){this.finalWhistle=false;this.sync()}
 setMuted(muted:boolean){
  this.muted=muted
  try{localStorage.setItem('tbfc.arcade.muted',this.muted?'yes':'no')}catch{}
  if(!muted)this.unlock()
  this.sync()
 }
 state(stopped:boolean,quiet:boolean){
  if(this.stopped===stopped&&this.quiet===quiet)return
  this.stopped=stopped;this.quiet=quiet;this.sync()
  if(stopped)this.clear()
 }
 clear(){for(const s of this.voices)s.stop();this.voices.clear()}
 play(key:Sound,gain=.6,rate=1){
  const ctx=this.ctx,buffer=this.buffers.get(key)
  if(!ctx||!buffer||ctx.state!=='running'||this.muted||this.stopped||this.voices.size>=12)return
  const src=ctx.createBufferSource(),level=ctx.createGain()
  src.buffer=buffer;src.playbackRate.value=rate;level.gain.value=gain
  src.connect(level).connect(this.master!);this.voices.add(src)
  src.onended=()=>{this.voices.delete(src);src.disconnect();level.disconnect()}
  src.start()
 }
 menu(key:MenuCue){
  if(this.muted||document.hidden)return
  this.unlock()
  const ctx=this.ctx,buffer=this.buffers.get(key)
  if(!ctx||!buffer)return
  this.menuVoice?.stop()
  const source=ctx.createBufferSource()
  source.buffer=buffer;source.connect(this.menuBus!)
  source.onended=()=>{source.disconnect();if(this.menuVoice===source)this.menuVoice=undefined}
  this.menuVoice=source;source.start()
 }
 kick(power=.4){
  const keys=['kick1','kick2','kick3','kick4'] as const
  this.play(keys[this.kickIndex++%4],.32+.55*power,1.12-.19*power)
 }
}

export const audio=new MatchAudio()
