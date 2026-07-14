import type { CharacterId, Clue, Puzzle } from './types'

export const clueReferencesCharacter = (
  puzzle: Puzzle,
  clue: Clue,
  characterId: CharacterId,
): boolean => {
  switch (clue.type) {
    case 'character-at-position':
    case 'character-not-at-position':
    case 'character-in-place':
    case 'character-not-in-place':
    case 'character-next-to-obstacle':
    case 'in-corner':
    case 'not-in-corner':
    case 'has-item':
    case 'does-not-have-item':
      return clue.characterId === characterId
    case 'item-in-place':
    case 'item-not-in-place':
      return puzzle.characters.some(
        (character) => character.id === characterId && character.itemId === clue.itemId,
      )
    case 'between':
      return (
        clue.characterId === characterId ||
        clue.firstCharacterId === characterId ||
        clue.secondCharacterId === characterId
      )
    case 'adjacent':
    case 'not-adjacent':
    case 'same-row':
    case 'different-row':
    case 'same-column':
    case 'different-column':
    case 'left-of':
    case 'right-of':
    case 'above':
    case 'below':
    case 'distance':
    case 'same-floor':
    case 'different-floor':
      return clue.firstCharacterId === characterId || clue.secondCharacterId === characterId
  }
}
