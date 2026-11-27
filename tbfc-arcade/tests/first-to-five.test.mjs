import test from 'node:test'
import assert from 'node:assert/strict'
import {classicRules,firstToFiveRules,firstToFiveTargets,longRangeRules,streetRules,streetPreferences,targetReached} from '../src/matchRules.ts'
import {supportsMode} from '../src/arenaCapabilities.ts'

test('first to five is Classic 7v7 with an untimed five-goal target',()=>{
 const rules=firstToFiveRules()
 assert.equal(rules.mode,'firstToFive')
 assert.equal(rules.teamSize,7)
 assert.equal(rules.goalkeepers,1)
 assert.equal(rules.winCondition,'target')
 assert.equal(rules.targetScore,5)
 assert.equal(rules.halfMinutes,null)
 assert.deepEqual(rules.goal,classicRules().goal)
 assert.equal(rules.boundary,classicRules().boundary)
 assert.ok(rules.staminaDrain<1&&rules.staminaDrain>0)
 assert.ok(rules.capacityRecovery>0)
})

test('3, 5, and 10 goals are supported and either side wins at its selected target',()=>{
 assert.deepEqual([...firstToFiveTargets],[3,5,10])
 for(const target of firstToFiveTargets){
  const rules=firstToFiveRules(target)
  assert.equal(rules.targetScore,target)
  assert.equal(targetReached(rules,target-1,target-1),false)
  assert.equal(targetReached(rules,target,target-1),true)
  assert.equal(targetReached(rules,target-1,target),true)
 }
 assert.equal(firstToFiveRules(7).targetScore,5)
 const rules=firstToFiveRules()
 assert.equal(targetReached(classicRules(),5,0),false)
 assert.equal(targetReached(longRangeRules(),5,0),false)
 assert.equal(streetRules(streetPreferences()).staminaDrain,1)
 for(const id of ['school','westend','southside','mill','eastside','topdeck'])
  assert.ok(supportsMode(id,rules.mode))
 assert.ok(!supportsMode('gulch',rules.mode))
})
