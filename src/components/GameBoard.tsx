import { useDroppable } from '@dnd-kit/core'
import { useState, type CSSProperties, type KeyboardEvent } from 'react'
import type {
  Audience,
  BoardMode,
  Character,
  CharacterId,
  Locale,
  Position,
  PositionId,
  Seed,
  ThemeId,
} from '../domain/types'
import { localizeThemePositionLabel } from '../domain/themeVocabulary'
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
  readonly tabIndex: number
  readonly onFocus: () => void
  readonly onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void
  readonly locale: Locale
  readonly themeId: ThemeId
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
  tabIndex,
  onFocus,
  onKeyDown,
  locale,
  themeId,
}: LocationCellProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: `position:${position.id}` })
  const positionLabel = localizeThemePositionLabel(locale, themeId, position.label)
  const actionLabel = selectedCharacterId
    ? moveToPositionLabel(positionLabel)
    : selectPositionLabel(positionLabel)
  const unavailable = disabled || position.blocked

  return (
    <article
      ref={setNodeRef}
      role="gridcell"
      aria-rowindex={position.row + 1}
      aria-colindex={position.column + 1}
      className={`location-cell ${character ? 'location-cell--filled' : ''} ${crossed ? 'location-cell--crossed' : ''} ${position.blocked ? 'location-cell--blocked' : ''} ${selectedCharacterId && !unavailable ? 'location-cell--placeable' : ''} location-cell--row-${position.row} ${isOver && !unavailable ? 'location-cell--over' : ''}`}
    >
      <button
        id={`grid-target-${position.id}`}
        type="button"
        className="location-cell__target"
        onClick={() => onMoveToPosition(position.id)}
        aria-label={
          position.blocked && position.obstacleLabel
            ? `${positionLabel}: ${localizeThemePositionLabel(
                locale,
                themeId,
                position.obstacleLabel,
              )}`
            : actionLabel
        }
        disabled={unavailable}
        tabIndex={tabIndex}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
      >
        <span className="location-cell__label">{positionLabel}</span>
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
  readonly locale: Locale
  readonly puzzleSeed: Seed
  readonly themeId: ThemeId
  readonly spatialPlanId?: SpatialPlanId
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
  locale,
  puzzleSeed,
  themeId,
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
  const assignedPositionIds = new Set(Object.values(assignments))
  const spatialPlan =
    boardMode === 'logic-grid' && audience !== 'children'
      ? (spatialPlanForId(spatialPlanId) ?? defaultSpatialPlanFor(audience))
      : undefined
  const positionIsUnavailable = (position: Position) =>
    Boolean(
      position.blocked ||
      (boardMode === 'logic-grid' &&
        !assignedPositionIds.has(position.id) &&
        (crossedRows.has(position.row) || crossedColumns.has(position.column))),
    )
  const firstFocusablePosition = positions.find((position) => !positionIsUnavailable(position))
  const [focusedPositionId, setFocusedPositionId] = useState<PositionId | undefined>(
    firstFocusablePosition?.id,
  )
  const focusedPosition = positions.find((position) => position.id === focusedPositionId)
  const activeFocusedPositionId =
    focusedPosition && !positionIsUnavailable(focusedPosition)
      ? focusedPosition.id
      : firstFocusablePosition?.id

  const moveGridFocus = (position: Position, event: KeyboardEvent<HTMLButtonElement>) => {
    const direction = {
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
    }[event.key]
    if (!direction) return
    event.preventDefault()
    const [rowStep, columnStep] = direction
    let row = position.row + rowStep
    let column = position.column + columnStep
    while (row >= 0 && row < rows && column >= 0 && column < columns) {
      const next = positions.find(
        (candidate) => candidate.row === row && candidate.column === column,
      )
      if (next && !positionIsUnavailable(next)) {
        setFocusedPositionId(next.id)
        requestAnimationFrame(() => document.getElementById(`grid-target-${next.id}`)?.focus())
        return
      }
      row += rowStep
      column += columnStep
    }
  }

  return (
    <section
      className={`game-board ${boardMode === 'logic-grid' ? 'game-board--logic-grid' : ''} ${selectedCharacterId ? 'game-board--placing' : ''}`}
      style={boardStyle}
      role="grid"
      aria-rowcount={rows}
      aria-colcount={columns}
      aria-label={boardLabel}
      data-grid-size={boardMode === 'logic-grid' ? columns : undefined}
    >
      {boardMode === 'logic-grid' && (
        <LogicGridArtwork
          audience={audience}
          plan={spatialPlan}
          positions={positions}
          puzzleSeed={puzzleSeed}
          themeId={themeId}
        />
      )}
      {spatialPlan && (
        <GridObjectIcons
          plan={spatialPlan}
          positions={positions}
          locale={locale}
          themeId={themeId}
        />
      )}
      <div className="game-board__cells">
        {Array.from({ length: rows }, (_, row) => (
          <div key={row} className="game-board__row" role="row">
            {positions
              .filter((position) => position.row === row)
              .map((position) => {
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
                    tabIndex={activeFocusedPositionId === position.id ? 0 : -1}
                    onFocus={() => setFocusedPositionId(position.id)}
                    onKeyDown={(event) => moveGridFocus(position, event)}
                    locale={locale}
                    themeId={themeId}
                  />
                )
              })}
          </div>
        ))}
      </div>
    </section>
  )
}
