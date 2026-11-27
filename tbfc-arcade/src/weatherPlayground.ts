import * as T from 'three'
import {snowSurface} from './snowSurface'
import type {MatchSettings} from './matchSettings'

export function weatherPlayground(scene:T.Scene, settings:MatchSettings, initialSnow=0){
  const tuning={wetSlowdown:30,puddleDrag:90,puddleSize:100}
  const patches:{x:number,z:number,rx:number,rz:number}[]=[]
  for(const scale of [.85,1,1.15]){
    let x:number,z:number
    do {
      x=(Math.random()-.5)*34
      z=(Math.random()-.5)*17
    } while(patches.some(p=>Math.hypot(x-p.x,z-p.z)<6.5))
    patches.push({x,z,rx:1.9*scale,rz:1.2*scale})
  }
  const group=new T.Group()
  group.name='Rain puddles'
  // Draw the water before contact shadows, selection rings, and player sprites.
  group.renderOrder=-2
  const surface=new T.MeshBasicMaterial({color:0x95bfd0,transparent:true,opacity:.408,depthWrite:false,
    polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2})
  const disk=new T.CircleGeometry(1,40)
  for(const patch of patches){
    const mesh=new T.Mesh(disk,surface)
    mesh.rotation.x=-Math.PI/2
    mesh.position.set(patch.x,.045,patch.z)
    group.add(mesh)
  }
  scene.add(group)
  let snow:ReturnType<typeof snowSurface>|undefined
  function refresh(){
    if(settings.weather==='Snow') snow??=snowSurface(scene,initialSnow)
    if(snow){
      if(snow.mesh.visible && settings.weather!=='Snow')snow.reset()
      snow.setVisible(settings.weather==='Snow')
    }
    group.visible=settings.weather==='Rain'
    patches.forEach((p,i)=>group.children[i].scale.set(p.rx*tuning.puddleSize/100,p.rz*tuning.puddleSize/100,1))
  }
  refresh()
  function groundSpeed(){return settings.weather==='Rain'?1-tuning.wetSlowdown/100:1}
  function retention(position:T.Vector3,dt:number){
    if(settings.weather!=='Rain')return 1
    const size=tuning.puddleSize/100
    const immersed=patches.some(p=>((position.x-p.x)/(p.rx*size))**2+((position.z-p.z)/(p.rz*size))**2<=1)
    return immersed?(1-tuning.puddleDrag/100)**dt:1
  }
  function updateSnow(...args:Parameters<ReturnType<typeof snowSurface>['update']>){
    if(snow?.mesh.visible)snow.update(...args)
  }
  function friction(){return settings.weather==='Snow'?.9:1}
  return {settings,tuning,refresh,groundSpeed,retention,updateSnow,friction}
}
export type WeatherPlayground=ReturnType<typeof weatherPlayground>
