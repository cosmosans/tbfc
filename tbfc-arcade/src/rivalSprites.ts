import keeperIdle from './art/rival-keeper-idle.png?url'
import keeperRun from './art/rival-keeper-run.png?url'
import keeperKick from './art/rival-keeper-kick.png?url'
import {rivalWomen} from './rivalRoster'
import type {Club} from './opponentSquads'

const assets=import.meta.glob<string>('./art/{ff,okw,ss,gd,inter,whiff,peach,orange,onsider,barely,espresso,grass,net,crossbar,diggers,cm,sc,tp}-*-{idle,run,kick,jump,tackle,reaction,reaction-flash,foul}.png',{eager:true,query:'?url',import:'default'})
const clubs:Record<string,string>={'Fleet Feet FC':'ff','Shooting Stars FC':'ss','One Kick Wonders':'okw','Goal Dancers FC':'gd','Inter Your Mom':'inter','Whiff City FC':'whiff','Trash Pandas FC':'tp','Orange Slices':'orange','Onsider Trading FC':'onsider','Barely United':'barely','Atlético Espresso':'espresso','Grass Assassins':'grass','Net Six & Chill':'net','Crossbar Cowboys':'crossbar','Goal Diggers':'diggers','Cleatwood Mac':'cm','Sweeper Creepers FC':'sc'}
const fleetWomen:Record<string,string>={Lena:'ff-lena-bun',Remy:'ff-remy',Jules:'ff-jules',Mina:'ff-mina'}
const clubGoals=import.meta.glob<string>('./art/{ff,ss,whiff,gd,okw,barely,onsider,espresso,grass,net,crossbar,diggers,cm,sc,tp}-*-goal-{stand,support}.png',{eager:true,query:'?url',import:'default'})
const clubGoalRuns=import.meta.glob<string>('./art/{ff,ss,whiff,gd,okw,barely,onsider,espresso,grass,net,crossbar,diggers,cm,sc,tp}-*-goal-run.png',{eager:true,query:'?url',import:'default'})
const interGirlsWithIndividualArt=new Set(['Freya','Ada','Holly','Nora'])

// Keep the existing kit sheets and assign each fictional character their roster artwork.
const artAliases:Record<string,Record<string,string>>={
 orange:{nell:'rory'},
 peach:{silas:'dario'}
}
export function rivalSprites(club:Club,name:string){
 if(name===club.keeper&&club.name!=='Trash Pandas FC'&&club.name!=='Onsider Trading FC'&&club.name!=='Fleet Feet FC'&&club.name!=='Barely United'&&club.name!=='Atlético Espresso'&&club.name!=='Net Six & Chill'&&club.name!=='Grass Assassins'&&club.name!=='Crossbar Cowboys'&&club.name!=='Goal Diggers'&&club.name!=='Cleatwood Mac'&&club.name!=='Sweeper Creepers FC')return {idle:keeperIdle,run:keeperRun,kick:keeperKick}
 const kit=clubs[club.name],key=name.toLowerCase()
 const shared=(kit!=='peach'&&kit!=='gd'&&!(kit==='inter'&&interGirlsWithIndividualArt.has(name))&&!!rivalWomen[club.name]?.has(name))&&!!assets['./art/'+kit+'-base-idle.png']
 const fleetPrefix=kit==='ff'?fleetWomen[name]:undefined
 const wondersMale=kit==='okw'&&!rivalWomen[club.name]?.has(name)?`okw-male-${key}`:undefined
 const prefix='./art/'+(kit==='whiff'?kit+'-'+key:(kit==='tp'||kit==='ss')?kit+'-roster-'+key:fleetPrefix??wondersMale??(kit+'-'+(shared?'base':artAliases[kit]?.[key]??key)))
 const idle=assets[prefix+'-idle.png']
 if(!idle)return undefined
 const scorerPrefix=kit==='tp'?'./art/tp-raccoon':kit==='grass'?'./art/grass-ninja':kit==='sc'?'./art/sc-ghost':prefix
 return {idle,goalRun:clubGoalRuns[scorerPrefix+'-goal-run.png'],stand:clubGoals[scorerPrefix+'-goal-stand.png'],support:clubGoals[prefix+'-goal-support.png'],run:assets[prefix+'-run.png'],kick:assets[prefix+'-kick.png']??assets['./art/ff-ellis-kick.png'],jump:assets[prefix+'-jump.png'],tackle:assets[prefix+'-tackle.png'],reaction:assets[prefix+'-reaction.png'],reactionFlash:assets[prefix+'-reaction-flash.png'],foul:assets[prefix+'-foul.png']}
}
