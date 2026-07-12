import { gridPlaceLabel, type SpatialPlan } from '../domain/spatialPlan'
import type { Item, Position } from '../domain/types'

interface GridObjectIconsProps {
  readonly plan: SpatialPlan
  readonly positions: readonly Position[]
  readonly items: readonly Item[]
}

export const GridObjectIcons = ({ plan, positions, items }: GridObjectIconsProps) => {
  const columns = Math.max(...positions.map((position) => position.column)) + 1
  const rows = Math.max(...positions.map((position) => position.row)) + 1
  const places = plan.zones.map((_, index) => {
    const position = positions.find((candidate) => candidate.placeId === `place-${index}`)
    return position ? gridPlaceLabel(position.label) : ''
  })

  return (
    <div
      className="grid-object-icons"
      style={{ '--grid-columns': columns } as React.CSSProperties}
      aria-hidden="true"
    >
      {plan.zones.map((zone, index) => {
        const label = places[index % places.length]
        const item = items[index % items.length]
        return (
          <div key={index} className="grid-object-icons__zone">
            <span
              className="grid-object-icons__item"
              style={{ left: `${zone.object.x * 100}%`, top: `${zone.object.y * 100}%` }}
            >
              {item?.emoji}
            </span>
            {label && (
              <span
                className="grid-object-icons__label"
                style={{ left: `${zone.label.x * 100}%`, top: `${zone.label.y * 100}%` }}
              >
                {label}
              </span>
            )}
          </div>
        )
      })}
      {positions
        .filter((position) => position.blocked)
        .map((position) => (
          <span
            key={position.id}
            className="grid-object-icons__obstacle"
            style={{
              left: `${((position.column + 0.5) / columns) * 100}%`,
              top: `${((position.row + 0.5) / rows) * 100}%`,
            }}
            title={position.obstacleLabel}
          >
            {position.obstacleEmoji}
          </span>
        ))}
    </div>
  )
}
