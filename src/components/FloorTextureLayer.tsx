import type { CSSProperties } from 'react'
import type { SpatialPlan } from '../domain/spatialPlan'
import { getTheme } from '../domain/themes'
import type { Position, Seed, ThemeId } from '../domain/types'
import { buildFloorDecorations } from './floorDecorations'
import { floorMotifIcons } from './floorMotifIcons'
import { floorTextureForMaterial, floorTextureForRoom } from './floorTextures'
import { buildPondEdges, type PondEdge } from './pondEdges'

interface FloorTextureLayerProps {
  readonly plan: SpatialPlan
  readonly positions: readonly Position[]
  readonly columns: number
  readonly rows: number
  readonly themeId: ThemeId
  readonly puzzleSeed: Seed
}

const zoneClipPath = (zone: SpatialPlan['zones'][number]) =>
  `polygon(${zone.path.map((point) => `${point.x * 100}% ${point.y * 100}%`).join(',')})`

const cellClipPath = (position: Position, columns: number, rows: number) => {
  const left = (position.column / columns) * 100
  const right = ((position.column + 1) / columns) * 100
  const top = (position.row / rows) * 100
  const bottom = ((position.row + 1) / rows) * 100
  return `polygon(${left}% ${top}%,${right}% ${top}%,${right}% ${bottom}%,${left}% ${bottom}%)`
}

const textureStyle = (
  texture: ReturnType<typeof floorTextureForRoom>,
  columns: number,
): CSSProperties => ({
  backgroundColor: texture.baseColor,
  backgroundImage: texture.layers.join(','),
  backgroundPosition: '0 0, 0 0, 0 0',
  backgroundSize: `${190 / columns}% ${190 / columns}%, ${120 / columns}% ${120 / columns}%, ${62 / columns}% ${62 / columns}%`,
})

const pondEdgeStyle = (edge: PondEdge, columns: number, rows: number): CSSProperties => {
  const cellWidth = 100 / columns
  const cellHeight = 100 / rows
  const thicknessX = cellWidth * 0.14
  const thicknessY = cellHeight * 0.14
  const left = edge.position.column * cellWidth
  const top = edge.position.row * cellHeight
  switch (edge.side) {
    case 'top':
      return {
        left: `${left}%`,
        top: `${top}%`,
        width: `${cellWidth}%`,
        height: `${thicknessY}%`,
      }
    case 'right':
      return {
        left: `${left + cellWidth}%`,
        top: `${top}%`,
        width: `${thicknessX}%`,
        height: `${cellHeight}%`,
      }
    case 'bottom':
      return {
        left: `${left}%`,
        top: `${top + cellHeight}%`,
        width: `${cellWidth}%`,
        height: `${thicknessY}%`,
      }
    case 'left':
      return {
        left: `${left}%`,
        top: `${top}%`,
        width: `${thicknessX}%`,
        height: `${cellHeight}%`,
      }
  }
}

export const FloorTextureLayer = ({
  plan,
  positions,
  columns,
  rows,
  themeId,
  puzzleSeed,
}: FloorTextureLayerProps) => {
  const decorations = buildFloorDecorations(plan, positions, columns, rows, themeId, puzzleSeed)
  const waterTexture = floorTextureForMaterial('water')
  const terrainFeature = getTheme(themeId).terrainFeature
  const waterPositions =
    terrainFeature?.kind === 'pond'
      ? positions.filter(
          (position) =>
            position.blocked && position.placeId === `place-${terrainFeature.placeIndex}`,
        )
      : []
  const pondEdges =
    terrainFeature?.kind === 'pond' ? buildPondEdges(positions, terrainFeature.placeIndex) : []

  return (
    <div className="floor-texture-layer" aria-hidden="true">
      {plan.zones.map((zone, roomIndex) => {
        const texture = floorTextureForRoom(themeId, roomIndex)
        const style: CSSProperties = {
          ...textureStyle(texture, columns),
          clipPath: zoneClipPath(zone),
        }
        return (
          <div
            key={`${plan.id}:texture:${roomIndex}`}
            className="floor-texture-layer__room"
            data-room-material={texture.material}
            style={style}
          />
        )
      })}
      {waterPositions.map((position) => (
        <div
          key={`${position.id}:water`}
          className="floor-texture-layer__patch floor-texture-layer__patch--water"
          data-floor-position={position.id}
          style={{
            ...textureStyle(waterTexture, columns),
            clipPath: cellClipPath(position, columns, rows),
          }}
        />
      ))}
      {pondEdges.map((edge) => (
        <span
          key={`${edge.position.id}:pond-edge:${edge.side}`}
          className={`floor-texture-layer__pond-edge floor-texture-layer__pond-edge--${edge.side}`}
          data-floor-position={edge.position.id}
          data-pond-edge={edge.side}
          style={pondEdgeStyle(edge, columns, rows)}
        />
      ))}
      <div className="floor-texture-layer__motifs">
        {decorations.map((decoration) => {
          const Motif = floorMotifIcons[decoration.motif]
          const style: CSSProperties = {
            color: decoration.color,
            left: `${(decoration.x / columns) * 100}%`,
            top: `${(decoration.y / rows) * 100}%`,
            width: `${(decoration.scale / columns) * 100}%`,
            transform: `translate(-50%, -50%) rotate(${decoration.rotation}deg)`,
          }
          return (
            <Motif
              key={`${decoration.positionId}:floor`}
              className="floor-texture-layer__motif"
              data-floor-position={decoration.positionId}
              strokeWidth={2.1}
              style={style}
            />
          )
        })}
      </div>
    </div>
  )
}
