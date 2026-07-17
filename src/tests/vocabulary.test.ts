import { describe, expect, it } from 'vitest'
import {
  auditCatalanClueReadability,
  auditClueObjectRelevance,
  auditClueTemplatePlaceholders,
  renderClue,
  renderClueParts,
} from '../domain/vocabulary'
import type { Clue } from '../domain/types'
import { selectedCharacterPlacementCopy, supportedLocales } from '../domain/i18n'
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

  it('keeps illustrated relations readable as one coherent scene in every locale', () => {
    const clues: readonly Clue[] = [
      ...(['left-of', 'right-of', 'above', 'below'] as const).flatMap((type) =>
        ([0, 1] as const).map((phraseVariant) => ({
          id: `${type}-${phraseVariant}`,
          type,
          phraseVariant,
          firstCharacterId: characterIds.a,
          secondCharacterId: characterIds.b,
        })),
      ),
      ...([0, 1] as const).map((phraseVariant) => ({
        id: `between-${phraseVariant}`,
        type: 'between' as const,
        phraseVariant,
        characterId: characterIds.a,
        firstCharacterId: characterIds.b,
        secondCharacterId: characterIds.c,
      })),
    ]
    const puzzle = createPuzzle(clues)
    const directionTerms: Readonly<
      Record<(typeof supportedLocales)[number], readonly RegExp[]>
    > = {
      ca: [/esquerra/u, /dreta/u, /sobre/u, /sota/u, /entre/u],
    }
    const emptyActionBeforeDirection = /ajuda el grup.*(?:esquerr|dret)/iu

    for (const locale of supportedLocales) {
      clues.forEach((clue, index) => {
        const sentence = renderClue(puzzle, clue, locale)
        expect(sentence).toContain('Aina')
        expect(sentence).toContain('Biel')
        expect(sentence).toMatch(directionTerms[locale][Math.floor(index / 2)]!)
        expect(sentence).not.toMatch(emptyActionBeforeDirection)
        if (clue.type === 'between') expect(sentence).toContain('Cora')
      })
      expect(selectedCharacterPlacementCopy(locale, 'Duna')).toContain('Duna')
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

  it('elides the Catalan preposition before a person name that starts with a vowel', () => {
    const clue: Clue = {
      id: 'above-person',
      type: 'above',
      phraseVariant: 0,
      firstCharacterId: characterIds.b,
      secondCharacterId: characterIds.a,
    }
    const basePuzzle = createPuzzle([clue])
    const puzzle = {
      ...basePuzzle,
      boardMode: 'logic-cube' as const,
      buildingPlacement: 'rooms' as const,
      characters: basePuzzle.characters.map((character) =>
        character.id === characterIds.a ? { ...character, name: 'Àlex' } : character,
      ),
    }

    expect(renderClue(puzzle, clue, 'ca')).toContain('d’Àlex')
    expect(renderClue(puzzle, clue, 'ca')).not.toContain('de Àlex')
  })
})
