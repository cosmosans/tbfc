// Scale menus as a unit so their art, labels, and controls retain their proportions.
function updateMenuScale(){
 const width=window.innerWidth,height=window.innerHeight
 const scale=Math.min(2.1,Math.max(.75,Math.min(width/1440,height/900)))
 document.documentElement.style.setProperty('--menu-scale',String(scale))
}
updateMenuScale()
window.addEventListener('resize',updateMenuScale,{passive:true})
