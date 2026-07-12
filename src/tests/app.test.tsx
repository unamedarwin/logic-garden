import { render, screen } from '@testing-library/react'
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

vi.mock('../storage/profile', () => ({
  loadProfile: () =>
    Promise.resolve({
      schemaVersion: 1,
      name: 'Aina',
      audience: 'children',
      avatar: 'leaf',
    }),
  saveProfile: vi.fn(),
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
    expect(
      screen.getByRole('dialog', { name: 'De qui necessites una pista?' }),
    ).toBeInTheDocument()
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

  it('returns a placed token to the tray by clicking the token itself', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)
    await user.click(await screen.findByRole('button', { name: 'Juga' }))

    const trayToken = container.querySelector('[data-character-id]') as HTMLButtonElement
    await user.click(trayToken)
    await user.click(screen.getAllByRole('button', { name: /^Mou /u })[0]!)

    const placedToken = screen.getByRole('button', { name: /^Torna a la safata: /u })
    await user.click(placedToken)

    expect(
      screen.queryByRole('button', { name: /^Torna a la safata: /u }),
    ).not.toBeInTheDocument()
    expect(container.querySelector('[data-character-id]')).toBeInTheDocument()
  })

  it('asks which person needs a hint when no person is selected', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(await screen.findByRole('button', { name: 'Juga' }))

    await user.click(screen.getByRole('button', { name: 'Pista' }))
    const dialog = screen.getByRole('dialog', { name: 'De qui necessites una pista?' })
    const person = dialog.querySelector('.hint-character-dialog__choices button')
    if (!person) throw new Error('Expected a person choice in the hint dialog')
    await user.click(person)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(/Pista aplicada/u)
  })
})
