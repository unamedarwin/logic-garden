import { del, get, set } from 'idb-keyval'
import {
  isAudience,
  type AdvancedGridSize,
  type BuildingSize,
  type ChildMapSize,
  type Difficulty,
  type Locale,
  type PuzzleCollection,
} from '../domain/types'
import { detectBrowserLocale, isLocale } from '../domain/locales'

const key = 'logic-garden:preferences:v1'
const legacyProfileKey = 'logic-garden:profile:v1'

export interface Preferences {
  readonly schemaVersion: 5
  readonly difficulty: Difficulty
  readonly collection: PuzzleCollection
  readonly advancedGridSize: AdvancedGridSize
  readonly childMapSize: ChildMapSize
  readonly buildingDepth: BuildingSize
  readonly locale: Locale
  readonly soundEnabled: boolean
  readonly reducedMotion: boolean
  readonly showCheckProgress: boolean
}

export const defaultPreferences: Preferences = {
  schemaVersion: 5,
  difficulty: 'easy',
  collection: 'children',
  advancedGridSize: 6,
  childMapSize: 4,
  buildingDepth: 3,
  locale: 'ca',
  soundEnabled: false,
  reducedMotion: false,
  showCheckProgress: true,
}

const isCollection = (value: unknown): value is PuzzleCollection =>
  value === 'children' || value === 'two-dimensional' || value === 'three-dimensional'

const isAdvancedGridSize = (value: unknown): value is AdvancedGridSize =>
  value === 6 || value === 9 || value === 16

const isChildMapSize = (value: unknown): value is ChildMapSize =>
  value === 4 || value === 6 || value === 8

const isBuildingSize = (value: unknown): value is BuildingSize =>
  value === 3 ||
  value === 4 ||
  value === 5 ||
  value === 6 ||
  value === 7 ||
  value === 8 ||
  value === 9 ||
  value === 10

const isDifficulty = (value: unknown): value is Difficulty =>
  value === 'easy' || value === 'medium' || value === 'hard'

const legacyAudience = (profile: unknown) =>
  profile && typeof profile === 'object'
    ? (profile as Record<string, unknown>).audience
    : undefined

const migratePreferences = (
  stored: unknown,
  legacyProfile: unknown,
  initialLocale: Locale,
): Preferences => {
  const profileAudience = legacyAudience(legacyProfile)
  if (!stored || typeof stored !== 'object') {
    return {
      ...defaultPreferences,
      locale: initialLocale,
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
    candidate.schemaVersion !== 3 &&
    candidate.schemaVersion !== 4 &&
    candidate.schemaVersion !== 5
  ) {
    return { ...defaultPreferences, locale: initialLocale }
  }
  const legacyCollection: PuzzleCollection =
    candidate.puzzleVariant === 'cube'
      ? 'three-dimensional'
      : isAudience(profileAudience) && profileAudience !== 'children'
        ? 'two-dimensional'
        : 'children'
  return {
    schemaVersion: 5,
    difficulty: isDifficulty(candidate.difficulty)
      ? candidate.difficulty
      : defaultPreferences.difficulty,
    collection: isCollection(candidate.collection) ? candidate.collection : legacyCollection,
    advancedGridSize: isAdvancedGridSize(candidate.advancedGridSize)
      ? candidate.advancedGridSize
      : 6,
    childMapSize: isChildMapSize(candidate.childMapSize) ? candidate.childMapSize : 4,
    buildingDepth: isBuildingSize(candidate.buildingDepth) ? candidate.buildingDepth : 3,
    locale: isLocale(candidate.locale) ? candidate.locale : initialLocale,
    soundEnabled:
      typeof candidate.soundEnabled === 'boolean'
        ? candidate.soundEnabled
        : defaultPreferences.soundEnabled,
    reducedMotion:
      typeof candidate.reducedMotion === 'boolean'
        ? candidate.reducedMotion
        : defaultPreferences.reducedMotion,
    showCheckProgress:
      typeof candidate.showCheckProgress === 'boolean'
        ? candidate.showCheckProgress
        : defaultPreferences.showCheckProgress,
  }
}

export const loadPreferences = async (
  browserLanguages: readonly string[] = [],
): Promise<Preferences> => {
  const initialLocale = detectBrowserLocale(browserLanguages)
  try {
    const [stored, legacyProfile] = await Promise.all([
      get<unknown>(key),
      get<unknown>(legacyProfileKey),
    ])
    const preferences = migratePreferences(stored, legacyProfile, initialLocale)
    const storedPreferencesAreCurrent =
      stored !== null &&
      typeof stored === 'object' &&
      (stored as Record<string, unknown>).schemaVersion === 5 &&
      isCollection((stored as Record<string, unknown>).collection) &&
      isAdvancedGridSize((stored as Record<string, unknown>).advancedGridSize) &&
      isChildMapSize((stored as Record<string, unknown>).childMapSize) &&
      isBuildingSize((stored as Record<string, unknown>).buildingDepth) &&
      isDifficulty((stored as Record<string, unknown>).difficulty) &&
      isLocale((stored as Record<string, unknown>).locale) &&
      typeof (stored as Record<string, unknown>).soundEnabled === 'boolean' &&
      typeof (stored as Record<string, unknown>).reducedMotion === 'boolean' &&
      typeof (stored as Record<string, unknown>).showCheckProgress === 'boolean'
    try {
      if (!storedPreferencesAreCurrent) await set(key, preferences)
      if (legacyProfile !== null && legacyProfile !== undefined) await del(legacyProfileKey)
    } catch {
      // Keep the legacy record when the migrated preferences could not be persisted.
    }
    return preferences
  } catch {
    return { ...defaultPreferences, locale: initialLocale }
  }
}

export const savePreferences = async (preferences: Preferences) => {
  try {
    await set(key, preferences)
  } catch {
    // The game remains fully playable when private browsing disables storage.
  }
}
