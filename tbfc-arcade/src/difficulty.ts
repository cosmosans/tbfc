export const divisions = ['beginners', 'd6', 'd5', 'd4'] as const
export type Division = typeof divisions[number]

interface DifficultyProfile {
  label: string
  reactionDelayMs: number
  passingError: number
  shootingError: number
  laneClearance: number
  defensiveShape: number
  keeperTracking: number
}

export const profiles: Record<Division, DifficultyProfile> = {
  beginners: { label: 'Beginners · Learning', reactionDelayMs: 650, passingError: 1.25, shootingError: 1.30, laneClearance: .35, defensiveShape: .30, keeperTracking: .25 },
  d6: { label: 'D6 · Recreational (Recommended)', reactionDelayMs: 450, passingError: 1.10, shootingError: 1.15, laneClearance: .60, defensiveShape: .65, keeperTracking: .35 },
  d5: { label: 'D5 · Competitive', reactionDelayMs: 300, passingError: 1, shootingError: 1, laneClearance: .80, defensiveShape: .90, keeperTracking: .45 },
  d4: { label: 'D4 · Advanced', reactionDelayMs: 180, passingError: .90, shootingError: .90, laneClearance: 1.05, defensiveShape: 1, keeperTracking: .50 }
}

const preferenceKey = 'tbfc.arcade.division'
export function preferredDivision(): Division {
  try {
    const saved = localStorage.getItem(preferenceKey)
    return divisions.find(division => division === saved) ?? 'd6'
  } catch { return 'd6' }
}

export function rememberDivision(division: Division) {
  try { localStorage.setItem(preferenceKey, division) } catch { /* Still applies to this match. */ }
}
