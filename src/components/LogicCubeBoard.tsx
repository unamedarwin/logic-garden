import { useDroppable } from '@dnd-kit/core'
import {
  Building2,
  Check,
  DoorClosed,
  DoorOpen,
  Footprints,
  Layers3,
  Store,
} from 'lucide-react'
import { useEffect, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { buildingFloorLabel, buildingSummary, buildingUnitLabel } from '../domain/buildingPlan'
import { shareCubeAxisLine } from '../domain/constraints'
import type {
  Character,
  CharacterId,
  Locale,
  Position,
  PositionId,
  ThemeId,
} from '../domain/types'
import { CharacterToken, CharacterTokenPreview } from './CharacterToken'

interface PlacedCubePosition {
  readonly characterId: CharacterId
  readonly position: Position
}

const isCrossedByCubeAxes = (candidate: Position, placements: readonly PlacedCubePosition[]) =>
  placements.some(
    ({ position }) => position.id !== candidate.id && shareCubeAxisLine(position, candidate),
  )

const BuildingCellIcon = ({ kind }: { readonly kind: Position['buildingKind'] }) => {
  const Icon =
    kind === 'home'
      ? DoorClosed
      : kind === 'shop'
        ? Store
        : kind === 'stairs'
          ? Layers3
          : kind === 'entrance'
            ? DoorOpen
            : Footprints
  return <Icon aria-hidden="true" />
}

interface CubeCellProps {
  readonly position: Position
  readonly character?: Character
  readonly selectedCharacterId?: CharacterId
  readonly draggedCharacter?: Character
  readonly crossed: boolean
  readonly disabled: boolean
  readonly zoneAnchor: boolean
  readonly tabIndex: number
  readonly locale: Locale
  readonly returnLabel: string
  readonly moveToPositionLabel: (positionLabel: string) => string
  readonly selectPositionLabel: (positionLabel: string) => string
  readonly onMoveToPosition: (positionId: PositionId) => void
  readonly onRemoveCharacter: (characterId: CharacterId) => void
  readonly onFocus: () => void
  readonly onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void
}

const CubeCell = ({
  position,
  character,
  selectedCharacterId,
  draggedCharacter,
  crossed,
  disabled,
  zoneAnchor,
  tabIndex,
  locale,
  returnLabel,
  moveToPositionLabel,
  selectPositionLabel,
  onMoveToPosition,
  onRemoveCharacter,
  onFocus,
  onKeyDown,
}: CubeCellProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: `position:${position.id}` })
  const label =
    position.buildingUnitId !== undefined && position.layer !== undefined
      ? buildingUnitLabel(locale, position.buildingUnitId, position.layer)
      : position.label
  const showPreview = Boolean(isOver && !disabled && draggedCharacter)

  return (
    <article
      ref={setNodeRef}
      role="gridcell"
      aria-rowindex={position.row + 1}
      aria-colindex={position.column + 1}
      data-grid-position={position.id}
      data-building-kind={position.buildingKind}
      className={`logic-cube__cell location-cell logic-cube__cell--${position.buildingKind ?? 'home'} ${position.blocked ? 'location-cell--blocked' : ''} ${character ? 'location-cell--filled' : ''} ${crossed ? 'location-cell--crossed' : ''} ${selectedCharacterId && !disabled ? 'location-cell--placeable' : ''} ${isOver && !disabled ? 'location-cell--over' : ''}`}
    >
      <button
        id={`grid-target-${position.id}`}
        type="button"
        className="location-cell__target"
        aria-label={
          selectedCharacterId ? moveToPositionLabel(label) : selectPositionLabel(label)
        }
        disabled={disabled}
        tabIndex={tabIndex}
        onClick={() => onMoveToPosition(position.id)}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
      >
        <span className="sr-only">{label}</span>
      </button>
      {zoneAnchor && (
        <span className="logic-cube__zone-label" aria-hidden="true">
          <BuildingCellIcon kind={position.buildingKind} />
          {position.buildingUnitId
            ? buildingUnitLabel(locale, position.buildingUnitId, position.layer ?? 0).split(
                ' · ',
              )[0]
            : label}
        </span>
      )}
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
      {showPreview && draggedCharacter && (
        <div className="location-cell__drop-preview">
          <CharacterTokenPreview character={draggedCharacter} variant="drop-target" />
        </div>
      )}
    </article>
  )
}

