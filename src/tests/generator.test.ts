import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { getTheme } from '../domain/themes'
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

  it('uses profile-specific content and deduction-grid row and column rules', () => {
    const teenPuzzle = generatePuzzle('medium', 'teen-logic-grid', 'teens')
    const adultPuzzle = generatePuzzle('medium', 'adult-logic-grid', 'adults')
    const solution = solve(teenPuzzle)
    if (!solution) throw new Error('Expected a solvable deduction grid')

    expect(teenPuzzle.boardMode).toBe('logic-grid')
    expect(teenPuzzle.characters).toHaveLength(6)
    expect(teenPuzzle.positions).toHaveLength(81)
    expect(teenPuzzle.positions.filter((position) => position.blocked)).toHaveLength(9)
    expect(getTheme(teenPuzzle.theme).audience).toBe('teens')
    expect(getTheme(adultPuzzle.theme).audience).toBe('adults')

    const occupied = Object.values(solution).map((positionId) =>
      teenPuzzle.positions.find((position) => position.id === positionId),
    )
    expect(new Set(occupied.map((position) => position?.row)).size).toBe(6)
    expect(new Set(occupied.map((position) => position?.column)).size).toBe(6)
    expect(countSolutions(teenPuzzle, { limit: 2 })).toBe(1)
    expect(
      Object.values(solution).some(
        (positionId) =>
          teenPuzzle.positions.find((position) => position.id === positionId)?.blocked,
      ),
    ).toBe(false)
  })

  it('uses visual spatial clues for teen and adult grids without distance or axis wording', () => {
    for (const audience of ['teens', 'adults'] as const) {
      const puzzle = generatePuzzle('medium', `spatial-clues-${audience}`, audience)
      const forbiddenTypes = new Set([
        'distance',
        'same-row',
        'different-row',
        'same-column',
        'different-column',
      ])

      expect(puzzle.clues.some((clue) => forbiddenTypes.has(clue.type))).toBe(false)
      expect(puzzle.clues.length).toBeGreaterThan(0)
    }
  })

  it('scales spatial plans without coupling people to the board dimension', () => {
    const sizes = [
      ['easy', 6, 4, 4],
      ['medium', 9, 6, 9],
      ['hard', 16, 8, 20],
    ] as const

    for (const [difficulty, dimension, people, obstacles] of sizes) {
      const puzzle = generatePuzzle(difficulty, `large-plan-${difficulty}`, 'adults')
      expect(puzzle.characters).toHaveLength(people)
      expect(puzzle.positions).toHaveLength(dimension * dimension)
      expect(puzzle.positions.filter((position) => position.blocked)).toHaveLength(obstacles)
      expect(countSolutions(puzzle, { limit: 2 })).toBe(1)
    }
  })

  it('varies rectangular children maps between both seeded orientations', () => {
    const shapes = new Set(
      Array.from({ length: 24 }, (_, index) => {
        const puzzle = generatePuzzle('medium', `orientation-${index}`, 'children')
        const rows = Math.max(...puzzle.positions.map((position) => position.row)) + 1
        const columns = Math.max(...puzzle.positions.map((position) => position.column)) + 1
        return `${rows}x${columns}`
      }),
    )

    expect(shapes).toContain('2x3')
    expect(shapes).toContain('3x2')
  })
})
