import test from 'node:test'
import assert from 'node:assert/strict'
import {shootout,simulatePenalties} from '../src/shootoutRules.ts'
import {createCareer,finishRound} from '../src/careerSeason.ts'

test('early clinches and sudden death respect both kicking orders',()=>{
 for(const first of [0,1]){
  const kicks=[]
  const kick=outcome=>kicks.push({side:shootout(kicks,first).next,outcome})
  for(let i=0;i<3;i++){kick('Goal');assert.equal(shootout(kicks,first).winner,null);kick('Save')}
  assert.equal(shootout(kicks,first).winner,first)
  kicks.length=0
  for(let i=0;i<10;i++)kick('Goal')
  assert.deepEqual(shootout(kicks,first).score,[5,5])
  for(const outcome of ['Wide','Woodwork','Goal']){kick(outcome);assert.equal(shootout(kicks,first).winner,null)}
  kick('Save');assert.equal(shootout(kicks,first).winner,first)
 }
})
test('simulator stops on the deciding kick',()=>{
 let seed=12
 const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32)
 for(let i=0;i<200;i++){
  const kicks=simulatePenalties([3,4],random)
  assert.notEqual(shootout(kicks).winner,null)
  assert.equal(shootout(kicks.slice(0,-1)).winner,null)
 }
})
test('away club advances on live kicks with regulation statistics intact',()=>{
 const roster='Meghan Pam Jan Mandy Jeremy Chris Sean Stubbs José Steven Daniel Nelson Nadia'.split(' ')
 const c=createCareer('Sean','d5',123,roster,new Set(['Meghan','Pam','Jan','Mandy','Nadia']),8,true,true)
 c.schedule[0][0]={a:1,b:0,requiresWinner:true,kickoff:1200}
 c.schedule[0]=[c.schedule[0][0]]
 c.day=5
 const kicks=Array.from({length:6},(_,i)=>({side:i%2,outcome:i%2?'Save':'Goal'}))
 const report={score:[2,2],goals:[],shots:[2,2],played:roster,simulated:false,kicks}
 finishRound(c,report,[3,4])
 assert.deepEqual(report.score,[2,2]);assert.deepEqual(report.pens,[3,0])
 assert.deepEqual(c.schedule[0][0].pens,[0,3])
 assert.equal(c.stats.Sean.goals,0)
})
