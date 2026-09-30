import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://127.0.0.1:4173', headless: true },
  workers: 1,
  webServer: {
    command: process.env.ALGO_PREVIEW === '1'
      ? 'npm run preview -- --port 4173 --strictPort'
      : 'npm run dev -- --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
