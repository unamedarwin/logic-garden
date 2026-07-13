import { describe, expect, it } from 'vitest'
import { shareCubeAxisLine } from '../domain/constraints'
import { placeId, positionId, type Position } from '../domain/types'

const buildingPosition = (layer: number, row: number, column: number): Position => ({
  id: positionId(`${layer}:${row}:${column}`),
  placeId: placeId(`place-${layer}`),
  row,
  column,
  layer,
  label: 'Home',
})

describe('building line constraints', () => {
  it('keeps row and column lines within one floor', () => {
    const origin = buildingPosition(2, 2, 2)
    expect(shareCubeAxisLine(origin, buildingPosition(2, 2, 4))).toBe(true)
    expect(shareCubeAxisLine(origin, buildingPosition(2, 4, 2))).toBe(true)
    expect(shareCubeAxisLine(origin, buildingPosition(2, 4, 4))).toBe(false)
  })

  it('limits the height conflict to the floors immediately above and below', () => {
    const origin = buildingPosition(2, 2, 2)
    expect(shareCubeAxisLine(origin, buildingPosition(1, 2, 2))).toBe(true)
    expect(shareCubeAxisLine(origin, buildingPosition(3, 2, 2))).toBe(true)
    expect(shareCubeAxisLine(origin, buildingPosition(4, 2, 2))).toBe(false)
    expect(shareCubeAxisLine(origin, buildingPosition(3, 2, 3))).toBe(false)
  })
})
