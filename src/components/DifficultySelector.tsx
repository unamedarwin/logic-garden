import { difficultyConfigs } from '../generator/difficulty'
import type { Audience, Difficulty, Locale } from '../domain/types'

interface DifficultySelectorProps {
  readonly value: Difficulty
  readonly locale: Locale
  readonly audience: Audience
  readonly label: string
  readonly onChange: (difficulty: Difficulty) => void
}

const labels: Record<Locale, Record<Difficulty, string>> = {
  ca: { easy: 'Fàcil · 4 amics', medium: 'Mitjà · 6 amics', hard: 'Difícil · 8 amics' },
  es: { easy: 'Fácil · 4 amigos', medium: 'Medio · 6 amigos', hard: 'Difícil · 8 amigos' },
  en: { easy: 'Easy · 4 friends', medium: 'Medium · 6 friends', hard: 'Hard · 8 friends' },
}

const logicGridLabels: Record<Locale, Record<Difficulty, string>> = {
  ca: { easy: 'Fàcil · 6x6', medium: 'Mitjà · 9x9', hard: 'Difícil · 16x16' },
  es: { easy: 'Fácil · 6x6', medium: 'Medio · 9x9', hard: 'Difícil · 16x16' },
  en: { easy: 'Easy · 6x6', medium: 'Medium · 9x9', hard: 'Hard · 16x16' },
}

export const DifficultySelector = ({
  value,
  locale,
  audience,
  label,
  onChange,
}: DifficultySelectorProps) => {
  const copy = audience === 'children' ? labels[locale] : logicGridLabels[locale]

  return (
    <fieldset className="difficulty-selector">
      <legend>{label}</legend>
      {(Object.keys(difficultyConfigs) as Difficulty[]).map((difficulty) => (
        <label
          key={difficulty}
          className={value === difficulty ? 'difficulty-selector__selected' : ''}
        >
          <input
            type="radio"
            name="difficulty"
            value={difficulty}
            checked={value === difficulty}
            onChange={() => onChange(difficulty)}
          />
          {copy[difficulty]}
        </label>
      ))}
    </fieldset>
  )
}
