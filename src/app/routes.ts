import { gunzipSync, gzipSync, strFromU8, strToU8 } from 'fflate'
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

const compressedPayloadPrefix = 'gz_'
const maximumEncodedPayloadLength = 512
const maximumDecodedPayloadLength = 2_048

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

const toUrlSafeBase64 = (bytes: Uint8Array) => {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

const fromUrlSafeBase64 = (value: string) => {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/')
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4)
  return Uint8Array.from(atob(`${normalized}${padding}`), (character) =>
    character.charCodeAt(0),
  )
}

const declaredGzipSize = (bytes: Uint8Array) => {
  if (bytes.length < 18 || bytes[0] !== 0x1f || bytes[1] !== 0x8b) return null
  const index = bytes.length - 4
  return (
    ((bytes[index] ?? 0) |
      ((bytes[index + 1] ?? 0) << 8) |
      ((bytes[index + 2] ?? 0) << 16) |
      ((bytes[index + 3] ?? 0) << 24)) >>>
    0
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
  `${compressedPayloadPrefix}${toUrlSafeBase64(
    gzipSync(strToU8(JSON.stringify(payload)), { level: 9 }),
  )}`

const decodePayload = (value: string): unknown => {
  try {
    if (value.startsWith(compressedPayloadPrefix)) {
      const bytes = fromUrlSafeBase64(value.slice(compressedPayloadPrefix.length))
      const decodedSize = declaredGzipSize(bytes)
      if (decodedSize === null || decodedSize > maximumDecodedPayloadLength) return null
      const decoded = gunzipSync(bytes)
      if (decoded.length !== decodedSize) return null
      return JSON.parse(strFromU8(decoded)) as unknown
    }
    return JSON.parse(strFromU8(fromUrlSafeBase64(value))) as unknown
  } catch {
    return null
  }
}

export const parseSharedGameRoute = (location: Location): SharedGameRoute | null => {
  if (location.pathname !== import.meta.env.BASE_URL) return null
  const params = new URLSearchParams(location.search)
  const encoded = params.get('p')
  const decoded =
    encoded && encoded.length <= maximumEncodedPayloadLength ? decodePayload(encoded) : null
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
