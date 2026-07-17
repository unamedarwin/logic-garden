import { useDraggable } from '@dnd-kit/core'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  childStoryProgressStage,
  childStoryProgressStages,
  type ChildNarrative,
} from '../domain/childNarrative'
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

interface RailPersonProps {
  readonly character: Character
  readonly selected: boolean
  readonly placed: boolean
  readonly clueRegionId: string
  readonly registerRef: (node: HTMLButtonElement | null) => void
  readonly onSelect: (character: Character) => void
}

const RailPerson = ({
  character,
  selected,
  placed,
  clueRegionId,
  registerRef,
  onSelect,
}: RailPersonProps) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: character.id })
  return (
    <button
      ref={(node) => {
        setNodeRef(node)
        registerRef(node)
      }}
      type="button"
      data-character-id={character.id}
      className={`character-clue-rail__person ${selected ? 'character-clue-rail__person--selected' : ''} ${placed ? 'character-clue-rail__person--placed' : ''} ${isDragging ? 'character-clue-rail__person--dragging' : ''}`}
      {...listeners}
      {...attributes}
      aria-pressed={selected}
      aria-controls={clueRegionId}
      onClick={() => onSelect(character)}
    >
      <span className="character-clue-rail__emoji" aria-hidden="true">
        <SceneIcon emoji={character.emoji} />
      </span>
      <span>{character.name}</span>
    </button>
  )
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
  const peopleRailRef = useRef<HTMLDivElement>(null)
  const clueRailRef = useRef<HTMLDivElement>(null)
  const peopleRefs = useRef(new Map<CharacterId, HTMLButtonElement>())
  const [clueIndex, setClueIndex] = useState(0)
  const firstCharacterWithClue = puzzle.characters.find((character) =>
    puzzle.clues.some((clue) => clueReferencesCharacter(puzzle, clue, character.id)),
  )
  const guidedBuildingCharacter =
    puzzle.boardMode === 'logic-cube' &&
    puzzle.buildingPlacement === 'rooms' &&
    puzzle.difficulty === 'easy'
      ? puzzle.characters.find((character) =>
          puzzle.clues.some(
            (clue) => clue.type === 'character-in-place' && clue.characterId === character.id,
          ),
        )
      : undefined
  const activeCharacter =
    puzzle.characters.find((character) => character.id === selectedCharacterId) ??
    guidedBuildingCharacter ??
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
      const activePerson = peopleRefs.current.get(activeCharacterId)
      const peopleRail = peopleRailRef.current
      if (activePerson && peopleRail) {
        peopleRail.scrollTo({
          left:
            activePerson.offsetLeft - (peopleRail.clientWidth - activePerson.offsetWidth) / 2,
          behavior: motionSafeScrollBehavior(),
        })
      }
    }
  }, [activeCharacterId])

  if (!activeCharacter) return null

  const clueRegionId = `character-clues-${activeCharacter.id}`
  const placedCharacterCount = puzzle.characters.filter(
    (character) => assignments[character.id] !== undefined,
  ).length
  const activeStoryStage = narrative
    ? childStoryProgressStage(placedCharacterCount, puzzle.characters.length)
    : undefined
  const storyProgress = activeStoryStage ? narrative?.progress[activeStoryStage] : undefined
  const storyProgressIndex = activeStoryStage
    ? childStoryProgressStages.indexOf(activeStoryStage)
    : -1
  const showClue = (nextIndex: number) => {
    const boundedIndex = Math.max(0, Math.min(clues.length - 1, nextIndex))
    setClueIndex(boundedIndex)
    const clueRail = clueRailRef.current
    const clueElement = clueRail?.children[boundedIndex]
    if (clueRail && clueElement instanceof HTMLElement) {
      clueRail.scrollTo({
        left: clueElement.offsetLeft,
        behavior: motionSafeScrollBehavior(),
      })
    }
  }

  return (
    <section className="character-clue-rail" aria-label={label}>
      <div ref={peopleRailRef} className="character-clue-rail__people" role="list">
        {puzzle.characters.map((character) => {
          const selected = selectedCharacterId === character.id
          const placed = assignments[character.id] !== undefined
          return (
            <div key={character.id} role="listitem">
              <RailPerson
                character={character}
                selected={selected}
                placed={placed}
                clueRegionId={clueRegionId}
                registerRef={(node) => {
                  if (node) peopleRefs.current.set(character.id, node)
                  else peopleRefs.current.delete(character.id)
                }}
                onSelect={onSelect}
              />
            </div>
          )
        })}
      </div>
      <div id={clueRegionId} className="character-clue-rail__context" aria-live="polite">
        {storyProgress && (
          <div
            className="character-clue-rail__story-progress"
            data-story-stage={activeStoryStage}
          >
            <p>
              <strong>{storyProgress.label}</strong>
              <span>{storyProgress.text}</span>
            </p>
            <div
              className="character-clue-rail__story-meter"
              role="progressbar"
              aria-label={storyProgress.label}
              aria-valuemin={1}
              aria-valuemax={childStoryProgressStages.length}
              aria-valuenow={storyProgressIndex + 1}
              aria-valuetext={storyProgress.label}
            >
              {childStoryProgressStages.map((stage, index) => (
                <span
                  key={stage}
                  className={index <= storyProgressIndex ? 'is-reached' : undefined}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>
        )}
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
