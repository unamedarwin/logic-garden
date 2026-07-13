import type { SpatialPlan } from '../domain/spatialPlan'
import { spatialPlanZoneAt } from '../domain/spatialPlan'
import type { Position, Seed, ThemeId } from '../domain/types'
import { SeededRandom } from '../generator/seededRandom'
import { floorTextureForRoom, type FloorMaterial } from './floorTextures'

export type MotifId =
  | 'audio'
  | 'bolt'
  | 'circle'
  | 'diamond'
  | 'disc'
  | 'droplets'
  | 'flower'
  | 'gem'
  | 'hexagon'
  | 'leaf'
  | 'music'
  | 'shell'
  | 'shapes'
  | 'sparkles'
  | 'sprout'
  | 'waves'

export interface FloorDecoration {
  readonly color: string
  readonly motif: MotifId
  readonly positionId: Position['id']
  readonly roomIndex: number
  readonly rotation: number
  readonly scale: number
  readonly x: number
  readonly y: number
}

export const floorDecorationScale = { minimum: 0.3, maximum: 0.46 } as const

interface MaterialDetails {
  readonly motifs: readonly MotifId[]
  readonly colors: readonly string[]
}

const materialDetails: Readonly<Record<FloorMaterial, MaterialDetails>> = {
  'artificial-turf': {
    motifs: ['diamond', 'circle', 'waves'],
    colors: ['#f2d35c', '#183e32', '#d96752'],
  },
  parquet: { motifs: ['waves'], colors: ['#57361f', '#2e6f5e', '#b94e3e'] },
  mosaic: { motifs: ['diamond', 'sparkles'], colors: ['#1e5d59', '#b94f3d', '#e3ad28'] },
  carpet: { motifs: ['sparkles', 'waves'], colors: ['#ffe29a', '#29203f', '#ee6b9f'] },
  rubber: { motifs: ['circle', 'disc', 'hexagon'], colors: ['#f4b942', '#1d2730', '#49c2ae'] },
  cork: { motifs: ['shapes', 'circle', 'hexagon'], colors: ['#5e3d23', '#2c6d5c', '#bf4f3c'] },
  grass: { motifs: ['leaf', 'flower', 'sprout'], colors: ['#1c5e39', '#e3a51a', '#d85168'] },
  soil: { motifs: ['sprout', 'circle', 'shapes'], colors: ['#214f37', '#f1c95c', '#8e3f2d'] },
  stone: { motifs: ['circle', 'disc', 'hexagon'], colors: ['#344f48', '#c04d3f', '#d99f24'] },
  sand: { motifs: ['shell', 'waves', 'circle'], colors: ['#684820', '#2e7a77', '#bf4f3c'] },
  water: { motifs: ['droplets', 'waves', 'circle'], colors: ['#effcff', '#145f7a', '#f0b935'] },
  concrete: {
    motifs: ['hexagon', 'circle', 'shapes'],
    colors: ['#35423d', '#c65143', '#d9a62e'],
  },
  metal: { motifs: ['bolt', 'disc', 'hexagon'], colors: ['#edf9f7', '#153b46', '#dd6a4f'] },
  stage: { motifs: ['music', 'audio', 'sparkles'], colors: ['#ffd46f', '#231a2d', '#e65f88'] },
}

export const floorMaterialDetails = (material: FloorMaterial): MaterialDetails =>
  materialDetails[material]

const groupPositionsByRoom = (
  plan: SpatialPlan,
  positions: readonly Position[],
  columns: number,
  rows: number,
) => {
  const rooms = new Map<number, Position[]>()
  for (const position of positions) {
    if (position.blocked) continue
    const roomIndex = spatialPlanZoneAt(plan, position.column, position.row, columns, rows)
    const room = rooms.get(roomIndex) ?? []
    room.push(position)
    rooms.set(roomIndex, room)
  }
  return rooms
}

export const buildFloorDecorations = (
  plan: SpatialPlan,
  positions: readonly Position[],
  columns: number,
  rows: number,
  themeId: ThemeId,
  puzzleSeed: Seed,
): readonly FloorDecoration[] => {
  const decorations: FloorDecoration[] = []

  for (const [roomIndex, roomPositions] of groupPositionsByRoom(
    plan,
    positions,
    columns,
    rows,
  )) {
    const roomRandom = new SeededRandom(`${puzzleSeed}|floor-room|${roomIndex}`)
    const minimum = Math.ceil(roomPositions.length * 0.25)
    const maximum = Math.max(minimum, Math.floor(roomPositions.length * 0.75))
    const decoratedCount = roomRandom.integer(minimum, maximum)
    const selectedPositions = roomRandom.shuffle(roomPositions).slice(0, decoratedCount)
    const material = floorTextureForRoom(themeId, roomIndex).material
    const details = materialDetails[material]

    for (const position of selectedPositions) {
      const random = new SeededRandom(`${puzzleSeed}|floor-cell|${position.id}`)
      decorations.push({
        positionId: position.id,
        roomIndex,
        motif: random.pick(details.motifs),
        color: random.pick(details.colors),
        rotation: random.integer(-35, 35),
        scale:
          random.integer(
            floorDecorationScale.minimum * 100,
            floorDecorationScale.maximum * 100,
          ) / 100,
        x: position.column + random.integer(22, 78) / 100,
        y: position.row + random.integer(22, 78) / 100,
      })
    }
  }

  return decorations
}
