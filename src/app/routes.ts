import { isAudience } from '../domain/profile'
import { seed, type Audience, type Difficulty, type Seed } from '../domain/types'

export interface SharedGameRoute {
  readonly difficulty: Difficulty
  readonly seed: Seed
  readonly audience: Audience
}

const isDifficulty = (value: string | null): value is Difficulty =>
  value === 'easy' || value === 'medium' || value === 'hard'

const isSharedPayload = (
  value: unknown,
): value is {
  readonly v: 1
  readonly difficulty: Difficulty
  readonly seed: string
  readonly audience: Audience
} => {
  if (!value || typeof value !== 'object') return false
  const payload = value as Record<string, unknown>
  return (
    payload.v === 1 &&
    typeof payload.difficulty === 'string' &&
    isDifficulty(payload.difficulty) &&
    typeof payload.seed === 'string' &&
    typeof payload.audience === 'string' &&
    isAudience(payload.audience)
  )
}

const encodePayload = (payload: {
  readonly v: 1
  readonly difficulty: Difficulty
  readonly seed: Seed
  readonly audience: Audience
}) =>
  btoa(JSON.stringify(payload)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')

const decodePayload = (value: string): unknown => {
  try {
    const padded = value.replaceAll('-', '+').replaceAll('_', '/')
    const padding = '='.repeat((4 - (padded.length % 4)) % 4)
    return JSON.parse(atob(`${padded}${padding}`)) as unknown
  } catch {
    return null
  }
}

export const parseSharedGameRoute = (location: Location): SharedGameRoute | null => {
  if (location.pathname !== import.meta.env.BASE_URL) return null
  const params = new URLSearchParams(location.search)
  const encoded = params.get('p')
  const decoded = encoded ? decodePayload(encoded) : null
  if (isSharedPayload(decoded)) {
    return {
      difficulty: decoded.difficulty,
      seed: seed(decoded.seed),
      audience: decoded.audience,
    }
  }

  const difficulty = params.get('difficulty')
  const gameSeed = params.get('seed')
  const version = params.get('v')
  const audience = params.get('audience')
  return version === '1' && isDifficulty(difficulty) && gameSeed
    ? {
        difficulty,
        seed: seed(gameSeed),
        audience: isAudience(audience) ? audience : 'children',
      }
    : null
}

export const shareUrl = (
  puzzle: { readonly difficulty: Difficulty; readonly seed: Seed },
  audience: Audience,
) => {
  const url = new URL(import.meta.env.BASE_URL, window.location.origin)
  url.searchParams.set(
    'p',
    encodePayload({ v: 1, difficulty: puzzle.difficulty, seed: puzzle.seed, audience }),
  )
  return url.toString()
}
