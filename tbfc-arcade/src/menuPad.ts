export let padStatus=''
let lastIndex=-1
const clearPadFocus=()=>document.documentElement.removeAttribute('data-pad-focus')
addEventListener('keydown',clearPadFocus,true)
addEventListener('pointerdown',clearPadFocus,true)
export function menuPad(){
 try{
 const pads=Array.from(navigator.getGamepads?.()??[]).filter((p):p is Gamepad=>!!p&&p.connected!==false)
 const pad=pads.find(p=>p.buttons.some(b=>b.pressed)||p.axes.slice(0,2).some(v=>Math.abs(v)>.30))??pads.find(p=>p.index===lastIndex)??pads[0]
 document.documentElement.toggleAttribute('data-controller',!!pad)
 if(!pad)clearPadFocus()
 else if(pad.buttons.some(b=>b.pressed)||pad.axes.slice(0,2).some(v=>Math.abs(v)>.30))document.documentElement.setAttribute('data-pad-focus','')
 if(pad)lastIndex=pad.index
 padStatus=pad?'Controller connected':navigator.getGamepads?'Press a controller button to connect':'Controller access unavailable'
 return pad
 }catch{document.documentElement.removeAttribute('data-controller');padStatus='Controller access blocked by browser';return undefined}
}
export function menuDirection(p:Gamepad){
 const x=p.axes[0]||0,y=p.axes[1]||0
 if(p.buttons[14]?.pressed)return 'l'
 if(p.buttons[15]?.pressed)return 'r'
 if(p.buttons[12]?.pressed)return 'u'
 if(p.buttons[13]?.pressed)return 'd'
 if(Math.max(Math.abs(x),Math.abs(y))<.30)return ''
 return Math.abs(x)>Math.abs(y)?(x>0?'r':'l'):(y>0?'d':'u')
}
