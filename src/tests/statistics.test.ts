import { get, set } from 'idb-keyval'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadStatistics, recordCompletion } from '../storage/statistics'
import { GENERATOR_VERSION } from '../generator/version'

vi.mock('idb-keyval', () => ({ get: vi.fn(), set: vi.fn() }))

describe('local completion statistics', () => {
  beforeEach(() => {
    vi.mocked(get).mockReset()
    vi.mocked(set).mockReset()
  })

  it('keeps old history but marks it as non-reproducible', async () => {
    vi.mocked(get).mockResolvedValue({
      schemaVersion: 2,
      completed: 1,
      hintsUsed: 0,
      recentSeeds: ['old'],
      history: [
        {
          id: 'old:1',
          seed: 'old',
          title: 'Old game',
          audience: 'adults',
          difficulty: 'medium',
          completedAt: 1,
          elapsedSeconds: 40,
          moves: 8,
          hintsUsed: 0,
        },
      ],
    })

    const statistics = await loadStatistics()
    expect(statistics.schemaVersion).toBe(4)
    expect(statistics.history[0]?.generatorVersion).toBe(0)
    expect(statistics.history[0]?.legacyTitle).toBe('Old game')
  })

  it('stores the generator version without an answer or personal data', async () => {
    vi.mocked(get).mockResolvedValue(undefined)
    const statistics = await recordCompletion({
      seed: 'new',
      theme: 'music-studio',
      audience: 'teens',
      difficulty: 'hard',
      puzzleVariant: 'spatial',
      gridSize: 6,
      generatorVersion: GENERATOR_VERSION,
      elapsedSeconds: 90,
      moves: 12,
      hintsUsed: 1,
    })

    expect(statistics.history[0]?.generatorVersion).toBe(GENERATOR_VERSION)
    expect(statistics.history[0]?.theme).toBe('music-studio')
    expect(statistics.history[0]?.gridSize).toBe(6)
    expect(JSON.stringify(statistics.history[0])).not.toContain('solution')
    expect(set).toHaveBeenCalledOnce()
  })

  it('stores the selected building height for a reproducible 3D history entry', async () => {
    vi.mocked(get).mockResolvedValue(undefined)
    const statistics = await recordCompletion({
      seed: 'tall-building',
      theme: 'music-studio',
      audience: 'teens',
      difficulty: 'hard',
      puzzleVariant: 'cube',
      buildingDepth: 10,
      buildingPlacement: 'cells',
      generatorVersion: GENERATOR_VERSION,
      elapsedSeconds: 180,
      moves: 16,
      hintsUsed: 0,
    })

    expect(statistics.history[0]?.buildingDepth).toBe(10)
    expect(JSON.stringify(statistics.history[0])).not.toContain('solution')
  })

  it('rejects a current history payload with an invalid building mode', async () => {
    vi.mocked(get).mockResolvedValue({
      schemaVersion: 4,
      completed: 1,
      hintsUsed: 0,
      recentSeeds: ['bad'],
      history: [
        {
          id: 'bad:1',
          seed: 'bad',
          audience: 'adults',
          difficulty: 'easy',
          puzzleVariant: 'cube',
          buildingDepth: 3,
          buildingPlacement: 'unknown',
          generatorVersion: GENERATOR_VERSION,
          completedAt: 1,
          elapsedSeconds: 10,
          moves: 1,
          hintsUsed: 0,
        },
      ],
    })

    await expect(loadStatistics()).resolves.toEqual({
      schemaVersion: 4,
      completed: 0,
      hintsUsed: 0,
      recentSeeds: [],
      history: [],
    })
  })
})
