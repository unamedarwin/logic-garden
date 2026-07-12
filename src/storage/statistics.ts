import { get, set } from 'idb-keyval'
import type { Audience, Difficulty } from '../domain/types'

const key = 'logic-garden:statistics:v1'
const historyLimit = 12

export interface CompletedGame {
  readonly id: string
  readonly seed: string
  readonly title: string
  readonly audience: Audience
  readonly difficulty: Difficulty
  readonly completedAt: number
  readonly elapsedSeconds: number
  readonly moves: number
  readonly hintsUsed: number
}

export interface CompletionInput {
  readonly seed: string
  readonly title: string
  readonly audience: Audience
  readonly difficulty: Difficulty
  readonly elapsedSeconds: number
  readonly moves: number
  readonly hintsUsed: number
}

export interface Statistics {
  readonly schemaVersion: 2
  readonly completed: number
  readonly hintsUsed: number
  readonly recentSeeds: readonly string[]
  readonly history: readonly CompletedGame[]
}

interface LegacyStatistics {
  readonly schemaVersion: 1
  readonly completed: number
  readonly hintsUsed: number
  readonly recentSeeds: readonly string[]
}

const defaults: Statistics = {
  schemaVersion: 2,
  completed: 0,
  hintsUsed: 0,
  recentSeeds: [],
  history: [],
}

const isLegacyStatistics = (value: unknown): value is LegacyStatistics =>
  Boolean(value) &&
  typeof value === 'object' &&
  (value as { readonly schemaVersion?: unknown }).schemaVersion === 1

const isStatistics = (value: unknown): value is Statistics =>
  Boolean(value) &&
  typeof value === 'object' &&
  (value as { readonly schemaVersion?: unknown }).schemaVersion === 2

export const loadStatistics = async (): Promise<Statistics> => {
  try {
    const stored = await get<unknown>(key)
    if (isStatistics(stored)) return { ...defaults, ...stored, history: stored.history ?? [] }
    if (isLegacyStatistics(stored)) {
      return {
        ...defaults,
        completed: stored.completed,
        hintsUsed: stored.hintsUsed,
        recentSeeds: stored.recentSeeds,
      }
    }
    return defaults
  } catch {
    return defaults
  }
}

export const recordCompletion = async (input: CompletionInput): Promise<Statistics> => {
  const previous = await loadStatistics()
  const completedAt = Date.now()
  const record: CompletedGame = {
    ...input,
    id: `${input.seed}:${completedAt}`,
    completedAt,
  }
  const recentSeeds = [
    input.seed,
    ...previous.recentSeeds.filter((entry) => entry !== input.seed),
  ].slice(0, 8)
  const next: Statistics = {
    schemaVersion: 2,
    completed: previous.completed + 1,
    hintsUsed: previous.hintsUsed + input.hintsUsed,
    recentSeeds,
    history: [record, ...previous.history].slice(0, historyLimit),
  }

  try {
    await set(key, next)
  } catch {
    // Statistics are an optional local enhancement.
  }
  return next
}
