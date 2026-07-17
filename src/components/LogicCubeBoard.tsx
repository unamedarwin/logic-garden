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
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import {
  BUILDING_COLUMNS,
  BUILDING_ROWS,
  buildingDepthForPositions,
  buildingFloorLabel,
  buildingFloorShortLabel,
  buildingSummary,
  buildingUnitLabel,
  buildingWallSegmentsForLayer,
} from '../domain/buildingPlan'
import { shareCubeAxisLine } from '../domain/constraints'
import { buildingRoomDestinationsForPositions } from '../domain/placements'
import type {
  BuildingPlacement,
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

const touchesBuildingRoute = (position: Position, positions: readonly Position[]): boolean =>
  positions.some(
    (candidate) =>
      candidate.layer === position.layer &&
      Math.abs(candidate.row - position.row) + Math.abs(candidate.column - position.column) ===
        1 &&
      (candidate.buildingKind === 'landing' ||
        candidate.buildingKind === 'stairs' ||
        candidate.buildingKind === 'entrance'),
  )

const labelAnchorForUnit = (
  roomPositions: readonly Position[],
  floorPositions: readonly Position[],
) =>
  roomPositions
    .filter((candidate) => !candidate.blocked)
    .toSorted(
      (first, second) =>
        Number(touchesBuildingRoute(first, floorPositions)) -
          Number(touchesBuildingRoute(second, floorPositions)) ||
        first.row - second.row ||
        first.column - second.column,
    )[0]

const motionSafeScrollBehavior = (): ScrollBehavior => {
  if (typeof window === 'undefined') return 'auto'
  const reducedByPreference =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const reducedInSettings = document.documentElement.dataset.reducedMotion === 'true'
  return reducedByPreference || reducedInSettings ? 'auto' : 'smooth'
}

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
  readonly decorativeOnly: boolean
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
  decorativeOnly,
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
  const { setNodeRef, isOver } = useDroppable({
    id: `position:${position.id}`,
    disabled,
  })
  const label =
    position.buildingUnitId !== undefined && position.layer !== undefined
      ? buildingUnitLabel(locale, position.buildingUnitId, position.layer)
      : position.label
  const showPreview = Boolean(isOver && !disabled && draggedCharacter)

  return (
    <article
      ref={setNodeRef}
      role={decorativeOnly ? 'presentation' : 'gridcell'}
      aria-rowindex={decorativeOnly ? undefined : position.row + 1}
      aria-colindex={decorativeOnly ? undefined : position.column + 1}
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
        aria-hidden={decorativeOnly}
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

interface RoomTargetProps {
  readonly position: Position
  readonly roomPositions: readonly Position[]
  readonly character?: Character
  readonly selectedCharacterId?: CharacterId
  readonly draggedCharacter?: Character
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

const RoomTarget = ({
  position,
  roomPositions,
  character,
  selectedCharacterId,
  draggedCharacter,
  tabIndex,
  locale,
  returnLabel,
  moveToPositionLabel,
  selectPositionLabel,
  onMoveToPosition,
  onRemoveCharacter,
  onFocus,
  onKeyDown,
}: RoomTargetProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: `position:${position.id}` })
  const rows = roomPositions.map((candidate) => candidate.row)
  const columns = roomPositions.map((candidate) => candidate.column)
  const rowStart = Math.min(...rows)
  const rowEnd = Math.max(...rows)
  const columnStart = Math.min(...columns)
  const columnEnd = Math.max(...columns)
  const expectedCellCount = (rowEnd - rowStart + 1) * (columnEnd - columnStart + 1)
  if (expectedCellCount !== roomPositions.length) {
    throw new Error(`L’estança ${position.placeId} no forma un rectangle interactiu.`)
  }
  const label = buildingUnitLabel(locale, position.buildingUnitId ?? '', position.layer ?? 0)
  return (
    <article
      ref={setNodeRef}
      role="presentation"
      data-room-target={position.placeId}
      data-grid-position={position.id}
      className={`logic-cube__room-target ${selectedCharacterId ? 'logic-cube__room-target--placeable' : ''} ${isOver ? 'logic-cube__room-target--over' : ''} ${character ? 'logic-cube__room-target--filled' : ''}`}
      style={{
        left: `${(columnStart / BUILDING_COLUMNS) * 100}%`,
        top: `${(rowStart / BUILDING_ROWS) * 100}%`,
        width: `${((columnEnd - columnStart + 1) / BUILDING_COLUMNS) * 100}%`,
        height: `${((rowEnd - rowStart + 1) / BUILDING_ROWS) * 100}%`,
      }}
    >
      <button
        id={`grid-target-${position.id}`}
        type="button"
        className="logic-cube__room-button"
        aria-label={
          selectedCharacterId ? moveToPositionLabel(label) : selectPositionLabel(label)
        }
        tabIndex={tabIndex}
        onClick={() => onMoveToPosition(position.id)}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
      >
        <span className="sr-only">{label}</span>
      </button>
      {character && (
        <div className="logic-cube__room-token">
          <CharacterToken
            character={character}
            selected={false}
            onSelect={() => onRemoveCharacter(character.id)}
            actionLabel={`${returnLabel}: ${character.name}`}
          />
        </div>
      )}
      {isOver && draggedCharacter && (
        <div className="logic-cube__room-preview">
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
  readonly buildingPlacement?: BuildingPlacement
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
  buildingPlacement = 'cells',
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
  const buildingDepth = buildingDepthForPositions(positions)
  const layerButtonRefs = useRef(new Map<number, HTMLButtonElement>())
  const [activeLayer, setActiveLayer] = useState(
    Math.min(buildingDepth - 1, requestedPosition?.layer ?? 1),
  )

  useEffect(() => {
    setActiveLayer(Math.min(buildingDepth - 1, requestedPosition?.layer ?? 1))
  }, [buildingDepth, puzzleSeed, requestedPosition?.layer])

  useEffect(() => {
    layerButtonRefs.current.get(activeLayer)?.scrollIntoView({
      behavior: motionSafeScrollBehavior(),
      block: 'nearest',
      inline: 'center',
    })
  }, [activeLayer, buildingDepth])

  const visiblePositions = positions.filter((position) => position.layer === activeLayer)
  const roomPlacement = buildingPlacement === 'rooms'
  const roomDestinations = roomPlacement ? buildingRoomDestinationsForPositions(positions) : []
  const visibleRoomDestinations = roomDestinations.filter(
    (position) => position.layer === activeLayer,
  )
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
    roomPlacement || Boolean(position.blocked)
  const focusablePositions = roomPlacement
    ? visibleRoomDestinations
    : visiblePositions.filter((position) => !positionIsUnavailable(position))
  const firstFocusable = focusablePositions[0]
  const [focusedPositionId, setFocusedPositionId] = useState<PositionId | undefined>()
  const focusTargetId = focusablePositions.some((position) => position.id === focusedPositionId)
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
    if (position.obstacleEmoji) return position.obstacleEmoji
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
  const floorDoors = new Map<string, { readonly x: number; readonly y: number }>()
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
      })
      break
    }
  }
  const floorWalls = buildingWallSegmentsForLayer(visiblePositions, activeLayer)
  const cubeStyle = {
    '--board-columns': BUILDING_COLUMNS,
    '--board-rows': BUILDING_ROWS,
    '--building-depth': buildingDepth,
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
    if (roomPlacement) {
      const next = focusablePositions
        .filter((candidate) => {
          if (rowStep < 0) return candidate.row < position.row
          if (rowStep > 0) return candidate.row > position.row
          if (columnStep < 0) return candidate.column < position.column
          return candidate.column > position.column
        })
        .sort(
          (first, second) =>
            Math.abs(first.row - position.row) +
            Math.abs(first.column - position.column) -
            (Math.abs(second.row - position.row) + Math.abs(second.column - position.column)),
        )[0]
      if (next) {
        setFocusedPositionId(next.id)
        requestAnimationFrame(() => document.getElementById(`grid-target-${next.id}`)?.focus())
      }
      return
    }
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
    const boundaryLayer =
      event.key === 'Home' ? 0 : event.key === 'End' ? buildingDepth - 1 : undefined
    const offset =
      event.key === 'ArrowLeft' || event.key === 'ArrowDown'
        ? -1
        : event.key === 'ArrowRight' || event.key === 'ArrowUp'
          ? 1
          : 0
    if (offset === 0 && boundaryLayer === undefined) return
    event.preventDefault()
    const nextLayer = boundaryLayer ?? Math.min(buildingDepth - 1, Math.max(0, layer + offset))
    if (nextLayer === layer) return
    setActiveLayer(nextLayer)
    requestAnimationFrame(() => layerButtonRefs.current.get(nextLayer)?.focus())
  }

  return (
    <section
      className={`logic-cube ${roomPlacement ? 'logic-cube--rooms' : 'logic-cube--cells'} ${draggedCharacter ? 'game-board--dragging' : ''}`}
      style={cubeStyle}
      data-grid-size={BUILDING_COLUMNS}
      data-grid-depth={buildingDepth}
      aria-label={boardLabel}
    >
      <div className="logic-cube__heading">
        <span className="logic-cube__mark" aria-hidden="true">
          <Building2 />
        </span>
        <div>
          <strong>{boardLabel}</strong>
          <span>{buildingSummary(locale, buildingDepth)}</span>
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
        <div
          className="logic-cube__layers"
          role="tablist"
          aria-label={boardLabel}
          aria-orientation="horizontal"
        >
          {Array.from({ length: buildingDepth }, (_, layer) => layer).map((layer) => {
            const active = activeLayer === layer
            const placedCount = placedPositions.filter(
              ({ position }) => position.layer === layer,
            ).length
            return (
              <button
                ref={(node) => {
                  if (node) layerButtonRefs.current.set(layer, node)
                  else layerButtonRefs.current.delete(layer)
                }}
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
          disabled={activeLayer === buildingDepth - 1}
          onClick={() => setActiveLayer((layer) => Math.min(buildingDepth - 1, layer + 1))}
        >
          <ChevronUp aria-hidden="true" />
        </button>
      </div>
      <div
        id="logic-cube-active-layer"
        className="logic-cube__matrix"
        role="tabpanel"
        aria-labelledby={`building-floor-${activeLayer}`}
      >
        <div className="logic-cube__floor-title">
          <Layers3 aria-hidden="true" />
          {buildingFloorLabel(locale, activeLayer)}
        </div>
        <div
          className="logic-cube__surface"
          role={roomPlacement ? 'group' : 'grid'}
          aria-rowcount={roomPlacement ? undefined : BUILDING_ROWS}
          aria-colcount={roomPlacement ? undefined : BUILDING_COLUMNS}
          aria-label={`${boardLabel}: ${buildingFloorLabel(locale, activeLayer)}`}
        >
          {draggedCharacter && !roomPlacement && (
            <div className="game-board__drop-grid" aria-hidden="true" />
          )}
          <div className="logic-cube__walls" aria-hidden="true">
            {floorWalls.map((wall) => (
              <span
                key={`${wall.axis}:${wall.line}:${wall.start}`}
                className={`logic-cube__wall logic-cube__wall--${wall.axis}`}
                data-wall-axis={wall.axis}
                data-wall-line={wall.line}
                data-wall-start={wall.start}
                data-wall-span={wall.span}
                style={
                  wall.axis === 'vertical'
                    ? {
                        left: `${(wall.line / BUILDING_COLUMNS) * 100}%`,
                        top: `${(wall.start / BUILDING_ROWS) * 100}%`,
                        height: `${(wall.span / BUILDING_ROWS) * 100}%`,
                      }
                    : {
                        top: `${(wall.line / BUILDING_ROWS) * 100}%`,
                        left: `${(wall.start / BUILDING_COLUMNS) * 100}%`,
                        width: `${(wall.span / BUILDING_COLUMNS) * 100}%`,
                      }
                }
              />
            ))}
          </div>
          <div className="logic-cube__doors" aria-hidden="true">
            {[...floorDoors.entries()].map(([unitId, door]) => (
              <span
                key={unitId}
                className="logic-cube__door"
                style={{ left: `${door.x * 100}%`, top: `${door.y * 100}%` }}
              >
                <DoorOpen />
              </span>
            ))}
          </div>
          <div className="game-board__cells">
            {Array.from({ length: BUILDING_ROWS }, (_, row) => (
              <div
                key={row}
                className="game-board__row"
                role={roomPlacement ? 'presentation' : 'row'}
              >
                {visiblePositions
                  .filter((position) => position.row === row)
                  .map((position) => {
                    const character = roomPlacement
                      ? undefined
                      : characters.find(
                          (candidate) => assignments[candidate.id] === position.id,
                        )
                    const unitPositions = visiblePositions.filter(
                      (candidate) => candidate.placeId === position.placeId,
                    )
                    const zoneAnchor =
                      labelAnchorForUnit(unitPositions, visiblePositions)?.id === position.id
                    return (
                      <CubeCell
                        key={position.id}
                        position={position}
                        character={character}
                        selectedCharacterId={selectedCharacterId}
                        draggedCharacter={draggedCharacter}
                        decorativeEmoji={zoneAnchor ? undefined : decorativeFurniture(position)}
                        crossed={
                          !roomPlacement &&
                          !character &&
                          isCrossedByCubeAxes(position, occupiedByOthers)
                        }
                        disabled={positionIsUnavailable(position)}
                        zoneAnchor={zoneAnchor}
                        decorativeOnly={roomPlacement}
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
          {roomPlacement && (
            <div className="logic-cube__room-targets">
              {visibleRoomDestinations.map((position) => {
                const roomPositions = visiblePositions.filter(
                  (candidate) => candidate.placeId === position.placeId,
                )
                const character = characters.find(
                  (candidate) => assignments[candidate.id] === position.id,
                )
                return (
                  <RoomTarget
                    key={position.id}
                    position={position}
                    roomPositions={roomPositions}
                    character={character}
                    selectedCharacterId={selectedCharacterId}
                    draggedCharacter={draggedCharacter}
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
          )}
        </div>
      </div>
    </section>
  )
}
