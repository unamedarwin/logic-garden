import {
  puzzleId,
  seed,
  type Audience,
  type BuildingPlacement,
  type Clue,
  type Difficulty,
  type Puzzle,
} from '../domain/types'
import { analyzeSolutions } from '../solver/solver'
import { buildingDepthForPositions, type BuildingDepth } from '../domain/buildingPlan'
import { landmarkCandidateCount } from './landmarkDomains'
import { deriveSeed, SeededRandom } from './seededRandom'
import { generateWorld } from './solutionGenerator'

export type TemplateGridSize = 5 | 6 | 9 | 16

type TemplatePairCode = 'a' | 'A' | 'l' | 'r' | 'u' | 'd'

export type TemplateClue =
  | readonly ['p' | 'P', character: number, row: number, column: number]
  | readonly ['c' | 'C', character: number, layer: number, row: number, column: number]
  | readonly ['z' | 'Z', character: number, place: number]
  | readonly ['k' | 'K', character: number]
  | readonly ['o', character: number, row: number, column: number]
  | readonly ['i' | 'I', character: number, item: number]
  | readonly ['q' | 'Q', item: number, place: number]
  | readonly ['s' | 'S', firstCharacter: number, secondCharacter: number]
  | readonly [TemplatePairCode, firstCharacter: number, secondCharacter: number]
  | readonly ['b', character: number, firstCharacter: number, secondCharacter: number]

interface PuzzleTemplateBase {
  readonly v: 2
  readonly generatorVersion: number
  readonly id: string
  readonly audience: Exclude<Audience, 'children'>
  readonly difficulty: Difficulty
  readonly characterCount: number
  readonly clues: readonly TemplateClue[]
  readonly landmarkCandidateCounts: readonly number[]
  readonly exactClueCount: number
}

export type AdvancedPuzzleTemplate =
  | (PuzzleTemplateBase & {
      readonly boardMode: 'logic-grid'
      readonly gridSize: 6 | 9 | 16
      readonly spatialPlanId: string
    })
  | (PuzzleTemplateBase & {
      readonly boardMode: 'logic-cube'
      readonly gridSize: 5
      readonly depth: BuildingDepth
      readonly roomClues: readonly TemplateClue[]
    })

export const templateBucketKey = (template: AdvancedPuzzleTemplate) =>
  `${template.audience}:${template.difficulty}:${template.boardMode}:${template.gridSize}:${template.boardMode === 'logic-cube' ? template.depth : ''}`

export const canonicalTemplateSignature = (template: AdvancedPuzzleTemplate) =>
  JSON.stringify({
    audience: template.audience,
    boardMode: template.boardMode,
    buildingPlacement: template.boardMode === 'logic-cube' ? 'cells' : undefined,
    gridSize: template.gridSize,
    depth: template.boardMode === 'logic-cube' ? template.depth : undefined,
    spatialPlanId: template.boardMode === 'logic-grid' ? template.spatialPlanId : undefined,
    clues: [...template.clues].sort((first, second) =>
      JSON.stringify(first).localeCompare(JSON.stringify(second)),
    ),
    roomClues:
      template.boardMode === 'logic-cube'
        ? [...template.roomClues].sort((first, second) =>
            JSON.stringify(first).localeCompare(JSON.stringify(second)),
          )
        : undefined,
  })

const numericSuffix = (value: string) => {
  const match = /-(\d+)$/u.exec(value)
  if (!match) throw new Error(`Identificador estructural desconegut: ${value}`)
  return Number(match[1])
}

const positionCoordinates = (puzzle: Puzzle, positionId: string) => {
  const position = puzzle.positions.find((candidate) => candidate.id === positionId)
  if (!position) throw new Error(`Unknown structural position: ${positionId}`)
  return [position.row, position.column] as const
}

