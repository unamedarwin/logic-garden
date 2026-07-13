import { get, set } from 'idb-keyval'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { hasVisited, markVisited } from '../storage/visit'

vi.mock('idb-keyval', () => ({ get: vi.fn(), set: vi.fn() }))

describe('first-visit state', () => {
  beforeEach(() => {
    vi.mocked(get).mockReset()
    vi.mocked(set).mockReset()
  })

  it('recognizes an existing installation from its preferences', async () => {
    vi.mocked(get).mockImplementation((storageKey) =>
      Promise.resolve(
        storageKey === 'logic-garden:preferences:v1' ? { schemaVersion: 2 } : undefined,
      ),
    )

    await expect(hasVisited()).resolves.toBe(true)
  })

  it('recognizes an existing installation from the retired profile', async () => {
    vi.mocked(get).mockImplementation((storageKey) =>
      Promise.resolve(
        storageKey === 'logic-garden:profile:v1' ? { schemaVersion: 1 } : undefined,
      ),
    )

    await expect(hasVisited()).resolves.toBe(true)
  })

  it('marks a genuinely new installation after its first load', async () => {
    vi.mocked(get).mockResolvedValue(undefined)
    await expect(hasVisited()).resolves.toBe(false)

    await markVisited()
    expect(set).toHaveBeenCalledWith('logic-garden:visited:v1', true)
  })
})
