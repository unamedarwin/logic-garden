import { get, set } from 'idb-keyval'
import type { Audience, Difficulty, ThemeId } from '../domain/types'

const key = 'logic-garden:statistics:v1'
const historyLimit = 12

export interface CompletedGame {
  readonly id: string
  readonly seed: string
  readonly theme?: ThemeId
  readonly legacyTitle?: string
  readonly audience: Audience
  readonly difficulty: Difficulty
  readonly generatorVersion: number
  readonly completedAt: number
  readonly elapsedSeconds: number
  readonly moves: number
  readonly hintsUsed: number
}

export interface CompletionInput {
  readonly seed: string
  readonly theme: ThemeId
  readonly audience: Audience
  readonly difficulty: Difficulty
  readonly generatorVersion: number
  readonly elapsedSeconds: number
  readonly moves: number
  readonly hintsUsed: number
}

export interface Statistics {
  readonly schemaVersion: 4
  readonly completed: number
  readonly hintsUsed: number
  readonly recentSeeds: readonly string[]
  readonly history: readonly CompletedGame[]
}

interface LegacyStatisticsV1 {
  readonly schemaVersion: 1
  readonly completed: number
  readonly hintsUsed: number
  readonly recentSeeds: readonly string[]
}

interface LegacyStatisticsV2 {
  readonly schemaVersion: 2
  readonly completed: number
  readonly hintsUsed: number
  readonly recentSeeds: readonly string[]
  readonly history?: readonly LegacyCompletedGameV2[]
}

interface LegacyCompletedGameV2 {
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

interface LegacyCompletedGameV3 extends LegacyCompletedGameV2 {
  readonly generatorVersion: number
}

interface LegacyStatisticsV3 {
  readonly schemaVersion: 3
  readonly completed: number
  readonly hintsUsed: number
  readonly recentSeeds: readonly string[]
  readonly history?: readonly LegacyCompletedGameV3[]
}

const defaults: Statistics = {
  schemaVersion: 4,
  completed: 0,
  hintsUsed: 0,
  recentSeeds: [],
  history: [],
}

const isLegacyStatisticsV1 = (value: unknown): value is LegacyStatisticsV1 =>
  Boolean(value) &&
  typeof value === 'object' &&
  (value as { readonly schemaVersion?: unknown }).schemaVersion === 1

const isLegacyStatisticsV2 = (value: unknown): value is LegacyStatisticsV2 =>
  Boolean(value) &&
  typeof value === 'object' &&
  (value as { readonly schemaVersion?: unknown }).schemaVersion === 2

const isStatistics = (value: unknown): value is Statistics =>
  Boolean(value) &&
  typeof value === 'object' &&
  (value as { readonly schemaVersion?: unknown }).schemaVersion === 4

const isLegacyStatisticsV3 = (value: unknown): value is LegacyStatisticsV3 =>
  Boolean(value) &&
  typeof value === 'object' &&
  (value as { readonly schemaVersion?: unknown }).schemaVersion === 3

const migrateLegacyGame = (
  record: LegacyCompletedGameV2 | LegacyCompletedGameV3,
  generatorVersion: number,
): CompletedGame => ({
  id: record.id,
  seed: record.seed,
  legacyTitle: record.title,
  audience: record.audience,
  difficulty: record.difficulty,
  generatorVersion,
  completedAt: record.completedAt,
  elapsedSeconds: record.elapsedSeconds,
  moves: record.moves,
  hintsUsed: record.hintsUsed,
})

export const loadStatistics = async (): Promise<Statistics> => {
  try {
    const stored = await get<unknown>(key)
    if (isStatistics(stored)) return { ...defaults, ...stored, history: stored.history ?? [] }
    if (isLegacyStatisticsV3(stored)) {
      return {
        ...defaults,
        completed: stored.completed,
        hintsUsed: stored.hintsUsed,
        recentSeeds: stored.recentSeeds,
        history: (stored.history ?? []).map((record) =>
          migrateLegacyGame(record, record.generatorVersion),
        ),
      }
    }
    if (isLegacyStatisticsV2(stored)) {
      return {
        ...defaults,
        completed: stored.completed,
        hintsUsed: stored.hintsUsed,
        recentSeeds: stored.recentSeeds,
        history: (stored.history ?? []).map((record) => migrateLegacyGame(record, 0)),
      }
    }
    if (isLegacyStatisticsV1(stored)) {
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
    schemaVersion: 4,
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
