import type { PlanPoint, SpatialPlan } from '../domain/spatialPlan'
import type { Position } from '../domain/types'

interface ZoneObjectLayout {
  readonly object: PlanPoint
  readonly label: PlanPoint
  readonly labelBox: LayoutBox
  readonly labelTransform: string
}

interface LabelPlacement {
  readonly box: LayoutBox
  readonly transform: string
}

interface LabelCandidate {
  readonly point: PlanPoint
  readonly placement: LabelPlacement
  readonly score: number
}

export interface LayoutBox {
  readonly left: number
  readonly right: number
  readonly top: number
  readonly bottom: number
}

const distanceSquared = (first: PlanPoint, second: PlanPoint) =>
  (first.x - second.x) ** 2 + (first.y - second.y) ** 2

export const layoutBoxesOverlap = (first: LayoutBox, second: LayoutBox) =>
  first.left < second.right &&
  first.right > second.left &&
  first.top < second.bottom &&
  first.bottom > second.top

const labelPlacement = (
  point: PlanPoint,
  label: string,
  columns: number,
  labelSafeInset: number,
): LabelPlacement => {
  const boardWidth = columns >= 16 ? 720 : columns >= 9 ? 486 : 390
  const fontSize = Math.min(11.52, Math.max(9.6, boardWidth * 0.017))
  const horizontalPadding = Math.min(6, Math.max(3, boardWidth * 0.009))
  const verticalPadding = Math.min(4, Math.max(2, boardWidth * 0.0065))
  const maxWidth = Math.min(108, Math.max(58, (boardWidth * 1.6) / columns))
  const textWidth = label.length * fontSize * 0.56
  const contentWidth = maxWidth - horizontalPadding * 2 - 2
  const width = Math.min(maxWidth, textWidth + horizontalPadding * 2 + 2) / boardWidth
  const lines = Math.max(1, Math.ceil(textWidth / contentWidth))
  const height = (lines * fontSize * 1.05 + verticalPadding * 2 + 2) / boardWidth
  const horizontalTransform =
    point.x < labelSafeInset ? '0%' : point.x > 1 - labelSafeInset ? '-100%' : '-50%'
  const verticalTransform =
    point.y < labelSafeInset ? '0%' : point.y > 1 - labelSafeInset ? '-100%' : '-50%'
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
  const obstacleCenters = positions.filter((position) => position.blocked).map(centerOf)
  const cellOffsets = [
    -0.45, -0.4, -0.3, -0.2, -0.1, -0.075, 0, 0.075, 0.1, 0.2, 0.3, 0.4, 0.45,
  ] as const
  const objects = plan.zones.map((zone, index) => {
    const zoneObstacle = positions.find(
      (position) => position.placeId === `place-${index}` && position.blocked,
    )
    return zoneObstacle ? centerOf(zoneObstacle) : zone.object
  })
  const candidatesByZone = plan.zones.map((zone, index) => {
    const place = `place-${index}`
    const labelText = labels[index] ?? ''
    return positions
      .filter((position) => position.placeId === place && !position.blocked)
      .flatMap((position) =>
        cellOffsets.flatMap((verticalOffset) =>
          cellOffsets.map((horizontalOffset): PlanPoint => ({
            x: (position.column + 0.5 + horizontalOffset) / columns,
            y: (position.row + 0.5 + verticalOffset) / rows,
          })),
        ),
      )
      .map((point): LabelCandidate => {
        const placement = labelPlacement(point, labelText, columns, labelSafeInset)
        const obstacleClearance = Math.min(
          1,
          ...obstacleCenters.map((anchor) => distanceSquared(point, anchor)),
        )
        const edgeClearance = Math.min(point.x, 1 - point.x, point.y, 1 - point.y)
        return {
          point,
          placement,
          score:
            obstacleClearance * 0.1 + edgeClearance * 0.02 - distanceSquared(point, zone.label),
        }
      })
      .filter((candidate) =>
        obstacleBoxes.every(
          (obstacleBox) => !layoutBoxesOverlap(candidate.placement.box, obstacleBox),
        ),
      )
      .sort((first, second) => second.score - first.score)
  })
  const selected = findNonOverlappingCandidates(candidatesByZone)

  return plan.zones.map((zone, index) => {
    const fallbackPoint = candidatesByZone[index]?.[0]?.point ?? zone.label
    const fallbackPlacement = labelPlacement(
      fallbackPoint,
      labels[index] ?? '',
      columns,
      labelSafeInset,
    )
    const candidate = selected?.[index]
    return {
      object: objects[index] ?? zone.object,
      label: candidate?.point ?? fallbackPoint,
      labelBox: candidate?.placement.box ?? fallbackPlacement.box,
      labelTransform: candidate?.placement.transform ?? fallbackPlacement.transform,
    }
  })
}
