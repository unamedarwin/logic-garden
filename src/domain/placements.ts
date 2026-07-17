import { shareCubeAxisLine } from './constraints'
import type { Position, PositionId, Puzzle } from './types'

const isBuildingRoom = (position: Position) =>
  position.buildingKind === 'home' || position.buildingKind === 'shop'

const roomKey = (position: Position) =>
  position.layer === undefined || !position.buildingUnitId
    ? undefined
    : `${position.layer}:${position.buildingUnitId}`

const canonicalRoomDestination = (positions: readonly Position[]) => {
  const playable = positions.filter((position) => !position.blocked)
  if (playable.length === 0) return undefined
  const rowCenter =
    positions.reduce((total, position) => total + position.row, 0) / positions.length
  const columnCenter =
    positions.reduce((total, position) => total + position.column, 0) / positions.length
  return [...playable].sort(
    (first, second) =>
      (first.row - rowCenter) ** 2 +
        (first.column - columnCenter) ** 2 -
        ((second.row - rowCenter) ** 2 + (second.column - columnCenter) ** 2) ||
      first.row - second.row ||
      first.column - second.column ||
      first.id.localeCompare(second.id),
  )[0]
}

export const buildingUsesRoomPlacement = (puzzle: Puzzle) =>
  puzzle.boardMode === 'logic-cube' && puzzle.buildingPlacement === 'rooms'

export const buildingRoomDestinationsForPositions = (
  positions: readonly Position[],
): readonly Position[] => {
  const rooms = new Map<string, Position[]>()
  for (const position of positions) {
    const key = roomKey(position)
    if (!key || !isBuildingRoom(position)) continue
    const room = rooms.get(key) ?? []
    room.push(position)
    rooms.set(key, room)
  }
  return [...rooms.values()]
    .map(canonicalRoomDestination)
    .filter((position): position is Position => position !== undefined)
    .sort(
      (first, second) =>
        (first.layer ?? 0) - (second.layer ?? 0) ||
        first.row - second.row ||
        first.column - second.column,
    )
}

export const placementDestinations = (puzzle: Puzzle): readonly Position[] =>
  buildingUsesRoomPlacement(puzzle)
    ? buildingRoomDestinationsForPositions(puzzle.positions)
    : puzzle.positions.filter((position) => !position.blocked)

export const placementDestinationFor = (
  puzzle: Puzzle,
  positionId: PositionId,
): Position | undefined => {
  const position = puzzle.positions.find((candidate) => candidate.id === positionId)
  if (!position || position.blocked) return undefined
  if (!buildingUsesRoomPlacement(puzzle)) return position
  const key = roomKey(position)
  return key
    ? placementDestinations(puzzle).find((candidate) => roomKey(candidate) === key)
    : undefined
}

export const placementsConflict = (puzzle: Puzzle, first: Position, second: Position) => {
  if (first.id === second.id) return true
  if (puzzle.boardMode === 'logic-grid') {
    return first.row === second.row || first.column === second.column
  }
  if (puzzle.boardMode !== 'logic-cube') return false
  if (buildingUsesRoomPlacement(puzzle)) return roomKey(first) === roomKey(second)
  return shareCubeAxisLine(first, second)
}
