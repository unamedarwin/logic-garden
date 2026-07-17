import { render, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { GameBoard } from '../components/GameBoard'
import { generatePuzzle } from '../generator/puzzleGenerator'

describe('placed character spotlight', () => {
  it('highlights the selected placed character on standard boards', async () => {
    const puzzle = generatePuzzle('easy', 'standard-spotlight', 'children')
    const character = puzzle.characters[0]!
    const position = puzzle.positions.find((candidate) => !candidate.blocked)!

    const { container } = render(
      <GameBoard
        positions={puzzle.positions}
        characters={puzzle.characters}
        assignments={{ [character.id]: position.id }}
        selectedCharacterId={character.id}
        onMoveToPosition={vi.fn()}
        onRemoveCharacter={vi.fn()}
        boardLabel="Mapa"
        emptyLabel="Espai lliure"
        returnLabel="Torna a la safata"
        moveToPositionLabel={(label) => `Mou a ${label}`}
        selectPositionLabel={(label) => `Tria ${label}`}
        boardMode={puzzle.boardMode}
        audience="children"
        locale="ca"
        puzzleSeed={puzzle.seed}
        themeId={puzzle.theme}
      />,
    )

    await waitFor(() =>
      expect(
        container.querySelector('.location-cell__token.token-spotlight'),
      ).toBeInTheDocument(),
    )
  })
})
