import { describe, expect, it } from 'vitest'
import { positionId } from '../domain/types'
import { validateAssignment } from '../game/validation'
import { generatePuzzle } from '../generator/puzzleGenerator'
import { analyzeSolutions, isPartialAssignmentValid } from '../solver/solver'
import { createPuzzle, fullAssignment } from './fixtures'

describe('solver-backed game validation', () => {
  it('never accepts a complete assignment when the puzzle has multiple solutions', () => {
    const puzzle = createPuzzle()

    expect(isPartialAssignmentValid(puzzle, fullAssignment)).toBe(true)
    expect(analyzeSolutions(puzzle, { limit: 2 }).count).toBe(2)
    expect(validateAssignment(puzzle, fullAssignment)).toMatchObject({
      complete: true,
      correct: false,
      feedback: { type: 'assignment-incorrect' },
    })
  })

  it('rejects the other side of the landmark in the reported shared puzzle', () => {
    const puzzle = generatePuzzle(
      'easy',
      '36beb328-692a-439c-bb12-4ad7b1b20a16',
      'adults',
      'spatial',
    )
    const analysis = analyzeSolutions(puzzle, { limit: 2 })
    const solution = analysis.firstSolution
    const reportedCharacter = puzzle.characters.find((character) => character.name === 'Joan')
    const otherSide = puzzle.positions.find(
      (position) => position.id === positionId('position-5-2'),
    )
    if (!solution || !reportedCharacter || !otherSide)
      throw new Error('Expected the shared puzzle')

    const alternative = { ...solution, [reportedCharacter.id]: otherSide.id }
    expect(analysis.count).toBe(1)
    expect(otherSide.blocked).toBe(false)
    expect(validateAssignment(puzzle, alternative)).toMatchObject({
      complete: true,
      correct: false,
      feedback: { type: 'assignment-incorrect', correctCount: 3, totalCount: 4 },
    })
  })
})
