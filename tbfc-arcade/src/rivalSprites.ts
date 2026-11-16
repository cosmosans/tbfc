import keeperIdle from './art/rival-keeper-idle.png?url'
import keeperRun from './art/rival-keeper-run.png?url'
import keeperKick from './art/rival-keeper-kick.png?url'
import {rivalWomen} from './rivalRoster'
import type {Club} from './opponentSquads'

const assets=import.meta.glob<string>('./art/{ff,okw,ss,gd,inter,whiff,peach}-*-{idle,run,kick,jump,tackle,reaction,reaction-flash,foul}.png',{eager:true,query:'?url',import:'default'})
const clubs:Record<string,string>={'Fleet Feet FC':'ff','Shooting Stars FC':'ss','One Kick Wonders':'okw','Goal Dancers FC':'gd','Inter Your Mom':'inter','Whiff City FC':'whiff','Peachy Puffs':'peach'}

// Keep the existing kit sheets and assign each fictional character their roster artwork.
const artAliases:Record<string,Record<string,string>>={
 ff:{oscar:'lena',aaron:'ellis'},
 okw:{avery:'nico',nico:'avery',marcus:'luca'},
 gd:{julian:'bruno'},
 inter:{kieran:'jasper'},
 peach:{silas:'dario'},
 ss:{iris:'kai',kai:'iris',rowan:'cleo',cleo:'rowan',malik:'andre'}
}
export function rivalSprites(club:Club,name:string){
 if(name===club.keeper)return {idle:keeperIdle,run:keeperRun,kick:keeperKick}
 const kit=clubs[club.name],key=name.toLowerCase()
 const shared=kit!=='peach'&&!!rivalWomen[club.name]?.has(name)&&!!assets['./art/'+kit+'-base-idle.png']
 const prefix='./art/'+kit+'-'+(shared?'base':artAliases[kit]?.[key]??key)
 const idle=assets[prefix+'-idle.png']
 if(!idle)return undefined
 return {idle,run:assets[prefix+'-run.png'],kick:assets[prefix+'-kick.png']??assets['./art/ff-ellis-kick.png'],jump:assets[prefix+'-jump.png'],tackle:assets[prefix+'-tackle.png'],reaction:assets[prefix+'-reaction.png'],reactionFlash:assets[prefix+'-reaction-flash.png'],foul:assets[prefix+'-foul.png']}
}
