import { useDraggable } from '@dnd-kit/core'
import type { Character } from '../domain/types'
import { SceneIcon } from './SceneIcon'

interface CharacterTokenProps {
  readonly character: Character
  readonly selected: boolean
  readonly onSelect: (character: Character) => void
  readonly actionLabel?: string
}

export const CharacterToken = ({
  character,
  selected,
  onSelect,
  actionLabel,
}: CharacterTokenProps) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: character.id,
  })

  return (
    <button
      ref={setNodeRef}
      type="button"
      className={`character-token ${selected ? 'character-token--selected' : ''} ${isDragging ? 'character-token--dragging' : ''}`}
      {...listeners}
      {...attributes}
      aria-pressed={selected}
      aria-label={actionLabel ?? `${character.name}, ${character.description}`}
      data-character-id={character.id}
      onClick={() => onSelect(character)}
    >
      <span className="character-token__emoji" aria-hidden="true">
        <SceneIcon emoji={character.emoji} />
      </span>
      <span>{character.name}</span>
    </button>
  )
}

interface CharacterTokenPreviewProps {
  readonly character: Character
  readonly variant: 'drag-overlay' | 'drop-target'
}

export const CharacterTokenPreview = ({ character, variant }: CharacterTokenPreviewProps) => (
  <div
    className={`character-token character-token--preview character-token--${variant}`}
    aria-hidden="true"
  >
    <span className="character-token__emoji">
      <SceneIcon emoji={character.emoji} />
    </span>
    {variant === 'drag-overlay' && <span>{character.name}</span>}
  </div>
)
