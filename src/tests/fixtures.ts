import {
  characterId,
  itemId,
  placeId,
  positionId,
  puzzleId,
  seed,
  type Assignment,
  type Clue,
  type Puzzle,
} from '../domain/types'

export const characterIds = {
  a: characterId('a'),
  b: characterId('b'),
  c: characterId('c'),
  d: characterId('d'),
} as const

export const positionIds = {
  p0: positionId('p0'),
  p1: positionId('p1'),
  p2: positionId('p2'),
  p3: positionId('p3'),
} as const

export const fullAssignment: Assignment = {
  [characterIds.a]: positionIds.p0,
  [characterIds.b]: positionIds.p1,
  [characterIds.c]: positionIds.p2,
  [characterIds.d]: positionIds.p3,
}

export const createPuzzle = (clues: readonly Clue[] = []): Puzzle => ({
  id: puzzleId('fixture'),
  seed: seed('fixture'),
  difficulty: 'easy',
  theme: 'forest-party',
  title: 'Fixture',
  introduction: 'A friendly fixture.',
  objective: 'Find every place.',
  characters: [
    {
      id: characterIds.a,
      name: 'Aina',
      emoji: '🦊',
      description: 'friend',
      itemId: itemId('i0'),
    },
    {
      id: characterIds.b,
      name: 'Biel',
      emoji: '🐻',
      description: 'friend',
      itemId: itemId('i1'),
    },
    {
      id: characterIds.c,
      name: 'Cora',
      emoji: '🐰',
      description: 'friend',
      itemId: itemId('i2'),
    },
    {
      id: characterIds.d,
      name: 'Duna',
      emoji: '🦉',
      description: 'friend',
      itemId: itemId('i3'),
    },
  ],
  items: [
    { id: itemId('i0'), label: 'flor', emoji: '🌼' },
    { id: itemId('i1'), label: 'llibre', emoji: '📘' },
    { id: itemId('i2'), label: 'poma', emoji: '🍎' },
    { id: itemId('i3'), label: 'estrella', emoji: '⭐' },
  ],
  positions: [
    { id: positionIds.p0, placeId: placeId('place0'), row: 0, column: 0, label: 'A' },
    { id: positionIds.p1, placeId: placeId('place1'), row: 0, column: 1, label: 'B' },
    { id: positionIds.p2, placeId: placeId('place2'), row: 1, column: 0, label: 'C' },
    { id: positionIds.p3, placeId: placeId('place3'), row: 1, column: 1, label: 'D' },
  ],
  clues,
  metadata: { generatorVersion: 1, solutionCount: 1, difficultyScore: 0, exploredNodes: 0 },
})
