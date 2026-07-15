import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ChildNarrative } from '../domain/childNarrative'
import { clueReferencesCharacter } from '../domain/clueRelations'
import type { Character, CharacterId, Clue, Locale, PositionId, Puzzle } from '../domain/types'
import { ClueSentence } from './ClueSentence'
import { SceneIcon } from './SceneIcon'

interface CharacterClueRailProps {
  readonly puzzle: Puzzle
  readonly narrative?: ChildNarrative
  readonly assignments: Readonly<Partial<Record<CharacterId, PositionId>>>
  readonly locale: Locale
  readonly selectedCharacterId?: CharacterId
  readonly label: string
  readonly emptyLabel: string
  readonly previousClueLabel: string
  readonly nextClueLabel: string
  readonly onSelect: (character: Character) => void
}

const cluePrecision = (clue: Clue) => {
  switch (clue.type) {
    case 'character-at-position':
      return 0
    case 'character-next-to-obstacle':
    case 'character-in-place':
      return 1
    default:
      return 2
  }
}

const motionSafeScrollBehavior = (): ScrollBehavior => {
  if (typeof window === 'undefined') return 'auto'
  const reducedByPreference =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const reducedInSettings = document.documentElement.dataset.reducedMotion === 'true'
  return reducedByPreference || reducedInSettings ? 'auto' : 'smooth'
}

export const CharacterClueRail = ({
  puzzle,
  narrative,
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
  const contextRef = useRef<HTMLDivElement>(null)
  const peopleRefs = useRef(new Map<CharacterId, HTMLButtonElement>())
  const [clueIndex, setClueIndex] = useState(0)
  const firstCharacterWithClue = puzzle.characters.find((character) =>
    puzzle.clues.some((clue) => clueReferencesCharacter(puzzle, clue, character.id)),
  )
  const activeCharacter =
    puzzle.characters.find((character) => character.id === selectedCharacterId) ??
    firstCharacterWithClue ??
    puzzle.characters[0]
  const activeCharacterId = activeCharacter?.id
  const clues = activeCharacter
    ? puzzle.clues
        .filter((clue) => clueReferencesCharacter(puzzle, clue, activeCharacter.id))
        .toSorted((first, second) => cluePrecision(first) - cluePrecision(second))
    : []

  useEffect(() => {
    // A previous person's long clue list must not hide the next person's first clue.
    setClueIndex(0)
    clueRailRef.current?.scrollTo({ left: 0, behavior: 'auto' })
    if (activeCharacterId) {
      peopleRefs.current.get(activeCharacterId)?.scrollIntoView({
        behavior: motionSafeScrollBehavior(),
        block: 'nearest',
        inline: 'center',
      })
    }
    const ensureContextAboveActions = () => {
      const context = contextRef.current
      const actions = document.querySelector<HTMLElement>('.game-actions')
      if (!context || !actions) return
      const contextBounds = context.getBoundingClientRect()
      const actionsBounds = actions.getBoundingClientRect()
      const overlap = contextBounds.bottom - actionsBounds.top + 12
      if (
        contextBounds.height > 0 &&
        actionsBounds.height > 0 &&
        overlap > 0 &&
        contextBounds.top < window.innerHeight
      ) {
        window.scrollBy({ top: overlap, behavior: 'auto' })
      }
    }
    ensureContextAboveActions()

    let frame = 0
    const scheduleContextCheck = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(ensureContextAboveActions)
    }
    window.addEventListener('scroll', scheduleContextCheck, { passive: true })
    window.addEventListener('resize', scheduleContextCheck)
    window.visualViewport?.addEventListener('scroll', scheduleContextCheck, {
      passive: true,
    })
    window.visualViewport?.addEventListener('resize', scheduleContextCheck)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', scheduleContextCheck)
      window.removeEventListener('resize', scheduleContextCheck)
      window.visualViewport?.removeEventListener('scroll', scheduleContextCheck)
      window.visualViewport?.removeEventListener('resize', scheduleContextCheck)
    }
  }, [activeCharacterId])

  if (!activeCharacter) return null

  const clueRegionId = `character-clues-${activeCharacter.id}`
  const activeLabel =
    narrative?.threads.find((thread) => thread.characterId === activeCharacter.id)?.prompt ??
    activeCharacter.name
  const showClue = (nextIndex: number) => {
    const boundedIndex = Math.max(0, Math.min(clues.length - 1, nextIndex))
    setClueIndex(boundedIndex)
    clueRailRef.current?.children[boundedIndex]?.scrollIntoView({
      behavior: motionSafeScrollBehavior(),
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
                data-character-id={character.id}
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
      <div
        ref={contextRef}
        id={clueRegionId}
        className="character-clue-rail__context"
        aria-live="polite"
      >
        <p className="character-clue-rail__active">
          <SceneIcon
            emoji={activeCharacter.emoji}
            className="character-clue-rail__active-icon"
          />
          <strong>{activeLabel}</strong>
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
              {clues.map((clue) => {
                const fragment = narrative?.fragments.find(
                  (candidate) => candidate.sourceClueId === clue.id,
                )
                return (
                  <p
                    key={clue.id}
                    className="character-clue-rail__clue"
                    data-source-clue-id={fragment?.sourceClueId}
                    data-story-beat={fragment?.beat}
                  >
                    {fragment && (
                      <strong className="character-clue-rail__story-beat">
                        {fragment.lead}:{' '}
                      </strong>
                    )}
                    <ClueSentence puzzle={puzzle} clue={clue} locale={locale} />
                  </p>
                )
              })}
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
