import burnersCrest from './art/ground/crest.png?url'
import orangeKit from './art/kits/orange-slices.webp?url'
import onsiderKit from './art/kits/onsider-trading-fc.webp?url'
import whiffKit from './art/kits/whiff-city-fc.webp?url'
import dancersKit from './art/kits/goal-dancers-fc.webp?url'
import wondersKit from './art/kits/one-kick-wonders.webp?url'
import starsKit from './art/kits/shooting-stars-fc.webp?url'
import pandasKit from './art/kit-icons/trash-pandas-fc.png?url'
import fleetKit from './art/kits/fleet-feet-fc.webp?url'
import interKit from './art/kits/inter-your-mom.webp?url'
import fleetCrest from './art/ground/fleet-feet-fc.png?url'
import wondersCrest from './art/ground/one-kick-wonders.png?url'
import dancersCrest from './art/ground/goal-dancers-fc.png?url'
import interCrest from './art/ground/inter-your-mom.png?url'
import whiffCrest from './art/ground/whiff-city-fc.png?url'
import pandasCrest from './art/ground/trash-pandas-fc.png?url'
import starsCrest from './art/ground/shooting-stars.png?url'
import orangeCrest from './art/ground/orange-slices-crest.png?url'
import onsiderCrest from './art/ground/onsider-trading-fc.png?url'
import barelyCrest from './art/ground/barely-united.png?url'
import espressoCrest from './art/ground/atletico-espresso.png?url'
import grassCrest from './art/ground/grass-assassins.png?url'
import netCrest from './art/ground/net-six-and-chill.png?url'
import crossbarCrest from './art/ground/crossbar-cowboys.png?url'
import creepersCrest from './art/ground/sweeper-creepers.png?url'
import cleatwoodCrest from './art/ground/cleatwood-mac.png?url'
import diggersCrest from './art/ground/goal-diggers.png?url'
import espressoKit from './art/kits/atletico-espresso.webp?url'

type Opponent = {
  name: string
  stars: 1 | 2 | 2.5 | 3 | 3.5 | 4 | 4.5 | 5
  role: string
  kit: string
  kitArt: string
  crest: string
  // Completed matches only. All five counts are from TBFC's perspective.
  record: { wins: number, draws: number, losses: number, goalsFor: number, goalsAgainst: number }
  keeper: string
  outfield: [string, string, string, string, string, string]
  bench: [string, string, string, string]
}

// Arcade difficulty against TBFC, easiest first. Player names are fictional.
export const opponentLadder = [
  {
    name:'Fleet Feet FC', stars:2.5, role:'The confidence fixture', kit:'Pale sky blue with white trim', crest:fleetCrest, kitArt:fleetKit,
    record:{wins:2, draws:0, losses:0, goalsFor:6, goalsAgainst:3},
    keeper:'Robin', outfield:['Aaron','Ellis','Oscar','Noor','Remy','Lena'], bench:['Jules','Theo','Mina','Cole']
  }, {
    name:'One Kick Wonders', stars:2, role:'The manageable challenge', kit:'Deep purple', crest:wondersCrest, kitArt:wondersKit,
    record:{wins:1, draws:1, losses:0, goalsFor:3, goalsAgainst:2},
    keeper:'Devon', outfield:['Marcus','Luca','Nico','Avery','Quinn','Idris'], bench:['Tessa','Ezra','June','Otto']
  }, {
    name:'Goal Dancers FC', stars:3, role:'The evenly matched rival', kit:'Red with gold cuffs', crest:dancersCrest, kitArt:dancersKit,
    record:{wins:1, draws:3, losses:1, goalsFor:7, goalsAgainst:7},
    keeper:'Alexis', outfield:['Julian','Bruno','Elena','Arlo','Simone','Rio'], bench:['Naya','Victor','Toby','Dani']
  }, {
    name:'Inter Your Mom', stars:3, role:'The wildcard', kit:'Black with tonal diagonal stripes', crest:interCrest, kitArt:interKit,
    record:{wins:1, draws:1, losses:1, goalsFor:6, goalsAgainst:8},
    keeper:'Morgan', outfield:['Kieran','Jasper','Freya','Ada','Miles','Ruben'], bench:['Holly','Alex','Isaac','Nora']
  }, {
    name:'Whiff City FC', stars:4, role:'The grudge match', kit:'Light blue with navy trim', crest:whiffCrest, kitArt:whiffKit,
    record:{wins:1, draws:0, losses:3, goalsFor:5, goalsAgainst:9},
    keeper:'Ash', outfield:['Parmesan','Swiss','Cheddar','Gouda','Cal','Brie'], bench:['Dara','Taj','Benji','Lark']
  }, {
    name:'Trash Pandas FC', stars:5, role:'The deceptively cute menace', kit:'Deep purple with gold trim', crest:pandasCrest, kitArt:pandasKit,
    record:{wins:0, draws:1, losses:3, goalsFor:3, goalsAgainst:10},
    keeper:'Jude', outfield:['Silas','Emery','Lola','Dario','Tariq','Bea'], bench:['Mara','Felix','Nina','Max']
  }, {
    name:'Shooting Stars FC', stars:5, role:'The final boss', kit:'Pink', crest:starsCrest, kitArt:starsKit,
    record:{wins:0, draws:1, losses:3, goalsFor:1, goalsAgainst:10},
    keeper:'Casey', outfield:['Malik','Riley','Sasha','Andre','Val','Leo'], bench:['Kai','Iris','Rowan','Cleo']
  }
] satisfies Opponent[]

