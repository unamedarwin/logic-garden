import {
  puzzleId,
  seed,
  type Audience,
  type Difficulty,
  type Puzzle,
  type PuzzleCollection,
  type PuzzleVariant,
  type Seed,
} from '../domain/types'
import { advancedPuzzleTemplates } from '../assets/generated/puzzleTemplateData'
import { BUILDING_DEPTHS } from '../domain/buildingPlan'
import { spatialPlanIdsForAudience } from '../domain/spatialPlan'
import { analyzeSolutions } from '../solver/solver'
import { selectMinimalUniqueClues } from './clueReducer'
import { generateCandidateClues } from './clueGenerator'
import { deriveSeed, SeededRandom } from './seededRandom'
import { logicGridCharacterCounts } from './difficulty'
import { generateWorld, type AdvancedWorldStructure } from './solutionGenerator'
import { materializeAdvancedPuzzleTemplate } from './puzzleTemplates'
import { GENERATOR_VERSION } from './version'

export { GENERATOR_VERSION } from './version'
// Try three deterministic batches before giving up. This absorbs discarded
// geometries without turning an impossible candidate into a visible puzzle.
const maximumAttempts = 36

const isRecoverableGenerationError = (error: unknown) =>
  error instanceof Error && error.message.startsWith('No s’ha pogut')

const isNarrativeGridClue = (clue: Puzzle['clues'][number]) =>
  [
    'adjacent',
    'not-adjacent',
    'left-of',
    'right-of',
    'above',
    'below',
    'between',
    'same-floor',
    'different-floor',
  ].includes(clue.type)

const difficultyScore = (puzzle: Puzzle) => {
  const negativeClues = puzzle.clues.filter(
    (clue) =>
      clue.type === 'character-not-at-position' ||
      clue.type === 'character-not-in-place' ||
      clue.type === 'not-adjacent' ||
      clue.type === 'different-row' ||
      clue.type === 'different-column' ||
      clue.type === 'different-floor' ||
      clue.type === 'not-in-corner' ||
      clue.type === 'does-not-have-item',
  ).length
  const relationalClues = puzzle.clues.filter((clue) =>
    [
      'adjacent',
      'not-adjacent',
      'same-row',
      'different-row',
      'same-column',
      'different-column',
      'left-of',
      'right-of',
      'above',
      'below',
      'distance',
      'between',
      'same-floor',
      'different-floor',
    ].includes(clue.type),
  ).length
  const landmarkClues = puzzle.clues.filter(
    (clue) => clue.type === 'character-next-to-obstacle',
  ).length
  return (
    puzzle.characters.length * 5 +
    puzzle.clues.length * 2 +
    negativeClues +
    relationalClues * 2 +
    landmarkClues
  )
}

