import { del, get, set } from 'idb-keyval'
import type { GameState } from '../game/gameReducer'
import { GENERATOR_VERSION } from '../generator/version'

const key = 'logic-garden:saved-game:v1'

interface SavedGame {
  readonly schemaVersion: 2
  readonly generatorVersion: number
  readonly state: GameState
}

const isCompatibleSavedGame = (value: unknown): value is SavedGame => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return (
    candidate.schemaVersion === 2 &&
    candidate.generatorVersion === GENERATOR_VERSION &&
    Boolean(candidate.state) &&
    typeof candidate.state === 'object'
  )
}

export const loadSavedGame = async (): Promise<GameState | null> => {
  try {
    const saved = await get<unknown>(key)
    return isCompatibleSavedGame(saved) ? saved.state : null
  } catch {
    return null
  }
}

export const saveGame = async (state: GameState) => {
  try {
    await set(key, {
      schemaVersion: 2,
      generatorVersion: GENERATOR_VERSION,
      state,
    } satisfies SavedGame)
  } catch {
    // A storage error must not interrupt play.
  }
}

export const clearSavedGame = async () => {
  try {
    await del(key)
  } catch {
    // Nothing needs to happen when local storage is unavailable.
  }
}
