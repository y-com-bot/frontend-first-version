import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4200',
    viewport: { width: 390, height: 844 },
    launchOptions: { channel: 'msedge' },
    screenshot: 'only-on-failure',
  },
  webServer: { command: 'npm run dev', url: 'http://localhost:4200', reuseExistingServer: true },
});
