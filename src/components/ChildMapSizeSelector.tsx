import type { ChildMapSize, Locale } from '../domain/types'

// cspell:disable -- the multilingual labels are covered by locale parity review.

interface ChildMapSizeSelectorProps {
  readonly value: ChildMapSize
  readonly locale: Locale
  readonly label: string
  readonly onChange: (size: ChildMapSize) => void
}

const sizes = [4, 6, 8] as const
const labels: Record<Locale, Readonly<Record<ChildMapSize, string>>> = {
  ca: { 4: 'Petit · 4 amics', 6: 'Mitjà · 6 amics', 8: 'Gran · 8 amics' },
  es: { 4: 'Pequeño · 4 amigos', 6: 'Mediano · 6 amigos', 8: 'Grande · 8 amigos' },
  en: { 4: 'Small · 4 friends', 6: 'Medium · 6 friends', 8: 'Large · 8 friends' },
  eu: { 4: 'Txikia · 4 lagun', 6: 'Ertaina · 6 lagun', 8: 'Handia · 8 lagun' },
  gl: { 4: 'Pequeno · 4 amigos', 6: 'Mediano · 6 amigos', 8: 'Grande · 8 amigos' },
  fr: { 4: 'Petite · 4 amis', 6: 'Moyenne · 6 amis', 8: 'Grande · 8 amis' },
  de: { 4: 'Klein · 4 Freunde', 6: 'Mittel · 6 Freunde', 8: 'Groß · 8 Freunde' },
}

export const ChildMapSizeSelector = ({
  value,
  locale,
  label,
  onChange,
}: ChildMapSizeSelectorProps) => (
  <fieldset className="difficulty-selector child-map-size-selector">
    <legend>{label}</legend>
    {sizes.map((size) => (
      <label key={size} className={value === size ? 'difficulty-selector__selected' : ''}>
        <input
          type="radio"
          name="child-map-size"
          value={size}
          checked={value === size}
          onChange={() => onChange(size)}
        />
        {labels[locale][size]}
      </label>
    ))}
  </fieldset>
)
