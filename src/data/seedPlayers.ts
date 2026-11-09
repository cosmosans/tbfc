import type { Player } from '../model';

// Player totals come exclusively from match events.
export const seedPlayers: Player[] = [
  ['10', 'Steven Wett'], ['27', 'José Dominguez'],
  ['12', 'Stubbs'], ['15', 'Daniel Lee'],
  ['7', 'Nelson Silverio'], ['6', 'Meghan Wahlstrom'],
  ['5', 'Matt Weyandt'], ['17', 'Spencer Smith'],
  ['8', 'Pam Williams'], ['9', 'Chris Richardson'],
  ['11', 'Bjorn Cole'], ['3', 'Jeremy Courtney'],
  ['13', 'Diego'], ['1', 'Sean Kirwin'],
  ['4', 'Jan Mooney'], ['47', 'Mandy Cline'],
].map(([number, name]) => ({
  id: `player-${number}`, number: String(number), name: String(name), active: true, captain: false,
  preferredPosition: '', secondaryPosition: '',
}));
