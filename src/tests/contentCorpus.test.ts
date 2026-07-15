import { describe, expect, it } from 'vitest'
import { advancedPuzzleTemplates } from '../assets/generated/puzzleTemplateData'
import { supportedLocales } from '../domain/i18n'
import { themesForAudience } from '../domain/themes'
import type {
  BuildingSize,
  ChildMapSize,
  Difficulty,
  Puzzle,
  PuzzleCollection,
} from '../domain/types'
import { renderClueParts } from '../domain/vocabulary'
import { BUILDING_DEPTHS } from '../domain/buildingPlan'
import { generatePuzzleForCollection } from '../generator/puzzleGenerator'
import { materializeAdvancedPuzzleTemplate } from '../generator/puzzleTemplates'
import { assignmentFromDeductionTrace, analyzeDeductionTrace } from '../solver/deductionTrace'
import { isCompleteAssignmentSatisfyingPuzzle } from '../solver/constraintEvaluator'
import { countSolutions } from '../solver/solver'

const difficulties = ['easy', 'medium', 'hard'] as const satisfies readonly Difficulty[]
const childSizes = [4, 6, 8] as const satisfies readonly ChildMapSize[]
const advancedSizes = [6, 9, 16] as const

const assertCompleteContent = (puzzle: Puzzle) => {
  expect(countSolutions(puzzle, { limit: 2 })).toBe(1)

  const trace = analyzeDeductionTrace(puzzle)
  expect(trace.steps).toHaveLength(puzzle.characters.length)
  expect(
    isCompleteAssignmentSatisfyingPuzzle(puzzle, assignmentFromDeductionTrace(trace)),
  ).toBe(true)

  supportedLocales.forEach((locale) => {
    puzzle.clues.forEach((clue) => {
      const parts = renderClueParts(puzzle, clue, locale)
      const rendered = parts
        .map((part) => (part.type === 'icon' ? `${part.emoji} ${part.label}` : part.text))
        .join('')
      expect(rendered.trim()).not.toBe('')
      expect(rendered).not.toMatch(/[{}]/u)
      expect(
        parts
          .filter((part) => part.type === 'icon')
          .every((part) => part.emoji.length > 0 && part.label.trim().length > 0),
      ).toBe(true)
    })
  })
}

describe('complete generated content corpus', () => {
  it('materializes every answer-free structural template', () => {
    expect(advancedPuzzleTemplates).toHaveLength(100)

    advancedPuzzleTemplates.forEach((template) => {
      const puzzle = materializeAdvancedPuzzleTemplate(
        template,
        `complete-template-corpus-${template.id}`,
      )
      assertCompleteContent(puzzle)
    })
  }, 180_000)

  it('covers every public theme, difficulty, and selected dimension', () => {
    const cases: {
      collection: PuzzleCollection
      difficulty: Difficulty
      size: number
      puzzle: Puzzle
    }[] = []

    for (const theme of themesForAudience('children')) {
      for (const difficulty of difficulties) {
        for (const childSize of childSizes) {
          const collection = 'children' as const
          cases.push({
            collection,
            difficulty,
            size: childSize,
            puzzle: generatePuzzleForCollection(
              difficulty,
              `complete-content-${collection}-${theme.id}-${difficulty}-${childSize}`,
              collection,
              6,
              childSize,
              3,
              theme.id,
            ),
          })
        }
      }
    }

    for (const audience of ['teens', 'adults'] as const) {
      for (const theme of themesForAudience(audience)) {
        for (const difficulty of difficulties) {
          for (const gridSize of advancedSizes) {
            const collection = 'two-dimensional' as const
            cases.push({
              collection,
              difficulty,
              size: gridSize,
              puzzle: generatePuzzleForCollection(
                difficulty,
                `complete-content-${collection}-${theme.id}-${difficulty}-${gridSize}`,
                collection,
                gridSize,
                4,
                3,
                theme.id,
              ),
            })
          }

          for (const buildingDepth of BUILDING_DEPTHS) {
            const collection = 'three-dimensional' as const
            cases.push({
              collection,
              difficulty,
              size: buildingDepth,
              puzzle: generatePuzzleForCollection(
                difficulty,
                `complete-content-${collection}-${theme.id}-${difficulty}-${buildingDepth}`,
                collection,
                6,
                4,
                buildingDepth as BuildingSize,
                theme.id,
              ),
            })
          }
        }
      }
    }

    expect(cases).toHaveLength(288)
    cases.forEach(({ collection, size, puzzle }) => {
      expect(puzzle.theme).toBeDefined()
      if (collection === 'children') expect(puzzle.characters).toHaveLength(size)
      if (collection === 'two-dimensional') {
        expect(Math.sqrt(puzzle.positions.length)).toBe(size)
      }
      if (collection === 'three-dimensional') {
        expect(Math.max(...puzzle.positions.map((position) => position.layer ?? 0)) + 1).toBe(
          size,
        )
      }
      assertCompleteContent(puzzle)
    })
  }, 300_000)
})
