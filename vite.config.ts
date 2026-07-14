import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'
import { pwaManifest } from './src/pwa/manifest'

// https://vite.dev/config/
export default defineConfig({
  base: '/logic-garden/',
  build: {
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          const path = id.replaceAll('\\\\', '/')

          if (
            path.includes('/node_modules/react/') ||
            path.includes('/node_modules/react-dom/')
          ) {
            return 'react-vendor'
          }
          if (path.includes('/node_modules/@dnd-kit/')) return 'drag-vendor'
          if (path.includes('/node_modules/lucide-react/')) return 'ui-icons'
          if (
            path.includes('/node_modules/fflate/') ||
            path.includes('/node_modules/idb-keyval/') ||
            path.includes('/node_modules/workbox-window/')
          ) {
            return 'app-utilities'
          }
          if (path.endsWith('/src/assets/generated/puzzleTemplateData.ts')) {
            return 'puzzle-catalog'
          }
          if (
            path.endsWith('/src/domain/i18n.ts') ||
            path.endsWith('/src/domain/themeVocabulary.ts') ||
            path.endsWith('/src/domain/vocabulary.ts')
          ) {
            return 'locale-content'
          }

          return undefined
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: pwaManifest,
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: '/logic-garden/index.html',
        globPatterns: ['**/*.{js,css,html,svg,webmanifest}'],
        // The PWA plugin adds manifest icons and the generated manifest explicitly.
        globIgnores: ['**/icon-192.svg', '**/icon-512.svg', '**/manifest.webmanifest'],
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
