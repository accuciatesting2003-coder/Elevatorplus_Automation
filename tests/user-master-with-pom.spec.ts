import { test, expect } from '@fixtures/custom-fixtures';

/**
 * User Master Tests - Using Page Object Model
 *
 * This demonstrates how to use Page Objects and Custom Fixtures
 */

test.describe('User Master - With Page Object Model', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/user-master');
  });

  test('should load user master page', async ({ userMasterPage }) => {
    // Navigate to user master
    await userMasterPage.goto();

    // Verify we're on the correct page
    await userMasterPage.expectToBeOnUserMasterPage();

    console.log('✓ User Master page loaded using POM');
  });

  test('should have search functionality', async ({ userMasterPage }) => {
    await userMasterPage.goto();

    // Expect search input to be visible
    await userMasterPage.expectSearchVisible();

    console.log('✓ Search functionality available');
  });

  test('should have add button', async ({ userMasterPage }) => {
    await userMasterPage.goto();

    // Expect add button to be visible
    await userMasterPage.expectAddButtonVisible();

    console.log('✓ Add button available');
  });
});

test.describe('Employee Master - With Page Object Model', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/employee-master');
  });

  test('should load employee master page', async ({ employeeMasterPage }) => {
    await employeeMasterPage.goto();
    await employeeMasterPage.expectToBeOnEmployeeMasterPage();

    console.log('✓ Employee Master page loaded using POM');
  });
});

test.describe('Department Master - With Page Object Model', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/department-master');
  });

  test('should load department master page', async ({ departmentMasterPage }) => {
    await departmentMasterPage.goto();
    await departmentMasterPage.expectToBeOnDepartmentMasterPage();

    console.log('✓ Department Master page loaded using POM');
  });
});
