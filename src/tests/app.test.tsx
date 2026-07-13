import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { shareUrl } from '../app/routes'
import { seed } from '../domain/types'
import { GENERATOR_VERSION } from '../generator/version'

const dndMock = vi.hoisted(() => ({
  overId: null as string | null,
  onDragStart: undefined as ((event: { active: { id: string } }) => void) | undefined,
  onDragEnd: undefined as
    ((event: { active: { id: string }; over: { id: string } | null }) => void) | undefined,
}))

const profileMock = vi.hoisted(() => ({
  audience: 'children' as 'children' | 'teens' | 'adults',
}))

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({
    children,
    onDragStart,
    onDragEnd,
  }: {
    children: ReactNode
    onDragStart?: (event: { active: { id: string } }) => void
    onDragEnd?: (event: { active: { id: string }; over: { id: string } | null }) => void
  }) => {
    dndMock.onDragStart = onDragStart
    dndMock.onDragEnd = onDragEnd
    return children
  },
  DragOverlay: ({ children }: { children: ReactNode }) => children,
  PointerSensor: class PointerSensor {},
  pointerWithin: vi.fn(),
  useSensor: () => null,
  useSensors: () => [],
  useDraggable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => undefined,
    transform: null,
    isDragging: false,
  }),
  useDroppable: ({ id }: { id: string }) => ({
    setNodeRef: () => undefined,
    isOver: dndMock.overId === id,
  }),
}))

vi.mock('../components/LogicGridArtwork', () => ({
  LogicGridArtwork: () => null,
}))

vi.mock('../pwa/registerServiceWorker', () => ({
  registerServiceWorker: () => ({ dispose: () => undefined }),
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
      audience: profileMock.audience,
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
  beforeEach(() => {
    dndMock.overId = null
    dndMock.onDragStart = undefined
    dndMock.onDragEnd = undefined
    profileMock.audience = 'children'
  })

  it('opens a timed shared mystery with a clear challenge dialog', async () => {
    const user = userEvent.setup()
    const now = vi.spyOn(Date, 'now').mockReturnValue(1_000)
    window.history.replaceState(
      {},
      '',
      shareUrl(
        {
          difficulty: 'easy',
          seed: seed('shared-app-test'),
          generatorVersion: GENERATOR_VERSION,
        },
        'children',
        95,
      ),
    )

    render(<App />)

    const dialog = await screen.findByRole('dialog', { name: 'T’han enviat un misteri' })
    expect(dialog).toHaveTextContent('01:35')
    expect(screen.queryByRole('grid')).not.toBeInTheDocument()
    now.mockReturnValue(9_000)
    await user.click(screen.getByRole('button', { name: 'Accepta el repte' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(await screen.findByRole('grid', { name: 'Mapa del puzzle' })).toBeInTheDocument()
    expect(screen.getByLabelText('Temps')).toHaveTextContent('00:00')
    expect(window.location.search).toBe('')
    now.mockRestore()
  })

  it('plays by keyboard and click, supports undo and provides a solver hint', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)
    await user.click(await screen.findByRole('button', { name: 'Juga' }))

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' })
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
    await user.click(screen.getByRole('button', { name: 'Comprovar' }))
    expect(screen.getByRole('status')).toHaveTextContent(/Encara hi ha algun amic/u)
    await user.click(screen.getByRole('button', { name: 'Configuració' }))
    await user.selectOptions(screen.getByRole('combobox'), 'en')
    expect(await screen.findByRole('button', { name: 'Check' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(/Someone still needs a place/u)
    expect(screen.getByRole('status')).not.toHaveTextContent(/Encara hi ha/u)
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

    await waitFor(() =>
      expect(container.querySelector('[data-character-id]')).toBeInTheDocument(),
    )
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

  it('fits the board by default and only scrolls after explicit zoom', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)
    await user.click(await screen.findByRole('button', { name: 'Juga' }))

    const viewport = container.querySelector('.game-board-scroll')
    const board = await screen.findByRole('grid', { name: 'Mapa del puzzle' })
    expect(viewport).toHaveClass('game-board-scroll--fit')
    expect(board).not.toHaveStyle({ width: '150%' })

    await user.click(screen.getByRole('button', { name: 'Amplia el tauler' }))
    expect(viewport).toHaveClass('game-board-scroll--zoomed')
    expect(board).toHaveStyle({ width: '150%' })

    await user.click(screen.getByRole('button', { name: 'Encaixa' }))
    expect(viewport).toHaveClass('game-board-scroll--fit')
  })

  it('previews the exact drop cell and repositions a placed character', async () => {
    profileMock.audience = 'adults'
    const user = userEvent.setup()
    const { container } = render(<App />)
    await user.click(await screen.findByRole('button', { name: 'Juga' }))

    await waitFor(() =>
      expect(container.querySelector('.character-clue-rail__person')).toBeInTheDocument(),
    )
    const railPerson = container.querySelector(
      '.character-clue-rail__person',
    ) as HTMLButtonElement
    await user.click(railPerson)
    const firstTarget = screen.getAllByRole('button', { name: /^Mou /u })[0]!
    await user.click(firstTarget)

    const placedToken = screen.getByRole('button', { name: /^Torna a la safata: /u })
    const characterId = placedToken.dataset.characterId
    if (!characterId) throw new Error('Expected a draggable character id')

    const targetButtons = Array.from(
      container.querySelectorAll<HTMLButtonElement>('.location-cell__target:not(:disabled)'),
    )
    const secondTarget = targetButtons.find((target) => target.id !== firstTarget.id)
    if (!secondTarget) throw new Error('Expected another valid drop target')
    const positionId = secondTarget.id.replace('grid-target-', '')
    dndMock.overId = `position:${positionId}`

    act(() => dndMock.onDragStart?.({ active: { id: characterId } }))
    expect(screen.getByRole('grid')).toHaveClass('game-board--dragging')
    expect(container.querySelectorAll('.game-board__drop-grid')).toHaveLength(1)
    expect(container.querySelector('.location-cell__drop-preview')).toBeInTheDocument()

    act(() =>
      dndMock.onDragEnd?.({
        active: { id: characterId },
        over: { id: `position:${positionId}` },
      }),
    )

    const movedToken = screen.getByRole('button', { name: /^Torna a la safata: /u })
    expect(
      movedToken.closest('.location-cell')?.querySelector('.location-cell__target'),
    ).toHaveAttribute('id', secondTarget.id)
    expect(container.querySelector('.game-board__drop-grid')).not.toBeInTheDocument()
    expect(container.querySelector('.location-cell__drop-preview')).not.toBeInTheDocument()
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

  it('keeps keyboard focus inside dialogs and restores it after Escape', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(await screen.findByRole('button', { name: 'Juga' }))
    const settingsButton = screen.getByRole('button', { name: 'Configuració' })
    await user.click(settingsButton)

    const dialog = screen.getByRole('dialog', { name: 'Configuració' })
    expect(dialog.querySelector('button')).toHaveFocus()
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog', { name: 'Configuració' })).not.toBeInTheDocument()
    expect(settingsButton).toHaveFocus()
  })
})
