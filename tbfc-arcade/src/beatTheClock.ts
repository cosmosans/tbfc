import type {Seat} from './sideSelect'

export const beatStartSeconds=90
export const beatGoalBonus=30
export const beatConcededPenalty=15
export type ChallengeSide=-1|1
export type BeatRecord={goals:number;conceded:number;team:string;difficulty:string;players:number;finishedAt:string}
type BeatBests={solo:Record<string,BeatRecord>;coop:Record<string,BeatRecord>;overall:{solo?:BeatRecord;coop?:BeatRecord}}
const storageKey='tbfc.beat-clock.bests.v1'

export function challengeSide(seats:readonly Pick<Seat,'side'>[]|null|undefined):ChallengeSide|null {
 if(!seats?.length||seats.length>2)return null
 const side=seats[0].side
 return (side===-1||side===1)&&seats.every(seat=>seat.side===side)?side:null
}
export function adjustBeatClock(remaining:number,creditedSide:ChallengeSide,team:ChallengeSide):number {
 return Math.max(0,remaining+(creditedSide===team?beatGoalBonus:-beatConcededPenalty))
}
export function beatClockText(seconds:number):string {
 const whole=Math.ceil(Math.max(0,seconds))
 return String(Math.floor(whole/60)).padStart(2,'0')+':'+String(whole%60).padStart(2,'0')
}
export function readBeatBests():BeatBests {
 try {
  const value=JSON.parse(localStorage.getItem(storageKey)??'null') as Partial<BeatBests>|null
  return {solo:value?.solo??{},coop:value?.coop??{},overall:value?.overall??{}}
 } catch {return {solo:{},coop:{},overall:{}}}
}
export function saveBeatBest(record:BeatRecord):{previous?:BeatRecord;best:BeatRecord;newBest:boolean} {
 const data=readBeatBests(),kind=record.players>1?'coop':'solo',previous=data[kind][record.difficulty]
 const newBest=!previous||record.goals>previous.goals||(record.goals===previous.goals&&record.conceded<previous.conceded)
 if(newBest)data[kind][record.difficulty]=record
 const overall=data.overall[kind]
 if(!overall||record.goals>overall.goals||(record.goals===overall.goals&&record.conceded<overall.conceded))data.overall[kind]=record
 try {localStorage.setItem(storageKey,JSON.stringify(data))} catch {}
 return {previous,best:data[kind][record.difficulty],newBest}
}
