import type {Club} from './opponentSquads'

const assets=import.meta.glob<string>('./art/{okw,ss}-*-{idle,run,kick}.png',{eager:true,query:'?url',import:'default'})
const clubs:Record<string,string>={'Shooting Stars FC':'ss','One Kick Wonders':'okw'}

export function rivalSprites(club:Club,name:string){
 const prefix='./art/'+clubs[club.name]+'-'+name.toLowerCase()
 const idle=assets[prefix+'-idle.png']
 if(!idle)return undefined
 return {idle,run:assets[prefix+'-run.png'],kick:assets[prefix+'-kick.png']}
}
