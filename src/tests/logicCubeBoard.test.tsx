import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LogicCubeBoard } from '../components/LogicCubeBoard'
import { buildingFloorLabel } from '../domain/buildingPlan'
import { shareCubeAxisLine } from '../domain/constraints'
import { generatePuzzle, generatePuzzleDirect } from '../generator/puzzleGenerator'

describe('variable-height 5x5 building board', () => {
  it('shows one accessible 5x5 floor and all ten elevator stops', () => {
    const puzzle = generatePuzzleDirect('hard', 'cube-component', 'adults', {
      boardMode: 'logic-cube',
      gridSize: 5,
      depth: 10,
      characterCount: 8,
    })
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
    expect(floorTabs).toHaveLength(10)
    expect(floorTabs.map((tab) => tab.getAttribute('aria-label'))).toEqual([
      'Planta baixa',
      'Primer pis',
      'Segon pis',
      'Tercer pis',
      'Quart pis',
      'Cinquè pis',
      'Sisè pis',
      'Setè pis',
      'Vuitè pis',
      'Novè pis',
    ])
    expect(screen.getAllByRole('gridcell')).toHaveLength(25)
    expect(container.querySelector('[data-grid-depth="10"]')).toBeInTheDocument()
    expect(screen.getByText('36 llars + 2 botigues')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Ascensor' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Puja un pis' })).toBeEnabled()
    expect(container.querySelectorAll('.logic-cube__door')).toHaveLength(4)
    expect(container.querySelector('[class*="logic-cube__door--"]')).not.toBeInTheDocument()
    const furniture = Array.from(
      container.querySelectorAll<HTMLElement>('.logic-cube__furniture'),
    )
    expect(furniture.length).toBeGreaterThan(0)
    expect(
      furniture.some((icon) =>
        puzzle.items.some((item) => item.emoji === icon.dataset.furnitureIcon),
      ),
    ).toBe(false)
    for (const blockedRoomCell of container.querySelectorAll(
      '.logic-cube__cell--home.location-cell--blocked, .logic-cube__cell--shop.location-cell--blocked',
    )) {
      expect(blockedRoomCell.querySelector('.logic-cube__furniture')).not.toBeNull()
    }
    fireEvent.click(screen.getByRole('tab', { name: /Segon pis/u }))
    expect(screen.getAllByRole('gridcell')).toHaveLength(25)
    const groundFloor = screen.getByRole('tab', { name: /Planta baixa/u })
    fireEvent.click(groundFloor)
    expect(container.querySelectorAll('.logic-cube__door')).toHaveLength(2)
    expect(
      container.querySelectorAll('.logic-cube__cell--shop:not(.location-cell--blocked)'),
    ).toHaveLength(10)
    fireEvent.keyDown(groundFloor, { key: 'ArrowRight' })
    expect(screen.getByRole('tab', { name: /Primer pis/u })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  }, 15_000)

  it('crosses the horizontal, vertical, and depth lines after a placement', () => {
    const puzzle = generatePuzzle('hard', 'cube-three-axes', 'teens', 'cube')
    const first = puzzle.characters[0]!
    const second = puzzle.characters[1]!
    const firstPosition = puzzle.positions.find(
      (position) =>
        !position.blocked &&
        puzzle.positions.some(
          (candidate) =>
            !candidate.blocked &&
            candidate.id !== position.id &&
            shareCubeAxisLine(position, candidate),
        ),
    )!
    const { container } = render(
      <LogicCubeBoard
        positions={puzzle.positions}
        characters={puzzle.characters}
        items={puzzle.items}
        assignments={{ [first.id]: firstPosition.id }}
        selectedCharacterId={second.id}
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

    fireEvent.click(
      screen.getByRole('tab', { name: buildingFloorLabel('ca', firstPosition.layer ?? 0) }),
    )
    // Eight cells form the horizontal and vertical axes around the placed triple.
    expect(container.querySelectorAll('.location-cell--crossed')).toHaveLength(8)
    expect(
      container.querySelector<HTMLButtonElement>(
        '.location-cell--crossed:not(.location-cell--blocked) .location-cell__target',
      ),
    ).toBeEnabled()
    expect(container.querySelectorAll('.logic-cube__layer--placed')).toHaveLength(1)

    const otherFloor = firstPosition.layer === 1 ? /Segon pis/u : /Primer pis/u
    fireEvent.click(screen.getByRole('tab', { name: otherFloor }))

    // The same row/column coordinate is projected through the depth axis.
    expect(container.querySelectorAll('.location-cell--crossed')).toHaveLength(1)
  })

  it('keeps a visually free non-solution cell interactive', () => {
    const puzzle = generatePuzzle(
      'hard',
      '9aa77f1d-ba34-4c96-9767-01dee5543847',
      'adults',
      'cube',
    )
    const estel = puzzle.characters.find((character) => character.name === 'Estel')
    const onMoveToPosition = vi.fn()
    if (!estel) throw new Error('Expected Estel in the shared regression puzzle')

    const { container } = render(
      <LogicCubeBoard
        positions={puzzle.positions}
        characters={puzzle.characters}
        items={puzzle.items}
        assignments={{}}
        selectedCharacterId={estel.id}
        locale="ca"
        themeId={puzzle.theme}
        puzzleSeed={puzzle.seed}
        boardLabel="Edifici"
        elevatorLabel="Ascensor"
        floorUpLabel="Puja un pis"
        floorDownLabel="Baixa un pis"
        returnLabel="Torna"
        moveToPositionLabel={(label) => `Mou a ${label}`}
        selectPositionLabel={(label) => `Tria ${label}`}
        onMoveToPosition={onMoveToPosition}
        onRemoveCharacter={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('tab', { name: 'Tercer pis' }))
    const target = container.querySelector<HTMLButtonElement>('#grid-target-position-3-1-1')
    expect(target).toBeEnabled()
    fireEvent.click(target!)
    expect(onMoveToPosition).toHaveBeenCalledWith('position-3-1-1')
  })
})
