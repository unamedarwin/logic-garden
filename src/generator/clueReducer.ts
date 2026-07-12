import type { Clue, Puzzle } from '../domain/types'
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

  for (const clue of candidates) {
    if (selected.some((selectedClue) => selectedClue.id === clue.id)) continue
    selected.push(clue)
    if (hasExactlyOneSolution(puzzle, selected)) break
  }

  if (!hasExactlyOneSolution(puzzle, selected)) {
    throw new Error('No s’ha pogut construir un puzzle amb una solució única.')
  }

  for (const clue of [...selected]) {
    const withoutClue = selected.filter((candidate) => candidate.id !== clue.id)
    if (hasExactlyOneSolution(puzzle, withoutClue)) {
      selected.splice(selected.indexOf(clue), 1)
    }
  }

  return selected
}
