import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LogicCubeBoard } from '../components/LogicCubeBoard'
import { generatePuzzle } from '../generator/puzzleGenerator'

describe('5x5x3 building board', () => {
  it('shows one accessible 5x5 floor and lets the player switch floors', () => {
    const puzzle = generatePuzzle('hard', 'cube-component', 'adults', 'cube')
    const first = puzzle.characters[0]!
    const { container } = render(
      <LogicCubeBoard
        positions={puzzle.positions}
        characters={puzzle.characters}
        assignments={{}}
        selectedCharacterId={first.id}
        locale="ca"
        themeId={puzzle.theme}
        boardLabel="Cub de deducció"
        returnLabel="Torna"
        moveToPositionLabel={(label) => `Mou a ${label}`}
        selectPositionLabel={(label) => `Tria ${label}`}
        onMoveToPosition={vi.fn()}
        onRemoveCharacter={vi.fn()}
      />,
    )

    expect(screen.getAllByRole('tab')).toHaveLength(3)
    expect(screen.getAllByRole('gridcell')).toHaveLength(25)
    expect(container.querySelector('[data-grid-depth="3"]')).toBeInTheDocument()
    expect(screen.getByText('3 plantes · 8 llars')).toBeInTheDocument()
    expect(container.querySelectorAll('.logic-cube__door')).toHaveLength(4)
    fireEvent.click(screen.getByRole('tab', { name: /Segon pis/u }))
    expect(screen.getAllByRole('gridcell')).toHaveLength(25)
    fireEvent.click(screen.getByRole('tab', { name: /Planta baixa/u }))
    expect(container.querySelectorAll('.logic-cube__door')).toHaveLength(2)
  })

  it('crosses the horizontal, vertical, and depth lines after a placement', () => {
    const puzzle = generatePuzzle('hard', 'cube-three-axes', 'teens', 'cube')
    const first = puzzle.characters[0]!
    const firstPosition = puzzle.positions.find((position) => !position.blocked)!
    const { container } = render(
      <LogicCubeBoard
        positions={puzzle.positions}
        characters={puzzle.characters}
        assignments={{ [first.id]: firstPosition.id }}
        selectedCharacterId={first.id}
        locale="ca"
        themeId={puzzle.theme}
        boardLabel="Cub"
        returnLabel="Torna"
        moveToPositionLabel={(label) => `Mou a ${label}`}
        selectPositionLabel={(label) => `Tria ${label}`}
        onMoveToPosition={vi.fn()}
        onRemoveCharacter={vi.fn()}
      />,
    )

    // Eight cells form the horizontal and vertical axes around the placed triple.
    expect(container.querySelectorAll('.location-cell--crossed')).toHaveLength(8)
    expect(container.querySelectorAll('.logic-cube__layer--placed')).toHaveLength(1)

    const otherFloor = firstPosition.layer === 1 ? /Segon pis/u : /Primer pis/u
    fireEvent.click(screen.getByRole('tab', { name: otherFloor }))

    // The same row/column coordinate is projected through the depth axis.
    expect(container.querySelectorAll('.location-cell--crossed')).toHaveLength(1)
    expect(container.querySelectorAll('.logic-cube__layer-preview-cell--crossed')).toHaveLength(
      10,
    )
  })
})
