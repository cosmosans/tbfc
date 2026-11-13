import burnersCrest from './art/ground/crest.png?url'
import orangeKit from './art/kits/orange-slices.webp?url'
import whiffKit from './art/kits/whiff-city-fc.webp?url'
import dancersKit from './art/kits/goal-dancers-fc.webp?url'
import wondersKit from './art/kits/one-kick-wonders.webp?url'
import starsKit from './art/kits/shooting-stars-fc.webp?url'
import puffsKit from './art/kits/peachy-puffs.webp?url'
import fleetKit from './art/kits/fleet-feet-fc.webp?url'
import interKit from './art/kits/inter-your-mom.webp?url'
import fleetCrest from './art/ground/fleet-feet-fc.png?url'
import wondersCrest from './art/ground/one-kick-wonders.png?url'
import dancersCrest from './art/ground/goal-dancers-fc.png?url'
import interCrest from './art/ground/inter-your-mom.png?url'
import whiffCrest from './art/ground/whiff-city-fc.png?url'
import puffsCrest from './art/ground/peachy-puffs.png?url'
import starsCrest from './art/ground/shooting-stars.png?url'
import orangeCrest from './art/ground/orange-slices.png?url'

type Opponent = {
  name: string
  stars: 1 | 2 | 3 | 4 | 5
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
    keeper:'Robin', outfield:['Alma','Ellis','Oscar','Noor','Remy','Lena'], bench:['Jules','Theo','Mina','Cole']
  }, {
    name:'One Kick Wonders', stars:2, role:'The manageable challenge', kit:'Deep purple', crest:wondersCrest, kitArt:wondersKit,
    record:{wins:1, draws:1, losses:0, goalsFor:3, goalsAgainst:2},
    keeper:'Devon', outfield:['Piper','Luca','Nico','Avery','Quinn','Idris'], bench:['Tessa','Ezra','June','Otto']
  }, {
    name:'Goal Dancers FC', stars:3, role:'The evenly matched rival', kit:'Red with gold cuffs', crest:dancersCrest, kitArt:dancersKit,
    record:{wins:1, draws:3, losses:1, goalsFor:7, goalsAgainst:7},
    keeper:'Alexis', outfield:['Juno','Bruno','Elena','Arlo','Simone','Rio'], bench:['Naya','Victor','Toby','Dani']
  }, {
    name:'Inter Your Mom', stars:3, role:'The wildcard', kit:'Black with tonal diagonal stripes', crest:interCrest, kitArt:interKit,
    record:{wins:1, draws:1, losses:1, goalsFor:6, goalsAgainst:8},
    keeper:'Morgan', outfield:['Kit','Jasper','Freya','Ada','Miles','Ruben'], bench:['Holly','Alex','Isaac','Gemma']
  }, {
    name:'Whiff City FC', stars:4, role:'The grudge match', kit:'Light blue with navy trim', crest:whiffCrest, kitArt:whiffKit,
    record:{wins:1, draws:0, losses:3, goalsFor:5, goalsAgainst:9},
    keeper:'Ash', outfield:['Wren','Cruz','Lex','Una','Cal','Liv'], bench:['Dara','Taj','Benji','Lark']
  }, {
    name:'Peachy Puffs', stars:5, role:'The deceptively cute menace', kit:'Pastel green with peach and pink accents', crest:puffsCrest, kitArt:puffsKit,
    record:{wins:0, draws:1, losses:3, goalsFor:3, goalsAgainst:10},
    keeper:'Jude', outfield:['Skye','Emery','Lola','Dario','Tariq','Bea'], bench:['Mara','Felix','Nina','Max']
  }, {
    name:'Shooting Stars FC', stars:5, role:'The final boss', kit:'Pink', crest:starsCrest, kitArt:starsKit,
    record:{wins:0, draws:1, losses:3, goalsFor:1, goalsAgainst:10},
    keeper:'Casey', outfield:['Mika','Riley','Sasha','Andre','Val','Leo'], bench:['Kai','Iris','Rowan','Cleo']
  }
] satisfies Opponent[]

export const alternateOpponent: Opponent = {
  name:'Orange Slices', stars:3, role:'The scrappy rival', kit:'Mauve and orange', crest:orangeCrest, kitArt:orangeKit,
  record:{wins:0, draws:1, losses:2, goalsFor:3, goalsAgainst:5},
  keeper:'Drew', outfield:['Finn','Zara','Blake','Omar','Inez','Rory'], bench:['Asha','Hugo','Nell','Eli']
}

export const burners = {
  name:'Turf Burners FC', crest:burnersCrest, stars:3, keeper:'Sean',
  outfield:['Meghan','Pam','Jan','Mandy','Jeremy','Chris'], bench:['Stubbs','José','Steven','Daniel']
}
export const clubs = [burners,...opponentLadder]
export type Club = (typeof clubs)[number]
export type Fixture = {home:Club, away:Club, homeOnRight?:boolean}

const accents = [
  "#f47738",
  "#88c6ed",
  "#9c6cdb",
  "#e74939",
  "#e0b859",
  "#599de0",
  "#9dce90",
  "#f1529d",
];
export function clubAccent(club:Club){return accents[clubs.indexOf(club)]}
