import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Character, CharacterId, Clue, Locale, PositionId, Puzzle } from '../domain/types'
import { ClueSentence } from './ClueSentence'
import { SceneIcon } from './SceneIcon'

interface CharacterClueRailProps {
  readonly puzzle: Puzzle
  readonly assignments: Readonly<Partial<Record<CharacterId, PositionId>>>
  readonly locale: Locale
  readonly selectedCharacterId?: CharacterId
  readonly label: string
  readonly emptyLabel: string
  readonly previousClueLabel: string
  readonly nextClueLabel: string
  readonly onSelect: (character: Character) => void
}

const clueReferencesCharacter = (clue: Clue, characterId: CharacterId) => {
  switch (clue.type) {
    case 'character-at-position':
    case 'character-not-at-position':
    case 'character-in-place':
    case 'character-not-in-place':
    case 'character-next-to-obstacle':
    case 'has-item':
    case 'does-not-have-item':
      return clue.characterId === characterId
    case 'between':
      return (
        clue.characterId === characterId ||
        clue.firstCharacterId === characterId ||
        clue.secondCharacterId === characterId
      )
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
    case 'distance':
      return clue.firstCharacterId === characterId || clue.secondCharacterId === characterId
  }
}

export const CharacterClueRail = ({
  puzzle,
  assignments,
  locale,
  selectedCharacterId,
  label,
  emptyLabel,
  previousClueLabel,
  nextClueLabel,
  onSelect,
}: CharacterClueRailProps) => {
  const clueRailRef = useRef<HTMLDivElement>(null)
  const peopleRefs = useRef(new Map<CharacterId, HTMLButtonElement>())
  const [clueIndex, setClueIndex] = useState(0)
  const firstCharacterWithClue = puzzle.characters.find((character) =>
    puzzle.clues.some((clue) => clueReferencesCharacter(clue, character.id)),
  )
  const activeCharacter =
    puzzle.characters.find((character) => character.id === selectedCharacterId) ??
    firstCharacterWithClue ??
    puzzle.characters[0]
  const activeCharacterId = activeCharacter?.id
  const clues = activeCharacter
    ? puzzle.clues.filter((clue) => clueReferencesCharacter(clue, activeCharacter.id))
    : []

  useEffect(() => {
    // A previous person's long clue list must not hide the next person's first clue.
    setClueIndex(0)
    clueRailRef.current?.scrollTo({ left: 0, behavior: 'auto' })
    if (activeCharacterId) {
      peopleRefs.current.get(activeCharacterId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }, [activeCharacterId])

  if (!activeCharacter) return null

  const clueRegionId = `character-clues-${activeCharacter.id}`
  const showClue = (nextIndex: number) => {
    const boundedIndex = Math.max(0, Math.min(clues.length - 1, nextIndex))
    setClueIndex(boundedIndex)
    clueRailRef.current?.children[boundedIndex]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    })
  }

  return (
    <section className="character-clue-rail" aria-label={label}>
      <div className="character-clue-rail__people" role="list">
        {puzzle.characters.map((character) => {
          const selected = selectedCharacterId === character.id
          const placed = assignments[character.id] !== undefined
          return (
            <div key={character.id} role="listitem">
              <button
                ref={(node) => {
                  if (node) peopleRefs.current.set(character.id, node)
                  else peopleRefs.current.delete(character.id)
                }}
                type="button"
                className={`character-clue-rail__person ${selected ? 'character-clue-rail__person--selected' : ''} ${placed ? 'character-clue-rail__person--placed' : ''}`}
                aria-pressed={selected}
                aria-controls={clueRegionId}
                onClick={() => onSelect(character)}
              >
                <span className="character-clue-rail__emoji" aria-hidden="true">
                  <SceneIcon emoji={character.emoji} />
                </span>
                <span>{character.name}</span>
              </button>
            </div>
          )
        })}
      </div>
      <div id={clueRegionId} className="character-clue-rail__context" aria-live="polite">
        <p className="character-clue-rail__active">
          <SceneIcon
            emoji={activeCharacter.emoji}
            className="character-clue-rail__active-icon"
          />
          <strong>{activeCharacter.name}</strong>
        </p>
        {clues.length > 0 ? (
          <>
            <div className="character-clue-rail__navigation">
              <span aria-live="polite">
                {clueIndex + 1} / {clues.length}
              </span>
              <button
                type="button"
                aria-label={previousClueLabel}
                disabled={clueIndex === 0}
                onClick={() => showClue(clueIndex - 1)}
              >
                <ChevronLeft aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label={nextClueLabel}
                disabled={clueIndex === clues.length - 1}
                onClick={() => showClue(clueIndex + 1)}
              >
                <ChevronRight aria-hidden="true" />
              </button>
            </div>
            <div ref={clueRailRef} className="character-clue-rail__clues">
              {clues.map((clue) => (
                <p key={clue.id} className="character-clue-rail__clue">
                  <ClueSentence puzzle={puzzle} clue={clue} locale={locale} />
                </p>
              ))}
            </div>
          </>
        ) : (
          <p className="character-clue-rail__clue character-clue-rail__clue--empty">
            {emptyLabel}
          </p>
        )}
      </div>
    </section>
  )
}
