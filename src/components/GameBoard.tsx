import { useDroppable } from '@dnd-kit/core'
import type { CSSProperties } from 'react'
import type { Character, CharacterId, Position, PositionId } from '../domain/types'
import { CharacterToken } from './CharacterToken'

interface LocationCellProps {
  readonly position: Position
  readonly character?: Character
  readonly selectedCharacterId?: CharacterId
  readonly onMoveToPosition: (positionId: PositionId) => void
  readonly onSelectCharacter: (character: Character) => void
  readonly emptyLabel: string
}

const LocationCell = ({
  position,
  character,
  selectedCharacterId,
  onMoveToPosition,
  onSelectCharacter,
  emptyLabel,
}: LocationCellProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: `position:${position.id}` })
  const actionLabel = selectedCharacterId
    ? `Mou el personatge seleccionat a ${position.label}`
    : `Selecciona aquest lloc: ${position.label}`

  return (
    <article
      ref={setNodeRef}
      className={`location-cell ${isOver ? 'location-cell--over' : ''}`}
    >
      <button
        type="button"
        className="location-cell__target"
        onClick={() => onMoveToPosition(position.id)}
        aria-label={actionLabel}
      >
        <span className="location-cell__label">{position.label}</span>
        {!character && <span className="location-cell__empty">{emptyLabel}</span>}
      </button>
      {character && (
        <div className="location-cell__token">
          <CharacterToken
            character={character}
            selected={selectedCharacterId === character.id}
            onSelect={onSelectCharacter}
          />
        </div>
      )}
    </article>
  )
}

interface GameBoardProps {
  readonly positions: readonly Position[]
  readonly characters: readonly Character[]
  readonly assignments: Readonly<Partial<Record<CharacterId, PositionId>>>
  readonly selectedCharacterId?: CharacterId
  readonly onMoveToPosition: (positionId: PositionId) => void
  readonly onSelectCharacter: (character: Character) => void
  readonly boardLabel: string
  readonly emptyLabel: string
}

export const GameBoard = ({
  positions,
  characters,
  assignments,
  selectedCharacterId,
  onMoveToPosition,
  onSelectCharacter,
  boardLabel,
  emptyLabel,
}: GameBoardProps) => {
  const columns = Math.max(...positions.map((position) => position.column)) + 1
  const boardStyle = { '--board-columns': columns } as CSSProperties

  return (
    <section className="game-board" style={boardStyle} role="grid" aria-label={boardLabel}>
      {positions.map((position) => {
        const character = characters.find(
          (candidate) => assignments[candidate.id] === position.id,
        )
        return (
          <LocationCell
            key={position.id}
            position={position}
            character={character}
            selectedCharacterId={selectedCharacterId}
            onMoveToPosition={onMoveToPosition}
            onSelectCharacter={onSelectCharacter}
            emptyLabel={emptyLabel}
          />
        )
      })}
    </section>
  )
}
