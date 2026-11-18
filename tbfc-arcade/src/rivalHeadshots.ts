import type {Club} from './opponentSquads'

const portraits=import.meta.glob<string>('./art/headshots/rivals/*.png',{eager:true,query:'?url',import:'default'})
const slug=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')

export function rivalHeadshot(club:Club,name:string){
 return portraits[`./art/headshots/rivals/${slug(club.name)}-${slug(name)}.png`]
}
