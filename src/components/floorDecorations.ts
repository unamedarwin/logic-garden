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

type MotifColorPalette = Readonly<Record<MotifId, readonly string[]>>

const motifColorPalettes = {
  audio: ['#f3bd4d', '#d9657f', '#fff0b5'],
  bolt: ['#edf3f4', '#9bb0b7', '#54727d'],
  circle: ['#d77d62', '#e5b94f', '#657fa8'],
  diamond: ['#e5b84d', '#d9785f', '#649ca1'],
  disc: ['#77c6b7', '#547d91', '#d7a64c'],
  droplets: ['#d9f7ff', '#75c4d7', '#276985'],
  flower: ['#ef91a6', '#f1c957', '#c95b85'],
  gem: ['#55c5bd', '#6685d1', '#b276c9'],
  hexagon: ['#91b19d', '#668477', '#d0aa5d'],
  leaf: ['#79aa60', '#3f794c', '#b5c96d'],
  music: ['#f5c65d', '#d65f7c', '#b28ab5'],
  shell: ['#e6b57f', '#dc8f87', '#ffe0aa'],
  shapes: ['#c97754', '#7199ad', '#d4b34f'],
  sparkles: ['#f6d568', '#c9b9ea', '#e58ca8'],
  sprout: ['#5d9b62', '#93bd68', '#b9915d'],
  waves: ['#71b9bd', '#d6b66b', '#6d8fba'],
} satisfies MotifColorPalette

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
  readonly colorsByMotif: MotifColorPalette
}

const withMotifs = (motifs: readonly MotifId[]): MaterialDetails => ({
  motifs,
  colorsByMotif: motifColorPalettes,
})

const materialDetails: Readonly<Record<FloorMaterial, MaterialDetails>> = {
  'artificial-turf': withMotifs(['diamond', 'circle', 'waves']),
  parquet: withMotifs(['waves']),
  mosaic: withMotifs(['diamond', 'sparkles']),
  carpet: withMotifs(['sparkles', 'waves']),
  rubber: withMotifs(['circle', 'disc', 'hexagon']),
  cork: withMotifs(['shapes', 'circle', 'hexagon']),
  grass: withMotifs(['leaf', 'flower', 'sprout']),
  soil: withMotifs(['sprout', 'circle', 'shapes']),
  stone: withMotifs(['circle', 'disc', 'hexagon']),
  sand: withMotifs(['shell', 'waves', 'circle']),
  water: withMotifs(['droplets', 'waves', 'circle']),
  concrete: withMotifs(['hexagon', 'circle', 'shapes']),
  metal: withMotifs(['bolt', 'disc', 'hexagon']),
  stage: withMotifs(['music', 'audio', 'sparkles']),
}

export const floorMaterialDetails = (material: FloorMaterial): MaterialDetails =>
  materialDetails[material]

export const floorMotifColors = (motif: MotifId): readonly string[] => motifColorPalettes[motif]

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
      const motif = random.pick(details.motifs)
      decorations.push({
        positionId: position.id,
        roomIndex,
        motif,
        color: random.pick(details.colorsByMotif[motif]),
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
