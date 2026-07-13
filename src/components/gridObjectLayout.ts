import type { PlanPoint, SpatialPlan } from '../domain/spatialPlan'
import type { Position } from '../domain/types'

interface ZoneObjectLayout {
  readonly object: PlanPoint
  readonly label: PlanPoint
  readonly labelBox: LayoutBox
  readonly labelTransform: string
  readonly labelWall: HorizontalWall
}

interface LabelPlacement {
  readonly box: LayoutBox
  readonly transform: string
}

type WallSide = 'above' | 'below'

interface LabelCandidate {
  readonly point: PlanPoint
  readonly placement: LabelPlacement
  readonly score: number
  readonly wall: HorizontalWall
}

export interface HorizontalWall {
  readonly left: number
  readonly right: number
  readonly y: number
}

export interface LayoutBox {
  readonly left: number
  readonly right: number
  readonly top: number
  readonly bottom: number
}

export interface DoorLayout {
  readonly key: string
  readonly x: number
  readonly y: number
  readonly box: LayoutBox
}

const distanceSquared = (first: PlanPoint, second: PlanPoint) =>
  (first.x - second.x) ** 2 + (first.y - second.y) ** 2

export const layoutBoxesOverlap = (first: LayoutBox, second: LayoutBox) =>
  first.left < second.right &&
  first.right > second.left &&
  first.top < second.bottom &&
  first.bottom > second.top

const doorBox = (x: number, y: number, columns: number): LayoutBox => {
  const mobileBoardWidth = 333
  const renderedSize = Math.min(28, Math.max(16, (mobileBoardWidth * 0.58) / columns))
  const halfSize = (renderedSize + 4) / mobileBoardWidth / 2
  return {
    left: x - halfSize,
    right: x + halfSize,
    top: y - halfSize,
    bottom: y + halfSize,
  }
}

export const gridDoorLayout = (
  positions: readonly Position[],
  occupiedPositionIds: readonly (Position['id'] | undefined)[] = [],
  labelBoxes: readonly LayoutBox[] = [],
): readonly DoorLayout[] => {
  const columns = Math.max(...positions.map((position) => position.column)) + 1
  const rows = Math.max(...positions.map((position) => position.row)) + 1
  const occupied = new Set(occupiedPositionIds.filter((id) => id !== undefined))
  const candidates = new Map<string, DoorLayout & { readonly score: number }>()

  for (const position of positions) {
    for (const [rowStep, columnStep] of [
      [0, 1],
      [1, 0],
    ] as const) {
      const neighbor = positions.find(
        (candidate) =>
          candidate.row === position.row + rowStep &&
          candidate.column === position.column + columnStep,
      )
      if (!neighbor || neighbor.placeId === position.placeId) continue

      const key = [position.placeId, neighbor.placeId].sort().join(':')
      const x =
        columnStep === 1 ? (position.column + 1) / columns : (position.column + 0.5) / columns
      const y = rowStep === 1 ? (position.row + 1) / rows : (position.row + 0.5) / rows
      const box = doorBox(x, y, columns)
      const clearOfLabels = labelBoxes.every((labelBox) => !layoutBoxesOverlap(box, labelBox))
      const clearOfGameplay =
        !position.blocked &&
        !neighbor.blocked &&
        !occupied.has(position.id) &&
        !occupied.has(neighbor.id)
      const candidate = {
        key,
        x,
        y,
        box,
        score: (clearOfLabels ? 2 : 0) + (clearOfGameplay ? 1 : 0),
      }
      const current = candidates.get(key)
      if (!current || candidate.score > current.score) candidates.set(key, candidate)
    }
  }

  return [...candidates.values()].map(({ key, x, y, box }) => ({ key, x, y, box }))
}

const nearlyEqual = (first: number, second: number) => Math.abs(first - second) < 0.000_001

const containsPoint = (path: readonly PlanPoint[], point: PlanPoint) => {
  let inside = false
  for (let index = 0, previous = path.length - 1; index < path.length; previous = index++) {
    const first = path[index]!
    const second = path[previous]!
    const crosses =
      first.y > point.y !== second.y > point.y &&
      point.x < ((second.x - first.x) * (point.y - first.y)) / (second.y - first.y) + first.x
    if (crosses) inside = !inside
  }
  return inside
}

const roomSideOfWall = (
  path: readonly PlanPoint[],
  point: PlanPoint,
  rows: number,
): WallSide => {
  if (point.y <= 0.000_001) return 'below'
  if (point.y >= 0.999_999) return 'above'
  const offset = 0.2 / rows
  return containsPoint(path, { x: point.x, y: Math.max(0, point.y - offset) })
    ? 'above'
    : 'below'
}

