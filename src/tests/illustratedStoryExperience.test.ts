import { describe, expect, it } from 'vitest'
import { buildChildNarrative } from '../domain/childNarrative'
import {
  characterStoryPrompt,
  puzzleCollectionCopy,
  supportedLocales,
  themeCopy,
} from '../domain/i18n'
import type { ThemeId } from '../domain/types'
import { generatePuzzleForCollection } from '../generator/puzzleGenerator'

// cspell:disable -- these assertions intentionally include public labels from every locale.

const illustratedThemes: readonly ThemeId[] = [
  'forest-party',
  'treasure-island',
  'kind-magic-school',
  'space-trip',
  'fun-farm',
  'sea-garden',
  'dino-park',
  'friendly-monster-town',
  'color-fair',
  'mountain-trip',
]

const wordCount = (copy: string) => copy.trim().split(/\s+/u).length

describe('illustrated adventure experience', () => {
  it('uses an age-neutral public collection name in every locale', () => {
    const ageLabels = /infantil|children|haurrak|enfants|kinder/iu

    supportedLocales.forEach((locale) => {
      const copy = puzzleCollectionCopy(locale, 'children')
      expect(copy.label).not.toMatch(ageLabels)
      expect(copy.description).not.toMatch(ageLabels)
    })
  })

  it('builds a short deterministic mystery arc from each illustrated theme and seed', () => {
    supportedLocales.forEach((locale) => {
      illustratedThemes.forEach((themeId) => {
        const first = themeCopy(locale, themeId, 'same-story-seed', 'Aina')
        expect(themeCopy(locale, themeId, 'same-story-seed', 'Aina')).toEqual(first)
        expect(first.introduction).toContain(first.title)
        expect(first.introduction).toContain('Aina')
        expect(wordCount(first.introduction)).toBeLessThanOrEqual(22)
        expect(wordCount(first.objective)).toBeLessThanOrEqual(14)
        expect(wordCount(first.victory)).toBeLessThanOrEqual(14)

        const openings = new Set(
          Array.from(
            { length: 24 },
            (_, index) =>
              themeCopy(locale, themeId, `story-seed-${index}`, 'Aina').introduction,
          ),
        )
        expect(openings.size).toBe(3)
      })
    })
  })

  it('gives every selected character a short reproducible story prompt', () => {
    supportedLocales.forEach((locale) => {
      const prompt = characterStoryPrompt(locale, 'Aina', 'prompt-seed')
      expect(characterStoryPrompt(locale, 'Aina', 'prompt-seed')).toBe(prompt)
      expect(prompt).toContain('Aina')
      expect(wordCount(prompt)).toBeLessThanOrEqual(9)

      const prompts = new Set(
        Array.from({ length: 24 }, (_, index) =>
          characterStoryPrompt(locale, 'Aina', `prompt-seed-${index}`),
        ),
      )
      expect(prompts.size).toBe(3)
    })
  })

  it('does not turn advanced collection copy into the illustrated story format', () => {
    expect(themeCopy('ca', 'book-club', 'first-seed')).toEqual(
      themeCopy('ca', 'book-club', 'second-seed'),
    )
  })

  it('keeps every story fragment traceable to one useful structured clue', () => {
    const puzzle = generatePuzzleForCollection(
      'hard',
      'illustrated-story-provenance',
      'children',
      undefined,
      8,
    )
    const narrative = buildChildNarrative(puzzle, 'ca')

    expect(narrative.fragments).toHaveLength(puzzle.clues.length)
    expect(new Set(narrative.fragments.map((fragment) => fragment.sourceClueId)).size).toBe(
      puzzle.clues.length,
    )
    narrative.fragments.forEach((fragment) => {
      const source = puzzle.clues.find((clue) => clue.id === fragment.sourceClueId)
      expect(source).toBeDefined()
      expect(fragment.characterIds.length).toBeGreaterThan(0)
      expect(fragment.lead).not.toHaveLength(0)
      expect(wordCount(fragment.lead)).toBeLessThanOrEqual(5)
      expect(
        fragment.parts.map((part) => (part.type === 'text' ? part.text : '')).join(''),
      ).not.toMatch(/\{\w+\}/u)
      const icons = fragment.parts.filter((part) => part.type === 'icon')
      expect(icons).toHaveLength(0)
    })
    narrative.threads.forEach((thread) => {
      expect(thread.fragmentIds.length).toBeGreaterThan(0)
      expect(thread.prompt).toContain(
        puzzle.characters.find((character) => character.id === thread.characterId)?.name,
      )
    })
  })
})
