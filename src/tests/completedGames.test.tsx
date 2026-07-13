import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CompletedGames } from '../components/CompletedGames'
import type { CompletedGame } from '../storage/statistics'

const buildingGame = (generatorVersion: number, id: string): CompletedGame => ({
  id,
  seed: id,
  legacyTitle: 'Edifici',
  audience: 'adults',
  difficulty: 'hard',
  puzzleVariant: 'cube',
  generatorVersion,
  completedAt: 1,
  elapsedSeconds: 90,
  moves: 8,
  hintsUsed: 0,
})

describe('completed building history', () => {
  it('keeps the real building dimensions for old and current records', () => {
    render(
      <CompletedGames
        games={[buildingGame(13, 'old'), buildingGame(14, 'current')]}
        locale="ca"
        title="Partides"
        shareLabel="Comparteix"
        movesLabel="moviments"
        onShare={vi.fn()}
      />,
    )

    expect(screen.getByText('5×5×3 ·')).toBeInTheDocument()
    expect(screen.getByText('5×5×5 ·')).toBeInTheDocument()
  })
})
