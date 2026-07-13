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
    expect(statistics.schemaVersion).toBe(3)
    expect(statistics.history[0]?.generatorVersion).toBe(0)
  })

  it('stores the generator version without an answer or profile data', async () => {
    vi.mocked(get).mockResolvedValue(undefined)
    const statistics = await recordCompletion({
      seed: 'new',
      title: 'New game',
      audience: 'teens',
      difficulty: 'hard',
      generatorVersion: GENERATOR_VERSION,
      elapsedSeconds: 90,
      moves: 12,
      hintsUsed: 1,
    })

    expect(statistics.history[0]?.generatorVersion).toBe(GENERATOR_VERSION)
    expect(JSON.stringify(statistics.history[0])).not.toContain('solution')
    expect(set).toHaveBeenCalledOnce()
  })
})
