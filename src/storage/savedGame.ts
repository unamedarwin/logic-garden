import { del, get, set } from 'idb-keyval'
import type { GameState } from '../game/gameReducer'

const key = 'logic-garden:saved-game:v1'

interface SavedGame {
  readonly schemaVersion: 1
  readonly state: GameState
}

export const loadSavedGame = async (): Promise<GameState | null> => {
  try {
    const saved = await get<SavedGame>(key)
    return saved?.schemaVersion === 1 ? saved.state : null
  } catch {
    return null
  }
}

export const saveGame = async (state: GameState) => {
  try {
    await set(key, { schemaVersion: 1, state } satisfies SavedGame)
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
