import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { TutorialProgressTracker, decodeProgress, freshProgress, isChapterUnlocked } from '../src/tutorial/progress.ts'
import { coachingTarget, tutorialAllowsChallenges } from '../src/tutorial/ai.ts'
const script = JSON.parse(readFileSync(new URL('../src/tutorial/script.json', import.meta.url)))

test('invalid and stale tutorial saves recover safely', () => {
 for (const raw of [null, '{', 'null', '{"version":2}']) assert.deepEqual(decodeProgress(raw), freshProgress())
 assert.deepEqual(decodeProgress('{"version":1,"chapter":200,"completed":"yes","demonstrated":["shot",false,"shot"]}'), {version:1,chapter:11,completed:false,demonstrated:['shot']})
})
test('all twelve story chapters advance without requiring a successful action', () => {
 const tracker = new TutorialProgressTracker({chapter:0,mode:'story'}, freshProgress(), () => true)
 for (let i=0;i<12;i++) { tracker.go(i); assert.equal(tracker.progress.chapter,i); assert.equal(tracker.demonstrated(script[i].events),false) }
 tracker.complete(); assert.equal(tracker.progress.completed,true)
})
test('skills performed early remain recognized after save and resume', () => {
 let saved
 const tracker = new TutorialProgressTracker({chapter:0,mode:'story'}, freshProgress(), p => {saved=JSON.stringify(p);return true})
 tracker.record('curve'); tracker.go(9)
 const resumed = new TutorialProgressTracker({chapter:9,mode:'story'},decodeProgress(saved),()=>true)
 assert.equal(resumed.demonstrated(script[9].events),true)
 assert.equal(resumed.record('curve'),false)
})
test('skill replay neither overwrites story location nor unlocks completion', () => {
 const p = {...freshProgress(),chapter:6}
 const tracker = new TutorialProgressTracker({chapter:9,mode:'skill'},p,()=>true)
 tracker.record('curve'); tracker.go(11); tracker.complete()
 assert.equal(p.chapter,6); assert.equal(p.completed,false); assert.ok(p.demonstrated.includes('curve'))
})
test('replaying a completed story preserves the unlock and reports storage failures', () => {
 const tracker = new TutorialProgressTracker({chapter:0,mode:'story'},{...freshProgress(),completed:true},()=>false)
 assert.equal(tracker.storageAvailable,false); tracker.go(3); assert.equal(tracker.progress.completed,true)
})
test('script has every chapter, valid editable dialogues and the exact camera instruction', () => {
 assert.deepEqual(script.map(c=>c.id),Array.from({length:12},(_,i)=>i))
 for(const c of script) { assert.ok(c.intro.length); assert.ok(c.events.length); assert.ok(c.prompt); for(const kind of ['intro','success','hint','transition','ambient','ending']) for(const line of c[kind]) assert.ok(line.speaker && line.text) }
 assert.ok(script[0].intro.some(l=>l.speaker==='Chris'&&l.text==='I meant to tell you, you can click {camera} to change the camera if you want.'))
 assert.equal(script[11].ending.length,4)
})
test('coaching returns intentions without mutating the ball and releases normal scrimmage AI', () => {
 const ball=Object.freeze({x:0,z:0})
 assert.deepEqual(coachingTarget(0,'Steven',3,ball,false),{x:-1,z:11})
 assert.equal(coachingTarget(4,'Steven',3,ball,false),null)
 assert.equal(coachingTarget(11,'José',0,ball,false),null)
 assert.ok(coachingTarget(11,'José',0,ball,true))
})

