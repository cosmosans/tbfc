import * as T from 'three'

export function urbanTrees(scene:T.Scene,venue:'topdeck'|'westend'){
 const rooftop=venue==='topdeck'
 // Corner planting keeps the central sideline and endline camera approaches open.
 const positions=rooftop
  ?[[-36,-24],[36,-24],[-36,24],[36,24],[-24,-26],[24,-26],[-24,26],[24,26]]
  :[[-35,-30],[35,-30],[-37,25],[37,25],[-46,-29],[46,-29],[-46,26],[46,26]]
 const trees=new T.Group()
 trees.name=rooftop?'Midtown street tree crowns':'West End neighborhood trees'
 const bark=new T.MeshStandardMaterial({color:0x625342,roughness:1})
 const leaves=new T.MeshStandardMaterial({color:0xffffff,roughness:1,flatShading:true})
 const trunks=new T.InstancedMesh(new T.CylinderGeometry(.22,.38,1,7),bark,positions.length)
 const crowns=new T.InstancedMesh(new T.IcosahedronGeometry(1,1),leaves,positions.length*7)
 const transform=new T.Object3D()
 const colors=[0x526743,0x61784b,0x6b8050,0x465c3f]
 positions.forEach(([x,z],i)=>{
  const ground=rooftop?-16.08:0
  const height=(rooftop?19.5:7.6)+Math.sin(i*2.1)*1.1
  const width=rooftop?3.2:2.8
  transform.position.set(x,ground+height*.43,z)
  transform.rotation.set(0,i,0)
  transform.scale.set(1,height*.86,1)
  transform.updateMatrix()
  trunks.setMatrixAt(i,transform.matrix)
  for(let lobe=0;lobe<7;lobe++){
   const angle=lobe*2.39996+i
   const spread=lobe===0?0:width*.58
   transform.position.set(x+Math.cos(angle)*spread,ground+height-1.3+Math.sin(lobe*1.7)*.85,z+Math.sin(angle)*spread)
   transform.rotation.set(.15*Math.sin(angle),angle,.12*Math.cos(angle))
   transform.scale.set(width*.77,2.1+Math.cos(lobe)*.25,width*.72)
   transform.updateMatrix()
   crowns.setMatrixAt(i*7+lobe,transform.matrix)
   crowns.setColorAt(i*7+lobe,new T.Color(colors[(i+lobe)%colors.length]))
  }
 })
 trunks.castShadow=crowns.castShadow=true
 trunks.receiveShadow=crowns.receiveShadow=true
 trees.add(trunks,crowns)
 scene.add(trees)
}
