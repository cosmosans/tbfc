import * as T from 'three'

const height = 2
const halfWidth = 2
const bottomDepth = 1.7
const roofDepth = .92
const panelRows = 8
const panelColumns = 16

export function createGoal(scene: T.Scene, lineX: number) {
  const sign = Math.sign(lineX)
  const group = new T.Group()
  group.position.x = lineX
  group.scale.x = sign
  scene.add(group)
  const frame = new T.MeshBasicMaterial({color: 0xfff2d9})
  function rod(a: number[], b: number[], radius: number) {
    const start = new T.Vector3(...a), end = new T.Vector3(...b)
    const direction = end.clone().sub(start)
    const mesh = new T.Mesh(new T.CylinderGeometry(radius,radius,direction.length(),8),frame)
    mesh.position.copy(start).lerp(end,.5)
    mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),direction.normalize())
    group.add(mesh)
  }
  for (const z of [-halfWidth, halfWidth]) {
    rod([0,0,z],[0,height,z],.065)
    rod([0,height,z],[roofDepth,height,z],.043)
    rod([roofDepth,height,z],[bottomDepth,0,z],.043)
    rod([0,0,z],[bottomDepth,0,z],.043)
  }
  rod([0,height,-halfWidth],[0,height,halfWidth],.075)
  rod([bottomDepth,0,-halfWidth],[bottomDepth,0,halfWidth],.04)
  rod([roofDepth,height,-halfWidth],[roofDepth,height,halfWidth],.04)
  const depthAt = (y: number) => T.MathUtils.lerp(bottomDepth,roofDepth,y/height)
  const coords: number[] = [], edges: number[] = []
  function grid(cols: number, rows: number, point: (u:number,v:number)=>number[]) {
    const start = coords.length/3
    for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){
      const index=start+j*(cols+1)+i
      coords.push(...point(i/cols,j/rows))
      if(i)edges.push(index-1,index)
      if(j)edges.push(index-cols-1,index)
    }
  }
  grid(panelColumns,panelRows,(u,v)=>[depthAt(v*height),v*height,(2*u-1)*halfWidth])
  const backCount = coords.length / 3
  grid(panelColumns,4,(u,v)=>[v*roofDepth,height,(2*u-1)*halfWidth])
  const roofEnd = coords.length / 3
  for(const z of [-halfWidth,halfWidth])grid(5,panelRows,(u,v)=>[u*depthAt(v*height),v*height,z])
  const geometry=new T.BufferGeometry()
  const positions=new T.Float32BufferAttribute(coords,3).setUsage(T.DynamicDrawUsage)
  geometry.setAttribute('position',positions)
  geometry.setIndex(edges)
  group.add(new T.LineSegments(geometry,new T.LineBasicMaterial({color:0xd5e8db,transparent:true,opacity:.58,depthWrite:false})))
  let elapsed=Infinity, hitX=0, hitY=0, hitZ=0, strength=0
  return {
    setVisible(visible:boolean){group.visible=visible},
    contactX(y:number){return lineX+sign*(depthAt(y)-.15)},
    strike(worldX:number,y:number,z:number,power:number){
      elapsed=0;hitX=(worldX-lineX)*sign;hitY=y;hitZ=z;strength=.45+.4*power
    },
    get rippleTime(){return elapsed},
    update(dt:number){
      if(elapsed<1.25)this.poseAt(elapsed+dt)
    },
    poseAt(time:number){
      if(time>=1.25&&elapsed>=1.25)return
      elapsed=time
      for(let i=0;i<positions.count;i++){
        const x=coords[i*3],y=coords[i*3+1],z=coords[i*3+2]
        const distance=Math.hypot(x-hitX,y-hitY,z-hitZ)
        const t=elapsed-distance/6
        const side=i>=roofEnd, roof=i>=backCount&&!side
        const edgeA=roof ? Math.min(x,roofDepth-x) : Math.min(y,height-y)
        const edgeB=side ? Math.min(x,depthAt(y)-x) : halfWidth-Math.abs(z)
        const pinned=Math.max(0,Math.min(1,edgeA/.35,edgeB/.35))
        const wave=t>0 && elapsed<1.25 ? Math.sin(t*24)*Math.exp(-5*t-1.1*distance) : 0
        const offset=pinned*strength*wave
        if(side)positions.setZ(i,z+Math.sign(z)*offset)
        else if(roof)positions.setY(i,y+offset)
        else positions.setX(i,x+offset)
      }
      positions.needsUpdate=true
    }
  }
}
