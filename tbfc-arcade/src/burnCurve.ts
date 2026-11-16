// Track signed rotation across the stick's -π/π seam. Returning to center
// breaks the sweep, so two unrelated aim adjustments cannot create spin.
export class CurveGesture {
 aim=0
 private previous:number|null=null
 private sweep=0
 private started=0
 private lastTurn=0
 reset(aim:number){this.aim=aim;this.previous=null;this.sweep=0;this.started=0}
 sample(x:number,z:number,now:number){
  if(Math.hypot(x,z)<.35){this.previous=null;return}
  const angle=Math.atan2(z,x)
  if(this.previous===null){
   if(!this.engaged){this.aim=angle;this.sweep=0}
  }else{
   const change=angle-this.previous
   const delta=Math.atan2(Math.sin(change),Math.cos(change))
   if(Math.abs(delta)>.001&&Math.abs(delta)<2){
    this.lastTurn=now
    if(Math.abs(this.sweep)<.06)this.started=now
    this.sweep=Math.max(-Math.PI,Math.min(Math.PI,this.sweep+delta))
   }
  }
  this.previous=angle
 }
 get engaged(){return Math.abs(this.sweep)>=Math.PI/3}
 finish(burn:boolean){
  if(!this.engaged)return null
  const wicked=Math.abs(this.sweep)>2.35&&this.lastTurn-this.started<650
  return {aim:this.aim,rate:this.sweep*(burn ? .72 : wicked ? .56 : .40),
   style:burn?'Fire Spiral':wicked?'Wicked Bend':'Curler'}
 }
}
export type CurveStrike=NonNullable<ReturnType<CurveGesture['finish']>>
