import {varyMessages} from './careerPhrases.ts'
import {scheduleKickoffs,matchConditions,type Career} from './careerSeason'
const prefix='tbfc.arcade.career.v1.'
export function loadSlot(slot:number):Career|null{
 const raw=localStorage.getItem(prefix+slot)
 if(!raw)return null
 const value=JSON.parse(raw) as Career
 if(value.version!==1||!Array.isArray(value.schedule)||!value.week||!value.id)throw Error('Unreadable career save')
 if(!value.week.conditions){
  value.week.conditions=matchConditions(value.seed)
  const updateLine=(line:string)=>line.replaceAll('Saturday','Thursday').replace('this weekend','Thursday night').replace('My weekend','My Thursday night')
  for(const event of value.week.events)event.message=updateLine(event.message)
  for(const message of value.chat)message.text=updateLine(message.text)
 }
 varyMessages(value.week.events,value.seed,true)
 scheduleKickoffs(value)
 return value
}
export function saveSlot(slot:number,c:Career){
 const current=loadSlot(slot)
 if((!current&&c.revision!==0)||(current&&(current.id!==c.id||current.revision!==c.revision)))throw Error('This save changed in another tab. Reopen Career Mode.')
 localStorage.setItem(prefix+slot,JSON.stringify({...c,revision:c.revision+1}))
 c.revision++
}

export function deleteSlot(slot:number,c:Career){
 const current=loadSlot(slot)
 if(current?.id!==c.id||current.revision!==c.revision)throw Error('This save changed. Reopen Career Mode.')
 localStorage.removeItem(prefix+slot)
}
