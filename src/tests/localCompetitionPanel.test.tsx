import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LocalCompetitionPanel } from '../components/LocalCompetitionPanel'
import type { LocalCompetitionState } from '../multiplayer/useLocalCompetition'

// cspell:ignore emparellament

vi.mock('qr-scanner', () => ({
  default: class {
    start() {
      return navigator.mediaDevices.getUserMedia({ video: true })
    }

    destroy() {}
  },
}))

const state: LocalCompetitionState = {
  supported: true,
  role: null,
  lobbyId: null,
  connectionState: 'idle',
  profile: { id: 'player-1', name: 'Roure alegre', avatar: '🌳' },
  participants: [],
  results: [],
  offerCode: '',
  answerCode: '',
  error: '',
}

const handlers = () => ({
  onClose: vi.fn(),
  onCreateOffer: vi.fn(),
  onAcceptOffer: vi.fn(),
  onAcceptAnswer: vi.fn(),
  onStartRound: vi.fn(),
  onConfigureGame: vi.fn(),
  onCancelPairing: vi.fn(),
  onDisconnect: vi.fn(),
})

const connectedState = (role: 'master' | 'participant'): LocalCompetitionState => ({
  ...state,
  role,
  lobbyId: 'lobby-1',
  connectionState: 'connected',
  participants: [
    {
      id: 'player-1',
      name: 'Roure alegre',
      avatar: '🌳',
      role,
      connected: true,
      cumulativeSeconds: 0,
      roundsFinished: 0,
    },
    {
      id: 'player-2',
      name: 'Lluna clara',
      avatar: '🌙',
      role: role === 'master' ? 'participant' : 'master',
      connected: true,
      cumulativeSeconds: 0,
      roundsFinished: 0,
    },
  ],
})

describe('local competition panel', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('requests the camera even without a native BarcodeDetector', async () => {
    const getUserMedia = vi.fn().mockRejectedValue(new Error('camera unavailable'))
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia },
    })
    Reflect.deleteProperty(window, 'BarcodeDetector')

    const actions = handlers()
    render(
      <LocalCompetitionPanel
        state={state}
        canStartRound={false}
        roundInProgress={false}
        {...actions}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Unir-m’hi' }))
    fireEvent.click(screen.getByRole('button', { name: 'Escanejar invitació' }))

    await waitFor(() => expect(getUserMedia).toHaveBeenCalledOnce())
    expect(getUserMedia).toHaveBeenCalled()
  })

  it('keeps closing the dialog separate from closing a connected room', () => {
    const actions = handlers()
    render(
      <LocalCompetitionPanel
        state={connectedState('master')}
        canStartRound
        roundInProgress={false}
        selectedSetupLabel="El club de lectures · 6 × 6 · fàcil"
        {...actions}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Connectat · 2' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Tancar' }))

    expect(actions.onClose).toHaveBeenCalledOnce()
    expect(actions.onDisconnect).not.toHaveBeenCalled()
  })

  it('requires confirmation before the master closes the room', () => {
    const actions = handlers()
    render(
      <LocalCompetitionPanel
        state={connectedState('master')}
        canStartRound
        roundInProgress={false}
        {...actions}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Tancar la sala' }))
    expect(screen.getByRole('alertdialog')).toBeVisible()
    expect(actions.onDisconnect).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Sí, tancar la sala' }))
    expect(actions.onDisconnect).toHaveBeenCalledOnce()
  })

  it('does not expose game configuration or start actions to a participant', () => {
    const actions = handlers()
    render(
      <LocalCompetitionPanel
        state={connectedState('participant')}
        canStartRound={false}
        roundInProgress={false}
        selectedSetupLabel="El club de lectures · 6 × 6 · fàcil"
        {...actions}
      />,
    )

    expect(screen.getByTestId('group-setup-summary')).toHaveTextContent('El club de lectures')
    expect(
      screen.queryByRole('button', { name: /Escollir o canviar/u }),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Jugar amb/u })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Desconnectar-me' })).toBeVisible()
  })

  it('keeps the connected room visible while the master pairs another participant', () => {
    const actions = handlers()
    render(
      <LocalCompetitionPanel
        state={{
          ...connectedState('master'),
          connectionState: 'waiting-answer',
          offerCode: 'offer-code',
        }}
        canStartRound={false}
        roundInProgress={false}
        {...actions}
      />,
    )

    expect(screen.getByText('2 participants connectats')).toBeVisible()
    expect(screen.getByText(/continua connectada/u)).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Cancel·lar l’emparellament' }))
    expect(actions.onCancelPairing).toHaveBeenCalledOnce()
    expect(actions.onDisconnect).not.toHaveBeenCalled()
  })
})
