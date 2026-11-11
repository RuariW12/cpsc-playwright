import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

// The app URL comes from the .env file (copy .env.example to .env and fill it in).
// Currently tested: Nyle's Python build at https://recall-management-system.onrender.com.
// To test another build with the same Sprint 2 screens, change BASE_URL in .env.
export default defineConfig({
  testDir: './tests',
  globalSetup: './tests/helpers/warm-up.ts',   // wait for the sleeping Render server first
  fullyParallel: false,          // tests share data (TC-15 creates the violation later tests use)
  workers: 1,                    // one at a time, in file order (01 -> 05)
  retries: 0,
  outputDir: 'test-results',
  timeout: 90_000,               // the free Render server can take ~60s to wake up
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: '../results/sprint2/report' }], // pass/fail evidence
    ['json', { outputFile: '../results/sprint2/results.json' }],          // used to build SUMMARY.md
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://recall-management-system.onrender.com',
    navigationTimeout: 60_000,
    screenshot: 'on',            // every test gets an end-state screenshot in the report
    trace: process.env.CI ? 'off' : 'retain-on-failure', // no traces in CI: keeps the committed report small
    video: 'off',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
  ],
});
