import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  outputDir: 'test-results',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173/logic-garden/',
    viewport: { width: 390, height: 844 },
    locale: 'ca-ES',
    colorScheme: 'light',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'mobile-chromium', use: { browserName: 'chromium' } },
    { name: 'mobile-firefox', use: { browserName: 'firefox' } },
    { name: 'mobile-webkit', use: { browserName: 'webkit' } },
  ],
  webServer: {
    command: 'pnpm run build && pnpm exec vite preview --host 0.0.0.0 --port 4173',
    url: 'http://127.0.0.1:4173/logic-garden/',
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
})
