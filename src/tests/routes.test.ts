import { describe, expect, it } from 'vitest'
import { parseSharedGameRoute, shareUrl } from '../app/routes'
import { seed } from '../domain/types'
import { GENERATOR_VERSION } from '../generator/version'

describe('shared routes', () => {
  it('uses the GitHub Pages base path for share links', () => {
    const url = shareUrl(
      {
        difficulty: 'medium',
        seed: seed('ABCD-1234'),
        generatorVersion: GENERATOR_VERSION,
      },
      'teens',
      95,
    )
    const shared = new URL(url)

    expect(shared.pathname).toBe(import.meta.env.BASE_URL)
    expect(shared.searchParams.get('p')).toMatch(/^[A-Za-z0-9_-]+$/u)
    expect(parseSharedGameRoute(shared as unknown as Location)).toEqual({
      difficulty: 'medium',
      seed: 'ABCD-1234',
      audience: 'teens',
      generatorVersion: GENERATOR_VERSION,
      benchmarkSeconds: 95,
    })
  })

  it('reads a share link from the GitHub Pages base path', () => {
    const location = new URL(
      `https://unamedarwin.github.io${import.meta.env.BASE_URL}?v=2&generatorVersion=${GENERATOR_VERSION}&difficulty=hard&seed=HOME-42`,
    ) as unknown as Location

    expect(parseSharedGameRoute(location)).toEqual({
      difficulty: 'hard',
      seed: 'HOME-42',
      audience: 'children',
      generatorVersion: GENERATOR_VERSION,
    })
  })

  it('does not treat another path as a shared game', () => {
    const location = new URL(
      `https://unamedarwin.github.io/play?v=2&generatorVersion=${GENERATOR_VERSION}&difficulty=easy&seed=HOME-42`,
    ) as unknown as Location

    expect(parseSharedGameRoute(location)).toBeNull()
  })

  it('rejects a payload from a generator version that cannot be reproduced', () => {
    const location = new URL(
      `https://unamedarwin.github.io${import.meta.env.BASE_URL}?v=2&generatorVersion=1&difficulty=easy&seed=OLD-42`,
    ) as unknown as Location

    expect(parseSharedGameRoute(location)).toBeNull()
  })

  it('rejects unsafe completion marks instead of trusting URL data', () => {
    const valid = new URL(
      shareUrl(
        {
          difficulty: 'easy',
          seed: seed('SAFE-42'),
          generatorVersion: GENERATOR_VERSION,
        },
        'children',
        42,
      ),
    )
    const encoded = valid.searchParams.get('p')
    if (!encoded) throw new Error('Expected a share payload')
    const decoded = JSON.parse(
      atob(encoded.replaceAll('-', '+').replaceAll('_', '/')),
    ) as Record<string, unknown>
    decoded.benchmarkSeconds = 999_999
    valid.searchParams.set('p', btoa(JSON.stringify(decoded)))

    expect(parseSharedGameRoute(valid as unknown as Location)).toBeNull()
  })
})