const { TutorialInput } = await import('../src/tutorial/input.ts')
const pad = (...buttons) => ({buttons:Array.from({length:17},(_,i)=>({pressed:buttons.includes(i)})),axes:[0,0,0,0]})
test('controller A advances once per press, and a launch press cannot dismiss the opening line', () => {
 const input = new TutorialInput(pad(0))
 assert.deepEqual(input.read(pad(0),false,true),[])
 input.read(pad(),false,true)
 assert.deepEqual(input.read(pad(0),false,true),['advance'])
 assert.deepEqual(input.read(pad(0),false,true),[])
 // Release after dialogue closes stays consumed as an old press; no second UI action.
 assert.deepEqual(input.read(pad(),false,false),[])
})
test('controller Menu, B, chapter navigation and camera preserve separate responsibilities', () => {
 const input = new TutorialInput()
 assert.deepEqual(input.read(pad(9),false,true),['options'])
 input.read(pad(),true,true)
 assert.deepEqual(input.read(pad(13),true,true),['down'])
 input.read(pad(),true,true)
 assert.deepEqual(input.read(pad(0),true,true),['select'])
 input.read(pad(),true,true)
 assert.deepEqual(input.read(pad(1),true,true),['resume'])
 input.read(pad(),false,true)
 assert.deepEqual(input.read(pad(1),false,true),['dismiss'])
 input.read(pad(),false,false)
 assert.deepEqual(input.read(pad(5),false,false),['next'])
 input.read(pad(),false,true)
 assert.deepEqual(input.read(pad(11),false,true),[]) // Real camera action remains with the match input.
})
test('tutorial cast contains Pam and never duplicates the controlled character', () => {
 const scene = JSON.parse(readFileSync(new URL('../src/tutorial/scene.json', import.meta.url)))
 const cast=[...scene.home,...scene.away,scene.homeKeeper,scene.awayKeeper]
 assert.equal(new Set(cast).size,cast.length)
 assert.ok(scene.home.includes('Pam')); assert.equal(cast.filter(n=>n==='Chris').length,1)
})

const { TutorialCoaching } = await import('../src/tutorial/ai.ts')
test('teammates commit to independent world-space targets instead of copying every dribble step', () => {
 const coach = new TutorialCoaching()
 const jeremy = coach.target(0,'Jeremy',1,{x:0,z:0},false,false,0)
 const chris = coach.target(0,'Chris',2,{x:0,z:0},false,false,0)
 assert.deepEqual(coach.target(0,'Jeremy',1,{x:4,z:2},false,false,.2),jeremy)
 assert.deepEqual(coach.target(0,'Chris',2,{x:4,z:2},false,false,.2),chris)
 // Jeremy reconsiders sooner than Chris; neither follows a continuously translated offset.
 assert.notDeepEqual(coach.target(0,'Jeremy',1,{x:4,z:2},false,false,2.2),jeremy)
 assert.deepEqual(coach.target(0,'Chris',2,{x:4,z:2},false,false,2.2),chris)
 assert.notDeepEqual(coach.target(0,'Chris',2,{x:4,z:2},false,false,4),chris)
 assert.equal(coach.target(11,'Chris',2,{x:4,z:2},false,false,5),null)
})
test('arrival and conversation changes replace cached coaching intentions immediately', () => {
 const coach=new TutorialCoaching()
 assert.deepEqual(coach.target(0,'Steven',3,{x:0,z:0},false,false,0),{x:-1,z:11})
 const arrived=coach.target(3,'Steven',3,{x:0,z:0},false,false,.1)
 assert.notDeepEqual(arrived,{x:-1,z:11})
 assert.notDeepEqual(coach.target(3,'Steven',3,{x:0,z:0},true,false,.2),arrived)
})

const { isTutorialParticipant } = await import('../src/tutorial/ai.ts')
test('sideline return policy ends when teammates join their lesson or the scrimmage', () => {
 assert.equal(isTutorialParticipant(0,'Mandy',true),false)
 assert.equal(isTutorialParticipant(10,'Mandy',true),false)
 assert.equal(isTutorialParticipant(11,'Mandy',true),true)
 assert.equal(isTutorialParticipant(0,'Chris',false),true)
 assert.equal(isTutorialParticipant(2,'Steven',false),false)
 assert.equal(isTutorialParticipant(3,'Steven',false),true)
 assert.equal(isTutorialParticipant(4,'Meghan',true),false)
 assert.equal(isTutorialParticipant(6,'Meghan',true),true)
})

