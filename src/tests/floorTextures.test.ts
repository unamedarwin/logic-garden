import { describe, expect, it } from 'vitest'
import {
  buildFloorDecorations,
  floorDecorationScale,
  floorMaterialDetails,
} from '../components/floorDecorations'
import {
  floorMaterialIds,
  floorTextureForMaterial,
  floorTextureForRoom,
} from '../components/floorTextures'
import { buildPondEdges, type PondEdge, type PondEdgeSide } from '../components/pondEdges'
import {
  clusteredObstacleRoomIndex,
  defaultSpatialPlanFor,
  spatialPlanForId,
  spatialPlanIdsForAudience,
  spatialPlanZoneAt,
  type PlanObstacle,
  type SpatialPlan,
} from '../domain/spatialPlan'
import { placeId, positionId, seed, type Position, type ThemeId } from '../domain/types'
import { getTheme } from '../domain/themes'
import { planObstaclesForPlan } from '../generator/solutionGenerator'

const advancedThemes: readonly ThemeId[] = [
  'music-studio',
  'sports-festival',
  'creative-lab',
  'book-club',
  'city-garden',
  'weekend-market',
]

const childThemes: readonly ThemeId[] = [
  'forest-party',
  'treasure-island',
  'kind-magic-school',
  'space-trip',
  'fun-farm',
  'sea-garden',
  'dino-park',
  'friendly-monster-town',
  'color-fair',
  'mountain-trip',
]

const positionsFor = (
  plan: SpatialPlan,
  size: number,
  obstacles: readonly PlanObstacle[] = [],
): readonly Position[] => {
  const blocked = new Set(obstacles.map(({ column, row }) => `${row}:${column}`))
  return Array.from({ length: size * size }, (_, index) => {
    const row = Math.floor(index / size)
    const column = index % size
    const room = spatialPlanZoneAt(plan, column, row, size, size)
    return {
      id: positionId(`position-${index}`),
      placeId: placeId(`place-${room}`),
      row,
      column,
      label: `${row}:${column}`,
      blocked: blocked.has(`${row}:${column}`),
    }
  })
}

const reachableCount = (obstacles: readonly PlanObstacle[]) => {
  const remaining = new Set(obstacles.map(({ column, row }) => `${row}:${column}`))
  const first = obstacles[0]
  if (!first) return 0
  const queue = [first]
  let reached = 0
  while (queue.length > 0) {
    const current = queue.shift()
    if (!current) break
    const key = `${current.row}:${current.column}`
    if (!remaining.delete(key)) continue
    reached += 1
    queue.push(
      { column: current.column + 1, row: current.row },
      { column: current.column - 1, row: current.row },
      { column: current.column, row: current.row + 1 },
      { column: current.column, row: current.row - 1 },
    )
  }
  return reached
}

const pondEdgeSteps = {
  top: { column: 0, row: -1 },
  right: { column: 1, row: 0 },
  bottom: { column: 0, row: 1 },
  left: { column: -1, row: 0 },
} satisfies Readonly<Record<PondEdgeSide, Readonly<{ column: number; row: number }>>>

const obstacleKey = ({ column, row }: Pick<PlanObstacle, 'column' | 'row'>) =>
  `${row}:${column}`

const expectedPondPerimeter = (pond: readonly PlanObstacle[]) => {
  const waterCells = new Set(pond.map(obstacleKey))
  return pond.reduce(
    (perimeter, cell) =>
      perimeter +
      Object.values(pondEdgeSteps).filter(
        ({ column, row }) =>
          !waterCells.has(obstacleKey({ column: cell.column + column, row: cell.row + row })),
      ).length,
    0,
  )
}

const expectOnlyOuterPondEdges = (
  pond: readonly PlanObstacle[],
  edges: readonly PondEdge[],
) => {
  const waterCells = new Set(pond.map(obstacleKey))
  const edgeIds = edges.map(
    ({ position, side }) => `${position.row}:${position.column}:${side}`,
  )

  expect(edges).toHaveLength(expectedPondPerimeter(pond))
  expect(new Set(edgeIds).size).toBe(edgeIds.length)
  for (const { position, side } of edges) {
    const step = pondEdgeSteps[side]
    expect(
      waterCells.has(
        obstacleKey({
          column: position.column + step.column,
          row: position.row + step.row,
        }),
      ),
    ).toBe(false)
  }
}

