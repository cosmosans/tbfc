import test from 'node:test'
import assert from 'node:assert/strict'
import {classicRules,snowpocalypseRules,streetRules,streetPreferences} from '../src/matchRules.ts'
import {supportsMode,arenaCapabilities} from '../src/arenaCapabilities.ts'
import {physicsFor,snowPhysics,standardPhysics,snowMotion,approachVelocity,slideTravel} from '../src/matchPhysics.ts'

test('snow is an independent 7v7 Classic rules variant; other matches retain standard physics',()=>{
 const snow=snowpocalypseRules(),classic=classicRules()
 assert.deepEqual({...snow,mode:'classic'},classic)
 assert.equal(physicsFor(snow.mode),snowPhysics)
 for(const rules of [classic,streetRules(streetPreferences()),classicRules()])assert.equal(physicsFor(rules.mode),standardPhysics)
 snow.goal.halfWidth=99;assert.equal(classic.goal.halfWidth,2)
 assert.ok(Object.isFrozen(snowPhysics));assert.ok(Object.isFrozen(standardPhysics))
})
test('outdoor Classic capability admits all five stadiums, excluding indoor and dedicated STREET',()=>{
 assert.deepEqual(Object.keys(arenaCapabilities).filter(id=>supportsMode(id,'snowpocalypse')),['school','westend','southside','eastside','topdeck'])
 assert.ok(supportsMode('mill','classic'));assert.ok(!supportsMode('gulch','snowpocalypse'));assert.ok(supportsMode('gulch','street'))
 assert.ok(!supportsMode('missing','snowpocalypse'))
})
test('momentum responds immediately, drifts on turns, brakes gradually, and reverses',()=>{
 const v={x:0,z:0};const first=snowMotion(v,{x:6,z:0},1/60);assert.ok(first.x>0)
 for(let i=0;i<120;i++)snowMotion(v,{x:6,z:0},1/60)
 const turn=snowMotion(v,{x:0,z:4},1/60);assert.ok(turn.x>0);assert.ok(turn.z>0)
 const coast=snowMotion(v,{x:0,z:0},.1);assert.ok(coast.x>.3)
 for(let i=0;i<180;i++)snowMotion(v,{x:0,z:0},1/60)
 assert.ok(Math.hypot(v.x,v.z)<.01)
 v.x=6;v.z=0;assert.ok(snowMotion(v,{x:-6,z:0},1/60).x>0)
 for(let i=0;i<90;i++)snowMotion(v,{x:-6,z:0},1/60)
 assert.ok(v.x<-5)
})
test('snow stopping distance is longer and results remain stable at 30/60/120fps',()=>{
 function run(dt,profile){let x=0,v={x:6,z:0};for(let t=0;t<3-1e-8;t+=dt)x+=snowMotion(v,{x:0,z:0},dt,profile).x;return x}
 const snowy=run(1/60,snowPhysics),normal=run(1/60,standardPhysics)
 assert.ok(snowy>normal*2.8)
 assert.ok(Math.abs(run(1/30,snowPhysics)-run(1/120,snowPhysics))<1e-8)
})
test('AI approaches under the same motion constraints and settles near a target',()=>{
 const pos={x:0,z:0},v={x:0,z:0},target={x:10,z:4}
 for(let i=0;i<600;i++){const step=snowMotion(v,approachVelocity(pos,target,4.6),1/60);pos.x+=step.x;pos.z+=step.z}
 assert.ok(Math.hypot(pos.x-target.x,pos.z-target.z)<.2)
})
test('slide contact point is unchanged; finite coast is 175% and recovery is 125%',()=>{
 assert.equal(slideTravel(.12,snowPhysics),slideTravel(.12,standardPhysics))
 assert.equal(slideTravel(10,snowPhysics),slideTravel(1,standardPhysics)*1.75)
 assert.equal(slideTravel(1,snowPhysics),slideTravel(100,snowPhysics))
 assert.ok(Math.abs(.56*snowPhysics.slideRecovery-.7)<1e-10)
})
test('ball launch and resistance yield faster, farther travel without stacking ordinary snow friction',()=>{
 const speed=18*snowPhysics.ballSpeed,deceleration=6*snowPhysics.rollingResistance
 assert.equal(speed,22.5);assert.equal(deceleration,3)
 assert.ok(speed**2/(2*deceleration)>3*(18**2/12))
})

test('zero simulation time cannot introduce NaN momentum',()=>{
 const v={x:0,z:0};assert.deepEqual(snowMotion(v,{x:NaN,z:NaN},0),{x:0,z:0});assert.deepEqual(v,{x:0,z:0})
})
test('snow surface paints full cover immediately, retains it on reset, and leaves Classic gradual',async()=>{
 const {snowSurface}=await import('../src/snowSurface.ts');const T=await import('three')
 const previous=globalThis.document
 globalThis.document={createElement:()=>{const canvas={};const ctx={canvas,createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData:image=>{canvas.pixels=new Uint8ClampedArray(image.data)},drawImage(){},clearRect(){},fillRect(){}};canvas.getContext=()=>ctx;return canvas}}
 try{
  const scene=new T.Scene(),ground=new T.Mesh(new T.PlaneGeometry(100,100),new T.MeshStandardMaterial())
  scene.add(ground)
  const snow=snowSurface(new T.Scene(),1),classic=snowSurface(scene)
  const shader={uniforms:{},vertexShader:T.ShaderLib.standard.vertexShader,fragmentShader:T.ShaderLib.standard.fragmentShader}
  ground.material.onBeforeCompile(shader,{})
  assert.equal(shader.uniforms.snowAmount.value,0)
  const alphas=surface=>Array.from(surface.mesh.material.map.image.pixels).filter((_,i)=>i%4===3)
  assert.equal(alphas(snow)[144*504+252],235);assert.equal(alphas(snow)[0],0);assert.ok(alphas(classic).some(a=>a<100))
  snow.reset();assert.equal(alphas(snow)[144*504+252],235);assert.equal(alphas(snow)[0],0)
  const ball=new T.Object3D();ball.visible=false;snow.update(.2,5,[],ball,false)
  assert.equal(alphas(snow)[144*504+252],235);assert.equal(alphas(snow)[0],0)
  classic.update(.2,10,[],ball,false);assert.equal(shader.uniforms.snowAmount.value,.5)
  classic.update(.2,10,[],ball,false);assert.equal(shader.uniforms.snowAmount.value,1)
  assert.equal(alphas(classic)[144*504+252],235)
  classic.setVisible(false);assert.equal(shader.uniforms.snowEnabled.value,0);assert.equal(classic.mesh.visible,false)
  classic.reset();assert.equal(shader.uniforms.snowAmount.value,0)
 }finally{globalThis.document=previous}
})
