import type { CharacterId, PositionId } from '../domain/types'
import type { GameState } from './gameReducer'

export const characterAtPosition = (state: GameState, positionId: PositionId) =>
  state.puzzle.characters.find((character) => state.assignments[character.id] === positionId)

export const unplacedCharacters = (state: GameState) =>
  state.puzzle.characters.filter((character) => !state.assignments[character.id])

export const isCharacterSelected = (state: GameState, characterId: CharacterId) =>
  state.selectedCharacterId === characterId

export const progress = (state: GameState) => {
  const placed = state.puzzle.characters.filter(
    (character) => state.assignments[character.id],
  ).length
  return { placed, total: state.puzzle.characters.length }
}
