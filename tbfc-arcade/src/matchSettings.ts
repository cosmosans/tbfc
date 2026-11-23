import { selectableDivisions, preferredDivision, profiles, type Division } from './difficulty'
export const settingsOptions={
 difficulty:selectableDivisions,
 speed:[20,10,5],
 time:['Day','Evening','Night'],
 weather:['Rain','Clouds','Sun','Snow']
} as const
export type MatchSettings={difficulty:Division,speed:5|10|20,time:'Day'|'Evening'|'Night',weather:'Rain'|'Clouds'|'Sun'|'Snow'}
export const defaultSettings=():MatchSettings=>({difficulty:preferredDivision(),speed:10,time:'Day',weather:'Sun'})
export const halfMinutesForSpeed:Record<MatchSettings['speed'],number>={
 5:5,
 10:3.5,
 20:2
}
export const halfDurationLabel=(speed:MatchSettings['speed'])=>`${halfMinutesForSpeed[speed]} min`

export function settingsFields(settings:MatchSettings){
 const labels={speed:'Real time per half',time:'Time of day',weather:'Weather',difficulty:'Division difficulty'}
 return (Object.keys(labels) as (keyof MatchSettings)[]).map(key=> key==='difficulty' ?
  `<fieldset class="lu-division"><legend>Division difficulty</legend><div>${selectableDivisions.map(v=>`<button data-setting="difficulty" value="${v}" aria-pressed="${settings.difficulty===v}">${v==='beginners'?'Beginners':v.toUpperCase()}</button>`).join('')}</div><p class="lu-division-detail">${profiles[settings.difficulty].label}</p></fieldset>` :
  `<fieldset><legend>${labels[key]}</legend><div>${settingsOptions[key].map(v=>
   `<button data-setting="${key}" value="${v}" aria-pressed="${settings[key]===v}">${key==='speed'?halfDurationLabel(v as MatchSettings['speed']):v}</button>`).join('')}</div></fieldset>`
 ).join('')
}
