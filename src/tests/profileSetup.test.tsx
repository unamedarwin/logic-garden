import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ProfileSetup } from '../components/ProfileSetup'

describe('profile setup', () => {
  it('saves a local audience, name, and avatar before play starts', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<ProfileSetup profile={null} locale="ca" onSave={onSave} />)

    await user.click(screen.getByRole('button', { name: /Adolescents/u }))
    await user.type(screen.getByLabelText('Com et dius?'), 'Laia')
    await user.click(screen.getByRole('button', { name: 'Avatar 3' }))
    await user.click(screen.getByRole('button', { name: 'Comença a jugar' }))

    expect(onSave).toHaveBeenCalledWith({
      schemaVersion: 1,
      name: 'Laia',
      audience: 'teens',
      avatar: 'music',
    })
  })
})
