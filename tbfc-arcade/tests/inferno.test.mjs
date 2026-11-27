import test from 'node:test'
import assert from 'node:assert/strict'
import {classicRules,infernoRules,snowpocalypseRules,longRangeRules,firstToFiveRules,streetRules,streetPreferences} from '../src/matchRules.ts'
import {supportsMode,arenaCapabilities} from '../src/arenaCapabilities.ts'
import {physicsFor,standardPhysics} from '../src/matchPhysics.ts'

test('INFERNO preserves Classic match rules with a match-scoped permanent Burn override',()=>{
 const inferno=infernoRules(),classic=classicRules()
 assert.deepEqual({...inferno,mode:'classic',permanentBurn:false},classic)
 assert.equal(inferno.permanentBurn,true)
 assert.equal(inferno.winCondition,'timed')
 assert.equal(inferno.staminaDrain,1)
 assert.equal(physicsFor(inferno.mode),standardPhysics)
 for(const other of [classic,snowpocalypseRules(),longRangeRules(),firstToFiveRules(),streetRules(streetPreferences())])
  assert.equal(other.permanentBurn,false,other.mode)
})

test('INFERNO allows every Classic stadium, including indoor arenas, but excludes STREET',()=>{
 assert.deepEqual(Object.keys(arenaCapabilities).filter(id=>supportsMode(id,'inferno')),Object.keys(arenaCapabilities).filter(id=>supportsMode(id,'classic')))
 assert.equal(supportsMode('mill','inferno'),true)
 assert.equal(supportsMode('gulch','inferno'),false)
})
