import { get, set } from 'idb-keyval'
import type { Difficulty, Locale, PuzzleVariant } from '../domain/types'

const key = 'logic-garden:preferences:v1'

export interface Preferences {
  readonly schemaVersion: 2
  readonly difficulty: Difficulty
  readonly puzzleVariant: PuzzleVariant
  readonly locale: Locale
  readonly soundEnabled: boolean
  readonly reducedMotion: boolean
}

export const defaultPreferences: Preferences = {
  schemaVersion: 2,
  difficulty: 'easy',
  puzzleVariant: 'spatial',
  locale: 'ca',
  soundEnabled: false,
  reducedMotion: false,
}

export const loadPreferences = async (): Promise<Preferences> => {
  try {
    const stored = await get<unknown>(key)
    if (!stored || typeof stored !== 'object') return defaultPreferences
    const candidate = stored as Record<string, unknown>
    if (candidate.schemaVersion !== 1 && candidate.schemaVersion !== 2) {
      return defaultPreferences
    }
    return {
      ...defaultPreferences,
      ...(candidate as Partial<Preferences>),
      schemaVersion: 2,
      puzzleVariant: candidate.puzzleVariant === 'cube' ? 'cube' : 'spatial',
    }
  } catch {
    return defaultPreferences
  }
}

export const savePreferences = async (preferences: Preferences) => {
  try {
    await set(key, preferences)
  } catch {
    // The game remains fully playable when private browsing disables storage.
  }
}
