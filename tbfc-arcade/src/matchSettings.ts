export const settingsOptions={
 speed:[5,10,20],
 time:['Day','Evening','Night'],
 weather:['Rain','Clouds','Sun','Snow']
} as const
export type MatchSettings={speed:5|10|20,time:'Day'|'Evening'|'Night',weather:'Rain'|'Clouds'|'Sun'|'Snow'}
export const defaultSettings=():MatchSettings=>({speed:10,time:'Day',weather:'Sun'})

export function settingsFields(settings:MatchSettings){
 const labels={speed:'Match clock',time:'Time of day',weather:'Weather'}
 return (Object.keys(labels) as (keyof MatchSettings)[]).map(key=>
  `<fieldset><legend>${labels[key]}</legend><div>${settingsOptions[key].map(v=>
   `<button data-setting="${key}" value="${v}" aria-pressed="${settings[key]===v}">${v}${key==='speed'?'×':''}</button>`).join('')}</div></fieldset>`
 ).join('')
}
