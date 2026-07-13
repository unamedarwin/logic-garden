import { get, set } from 'idb-keyval'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createGameState } from '../game/gameReducer'
import { seed } from '../domain/types'
import { generatePuzzle } from '../generator/puzzleGenerator'
import { GENERATOR_VERSION } from '../generator/version'
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
      schemaVersion: 3,
      generatorVersion: GENERATOR_VERSION,
      state,
    })
    await expect(loadSavedGame()).resolves.toEqual({ state })

    const challenge = {
      difficulty: 'easy' as const,
      seed: seed('saved-challenge'),
      audience: 'children' as const,
      generatorVersion: GENERATOR_VERSION,
      benchmarkSeconds: 95,
    }
    await saveGame(state, challenge)
    expect(set).toHaveBeenCalledWith(
      'logic-garden:saved-game:v1',
      expect.objectContaining({
        schemaVersion: 3,
        generatorVersion: GENERATOR_VERSION,
        challenge,
      }),
    )
  })

  it('restores a current challenge benchmark with the in-progress game', async () => {
    const challenge = {
      difficulty: 'easy' as const,
      seed: seed('restored-challenge'),
      audience: 'children' as const,
      generatorVersion: GENERATOR_VERSION,
      benchmarkSeconds: 42,
    }
    vi.mocked(get).mockResolvedValue({
      schemaVersion: 3,
      generatorVersion: GENERATOR_VERSION,
      state,
      challenge,
    })

    await expect(loadSavedGame()).resolves.toEqual({ state, challenge })
  })
})
