import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { parseSharedGameRoute, shareUrl } from '../app/routes'
import { seed } from '../domain/types'
import { GENERATOR_VERSION } from '../generator/version'

const dndMock = vi.hoisted(() => ({
  overId: null as string | null,
  onDragStart: undefined as ((event: { active: { id: string } }) => void) | undefined,
  onDragEnd: undefined as
    ((event: { active: { id: string }; over: { id: string } | null }) => void) | undefined,
}))
const clipboardWriteText = vi.fn<(url: string) => Promise<void>>(() => Promise.resolve())
const systemShare = vi.fn<(data: ShareData) => Promise<void>>(() => Promise.resolve())

const startDefaultGame = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(await screen.findByRole('button', { name: 'Pas següent' }))
  await user.click(screen.getByRole('button', { name: 'Pas següent' }))
  await user.click(screen.getByRole('button', { name: 'Pas següent' }))
  await user.click(screen.getByRole('button', { name: 'Juga' }))
}

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
    schemaVersion: 5,
    difficulty: 'easy',
    collection: 'children',
    advancedGridSize: 6,
    childMapSize: 4,
    buildingDepth: 3,
    locale: 'ca',
    soundEnabled: false,
    reducedMotion: false,
    showCheckProgress: true,
  },
  loadPreferences: () =>
    Promise.resolve({
      schemaVersion: 5,
      difficulty: 'easy',
      collection: 'children',
      advancedGridSize: 6,
      childMapSize: 4,
      buildingDepth: 3,
      locale: 'ca',
      soundEnabled: false,
      reducedMotion: false,
      showCheckProgress: true,
    }),
  savePreferences: vi.fn(),
}))

vi.mock('../storage/visit', () => ({
  hasVisited: () => Promise.resolve(true),
  markVisited: vi.fn(),
}))

