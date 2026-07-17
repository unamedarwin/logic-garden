import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LocalCompetitionPanel } from '../components/LocalCompetitionPanel'
import type { LocalCompetitionState } from '../multiplayer/useLocalCompetition'

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
  profile: { id: 'player-1', name: 'Roure A1', avatar: '🌳' },
  participants: [],
  results: [],
  offerCode: '',
  answerCode: '',
  error: '',
}

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

    render(
      <LocalCompetitionPanel
        state={state}
        canStartRound={false}
        onClose={() => undefined}
        onCreateOffer={() => undefined}
        onAcceptOffer={() => undefined}
        onAcceptAnswer={() => undefined}
        onStartRound={() => undefined}
        onReset={() => undefined}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Unir-m’hi' }))
    fireEvent.click(screen.getByRole('button', { name: 'Escanejar invitació' }))

    await waitFor(() => expect(getUserMedia).toHaveBeenCalledOnce())
    expect(getUserMedia).toHaveBeenCalled()
  })
})
