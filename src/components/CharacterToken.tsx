import { useDraggable } from '@dnd-kit/core'
import type { CSSProperties } from 'react'
import type { Character } from '../domain/types'

interface CharacterTokenProps {
  readonly character: Character
  readonly selected: boolean
  readonly onSelect: (character: Character) => void
}

export const CharacterToken = ({ character, selected, onSelect }: CharacterTokenProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: character.id,
  })
  const style: CSSProperties | undefined = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  return (
    <button
      ref={setNodeRef}
      type="button"
      className={`character-token ${selected ? 'character-token--selected' : ''} ${isDragging ? 'character-token--dragging' : ''}`}
      style={style}
      {...listeners}
      {...attributes}
      aria-pressed={selected}
      aria-label={`${character.name}, ${character.description}`}
      data-character-id={character.id}
      onClick={() => onSelect(character)}
    >
      <span className="character-token__emoji" aria-hidden="true">
        {character.emoji}
      </span>
      <span>{character.name}</span>
    </button>
  )
}
