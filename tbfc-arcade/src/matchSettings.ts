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
  `<fieldset class="lu-division"><legend>Division difficulty</legend><input id="lu-division" aria-label="Division difficulty" type="range" min="0" max="${divisions.length-1}" step="1" value="${divisions.indexOf(settings.difficulty)}" aria-valuetext="${profiles[settings.difficulty].label}"><div class="lu-stops" aria-hidden="true">${divisions.map(()=>'<i></i>').join('')}</div><output for="lu-division">${profiles[settings.difficulty].label}</output></fieldset>` :
  `<fieldset><legend>${labels[key]}</legend><div>${settingsOptions[key].map(v=>
   `<button data-setting="${key}" value="${v}" aria-pressed="${settings[key]===v}">${v}${key==='speed'?'×':''}</button>`).join('')}</div></fieldset>`
 ).join('')
}
