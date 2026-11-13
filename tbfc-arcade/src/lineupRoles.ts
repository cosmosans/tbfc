export const formations = {
  "1-3-3": [
    ["LW", "ST", "RW"],
    ["LB", "CDM", "RB"],
  ],
  "1-3-1-2": [["ST", "ST"], ["CAM"], ["LB", "CDM", "RB"]],
  "1-2-1-3": [["LW", "ST", "RW"], ["CAM"], ["LCB", "RCB"]],
  "1-2-3-1": [["ST"], ["LW", "CAM", "RW"], ["LCB", "RCB"]],
};
export type Shape = keyof typeof formations;

export const bios: Record<string, [number, string]> = {
    Nadia: [16, "Forward"],
    Nelson: [7, "Forward"],
    Daniel: [15, "Midfielder"],
    Steven: [10, "Forward"],
    José: [27, "Midfielder"],
    Meghan: [6, "Forward"],
    Pam: [8, "Forward"],
    Jan: [4, "Defender"],
    Mandy: [47, "Defender"],
    Jeremy: [3, "Midfielder"],
    Chris: [9, "Defender"],
    Sean: [1, "Goalkeeper"],
    Stubbs: [12, "Forward"],
  };

const roleGroups:Record<string,string>={
 LW:'Forward',ST:'Forward',RW:'Forward',CAM:'Midfielder',CDM:'Midfielder',
 LB:'Defender',RB:'Defender',LCB:'Defender',RCB:'Defender',GK:'Goalkeeper'
}
export function outOfPosition(club:string,name:string|null,role:string){
 return club==='Turf Burners FC' && !!name && !!bios[name] && bios[name][1]!==roleGroups[role]
}
