import { describe, expect, it } from 'vitest'
import { parseSharedGameRoute, shareUrl } from '../app/routes'
import { seed } from '../domain/types'
import { GENERATOR_VERSION } from '../generator/version'

describe('shared routes', () => {
  const encodedLocation = (payload: Record<string, unknown>) => {
    const asciiJson = Array.from(JSON.stringify(payload), (character) => {
      const codePoint = character.codePointAt(0) ?? 0
      if (codePoint <= 0x7f) return character
      if (codePoint <= 0xffff) return `\\u${codePoint.toString(16).padStart(4, '0')}`
      const offset = codePoint - 0x10000
      const high = 0xd800 + (offset >> 10)
      const low = 0xdc00 + (offset & 0x3ff)
      return `\\u${high.toString(16)}\\u${low.toString(16)}`
    }).join('')
    const encoded = btoa(asciiJson)
      .replaceAll('+', '-')
      .replaceAll('/', '_')
      .replaceAll('=', '')
    return new URL(
      `https://unamedarwin.github.io${import.meta.env.BASE_URL}?p=${encoded}`,
    ) as unknown as Location
  }

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
    const encoded = shared.searchParams.get('p')
    expect(encoded).toMatch(/^gz_[A-Za-z0-9_-]+$/u)
    if (!encoded) throw new Error('Expected a compressed share payload')
    const gzipBytes = Uint8Array.from(
      atob(
        encoded
          .slice(3)
          .replaceAll('-', '+')
          .replaceAll('_', '/')
          .padEnd(Math.ceil((encoded.length - 3) / 4) * 4, '='),
      ),
      (character) => character.charCodeAt(0),
    )
    expect([...gzipBytes.slice(0, 2)]).toEqual([0x1f, 0x8b])
    expect(parseSharedGameRoute(shared as unknown as Location)).toEqual({
      difficulty: 'medium',
      seed: 'ABCD-1234',
      audience: 'teens',
      generatorVersion: GENERATOR_VERSION,
      benchmarkSeconds: 95,
      variant: 'spatial',
    })
  })

  it('keeps the variable-height 3D variant in a shared challenge', () => {
    const shared = new URL(
      shareUrl(
        {
          difficulty: 'hard',
          seed: seed('CUBE-125'),
          generatorVersion: GENERATOR_VERSION,
          variant: 'cube',
        },
        'adults',
      ),
    )

    expect(parseSharedGameRoute(shared as unknown as Location)).toMatchObject({
      difficulty: 'hard',
      seed: 'CUBE-125',
      audience: 'adults',
      variant: 'cube',
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

  it('rejects malformed or age-incompatible 3D payloads', () => {
    const basePayload = {
      v: 4,
      seed: 'BUILDING-3D',
      difficulty: 'hard',
      audience: 'adults',
      generatorVersion: GENERATOR_VERSION,
    }
    expect(parseSharedGameRoute(encodedLocation(basePayload))).toBeNull()
    expect(
      parseSharedGameRoute(
        encodedLocation({ ...basePayload, variant: 'cube', audience: 'children' }),
      ),
    ).toBeNull()
    expect(
      parseSharedGameRoute(
        encodedLocation({ ...basePayload, variant: 'cube', difficulty: 'medium' }),
      ),
    ).toBeNull()
    expect(
      parseSharedGameRoute(encodedLocation({ ...basePayload, v: 3, variant: 'cube' })),
    ).toBeNull()
  })

  it('rejects unsafe completion marks instead of trusting URL data', () => {
    expect(
      parseSharedGameRoute(
        encodedLocation({
          v: 4,
          difficulty: 'easy',
          seed: 'SAFE-42',
          audience: 'children',
          generatorVersion: GENERATOR_VERSION,
          variant: 'spatial',
          benchmarkSeconds: 999_999,
        }),
      ),
    ).toBeNull()
  })

  it('keeps accepting legacy uncompressed Base64 payloads', () => {
    expect(
      parseSharedGameRoute(
        encodedLocation({
          v: 4,
          difficulty: 'easy',
          seed: 'LEGACY-42',
          audience: 'children',
          generatorVersion: GENERATOR_VERSION,
          variant: 'spatial',
        }),
      ),
    ).toMatchObject({ seed: 'LEGACY-42', variant: 'spatial' })
  })

  it('rejects oversized or non-URL-safe seeds from shared payloads', () => {
    const basePayload = {
      v: 3,
      difficulty: 'easy',
      audience: 'children',
      generatorVersion: GENERATOR_VERSION,
    }

    expect(
      parseSharedGameRoute(encodedLocation({ ...basePayload, seed: 'jardí-🌱' })),
    ).toBeNull()
    expect(
      parseSharedGameRoute(encodedLocation({ ...basePayload, seed: 'x'.repeat(129) })),
    ).toBeNull()
  })

  it('refuses to create a share URL from an unsafe internal seed', () => {
    expect(() =>
      shareUrl(
        {
          difficulty: 'easy',
          seed: seed('unsafe seed'),
          generatorVersion: GENERATOR_VERSION,
        },
        'children',
      ),
    ).toThrow(/unsafe seed/u)
  })
})
