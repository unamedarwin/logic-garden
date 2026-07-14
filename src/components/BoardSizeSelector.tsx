import type { AdvancedGridSize, Locale } from '../domain/types'

// cspell:disable -- the multilingual labels are covered by locale parity review.

interface BoardSizeSelectorProps {
  readonly value: AdvancedGridSize
  readonly locale: Locale
  readonly label: string
  readonly onChange: (gridSize: AdvancedGridSize) => void
}

const sizes = [6, 9, 16] as const

const labels: Record<Locale, Readonly<Record<AdvancedGridSize, string>>> = {
  ca: { 6: 'Petit · 6×6', 9: 'Mitjà · 9×9', 16: 'Gran · 16×16 · 8 persones' },
  es: { 6: 'Pequeño · 6×6', 9: 'Mediano · 9×9', 16: 'Grande · 16×16 · 8 personas' },
  en: { 6: 'Small · 6×6', 9: 'Medium · 9×9', 16: 'Large · 16×16 · 8 people' },
  eu: { 6: 'Txikia · 6×6', 9: 'Ertaina · 9×9', 16: 'Handia · 16×16 · 8 lagun' },
  gl: { 6: 'Pequeno · 6×6', 9: 'Mediano · 9×9', 16: 'Grande · 16×16 · 8 persoas' },
  fr: { 6: 'Petite · 6×6', 9: 'Moyenne · 9×9', 16: 'Grande · 16×16 · 8 personnes' },
  de: { 6: 'Klein · 6×6', 9: 'Mittel · 9×9', 16: 'Groß · 16×16 · 8 Personen' },
}

export const BoardSizeSelector = ({
  value,
  locale,
  label,
  onChange,
}: BoardSizeSelectorProps) => (
  <fieldset className="difficulty-selector board-size-selector">
    <legend>{label}</legend>
    {sizes.map((gridSize) => (
      <label
        key={gridSize}
        className={value === gridSize ? 'difficulty-selector__selected' : ''}
      >
        <input
          type="radio"
          name="board-size"
          value={gridSize}
          checked={value === gridSize}
          onChange={() => onChange(gridSize)}
        />
        {labels[locale][gridSize]}
      </label>
    ))}
  </fieldset>
)
