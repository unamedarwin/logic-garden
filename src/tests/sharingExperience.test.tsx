import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ChallengeIntroDialog } from '../components/ChallengeIntroDialog'
import { GameHeader } from '../components/GameHeader'
import { InstallPrompt } from '../components/InstallPrompt'
import { ResultDialog } from '../components/ResultDialog'

const originalUserAgent = navigator.userAgent

afterEach(() => {
  Object.defineProperty(navigator, 'userAgent', {
    configurable: true,
    value: originalUserAgent,
  })
})

describe('shared challenge experience', () => {
  it('keeps the header quiet online and only announces an offline state', () => {
    const { rerender } = render(
      <GameHeader
        online
        connectionLabel="Amb connexió"
        homeLabel="Inici"
        settingsLabel="Configuració"
        onOpenSettings={vi.fn()}
      />,
    )

    expect(screen.queryByText('Amb connexió')).not.toBeInTheDocument()

    rerender(
      <GameHeader
        online={false}
        connectionLabel="Sense connexió"
        homeLabel="Inici"
        settingsLabel="Configuració"
        onOpenSettings={vi.fn()}
      />,
    )

    expect(screen.getByText(/Sense connexió/u)).toBeInTheDocument()
  })

  it('welcomes a first-time player and keeps the challenge action focused', async () => {
    const user = userEvent.setup()
    const onContinue = vi.fn()
    render(
      <ChallengeIntroDialog
        title="T’han enviat un misteri"
        welcome="Et donem la benvinguda a Logic Garden."
        message="Una persona l’ha resolt en 01:35. Podràs millorar-ho?"
        actionLabel="Accepta el repte"
        onContinue={onContinue}
      />,
    )

    const action = screen.getByRole('button', { name: 'Accepta el repte' })
    expect(action).toHaveFocus()
    expect(screen.getByRole('dialog')).toHaveTextContent('benvinguda')
    await user.click(action)
    expect(onContinue).toHaveBeenCalledOnce()
  })

  it('shows the native Android install action on the first visit', async () => {
    const user = userEvent.setup()
    const prompt = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value: 'Mozilla/5.0 (Linux; Android 15)',
    })
    render(<InstallPrompt label="Instal·la Logic Garden" locale="ca" prominent />)

    const installEvent = new Event('beforeinstallprompt')
    Object.defineProperties(installEvent, {
      prompt: { value: prompt },
      userChoice: { value: Promise.resolve({ outcome: 'accepted' }) },
    })
    act(() => window.dispatchEvent(installEvent))

    expect(screen.getByText('Juga també sense connexió')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Instal·la Logic Garden' }))
    expect(prompt).toHaveBeenCalledOnce()
  })

  it('renders a compact return card that is suitable for a screenshot', () => {
    render(
      <ResultDialog
        title="Misteri resolt"
        message="Molt bé!"
        elapsed="01:20"
        moves={8}
        hintsUsed={0}
        challengeMessage="Has superat la marca de 01:35 amb 01:20."
        challengeShareHint="Torna’l a enviar o fes una captura d’aquesta targeta."
        onNewGame={vi.fn()}
        onChangeDifficulty={vi.fn()}
        onShare={vi.fn()}
        newGameLabel="Nova partida"
        changeDifficultyLabel="Canvia el nivell"
        shareLabel="Torna el repte"
        timeLabel="temps"
        movesLabel="moviments"
        hintsLabel="pistes"
      />,
    )

    expect(screen.getByText(/Has superat la marca/u)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Torna el repte' })).toBeInTheDocument()
  })
})
