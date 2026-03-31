import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import * as path from 'path';

// Decide which env file to load
const envFile =
  process.env.TEST_ENV === 'prod' ? '.prod.env' : '.dev.env';

// Load env file
dotenv.config({ path: envFile });

// Path to authenticated state
const authFile = path.join(__dirname, '.auth/user.json');

export default defineConfig({
  testDir: './tests',

  // Timeout settings
  timeout: 120 * 1000, // 120 seconds per test (auth setup needs more time)
  expect: {
    timeout: 10 * 1000, // 10 seconds for assertions
  },

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Retry once even in dev for flaky tests
  workers: 1,

  // Multiple reporters for better visibility
  reporter: [
    ['html'],
    ['list'], // Shows progress in terminal
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  use: {
    baseURL: process.env.BASE_URL,
    trace: 'retain-on-failure', // Keep trace on failure for debugging
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true, // Run headless by default (faster)
    viewport: { width: 1920, height: 1080 }, // Standard desktop viewport
    actionTimeout: 15 * 1000, // 15 seconds for actions like click, fill
    navigationTimeout: 60 * 1000, // 60 seconds for page navigation (staging can be slow)
  },

  projects: [
    // Setup project - runs first to authenticate
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // Authenticated tests - reuse the logged-in state
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: authFile, // Reuse authentication state
      },
      dependencies: ['setup'], // Run setup first
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: authFile,
      },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: authFile,
      },
      dependencies: ['setup'],
    },

    // Tests that need to run without authentication (like login tests)
    {
      name: 'chromium-no-auth',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*login\.spec\.ts/, // Only run login tests without auth
    },
  ],
});
