import { test as setup } from '@playwright/test';
import * as path from 'path';
import { LoginPage } from '@page-objects/login-page';

const authFile = path.join(__dirname, '../../.auth/user.json');

/**
 * Global auth setup – runs once before the chromium project tests.
 * Saves cookies + localStorage to .auth/user.json for any spec files
 * that still use the storageState approach.
 *
 * Note: area-master and other specs that use auth-fixture.ts do NOT
 * rely on this file — they maintain a live session in a shared context.
 */
setup('authenticate', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.expectToBeOnLoginPage();
  await loginPage.loginWithEnvCredentials();

  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30000 });
  await page.waitForLoadState('networkidle');
  // Give the React app time to write auth tokens to localStorage before saving
  // storageState — networkidle fires before the app finishes initializing state.
  await page.waitForTimeout(3000);
  await loginPage.dismissNotificationPopup();

  await page.context().storageState({ path: authFile });
  console.log(`✓ Auth state saved to ${authFile}`);
});
