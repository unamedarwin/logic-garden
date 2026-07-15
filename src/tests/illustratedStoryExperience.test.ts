import { describe, expect, it } from 'vitest'
import { buildChildNarrative, childStoryProgressStage } from '../domain/childNarrative'
import { puzzleCollectionCopy, supportedLocales, themeCopy } from '../domain/i18n'
import {
  buildIllustratedStoryCopy,
  illustratedCharacterStoryChapter,
  illustratedCharacterStoryPrompt,
  illustratedStoryBeatLead,
  type IllustratedStoryBeat,
  type IllustratedThemeId,
  type IllustratedPremiseId,
  type IllustratedThreadRole,
} from '../domain/illustratedStoryCopy'
import type { Clue } from '../domain/types'
import { generatePuzzleForCollection } from '../generator/puzzleGenerator'

// cspell:disable -- these assertions intentionally include public labels from every locale.

const illustratedThemes: readonly IllustratedThemeId[] = [
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

const wordCount = (copy: string) =>
  copy.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu)?.length ?? 0

describe('illustrated adventure experience', () => {
  it('uses an age-neutral public collection name in every locale', () => {
    const ageLabels = /infantil|children|haurrak|enfants|kinder/iu

    supportedLocales.forEach((locale) => {
      const copy = puzzleCollectionCopy(locale, 'children')
      expect(copy.label).not.toMatch(ageLabels)
      expect(copy.description).not.toMatch(ageLabels)
    })
  })

  it('builds many short deterministic mystery arcs from each theme and seed', () => {
    supportedLocales.forEach((locale) => {
      illustratedThemes.forEach((themeId) => {
        const first = themeCopy(locale, themeId, 'same-story-seed', 'Aina')
        expect(themeCopy(locale, themeId, 'same-story-seed', 'Aina')).toEqual(first)
        expect(first.introduction).toContain(first.title)
        expect(first.introduction).toContain('Aina')
        expect(wordCount(first.introduction)).toBeLessThanOrEqual(24)
        expect(wordCount(first.objective)).toBeLessThanOrEqual(14)
        expect(wordCount(first.victory)).toBeLessThanOrEqual(14)

        const stories = Array.from({ length: 100 }, (_, index) =>
          buildIllustratedStoryCopy(
            locale,
            themeId,
            `story-seed-${index}`,
            first.title,
            'Aina',
          ),
        )
        const compatibleVictories: Readonly<Record<string, readonly string[]>> = {
          'locate-friends': ['case-solved', 'last-clue'],
          'fit-places': ['everything-fits', 'case-solved'],
          'follow-clues': ['last-clue', 'story-restored'],
          'recover-story': ['story-restored', 'everything-fits'],
        }
        const compatibleObjectives: Readonly<Record<string, readonly string[]>> = {
          'scrambled-clues': ['fit-places', 'recover-story', 'locate-friends'],
          'missing-detail': ['follow-clues', 'recover-story', 'locate-friends'],
          'mysterious-note': ['follow-clues', 'locate-friends', 'fit-places'],
          'scattered-signs': ['follow-clues', 'locate-friends', 'recover-story'],
          'conflicting-memories': ['fit-places', 'recover-story', 'locate-friends'],
          'hidden-trail': ['follow-clues', 'locate-friends', 'recover-story'],
        }
        stories.forEach((story) => {
          const signature = story.storySignature.split(':')
          const mysteryId = signature.at(-3)
          const objectiveId = signature.at(-2)
          const victoryId = signature.at(-1)
          expect(mysteryId).toBeDefined()
          expect(objectiveId).toBeDefined()
          expect(victoryId).toBeDefined()
          expect(compatibleObjectives[mysteryId!]).toContain(objectiveId)
          expect(compatibleVictories[objectiveId!]).toContain(victoryId)
        })
        const placementLanguage: Readonly<Record<string, RegExp>> = {
          ca: /situa|on era|descobreix/iu,
          es: /coloca|dónde estaba|descubre/u,
          en: /place|where/u,
          eu: /jarri|kokatu|lekua/u,
          gl: /coloca|onde estaba|descubre/u,
          fr: /place|où était|découvre/u,
          de: /Platziere|Ort|Platz/u,
        }
        stories.forEach((story) => {
          expect(story.objective).toMatch(placementLanguage[locale]!)
          if (locale === 'ca') {
            expect(story.introduction).not.toMatch(/de «(?:El|La|Els|Les|L’)/u)
          }
        })
        expect(new Set(stories.map((story) => story.introduction)).size).toBeGreaterThanOrEqual(
          17,
        )
        expect(new Set(stories.map((story) => story.mysteryKind)).size).toBe(6)
        expect(new Set(stories.map((story) => story.premiseId)).size).toBe(3)
        expect(
          new Set(stories.map((story) => story.storySignature)).size,
        ).toBeGreaterThanOrEqual(55)
        const mysteryCounts = stories.reduce<Record<string, number>>((counts, story) => {
          counts[story.mysteryKind] = (counts[story.mysteryKind] ?? 0) + 1
          return counts
        }, {})
        expect(Math.max(...Object.values(mysteryCounts))).toBeLessThanOrEqual(25)
        const normalizedEntropy =
          -Object.values(mysteryCounts).reduce((entropy, count) => {
            const probability = count / stories.length
            return entropy + probability * Math.log(probability)
          }, 0) / Math.log(6)
        expect(normalizedEntropy).toBeGreaterThanOrEqual(0.95)

        const premiseCounts = stories.reduce<Record<IllustratedPremiseId, number>>(
          (counts, story) => ({ ...counts, [story.premiseId]: counts[story.premiseId] + 1 }),
          { trail: 0, surprise: 0, event: 0 },
        )
        expect(Math.max(...Object.values(premiseCounts))).toBeLessThanOrEqual(45)
        const premiseEntropy =
          -Object.values(premiseCounts).reduce((entropy, count) => {
            const probability = count / stories.length
            return entropy + probability * Math.log(probability)
          }, 0) / Math.log(3)
        expect(premiseEntropy).toBeGreaterThanOrEqual(0.9)

        const signatures = supportedLocales.map(
          (candidateLocale) =>
            buildIllustratedStoryCopy(
              candidateLocale,
              themeId,
              'same-story-seed',
              themeCopy(candidateLocale, themeId).title,
              'Aina',
            ).storySignature,
        )
        expect(new Set(signatures).size).toBe(1)
      })
    })
  })

  it('keeps every theme recognizable beyond its title', () => {
    supportedLocales.forEach((locale) => {
      const normalizedIntroductions = illustratedThemes.map((themeId) => {
        const title = themeCopy(locale, themeId).title
        return buildIllustratedStoryCopy(locale, themeId, 'shared-theme-seed', title, 'Aina')
          .introduction.replace(title, '{title}')
          .replace('Aina', '{hero}')
      })
      expect(new Set(normalizedIntroductions).size).toBe(illustratedThemes.length)
    })
  })

  it('gives each logical role four short reproducible character voices', () => {
    const roles: readonly IllustratedThreadRole[] = [
      'witness',
      'connector',
      'finder',
      'skeptic',
    ]
    supportedLocales.forEach((locale) => {
      roles.forEach((role) => {
        const prompt = illustratedCharacterStoryPrompt(
          locale,
          'forest-party',
          'Aina',
          'prompt-seed',
          role,
        )
        expect(
          illustratedCharacterStoryPrompt(locale, 'forest-party', 'Aina', 'prompt-seed', role),
        ).toBe(prompt)
        expect(prompt).toContain('Aina')
        expect(wordCount(prompt)).toBeLessThanOrEqual(10)

        const prompts = new Set(
          Array.from({ length: 100 }, (_, index) =>
            illustratedCharacterStoryPrompt(
              locale,
              'forest-party',
              'Aina',
              `prompt-seed-${index}`,
              role,
            ),
          ),
        )
        expect(prompts.size).toBe(4)
      })
    })
  })

  it('gives every character a short deterministic story thread', () => {
    const puzzle = generatePuzzleForCollection(
      'medium',
      'illustrated-character-threads',
      'children',
      undefined,
      8,
    )
    const semanticThreads = supportedLocales.map((locale) =>
      buildChildNarrative(puzzle, locale)
        .threads.map((thread) => `${thread.characterId}:${thread.arcId}`)
        .join('|'),
    )
    expect(new Set(semanticThreads).size).toBe(1)

    supportedLocales.forEach((locale) => {
      const narrative = buildChildNarrative(puzzle, locale)
      expect(
        new Set(narrative.threads.map((thread) => thread.arcId)).size,
      ).toBeGreaterThanOrEqual(3)
      narrative.threads.forEach((thread) => {
        expect(thread.chapter).toContain(
          puzzle.characters.find((character) => character.id === thread.characterId)?.name,
        )
        expect(thread.chapter).not.toMatch(/[{}]/u)
        expect(wordCount(thread.chapter)).toBeLessThanOrEqual(13)
        expect(thread.chapter).not.toMatch(
          /\b(distance|step|row|column|floor|distància|passos|fila|columna|pis)\b/iu,
        )
        expect(thread.chapter).not.toMatch(
          /\b(final|últim|último|last|azken|derradeiro|dernier|letzt)\b/iu,
        )
      })
    })

    supportedLocales.forEach((locale) => {
      const arcs = new Set(
        Array.from(
          { length: 100 },
          (_, index) =>
            illustratedCharacterStoryChapter(
              locale,
              'forest-party',
              `thread-seed-${index}`,
              `character-${index}`,
              'Aina',
              'El rastre de les garlandes',
            ).arcId,
        ),
      )
      expect(arcs.size).toBe(6)
    })
  })

  it('moves the mystery through four honest stages as hypotheses fill the map', () => {
    expect(childStoryProgressStage(0, 8)).toBe('opening')
    expect(childStoryProgressStage(1, 8)).toBe('gathering')
    expect(childStoryProgressStage(4, 8)).toBe('connecting')
    expect(childStoryProgressStage(8, 8)).toBe('proposal')

    const puzzle = generatePuzzleForCollection(
      'medium',
      'illustrated-progress-stages',
      'children',
      undefined,
      8,
    )
    supportedLocales.forEach((locale) => {
      const narrative = buildChildNarrative(puzzle, locale)
      const stages = Object.values(narrative.progress)
      expect(new Set(stages.map((stage) => stage.label)).size).toBe(4)
      stages.forEach((stage) => {
        expect(stage.label).not.toMatch(/[{}]/u)
        expect(stage.text).not.toMatch(/[{}]/u)
        expect(wordCount(stage.label)).toBeLessThanOrEqual(6)
        expect(wordCount(stage.text)).toBeLessThanOrEqual(12)
      })
      expect(narrative.progress.opening.text).toContain(narrative.subject)
      expect(narrative.progress.proposal.text).not.toMatch(
        /\b(correct|solved|resolt|correcte|resuelto|correcto|gelöst|richtig)\b/iu,
      )
    })
  })

  it('varies every story beat without changing its semantic role', () => {
    const beats: readonly IllustratedStoryBeat[] = ['discovery', 'connection', 'reveal']
    supportedLocales.forEach((locale) => {
      beats.forEach((beat) => {
        const leads = new Set(
          Array.from({ length: 100 }, (_, index) =>
            illustratedStoryBeatLead(locale, 'forest-party', `lead-seed-${index}`, beat, 0),
          ),
        )
        expect(leads.size).toBe(4)
        leads.forEach((lead) => {
          expect(wordCount(lead)).toBeLessThanOrEqual(5)
          expect(lead).not.toMatch(
            /\b(first|primer|primeiro|premier|erstes|lehen|decisiv|erabakigarri|entscheidend|missing|faltava|manquant|fehlend|final|azken)\b/iu,
          )
        })
      })
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

    expect(narrative.storySignature).toMatch(/^.+:[a-z-]+:[a-z-]+:[a-z-]+:[a-z-]+$/u)
    expect(new Set(narrative.fragments.map((fragment) => fragment.beat)).has('reveal')).toBe(
      true,
    )
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
      expect(['witness', 'connector', 'finder', 'skeptic']).toContain(thread.role)
      expect(thread.prompt).toContain(
        puzzle.characters.find((character) => character.id === thread.characterId)?.name,
      )
    })
  })

  it('rejects clue families that do not belong in illustrated stories', () => {
    const puzzle = generatePuzzleForCollection(
      'easy',
      'illustrated-story-rejects-cold-copy',
      'children',
      undefined,
      4,
    )
    const [first, second] = puzzle.characters
    if (!first || !second) throw new Error('The test puzzle needs two characters.')
    const forbiddenClue: Clue = {
      id: 'forbidden-distance',
      phraseVariant: 0,
      type: 'distance',
      firstCharacterId: first.id,
      secondCharacterId: second.id,
      distance: 1,
    }

    expect(() => buildChildNarrative({ ...puzzle, clues: [forbiddenClue] }, 'ca')).toThrow(
      'Unsupported illustrated clue type: distance',
    )
  })
})
