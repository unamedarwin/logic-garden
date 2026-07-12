import type { ManifestOptions } from 'vite-plugin-pwa'

export const pwaManifest = {
  name: 'Logic Garden - Puzzles de deducció',
  short_name: 'Logic Garden',
  description: 'Puzzles de deducció lògica amables que funcionen sense connexió.',
  lang: 'ca',
  display: 'standalone',
  orientation: 'any',
  theme_color: '#23647c',
  background_color: '#fff8e8',
  scope: '/logic-garden/',
  start_url: '/logic-garden/',
  icons: [
    { src: 'icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
    {
      src: 'icon-512.svg',
      sizes: '512x512',
      type: 'image/svg+xml',
      purpose: 'any maskable',
    },
  ],
} satisfies Partial<ManifestOptions>
