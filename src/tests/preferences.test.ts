import { del, get, set } from 'idb-keyval'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadPreferences } from '../storage/preferences'

vi.mock('idb-keyval', () => ({ del: vi.fn(), get: vi.fn(), set: vi.fn() }))

describe('preference migration without profiles', () => {
  beforeEach(() => {
    vi.mocked(get).mockReset()
    vi.mocked(del).mockReset()
    vi.mocked(set).mockReset()
  })

  it('moves an advanced legacy profile into the unified 2D collection and erases it', async () => {
    vi.mocked(get).mockImplementation((key) => {
      if (key === 'logic-garden:preferences:v1') {
        return Promise.resolve({
          schemaVersion: 2,
          difficulty: 'medium',
          puzzleVariant: 'spatial',
          locale: 'ca',
          soundEnabled: false,
          reducedMotion: false,
        })
      }
      return Promise.resolve({ schemaVersion: 1, audience: 'adults', name: 'Aina' })
    })

    await expect(loadPreferences()).resolves.toMatchObject({
      schemaVersion: 4,
      difficulty: 'medium',
      collection: 'two-dimensional',
      showCheckProgress: true,
    })
    expect(del).toHaveBeenCalledWith('logic-garden:profile:v1')
    expect(vi.mocked(set).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(del).mock.invocationCallOrder[0] ?? Number.POSITIVE_INFINITY,
    )
  })

  it('keeps a legacy building choice in the separate 3D collection', async () => {
    vi.mocked(get).mockImplementation((key) =>
      Promise.resolve(
        key === 'logic-garden:preferences:v1'
          ? {
              schemaVersion: 2,
              difficulty: 'hard',
              puzzleVariant: 'cube',
              locale: 'en',
              soundEnabled: false,
              reducedMotion: true,
            }
          : null,
      ),
    )

    await expect(loadPreferences()).resolves.toMatchObject({
      schemaVersion: 4,
      collection: 'three-dimensional',
      showCheckProgress: true,
    })
  })

  it('keeps the legacy audience when no preference record exists', async () => {
    vi.mocked(get).mockImplementation((storageKey) =>
      Promise.resolve(
        storageKey === 'logic-garden:profile:v1'
          ? { schemaVersion: 1, audience: 'teens', name: 'Nil' }
          : undefined,
      ),
    )

    await expect(loadPreferences()).resolves.toMatchObject({
      collection: 'two-dimensional',
      difficulty: 'easy',
    })
    expect(set).toHaveBeenCalledWith(
      'logic-garden:preferences:v1',
      expect.objectContaining({ collection: 'two-dimensional' }),
    )
    expect(del).toHaveBeenCalledWith('logic-garden:profile:v1')
  })

  it('does not erase the legacy profile if migrated preferences cannot be stored', async () => {
    vi.mocked(get).mockImplementation((storageKey) =>
      Promise.resolve(
        storageKey === 'logic-garden:profile:v1'
          ? { schemaVersion: 1, audience: 'adults', name: 'Aina' }
          : undefined,
      ),
    )
    vi.mocked(set).mockRejectedValue(new Error('storage unavailable'))

    await expect(loadPreferences()).resolves.toMatchObject({ collection: 'two-dimensional' })
    expect(del).not.toHaveBeenCalled()
  })
})
