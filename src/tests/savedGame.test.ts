import { get, set } from 'idb-keyval'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createGameState, gameReducer } from '../game/gameReducer'
import { generatePuzzle } from '../generator/puzzleGenerator'
import { GENERATOR_VERSION } from '../generator/version'
import { solve } from '../solver/solver'
import { loadSavedGame, saveGame } from '../storage/savedGame'

vi.mock('idb-keyval', () => ({ del: vi.fn(), get: vi.fn(), set: vi.fn() }))

describe('saved game compatibility', () => {
  const state = createGameState(generatePuzzle('easy', 'saved-game-test', 'children'))

  beforeEach(() => {
    vi.mocked(get).mockReset()
    vi.mocked(set).mockReset()
  })

  it('rejects records from the old persistence schema and generator', async () => {
    vi.mocked(get).mockResolvedValue({ schemaVersion: 1, state })
    await expect(loadSavedGame()).resolves.toBeNull()

    vi.mocked(get).mockResolvedValue({
      schemaVersion: 2,
      generatorVersion: GENERATOR_VERSION,
      state,
    })
    await expect(loadSavedGame()).resolves.toBeNull()

    vi.mocked(get).mockResolvedValue({
      schemaVersion: 3,
      generatorVersion: GENERATOR_VERSION - 1,
      state,
    })
    await expect(loadSavedGame()).resolves.toBeNull()
  })

  it('restores and stores only the current generator version', async () => {
    vi.mocked(get).mockResolvedValue({
      schemaVersion: 4,
      generatorVersion: GENERATOR_VERSION,
      state,
    })
    await expect(loadSavedGame()).resolves.toEqual({ state })

    const challenge = {
      difficulty: 'easy' as const,
      seed: state.puzzle.seed,
      audience: 'children' as const,
      generatorVersion: GENERATOR_VERSION,
      benchmarkSeconds: 95,
    }
    await saveGame(state, challenge)
    expect(set).toHaveBeenCalledWith(
      'logic-garden:saved-game:v1',
      expect.objectContaining({
        schemaVersion: 4,
        generatorVersion: GENERATOR_VERSION,
        challenge,
      }),
    )
  })

  it('restores a current challenge benchmark with the in-progress game', async () => {
    const challenge = {
      difficulty: 'easy' as const,
      seed: state.puzzle.seed,
      audience: 'children' as const,
      generatorVersion: GENERATOR_VERSION,
      benchmarkSeconds: 42,
    }
    vi.mocked(get).mockResolvedValue({
      schemaVersion: 4,
      generatorVersion: GENERATOR_VERSION,
      state,
      challenge,
    })

    await expect(loadSavedGame()).resolves.toEqual({ state, challenge })
  })

  it('restores a structurally valid wrong deduction', async () => {
    const puzzle = generatePuzzle(
      'hard',
      '9aa77f1d-ba34-4c96-9767-01dee5543847',
      'adults',
      'cube',
    )
    const estel = puzzle.characters.find((character) => character.name === 'Estel')
    const target = puzzle.positions.find((position) => position.id === 'position-3-1-1')
    if (!estel || !target) throw new Error('Expected the shared regression puzzle')
    const wrongState = gameReducer(createGameState(puzzle), {
      type: 'move-character',
      characterId: estel.id,
      positionId: target.id,
    })
    vi.mocked(get).mockResolvedValue({
      schemaVersion: 4,
      generatorVersion: GENERATOR_VERSION,
      state: wrongState,
    })

    await expect(loadSavedGame()).resolves.toEqual({ state: wrongState })
  })

  it('restores a wrong child-map hypothesis without correcting it', async () => {
    const puzzle = generatePuzzle('medium', 'saved-child-hypothesis', 'children')
    const solution = solve(puzzle)
    const character = puzzle.characters[0]
    if (!solution || !character) throw new Error('Expected a solved child puzzle')
    const wrongPosition = puzzle.positions.find(
      (position) => !position.blocked && position.id !== solution[character.id],
    )
    if (!wrongPosition) throw new Error('Expected a wrong child-map position')
    const wrongState = gameReducer(createGameState(puzzle), {
      type: 'move-character',
      characterId: character.id,
      positionId: wrongPosition.id,
    })
    vi.mocked(get).mockResolvedValue({
      schemaVersion: 4,
      generatorVersion: GENERATOR_VERSION,
      state: wrongState,
    })

    await expect(loadSavedGame()).resolves.toEqual({ state: wrongState })
  })

  it('rejects a building whose stored cell geometry was altered', async () => {
    const puzzle = generatePuzzle('hard', 'saved-building-geometry', 'adults', 'cube')
    const corruptedState = {
      ...createGameState(puzzle),
      puzzle: {
        ...puzzle,
        positions: puzzle.positions.map((position, index) =>
          index === 0 ? { ...position, row: 1 } : position,
        ),
      },
    }
    vi.mocked(get).mockResolvedValue({
      schemaVersion: 4,
      generatorVersion: GENERATOR_VERSION,
      state: corruptedState,
    })

    await expect(loadSavedGame()).resolves.toBeNull()
  })
})
