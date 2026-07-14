import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CharacterClueRail } from '../components/CharacterClueRail'
import { characterIds, createPuzzle, positionIds } from './fixtures'

describe('character clue rail', () => {
  const originalScrollTo = HTMLDivElement.prototype.scrollTo
  const originalMatchMedia = window.matchMedia

  afterEach(() => {
    Object.defineProperty(HTMLDivElement.prototype, 'scrollTo', {
      configurable: true,
      value: originalScrollTo,
    })
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: originalMatchMedia,
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
})
