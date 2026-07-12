import type { PartialAssignment, Puzzle } from '../domain/types'
import { isPartialAssignmentValid, solve } from '../solver/solver'

export interface ValidationResult {
  readonly complete: boolean
  readonly correct: boolean
  readonly message: string
}

export const validateAssignment = (
  puzzle: Puzzle,
  assignment: PartialAssignment,
): ValidationResult => {
  const complete = puzzle.characters.every((character) => assignment[character.id])
  if (!complete) {
    return {
      complete: false,
      correct: false,
      message: 'Encara hi ha algun amic sense lloc. Continua quan vulguis!',
    }
  }

  if (!isPartialAssignmentValid(puzzle, assignment)) {
    return {
      complete: true,
      correct: false,
      message: 'Gairebé! Revisa les pistes i prova una combinació diferent.',
    }
  }

  return {
    complete: true,
    correct: true,
    message: 'Fantàstic! Has resolt el puzzle amb una gran deducció.',
  }
}

export interface Hint {
  readonly clueId?: string
  readonly message: string
}

export const getSolverHint = (
  puzzle: Puzzle,
  assignment: PartialAssignment,
  usedHints: number,
): Hint => {
  const solution = solve(puzzle)
  if (!solution)
    return { message: 'Aquest puzzle s’està preparant. Torna-ho a provar en un moment.' }

  const character = puzzle.characters.find(
    (candidate) => assignment[candidate.id] !== solution[candidate.id],
  )
  if (!character) return { message: 'Tot encaixa! Pots comprovar la teva resposta.' }

  const clue = puzzle.clues.find((candidate) => {
    if ('characterId' in candidate && candidate.characterId === character.id) return true
    return 'firstCharacterId' in candidate && candidate.firstCharacterId === character.id
  })
  const position = puzzle.positions.find((candidate) => candidate.id === solution[character.id])
  const phase = usedHints % 3

  if (phase === 0) return { clueId: clue?.id, message: 'Aquesta pista et pot ajudar ara.' }
  if (phase === 1)
    return { clueId: clue?.id, message: `Pots deduir el lloc de ${character.name}.` }
  return {
    clueId: clue?.id,
    message: `Una petita ajuda: ${character.name} encaixa a ${position?.label ?? 'aquest lloc'}.`,
  }
}
