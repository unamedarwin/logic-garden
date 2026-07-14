import { useEffect, useRef } from 'react'
import { themeCopy } from '../domain/i18n'
import { themesForPuzzleCollection } from '../domain/themes'
import type { Locale, PuzzleCollection, ThemeId } from '../domain/types'
import { SceneIcon } from './SceneIcon'

interface AdventureSelectorProps {
  readonly value: ThemeId
  readonly collection: PuzzleCollection
  readonly locale: Locale
  readonly label: string
  readonly onChange: (themeId: ThemeId) => void
}

export const AdventureSelector = ({
  value,
  collection,
  locale,
  label,
  onChange,
}: AdventureSelectorProps) => {
  const optionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const options = optionsRef.current
    const selected = options?.querySelector<HTMLElement>('[data-selected="true"]')
    if (!options || !selected) return
    const target = selected.offsetLeft - (options.clientWidth - selected.offsetWidth) / 2
    options.scrollLeft = Math.max(0, target)
  }, [collection, value])

  return (
    <fieldset className="adventure-selector">
      <legend>{label}</legend>
      <div ref={optionsRef} className="adventure-selector__options">
        {themesForPuzzleCollection(collection).map((theme) => {
          const copy = themeCopy(locale, theme.id)
          const preview = (theme.roomObjects ?? theme.items)[0]
          return (
            <label
              key={theme.id}
              data-selected={value === theme.id}
              className={`adventure-choice ${value === theme.id ? 'adventure-choice--selected' : ''}`}
            >
              <input
                type="radio"
                name="adventure-theme"
                value={theme.id}
                checked={value === theme.id}
                onChange={() => onChange(theme.id)}
              />
              {preview && (
                <span className="adventure-choice__icon" aria-hidden="true">
                  <SceneIcon emoji={preview.emoji} />
                </span>
              )}
              <span>{copy.title}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
