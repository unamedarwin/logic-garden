import { useDroppable } from '@dnd-kit/core'
import type { CSSProperties } from 'react'
import type {
  Audience,
  BoardMode,
  Character,
  CharacterId,
  Position,
  PositionId,
} from '../domain/types'
import { CharacterToken } from './CharacterToken'
import { GridObjectIcons } from './GridObjectIcons'
import { LogicGridArtwork } from './LogicGridArtwork'

interface LocationCellProps {
  readonly position: Position
  readonly character?: Character
  readonly selectedCharacterId?: CharacterId
  readonly onMoveToPosition: (positionId: PositionId) => void
  readonly onRemoveCharacter: (characterId: CharacterId) => void
  readonly emptyLabel: string
  readonly returnLabel: string
  readonly moveToPositionLabel: (positionLabel: string) => string
  readonly selectPositionLabel: (positionLabel: string) => string
  readonly crossed: boolean
  readonly disabled: boolean
  readonly logicGrid: boolean
}

const LocationCell = ({
  position,
  character,
  selectedCharacterId,
  onMoveToPosition,
  onRemoveCharacter,
  emptyLabel,
  returnLabel,
  moveToPositionLabel,
  selectPositionLabel,
  crossed,
  disabled,
  logicGrid,
}: LocationCellProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: `position:${position.id}` })
  const actionLabel = selectedCharacterId
    ? moveToPositionLabel(position.label)
    : selectPositionLabel(position.label)

  return (
    <article
      ref={setNodeRef}
      className={`location-cell ${character ? 'location-cell--filled' : ''} ${crossed ? 'location-cell--crossed' : ''} location-cell--row-${position.row} ${isOver ? 'location-cell--over' : ''}`}
    >
      <button
        type="button"
        className="location-cell__target"
        onClick={() => onMoveToPosition(position.id)}
        aria-label={actionLabel}
        disabled={disabled}
      >
        <span className="location-cell__label">
          {logicGrid ? `${position.row + 1} · ${position.column + 1}` : position.label}
        </span>
        <span className="location-cell__marker" aria-hidden="true">
          ✦
        </span>
        {!character && <span className="location-cell__empty">{emptyLabel}</span>}
      </button>
      {character && (
        <div className="location-cell__token">
          <CharacterToken
            character={character}
            selected={false}
            onSelect={() => onRemoveCharacter(character.id)}
            actionLabel={`${returnLabel}: ${character.name}`}
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
  readonly onRemoveCharacter: (characterId: CharacterId) => void
  readonly boardLabel: string
  readonly emptyLabel: string
  readonly returnLabel: string
  readonly moveToPositionLabel: (positionLabel: string) => string
  readonly selectPositionLabel: (positionLabel: string) => string
  readonly boardMode: BoardMode
  readonly audience: Audience
}

export const GameBoard = ({
  positions,
  characters,
  assignments,
  selectedCharacterId,
  onMoveToPosition,
  onRemoveCharacter,
  boardLabel,
  emptyLabel,
  returnLabel,
  moveToPositionLabel,
  selectPositionLabel,
  boardMode,
  audience,
}: GameBoardProps) => {
  const columns = Math.max(...positions.map((position) => position.column)) + 1
  const boardStyle = { '--board-columns': columns } as CSSProperties
  const assignmentsWithoutSelected = Object.fromEntries(
    Object.entries(assignments).filter(([characterId]) => characterId !== selectedCharacterId),
  ) as Readonly<Partial<Record<CharacterId, PositionId>>>
  const occupiedGridPositions = positions.filter((position) =>
    Object.values(assignmentsWithoutSelected).includes(position.id),
  )
  const crossedRows = new Set(occupiedGridPositions.map((position) => position.row))
  const crossedColumns = new Set(occupiedGridPositions.map((position) => position.column))

  return (
    <section
      className={`game-board ${boardMode === 'logic-grid' ? 'game-board--logic-grid' : ''}`}
      style={boardStyle}
      role="grid"
      aria-label={boardLabel}
    >
      {boardMode === 'logic-grid' && (
        <LogicGridArtwork audience={audience} positions={positions} assignments={assignments} />
      )}
      {boardMode === 'logic-grid' && audience !== 'children' && (
        <GridObjectIcons audience={audience} positions={positions} />
      )}
      <div className="game-board__cells">
        {positions.map((position) => {
          const character = characters.find(
            (candidate) => assignments[candidate.id] === position.id,
          )
          const crossed =
            boardMode === 'logic-grid' &&
            !character &&
            (crossedRows.has(position.row) || crossedColumns.has(position.column))
          return (
            <LocationCell
              key={position.id}
              position={position}
              character={character}
              selectedCharacterId={selectedCharacterId}
              onMoveToPosition={onMoveToPosition}
              onRemoveCharacter={onRemoveCharacter}
              emptyLabel={emptyLabel}
              returnLabel={returnLabel}
              moveToPositionLabel={moveToPositionLabel}
              selectPositionLabel={selectPositionLabel}
              crossed={crossed}
              disabled={crossed}
              logicGrid={boardMode === 'logic-grid'}
            />
          )
        })}
      </div>
    </section>
  )
}
