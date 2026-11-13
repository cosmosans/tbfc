import {ratingLabels} from './playerRatings.ts'
import type {Career} from './careerSeason'
export type Attribute=typeof ratingLabels[number]
export function availableUpgrades(c:Career){
 const spent=Object.values(c.upgrades??{}).reduce((sum,n)=>sum+n,0)
 return Math.max(0,Math.floor(c.xp/100)-spent)
}
export function careerRating(c:Career|undefined,name:string,stat:Attribute,base:number){
 if(!c||name!==c.player)return base
 return Math.min(100,base+2*(c.upgrades?.[stat]??0))
}
export function spendUpgrade(c:Career,stat:Attribute,base:number){
 if(!ratingLabels.includes(stat)||availableUpgrades(c)<1||careerRating(c,c.player,stat,base)>=100)return false
 c.upgrades??={}
 c.upgrades[stat]=(c.upgrades[stat]??0)+1
 return true
}
