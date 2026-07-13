import { describe, expect, it } from 'vitest'
import { advancedPuzzleTemplates } from '../assets/generated/puzzleTemplateData'
import { GENERATOR_VERSION, generatePuzzle } from '../generator/puzzleGenerator'
import { materializeAdvancedPuzzleTemplate } from '../generator/puzzleTemplates'
import { countSolutions } from '../solver/solver'

const structuralSignature = (template: (typeof advancedPuzzleTemplates)[number]) =>
  JSON.stringify({
    audience: template.audience,
    gridSize: template.gridSize,
    spatialPlanId: template.spatialPlanId,
    clues: template.clues,
  })

describe('validated advanced puzzle templates', () => {
  it('contains one thousand distinct answer-free structures across every profile bucket', () => {
    expect(advancedPuzzleTemplates).toHaveLength(1_000)
    expect(new Set(advancedPuzzleTemplates.map(structuralSignature)).size).toBe(1_000)
    expect(JSON.stringify(advancedPuzzleTemplates)).not.toContain('solution')
    expect(
      new Set(
        advancedPuzzleTemplates.map(
          (template) => `${template.audience}:${template.difficulty}:${template.gridSize}`,
        ),
      ).size,
    ).toBe(18)
    expect(
      advancedPuzzleTemplates.every(
        (template) => template.generatorVersion === GENERATOR_VERSION,
      ),
    ).toBe(true)
  })

  it('rechecks one themed template per profile bucket with a two-solution limit', () => {
    const samples = new Map<string, (typeof advancedPuzzleTemplates)[number]>()
    for (const template of advancedPuzzleTemplates) {
      const key = `${template.audience}:${template.difficulty}:${template.gridSize}`
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
  })

  it('selects and decorates catalog entries deterministically from the public seed', () => {
    const first = generatePuzzle('hard', 'catalog-selection', 'adults')
    const repeated = generatePuzzle('hard', 'catalog-selection', 'adults')
    const other = generatePuzzle('hard', 'catalog-selection-other', 'adults')

    expect(repeated).toEqual(first)
    expect(other.id).not.toBe(first.id)
    expect(countSolutions(first, { limit: 2 })).toBe(1)
    expect([6, 9, 16]).toContain(Math.sqrt(first.positions.length))
  })
})
