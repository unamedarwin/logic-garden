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

interface PlanTemplate {
  readonly id: string
  readonly zones: readonly PlanZone[]
  readonly obstacleAnchors: readonly PlanPoint[]
}

type PlanTransform = 'base' | 'mirror-x' | 'mirror-y' | 'turn'

const planTransforms: readonly PlanTransform[] = ['base', 'mirror-x', 'mirror-y', 'turn']

const teenPulse: PlanTemplate = {
  id: 'pulse',
  zones: [
    {
      path: [
        { x: 0.03, y: 0.05 },
        { x: 0.35, y: 0.02 },
        { x: 0.46, y: 0.16 },
        { x: 0.37, y: 0.36 },
        { x: 0.03, y: 0.31 },
      ],
      label: { x: 0.19, y: 0.2 },
      object: { x: 0.25, y: 0.12 },
    },
    {
      path: [
        { x: 0.57, y: 0.03 },
        { x: 0.97, y: 0.06 },
        { x: 0.97, y: 0.37 },
        { x: 0.72, y: 0.37 },
        { x: 0.72, y: 0.23 },
        { x: 0.55, y: 0.23 },
      ],
      label: { x: 0.79, y: 0.29 },
      object: { x: 0.84, y: 0.14 },
    },
    {
      path: [
        { x: 0.03, y: 0.39 },
        { x: 0.23, y: 0.39 },
        { x: 0.35, y: 0.58 },
        { x: 0.27, y: 0.97 },
        { x: 0.03, y: 0.97 },
      ],
      label: { x: 0.15, y: 0.74 },
      object: { x: 0.1, y: 0.53 },
    },
    {
      path: [
        { x: 0.38, y: 0.37 },
        { x: 0.62, y: 0.37 },
        { x: 0.77, y: 0.53 },
        { x: 0.62, y: 0.72 },
        { x: 0.36, y: 0.67 },
        { x: 0.26, y: 0.5 },
      ],
      label: { x: 0.5, y: 0.56 },
      object: { x: 0.5, y: 0.45 },
    },
    {
      path: [
        { x: 0.73, y: 0.42 },
        { x: 0.97, y: 0.42 },
        { x: 0.97, y: 0.97 },
        { x: 0.58, y: 0.97 },
        { x: 0.58, y: 0.77 },
        { x: 0.73, y: 0.77 },
      ],
      label: { x: 0.79, y: 0.82 },
      object: { x: 0.88, y: 0.9 },
    },
    {
      path: [
        { x: 0.34, y: 0.73 },
        { x: 0.57, y: 0.73 },
        { x: 0.57, y: 0.97 },
        { x: 0.29, y: 0.97 },
      ],
      label: { x: 0.45, y: 0.86 },
      object: { x: 0.44, y: 0.79 },
    },
  ],
  obstacleAnchors: [
    { x: 0.1, y: 0.3 },
    { x: 0.51, y: 0.12 },
    { x: 0.88, y: 0.29 },
    { x: 0.19, y: 0.78 },
    { x: 0.61, y: 0.56 },
    { x: 0.89, y: 0.82 },
    { x: 0.32, y: 0.55 },
    { x: 0.47, y: 0.89 },
    { x: 0.73, y: 0.64 },
    { x: 0.12, y: 0.92 },
    { x: 0.76, y: 0.1 },
    { x: 0.27, y: 0.15 },
    { x: 0.57, y: 0.76 },
    { x: 0.94, y: 0.58 },
    { x: 0.04, y: 0.54 },
    { x: 0.38, y: 0.31 },
    { x: 0.67, y: 0.45 },
    { x: 0.33, y: 0.96 },
    { x: 0.94, y: 0.96 },
    { x: 0.05, y: 0.06 },
  ],
}

