import type { Formation, Position } from "../../model";

export const formationSlots: Record<Formation, readonly Position[]> = {
  "1-2-3-1": ["GK", "LB", "RB", "LW", "CAM", "RW", "ST"],
  "1-3-3": ["GK", "LB", "CDM", "RB", "LW", "CAM", "RW"],
  "1-2-1-2-1": ["GK", "LB", "RB", "CDM", "LW", "RW", "ST"],
  "1-3-1-2": ["GK", "LB", "CDM", "RB", "CAM", "LW", "RW"],
};

export const formationPoints: Record<
  Formation,
  readonly (readonly [number, number])[]
> = {
  "1-2-3-1": [
    [50, 88],
    [28, 70],
    [72, 70],
    [18, 47],
    [50, 47],
    [82, 47],
    [50, 23],
  ],
  "1-3-3": [
    [50, 88],
    [22, 68],
    [50, 68],
    [78, 68],
    [18, 36],
    [50, 36],
    [82, 36],
  ],
  "1-2-1-2-1": [
    [50, 88],
    [26, 70],
    [74, 70],
    [50, 52],
    [24, 34],
    [76, 34],
    [50, 16],
  ],
  "1-3-1-2": [
    [50, 88],
    [20, 66.33],
    [50, 66.33],
    [80, 66.33],
    [50, 44.67],
    [30, 23],
    [70, 23],
  ],
};