const serializeClue = (puzzle: Puzzle, clue: Clue): TemplateClue => {
  switch (clue.type) {
    case 'character-at-position': {
      const [row, column] = positionCoordinates(puzzle, clue.positionId)
      if (puzzle.boardMode === 'logic-cube') {
        const layer = puzzle.positions.find(
          (position) => position.id === clue.positionId,
        )?.layer
        if (layer === undefined) throw new Error('La casella de lâ€™edifici no tÃ© pis.')
        return ['c', numericSuffix(clue.characterId), layer, row, column]
      }
      return ['p', numericSuffix(clue.characterId), row, column]
    }
    case 'character-not-at-position': {
      const [row, column] = positionCoordinates(puzzle, clue.positionId)
      if (puzzle.boardMode === 'logic-cube') {
        const layer = puzzle.positions.find(
          (position) => position.id === clue.positionId,
        )?.layer
        if (layer === undefined) throw new Error('La casella de lâ€™edifici no tÃ© pis.')
        return ['C', numericSuffix(clue.characterId), layer, row, column]
      }
      return ['P', numericSuffix(clue.characterId), row, column]
    }
    case 'character-in-place':
      return ['z', numericSuffix(clue.characterId), numericSuffix(clue.placeId)]
    case 'character-not-in-place':
      return ['Z', numericSuffix(clue.characterId), numericSuffix(clue.placeId)]
    case 'in-corner':
      return ['k', numericSuffix(clue.characterId)]
    case 'not-in-corner':
      return ['K', numericSuffix(clue.characterId)]
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
    case 'has-item':
      return ['i', numericSuffix(clue.characterId), numericSuffix(clue.itemId)]
    case 'does-not-have-item':
      return ['I', numericSuffix(clue.characterId), numericSuffix(clue.itemId)]
    case 'item-in-place':
      return ['q', numericSuffix(clue.itemId), numericSuffix(clue.placeId)]
    case 'item-not-in-place':
      return ['Q', numericSuffix(clue.itemId), numericSuffix(clue.placeId)]
    case 'same-floor':
      return ['s', numericSuffix(clue.firstCharacterId), numericSuffix(clue.secondCharacterId)]
    case 'different-floor':
      return ['S', numericSuffix(clue.firstCharacterId), numericSuffix(clue.secondCharacterId)]
    case 'same-row':
    case 'different-row':
    case 'same-column':
    case 'different-column':
    case 'distance':
      throw new Error(`Unsupported advanced template clue: ${clue.type}`)
  }
}

export const extractAdvancedPuzzleTemplate = (
  puzzle: Puzzle,
  audience: Exclude<Audience, 'children'>,
  id: string,
): AdvancedPuzzleTemplate => {
  if (
    (puzzle.boardMode !== 'logic-grid' && puzzle.boardMode !== 'logic-cube') ||
    (puzzle.boardMode === 'logic-grid' && !puzzle.spatialPlanId)
  ) {
    throw new Error('Only spatial and building puzzles can be cataloged.')
  }

  const gridSize =
    puzzle.boardMode === 'logic-cube'
      ? Math.max(...puzzle.positions.map((position) => position.column)) + 1
      : Math.sqrt(puzzle.positions.length)
  if (gridSize !== 5 && gridSize !== 6 && gridSize !== 9 && gridSize !== 16) {
    throw new Error(`Mida espacial no admesa: ${gridSize}`)
  }

  const landmarkCandidateCounts = puzzle.clues.flatMap((clue) => {
    if (clue.type !== 'character-next-to-obstacle') return []
    const obstacle = puzzle.positions.find(
      (position) => position.id === clue.obstaclePositionId && position.blocked,
    )
    return obstacle ? [landmarkCandidateCount(puzzle.positions, obstacle)] : []
  })
  const base = {
    v: 2 as const,
    generatorVersion: puzzle.metadata.generatorVersion,
    id,
    audience,
    difficulty: puzzle.difficulty,
    characterCount: puzzle.characters.length,
    clues: puzzle.clues.map((clue) => serializeClue(puzzle, clue)),
    landmarkCandidateCounts:
      puzzle.boardMode === 'logic-cube'
        ? puzzle.characters.map(() => 5)
        : landmarkCandidateCounts,
    exactClueCount: puzzle.clues.filter((clue) => clue.type === 'character-at-position').length,
  }

  return puzzle.boardMode === 'logic-cube'
    ? {
        ...base,
        boardMode: 'logic-cube',
        gridSize: 5,
        depth: buildingDepthForPositions(puzzle.positions),
        roomClues: [],
      }
    : {
        ...base,
        boardMode: 'logic-grid',
        gridSize: gridSize as 6 | 9 | 16,
        spatialPlanId: puzzle.spatialPlanId!,
      }
}

