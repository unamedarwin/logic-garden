import type { Audience } from './types'

export type SpatialAudience = Exclude<Audience, 'children'>
export type SpatialPlanId = string

export interface PlanPoint {
  readonly x: number
  readonly y: number
}

export interface PlanZone {
  readonly path: readonly PlanPoint[]
  readonly label: PlanPoint
  readonly object: PlanPoint
}

export interface PlanObstacle {
  readonly column: number
  readonly row: number
}

export interface SpatialPlan {
  readonly id: SpatialPlanId
  readonly audience: SpatialAudience
  readonly zones: readonly PlanZone[]
  readonly obstacleAnchors: readonly PlanPoint[]
}

export const clusteredObstacleRoomIndex = 4

interface PlanTemplate {
  readonly id: string
  readonly zones: readonly PlanZone[]
  readonly obstacleAnchors: readonly PlanPoint[]
}

interface GridEdge {
  readonly start: readonly [number, number]
  readonly end: readonly [number, number]
}

type PlanTransform = 'base' | 'mirror-x' | 'mirror-y' | 'turn'

const planTransforms: readonly PlanTransform[] = ['base', 'mirror-x', 'mirror-y', 'turn']
const planInset = 0.02
const planSpan = 1 - planInset * 2

const canonicalCoordinate = (value: number) =>
  Math.min(1, Math.max(0, (value - planInset) / planSpan))

const snapCellCenterCoordinate = (value: number, dimension: number) => {
  const cell = Math.min(
    dimension - 1,
    Math.max(0, Math.floor(canonicalCoordinate(value) * dimension)),
  )
  return (cell + 0.5) / dimension
}

const pointKey = ([x, y]: readonly [number, number]) => `${x}:${y}`

const traceRegion = (
  map: readonly (readonly number[])[],
  region: number,
  inset = planInset,
  span = planSpan,
): readonly PlanPoint[] => {
  const rows = map.length
  const columns = map[0]?.length ?? 0
  const edges: GridEdge[] = []
  const isRegion = (row: number, column: number) => map[row]?.[column] === region

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      if (!isRegion(row, column)) continue
      if (!isRegion(row - 1, column)) {
        edges.push({ start: [column, row], end: [column + 1, row] })
      }
      if (!isRegion(row, column + 1)) {
        edges.push({ start: [column + 1, row], end: [column + 1, row + 1] })
      }
      if (!isRegion(row + 1, column)) {
        edges.push({ start: [column + 1, row + 1], end: [column, row + 1] })
      }
      if (!isRegion(row, column - 1)) {
        edges.push({ start: [column, row + 1], end: [column, row] })
      }
    }
  }

  const nextEdge = new Map(edges.map((edge) => [pointKey(edge.start), edge]))
  const first = edges[0]
  if (!first || columns === 0 || rows === 0) return []

  const vertices: Array<readonly [number, number]> = []
  let edge: GridEdge | undefined = first
  while (edge) {
    vertices.push(edge.start)
    nextEdge.delete(pointKey(edge.start))
    if (pointKey(edge.end) === pointKey(first.start)) break
    edge = nextEdge.get(pointKey(edge.end))
  }

  return vertices.map(([x, y]) => ({
    x: inset + (x / columns) * span,
    y: inset + (y / rows) * span,
  }))
}

const cellCenter = (column: number, row: number, size = 6): PlanPoint => ({
  x: planInset + ((column + 0.5) / size) * planSpan,
  y: planInset + ((row + 0.5) / size) * planSpan,
})

const sharedObstacleAnchors: readonly PlanPoint[] = [
  cellCenter(0, 0, 8),
  cellCenter(5, 0, 8),
  cellCenter(7, 2, 8),
  cellCenter(1, 4, 8),
  cellCenter(4, 3, 8),
  cellCenter(6, 5, 8),
  cellCenter(2, 3, 8),
  cellCenter(3, 7, 8),
  cellCenter(5, 6, 8),
  cellCenter(0, 7, 8),
  cellCenter(7, 0, 8),
  cellCenter(2, 1, 8),
  cellCenter(4, 6, 8),
  cellCenter(7, 4, 8),
  cellCenter(0, 3, 8),
  cellCenter(3, 2, 8),
  cellCenter(5, 3, 8),
  cellCenter(2, 6, 8),
  cellCenter(7, 7, 8),
  cellCenter(0, 5, 8),
]

