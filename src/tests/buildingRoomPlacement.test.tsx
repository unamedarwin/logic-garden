import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LogicCubeBoard } from '../components/LogicCubeBoard'
import { BUILDING_DEPTHS } from '../domain/buildingPlan'
import { placementDestinations } from '../domain/placements'
import { createGameState, gameReducer } from '../game/gameReducer'
import { generatePuzzle } from '../generator/puzzleGenerator'
import { analyzeDeductionTrace } from '../solver/deductionTrace'
import { countSolutions, solve } from '../solver/solver'
import { renderClue } from '../domain/vocabulary'

describe('room-based building placement', () => {
  it('builds a unique deterministic room puzzle at every height and difficulty', () => {
    for (const audience of ['teens', 'adults'] as const) {
      for (const depth of BUILDING_DEPTHS) {
        const puzzles = (['easy', 'medium', 'hard'] as const).map((difficulty) =>
          generatePuzzle(
            difficulty,
            `room-building-${audience}-${depth}`,
            audience,
            'cube',
            undefined,
            undefined,
            depth,
            'rooms',
          ),
        )
        const pressures = puzzles.map((puzzle) => {
          const trace = analyzeDeductionTrace(puzzle)
          return (
            trace.initialAverageCandidateCount +
            trace.averageCandidateCount +
            trace.averageClueInterpretationLoad +
            trace.branchingMoveCount / Math.max(1, trace.steps.length)
          )
        })
        const signatures = puzzles.map((puzzle) =>
          puzzle.clues
            .map((clue) => `${clue.type}:${clue.id}`)
            .sort()
            .join('|'),
        )

        expect(
          new Set(signatures).size,
          JSON.stringify({ audience, depth, pressures, signatures }),
        ).toBe(3)
        expect(pressures[0], `${audience}/${depth}: ${pressures.join(', ')}`).toBeLessThan(
          pressures[1]!,
        )
        expect(pressures[1], `${audience}/${depth}: ${pressures.join(', ')}`).toBeLessThan(
          pressures[2]!,
        )
        for (const [index, puzzle] of puzzles.entries()) {
          const destinations = placementDestinations(puzzle)
          const solution = solve(puzzle)

          expect(puzzle.buildingPlacement).toBe('rooms')
          expect(puzzle.objective).toBe('Descobreix a quina llar o botiga és cadascú.')
          expect(puzzle.introduction).toMatch(/Residents i botiguers/u)
          expect(destinations).toHaveLength(2 + 4 * (depth - 1))
          expect(
            destinations.filter((position) => position.buildingKind === 'shop'),
          ).toHaveLength(2)
          expect(
            destinations.filter((position) => position.buildingKind === 'home'),
          ).toHaveLength(4 * (depth - 1))
          expect(countSolutions(puzzle, { limit: 2 }), `${audience}/${depth}/${index}`).toBe(1)
          expect(solution).not.toBeNull()
          expect(
            Object.values(solution ?? {}).every((positionId) =>
              destinations.some((position) => position.id === positionId),
            ),
          ).toBe(true)
          expect(
            puzzle.clues.some(
              (clue) =>
                clue.type === 'character-at-position' ||
                clue.type === 'character-not-at-position' ||
                clue.type === 'character-next-to-obstacle' ||
                clue.type === 'in-corner' ||
                clue.type === 'not-in-corner',
            ),
          ).toBe(false)
          expect(
            puzzle.clues.map((clue) => renderClue(puzzle, clue, 'ca')).join(' '),
          ).not.toMatch(/casella|referència/iu)
        }
      }
    }
  }, 240_000)

  it('maps every free visual cell in a room to one canonical destination', () => {
    const puzzle = generatePuzzle(
      'medium',
      'room-canonical-target',
      'adults',
      'cube',
      undefined,
      undefined,
      3,
      'rooms',
    )
    const character = puzzle.characters[0]!
    const destination = placementDestinations(puzzle).find(
      (position) =>
        puzzle.positions.filter(
          (candidate) => !candidate.blocked && candidate.placeId === position.placeId,
        ).length > 1,
    )!
    const otherCell = puzzle.positions.find(
      (position) =>
        !position.blocked &&
        position.placeId === destination.placeId &&
        position.id !== destination.id,
    )!

    const state = gameReducer(createGameState(puzzle), {
      type: 'move-character',
      characterId: character.id,
      positionId: otherCell.id,
    })
    expect(state.assignments[character.id]).toBe(destination.id)
  })

  it('keeps people in different rooms even when their visual cells share an axis', () => {
    const puzzle = generatePuzzle(
      'hard',
      'room-no-axis-conflict',
      'teens',
      'cube',
      undefined,
      undefined,
      3,
      'rooms',
    )
    const destinations = placementDestinations(puzzle)
    const pair = destinations
      .flatMap((first, index) =>
        destinations.slice(index + 1).map((second) => [first, second] as const),
      )
      .find(
        ([first, second]) =>
          first.layer === second.layer &&
          (first.row === second.row || first.column === second.column),
      )!
    const [firstCharacter, secondCharacter] = puzzle.characters
    if (!firstCharacter || !secondCharacter) throw new Error('Expected two people')

    let state = gameReducer(createGameState(puzzle), {
      type: 'move-character',
      characterId: firstCharacter.id,
      positionId: pair[0].id,
    })
    state = gameReducer(state, {
      type: 'move-character',
      characterId: secondCharacter.id,
      positionId: pair[1].id,
    })

    expect(state.assignments[firstCharacter.id]).toBe(pair[0].id)
    expect(state.assignments[secondCharacter.id]).toBe(pair[1].id)
  })

  it('keeps a wrong room hypothesis until an explicit hint corrects it', () => {
    const puzzle = generatePuzzle(
      'medium',
      'room-human-error',
      'adults',
      'cube',
      undefined,
      undefined,
      5,
      'rooms',
    )
    const solution = solve(puzzle)
    const character = puzzle.characters[0]!
    const wrongRoom = placementDestinations(puzzle).find(
      (position) => position.id !== solution?.[character.id],
    )!
    let state = gameReducer(createGameState(puzzle), {
      type: 'move-character',
      characterId: character.id,
      positionId: wrongRoom.id,
    })
    expect(state.assignments[character.id]).toBe(wrongRoom.id)
    expect(state.selectedCharacterId).not.toBe(character.id)

    const checked = gameReducer(state, { type: 'check' })
    expect(checked.assignments).toEqual(state.assignments)
    expect(checked.moves).toBe(state.moves)

    state = gameReducer(checked, { type: 'select-character', characterId: character.id })
    state = gameReducer(state, { type: 'hint' })
    expect(state.assignments[character.id]).toBe(solution?.[character.id])
    expect(state.hintsUsed).toBe(1)
  })

  it('renders one accessible target per visible room and no cell targets', async () => {
    const puzzle = generatePuzzle(
      'easy',
      'room-component',
      'adults',
      'cube',
      undefined,
      undefined,
      3,
      'rooms',
    )
    const first = puzzle.characters[0]!
    const roomPosition = placementDestinations(puzzle).find((position) => position.layer === 1)
    const onMoveToPosition = vi.fn()
    if (!roomPosition) throw new Error('Expected one visible first-floor room target.')
    const { container } = render(
      <LogicCubeBoard
        positions={puzzle.positions}
        characters={puzzle.characters}
        items={puzzle.items}
        buildingPlacement="rooms"
        assignments={{ [first.id]: roomPosition.id }}
        selectedCharacterId={first.id}
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

    expect(container.querySelectorAll('[data-room-target]')).toHaveLength(4)
    const placedRoomToken = container.querySelector('.logic-cube__room-token')
    expect(placedRoomToken).not.toBeNull()
    await waitFor(() => expect(placedRoomToken).toHaveClass('token-spotlight'))
    expect(screen.getByRole('group', { name: 'Edifici: Primer pis' })).toBeInTheDocument()
    expect(screen.queryByRole('grid')).not.toBeInTheDocument()
    expect(
      container.querySelectorAll('.logic-cube__cell .location-cell__target:not(:disabled)'),
    ).toHaveLength(0)
    const roomButtons = screen.getAllByRole('button', { name: /^Mou a/u })
    expect(roomButtons).toHaveLength(4)
    roomButtons[0]!.focus()
    fireEvent.keyDown(roomButtons[0]!, { key: 'ArrowRight' })
    await waitFor(() => expect(document.activeElement).not.toBe(roomButtons[0]))
    fireEvent.click(roomButtons[0]!)
    expect(onMoveToPosition).toHaveBeenCalledOnce()
    fireEvent.click(screen.getByRole('tab', { name: 'Planta baixa' }))
    expect(container.querySelectorAll('[data-room-target]')).toHaveLength(2)
    expect(screen.getAllByRole('button', { name: /^Mou a/u })).toHaveLength(2)
  }, 30_000)
})
