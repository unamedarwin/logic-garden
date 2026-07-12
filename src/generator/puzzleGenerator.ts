import { puzzleId, seed, type Difficulty, type Puzzle, type Seed } from '../domain/types'
import { analyzeSolutions } from '../solver/solver'
import { selectMinimalUniqueClues } from './clueReducer'
import { generateCandidateClues } from './clueGenerator'
import { deriveSeed, SeededRandom } from './seededRandom'
import { generateWorld } from './solutionGenerator'

export const GENERATOR_VERSION = 1
const maximumAttempts = 12

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
  return (
    puzzle.characters.length * 5 + puzzle.clues.length * 2 + negativeClues + relationalClues * 2
  )
}

export const generatePuzzle = (difficulty: Difficulty, source: Seed | string): Puzzle => {
  const originalSeed = seed(source)

  for (let attempt = 0; attempt < maximumAttempts; attempt += 1) {
    const random = new SeededRandom(deriveSeed(originalSeed, attempt))
    const world = generateWorld(difficulty, random)
    const basePuzzle: Puzzle = {
      id: puzzleId(`puzzle-${originalSeed}`),
      seed: originalSeed,
      difficulty,
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
    const clues = selectMinimalUniqueClues(
      basePuzzle,
      random.shuffle(generateCandidateClues(basePuzzle, world.solution, random)),
    )
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
  }

  throw new Error('No s’ha pogut validar una aventura nova dins del límit d’intents.')
}
