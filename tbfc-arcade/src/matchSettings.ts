import { divisions, preferredDivision, profiles, type Division } from './difficulty'
export const settingsOptions={
 difficulty:divisions,
 speed:[5,10,20],
 time:['Day','Evening','Night'],
 weather:['Rain','Clouds','Sun','Snow']
} as const
export type MatchSettings={difficulty:Division,speed:5|10|20,time:'Day'|'Evening'|'Night',weather:'Rain'|'Clouds'|'Sun'|'Snow'}
export const defaultSettings=():MatchSettings=>({difficulty:preferredDivision(),speed:10,time:'Day',weather:'Sun'})

export function settingsFields(settings:MatchSettings){
 const labels={speed:'Match clock',time:'Time of day',weather:'Weather',difficulty:'Division difficulty'}
 return (Object.keys(labels) as (keyof MatchSettings)[]).map(key=> key==='difficulty' ?
  `<fieldset class="lu-division"><legend>Division difficulty</legend><div>${divisions.map(v=>`<button data-setting="difficulty" value="${v}" aria-pressed="${settings.difficulty===v}">${v==='beginners'?'Beginners':v.toUpperCase()}</button>`).join('')}</div><p class="lu-division-detail">${profiles[settings.difficulty].label}</p></fieldset>` :
  `<fieldset><legend>${labels[key]}</legend><div>${settingsOptions[key].map(v=>
   `<button data-setting="${key}" value="${v}" aria-pressed="${settings[key]===v}">${v}${key==='speed'?'×':''}</button>`).join('')}</div></fieldset>`
 ).join('')
}
