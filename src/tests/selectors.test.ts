import { describe, expect, it } from 'vitest'
import { generatePuzzle } from '../generator/puzzleGenerator'
import { createGameState, gameReducer } from '../game/gameReducer'
import {
  characterAtPosition,
  isCharacterSelected,
  progress,
  unplacedCharacters,
} from '../game/selectors'

describe('game selectors', () => {
  it('summarizes selected, placed, and waiting characters', () => {
    const puzzle = generatePuzzle('easy', 'selector-coverage', 'children')
    const [firstCharacter, secondCharacter] = puzzle.characters
    const [firstPosition] = puzzle.positions
    if (!firstCharacter || !secondCharacter || !firstPosition) {
      throw new Error('Fixture puzzle must contain at least two characters and one position.')
    }

    const selected = gameReducer(createGameState(puzzle), {
      type: 'select-character',
      characterId: firstCharacter.id,
    })
    const state = gameReducer(selected, {
      type: 'move-character',
      characterId: firstCharacter.id,
      positionId: firstPosition.id,
    })

    expect(characterAtPosition(state, firstPosition.id)?.id).toBe(firstCharacter.id)
    expect(characterAtPosition(state, puzzle.positions[puzzle.positions.length - 1]!.id)).toBe(
      undefined,
    )
    expect(unplacedCharacters(state).map((character) => character.id)).toContain(
      secondCharacter.id,
    )
    expect(isCharacterSelected(selected, firstCharacter.id)).toBe(true)
    expect(isCharacterSelected(selected, secondCharacter.id)).toBe(false)
    expect(progress(state)).toEqual({ placed: 1, total: puzzle.characters.length })
  })
})