test('Win It Back activates exactly two opposing keep-away partners and restores later roles', () => {
 const scene = JSON.parse(readFileSync(new URL('../src/tutorial/scene.json', import.meta.url)))
 assert.deepEqual(scene.away.filter(name => isTutorialParticipant(5,name,true)), ['Meghan','Daniel'])
 assert.equal(isTutorialParticipant(6,'Mandy',true),false)
 assert.equal(isTutorialParticipant(6,'Daniel',true),false)
 assert.equal(isTutorialParticipant(6,'Meghan',true),true)
 for (const name of scene.defendingPartners) {
  const target=coachingTarget(5,name,scene.away.indexOf(name),{x:0,z:0},false,true)
  assert.ok(target && Math.abs(target.z)<11)
 }
 assert.ok(script[5].intro[0].text.includes('pass it our way'))
 assert.ok(script[5].prompt.includes('{pass}'))
})

test('defending lesson limits the player side to the current player and one partner', () => {
 const scene = JSON.parse(readFileSync(new URL('../src/tutorial/scene.json', import.meta.url)))
 for (const controlled of scene.home) {
  const defenders=[controlled,controlled==='Jeremy'?'José':'Jeremy']
  assert.equal(scene.home.filter(name=>isTutorialParticipant(5,name,false,defenders)).length,2)
  assert.ok(isTutorialParticipant(5,controlled,false,defenders))
 }
})
test('AI tackle and interception events cannot demonstrate the player tackle skill', () => {
 const tracker=new TutorialProgressTracker({chapter:5,mode:'skill'},freshProgress(),()=>true)
 tracker.record('tackleWon'); tracker.record('switch'); tracker.record('receive')
 assert.equal(tracker.demonstrated(script[5].events),false)
 tracker.record('playerTackleWon')
 assert.equal(tracker.demonstrated(script[5].events),true)
})

test('keep-away participants immediately pursue loose balls instead of cached formation spots', () => {
 const coach = new TutorialCoaching(), defenders = ['José','Jeremy']
 coach.target(5,'Jeremy',1,{x:0,z:0},false,false,0,defenders)
 assert.deepEqual(coach.target(5,'Jeremy',1,{x:9,z:-6},false,false,.1,defenders,true),{x:9,z:-6})
 assert.deepEqual(coach.target(5,'Meghan',0,{x:-8,z:5},false,true,.1,defenders,true),{x:-8,z:5})
 assert.deepEqual(coach.target(5,'Daniel',1,{x:-7,z:4},false,true,.2,defenders,true),{x:-7,z:4})
 assert.deepEqual(coach.target(5,'Mandy',3,{x:9,z:-6},false,true,.1,defenders,true),{x:-1,z:11})
 assert.equal(coach.target(11,'Meghan',0,{x:9,z:-6},false,true,.1,defenders,true),null)
})

test('defensive challenges end with keep-away and resume only in the scrimmage', () => {
 for (let chapter = 0; chapter <= 11; chapter++) {
  assert.equal(tutorialAllowsChallenges(chapter), chapter === 5 || chapter === 11)
 }
 for (let chapter = 6; chapter <= 10; chapter++) {
  const ball = {x: 0, z: 0}
  const target = coachingTarget(chapter, 'Meghan', 0, ball, false, true)
  assert.ok(target && Math.hypot(target.x, target.z) >= 7)
 }
 assert.equal(coachingTarget(11, 'Meghan', 0, {x:0,z:0}, false, true), null)
})

test('chapter selection unlocks only reached chapters and always offers the opening', () => {
 const progress = freshProgress()
 assert.equal(isChapterUnlocked(progress, 0), true)
 assert.equal(isChapterUnlocked(progress, 1), false)
 progress.chapter = 4
 for (let chapter = 0; chapter < 12; chapter++) assert.equal(isChapterUnlocked(progress, chapter), chapter <= 4)
 progress.completed = true
 assert.equal(isChapterUnlocked(progress, 11), true)
})
test('replaying earlier chapters preserves furthest reached chapter after reload', () => {
 const tracker = new TutorialProgressTracker({chapter:2,mode:'story'}, {...freshProgress(),chapter:7}, () => true)
 tracker.go(3)
 const saved = decodeProgress(JSON.stringify(tracker.progress))
 assert.equal(saved.chapter, 3)
 assert.equal(isChapterUnlocked(saved, 7), true)
 assert.equal(isChapterUnlocked(saved, 8), false)
})
