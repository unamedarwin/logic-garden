import { describe, expect, it } from 'vitest'
import {
  gridObjectLayout,
  layoutBoxesOverlap,
  type LayoutBox,
} from '../components/gridObjectLayout'
import {
  planObstacles,
  spatialPlanForId,
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
          const labels = plan.zones.map((_, index) => `Shared workshop area ${index}`)
          const layout = gridObjectLayout(plan, positions, labels)
          const labelInset = size <= 6 ? 0.15 : size <= 9 ? 0.11 : 0.085
          const obstacleBoxes = positions
            .filter((position) => position.blocked)
            .map((position) => obstacleBox(position, size))

          expect(layout, `${id} at ${size}x${size}`).toHaveLength(plan.zones.length)
          expect(new Set(layout.map(({ label }) => centerKey(label))).size).toBe(layout.length)
          for (let first = 0; first < layout.length; first += 1) {
            for (let second = first + 1; second < layout.length; second += 1) {
              expect(
                layoutBoxesOverlap(layout[first]!.labelBox, layout[second]!.labelBox),
                `${id} labels ${first}/${second} at ${size}`,
              ).toBe(false)
            }
          }

          layout.forEach(({ object, label, labelBox, labelTransform }, zone) => {
            const objectPosition = positionAt(positions, object, size)
            const labelPosition = positionAt(positions, label, size)
            expect(objectPosition?.blocked, `${id} object ${zone} at ${size}`).toBe(true)
            expect(objectPosition?.placeId).toBe(`place-${zone}`)
            expect(labelPosition?.blocked, `${id} label ${zone} at ${size}`).toBe(false)
            expect(labelPosition?.placeId).toBe(`place-${zone}`)
            expect(centerKey(label)).not.toBe(centerKey(object))
            obstacleBoxes.forEach((box, obstacle) => {
              expect(
                layoutBoxesOverlap(labelBox, box),
                `${id} label ${zone} overlaps obstacle ${obstacle} at ${size}`,
              ).toBe(false)
            })
            if (label.x < labelInset) expect(labelTransform).toContain('translate(0%')
            if (label.x > 1 - labelInset) expect(labelTransform).toContain('translate(-100%')
            if (label.y < labelInset) expect(labelTransform).toContain(', 0%)')
            if (label.y > 1 - labelInset) expect(labelTransform).toContain(', -100%)')
          })
        }
      }
    }
  })
})
