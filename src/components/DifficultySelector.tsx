import { difficultyConfigs } from '../generator/difficulty'
import type { Difficulty, Locale, PuzzleCollection } from '../domain/types'

interface DifficultySelectorProps {
  readonly value: Difficulty
  readonly locale: Locale
  readonly collection: PuzzleCollection
  readonly label: string
  readonly onChange: (difficulty: Difficulty) => void
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
  collection,
  label,
  onChange,
}: DifficultySelectorProps) => {
  const copy = collection === 'children' ? labels[locale] : logicGridLabels[locale]

  if (collection === 'three-dimensional') {
    return (
      <fieldset className="difficulty-selector difficulty-selector--building">
        <legend>{label}</legend>
        <label className="difficulty-selector__selected">
          <input type="radio" name="difficulty" value="hard" checked readOnly />
          {
            {
              ca: 'Avançat · edifici 5×5×5',
              es: 'Avanzado · edificio 5×5×5',
              en: 'Advanced · 5×5×5 building',
            }[locale]
          }
        </label>
      </fieldset>
    )
  }

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
