import { difficultyConfigs } from '../generator/difficulty'
import type { Audience, Difficulty, Locale, PuzzleVariant } from '../domain/types'

interface DifficultySelectorProps {
  readonly value: Difficulty
  readonly locale: Locale
  readonly audience: Audience
  readonly variant: PuzzleVariant
  readonly label: string
  readonly onChange: (difficulty: Difficulty) => void
  readonly onVariantChange: (variant: PuzzleVariant) => void
}

const labels: Record<Locale, Record<Difficulty, string>> = {
  ca: { easy: 'Fàcil · 4 amics', medium: 'Mitjà · 6 amics', hard: 'Difícil · 8 amics' },
  es: { easy: 'Fácil · 4 amigos', medium: 'Medio · 6 amigos', hard: 'Difícil · 8 amigos' },
  en: { easy: 'Easy · 4 friends', medium: 'Medium · 6 friends', hard: 'Hard · 8 friends' },
}

const logicGridLabels: Record<Locale, Record<Difficulty, string>> = {
  ca: {
    easy: 'Fàcil · opcions guiades',
    medium: 'Mitjà · opcions obertes',
    hard: 'Difícil · més deducció',
  },
  es: {
    easy: 'Fácil · opciones guiadas',
    medium: 'Medio · opciones abiertas',
    hard: 'Difícil · más deducción',
  },
  en: {
    easy: 'Easy · guided choices',
    medium: 'Medium · open choices',
    hard: 'Hard · deeper deduction',
  },
}

export const DifficultySelector = ({
  value,
  locale,
  audience,
  variant,
  label,
  onChange,
  onVariantChange,
}: DifficultySelectorProps) => {
  const copy = audience === 'children' ? labels[locale] : logicGridLabels[locale]

  return (
    <fieldset className="difficulty-selector">
      <legend>{label}</legend>
      {(Object.keys(difficultyConfigs) as Difficulty[]).map((difficulty) => (
        <label
          key={difficulty}
          className={
            value === difficulty && variant === 'spatial' ? 'difficulty-selector__selected' : ''
          }
        >
          <input
            type="radio"
            name="difficulty"
            value={difficulty}
            checked={value === difficulty && variant === 'spatial'}
            onChange={() => {
              onVariantChange('spatial')
              onChange(difficulty)
            }}
          />
          {copy[difficulty]}
        </label>
      ))}
      {audience !== 'children' && (
        <label className={variant === 'cube' ? 'difficulty-selector__selected' : ''}>
          <input
            type="radio"
            name="difficulty"
            value="cube"
            checked={variant === 'cube'}
            onChange={() => {
              onChange('hard')
              onVariantChange('cube')
            }}
          />
          {
            {
              ca: 'Avançat 3D · edifici 5×5×3',
              es: 'Avanzado 3D · edificio 5×5×3',
              en: 'Advanced 3D · 5×5×3 building',
            }[locale]
          }
        </label>
      )}
    </fieldset>
  )
}
