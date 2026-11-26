import {streetGoal} from './streetArena.ts'
export type GameMode = 'classic' | 'street'
export type StreetSize = 3 | 5
export const courtPresets = [
 {id:'slate',name:'Gulch Slate',color:'#515e64'},
 {id:'blue',name:'Classic Blue',color:'#30648e'},
 {id:'orange',name:'Burnt Orange',color:'#a74d26'},
 {id:'forest',name:'Forest Green',color:'#245e46'},
 {id:'midnight',name:'Midnight',color:'#242836'},
 {id:'peachtree',name:'Peachtree',color:'#cf907f'},
 {id:'purple',name:'Royal Purple',color:'#654282'},
 {id:'yellow',name:'Industrial Yellow',color:'#ba963c'},
] as const
export type CourtPreset = typeof courtPresets[number]['id']
export type StreetPreferences = {teamSize:StreetSize;court:CourtPreset;winCondition:'timed'|'target';halfMinutes:number;difficulty?:string;time:'Day'|'Evening'|'Night';weather:'Sun'|'Clouds'|'Rain'|'Snow'}
export type MatchRules = {
 mode:GameMode;teamSize:3|5|7;goalkeepers:0|1;arena:string|null;
 goal:{halfWidth:number;height:number;depth?:number};boundary:'touchline'|'enclosed';
 winCondition:'timed'|'target';targetScore:number;halfMinutes:number|null;
 tacticalProfile:'classic'|'totalFootball';court:CourtPreset;
}
export function classicRules():MatchRules {
 return {mode:'classic',teamSize:7,goalkeepers:1,arena:null,goal:{halfWidth:2,height:2},boundary:'touchline',winCondition:'timed',targetScore:0,halfMinutes:null,tacticalProfile:'classic',court:'blue'}
}
export function streetPreferences(value:unknown = null):StreetPreferences {
 const p = (value && typeof value === 'object' ? value : {}) as Partial<StreetPreferences>
 return {teamSize:p.teamSize===5?5:3,court:courtPresets.some(c=>c.id===p.court)?p.court!:'slate',winCondition:p.winCondition==='target'?'target':'timed',halfMinutes:[2,3,5].includes(p.halfMinutes!)?p.halfMinutes!:3,difficulty:typeof p.difficulty==='string'?p.difficulty:undefined,time:['Day','Evening','Night'].includes(p.time!)?p.time!:'Night',weather:['Sun','Clouds','Rain','Snow'].includes(p.weather!)?p.weather!:'Sun'}
}
export function streetRules(preferences:StreetPreferences):MatchRules {
 const p=streetPreferences(preferences)
 return {...classicRules(),mode:'street',teamSize:p.teamSize,goalkeepers:0,arena:'gulch',goal:{...streetGoal},boundary:'enclosed',winCondition:p.winCondition,targetScore:5,halfMinutes:p.halfMinutes,tacticalProfile:'totalFootball',court:p.court}
}
// Debug entry uses a fixed roster size and its own arena without changing saved kickoff preferences.
export function gulchDebugRules():MatchRules {
 return {...streetRules(streetPreferences()),winCondition:'target'}
}
export function targetReached(rules:MatchRules,home:number,away:number){return rules.winCondition==='target'&&Math.max(home,away)>=rules.targetScore}
export function readStreetPreferences():StreetPreferences {
 try{return streetPreferences(JSON.parse(localStorage.getItem('tbfc.street.settings.v1')??'null'))}catch{return streetPreferences()}
}
export function saveStreetPreferences(p:StreetPreferences){try{localStorage.setItem('tbfc.street.settings.v1',JSON.stringify(streetPreferences(p)))}catch{}}
export const streetFormations = {
 'street-1-1-1':{size:3,label:'1-1-1',name:'Balanced',rows:[['ST'],['CM'],['CB']]},
 'street-1-0-2':{size:3,label:'1-0-2',name:'Attacking Triangle',rows:[['LW','RW'],['CB']]},
 'street-2-0-1':{size:3,label:'2-0-1',name:'Defensive Triangle',rows:[['ST'],['LB','RB']]},
 'street-0-3-0':{size:3,label:'0-3-0',name:'Total Football',rows:[['LM','CM','RM']]},
 'street-2-1-2':{size:5,label:'2-1-2',name:'Balanced',rows:[['LW','RW'],['CM'],['LB','RB']]},
 'street-2-2-1':{size:5,label:'2-2-1',name:'Pyramid',rows:[['ST'],['LM','RM'],['LB','RB']]},
 'street-1-2-2':{size:5,label:'1-2-2',name:'High Press',rows:[['LW','RW'],['LM','RM'],['CB']]},
 'street-1-3-1':{size:5,label:'1-3-1',name:'Midfield Control',rows:[['ST'],['LM','CM','RM'],['CB']]},
} as const
export type StreetShape=keyof typeof streetFormations
export const isStreetShape=(shape:string):shape is StreetShape=>Object.hasOwn(streetFormations,shape)
export function streetShapes(size:number){return (Object.keys(streetFormations) as StreetShape[]).filter(s=>streetFormations[s].size===size)}
export function validStreetLineup(value:unknown,names:string[],size:number):value is {shape:StreetShape;starters:string[];bench:string[]} {
 const v=value as {shape:string;starters:string[];bench:string[]}|null
 return !!v&&isStreetShape(v.shape)&&streetFormations[v.shape].size===size&&Array.isArray(v.starters)&&v.starters.length===size&&Array.isArray(v.bench)&&v.bench.length<=4&&[...v.starters,...v.bench].every(n=>names.includes(n))&&new Set([...v.starters,...v.bench]).size===v.starters.length+v.bench.length
}