vi.mock('../storage/statistics', () => ({
  loadStatistics: () =>
    Promise.resolve({
      schemaVersion: 4,
      completed: 0,
      hintsUsed: 0,
      recentSeeds: [],
      history: [],
    }),
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
    clipboardWriteText.mockClear()
    systemShare.mockClear()
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: clipboardWriteText },
    })
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: undefined,
    })
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
          childMapSize: 4,
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

  it('shows one setup decision per journey step', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(await screen.findByRole('radio', { name: /^Infantil/u })).toBeInTheDocument()
    expect(screen.queryByRole('radio', { name: /^Fàcil/u })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Aventura/u })).toBeDisabled()
    await user.click(screen.getByRole('radio', { name: /^Puzzles 2D/u }))
    await user.click(screen.getByRole('button', { name: 'Pas següent' }))

    await waitFor(() => expect(screen.getByRole('group', { name: 'Mida' })).toHaveFocus())
    expect(screen.getByRole('radio', { name: /^Petit · 6×6/u })).toBeChecked()
    expect(screen.queryByRole('radio', { name: /^Puzzles 2D/u })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Pas següent' }))

    expect(screen.getByRole('radio', { name: /^Fàcil/u })).toBeChecked()
    expect(screen.getByRole('button', { name: /Aventura/u })).toBeEnabled()
    expect(screen.queryByRole('radio', { name: /^Petit · 6×6/u })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Juga' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Pas següent' }))

    expect(screen.getByRole('group', { name: 'Aventura' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Juga' })).toBeInTheDocument()
  })

  it('starts an explicitly selected easy 16×16 board with eight people', async () => {
    const user = userEvent.setup()
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: systemShare,
    })
    const { container } = render(<App />)

    await user.click(await screen.findByRole('radio', { name: /^Puzzles 2D/u }))
    await user.click(screen.getByRole('button', { name: 'Pas següent' }))
    await user.click(screen.getByRole('radio', { name: /^Gran · 16×16/u }))
    await user.click(screen.getByRole('button', { name: 'Pas següent' }))
    await user.click(screen.getByRole('button', { name: 'Pas següent' }))
    await user.click(screen.getByRole('button', { name: 'Juga' }))

    await waitFor(() =>
      expect(container.querySelector('.game-board')).toHaveAttribute('data-grid-size', '16'),
    )
    expect(container.querySelectorAll('.character-clue-rail__person')).toHaveLength(8)
    await user.click(screen.getByRole('button', { name: 'Compartir' }))
    await waitFor(() => expect(systemShare).toHaveBeenCalledOnce())
    const sharedUrl = systemShare.mock.calls[0]?.[0].url
    if (!sharedUrl) throw new Error('Expected the selected size in a share URL')
    expect(parseSharedGameRoute(new URL(sharedUrl) as unknown as Location)).toMatchObject({
      difficulty: 'easy',
      gridSize: 16,
    })
  }, 15_000)

  it('starts the adventure selected in the fourth setup step', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(await screen.findByRole('radio', { name: /^Puzzles 2D/u }))
    await user.click(screen.getByRole('button', { name: 'Pas següent' }))
    await user.click(screen.getByRole('button', { name: 'Pas següent' }))
    await user.click(screen.getByRole('button', { name: 'Pas següent' }))
    await user.click(screen.getByRole('radio', { name: 'El festival d’esports' }))
    await user.click(screen.getByRole('button', { name: 'Juga' }))

    expect(await screen.findByRole('heading', { name: 'El festival d’esports' })).toBeVisible()
  })

  it('plays by keyboard and click, supports undo and provides a solver hint', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)
    await startDefaultGame(user)

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' })
    expect(await screen.findByRole('grid', { name: 'Mapa del puzzle' })).toBeInTheDocument()
    const token = container.querySelector('[data-character-id]') as HTMLButtonElement
    token.focus()
    await user.keyboard('{Enter}')
    await user.click(screen.getAllByRole('button', { name: /^Mou /u })[0]!)
    expect(screen.getByRole('button', { name: 'Desfer' })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: 'Comprovar' }))
    const checkDialog = await screen.findByRole('dialog', { name: 'Gairebé!' })
    expect(checkDialog).toHaveTextContent(/\d+\/\d+ ben ubicats/u)
    expect(checkDialog.querySelector('.lucide-lightbulb')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Continua jugant' }))
    await user.click(screen.getByRole('button', { name: 'Desfer' }))
    expect(screen.getByRole('button', { name: 'Refer' })).toBeEnabled()
    await user.click(screen.getByRole('button', { name: 'Pista' }))
    expect(
      screen.getByRole('dialog', { name: 'De qui necessites una pista?' }),
    ).toBeInTheDocument()
  })

  it('shows child clues below the people rail and textures every child room', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)
    await startDefaultGame(user)

    const board = await screen.findByRole('grid', { name: 'Mapa del puzzle' })
    expect(board).toHaveClass('game-board--child-map')
    const rooms = container.querySelectorAll<HTMLElement>(
      '.game-board--child-map .location-cell',
    )
    expect(rooms).toHaveLength(4)
    expect(
      Array.from(rooms).every(
        (room) =>
          Boolean(room.dataset.roomMaterial) && room.style.backgroundImage.includes('svg+xml'),
      ),
    ).toBe(true)
    expect(container.querySelector('.tray-wrap')).not.toBeInTheDocument()

    const people = container.querySelectorAll<HTMLButtonElement>('.character-clue-rail__person')
    expect(people).toHaveLength(4)
    await user.click(people[1]!)
    expect(container.querySelector('.character-clue-rail__active strong')).toHaveTextContent(
      people[1]!.textContent ?? '',
    )
    expect(container.querySelector('.character-clue-rail__clue--empty')).not.toBeInTheDocument()
    expect(container.querySelector('.character-clue-rail__clue')).toHaveTextContent(/\S/u)
    expect(container.querySelector('.clue-panel')).not.toHaveAttribute('open')
  })

  it('switches the visible interface language without changing the puzzle logic', async () => {
    const user = userEvent.setup()
    render(<App />)
    await startDefaultGame(user)
    await screen.findByRole('grid', { name: 'Mapa del puzzle' })
    await user.click(screen.getByRole('button', { name: 'Comprovar' }))
    expect(await screen.findByRole('dialog', { name: 'Gairebé!' })).toHaveTextContent(
      /Continua completant/u,
    )
    await user.click(screen.getByRole('button', { name: 'Continua jugant' }))
    await user.click(screen.getByRole('button', { name: 'Configuració' }))
    await user.selectOptions(screen.getByRole('combobox'), 'en')
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(await screen.findByRole('button', { name: 'Check' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Check' }))
    expect(await screen.findByRole('dialog', { name: 'Almost!' })).toHaveTextContent(
      /Keep filling/u,
    )
    expect(screen.getByRole('dialog')).not.toHaveTextContent(/Continua completant/u)
  })

  it('can hide the exact check score without hiding the check dialog', async () => {
    const user = userEvent.setup()
    render(<App />)
    await startDefaultGame(user)
    await user.click(screen.getByRole('button', { name: 'Configuració' }))
    await user.click(
      screen.getByRole('checkbox', {
        name: 'Mostra quantes persones estan ben ubicades',
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Tancar' }))
    await user.click(screen.getByRole('button', { name: 'Comprovar' }))

    const dialog = await screen.findByRole('dialog', { name: 'Gairebé!' })
    expect(dialog).toHaveTextContent('Continua completant el mapa')
    expect(dialog).not.toHaveTextContent(/\d+\/\d+/u)
  })

  it('returns to the difficulty selector from an active game', async () => {
    const user = userEvent.setup()
    render(<App />)
    await startDefaultGame(user)
    await screen.findByRole('grid', { name: 'Mapa del puzzle' })

    await user.click(screen.getByRole('button', { name: 'Canvia el nivell' }))

    expect(
      await screen.findByRole('radio', { name: /^Fàcil · pistes molt clares/u }),
    ).toBeChecked()
    expect(screen.queryByRole('button', { name: 'Juga' })).not.toBeInTheDocument()
  })

  it('moves backward and forward through the journey without losing placements', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)
    await startDefaultGame(user)

    const trayToken = await waitFor(() => {
      const token = container.querySelector('[data-character-id]') as HTMLButtonElement | null
      expect(token).not.toBeNull()
      return token!
    })
    await user.click(trayToken)
    await user.click(screen.getAllByRole('button', { name: /^Mou /u })[0]!)
    const placedCharacterId = screen.getByRole('button', {
      name: /^Torna a la safata: /u,
    }).dataset.characterId

    await user.click(screen.getByRole('button', { name: 'Pas anterior' }))
    expect(screen.queryByRole('grid')).not.toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /^Fàcil/u })).toBeChecked()

    await user.click(screen.getByRole('button', { name: /Aventura/u }))
    await user.click(screen.getByRole('button', { name: 'Reprèn la partida' }))
    expect(await screen.findByRole('grid', { name: 'Mapa del puzzle' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /^Torna a la safata: /u }).dataset.characterId,
    ).toBe(placedCharacterId)
  })

  it('does not resume a suspended game after changing its setup', async () => {
    const user = userEvent.setup()
    render(<App />)
    await startDefaultGame(user)
    await screen.findByRole('grid', { name: 'Mapa del puzzle' })

    await user.click(screen.getByRole('button', { name: 'Canvia el nivell' }))
    await user.click(screen.getByRole('button', { name: /Tipus/u }))
    await user.click(screen.getByRole('radio', { name: /^Puzzles 3D/u }))

    expect(screen.getByRole('button', { name: /Aventura/u })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Pas següent' }))
    await user.click(screen.getByRole('button', { name: 'Pas següent' }))
    await user.click(screen.getByRole('button', { name: 'Pas següent' }))
    expect(screen.getByRole('button', { name: 'Juga' })).toBeInTheDocument()
  })

  it('returns a placed token to the tray by clicking the token itself', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)
    await startDefaultGame(user)

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
    await startDefaultGame(user)

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
    const user = userEvent.setup()
    const { container } = render(<App />)
    await user.click(await screen.findByRole('radio', { name: /^Puzzles 2D/u }))
    await startDefaultGame(user)

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

  it('starts the separate variable-height building collection without a profile', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(await screen.findByRole('radio', { name: /^Infantil/u })).toBeChecked()
    expect(screen.getByRole('radio', { name: /^Puzzles 2D/u })).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: /^Puzzles 3D/u }))
    await user.click(screen.getByRole('button', { name: 'Pas següent' }))
    await user.click(screen.getByRole('radio', { name: '10 plantes' }))
    await user.click(screen.getByRole('button', { name: 'Pas següent' }))
    expect(screen.getByRole('radio', { name: 'Fàcil · 4 veïns guiats' })).toBeChecked()
    await user.click(screen.getByRole('radio', { name: 'Mitjà · 2 veïns guiats' }))
    await user.click(screen.getByRole('button', { name: 'Pas següent' }))
    await user.click(screen.getByRole('button', { name: 'Juga' }))

    expect(
      await screen.findByRole('grid', { name: /Edifici de deducció en 3D:/u }),
    ).toBeInTheDocument()
    expect(screen.getByRole('group', { name: "Ascensor de l'edifici" })).toBeInTheDocument()
    expect(screen.getAllByRole('tab')).toHaveLength(10)
    expect(screen.getAllByRole('gridcell')).toHaveLength(25)
    expect(
      screen.getByRole('heading', {
        name: "Tria una persona i un espai lliure de l'edifici.",
      }),
    ).toBeInTheDocument()
  })

  it('preserves the chosen 2D difficulty while visiting the 3D collection', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(await screen.findByRole('radio', { name: /^Puzzles 2D/u }))
    await user.click(screen.getByRole('button', { name: 'Pas següent' }))
    await user.click(screen.getByRole('radio', { name: /^Gran · 16×16/u }))
    await user.click(screen.getByRole('button', { name: 'Pas següent' }))
    await user.click(screen.getByRole('radio', { name: /^Mitjà/u }))
    await user.click(screen.getByRole('button', { name: 'Pas anterior' }))
    expect(screen.getByRole('radio', { name: /^Gran · 16×16/u })).toBeChecked()
    await user.click(screen.getByRole('button', { name: 'Pas anterior' }))
    await user.click(screen.getByRole('radio', { name: /^Puzzles 3D/u }))
    await user.click(screen.getByRole('radio', { name: /^Puzzles 2D/u }))
    await user.click(screen.getByRole('button', { name: 'Pas següent' }))
    await user.click(screen.getByRole('button', { name: 'Pas següent' }))

    expect(screen.getByRole('radio', { name: /^Mitjà/u })).toBeChecked()
  })

  it('asks which person needs a hint when no person is selected', async () => {
    const user = userEvent.setup()
    render(<App />)
    await startDefaultGame(user)

    await user.click(screen.getByRole('button', { name: 'Pista' }))
    const dialog = screen.getByRole('dialog', { name: 'De qui necessites una pista?' })
    const person = dialog.querySelector('.hint-character-dialog__choices button')
    if (!person) throw new Error('Expected a person choice in the hint dialog')
    await user.click(person)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(/Pista aplicada/u)
  })

  it('shares the reproducible puzzle link before the game is complete', async () => {
    const user = userEvent.setup()
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: clipboardWriteText },
    })
    render(<App />)
    await startDefaultGame(user)

    const hintButton = screen.getByRole('button', { name: 'Pista' })
    const shareButton = screen.getByRole('button', { name: 'Compartir' })
    expect(hintButton).toHaveClass('game-action--hint')
    expect(shareButton).toHaveClass('game-action--share')

    await user.click(shareButton)
    await waitFor(() => expect(clipboardWriteText).toHaveBeenCalledOnce())
    const sharedUrl = clipboardWriteText.mock.calls[0]?.[0]
    if (!sharedUrl) throw new Error('Expected an in-progress share URL')
    expect(parseSharedGameRoute(new URL(sharedUrl) as unknown as Location)).toMatchObject({
      benchmarkSeconds: undefined,
      generatorVersion: GENERATOR_VERSION,
    })
  })

  it('keeps keyboard focus inside dialogs and restores it after Escape', async () => {
    const user = userEvent.setup()
    render(<App />)
    await startDefaultGame(user)
    const settingsButton = screen.getByRole('button', { name: 'Configuració' })
    await user.click(settingsButton)

    const dialog = screen.getByRole('dialog', { name: 'Configuració' })
    expect(dialog.querySelector('button')).toHaveFocus()
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog', { name: 'Configuració' })).not.toBeInTheDocument()
    expect(settingsButton).toHaveFocus()
  })
})
