import { Page, expect } from '@playwright/test';

/**
 * BasePage - Foundation for all Page Object Models
 *
 * Contains common methods that all pages can use:
 * - Navigation
 * - Waiting
 * - Common interactions
 */
export class BasePage {
  constructor(protected page: Page) {}

  /**
   * Navigate to a path relative to baseURL
   */
  async goto(path: string) {
    await this.page.goto(path);
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for DOM to be loaded
   */
  async waitForDomLoad() {
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Get current URL
   */
  getUrl(): string {
    return this.page.url();
  }

  /**
   * Check if URL contains a specific string
   */
  async expectUrlToContain(text: string) {
    await expect(this.page).toHaveURL(new RegExp(text));
  }

  /**
   * Wait for a specific time (use sparingly!)
   */
  async wait(ms: number) {
    await this.page.waitForTimeout(ms);
  }

  /**
   * Reload the current page
   */
  async reload() {
    await this.page.reload();
  }

  /**
   * Go back in browser history
   */
  async goBack() {
    await this.page.goBack();
  }

  /**
   * Take a screenshot
   */
  async screenshot(name: string) {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Verify page title
   */
  async expectTitle(title: string) {
    await expect(this.page).toHaveTitle(title);
  }
}
