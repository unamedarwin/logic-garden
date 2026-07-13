import { areAdjacent } from '../domain/constraints'
import type { Difficulty, Position } from '../domain/types'

const targetCandidates: Record<Difficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 4,
}

export const landmarkCandidatePositions = (
  positions: readonly Position[],
  obstacle: Position,
) =>
  positions.filter(
    (position) =>
      !position.blocked &&
      position.placeId === obstacle.placeId &&
      areAdjacent(position, obstacle),
  )

export const landmarkCandidateCount = (positions: readonly Position[], obstacle: Position) =>
  landmarkCandidatePositions(positions, obstacle).length

export const adjacentLandmarks = (positions: readonly Position[], position: Position) =>
  positions.filter(
    (candidate) =>
      candidate.blocked &&
      candidate.placeId === position.placeId &&
      areAdjacent(candidate, position),
  )

export const preferredLandmark = (
  positions: readonly Position[],
  position: Position,
  difficulty: Difficulty,
) =>
  [...adjacentLandmarks(positions, position)].sort(
    (first, second) =>
      Math.abs(landmarkCandidateCount(positions, first) - targetCandidates[difficulty]) -
      Math.abs(landmarkCandidateCount(positions, second) - targetCandidates[difficulty]),
  )[0]

export const landmarkDomainDistance = (
  positions: readonly Position[],
  position: Position,
  difficulty: Difficulty,
) => {
  const landmark = preferredLandmark(positions, position, difficulty)
  return landmark
    ? Math.abs(landmarkCandidateCount(positions, landmark) - targetCandidates[difficulty])
    : Number.POSITIVE_INFINITY
}
