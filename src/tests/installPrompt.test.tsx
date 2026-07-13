import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InstallPrompt } from '../components/InstallPrompt'
import { clearInstallPromptEvent } from '../components/installPromptEventStore'

const originalUserAgent = navigator.userAgent

const createInstallEvent = (outcome: 'accepted' | 'dismissed') => {
  const prompt = vi.fn().mockResolvedValue(undefined)
  const event = new Event('beforeinstallprompt')
  Object.defineProperties(event, {
    prompt: { value: prompt },
    userChoice: { value: Promise.resolve({ outcome }) },
  })
  return { event, prompt }
}

const renderInstallPrompt = () =>
  render(<InstallPrompt label="Install Logic Garden" locale="en" prominent />)

beforeEach(() => {
  Object.defineProperty(navigator, 'userAgent', {
    configurable: true,
    value: 'Mozilla/5.0 (Linux; Android 15)',
  })
})

afterEach(() => {
  clearInstallPromptEvent()
  Object.defineProperty(navigator, 'userAgent', {
    configurable: true,
    value: originalUserAgent,
  })
})

describe('InstallPrompt', () => {
  it('keeps the Android install event available across remounts', () => {
    const firstMount = renderInstallPrompt()
    const { event } = createInstallEvent('dismissed')

    act(() => window.dispatchEvent(event))
    expect(screen.getByRole('button', { name: 'Install Logic Garden' })).toBeInTheDocument()

    firstMount.unmount()
    renderInstallPrompt()

    expect(screen.getByRole('button', { name: 'Install Logic Garden' })).toBeInTheDocument()
  })

  it('captures the event while no InstallPrompt is mounted', () => {
    const firstMount = renderInstallPrompt()
    firstMount.unmount()
    const { event } = createInstallEvent('dismissed')

    act(() => window.dispatchEvent(event))
    renderInstallPrompt()

    expect(screen.getByRole('button', { name: 'Install Logic Garden' })).toBeInTheDocument()
  })

  it.each(['accepted', 'dismissed'] as const)(
    'does not reuse an event after the native prompt is %s',
    async (outcome) => {
      const user = userEvent.setup()
      const firstMount = renderInstallPrompt()
      const { event, prompt } = createInstallEvent(outcome)
      act(() => window.dispatchEvent(event))

      await user.click(screen.getByRole('button', { name: 'Install Logic Garden' }))
      await waitFor(() => expect(prompt).toHaveBeenCalledOnce())

      firstMount.unmount()
      renderInstallPrompt()

      expect(
        screen.queryByRole('button', { name: 'Install Logic Garden' }),
      ).not.toBeInTheDocument()
    },
  )

  it('uses a fresh event after the native prompt was dismissed', async () => {
    const user = userEvent.setup()
    renderInstallPrompt()
    const first = createInstallEvent('dismissed')
    act(() => window.dispatchEvent(first.event))
    await user.click(screen.getByRole('button', { name: 'Install Logic Garden' }))
    await waitFor(() => expect(first.prompt).toHaveBeenCalledOnce())

    const second = createInstallEvent('dismissed')
    act(() => window.dispatchEvent(second.event))
    await user.click(screen.getByRole('button', { name: 'Install Logic Garden' }))

    expect(first.prompt).toHaveBeenCalledOnce()
    expect(second.prompt).toHaveBeenCalledOnce()
  })
})
