import { test as base } from '@playwright/test';
import {
  LoginPage,
  UserMasterPage,
  EmployeeMasterPage,
  DepartmentMasterPage,
} from '@page-objects/index';

/**
 * Custom Fixtures
 *
 * Extends Playwright's base test with page objects and utilities
 */

type CustomFixtures = {
  loginPage: LoginPage;
  userMasterPage: UserMasterPage;
  employeeMasterPage: EmployeeMasterPage;
  departmentMasterPage: DepartmentMasterPage;
};

/**
 * Extended test with custom fixtures
 *
 * Usage:
 * import { test, expect } from '@fixtures/custom-fixtures';
 *
 * test('my test', async ({ loginPage }) => {
 *   await loginPage.goto();
 *   await loginPage.login('mobile', 'password');
 * });
 */
export const test = base.extend<CustomFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  userMasterPage: async ({ page }, use) => {
    const userMasterPage = new UserMasterPage(page);
    await use(userMasterPage);
  },

  employeeMasterPage: async ({ page }, use) => {
    const employeeMasterPage = new EmployeeMasterPage(page);
    await use(employeeMasterPage);
  },

  departmentMasterPage: async ({ page }, use) => {
    const departmentMasterPage = new DepartmentMasterPage(page);
    await use(departmentMasterPage);
  },

});

export { expect } from '@playwright/test';
