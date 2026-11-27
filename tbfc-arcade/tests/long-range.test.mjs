import test from 'node:test'
import assert from 'node:assert/strict'
import {longRangeEligible,goalValue,longRangeBox} from '../src/longRange.ts'
import {planShot} from '../src/shooting.ts'
import {classicRules,longRangeRules} from '../src/matchRules.ts'
import {supportsMode} from '../src/arenaCapabilities.ts'

test('scoring line and inside award one; outside awards two at either end',()=>{
 const x=longRangeBox.fieldX-longRangeBox.depth,z=longRangeBox.halfWidth
 for(const sign of [-1,1]){
  assert.equal(goalValue('longRange',sign*x,0,sign),1)
  assert.equal(goalValue('longRange',sign*14.5,0,sign),1)
  assert.equal(goalValue('longRange',sign*14,0,sign),2)
  assert.equal(goalValue('longRange',sign*20,z,sign),1)
  assert.equal(goalValue('longRange',sign*(x-.001),0,sign),2)
  assert.equal(goalValue('longRange',sign*20,z+.001,sign),2)
  assert.equal(goalValue('longRange',0,0,sign),2)
  assert.equal(goalValue('classic',0,0,sign),1)
  assert.ok(longRangeEligible(0,0,sign))
 }
})
test('long range inherits Classic 7v7 and all Classic venues',()=>{
 const rules=longRangeRules();assert.deepEqual({...rules,mode:'classic'},classicRules())
 for(const id of ['school','westend','southside','mill','eastside','topdeck'])assert.ok(supportsMode(id,rules.mode))
 assert.ok(!supportsMode('gulch',rules.mode))
})
test('same outside shot is more viable; inside and other modes use baseline calculator',()=>{
 let classicGoals=0,longGoals=0,classicMisses=0,longMisses=0,saves=0
 for(let i=0;i<1000;i++){
  const a=planShot(4,0,0,.8,21,4,19,()=>i/1000,true,1.4,1,2)
  const b=planShot(4,0,0,.8,21,4,19,()=>i/1000,true,1.4,1,2,undefined,true)
  classicGoals+=a.result==='Goal';longGoals+=b.result==='Goal'
  classicMisses+=a.result==='Wide'||a.result==='Over'
  longMisses+=b.result==='Wide'||b.result==='Over'
  saves+=b.result==='Save'
 }
 assert.ok(longGoals>classicGoals*1.2)
 assert.ok(longMisses<classicMisses)
 assert.ok(saves>0)
 assert.deepEqual(planShot(18,0,0,.8,21,18,19,()=>.65,true,1.4,1,2),planShot(18,0,0,.8,21,18,19,()=>.65,true,1.4,1,2,undefined,false))
})
