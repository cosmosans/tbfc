import {varyMessages} from './careerPhrases.ts'
import {scheduleKickoffs,matchConditions,restoreOtherLeagues,type Career} from './careerSeason.ts'
import {startingClubDivisions} from './careerLeague.ts'
const prefix='tbfc.arcade.career.v1.'
export function loadSlot(slot:number):Career|null{
 const raw=localStorage.getItem(prefix+slot)
 if(!raw)return null
 const value=JSON.parse(raw) as Career
 if(value.version!==1||!Array.isArray(value.schedule)||!value.week||!value.id)throw Error('Unreadable career save')
 value.clubDivisions={...startingClubDivisions,...value.clubDivisions} as Career['clubDivisions']
 // D4 was removed. Keep the season playable and preserve its results in D5.
 if((value.division as string)==='d4')value.division='d5'
 for(const [name,tier] of Object.entries(value.clubDivisions??{}))if((tier as string)==='d4')value.clubDivisions![name]='d5'
 for(const season of value.history)if((season.division as string)==='d4')season.division='d5'
 if(!value.week.conditions){
  value.week.conditions=matchConditions(value.seed)
  const updateLine=(line:string)=>line.replaceAll('Saturday','Thursday').replace('this weekend','Thursday night').replace('My weekend','My Thursday night')
  for(const event of value.week.events)event.message=updateLine(event.message)
  for(const message of value.chat)message.text=updateLine(message.text)
 }
 varyMessages(value.week.events,value.seed,true)
 scheduleKickoffs(value)
 restoreOtherLeagues(value)
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
