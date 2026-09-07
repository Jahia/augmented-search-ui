import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';

if (existsSync('.env')) process.loadEnvFile();

const jahiaUrl = process.env.JAHIA_URL ?? `http://localhost:${process.env.JAHIA_PORT ?? '8080'}`;

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './tests/results/artifacts',
  // Search results depend on shared, mutable site content, so specs must not race each other.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Generous: the first search in a page load waits on a real Elasticsearch round-trip.
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: process.env.CI
    ? [
        ['list'],
        ['junit', { outputFile: 'tests/results/junit.xml' }],
        ['html', { open: 'never', outputFolder: 'tests/results/report' }],
      ]
    : [['list'], ['html', { open: 'never', outputFolder: 'tests/results/report' }]],
  use: {
    baseURL: jahiaUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: devices['Desktop Chrome'] }],
});
