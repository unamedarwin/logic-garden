import { themesForAudience, type Theme, type ThemeItem } from '../domain/themes'
import {
  BUILDING_CHARACTER_COUNT,
  BUILDING_COLUMNS,
  BUILDING_ROWS,
  buildingCellAt,
  buildingDepthForPositions,
  buildingPlaceIndex,
  buildingPlayableCount,
  buildingUnitsAreNeighbors,
  isBuildingAbove,
  type BuildingDepth,
} from '../domain/buildingPlan'
import { shareCubeAxisLine } from '../domain/constraints'
import {
  type Audience,
  characterId,
  itemId,
  placeId,
  positionId,
  type Assignment,
  type Character,
  type Difficulty,
  type Item,
  type Position,
} from '../domain/types'
import {
  planObstacles,
  clusteredObstacleRoomIndex,
  spatialPlanForId,
  spatialPlanIdsForAudience,
  spatialPlanZoneAt,
  type PlanObstacle,
  type SpatialPlan,
  type SpatialPlanId,
} from '../domain/spatialPlan'
import { difficultyConfigs, logicGridCharacterCounts, logicGridDimensions } from './difficulty'
import { landmarkDomainDistance } from './landmarkDomains'
import { SeededRandom } from './seededRandom'

export interface GeneratedWorld {
  readonly theme: Theme
  readonly boardMode: 'map' | 'logic-grid' | 'logic-cube'
  readonly spatialPlanId?: SpatialPlanId
  readonly characters: readonly Character[]
  readonly items: readonly Item[]
  readonly positions: readonly Position[]
  readonly solution: Assignment
}

export interface SpatialWorldStructure {
  readonly boardMode?: 'logic-grid'
  readonly gridSize: 6 | 9 | 16
  readonly characterCount: number
  readonly spatialPlanId: SpatialPlanId
}

export interface CubeWorldStructure {
  readonly boardMode: 'logic-cube'
  readonly gridSize: 5
  readonly depth: BuildingDepth
  readonly characterCount: 8
}

export interface MapWorldStructure {
  readonly boardMode: 'map'
  readonly characterCount: 4 | 6 | 8
}

export type AdvancedWorldStructure =
  SpatialWorldStructure | CubeWorldStructure | MapWorldStructure

const selectNonConflictingPositions = (
  candidates: readonly Position[],
  count: number,
): readonly Position[] => {
  const candidatesByRow = new Map<number, Position[]>()
  for (const candidate of candidates) {
    const rowCandidates = candidatesByRow.get(candidate.row) ?? []
    rowCandidates.push(candidate)
    candidatesByRow.set(candidate.row, rowCandidates)
  }
  const matchedByColumn = new Map<number, Position>()

  const assignRow = (row: number, visitedRows: Set<number>, visitedColumns: Set<number>) => {
    if (visitedRows.has(row)) return false
    visitedRows.add(row)
    for (const candidate of candidatesByRow.get(row) ?? []) {
      if (visitedColumns.has(candidate.column)) continue
      visitedColumns.add(candidate.column)
      const previous = matchedByColumn.get(candidate.column)
      if (!previous || assignRow(previous.row, new Set(visitedRows), visitedColumns)) {
        matchedByColumn.set(candidate.column, candidate)
        return true
      }
    }
    return false
  }

  for (const row of candidatesByRow.keys()) {
    assignRow(row, new Set(), new Set())
    if (matchedByColumn.size >= count) return [...matchedByColumn.values()].slice(0, count)
  }
  return []
}

