import { describe, expect, it } from 'vitest'
import { renderClue, renderClueParts } from '../domain/vocabulary'
import type { Clue } from '../domain/types'
import { characterIds, createPuzzle, positionIds } from './fixtures'

describe('local clue templates', () => {
  it('renders the same structured clue in every supported language', () => {
    const clue: Clue = {
      id: 'simple',
      type: 'character-at-position',
      phraseVariant: 0,
      characterId: characterIds.a,
      positionId: positionIds.p0,
    }
    const puzzle = createPuzzle([clue])
    expect(renderClue(puzzle, clue, 'ca')).toContain('Aina')
    expect(renderClue(puzzle, clue, 'es')).toContain('Aina')
    expect(renderClue(puzzle, clue, 'en')).toContain('Aina')
  })

  it('gives child clues a warm action without losing their structured item token', () => {
    const clue: Clue = {
      id: 'child-story',
      type: 'character-at-position',
      phraseVariant: 0,
      characterId: characterIds.a,
      positionId: positionIds.p0,
    }
    const puzzle = createPuzzle([clue])
    const expectedActions = {
      ca: /ha arribat|somriure/u,
      es: /ha llegado|sonrisa/u,
      en: /arrived|smile/u,
    } as const

    for (const locale of ['ca', 'es', 'en'] as const) {
      const sentence = renderClue(puzzle, clue, locale)
      expect(sentence).toMatch(expectedActions[locale])
      expect(
        renderClueParts(puzzle, clue, locale).find((part) => part.type === 'icon'),
      ).toMatchObject({
        type: 'icon',
        emoji: '🌼',
      })
      expect(sentence).not.toContain('{')
    }
  })

  it('keeps the exact catalog icon as a structured clue token', () => {
    const clue: Clue = {
      id: 'item',
      type: 'has-item',
      phraseVariant: 0,
      characterId: characterIds.a,
      itemId: createPuzzle().characters[0]!.itemId!,
    }
    const puzzle = createPuzzle([clue])

    expect(renderClueParts(puzzle, clue, 'ca')).toContainEqual({
      type: 'icon',
      emoji: '🌼',
      label: 'flor',
    })
  })

  it('renders corner clues without exposing grid coordinates', () => {
    const clue: Clue = {
      id: 'corner',
      type: 'in-corner',
      phraseVariant: 0,
      characterId: characterIds.a,
    }
    const puzzle = createPuzzle([clue])

    for (const locale of ['ca', 'es', 'en'] as const) {
      const sentence = renderClue(puzzle, clue, locale)
      expect(sentence).toContain('Aina')
      expect(sentence).not.toMatch(/\d+[.,:]\d+/u)
    }
  })
})
