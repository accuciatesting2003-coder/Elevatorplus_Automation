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
    const context: BrowserContext = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page: Page = await context.newPage();

    const loginPage = new LoginPage(page);
    // Retry up to 3 times on transient network/DNS errors at startup
    const NETWORK_ERROR = /ERR_INTERNET_DISCONNECTED|ERR_NETWORK_CHANGED|ERR_NAME_NOT_RESOLVED|Timeout \d+ms exceeded/;
    let lastError: any;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await loginPage.goto();
        lastError = null;
        break;
      } catch (e: any) {
        if (NETWORK_ERROR.test(e.message)) {
          lastError = e;
          await page.waitForTimeout(12000 * attempt);
        } else {
          throw e;
        }
      }
    }
    if (lastError) throw lastError;
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
