import type { PartialAssignment, Puzzle } from '../domain/types'
import { isPartialAssignmentValid, solve } from '../solver/solver'
import type { GameFeedback } from './feedback'

export interface ValidationResult {
  readonly complete: boolean
  readonly correct: boolean
  readonly feedback: GameFeedback
}

export const validateAssignment = (
  puzzle: Puzzle,
  assignment: PartialAssignment,
): ValidationResult => {
  const solution = solve(puzzle)
  const totalCount = puzzle.characters.length
  const correctCount = solution
    ? puzzle.characters.filter(
        (character) => assignment[character.id] === solution[character.id],
      ).length
    : 0
  const complete = puzzle.characters.every((character) => assignment[character.id])
  if (!complete) {
    return {
      complete: false,
      correct: false,
      feedback: { type: 'assignment-incomplete', correctCount, totalCount },
    }
  }

  if (!isPartialAssignmentValid(puzzle, assignment)) {
    return {
      complete: true,
      correct: false,
      feedback: { type: 'assignment-incorrect', correctCount, totalCount },
    }
  }

  return {
    complete: true,
    correct: true,
    feedback: { type: 'assignment-correct', correctCount, totalCount },
  }
}

export interface Hint {
  readonly clueId?: string
  readonly feedback: GameFeedback
}

export const getSolverHint = (
  puzzle: Puzzle,
  assignment: PartialAssignment,
  usedHints: number,
): Hint => {
  const solution = solve(puzzle)
  if (!solution) return { feedback: { type: 'hint-puzzle-preparing' } }

  const character = puzzle.characters.find(
    (candidate) => assignment[candidate.id] !== solution[candidate.id],
  )
  if (!character) return { feedback: { type: 'hint-ready-to-check' } }

  const clue = puzzle.clues.find((candidate) => {
    if ('characterId' in candidate && candidate.characterId === character.id) return true
    return 'firstCharacterId' in candidate && candidate.firstCharacterId === character.id
  })
  const position = puzzle.positions.find((candidate) => candidate.id === solution[character.id])
  const phase = usedHints % 3

  if (phase === 0) return { clueId: clue?.id, feedback: { type: 'hint-highlighted-clue' } }
  if (phase === 1)
    return {
      clueId: clue?.id,
      feedback: { type: 'hint-character-deducible', characterName: character.name },
    }
  return {
    clueId: clue?.id,
    feedback: {
      type: 'hint-character-position',
      characterName: character.name,
      positionLabel: position?.label ?? '',
    },
  }
}
