import type { Assignment, CharacterId, PartialAssignment, Puzzle } from '../domain/types'
import { isPartialAssignmentValid } from './constraintEvaluator'

export interface SolverOptions {
  readonly limit?: number
  readonly maxNodes?: number
  readonly partial?: PartialAssignment
}

export interface SearchResult {
  readonly count: number
  readonly firstSolution: Assignment | null
  readonly exploredNodes: number
  readonly reachedNodeLimit: boolean
}

const defaultMaxNodes = 200_000

const candidatePositions = (
  puzzle: Puzzle,
  assignment: PartialAssignment,
  characterId: CharacterId,
) => {
  const used = new Set(Object.values(assignment))
  return puzzle.positions
    .map((position) => position.id)
    .filter((positionId) => !used.has(positionId))
    .filter((positionId) =>
      isPartialAssignmentValid(puzzle, { ...assignment, [characterId]: positionId }),
    )
}

const nextCharacter = (puzzle: Puzzle, assignment: PartialAssignment) => {
  const unassigned = puzzle.characters
    .map((character) => character.id)
    .filter((characterId) => !assignment[characterId])

  return unassigned
    .map((characterId) => ({
      characterId,
      candidates: candidatePositions(puzzle, assignment, characterId),
    }))
    .sort((first, second) => first.candidates.length - second.candidates.length)[0]
}

export const analyzeSolutions = (puzzle: Puzzle, options: SolverOptions = {}): SearchResult => {
  const limit = options.limit ?? Number.POSITIVE_INFINITY
  const maxNodes = options.maxNodes ?? defaultMaxNodes
  const initialAssignment = { ...(options.partial ?? {}) }
  let count = 0
  let firstSolution: Assignment | null = null
  let exploredNodes = 0
  let reachedNodeLimit = false

  if (!isPartialAssignmentValid(puzzle, initialAssignment)) {
    return { count, firstSolution, exploredNodes, reachedNodeLimit }
  }

  const visit = (assignment: PartialAssignment): void => {
    if (count >= limit || reachedNodeLimit) return
    if (exploredNodes >= maxNodes) {
      reachedNodeLimit = true
      return
    }
    exploredNodes += 1

    const choice = nextCharacter(puzzle, assignment)
    if (!choice) {
      count += 1
      firstSolution ??= assignment as Assignment
      return
    }

    for (const candidate of choice.candidates) {
      visit({ ...assignment, [choice.characterId]: candidate })
      if (count >= limit || reachedNodeLimit) return
    }
  }

  visit(initialAssignment)
  return { count, firstSolution, exploredNodes, reachedNodeLimit }
}

export const solve = (puzzle: Puzzle): Assignment | null =>
  analyzeSolutions(puzzle, { limit: 1 }).firstSolution

export const countSolutions = (
  puzzle: Puzzle,
  options: Pick<SolverOptions, 'limit' | 'maxNodes'> = {},
) => analyzeSolutions(puzzle, options).count

export const completePartialAssignment = (puzzle: Puzzle, partial: PartialAssignment) =>
  analyzeSolutions(puzzle, { limit: 1, partial }).firstSolution

export { isPartialAssignmentValid }
