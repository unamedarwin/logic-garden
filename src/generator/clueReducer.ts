import type { Clue, Puzzle } from '../domain/types'
import { isClueSatisfiedByPartialAssignment } from '../solver/constraintEvaluator'
import { analyzeSolutions } from '../solver/solver'

const withClues = (puzzle: Puzzle, clues: readonly Clue[]): Puzzle => ({ ...puzzle, clues })

const hasExactlyOneSolution = (puzzle: Puzzle, clues: readonly Clue[]) => {
  const result = analyzeSolutions(withClues(puzzle, clues), { limit: 2 })
  return result.count === 1 && !result.reachedNodeLimit
}

export const selectMinimalUniqueClues = (
  puzzle: Puzzle,
  candidates: readonly Clue[],
  initialClues: readonly Clue[] = [],
) => {
  const selected: Clue[] = [...initialClues]
  const protectedIds = new Set(initialClues.map((clue) => clue.id))

  while (true) {
    const analysis = analyzeSolutions(withClues(puzzle, selected), { limit: 2 })
    if (analysis.count === 1 && !analysis.reachedNodeLimit) break
    const alternative = analysis.foundSolutions[analysis.foundSolutions.length - 1]
    const separatingClue = candidates.find(
      (clue) =>
        !selected.some((selectedClue) => selectedClue.id === clue.id) &&
        (!alternative || !isClueSatisfiedByPartialAssignment(puzzle, clue, alternative)),
    )
    if (!separatingClue) break
    selected.push(separatingClue)
  }

  if (!hasExactlyOneSolution(puzzle, selected)) {
    throw new Error('No s’ha pogut construir un puzzle amb una solució única.')
  }

  for (const clue of [...selected]) {
    if (protectedIds.has(clue.id)) continue
    const withoutClue = selected.filter((candidate) => candidate.id !== clue.id)
    if (hasExactlyOneSolution(puzzle, withoutClue)) {
      selected.splice(selected.indexOf(clue), 1)
    }
  }

  return selected
}
