import type { BuildingSize, Locale } from '../domain/types'

// cspell:disable -- the multilingual labels are covered by locale parity review.

interface BuildingSizeSelectorProps {
  readonly value: BuildingSize
  readonly locale: Locale
  readonly label: string
  readonly onChange: (size: BuildingSize) => void
}

const sizes = [3, 4, 5, 6, 7, 8, 9, 10] as const
const recommended: Record<Locale, string> = {
  ca: 'recomanat',
  es: 'recomendado',
  en: 'recommended',
  eu: 'gomendatua',
  gl: 'recomendado',
  fr: 'conseillé',
  de: 'empfohlen',
}
const floorWord: Record<Locale, (size: BuildingSize) => string> = {
  ca: (size) => `${size} plantes`,
  es: (size) => `${size} plantas`,
  en: (size) => `${size} floors`,
  eu: (size) => `${size} solairu`,
  gl: (size) => `${size} plantas`,
  fr: (size) => `${size} étages`,
  de: (size) => `${size} Etagen`,
}

export const BuildingSizeSelector = ({
  value,
  locale,
  label,
  onChange,
}: BuildingSizeSelectorProps) => (
  <fieldset className="difficulty-selector building-size-selector">
    <legend>{label}</legend>
    {sizes.map((size) => (
      <label key={size} className={value === size ? 'difficulty-selector__selected' : ''}>
        <input
          type="radio"
          name="building-size"
          value={size}
          checked={value === size}
          onChange={() => onChange(size)}
        />
        {floorWord[locale](size)}
        {size === 3 ? ` · ${recommended[locale]}` : ''}
      </label>
    ))}
  </fieldset>
)
