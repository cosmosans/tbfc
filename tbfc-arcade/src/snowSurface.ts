import * as T from 'three'
import {snowEnvironment} from './snowEnvironment.ts'

// The pitch decal retains tracks; surrounding scenery shares its accumulation clock.
export function snowSurface(scene:T.Scene, initialAccumulation=0){
  const environment=snowEnvironment(scene)
  const width=504,height=288,pixelsPerMeter=12
  const makeCanvas=()=>{
    const canvas=document.createElement('canvas')
    canvas.width=width
    canvas.height=height
    return canvas.getContext('2d')!
  }
  const cover=makeCanvas(), tracks=makeCanvas()
  const image=cover.createImageData(width,height)
  const threshold=new Float32Array(width*height)
  const edgeFade=new Float32Array(width*height)
  function noiseGrid(cell:number){
    const columns=Math.ceil(width/cell)+1
    const noise=Float32Array.from({length:columns*(Math.ceil(height/cell)+1)},()=>Math.random())
    return (x:number,y:number)=>{
      const i=Math.floor(y/cell)*columns+Math.floor(x/cell)
      const u=T.MathUtils.smoothstep(x%cell/cell,0,1),v=T.MathUtils.smoothstep(y%cell/cell,0,1)
      return T.MathUtils.lerp(T.MathUtils.lerp(noise[i],noise[i+1],u),
        T.MathUtils.lerp(noise[i+columns],noise[i+columns+1],u),v)
    }
  }
  const broad=noiseGrid(43),fine=noiseGrid(13)
  for(let i=0;i<threshold.length;i++){
    const x=i%width,y=Math.floor(i/width)
    const grain=Math.random()
    const edgeMeters=Math.min(x,width-1-x,y,height-1-y)/pixelsPerMeter
    edgeFade[i]=T.MathUtils.smoothstep(edgeMeters,0,2)
    threshold[i]=.68*broad(x,y)+.24*fine(x,y)+.08*grain
    image.data.set([226+grain*18,233+grain*14,238+grain*13,0],4*i)
  }
  const texture=new T.CanvasTexture(cover.canvas)
  texture.colorSpace=T.SRGBColorSpace
  texture.generateMipmaps=false
  texture.minFilter=T.LinearFilter
  const mesh=new T.Mesh(new T.PlaneGeometry(42,24),new T.MeshStandardMaterial({
    roughness:1,
    map:texture,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1
  }))
  mesh.name='Accumulating pitch snow'
  mesh.receiveShadow=true
  mesh.rotation.x=-Math.PI/2
  mesh.position.y=.012
  mesh.renderOrder=-2
  scene.add(mesh)
  const last=new Map<object,{x:number,z:number}>()
  let minutes=20*initialAccumulation,secondsSincePaint=0
  function paint(){
    const accumulation=Math.min(1,minutes/20)
    environment.setAccumulation(accumulation)
    const front=.16+accumulation
    for(let i=0;i<threshold.length;i++){
      image.data[i*4+3]=edgeFade[i]*(26+209*T.MathUtils.smoothstep(front-threshold[i],0,.15))
    }
    cover.putImageData(image,0,0)
    cover.globalCompositeOperation='destination-out'
    cover.drawImage(tracks.canvas,0,0)
    cover.globalCompositeOperation='source-over'
    texture.needsUpdate=true
  }
  function trace(object:T.Object3D,previous:{x:number,z:number}|undefined,widthMeters:number){
    const {x,z}=object.position
    if(previous){
      const distance=Math.hypot(x-previous.x,z-previous.z)
      if(distance>.005 && distance<1.5){
        tracks.lineWidth=widthMeters*pixelsPerMeter
        tracks.lineCap='round'
        tracks.strokeStyle='rgba(0,0,0,.65)'
        tracks.beginPath()
        tracks.moveTo((previous.x+21)*pixelsPerMeter,(previous.z+12)*pixelsPerMeter)
        tracks.lineTo((x+21)*pixelsPerMeter,(z+12)*pixelsPerMeter)
        tracks.stroke()
      }
      previous.x=x
      previous.z=z
    }else last.set(object,{x,z})
  }
  function update(dt:number,gameMinutes:number,players:readonly {sprite:T.Object3D}[],ball:T.Object3D,grounded:boolean){
    minutes+=gameMinutes
    for(const {sprite} of players){
      if(sprite.visible)trace(sprite,last.get(sprite),.27)
      else last.delete(sprite)
    }
    if(grounded && ball.visible)trace(ball,last.get(ball),.14)
    else last.delete(ball)
    secondsSincePaint+=dt
    if(secondsSincePaint>=.12){
      tracks.globalCompositeOperation='destination-out'
      tracks.fillStyle='rgba(0,0,0,'+(1-Math.exp(-secondsSincePaint/16))+')'
      tracks.fillRect(0,0,width,height)
      tracks.globalCompositeOperation='source-over'
      paint()
      secondsSincePaint=0
    }
  }
  function reset(){
    last.clear()
    minutes=20*initialAccumulation
    secondsSincePaint=0
    tracks.clearRect(0,0,width,height)
    paint()
  }
  paint()
  function setVisible(visible:boolean){mesh.visible=visible;environment.setVisible(visible)}
  return {mesh,update,reset,setVisible}
}
