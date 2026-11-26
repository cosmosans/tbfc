import {streetBoards,streetArena} from '../src/streetArena.ts'
import * as T from 'three'
import {customizeCourt} from '../src/streetCourt.ts'
import {createGoal} from '../src/goal.ts'
import test from 'node:test'
import assert from 'node:assert/strict'
import {classicRules,streetRules,streetPreferences,streetShapes,streetFormations,validStreetLineup,targetReached} from '../src/matchRules.ts'
import {enclosedContact,millBoards,millContact} from '../src/millBoards.ts'
import {streetTargets} from '../src/streetAI.ts'
import {planShot} from '../src/shooting.ts'
import {autoStreet,assignStreet} from '../src/streetSquad.ts'
import {lineupChemistry} from '../src/lineupChemistry.ts'

const club={name:'Turf Burners FC',outfield:['Meghan','Pam','Jan','Mandy','Jeremy','Chris'],keeper:'Sean',bench:['Steven','José','Daniel','Nadia']}
const names=[...club.outfield,...club.bench,club.keeper]
test('mode defaults and independent rules never leak mutable goal dimensions',()=>{
 const classic=classicRules(),street=streetRules(streetPreferences())
 assert.equal(classic.teamSize,7);assert.equal(classic.goalkeepers,1)
 assert.equal(street.teamSize,3);assert.equal(street.goalkeepers,0)
 street.goal.halfWidth=99;assert.equal(classicRules().goal.halfWidth,2)
 assert.deepEqual(streetPreferences({teamSize:99,court:'oops',halfMinutes:0}).teamSize,3)
 assert.equal(streetPreferences({court:'oops'}).court,'slate')
})
test('all eight formations contain exactly the requested number of outfield slots',()=>{
 for(const size of [3,5]){
  assert.equal(streetShapes(size).length,4)
  for(const shape of streetShapes(size)){
   const roles=streetFormations[shape].rows.flat();assert.equal(roles.length,size);assert.ok(!roles.includes('GK'))
   const picked=autoStreet(club,names,shape);assert.equal(new Set(picked).size,size)
   for(const next of streetShapes(size))assert.deepEqual(new Set(assignStreet(club,picked,next)),new Set(picked))
  }
 }
})
test('saved lineups reject wrong sizes, duplicate or removed players and wrong formations',()=>{
 const good={shape:'street-1-1-1',starters:['José','Chris','Meghan'],bench:['Jan']}
 assert.ok(validStreetLineup(good,names,3));assert.ok(!validStreetLineup(good,names,5))
 assert.ok(!validStreetLineup({...good,starters:['José','José','Chris']},names,3))
 assert.ok(!validStreetLineup({...good,bench:['Removed']},names,3))
 assert.ok(!validStreetLineup({...good,shape:'1-3-3'},names,3))
})
test('chemistry connects every pair without changing Classic links',()=>{
 assert.equal(lineupChemistry(club.name,'street-1-1-1',names.slice(0,3)).links.length,3)
 assert.equal(lineupChemistry(club.name,'street-2-1-2',names.slice(0,5)).links.length,10)
 assert.equal(lineupChemistry(club.name,'1-3-3',names.slice(0,7)).links.length,12)
})
test('enclosure sweeps high-speed shots, corners and high fence rebounds',()=>{
 const goal={halfWidth:1.25,height:1.2}
 for(const end of [{x:150,y:.2,z:150},{x:100,y:3,z:0},{x:-100,y:.2,z:-100},{x:500,y:.2,z:50}]){
  const p={...end},v={...end};assert.equal(enclosedContact({x:0,y:end.y,z:0},p,v,goal),'bounce')
  assert.ok(Math.abs(p.x)<=streetBoards.x);assert.ok(p.z>=streetBoards.north&&p.z<=streetBoards.south)
 }
 const p={x:17,y:.2,z:0};assert.equal(enclosedContact({x:15,y:.2,z:0},p,{x:20,y:0,z:0},goal),'live');assert.equal(p.x,17)
 const outside={x:17,y:4,z:4};assert.equal(enclosedContact({x:15,y:4,z:4},outside,{x:20,y:0,z:0},goal),'out')
 const classic={x:22,y:2,z:5};assert.equal(millContact({x:20,y:2,z:5},classic,{x:20,y:0,z:0}),'out')
})
test('target score ends only target matches, at the winning goal',()=>{
 const rules=streetRules(streetPreferences({winCondition:'target'}))
 assert.ok(!targetReached(rules,4,4));assert.ok(targetReached(rules,5,4));assert.ok(targetReached(rules,0,5))
 assert.ok(!targetReached(classicRules(),5,4));assert.ok(!targetReached(streetRules(streetPreferences()),5,4))
})
test('cover rotates when the covering player carries forward; pressing has hysteresis',()=>{
 const pts=[{x:-10,z:0},{x:-4,z:-5},{x:2,z:5}],anchors=pts
 const a=streetTargets(pts,{x:2,z:0},1,2,true,anchors,{presser:-1,cover:-1})
 assert.equal(a.cover,0)
 const b=streetTargets([{x:6,z:0},pts[1],pts[2]],{x:6,z:0},1,0,true,anchors,a)
 assert.notEqual(b.cover,0);assert.ok(b.targets[b.cover].x>-19)
 const d=streetTargets(pts,{x:3,z:5},1,-1,false,anchors,b);assert.deepEqual(d.targets[d.presser],{x:3,z:5})
 assert.equal(new Set(d.targets.map(p=>p.x+','+p.z)).size,3)
})
test('keeperless shots cannot resolve as saves and share the configured posts',()=>{
 for(let i=0;i<100;i++){
  const shot=planShot(10,0,0,.5,21,10,19,()=>i/100,false,1,.8,1.25)
  assert.notEqual(shot.result,'Save');if(shot.result==='Goal')assert.ok(Math.abs(shot.targetZ)<1.25);if(shot.result==='Post')assert.equal(Math.abs(shot.targetZ),1.25)
 }
})

test('court customization changes only paint, preserves surface maps and leaves shared originals alone',()=>{
 const scene=new T.Scene(),paint=new T.MeshStandardMaterial({color:0x30648e,roughness:.78});paint.name='rubber_tiles';paint.map=new T.Texture();paint.roughnessMap=new T.Texture()
 const floor=new T.MeshStandardMaterial({color:0x777777});floor.name='Mill floor • polished concrete'
 const court=new T.Mesh(new T.PlaneGeometry(42,24),paint),surround=new T.Mesh(new T.PlaneGeometry(60,40),floor);scene.add(court,surround)
 customizeCourt(scene,'blue');assert.equal(court.material,paint)
 customizeCourt(scene,'purple');assert.notEqual(court.material,paint);assert.equal(court.material.color.getHexString(),'654282');assert.equal(paint.color.getHexString(),'30648e')
 assert.equal(court.material.map,paint.map);assert.equal(court.material.roughnessMap,paint.roughnessMap);assert.equal(court.material.roughness,.78);assert.equal(surround.material,floor)
})
test('small-goal visual dimensions and net contact geometry use the same rule dimensions',()=>{
 const scene=new T.Scene(),rules=streetRules(streetPreferences()),goal=createGoal(scene,streetArena.length/2,rules.goal)
 scene.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(scene)
 assert.ok(Math.abs(bounds.max.y-rules.goal.height)<.1);assert.ok(Math.abs(bounds.max.z-rules.goal.halfWidth)<.1)
 assert.ok(Math.abs(goal.contactX(rules.goal.height)-(streetArena.length/2+rules.goal.depth*.62-.15))<.0001)
})
