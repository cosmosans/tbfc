import {Group,Object3D,PointLight,Vector3} from 'three'

import {audio} from './matchAudio'
import trainUrl from './audio/marta-train.mp3?url'

export async function westEndTrain(scene:Object3D,ground:Object3D,soundEnabled:boolean){
 if(soundEnabled)await audio.prepareCue('train',trainUrl)
 const anchor=(name:string)=>ground.getObjectByName('WestEndAnchor_Train_'+name)!.getWorldPosition(new Vector3())
 const start=anchor('start'),end=anchor('end')
 const train=new Group()
 scene.add(train)
 train.position.lerpVectors(start,end,.5)
 train.attach(ground.getObjectByName('WestEndTrain')!)
 const headlight=new PointLight(0xffe7ba,13,7)
 headlight.position.set(11.5,.7,0)
 train.add(headlight)
 train.visible=false
 let age=0,duration=10,forward=Math.random()<.5
 let lastHalf=0,lastClock=0,next=0,practiceWait=2
 let departures:number[]=[]
 function update(dt:number,half:number,clock:number,practice:boolean){
  if(half!==lastHalf||clock<lastClock){
   departures=[100,570,1090].map(t=>t+Math.random()*125)
   next=0;lastHalf=half;train.visible=false
  }
  lastClock=clock
  if(!train.visible){
   if(practice){practiceWait-=dt;if(practiceWait>0)return}
   else if(next>=departures.length||clock<departures[next])return
   next++;age=0;duration=9+Math.random()*2
   forward=!forward;train.rotation.y=forward?0:Math.PI
   train.visible=true
   if(soundEnabled)audio.play('train',.74)
  }
  age+=dt
  const progress=Math.min(1,age/duration)
  train.position.lerpVectors(forward?start:end,forward?end:start,progress)
  if(progress>=1){train.visible=false;practiceWait=18+Math.random()*20}
 }
 function intro(progress:number|null){
  train.visible=progress!==null
  if(progress===null)return
  train.rotation.y=0
  train.position.lerpVectors(start,end,progress)
 }
 return Object.assign(update,{intro})

}
