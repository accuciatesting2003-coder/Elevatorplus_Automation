import { Page } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * DepartmentMasterPage - Page Object for Department Master functionality
 */
export class DepartmentMasterPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to Department Master page
   */
  async goto() {
    await super.goto('/department-master');
  }

  /**
   * Verify we're on Department Master page
   */
  async expectToBeOnDepartmentMasterPage() {
    await this.expectUrlToContain('/department-master');
  }
}
