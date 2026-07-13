import { describe, expect, it } from 'vitest'
import { advancedPuzzleTemplates } from '../assets/generated/puzzleTemplateData'
import { GENERATOR_VERSION, generatePuzzle } from '../generator/puzzleGenerator'
import {
  canonicalTemplateSignature,
  materializeAdvancedPuzzleTemplate,
  templateBucketKey,
} from '../generator/puzzleTemplates'
import { countSolutions } from '../solver/solver'

describe('validated advanced puzzle templates', () => {
  it('contains one thousand distinct answer-free structures across every profile bucket', () => {
    expect(advancedPuzzleTemplates).toHaveLength(1_000)
    expect(new Set(advancedPuzzleTemplates.map(canonicalTemplateSignature)).size).toBe(1_000)
    expect(JSON.stringify(advancedPuzzleTemplates)).not.toContain('solution')
    expect(new Set(advancedPuzzleTemplates.map(templateBucketKey)).size).toBe(20)
    expect(
      advancedPuzzleTemplates.every(
        (template) => template.generatorVersion === GENERATOR_VERSION,
      ),
    ).toBe(true)
  })

  it('rechecks one themed template per profile bucket with a two-solution limit', () => {
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
    }
  }, 20_000)

  it('selects and decorates catalog entries deterministically from the public seed', () => {
    const first = generatePuzzle('hard', 'catalog-selection', 'adults')
    const repeated = generatePuzzle('hard', 'catalog-selection', 'adults')
    const other = generatePuzzle('hard', 'catalog-selection-other', 'adults')

    expect(repeated).toEqual(first)
    expect(other.id).not.toBe(first.id)
    expect(countSolutions(first, { limit: 2 })).toBe(1)
    expect([6, 9, 16]).toContain(Math.sqrt(first.positions.length))
  })

  it('selects a solver-verified 5x5x3 structure for the advanced building', () => {
    const first = generatePuzzle('hard', 'cube-catalog', 'adults', 'cube')
    const repeated = generatePuzzle('hard', 'cube-catalog', 'adults', 'cube')

    expect(first).toEqual(repeated)
    expect(first.boardMode).toBe('logic-cube')
    expect(first.positions).toHaveLength(75)
    expect(first.characters).toHaveLength(5)
    expect(new Set(first.positions.map((position) => position.layer))).toEqual(
      new Set([0, 1, 2]),
    )
    expect(countSolutions(first, { limit: 2 })).toBe(1)
  })
})
