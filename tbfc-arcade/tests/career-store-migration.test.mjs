import test from 'node:test'
import assert from 'node:assert/strict'
import {createCareer} from '../src/careerSeason.ts'
import {loadSlot} from '../src/careerStore.ts'

test('D4 career saves reopen in D5 with club and history divisions migrated',()=>{
 const roster='Meghan Pam Jan Mandy Jeremy Chris Sean Stubbs José Steven Daniel Nelson Nadia'.split(' ')
 const c=createCareer('Sean','d5',123,roster,new Set(['Meghan','Pam','Jan','Mandy','Nadia']),6,true,true)
 c.division='d4'
 c.clubDivisions['Barely United']='d4'
 c.history.push({season:0,division:'d4',place:1,points:12,reports:[],schedule:[]})
 const raw=JSON.stringify(c)
 const previous=globalThis.localStorage
 globalThis.localStorage={getItem:key=>key==='tbfc.arcade.career.v1.0'?raw:null}
 try{
  const loaded=loadSlot(0)
  assert.equal(loaded.division,'d5')
  assert.equal(loaded.clubDivisions['Barely United'],'d5')
  assert.equal(loaded.history[0].division,'d5')
 }finally{globalThis.localStorage=previous}
})
