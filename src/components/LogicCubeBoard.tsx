import { useDroppable } from '@dnd-kit/core'
import {
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  DoorClosed,
  DoorOpen,
  Footprints,
  Layers3,
  Store,
} from 'lucide-react'
import { useEffect, useState, type CSSProperties, type KeyboardEvent } from 'react'
import {
  BUILDING_COLUMNS,
  BUILDING_DEPTH,
  BUILDING_ROWS,
  buildingFloorLabel,
  buildingFloorShortLabel,
  buildingSummary,
  buildingUnitLabel,
} from '../domain/buildingPlan'
import { shareCubeAxisLine } from '../domain/constraints'
import type {
  Character,
  CharacterId,
  Item,
  Locale,
  Position,
  PositionId,
  ThemeId,
} from '../domain/types'
import { CharacterToken, CharacterTokenPreview } from './CharacterToken'
import { SceneIcon } from './SceneIcon'

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
  readonly decorativeEmoji?: string
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
  decorativeEmoji,
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
      {decorativeEmoji && (
        <span
          className="logic-cube__furniture"
          data-furniture-icon={decorativeEmoji}
          aria-hidden="true"
        >
          <SceneIcon emoji={decorativeEmoji} />
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
  readonly items: readonly Item[]
  readonly assignments: Readonly<Partial<Record<CharacterId, PositionId>>>
  readonly selectedCharacterId?: CharacterId
  readonly draggedCharacterId?: CharacterId
  readonly locale: Locale
  readonly themeId: ThemeId
  readonly puzzleSeed: string
  readonly boardLabel: string
  readonly elevatorLabel: string
  readonly floorUpLabel: string
  readonly floorDownLabel: string
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
  items,
  assignments,
  selectedCharacterId,
  draggedCharacterId,
  locale,
  themeId,
  puzzleSeed,
  boardLabel,
  elevatorLabel,
  floorUpLabel,
  floorDownLabel,
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
  const positionIsUnavailable = (position: Position) => Boolean(position.blocked)
  const firstFocusable = visiblePositions.find((position) => !positionIsUnavailable(position))
  const [focusedPositionId, setFocusedPositionId] = useState<PositionId | undefined>()
  const focusTargetId = visiblePositions.some(
    (position) => position.id === focusedPositionId && !positionIsUnavailable(position),
  )
    ? focusedPositionId
    : firstFocusable?.id
  const draggedCharacter = characters.find((character) => character.id === draggedCharacterId)
  const carriedEmojis = new Set(items.map((item) => item.emoji))
  const decorationHash = (position: Position) => {
    let hash = 2166136261
    for (const character of `${puzzleSeed}:${themeId}:${position.layer}:${position.row}:${position.column}`) {
      hash ^= character.codePointAt(0) ?? 0
      hash = Math.imul(hash, 16777619)
    }
    return hash >>> 0
  }
  const decorativeFurniture = (position: Position) => {
    if (!position.blocked || position.buildingKind === 'stairs') return undefined
    const catalogs: Partial<Record<NonNullable<Position['buildingKind']>, readonly string[]>> =
      {
        home: ['🪑', '🛋️', '🪴', '🗄️', '📚', '🪞', '🧺', '🪟'],
        shop: ['🛒', '📦', '🧺', '🗄️', '🪴'],
        landing: ['🪴', '🪞', '🪑'],
        entrance: ['🪴', '🧺'],
      }
    const catalog = (catalogs[position.buildingKind ?? 'landing'] ?? []).filter(
      (emoji) => !carriedEmojis.has(emoji),
    )
    if (catalog.length === 0) return undefined
    const hash = decorationHash(position)
    // Room blockers must never look like empty playable floor. Shared routes can
    // remain sparse because their different material already communicates access.
    if (position.buildingKind !== 'home' && position.buildingKind !== 'shop' && hash % 2 === 0)
      return undefined
    return catalog[hash % catalog.length]
  }
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
            ? (position.column + 1) / BUILDING_COLUMNS
            : columnStep === -1
              ? position.column / BUILDING_COLUMNS
              : (position.column + 0.5) / BUILDING_COLUMNS,
        y:
          rowStep === 1
            ? (position.row + 1) / BUILDING_ROWS
            : rowStep === -1
              ? position.row / BUILDING_ROWS
              : (position.row + 0.5) / BUILDING_ROWS,
        orientation: columnStep === 0 ? 'horizontal' : 'vertical',
      })
      break
    }
  }
  const cubeStyle = {
    '--board-columns': BUILDING_COLUMNS,
    '--board-rows': BUILDING_ROWS,
    '--building-depth': BUILDING_DEPTH,
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
    while (row >= 0 && row < BUILDING_ROWS && column >= 0 && column < BUILDING_COLUMNS) {
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
    const nextLayer = Math.min(BUILDING_DEPTH - 1, Math.max(0, layer + offset))
    if (nextLayer === layer) return
    setActiveLayer(nextLayer)
    requestAnimationFrame(() => document.getElementById(`building-floor-${nextLayer}`)?.focus())
  }

  return (
    <section
      className={`logic-cube ${draggedCharacter ? 'game-board--dragging' : ''}`}
      style={cubeStyle}
      data-grid-size={BUILDING_COLUMNS}
      data-grid-depth={BUILDING_DEPTH}
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
      <div className="logic-cube__elevator" role="group" aria-label={elevatorLabel}>
        <div className="logic-cube__elevator-display" aria-live="polite">
          <Layers3 aria-hidden="true" />
          <span>{buildingFloorShortLabel(locale, activeLayer)}</span>
          <strong>{buildingFloorLabel(locale, activeLayer)}</strong>
        </div>
        <button
          type="button"
          className="logic-cube__elevator-direction"
          aria-label={floorDownLabel}
          disabled={activeLayer === 0}
          onClick={() => setActiveLayer((layer) => Math.max(0, layer - 1))}
        >
          <ChevronDown aria-hidden="true" />
        </button>
        <div className="logic-cube__layers" role="tablist" aria-label={boardLabel}>
          {Array.from({ length: BUILDING_DEPTH }, (_, layer) => layer).map((layer) => {
            const active = activeLayer === layer
            const placedCount = placedPositions.filter(
              ({ position }) => position.layer === layer,
            ).length
            return (
              <button
                id={`building-floor-${layer}`}
                key={layer}
                type="button"
                role="tab"
                tabIndex={active ? 0 : -1}
                aria-selected={active}
                aria-label={buildingFloorLabel(locale, layer)}
                aria-controls="logic-cube-active-layer"
                className={`logic-cube__layer ${active ? 'logic-cube__layer--active' : ''} ${placedCount > 0 ? 'logic-cube__layer--placed' : ''}`}
                onClick={() => setActiveLayer(layer)}
                onKeyDown={(event) => setLayerFromKey(layer, event)}
              >
                <span aria-hidden="true">{buildingFloorShortLabel(locale, layer)}</span>
                {placedCount > 0 && (
                  <small aria-hidden="true">
                    <Check /> {placedCount}
                  </small>
                )}
              </button>
            )
          })}
        </div>
        <button
          type="button"
          className="logic-cube__elevator-direction"
          aria-label={floorUpLabel}
          disabled={activeLayer === BUILDING_DEPTH - 1}
          onClick={() => setActiveLayer((layer) => Math.min(BUILDING_DEPTH - 1, layer + 1))}
        >
          <ChevronUp aria-hidden="true" />
        </button>
      </div>
      <div id="logic-cube-active-layer" className="logic-cube__matrix">
        <div className="logic-cube__floor-title">
          <Layers3 aria-hidden="true" />
          {buildingFloorLabel(locale, activeLayer)}
        </div>
        <div
          className="logic-cube__surface"
          role="grid"
          aria-rowcount={BUILDING_ROWS}
          aria-colcount={BUILDING_COLUMNS}
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
            {Array.from({ length: BUILDING_ROWS }, (_, row) => (
              <div key={row} className="game-board__row" role="row">
                {visiblePositions
                  .filter((position) => position.row === row)
                  .map((position) => {
                    const character = characters.find(
                      (candidate) => assignments[candidate.id] === position.id,
                    )
                    const unitPositions = visiblePositions.filter(
                      (candidate) => candidate.placeId === position.placeId,
                    )
                    const zoneAnchor =
                      (
                        unitPositions.find((candidate) => !candidate.blocked) ??
                        unitPositions[0]
                      )?.id === position.id
                    return (
                      <CubeCell
                        key={position.id}
                        position={position}
                        character={character}
                        selectedCharacterId={selectedCharacterId}
                        draggedCharacter={draggedCharacter}
                        decorativeEmoji={zoneAnchor ? undefined : decorativeFurniture(position)}
                        crossed={!character && isCrossedByCubeAxes(position, occupiedByOthers)}
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
