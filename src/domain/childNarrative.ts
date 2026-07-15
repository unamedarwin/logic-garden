import { clueReferencesCharacter } from './clueRelations'
import { themeCopy } from './i18n'
import {
  buildIllustratedStoryCopy,
  illustratedCharacterStoryChapter,
  illustratedCharacterStoryPrompt,
  illustratedStoryBeatLead,
  illustratedStoryProgressCopy,
  isIllustratedTheme,
  type IllustratedMysteryKind,
  type IllustratedProgressCopy,
  type IllustratedProgressStage,
  type IllustratedStoryBeat,
  type IllustratedThreadArc,
  type IllustratedThreadRole,
} from './illustratedStoryCopy'
import type { CharacterId, Clue, Locale, Puzzle } from './types'
import { renderClueParts, type CluePart } from './vocabulary'

// cspell:disable -- eu/gl/fr/de copy is covered by locale parity and composition tests.

export type ChildStoryBeat = IllustratedStoryBeat

export interface ChildStoryFragment {
  readonly sourceClueId: string
  readonly characterIds: readonly CharacterId[]
  readonly beat: ChildStoryBeat
  readonly lead: string
  readonly parts: readonly CluePart[]
}

export interface ChildStoryThread {
  readonly characterId: CharacterId
  readonly role: IllustratedThreadRole
  readonly arcId: IllustratedThreadArc
  readonly chapter: string
  readonly prompt: string
  readonly fragmentIds: readonly string[]
}

export interface ChildNarrative {
  readonly title: string
  readonly subject: string
  readonly introduction: string
  readonly objective: string
  readonly victory: string
  readonly mysteryKind: IllustratedMysteryKind
  readonly storySignature: string
  readonly progress: Readonly<Record<IllustratedProgressStage, IllustratedProgressCopy>>
  readonly threads: readonly ChildStoryThread[]
  readonly fragments: readonly ChildStoryFragment[]
}

export const childStoryProgressStages = [
  'opening',
  'gathering',
  'connecting',
  'proposal',
] as const satisfies readonly IllustratedProgressStage[]

export const childStoryProgressStage = (
  placedCharacters: number,
  totalCharacters: number,
): IllustratedProgressStage => {
  if (totalCharacters <= 0 || placedCharacters <= 0) return 'opening'
  if (placedCharacters >= totalCharacters) return 'proposal'
  if (placedCharacters * 2 < totalCharacters) return 'gathering'
  return 'connecting'
}

const storyBeatForClue = (clue: Clue, clueIndex: number, clueCount: number): ChildStoryBeat => {
  const closingBeat = clueIndex === clueCount - 1 && clueCount > 1 ? 'reveal' : undefined
  switch (clue.type) {
    case 'character-at-position':
    case 'character-not-at-position':
    case 'character-in-place':
    case 'character-not-in-place':
    case 'character-next-to-obstacle':
    case 'in-corner':
    case 'not-in-corner':
      return closingBeat ?? 'discovery'
    case 'adjacent':
    case 'not-adjacent':
    case 'left-of':
    case 'right-of':
    case 'above':
    case 'below':
      return closingBeat ?? 'connection'
    case 'between':
      return 'reveal'
    case 'has-item':
    case 'does-not-have-item':
    case 'item-in-place':
    case 'item-not-in-place':
    case 'distance':
    case 'same-row':
    case 'different-row':
    case 'same-column':
    case 'different-column':
    case 'same-floor':
    case 'different-floor':
      throw new Error(`Unsupported illustrated clue type: ${clue.type}`)
  }
}

const threadRoleForClues = (clues: readonly Clue[]): IllustratedThreadRole => {
  if (
    clues.some(
      (clue) =>
        clue.type === 'character-not-at-position' ||
        clue.type === 'character-not-in-place' ||
        clue.type === 'not-in-corner' ||
        clue.type === 'not-adjacent',
    )
  ) {
    return 'skeptic'
  }
  if (
    clues.some(
      (clue) =>
        clue.type === 'adjacent' ||
        clue.type === 'left-of' ||
        clue.type === 'right-of' ||
        clue.type === 'above' ||
        clue.type === 'below' ||
        clue.type === 'between',
    )
  ) {
    return 'connector'
  }
  if (
    clues.some(
      (clue) =>
        clue.type === 'character-at-position' ||
        clue.type === 'character-next-to-obstacle' ||
        clue.type === 'in-corner',
    )
  ) {
    return 'finder'
  }
  return 'witness'
}

export const buildChildNarrative = (puzzle: Puzzle, locale: Locale): ChildNarrative => {
  if (puzzle.boardMode !== 'map') {
    throw new Error('Illustrated narratives require an illustrated map puzzle.')
  }
  if (!isIllustratedTheme(puzzle.theme)) {
    throw new Error('Illustrated narratives require an illustrated theme.')
  }
  const themeId = puzzle.theme

  const title = themeCopy(locale, themeId).title
  const story = buildIllustratedStoryCopy(
    locale,
    themeId,
    puzzle.seed,
    title,
    puzzle.characters[0]?.name,
  )
  const progress = {
    opening: illustratedStoryProgressCopy(locale, story.subject, 'opening'),
    gathering: illustratedStoryProgressCopy(locale, story.subject, 'gathering'),
    connecting: illustratedStoryProgressCopy(locale, story.subject, 'connecting'),
    proposal: illustratedStoryProgressCopy(locale, story.subject, 'proposal'),
  } satisfies Readonly<Record<IllustratedProgressStage, IllustratedProgressCopy>>
  const fragments = puzzle.clues.map((clue, clueIndex) => {
    const beat = storyBeatForClue(clue, clueIndex, puzzle.clues.length)
    return {
      sourceClueId: clue.id,
      characterIds: puzzle.characters
        .filter((character) => clueReferencesCharacter(puzzle, clue, character.id))
        .map((character) => character.id),
      beat,
      lead: illustratedStoryBeatLead(locale, themeId, puzzle.seed, beat, clueIndex),
      parts: renderClueParts(puzzle, clue, locale),
    }
  })
  const threads = puzzle.characters.map((character) => {
    const characterClues = puzzle.clues.filter((clue) =>
      clueReferencesCharacter(puzzle, clue, character.id),
    )
    const role = threadRoleForClues(characterClues)
    const chapter = illustratedCharacterStoryChapter(
      locale,
      themeId,
      puzzle.seed,
      character.id,
      character.name,
      story.subject,
    )
    return {
      characterId: character.id,
      role,
      arcId: chapter.arcId,
      chapter: chapter.text,
      prompt: illustratedCharacterStoryPrompt(
        locale,
        themeId,
        character.name,
        puzzle.seed,
        role,
      ),
      fragmentIds: fragments
        .filter((fragment) => fragment.characterIds.includes(character.id))
        .map((fragment) => fragment.sourceClueId),
    }
  })

  return { ...story, progress, threads, fragments }
}
