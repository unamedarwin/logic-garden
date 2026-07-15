import type {
  Assignment,
  CharacterId,
  PartialAssignment,
  PositionId,
  Puzzle,
} from '../domain/types'
import { isPartialAssignmentValid } from './constraintEvaluator'
import { solve } from './solver'

export interface DeductionTraceStep {
  readonly index: number
  readonly characterId: CharacterId
  readonly candidateCount: number
  readonly forced: boolean
  readonly chosenPositionId: PositionId
}

export interface DeductionTrace {
  readonly steps: readonly DeductionTraceStep[]
  readonly initialCandidateCounts: Readonly<Record<CharacterId, number>>
  readonly initialAverageCandidateCount: number
  readonly initialMaximumCandidateCount: number
  readonly initialForcedCharacterCount: number
  readonly averageClueInterpretationLoad: number
  readonly firstStepCandidateCount: number
  readonly forcedMoveCount: number
  readonly branchingMoveCount: number
  readonly maximumCandidateCount: number
  readonly averageCandidateCount: number
}

const locallyValidCandidates = (
  puzzle: Puzzle,
  assignment: PartialAssignment,
  characterId: CharacterId,
) => {
  const usedPositions = new Set(Object.values(assignment))
  return puzzle.positions
    .filter((position) => !position.blocked && !usedPositions.has(position.id))
    .filter((position) =>
      isPartialAssignmentValid(puzzle, {
        ...assignment,
        [characterId]: position.id,
      }),
    )
    .map((position) => position.id)
}

const clueInterpretationLoad = (clue: Puzzle['clues'][number]) => {
  switch (clue.type) {
    case 'character-at-position':
      return 0
    case 'character-in-place':
    case 'character-next-to-obstacle':
    case 'in-corner':
      return 1
    case 'character-not-at-position':
    case 'character-not-in-place':
    case 'not-in-corner':
    case 'has-item':
    case 'item-in-place':
      return 1.5
    case 'does-not-have-item':
    case 'item-not-in-place':
      return 2
    case 'adjacent':
    case 'same-row':
    case 'same-column':
    case 'left-of':
    case 'right-of':
    case 'above':
    case 'below':
    case 'same-floor':
      return 2
    case 'not-adjacent':
    case 'different-row':
    case 'different-column':
    case 'different-floor':
    case 'distance':
      return 2.5
    case 'between':
      return 3
  }
}

/**
 * Builds a deterministic, idealized trace of locally visible deductions.
 *
 * When no character is forced, the trace follows the puzzle's verified unique
 * solution. This makes difficulty comparable without pretending to model a
 * particular player's reasoning or exposing the trace to gameplay.
 */
export const analyzeDeductionTrace = (puzzle: Puzzle): DeductionTrace => {
  const solution = solve(puzzle)
  if (!solution) throw new Error('No es pot traçar un puzzle sense solució.')

  let assignment: PartialAssignment = {}
  const steps: DeductionTraceStep[] = []
  const initialCandidateCounts = Object.fromEntries(
    puzzle.characters.map((character) => [
      character.id,
      locallyValidCandidates(puzzle, assignment, character.id).length,
    ]),
  ) as Readonly<Record<CharacterId, number>>
  const initialCounts = Object.values(initialCandidateCounts)

  while (steps.length < puzzle.characters.length) {
    const choices = puzzle.characters
      .filter((character) => assignment[character.id] === undefined)
      .map((character) => ({
        characterId: character.id,
        candidates: locallyValidCandidates(puzzle, assignment, character.id),
      }))
      .sort(
        (first, second) =>
          first.candidates.length - second.candidates.length ||
          first.characterId.localeCompare(second.characterId),
      )
    const choice = choices[0]
    if (!choice || choice.candidates.length === 0) {
      throw new Error('La traça de deducció ha trobat un domini buit.')
    }
    const chosenPositionId = solution[choice.characterId]
    if (!choice.candidates.includes(chosenPositionId)) {
      throw new Error('La solució única no pertany al domini local de la traça.')
    }
    steps.push({
      index: steps.length,
      characterId: choice.characterId,
      candidateCount: choice.candidates.length,
      forced: choice.candidates.length === 1,
      chosenPositionId,
    })
    assignment = { ...assignment, [choice.characterId]: chosenPositionId }
  }

  const candidateTotal = steps.reduce((total, step) => total + step.candidateCount, 0)
  const forcedMoveCount = steps.filter((step) => step.forced).length
  return {
    steps,
    initialCandidateCounts,
    initialAverageCandidateCount:
      initialCounts.reduce((total, count) => total + count, 0) /
      Math.max(1, initialCounts.length),
    initialMaximumCandidateCount: Math.max(...initialCounts),
    initialForcedCharacterCount: initialCounts.filter((count) => count === 1).length,
    averageClueInterpretationLoad:
      puzzle.clues.reduce((total, clue) => total + clueInterpretationLoad(clue), 0) /
      Math.max(1, puzzle.clues.length),
    firstStepCandidateCount: steps[0]?.candidateCount ?? 0,
    forcedMoveCount,
    branchingMoveCount: steps.length - forcedMoveCount,
    maximumCandidateCount: Math.max(...steps.map((step) => step.candidateCount)),
    averageCandidateCount: steps.length === 0 ? 0 : candidateTotal / steps.length,
  }
}

export const assignmentFromDeductionTrace = (trace: DeductionTrace): Assignment =>
  Object.fromEntries(
    trace.steps.map((step) => [step.characterId, step.chosenPositionId]),
  ) as Assignment
