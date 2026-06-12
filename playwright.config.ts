import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
// Decide which env file to load
const envFile =
  process.env.TEST_ENV === 'prod' ? '.prod.env' : '.dev.env';

// Load env file
dotenv.config({ path: envFile });


export default defineConfig({
  testDir: './tests',
  globalTeardown: './global-teardown',

  // Timeout settings
  timeout: 300 * 1000, // 300 seconds per test (staging can be slow; navigation up to 120s + slow submit operations)
  expect: {
    timeout: 10 * 1000, // 10 seconds for assertions
  },

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0, // No retries locally — keeps the same worker/session alive across failures
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
    navigationTimeout: 120 * 1000, // 120 seconds for page navigation (staging can be slow; login re-attempts need this)
  },

  projects: [
    // Single project — auth-fixture performs one login per worker and shares
    // the authenticated page across all tests. No separate setup step needed.
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Tests that need to run without authentication (like login tests)
    {
      name: 'chromium-no-auth',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*login\.spec\.ts/, // Only run login tests without auth
    },
  ],
});
