import { get, set } from 'idb-keyval'
import type { PlayerProfile } from '../domain/profile'

const key = 'logic-garden:profile:v1'

const isProfile = (value: PlayerProfile | undefined): value is PlayerProfile =>
  value?.schemaVersion === 1 && value.name.trim().length > 0

export const loadProfile = async (): Promise<PlayerProfile | null> => {
  try {
    const stored = await get<PlayerProfile>(key)
    return isProfile(stored) ? stored : null
  } catch {
    return null
  }
}

export const saveProfile = async (profile: PlayerProfile) => {
  try {
    await set(key, profile)
  } catch {
    // A profile is optional when private browsing disables local storage.
  }
}
