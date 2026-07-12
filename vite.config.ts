import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'
import { pwaManifest } from './src/pwa/manifest'

// https://vite.dev/config/
export default defineConfig({
  base: '/logic-garden/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['offline.html', 'icon-192.svg', 'icon-512.svg'],
      manifest: pwaManifest,
      workbox: {
        navigateFallback: '/logic-garden/index.html',
        globPatterns: ['**/*.{js,css,html,svg,webmanifest}'],
      },
      devOptions: { enabled: false },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    css: true,
  },
})
