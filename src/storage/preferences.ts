import { get, set } from 'idb-keyval'
import type { Difficulty, Locale } from '../domain/types'

const key = 'logic-garden:preferences:v1'

export interface Preferences {
  readonly schemaVersion: 1
  readonly difficulty: Difficulty
  readonly locale: Locale
  readonly soundEnabled: boolean
  readonly reducedMotion: boolean
}

export const defaultPreferences: Preferences = {
  schemaVersion: 1,
  difficulty: 'easy',
  locale: 'ca',
  soundEnabled: false,
  reducedMotion: false,
}

export const loadPreferences = async (): Promise<Preferences> => {
  try {
    const stored = await get<Preferences>(key)
    return stored?.schemaVersion === 1
      ? { ...defaultPreferences, ...stored }
      : defaultPreferences
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
