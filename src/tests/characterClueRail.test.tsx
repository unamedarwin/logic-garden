import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CharacterClueRail } from '../components/CharacterClueRail'
import { characterIds, createPuzzle, positionIds } from './fixtures'

describe('character clue rail', () => {
  const originalScrollTo = HTMLDivElement.prototype.scrollTo

  afterEach(() => {
    Object.defineProperty(HTMLDivElement.prototype, 'scrollTo', {
      configurable: true,
      value: originalScrollTo,
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
        onSelect={() => undefined}
      />
    )
    const { rerender } = render(renderRail())

    rerender(renderRail(characterIds.b))

    expect(scrollTo).toHaveBeenLastCalledWith({ left: 0, behavior: 'auto' })
  })
})
