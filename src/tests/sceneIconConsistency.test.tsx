import { render, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ClueSentence } from '../components/ClueSentence'
import { GridObjectIcons } from '../components/GridObjectIcons'
import { spatialPlanForGrid, spatialPlanForId } from '../domain/spatialPlan'
import { generatePuzzle } from '../generator/puzzleGenerator'

describe('scene icon consistency', () => {
  it('places scalable door icons on shared room boundaries', () => {
    const puzzle = generatePuzzle('easy', 'room-doors', 'teens')
    const sourcePlan = spatialPlanForId(puzzle.spatialPlanId)
    if (!sourcePlan) throw new Error('Expected a spatial plan')
    const size = Math.max(...puzzle.positions.map((position) => position.column)) + 1
    const plan = spatialPlanForGrid(sourcePlan, size, size)
    const { container } = render(
      <GridObjectIcons
        plan={plan}
        positions={puzzle.positions}
        assignments={{}}
        locale="ca"
        themeId={puzzle.theme}
      />,
    )

    expect(
      container.querySelectorAll('.grid-object-icons__door-marker').length,
    ).toBeGreaterThan(0)
    expect(container.querySelector('.grid-object-icons__door-marker svg')).toBeInTheDocument()
    expect(container.querySelector('[class*="door-marker--"]')).not.toBeInTheDocument()
  })

  it('uses the same local SVG key in an exact clue and on the board', async () => {
    const puzzle = generatePuzzle('easy', 'same-scene-icon', 'adults')
    const clue = puzzle.clues.find(
      (candidate) => candidate.type === 'character-next-to-obstacle',
    )
    if (!clue || clue.type !== 'character-next-to-obstacle') {
      throw new Error('Expected an exact obstacle clue')
    }
    const obstacle = puzzle.positions.find(
      (position) => position.id === clue.obstaclePositionId,
    )
    const sourcePlan = spatialPlanForId(puzzle.spatialPlanId)
    if (!obstacle?.obstacleEmoji || !sourcePlan) throw new Error('Expected a scene obstacle')
    const size = Math.max(...puzzle.positions.map((position) => position.column)) + 1
    const plan = spatialPlanForGrid(sourcePlan, size, size)

    const { container } = render(
      <>
        <GridObjectIcons
          plan={plan}
          positions={puzzle.positions}
          assignments={{}}
          locale="ca"
          themeId={puzzle.theme}
        />
        <p className="test-clue">
          <ClueSentence puzzle={puzzle} clue={clue} locale="ca" />
        </p>
      </>,
    )

    await waitFor(() => {
      const boardIcons = Array.from(
        container.querySelectorAll('.grid-object-icons__obstacle [data-scene-icon]'),
      ).map((icon) => icon.getAttribute('data-scene-icon'))
      const clueIcons = Array.from(
        container.querySelectorAll('.test-clue .clue-sentence__icon[data-scene-icon]'),
      ).map((icon) => icon.getAttribute('data-scene-icon'))
      expect(boardIcons).toContain(obstacle.obstacleEmoji)
      expect(clueIcons).toContain(obstacle.obstacleEmoji)
    })
  })
})
