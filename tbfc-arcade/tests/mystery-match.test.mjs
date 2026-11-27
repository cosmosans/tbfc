import test from 'node:test'
import assert from 'node:assert/strict'
import {classicRules,mysteryMatchRules} from '../src/matchRules.ts'
import {supportsMode} from '../src/arenaCapabilities.ts'
import {createMysteryState,advanceMystery,mysteryModifiers,mysteryInterval,mysteryTime} from '../src/mysteryMatch.ts'

test('Mystery Match uses Classic rules on the six standard stadiums',()=>{
 assert.deepEqual({...mysteryMatchRules(),mode:'classic'},classicRules())
 for(const venue of ['school','westend','southside','mill','eastside','topdeck'])
  assert.equal(supportsMode(venue,'mysteryMatch'),true)
 assert.equal(supportsMode('gulch','mysteryMatch'),false)
})

test('all modifiers appear in a shuffled bag without consecutive repeats',()=>{
 const state=createMysteryState(()=>.42)
 const seen=new Set([state.current.id])
 for(let i=0;i<mysteryModifiers.length*2;i++){
  const old=state.current.id
  assert.equal(advanceMystery(state,mysteryInterval,()=>.42),true)
  assert.notEqual(state.current.id,old)
  seen.add(state.current.id)
 }
 assert.equal(seen.size,mysteryModifiers.length)
})

test('only supplied active time advances the independent modifier clock',()=>{
 const state=createMysteryState(()=>.2)
 assert.equal(advanceMystery(state,0),false)
 assert.equal(advanceMystery(state,59),false)
 assert.equal(state.remaining,1)
 assert.equal(advanceMystery(state,1),true)
 assert.equal(state.remaining,60)
 assert.equal(state.history[1].at,60)
 assert.equal(mysteryTime(60),'01:00')
 assert.equal(mysteryTime(4.2),'00:05')
})
