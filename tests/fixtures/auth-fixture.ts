import { test as base, BrowserContext, Page } from '@playwright/test';
import { LoginPage } from '@page-objects/login-page';

/**
 * Logs in once per worker and shares the authenticated page across every test
 * in that worker. With workers: 1 this means exactly 1 login for the whole run.
 *
 * The browser CONTEXT (cookies + localStorage) survives test failures, so the
 * next test always navigates as an authenticated user — no re-login on failure.
 */
export const test = base.extend<{ page: Page }, { workerPage: Page }>({

  workerPage: [async ({ browser }, use) => {
    const context: BrowserContext = await browser.newContext();
    const page: Page = await context.newPage();

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.expectToBeOnLoginPage();
    await loginPage.loginWithEnvCredentials();

    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await loginPage.dismissNotificationPopup();

    await use(page);
    await context.close();
  }, { scope: 'worker' }],

  // Every test in this worker gets the SAME page instance
  page: async ({ workerPage }, use) => {
    await use(workerPage);
  },
});

export { expect } from '@playwright/test';