export const generatePuzzleDirect = (
  difficulty: Difficulty,
  source: Seed | string,
  audience: Audience = 'children',
  structure?: AdvancedWorldStructure,
): Puzzle => {
  const originalSeed = seed(source)

  for (let attempt = 0; attempt < maximumAttempts; attempt += 1) {
    try {
      const random = new SeededRandom(deriveSeed(originalSeed, attempt))
      const world = generateWorld(difficulty, random, audience, structure)
      const basePuzzle: Puzzle = {
        id: puzzleId(`puzzle-${originalSeed}`),
        seed: originalSeed,
        difficulty,
        boardMode: world.boardMode,
        spatialPlanId: world.spatialPlanId,
        theme: world.theme.id,
        title: world.theme.title,
        introduction: random.pick(world.theme.introductions),
        objective: random.pick(world.theme.objectives),
        characters: world.characters,
        items: world.items,
        positions: world.positions,
        clues: [],
        metadata: {
          generatorVersion: GENERATOR_VERSION,
          solutionCount: 1,
          difficultyScore: 0,
          exploredNodes: 0,
        },
      }
      const shuffledCandidates = random.shuffle(
        generateCandidateClues(basePuzzle, world.solution, random),
      )
      const orderedCandidates = (() => {
        if (world.boardMode === 'logic-cube') {
          return [
            ...shuffledCandidates.filter((clue) => clue.type === 'same-floor'),
            ...shuffledCandidates.filter(
              (clue) => clue.type === 'above' || clue.type === 'below',
            ),
            ...shuffledCandidates.filter((clue) => clue.type === 'adjacent'),
            ...shuffledCandidates.filter((clue) => !isNarrativeGridClue(clue)),
          ]
        }
        if (world.boardMode !== 'logic-grid') return shuffledCandidates
        const landmarkCandidates = shuffledCandidates.filter(
          (clue) => clue.type === 'character-next-to-obstacle',
        )
        const landmarkCandidateIds = new Set(landmarkCandidates.map((clue) => clue.id))
        const narrativeCandidates = shuffledCandidates.filter(isNarrativeGridClue)
        const earlyNarrative = narrativeCandidates.slice(0, 2)
        const remainingCandidates = shuffledCandidates.filter(
          (clue) =>
            !landmarkCandidateIds.has(clue.id) &&
            !earlyNarrative.some((candidate) => candidate.id === clue.id),
        )
        return [...landmarkCandidates, ...earlyNarrative, ...remainingCandidates]
      })()
      const landmarkAnchors =
        world.boardMode === 'logic-grid'
          ? orderedCandidates.filter((clue) => clue.type === 'character-next-to-obstacle')
          : []
      const cubeAnchors =
        world.boardMode === 'logic-cube'
          ? [
              ...orderedCandidates.filter(
                (clue) =>
                  clue.type === 'character-at-position' &&
                  world.positions.find((position) => position.id === clue.positionId)
                    ?.buildingKind === 'shop',
              ),
              ...orderedCandidates.filter((clue) => clue.type === 'same-floor').slice(0, 1),
              ...orderedCandidates
                .filter((clue) => clue.type === 'above' || clue.type === 'below')
                .slice(0, 1),
              ...orderedCandidates.filter((clue) => clue.type === 'adjacent').slice(0, 1),
            ]
          : []
      // Landmark clues keep each initial domain small. Exact cells are a fallback,
      // never the main clue list, so the player still has a real deduction to make.
      const maximumExactClues = Math.max(1, basePuzzle.characters.length - 1)
      const shopExactCandidates = orderedCandidates.filter(
        (clue) =>
          clue.type === 'character-at-position' &&
          world.positions.find((position) => position.id === clue.positionId)?.buildingKind ===
            'shop',
      )
      const shopExactIds = new Set(shopExactCandidates.map((clue) => clue.id))
      const spatialFallbacks =
        world.boardMode === 'logic-grid' || world.boardMode === 'logic-cube'
          ? [
              ...shopExactCandidates,
              ...orderedCandidates.filter(
                (clue) => clue.type === 'character-at-position' && !shopExactIds.has(clue.id),
              ),
            ].slice(0, maximumExactClues)
          : []
      const spatialFallbackIds = new Set(spatialFallbacks.map((clue) => clue.id))
      const narrativeAnchors =
        world.boardMode === 'logic-grid'
          ? orderedCandidates
              .filter(isNarrativeGridClue)
              .slice(0, difficulty === 'easy' ? 1 : 2)
          : []
      const cornerAnchors =
        world.boardMode !== 'map' && random.next() < 0.4
          ? orderedCandidates
              .filter((clue) => clue.type === 'in-corner' || clue.type === 'not-in-corner')
              .slice(0, 1)
          : []
      const candidates =
        world.boardMode === 'logic-grid' || world.boardMode === 'logic-cube'
          ? [
              ...orderedCandidates.filter((clue) => clue.type !== 'character-at-position'),
              ...orderedCandidates.filter((clue) => spatialFallbackIds.has(clue.id)),
            ]
          : orderedCandidates
      const clues = selectMinimalUniqueClues(basePuzzle, candidates, [
        ...landmarkAnchors,
        ...narrativeAnchors,
        ...cubeAnchors,
        ...cornerAnchors,
      ])
      const candidate: Puzzle = {
        ...basePuzzle,
        clues,
        metadata: {
          ...basePuzzle.metadata,
          difficultyScore: difficultyScore({ ...basePuzzle, clues }),
        },
      }
      const validation = analyzeSolutions(candidate, { limit: 2 })

      if (validation.count === 1 && !validation.reachedNodeLimit) {
        return {
          ...candidate,
          metadata: { ...candidate.metadata, exploredNodes: validation.exploredNodes },
        }
      }
    } catch (error) {
      if (!isRecoverableGenerationError(error)) throw error
    }
  }

  throw new Error('No s’ha pogut validar una aventura nova dins del límit d’intents.')
}

