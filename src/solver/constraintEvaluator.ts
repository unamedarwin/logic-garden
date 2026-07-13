import {
  areAdjacent,
  isStrictlyBetween,
  manhattanDistance,
  isCornerPosition,
  shareCubeAxisLine,
} from '../domain/constraints'
import { buildingUnitsAreNeighbors, isBuildingAbove } from '../domain/buildingPlan'
import type { CharacterId, Clue, PartialAssignment, Position, Puzzle } from '../domain/types'

const positionFor = (
  puzzle: Puzzle,
  assignment: PartialAssignment,
  characterId: CharacterId,
): Position | undefined => {
  const assignedPosition = assignment[characterId]
  return assignedPosition
    ? puzzle.positions.find((position) => position.id === assignedPosition)
    : undefined
}

const characterHasItem = (puzzle: Puzzle, characterId: CharacterId, itemId: string) => {
  return puzzle.characters.find((character) => character.id === characterId)?.itemId === itemId
}

const itemPlaceMatches = (
  puzzle: Puzzle,
  assignment: PartialAssignment,
  itemId: string,
  placeId: string,
) => {
  const assignedPosition = Object.values(assignment)
    .map((positionId) => puzzle.positions.find((position) => position.id === positionId))
    .find((position) => position?.itemId === itemId)
  return !assignedPosition || assignedPosition.placeId === placeId
}

export const isClueSatisfiedByPartialAssignment = (
  puzzle: Puzzle,
  clue: Clue,
  assignment: PartialAssignment,
) => {
  switch (clue.type) {
    case 'character-at-position': {
      const position = positionFor(puzzle, assignment, clue.characterId)
      return !position || position.id === clue.positionId
    }
    case 'character-not-at-position': {
      const position = positionFor(puzzle, assignment, clue.characterId)
      return !position || position.id !== clue.positionId
    }
    case 'character-in-place': {
      const position = positionFor(puzzle, assignment, clue.characterId)
      return !position || position.placeId === clue.placeId
    }
    case 'character-not-in-place': {
      const position = positionFor(puzzle, assignment, clue.characterId)
      return !position || position.placeId !== clue.placeId
    }
    case 'in-corner':
    case 'not-in-corner': {
      const position = positionFor(puzzle, assignment, clue.characterId)
      if (!position) return true
      const corner = isCornerPosition(puzzle.positions, position)
      return clue.type === 'in-corner' ? corner : !corner
    }
    case 'character-next-to-obstacle': {
      const position = positionFor(puzzle, assignment, clue.characterId)
      const obstacle = puzzle.positions.find(
        (candidate) => candidate.id === clue.obstaclePositionId && candidate.blocked,
      )
      return (
        !position ||
        Boolean(
          obstacle && obstacle.placeId === position.placeId && areAdjacent(position, obstacle),
        )
      )
    }
    case 'has-item':
      return characterHasItem(puzzle, clue.characterId, clue.itemId)
    case 'does-not-have-item':
      return !characterHasItem(puzzle, clue.characterId, clue.itemId)
    case 'item-in-place':
      return itemPlaceMatches(puzzle, assignment, clue.itemId, clue.placeId)
    case 'item-not-in-place': {
      const assignedPosition = Object.values(assignment)
        .map((positionId) => puzzle.positions.find((position) => position.id === positionId))
        .find((position) => position?.itemId === clue.itemId)
      return !assignedPosition || assignedPosition.placeId !== clue.placeId
    }
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
    case 'distance': {
      const first = positionFor(puzzle, assignment, clue.firstCharacterId)
      const second = positionFor(puzzle, assignment, clue.secondCharacterId)
      if (!first || !second) return true

      switch (clue.type) {
        case 'adjacent':
          return puzzle.boardMode === 'logic-cube'
            ? buildingUnitsAreNeighbors(first, second)
            : areAdjacent(first, second)
        case 'not-adjacent':
          return puzzle.boardMode === 'logic-cube'
            ? !buildingUnitsAreNeighbors(first, second)
            : !areAdjacent(first, second)
        case 'same-row':
          return first.row === second.row
        case 'different-row':
          return first.row !== second.row
        case 'same-column':
          return first.column === second.column
        case 'different-column':
          return first.column !== second.column
        case 'left-of':
          return puzzle.boardMode === 'map'
            ? first.row === second.row && first.column < second.column
            : first.column < second.column
        case 'right-of':
          return puzzle.boardMode === 'map'
            ? first.row === second.row && first.column > second.column
            : first.column > second.column
        case 'above':
          return puzzle.boardMode === 'logic-cube'
            ? isBuildingAbove(first, second)
            : puzzle.boardMode === 'map'
              ? first.column === second.column && first.row < second.row
              : first.row < second.row
        case 'below':
          return puzzle.boardMode === 'logic-cube'
            ? isBuildingAbove(second, first)
            : puzzle.boardMode === 'map'
              ? first.column === second.column && first.row > second.row
              : first.row > second.row
        case 'distance':
          return manhattanDistance(first, second) === clue.distance
        default:
          return false
      }
    }
    case 'same-floor':
    case 'different-floor': {
      const first = positionFor(puzzle, assignment, clue.firstCharacterId)
      const second = positionFor(puzzle, assignment, clue.secondCharacterId)
      if (!first || !second) return true
      return clue.type === 'same-floor'
        ? first.layer === second.layer
        : first.layer !== second.layer
    }
    case 'between': {
      const middle = positionFor(puzzle, assignment, clue.characterId)
      const first = positionFor(puzzle, assignment, clue.firstCharacterId)
      const second = positionFor(puzzle, assignment, clue.secondCharacterId)
      return !middle || !first || !second || isStrictlyBetween(middle, first, second)
    }
  }
}

export const isPartialAssignmentValid = (puzzle: Puzzle, assignment: PartialAssignment) => {
  const assignedPositions = Object.values(assignment)
  if (new Set(assignedPositions).size !== assignedPositions.length) return false

  if (puzzle.boardMode === 'logic-grid') {
    const occupied = assignedPositions
      .map((positionId) => puzzle.positions.find((position) => position.id === positionId))
      .filter((position): position is Position => Boolean(position))
    if (new Set(occupied.map((position) => position.row)).size !== occupied.length) return false
    if (new Set(occupied.map((position) => position.column)).size !== occupied.length)
      return false
  }

  if (puzzle.boardMode === 'logic-cube') {
    const occupied = assignedPositions
      .map((positionId) => puzzle.positions.find((position) => position.id === positionId))
      .filter((position): position is Position => Boolean(position))
    if (
      occupied.some((position, index) =>
        occupied.slice(index + 1).some((other) => shareCubeAxisLine(position, other)),
      )
    )
      return false
  }

  for (const [characterId, assignedPositionId] of Object.entries(assignment)) {
    const knownCharacter = puzzle.characters.some((character) => character.id === characterId)
    const position = puzzle.positions.find((candidate) => candidate.id === assignedPositionId)
    if (!knownCharacter || !position || position.blocked) return false
  }

  return puzzle.clues.every((clue) =>
    isClueSatisfiedByPartialAssignment(puzzle, clue, assignment),
  )
}
