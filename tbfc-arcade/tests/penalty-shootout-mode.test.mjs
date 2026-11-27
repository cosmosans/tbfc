import test from 'node:test'
import assert from 'node:assert/strict'
import {shootout,penaltyStakes} from '../src/shootoutRules.ts'
import {classicRules,penaltyShootoutRules} from '../src/matchRules.ts'
import {arenaCapabilities,supportsMode} from '../src/arenaCapabilities.ts'

for(const length of [3,5,7])test(`${length}-kick shootout clinches early and then rotates through sudden death fairly`,()=>{
 const kicks=[],first=1
 const add=outcome=>kicks.push({side:shootout(kicks,first,length).next,outcome})
 for(let i=0;i<Math.floor(length/2);i++){add('Goal');add('Save')}
 assert.equal(shootout(kicks,first,length).winner,null)
 while(shootout(kicks,first,length).winner===null){
  add('Goal')
  if(shootout(kicks,first,length).winner===null)add('Save')
 }
 assert.equal(shootout(kicks,first,length).winner,first)
 assert.ok(kicks.length<2*length)
 kicks.length=0
 for(let i=0;i<length;i++){add('Goal');add('Goal')}
 assert.equal(shootout(kicks,first,length).suddenDeath,true)
 assert.equal(shootout(kicks,first,length).winner,null)
 add('Goal');assert.equal(shootout(kicks,first,length).winner,null)
 add('Save');assert.equal(shootout(kicks,first,length).winner,first)
})

test('decisive callouts wait for equal sudden-death opportunities',()=>{
 const kicks=[];for(let i=0;i<3;i++){kicks.push({side:0,outcome:'Goal'},{side:1,outcome:'Goal'})}
 assert.equal(penaltyStakes(kicks,0,3).kicker,'')
 kicks.push({side:0,outcome:'Goal'})
 assert.equal(penaltyStakes(kicks,0,3).kicker,'MUST SCORE!')
 assert.equal(penaltyStakes(kicks,0,3).keeper,'SAVE TO WIN!')
})

test('standalone shootout keeps Classic stadium access and leaves other rules isolated',()=>{
 const rules=penaltyShootoutRules()
 assert.deepEqual({...rules,mode:'classic'},classicRules())
 assert.deepEqual(Object.keys(arenaCapabilities).filter(id=>supportsMode(id,rules.mode)),Object.keys(arenaCapabilities).filter(id=>supportsMode(id,'classic')))
 assert.equal(supportsMode('gulch',rules.mode),false)
})
