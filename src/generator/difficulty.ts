import type { Difficulty } from '../domain/types'

export interface DifficultyConfig {
  readonly label: string
  readonly characterCount: number
  readonly rows: number
  readonly columns: number
  readonly visualHelp: boolean
}

export const difficultyConfigs: Record<Difficulty, DifficultyConfig> = {
  easy: { label: 'Fàcil', characterCount: 4, rows: 2, columns: 2, visualHelp: true },
  medium: { label: 'Mitjà', characterCount: 6, rows: 2, columns: 3, visualHelp: false },
  hard: { label: 'Difícil', characterCount: 8, rows: 2, columns: 4, visualHelp: false },
}
