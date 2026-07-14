import { describe, expect, it } from 'vitest'
import type { Assignment, Clue } from '../domain/types'
import { validateAssignment } from '../game/validation'
import { generatePuzzle } from '../generator/puzzleGenerator'
import { analyzeSolutions, isPartialAssignmentValid } from '../solver/solver'
import { characterIds, createPuzzle, fullAssignment, positionIds } from './fixtures'

const exactClues: readonly Clue[] = Object.entries(fullAssignment).map(
  ([characterId, targetPositionId], index) => ({
    id: `exact-${index}`,
    type: 'character-at-position',
    phraseVariant: 0,
    characterId: characterId as keyof Assignment,
    positionId: targetPositionId,
  }),
)

describe('solver-backed game validation', () => {
  it('accepts any complete assignment that satisfies a puzzle with multiple solutions', () => {
    const puzzle = createPuzzle()
    const alternative: Assignment = {
      ...fullAssignment,
      [characterIds.a]: positionIds.p1,
      [characterIds.b]: positionIds.p0,
    }

    expect(isPartialAssignmentValid(puzzle, fullAssignment)).toBe(true)
    expect(analyzeSolutions(puzzle, { limit: 2 }).count).toBe(2)
    expect(validateAssignment(puzzle, fullAssignment)).toMatchObject({
      complete: true,
      correct: true,
      feedback: { type: 'assignment-correct', correctCount: 4, totalCount: 4 },
    })
    expect(validateAssignment(puzzle, alternative)).toMatchObject({
      complete: true,
      correct: true,
      feedback: { type: 'assignment-correct', correctCount: 4, totalCount: 4 },
    })
  })

  it('does not count a placement that cannot extend to any solution', () => {
    const puzzle = createPuzzle(exactClues)

    expect(validateAssignment(puzzle, { [characterIds.a]: positionIds.p1 })).toMatchObject({
      complete: false,
      correct: false,
      feedback: { type: 'assignment-incomplete', correctCount: 0, totalCount: 4 },
    })
  })

  it('rejects a complete contradiction and counts only extendable placements', () => {
    const puzzle = createPuzzle(exactClues)
    const swapped: Assignment = {
      ...fullAssignment,
      [characterIds.a]: positionIds.p1,
      [characterIds.b]: positionIds.p0,
    }

    expect(validateAssignment(puzzle, swapped)).toMatchObject({
      complete: true,
      correct: false,
      feedback: { type: 'assignment-incorrect', correctCount: 2, totalCount: 4 },
    })
  })

  it('never reports every piece as correct when placements only work separately', () => {
    const puzzle = createPuzzle([
      {
        id: 'a-left-of-b',
        type: 'left-of',
        phraseVariant: 0,
        firstCharacterId: characterIds.a,
        secondCharacterId: characterIds.b,
      },
    ])
    const jointlyInvalid: Assignment = {
      [characterIds.a]: positionIds.p2,
      [characterIds.b]: positionIds.p1,
      [characterIds.c]: positionIds.p0,
      [characterIds.d]: positionIds.p3,
    }

    for (const [characterId, targetPositionId] of Object.entries(jointlyInvalid)) {
      expect(
        analyzeSolutions(puzzle, {
          limit: 1,
          partial: { [characterId]: targetPositionId },
        }).count,
      ).toBe(1)
    }
    expect(validateAssignment(puzzle, jointlyInvalid)).toMatchObject({
      complete: true,
      correct: false,
      feedback: { type: 'assignment-incorrect', correctCount: 2, totalCount: 4 },
    })
  })

  it('rejects a complete assignment on the wrong side of a landmark', () => {
    const puzzle = generatePuzzle('medium', 'landmark-side-regression', 'adults', 'spatial', 9)
    const analysis = analyzeSolutions(puzzle, { limit: 2 })
    const solution = analysis.firstSolution
    const landmarkClue = puzzle.clues.find(
      (clue) =>
        clue.type === 'character-next-to-obstacle' &&
        puzzle.positions.some((position) => {
          if (position.blocked || position.id === solution?.[clue.characterId]) return false
          const obstacle = puzzle.positions.find(
            (candidate) => candidate.id === clue.obstaclePositionId,
          )
          return (
            obstacle !== undefined &&
            Math.abs(position.row - obstacle.row) +
              Math.abs(position.column - obstacle.column) ===
              1
          )
        }),
    )
    if (!solution || !landmarkClue || landmarkClue.type !== 'character-next-to-obstacle') {
      throw new Error('Expected a landmark with more than one visible side')
    }
    const obstacle = puzzle.positions.find(
      (position) => position.id === landmarkClue.obstaclePositionId,
    )
    const otherSide = puzzle.positions.find(
      (position) =>
        !position.blocked &&
        position.id !== solution[landmarkClue.characterId] &&
        obstacle !== undefined &&
        Math.abs(position.row - obstacle.row) + Math.abs(position.column - obstacle.column) ===
          1,
    )
    if (!otherSide) throw new Error('Expected another side of the landmark')

    const alternative = { ...solution, [landmarkClue.characterId]: otherSide.id }
    expect(analysis.count).toBe(1)
    expect(otherSide.blocked).toBe(false)
    const validation = validateAssignment(puzzle, alternative)
    expect(validation).toMatchObject({
      complete: true,
      correct: false,
      feedback: { type: 'assignment-incorrect', totalCount: puzzle.characters.length },
    })
    if (!('correctCount' in validation.feedback)) throw new Error('Expected check feedback')
    expect(validation.feedback.correctCount).toBeLessThan(puzzle.characters.length)
  })
})
