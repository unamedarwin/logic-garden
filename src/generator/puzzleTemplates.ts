import {
  puzzleId,
  seed,
  type Audience,
  type Clue,
  type Difficulty,
  type Puzzle,
} from '../domain/types'
import { analyzeSolutions } from '../solver/solver'
import { landmarkCandidateCount } from './landmarkDomains'
import { deriveSeed, SeededRandom } from './seededRandom'
import { generateWorld } from './solutionGenerator'

export type TemplateGridSize = 6 | 9 | 16

type TemplatePairCode = 'a' | 'A' | 'l' | 'r' | 'u' | 'd'

export type TemplateClue =
  | readonly ['p' | 'P', character: number, row: number, column: number]
  | readonly ['z' | 'Z', character: number, place: number]
  | readonly ['o', character: number, row: number, column: number]
  | readonly [TemplatePairCode, firstCharacter: number, secondCharacter: number]
  | readonly ['b', character: number, firstCharacter: number, secondCharacter: number]

export interface AdvancedPuzzleTemplate {
  readonly v: 1
  readonly generatorVersion: number
  readonly id: string
  readonly audience: Exclude<Audience, 'children'>
  readonly difficulty: Difficulty
  readonly gridSize: TemplateGridSize
  readonly characterCount: number
  readonly spatialPlanId: string
  readonly clues: readonly TemplateClue[]
  readonly landmarkCandidateCounts: readonly number[]
  readonly exactClueCount: number
}

const numericSuffix = (value: string) => {
  const match = /-(\d+)$/u.exec(value)
  if (!match) throw new Error(`Identificador estructural desconegut: ${value}`)
  return Number(match[1])
}

const positionCoordinates = (puzzle: Puzzle, positionId: string) => {
  const position = puzzle.positions.find((candidate) => candidate.id === positionId)
  if (!position) throw new Error(`Posició estructural desconeguda: ${positionId}`)
  return [position.row, position.column] as const
}

const serializeClue = (puzzle: Puzzle, clue: Clue): TemplateClue => {
  switch (clue.type) {
    case 'character-at-position': {
      const [row, column] = positionCoordinates(puzzle, clue.positionId)
      return ['p', numericSuffix(clue.characterId), row, column]
    }
    case 'character-not-at-position': {
      const [row, column] = positionCoordinates(puzzle, clue.positionId)
      return ['P', numericSuffix(clue.characterId), row, column]
    }
    case 'character-in-place':
      return ['z', numericSuffix(clue.characterId), numericSuffix(clue.placeId)]
    case 'character-not-in-place':
      return ['Z', numericSuffix(clue.characterId), numericSuffix(clue.placeId)]
    case 'character-next-to-obstacle': {
      const [row, column] = positionCoordinates(puzzle, clue.obstaclePositionId)
      return ['o', numericSuffix(clue.characterId), row, column]
    }
    case 'adjacent':
      return ['a', numericSuffix(clue.firstCharacterId), numericSuffix(clue.secondCharacterId)]
    case 'not-adjacent':
      return ['A', numericSuffix(clue.firstCharacterId), numericSuffix(clue.secondCharacterId)]
    case 'left-of':
      return ['l', numericSuffix(clue.firstCharacterId), numericSuffix(clue.secondCharacterId)]
    case 'right-of':
      return ['r', numericSuffix(clue.firstCharacterId), numericSuffix(clue.secondCharacterId)]
    case 'above':
      return ['u', numericSuffix(clue.firstCharacterId), numericSuffix(clue.secondCharacterId)]
    case 'below':
      return ['d', numericSuffix(clue.firstCharacterId), numericSuffix(clue.secondCharacterId)]
    case 'between':
      return [
        'b',
        numericSuffix(clue.characterId),
        numericSuffix(clue.firstCharacterId),
        numericSuffix(clue.secondCharacterId),
      ]
    case 'same-row':
    case 'different-row':
    case 'same-column':
    case 'different-column':
    case 'distance':
    case 'has-item':
    case 'does-not-have-item':
      throw new Error(`Pista no admesa en una plantilla espacial: ${clue.type}`)
  }
}

export const extractAdvancedPuzzleTemplate = (
  puzzle: Puzzle,
  audience: Exclude<Audience, 'children'>,
  id: string,
): AdvancedPuzzleTemplate => {
  if (puzzle.boardMode !== 'logic-grid' || !puzzle.spatialPlanId) {
    throw new Error('Només es poden catalogar puzzles espacials.')
  }
  const gridSize = Math.sqrt(puzzle.positions.length)
  if (gridSize !== 6 && gridSize !== 9 && gridSize !== 16) {
    throw new Error(`Mida espacial no admesa: ${gridSize}`)
  }
  const landmarkCandidateCounts = puzzle.clues.flatMap((clue) => {
    if (clue.type !== 'character-next-to-obstacle') return []
    const obstacle = puzzle.positions.find(
      (position) => position.id === clue.obstaclePositionId && position.blocked,
    )
    return obstacle ? [landmarkCandidateCount(puzzle.positions, obstacle)] : []
  })

  return {
    v: 1,
    generatorVersion: puzzle.metadata.generatorVersion,
    id,
    audience,
    difficulty: puzzle.difficulty,
    gridSize,
    characterCount: puzzle.characters.length,
    spatialPlanId: puzzle.spatialPlanId,
    clues: puzzle.clues.map((clue) => serializeClue(puzzle, clue)),
    landmarkCandidateCounts,
    exactClueCount: puzzle.clues.filter((clue) => clue.type === 'character-at-position').length,
  }
}