const teenCircuit: PlanTemplate = {
  id: 'circuit',
  zones: [
    {
      path: [
        { x: 0.03, y: 0.04 },
        { x: 0.46, y: 0.04 },
        { x: 0.41, y: 0.27 },
        { x: 0.18, y: 0.31 },
        { x: 0.03, y: 0.2 },
      ],
      label: { x: 0.22, y: 0.18 },
      object: { x: 0.31, y: 0.1 },
    },
    {
      path: [
        { x: 0.55, y: 0.04 },
        { x: 0.97, y: 0.04 },
        { x: 0.97, y: 0.4 },
        { x: 0.79, y: 0.4 },
        { x: 0.7, y: 0.25 },
        { x: 0.52, y: 0.2 },
      ],
      label: { x: 0.77, y: 0.27 },
      object: { x: 0.87, y: 0.13 },
    },
    {
      path: [
        { x: 0.04, y: 0.39 },
        { x: 0.27, y: 0.34 },
        { x: 0.45, y: 0.5 },
        { x: 0.34, y: 0.74 },
        { x: 0.04, y: 0.69 },
      ],
      label: { x: 0.2, y: 0.55 },
      object: { x: 0.12, y: 0.48 },
    },
    {
      path: [
        { x: 0.48, y: 0.3 },
        { x: 0.68, y: 0.35 },
        { x: 0.75, y: 0.54 },
        { x: 0.62, y: 0.69 },
        { x: 0.42, y: 0.61 },
        { x: 0.35, y: 0.45 },
      ],
      label: { x: 0.54, y: 0.49 },
      object: { x: 0.58, y: 0.4 },
    },
    {
      path: [
        { x: 0.8, y: 0.45 },
        { x: 0.97, y: 0.47 },
        { x: 0.97, y: 0.96 },
        { x: 0.64, y: 0.96 },
        { x: 0.67, y: 0.72 },
        { x: 0.81, y: 0.67 },
      ],
      label: { x: 0.82, y: 0.77 },
      object: { x: 0.9, y: 0.9 },
    },
    {
      path: [
        { x: 0.04, y: 0.76 },
        { x: 0.36, y: 0.78 },
        { x: 0.58, y: 0.96 },
        { x: 0.04, y: 0.96 },
      ],
      label: { x: 0.26, y: 0.87 },
      object: { x: 0.12, y: 0.86 },
    },
  ],
  obstacleAnchors: [
    { x: 0.14, y: 0.16 },
    { x: 0.66, y: 0.12 },
    { x: 0.86, y: 0.32 },
    { x: 0.2, y: 0.57 },
    { x: 0.54, y: 0.5 },
    { x: 0.84, y: 0.77 },
    { x: 0.35, y: 0.45 },
    { x: 0.17, y: 0.85 },
    { x: 0.64, y: 0.84 },
    { x: 0.95, y: 0.62 },
    { x: 0.05, y: 0.56 },
    { x: 0.43, y: 0.11 },
    { x: 0.74, y: 0.53 },
    { x: 0.49, y: 0.94 },
    { x: 0.95, y: 0.94 },
    { x: 0.06, y: 0.06 },
    { x: 0.37, y: 0.66 },
    { x: 0.69, y: 0.29 },
    { x: 0.27, y: 0.29 },
    { x: 0.58, y: 0.72 },
  ],
}

const teenHarbor: PlanTemplate = {
  id: 'harbor',
  zones: [
    {
      path: [
        { x: 0.04, y: 0.04 },
        { x: 0.36, y: 0.04 },
        { x: 0.47, y: 0.22 },
        { x: 0.32, y: 0.4 },
        { x: 0.05, y: 0.31 },
      ],
      label: { x: 0.21, y: 0.23 },
      object: { x: 0.29, y: 0.13 },
    },
    {
      path: [
        { x: 0.59, y: 0.04 },
        { x: 0.96, y: 0.04 },
        { x: 0.96, y: 0.28 },
        { x: 0.74, y: 0.39 },
        { x: 0.55, y: 0.23 },
      ],
      label: { x: 0.77, y: 0.22 },
      object: { x: 0.86, y: 0.11 },
    },
    {
      path: [
        { x: 0.04, y: 0.44 },
        { x: 0.27, y: 0.4 },
        { x: 0.38, y: 0.59 },
        { x: 0.28, y: 0.96 },
        { x: 0.04, y: 0.96 },
      ],
      label: { x: 0.17, y: 0.72 },
      object: { x: 0.11, y: 0.53 },
    },
    {
      path: [
        { x: 0.42, y: 0.36 },
        { x: 0.64, y: 0.31 },
        { x: 0.79, y: 0.49 },
        { x: 0.66, y: 0.69 },
        { x: 0.39, y: 0.67 },
        { x: 0.31, y: 0.51 },
      ],
      label: { x: 0.52, y: 0.55 },
      object: { x: 0.54, y: 0.43 },
    },
    {
      path: [
        { x: 0.82, y: 0.4 },
        { x: 0.96, y: 0.36 },
        { x: 0.96, y: 0.96 },
        { x: 0.59, y: 0.96 },
        { x: 0.6, y: 0.75 },
        { x: 0.77, y: 0.68 },
      ],
      label: { x: 0.8, y: 0.79 },
      object: { x: 0.89, y: 0.9 },
    },
    {
      path: [
        { x: 0.35, y: 0.75 },
        { x: 0.57, y: 0.73 },
        { x: 0.57, y: 0.96 },
        { x: 0.31, y: 0.96 },
      ],
      label: { x: 0.45, y: 0.86 },
      object: { x: 0.45, y: 0.79 },
    },
  ],
  obstacleAnchors: teenPulse.obstacleAnchors.map((anchor, index) => ({
    x: Math.min(0.96, anchor.y + (index % 2) * 0.03),
    y: Math.min(0.96, anchor.x + (index % 3) * 0.02),
  })),
}

