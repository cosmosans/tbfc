import keeperIdle from './art/rival-keeper-idle.png?url'
import keeperRun from './art/rival-keeper-run.png?url'
import keeperKick from './art/rival-keeper-kick.png?url'
import {rivalWomen} from './rivalRoster'
import type {Club} from './opponentSquads'

const assets=import.meta.glob<string>('./art/{ff,okw,ss,gd,inter,whiff,peach,orange,onsider}-*-{idle,run,kick,jump,tackle,reaction,reaction-flash,foul}.png',{eager:true,query:'?url',import:'default'})
const clubs:Record<string,string>={'Fleet Feet FC':'ff','Shooting Stars FC':'ss','One Kick Wonders':'okw','Goal Dancers FC':'gd','Inter Your Mom':'inter','Whiff City FC':'whiff','Peachy Puffs':'peach','Orange Slices':'orange','Onsider Trading FC':'onsider'}
const fleetWomen:Record<string,string>={Lena:'ff-lena-bun',Remy:'ff-remy',Jules:'ff-jules',Mina:'ff-mina'}
const fleetGoals=import.meta.glob<string>('./art/ff-*-goal-{stand,support}.png',{eager:true,query:'?url',import:'default'})
const fleetGoalRuns=import.meta.glob<string>('./art/ff-*-goal-run.png',{eager:true,query:'?url',import:'default'})
const interGirlsWithIndividualArt=new Set(['Freya','Ada','Holly','Nora'])

// Keep the existing kit sheets and assign each fictional character their roster artwork.
const artAliases:Record<string,Record<string,string>>={
 okw:{avery:'nico',nico:'avery',marcus:'luca'},
 gd:{julian:'bruno'},
 peach:{silas:'dario'}
}
export function rivalSprites(club:Club,name:string){
 if(name===club.keeper&&club.name!=='Onsider Trading FC'&&club.name!=='Fleet Feet FC')return {idle:keeperIdle,run:keeperRun,kick:keeperKick}
 const kit=clubs[club.name],key=name.toLowerCase()
 const shared=kit!=='peach'&&!(kit==='inter'&&interGirlsWithIndividualArt.has(name))&&!!rivalWomen[club.name]?.has(name)&&!!assets['./art/'+kit+'-base-idle.png']
 const fleetPrefix=kit==='ff'?fleetWomen[name]:undefined
 const prefix='./art/'+(fleetPrefix??(kit+'-'+(shared?'base':artAliases[kit]?.[key]??key)))
 const idle=assets[prefix+'-idle.png']
 if(!idle)return undefined
 return {idle,goalRun:fleetGoalRuns[prefix+'-goal-run.png'],stand:fleetGoals[prefix+'-goal-stand.png'],support:fleetGoals[prefix+'-goal-support.png'],run:assets[prefix+'-run.png'],kick:assets[prefix+'-kick.png']??assets['./art/ff-ellis-kick.png'],jump:assets[prefix+'-jump.png'],tackle:assets[prefix+'-tackle.png'],reaction:assets[prefix+'-reaction.png'],reactionFlash:assets[prefix+'-reaction-flash.png'],foul:assets[prefix+'-foul.png']}
}
