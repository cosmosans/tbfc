import {reveal} from './screenUI'
import type {MenuMusic} from './menuMusic'
import crest from './art/ground/crest.png?inline'
import {menuPad,menuDirection} from './menuPad'
import css from './mainMenu.css?inline'

export function mainMenu(music:MenuMusic,showIntro=false):Promise<boolean>{
 const root=document.createElement('section')
 root.id='main-menu'
 root.setAttribute('aria-labelledby','menu-title')
 const style=document.createElement('style')
 style.textContent=css
 const shell=document.createElement('div')
 shell.className='menu-shell'
 root.append(style,shell)
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
  const feed=document.createElement('iframe')
  const url=new URL(location.href);url.searchParams.set('broadcast','1')
  feed.src=url.href;feed.className='menu-broadcast';feed.title='Background match'
  feed.inert=true;feed.tabIndex=-1;feed.setAttribute('aria-hidden','true')
  root.prepend(feed)
 }
 document.body.append(root)
 const main=document.querySelector('main')!
 main.inert=true

 return new Promise(resolve=>{
  let frame=0
  let screen:'intro'|'menu'|'settings'
  const title='<div class="menu-title"><img src="'+crest+'" alt=""><div><span>TURF BURNERS FC</span><h1 id="menu-title">ARCADE</h1></div></div>'
  function audioButton(action:'music'|'sound',label:string,on:boolean){
   return '<button data-action="'+action+'" aria-label="'+label+'" aria-pressed="'+on+'">'+label+'<span>'+ (on?'On':'Off') +'</span></button>'
  }
  function draw(next:typeof screen,focusSettings=false){
   screen=next
   root.dataset.screen=next
   if(next==='intro')shell.innerHTML=title+'<button class="menu-start" data-action="start">START</button>'
   if(next==='menu')shell.innerHTML=title+'<nav aria-label="Main menu"><button disabled>Season Mode <small>Coming soon</small></button><button class="menu-kick" data-action="kick">Kick Off <span aria-hidden="true">▸</span></button><button class="menu-practice" data-action="practice">Practice</button><button data-action="settings">Settings</button></nav>'
   if(next==='settings')shell.innerHTML='<h1 id="menu-title">Settings</h1><nav aria-label="Settings">'
    +audioButton('music','Music',music.musicEnabled)+audioButton('sound','Sound effects',music.soundEnabled)
    +'<button data-action="back">Back</button></nav>'
   shell.querySelector<HTMLButtonElement>(focusSettings?'[data-action="settings"]':'button:enabled')!.focus({preventScroll:true})
   reveal(shell,'.menu-title img,.menu-title>div,:scope>h1,button')
  }
  function leave(practice:boolean){
   cancelAnimationFrame(frame)
   root.remove()
   main.inert=false
   resolve(practice)
  }
  shell.onclick=e=>{
   const button=(e.target as HTMLElement).closest<HTMLButtonElement>('button:enabled')
   switch(button?.dataset.action){
    case 'start': music.start();draw('menu');break
    case 'kick': leave(false);break
    case 'practice': leave(true);break
    case 'settings': draw('settings');break
    case 'music':
    case 'sound': {
     const isMusic=button.dataset.action==='music'
     if(isMusic)music.toggleMusic();else music.toggleSound()
     const on=isMusic?music.musicEnabled:music.soundEnabled
     button.setAttribute('aria-pressed',String(on))
     button.querySelector('span')!.textContent=on?'On':'Off'
     break
    }
    case 'back': draw('menu',true);break
   }
  }
  function move(step:number){
   const choices=Array.from(shell.querySelectorAll<HTMLButtonElement>('button:enabled'))
   const index=choices.indexOf(document.activeElement as HTMLButtonElement)
   choices[(index+step+choices.length)%choices.length].focus()
  }
  root.onkeydown=e=>{
   if(e.repeat&&(e.key==='Enter'||e.key===' ')){e.preventDefault();return}
   if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();move(e.key==='ArrowUp'?-1:1)}
   if(e.key==='Escape'&&screen==='settings'){e.preventDefault();draw('menu',true)}
  }
  draw(showIntro?'intro':'menu')
  const confirm=(pad?:Gamepad)=>!!(pad?.buttons[0]?.pressed||pad?.buttons[9]?.pressed)
  const initial=menuPad()
  let held=confirm(initial),backHeld=!!initial?.buttons[1]?.pressed,direction=''
  function poll(){
   const pad=menuPad(),dir=pad?menuDirection(pad):''
   if(dir!==direction&&(dir==='u'||dir==='d'))move(dir==='u'?-1:1)
   direction=dir
   const down=confirm(pad),back=!!pad?.buttons[1]?.pressed
   if(back&&!backHeld&&screen==='settings')draw('menu',true)
   else if(down&&!held)shell.querySelector<HTMLButtonElement>('button:focus')?.click()
   held=down;backHeld=back
   if(root.isConnected)frame=requestAnimationFrame(poll)
  }
  frame=requestAnimationFrame(poll)
 })
}