const adultCourtyard: PlanTemplate = {
  id: 'courtyard',
  zones: [
    {
      path: [
        { x: 0.03, y: 0.06 },
        { x: 0.34, y: 0.02 },
        { x: 0.43, y: 0.14 },
        { x: 0.36, y: 0.33 },
        { x: 0.08, y: 0.36 },
        { x: 0.02, y: 0.22 },
      ],
      label: { x: 0.2, y: 0.26 },
      object: { x: 0.24, y: 0.12 },
    },
    {
      path: [
        { x: 0.57, y: 0.03 },
        { x: 0.96, y: 0.05 },
        { x: 0.98, y: 0.33 },
        { x: 0.82, y: 0.43 },
        { x: 0.62, y: 0.31 },
        { x: 0.52, y: 0.14 },
      ],
      label: { x: 0.78, y: 0.23 },
      object: { x: 0.82, y: 0.11 },
    },
    {
      path: [
        { x: 0.38, y: 0.37 },
        { x: 0.62, y: 0.35 },
        { x: 0.78, y: 0.51 },
        { x: 0.64, y: 0.72 },
        { x: 0.37, y: 0.68 },
        { x: 0.24, y: 0.51 },
      ],
      label: { x: 0.5, y: 0.57 },
      object: { x: 0.5, y: 0.45 },
    },
    {
      path: [
        { x: 0.03, y: 0.43 },
        { x: 0.22, y: 0.4 },
        { x: 0.34, y: 0.58 },
        { x: 0.27, y: 0.98 },
        { x: 0.02, y: 0.98 },
      ],
      label: { x: 0.14, y: 0.78 },
      object: { x: 0.1, y: 0.54 },
    },
    {
      path: [
        { x: 0.74, y: 0.46 },
        { x: 0.98, y: 0.39 },
        { x: 0.98, y: 0.97 },
        { x: 0.62, y: 0.97 },
        { x: 0.63, y: 0.75 },
        { x: 0.79, y: 0.7 },
      ],
      label: { x: 0.8, y: 0.82 },
      object: { x: 0.9, y: 0.91 },
    },
    {
      path: [
        { x: 0.31, y: 0.75 },
        { x: 0.59, y: 0.74 },
        { x: 0.6, y: 0.97 },
        { x: 0.3, y: 0.97 },
      ],
      label: { x: 0.45, y: 0.87 },
      object: { x: 0.45, y: 0.79 },
    },
  ],
  obstacleAnchors: [
    { x: 0.13, y: 0.2 },
    { x: 0.69, y: 0.16 },
    { x: 0.89, y: 0.32 },
    { x: 0.18, y: 0.63 },
    { x: 0.5, y: 0.48 },
    { x: 0.82, y: 0.74 },
    { x: 0.35, y: 0.56 },
    { x: 0.48, y: 0.89 },
    { x: 0.68, y: 0.57 },
    { x: 0.1, y: 0.89 },
    { x: 0.79, y: 0.08 },
    { x: 0.32, y: 0.14 },
    { x: 0.57, y: 0.79 },
    { x: 0.94, y: 0.56 },
    { x: 0.05, y: 0.51 },
    { x: 0.39, y: 0.29 },
    { x: 0.64, y: 0.44 },
    { x: 0.31, y: 0.96 },
    { x: 0.94, y: 0.95 },
    { x: 0.05, y: 0.06 },
  ],
}