const selectBuildingPositions = (
  positions: readonly Position[],
  random: SeededRandom,
): readonly Position[] => {
  const hasVisibleLandmark = (position: Position) =>
    positions.some(
      (candidate) =>
        candidate.blocked &&
        candidate.obstacleEmoji !== undefined &&
        candidate.obstacleLabel !== undefined &&
        candidate.placeId === position.placeId &&
        Math.abs(candidate.row - position.row) +
          Math.abs(candidate.column - position.column) ===
          1,
    )
  const shops = positions.filter(
    (position) =>
      !position.blocked && position.buildingKind === 'shop' && hasVisibleLandmark(position),
  )
  const homes = positions.filter(
    (position) => !position.blocked && position.buildingKind === 'home',
  )
  const shopUnitIds = [
    ...new Set(
      shops
        .map((position) => position.buildingUnitId)
        .filter((unitId): unitId is string => unitId !== undefined),
    ),
  ]
  if (shopUnitIds.length !== 2) throw new Error('No s’han pogut preparar les dues botigues.')

  const firstShop = shops.filter((position) => position.buildingUnitId === shopUnitIds[0])
  const secondShop = shops.filter((position) => position.buildingUnitId === shopUnitIds[1])
  const shopPairs = firstShop.flatMap((first) =>
    secondShop
      .filter((second) => !shareCubeAxisLine(first, second))
      .map((second) => [first, second] as const),
  )
  if (shopPairs.length === 0)
    throw new Error('Les dues botigues no tenen accessos compatibles.')
  const depth = buildingDepthForPositions(positions)
  const residentialFloors = Array.from({ length: depth - 1 }, (_, index) => index + 1)
  // Six residents need not occupy six different floors. Using at most five
  // residential floors leaves room for same-floor neighbor clues at every height.
  const residentFloorCount = Math.min(BUILDING_CHARACTER_COUNT - 3, residentialFloors.length)

  // A bounded constructive search scales with the enlarged set of genuinely free
  // cells without enumerating every six-position combination.
  for (let attempt = 0; attempt < 2_000; attempt += 1) {
    const selected: Position[] = [...random.pick(shopPairs)]
    const adjacentFloor = random.integer(1, depth - 2)
    const selectedFloors = new Set([adjacentFloor, adjacentFloor + 1])
    for (const layer of random.shuffle(residentialFloors)) {
      if (selectedFloors.size >= residentFloorCount) break
      selectedFloors.add(layer)
    }
    let failed = false
    for (const layer of random.shuffle([...selectedFloors])) {
      const candidate = random
        .shuffle(homes.filter((position) => position.layer === layer))
        .find((position) => !selected.some((occupied) => shareCubeAxisLine(occupied, position)))
      if (!candidate) {
        failed = true
        break
      }
      selected.push(candidate)
    }
    if (failed) continue

    for (const candidate of random.shuffle(homes)) {
      if (selected.length >= BUILDING_CHARACTER_COUNT) break
      if (selected.some((position) => position.id === candidate.id)) continue
      if (selected.some((position) => shareCubeAxisLine(position, candidate))) continue
      selected.push(candidate)
    }
    if (selected.length !== BUILDING_CHARACTER_COUNT) continue

    const hasVerticalRelation = selected.some((first, index) =>
      selected
        .slice(index + 1)
        .some((second) => isBuildingAbove(first, second) || isBuildingAbove(second, first)),
    )
    const hasNeighborRelation = selected.some((first, index) =>
      selected.slice(index + 1).some((second) => buildingUnitsAreNeighbors(first, second)),
    )
    if (hasVerticalRelation && hasNeighborRelation) return random.shuffle(selected)
  }

  throw new Error('No s’ha pogut construir una comunitat de veïns coherent.')
}

const waterObstacleCount = (size: number) => {
  if (size <= 6) return 1
  if (size <= 9) return 2
  return 4
}

