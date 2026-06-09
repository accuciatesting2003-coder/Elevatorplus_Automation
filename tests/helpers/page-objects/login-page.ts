import { Page, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class LoginPage extends BasePage {
  private readonly mobileInput = this.page.locator('.form-control').first();
  private readonly passwordInput = this.page.locator('input[type="password"]');
  private readonly loginButton = this.page.getByRole('button', { name: 'Login' });

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/login');
    await this.page.waitForLoadState('networkidle');
  }

  async expectToBeOnLoginPage() {
    await expect(this.mobileInput).toBeVisible({ timeout: 30000 });
  }

  async login(mobile: string, password: string) {
    await this.mobileInput.waitFor({ state: 'visible', timeout: 15000 });

    // If India (+91) is not already selected, switch to it
    const indiaBtn = this.page.getByRole('button', { name: /India:\s*\+\s*91/ });
    const isIndia = await indiaBtn.isVisible({ timeout: 3000 }).catch(() => false);
    if (!isIndia) {
      // Click the country button (it sits as a sibling of the mobile input)
      const countryBtn = this.page.locator('.form-control').first().locator('xpath=..').locator('button').first();
      await countryBtn.click();

      // Search for India
      const searchBox = this.page.getByRole('searchbox', { name: /search/i })
        .or(this.page.locator('input[type="search"]')).first();
      await searchBox.waitFor({ state: 'visible', timeout: 10000 });
      await searchBox.fill('India');

      // Select exactly India (+91) — not "British Indian Ocean Territory" etc.
      const indiaOption = this.page.locator('li')
        .filter({ hasText: /^India\b/ })
        .filter({ hasText: '+91' })
        .first();
      await indiaOption.waitFor({ state: 'visible', timeout: 10000 });
      await indiaOption.click();
      await this.page.waitForTimeout(500);
    }

    // Type mobile number after the country code (+91)
    await this.mobileInput.focus();
    await this.page.keyboard.press('End');
    await this.page.keyboard.type(mobile);

    await this.loginButton.click();

    await this.passwordInput.waitFor({ state: 'visible', timeout: 45000 });
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async loginWithEnvCredentials() {
    const mobile = process.env.MOBILE_NUMBER!;
    const password = process.env.PASSWORD!;
    await this.login(mobile, password);
  }

  /** Dismiss the push-notification popup that may appear right after login. */
  async dismissNotificationPopup() {
    try {
      const maybeLater = this.page.getByRole('button', { name: /Maybe Later/i });
      const visible = await maybeLater.isVisible({ timeout: 6000 }).catch(() => false);
      if (visible) {
        await maybeLater.click();
        return;
      }
      const enableBtn = this.page.getByRole('button', { name: /enable/i });
      const enableVisible = await enableBtn.isVisible({ timeout: 3000 }).catch(() => false);
      if (enableVisible) {
        await enableBtn.click();
      }
    } catch {
      // Popup did not appear – continue normally
    }
  }
}
