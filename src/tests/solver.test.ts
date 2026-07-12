import { describe, expect, it } from 'vitest'
import { isClueSatisfiedByPartialAssignment } from '../solver/constraintEvaluator'
import {
  analyzeSolutions,
  countSolutions,
  isPartialAssignmentValid,
  solve,
} from '../solver/solver'
import { itemId, placeId, type Clue } from '../domain/types'
import { characterIds, createPuzzle, fullAssignment, positionIds } from './fixtures'

const base = <Type extends Clue['type']>(id: string, type: Type) => ({
  id,
  type,
  phraseVariant: 0,
})

describe('solver', () => {
  it('finds zero, one, and many solutions without trusting a saved answer', () => {
    const impossible = createPuzzle([
      {
        ...base('at', 'character-at-position'),
        characterId: characterIds.a,
        positionId: positionIds.p0,
      },
      {
        ...base('not-at', 'character-not-at-position'),
        characterId: characterIds.a,
        positionId: positionIds.p0,
      },
    ])
    const unique = createPuzzle([
      {
        ...base('a', 'character-at-position'),
        characterId: characterIds.a,
        positionId: positionIds.p0,
      },
      {
        ...base('b', 'character-at-position'),
        characterId: characterIds.b,
        positionId: positionIds.p1,
      },
      {
        ...base('c', 'character-at-position'),
        characterId: characterIds.c,
        positionId: positionIds.p2,
      },
    ])

    expect(countSolutions(impossible, { limit: 2 })).toBe(0)
    expect(countSolutions(unique, { limit: 2 })).toBe(1)
    expect(solve(unique)).toEqual(fullAssignment)
    expect(countSolutions(createPuzzle(), { limit: 2 })).toBe(2)
  })

  it('stops as soon as the solution limit is reached', () => {
    const result = analyzeSolutions(createPuzzle(), { limit: 2 })
    expect(result.count).toBe(2)
    expect(result.reachedNodeLimit).toBe(false)
    expect(result.exploredNodes).toBeLessThan(12)
  })

  it('rejects duplicate positions and contradictory partial assignments', () => {
    const puzzle = createPuzzle([
      {
        ...base('a', 'character-at-position'),
        characterId: characterIds.a,
        positionId: positionIds.p0,
      },
    ])
    expect(isPartialAssignmentValid(puzzle, { [characterIds.a]: positionIds.p1 })).toBe(false)
    expect(
      isPartialAssignmentValid(puzzle, {
        [characterIds.a]: positionIds.p0,
        [characterIds.b]: positionIds.p0,
      }),
    ).toBe(false)
    expect(isPartialAssignmentValid(puzzle, { [characterIds.a]: positionIds.p0 })).toBe(true)
  })

  it('evaluates every supported constraint kind', () => {
    const clues: Clue[] = [
      {
        ...base('at', 'character-at-position'),
        characterId: characterIds.a,
        positionId: positionIds.p0,
      },
      {
        ...base('not-at', 'character-not-at-position'),
        characterId: characterIds.a,
        positionId: positionIds.p1,
      },
      {
        ...base('in', 'character-in-place'),
        characterId: characterIds.a,
        placeId: placeId('place0'),
      },
      {
        ...base('not-in', 'character-not-in-place'),
        characterId: characterIds.a,
        placeId: placeId('place1'),
      },
      {
        ...base('adj', 'adjacent'),
        firstCharacterId: characterIds.a,
        secondCharacterId: characterIds.b,
      },
      {
        ...base('not-adj', 'not-adjacent'),
        firstCharacterId: characterIds.a,
        secondCharacterId: characterIds.d,
      },
      {
        ...base('row', 'same-row'),
        firstCharacterId: characterIds.a,
        secondCharacterId: characterIds.b,
      },
      {
        ...base('diff-row', 'different-row'),
        firstCharacterId: characterIds.a,
        secondCharacterId: characterIds.c,
      },
      {
        ...base('col', 'same-column'),
        firstCharacterId: characterIds.a,
        secondCharacterId: characterIds.c,
      },
      {
        ...base('diff-col', 'different-column'),
        firstCharacterId: characterIds.a,
        secondCharacterId: characterIds.b,
      },
      {
        ...base('left', 'left-of'),
        firstCharacterId: characterIds.a,
        secondCharacterId: characterIds.b,
      },
      {
        ...base('right', 'right-of'),
        firstCharacterId: characterIds.b,
        secondCharacterId: characterIds.a,
      },
      {
        ...base('above', 'above'),
        firstCharacterId: characterIds.a,
        secondCharacterId: characterIds.c,
      },
      {
        ...base('below', 'below'),
        firstCharacterId: characterIds.c,
        secondCharacterId: characterIds.a,
      },
      {
        ...base('distance', 'distance'),
        firstCharacterId: characterIds.a,
        secondCharacterId: characterIds.d,
        distance: 2,
      },
      { ...base('item', 'has-item'), characterId: characterIds.a, itemId: itemId('i0') },
      {
        ...base('not-item', 'does-not-have-item'),
        characterId: characterIds.a,
        itemId: itemId('i1'),
      },
    ]
    const puzzle = createPuzzle(clues)
    expect(
      clues.every((clue) => isClueSatisfiedByPartialAssignment(puzzle, clue, fullAssignment)),
    ).toBe(true)

    const linePuzzle = {
      ...puzzle,
      positions: puzzle.positions.map((position, index) => ({
        ...position,
        row: 0,
        column: index,
      })),
    }
    const between: Clue = {
      ...base('between', 'between'),
      characterId: characterIds.b,
      firstCharacterId: characterIds.a,
      secondCharacterId: characterIds.c,
    }
    expect(isClueSatisfiedByPartialAssignment(linePuzzle, between, fullAssignment)).toBe(true)
  })
})
