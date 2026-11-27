import type {Club} from './opponentSquads'

const portraits=import.meta.glob<string>('./art/headshots/rivals/*.png',{eager:true,query:'?url',import:'default'})
const slug=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')

export function rivalHeadshot(club:Club,name:string){
 return portraits[`./art/headshots/rivals/${slug(club.name)}-${slug(name)}.png`]
}

// Every match actor has an idle sheet, even when a separate portrait was not
// supplied. Crop the forward-facing first frame to keep the reveal populated.
export function spriteHeadshot(image:HTMLImageElement):HTMLCanvasElement {
 const cell=image.height
 const canvas=document.createElement('canvas')
 canvas.width=canvas.height=40
 const context=canvas.getContext('2d')!
 context.imageSmoothingEnabled=false
 context.drawImage(image,cell*.22,cell*.03,cell*.56,cell*.52,0,0,40,40)
 return canvas
}
