import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import App from '../App'

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: ReactNode }) => children,
  PointerSensor: class PointerSensor {},
  useSensor: () => null,
  useSensors: () => [],
  useDraggable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => undefined,
    transform: null,
    isDragging: false,
  }),
  useDroppable: () => ({ setNodeRef: () => undefined, isOver: false }),
}))

vi.mock('../pwa/registerServiceWorker', () => ({
  registerServiceWorker: () => () => Promise.resolve(),
}))

vi.mock('../storage/preferences', () => ({
  defaultPreferences: {
    schemaVersion: 1,
    difficulty: 'easy',
    locale: 'ca',
    soundEnabled: false,
    reducedMotion: false,
  },
  loadPreferences: () =>
    Promise.resolve({
      schemaVersion: 1,
      difficulty: 'easy',
      locale: 'ca',
      soundEnabled: false,
      reducedMotion: false,
    }),
  savePreferences: vi.fn(),
}))

vi.mock('../storage/statistics', () => ({
  loadStatistics: () =>
    Promise.resolve({ schemaVersion: 1, completed: 0, hintsUsed: 0, recentSeeds: [] }),
  recordCompletion: vi.fn(),
}))

vi.mock('../storage/savedGame', () => ({
  loadSavedGame: () => Promise.resolve(null),
  saveGame: vi.fn(),
  clearSavedGame: vi.fn(),
}))

describe('game interface', () => {
  it('plays by keyboard and click, supports undo and provides a solver hint', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)
    await user.click(await screen.findByRole('button', { name: 'Juga' }))

    expect(await screen.findByRole('grid', { name: 'Mapa del puzzle' })).toBeInTheDocument()
    const token = container.querySelector('[data-character-id]') as HTMLButtonElement
    token.focus()
    await user.keyboard('{Enter}')
    await user.click(screen.getAllByRole('button', { name: /^Mou /u })[0]!)
    expect(screen.getByRole('button', { name: 'Desfer' })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: 'Comprovar' }))
    expect(await screen.findByRole('status')).toHaveTextContent(/Encara hi ha algun amic/u)
    await user.click(screen.getByRole('button', { name: 'Desfer' }))
    expect(screen.getByRole('button', { name: 'Refer' })).toBeEnabled()
    await user.click(screen.getByRole('button', { name: 'Pista' }))
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('switches the visible interface language without changing the puzzle logic', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(await screen.findByRole('button', { name: 'Juga' }))
    await screen.findByRole('grid', { name: 'Mapa del puzzle' })
    await user.click(screen.getByRole('button', { name: 'Configuració' }))
    await user.selectOptions(screen.getByRole('combobox'), 'en')
    expect(await screen.findByRole('button', { name: 'Check' })).toBeInTheDocument()
  })

  it('returns to the difficulty selector from an active game', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(await screen.findByRole('button', { name: 'Juga' }))
    await screen.findByRole('grid', { name: 'Mapa del puzzle' })

    await user.click(screen.getByRole('button', { name: 'Canvia el nivell' }))

    expect(await screen.findByRole('radio', { name: 'Fàcil · 4 amics' })).toBeChecked()
    expect(screen.getByRole('button', { name: 'Juga' })).toBeInTheDocument()
  })

  it('switches between the compact board and clues views', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(await screen.findByRole('button', { name: 'Juga' }))

    const views = screen.getByRole('navigation', { name: 'Vistes del joc' })
    const boardButton = within(views).getByRole('button', { name: 'Tauler' })
    const cluesButton = within(views).getByRole('button', { name: 'Pistes' })
    await user.click(cluesButton)

    expect(boardButton).toHaveAttribute('aria-pressed', 'false')
    expect(cluesButton).toHaveAttribute('aria-pressed', 'true')
  })
})
