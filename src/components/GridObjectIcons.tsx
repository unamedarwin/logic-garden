import { gridPlaceLabel, type SpatialPlan } from '../domain/spatialPlan'
import type { Item, Position } from '../domain/types'

interface GridObjectIconsProps {
  readonly plan: SpatialPlan
  readonly positions: readonly Position[]
  readonly items: readonly Item[]
}

export const GridObjectIcons = ({ plan, positions, items }: GridObjectIconsProps) => {
  const places = positions
    .filter((position) => position.row === 0)
    .map((position) => gridPlaceLabel(position.label))

  return (
    <div className="grid-object-icons" aria-hidden="true">
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
    </div>
  )
}
