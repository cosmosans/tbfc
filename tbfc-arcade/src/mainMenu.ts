import {reveal} from './screenUI'
import type {MenuMusic} from './menuMusic'
import crest from './art/ground/crest.png?inline'
import {menuPad,menuDirection} from './menuPad'
import css from './mainMenu.css?inline'

export function mainMenu(music:MenuMusic):Promise<boolean>{
 const root=document.createElement('section')
 root.id='main-menu'
 root.setAttribute('aria-labelledby','menu-title')
 const style=document.createElement('style');style.textContent=css
 root.innerHTML=`<div class="menu-shell"><div class="menu-title"><img src="${crest}" alt=""><div><span>Turf Burners FC</span><h1 id="menu-title">ARCADE</h1></div></div><nav aria-label="Main menu"><button disabled>Season Mode <small>Coming soon</small></button><button class="menu-kick">Kick Off <span aria-hidden="true">▸</span></button><button class="menu-practice">Practice</button><button disabled>Settings <small>Coming soon</small></button></nav><button class="menu-sound">Enable sound</button></div>`
 root.prepend(style);document.body.append(root)
 const main=document.querySelector('main')!;main.inert=true
 const button=root.querySelector<HTMLButtonElement>('.menu-kick')!
 const sound=root.querySelector<HTMLButtonElement>('.menu-sound')!
 const sync=()=>{const label=music.playing?'Sound on':'Enable sound';if(sound.textContent!==label)sound.textContent=label;sound.setAttribute('aria-pressed',String(music.playing))}
 sound.onclick=()=>{music.toggle();sync()}
 reveal(root,'.menu-title img,.menu-title>div,nav button,.menu-sound')
 sync();button.focus()
 return new Promise(resolve=>{
  let frame=0
  function enter(practice:boolean){cancelAnimationFrame(frame);root.remove();main.inert=false;resolve(practice)}
  const practice=root.querySelector<HTMLButtonElement>('.menu-practice')!
  button.onclick=()=>enter(false);practice.onclick=()=>enter(true)
  const choices=[button,practice,sound]
  function move(step:number){choices[(choices.indexOf(document.activeElement as HTMLButtonElement)+step+3)%3].focus()}
  root.onkeydown=e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();move(e.key==='ArrowUp'?-1:1)}}
  let direction=''
  const confirm=()=>{const pad=menuPad();return !!(pad?.buttons[0]?.pressed||pad?.buttons[9]?.pressed)}
  let held=confirm()
  function poll(){const pad=menuPad(),dir=pad?menuDirection(pad):'';if(dir!==direction&&(dir==='u'||dir==='d'))move(dir==='u'?-1:1);direction=dir;const down=confirm();if(down&&!held){if(document.activeElement===sound)sound.click();else{enter(document.activeElement===practice);return}}sync();held=down;frame=requestAnimationFrame(poll)}
  frame=requestAnimationFrame(poll)
 })
}