const buildTemplate = (
  id: string,
  map: readonly (readonly number[])[],
  labels: readonly PlanPoint[],
  objects: readonly PlanPoint[],
  obstacleAnchors: readonly PlanPoint[],
): PlanTemplate => ({
  id,
  zones: Array.from({ length: 6 }, (_, region) => ({
    path: traceRegion(map, region),
    label: labels[region]!,
    object: objects[region]!,
  })),
  obstacleAnchors,
})

const courtyard = buildTemplate(
  'courtyard',
  [
    [0, 0, 0, 1, 1, 1],
    [0, 0, 0, 1, 1, 1],
    [2, 2, 0, 3, 1, 1],
    [2, 2, 3, 3, 3, 4],
    [2, 2, 3, 5, 4, 4],
    [2, 5, 5, 5, 4, 4],
  ],
  [
    cellCenter(1, 1),
    cellCenter(4, 1),
    cellCenter(0, 4),
    cellCenter(2, 3),
    cellCenter(5, 4),
    cellCenter(2, 5),
  ],
  [
    cellCenter(2, 0),
    cellCenter(5, 0),
    cellCenter(1, 3),
    cellCenter(3, 3),
    cellCenter(4, 5),
    cellCenter(3, 5),
  ],
  sharedObstacleAnchors,
)

const gallery = buildTemplate(
  'gallery',
  [
    [0, 0, 0, 0, 1, 1],
    [0, 0, 2, 2, 1, 1],
    [0, 2, 2, 3, 1, 1],
    [4, 2, 3, 3, 3, 1],
    [4, 4, 3, 5, 5, 5],
    [4, 4, 5, 5, 5, 5],
  ],
  [
    cellCenter(1, 1),
    cellCenter(5, 1),
    cellCenter(2, 2),
    cellCenter(3, 3),
    cellCenter(0, 5),
    cellCenter(4, 5),
  ],
  [
    cellCenter(3, 0),
    cellCenter(4, 2),
    cellCenter(1, 2),
    cellCenter(2, 4),
    cellCenter(1, 5),
    cellCenter(5, 4),
  ],
  sharedObstacleAnchors.map((anchor) => ({ x: anchor.y, y: anchor.x })),
)

const pavilion = buildTemplate(
  'pavilion',
  [
    [0, 0, 1, 1, 1, 1],
    [0, 0, 0, 1, 2, 2],
    [3, 0, 4, 4, 2, 2],
    [3, 3, 4, 4, 4, 2],
    [3, 3, 5, 5, 4, 2],
    [3, 5, 5, 5, 5, 5],
  ],
  [
    cellCenter(1, 1),
    cellCenter(3, 0),
    cellCenter(5, 2),
    cellCenter(0, 4),
    cellCenter(3, 3),
    cellCenter(3, 5),
  ],
  [
    cellCenter(2, 1),
    cellCenter(5, 0),
    cellCenter(4, 2),
    cellCenter(1, 3),
    cellCenter(4, 4),
    cellCenter(2, 5),
  ],
  sharedObstacleAnchors.map((anchor, index) => ({
    x: Math.min(0.93, Math.max(0.07, anchor.x + (index % 3) * 0.025 - 0.025)),
    y: Math.min(0.93, Math.max(0.07, anchor.y + (index % 2) * 0.03 - 0.015)),
  })),
)

const templates: Record<SpatialAudience, readonly PlanTemplate[]> = {
  teens: [gallery, pavilion, courtyard],
  adults: [courtyard, gallery, pavilion],
}

const transformPoint = (point: PlanPoint, transform: PlanTransform): PlanPoint => {
  switch (transform) {
    case 'base':
      return point
    case 'mirror-x':
      return { x: 1 - point.x, y: point.y }
    case 'mirror-y':
      return { x: point.x, y: 1 - point.y }
    case 'turn':
      return { x: point.y, y: 1 - point.x }
  }
}

const planId = (audience: SpatialAudience, template: PlanTemplate, transform: PlanTransform) =>
  `${audience}:${template.id}:${transform}`

const transformZone = (zone: PlanZone, transform: PlanTransform): PlanZone => ({
  path: zone.path.map((point) => transformPoint(point, transform)),
  label: transformPoint(zone.label, transform),
  object: transformPoint(zone.object, transform),
})

