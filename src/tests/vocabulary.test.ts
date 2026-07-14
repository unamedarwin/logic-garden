import { describe, expect, it } from 'vitest'
import {
  auditCatalanClueReadability,
  auditClueObjectRelevance,
  auditClueTemplatePlaceholders,
  renderClue,
  renderClueParts,
} from '../domain/vocabulary'
import type { Clue } from '../domain/types'
import { supportedLocales } from '../domain/i18n'
import { characterIds, createPuzzle, positionIds } from './fixtures'

describe('local clue templates', () => {
  it('preserves every logical placeholder in every locale and clue family', () => {
    expect(auditClueTemplatePlaceholders()).toEqual([])
  })

  it('names visible Catalan objects directly without a repeated reference label', () => {
    expect(auditCatalanClueReadability()).toEqual([])
  })

  it('mentions an object only when the structured clue constrains that object', () => {
    expect(auditClueObjectRelevance()).toEqual([])
  })

  it('renders the same structured clue in every supported language', () => {
    const clue: Clue = {
      id: 'simple',
      type: 'character-at-position',
      phraseVariant: 0,
      characterId: characterIds.a,
      positionId: positionIds.p0,
    }
    const puzzle = createPuzzle([clue])
    for (const locale of supportedLocales) {
      expect(renderClue(puzzle, clue, locale)).toContain('Aina')
    }
  })

  it('gives child clues a warm action without an unrelated item token', () => {
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

    for (const locale of supportedLocales) {
      const sentence = renderClue(puzzle, clue, locale)
      if (locale === 'ca' || locale === 'es' || locale === 'en') {
        expect(sentence).toMatch(expectedActions[locale])
      }
      expect(sentence).not.toContain('{')
      expect(renderClueParts(puzzle, clue, locale).some((part) => part.type === 'icon')).toBe(
        false,
      )
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

    for (const locale of supportedLocales) {
      const sentence = renderClue(puzzle, clue, locale)
      expect(sentence).toContain('Aina')
      expect(sentence).not.toMatch(/\d+[.,:]\d+/u)
    }
  })

  it('applies French elision before dynamic names that start with a vowel', () => {
    const basePuzzle = createPuzzle()
    const vowelPuzzle = {
      ...basePuzzle,
      characters: basePuzzle.characters.map((character, index) => ({
        ...character,
        name: index === 0 ? 'Aina' : index === 1 ? 'Estel' : character.name,
      })),
    }
    const mapClues: readonly Clue[] = [
      {
        id: 'near-vowel',
        type: 'adjacent',
        phraseVariant: 1,
        firstCharacterId: characterIds.a,
        secondCharacterId: characterIds.b,
      },
      {
        id: 'left-vowel',
        type: 'left-of',
        phraseVariant: 1,
        firstCharacterId: characterIds.a,
        secondCharacterId: characterIds.b,
      },
    ]
    const cubePuzzle = {
      ...vowelPuzzle,
      boardMode: 'logic-cube' as const,
      positions: vowelPuzzle.positions.map((position, index) => ({
        ...position,
        buildingUnitId: index < 2 ? 'home-a' : 'home-b',
        buildingKind: 'home' as const,
        layer: 1,
      })),
    }
    const cubeClues: readonly Clue[] = [
      {
        id: 'home-vowel',
        type: 'character-in-place',
        phraseVariant: 0,
        characterId: characterIds.a,
        placeId: cubePuzzle.positions[0]!.placeId,
      },
      {
        id: 'corner-vowel',
        type: 'in-corner',
        phraseVariant: 0,
        characterId: characterIds.a,
      },
      {
        id: 'doors-vowel',
        type: 'not-adjacent',
        phraseVariant: 0,
        firstCharacterId: characterIds.a,
        secondCharacterId: characterIds.b,
      },
      {
        id: 'above-vowel',
        type: 'above',
        phraseVariant: 0,
        firstCharacterId: characterIds.a,
        secondCharacterId: characterIds.b,
      },
    ]

    const rendered = [
      ...mapClues.map((clue) => renderClue(vowelPuzzle, clue, 'fr')),
      ...cubeClues.map((clue) => renderClue(cubePuzzle, clue, 'fr')),
    ]
    expect(rendered.join(' ')).not.toMatch(/\bde (?:Aina|Estel)\b/u)
    expect(rendered.join(' ')).toMatch(/d’(?:Aina|Estel)/u)
  })
})