const syntheticPondPositions = (pond: readonly PlanObstacle[]): readonly Position[] =>
  pond.map(({ column, row }, index) => ({
    id: positionId(`synthetic-pond-${index}`),
    placeId: placeId('place-4'),
    row,
    column,
    label: `${row}:${column}`,
    blocked: true,
  }))

describe('floor textures', () => {
  it('assigns three local square SVG layers to every advanced room material', () => {
    for (const themeId of advancedThemes) {
      for (let roomIndex = 0; roomIndex < 6; roomIndex += 1) {
        const texture = floorTextureForRoom(themeId, roomIndex)
        expect(texture.layers).toHaveLength(3)
        for (const layer of texture.layers) {
          expect(layer).toMatch(/^url\("data:image\/svg\+xml,/u)
          expect(decodeURIComponent(layer)).toContain('viewBox=')
        }
      }
    }

    expect(floorMaterialIds).toHaveLength(14)
    for (const material of floorMaterialIds) {
      const texture = floorTextureForMaterial(material)
      const details = floorMaterialDetails(material)
      expect(texture.material).toBe(material)
      expect(texture.layers).toHaveLength(3)
      expect(details.motifs.length).toBeGreaterThan(0)
      for (const motif of details.motifs) {
        const palette = details.colorsByMotif[motif]
        expect(palette.length).toBeGreaterThanOrEqual(3)
        expect(new Set(palette).size).toBe(palette.length)
      }
    }
    expect(floorMaterialDetails('stone').motifs).not.toContain('diamond')
    expect(floorMaterialDetails('stone').motifs).not.toContain('gem')
  })

  it('gives every child adventure a varied local material for each room', () => {
    for (const themeId of childThemes) {
      const placeCount = getTheme(themeId).places.length
      const textures = Array.from({ length: placeCount }, (_, roomIndex) =>
        floorTextureForRoom(themeId, roomIndex),
      )
      expect(textures).toHaveLength(8)
      expect(new Set(textures.map(({ material }) => material)).size).toBeGreaterThanOrEqual(3)
      expect(textures.every(({ layers }) => layers.length === 3)).toBe(true)
    }

    expect(floorTextureForRoom('forest-party', 0).material).toBe('grass')
    expect(floorTextureForRoom('treasure-island', 0).material).toBe('sand')
    expect(floorTextureForRoom('space-trip', 0).material).toBe('metal')
    expect(floorTextureForRoom('sea-garden', 0).material).toBe('water')
  })

  it('keeps semantic motifs on distinct color palettes', () => {
    const flower = floorMaterialDetails('grass').colorsByMotif.flower
    const shell = floorMaterialDetails('sand').colorsByMotif.shell
    const music = floorMaterialDetails('stage').colorsByMotif.music

    expect(
      new Set([JSON.stringify(flower), JSON.stringify(shell), JSON.stringify(music)]).size,
    ).toBe(3)
    expect(flower).not.toEqual(shell)
    expect(flower).not.toEqual(music)
  })

  it('makes seeded variants structurally different rather than changing only a label', () => {
    const plan = defaultSpatialPlanFor('teens')
    const positions = positionsFor(plan, 9, planObstaclesForPlan(plan, 9, 9))
    const variants = ['first', 'second', 'third'].map((variant) =>
      buildFloorDecorations(
        plan,
        positions,
        9,
        9,
        'music-studio',
        seed(`visible-variant-${variant}`),
      ),
    )

    expect(new Set(variants.map((variant) => JSON.stringify(variant))).size).toBe(3)
    for (const variant of variants) {
      expect(variant.length).toBeGreaterThan(0)
      expect(
        variant.every(
          ({ scale }) =>
            scale >= floorDecorationScale.minimum && scale <= floorDecorationScale.maximum,
        ),
      ).toBe(true)
    }
  })

  it('decorates a seeded 25-75% of every room at every advanced board size', () => {
    const plan = defaultSpatialPlanFor('adults')
    for (const themeId of advancedThemes) {
      for (const size of [6, 9, 16] as const) {
        const obstacles = planObstaclesForPlan(plan, size, size)
        const positions = positionsFor(plan, size, obstacles)
        const compositionSeed = seed(`floor-density-${themeId}-${size}`)
        const first = buildFloorDecorations(
          plan,
          positions,
          size,
          size,
          themeId,
          compositionSeed,
        )
        const repeated = buildFloorDecorations(
          plan,
          positions,
          size,
          size,
          themeId,
          compositionSeed,
        )
        expect(repeated).toEqual(first)

        for (let roomIndex = 0; roomIndex < plan.zones.length; roomIndex += 1) {
          const roomSize = positions.filter(
            (position) =>
              !position.blocked &&
              spatialPlanZoneAt(plan, position.column, position.row, size, size) === roomIndex,
          ).length
          const decorated = first.filter(
            (decoration) => decoration.roomIndex === roomIndex,
          ).length
          expect(decorated).toBeGreaterThanOrEqual(Math.ceil(roomSize * 0.25))
          expect(decorated).toBeLessThanOrEqual(Math.floor(roomSize * 0.75))
        }
      }
    }
  })

  it('keeps the garden pond playable and paints one contiguous blocked water patch', () => {
    const pondRoomIndex = getTheme('city-garden').terrainFeature?.placeIndex
    expect(pondRoomIndex).toBe(clusteredObstacleRoomIndex)
    expect(floorTextureForRoom('city-garden', pondRoomIndex ?? -1).material).toBe('stone')
    expect(floorTextureForMaterial('water').material).toBe('water')

    for (const audience of ['teens', 'adults'] as const) {
      for (const planId of spatialPlanIdsForAudience(audience)) {
        const plan = spatialPlanForId(planId)
        expect(plan).toBeDefined()
        if (!plan) continue
        for (const [size, expectedWaterCells] of [
          [6, 1],
          [9, 2],
          [16, 4],
        ] as const) {
          const obstacles = planObstaclesForPlan(plan, size, size)
          const pond = obstacles.filter(
            ({ column, row }) =>
              spatialPlanZoneAt(plan, column, row, size, size) === pondRoomIndex,
          )
          expect(obstacles).toHaveLength(size <= 6 ? 6 : size <= 9 ? 9 : 20)
          expect(pond).toHaveLength(expectedWaterCells)
          expect(reachableCount(pond)).toBe(expectedWaterCells)
          const positions = positionsFor(plan, size, obstacles)
          const edges = buildPondEdges(positions, pondRoomIndex ?? -1)
          expectOnlyOuterPondEdges(pond, edges)
        }
      }
    }
  })

  it.each([
    {
      name: 'single cell',
      pond: [{ column: 2, row: 2 }],
      perimeter: 4,
    },
    {
      name: 'four-cell line',
      pond: [
        { column: 1, row: 2 },
        { column: 2, row: 2 },
        { column: 3, row: 2 },
        { column: 4, row: 2 },
      ],
      perimeter: 10,
    },
    {
      name: 'L shape',
      pond: [
        { column: 2, row: 2 },
        { column: 3, row: 2 },
        { column: 2, row: 3 },
      ],
      perimeter: 8,
    },
    {
      name: 'two by two block',
      pond: [
        { column: 2, row: 2 },
        { column: 3, row: 2 },
        { column: 2, row: 3 },
        { column: 3, row: 3 },
      ],
      perimeter: 8,
    },
  ] satisfies readonly {
    readonly name: string
    readonly pond: readonly PlanObstacle[]
    readonly perimeter: number
  }[])('derives the real exposed perimeter for a $name pond', ({ pond, perimeter }) => {
    const positions = syntheticPondPositions(pond)
    const edges = buildPondEdges(positions, 4)

    expect(expectedPondPerimeter(pond)).toBe(perimeter)
    expectOnlyOuterPondEdges(pond, edges)
  })
})
