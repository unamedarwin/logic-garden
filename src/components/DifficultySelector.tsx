import { difficultyConfigs } from '../generator/difficulty'
import type { Difficulty, Locale, PuzzleCollection } from '../domain/types'

// cspell:disable -- the multilingual labels are covered by locale parity review.

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
  eu: { easy: 'Erraza · 4 lagun', medium: 'Ertaina · 6 lagun', hard: 'Zaila · 8 lagun' },
  gl: { easy: 'Fácil · 4 amigos', medium: 'Media · 6 amigos', hard: 'Difícil · 8 amigos' },
  fr: { easy: 'Facile · 4 amis', medium: 'Moyen · 6 amis', hard: 'Difficile · 8 amis' },
  de: { easy: 'Leicht · 4 Freunde', medium: 'Mittel · 6 Freunde', hard: 'Schwer · 8 Freunde' },
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
  eu: {
    easy: 'Erraza · aukera gidatuak',
    medium: 'Ertaina · aukera irekiak',
    hard: 'Zaila · dedukzio gehiago',
  },
  gl: {
    easy: 'Fácil · opcións guiadas',
    medium: 'Media · opcións abertas',
    hard: 'Difícil · máis dedución',
  },
  fr: {
    easy: 'Facile · choix guidés',
    medium: 'Moyen · choix ouverts',
    hard: 'Difficile · plus de déduction',
  },
  de: {
    easy: 'Leicht · geführte Auswahl',
    medium: 'Mittel · freie Auswahl',
    hard: 'Schwer · mehr Logik',
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
              ca: 'Avançat · edifici de 3 a 10 plantes',
              es: 'Avanzado · edificio de 3 a 10 plantas',
              en: 'Advanced · 3–10-floor building',
              eu: 'Aurreratua · 3-10 solairuko eraikina',
              gl: 'Avanzado · edificio de 3 a 10 plantas',
              fr: 'Avancé · immeuble de 3 à 10 niveaux',
              de: 'Fortgeschritten · Gebäude mit 3 bis 10 Etagen',
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
