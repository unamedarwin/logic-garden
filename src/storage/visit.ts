import { get, set } from 'idb-keyval'

const key = 'logic-garden:visited:v1'
const preferencesKey = 'logic-garden:preferences:v1'
const legacyProfileKey = 'logic-garden:profile:v1'

export const hasVisited = async () => {
  try {
    const [visited, preferences, legacyProfile] = await Promise.all([
      get<unknown>(key),
      get<unknown>(preferencesKey),
      get<unknown>(legacyProfileKey),
    ])
    return (
      visited === true ||
      (preferences !== null && preferences !== undefined) ||
      (legacyProfile !== null && legacyProfile !== undefined)
    )
  } catch {
    return false
  }
}

export const markVisited = async () => {
  try {
    await set(key, true)
  } catch {
    // First-visit copy is optional when private browsing disables storage.
  }
}
