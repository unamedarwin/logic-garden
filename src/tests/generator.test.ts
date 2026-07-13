import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { getTheme, themes } from '../domain/themes'
import { fluentIconData } from '../assets/generated/fluentIconData'
import type { Audience, Difficulty } from '../domain/types'
import { renderClue } from '../domain/vocabulary'
import {
  generatePuzzle,
  generatePuzzleForCollection,
  selectAdvancedPuzzleTemplate,
} from '../generator/puzzleGenerator'
import { isClueSatisfiedByPartialAssignment } from '../solver/constraintEvaluator'
import { countSolutions, solve } from '../solver/solver'

const bannedTerms =
  /murder|death|weapon|violence|threat|punishment|assassinat|mort|arma|violència|amenaça|càstig|asesinato|muerte|arma|violencia|amenaza|castigo/iu

describe('seeded puzzle generator', () => {
  it('maps the three public collections to child, unified 2D, and 3D games', () => {
    const child = generatePuzzleForCollection('medium', 'collection-child', 'children')
    const building = generatePuzzleForCollection(
      'easy',
      'collection-building',
      'three-dimensional',
    )
    const advancedAudiences = new Set(
      Array.from(
        { length: 24 },
        (_, index) =>
          getTheme(
            generatePuzzleForCollection('easy', `collection-2d-${index}`, 'two-dimensional')
              .theme,
          ).audience,
      ),
    )

    expect(child.boardMode).toBe('map')
    expect(building.boardMode).toBe('logic-cube')
    expect(building.difficulty).toBe('hard')
    expect(advancedAudiences).toEqual(new Set(['teens', 'adults']))
  })

  it('builds a deterministic 5x5x5 building with three spatial axes', () => {
    const puzzle = generatePuzzle('hard', 'five-cube', 'teens', 'cube')
    const repeated = generatePuzzle('hard', 'five-cube', 'teens', 'cube')
    const solution = solve(puzzle)

    expect(repeated).toEqual(puzzle)
    expect(puzzle.boardMode).toBe('logic-cube')
    expect(puzzle.positions).toHaveLength(125)
    expect(puzzle.characters).toHaveLength(8)
    expect(solution).not.toBeNull()
    expect(countSolutions(puzzle, { limit: 2 })).toBe(1)
    expect(new Set(puzzle.positions.map((position) => position.layer))).toEqual(
      new Set([0, 1, 2, 3, 4]),
    )
    expect(puzzle.positions.filter((position) => !position.blocked)).toHaveLength(18)
    const occupied = Object.values(solution ?? {}).map((positionId) =>
      puzzle.positions.find((position) => position.id === positionId),
    )
    expect(occupied.filter((position) => position?.buildingKind === 'shop')).toHaveLength(2)
    expect(occupied.filter((position) => position?.buildingKind === 'home')).toHaveLength(6)
    expect(
      new Set(
        Object.values(solution ?? {}).map(
          (positionId) =>
            puzzle.positions.find((position) => position.id === positionId)?.layer,
        ),
      ),
    ).toEqual(new Set([0, 1, 2, 3, 4]))
    const shopClues = puzzle.clues.filter(
      (clue) =>
        clue.type === 'character-at-position' &&
        puzzle.positions.find((position) => position.id === clue.positionId)?.buildingKind ===
          'shop',
    )
    expect(shopClues).toHaveLength(2)
    expect(
      shopClues.every((clue) => /obre|botiga|atén/u.test(renderClue(puzzle, clue, 'ca'))),
    ).toBe(true)
    expect(
      shopClues.every((clue) => /abre|tienda|atiende/u.test(renderClue(puzzle, clue, 'es'))),
    ).toBe(true)
    expect(
      shopClues.every((clue) => /opens|shop|customers/u.test(renderClue(puzzle, clue, 'en'))),
    ).toBe(true)
    expect(
      puzzle.clues.every((clue) =>
        solution ? isClueSatisfiedByPartialAssignment(puzzle, clue, solution) : false,
      ),
    ).toBe(true)
  })

  it('keeps character identities visually separate from object markers in every theme', () => {
    for (const theme of themes) {
      const objectEmojis = new Set(theme.items.map((item) => item.emoji))
      expect(new Set(theme.characters.map((character) => character.emoji)).size, theme.id).toBe(
        theme.characters.length,
      )
      expect(
        theme.characters.filter((character) => objectEmojis.has(character.emoji)),
        theme.id,
      ).toEqual([])
    }
  })

  it('uses curated, unique room objects for every teen and adult scene', () => {
    for (const theme of themes.filter((candidate) => candidate.audience)) {
      expect(theme.roomObjects?.length, theme.id).toBeGreaterThanOrEqual(20)
      const roomEmojis = new Set(theme.roomObjects?.map((item) => item.emoji))
      const carriedEmojis = new Set(theme.items.map((item) => item.emoji))
      expect(roomEmojis.size, theme.id).toBe(theme.roomObjects?.length)
      expect(
        theme.items.filter((item) => roomEmojis.has(item.emoji)),
        theme.id,
      ).toEqual([])
      expect(
        theme.characters.filter((character) => roomEmojis.has(character.emoji)),
        theme.id,
      ).toEqual([])
      expect(
        theme.characters.filter((character) => carriedEmojis.has(character.emoji)),
        theme.id,
      ).toEqual([])
    }
  })

  it('bundles a local Fluent SVG for every generated person and object', () => {
    for (const theme of themes) {
      const emojis = [
        ...theme.characters.map((character) => character.emoji),
        ...theme.items.map((item) => item.emoji),
        ...(theme.roomObjects ?? []).map((item) => item.emoji),
      ]
      expect(
        emojis.filter((emoji) => !fluentIconData[emoji]),
        theme.id,
      ).toEqual([])
    }
  })

  it('repeats the exact same puzzle for the same seed and varies across seeds', () => {
    expect(generatePuzzle('medium', 'same-seed')).toEqual(generatePuzzle('medium', 'same-seed'))
    expect(generatePuzzle('medium', 'seed-one').clues).not.toEqual(
      generatePuzzle('medium', 'seed-two').clues,
    )
  })

  it('creates only unique, safe, minimal puzzles for hundreds of seeds', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<Difficulty>('easy', 'medium', 'hard'),
        fc.integer({ min: -1_000_000, max: 1_000_000 }),
        (difficulty, value) => {
          const puzzle = generatePuzzle(difficulty, `property-${value}`)
          const solution = solve(puzzle)
          if (!solution) return false
          if (countSolutions(puzzle, { limit: 2 }) !== 1) return false
          if (
            !puzzle.clues.every((clue) =>
              isClueSatisfiedByPartialAssignment(puzzle, clue, solution),
            )
          )
            return false
          if (new Set(puzzle.clues.map((clue) => clue.id)).size !== puzzle.clues.length)
            return false
          return !bannedTerms.test(JSON.stringify(puzzle))
        },
      ),
      { numRuns: 180 },
    )
  }, 20_000)

  it('keeps advanced puzzles deductive and uniquely solvable across seeded content catalogs', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<Audience>('teens', 'adults'),
        fc.constantFrom<Difficulty>('easy', 'medium', 'hard'),
        fc.integer({ min: -1_000_000, max: 1_000_000 }),
        (audience, difficulty, value) => {
          const puzzle = generatePuzzle(difficulty, `advanced-${value}`, audience)
          const exactClues = puzzle.clues.filter(
            (clue) => clue.type === 'character-at-position',
          )
          const relationalClues = puzzle.clues.filter((clue) =>
            [
              'adjacent',
              'not-adjacent',
              'left-of',
              'right-of',
              'above',
              'below',
              'between',
            ].includes(clue.type),
          )
          if (countSolutions(puzzle, { limit: 2 }) !== 1) return false
          if (exactClues.length > puzzle.characters.length - 1) return false
          if (relationalClues.length < 1) return false
          return exactClues.every((clue) => {
            const position = puzzle.positions.find(
              (candidate) => candidate.id === clue.positionId,
            )
            return Boolean(
              position &&
              puzzle.positions.some(
                (obstacle) =>
                  obstacle.blocked &&
                  obstacle.placeId === position.placeId &&
                  Math.abs(obstacle.row - position.row) +
                    Math.abs(obstacle.column - position.column) ===
                    1,
              ),
            )
          })
        },
      ),
      { numRuns: 6 },
    )
  }, 30_000)

  it('keeps every selected clue necessary after clue reduction', () => {
    const puzzle = generatePuzzle('hard', 'minimal-clues')
    for (const clue of puzzle.clues) {
      const withoutClue = {
        ...puzzle,
        clues: puzzle.clues.filter((candidate) => candidate.id !== clue.id),
      }
      expect(countSolutions(withoutClue, { limit: 2 })).not.toBe(1)
    }
  })

  it('uses collection-specific content and deduction-grid row and column rules', () => {
    const teenPuzzle = generatePuzzle('medium', 'teen-logic-grid', 'teens')
    const adultPuzzle = generatePuzzle('medium', 'adult-logic-grid', 'adults')
    const solution = solve(teenPuzzle)
    if (!solution) throw new Error('Expected a solvable deduction grid')

    expect(teenPuzzle.boardMode).toBe('logic-grid')
    expect(teenPuzzle.characters.length).toBeGreaterThanOrEqual(4)
    expect([36, 81, 256]).toContain(teenPuzzle.positions.length)
    expect([6, 9, 20]).toContain(
      teenPuzzle.positions.filter((position) => position.blocked).length,
    )
    expect(getTheme(teenPuzzle.theme).audience).toBe('teens')
    expect(getTheme(adultPuzzle.theme).audience).toBe('adults')

    const occupied = Object.values(solution).map((positionId) =>
      teenPuzzle.positions.find((position) => position.id === positionId),
    )
    expect(new Set(occupied.map((position) => position?.row)).size).toBe(6)
    expect(new Set(occupied.map((position) => position?.column)).size).toBe(6)
    expect(countSolutions(teenPuzzle, { limit: 2 })).toBe(1)
    expect(
      Object.values(solution).some(
        (positionId) =>
          teenPuzzle.positions.find((position) => position.id === positionId)?.blocked,
      ),
    ).toBe(false)
  })

  it('uses visual spatial clues for teen and adult grids without distance or axis wording', () => {
    for (const audience of ['teens', 'adults'] as const) {
      const puzzle = generatePuzzle('medium', `spatial-clues-${audience}`, audience)
      const forbiddenTypes = new Set([
        'distance',
        'same-row',
        'different-row',
        'same-column',
        'different-column',
      ])

      expect(puzzle.clues.some((clue) => forbiddenTypes.has(clue.type))).toBe(false)
      expect(puzzle.clues.length).toBeGreaterThan(0)
      const rendered = (['ca', 'es', 'en'] as const).flatMap((locale) =>
        puzzle.clues.map((clue) => renderClue(puzzle, clue, locale)),
      )
      expect(rendered.join(' ')).not.toMatch(
        /\b(ruta|rutas|route|routes|fila|filas|row|rows|columna|columnas|column|columns|passos|pasos|steps)\b/iu,
      )
      expect(
        puzzle.clues
          .filter((clue) => clue.type === 'character-at-position')
          .every((clue) => {
            const text = renderClue(puzzle, clue, 'ca')
            return puzzle.positions.some(
              (position) =>
                position.blocked &&
                position.obstacleLabel &&
                text.includes(position.obstacleLabel),
            )
          }),
      ).toBe(true)
      const exactClues = puzzle.clues.filter((clue) => clue.type === 'character-at-position')
      expect(exactClues.length).toBeLessThanOrEqual(puzzle.characters.length - 1)
      expect(
        puzzle.clues.filter((clue) => clue.type === 'character-next-to-obstacle'),
      ).toHaveLength(puzzle.characters.length)
      expect(
        exactClues.every((clue) => {
          const position = puzzle.positions.find(
            (candidate) => candidate.id === clue.positionId,
          )
          return puzzle.positions.some(
            (obstacle) =>
              position &&
              obstacle.blocked &&
              obstacle.placeId === position.placeId &&
              Math.abs(obstacle.row - position.row) +
                Math.abs(obstacle.column - position.column) ===
                1,
          )
        }),
      ).toBe(true)
      expect(
        exactClues.every((clue) => /agrada|ganes|ajuda/u.test(renderClue(puzzle, clue, 'ca'))),
      ).toBe(true)
      expect(
        exactClues.every((clue) => /ilusión|ganas|ayuda/u.test(renderClue(puzzle, clue, 'es'))),
      ).toBe(true)
      expect(
        exactClues.every((clue) =>
          /excited|ready|helping/u.test(renderClue(puzzle, clue, 'en')),
        ),
      ).toBe(true)
      const landmarkTexts = puzzle.clues
        .filter((clue) => clue.type === 'character-next-to-obstacle')
        .flatMap((clue) =>
          (['ca', 'es', 'en'] as const).map((locale) => renderClue(puzzle, clue, locale)),
        )
      expect(landmarkTexts.every((text) => text.length > 24)).toBe(true)
    }
  })

  it('scales spatial plans without coupling difficulty to one board dimension', () => {
    for (const difficulty of ['easy', 'medium', 'hard'] as const) {
      const puzzles = Array.from({ length: 60 }, (_, index) =>
        generatePuzzle(difficulty, `large-plan-${difficulty}-${index}`, 'adults'),
      )
      expect(new Set(puzzles.map((puzzle) => Math.sqrt(puzzle.positions.length)))).toEqual(
        new Set([6, 9, 16]),
      )

      for (const puzzle of puzzles.slice(0, 6)) {
        const dimension = Math.sqrt(puzzle.positions.length)
        const obstacles = dimension === 6 ? 6 : dimension === 9 ? 9 : 20
        expect(puzzle.characters.length).toBeLessThanOrEqual(dimension)
        expect(puzzle.positions).toHaveLength(dimension * dimension)
        expect(new Set(puzzle.positions.map((position) => position.label)).size).toBe(
          puzzle.positions.length,
        )
        expect(puzzle.positions.filter((position) => position.blocked)).toHaveLength(obstacles)
        expect(
          puzzle.positions
            .filter((position) => position.blocked)
            .every((position) => position.obstacleEmoji && position.obstacleLabel),
        ).toBe(true)
        const theme = getTheme(puzzle.theme)
        const roomObjectEmojis = new Set(theme.roomObjects?.map((item) => item.emoji))
        const obstacleEmojis = puzzle.positions
          .filter((position) => position.blocked)
          .map((position) => position.obstacleEmoji)
        expect(obstacleEmojis.every((emoji) => emoji && roomObjectEmojis.has(emoji))).toBe(true)
        const roomSpecificObstacleCount = puzzle.positions
          .filter((position) => position.blocked)
          .filter((position) => {
            const roomIndex = Number(position.placeId.replace('place-', ''))
            return theme.roomObjectsByPlace?.[roomIndex]?.some(
              (item) => item.emoji === position.obstacleEmoji,
            )
          }).length
        expect(roomSpecificObstacleCount).toBeGreaterThanOrEqual(
          Math.ceil(obstacleEmojis.length * 0.7),
        )
        if (theme.id === 'city-garden') {
          const pondPlaceIndex = theme.terrainFeature?.placeIndex
          expect(
            puzzle.positions
              .filter(
                (position) =>
                  position.blocked && position.placeId === `place-${pondPlaceIndex}`,
              )
              .every((position) =>
                theme.roomObjectsByPlace?.[pondPlaceIndex ?? -1]?.some(
                  (item) => item.emoji === position.obstacleEmoji,
                ),
              ),
          ).toBe(true)
        }
        expect(new Set(obstacleEmojis).size).toBe(obstacleEmojis.length)
        expect(
          new Set(
            puzzle.positions
              .filter((position) => position.blocked)
              .map((position) => position.placeId),
          ).size,
        ).toBeGreaterThanOrEqual(6)
        expect(countSolutions(puzzle, { limit: 2 })).toBe(1)
      }
    }
  }, 20_000)

  it('selects advanced grid size independently and without catalog bucket bias', () => {
    for (const audience of ['teens', 'adults'] as const) {
      for (const difficulty of ['easy', 'medium', 'hard'] as const) {
        const counts = new Map<number, number>([
          [6, 0],
          [9, 0],
          [16, 0],
        ])
        for (let index = 0; index < 900; index += 1) {
          const template = selectAdvancedPuzzleTemplate(
            difficulty,
            `balanced-size-${audience}-${difficulty}-${index}`,
            audience,
          )
          if (!template) throw new Error('Expected an advanced template')
          counts.set(template.gridSize, (counts.get(template.gridSize) ?? 0) + 1)
        }

        for (const [size, count] of counts) {
          expect(count, `${audience}:${difficulty}:${size}`).toBeGreaterThan(240)
          expect(count, `${audience}:${difficulty}:${size}`).toBeLessThan(360)
        }
      }
    }
  })

  it('varies rectangular children maps between both seeded orientations', () => {
    const shapes = new Set(
      Array.from({ length: 24 }, (_, index) => {
        const puzzle = generatePuzzle('medium', `orientation-${index}`, 'children')
        const rows = Math.max(...puzzle.positions.map((position) => position.row)) + 1
        const columns = Math.max(...puzzle.positions.map((position) => position.column)) + 1
        return `${rows}x${columns}`
      }),
    )

    expect(shapes).toContain('2x3')
    expect(shapes).toContain('3x2')
  })
})
