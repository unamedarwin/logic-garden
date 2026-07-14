import type { PartialAssignment, Puzzle } from '../domain/types'
import { analyzeSolutions, isCompleteAssignmentSatisfyingPuzzle, solve } from '../solver/solver'
import type { GameFeedback } from './feedback'

export interface ValidationResult {
  readonly complete: boolean
  readonly correct: boolean
  readonly feedback: GameFeedback
}

const maximumExtendablePlacementCount = (puzzle: Puzzle, assignment: PartialAssignment) => {
  const placements = puzzle.characters.flatMap((character) => {
    const positionId = assignment[character.id]
    return positionId === undefined ? [] : [[character.id, positionId] as const]
  })

  const hasExtendableSubset = (
    targetSize: number,
    startIndex = 0,
    partial: PartialAssignment = {},
  ): boolean => {
    const selectedCount = Object.keys(partial).length
    if (selectedCount === targetSize) {
      return analyzeSolutions(puzzle, { limit: 1, partial }).count === 1
    }
    const remainingNeeded = targetSize - selectedCount
    for (let index = startIndex; index <= placements.length - remainingNeeded; index += 1) {
      const placement = placements[index]
      if (
        placement &&
        hasExtendableSubset(targetSize, index + 1, {
          ...partial,
          [placement[0]]: placement[1],
        })
      ) {
        return true
      }
    }
    return false
  }

  for (let size = placements.length; size > 0; size -= 1) {
    if (hasExtendableSubset(size)) return size
  }
  return 0
}

export const validateAssignment = (
  puzzle: Puzzle,
  assignment: PartialAssignment,
): ValidationResult => {
  const totalCount = puzzle.characters.length
  const complete = puzzle.characters.every(
    (character) => assignment[character.id] !== undefined,
  )
  const correct = complete && isCompleteAssignmentSatisfyingPuzzle(puzzle, assignment)
  const correctCount = correct
    ? totalCount
    : maximumExtendablePlacementCount(puzzle, assignment)
  if (!complete) {
    return {
      complete: false,
      correct: false,
      feedback: { type: 'assignment-incomplete', correctCount, totalCount },
    }
  }

  if (!correct) {
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
