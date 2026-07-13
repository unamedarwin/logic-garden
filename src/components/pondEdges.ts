import type { Position } from '../domain/types'

export type PondEdgeSide = 'bottom' | 'left' | 'right' | 'top'

export interface PondEdge {
  readonly position: Position
  readonly side: PondEdgeSide
}

const directions: readonly (readonly [PondEdgeSide, number, number])[] = [
  ['top', 0, -1],
  ['right', 1, 0],
  ['bottom', 0, 1],
  ['left', -1, 0],
]

const cellKey = (column: number, row: number) => `${row}:${column}`

export const buildPondEdges = (
  positions: readonly Position[],
  pondPlaceIndex: number,
): readonly PondEdge[] => {
  const placeId = `place-${pondPlaceIndex}`
  const waterPositions = positions.filter(
    (position) => position.blocked && position.placeId === placeId,
  )
  const waterCells = new Set(
    waterPositions.map((position) => cellKey(position.column, position.row)),
  )

  return waterPositions.flatMap((position) =>
    directions.flatMap(([side, columnStep, rowStep]) =>
      waterCells.has(cellKey(position.column + columnStep, position.row + rowStep))
        ? []
        : [{ position, side }],
    ),
  )
}
