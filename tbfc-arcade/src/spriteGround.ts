const cache=new WeakMap<object,Map<string,number[][]>>()

/** Transparent pixels below the visible sprite in each sheet cell. */
export function spriteGroundPadding(image:CanvasImageSource&{width:number;height:number},columns:number,rows:number,row:number,column:number,baseline=false):number{
 if(!image||!columns||!rows)return 2
 let sheets=cache.get(image)
 if(!sheets){sheets=new Map();cache.set(image,sheets)}
 const key=`${columns}x${rows}`
 let pads=sheets.get(key)
 if(!pads){
  const width=image.width/columns,height=image.height/rows
  if(!Number.isInteger(width)||!Number.isInteger(height))return 2
  const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height
  const context=canvas.getContext('2d',{willReadFrequently:true});if(!context)return 2
  try{context.drawImage(image,0,0);const pixels=context.getImageData(0,0,canvas.width,canvas.height).data
   pads=Array.from({length:rows},(_,r)=>Array.from({length:columns},(_,c)=>{
    for(let y=height-1;y>=0;y--)for(let x=0;x<width;x++)if(pixels[(((r*height+y)*canvas.width+c*width+x)*4)+3]>24)return height-y-1
    return 2
   }))
   sheets.set(key,pads)
  }catch{return 2}
 }
 return pads[Math.min(row,pads.length-1)]?.[baseline?0:Math.min(column,columns-1)]??2
}
