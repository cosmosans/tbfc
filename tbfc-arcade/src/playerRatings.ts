export const ratingLabels = ['Pace', 'Passing', 'Shooting', 'Tackling', 'Stamina', 'Keeping'] as const
type Ratings = readonly [number, number, number, number, number, number]

// Matchday design ratings, keyed by shirt number so display-name changes are safe.
export const playerRatings: Partial<Record<number, Ratings>> = {
  1: [82, 78, 76, 86, 80, 92],
  3: [79, 83, 78, 88, 92, 66],
  4: [73, 79, 72, 85, 81, 50],
  5: [83, 86, 80, 82, 78, 76],
  6: [83, 83, 89, 90, 95, 50],
  7: [78, 88, 81, 84, 76, 60],
  8: [75, 79, 86, 82, 80, 55],
  9: [89, 80, 75, 88, 86, 60],
  10: [94, 90, 88, 76, 96, 55],
  11: [80, 85, 84, 82, 80, 75],
  12: [86, 82, 84, 79, 76, 60],
  13: [77, 89, 80, 81, 78, 60],
  15: [80, 89, 92, 81, 79, 72],
  16: [81, 79, 81, 84, 98, 50],
  17: [77, 82, 86, 87, 80, 85],
  27: [82, 93, 95, 86, 82, 94],
  47: [75, 79, 72, 85, 81, 50],
}
