import test from 'node:test'
import assert from 'node:assert/strict'
import {beatTheClockRules,classicRules,targetReached} from '../src/matchRules.ts'
import {supportsMode} from '../src/arenaCapabilities.ts'
import {beatStartSeconds,beatGoalBonus,beatConcededPenalty,challengeSide,adjustBeatClock,beatClockText,saveBeatBest,readBeatBests} from '../src/beatTheClock.ts'

test('Beat the Clock runs on the six Classic pitches without ordinary match targets',()=>{
 const rules=beatTheClockRules()
 assert.deepEqual({...rules,mode:'classic',winCondition:'timed'},classicRules())
 assert.equal(targetReached(rules,1,0),false)
 for(const venue of ['school','westend','southside','mill','eastside','topdeck'])assert.equal(supportsMode(venue,'beatTheClock'),true)
 assert.equal(supportsMode('gulch','beatTheClock'),false)
})

test('side validation permits one or two humans only on one side',()=>{
 assert.equal(challengeSide(null),null)
 assert.equal(challengeSide([]),null)
 assert.equal(challengeSide([{side:-1}]),-1)
 assert.equal(challengeSide([{side:1},{side:1}]),1)
 assert.equal(challengeSide([{side:-1},{side:1}]),null)
 assert.equal(challengeSide([{side:-1},{side:-1},{side:-1}]),null)
})

test('credited goals adjust the challenge team clock from either side',()=>{
 assert.equal(beatStartSeconds,90)
 assert.equal(beatGoalBonus,30)
 assert.equal(beatConcededPenalty,15)
 for(const team of [-1,1]){
  assert.equal(adjustBeatClock(90,team,team),120)
  assert.equal(adjustBeatClock(90,-team,team),75)
  assert.equal(adjustBeatClock(10,-team,team),0)
 }
 assert.equal(beatClockText(90),'01:30')
 assert.equal(beatClockText(15.2),'00:16')
 assert.equal(beatClockText(0),'00:00')
})

test('personal bests stay separate by difficulty and initial player count',()=>{
 const store=new Map()
 globalThis.localStorage={getItem:key=>store.get(key)??null,setItem:(key,value)=>store.set(key,value)}
 const base={goals:3,conceded:1,team:'TBFC',difficulty:'D6',finishedAt:'2026-11-27T00:00:00Z'}
 assert.equal(saveBeatBest({...base,players:1}).newBest,true)
 assert.equal(saveBeatBest({...base,goals:2,players:1}).newBest,false)
 assert.equal(saveBeatBest({...base,goals:4,players:2}).newBest,true)
 assert.equal(saveBeatBest({...base,goals:5,difficulty:'D5',players:1}).newBest,true)
 assert.equal(readBeatBests().solo.D6.goals,3)
 assert.equal(readBeatBests().coop.D6.goals,4)
 assert.equal(readBeatBests().solo.D5.goals,5)
})
