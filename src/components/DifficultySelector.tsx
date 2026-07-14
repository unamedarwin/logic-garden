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
  ca: {
    easy: 'Fàcil · pistes molt clares',
    medium: 'Mitjà · més opcions',
    hard: 'Difícil · més deducció',
  },
  es: {
    easy: 'Fácil · pistas muy claras',
    medium: 'Medio · más opciones',
    hard: 'Difícil · más deducción',
  },
  en: {
    easy: 'Easy · very clear clues',
    medium: 'Medium · more choices',
    hard: 'Hard · deeper deduction',
  },
  eu: {
    easy: 'Erraza · pista oso argiak',
    medium: 'Ertaina · aukera gehiago',
    hard: 'Zaila · dedukzio gehiago',
  },
  gl: {
    easy: 'Fácil · pistas moi claras',
    medium: 'Media · máis opcións',
    hard: 'Difícil · máis dedución',
  },
  fr: {
    easy: 'Facile · indices très clairs',
    medium: 'Moyen · plus de choix',
    hard: 'Difficile · plus de déduction',
  },
  de: {
    easy: 'Leicht · sehr klare Hinweise',
    medium: 'Mittel · mehr Möglichkeiten',
    hard: 'Schwer · mehr Logik',
  },
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

const buildingLabels: Record<Locale, Record<Difficulty, string>> = {
  ca: {
    easy: 'Fàcil · 4 veïns guiats',
    medium: 'Mitjà · 2 veïns guiats',
    hard: 'Difícil · deducció completa',
  },
  es: {
    easy: 'Fácil · 4 vecinos guiados',
    medium: 'Medio · 2 vecinos guiados',
    hard: 'Difícil · deducción completa',
  },
  en: {
    easy: 'Easy · 4 guided neighbours',
    medium: 'Medium · 2 guided neighbours',
    hard: 'Hard · full deduction',
  },
  eu: {
    easy: 'Erraza · 4 bizilagun gidatuta',
    medium: 'Ertaina · 2 bizilagun gidatuta',
    hard: 'Zaila · dedukzio osoa',
  },
  gl: {
    easy: 'Fácil · 4 veciños guiados',
    medium: 'Media · 2 veciños guiados',
    hard: 'Difícil · dedución completa',
  },
  fr: {
    easy: 'Facile · 4 voisins guidés',
    medium: 'Moyen · 2 voisins guidés',
    hard: 'Difficile · déduction complète',
  },
  de: {
    easy: 'Leicht · 4 geführte Nachbarn',
    medium: 'Mittel · 2 geführte Nachbarn',
    hard: 'Schwer · vollständige Logik',
  },
}

export const DifficultySelector = ({
  value,
  locale,
  collection,
  label,
  onChange,
}: DifficultySelectorProps) => {
  const copy =
    collection === 'children'
      ? labels[locale]
      : collection === 'three-dimensional'
        ? buildingLabels[locale]
        : logicGridLabels[locale]

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
