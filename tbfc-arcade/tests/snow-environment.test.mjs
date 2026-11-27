import test from 'node:test'
import assert from 'node:assert/strict'
import * as T from 'three'
import {snowEnvironment} from '../src/snowEnvironment.ts'

test('environment snow is scene-local, shares accumulation, and restores original materials',()=>{
 const scene=new T.Scene(),original=new T.MeshStandardMaterial({color:0x336633})
 const ground=new T.Mesh(new T.PlaneGeometry(100,100),original),roof=new T.Mesh(new T.BoxGeometry(6,1,6),original)
 scene.add(ground,roof)
 const env=snowEnvironment(scene)
 assert.notEqual(ground.material,original);assert.equal(ground.material,roof.material)
 assert.equal(original.color.getHex(),0x336633)
 const shader={uniforms:{},vertexShader:T.ShaderLib.standard.vertexShader,fragmentShader:T.ShaderLib.standard.fragmentShader}
 ground.material.onBeforeCompile(shader,{})
 env.setAccumulation(.35);assert.equal(shader.uniforms.snowAmount.value,.35)
 env.setAccumulation(2);assert.equal(shader.uniforms.snowAmount.value,1)
 env.setVisible(false);assert.equal(shader.uniforms.snowEnabled.value,0)
 env.setVisible(true);assert.equal(shader.uniforms.snowEnabled.value,1)
 assert.ok(shader.vertexShader.includes('instanceMatrix * snowPosition'))
 assert.ok(shader.fragmentShader.includes('roughnessFactor = mix'))
 env.dispose();assert.equal(ground.material,original);assert.equal(roof.material,original)
})
test('snow leaves emissive lights, transparent glazing, sprites and opted-out structures untouched',()=>{
 const scene=new T.Scene()
 const materials=[new T.MeshStandardMaterial({emissive:0xffcc88}),new T.MeshStandardMaterial({transparent:true,opacity:.5}),new T.MeshBasicMaterial({color:0xff0000})]
 const meshes=materials.map(m=>new T.Mesh(new T.BoxGeometry(),m));scene.add(...meshes)
 const excluded=new T.Mesh(new T.BoxGeometry(),new T.MeshStandardMaterial());excluded.userData.snow=false;const original=excluded.material;scene.add(excluded)
 const sprite=new T.Sprite();const spriteMaterial=sprite.material;scene.add(sprite)
 snowEnvironment(scene)
 for(let i=0;i<meshes.length;i++)assert.equal(meshes[i].material,materials[i])
 assert.equal(excluded.material,original);assert.equal(sprite.material,spriteMaterial)
})
