import { useEffect, useRef } from 'react'
import { renderClue } from '../domain/vocabulary'
import type { Character, CharacterId, Clue, Locale, PositionId, Puzzle } from '../domain/types'

interface CharacterClueRailProps {
  readonly puzzle: Puzzle
  readonly assignments: Readonly<Partial<Record<CharacterId, PositionId>>>
  readonly locale: Locale
  readonly selectedCharacterId?: CharacterId
  readonly label: string
  readonly emptyLabel: string
  readonly onSelect: (character: Character) => void
}

const clueReferencesCharacter = (clue: Clue, characterId: CharacterId) => {
  switch (clue.type) {
    case 'character-at-position':
    case 'character-not-at-position':
    case 'character-in-place':
    case 'character-not-in-place':
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
  onSelect,
}: CharacterClueRailProps) => {
  const clueRailRef = useRef<HTMLDivElement>(null)
  const firstCharacterWithClue = puzzle.characters.find((character) =>
    puzzle.clues.some((clue) => clueReferencesCharacter(clue, character.id)),
  )
  const activeCharacter =
    puzzle.characters.find((character) => character.id === selectedCharacterId) ??
    firstCharacterWithClue ??
    puzzle.characters[0]

  useEffect(() => {
    // A previous person's long clue list must not hide the next person's first clue.
    clueRailRef.current?.scrollTo({ left: 0, behavior: 'auto' })
  }, [activeCharacter?.id])

  if (!activeCharacter) return null

  const clues = puzzle.clues.filter((clue) => clueReferencesCharacter(clue, activeCharacter.id))
  const clueRegionId = `character-clues-${activeCharacter.id}`

  return (
    <section className="character-clue-rail" aria-label={label}>
      <div className="character-clue-rail__people" role="list">
        {puzzle.characters.map((character) => {
          const selected = selectedCharacterId === character.id
          const previewed = !selectedCharacterId && activeCharacter.id === character.id
          const placed = assignments[character.id] !== undefined
          return (
            <div key={character.id} role="listitem">
              <button
                type="button"
                className={`character-clue-rail__person ${selected ? 'character-clue-rail__person--selected' : ''} ${previewed ? 'character-clue-rail__person--previewed' : ''} ${placed ? 'character-clue-rail__person--placed' : ''}`}
                aria-pressed={selected || previewed}
                aria-controls={clueRegionId}
                onClick={() => {
                  if (!selected) onSelect(character)
                }}
              >
                <span className="character-clue-rail__emoji" aria-hidden="true">
                  {character.emoji}
                </span>
                <span>{character.name}</span>
              </button>
            </div>
          )
        })}
      </div>
      <div id={clueRegionId} className="character-clue-rail__context" aria-live="polite">
        <p className="character-clue-rail__active">
          <span aria-hidden="true">{activeCharacter.emoji}</span>
          <strong>{activeCharacter.name}</strong>
        </p>
        {clues.length > 0 ? (
          <div ref={clueRailRef} className="character-clue-rail__clues">
            {clues.map((clue) => (
              <p key={clue.id} className="character-clue-rail__clue">
                {renderClue(puzzle, clue, locale)}
              </p>
            ))}
          </div>
        ) : (
          <p className="character-clue-rail__clue character-clue-rail__clue--empty">
            {emptyLabel}
          </p>
        )}
      </div>
    </section>
  )
}
