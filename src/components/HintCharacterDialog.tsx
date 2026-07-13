import type { Character } from '../domain/types'
import { SceneIcon } from './SceneIcon'
import { useDialogFocus } from './useDialogFocus'

interface HintCharacterDialogProps {
  readonly characters: readonly Character[]
  readonly title: string
  readonly description: string
  readonly closeLabel: string
  readonly onSelect: (character: Character) => void
  readonly onClose: () => void
}

export const HintCharacterDialog = ({
  characters,
  title,
  description,
  closeLabel,
  onSelect,
  onClose,
}: HintCharacterDialogProps) => {
  const dialogRef = useDialogFocus(onClose)
  return (
    <div className="settings-backdrop" role="presentation">
      <section
        ref={dialogRef}
        className="hint-character-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hint-title"
      >
        <div className="dialog-heading">
          <h2 id="hint-title">{title}</h2>
          <button
            type="button"
            className="icon-button"
            aria-label={closeLabel}
            onClick={onClose}
          >
            x
          </button>
        </div>
        <p>{description}</p>
        <div className="hint-character-dialog__choices">
          {characters.map((character) => (
            <button key={character.id} type="button" onClick={() => onSelect(character)}>
              <SceneIcon emoji={character.emoji} />
              {character.name}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
