import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

Object.defineProperty(window, 'scrollTo', {
  configurable: true,
  value: vi.fn(),
})
Object.defineProperty(Element.prototype, 'scrollIntoView', {
  configurable: true,
  value: vi.fn(),
})
Object.defineProperty(Element.prototype, 'scrollTo', {
  configurable: true,
  value: vi.fn(),
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  localStorage.clear()
  window.history.replaceState({}, '', import.meta.env.BASE_URL)
})
