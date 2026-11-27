import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import * as T from 'three'
import {gulchDebugRules,streetRules,streetPreferences,targetReached,courtPresets} from '../src/matchRules.ts'
import {streetBoards as millBoards,streetArena,streetGoal} from '../src/streetArena.ts'
import {enclosedContact} from '../src/millBoards.ts'
import {customizeCourt} from '../src/streetCourt.ts'
import {streetTargets} from '../src/streetAI.ts'
import {createGoal} from '../src/goal.ts'

const file=readFileSync(new URL('../art/stadiums/the-gulch.glb',import.meta.url))
const jsonLength=file.readUInt32LE(12)
const gltf=JSON.parse(file.subarray(20,20+jsonLength).toString())
const binary=file.subarray(28+jsonLength)
function accessor(index){
 const a=gltf.accessors[index],view=gltf.bufferViews[a.bufferView]
 const widths={SCALAR:1,VEC2:2,VEC3:3,VEC4:4},types={5123:Uint16Array,5125:Uint32Array,5126:Float32Array}
 const Type=types[a.componentType],count=a.count*widths[a.type],start=(view.byteOffset??0)+(a.byteOffset??0)
 assert.ok(!view.byteStride,'Test decoder expects packed export attributes')
 return new Type(binary.buffer.slice(binary.byteOffset+start,binary.byteOffset+start+count*Type.BYTES_PER_ELEMENT))
}
function cage(name){
 const node=gltf.nodes.find(n=>n.name===name);assert.ok(node,`Missing ${name}`)
 const group=new T.Group()
 group.position.fromArray(node.translation??[0,0,0]);group.quaternion.fromArray(node.rotation??[0,0,0,1]);group.scale.fromArray(node.scale??[1,1,1])
 for(const p of gltf.meshes[node.mesh].primitives){
  const geometry=new T.BufferGeometry()
  geometry.setAttribute('position',new T.BufferAttribute(accessor(p.attributes.POSITION),3))
  geometry.setIndex(new T.BufferAttribute(accessor(p.indices),1))
  group.add(new T.Mesh(geometry,new T.MeshBasicMaterial({side:T.DoubleSide})))
 }
 group.updateMatrixWorld(true);return group
}
test('The Gulch is an isolated 3v3 first-to-five arena',()=>{
 const rules=gulchDebugRules()
 assert.equal(rules.arena,'gulch');assert.equal(rules.teamSize,3);assert.equal(rules.goalkeepers,0)
 assert.equal(rules.boundary,'enclosed');assert.ok(!targetReached(rules,4,4));assert.ok(targetReached(rules,5,4))
 assert.equal(streetRules(streetPreferences({teamSize:5})).arena,'gulch')
 assert.equal(streetRules(streetPreferences({teamSize:5})).teamSize,5)
})
test('export is self-contained and keeps all four fence sections, without review goals',()=>{
 assert.equal(file.readUInt32LE(0),0x46546c67)
 assert.equal(file.length,file.readUInt32LE(8))
 for(const n of ['ENVIRONMENT_ARCHITECTURE','RAILWAY_INFRASTRUCTURE','ANIMATED_ENVIRONMENT','FENCE_NORTH','FENCE_SOUTH','FENCE_WEST','FENCE_EAST','STREET Court Origin'])assert.ok(gltf.nodes.some(node=>node.name===n))
 assert.ok(gltf.nodes.every(n=>!['GOALS','GAMEPLAY_COLLISION','REVIEW_LIGHTING'].includes(n.name)))
 assert.ok(gltf.images.length>0&&gltf.images.every(i=>i.bufferView!==undefined&&!i.uri))
 assert.ok(gltf.buffers.every(b=>!b.uri))
 const triangles=gltf.meshes.flatMap(m=>m.primitives).reduce((sum,p)=>sum+gltf.accessors[p.indices].count/3,0)
 assert.ok(triangles<120000,`Static arena exceeds geometry budget: ${triangles}`)
})
test('exported rebound faces align with simulation and both small goal mouths are open',()=>{
 const ends=new T.Group(),north=cage('REBOUND_NORTH'),south=cage('REBOUND_SOUTH')
 ends.add(cage('REBOUND_WEST'),cage('REBOUND_EAST'),cage('FENCE_WEST'),cage('FENCE_EAST'));ends.updateMatrixWorld(true)
 const cast=(group,origin,direction)=>new T.Raycaster(new T.Vector3(...origin),new T.Vector3(...direction),0,25).intersectObject(group,true)
 for(const sign of [-1,1]){
  for(const y of [.2,.6,1.05])for(const z of [-1,0,1])assert.equal(cast(ends,[0,y,z],[sign,0,0]).length,0,`Goal blocked at ${sign},${y},${z}`)
  const impact=cast(ends,[0,.4,4],[sign,0,0])[0]
  assert.ok(impact);assert.ok(Math.abs(Math.abs(impact.point.x)-millBoards.x)<.002)
 }
 for(const [group,sign,wall] of [[north,-1,millBoards.north],[south,1,millBoards.south]]){
  const impact=cast(group,[0,.4,0],[0,0,sign])[0]
  assert.ok(impact);assert.ok(Math.abs(impact.point.z-wall)<.002)
  assert.ok(Math.abs(new T.Box3().setFromObject(group).max.y-streetArena.wallHeight)<.002)
 }
})


