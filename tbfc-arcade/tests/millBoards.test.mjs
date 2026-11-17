import test from 'node:test'
import assert from 'node:assert/strict'
import {millBankAim,millBoards,millContact,planMillBank} from '../src/millBoards.ts'

const point=(x,z,y=.18)=>({x,y,z})

test('ground passes reflect from the actual faces on all four sides',()=>{
 for(const [axis,wall] of [['x',millBoards.x],['x',-millBoards.x],['z',millBoards.north],['z',millBoards.south]]){
  const sign=Math.sign(wall),start=point(4,6),end=point(4,6),velocity=point(3,3)
  start[axis]=wall-sign*.5;end[axis]=wall+sign*.25;velocity[axis]=sign*15
  assert.equal(millContact(start,end,velocity),'bounce')
  assert.equal(end[axis],wall-sign*.2)
  assert.equal(velocity[axis],-sign*12)
  assert.equal(velocity[axis==='x'?'z':'x'],3)
 }
})

test('corner banks reflect both components and lobs clear the padding',()=>{
 const {x,south}=millBoards,end=point(x+.3,south+.3),v=point(5,5)
 assert.equal(millContact(point(x-.1,south-.1),end,v),'bounce')
 assert.deepEqual([v.x,v.z],[-4,-4])
 assert.equal(millContact(point(0,south-.5,1.6),point(0,south+.5,1.2),point(0,10)),'out')
})

test('a pass can target a wall while direct teammate and goal lanes remain available',()=>{
 assert(millBankAim(point(0,10),1,1,[]))
 assert(!millBankAim(point(0,10),1,1,[point(1,11)]))
 assert(!millBankAim(point(17,0),1,0,[]))
})

test('CPU picks a physical bank around a blocked direct lane',()=>{
 const from=point(-5,8),to=point(5,7),blocker=point(0,7.5)
 const route=planMillBank(from,to,[blocker],1)
 assert(route)
 assert.equal(route.z,millBoards.south)
 const reflectedSlope=-.8*(route.z-from.z)/(route.x-from.x)
 assert(Math.abs(route.z+reflectedSlope*(to.x-route.x)-to.z)<.001)
 assert.equal(planMillBank(from,to,[],1),null)
 for(const guard of [point(to.x,to.z+.4),point((from.x+route.x)/2,(from.z+route.z)/2),
                     point((to.x+route.x)/2,(to.z+route.z)/2)]){
  assert.equal(planMillBank(from,to,[blocker,guard],1),null)
 }
})

test('the outer edge of a banking ball meets the stripe and both goal mouths are open',()=>{
 assert(Math.abs(millBoards.south+millBoards.radius-12.04)<1e-8)
 assert(Math.abs(millBoards.x+millBoards.radius-21.04)<1e-8)
 for(const sign of [-1,1]){
  assert.equal(millContact(point(20*sign,1),point(21.2*sign,1),point(12*sign,0)),'live')
 }
})
