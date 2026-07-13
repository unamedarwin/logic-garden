import { describe, expect, it } from 'vitest'
import {
  spatialPlanForId,
  spatialPlanForGrid,
  spatialPlanIdsForAudience,
  spatialPlanZoneAt,
  type PlanPoint,
} from '../domain/spatialPlan'

const polygonArea = (path: readonly PlanPoint[]) =>
  Math.abs(
    path.reduce((sum, point, index) => {
      const next = path[(index + 1) % path.length]!
      return sum + point.x * next.y - next.x * point.y
    }, 0) / 2,
  )

describe('spatial plan catalog', () => {
  it('contains twelve connected orthogonal floor variants per spatial audience', () => {
    for (const audience of ['teens', 'adults'] as const) {
      const ids = spatialPlanIdsForAudience(audience)
      expect(ids).toHaveLength(12)

      for (const id of ids) {
        const plan = spatialPlanForId(id)
        if (!plan) throw new Error(`Missing spatial plan ${id}`)
        expect(plan.zones).toHaveLength(6)

        for (const zone of plan.zones) {
          expect(zone.path.length).toBeGreaterThanOrEqual(4)
          for (let index = 0; index < zone.path.length; index += 1) {
            const point = zone.path[index]!
            const next = zone.path[(index + 1) % zone.path.length]!
            expect(point.x === next.x || point.y === next.y).toBe(true)
          }
        }

        const coveredArea = plan.zones.reduce((sum, zone) => sum + polygonArea(zone.path), 0)
        expect(coveredArea).toBeCloseTo(0.96 * 0.96, 8)
      }
    }
  })

  it('projects every room wall onto grid lines without changing any cell room', () => {
    for (const audience of ['teens', 'adults'] as const) {
      for (const id of spatialPlanIdsForAudience(audience)) {
        const plan = spatialPlanForId(id)
        if (!plan) throw new Error(`Missing spatial plan ${id}`)

        for (const size of [6, 9, 16]) {
          const projected = spatialPlanForGrid(plan, size, size)
          const coveredArea = projected.zones.reduce(
            (sum, zone) => sum + polygonArea(zone.path),
            0,
          )
          expect(coveredArea, `${id} projected at ${size}`).toBeCloseTo(1, 8)

          for (const zone of projected.zones) {
            for (const point of zone.path) {
              expect(point.x * size, `${id} x edge at ${size}`).toBeCloseTo(
                Math.round(point.x * size),
                8,
              )
              expect(point.y * size, `${id} y edge at ${size}`).toBeCloseTo(
                Math.round(point.y * size),
                8,
              )
            }
          }

          for (let row = 0; row < size; row += 1) {
            for (let column = 0; column < size; column += 1) {
              expect(
                spatialPlanZoneAt(projected, column, row, size, size),
                `${id} room at ${size}:${row}.${column}`,
              ).toBe(spatialPlanZoneAt(plan, column, row, size, size))
            }
          }
        }
      }
    }
  })
})
