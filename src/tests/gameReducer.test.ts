import { describe, expect, it } from 'vitest'
import { createGameState, gameReducer } from '../game/gameReducer'
import { generatePuzzle } from '../generator/puzzleGenerator'
import { solve } from '../solver/solver'

describe('game reducer', () => {
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
      state = gameReducer(state, { type: 'select-character', characterId: character.id })
      state = gameReducer(state, { type: 'hint' })
      expect(state.assignments[character.id]).toBeDefined()
    }

    const lastCharacter = puzzle.characters.at(-1)
    if (!lastCharacter) throw new Error('Expected a final character')
    state = gameReducer(state, { type: 'select-character', characterId: lastCharacter.id })
    const limited = gameReducer(state, { type: 'hint' })

    expect(limited.hintsUsed).toBe(puzzle.characters.length - 1)
    expect(limited.assignments[lastCharacter.id]).toBeUndefined()
    expect(limited.feedback).toEqual({ type: 'hint-limit-reached' })
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

  it('rejects deduction-grid moves that reuse an occupied row or column', () => {
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
    const guardedState = gameReducer(state, {
      type: 'move-character',
      characterId: secondCharacter.id,
      positionId: blockedPosition.id,
    })

    expect(guardedState).toBe(state)
  })
})
