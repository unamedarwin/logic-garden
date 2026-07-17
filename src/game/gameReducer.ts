import type { CharacterId, PartialAssignment, PositionId, Puzzle } from '../domain/types'
import { getSolverHint, validateAssignment } from './validation'
import { solve } from '../solver/solver'
import { placementDestinationFor, placementsConflict } from '../domain/placements'
import type { GameFeedback } from './feedback'

export interface GameSnapshot {
  readonly assignments: PartialAssignment
  readonly moves: number
}

export interface GameState {
  readonly puzzle: Puzzle
  readonly assignments: PartialAssignment
  readonly past: readonly GameSnapshot[]
  readonly future: readonly GameSnapshot[]
  readonly selectedCharacterId?: CharacterId
  readonly moves: number
  readonly hintsUsed: number
  readonly status: 'playing' | 'won'
  readonly finishedAt?: number
  readonly feedback?: GameFeedback
  readonly highlightedClueId?: string
  readonly startedAt: number
}

export type GameAction =
  | { readonly type: 'select-character'; readonly characterId: CharacterId }
  | { readonly type: 'remove-character'; readonly characterId: CharacterId }
  | {
      readonly type: 'move-character'
      readonly characterId: CharacterId
      readonly positionId: PositionId
    }
  | { readonly type: 'undo' }
  | { readonly type: 'redo' }
  | { readonly type: 'reset' }
  | { readonly type: 'check' }
  | { readonly type: 'hint'; readonly characterId?: CharacterId }

const snapshot = (state: GameState): GameSnapshot => ({
  assignments: state.assignments,
  moves: state.moves,
})

const nextUnassignedCharacter = (
  state: GameState,
  assignments: PartialAssignment,
  afterCharacterId: CharacterId,
): CharacterId | undefined => {
  const start = state.puzzle.characters.findIndex(
    (character) => character.id === afterCharacterId,
  )
  for (let offset = 1; offset <= state.puzzle.characters.length; offset += 1) {
    const character = state.puzzle.characters[(start + offset) % state.puzzle.characters.length]
    if (character && assignments[character.id] === undefined) return character.id
  }
  return undefined
}

export const createGameState = (puzzle: Puzzle): GameState => ({
  puzzle,
  assignments: {},
  past: [],
  future: [],
  moves: 0,
  hintsUsed: 0,
  status: 'playing',
  startedAt: Date.now(),
})

