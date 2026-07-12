import type { CharacterId, PartialAssignment, PositionId, Puzzle } from '../domain/types'
import { getSolverHint, validateAssignment } from './validation'

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
  readonly feedback?: string
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
  | { readonly type: 'hint' }

const snapshot = (state: GameState): GameSnapshot => ({
  assignments: state.assignments,
  moves: state.moves,
})

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
        feedback: undefined,
        highlightedClueId: undefined,
      }
    }
    case 'move-character': {
      const targetPosition = state.puzzle.positions.find(
        (position) => position.id === action.positionId,
      )
      const characterExists = state.puzzle.characters.some(
        (character) => character.id === action.characterId,
      )
      if (!targetPosition || !characterExists) return state

      if (state.puzzle.boardMode === 'logic-grid') {
        const conflictsWithGrid = state.puzzle.characters.some((character) => {
          if (character.id === action.characterId) return false
          const assignedPositionId = state.assignments[character.id]
          const assignedPosition = state.puzzle.positions.find(
            (position) => position.id === assignedPositionId,
          )
          return (
            assignedPosition !== undefined &&
            (assignedPosition.row === targetPosition.row ||
              assignedPosition.column === targetPosition.column)
          )
        })
        if (conflictsWithGrid) return state
      }

      const occupiedBy = state.puzzle.characters.find(
        (character) => state.assignments[character.id] === action.positionId,
      )
      const assignments: Partial<Record<CharacterId, PositionId>> = {
        ...state.assignments,
        [action.characterId]: action.positionId,
      }
      if (occupiedBy && occupiedBy.id !== action.characterId) delete assignments[occupiedBy.id]

      return {
        ...state,
        assignments,
        past: [...state.past, snapshot(state)],
        future: [],
        moves: state.moves + 1,
        selectedCharacterId: undefined,
        status: 'playing',
        feedback: undefined,
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
        feedback: result.message,
        highlightedClueId: undefined,
      }
    }
    case 'hint': {
      const hint = getSolverHint(state.puzzle, state.assignments, state.hintsUsed)
      return {
        ...state,
        hintsUsed: state.hintsUsed + 1,
        feedback: hint.message,
        highlightedClueId: hint.clueId,
      }
    }
  }
}
