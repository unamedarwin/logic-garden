import { del, get, set } from 'idb-keyval'
import { isChallengeMetadata, type ChallengeMetadata } from '../domain/types'
import type { GameState } from '../game/gameReducer'
import { GENERATOR_VERSION } from '../generator/version'

const key = 'logic-garden:saved-game:v1'

interface SavedGame {
  readonly schemaVersion: 3
  readonly generatorVersion: number
  readonly state: GameState
  readonly challenge?: ChallengeMetadata
}

export interface SavedGameSession {
  readonly state: GameState
  readonly challenge?: ChallengeMetadata
}

const isCompatibleSavedGame = (value: unknown): value is SavedGame => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return (
    candidate.schemaVersion === 3 &&
    candidate.generatorVersion === GENERATOR_VERSION &&
    Boolean(candidate.state) &&
    typeof candidate.state === 'object' &&
    (candidate.challenge === undefined ||
      (isChallengeMetadata(candidate.challenge) &&
        candidate.challenge.generatorVersion === GENERATOR_VERSION))
  )
}

export const loadSavedGame = async (): Promise<SavedGameSession | null> => {
  try {
    const saved = await get<unknown>(key)
    return isCompatibleSavedGame(saved)
      ? { state: saved.state, ...(saved.challenge ? { challenge: saved.challenge } : {}) }
      : null
  } catch {
    return null
  }
}

export const saveGame = async (state: GameState, challenge?: ChallengeMetadata) => {
  try {
    await set(key, {
      schemaVersion: 3,
      generatorVersion: GENERATOR_VERSION,
      state,
      ...(challenge ? { challenge } : {}),
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
