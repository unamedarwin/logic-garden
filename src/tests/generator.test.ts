import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import type { Difficulty } from '../domain/types'
import { generatePuzzle } from '../generator/puzzleGenerator'
import { isClueSatisfiedByPartialAssignment } from '../solver/constraintEvaluator'
import { countSolutions, solve } from '../solver/solver'

const bannedTerms =
  /murder|death|weapon|violence|threat|punishment|assassinat|mort|arma|violència|amenaça|càstig|asesinato|muerte|arma|violencia|amenaza|castigo/iu

describe('seeded puzzle generator', () => {
  it('repeats the exact same puzzle for the same seed and varies across seeds', () => {
    expect(generatePuzzle('medium', 'same-seed')).toEqual(generatePuzzle('medium', 'same-seed'))
    expect(generatePuzzle('medium', 'seed-one').clues).not.toEqual(
      generatePuzzle('medium', 'seed-two').clues,
    )
  })

  it('creates only unique, safe, minimal puzzles for hundreds of seeds', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<Difficulty>('easy', 'medium', 'hard'),
        fc.integer({ min: -1_000_000, max: 1_000_000 }),
        (difficulty, value) => {
          const puzzle = generatePuzzle(difficulty, `property-${value}`)
          const solution = solve(puzzle)
          if (!solution) return false
          if (countSolutions(puzzle, { limit: 2 }) !== 1) return false
          if (
            !puzzle.clues.every((clue) =>
              isClueSatisfiedByPartialAssignment(puzzle, clue, solution),
            )
          )
            return false
          if (new Set(puzzle.clues.map((clue) => clue.id)).size !== puzzle.clues.length)
            return false
          return !bannedTerms.test(JSON.stringify(puzzle))
        },
      ),
      { numRuns: 180 },
    )
  }, 20_000)

  it('keeps every selected clue necessary after clue reduction', () => {
    const puzzle = generatePuzzle('hard', 'minimal-clues')
    for (const clue of puzzle.clues) {
      const withoutClue = {
        ...puzzle,
        clues: puzzle.clues.filter((candidate) => candidate.id !== clue.id),
      }
      expect(countSolutions(withoutClue, { limit: 2 })).not.toBe(1)
    }
  })
})
