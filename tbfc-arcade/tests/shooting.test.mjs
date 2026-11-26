import test from 'node:test'
import assert from 'node:assert/strict'
import {planShot,streetShotAim} from '../src/shooting.ts'
const shot=(distance,roll,target=0,width=1.1)=>planShot(16-distance,0,0,.5,16,16-distance,15,()=>roll,false,0,1,width,target)
test('close straight STREET shots follow aim and failed accuracy rolls stay small',()=>{
 for(const distance of [1,2,3])for(let i=0;i<1000;i++){
  const s=shot(distance,i/1000)
  if(s.result==='Post'||s.result==='Crossbar')continue
  assert.ok(Math.abs(s.targetZ)<=distance*Math.tan(6.25*Math.PI/180)+1e-9)
 }
 assert.equal(shot(1,0).result,'Goal')
})
test('the same wide roll produces a larger miss with distance',()=>{
 assert.ok(Math.abs(shot(12,0).targetZ)>Math.abs(shot(2,0).targetZ))
 assert.equal(shot(12,0).result,'Wide')
})
test('aim projection preserves lateral aim and does not rescue an aimed miss',()=>{
 assert.equal(streetShotAim(.2,2,1,0),.2)
 assert.ok(Math.abs(streetShotAim(.2,2,1,.2)-.6)<1e-9)
 assert.equal(streetShotAim(0,2,-1,0),undefined)
 const s=shot(2,.5,2)
 assert.equal(s.result,'Wide');assert.equal(s.targetZ,2)
})
test('classic wide rolls retain their established trajectory',()=>{
 const s=planShot(19,0,0,.5,21,19,20,()=>0,false,1,1,2)
 assert.equal(s.result,'Wide');assert.equal(s.targetZ,3.45)
})
