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
      registerType: 'autoUpdate',
      includeAssets: ['offline.html', 'icon-192.svg', 'icon-512.svg'],
      manifest: pwaManifest,
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
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
