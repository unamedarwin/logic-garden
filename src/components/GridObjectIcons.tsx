import { gridPlaceLabel, type SpatialPlan } from '../domain/spatialPlan'
import { localizeThemeLabel } from '../domain/themeVocabulary'
import type { Locale, Position, ThemeId } from '../domain/types'
import { gridObjectLayout } from './gridObjectLayout'
import { SceneIcon } from './SceneIcon'

interface GridObjectIconsProps {
  readonly plan: SpatialPlan
  readonly positions: readonly Position[]
  readonly locale: Locale
  readonly themeId: ThemeId
}

export const GridObjectIcons = ({ plan, positions, locale, themeId }: GridObjectIconsProps) => {
  const columns = Math.max(...positions.map((position) => position.column)) + 1
  const rows = Math.max(...positions.map((position) => position.row)) + 1
  const places = plan.zones.map((_, index) => {
    const position = positions.find((candidate) => candidate.placeId === `place-${index}`)
    return position ? localizeThemeLabel(locale, themeId, gridPlaceLabel(position.label)) : ''
  })
  const layout = gridObjectLayout(plan, positions, places)

  return (
    <div
      className="grid-object-icons"
      style={{ '--grid-columns': columns, '--grid-rows': rows } as React.CSSProperties}
      aria-hidden="true"
    >
      {plan.zones.map((zone, index) => {
        const label = places[index % places.length]
        const zoneLayout = layout[index] ?? zone
        return (
          <div key={index} className="grid-object-icons__zone">
            {label && (
              <span
                className="grid-object-icons__label"
                style={{
                  left: `${zoneLayout.label.x * 100}%`,
                  top: `${zoneLayout.label.y * 100}%`,
                  transform: zoneLayout.labelTransform,
                }}
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
            title={
              position.obstacleLabel
                ? localizeThemeLabel(locale, themeId, position.obstacleLabel)
                : undefined
            }
          >
            {position.obstacleEmoji && <SceneIcon emoji={position.obstacleEmoji} />}
          </span>
        ))}
    </div>
  )
}
