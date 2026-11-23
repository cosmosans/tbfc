import test from 'node:test'
import assert from 'node:assert/strict'
import { build } from 'esbuild'

// Exercise the shared cue against a media stub, without playing sound in the test runner.
const result = await build({entryPoints:[new URL('../src/menuMusic.ts',import.meta.url).pathname],bundle:true,write:false,format:'esm',platform:'node',plugins:[{
 name:'audio-urls',setup(build){
  build.onResolve({filter:/\.mp3\?url$/},args=>({path:args.path,namespace:'audio-url'}))
  build.onLoad({filter:/.*/,namespace:'audio-url'},args=>({contents:`export default ${JSON.stringify(args.path)}`,loader:'js'}))
 }
}]})
const { createMusicCue } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`)
const storage=new Map()
const players=[]
globalThis.localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)}
globalThis.document={hidden:false}
globalThis.requestAnimationFrame=()=>1
globalThis.cancelAnimationFrame=()=>{}
globalThis.Audio=class {
 paused=true; volume=1; currentTime=0; src=''
 constructor(){players.push(this)}
 play(){this.paused=false;this.onplaying?.();return Promise.resolve()}
 pause(){this.paused=true}
 removeAttribute(name){if(name==='src')this.src=''}
 load(){}
}

test('First Touch playlist loops without advancing the normal menu cursor',()=>{
 storage.clear();storage.set('tbfc.arcade.nextMusicTrack','3')
 const cue=createMusicCue({playlist:['one','two','three','four'],storageKey:'tutorial',fadeOutMs:0})
 const player=players.at(-1)
 cue.resume();assert.equal(player.src,'one')
 for(const next of ['two','three','four','one']){player.paused=true;player.onended();assert.equal(player.src,next)}
 assert.equal(storage.get('tbfc.arcade.nextMusicTrack'),'3')
 cue.finish();assert.equal(player.paused,true);assert.equal(player.src,'')
})
test('pause resumes the same track and a new session uses the tutorial cursor',()=>{
 storage.clear()
 const options={playlist:['one','two'],storageKey:'tutorial',fadeOutMs:0}
 const cue=createMusicCue(options),player=players.at(-1)
 cue.resume();player.currentTime=42;cue.pause();cue.resume()
 assert.equal(player.src,'one');assert.equal(player.currentTime,42)
 cue.finish()
 const next=createMusicCue(options);next.resume();assert.equal(players.at(-1).src,'two');next.finish()
})
