import { Page, expect } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * LoginPage - Page Object for Login functionality
 *
 * Encapsulates all interactions with the login page
 */
export class LoginPage extends BasePage {
  // Locators
  private readonly mobileInput = this.page.locator('.form-control');
  private readonly countrySelector = this.page.getByRole('button', {
    name: /India:\s*\+\s*91/,
  });
  private readonly loginButton = this.page.getByRole('button', {
    name: 'Login',
  });
  private readonly passwordInput = this.page.locator('input[type="password"]');
  private readonly errorAlert = this.page.getByRole('alert');
  private readonly closeAlertButton = this.page.getByRole('button', {
    name: 'close',
  });
  private readonly forgotPasswordLink = this.page.getByRole('link', {
    name: 'Forgot Password?',
  });

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to login page
   */
  async goto() {
    await super.goto('/login');
  }

  /**
   * Verify we're on the login page
   */
  async expectToBeOnLoginPage() {
    await expect(this.page).toHaveTitle('ElevatorPlus');
    await expect(this.mobileInput).toBeVisible();
  }

  /**
   * Enter mobile number
   */
  async enterMobileNumber(mobile: string) {
    await this.mobileInput.focus();
    await this.page.keyboard.press('End');
    await this.page.keyboard.type(mobile);
    await this.wait(500); // Wait for formatting
  }

  /**
   * Enter password
   */
  async enterPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  /**
   * Click login button
   */
  async clickLogin() {
    await this.loginButton.click();
  }

  /**
   * Complete login flow with mobile number and optional password
   */
  async login(mobile: string, password?: string) {
    await this.enterMobileNumber(mobile);
    await this.clickLogin();

    // Wait for response
    await this.wait(3000);

    // If password field appears, enter password
    if (password) {
      const passwordVisible = await this.passwordInput
        .isVisible({ timeout: 3000 })
        .catch(() => false);

      if (passwordVisible) {
        await this.enterPassword(password);
        await this.clickLogin();
        await this.wait(3000);
      }
    }
  }

  /**
   * Login with credentials from environment
   */
  async loginWithEnvCredentials() {
    const mobile = process.env.MOBILE_NUMBER!;
    const password = process.env.PASSWORD!;
    await this.login(mobile, password);
  }

  /**
   * Check if error alert is visible
   */
  async isErrorVisible(): Promise<boolean> {
    return await this.errorAlert.isVisible().catch(() => false);
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string | null> {
    if (await this.isErrorVisible()) {
      return await this.errorAlert.textContent();
    }
    return null;
  }

  /**
   * Expect error message to be visible
   */
  async expectError(errorText?: string) {
    await expect(this.errorAlert).toBeVisible();
    if (errorText) {
      await expect(this.errorAlert).toContainText(errorText);
    }
  }

  /**
   * Dismiss error alert
   */
  async dismissError() {
    if (await this.isErrorVisible()) {
      await this.closeAlertButton.click();
      await expect(this.errorAlert).not.toBeVisible();
    }
  }

  /**
   * Click forgot password link
   */
  async clickForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  /**
   * Select country from dropdown
   */
  async selectCountry(countryName: string) {
    await this.countrySelector.click();
    const listbox = this.page.getByRole('listbox');
    await expect(listbox).toBeVisible();

    const countryOption = this.page.getByRole('option', {
      name: new RegExp(countryName, 'i'),
    });
    await countryOption.click();
  }

  /**
   * Search for country in selector
   */
  async searchCountry(searchTerm: string) {
    await this.countrySelector.click();
    const searchBox = this.page.getByRole('searchbox', { name: 'search' });
    await searchBox.fill(searchTerm);
  }

  /**
   * Expect mobile input to be editable
   */
  async expectMobileInputEditable() {
    await expect(this.mobileInput).toBeEditable();
  }

  /**
   * Expect login button to be visible
   */
  async expectLoginButtonVisible() {
    await expect(this.loginButton).toBeVisible();
  }

  /**
   * Get mobile input value
   */
  async getMobileInputValue(): Promise<string> {
    return await this.mobileInput.inputValue();
  }
}
