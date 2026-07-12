import { useDroppable } from '@dnd-kit/core'
import type { CSSProperties } from 'react'
import type {
  Audience,
  BoardMode,
  Character,
  CharacterId,
  Item,
  Position,
  PositionId,
} from '../domain/types'
import {
  defaultSpatialPlanFor,
  spatialPlanForId,
  type SpatialPlanId,
} from '../domain/spatialPlan'
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
  const unavailable = disabled || position.blocked

  return (
    <article
      ref={setNodeRef}
      className={`location-cell ${character ? 'location-cell--filled' : ''} ${crossed ? 'location-cell--crossed' : ''} ${position.blocked ? 'location-cell--blocked' : ''} ${selectedCharacterId && !unavailable ? 'location-cell--placeable' : ''} location-cell--row-${position.row} ${isOver && !unavailable ? 'location-cell--over' : ''}`}
    >
      <button
        type="button"
        className="location-cell__target"
        onClick={() => onMoveToPosition(position.id)}
        aria-label={
          position.blocked && position.obstacleLabel
            ? `${position.label}: ${position.obstacleLabel}`
            : actionLabel
        }
        disabled={unavailable}
      >
        <span className="location-cell__label">{position.label}</span>
        <span className="location-cell__marker" aria-hidden="true">
          +
        </span>
        {!character && !logicGrid && <span className="location-cell__empty">{emptyLabel}</span>}
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
  readonly items: readonly Item[]
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
  readonly spatialPlanId?: SpatialPlanId
}

export const GameBoard = ({
  positions,
  characters,
  items,
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
  spatialPlanId,
}: GameBoardProps) => {
  const columns = Math.max(...positions.map((position) => position.column)) + 1
  const rows = Math.max(...positions.map((position) => position.row)) + 1
  const boardStyle = {
    '--board-columns': columns,
    '--board-rows': rows,
  } as CSSProperties
  const assignmentsWithoutSelected = Object.fromEntries(
    Object.entries(assignments).filter(([characterId]) => characterId !== selectedCharacterId),
  ) as Readonly<Partial<Record<CharacterId, PositionId>>>
  const occupiedGridPositions = positions.filter((position) =>
    Object.values(assignmentsWithoutSelected).includes(position.id),
  )
  const crossedRows = new Set(occupiedGridPositions.map((position) => position.row))
  const crossedColumns = new Set(occupiedGridPositions.map((position) => position.column))
  const spatialPlan =
    boardMode === 'logic-grid' && audience !== 'children'
      ? (spatialPlanForId(spatialPlanId) ?? defaultSpatialPlanFor(audience))
      : undefined

  return (
    <section
      className={`game-board ${boardMode === 'logic-grid' ? 'game-board--logic-grid' : ''} ${selectedCharacterId ? 'game-board--placing' : ''}`}
      style={boardStyle}
      role="grid"
      aria-label={boardLabel}
    >
      {boardMode === 'logic-grid' && (
        <LogicGridArtwork
          audience={audience}
          plan={spatialPlan}
          positions={positions}
          assignments={assignments}
        />
      )}
      {spatialPlan && (
        <GridObjectIcons plan={spatialPlan} positions={positions} items={items} />
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