const restore = (
  state: GameState,
  next: GameSnapshot,
  remainingPast: readonly GameSnapshot[],
  future: readonly GameSnapshot[],
) => ({
  ...state,
  assignments: next.assignments,
  moves: next.moves,
  past: remainingPast,
  future,
  selectedCharacterId: undefined,
  status: 'playing' as const,
  finishedAt: undefined,
  feedback: undefined,
})

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'select-character':
      return {
        ...state,
        selectedCharacterId:
          state.selectedCharacterId === action.characterId ? undefined : action.characterId,
      }
    case 'remove-character': {
      if (!state.assignments[action.characterId]) return state
      const assignments = { ...state.assignments }
      delete assignments[action.characterId]
      return {
        ...state,
        assignments,
        past: [...state.past, snapshot(state)],
        future: [],
        moves: state.moves + 1,
        selectedCharacterId: undefined,
        status: 'playing',
        finishedAt: undefined,
        feedback: undefined,
        highlightedClueId: undefined,
      }
    }
    case 'move-character': {
      const targetPosition = placementDestinationFor(state.puzzle, action.positionId)
      const character = state.puzzle.characters.find(
        (character) => character.id === action.characterId,
      )
      if (!targetPosition || !character) return state
      if (state.assignments[action.characterId] === targetPosition.id) return state

      const conflictingCharacterIds: CharacterId[] = []
      if (state.puzzle.boardMode === 'logic-grid' || state.puzzle.boardMode === 'logic-cube') {
        for (const candidate of state.puzzle.characters) {
          if (candidate.id === action.characterId) continue
          const assignedPositionId = state.assignments[candidate.id]
          const assignedPosition = state.puzzle.positions.find(
            (position) => position.id === assignedPositionId,
          )
          if (!assignedPosition) continue
          const conflicts = placementsConflict(state.puzzle, assignedPosition, targetPosition)
          if (conflicts) conflictingCharacterIds.push(candidate.id)
        }
      }

      const occupiedBy = state.puzzle.characters.find(
        (character) => state.assignments[character.id] === targetPosition.id,
      )
      const assignments: Partial<Record<CharacterId, PositionId>> = {
        ...state.assignments,
        [action.characterId]: targetPosition.id,
      }
      for (const conflictingCharacterId of conflictingCharacterIds) {
        delete assignments[conflictingCharacterId]
      }
      if (occupiedBy && occupiedBy.id !== action.characterId) delete assignments[occupiedBy.id]

      return {
        ...state,
        assignments,
        past: [...state.past, snapshot(state)],
        future: [],
        moves: state.moves + 1,
        selectedCharacterId: nextUnassignedCharacter(state, assignments, action.characterId),
        status: 'playing',
        feedback:
          conflictingCharacterIds.length > 0
            ? {
                type: 'placement-conflicts-cleared',
                characterName: character.name,
                clearedCount: conflictingCharacterIds.length,
              }
            : undefined,
        highlightedClueId: undefined,
      }
    }
    case 'undo': {
      const previous = state.past[state.past.length - 1]
      return previous
        ? restore(state, previous, state.past.slice(0, -1), [snapshot(state), ...state.future])
        : state
    }
    case 'redo': {
      const next = state.future[0]
      return next
        ? restore(state, next, [...state.past, snapshot(state)], state.future.slice(1))
        : state
    }
    case 'reset':
      return createGameState(state.puzzle)
    case 'check': {
      const result = validateAssignment(state.puzzle, state.assignments)
      return {
        ...state,
        status: result.correct ? 'won' : 'playing',
        finishedAt: result.correct ? Date.now() : undefined,
        feedback: result.feedback,
        highlightedClueId: undefined,
      }
    }
    case 'hint': {
      const characterId = action.characterId ?? state.selectedCharacterId
      if (!characterId) {
        return {
          ...state,
          feedback: { type: 'hint-person-required' },
          highlightedClueId: undefined,
        }
      }

      const maximumHints = state.puzzle.characters.length - 1
      if (state.hintsUsed >= maximumHints) {
        return {
          ...state,
          feedback: { type: 'hint-limit-reached' },
          highlightedClueId: undefined,
        }
      }

      const solution = solve(state.puzzle)
      const targetPositionId = solution?.[characterId]
      const targetPosition = state.puzzle.positions.find(
        (position) => position.id === targetPositionId,
      )
      const character = state.puzzle.characters.find(
        (candidate) => candidate.id === characterId,
      )
      if (!solution || !targetPosition || !character) {
        const hint = getSolverHint(state.puzzle, state.assignments, state.hintsUsed)
        return {
          ...state,
          feedback: hint.feedback,
          highlightedClueId: hint.clueId,
        }
      }

      const conflictingCharacterIds = state.puzzle.characters
        .filter((candidate) => candidate.id !== characterId)
        .filter((candidate) => {
          const assignedPositionId = state.assignments[candidate.id]
          const assignedPosition = state.puzzle.positions.find(
            (position) => position.id === assignedPositionId,
          )
          if (!assignedPosition) return false
          if (assignedPosition.id === targetPosition.id) return true
          if (state.puzzle.boardMode === 'logic-grid') {
            return (
              assignedPosition.row === targetPosition.row ||
              assignedPosition.column === targetPosition.column
            )
          }
          return (
            state.puzzle.boardMode === 'logic-cube' &&
            placementsConflict(state.puzzle, assignedPosition, targetPosition)
          )
        })
        .map((candidate) => candidate.id)
      const isAlreadyCorrect =
        state.assignments[characterId] === targetPosition.id &&
        conflictingCharacterIds.length === 0
      if (isAlreadyCorrect) {
        return {
          ...state,
          selectedCharacterId: undefined,
          feedback: { type: 'hint-already-correct', characterName: character.name },
          highlightedClueId: undefined,
        }
      }

      const assignments: Partial<Record<CharacterId, PositionId>> = Object.fromEntries(
        Object.entries(state.assignments).filter(
          ([assignedCharacterId]) =>
            assignedCharacterId !== characterId &&
            !conflictingCharacterIds.includes(assignedCharacterId as CharacterId),
        ),
      ) as Partial<Record<CharacterId, PositionId>>
      assignments[characterId] = targetPosition.id

      return {
        ...state,
        assignments,
        past: [...state.past, snapshot(state)],
        future: [],
        moves: state.moves + 1,
        hintsUsed: state.hintsUsed + 1,
        selectedCharacterId: nextUnassignedCharacter(state, assignments, characterId),
        feedback: { type: 'hint-applied', characterName: character.name },
        highlightedClueId: undefined,
      }
    }
  }
}
