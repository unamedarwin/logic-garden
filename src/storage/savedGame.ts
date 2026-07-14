import { del, get, set } from 'idb-keyval'
import { isChallengeMetadata, type ChallengeMetadata } from '../domain/types'
import {
  BUILDING_CHARACTER_COUNT,
  buildingPlayableCount,
  buildingDepthForPositions,
  hasCanonicalBuildingGeometry,
} from '../domain/buildingPlan'
import type { GameState } from '../game/gameReducer'
import { GENERATOR_VERSION } from '../generator/version'
import { analyzeSolutions } from '../solver/solver'
import { isAssignmentGeometryValid } from '../solver/constraintEvaluator'

const key = 'logic-garden:saved-game:v1'

interface SavedGame {
  readonly schemaVersion: 4
  readonly generatorVersion: number
  readonly state: GameState
  readonly challenge?: ChallengeMetadata
}

export interface SavedGameSession {
  readonly state: GameState
  readonly challenge?: ChallengeMetadata
}

const isCompatibleState = (value: unknown): value is GameState => {
  if (!value || typeof value !== 'object') return false
  const state = value as GameState
  const puzzle = state.puzzle
  if (
    !puzzle ||
    puzzle.metadata?.generatorVersion !== GENERATOR_VERSION ||
    !Array.isArray(puzzle.characters) ||
    !Array.isArray(puzzle.positions) ||
    !Array.isArray(puzzle.clues) ||
    !state.assignments ||
    typeof state.assignments !== 'object'
  )
    return false
  if (puzzle.boardMode === 'logic-cube') {
    if (!hasCanonicalBuildingGeometry(puzzle.positions)) return false
    const depth = buildingDepthForPositions(puzzle.positions)
    if (
      puzzle.characters.length !== BUILDING_CHARACTER_COUNT ||
      puzzle.positions.filter((position) => !position.blocked).length !==
        buildingPlayableCount(depth)
    )
      return false
  }
  // Wrong deductions are valid player state. Persistence checks only physical
  // board rules; clue truth is evaluated when the player checks the solution.
  if (!isAssignmentGeometryValid(puzzle, state.assignments)) return false
  const validation = analyzeSolutions(puzzle, { limit: 2 })
  return validation.count === 1 && !validation.reachedNodeLimit
}

const isCompatibleSavedGame = (value: unknown): value is SavedGame => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  const state = candidate.state as GameState
  const challenge = candidate.challenge as ChallengeMetadata | undefined
  const boardSize = Math.sqrt(state.puzzle.positions.length)
  const challengeSizeMatches =
    challenge === undefined ||
    (state.puzzle.boardMode === 'logic-cube'
      ? challenge.buildingDepth === undefined ||
        challenge.buildingDepth === buildingDepthForPositions(state.puzzle.positions)
      : state.puzzle.boardMode === 'map'
        ? challenge.childMapSize === undefined ||
          challenge.childMapSize === state.puzzle.characters.length
        : challenge.gridSize === undefined || challenge.gridSize === boardSize)
  return (
    candidate.schemaVersion === 4 &&
    candidate.generatorVersion === GENERATOR_VERSION &&
    isCompatibleState(candidate.state) &&
    (candidate.challenge === undefined ||
      (isChallengeMetadata(candidate.challenge) &&
        candidate.challenge.generatorVersion === GENERATOR_VERSION &&
        candidate.challenge.seed === state.puzzle.seed &&
        candidate.challenge.difficulty === state.puzzle.difficulty &&
        (candidate.challenge.variant === 'cube') ===
          (state.puzzle.boardMode === 'logic-cube') &&
        challengeSizeMatches))
  )
}

export const loadSavedGame = async (): Promise<SavedGameSession | null> => {
  try {
    const saved = await get<unknown>(key)
    return isCompatibleSavedGame(saved)
      ? { state: saved.state, ...(saved.challenge ? { challenge: saved.challenge } : {}) }
      : null
  } catch {
    return null
  }
}

export const saveGame = async (state: GameState, challenge?: ChallengeMetadata) => {
  try {
    await set(key, {
      schemaVersion: 4,
      generatorVersion: GENERATOR_VERSION,
      state,
      ...(challenge ? { challenge } : {}),
    } satisfies SavedGame)
  } catch {
    // A storage error must not interrupt play.
  }
}

export const clearSavedGame = async () => {
  try {
    await del(key)
  } catch {
    // Nothing needs to happen when local storage is unavailable.
  }
}