const adultConservatory: PlanTemplate = {
  id: 'conservatory',
  zones: [
    {
      path: [
        { x: 0.04, y: 0.03 },
        { x: 0.43, y: 0.05 },
        { x: 0.39, y: 0.29 },
        { x: 0.18, y: 0.37 },
        { x: 0.03, y: 0.21 },
      ],
      label: { x: 0.22, y: 0.24 },
      object: { x: 0.29, y: 0.12 },
    },
    {
      path: [
        { x: 0.56, y: 0.03 },
        { x: 0.96, y: 0.03 },
        { x: 0.96, y: 0.36 },
        { x: 0.75, y: 0.42 },
        { x: 0.56, y: 0.25 },
      ],
      label: { x: 0.77, y: 0.24 },
      object: { x: 0.86, y: 0.12 },
    },
    {
      path: [
        { x: 0.41, y: 0.35 },
        { x: 0.64, y: 0.34 },
        { x: 0.78, y: 0.52 },
        { x: 0.63, y: 0.72 },
        { x: 0.36, y: 0.67 },
        { x: 0.25, y: 0.5 },
      ],
      label: { x: 0.51, y: 0.57 },
      object: { x: 0.52, y: 0.43 },
    },
    {
      path: [
        { x: 0.03, y: 0.42 },
        { x: 0.23, y: 0.39 },
        { x: 0.35, y: 0.58 },
        { x: 0.29, y: 0.96 },
        { x: 0.03, y: 0.96 },
      ],
      label: { x: 0.15, y: 0.76 },
      object: { x: 0.1, y: 0.54 },
    },
    {
      path: [
        { x: 0.8, y: 0.45 },
        { x: 0.97, y: 0.43 },
        { x: 0.97, y: 0.96 },
        { x: 0.61, y: 0.96 },
        { x: 0.62, y: 0.75 },
        { x: 0.79, y: 0.7 },
      ],
      label: { x: 0.8, y: 0.8 },
      object: { x: 0.9, y: 0.9 },
    },
    {
      path: [
        { x: 0.33, y: 0.75 },
        { x: 0.58, y: 0.75 },
        { x: 0.58, y: 0.96 },
        { x: 0.3, y: 0.96 },
      ],
      label: { x: 0.45, y: 0.86 },
      object: { x: 0.45, y: 0.8 },
    },
  ],
  obstacleAnchors: adultCourtyard.obstacleAnchors.map((anchor, index) => ({
    x: Math.min(0.96, anchor.y + (index % 2) * 0.025),
    y: Math.min(0.96, anchor.x + (index % 3) * 0.02),
  })),
}

const adultArcade: PlanTemplate = {
  id: 'arcade',
  zones: adultConservatory.zones.map((zone, index) => ({
    ...zone,
    label: {
      x: Math.min(0.94, zone.label.x + (index % 2 ? 0.06 : -0.02)),
      y: Math.min(0.94, zone.label.y + (index % 3 ? 0.02 : 0)),
    },
  })),
  obstacleAnchors: adultCourtyard.obstacleAnchors.map((anchor, index) => ({
    x: Math.min(0.96, Math.max(0.03, anchor.x + (index % 3) * 0.035 - 0.03)),
    y: Math.min(0.96, Math.max(0.03, anchor.y + (index % 2) * 0.035 - 0.02)),
  })),
}

const templates: Record<SpatialAudience, readonly PlanTemplate[]> = {
  teens: [teenPulse, teenCircuit, teenHarbor],
  adults: [adultCourtyard, adultConservatory, adultArcade],
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

const obstacleCount = (size: number) => {
  if (size <= 6) return 4
  if (size <= 9) return 9
  return 20
}

/** Obstacles are visible board elements, never hidden generated rules. */
export const planObstacles = (
  id: SpatialPlanId | undefined,
  columns: number,
  rows: number,
): readonly PlanObstacle[] => {
  const plan = spatialPlanForId(id)
  if (!plan) return []
  const found = new Map<string, PlanObstacle>()
  for (const anchor of plan.obstacleAnchors) {
    const column = Math.min(columns - 1, Math.floor(anchor.x * columns))
    const row = Math.min(rows - 1, Math.floor(anchor.y * rows))
    found.set(`${row}:${column}`, { column, row })
    if (found.size >= obstacleCount(Math.max(columns, rows))) break
  }
  return [...found.values()]
}

export const gridPlaceLabel = (label: string) => label.replace(/\s+·\s+\d+$/u, '')
