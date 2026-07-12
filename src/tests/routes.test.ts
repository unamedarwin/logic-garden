import { describe, expect, it } from 'vitest'
import { parseSharedGameRoute, shareUrl } from '../app/routes'
import { seed } from '../domain/types'

describe('shared routes', () => {
  it('uses the GitHub Pages base path for share links', () => {
    const url = shareUrl({ difficulty: 'medium', seed: seed('ABCD-1234') }, 'teens')
    const shared = new URL(url)

    expect(shared.pathname).toBe(import.meta.env.BASE_URL)
    expect(shared.searchParams.get('p')).toMatch(/^[A-Za-z0-9_-]+$/u)
    expect(parseSharedGameRoute(shared as unknown as Location)).toEqual({
      difficulty: 'medium',
      seed: 'ABCD-1234',
      audience: 'teens',
    })
  })

  it('reads a share link from the GitHub Pages base path', () => {
    const location = new URL(
      `https://unamedarwin.github.io${import.meta.env.BASE_URL}?v=1&difficulty=hard&seed=HOME-42`,
    ) as unknown as Location

    expect(parseSharedGameRoute(location)).toEqual({
      difficulty: 'hard',
      seed: 'HOME-42',
      audience: 'children',
    })
  })

  it('does not treat another path as a shared game', () => {
    const location = new URL(
      'https://unamedarwin.github.io/play?v=1&difficulty=easy&seed=HOME-42',
    ) as unknown as Location

    expect(parseSharedGameRoute(location)).toBeNull()
  })
})