const pairTypes: Record<
  TemplatePairCode,
  'adjacent' | 'not-adjacent' | 'left-of' | 'right-of' | 'above' | 'below'
> = {
  a: 'adjacent',
  A: 'not-adjacent',
  l: 'left-of',
  r: 'right-of',
  u: 'above',
  d: 'below',
}

const materializeClue = (
  puzzle: Puzzle,
  clue: TemplateClue,
  index: number,
  random: SeededRandom,
): Clue => {
  const character = (characterIndex: number) => {
    const found = puzzle.characters[characterIndex]
    if (!found) throw new Error(`Personatge de plantilla desconegut: ${characterIndex}`)
    return found.id
  }
  const position = (row: number, column: number) => {
    const found = puzzle.positions.find(
      (candidate) => candidate.row === row && candidate.column === column,
    )
    if (!found) throw new Error(`Casella de plantilla desconeguda: ${row}.${column}`)
    return found.id
  }
  const place = (placeIndex: number) => {
    const found = puzzle.positions.find(
      (candidate) => candidate.placeId === `place-${placeIndex}`,
    )
    if (!found) throw new Error(`Sala de plantilla desconeguda: ${placeIndex}`)
    return found.placeId
  }
  const base = { id: `template-clue-${index}`, phraseVariant: random.integer(0, 2) }

  switch (clue[0]) {
    case 'p':
      return {
        ...base,
        type: 'character-at-position',
        characterId: character(clue[1]),
        positionId: position(clue[2], clue[3]),
      }
    case 'P':
      return {
        ...base,
        type: 'character-not-at-position',
        characterId: character(clue[1]),
        positionId: position(clue[2], clue[3]),
      }
    case 'z':
      return {
        ...base,
        type: 'character-in-place',
        characterId: character(clue[1]),
        placeId: place(clue[2]),
      }
    case 'Z':
      return {
        ...base,
        type: 'character-not-in-place',
        characterId: character(clue[1]),
        placeId: place(clue[2]),
      }
    case 'o':
      return {
        ...base,
        type: 'character-next-to-obstacle',
        characterId: character(clue[1]),
        obstaclePositionId: position(clue[2], clue[3]),
      }
    case 'b':
      return {
        ...base,
        type: 'between',
        characterId: character(clue[1]),
        firstCharacterId: character(clue[2]),
        secondCharacterId: character(clue[3]),
      }
    case 'a':
    case 'A':
    case 'l':
    case 'r':
    case 'u':
    case 'd':
      return {
        ...base,
        type: pairTypes[clue[0]],
        firstCharacterId: character(clue[1]),
        secondCharacterId: character(clue[2]),
      }
  }
}

export const materializeAdvancedPuzzleTemplate = (
  template: AdvancedPuzzleTemplate,
  source: string,
): Puzzle => {
  const puzzleSeed = seed(source)
  const random = new SeededRandom(deriveSeed(puzzleSeed, 41))
  const world = generateWorld(template.difficulty, random, template.audience, {
    gridSize: template.gridSize,
    characterCount: template.characterCount,
    spatialPlanId: template.spatialPlanId,
  })
  const shell: Puzzle = {
    id: puzzleId(`puzzle-${puzzleSeed}-${template.id}`),
    seed: puzzleSeed,
    difficulty: template.difficulty,
    boardMode: 'logic-grid',
    spatialPlanId: template.spatialPlanId,
    theme: world.theme.id,
    title: world.theme.title,
    introduction: random.pick(world.theme.introductions),
    objective: random.pick(world.theme.objectives),
    characters: world.characters,
    items: world.items,
    positions: world.positions,
    clues: [],
    metadata: {
      generatorVersion: template.generatorVersion,
      solutionCount: 1,
      difficultyScore:
        template.clues.length * 2 +
        template.characterCount * 5 +
        template.landmarkCandidateCounts.reduce((total, count) => total + count, 0),
      exploredNodes: 0,
    },
  }
  const puzzle = {
    ...shell,
    clues: template.clues.map((clue, index) => materializeClue(shell, clue, index, random)),
  }
  const validation = analyzeSolutions(puzzle, { limit: 2 })
  if (validation.count !== 1 || validation.reachedNodeLimit) {
    throw new Error(`La plantilla ${template.id} no conserva una solució única.`)
  }
  return {
    ...puzzle,
    metadata: { ...puzzle.metadata, exploredNodes: validation.exploredNodes },
  }
}
