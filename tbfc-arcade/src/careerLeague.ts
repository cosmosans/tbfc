// Append new clubs to keep indices in existing career saves stable.
export const careerClubNames=['Turf Burners FC','Fleet Feet FC','One Kick Wonders','Goal Dancers FC','Inter Your Mom','Whiff City FC','Trash Pandas FC','Shooting Stars FC','Barely United','Orange Slices','Onsider Trading FC','Atlético Espresso','Grass Assassins','Net Six & Chill','Crossbar Cowboys','Goal Diggers','Cleatwood Mac','Sweeper Creepers FC'] as const
export const careerClubStars=[3,2.5,2,3,3,4,5,5,4.5,2,3.5,4.5,4,3.5,4.5,2.5,3,5] as const
export const startingClubDivisions:Record<string,string>=Object.fromEntries(careerClubNames.slice(1).map((name,offset)=>{
 const stars=careerClubStars[offset+1]
 if(name==='Cleatwood Mac')return [name,'d6']
 return [name,stars<=3?'beginners':stars<=4?'d6':'d5']
}))
// Seed a new career independently of fixture randomness. Nearby star tiers can
// trade places, while the player's chosen division always has five rivals.
export function seedCareerDivisions(division:string,seed:number):Record<string,string>{
 const tiers=['beginners','d6','d5'] as const
 let state=seed>>>0
 const roll=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296}
 const ranked=careerClubNames.slice(1).map((name,offset)=>({name,stars:careerClubStars[offset+1],strength:careerClubStars[offset+1]+(roll()-.5)*.9}))
 ranked.sort((a,b)=>a.strength-b.strength||a.name.localeCompare(b.name))
 const counts:Record<string,number>={beginners:0,d6:0,d5:0}
 const remaining=ranked.length-5
 const others=tiers.filter(tier=>tier!==division)
 counts[division]=5
 counts[others[0]]=Math.floor(remaining/2)
 counts[others[1]]=remaining-counts[others[0]]
 const result:Record<string,string>={}
 let cursor=0
 for(const tier of tiers)for(let i=0;i<counts[tier];i++)result[ranked[cursor++].name]=tier
 return result
}
export function careerLeagueIndices(division:string,clubDivisions:Record<string,string>){
 const candidates=careerClubNames.map((name,index)=>({index,name})).filter(({index})=>index!==0)
 candidates.sort((a,b)=>Number(clubDivisions[b.name]===division)-Number(clubDivisions[a.name]===division)||(division==='d5'?careerClubStars[b.index]-careerClubStars[a.index]:division==='beginners'?careerClubStars[a.index]-careerClubStars[b.index]:Math.abs(careerClubStars[a.index]-3)-Math.abs(careerClubStars[b.index]-3))||a.index-b.index)
 return [0,...candidates.slice(0,5).map(({index})=>index)]
}