const contiguousRoomCells = (
  plan: SpatialPlan,
  roomIndex: number,
  columns: number,
  rows: number,
  count: number,
): readonly PlanObstacle[] => {
  const anchor = plan.zones[roomIndex]?.object
  if (!anchor) return []
  const queue: PlanObstacle[] = [
    {
      column: Math.min(columns - 1, Math.floor(anchor.x * columns)),
      row: Math.min(rows - 1, Math.floor(anchor.y * rows)),
    },
  ]
  const visited = new Set<string>()
  const found: PlanObstacle[] = []

  while (queue.length > 0 && found.length < count) {
    const cell = queue.shift()
    if (!cell) break
    const key = `${cell.row}:${cell.column}`
    if (visited.has(key)) continue
    visited.add(key)
    if (cell.column < 0 || cell.column >= columns || cell.row < 0 || cell.row >= rows) continue
    if (spatialPlanZoneAt(plan, cell.column, cell.row, columns, rows) !== roomIndex) continue

    found.push(cell)
    queue.push(
      { column: cell.column + 1, row: cell.row },
      { column: cell.column, row: cell.row + 1 },
      { column: cell.column - 1, row: cell.row },
      { column: cell.column, row: cell.row - 1 },
    )
  }

  return found
}

export const planObstaclesForPlan = (
  plan: SpatialPlan,
  columns: number,
  rows: number,
): readonly PlanObstacle[] => {
  const planned = planObstacles(plan.id, columns, rows)
  const pond = contiguousRoomCells(
    plan,
    clusteredObstacleRoomIndex,
    columns,
    rows,
    waterObstacleCount(Math.max(columns, rows)),
  )
  const dryObstacleCount = Math.max(0, planned.length - pond.length)
  const dry = planned
    .filter(
      (obstacle) =>
        spatialPlanZoneAt(plan, obstacle.column, obstacle.row, columns, rows) !==
        clusteredObstacleRoomIndex,
    )
    .slice(0, dryObstacleCount)

  return [...dry, ...pond]
}

interface ObstacleSlot {
  readonly candidates: readonly ThemeItem[]
  readonly column: number
  readonly row: number
  readonly zone: number
}

const assignUniqueObstacleObjects = (
  slots: readonly ObstacleSlot[],
): readonly ThemeItem[] | undefined => {
  const slotByEmoji = new Map<string, number>()
  const objectBySlot = new Map<number, ThemeItem>()

  const assign = (slotIndex: number, visitedEmojis: Set<string>): boolean => {
    const slot = slots[slotIndex]
    if (!slot) return false
    for (const candidate of slot.candidates) {
      if (visitedEmojis.has(candidate.emoji)) continue
      visitedEmojis.add(candidate.emoji)
      const previousSlot = slotByEmoji.get(candidate.emoji)
      if (previousSlot === undefined || assign(previousSlot, visitedEmojis)) {
        slotByEmoji.set(candidate.emoji, slotIndex)
        objectBySlot.set(slotIndex, candidate)
        return true
      }
    }
    return false
  }

  for (let slotIndex = 0; slotIndex < slots.length; slotIndex += 1) {
    if (!assign(slotIndex, new Set())) return undefined
  }
  return slots.map((_, slotIndex) => objectBySlot.get(slotIndex)!)
}

