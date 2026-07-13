import { describe, expect, it } from 'vitest'
import { createGameState, gameReducer } from '../game/gameReducer'
import { generatePuzzle } from '../generator/puzzleGenerator'
import { solve } from '../solver/solver'
import { shareCubeAxisLine } from '../domain/constraints'

describe('game reducer', () => {
  it('accepts an incorrect hypothesis on a visually free building cell', () => {
    const puzzle = generatePuzzle(
      'hard',
      '9aa77f1d-ba34-4c96-9767-01dee5543847',
      'adults',
      'cube',
    )
    const estel = puzzle.characters.find((character) => character.name === 'Estel')
    const target = puzzle.positions.find((position) => position.id === 'position-3-1-1')
    const solution = solve(puzzle)
    if (!estel || !target || !solution) throw new Error('Expected the shared regression puzzle')

    expect(target.blocked).toBe(false)
    expect(solution[estel.id]).not.toBe(target.id)
    const state = gameReducer(createGameState(puzzle), {
      type: 'move-character',
      characterId: estel.id,
      positionId: target.id,
    })

    expect(state.assignments[estel.id]).toBe(target.id)
    expect(state.moves).toBe(1)
  })

  it('returns conflicting building occupants to waiting when a new placement takes priority', () => {
    const puzzle = generatePuzzle('hard', 'cube-reducer', 'adults', 'cube')
    const firstCharacter = puzzle.characters[0]!
    const secondCharacter = puzzle.characters[1]!
    const firstPosition = puzzle.positions.find(
      (position) =>
        !position.blocked &&
        puzzle.positions.some(
          (candidate) =>
            !candidate.blocked &&
            candidate.id !== position.id &&
            shareCubeAxisLine(candidate, position),
        ),
    )!
    const conflictingPlace = puzzle.positions.find(
      (position) =>
        !position.blocked &&
        position.id !== firstPosition.id &&
        shareCubeAxisLine(position, firstPosition),
    )!
    let state = createGameState(puzzle)
    state = gameReducer(state, {
      type: 'move-character',
      characterId: firstCharacter.id,
      positionId: firstPosition.id,
    })
    const replaced = gameReducer(state, {
      type: 'move-character',
      characterId: secondCharacter.id,
      positionId: conflictingPlace.id,
    })

    expect(replaced.assignments[firstCharacter.id]).toBeUndefined()
    expect(replaced.assignments[secondCharacter.id]).toBe(conflictingPlace.id)
    expect(replaced.feedback).toEqual({
      type: 'placement-conflicts-cleared',
      characterName: secondCharacter.name,
      clearedCount: 1,
    })
    expect(gameReducer(replaced, { type: 'undo' }).assignments[firstCharacter.id]).toBe(
      firstPosition.id,
    )
  })

  it('moves characters with undo, redo, reset, and helpful incomplete feedback', () => {
    const puzzle = generatePuzzle('easy', 'reducer')
    const character = puzzle.characters[0]!
    const position = puzzle.positions[0]!
    let state = createGameState(puzzle)
    state = gameReducer(state, { type: 'select-character', characterId: character.id })
    state = gameReducer(state, {
      type: 'move-character',
      characterId: character.id,
      positionId: position.id,
    })
    expect(state.assignments[character.id]).toBe(position.id)
    state = gameReducer(state, { type: 'undo' })
    expect(state.assignments[character.id]).toBeUndefined()
    state = gameReducer(state, { type: 'redo' })
    expect(state.assignments[character.id]).toBe(position.id)
    expect(gameReducer(state, { type: 'check' }).feedback).toEqual({
      type: 'assignment-incomplete',
      correctCount: expect.any(Number),
      totalCount: puzzle.characters.length,
    })
    expect(gameReducer(state, { type: 'reset' }).assignments).toEqual({})
  })

  it('wins only when the full solver-validated assignment is placed', () => {
    const puzzle = generatePuzzle('easy', 'winner')
    const solution = solve(puzzle)
    if (!solution) throw new Error('Expected a solvable generated puzzle')
    let state = createGameState(puzzle)
    for (const character of puzzle.characters) {
      state = gameReducer(state, {
        type: 'move-character',
        characterId: character.id,
        positionId: solution[character.id],
      })
    }
    expect(gameReducer(state, { type: 'check' }).status).toBe('won')
  })

  it('derives hints from the solver rather than an exposed solution', () => {
    const puzzle = generatePuzzle('easy', 'hint')
    const character = puzzle.characters[0]!
    const solution = solve(puzzle)
    if (!solution) throw new Error('Expected a solvable generated puzzle')
    let state = createGameState(puzzle)
    state = gameReducer(state, { type: 'select-character', characterId: character.id })
    state = gameReducer(state, { type: 'hint' })

    expect(state.hintsUsed).toBe(1)
    expect(state.assignments[character.id]).toBe(solution[character.id])
    expect(state.feedback).toBeTruthy()
  })

  it('limits automatic person placement to every person except the last one', () => {
    const puzzle = generatePuzzle('easy', 'hint-limit', 'adults')
    let state = createGameState(puzzle)

    for (const character of puzzle.characters.slice(0, -1)) {
      if (state.selectedCharacterId !== character.id) {
        state = gameReducer(state, { type: 'select-character', characterId: character.id })
      }
      state = gameReducer(state, { type: 'hint' })
      expect(state.assignments[character.id]).toBeDefined()
    }

    const lastCharacter = puzzle.characters.at(-1)
    if (!lastCharacter) throw new Error('Expected a final character')
    if (state.selectedCharacterId !== lastCharacter.id) {
      state = gameReducer(state, { type: 'select-character', characterId: lastCharacter.id })
    }
    const limited = gameReducer(state, { type: 'hint' })

    expect(limited.hintsUsed).toBe(puzzle.characters.length - 1)
    expect(limited.assignments[lastCharacter.id]).toBeUndefined()
    expect(limited.feedback).toEqual({ type: 'hint-limit-reached' })
  })

  it('selects the next waiting person after a valid placement', () => {
    const puzzle = generatePuzzle('easy', 'select-next-person', 'adults')
    const [first, second] = puzzle.characters
    const position = puzzle.positions.find((candidate) => !candidate.blocked)
    if (!first || !second || !position) throw new Error('Expected people and a free position')

    const state = gameReducer(createGameState(puzzle), {
      type: 'move-character',
      characterId: first.id,
      positionId: position.id,
    })

    expect(state.selectedCharacterId).toBe(second.id)
  })

  it('returns a placed character to the waiting tray and records the move', () => {
    const puzzle = generatePuzzle('easy', 'return-to-tray')
    const character = puzzle.characters[0]!
    const position = puzzle.positions[0]!
    let state = createGameState(puzzle)
    state = gameReducer(state, {
      type: 'move-character',
      characterId: character.id,
      positionId: position.id,
    })
    state = gameReducer(state, { type: 'remove-character', characterId: character.id })

    expect(state.assignments[character.id]).toBeUndefined()
    expect(state.moves).toBe(2)
    expect(state.past).toHaveLength(2)
  })

  it('lets a child test, replace, and remove an incorrect hypothesis', () => {
    const puzzle = generatePuzzle('medium', 'child-free-hypotheses', 'children')
    const solution = solve(puzzle)
    const [first, second] = puzzle.characters
    if (!solution || !first || !second) throw new Error('Expected a solved child puzzle')
    const wrongPosition = puzzle.positions.find(
      (position) => !position.blocked && position.id !== solution[first.id],
    )
    if (!wrongPosition) throw new Error('Expected a wrong child-map position')

    let state = gameReducer(createGameState(puzzle), {
      type: 'move-character',
      characterId: first.id,
      positionId: wrongPosition.id,
    })
    expect(state.assignments[first.id]).toBe(wrongPosition.id)

    state = gameReducer(state, {
      type: 'move-character',
      characterId: second.id,
      positionId: wrongPosition.id,
    })
    expect(state.assignments[first.id]).toBeUndefined()
    expect(state.assignments[second.id]).toBe(wrongPosition.id)

    state = gameReducer(state, { type: 'remove-character', characterId: second.id })
    expect(state.assignments[second.id]).toBeUndefined()
  })

  it('does not count dropping a character on its current cell as a move', () => {
    const puzzle = generatePuzzle('easy', 'same-cell-drop')
    const character = puzzle.characters[0]!
    const position = puzzle.positions[0]!
    let state = createGameState(puzzle)
    state = gameReducer(state, {
      type: 'move-character',
      characterId: character.id,
      positionId: position.id,
    })

    const unchanged = gameReducer(state, {
      type: 'move-character',
      characterId: character.id,
      positionId: position.id,
    })

    expect(unchanged).toBe(state)
    expect(unchanged.moves).toBe(1)
    expect(unchanged.past).toHaveLength(1)
  })

  it('returns conflicting 2D occupants to waiting when a new placement takes priority', () => {
    const puzzle = generatePuzzle('easy', 'logic-grid-guard', 'teens')
    const [firstCharacter, secondCharacter] = puzzle.characters
    const firstPosition = puzzle.positions.find((position) => !position.blocked)
    const blockedPosition = puzzle.positions.find(
      (position) =>
        !position.blocked &&
        firstPosition &&
        position.id !== firstPosition.id &&
        (position.row === firstPosition.row || position.column === firstPosition.column),
    )
    if (!firstCharacter || !secondCharacter || !firstPosition || !blockedPosition) {
      throw new Error('Expected a deduction grid with two characters and positions')
    }

    let state = createGameState(puzzle)
    state = gameReducer(state, {
      type: 'move-character',
      characterId: firstCharacter.id,
      positionId: firstPosition.id,
    })
    const replaced = gameReducer(state, {
      type: 'move-character',
      characterId: secondCharacter.id,
      positionId: blockedPosition.id,
    })

    expect(replaced.assignments[firstCharacter.id]).toBeUndefined()
    expect(replaced.assignments[secondCharacter.id]).toBe(blockedPosition.id)
    expect(replaced.feedback).toMatchObject({
      type: 'placement-conflicts-cleared',
      clearedCount: 1,
    })
  })
})
