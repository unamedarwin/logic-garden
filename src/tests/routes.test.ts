import { describe, expect, it } from 'vitest'
import { parseSharedGameRoute, shareUrl } from '../app/routes'
import { seed } from '../domain/types'
import { generatePuzzle } from '../generator/puzzleGenerator'
import { GENERATOR_VERSION } from '../generator/version'
import { buildingDepthForPositions } from '../domain/buildingPlan'

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
        gridSize: 16,
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
      gridSize: 16,
    })
  })

  it('keeps the variable-height 3D variant in a shared challenge', () => {
    const shared = new URL(
      shareUrl(
        {
          difficulty: 'medium',
          seed: seed('CUBE-125'),
          generatorVersion: GENERATOR_VERSION,
          variant: 'cube',
          buildingDepth: 7,
        },
        'adults',
      ),
    )

    expect(parseSharedGameRoute(shared as unknown as Location)).toMatchObject({
      difficulty: 'medium',
      seed: 'CUBE-125',
      audience: 'adults',
      variant: 'cube',
      buildingDepth: 7,
    })
  })

  it('keeps the selected child map size in a shared challenge', () => {
    const shared = new URL(
      shareUrl(
        {
          difficulty: 'medium',
          seed: seed('CHILD-8'),
          generatorVersion: GENERATOR_VERSION,
          childMapSize: 8,
        },
        'children',
      ),
    )

    expect(parseSharedGameRoute(shared as unknown as Location)).toMatchObject({
      audience: 'children',
      childMapSize: 8,
    })
  })

  it('round-trips and regenerates every shareable size and difficulty', () => {
    const difficulties = ['easy', 'medium', 'hard'] as const
    const advancedAudiences = ['teens', 'adults'] as const
    for (const difficulty of difficulties) {
      for (const childMapSize of [4, 6, 8] as const) {
        const puzzle = generatePuzzle(
          difficulty,
          `share-child-${difficulty}-${childMapSize}`,
          'children',
          'spatial',
          undefined,
          childMapSize,
        )
        const parsed = parseSharedGameRoute(
          new URL(
            shareUrl(
              {
                difficulty,
                seed: puzzle.seed,
                generatorVersion: GENERATOR_VERSION,
                childMapSize,
              },
              'children',
            ),
          ) as unknown as Location,
        )
        expect(parsed?.childMapSize).toBe(childMapSize)
        expect(
          generatePuzzle(
            parsed!.difficulty,
            parsed!.seed,
            parsed!.audience,
            parsed!.variant,
            parsed!.gridSize,
            parsed!.childMapSize,
            parsed!.buildingDepth,
          ),
        ).toEqual(puzzle)
      }

      for (const audience of advancedAudiences) {
        for (const gridSize of [6, 9, 16] as const) {
          const puzzle = generatePuzzle(
            difficulty,
            `share-spatial-${audience}-${difficulty}-${gridSize}`,
            audience,
            'spatial',
            gridSize,
          )
          const parsed = parseSharedGameRoute(
            new URL(
              shareUrl(
                {
                  difficulty,
                  seed: puzzle.seed,
                  generatorVersion: GENERATOR_VERSION,
                  gridSize,
                },
                audience,
              ),
            ) as unknown as Location,
          )
          expect(parsed).toMatchObject({ audience, gridSize })
          expect(
            generatePuzzle(
              parsed!.difficulty,
              parsed!.seed,
              parsed!.audience,
              parsed!.variant,
              parsed!.gridSize,
            ),
          ).toEqual(puzzle)
        }

        for (const buildingDepth of [3, 4, 5, 6, 7, 8, 9, 10] as const) {
          const puzzle = generatePuzzle(
            difficulty,
            `share-building-${audience}-${difficulty}-${buildingDepth}`,
            audience,
            'cube',
            undefined,
            undefined,
            buildingDepth,
          )
          const parsed = parseSharedGameRoute(
            new URL(
              shareUrl(
                {
                  difficulty,
                  seed: puzzle.seed,
                  generatorVersion: GENERATOR_VERSION,
                  variant: 'cube',
                  buildingDepth,
                },
                audience,
              ),
            ) as unknown as Location,
          )
          expect(parsed).toMatchObject({ audience, buildingDepth })
          const replayed = generatePuzzle(
            parsed!.difficulty,
            parsed!.seed,
            parsed!.audience,
            parsed!.variant,
            parsed!.gridSize,
            parsed!.childMapSize,
            parsed!.buildingDepth,
          )
          expect(buildingDepthForPositions(replayed.positions)).toBe(buildingDepth)
          expect(replayed).toEqual(puzzle)
        }
      }
    }
  }, 120_000)

  it('refuses to create a share link from an obsolete generator version', () => {
    expect(() =>
      shareUrl(
        {
          difficulty: 'easy',
          seed: seed('old-generator'),
          generatorVersion: GENERATOR_VERSION - 1,
          childMapSize: 4,
        },
        'children',
      ),
    ).toThrow(/obsolete generator/u)
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
    ).toMatchObject({ variant: 'cube', difficulty: 'medium' })
    expect(
      parseSharedGameRoute(encodedLocation({ ...basePayload, v: 3, variant: 'cube' })),
    ).toBeNull()
  })

  it('requires an explicit size in new advanced 2D challenges', () => {
    expect(
      parseSharedGameRoute(
        encodedLocation({
          v: 5,
          seed: 'ADVANCED-2D',
          difficulty: 'easy',
          audience: 'adults',
          generatorVersion: GENERATOR_VERSION,
          variant: 'spatial',
        }),
      ),
    ).toBeNull()
    expect(
      parseSharedGameRoute(
        encodedLocation({
          v: 5,
          seed: 'CHILD-SIZE',
          difficulty: 'easy',
          audience: 'children',
          generatorVersion: GENERATOR_VERSION,
          variant: 'spatial',
          gridSize: 16,
        }),
      ),
    ).toBeNull()
    expect(
      parseSharedGameRoute(
        encodedLocation({
          v: 5,
          seed: 'CHILD-NO-SIZE',
          difficulty: 'easy',
          audience: 'children',
          generatorVersion: GENERATOR_VERSION,
          variant: 'spatial',
        }),
      ),
    ).toBeNull()
    expect(
      parseSharedGameRoute(
        encodedLocation({
          v: 5,
          seed: 'CUBE-NO-HEIGHT',
          difficulty: 'hard',
          audience: 'adults',
          generatorVersion: GENERATOR_VERSION,
          variant: 'cube',
        }),
      ),
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
