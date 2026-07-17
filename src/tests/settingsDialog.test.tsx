import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SettingsDialog } from '../components/SettingsDialog'
import { defaultPreferences, type Preferences } from '../storage/preferences'

const renderSettings = (preferences: Preferences = defaultPreferences) => {
  const onChange = vi.fn<(preferences: Preferences) => void>()
  const onClose = vi.fn<() => void>()

  render(
    <SettingsDialog
      preferences={preferences}
      onChange={onChange}
      onClose={onClose}
      title="Configuració"
      locale="ca"
    />,
  )

  return { onChange, onClose }
}

describe('settings dialog', () => {
  it('keeps the language selector hidden while Catalan is the only public locale', () => {
    renderSettings()

    expect(screen.getByRole('dialog', { name: 'Configuració' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Idioma')).not.toBeInTheDocument()
  })

  it('reports preference changes without mutating unrelated options', async () => {
    const user = userEvent.setup()
    const { onChange } = renderSettings({
      ...defaultPreferences,
      reducedMotion: false,
      soundEnabled: false,
      showCheckProgress: true,
    })

    await user.click(screen.getByLabelText('Redueix les animacions'))
    await user.click(screen.getByLabelText('So suau'))
    await user.click(screen.getByLabelText('Mostra quantes persones estan ben ubicades'))

    expect(onChange).toHaveBeenNthCalledWith(1, {
      ...defaultPreferences,
      reducedMotion: true,
      soundEnabled: false,
      showCheckProgress: true,
    })
    expect(onChange).toHaveBeenNthCalledWith(2, {
      ...defaultPreferences,
      reducedMotion: false,
      soundEnabled: true,
      showCheckProgress: true,
    })
    expect(onChange).toHaveBeenNthCalledWith(3, {
      ...defaultPreferences,
      reducedMotion: false,
      soundEnabled: false,
      showCheckProgress: false,
    })
  })

  it('closes from the dialog button', async () => {
    const user = userEvent.setup()
    const { onClose } = renderSettings()

    await user.click(screen.getByRole('button', { name: 'Tancar' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
