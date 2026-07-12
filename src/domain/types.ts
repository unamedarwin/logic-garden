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
export type BoardMode = 'map' | 'logic-grid'
export type Locale = 'ca' | 'es' | 'en'
export type Audience = 'children' | 'teens' | 'adults'
export type AvatarId = 'leaf' | 'kite' | 'music' | 'puzzle' | 'moon' | 'ball' | 'paint' | 'book'
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

export interface Character {
  readonly id: CharacterId
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly itemId: ItemId
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
  /** A visible piece of scenery occupies this grid position. */
  readonly blocked?: boolean
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
