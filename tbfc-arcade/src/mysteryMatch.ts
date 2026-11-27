/** One active modifier; this clock advances only when the match calls tick(). */
export const mysteryInterval = 60;
export const mysteryModifiers = [
  { id: "inferno", name: "INFERNO", icon: "🔥", color: "#ff702c", description: "Everybody's on fire." },
  { id: "blackIce", name: "BLACK ICE", icon: "❄", color: "#85d9ff", description: "Nobody has any traction." },
  { id: "longRange", name: "LONG RANGE", icon: "◎", color: "#ffc25a", description: "Goals outside the dotted box count double." },
  { id: "doublePoints", name: "DOUBLE POINTS", icon: "×2", color: "#ffd154", description: "Every goal counts double." },
  { id: "turbo", name: "TURBO", icon: "⚡", color: "#ffe34c", description: "Everything moves faster." },
  { id: "slowMotion", name: "SLOW MOTION", icon: "⌛", color: "#cf9dff", description: "Plenty of time to think." },
  { id: "moonBall", name: "MOON BALL", icon: "☾", color: "#e2c7ff", description: "Gravity is optional." },
  { id: "heavyBall", name: "HEAVY BALL", icon: "●", color: "#c5a889", description: "This thing weighs a ton." },
  { id: "secondWind", name: "SECOND WIND", icon: "▣", color: "#8def9c", description: "Nobody gets tired." },
  { id: "superSprint", name: "SUPER SPRINT", icon: "»", color: "#7ee9ff", description: "Everybody has rocket boots." },
  { id: "superCurve", name: "SUPER CURVE", icon: "↝", color: "#fa9bdb", description: "Bend it around everything." },
  { id: "shootOnSight", name: "SHOOT ON SIGHT", icon: "✦", color: "#ffb87a", description: "Everybody is a goalscoring threat." },
  { id: "theWall", name: "THE WALL", icon: "▥", color: "#7cbaff", description: "Goalkeepers are almost unstoppable." },
  { id: "noRules", name: "NO RULES", icon: "✕", color: "#ff7770", description: "No fouls. No cards. Get stuck in." },
  { id: "normal", name: "BACK TO NORMAL", icon: "⚽", color: "#fff0c9", description: "Ordinary soccer. For now." },
] as const;
export type MysteryModifier = typeof mysteryModifiers[number];
export type MysteryId = MysteryModifier["id"];
export type MysteryHistory = { id:MysteryId; at:number };
export type MysteryState = { current:MysteryModifier; remaining:number; elapsed:number; history:MysteryHistory[]; bag:MysteryModifier[] };
function shuffle<T>(items:T[], random:()=>number):T[] {
  for(let i=items.length-1;i>0;i--) {
    const j=Math.floor(random()*(i+1));
    [items[i],items[j]]=[items[j],items[i]];
  }
  return items;
}
function draw(state:MysteryState,random:()=>number):MysteryModifier {
  if(!state.bag.length) state.bag=shuffle([...mysteryModifiers],random);
  const index=state.bag.findIndex(mod=>mod.id!==state.current.id);
  if(index<0) {
    state.bag=shuffle([...mysteryModifiers].filter(mod=>mod.id!==state.current.id),random);
    return state.bag.pop()!;
  }
  return state.bag.splice(index,1)[0];
}
export function createMysteryState(random=Math.random):MysteryState {
  const bag=shuffle([...mysteryModifiers],random);
  const first=bag.pop()!;
  return {current:first,remaining:mysteryInterval,elapsed:0,history:[{id:first.id,at:0}],bag};
}
export function advanceMystery(state:MysteryState,dt:number,random=Math.random):boolean {
  if(dt<=0)return false;
  state.elapsed+=dt;
  state.remaining-=dt;
  if(state.remaining>0)return false;
  state.current=draw(state,random);
  state.history.push({id:state.current.id,at:state.elapsed});
  state.remaining=mysteryInterval+state.remaining;
  if(state.remaining<=0)state.remaining=mysteryInterval;
  return true;
}
export function mysteryTime(seconds:number):string {
  const whole=Math.max(0,Math.ceil(seconds));
  return String(Math.floor(whole/60)).padStart(2,"0")+":"+String(whole%60).padStart(2,"0");
}
