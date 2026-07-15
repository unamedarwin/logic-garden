import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CharacterClueRail } from '../components/CharacterClueRail'
import { buildChildNarrative } from '../domain/childNarrative'
import { characterIds, createPuzzle, fullAssignment, positionIds } from './fixtures'

describe('character clue rail', () => {
  const originalScrollTo = HTMLDivElement.prototype.scrollTo
  const originalMatchMedia = window.matchMedia
  const originalScrollBy = window.scrollBy

  afterEach(() => {
    vi.restoreAllMocks()
    Object.defineProperty(HTMLDivElement.prototype, 'scrollTo', {
      configurable: true,
      value: originalScrollTo,
    })
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: originalMatchMedia,
    })
    Object.defineProperty(window, 'scrollBy', {
      configurable: true,
      value: originalScrollBy,
    })
  })

  it('returns the clues to their first card when the active person changes', () => {
    const scrollTo = vi.fn()
    Object.defineProperty(HTMLDivElement.prototype, 'scrollTo', {
      configurable: true,
      value: scrollTo,
    })
    const puzzle = createPuzzle([
      {
        id: 'a-place',
        type: 'character-at-position',
        characterId: characterIds.a,
        positionId: positionIds.p0,
        phraseVariant: 0,
      },
      {
        id: 'b-place',
        type: 'character-at-position',
        characterId: characterIds.b,
        positionId: positionIds.p1,
        phraseVariant: 0,
      },
    ])
    const renderRail = (selectedCharacterId = characterIds.a) => (
      <CharacterClueRail
        puzzle={puzzle}
        assignments={{}}
        locale="ca"
        selectedCharacterId={selectedCharacterId}
        label="Amics"
        emptyLabel="Sense pistes"
        previousClueLabel="Pista anterior"
        nextClueLabel="Pista següent"
        onSelect={() => undefined}
      />
    )
    const { rerender } = render(renderRail())

    rerender(renderRail(characterIds.b))

    expect(scrollTo).toHaveBeenLastCalledWith({ left: 0, behavior: 'auto' })
  })

  it('shows an exact location before a broader landmark clue for the same person', () => {
    const basePuzzle = createPuzzle()
    const puzzle = {
      ...basePuzzle,
      positions: basePuzzle.positions.map((position) =>
        position.id === positionIds.p1
          ? { ...position, blocked: true, obstacleEmoji: '🌳', obstacleLabel: 'arbre' }
          : position,
      ),
      clues: [
        {
          id: 'a-landmark',
          type: 'character-next-to-obstacle' as const,
          characterId: characterIds.a,
          obstaclePositionId: positionIds.p1,
          phraseVariant: 0,
        },
        {
          id: 'a-exact',
          type: 'character-at-position' as const,
          characterId: characterIds.a,
          positionId: positionIds.p0,
          phraseVariant: 0,
        },
      ],
    }
    const { container } = render(
      <CharacterClueRail
        puzzle={puzzle}
        assignments={{}}
        locale="ca"
        selectedCharacterId={characterIds.a}
        label="Amics"
        emptyLabel="Sense pistes"
        previousClueLabel="Pista anterior"
        nextClueLabel="Pista següent"
        onSelect={() => undefined}
      />,
    )

    const clueCards = container.querySelectorAll('.character-clue-rail__clue')
    expect(clueCards).toHaveLength(2)
    expect(clueCards[0]).toHaveTextContent('l’espai «A»')
    expect(clueCards[1]).toHaveTextContent('al costat de')
  })

  it('uses instant scrolling when reduced motion is requested', () => {
    const scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView')
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockReturnValue({ matches: true }),
    })
    const puzzle = createPuzzle([
      {
        id: 'a-place',
        type: 'character-at-position',
        characterId: characterIds.a,
        positionId: positionIds.p0,
        phraseVariant: 0,
      },
      {
        id: 'a-second-place',
        type: 'character-not-at-position',
        characterId: characterIds.a,
        positionId: positionIds.p1,
        phraseVariant: 0,
      },
    ])

    render(
      <CharacterClueRail
        puzzle={puzzle}
        assignments={{}}
        locale="ca"
        selectedCharacterId={characterIds.a}
        label="Amics"
        emptyLabel="Sense pistes"
        previousClueLabel="Pista anterior"
        nextClueLabel="Pista següent"
        onSelect={() => undefined}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Pista següent' }))

    expect(scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: 'auto', inline: 'start' }),
    )
  })

  it('reveals contextual clues above the fixed action rail', () => {
    const scrollBy = vi.fn()
    Object.defineProperty(window, 'scrollBy', { configurable: true, value: scrollBy })
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockReturnValue({ matches: true }),
    })
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: Element,
    ) {
      if (this instanceof HTMLElement && this.classList.contains('game-actions')) {
        return DOMRect.fromRect({ x: 0, y: 760, width: 390, height: 78 })
      }
      if (
        this instanceof HTMLElement &&
        this.classList.contains('character-clue-rail__context')
      ) {
        return DOMRect.fromRect({ x: 10, y: 700, width: 370, height: 100 })
      }
      return DOMRect.fromRect()
    })
    const puzzle = createPuzzle([
      {
        id: 'a-place',
        type: 'character-at-position',
        characterId: characterIds.a,
        positionId: positionIds.p0,
        phraseVariant: 0,
      },
    ])

    render(
      <>
        <CharacterClueRail
          puzzle={puzzle}
          assignments={{}}
          locale="ca"
          selectedCharacterId={characterIds.a}
          label="Amics"
          emptyLabel="Sense pistes"
          previousClueLabel="Pista anterior"
          nextClueLabel="Pista segÃ¼ent"
          onSelect={() => undefined}
        />
        <div className="game-actions" />
      </>,
    )

    expect(scrollBy).toHaveBeenCalledWith({ top: 52, behavior: 'auto' })
  })

  it('reveals the contextual clue when manual scrolling brings it under the actions', async () => {
    const scrollBy = vi.fn()
    let contextTop = window.innerHeight + 40
    Object.defineProperty(window, 'scrollBy', { configurable: true, value: scrollBy })
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: Element,
    ) {
      if (this instanceof HTMLElement && this.classList.contains('game-actions')) {
        return DOMRect.fromRect({ x: 0, y: 760, width: 390, height: 78 })
      }
      if (
        this instanceof HTMLElement &&
        this.classList.contains('character-clue-rail__context')
      ) {
        return DOMRect.fromRect({ x: 10, y: contextTop, width: 370, height: 100 })
      }
      return DOMRect.fromRect()
    })
    const puzzle = createPuzzle([
      {
        id: 'a-place',
        type: 'character-at-position',
        characterId: characterIds.a,
        positionId: positionIds.p0,
        phraseVariant: 0,
      },
    ])

    render(
      <>
        <CharacterClueRail
          puzzle={puzzle}
          assignments={{}}
          locale="ca"
          selectedCharacterId={characterIds.a}
          label="Amics"
          emptyLabel="Sense pistes"
          previousClueLabel="Pista anterior"
          nextClueLabel="Pista següent"
          onSelect={() => undefined}
        />
        <div className="game-actions" />
      </>,
    )

    expect(scrollBy).not.toHaveBeenCalled()
    contextTop = 700
    fireEvent.scroll(window)

    await waitFor(() => expect(scrollBy).toHaveBeenCalledWith({ top: 52, behavior: 'auto' }))
  })

  it('shows narrative progress without treating a complete proposal as solved', () => {
    const puzzle = createPuzzle([
      {
        id: 'a-place',
        type: 'character-at-position',
        characterId: characterIds.a,
        positionId: positionIds.p0,
        phraseVariant: 0,
      },
      {
        id: 'b-place',
        type: 'character-at-position',
        characterId: characterIds.b,
        positionId: positionIds.p1,
        phraseVariant: 0,
      },
      {
        id: 'c-place',
        type: 'character-at-position',
        characterId: characterIds.c,
        positionId: positionIds.p2,
        phraseVariant: 0,
      },
      {
        id: 'd-place',
        type: 'character-at-position',
        characterId: characterIds.d,
        positionId: positionIds.p3,
        phraseVariant: 0,
      },
    ])
    const narrative = buildChildNarrative(puzzle, 'ca')
    const rail = (assignments: typeof fullAssignment | Partial<typeof fullAssignment>) => (
      <CharacterClueRail
        puzzle={puzzle}
        narrative={narrative}
        assignments={assignments}
        locale="ca"
        selectedCharacterId={characterIds.a}
        label="Amics"
        emptyLabel="Sense pistes"
        previousClueLabel="Pista anterior"
        nextClueLabel="Pista següent"
        onSelect={() => undefined}
      />
    )
    const { container, rerender } = render(rail({}))
    const progress = () => container.querySelector('.character-clue-rail__story-progress')

    expect(progress()).toHaveAttribute('data-story-stage', 'opening')
    rerender(rail({ [characterIds.a]: positionIds.p0 }))
    expect(progress()).toHaveAttribute('data-story-stage', 'gathering')
    rerender(rail({ [characterIds.a]: positionIds.p0, [characterIds.b]: positionIds.p1 }))
    expect(progress()).toHaveAttribute('data-story-stage', 'connecting')
    rerender(rail(fullAssignment))
    expect(progress()).toHaveAttribute('data-story-stage', 'proposal')
    expect(progress()).toHaveTextContent('Comprova si la història encaixa')
    expect(progress()).not.toHaveTextContent(/resolt|correcte/iu)
  })
})
