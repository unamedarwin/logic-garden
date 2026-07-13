export type Brand<Value, Name extends string> = Value & { readonly __brand: Name }

export type PuzzleId = Brand<string, 'PuzzleId'>
export type CharacterId = Brand<string, 'CharacterId'>
export type PositionId = Brand<string, 'PositionId'>
export type PlaceId = Brand<string, 'PlaceId'>
export type ItemId = Brand<string, 'ItemId'>
export type Seed = Brand<string, 'Seed'>

export const puzzleId = (value: string) => value as PuzzleId
export const characterId = (value: string) => value as CharacterId
export const positionId = (value: string) => value as PositionId
export const placeId = (value: string) => value as PlaceId
export const itemId = (value: string) => value as ItemId
export const seed = (value: string) => value as Seed

export type Difficulty = 'easy' | 'medium' | 'hard'
export type BoardMode = 'map' | 'logic-grid' | 'logic-cube'
export type PuzzleVariant = 'spatial' | 'cube'
export type PuzzleCollection = 'children' | 'two-dimensional' | 'three-dimensional'
export type Locale = 'ca' | 'es' | 'en'
export type Audience = 'children' | 'teens' | 'adults'
export type ThemeId =
  | 'forest-party'
  | 'treasure-island'
  | 'kind-magic-school'
  | 'space-trip'
  | 'fun-farm'
  | 'sea-garden'
  | 'dino-park'
  | 'friendly-monster-town'
  | 'color-fair'
  | 'mountain-trip'
  | 'music-studio'
  | 'sports-festival'
  | 'creative-lab'
  | 'book-club'
  | 'city-garden'
  | 'weekend-market'

export const isAudience = (value: unknown): value is Audience =>
  value === 'children' || value === 'teens' || value === 'adults'

export interface ChallengeMetadata {
  readonly difficulty: Difficulty
  readonly seed: Seed
  readonly audience: Audience
  readonly generatorVersion: number
  readonly variant?: PuzzleVariant
  readonly benchmarkSeconds?: number
}

export const isShareableSeed = (value: unknown): value is string =>
  typeof value === 'string' && /^[A-Za-z0-9._~-]{1,128}$/u.test(value)

export const isChallengeMetadata = (value: unknown): value is ChallengeMetadata => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return (
    (candidate.difficulty === 'easy' ||
      candidate.difficulty === 'medium' ||
      candidate.difficulty === 'hard') &&
    isShareableSeed(candidate.seed) &&
    (candidate.audience === 'children' ||
      candidate.audience === 'teens' ||
      candidate.audience === 'adults') &&
    Number.isSafeInteger(candidate.generatorVersion) &&
    Number(candidate.generatorVersion) > 0 &&
    (candidate.variant === undefined ||
      candidate.variant === 'spatial' ||
      candidate.variant === 'cube') &&
    (candidate.variant !== 'cube' ||
      (candidate.difficulty === 'hard' && candidate.audience !== 'children')) &&
    (candidate.benchmarkSeconds === undefined ||
      (Number.isSafeInteger(candidate.benchmarkSeconds) &&
        Number(candidate.benchmarkSeconds) >= 0 &&
        Number(candidate.benchmarkSeconds) <= 86_400))
  )
}

export interface Character {
  readonly id: CharacterId
  readonly name: string
  readonly emoji: string
  readonly description: string
  /** Two-dimensional games can keep a fixed carried item. Cube games infer it. */
  readonly itemId?: ItemId
}

export interface Item {
  readonly id: ItemId
  readonly label: string
  readonly emoji: string
}

export interface Position {
  readonly id: PositionId
  readonly placeId: PlaceId
  readonly row: number
  readonly column: number
  readonly label: string
  /** Cube layer owned by one character; absent on two-dimensional boards. */
  readonly layer?: number
  readonly layerCharacterId?: CharacterId
  /** The object represented by this row in a cube layer. */
  readonly itemId?: ItemId
  /** Semantic unit shared by the cells of one home, shop, or circulation area. */
  readonly buildingUnitId?: string
  readonly buildingKind?: 'home' | 'shop' | 'landing' | 'stairs' | 'entrance'
  /** A visible piece of scenery occupies this grid position. */
  readonly blocked?: boolean
  readonly obstacleEmoji?: string
  readonly obstacleLabel?: string
}

interface ClueBase {
  readonly id: string
  readonly phraseVariant: number
}

export type Clue =
  | (ClueBase & {
      readonly type: 'character-at-position'
      readonly characterId: CharacterId
      readonly positionId: PositionId
    })
  | (ClueBase & {
      readonly type: 'character-not-at-position'
      readonly characterId: CharacterId
      readonly positionId: PositionId
    })
  | (ClueBase & {
      readonly type: 'character-in-place'
      readonly characterId: CharacterId
      readonly placeId: PlaceId
    })
  | (ClueBase & {
      readonly type: 'character-not-in-place'
      readonly characterId: CharacterId
      readonly placeId: PlaceId
    })
  | (ClueBase & {
      readonly type: 'in-corner' | 'not-in-corner'
      readonly characterId: CharacterId
    })
  | (ClueBase & {
      readonly type: 'character-next-to-obstacle'
      readonly characterId: CharacterId
      readonly obstaclePositionId: PositionId
    })
  | (ClueBase & {
      readonly type:
        | 'adjacent'
        | 'not-adjacent'
        | 'same-row'
        | 'different-row'
        | 'same-column'
        | 'different-column'
      readonly firstCharacterId: CharacterId
      readonly secondCharacterId: CharacterId
    })
  | (ClueBase & {
      readonly type: 'same-floor' | 'different-floor'
      readonly firstCharacterId: CharacterId
      readonly secondCharacterId: CharacterId
    })
  | (ClueBase & {
      readonly type: 'left-of' | 'right-of' | 'above' | 'below'
      readonly firstCharacterId: CharacterId
      readonly secondCharacterId: CharacterId
    })
  | (ClueBase & {
      readonly type: 'distance'
      readonly firstCharacterId: CharacterId
      readonly secondCharacterId: CharacterId
      readonly distance: number
    })
  | (ClueBase & {
      readonly type: 'between'
      readonly characterId: CharacterId
      readonly firstCharacterId: CharacterId
      readonly secondCharacterId: CharacterId
    })
  | (ClueBase & {
      readonly type: 'has-item' | 'does-not-have-item'
      readonly characterId: CharacterId
      readonly itemId: ItemId
    })
  | (ClueBase & {
      readonly type: 'item-in-place' | 'item-not-in-place'
      readonly itemId: ItemId
      readonly placeId: PlaceId
    })

export type PartialAssignment = Readonly<Partial<Record<CharacterId, PositionId>>>
export type Assignment = Readonly<Record<CharacterId, PositionId>>

export interface PuzzleMetadata {
  readonly generatorVersion: number
  readonly solutionCount: 1
  readonly difficultyScore: number
  readonly exploredNodes: number
}

export interface Puzzle {
  readonly id: PuzzleId
  readonly seed: Seed
  readonly difficulty: Difficulty
  readonly boardMode: BoardMode
  /** The seeded visual plan used by adult and teen spatial boards. */
  readonly spatialPlanId?: string
  readonly theme: ThemeId
  readonly title: string
  readonly introduction: string
  readonly objective: string
  readonly characters: readonly Character[]
  readonly items: readonly Item[]
  readonly positions: readonly Position[]
  readonly clues: readonly Clue[]
  readonly metadata: PuzzleMetadata
}
