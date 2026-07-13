import {
  puzzleId,
  seed,
  type Audience,
  type Difficulty,
  type Puzzle,
  type Seed,
} from '../domain/types'
import { advancedPuzzleTemplates } from '../assets/generated/puzzleTemplateData'
import { analyzeSolutions } from '../solver/solver'
import { selectMinimalUniqueClues } from './clueReducer'
import { generateCandidateClues } from './clueGenerator'
import { deriveSeed, SeededRandom } from './seededRandom'
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
  ['adjacent', 'not-adjacent', 'left-of', 'right-of', 'above', 'below', 'between'].includes(
    clue.type,
  )

const difficultyScore = (puzzle: Puzzle) => {
  const negativeClues = puzzle.clues.filter(
    (clue) =>
      clue.type === 'character-not-at-position' ||
      clue.type === 'character-not-in-place' ||
      clue.type === 'not-adjacent' ||
      clue.type === 'different-row' ||
      clue.type === 'different-column' ||
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
      // Landmark clues keep each initial domain small. Exact cells are a fallback,
      // never the main clue list, so the player still has a real deduction to make.
      const maximumExactClues = Math.max(1, basePuzzle.characters.length - 1)
      const spatialFallbacks =
        world.boardMode === 'logic-grid'
          ? orderedCandidates
              .filter((clue) => clue.type === 'character-at-position')
              .slice(0, maximumExactClues)
          : []
      const spatialFallbackIds = new Set(spatialFallbacks.map((clue) => clue.id))
      const narrativeAnchors =
        world.boardMode === 'logic-grid'
          ? orderedCandidates
              .filter(isNarrativeGridClue)
              .slice(0, difficulty === 'easy' ? 1 : 2)
          : []
      const candidates =
        world.boardMode === 'logic-grid'
          ? [
              ...orderedCandidates.filter((clue) => clue.type !== 'character-at-position'),
              ...orderedCandidates.filter((clue) => spatialFallbackIds.has(clue.id)),
            ]
          : orderedCandidates
      const clues = selectMinimalUniqueClues(basePuzzle, candidates, [
        ...landmarkAnchors,
        ...narrativeAnchors,
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
): Puzzle => {
  if (audience === 'children') return generatePuzzleDirect(difficulty, source, audience)
  const templates = advancedPuzzleTemplates.filter(
    (template) =>
      template.generatorVersion === GENERATOR_VERSION &&
      template.audience === audience &&
      template.difficulty === difficulty,
  )
  if (templates.length === 0) return generatePuzzleDirect(difficulty, source, audience)

  const puzzleSeed = seed(source)
  const selector = new SeededRandom(deriveSeed(puzzleSeed, 97))
  const template = selector.pick(templates)
  try {
    return materializeAdvancedPuzzleTemplate(template, puzzleSeed)
  } catch {
    // A catalog regression must never expose an invalid puzzle to the player.
    return generatePuzzleDirect(difficulty, source, audience)
  }
}
