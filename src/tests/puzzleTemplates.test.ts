import { describe, expect, it } from 'vitest'
import { advancedPuzzleTemplates } from '../assets/generated/puzzleTemplateData'
import {
  GENERATOR_VERSION,
  generatePuzzle,
  selectAdvancedPuzzleTemplate,
} from '../generator/puzzleGenerator'
import {
  canonicalTemplateSignature,
  materializeAdvancedPuzzleTemplate,
  templateBucketKey,
  type AdvancedPuzzleTemplate,
  type TemplateClue,
} from '../generator/puzzleTemplates'
import { countSolutions } from '../solver/solver'
import { BUILDING_DEPTHS, buildingDepthForPositions } from '../domain/buildingPlan'

describe('validated advanced puzzle templates', () => {
  it('contains one hundred distinct answer-free structures across every content bucket', () => {
    expect(advancedPuzzleTemplates).toHaveLength(100)
    expect(new Set(advancedPuzzleTemplates.map(canonicalTemplateSignature)).size).toBe(100)
    expect(JSON.stringify(advancedPuzzleTemplates)).not.toContain('solution')
    expect(new Set(advancedPuzzleTemplates.map(templateBucketKey)).size).toBe(34)
    expect(
      advancedPuzzleTemplates.filter((template) => template.boardMode === 'logic-grid'),
    ).toHaveLength(84)
    const buildingTemplates = advancedPuzzleTemplates.filter(
      (template) => template.boardMode === 'logic-cube',
    )
    expect(buildingTemplates).toHaveLength(16)
    expect(buildingTemplates.filter((template) => template.audience === 'teens')).toHaveLength(
      8,
    )
    expect(buildingTemplates.filter((template) => template.audience === 'adults')).toHaveLength(
      8,
    )
    for (const audience of ['teens', 'adults'] as const) {
      for (const depth of BUILDING_DEPTHS) {
        expect(
          buildingTemplates.filter(
            (template) => template.audience === audience && template.depth === depth,
          ),
        ).toHaveLength(1)
      }
    }
    expect(buildingTemplates.every((template) => template.characterCount === 8)).toBe(true)
    expect(buildingTemplates.every((template) => template.roomClues.length > 0)).toBe(true)
    expect(
      buildingTemplates.every((template) =>
        template.roomClues.every((clue) =>
          ['z', 'Z', 'a', 'A', 'u', 'd', 's', 'S'].includes(clue[0]),
        ),
      ),
    ).toBe(true)
    expect(
      advancedPuzzleTemplates
        .filter((template) => template.boardMode === 'logic-grid' && template.gridSize === 16)
        .every((template) => template.characterCount === 8),
    ).toBe(true)
    expect(
      advancedPuzzleTemplates.every(
        (template) => template.generatorVersion === GENERATOR_VERSION,
      ),
    ).toBe(true)
  })

  it('rechecks one themed template per content bucket with a two-solution limit', () => {
    const samples = new Map<string, (typeof advancedPuzzleTemplates)[number]>()
    for (const template of advancedPuzzleTemplates) {
      const key = templateBucketKey(template)
      if (!samples.has(key)) samples.set(key, template)
    }

    for (const [key, template] of samples) {
      const puzzle = materializeAdvancedPuzzleTemplate(template, `template-test-${key}`)
      expect(countSolutions(puzzle, { limit: 2 }), key).toBe(1)
      expect(
        puzzle.characters.map((character) => character.name),
        key,
      ).not.toContain('character-0')
      if (template.boardMode === 'logic-cube') {
        const roomPuzzle = materializeAdvancedPuzzleTemplate(
          template,
          `template-room-test-${key}`,
          'rooms',
        )
        expect(roomPuzzle.buildingPlacement, key).toBe('rooms')
        expect(countSolutions(roomPuzzle, { limit: 2 }), key).toBe(1)
      }
    }
  }, 20_000)

  it('canonical identity ignores clue ordering but includes room-mode clue facts', () => {
    const template = advancedPuzzleTemplates.find(
      (candidate) => candidate.boardMode === 'logic-cube' && candidate.roomClues.length > 0,
    )
    if (!template || template.boardMode !== 'logic-cube') {
      throw new Error('Expected a building template with room clues')
    }

    const reversed: AdvancedPuzzleTemplate = {
      ...template,
      clues: [...template.clues].reverse(),
      roomClues: [...template.roomClues].reverse(),
    }
    expect(canonicalTemplateSignature(reversed)).toBe(canonicalTemplateSignature(template))

    const changedRoomClue: TemplateClue = ['z', 0, 0]
    const changed: AdvancedPuzzleTemplate = {
      ...template,
      roomClues: [changedRoomClue, ...template.roomClues],
    }
    expect(canonicalTemplateSignature(changed)).not.toBe(canonicalTemplateSignature(template))
  })

  it('selects and decorates catalog entries deterministically from the public seed', () => {
    const first = generatePuzzle('hard', 'catalog-selection', 'adults', 'spatial', 6)
    const repeated = generatePuzzle('hard', 'catalog-selection', 'adults', 'spatial', 6)
    const other = generatePuzzle('hard', 'catalog-selection-other', 'adults', 'spatial', 6)

    expect(repeated).toEqual(first)
    expect(other.id).not.toBe(first.id)
    expect(countSolutions(first, { limit: 2 })).toBe(1)
    expect(Math.sqrt(first.positions.length)).toBe(6)
  })

  it('selects a solver-verified variable-height structure for the advanced building', () => {
    const first = generatePuzzle('hard', 'cube-catalog', 'adults', 'cube')
    const repeated = generatePuzzle('hard', 'cube-catalog', 'adults', 'cube')

    expect(first).toEqual(repeated)
    expect(first.boardMode).toBe('logic-cube')
    const depth = buildingDepthForPositions(first.positions)
    expect(BUILDING_DEPTHS).toContain(depth)
    expect(first.positions).toHaveLength(depth * 25)
    expect(first.characters).toHaveLength(8)
    expect(new Set(first.positions.map((position) => position.layer))).toEqual(
      new Set(Array.from({ length: depth }, (_, layer) => layer)),
    )
    expect(countSolutions(first, { limit: 2 })).toBe(1)
  })

  it('materializes room-placement building templates deterministically', () => {
    const template = selectAdvancedPuzzleTemplate(
      'hard',
      'room-materialization',
      'adults',
      'cube',
      undefined,
      6,
    )
    if (!template || template.boardMode !== 'logic-cube') {
      throw new Error('Expected a building template')
    }

    const first = materializeAdvancedPuzzleTemplate(template, 'room-materialization', 'rooms')
    const repeated = materializeAdvancedPuzzleTemplate(
      template,
      'room-materialization',
      'rooms',
    )
    const other = materializeAdvancedPuzzleTemplate(
      template,
      'room-materialization-other',
      'rooms',
    )

    expect(repeated).toEqual(first)
    expect(other.id).not.toBe(first.id)
    expect(first.buildingPlacement).toBe('rooms')
    expect(countSolutions(first, { limit: 2 })).toBe(1)
  })

  it('selects building height independently of uneven template quotas', () => {
    for (const audience of ['teens', 'adults'] as const) {
      const depths = new Set(
        Array.from({ length: 600 }, (_, index) => {
          const template = selectAdvancedPuzzleTemplate(
            'hard',
            `height-selection-${audience}-${index}`,
            audience,
            'cube',
          )
          if (!template || template.boardMode !== 'logic-cube') {
            throw new Error('Expected a building template')
          }
          return template.depth
        }),
      )
      expect(depths).toEqual(new Set(BUILDING_DEPTHS))
    }
  })
})
