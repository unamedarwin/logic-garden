import { describe, expect, it } from 'vitest'
import { pwaManifest } from '../pwa/manifest'

describe('PWA manifest', () => {
  it('declares an installable standalone application with maskable icons', () => {
    expect(pwaManifest.display).toBe('standalone')
    expect(pwaManifest.scope).toBe('/logic-garden/')
    expect(pwaManifest.start_url).toBe('/logic-garden/')
    expect(pwaManifest.icons.some((icon) => icon.sizes === '192x192')).toBe(true)
    expect(pwaManifest.icons.some((icon) => icon.purpose.includes('maskable'))).toBe(true)
  })
})
