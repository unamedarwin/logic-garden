import { Building2, Grid3X3, Sprout } from 'lucide-react'
import { puzzleCollectionCopy } from '../domain/i18n'
import type { Locale, PuzzleCollection } from '../domain/types'

interface PuzzleCollectionSelectorProps {
  readonly value: PuzzleCollection
  readonly locale: Locale
  readonly label: string
  readonly onChange: (collection: PuzzleCollection) => void
}

const collections: readonly PuzzleCollection[] = [
  'children',
  'two-dimensional',
  'three-dimensional',
]

const icons = {
  children: Sprout,
  'two-dimensional': Grid3X3,
  'three-dimensional': Building2,
} satisfies Record<PuzzleCollection, typeof Sprout>

export const PuzzleCollectionSelector = ({
  value,
  locale,
  label,
  onChange,
}: PuzzleCollectionSelectorProps) => (
  <fieldset className="collection-selector">
    <legend>{label}</legend>
    <div className="collection-selector__options">
      {collections.map((collection) => {
        const copy = puzzleCollectionCopy(locale, collection)
        const Icon = icons[collection]
        return (
          <label
            key={collection}
            className={`collection-choice collection-choice--${collection} ${value === collection ? 'collection-choice--selected' : ''}`}
          >
            <input
              type="radio"
              name="puzzle-collection"
              value={collection}
              checked={value === collection}
              onChange={() => onChange(collection)}
            />
            <span className="collection-choice__icon" aria-hidden="true">
              <Icon />
            </span>
            <span className="collection-choice__copy">
              <strong>{copy.label}</strong>
              <small>{copy.description}</small>
              <span>{copy.detail}</span>
            </span>
          </label>
        )
      })}
    </div>
  </fieldset>
)
