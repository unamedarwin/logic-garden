import { del, get, set } from 'idb-keyval'
import {
  isAudience,
  type Difficulty,
  type Locale,
  type PuzzleCollection,
} from '../domain/types'

const key = 'logic-garden:preferences:v1'
const legacyProfileKey = 'logic-garden:profile:v1'

export interface Preferences {
  readonly schemaVersion: 3
  readonly difficulty: Difficulty
  readonly collection: PuzzleCollection
  readonly locale: Locale
  readonly soundEnabled: boolean
  readonly reducedMotion: boolean
}

export const defaultPreferences: Preferences = {
  schemaVersion: 3,
  difficulty: 'easy',
  collection: 'children',
  locale: 'ca',
  soundEnabled: false,
  reducedMotion: false,
}

const isCollection = (value: unknown): value is PuzzleCollection =>
  value === 'children' || value === 'two-dimensional' || value === 'three-dimensional'

const legacyAudience = (profile: unknown) =>
  profile && typeof profile === 'object'
    ? (profile as Record<string, unknown>).audience
    : undefined

const migratePreferences = (stored: unknown, legacyProfile: unknown): Preferences => {
  const profileAudience = legacyAudience(legacyProfile)
  if (!stored || typeof stored !== 'object') {
    return {
      ...defaultPreferences,
      collection:
        isAudience(profileAudience) && profileAudience !== 'children'
          ? 'two-dimensional'
          : 'children',
    }
  }
  const candidate = stored as Record<string, unknown>
  if (
    candidate.schemaVersion !== 1 &&
    candidate.schemaVersion !== 2 &&
    candidate.schemaVersion !== 3
  ) {
    return defaultPreferences
  }
  const legacyCollection: PuzzleCollection =
    candidate.puzzleVariant === 'cube'
      ? 'three-dimensional'
      : isAudience(profileAudience) && profileAudience !== 'children'
        ? 'two-dimensional'
        : 'children'
  return {
    ...defaultPreferences,
    ...(candidate as Partial<Preferences>),
    schemaVersion: 3,
    collection: isCollection(candidate.collection) ? candidate.collection : legacyCollection,
  }
}

export const loadPreferences = async (): Promise<Preferences> => {
  try {
    const [stored, legacyProfile] = await Promise.all([
      get<unknown>(key),
      get<unknown>(legacyProfileKey),
    ])
    const preferences = migratePreferences(stored, legacyProfile)
    const storedPreferencesAreCurrent =
      stored !== null &&
      typeof stored === 'object' &&
      (stored as Record<string, unknown>).schemaVersion === 3 &&
      isCollection((stored as Record<string, unknown>).collection)
    try {
      if (!storedPreferencesAreCurrent) await set(key, preferences)
      if (legacyProfile !== null && legacyProfile !== undefined) await del(legacyProfileKey)
    } catch {
      // Keep the legacy record when the migrated preferences could not be persisted.
    }
    return preferences
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