export const horizontalWalls = (path: readonly PlanPoint[]): readonly HorizontalWall[] => {
  const walls = path.flatMap((point, index): readonly HorizontalWall[] => {
    const next = path[(index + 1) % path.length]
    if (!next || !nearlyEqual(point.y, next.y) || nearlyEqual(point.x, next.x)) return []
    return [{ left: Math.min(point.x, next.x), right: Math.max(point.x, next.x), y: point.y }]
  })
  const merged: HorizontalWall[] = []
  for (const wall of [...walls].sort(
    (first, second) => first.y - second.y || first.left - second.left,
  )) {
    const previous = merged.at(-1)
    if (
      previous &&
      nearlyEqual(previous.y, wall.y) &&
      wall.left <= previous.right + 0.000_001
    ) {
      merged[merged.length - 1] = {
        left: previous.left,
        right: Math.max(previous.right, wall.right),
        y: previous.y,
      }
    } else {
      merged.push(wall)
    }
  }
  return merged
}

const labelPlacement = (
  point: PlanPoint,
  label: string,
  columns: number,
  labelSafeInset: number,
  availableWidth = 1,
  wallSide?: WallSide,
): LabelPlacement => {
  // The narrow fitted mobile board is the worst case for wrapped labels because
  // the CSS font reaches its minimum before the percentage width stops shrinking.
  const boardWidth = 333
  const fontSize = Math.min(11.52, Math.max(9.6, boardWidth * 0.017))
  const horizontalPadding = Math.min(6, Math.max(3, boardWidth * 0.009))
  const verticalPadding = Math.min(4, Math.max(2, boardWidth * 0.0065))
  const preferredWidth = Math.min(108, Math.max(48, (boardWidth * 1.9) / columns))
  const maxWidth = Math.min(preferredWidth, Math.max(40, availableWidth * boardWidth - 3))
  const textWidth = label.length * fontSize * 0.56
  const contentWidth = maxWidth - horizontalPadding * 2 - 2
  const width = Math.min(maxWidth, textWidth + horizontalPadding * 2 + 2) / boardWidth
  const lines = Math.max(1, Math.ceil(textWidth / contentWidth))
  const height = (lines * fontSize * 1.05 + verticalPadding * 2 + 2) / boardWidth
  const horizontalTransform =
    point.x < labelSafeInset ? '0%' : point.x > 1 - labelSafeInset ? '-100%' : '-50%'
  const verticalTransform =
    wallSide === 'above'
      ? '-100%'
      : wallSide === 'below'
        ? '0%'
        : point.y < labelSafeInset
          ? '0%'
          : point.y > 1 - labelSafeInset
            ? '-100%'
            : '-50%'
  const left =
    horizontalTransform === '0%'
      ? point.x
      : point.x - width * (horizontalTransform === '-100%' ? 1 : 0.5)
  const top =
    verticalTransform === '0%'
      ? point.y
      : point.y - height * (verticalTransform === '-100%' ? 1 : 0.5)
  return {
    box: { left, right: left + width, top, bottom: top + height },
    transform: `translate(${horizontalTransform}, ${verticalTransform})`,
  }
}

const findNonOverlappingCandidates = (
  candidatesByZone: readonly (readonly LabelCandidate[])[],
): readonly LabelCandidate[] | undefined => {
  const zoneOrder = candidatesByZone
    .map((candidates, zone) => ({ zone, candidateCount: candidates.length }))
    .sort((first, second) => first.candidateCount - second.candidateCount)
    .map(({ zone }) => zone)
  const selected: Array<LabelCandidate | undefined> = Array.from({
    length: candidatesByZone.length,
  })

  const selectZone = (depth: number): boolean => {
    if (depth === zoneOrder.length) return true
    const zone = zoneOrder[depth]
    if (zone === undefined) return false

    for (const candidate of candidatesByZone[zone] ?? []) {
      const overlapsSelected = selected.some(
        (other) => other && layoutBoxesOverlap(candidate.placement.box, other.placement.box),
      )
      if (overlapsSelected) continue
      selected[zone] = candidate
      if (selectZone(depth + 1)) return true
      selected[zone] = undefined
    }
    return false
  }

  return selectZone(0) ? (selected as readonly LabelCandidate[]) : undefined
}

