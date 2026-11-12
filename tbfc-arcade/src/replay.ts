import * as T from 'three'

type Pose={position:T.Vector3,angle:number,face:number,mode:number,westKickRow:number,map:T.Texture,u:number,v:number,w:number,h:number}
type Frame={time:number,poses:Pose[],netTime:number}
const leadIn=6
const frameInterval=1/30
export const strikerView={label:'Behind the striker',along:-16,side:5,height:7,fov:44}
export const cinematicPlayerSize=1.62,cinematicBallSize=.40
export function frameAction(camera:T.PerspectiveCamera,angle:typeof strikerView,p:T.Vector3,aspect:number,direction:number,lookAhead=.8){
  const zoom=Math.max(1,1.3/aspect)
  if(camera.aspect!==aspect||camera.fov!==angle.fov){
    camera.aspect=aspect;camera.fov=angle.fov;camera.updateProjectionMatrix()
  }
  camera.position.set(p.x+direction*angle.along*zoom,angle.height*zoom,p.z+direction*angle.side*zoom)
  camera.lookAt(p.x+direction*lookAhead,.65+p.y*.35,p.z)
}
const angles=[
  {label:'Touchline',along:-6,side:17,height:9,fov:45},
  {...strikerView,label:'Scorer cam'},
  {label:'Goal Cam',along:1.24,side:1.8,height:.72,fov:84}
]

export class GoalReplay {
  private frames:Frame[]=[]
  time=0
  private scorer:T.Sprite|null=null
  strike=0
  goal=0
  cut=-1
  cursor=0
  private start=0
  readonly camera=new T.PerspectiveCamera(43,1,.1,140)
  constructor(private sprites:T.Sprite[],private ball:T.Sprite,
    private actors:{drawFace:number,maps:T.Texture[],westKickRow:number}[],private goalLine:number){}
  private shotOrigin=new T.Vector3()
  markStrike(scorer:T.Sprite,origin:T.Vector3){
    this.strike=this.time;this.scorer=scorer;this.shotOrigin.copy(origin)
  }
  clear(){
    this.scorer=null
    this.frames.length=0
    this.time=this.strike=this.goal=0
    this.cut=-1
  }
  record(dt:number,netTime:number){
    this.time+=dt
    const last=this.frames.at(-1)
    if(last&&this.time-last.time<frameInterval-.001)return
    const poses=this.sprites.map((sprite,i)=>{
      const map=sprite.material.map!
      return {position:sprite.position.clone(),angle:sprite.material.rotation,face:this.actors[i]?.drawFace??0,mode:this.actors[i]?.maps.indexOf(map)??-1,westKickRow:this.actors[i]?.westKickRow??0,map,
        u:map.offset.x,v:map.offset.y,w:map.repeat.x,h:map.repeat.y}
    })
    this.frames.push({time:this.time,poses,netTime})
    while(this.frames.length>2&&this.frames[1].time<this.time-leadIn-1)this.frames.shift()
  }
  begin(){
    if(this.frames.length<2)return false
    this.cut=0
    this.start=Math.max(this.frames[0].time,this.goal-leadIn)
    this.cursor=this.start
    return true
  }
  // Replay dimensions are in pitch units. The crossbar is 2 units high.
  render(renderer:T.WebGLRenderer,scene:T.Scene){
    const liveSizes=this.sprites.map(sprite=>sprite.scale.x)
    for(const sprite of this.sprites)sprite.scale.setScalar(sprite === this.ball ? cinematicBallSize : cinematicPlayerSize)
    try{renderer.render(scene,this.camera)}
    finally{this.sprites.forEach((sprite,i)=>sprite.scale.setScalar(liveSizes[i]))}
  }
  get label(){return 'REPLAY '+(this.cut+1)+'/3 · '+angles[this.cut].label}
  advance(dt:number){
    const slow=Math.abs(this.cursor-this.strike)<.3||Math.abs(this.cursor-this.goal)<.17
    this.cursor+=dt*(slow?.34:1.35)
    if(this.cursor<=this.frames[this.frames.length-1].time)return true
    return this.nextAngle()
  }
  nextAngle(){
    this.cut++
    this.cursor=this.start
    return this.cut<angles.length
  }
  draw(aspect:number,direction:number,poseNet:(time:number)=>void){
    let hi=this.frames.findIndex(f=>f.time>=this.cursor)
    if(hi<0)hi=this.frames.length-1
    const b=this.frames[hi],a=this.frames[Math.max(0,hi-1)]
    const f=T.MathUtils.clamp((this.cursor-a.time)/(b.time-a.time||1),0,1)
    const angle=angles[this.cut]
    let cameraX=direction*angle.along,cameraZ=direction*angle.side
    if(this.cut===2){
      // Mount inside the opposite back corner; lock the lens on the incoming lane.
      const z=(this.shotOrigin.z>=0?-1:1)*angle.side
      const x=direction*(this.goalLine+angle.along)
      const depth=Math.max(2,this.goalLine-direction*this.shotOrigin.x)
      const slope=T.MathUtils.clamp(this.shotOrigin.z/depth,-1.25,1.25)
      const lookZ=slope*5
      this.camera.position.set(x,angle.height,z)
      this.camera.lookAt(direction*(this.goalLine-5),.9,lookZ)
      this.camera.aspect=aspect
      this.camera.fov=T.MathUtils.radToDeg(2*Math.atan(Math.max(Math.tan(T.MathUtils.degToRad(angle.fov/2)),1.15/aspect)))
      this.camera.updateProjectionMatrix()
      cameraX=direction*(5+angle.along);cameraZ=z-lookZ
    }
    const yaw=Math.round(Math.atan2(cameraX,cameraZ)/(Math.PI/4))
    for(const [i,sprite] of this.sprites.entries()){
      const prev=a.poses[i],next=b.poses[i],pose=f<.5?prev:next
      sprite.position.lerpVectors(prev.position,next.position,f)
      sprite.material.rotation=T.MathUtils.lerp(prev.angle,next.angle,f)
      sprite.material.map=pose.map
      pose.map.offset.set(pose.u,pose.v);pose.map.repeat.set(pose.w,pose.h)
      const actor=this.actors[i]
      if(actor){
        const facing=(pose.face-yaw+8)%8
        if(pose.mode===0)pose.map.offset.x=facing*pose.w
        else if(pose.mode===1)pose.map.offset.y=1-(facing+1)*pose.h
        else if(pose.mode===2&&facing!==0&&facing!==4)pose.map.offset.y=1-((facing<4?0:pose.westKickRow)+1)*pose.h
      }
    }
    poseNet(Number.isFinite(a.netTime)&&Number.isFinite(b.netTime)?T.MathUtils.lerp(a.netTime,b.netTime,f):b.netTime)
    if(this.cut!==2){
      const subject=this.cut===1&&this.scorer?this.scorer:this.ball
      frameAction(this.camera,angle,subject.position,aspect,direction)
    }
  }
}
