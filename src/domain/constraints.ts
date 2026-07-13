import type { Position } from './types'

export const manhattanDistance = (first: Position, second: Position) =>
  Math.abs(first.row - second.row) +
  Math.abs(first.column - second.column) +
  Math.abs((first.layer ?? 0) - (second.layer ?? 0))

export const areAdjacent = (first: Position, second: Position) =>
  manhattanDistance(first, second) === 1

export const shareCubeAxisLine = (first: Position, second: Position) => {
  if (first.layer === undefined || second.layer === undefined) return false
  const sameLayer = first.layer === second.layer
  const sameRow = first.row === second.row
  const sameColumn = first.column === second.column
  const neighboringLayers = Math.abs(first.layer - second.layer) === 1
  return sameLayer ? sameRow || sameColumn : neighboringLayers && sameRow && sameColumn
}

export const isCornerPosition = (positions: readonly Position[], position: Position) => {
  const sameSurface = positions.filter(
    (candidate) => (candidate.layer ?? 0) === (position.layer ?? 0),
  )
  const lastRow = Math.max(...sameSurface.map((candidate) => candidate.row))
  const lastColumn = Math.max(...sameSurface.map((candidate) => candidate.column))
  return (
    (position.row === 0 || position.row === lastRow) &&
    (position.column === 0 || position.column === lastColumn)
  )
}

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
