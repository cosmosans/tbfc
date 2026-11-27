import type {GameMode} from './matchRules.ts'
export const arenaCapabilities={
 school:{outdoor:true,classic:true},westend:{outdoor:true,classic:true},
 southside:{outdoor:true,classic:true},mill:{outdoor:false,classic:true},
 eastside:{outdoor:true,classic:true},topdeck:{outdoor:true,classic:true},
 gulch:{outdoor:true,classic:false},
} as const
export function supportsMode(id:keyof typeof arenaCapabilities,mode:GameMode){
 const arena=arenaCapabilities[id]
 if(!arena)return false
 return mode==='street'?id==='gulch':arena.classic&&(mode!=='snowpocalypse'||arena.outdoor)
}
