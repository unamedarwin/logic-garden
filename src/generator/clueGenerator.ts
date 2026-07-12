import { areAdjacent, isStrictlyBetween, manhattanDistance } from '../domain/constraints'
import type { Assignment, CharacterId, Clue, Position, Puzzle } from '../domain/types'
import { SeededRandom } from './seededRandom'

const solutionPosition = (
  puzzle: Puzzle,
  solution: Assignment,
  characterId: CharacterId,
): Position => {
  const positionId = solution[characterId]
  const position = puzzle.positions.find((candidate) => candidate.id === positionId)
  if (!position) throw new Error('La solució interna té una posició desconeguda.')
  return position
}

const clueBase = (random: SeededRandom, type: Clue['type'], key: string) => ({
  id: `${type}:${key}`,
  phraseVariant: random.integer(0, 2),
})

export const generateCandidateClues = (
  puzzle: Puzzle,
  solution: Assignment,
  random: SeededRandom,
): Clue[] => {
  const candidates: Clue[] = []
  const add = (clue: Clue) => candidates.push(clue)

  for (const character of puzzle.characters) {
    const position = solutionPosition(puzzle, solution, character.id)
    const otherPosition = puzzle.positions.find((candidate) => candidate.id !== position.id)
    const otherItem = puzzle.items.find((item) => item.id !== character.itemId)

    if (random.next() < 0.5) {
      add({
        ...clueBase(random, 'character-at-position', character.id),
        type: 'character-at-position',
        characterId: character.id,
        positionId: position.id,
      })
    } else {
      add({
        ...clueBase(random, 'character-in-place', character.id),
        type: 'character-in-place',
        characterId: character.id,
        placeId: position.placeId,
      })
    }

    if (otherPosition) {
      if (random.next() < 0.5) {
        add({
          ...clueBase(
            random,
            'character-not-at-position',
            `${character.id}:${otherPosition.id}`,
          ),
          type: 'character-not-at-position',
          characterId: character.id,
          positionId: otherPosition.id,
        })
      } else {
        add({
          ...clueBase(
            random,
            'character-not-in-place',
            `${character.id}:${otherPosition.placeId}`,
          ),
          type: 'character-not-in-place',
          characterId: character.id,
          placeId: otherPosition.placeId,
        })
      }
    }

    if (puzzle.boardMode === 'map') {
      add({
        ...clueBase(random, 'has-item', `${character.id}:${character.itemId}`),
        type: 'has-item',
        characterId: character.id,
        itemId: character.itemId,
      })
      if (otherItem) {
        add({
          ...clueBase(random, 'does-not-have-item', `${character.id}:${otherItem.id}`),
          type: 'does-not-have-item',
          characterId: character.id,
          itemId: otherItem.id,
        })
      }
    }
  }

  for (let firstIndex = 0; firstIndex < puzzle.characters.length; firstIndex += 1) {
    for (
      let secondIndex = firstIndex + 1;
      secondIndex < puzzle.characters.length;
      secondIndex += 1
    ) {
      const firstCharacter = puzzle.characters[firstIndex]!
      const secondCharacter = puzzle.characters[secondIndex]!
      const first = solutionPosition(puzzle, solution, firstCharacter.id)
      const second = solutionPosition(puzzle, solution, secondCharacter.id)
      const pairKey = `${firstCharacter.id}:${secondCharacter.id}`

      add({
        ...clueBase(random, areAdjacent(first, second) ? 'adjacent' : 'not-adjacent', pairKey),
        type: areAdjacent(first, second) ? 'adjacent' : 'not-adjacent',
        firstCharacterId: firstCharacter.id,
        secondCharacterId: secondCharacter.id,
      })
      if (puzzle.boardMode === 'logic-grid') {
        const horizontalType = first.column < second.column ? 'left-of' : 'right-of'
        add({
          ...clueBase(random, horizontalType, pairKey),
          type: horizontalType,
          firstCharacterId: firstCharacter.id,
          secondCharacterId: secondCharacter.id,
        })
        const verticalType = first.row < second.row ? 'above' : 'below'
        add({
          ...clueBase(random, verticalType, pairKey),
          type: verticalType,
          firstCharacterId: firstCharacter.id,
          secondCharacterId: secondCharacter.id,
        })
      } else {
        add({
          ...clueBase(random, first.row === second.row ? 'same-row' : 'different-row', pairKey),
          type: first.row === second.row ? 'same-row' : 'different-row',
          firstCharacterId: firstCharacter.id,
          secondCharacterId: secondCharacter.id,
        })
        add({
          ...clueBase(
            random,
            first.column === second.column ? 'same-column' : 'different-column',
            pairKey,
          ),
          type: first.column === second.column ? 'same-column' : 'different-column',
          firstCharacterId: firstCharacter.id,
          secondCharacterId: secondCharacter.id,
        })
        add({
          ...clueBase(random, 'distance', pairKey),
          type: 'distance',
          firstCharacterId: firstCharacter.id,
          secondCharacterId: secondCharacter.id,
          distance: manhattanDistance(first, second),
        })

        if (first.row === second.row) {
          const type = first.column < second.column ? 'left-of' : 'right-of'
          add({
            ...clueBase(random, type, pairKey),
            type,
            firstCharacterId: firstCharacter.id,
            secondCharacterId: secondCharacter.id,
          })
        }
        if (first.column === second.column) {
          const type = first.row < second.row ? 'above' : 'below'
          add({
            ...clueBase(random, type, pairKey),
            type,
            firstCharacterId: firstCharacter.id,
            secondCharacterId: secondCharacter.id,
          })
        }
      }
    }
  }

  for (const middleCharacter of puzzle.characters) {
    for (let firstIndex = 0; firstIndex < puzzle.characters.length; firstIndex += 1) {
      for (
        let secondIndex = firstIndex + 1;
        secondIndex < puzzle.characters.length;
        secondIndex += 1
      ) {
        const firstCharacter = puzzle.characters[firstIndex]!
        const secondCharacter = puzzle.characters[secondIndex]!
        if (
          middleCharacter.id === firstCharacter.id ||
          middleCharacter.id === secondCharacter.id
        ) {
          continue
        }
        const middle = solutionPosition(puzzle, solution, middleCharacter.id)
        const first = solutionPosition(puzzle, solution, firstCharacter.id)
        const second = solutionPosition(puzzle, solution, secondCharacter.id)
        if (isStrictlyBetween(middle, first, second)) {
          add({
            ...clueBase(
              random,
              'between',
              `${middleCharacter.id}:${firstCharacter.id}:${secondCharacter.id}`,
            ),
            type: 'between',
            characterId: middleCharacter.id,
            firstCharacterId: firstCharacter.id,
            secondCharacterId: secondCharacter.id,
          })
        }
      }
    }
  }

  return candidates
}
