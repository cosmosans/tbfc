import test from 'node:test'
import assert from 'node:assert/strict'
import {classicRules,survivalRules} from '../src/matchRules.ts'
import {supportsMode} from '../src/arenaCapabilities.ts'
import {selectSurvivalElimination,survivalAnchors} from '../src/survival.ts'

test('Survival uses ordinary timed 7v7 rules and Classic stadiums',()=>{
 assert.deepEqual({...survivalRules(),mode:'classic'},classicRules())
 for(const venue of ['school','westend','southside','mill','eastside','topdeck']) assert.equal(supportsMode(venue,'survival'),true)
 assert.equal(supportsMode('gulch','survival'),false)
})

test('each eligible outfielder can be selected uniformly, with a minimum of two retained',()=>{
 const actors=Array.from({length:6},()=>({penalty:0}))
 for(let i=0;i<6;i++)assert.equal(selectSurvivalElimination(actors,0,()=>i/6),i)
 actors[2].penalty=120
 for(let i=0;i<5;i++)assert.notEqual(selectSurvivalElimination(actors,0,()=>i/5),2)
 assert.equal(selectSurvivalElimination(actors,4,()=>0),-1)
 assert.equal(selectSurvivalElimination(actors.slice(0,2),0,()=>0),-1)
})

test('reduced squads have one anchor per remaining outfielder and keep defensive cover',()=>{
 const original=Array.from({length:6},(_,i)=>({role:'CM',back:i>2,front:i<2,lane:i-3,depth:-i,y:50}))
 for(const count of [5,4,3,2]){
  const shape=survivalAnchors(original,count)
  assert.equal(shape.length,count)
  assert.equal(shape.filter(p=>p.front).length,1)
  assert.ok(shape.some(p=>p.back))
  assert.ok(shape.some(p=>p.depth<-10))
 }
})
