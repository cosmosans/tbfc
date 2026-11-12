import {defaultSettings,settingsFields,settingsOptions,type MatchSettings} from './matchSettings'
import css from './lineup.css?inline'

const formations={
 '1-3-3':[['LW','ST','RW'],['LB','CDM','RB']],
 '1-3-1-2':[['ST','ST'],['CAM'],['LB','CDM','RB']],
 '1-2-1-3':[['LW','ST','RW'],['CAM'],['LCB','RCB']],
 '1-2-3-1':[['ST'],['LW','CAM','RW'],['LCB','RCB']]
}
export type Shape=keyof typeof formations
const shapes=Object.keys(formations) as Shape[]
export function positions(shape:Shape){
 const rows=formations[shape]
 return rows.flatMap((roles,line)=>roles.map((role,i)=>{
  const back=line===rows.length-1,front=line===0
  const width=back?7:10
  return {role,back,front,lane:roles.length===1?0:width*(2*i/(roles.length-1)-1),depth:-3-10*line/(rows.length-1),y:14+line*48/(rows.length-1)}
 }))
}
export type Selection={shape:Shape,starters:string[],bench:string[]}
const key='tbfc.match.lineup.v1'
type MatchSquad={current:Selection,unavailable:Set<string>}
const countsTowardMinimum=new Set(['Meghan','Jan','Mandy','Nadia','Pam'])
export function selectLineup(portraits:Record<string,string>,match?:MatchSquad,settings:MatchSettings=defaultSettings()):Promise<Selection>{
 const names=Object.keys(portraits)
 let shape:Shape='1-3-3'
 const slots:(string|null)[]=['Meghan','Pam',new URLSearchParams(location.search).get('wing')==='stubbs'?'Stubbs':'Jan','Mandy','Jeremy','Chris','Sean']
 slots.push(names.find(n=>!slots.includes(n))??null,null,null,null)
 try{
  const saved=match?.current??JSON.parse(localStorage.getItem(key)??'null')
  if(saved&&Object.hasOwn(formations,saved.shape)&&Array.isArray(saved.starters)&&saved.starters.length===7&&Array.isArray(saved.bench)&&saved.bench.length<=4){
   const team=[...saved.starters,...saved.bench]
   if(team.every(n=>names.includes(n))&&new Set(team).size===team.length){
    shape=saved.shape;slots.fill(null);team.forEach((n,i)=>slots[i]=n)
   }
  }
 }catch{}
 const availableWomen=(team:(string|null)[])=>team.slice(0,7).filter(n=>n&&countsTowardMinimum.has(n)&&!match?.unavailable.has(n)).length
 function legalSwap(incoming:string){
  if(!match)return true
  const trial=slots.slice();trial[editing]=incoming
  return availableWomen(trial)>=2
 }
 const style=document.createElement('style');style.textContent=css;document.head.append(style)
 const root=document.createElement('section');root.id='lineup';root.setAttribute('aria-label',match?'Match substitutions':'Pre-match lineup');document.body.append(root)
 document.querySelector('main')!.inert=true
 const bios:Record<string,[number,string,string]>={
  Daniel:[15,'Daniel Lee','Midfielder'],Steven:[10,'Steven Wett','Forward'],José:[27,'José Dominguez','Midfielder'],Meghan:[6,'Meghan Wahlstrom','Forward'],Pam:[8,'Pam Williams','Forward'],Jan:[4,'Jan Mooney','Defender'],Mandy:[47,'Mandy Cline','Defender'],
  Jeremy:[3,'Jeremy Courtney','Midfielder'],Chris:[9,'Chris Richardson','Defender'],Sean:[1,'Sean Kirwin','Goalkeeper'],Stubbs:[12,'STUBBS','Forward']
 }
 let highlighted:number=1
 let editing=-1
 const avatar=(name:string)=>`<span class="lu-avatar" style="background-image:url('${portraits[name]}')"></span>`
 return new Promise(resolve=>{
  function finish(){
   const result={shape,starters:slots.slice(0,7) as string[],bench:slots.slice(7).filter((n):n is string=>!!n)}
   if(!match&&availableWomen(slots)<2)return
   if(!match)try{localStorage.setItem(key,JSON.stringify(result))}catch{}
   cancelAnimationFrame(frame);window.removeEventListener('keydown',keydown)
   root.remove();style.remove();document.querySelector('main')!.inert=false;resolve(result)
  }
  let dialog:HTMLDialogElement|null=null
  function confirmKickoff(){
   if(dialog)return
   if(match){finish();return}
   if(availableWomen(slots)<2)return
   const previous=document.activeElement as HTMLElement|null
   dialog=document.createElement('dialog')
   dialog.className='lu-confirm lu-settings';dialog.setAttribute('aria-labelledby','lu-question')
   dialog.innerHTML=`<h2 id="lu-question">Match settings</h2><p>TBFC vs Shooting Stars FC</p><p>${shape} · 7 starters · ${slots.slice(7).filter(Boolean).length} subs</p>${settingsFields(settings)}<p>Difficulty · Untuned</p><div><button id="lu-confirm">Kick off ▸</button><button id="lu-cancel">Back to lineup</button></div>`
   root.append(dialog)
   dialog.onclose=()=>{dialog?.remove();dialog=null;if(previous?.isConnected)previous.focus()}
   dialog.showModal()
   root.querySelector<HTMLElement>('#lu-confirm')!.focus()
  }
  function draw(focus:string){
   const field=[...positions(shape),{role:'GK',lane:0,y:86}]
   const role=(i:number)=>i<0?'Available':i>=7?'Sub':field[i].role
   root.innerHTML=`<div class="lu-wrap"><div class="lu-heading"><div><small>TURF BURNERS FC</small><h1>${match?'Substitutions':'Lineup select'}</h1></div><button id="lu-start" ${!match&&availableWomen(slots)<2?'disabled':''}>Start · ${match?'Resume':'Match settings'} ▸</button></div>
    <div class="lu-form" aria-label="Formation" ${match?'hidden':''}><button class="lu-bumper" id="lu-prev" aria-label="Previous formation (LB)">LB</button>${shapes.map((f,i)=>`<button id="form-${i}" data-shape="${f}" aria-pressed="${f===shape}">${f}</button>`).join('')}<button class="lu-bumper" id="lu-next" aria-label="Next formation (RB)">RB</button></div>
    <div class="lu-rule">${match?shape+' · ':''}Women on field: ${availableWomen(slots)} / 2 minimum${match&&!slots.slice(7).some(Boolean)?' · No substitutes named':''}</div><div class="lu-layout"><div><div class="lu-field"><div class="lu-circle"></div>${field.map((p,i)=>`<button class="lu-marker" ${match&&(match.unavailable.has(slots[i]!)||!slots.slice(7).some(Boolean))?'disabled':''} data-current="${i===highlighted}" id="slot-${i}" data-slot="${i}" aria-label="${p.role}, ${slots[i]}" style="left:${50+p.lane*3.5}%;top:${p.y}%">${avatar(slots[i]!)}<span>${p.role} · ${slots[i]}</span></button>`).join('')}</div>
    <div class="lu-bench"><h2>Bench <small>${slots.slice(7).filter(Boolean).length}/4</small></h2><div>${slots.slice(7).map((n,i)=>`<button ${match?'disabled':''} data-slot="${i+7}" id="slot-${i+7}" aria-label="Sub ${i+1}, ${n??'empty'}">${n??'+ Empty'}</button>`).join('')}</div></div></div><aside class="lu-details"><h2>Player details</h2><div id="lu-profile"></div>${editing>=0?`<div class="lu-roster"><h2>${editing<0?'Match squad':'Choose for '+(editing<7?role(editing):'bench')}</h2>${(match?slots.slice(7).filter((n):n is string=>!!n):names).map(n=>`<button class="lu-player" id="name-${names.indexOf(n)}" data-name="${n}" ${!legalSwap(n)||editing<0||(editing>=7&&!slots[editing]&&slots.slice(0,7).includes(n))?'disabled':''}>${avatar(n)}<strong>${n}</strong><small>${role(slots.indexOf(n))}</small></button>`).join('')}
    ${editing>=7?'<button data-clear id="lu-clear">Leave empty</button>':''}${editing>=0?'<button data-back id="lu-back">Back</button>':''}</div>`:''}</aside></div>
    <p>Left stick / arrows · Move　 A / Enter · Select　 B / Esc · Back</p></div>`
   profile(slots[highlighted])
   root.querySelector<HTMLElement>('#'+focus)?.focus()
  }
  function profile(name:string|null){
   const panel=root.querySelector<HTMLElement>('#lu-profile')
   if(!panel)return
   if(!name){panel.textContent='Empty bench slot';return}
   const [number,fullName,role]=bios[name]
   panel.innerHTML=`<div class="lu-portrait">${avatar(name)}</div><small>#${number} · ${role}</small><h3>${fullName}</h3>`
  }
  root.addEventListener('focusin',event=>{
   const b=event.target as HTMLElement
   if(b.dataset.slot!==undefined){highlighted=Number(b.dataset.slot);root.querySelectorAll<HTMLElement>(".lu-marker").forEach(m=>m.dataset.current=String(m===b));profile(slots[highlighted])}
   else if(b.dataset.name)profile(b.dataset.name)
  })
  function cycleShape(step:number){
   const index=(shapes.indexOf(shape)+step+shapes.length)%shapes.length
   shape=shapes[index]
   const current=document.activeElement as HTMLElement|null
   const focus=current&&root.contains(current)&&current.id?current.id:'slot-1'
   draw(focus.startsWith('form-')?'form-'+index:focus)
  }
  function close(){const slot=editing;editing=-1;draw('slot-'+slot)}
  root.onclick=e=>{
   const b=(e.target as HTMLElement).closest('button');if(!b)return
   if(dialog){
    const key=b.dataset.setting
    if(key==='speed'||key==='time'||key==='weather'){
     if(key==='speed')settings.speed=settingsOptions.speed.find(v=>String(v)===b.value)??settings.speed
     if(key==='time')settings.time=settingsOptions.time.find(v=>v===b.value)??settings.time
     if(key==='weather')settings.weather=settingsOptions.weather.find(v=>v===b.value)??settings.weather
     dialog.querySelectorAll<HTMLButtonElement>('[data-setting="'+key+'"]').forEach(btn=>btn.setAttribute('aria-pressed',String(btn===b)))
     return
    }
    if(b.id==='lu-confirm')finish()
    else if(b.id==='lu-cancel')dialog.close()
    return
   }
   if(b.id==='lu-prev'||b.id==='lu-next'){cycleShape(b.id==='lu-prev'?-1:1);return}
   if(b.dataset.slot!==undefined){editing=Number(b.dataset.slot);
    if(match){
     const candidate=slots.slice(7).find(n=>n&&legalSwap(n))
     draw(candidate?'name-'+names.indexOf(candidate):'lu-back');return
    }
    draw('name-'+Math.max(0,names.indexOf(slots[editing]??names.find(n=>!slots.includes(n))??names[0])));return}
   if(b.dataset.name&&editing>=0){
    if(match&&(!legalSwap(b.dataset.name)||!slots.slice(7).includes(b.dataset.name)))return
    const old=slots.indexOf(b.dataset.name)
    // A filled starting spot always needs a replacement.
    if(old>=0&&old<7&&!slots[editing]&&editing>=7)return
    if(old>=0)slots[old]=slots[editing]
    slots[editing]=b.dataset.name;close();return
   }
   if(b.hasAttribute('data-clear')){slots[editing]=null;close();return}
   if(b.hasAttribute('data-back')){close();return}
   if(b.dataset.shape){shape=b.dataset.shape as Shape;editing=-1;draw(b.id);return}
   if(b.id==='lu-start')confirmKickoff()
  }
  function move(dx:number,dy:number){
   const items=Array.from(root.querySelectorAll<HTMLButtonElement>(dialog?'dialog button':editing>=0?'.lu-roster button:not(:disabled)':'button:not(:disabled)'))
   const current=document.activeElement as HTMLButtonElement
   if(!items.includes(current)){items[0]?.focus();return}
   const rect=current.getBoundingClientRect();let best:HTMLButtonElement|undefined,score=Infinity
   for(const b of items){
    const r=b.getBoundingClientRect(),x=r.x+r.width/2-rect.x-rect.width/2,y=r.y+r.height/2-rect.y-rect.height/2
    const along=x*dx+y*dy,across=Math.abs(x*dy-y*dx)
    if(along<2||across>along*2)continue
    const cost=along+across*2.5
    if(cost<score){score=cost;best=b}
   }
   best?.focus()
  }
  function keydown(e:KeyboardEvent){
   const d:Record<string,[number,number]>={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}
   if(d[e.key]){e.preventDefault();move(...d[e.key])}
   if(e.key==='Escape'&&!dialog){e.preventDefault();if(editing>=0)close();else if(match)finish()}
  }
  let frame=0,lastMove=0,held='',a=false,b=false
  let lb=false,rb=false,startHeld=!!Array.from(navigator.getGamepads?.()??[]).find(Boolean)?.buttons[9]?.pressed
  function poll(t:number){
   const pad=Array.from(navigator.getGamepads?.()??[]).find(Boolean)
   if(pad){
    const start=!!pad.buttons[9]?.pressed,opening=start&&!startHeld&&!dialog
    startHeld=start
    if(opening)confirmKickoff()
    const left=!!pad.buttons[4]?.pressed,right=!!pad.buttons[5]?.pressed
    if(!match&&!dialog&&left&&!lb&&!right)cycleShape(-1)
    if(!match&&!dialog&&right&&!rb&&!left)cycleShape(1)
    lb=left;rb=right
    const x=pad.axes[0]||0,y=pad.axes[1]||0
    const dir=Math.max(Math.abs(x),Math.abs(y))<.53?'':Math.abs(x)>Math.abs(y)?(x>0?'r':'l'):(y>0?'d':'u')
    if(dir&&(dir!==held||t-lastMove>240)){move(dir==='l'?-1:dir==='r'?1:0,dir==='u'?-1:dir==='d'?1:0);lastMove=t}
    held=dir
    if(!opening&&pad.buttons[1]?.pressed&&!b){
     if(dialog)dialog.close()
     else if(editing>=0)close()
     else if(match)finish()
    }
    if(!opening&&pad.buttons[0]?.pressed&&!a)(document.activeElement as HTMLElement)?.click()
    a=!!pad.buttons[0]?.pressed;b=!!pad.buttons[1]?.pressed
   }else{a=b=lb=rb=startHeld=false;held=''}
   if(root.isConnected)frame=requestAnimationFrame(poll)
  }
  draw(match?'lu-start':'slot-1');window.addEventListener('keydown',keydown);frame=requestAnimationFrame(poll)
 })
}
