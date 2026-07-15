import { clueReferencesCharacter } from './clueRelations'
import { characterStoryPrompt, themeCopy } from './i18n'
import type { CharacterId, Clue, Locale, Puzzle } from './types'
import { renderClueParts, type CluePart } from './vocabulary'

// cspell:disable -- eu/gl/fr/de copy is covered by locale parity and composition tests.

export type ChildStoryBeat = 'discovery' | 'connection' | 'reveal'

export interface ChildStoryFragment {
  readonly sourceClueId: string
  readonly characterIds: readonly CharacterId[]
  readonly beat: ChildStoryBeat
  readonly lead: string
  readonly parts: readonly CluePart[]
}

export interface ChildStoryThread {
  readonly characterId: CharacterId
  readonly prompt: string
  readonly fragmentIds: readonly string[]
}

export interface ChildNarrative {
  readonly title: string
  readonly introduction: string
  readonly objective: string
  readonly victory: string
  readonly threads: readonly ChildStoryThread[]
  readonly fragments: readonly ChildStoryFragment[]
}

const storyBeatForClue = (clue: Clue): ChildStoryBeat => {
  switch (clue.type) {
    case 'character-at-position':
    case 'character-not-at-position':
    case 'character-in-place':
    case 'character-not-in-place':
    case 'character-next-to-obstacle':
    case 'in-corner':
    case 'not-in-corner':
    case 'has-item':
    case 'does-not-have-item':
    case 'item-in-place':
    case 'item-not-in-place':
      return 'discovery'
    case 'adjacent':
    case 'not-adjacent':
    case 'same-row':
    case 'different-row':
    case 'same-column':
    case 'different-column':
    case 'left-of':
    case 'right-of':
    case 'above':
    case 'below':
    case 'same-floor':
    case 'different-floor':
      return 'connection'
    case 'between':
    case 'distance':
      return 'reveal'
  }
}

const storyBeatCopy: Record<Locale, Record<ChildStoryBeat, string>> = {
  ca: {
    discovery: 'Un record',
    connection: 'Dos records encaixen',
    reveal: 'La peça que faltava',
  },
  es: {
    discovery: 'Un recuerdo',
    connection: 'Dos recuerdos encajan',
    reveal: 'La pieza que faltaba',
  },
  en: {
    discovery: 'A memory',
    connection: 'Two memories fit',
    reveal: 'The missing piece',
  },
  eu: {
    discovery: 'Oroitzapen bat',
    connection: 'Bi oroitzapen bat datoz',
    reveal: 'Falta zen zatia',
  },
  gl: {
    discovery: 'Unha lembranza',
    connection: 'Dúas lembranzas encaixan',
    reveal: 'A peza que faltaba',
  },
  fr: {
    discovery: 'Un souvenir',
    connection: 'Deux souvenirs s’accordent',
    reveal: 'La pièce manquante',
  },
  de: {
    discovery: 'Eine Erinnerung',
    connection: 'Zwei Erinnerungen passen zusammen',
    reveal: 'Das fehlende Stück',
  },
}

export const buildChildNarrative = (puzzle: Puzzle, locale: Locale): ChildNarrative => {
  if (puzzle.boardMode !== 'map') {
    throw new Error('Illustrated narratives require an illustrated map puzzle.')
  }

  const story = themeCopy(locale, puzzle.theme, puzzle.seed, puzzle.characters[0]?.name)
  const fragments = puzzle.clues.map((clue) => {
    const beat = storyBeatForClue(clue)
    return {
      sourceClueId: clue.id,
      characterIds: puzzle.characters
        .filter((character) => clueReferencesCharacter(puzzle, clue, character.id))
        .map((character) => character.id),
      beat,
      lead: storyBeatCopy[locale][beat],
      parts: renderClueParts(puzzle, clue, locale),
    }
  })
  const threads = puzzle.characters.map((character) => ({
    characterId: character.id,
    prompt: characterStoryPrompt(locale, character.name, puzzle.seed),
    fragmentIds: fragments
      .filter((fragment) => fragment.characterIds.includes(character.id))
      .map((fragment) => fragment.sourceClueId),
  }))

  return { ...story, threads, fragments }
}
