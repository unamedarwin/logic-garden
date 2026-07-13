import {
  isAudience,
  isChallengeMetadata,
  isShareableSeed,
  seed,
  type Audience,
  type ChallengeMetadata,
  type Difficulty,
  type PuzzleVariant,
  type Seed,
} from '../domain/types'
import { GENERATOR_VERSION } from '../generator/version'

export type SharedGameRoute = ChallengeMetadata

const isBenchmarkSeconds = (value: unknown): value is number =>
  Number.isSafeInteger(value) && Number(value) >= 0 && Number(value) <= 86_400

const isDifficulty = (value: string | null): value is Difficulty =>
  value === 'easy' || value === 'medium' || value === 'hard'

const isSharedPayload = (
  value: unknown,
): value is {
  readonly v: 2 | 3 | 4
  readonly difficulty: Difficulty
  readonly seed: string
  readonly audience: Audience
  readonly generatorVersion: number
  readonly variant?: PuzzleVariant
  readonly benchmarkSeconds?: number
} => {
  if (!value || typeof value !== 'object') return false
  const payload = value as Record<string, unknown>
  return (
    (payload.v === 2 || payload.v === 3 || payload.v === 4) &&
    isChallengeMetadata(payload) &&
    payload.generatorVersion === GENERATOR_VERSION &&
    (payload.v === 4
      ? payload.variant === 'spatial' || payload.variant === 'cube'
      : payload.variant === undefined)
  )
}

const encodePayload = (payload: {
  readonly v: 4
  readonly difficulty: Difficulty
  readonly seed: Seed
  readonly audience: Audience
  readonly generatorVersion: number
  readonly variant: PuzzleVariant
  readonly benchmarkSeconds?: number
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
  const decoded = encoded && encoded.length <= 512 ? decodePayload(encoded) : null
  if (isSharedPayload(decoded)) {
    return {
      difficulty: decoded.difficulty,
      seed: seed(decoded.seed),
      audience: decoded.audience,
      generatorVersion: decoded.generatorVersion,
      variant: decoded.variant === 'cube' ? 'cube' : 'spatial',
      benchmarkSeconds: decoded.benchmarkSeconds,
    }
  }

  const difficulty = params.get('difficulty')
  const gameSeed = params.get('seed')
  const version = params.get('v')
  const generatorVersion = Number(params.get('generatorVersion'))
  const audience = params.get('audience')
  return version === '2' &&
    generatorVersion === GENERATOR_VERSION &&
    isDifficulty(difficulty) &&
    isShareableSeed(gameSeed)
    ? {
        difficulty,
        seed: seed(gameSeed),
        audience: isAudience(audience) ? audience : 'children',
        generatorVersion,
      }
    : null
}

export const shareUrl = (
  puzzle: {
    readonly difficulty: Difficulty
    readonly seed: Seed
    readonly generatorVersion: number
    readonly variant?: PuzzleVariant
  },
  audience: Audience,
  benchmarkSeconds?: number,
) => {
  if (!isShareableSeed(puzzle.seed)) {
    throw new Error('Cannot share a puzzle with an unsafe seed')
  }
  if (puzzle.variant === 'cube' && (audience === 'children' || puzzle.difficulty !== 'hard')) {
    throw new Error('Cannot share an invalid 3D challenge')
  }
  const url = new URL(import.meta.env.BASE_URL, window.location.origin)
  url.searchParams.set(
    'p',
    encodePayload({
      v: 4,
      difficulty: puzzle.difficulty,
      seed: puzzle.seed,
      audience,
      generatorVersion: puzzle.generatorVersion,
      variant: puzzle.variant === 'cube' ? 'cube' : 'spatial',
      ...(isBenchmarkSeconds(benchmarkSeconds) ? { benchmarkSeconds } : {}),
    }),
  )
  return url.toString()
}
