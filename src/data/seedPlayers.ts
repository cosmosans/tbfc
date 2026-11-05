import type { Player } from '../model';

// Aggregate totals from the player sheet. Their match dates are unknown, so these
// remain separate from individual match events.
export const seedPlayers: Player[] = [
  ['10', 'Steven Wett', 22, 15, 0, 0], ['27', 'José Dominguez', 10, 1, 2, 2],
  ['12', 'Stubbs', 8, 4, 0, 0], ['15', 'Daniel Lee', 8, 3, 0, 0],
  ['7', 'Nelson Silverio', 7, 3, 0, 0], ['6', 'Meghan Wahlstrom', 4, 1, 0, 0],
  ['5', 'Matt Weyandt', 3, 1, 0, 0], ['17', 'Spencer Smith', 3, 1, 1, 0],
  ['8', 'Pam Williams', 3, 3, 0, 0], ['9', 'Chris Richardson', 2, 4, 0, 0],
  ['11', 'Bjorn Cole', 2, 2, 0, 0], ['3', 'Jeremy Courtney', 0, 4, 0, 1],
  ['13', 'Diego', 0, 3, 0, 0], ['1', 'Sean Kirwin', 0, 1, 3, 1],
  ['4', 'Jan Mooney', 0, 1, 0, 0], ['47', 'Mandy Cline', 0, 0, 0, 0],
].map(([number, name, goals, assists, penaltySaves, yellowCards]) => ({
  id: `player-${number}`, number: String(number), name: String(name), active: true,
  preferredPosition: '', secondaryPosition: '',
  historicalStats: { goals: Number(goals), assists: Number(assists), penaltySaves: Number(penaltySaves), yellowCards: Number(yellowCards) },
}));
