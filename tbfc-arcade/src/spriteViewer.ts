import catalog from './spriteCatalogData.json'
import {menuDirection,menuPad} from './menuPad'
import css from './spriteViewer.css?inline'
import {spriteGroundPadding} from './spriteGround'

const art=import.meta.glob<string>('./art/*.png',{eager:true,query:'?url',import:'default'})
const directions=['South','South East','East','North East','North','North West','West','South West']
const rates=[0,8,12,14,16,16,12,8,8,8]

const secondarySheets=import.meta.glob<string>('./art/{away-preview,sweeper-secondary,wonders-secondary,dancers-secondary,grass-secondary}/*.png',{eager:true,query:'?url',import:'default'})

// Visible pixel height of each front idle pose, excluding transparent sheet padding.
const standingHeights: Record<string,number> = {"Meghan": 46, "Pam": 46, "Jan": 46, "Mandy": 46, "Jeremy": 41, "Chris": 46, "Stubbs": 42, "Spencer": 47, "José": 45, "Steven": 43, "Daniel": 44, "Nelson": 44, "Nadia": 47}

export function spriteViewer():Promise<void>{
 const title='Sprite Viewer'
 const style=document.createElement('style');style.textContent=css;document.head.append(style)
 const root=document.createElement('section');root.id='sprite-viewer';root.setAttribute('aria-label',title)
 root.innerHTML=`<div class="sv-shell"><header><h1>${title}</h1><button class="sv-back" type="button">BACK TO DEBUG</button></header>
 <div class="sv-layout"><aside class="sv-pick"><label>TEAM<select class="sv-team"></select></label><label>PLAYER<select class="sv-player"></select></label><label>KIT<select class="sv-kit"><option value="primary">Primary</option><option value="secondary">Secondary</option></select></label><div class="sv-player-nav"><button data-player="-1" type="button">◀ PLAYER</button><button data-player="1" type="button">PLAYER ▶</button></div><p class="sv-summary"></p></aside>
 <div class="sv-preview"><div class="sv-stage"><canvas width="320" height="320" aria-label="Selected sprite animation"></canvas><div class="sv-empty" hidden></div></div><strong class="sv-name"></strong><p class="sv-status"></p><p class="sv-file"></p>
 <div class="sv-controls"><button class="sv-step-back" type="button" aria-label="Previous frame">◀</button><button class="sv-play" type="button">PAUSE</button><button class="sv-step-next" type="button" aria-label="Next frame">▶</button><span class="sv-count"></span><label>Speed <select class="sv-speed"><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="2">2×</option></select></label></div>
 <div class="sv-directions"><button class="sv-dir-back" type="button" aria-label="Previous direction">◀</button><span></span><button class="sv-dir-next" type="button" aria-label="Next direction">▶</button></div><label class="sv-align"><input type="checkbox" checked> Match ground alignment</label></div>
 <aside class="sv-slots"><h2>ANIMATIONS</h2><div class="sv-slot-list"></div></aside></div>
 <footer>← → Animation · ↑ ↓ Direction · Q / E Player · Space Pause · Esc Back<br>Gamepad: D-pad Animation / Direction · LB / RB Player · A Pause · B Back</footer></div>`
 document.body.append(root)
 const $=<T extends Element>(selector:string)=>root.querySelector<T>(selector)!
 const teamSelect=$<HTMLSelectElement>('.sv-team'),playerSelect=$<HTMLSelectElement>('.sv-player')
 const canvas=$<HTMLCanvasElement>('canvas'),ctx=canvas.getContext('2d')!
 const slotList=$<HTMLElement>('.sv-slot-list'),empty=$<HTMLElement>('.sv-empty')
 const speed=$<HTMLSelectElement>('.sv-speed'),align=$<HTMLInputElement>('.sv-align input')
 const teams=catalog.teams
 const kitSelect=$<HTMLSelectElement>('.sv-kit')
 const kitFolders:Record<string,string>={'Turf Burners FC':'away-preview','Sweeper Creepers FC':'sweeper-secondary','One Kick Wonders':'wonders-secondary','Goal Dancers FC':'dancers-secondary','Grass Assassins':'grass-secondary'}
 const slots=[...catalog.slots]
 const bicycle='Bicycle kick'
 let team=0,player=0,slot=0,direction=0,frame=0,playing=true,age=0,last=performance.now(),raf=0
 let image:HTMLImageElement|undefined,loadedUrl='',loadId=0,padKeys=new Set<string>()
 for(const [index,club] of teams.entries())teamSelect.add(new Option(club.name,String(index)))
 function current(){return teams[team].players[player]}
 function selection(){return slots[slot]===bicycle?{file:'jose-overhead.png',status:'Individual',note:''}:current().animations[slots[slot]]}
 function dimensions(){if(slots[slot]===bicycle)return {cell:48,rows:8,columns:9};const file=selection().file;return file?catalog.dimensions[file]:undefined}
 function frameCount(){const d=dimensions();return !d?0:d.rows===1&&d.columns===8&&[0,8].includes(slot)?1:d.columns}
 function sheetUrl(file:string|null){
  if(!file)return ''
  const folder=kitFolders[teams[team].name]
  const secondary=kitSelect.value==='secondary' && secondarySheets[`./art/${folder}/${file}`]
  return secondary || art[`./art/${file}`]
 }
 function render(){
  ctx.clearRect(0,0,canvas.width,320)
  ctx.imageSmoothingEnabled=false
  const item=selection(),d=dimensions()
  ctx.fillStyle='#87b875';ctx.fillRect(0,278,canvas.width,3)
  ctx.fillStyle='#294a32';ctx.fillRect(0,281,canvas.width,39)
  if(!item.file||!d||!image?.complete||image.naturalWidth===0||loadedUrl!==sheetUrl(item.file))return
  const directionalColumns=d.rows===1&&d.columns===8&&[0,8].includes(slot)
  const col=directionalColumns?direction:Math.min(frame,d.columns-1)
  const row=d.rows>1?Math.min(direction,d.rows-1):0
  const scale=teams[team].name==="Turf Burners FC" && standingHeights[current().name] ? 176 / standingHeights[current().name] : 4
  const cell=d.cell,pad=align.checked?spriteGroundPadding(image,d.columns,d.rows,row,col,slot===3||slot>=7):2
  ctx.drawImage(image,col*cell,row*cell,cell,cell,160-cell*scale/2,279-(cell-pad)*scale,cell*scale,cell*scale)
 }
 function refreshList(){
  slots.splice(catalog.slots.length)
  if(teams[team].name==='Turf Burners FC' && current().name==='José')slots.push(bicycle)
  slot=Math.min(slot,slots.length-1)
  const folder=kitFolders[teams[team].name]
  const hasSecondary=folder && Object.values(current().animations).some(a=>a.file && secondarySheets[`./art/${folder}/${a.file}`])
  kitSelect.disabled=!hasSecondary
  kitSelect.options[1].disabled=!hasSecondary
  if(!hasSecondary)kitSelect.value='primary'
  slotList.replaceChildren()
  for(const [index,label] of slots.entries()){
   const item=label===bicycle?{status:"Individual"}:current().animations[label],button=document.createElement('button')
   button.type='button';button.className='sv-slot';button.dataset.slot=String(index)
   button.setAttribute('aria-pressed',String(index===slot))
   const text=document.createElement('span');text.textContent=label
   const status=document.createElement('small');status.textContent=item.status;status.dataset.status=item.status
   button.append(text,status);slotList.append(button)
  }
 }
 function refresh(){
  const person=current(),item=selection(),d=dimensions()
  teamSelect.value=String(team);playerSelect.value=String(player)
  $<HTMLElement>('.sv-name').textContent=`${person.name} · ${teams[team].name}`
  $<HTMLElement>('.sv-status').textContent=item.status==='Missing'?'MISSING ANIMATION':item.status==='Placeholder'?'PLACEHOLDER ART · CUSTOM ANIMATION MISSING':item.status==='Shared'?'SHARED ART':'INDIVIDUAL ART'
  $<HTMLElement>('.sv-status').dataset.status=item.status
  $<HTMLElement>('.sv-file').textContent=item.file?`${item.file}${item.note?' · '+item.note:''}`:'No sprite sheet yet'
  $<HTMLElement>('.sv-summary').textContent=`${person.gender} · ${catalog.slots.filter(label=>person.animations[label].status==='Individual').length} individual animations`
  $<HTMLElement>('.sv-directions span').textContent=d?.rows===1&&d.columns!==8?'One view':directions[direction]
  empty.hidden=!!item.file;empty.textContent=item.file?'':'MISSING SPRITE'
  frame=Math.min(frame,Math.max(0,frameCount()-1))
  $<HTMLElement>('.sv-count').textContent=item.file?`FRAME ${frame+1} / ${frameCount()}`:'NO FRAMES'
  for(const button of slotList.querySelectorAll<HTMLButtonElement>('button'))button.setAttribute('aria-pressed',String(Number(button.dataset.slot)===slot))
  render()
  const url=sheetUrl(item.file)
  if(url!==loadedUrl){
   const id=++loadId
   loadedUrl=url;image=undefined
   if(url){
    const next=new Image()
    next.onload=()=>{if(id===loadId){image=next;render()}}
    next.src=url
   }
  }
 }
 function populatePlayers(){
  playerSelect.replaceChildren()
  for(const [index,person] of teams[team].players.entries())playerSelect.add(new Option(person.name,String(index)))
  player=0;playerSelect.value='0';refreshList();refresh()
 }
 function changeTeam(step:number){team=(team+step+teams.length)%teams.length;slot=0;frame=0;age=0;populatePlayers()}
 function changePlayer(step:number){player=(player+step+teams[team].players.length)%teams[team].players.length;frame=0;age=0;refreshList();refresh()}
 function changeSlot(step:number){slot=(slot+step+slots.length)%slots.length;frame=0;age=0;refresh()}
 function changeDirection(step:number){direction=(direction+step+8)%8;frame=0;age=0;refresh()}
 function toggle(){playing=!playing;$<HTMLButtonElement>('.sv-play').textContent=playing?'PAUSE':'PLAY'}
 function step(amount:number){playing=false;$<HTMLButtonElement>('.sv-play').textContent='PLAY';frame=(frame+amount+frameCount())%Math.max(1,frameCount());age=0;refresh()}
 let resolveDone:()=>void
 const done=new Promise<void>(resolve=>{resolveDone=resolve})
 function leave(){cancelAnimationFrame(raf);removeEventListener('keydown',onKey);style.remove();root.remove();resolveDone()}
 root.addEventListener('click',event=>{
  const button=(event.target as HTMLElement).closest<HTMLButtonElement>('button');if(!button)return
  if(button.classList.contains('sv-back'))leave()
  else if(button.dataset.player)changePlayer(Number(button.dataset.player))
  else if(button.dataset.slot)changeSlot(Number(button.dataset.slot)-slot)
  else if(button.classList.contains('sv-step-back'))step(-1)
  else if(button.classList.contains('sv-step-next'))step(1)
  else if(button.classList.contains('sv-play'))toggle()
  else if(button.classList.contains('sv-dir-back'))changeDirection(-1)
  else if(button.classList.contains('sv-dir-next'))changeDirection(1)
 })
 teamSelect.onchange=()=>{team=Number(teamSelect.value);slot=0;frame=0;populatePlayers()}
 playerSelect.onchange=()=>{player=Number(playerSelect.value);frame=0;refreshList();refresh()}
 kitSelect.onchange=refresh
 align.onchange=render
 function onKey(event:KeyboardEvent){
  if(event.key==='Escape'){event.preventDefault();leave();return}
  if(event.target instanceof HTMLSelectElement||event.target instanceof HTMLInputElement)return
  const actions:Record<string,()=>void>={ArrowLeft:()=>changeSlot(-1),ArrowRight:()=>changeSlot(1),ArrowUp:()=>changeDirection(-1),ArrowDown:()=>changeDirection(1),KeyQ:()=>changePlayer(-1),KeyE:()=>changePlayer(1),Space:toggle}
  const action=actions[event.code];if(action){event.preventDefault();if(!event.repeat)action()}
 }
 addEventListener('keydown',onKey)
 function tick(now:number){
  const dt=Math.min(.1,(now-last)/1000);last=now
  if(playing&&frameCount()>1&&selection().file){age+=dt*Number(speed.value);const period=1/(rates[slot]??12);if(age>=period){frame=(frame+Math.floor(age/period))%frameCount();age%=period;$<HTMLElement>('.sv-count').textContent=`FRAME ${frame+1} / ${frameCount()}`;render()}}
  const pad=menuPad(),pressed=new Set<string>()
  if(pad){
   for(const [label,index] of [['confirm',0],['back',1],['previous',4],['next',5],['teamPrevious',6],['teamNext',7]] as const)if(pad.buttons[index]?.pressed)pressed.add(label)
   const direction=menuDirection(pad);if(direction)pressed.add(direction)
  }
  for(const key of pressed)if(!padKeys.has(key)){
   if(key==='back'){leave();return}
   if(key==='confirm')toggle()
   if(key==='previous')changePlayer(-1)
   if(key==='next')changePlayer(1)
   if(key==='teamPrevious')changeTeam(-1)
   if(key==='teamNext')changeTeam(1)
   if(key==='l')changeSlot(-1)
   if(key==='r')changeSlot(1)
   if(key==='u')changeDirection(-1)
   if(key==='d')changeDirection(1)
  }
  padKeys=pressed;raf=requestAnimationFrame(tick)
 }
 populatePlayers();raf=requestAnimationFrame(tick)
 return done
}