interface LogicCubeBoardProps {
  readonly positions: readonly Position[]
  readonly characters: readonly Character[]
  readonly assignments: Readonly<Partial<Record<CharacterId, PositionId>>>
  readonly selectedCharacterId?: CharacterId
  readonly draggedCharacterId?: CharacterId
  readonly locale: Locale
  readonly themeId: ThemeId
  readonly boardLabel: string
  readonly returnLabel: string
  readonly moveToPositionLabel: (positionLabel: string) => string
  readonly selectPositionLabel: (positionLabel: string) => string
  readonly onMoveToPosition: (positionId: PositionId) => void
  readonly onRemoveCharacter: (characterId: CharacterId) => void
  readonly zoom?: number
}

export const LogicCubeBoard = ({
  positions,
  characters,
  assignments,
  selectedCharacterId,
  draggedCharacterId,
  locale,
  boardLabel,
  returnLabel,
  moveToPositionLabel,
  selectPositionLabel,
  onMoveToPosition,
  onRemoveCharacter,
  zoom = 1,
}: LogicCubeBoardProps) => {
  const requestedCharacterId = draggedCharacterId ?? selectedCharacterId
  const requestedPosition = requestedCharacterId
    ? positions.find((position) => position.id === assignments[requestedCharacterId])
    : undefined
  const [activeLayer, setActiveLayer] = useState(requestedPosition?.layer ?? 1)

  useEffect(() => {
    if (requestedPosition?.layer !== undefined) setActiveLayer(requestedPosition.layer)
  }, [requestedPosition?.layer])

  const visiblePositions = positions.filter((position) => position.layer === activeLayer)
  const placedPositions = Object.entries(assignments)
    .map(([characterId, positionId]) => {
      const position = positions.find((candidate) => candidate.id === positionId)
      return position ? { characterId: characterId as CharacterId, position } : undefined
    })
    .filter((placement): placement is PlacedCubePosition => Boolean(placement))
  const occupiedByOthers = placedPositions.filter(
    ({ characterId }) => characterId !== requestedCharacterId,
  )
  const positionIsUnavailable = (position: Position) =>
    Boolean(
      position.blocked ||
      occupiedByOthers.some((placement) => shareCubeAxisLine(placement.position, position)),
    )
  const firstFocusable = visiblePositions.find((position) => !positionIsUnavailable(position))
  const [focusedPositionId, setFocusedPositionId] = useState<PositionId | undefined>()
  const focusTargetId = visiblePositions.some(
    (position) => position.id === focusedPositionId && !positionIsUnavailable(position),
  )
    ? focusedPositionId
    : firstFocusable?.id
  const draggedCharacter = characters.find((character) => character.id === draggedCharacterId)
  const floorDoors = new Map<
    string,
    { readonly x: number; readonly y: number; readonly orientation: 'horizontal' | 'vertical' }
  >()
  for (const position of visiblePositions.filter(
    (candidate) => candidate.buildingKind === 'home' || candidate.buildingKind === 'shop',
  )) {
    const neighbors = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ] as const
    for (const [rowStep, columnStep] of neighbors) {
      const neighbor = visiblePositions.find(
        (candidate) =>
          candidate.row === position.row + rowStep &&
          candidate.column === position.column + columnStep,
      )
      if (
        !neighbor ||
        (neighbor.buildingKind !== 'landing' && neighbor.buildingKind !== 'stairs')
      )
        continue
      if (!position.buildingUnitId || floorDoors.has(position.buildingUnitId)) break
      floorDoors.set(position.buildingUnitId, {
        x:
          columnStep === 1
            ? (position.column + 1) / 5
            : columnStep === -1
              ? position.column / 5
              : (position.column + 0.5) / 5,
        y:
          rowStep === 1
            ? (position.row + 1) / 5
            : rowStep === -1
              ? position.row / 5
              : (position.row + 0.5) / 5,
        orientation: columnStep === 0 ? 'horizontal' : 'vertical',
      })
      break
    }
  }
  const cubeStyle = {
    '--board-columns': 5,
    '--board-rows': 5,
    width: zoom > 1 ? `${zoom * 100}%` : undefined,
    maxWidth: zoom > 1 ? 'none' : undefined,
  } as CSSProperties

  const moveFocus = (position: Position, event: KeyboardEvent<HTMLButtonElement>) => {
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
    while (row >= 0 && row < 5 && column >= 0 && column < 5) {
      const next = visiblePositions.find(
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

  const setLayerFromKey = (layer: number, event: KeyboardEvent<HTMLButtonElement>) => {
    const offset =
      event.key === 'ArrowLeft' || event.key === 'ArrowDown'
        ? -1
        : event.key === 'ArrowRight' || event.key === 'ArrowUp'
          ? 1
          : 0
    if (offset === 0) return
    event.preventDefault()
    setActiveLayer((layer + offset + 3) % 3)
  }

  return (
    <section
      className={`logic-cube ${draggedCharacter ? 'game-board--dragging' : ''}`}
      style={cubeStyle}
      data-grid-size="5"
      data-grid-depth="3"
      aria-label={boardLabel}
    >
      <div className="logic-cube__heading">
        <span className="logic-cube__mark" aria-hidden="true">
          <Building2 />
        </span>
        <div>
          <strong>{boardLabel}</strong>
          <span>{buildingSummary(locale)}</span>
        </div>
      </div>
      <div className="logic-cube__layers" role="tablist" aria-label={boardLabel}>
        {[2, 1, 0].map((layer) => {
          const layerPositions = positions.filter((position) => position.layer === layer)
          const active = activeLayer === layer
          const placedCount = placedPositions.filter(
            ({ position }) => position.layer === layer,
          ).length
          return (
            <button
              key={layer}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls="logic-cube-active-layer"
              className={`logic-cube__layer ${active ? 'logic-cube__layer--active' : ''} ${placedCount > 0 ? 'logic-cube__layer--placed' : ''}`}
              onClick={() => setActiveLayer(layer)}
              onKeyDown={(event) => setLayerFromKey(layer, event)}
            >
              <span>{buildingFloorLabel(locale, layer)}</span>
              {placedCount > 0 && <Check aria-label={`${placedCount}`} />}
              <span className="logic-cube__layer-preview" aria-hidden="true">
                {layerPositions.map((position) => {
                  const placed = placedPositions.some(
                    ({ position: assigned }) => assigned.id === position.id,
                  )
                  return (
                    <i
                      key={position.id}
                      data-kind={position.buildingKind}
                      className={`${placed ? 'logic-cube__layer-preview-cell--placed' : ''} ${isCrossedByCubeAxes(position, placedPositions) ? 'logic-cube__layer-preview-cell--crossed' : ''}`}
                    />
                  )
                })}
              </span>
            </button>
          )
        })}
      </div>
      <div id="logic-cube-active-layer" className="logic-cube__matrix">
        <div className="logic-cube__floor-title">
          <Layers3 aria-hidden="true" />
          {buildingFloorLabel(locale, activeLayer)}
        </div>
        <div
          className="logic-cube__surface"
          role="grid"
          aria-rowcount={5}
          aria-colcount={5}
          aria-label={`${boardLabel}: ${buildingFloorLabel(locale, activeLayer)}`}
        >
          {draggedCharacter && <div className="game-board__drop-grid" aria-hidden="true" />}
          <div className="logic-cube__doors" aria-hidden="true">
            {[...floorDoors.entries()].map(([unitId, door]) => (
              <span
                key={unitId}
                className={`logic-cube__door logic-cube__door--${door.orientation}`}
                style={{ left: `${door.x * 100}%`, top: `${door.y * 100}%` }}
              >
                <DoorOpen />
              </span>
            ))}
          </div>
          <div className="game-board__cells">
            {Array.from({ length: 5 }, (_, row) => (
              <div key={row} className="game-board__row" role="row">
                {visiblePositions
                  .filter((position) => position.row === row)
                  .map((position) => {
                    const character = characters.find(
                      (candidate) => assignments[candidate.id] === position.id,
                    )
                    const zoneAnchor =
                      visiblePositions.find(
                        (candidate) => candidate.placeId === position.placeId,
                      )?.id === position.id
                    return (
                      <CubeCell
                        key={position.id}
                        position={position}
                        character={character}
                        selectedCharacterId={selectedCharacterId}
                        draggedCharacter={draggedCharacter}
                        crossed={!character && isCrossedByCubeAxes(position, placedPositions)}
                        disabled={positionIsUnavailable(position)}
                        zoneAnchor={zoneAnchor}
                        tabIndex={focusTargetId === position.id ? 0 : -1}
                        locale={locale}
                        returnLabel={returnLabel}
                        moveToPositionLabel={moveToPositionLabel}
                        selectPositionLabel={selectPositionLabel}
                        onMoveToPosition={onMoveToPosition}
                        onRemoveCharacter={onRemoveCharacter}
                        onFocus={() => setFocusedPositionId(position.id)}
                        onKeyDown={(event) => moveFocus(position, event)}
                      />
                    )
                  })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
