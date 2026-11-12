import type {Club} from './opponentSquads'

const assets=import.meta.glob<string>('./art/{okw,ss}-*.png',{eager:true,query:'?inline',import:'default'})
const clubs:Record<string,string>={'Shooting Stars FC':'ss','One Kick Wonders':'okw'}

export function rivalSprites(club:Club,name:string){
 const prefix='./art/'+clubs[club.name]+'-'+name.toLowerCase()
 const idle=assets[prefix+'-idle.png']
 if(!idle)return undefined
 return {idle,run:assets[prefix+'-run.png'],kick:assets[prefix+'-kick.png'],jog:assets[prefix+'-celebration-jog.png']}
}
