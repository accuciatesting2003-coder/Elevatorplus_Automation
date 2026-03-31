import { test as setup } from '@playwright/test';
import * as path from 'path';
import { LoginPage } from '@page-objects/login-page';

// Path where authentication state will be saved
const authFile = path.join(__dirname, '../../.auth/user.json');

/**
 * Global Setup - Authentication (Refactored with Page Object Model)
 * This runs once before all tests and saves the authenticated session.
 * All other tests will reuse this authentication state, making them faster.
 */
setup('authenticate', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Navigate to login page
  await loginPage.goto();

  // Verify we're on the login page
  await loginPage.expectToBeOnLoginPage();

  // Login with credentials from environment
  await loginPage.loginWithEnvCredentials();

  // Wait until we're redirected away from login page (authenticated)
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30000 });
  await page.waitForLoadState('networkidle');

  // Verify login was successful
  const currentUrl = loginPage.getUrl();
  console.log('✓ Authentication completed. Current URL:', currentUrl);

  // Check cookies
  const cookies = await page.context().cookies();
  console.log(`✓ Saved ${cookies.length} cookies from authenticated session`);

  // Save the authenticated state to file
  await page.context().storageState({ path: authFile });

  console.log('✓ Authentication state saved to:', authFile);
});
