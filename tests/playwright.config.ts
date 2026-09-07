import { defineConfig, devices } from '@playwright/test';

/**
 * The environment is provisioned before Playwright starts (see provision.sh), so there is no
 * webServer block here — the suite always runs against an already-live Jahia.
 *
 * JAHIA_URL defaults to the docker-compose service name; override it to run the suite from your
 * host against a local instance:
 *   JAHIA_URL=http://localhost:8080 npm test
 */
const jahiaUrl = process.env.JAHIA_URL ?? 'http://localhost:8080';

export default defineConfig({
  testDir: './e2e',
  outputDir: './results/artifacts',
  // Search results depend on shared, mutable site content, so specs must not race each other.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Generous: the first search in a page load waits on a real Elasticsearch round-trip.
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: process.env.CI
    ? [['list'], ['junit', { outputFile: 'results/junit.xml' }], ['html', { open: 'never', outputFolder: 'results/report' }]]
    : [['list'], ['html', { open: 'never', outputFolder: 'results/report' }]],
  use: {
    baseURL: jahiaUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
