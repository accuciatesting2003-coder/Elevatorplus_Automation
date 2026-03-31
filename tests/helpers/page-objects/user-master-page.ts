import { Page, expect } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * UserMasterPage - Page Object for User Master functionality
 *
 * Encapsulates all interactions with the User Master page
 */
export class UserMasterPage extends BasePage {
  // Common locators for master pages
  private readonly addButton = this.page.getByRole('button', {
    name: /add|create|new/i,
  });
  private readonly searchInput = this.page.getByPlaceholder(/search/i);
  private readonly editButtons = this.page.getByRole('button', {
    name: /edit/i,
  });
  private readonly deleteButtons = this.page.getByRole('button', {
    name: /delete/i,
  });
  private readonly saveButton = this.page.getByRole('button', {
    name: /save|submit/i,
  });
  private readonly cancelButton = this.page.getByRole('button', {
    name: /cancel/i,
  });

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to User Master page
   */
  async goto() {
    await super.goto('/user-master');
  }

  /**
   * Verify we're on User Master page
   */
  async expectToBeOnUserMasterPage() {
    await this.expectUrlToContain('/user-master');
  }

  /**
   * Click Add button to create new user
   */
  async clickAdd() {
    await this.addButton.click();
  }

  /**
   * Search for a user
   */
  async search(searchTerm: string) {
    await this.searchInput.fill(searchTerm);
    await this.wait(1000); // Wait for search results
  }

  /**
   * Click edit button for a specific user
   */
  async clickEdit(index: number = 0) {
    await this.editButtons.nth(index).click();
  }

  /**
   * Click delete button for a specific user
   */
  async clickDelete(index: number = 0) {
    await this.deleteButtons.nth(index).click();
  }

  /**
   * Click save button (in form)
   */
  async clickSave() {
    await this.saveButton.click();
  }

  /**
   * Click cancel button (in form)
   */
  async clickCancel() {
    await this.cancelButton.click();
  }

  /**
   * Fill user form
   * NOTE: Update field names based on actual form
   */
  async fillUserForm(userData: {
    name?: string;
    email?: string;
    mobile?: string;
    role?: string;
  }) {
    if (userData.name) {
      const nameInput = this.page.getByLabel(/name/i);
      await nameInput.fill(userData.name);
    }

    if (userData.email) {
      const emailInput = this.page.getByLabel(/email/i);
      await emailInput.fill(userData.email);
    }

    if (userData.mobile) {
      const mobileInput = this.page.getByLabel(/mobile|phone/i);
      await mobileInput.fill(userData.mobile);
    }

    if (userData.role) {
      const roleSelect = this.page.getByLabel(/role/i);
      await roleSelect.selectOption(userData.role);
    }
  }

  /**
   * Create a new user
   */
  async createUser(userData: {
    name: string;
    email: string;
    mobile: string;
    role?: string;
  }) {
    await this.clickAdd();
    await this.fillUserForm(userData);
    await this.clickSave();
  }

  /**
   * Verify user appears in table
   */
  async expectUserInTable(userName: string) {
    const userRow = this.page.getByText(userName);
    await expect(userRow).toBeVisible();
  }

  /**
   * Get total number of users displayed
   */
  async getUserCount(): Promise<number> {
    const rows = this.page.locator('table tbody tr');
    return await rows.count();
  }

  /**
   * Expect search input to be visible
   */
  async expectSearchVisible() {
    await expect(this.searchInput).toBeVisible();
  }

  /**
   * Expect add button to be visible
   */
  async expectAddButtonVisible() {
    await expect(this.addButton).toBeVisible();
  }
}
