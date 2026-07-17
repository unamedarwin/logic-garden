import { gunzipSync, gzipSync, strFromU8, strToU8 } from 'fflate'
import {
  isAudience,
  isChallengeMetadata,
  isShareableSeed,
  seed,
  type AdvancedGridSize,
  type Audience,
  type BuildingSize,
  type BuildingPlacement,
  type ChildMapSize,
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
  readonly v: 2 | 3 | 4 | 5 | 6
  readonly difficulty: Difficulty
  readonly seed: string
  readonly audience: Audience
  readonly generatorVersion: number
  readonly variant?: PuzzleVariant
  readonly gridSize?: AdvancedGridSize
  readonly childMapSize?: ChildMapSize
  readonly buildingDepth?: BuildingSize
  readonly buildingPlacement?: BuildingPlacement
  readonly benchmarkSeconds?: number
} => {
  if (!value || typeof value !== 'object') return false
  const payload = value as Record<string, unknown>
  return (
    (payload.v === 2 ||
      payload.v === 3 ||
      payload.v === 4 ||
      payload.v === 5 ||
      payload.v === 6) &&
    isChallengeMetadata(payload) &&
    payload.generatorVersion === GENERATOR_VERSION &&
    (payload.v === 4 || payload.v === 5 || payload.v === 6
      ? payload.variant === 'spatial' || payload.variant === 'cube'
      : payload.variant === undefined) &&
    (payload.v < 5 ||
      (payload.v === 6 && payload.variant === 'cube'
        ? payload.buildingPlacement === 'rooms' || payload.buildingPlacement === 'cells'
        : payload.buildingPlacement === undefined)) &&
    (payload.v < 5 ||
      (payload.variant === 'cube'
        ? payload.buildingDepth === 3 ||
          payload.buildingDepth === 4 ||
          payload.buildingDepth === 5 ||
          payload.buildingDepth === 6 ||
          payload.buildingDepth === 7 ||
          payload.buildingDepth === 8 ||
          payload.buildingDepth === 9 ||
          payload.buildingDepth === 10
        : payload.audience === 'children'
          ? payload.childMapSize === 4 ||
            payload.childMapSize === 6 ||
            payload.childMapSize === 8
          : payload.gridSize === 6 || payload.gridSize === 9 || payload.gridSize === 16))
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
  readonly v: 6
  readonly difficulty: Difficulty
  readonly seed: Seed
  readonly audience: Audience
  readonly generatorVersion: number
  readonly variant: PuzzleVariant
  readonly gridSize?: AdvancedGridSize
  readonly childMapSize?: ChildMapSize
  readonly buildingDepth?: BuildingSize
  readonly buildingPlacement?: BuildingPlacement
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
      ...(decoded.gridSize ? { gridSize: decoded.gridSize } : {}),
      ...(decoded.childMapSize ? { childMapSize: decoded.childMapSize } : {}),
      ...(decoded.buildingDepth ? { buildingDepth: decoded.buildingDepth } : {}),
      ...(decoded.variant === 'cube'
        ? { buildingPlacement: decoded.buildingPlacement ?? 'cells' }
        : {}),
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
    readonly gridSize?: AdvancedGridSize
    readonly childMapSize?: ChildMapSize
    readonly buildingDepth?: BuildingSize
    readonly buildingPlacement?: BuildingPlacement
  },
  audience: Audience,
  benchmarkSeconds?: number,
) => {
  if (puzzle.generatorVersion !== GENERATOR_VERSION) {
    throw new Error('Cannot share a puzzle from an obsolete generator')
  }
  if (!isShareableSeed(puzzle.seed)) {
    throw new Error('Cannot share a puzzle with an unsafe seed')
  }
  if (puzzle.variant === 'cube' && audience === 'children') {
    throw new Error('Cannot share an invalid 3D challenge')
  }
  if (
    puzzle.variant === 'cube' &&
    puzzle.buildingDepth !== 3 &&
    puzzle.buildingDepth !== 4 &&
    puzzle.buildingDepth !== 5 &&
    puzzle.buildingDepth !== 6 &&
    puzzle.buildingDepth !== 7 &&
    puzzle.buildingDepth !== 8 &&
    puzzle.buildingDepth !== 9 &&
    puzzle.buildingDepth !== 10
  ) {
    throw new Error('Cannot share a 3D challenge without its building height')
  }
  if (
    puzzle.variant !== 'cube' &&
    audience === 'children' &&
    puzzle.childMapSize !== 4 &&
    puzzle.childMapSize !== 6 &&
    puzzle.childMapSize !== 8
  ) {
    throw new Error('Cannot share a child puzzle without its map size')
  }
  if (
    puzzle.variant !== 'cube' &&
    audience !== 'children' &&
    puzzle.gridSize !== 6 &&
    puzzle.gridSize !== 9 &&
    puzzle.gridSize !== 16
  ) {
    throw new Error('Cannot share an advanced puzzle without its board size')
  }
  const url = new URL(import.meta.env.BASE_URL, window.location.origin)
  url.searchParams.set(
    'p',
    encodePayload({
      v: 6,
      difficulty: puzzle.difficulty,
      seed: puzzle.seed,
      audience,
      generatorVersion: puzzle.generatorVersion,
      variant: puzzle.variant === 'cube' ? 'cube' : 'spatial',
      ...(puzzle.variant !== 'cube' && audience !== 'children' && puzzle.gridSize
        ? { gridSize: puzzle.gridSize }
        : {}),
      ...(puzzle.variant !== 'cube' && audience === 'children' && puzzle.childMapSize
        ? { childMapSize: puzzle.childMapSize }
        : {}),
      ...(puzzle.variant === 'cube' && puzzle.buildingDepth
        ? { buildingDepth: puzzle.buildingDepth }
        : {}),
      ...(puzzle.variant === 'cube'
        ? { buildingPlacement: puzzle.buildingPlacement ?? 'cells' }
        : {}),
      ...(isBenchmarkSeconds(benchmarkSeconds) ? { benchmarkSeconds } : {}),
    }),
  )
  return url.toString()
}