export const generateWorld = (
  difficulty: Difficulty,
  random: SeededRandom,
  audience: Audience,
  structure?: AdvancedWorldStructure,
): GeneratedWorld => {
  const config = difficultyConfigs[difficulty]
  const boardMode =
    audience === 'children'
      ? 'map'
      : structure?.boardMode === 'logic-cube'
        ? 'logic-cube'
        : 'logic-grid'
  const spatialAudience = audience === 'children' ? 'teens' : audience
  const buildingDepth = structure?.boardMode === 'logic-cube' ? structure.depth : undefined
  const mapCharacterCount =
    structure?.boardMode === 'map' ? structure.characterCount : undefined
  const characterCount =
    boardMode === 'map'
      ? (mapCharacterCount ?? config.characterCount)
      : (structure?.characterCount ?? logicGridCharacterCounts[difficulty])
  const mapRows = 2
  const mapBaseColumns = characterCount / mapRows
  const invertedMap = boardMode === 'map' && mapRows !== mapBaseColumns && random.next() < 0.5
  const mapColumns = invertedMap ? mapRows : mapBaseColumns
  const theme = random.pick(themesForAudience(audience))
  const spatialPlanId =
    boardMode === 'logic-grid'
      ? 'spatialPlanId' in (structure ?? {})
        ? (structure as SpatialWorldStructure).spatialPlanId
        : random.pick(spatialPlanIdsForAudience(spatialAudience))
      : undefined
  const items = random
    .shuffle(theme.items)
    .slice(0, characterCount)
    .map((item, index) => ({
      id: itemId(`item-${index}`),
      label: item.label,
      emoji: item.emoji,
    }))
  const characters = random
    .shuffle(theme.characters)
    .slice(0, characterCount)
    .map((character, index) => ({
      id: characterId(`character-${index}`),
      name: character.name,
      emoji: character.emoji,
      description: character.description,
      itemId: items[index]!.id,
    }))
  const carriedItemEmojis = new Set(items.map((item) => item.emoji))
  const buildingRoomObjects =
    boardMode === 'logic-cube'
      ? random.shuffle(
          (theme.roomObjects ?? theme.items).filter(
            (object) => !carriedItemEmojis.has(object.emoji),
          ),
        )
      : []
  if (boardMode === 'logic-cube' && buildingRoomObjects.length === 0) {
    throw new Error("No s'ha pogut preparar el mobiliari de l'edifici.")
  }
  const positions: readonly Position[] =
    boardMode === 'logic-grid'
      ? (() => {
          const gridSize =
            structure?.boardMode !== 'map' && structure?.boardMode !== 'logic-cube'
              ? (structure?.gridSize ?? logicGridDimensions[difficulty])
              : logicGridDimensions[difficulty]
          const spatialPlan = spatialPlanForId(spatialPlanId)
          if (!spatialPlan) throw new Error('No s’ha pogut carregar la planta espacial.')
          const fallbackObstacleObjects = theme.roomObjects ?? theme.items
          const pondRoomIndex = theme.terrainFeature?.placeIndex
          const pondEmojis = new Set(
            pondRoomIndex !== undefined
              ? (theme.roomObjectsByPlace?.[pondRoomIndex] ?? []).map(({ emoji }) => emoji)
              : [],
          )
          const obstacleObjectsByPlace = spatialPlan.zones.map((_, zone) =>
            (() => {
              const preferred = random.shuffle(
                theme.roomObjectsByPlace?.[zone] ?? fallbackObstacleObjects,
              )
              const preferredEmojis = new Set(preferred.map(({ emoji }) => emoji))
              const fallback =
                pondRoomIndex !== undefined && zone === pondRoomIndex
                  ? []
                  : random.shuffle(
                      fallbackObstacleObjects.filter(
                        ({ emoji }) =>
                          !preferredEmojis.has(emoji) &&
                          !(pondRoomIndex !== undefined && pondEmojis.has(emoji)),
                      ),
                    )
              return [...preferred, ...fallback]
            })(),
          )
          const obstacleSlots = planObstaclesForPlan(spatialPlan, gridSize, gridSize).map(
            ({ row, column }) => {
              const zone = spatialPlanZoneAt(spatialPlan, column, row, gridSize, gridSize)
              return {
                row,
                column,
                zone,
                candidates: obstacleObjectsByPlace[zone] ?? fallbackObstacleObjects,
              }
            },
          )
          const obstacleAssignments = assignUniqueObstacleObjects(obstacleSlots)
          if (!obstacleAssignments || obstacleAssignments.length !== obstacleSlots.length) {
            throw new Error('No s’ha pogut assignar un objecte coherent a cada estança.')
          }
          const blocked = new Map(
            obstacleSlots.map(({ row, column }, index) => {
              const zone = spatialPlanZoneAt(spatialPlan, column, row, gridSize, gridSize)
              const obstacle = obstacleAssignments[index]
              if (!obstacle || obstacleSlots[index]?.zone !== zone) {
                throw new Error('No s’ha pogut conservar l’objecte de l’estança.')
              }
              return [`${row}:${column}`, obstacle] as const
            }),
          )
          return Array.from({ length: gridSize * gridSize }, (_, index) => {
            const row = Math.floor(index / gridSize)
            const column = index % gridSize
            const zone = spatialPlanZoneAt(spatialPlan, column, row, gridSize, gridSize)
            const place = theme.places[zone % theme.places.length]!
            const obstacle = blocked.get(`${row}:${column}`)
            return {
              id: positionId(`position-${row}-${column}`),
              placeId: placeId(`place-${zone}`),
              row,
              column,
              label: `${place} · ${row + 1}.${column + 1}`,
              blocked: obstacle !== undefined,
              obstacleEmoji: obstacle?.emoji,
              obstacleLabel: obstacle?.label,
            }
          })
        })()
      : boardMode === 'logic-cube'
        ? Array.from(
            { length: buildingDepth! * BUILDING_ROWS * BUILDING_COLUMNS },
            (_, index) => {
              const floorSize = BUILDING_ROWS * BUILDING_COLUMNS
              const layer = Math.floor(index / floorSize)
              const row = Math.floor((index % floorSize) / BUILDING_COLUMNS)
              const column = index % BUILDING_COLUMNS
              const cell = buildingCellAt(layer, row, column)
              const roomObject =
                cell.blocked && (cell.kind === 'home' || cell.kind === 'shop')
                  ? buildingRoomObjects[index % buildingRoomObjects.length]
                  : undefined
              return {
                id: positionId(`position-${layer}-${row}-${column}`),
                placeId: placeId(`place-${buildingPlaceIndex(layer, cell.unitId)}`),
                layer,
                row,
                column,
                label: `building:${cell.unitId}:${layer}`,
                buildingUnitId: cell.unitId,
                buildingKind: cell.kind,
                blocked: cell.blocked,
                obstacleEmoji: roomObject?.emoji,
                obstacleLabel: roomObject?.label,
              }
            },
          )
        : theme.places.slice(0, characterCount).map((label, index) => ({
            id: positionId(`position-${index}`),
            placeId: placeId(`place-${index}`),
            row: Math.floor(index / mapColumns),
            column: index % mapColumns,
            label,
          }))
  const solution =
    boardMode === 'logic-grid'
      ? (() => {
          const adjacentToObstacle = positions.filter(
            (position) =>
              !position.blocked &&
              positions.some(
                (candidate) =>
                  candidate.blocked &&
                  candidate.placeId === position.placeId &&
                  Math.abs(candidate.row - position.row) +
                    Math.abs(candidate.column - position.column) ===
                    1,
              ),
          )

          const candidates = random
            .shuffle(adjacentToObstacle)
            .sort(
              (first, second) =>
                landmarkDomainDistance(positions, first, difficulty) -
                landmarkDomainDistance(positions, second, difficulty),
            )
          const selected = selectNonConflictingPositions(candidates, characterCount)
          if (selected.length === characterCount) {
            return Object.fromEntries(
              characters.map((character, index) => [character.id, selected[index]!.id]),
            ) as Assignment
          }

          throw new Error('No s’ha pogut construir una posició de graella.')
        })()
      : boardMode === 'logic-cube'
        ? (() => {
            if (
              buildingDepth === undefined ||
              positions.length !== buildingDepth * BUILDING_ROWS * BUILDING_COLUMNS ||
              characters.length !== BUILDING_CHARACTER_COUNT ||
              positions.filter((position) => !position.blocked).length !==
                buildingPlayableCount(buildingDepth)
            ) {
              throw new Error(`No s’ha pogut construir l’edifici lògic 5×5×${buildingDepth}.`)
            }
            const selected = selectBuildingPositions(positions, random)
            return Object.fromEntries(
              characters.map((character, index) => [character.id, selected[index]!.id]),
            ) as Assignment
          })()
        : (() => {
            const shuffledPositionIds = random.shuffle(positions.map((position) => position.id))
            return Object.fromEntries(
              characters.map((character, index) => [character.id, shuffledPositionIds[index]!]),
            ) as Assignment
          })()

  return {
    theme: theme as Theme,
    boardMode,
    spatialPlanId,
    characters,
    items,
    positions,
    solution,
  }
}