export const withRoomTemplateClues = (
  template: AdvancedPuzzleTemplate,
  roomPuzzle: Puzzle,
): AdvancedPuzzleTemplate => {
  if (
    template.boardMode !== 'logic-cube' ||
    roomPuzzle.boardMode !== 'logic-cube' ||
    roomPuzzle.buildingPlacement !== 'rooms' ||
    buildingDepthForPositions(roomPuzzle.positions) !== template.depth ||
    roomPuzzle.characters.length !== template.characterCount
  ) {
    throw new Error('Les pistes per estances no corresponen a la plantilla 3D.')
  }
  const validation = analyzeSolutions(roomPuzzle, { limit: 2 })
  if (validation.count !== 1 || validation.reachedNodeLimit) {
    throw new Error('Room clues do not preserve a unique solution.')
  }
  const roomClues = roomPuzzle.clues.map((clue) => serializeClue(roomPuzzle, clue))
  const allowedCodes = new Set(['z', 'Z', 'a', 'A', 'u', 'd', 's', 'S'])
  if (
    roomClues.length === 0 ||
    roomClues.some(
      (clue) =>
        !allowedCodes.has(clue[0]) ||
        clue.slice(1).some((value, index) => {
          if (typeof value !== 'number' || value < 0) return true
          const isPlaceIndex = (clue[0] === 'z' || clue[0] === 'Z') && index === 1
          return !isPlaceIndex && value >= template.characterCount
        }),
    )
  ) {
    throw new Error('Room clues contain an unsupported relation.')
  }
  return {
    ...template,
    roomClues,
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
  const position = (row: number, column: number, layer?: number) => {
    const found = puzzle.positions.find(
      (candidate) =>
        candidate.row === row &&
        candidate.column === column &&
        (layer === undefined || candidate.layer === layer),
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
  const item = (itemIndex: number) => {
    const found = puzzle.items[itemIndex]
    if (!found) throw new Error(`Objecte de plantilla desconegut: ${itemIndex}`)
    return found.id
  }
  const base = { id: `template-clue-${index}`, phraseVariant: random.integer(0, 2) }

  switch (clue[0]) {
    case 'p': {
      const characterId = character(clue[1])
      return {
        ...base,
        type: 'character-at-position',
        characterId,
        positionId: position(clue[2], clue[3]),
      }
    }
    case 'P': {
      const characterId = character(clue[1])
      return {
        ...base,
        type: 'character-not-at-position',
        characterId,
        positionId: position(clue[2], clue[3]),
      }
    }
    case 'c':
      return {
        ...base,
        type: 'character-at-position',
        characterId: character(clue[1]),
        positionId: position(clue[3], clue[4], clue[2]),
      }
    case 'C':
      return {
        ...base,
        type: 'character-not-at-position',
        characterId: character(clue[1]),
        positionId: position(clue[3], clue[4], clue[2]),
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
    case 'k':
      return { ...base, type: 'in-corner', characterId: character(clue[1]) }
    case 'K':
      return { ...base, type: 'not-in-corner', characterId: character(clue[1]) }
    case 'o':
      return {
        ...base,
        type: 'character-next-to-obstacle',
        characterId: character(clue[1]),
        obstaclePositionId: position(clue[2], clue[3]),
      }
    case 'i':
      return {
        ...base,
        type: 'has-item',
        characterId: character(clue[1]),
        itemId: item(clue[2]),
      }
    case 'I':
      return {
        ...base,
        type: 'does-not-have-item',
        characterId: character(clue[1]),
        itemId: item(clue[2]),
      }
    case 'q':
      return { ...base, type: 'item-in-place', itemId: item(clue[1]), placeId: place(clue[2]) }
    case 'Q':
      return {
        ...base,
        type: 'item-not-in-place',
        itemId: item(clue[1]),
        placeId: place(clue[2]),
      }
    case 's':
      return {
        ...base,
        type: 'same-floor',
        firstCharacterId: character(clue[1]),
        secondCharacterId: character(clue[2]),
      }
    case 'S':
      return {
        ...base,
        type: 'different-floor',
        firstCharacterId: character(clue[1]),
        secondCharacterId: character(clue[2]),
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
  buildingPlacement: BuildingPlacement = 'cells',
): Puzzle => {
  if (template.boardMode !== 'logic-cube' && buildingPlacement !== 'cells') {
    throw new Error('El mode per estances nomÃƒÂ©s ÃƒÂ©s compatible amb edificis 3D.')
  }
  const templateClues =
    template.boardMode === 'logic-cube' && buildingPlacement === 'rooms'
      ? template.roomClues
      : template.clues
  if (!templateClues?.length) {
    throw new Error(`La plantilla ${template.id} no contÃƒÂ© pistes per al mode demanat.`)
  }
  const puzzleSeed = seed(source)
  const random = new SeededRandom(deriveSeed(puzzleSeed, 41))
  const world = generateWorld(
    template.difficulty,
    random,
    template.audience,
    template.boardMode === 'logic-cube'
      ? {
          boardMode: 'logic-cube',
          gridSize: 5,
          depth: template.depth,
          characterCount: 8,
          buildingPlacement,
        }
      : {
          boardMode: 'logic-grid',
          gridSize: template.gridSize,
          characterCount: template.characterCount,
          spatialPlanId: template.spatialPlanId,
        },
  )
  const shell: Puzzle = {
    id: puzzleId(`puzzle-${puzzleSeed}-${template.id}`),
    seed: puzzleSeed,
    difficulty: template.difficulty,
    boardMode: template.boardMode,
    buildingPlacement: template.boardMode === 'logic-cube' ? buildingPlacement : undefined,
    spatialPlanId: template.boardMode === 'logic-grid' ? template.spatialPlanId : undefined,
    theme: world.theme.id,
    title:
      world.boardMode === 'logic-cube'
        ? (world.theme.buildingTitle ?? world.theme.title)
        : world.theme.title,
    introduction: random.pick(
      world.boardMode === 'logic-cube'
        ? (world.theme.buildingIntroductions ?? world.theme.introductions)
        : world.theme.introductions,
    ),
    objective: random.pick(
      world.boardMode === 'logic-cube'
        ? (world.theme.buildingObjectives ?? world.theme.objectives)
        : world.theme.objectives,
    ),
    characters: world.characters,
    items: world.items,
    positions: world.positions,
    clues: [],
    metadata: {
      generatorVersion: template.generatorVersion,
      solutionCount: 1,
      difficultyScore:
        templateClues.length * 2 +
        template.characterCount * 5 +
        template.landmarkCandidateCounts.reduce((total, count) => total + count, 0),
      exploredNodes: 0,
    },
  }
  const puzzle = {
    ...shell,
    clues: templateClues.map((clue, index) => materializeClue(shell, clue, index, random)),
  }
  const validation = analyzeSolutions(puzzle, { limit: 2 })
  if (validation.count !== 1 || validation.reachedNodeLimit) {
    throw new Error(`Template ${template.id} does not preserve a unique solution.`)
  }
  return {
    ...puzzle,
    metadata: { ...puzzle.metadata, exploredNodes: validation.exploredNodes },
  }
}