export const spatialPlanIdsForAudience = (
  audience: SpatialAudience,
): readonly SpatialPlanId[] =>
  templates[audience].flatMap((template) =>
    planTransforms.map((transform) => planId(audience, template, transform)),
  )

export const spatialPlanForId = (id: SpatialPlanId | undefined): SpatialPlan | undefined => {
  if (!id) return undefined
  for (const audience of ['teens', 'adults'] as const) {
    for (const template of templates[audience]) {
      for (const transform of planTransforms) {
        if (planId(audience, template, transform) !== id) continue
        return {
          id,
          audience,
          zones: template.zones.map((zone) => transformZone(zone, transform)),
          obstacleAnchors: template.obstacleAnchors.map((anchor) =>
            transformPoint(anchor, transform),
          ),
        }
      }
    }
  }
  return undefined
}

export const defaultSpatialPlanFor = (audience: SpatialAudience) => {
  const id = spatialPlanIdsForAudience(audience)[0]
  if (!id) throw new Error('A spatial audience needs at least one plan.')
  const plan = spatialPlanForId(id)
  if (!plan) throw new Error('The default spatial plan could not be loaded.')
  return plan
}

/**
 * Projects the normalized six-cell plan onto real grid lines. Every visual and
 * semantic layer must use this projection so walls never cut through a cell.
 */
export const spatialPlanForGrid = (
  plan: SpatialPlan,
  columns: number,
  rows: number,
): SpatialPlan => {
  const roomMap = Array.from({ length: rows }, (_, row) =>
    Array.from({ length: columns }, (_, column) => {
      const center = { x: (column + 0.5) / columns, y: (row + 0.5) / rows }
      return Math.max(
        0,
        plan.zones.findIndex((zone) => containsPoint(zone.path, center)),
      )
    }),
  )

  return {
    ...plan,
    zones: plan.zones.map((zone, index) => ({
      path: traceRegion(roomMap, index, 0, 1),
      label: {
        x: snapCellCenterCoordinate(zone.label.x, columns),
        y: snapCellCenterCoordinate(zone.label.y, rows),
      },
      object: {
        x: snapCellCenterCoordinate(zone.object.x, columns),
        y: snapCellCenterCoordinate(zone.object.y, rows),
      },
    })),
    obstacleAnchors: plan.obstacleAnchors.map((anchor) => ({
      x: snapCellCenterCoordinate(anchor.x, columns),
      y: snapCellCenterCoordinate(anchor.y, rows),
    })),
  }
}

const containsPoint = (path: readonly PlanPoint[], point: PlanPoint) => {
  let inside = false
  for (let index = 0, previous = path.length - 1; index < path.length; previous = index++) {
    const first = path[index]!
    const second = path[previous]!
    const crosses =
      first.y > point.y !== second.y > point.y &&
      point.x < ((second.x - first.x) * (point.y - first.y)) / (second.y - first.y) + first.x
    if (crosses) inside = !inside
  }
  return inside
}

export const spatialPlanZoneAt = (
  plan: SpatialPlan,
  column: number,
  row: number,
  columns: number,
  rows: number,
) => {
  const center = { x: (column + 0.5) / columns, y: (row + 0.5) / rows }
  return Math.max(
    0,
    plan.zones.findIndex((zone) => containsPoint(zone.path, center)),
  )
}

const obstacleCount = (size: number) => {
  if (size <= 6) return 6
  if (size <= 9) return 9
  return 20
}

export const planObstacles = (
  id: SpatialPlanId | undefined,
  columns: number,
  rows: number,
): readonly PlanObstacle[] => {
  const plan = spatialPlanForId(id)
  if (!plan) return []
  const found = new Map<string, PlanObstacle>()
  // The first anchors put a meaningful object in every room; larger boards then
  // receive extra furniture from the plan-specific obstacle distribution.
  for (const anchor of [...plan.zones.map((zone) => zone.object), ...plan.obstacleAnchors]) {
    const column = Math.min(columns - 1, Math.floor(anchor.x * columns))
    const row = Math.min(rows - 1, Math.floor(anchor.y * rows))
    found.set(`${row}:${column}`, { column, row })
    if (found.size >= obstacleCount(Math.max(columns, rows))) break
  }
  return [...found.values()]
}

export const gridPlaceLabel = (label: string) => label.replace(/\s+·\s+\d+(?:\.\d+)?$/u, '')
