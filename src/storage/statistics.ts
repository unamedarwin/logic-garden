import { get, set } from 'idb-keyval'

const key = 'logic-garden:statistics:v1'

export interface Statistics {
  readonly schemaVersion: 1
  readonly completed: number
  readonly hintsUsed: number
  readonly recentSeeds: readonly string[]
}

const defaults: Statistics = { schemaVersion: 1, completed: 0, hintsUsed: 0, recentSeeds: [] }

export const loadStatistics = async (): Promise<Statistics> => {
  try {
    const stored = await get<Statistics>(key)
    return stored?.schemaVersion === 1 ? { ...defaults, ...stored } : defaults
  } catch {
    return defaults
  }
}

export const recordCompletion = async (seed: string, hintsUsed: number) => {
  const previous = await loadStatistics()
  const recentSeeds = [seed, ...previous.recentSeeds.filter((entry) => entry !== seed)].slice(
    0,
    8,
  )
  try {
    await set(key, {
      schemaVersion: 1,
      completed: previous.completed + 1,
      hintsUsed: previous.hintsUsed + hintsUsed,
      recentSeeds,
    } satisfies Statistics)
  } catch {
    // Statistics are an optional local enhancement.
  }
}
