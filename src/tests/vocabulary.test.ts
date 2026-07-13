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

  it('keeps the exact catalog icon as a structured clue token', () => {
    const clue: Clue = {
      id: 'item',
      type: 'has-item',
      phraseVariant: 0,
      characterId: characterIds.a,
      itemId: createPuzzle().characters[0]!.itemId,
    }
    const puzzle = createPuzzle([clue])

    expect(renderClueParts(puzzle, clue, 'ca')).toContainEqual({
      type: 'icon',
      emoji: '🌼',
      label: 'flor',
    })
  })
})
