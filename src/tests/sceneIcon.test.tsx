import { render, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SceneIcon } from '../components/SceneIcon'

describe('SceneIcon', () => {
  it('renders reviewed local artwork as a decorative SVG', async () => {
    const { container } = render(<SceneIcon emoji="☕" className="test-icon" />)

    await waitFor(() =>
      expect(container.querySelector('svg[data-scene-icon="☕"]')).not.toBeNull(),
    )
    const svg = container.querySelector('svg[data-scene-icon="☕"]')
    expect(svg).toHaveClass('scene-icon', 'test-icon')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).toHaveAttribute('viewBox', '0 0 32 32')
    expect(svg?.querySelector('path')).not.toBeNull()
  })

  it('keeps an emoji fallback when an icon is outside the bundled catalog', async () => {
    const { container } = render(<SceneIcon emoji="A" />)

    await waitFor(() => expect(container.querySelector('[data-scene-icon="A"]')).not.toBeNull())
    expect(container.querySelector('span[data-scene-icon="A"]')).toHaveTextContent('A')
  })
})
