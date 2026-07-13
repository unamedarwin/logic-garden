import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LogicCubeBoard } from '../components/LogicCubeBoard'
import { generatePuzzle } from '../generator/puzzleGenerator'

describe('5x5x5 building board', () => {
  it('shows one accessible 5x5 floor and lets the player switch floors', () => {
    const puzzle = generatePuzzle('hard', 'cube-component', 'adults', 'cube')
    const first = puzzle.characters[0]!
    const { container } = render(
      <LogicCubeBoard
        positions={puzzle.positions}
        characters={puzzle.characters}
        items={puzzle.items}
        assignments={{}}
        selectedCharacterId={first.id}
        locale="ca"
        themeId={puzzle.theme}
        puzzleSeed={puzzle.seed}
        boardLabel="Cub de deducció"
        elevatorLabel="Ascensor"
        floorUpLabel="Puja un pis"
        floorDownLabel="Baixa un pis"
        returnLabel="Torna"
        moveToPositionLabel={(label) => `Mou a ${label}`}
        selectPositionLabel={(label) => `Tria ${label}`}
        onMoveToPosition={vi.fn()}
        onRemoveCharacter={vi.fn()}
      />,
    )

    const floorTabs = screen.getAllByRole('tab')
    expect(floorTabs).toHaveLength(5)
    expect(floorTabs.map((tab) => tab.getAttribute('aria-label'))).toEqual([
      'Planta baixa',
      'Primer pis',
      'Segon pis',
      'Tercer pis',
      'Quart pis',
    ])
    expect(screen.getAllByRole('gridcell')).toHaveLength(25)
    expect(container.querySelector('[data-grid-depth="5"]')).toBeInTheDocument()
    expect(screen.getByText('5 plantes · 16 llars')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Ascensor' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Puja un pis' })).toBeEnabled()
    expect(container.querySelectorAll('.logic-cube__door')).toHaveLength(4)
    const furniture = Array.from(
      container.querySelectorAll<HTMLElement>('.logic-cube__furniture'),
    )
    expect(furniture.length).toBeGreaterThan(0)
    expect(
      furniture.some((icon) =>
        puzzle.items.some((item) => item.emoji === icon.dataset.furnitureIcon),
      ),
    ).toBe(false)
    fireEvent.click(screen.getByRole('tab', { name: /Segon pis/u }))
    expect(screen.getAllByRole('gridcell')).toHaveLength(25)
    const groundFloor = screen.getByRole('tab', { name: /Planta baixa/u })
    fireEvent.click(groundFloor)
    expect(container.querySelectorAll('.logic-cube__door')).toHaveLength(2)
    fireEvent.keyDown(groundFloor, { key: 'ArrowRight' })
    expect(screen.getByRole('tab', { name: /Primer pis/u })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('crosses the horizontal, vertical, and depth lines after a placement', () => {
    const puzzle = generatePuzzle('hard', 'cube-three-axes', 'teens', 'cube')
    const first = puzzle.characters[0]!
    const firstPosition = puzzle.positions.find((position) => !position.blocked)!
    const { container } = render(
      <LogicCubeBoard
        positions={puzzle.positions}
        characters={puzzle.characters}
        items={puzzle.items}
        assignments={{ [first.id]: firstPosition.id }}
        selectedCharacterId={first.id}
        locale="ca"
        themeId={puzzle.theme}
        puzzleSeed={puzzle.seed}
        boardLabel="Cub"
        elevatorLabel="Ascensor"
        floorUpLabel="Puja un pis"
        floorDownLabel="Baixa un pis"
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
  })
})
