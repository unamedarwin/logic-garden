import { Grid3X3, LayoutGrid } from 'lucide-react'
import type { BuildingPlacement, Locale } from '../domain/types'
import { buildingPlacementCopy } from '../domain/i18n'

interface BuildingPlacementSelectorProps {
  readonly value: BuildingPlacement
  readonly locale: Locale
  readonly onChange: (value: BuildingPlacement) => void
}

export const BuildingPlacementSelector = ({
  value,
  locale,
  onChange,
}: BuildingPlacementSelectorProps) => {
  const labels = buildingPlacementCopy(locale)
  const choices = [
    {
      value: 'rooms' as const,
      title: labels.rooms,
      description: labels.roomsDescription,
      Icon: LayoutGrid,
    },
    {
      value: 'cells' as const,
      title: labels.cells,
      description: labels.cellsDescription,
      Icon: Grid3X3,
    },
  ]
  return (
    <fieldset className="difficulty-selector building-placement-selector">
      <legend>{labels.legend}</legend>
      {choices.map(({ value: choice, title, description, Icon }) => (
        <label key={choice}>
          <input
            type="radio"
            name="building-placement"
            value={choice}
            checked={value === choice}
            aria-label={`${title}. ${description}`}
            onChange={() => onChange(choice)}
          />
          <Icon aria-hidden="true" />
          <strong>{title}</strong>
          <span>{description}</span>
        </label>
      ))}
    </fieldset>
  )
}
