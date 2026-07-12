import { describe, expect, it } from 'vitest'
import {
  spatialPlanForId,
  spatialPlanIdsForAudience,
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
})