test('all four upper fences reach the containment height, and Burn-speed corners stay enclosed',()=>{
 for(const side of ['NORTH','SOUTH','WEST','EAST']){
  const bounds=new T.Box3().setFromObject(cage('FENCE_'+side))
  assert.ok(bounds.max.y>=streetArena.fenceHeight-.01)
 }
 for(const speed of [40,160,500])for(const signX of [-1,1])for(const signZ of [-1,1])for(const y of [.18,1.5,2.8]){
  const p={x:signX*speed,y,z:signZ*speed*.7},v={x:signX*speed,y:0,z:signZ*speed*.7}
  assert.equal(enclosedContact({x:0,y,z:0},p,v,streetGoal),'bounce')
  assert.ok(Math.abs(p.x)<=millBoards.x+.001&&p.z>=millBoards.north-.001&&p.z<=millBoards.south+.001)
 }
})


test('boxcars sit beyond the far touchline and remain out of the playing area',()=>{
 for(const name of ['PARKED_BOXCARS','ANIMATED_ENVIRONMENT']){
  const bounds=new T.Box3().setFromObject(cage(name))
  assert.ok(bounds.max.z < -streetArena.width/2-1, `${name} is not on the far railway side`)
  assert.ok(bounds.max.y>4&&bounds.min.y>1, `${name} lost its authored transforms`)
 }
})
test('every court colour preserves concrete grain without tinting scenery',()=>{
 for(const preset of courtPresets)for(const materialName of ['STREET Surface Paint','rubber_tiles']){
  const scene=new T.Scene(),paint=new T.MeshStandardMaterial({roughness:.82});paint.name=materialName
  paint.map=new T.Texture();paint.roughnessMap=new T.Texture();paint.normalMap=new T.Texture()
  const floor=new T.Mesh(new T.PlaneGeometry(32,20),paint),wall=new T.Mesh(new T.BoxGeometry(),new T.MeshStandardMaterial({color:0x999999}))
  scene.add(floor,wall);const originalWall=wall.material
  customizeCourt(scene,preset.id)
  assert.equal(floor.material.color.getHexString(),preset.color.slice(1))
  assert.equal(floor.material.normalMap,paint.normalMap);assert.equal(floor.material.map,paint.map);assert.equal(floor.material.roughnessMap,paint.roughnessMap);assert.equal(floor.material.roughness,.82)
  assert.equal(wall.material,originalWall);assert.equal(wall.material.color.getHexString(),'999999')
 }
})
test('3v3 and 5v5 tactical targets fit the smaller court on both attacking directions',()=>{
 for(const size of [3,5])for(const direction of [-1,1])for(const x of [-14,0,14]){
  const points=Array.from({length:size},(_,i)=>({x:(i-2)*3,z:(i-2)*2}))
  for(const possessing of [true,false]){
   const plan=streetTargets(points,{x,z:8},direction,possessing?0:-1,possessing,points,{presser:-1,cover:-1})
   assert.equal(plan.targets.length,size)
   for(const target of plan.targets)assert.ok(Math.abs(target.x)<16&&Math.abs(target.z)<10)
  }
 }
})
test('runtime mini-goal depth follows the source, while Classic goal dimensions stay intact',()=>{
 const scene=new T.Scene(),goal=createGoal(scene,16,streetGoal)
 scene.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(scene)
 assert.ok(bounds.max.x<17&&bounds.max.x>16.85)
 assert.ok(Math.abs(goal.contactX(0)-(16+.9-.15))<.001)
 const classic=new T.Scene();createGoal(classic,21);classic.updateMatrixWorld(true)
 assert.ok(new T.Box3().setFromObject(classic).max.x>22.65)
})