export const gridObjectLayout = (
  plan: SpatialPlan,
  positions: readonly Position[],
  labels: readonly string[] = [],
  occupiedPositionIds: readonly (Position['id'] | undefined)[] = [],
): readonly ZoneObjectLayout[] => {
  const columns = Math.max(...positions.map((position) => position.column)) + 1
  const rows = Math.max(...positions.map((position) => position.row)) + 1
  const labelSafeInset = columns <= 6 ? 0.15 : columns <= 9 ? 0.11 : 0.085
  const centerOf = (position: Position): PlanPoint => ({
    x: (position.column + 0.5) / columns,
    y: (position.row + 0.5) / rows,
  })
  const obstacleHalfWidth = 0.35 / columns
  const obstacleHalfHeight = 0.35 / rows
  const obstacleBoxes = positions
    .filter((position) => position.blocked)
    .map((position) => {
      const center = centerOf(position)
      return {
        left: center.x - obstacleHalfWidth,
        right: center.x + obstacleHalfWidth,
        top: center.y - obstacleHalfHeight,
        bottom: center.y + obstacleHalfHeight,
      }
    })
  const occupiedIds = new Set(occupiedPositionIds.filter((id) => id !== undefined))
  const occupiedHalfWidth = 0.44 / columns
  const occupiedHalfHeight = 0.44 / rows
  const occupiedBoxes = positions
    .filter((position) => occupiedIds.has(position.id))
    .map((position) => {
      const center = centerOf(position)
      return {
        left: center.x - occupiedHalfWidth,
        right: center.x + occupiedHalfWidth,
        top: center.y - occupiedHalfHeight,
        bottom: center.y + occupiedHalfHeight,
      }
    })
  const reservedBoxes = [...obstacleBoxes, ...occupiedBoxes]
  const obstacleCenters = positions.filter((position) => position.blocked).map(centerOf)
  const wallOffsets = Array.from({ length: 19 }, (_, index) => (index + 1) / 20)
  const objects = plan.zones.map((zone, index) => {
    const zoneObstacle = positions.find(
      (position) => position.placeId === `place-${index}` && position.blocked,
    )
    return zoneObstacle ? centerOf(zoneObstacle) : zone.object
  })
  const candidatesByZone = plan.zones.map((zone, index) => {
    const labelText = labels[index] ?? ''
    return horizontalWalls(zone.path)
      .flatMap((wall) =>
        wallOffsets.flatMap((offset) => {
          const point = { x: wall.left + (wall.right - wall.left) * offset, y: wall.y }
          const preferredSide = roomSideOfWall(zone.path, point, rows)
          const alternateSide = preferredSide === 'above' ? 'below' : 'above'
          return [
            { wall, point, wallSide: preferredSide, preferred: true },
            { wall, point, wallSide: alternateSide, preferred: false },
          ] as const
        }),
      )
      .map(({ point, wall, wallSide, preferred }): LabelCandidate => {
        const placement = labelPlacement(
          point,
          labelText,
          columns,
          labelSafeInset,
          wall.right - wall.left,
          wallSide,
        )
        const obstacleClearance = Math.min(
          1,
          ...obstacleCenters.map((anchor) => distanceSquared(point, anchor)),
        )
        const internalWall = wall.y > 0.001 && wall.y < 0.999
        const wallLength = wall.right - wall.left
        return {
          point,
          placement,
          wall,
          score:
            (internalWall ? 2 : 0) +
            (preferred ? 0.45 : 0) +
            wallLength +
            obstacleClearance * 0.1 -
            distanceSquared(point, zone.label),
        }
      })
      .filter(
        (candidate) =>
          candidate.placement.box.left >= candidate.wall.left - 0.000_001 &&
          candidate.placement.box.right <= candidate.wall.right + 0.000_001 &&
          candidate.placement.box.top >= -0.000_001 &&
          candidate.placement.box.bottom <= 1.000_001 &&
          reservedBoxes.every(
            (reservedBox) => !layoutBoxesOverlap(candidate.placement.box, reservedBox),
          ),
      )
      .sort((first, second) => second.score - first.score)
  })
  const selected = findNonOverlappingCandidates(candidatesByZone)

  return plan.zones.map((zone, index) => {
    const fallbackCandidate = candidatesByZone[index]?.[0]
    const fallbackWall = fallbackCandidate?.wall ??
      [...horizontalWalls(zone.path)].sort(
        (first, second) => second.right - second.left - (first.right - first.left),
      )[0] ?? { left: 0, right: 1, y: 0 }
    const fallbackPoint = fallbackCandidate?.point ?? {
      x: (fallbackWall.left + fallbackWall.right) / 2,
      y: fallbackWall.y,
    }
    const fallbackPlacement = labelPlacement(
      fallbackPoint,
      labels[index] ?? '',
      columns,
      labelSafeInset,
      fallbackWall.right - fallbackWall.left,
      roomSideOfWall(zone.path, fallbackPoint, rows),
    )
    const candidate = selected?.[index]
    return {
      object: objects[index] ?? zone.object,
      label: candidate?.point ?? fallbackPoint,
      labelBox: candidate?.placement.box ?? fallbackPlacement.box,
      labelTransform: candidate?.placement.transform ?? fallbackPlacement.transform,
      labelWall: candidate?.wall ?? fallbackWall,
    }
  })
}
