import spec from './streetArena.json' with {type:'json'}
export const streetArena=Object.freeze(spec)
export const streetBoards=Object.freeze({
 x:spec.length/2-spec.wallThickness/2,
 north:-spec.width/2+spec.wallThickness/2,
 south:spec.width/2-spec.wallThickness/2,
 top:spec.wallHeight,radius:.18,fenceTop:spec.fenceHeight,
})
export const streetGoal=Object.freeze({halfWidth:spec.goalWidth/2,height:spec.goalHeight,depth:spec.goalDepth})
