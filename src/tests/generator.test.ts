import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { getTheme, themes } from '../domain/themes'
import { fluentIconData } from '../assets/generated/fluentIconData'
import type { Audience, Difficulty } from '../domain/types'
import { renderClue, renderClueParts } from '../domain/vocabulary'
import { supportedLocales } from '../domain/i18n'
import {
  BUILDING_DEPTHS,
  buildingDepthForPositions,
  buildingHomeCount,
  buildingPlayableCount,
  buildingShopCount,
  buildingUnitsAreNeighbors,
  isBuildingAbove,
} from '../domain/buildingPlan'
import {
  generatePuzzle,
  generatePuzzleDirect,
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
    expect(building.difficulty).toBe('easy')
    expect(advancedAudiences).toEqual(new Set(['teens', 'adults']))
  })

  it('honors the independently selected child size and building height', () => {
    const child = generatePuzzleForCollection('easy', 'selected-child-size', 'children', 6, 8)
    const building = generatePuzzleForCollection(
      'easy',
      'selected-building-height',
      'three-dimensional',
      6,
      4,
      10,
    )

    expect(child.characters).toHaveLength(8)
    expect(child.positions).toHaveLength(8)
    expect(child.difficulty).toBe('easy')
    expect(countSolutions(child, { limit: 2 })).toBe(1)
    expect(buildingDepthForPositions(building.positions)).toBe(10)
    expect(building.positions).toHaveLength(250)
    expect(building.difficulty).toBe('easy')
    expect(countSolutions(building, { limit: 2 })).toBe(1)
  })

  it('turns an adventure choice into a normally reproducible seeded puzzle', () => {
    const selected = generatePuzzleForCollection(
      'medium',
      'selected-adventure',
      'two-dimensional',
      9,
      4,
      3,
      'sports-festival',
    )
    const replayed = generatePuzzle('medium', selected.seed, 'teens', 'spatial', 9)

    expect(selected.theme).toBe('sports-festival')
    expect(replayed).toEqual(selected)
  })

  it('grades child deduction independently from the selected map size', () => {
    const puzzles = (['easy', 'medium', 'hard'] as const).map((difficulty) =>
      generatePuzzleForCollection(difficulty, 'child-difficulty-matrix', 'children', 6, 8),
    )
    const directClues = puzzles.map(
      (puzzle) =>
        puzzle.clues.filter(
          (clue) => clue.type === 'character-at-position' || clue.type === 'character-in-place',
        ).length,
    )

    expect(puzzles.every((puzzle) => puzzle.characters.length === 8)).toBe(true)
    expect(directClues[0]).toBeGreaterThanOrEqual(7)
    expect(directClues[1]).toBeGreaterThanOrEqual(2)
    expect(directClues[2]).toBeLessThan(directClues[1]!)
    for (const puzzle of puzzles) expect(countSolutions(puzzle, { limit: 2 })).toBe(1)
  })

  it('grades building guidance independently from the selected height', () => {
    const puzzles = (['easy', 'medium', 'hard'] as const).map((difficulty) =>
      generatePuzzleForCollection(
        difficulty,
        'building-difficulty-matrix',
        'three-dimensional',
        6,
        4,
        10,
      ),
    )
    const guidanceClues = puzzles.map(
      (puzzle) =>
        puzzle.clues.filter((clue) => clue.id.startsWith('building-guidance:')).length,
    )
    const directlyGuidedCharacters = puzzles.map(
      (puzzle) =>
        new Set(
          puzzle.clues.flatMap((clue) =>
            clue.type === 'character-at-position' || clue.type === 'character-in-place'
              ? [clue.characterId]
              : [],
          ),
        ).size,
    )
    const baseDirectCharacters = directlyGuidedCharacters[2]!

    expect(puzzles.map((puzzle) => puzzle.difficulty)).toEqual(['easy', 'medium', 'hard'])
    expect(puzzles.every((puzzle) => buildingDepthForPositions(puzzle.positions) === 10)).toBe(
      true,
    )
    expect(guidanceClues).toEqual([
      Math.max(0, 4 - baseDirectCharacters),
      Math.max(0, 2 - baseDirectCharacters),
      0,
    ])
    expect(directlyGuidedCharacters[0]).toBeGreaterThanOrEqual(4)
    expect(directlyGuidedCharacters[1]).toBeGreaterThanOrEqual(2)
    for (const puzzle of puzzles) expect(countSolutions(puzzle, { limit: 2 })).toBe(1)
  })

  it('builds deterministic 5x5 buildings at every height with three spatial axes', () => {
    for (const depth of BUILDING_DEPTHS) {
      const structure = {
        boardMode: 'logic-cube' as const,
        gridSize: 5 as const,
        depth,
        characterCount: 8 as const,
      }
      const puzzle = generatePuzzleDirect(
        'hard',
        `height-${depth}`,
        depth % 2 === 0 ? 'teens' : 'adults',
        structure,
      )
      const repeated = generatePuzzleDirect(
        'hard',
        `height-${depth}`,
        depth % 2 === 0 ? 'teens' : 'adults',
        structure,
      )
      const solution = solve(puzzle)

      expect(repeated, `depth ${depth}`).toEqual(puzzle)
      expect(puzzle.boardMode).toBe('logic-cube')
      expect(buildingDepthForPositions(puzzle.positions)).toBe(depth)
      expect(puzzle.positions).toHaveLength(depth * 25)
      expect(puzzle.characters).toHaveLength(8)
      expect(solution).not.toBeNull()
      expect(countSolutions(puzzle, { limit: 2 }), `depth ${depth}`).toBe(1)
      expect(new Set(puzzle.positions.map((position) => position.layer))).toEqual(
        new Set(Array.from({ length: depth }, (_, layer) => layer)),
      )
      expect(puzzle.positions.filter((position) => !position.blocked)).toHaveLength(
        buildingPlayableCount(depth),
      )
      expect(buildingHomeCount(depth)).toBe(14 * (depth - 1))
      expect(buildingShopCount(depth)).toBe(10)
      expect(
        puzzle.positions.filter(
          (position) =>
            position.blocked &&
            (position.buildingKind === 'home' || position.buildingKind === 'shop'),
        ),
      ).toHaveLength(depth * 6)

      const occupied = Object.values(solution ?? {}).map((positionId) =>
        puzzle.positions.find((position) => position.id === positionId),
      )
      expect(occupied.filter((position) => position?.buildingKind === 'shop')).toHaveLength(2)
      expect(occupied.filter((position) => position?.buildingKind === 'home')).toHaveLength(6)
      expect(new Set(occupied.map((position) => position?.layer)).size).toBe(
        1 + Math.min(5, depth - 1),
      )
      expect(
        occupied.some((first, index) =>
          occupied
            .slice(index + 1)
            .some(
              (second) =>
                first &&
                second &&
                (isBuildingAbove(first, second) || isBuildingAbove(second, first)),
            ),
        ),
      ).toBe(true)
      expect(
        occupied.some((first, index) =>
          occupied
            .slice(index + 1)
            .some((second) => first && second && buildingUnitsAreNeighbors(first, second)),
        ),
      ).toBe(true)

      const shopClues = puzzle.clues.filter(
        (clue) =>
          clue.type === 'character-at-position' &&
          puzzle.positions.find((position) => position.id === clue.positionId)?.buildingKind ===
            'shop',
      )
      expect(shopClues).toHaveLength(2)
      const blockedRooms = puzzle.positions.filter(
        (position) =>
          position.blocked &&
          (position.buildingKind === 'home' || position.buildingKind === 'shop'),
      )
      expect(blockedRooms.length).toBeGreaterThan(0)
      expect(
        blockedRooms.every((position) => position.obstacleEmoji && position.obstacleLabel),
      ).toBe(true)
      expect(
        blockedRooms.some((position) =>
          puzzle.items.some((item) => item.emoji === position.obstacleEmoji),
        ),
      ).toBe(false)
      for (const clue of puzzle.clues.filter(
        (candidate) => candidate.type === 'character-at-position',
      )) {
        if (clue.type !== 'character-at-position') continue
        const target = puzzle.positions.find((position) => position.id === clue.positionId)
        const landmark = target
          ? puzzle.positions.find(
              (position) =>
                position.blocked &&
                position.placeId === target.placeId &&
                Math.abs(position.row - target.row) +
                  Math.abs(position.column - target.column) ===
                  1,
            )
          : undefined
        expect(landmark?.obstacleEmoji).toBeTruthy()
        expect(landmark?.obstacleLabel).toBeTruthy()
        for (const locale of supportedLocales) {
          expect(
            renderClueParts(puzzle, clue, locale).some(
              (part) => part.type === 'icon' && part.emoji === landmark?.obstacleEmoji,
            ),
          ).toBe(true)
        }
      }
      expect(
        puzzle.clues.every((clue) =>
          solution ? isClueSatisfiedByPartialAssignment(puzzle, clue, solution) : false,
        ),
      ).toBe(true)
    }
  }, 120_000)

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

  it('uses only curated child avatars for every child theme', () => {
    const childAvatars = new Set(['👧🏻', '👦🏼', '🧒🏽', '👧🏾', '👦🏿', '🧒🏻', '👧🏼', '👦🏽'])
    for (const theme of themes.filter((candidate) => !candidate.audience)) {
      expect(
        theme.characters.filter((character) => !childAvatars.has(character.emoji)),
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
      const rendered = supportedLocales.flatMap((locale) =>
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
        .flatMap((clue) => supportedLocales.map((locale) => renderClue(puzzle, clue, locale)))
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
        if (dimension === 16) expect(puzzle.characters).toHaveLength(8)
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
  }, 60_000)

  it('selects board size independently from deductive difficulty', () => {
    for (const audience of ['teens', 'adults'] as const) {
      for (const difficulty of ['easy', 'medium', 'hard'] as const) {
        for (const gridSize of [6, 9, 16] as const) {
          const template = selectAdvancedPuzzleTemplate(
            difficulty,
            `selected-size-${audience}-${difficulty}-${gridSize}`,
            audience,
            'spatial',
            gridSize,
          )
          if (!template) throw new Error('Expected an advanced template')
          expect(template.gridSize).toBe(gridSize)
          if (gridSize === 16) expect(template.characterCount).toBe(8)
        }
      }
    }
  })

  it('materializes every 2D size and difficulty combination as one unique puzzle', () => {
    for (const difficulty of ['easy', 'medium', 'hard'] as const) {
      for (const gridSize of [6, 9, 16] as const) {
        const puzzle = generatePuzzle(
          difficulty,
          `runtime-matrix-${difficulty}-${gridSize}`,
          'adults',
          'spatial',
          gridSize,
        )
        expect(Math.sqrt(puzzle.positions.length)).toBe(gridSize)
        expect(countSolutions(puzzle, { limit: 2 })).toBe(1)
        if (gridSize === 16) expect(puzzle.characters).toHaveLength(8)
      }
    }
  }, 30_000)

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
