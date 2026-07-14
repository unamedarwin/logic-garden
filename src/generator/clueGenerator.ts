import {
  areAdjacent,
  isCornerPosition,
  isStrictlyBetween,
  manhattanDistance,
} from '../domain/constraints'
import { buildingUnitsAreNeighbors, isBuildingAbove } from '../domain/buildingPlan'
import type { Assignment, CharacterId, Clue, Position, Puzzle } from '../domain/types'
import { preferredLandmark } from './landmarkDomains'
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
  const hasVisibleLandmark = (position: Position) =>
    puzzle.positions.some(
      (candidate) =>
        candidate.blocked &&
        candidate.obstacleEmoji !== undefined &&
        candidate.obstacleLabel !== undefined &&
        candidate.placeId === position.placeId &&
        Math.abs(candidate.row - position.row) +
          Math.abs(candidate.column - position.column) ===
          1,
    )

  for (const character of puzzle.characters) {
    const position = solutionPosition(puzzle, solution, character.id)
    const otherPosition = puzzle.positions.find(
      (candidate) =>
        candidate.id !== position.id &&
        !candidate.blocked &&
        (puzzle.boardMode !== 'logic-cube' || candidate.placeId !== position.placeId) &&
        (puzzle.boardMode === 'map' ||
          (puzzle.boardMode === 'logic-cube' && hasVisibleLandmark(candidate)) ||
          puzzle.positions.some(
            (obstacle) =>
              obstacle.blocked &&
              Math.abs(obstacle.row - candidate.row) +
                Math.abs(obstacle.column - candidate.column) ===
                1,
          )),
    )
    const otherItem = puzzle.items.find((item) => item.id !== character.itemId)

    if (position.buildingKind !== 'shop') {
      add({
        ...clueBase(
          random,
          isCornerPosition(puzzle.positions, position) ? 'in-corner' : 'not-in-corner',
          character.id,
        ),
        type: isCornerPosition(puzzle.positions, position) ? 'in-corner' : 'not-in-corner',
        characterId: character.id,
      })
    }

    if (puzzle.boardMode === 'logic-grid') {
      const adjacentObstacle = preferredLandmark(puzzle.positions, position, puzzle.difficulty)
      if (adjacentObstacle) {
        add({
          ...clueBase(
            random,
            'character-next-to-obstacle',
            `${character.id}:${adjacentObstacle.id}`,
          ),
          type: 'character-next-to-obstacle',
          characterId: character.id,
          obstaclePositionId: adjacentObstacle.id,
        })
      }
      add({
        ...clueBase(random, 'character-at-position', character.id),
        type: 'character-at-position',
        characterId: character.id,
        positionId: position.id,
      })
      add({
        ...clueBase(random, 'character-in-place', character.id),
        type: 'character-in-place',
        characterId: character.id,
        placeId: position.placeId,
      })
    } else if (puzzle.boardMode === 'logic-cube') {
      if (hasVisibleLandmark(position)) {
        add({
          ...clueBase(random, 'character-at-position', character.id),
          type: 'character-at-position',
          characterId: character.id,
          positionId: position.id,
        })
      }
      add({
        ...clueBase(random, 'character-in-place', character.id),
        type: 'character-in-place',
        characterId: character.id,
        placeId: position.placeId,
      })
      add({
        ...clueBase(random, 'has-item', `${character.id}:${character.itemId}`),
        type: 'has-item',
        characterId: character.id,
        itemId: character.itemId!,
      })
    } else if (random.next() < 0.5) {
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

    if (puzzle.boardMode === 'logic-cube' && character.itemId) {
      const otherCubeItem = puzzle.items.find((item) => item.id !== character.itemId)
      if (otherCubeItem) {
        add({
          ...clueBase(random, 'does-not-have-item', `${character.id}:${otherCubeItem.id}`),
          type: 'does-not-have-item',
          characterId: character.id,
          itemId: otherCubeItem.id,
        })
      }
    }

    if (puzzle.boardMode === 'map' && character.itemId) {
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

      const neighbors =
        puzzle.boardMode === 'logic-cube'
          ? buildingUnitsAreNeighbors(first, second)
          : areAdjacent(first, second)
      add({
        ...clueBase(random, neighbors ? 'adjacent' : 'not-adjacent', pairKey),
        type: neighbors ? 'adjacent' : 'not-adjacent',
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
      } else if (puzzle.boardMode === 'logic-cube') {
        add({
          ...clueBase(
            random,
            first.layer === second.layer ? 'same-floor' : 'different-floor',
            pairKey,
          ),
          type: first.layer === second.layer ? 'same-floor' : 'different-floor',
          firstCharacterId: firstCharacter.id,
          secondCharacterId: secondCharacter.id,
        })
        if (isBuildingAbove(first, second) || isBuildingAbove(second, first)) {
          const verticalType = isBuildingAbove(first, second) ? 'above' : 'below'
          add({
            ...clueBase(random, verticalType, pairKey),
            type: verticalType,
            firstCharacterId: firstCharacter.id,
            secondCharacterId: secondCharacter.id,
          })
        }
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

  if (puzzle.boardMode !== 'logic-cube')
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
