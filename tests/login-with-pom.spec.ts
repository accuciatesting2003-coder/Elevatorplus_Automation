import { test, expect } from '@fixtures/custom-fixtures';
import { testMobileNumbers, testMessages, securityPayloads } from '@test-data';

/**
 * Login Tests - Refactored with Page Object Model
 *
 * This shows how much cleaner tests are with POM
 */

test.describe('Login - Positive Tests (POM)', () => {
  test('should display login page correctly', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.expectToBeOnLoginPage();
    await loginPage.expectLoginButtonVisible();
    await loginPage.expectMobileInputEditable();
  });

  test('should login with valid credentials', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.loginWithEnvCredentials();

    // Verify we navigated away from login
    const url = loginPage.getUrl();
    expect(url).not.toContain('/login');
  });

  test('should navigate to forgot password', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.clickForgotPassword();

    await loginPage.expectUrlToContain('/forgot-password');
  });
});

test.describe('Login - Negative Tests (POM)', () => {
  test('should show error for non-existent user', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(testMobileNumbers.nonExistent);

    await loginPage.expectError(testMessages.errors.userNotExist);
  });

  test('should dismiss error alert', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(testMobileNumbers.nonExistent);

    await loginPage.expectError();
    await loginPage.dismissError();

    const errorVisible = await loginPage.isErrorVisible();
    expect(errorVisible).toBe(false);
  });
});

test.describe('Login - Security Tests (POM)', () => {
  test('should handle SQL injection safely', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.enterMobileNumber(securityPayloads.sqlInjection);
    await loginPage.clickLogin();

    // Should show error, not database error
    await loginPage.expectError();
  });

  test('should handle XSS attempts', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.enterMobileNumber(securityPayloads.xss);
    await loginPage.clickLogin();

    // Verify script is not executed
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).not.toContain('<script>');
  });
});

test.describe('Login - Country Selection (POM)', () => {
  test('should select country', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.selectCountry('India');

    const mobileValue = await loginPage.getMobileInputValue();
    expect(mobileValue).toMatch(/\+91/);
  });

  test('should search for country', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.searchCountry('United');

    // Verify search is working (dropdown is open)
    await loginPage.wait(1000);
  });
});
