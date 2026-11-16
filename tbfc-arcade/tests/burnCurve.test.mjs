import test from 'node:test'
import assert from 'node:assert/strict'
import { CurveGesture } from '../src/burnCurve.ts'

function turn(angles, interval=80){
 const gesture=new CurveGesture()
 gesture.reset(0)
 for(const [i,angle] of angles.entries()){
  const radians=angle*Math.PI/180
  gesture.sample(Math.cos(radians),Math.sin(radians),i*interval)
 }
 return gesture
}

test('straight shots and small aim adjustments stay uncurved',()=>{
 const input=turn([0,8,15,4])
 assert.equal(input.finish(true),null)
 input.sample(0,0,400)
 input.sample(0,1,480)
 assert.equal(input.finish(false),null)
})

test('signed sweeps lock the initial aim and cross the stick angle seam',()=>{
 for(const sign of [-1,1]){
  const input=turn([170,200,230,260].map(angle=>angle*sign))
  const strike=input.finish(false)
  assert.equal(strike.style,'Curler')
  assert.equal(Math.sign(strike.rate),sign)
  assert.ok(Math.abs(strike.aim-170*sign*Math.PI/180)<1e-8)
 }
})

test('fast half circles earn Wicked Bend, while Burn Mode upgrades the strike',()=>{
 const angles=[0,45,90,135,180]
 const fast=turn(angles)
 fast.sample(-1,0,2100)
 assert.equal(fast.finish(false).style,'Wicked Bend')
 assert.equal(turn(angles,250).finish(false).style,'Curler')
 assert.equal(fast.finish(true).style,'Fire Spiral')
})
