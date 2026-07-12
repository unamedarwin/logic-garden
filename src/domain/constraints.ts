import type { Position } from './types'

export const manhattanDistance = (first: Position, second: Position) =>
  Math.abs(first.row - second.row) + Math.abs(first.column - second.column)

export const areAdjacent = (first: Position, second: Position) =>
  manhattanDistance(first, second) === 1

export const isStrictlyBetween = (middle: Position, first: Position, second: Position) => {
  const sameRow = middle.row === first.row && middle.row === second.row
  const sameColumn = middle.column === first.column && middle.column === second.column
  const betweenColumns =
    (first.column < middle.column && middle.column < second.column) ||
    (second.column < middle.column && middle.column < first.column)
  const betweenRows =
    (first.row < middle.row && middle.row < second.row) ||
    (second.row < middle.row && middle.row < first.row)

  return (sameRow && betweenColumns) || (sameColumn && betweenRows)
}