export const alternateOpponent: Opponent = {
  name:'Orange Slices', stars:2, role:'The scrappy rival', kit:'Mauve and orange', crest:orangeCrest, kitArt:orangeKit,
  record:{wins:0, draws:1, losses:2, goalsFor:3, goalsAgainst:5},
  keeper:'Drew', outfield:['Finn','Zane','Blake','Omar','Inez','Rory'], bench:['Asha','Hugo','Nell','Eli']
}

// Career divisions also draw from this club as their rosters fill out.
export const onsiderTrading: Opponent = {
  name:'Onsider Trading FC', stars:3.5, role:'The higher division challengers', kit:'Forest green with gold trim', crest:onsiderCrest, kitArt:onsiderKit,
  record:{wins:0, draws:0, losses:0, goalsFor:0, goalsAgainst:0},
  keeper:'Ledger', outfield:['Brooks','Sterling','Margo','Graham','Penny','Miles'], bench:['Ellis','Sloane','Reid','Harper']
}

export const barelyUnited: Opponent = {
  name:'Barely United', stars:4.5, role:'The promotion contender', kit:'Black with white trim', crest:barelyCrest, kitArt:interKit,
  record:{wins:0, draws:0, losses:0, goalsFor:0, goalsAgainst:0},
  keeper:'Vaughn', outfield:['Asher','Zuri','Maren','Beck','Tobin','Pax'], bench:['Wren','Steph','Hale','Micah']
}

export const atleticoEspresso: Opponent = {
  name:'Atlético Espresso', stars:4.5, role:'The D5 title contender', kit:'Espresso burgundy with cream and gold trim', crest:espressoCrest, kitArt:espressoKit,
  record:{wins:0, draws:0, losses:0, goalsFor:0, goalsAgainst:0},
  keeper:'Matteo', outfield:['Marco','Giovanni','Lucía','Dante','Carmen','Enzo'], bench:['Sofía','Elio','Inés','Pietro']
}

export const grassAssassins: Opponent = {
  name:'Grass Assassins', stars:4, role:'The D6 ambush', kit:'Black with neon green and hot pink trim', crest:grassCrest, kitArt:interKit,
  record:{wins:0, draws:0, losses:0, goalsFor:0, goalsAgainst:0},
  keeper:'Moss', outfield:['Kade','Briar','Thorne','Fern','Rook','Vex'], bench:['Ivy','Knox','Sage','Jett']
}

export const netSixAndChill: Opponent = {
  name:'Net Six & Chill', stars:3.5, role:'The laid-back D6 contender', kit:'Black with red and purple trim', crest:netCrest, kitArt:interKit,
  record:{wins:0, draws:0, losses:0, goalsFor:0, goalsAgainst:0},
  keeper:'Baxter', outfield:['Gabe','Talia','Orion','Noelle','Beckett','Trey'], bench:['Zelda','Calvin','Mabel','Wesley']
}

