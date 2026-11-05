import type { Formation, Position } from '../../model';

export const formationSlots: Record<Formation, readonly Position[]> = {
  '1-2-3-1': ['GK', 'LB', 'RB', 'LW', 'CAM', 'RW', 'ST'],
  '1-3-3': ['GK', 'LB', 'CDM', 'RB', 'LW', 'CAM', 'RW'],
};

export const formationPoints: Record<Formation, readonly (readonly [number, number])[]> = {
  '1-2-3-1': [[50, 88], [28, 70], [72, 70], [18, 47], [50, 47], [82, 47], [50, 23]],
  '1-3-3': [[50, 88], [22, 68], [50, 68], [78, 68], [18, 36], [50, 36], [82, 36]],
};