export const generatePuzzle = (
  difficulty: Difficulty,
  source: Seed | string,
  audience: Audience = 'children',
  variant: PuzzleVariant = 'spatial',
): Puzzle => {
  if (audience === 'children') return generatePuzzleDirect(difficulty, source, audience)

  const puzzleSeed = seed(source)
  const templates = advancedTemplateCandidates(difficulty, puzzleSeed, audience, variant)
  for (const template of templates) {
    try {
      return materializeAdvancedPuzzleTemplate(template, puzzleSeed)
    } catch {
      // Try another structure of the same independently selected size.
    }
  }

  if (variant === 'cube') {
    const buildingDepth = new SeededRandom(deriveSeed(puzzleSeed, 97)).pick(BUILDING_DEPTHS)
    return generatePuzzleDirect('hard', source, audience, {
      boardMode: 'logic-cube',
      gridSize: 5,
      depth: buildingDepth,
      characterCount: 8,
    })
  }

  const fallbackRandom = new SeededRandom(deriveSeed(puzzleSeed, 101))
  const fallbackSizes = fallbackRandom.shuffle(advancedGridSizes)
  const plans = fallbackRandom.shuffle(spatialPlanIdsForAudience(audience))
  for (const gridSize of fallbackSizes) {
    const spatialPlanId = plans[gridSize % plans.length]
    if (!spatialPlanId) continue
    try {
      return generatePuzzleDirect(difficulty, source, audience, {
        gridSize,
        characterCount: Math.min(gridSize, logicGridCharacterCounts[difficulty]),
        spatialPlanId,
      })
    } catch {
      // Keep the fallback independent from difficulty by trying every grid size.
    }
  }
  throw new Error('No s’ha pogut validar cap estructura espacial per a aquesta llavor.')
}

export const audienceForPuzzleCollection = (
  collection: PuzzleCollection,
  source: Seed | string,
): Audience => {
  if (collection === 'children') return 'children'
  const selector = new SeededRandom(deriveSeed(seed(source), 211))
  return selector.pick(['teens', 'adults'] as const)
}

export const generatePuzzleForCollection = (
  difficulty: Difficulty,
  source: Seed | string,
  collection: PuzzleCollection,
) => {
  const audience = audienceForPuzzleCollection(collection, source)
  return generatePuzzle(
    collection === 'three-dimensional' ? 'hard' : difficulty,
    source,
    audience,
    collection === 'three-dimensional' ? 'cube' : 'spatial',
  )
}

const advancedGridSizes = [6, 9, 16] as const

const advancedTemplateCandidates = (
  difficulty: Difficulty,
  puzzleSeed: Seed,
  audience: Exclude<Audience, 'children'>,
  variant: PuzzleVariant,
) => {
  const templates = advancedPuzzleTemplates.filter(
    (template) =>
      template.generatorVersion === GENERATOR_VERSION &&
      template.audience === audience &&
      template.difficulty === difficulty &&
      template.boardMode === (variant === 'cube' ? 'logic-cube' : 'logic-grid'),
  )
  if (templates.length === 0) return []
  const selector = new SeededRandom(deriveSeed(puzzleSeed, 97))
  if (variant === 'cube') {
    const availableDepths = BUILDING_DEPTHS.filter((depth) =>
      templates.some(
        (template) => template.boardMode === 'logic-cube' && template.depth === depth,
      ),
    )
    if (availableDepths.length === 0) return []
    const selectedDepth = selector.pick(availableDepths)
    return selector.shuffle(
      templates.filter(
        (template) => template.boardMode === 'logic-cube' && template.depth === selectedDepth,
      ),
    )
  }
  const availableSizes = advancedGridSizes.filter((gridSize) =>
    templates.some((template) => template.gridSize === gridSize),
  )
  if (availableSizes.length === 0) return []
  const selectedSize = selector.pick(availableSizes)
  return selector.shuffle(templates.filter((template) => template.gridSize === selectedSize))
}

export const selectAdvancedPuzzleTemplate = (
  difficulty: Difficulty,
  source: Seed | string,
  audience: Exclude<Audience, 'children'>,
  variant: PuzzleVariant = 'spatial',
) => advancedTemplateCandidates(difficulty, seed(source), audience, variant)[0] ?? null