export const crossbarCowboys: Opponent = {
  name:'Crossbar Cowboys', stars:4.5, role:'The D5 frontier contender', kit:'Deep teal with cream and gold trim', crest:crossbarCrest, kitArt:interKit,
  record:{wins:0, draws:0, losses:0, goalsFor:0, goalsAgainst:0},
  keeper:'Colt', outfield:['Boone','Sadie','Wade','Mae','Dusty','Hank'], bench:['Jolene','Levi','Cassidy','Travis']
}

export const goalDiggers: Opponent = {
  name:'Goal Diggers', stars:2.5, role:'The Beginners prospectors', kit:'Amber gold with dark brown trim', crest:diggersCrest, kitArt:orangeKit,
  record:{wins:0, draws:0, losses:0, goalsFor:0, goalsAgainst:0},
  keeper:'Dax', outfield:['Rhett','Gemma','Milo','Piper','Otis','Beau'], bench:['Tori','Calder','Willa','Jory']
}

export const cleatwoodMac: Opponent = {
  name:'Cleatwood Mac', stars:3, role:'The D6 headliners', kit:'Burgundy with cream and gold trim', crest:cleatwoodCrest, kitArt:espressoKit,
  record:{wins:0, draws:0, losses:0, goalsFor:0, goalsAgainst:0},
  keeper:'Flint', outfield:['Lindsey','Rhiannon','Mick','Stevie','Rafe','Kit'], bench:['Christine','Des','Goldie','Lyle']
}

export const sweeperCreepers: Opponent = {
  name:'Sweeper Creepers FC', stars:5, role:'The graveyard shift', kit:'Violet with spectral mint trim', crest:creepersCrest, kitArt:wondersKit,
  record:{wins:0, draws:0, losses:0, goalsFor:0, goalsAgainst:0},
  keeper:'Graves', outfield:['Bram','Lenore','Salem','Sybil','Edgar','Corbin'], bench:['Elvira','Victor','Agatha','Vincent']
}

export const burners = {
  name:'Turf Burners FC', crest:burnersCrest, stars:3, keeper:'Sean',
  outfield:['Meghan','Pam','Jan','Mandy','Jeremy','Chris'], bench:['Stubbs','José','Steven','Daniel']
}
export const clubs = [burners,...opponentLadder]
// A season snapshots its entrants; persistent divisions determine the next season.
export const careerPool = [...clubs,barelyUnited,alternateOpponent,onsiderTrading,atleticoEspresso,grassAssassins,netSixAndChill,crossbarCowboys,goalDiggers,cleatwoodMac,sweeperCreepers]
export function careerClubs(c:{leagueClubs?:number[]}){return c.leagueClubs?.map(index=>careerPool[index]??clubs[index])??clubs}
export type Club = (typeof clubs)[number]
export type Fixture = {home:Club, away:Club, homeOnRight?:boolean, burnersKit?:'black'|'white', creepersKit?:'primary'|'secondary', wondersKit?:'primary'|'secondary', dancersKit?:'primary'|'secondary', grassKit?:'primary'|'secondary', espressoKit?:'primary'|'secondary', onsiderKit?:'primary'|'secondary', netKit?:'primary'|'secondary', diggersKit?:'primary'|'secondary', barelyKit?:'primary'|'secondary', macKit?:'primary'|'secondary', pandasKit?:'primary'|'secondary', starsKit?:'primary'|'secondary', whiffKit?:'primary'|'secondary', orangeKit?:'primary'|'secondary', interKit?:'primary'|'secondary', crossbarKit?:'primary'|'secondary', fleetKit?:'primary'|'secondary'}

const accents = [
  "#f47738",
  "#88c6ed",
  "#9c6cdb",
  "#e74939",
  "#e0b859",
  "#599de0",
  "#8ed14c",
  "#f1529d",
];
export function clubAccent(club:Club){return club.name===sweeperCreepers.name?'#A939EC':club.name===cleatwoodMac.name?'#902648':club.name===goalDiggers.name?'#F4A208':club.name===crossbarCowboys.name?'#005962':club.name===netSixAndChill.name?'#ed1b32':club.name===grassAssassins.name?'#31e728':club.name===atleticoEspresso.name?'#7b1f2b':club.name===barelyUnited.name?'#d7d4d2':club.name===alternateOpponent.name?"#d68955":club.name===onsiderTrading.name?"#dcb83b":accents[clubs.indexOf(club)]}
