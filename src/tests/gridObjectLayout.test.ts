import { describe, expect, it } from 'vitest'
import {
  gridObjectLayout,
  horizontalWalls,
  layoutBoxesOverlap,
  type LayoutBox,
} from '../components/gridObjectLayout'
import {
  planObstacles,
  spatialPlanForId,
  spatialPlanForGrid,
  spatialPlanIdsForAudience,
  spatialPlanZoneAt,
  type PlanPoint,
  type SpatialPlan,
} from '../domain/spatialPlan'
import { placeId, positionId, type Position } from '../domain/types'

const centerKey = (point: PlanPoint) => `${point.x.toFixed(6)}:${point.y.toFixed(6)}`

const makePositions = (plan: SpatialPlan, size: number): readonly Position[] => {
  const blocked = new Set(
    planObstacles(plan.id, size, size).map(({ row, column }) => `${row}:${column}`),
  )
  return Array.from({ length: size * size }, (_, index) => {
    const row = Math.floor(index / size)
    const column = index % size
    const zone = spatialPlanZoneAt(plan, column, row, size, size)
    return {
      id: positionId(`position-${row}-${column}`),
      placeId: placeId(`place-${zone}`),
      row,
      column,
      label: `Place ${zone} · ${row + 1}.${column + 1}`,
      blocked: blocked.has(`${row}:${column}`),
    }
  })
}

const positionAt = (positions: readonly Position[], point: PlanPoint, size: number) =>
  positions.find(
    (position) =>
      position.column === Math.floor(point.x * size) &&
      position.row === Math.floor(point.y * size),
  )

const obstacleBox = (position: Position, size: number): LayoutBox => {
  const halfSize = 0.35 / size
  const x = (position.column + 0.5) / size
  const y = (position.row + 0.5) / size
  return {
    left: x - halfSize,
    right: x + halfSize,
    top: y - halfSize,
    bottom: y + halfSize,
  }
}

describe('spatial label and object layout', () => {
  it('anchors one object and one readable label inside every room at every grid size', () => {
    for (const audience of ['teens', 'adults'] as const) {
      for (const id of spatialPlanIdsForAudience(audience)) {
        const plan = spatialPlanForId(id)
        if (!plan) throw new Error(`Missing spatial plan ${id}`)

        for (const size of [6, 9, 16]) {
          const positions = makePositions(plan, size)
          const alignedPlan = spatialPlanForGrid(plan, size, size)
          const labels = plan.zones.map((_, index) => `Shared workshop area ${index}`)
          const occupied = positions.find((position) => !position.blocked)?.id
          const layout = gridObjectLayout(alignedPlan, positions, labels, [occupied])
          const labelInset = size <= 6 ? 0.15 : size <= 9 ? 0.11 : 0.085
          const obstacleBoxes = positions
            .filter((position) => position.blocked)
            .map((position) => obstacleBox(position, size))

          expect(layout, `${id} at ${size}x${size}`).toHaveLength(plan.zones.length)
          for (let first = 0; first < layout.length; first += 1) {
            for (let second = first + 1; second < layout.length; second += 1) {
              expect(
                layoutBoxesOverlap(layout[first]!.labelBox, layout[second]!.labelBox),
                `${id} labels ${first}/${second} at ${size}`,
              ).toBe(false)
            }
          }

          layout.forEach(({ object, label, labelBox, labelTransform, labelWall }, zone) => {
            const objectPosition = positionAt(positions, object, size)
            expect(objectPosition?.blocked, `${id} object ${zone} at ${size}`).toBe(true)
            expect(objectPosition?.placeId).toBe(`place-${zone}`)
            expect(centerKey(label)).not.toBe(centerKey(object))
            expect(
              horizontalWalls(alignedPlan.zones[zone]!.path).some(
                (wall) =>
                  Math.abs(wall.y - label.y) < 0.000_001 &&
                  label.x >= wall.left &&
                  label.x <= wall.right,
              ),
              `${id} label ${zone} is not on a horizontal wall at ${size}`,
            ).toBe(true)
            expect(labelBox.left).toBeGreaterThanOrEqual(labelWall.left - 0.000_001)
            expect(labelBox.right).toBeLessThanOrEqual(labelWall.right + 0.000_001)
            if (size === 16) {
              expect(
                labelBox.bottom - labelBox.top,
                `${id} label ${zone} must reserve its wrapped mobile height`,
              ).toBeGreaterThan(0.1)
            }
            obstacleBoxes.forEach((box, obstacle) => {
              expect(
                layoutBoxesOverlap(labelBox, box),
                `${id} label ${zone} overlaps obstacle ${obstacle} at ${size}`,
              ).toBe(false)
            })
            if (occupied) {
              const occupiedPosition = positions.find((position) => position.id === occupied)!
              const occupiedBox = obstacleBox(occupiedPosition, size)
              expect(layoutBoxesOverlap(labelBox, occupiedBox)).toBe(false)
            }
            if (label.x < labelInset) expect(labelTransform).toContain('translate(0%')
            if (label.x > 1 - labelInset) expect(labelTransform).toContain('translate(-100%')
            if (label.y < labelInset) expect(labelTransform).toContain(', 0%)')
            if (label.y > 1 - labelInset) expect(labelTransform).toContain(', -100%)')
          })
        }
      }
    }
  }, 20_000)
})
