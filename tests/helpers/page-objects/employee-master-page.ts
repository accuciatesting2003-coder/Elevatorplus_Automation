import { Page } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * EmployeeMasterPage - Page Object for Employee Master functionality
 */
export class EmployeeMasterPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to Employee Master page
   */
  async goto() {
    await super.goto('/employee-master');
  }

  /**
   * Verify we're on Employee Master page
   */
  async expectToBeOnEmployeeMasterPage() {
    await this.expectUrlToContain('/employee-master');
  }
}
