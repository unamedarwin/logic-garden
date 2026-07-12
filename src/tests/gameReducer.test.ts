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
    expect(gameReducer(state, { type: 'check' }).feedback).toMatch(/Encara hi ha/)
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
    const state = gameReducer(createGameState(generatePuzzle('easy', 'hint')), { type: 'hint' })
    expect(state.hintsUsed).toBe(1)
    expect(state.feedback).toBeTruthy()
  })
})
