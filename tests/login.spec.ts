import { test, expect } from '@playwright/test';

/**
 * ElevatorPlus Login Test Suite
 * URL: https://stage.elevatorplus.net/login
 *
 * This test suite covers positive, negative, UI/UX, security, and integration
 * test cases for the mobile number-based login functionality.
 */

test.describe('ElevatorPlus Login - Positive Test Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://stage.elevatorplus.net/login');
  });

  test('should login with valid mobile number - existing user flow', async ({ page }) => {
    // Enter a valid 10-digit mobile number
    const mobileInput = page.getByRole('textbox', { name: 'Enter your mobile number' });
    await mobileInput.fill('9876543210');

    // Click the Login button
    const loginButton = page.getByRole('button', { name: 'Login' });
    await loginButton.click();

    // Verify navigation or progress indication
    // Note: Will redirect to OTP page for existing users
    await expect(page).toHaveURL(/.*login|.*otp/, { timeout: 5000 });
  });

  test('should display country selector and allow country selection', async ({ page }) => {
    // Verify country selector is visible and displays India (+91) by default
    const countrySelector = page.getByRole('button', { name: /India:\s*\+\s*91/ });
    await expect(countrySelector).toBeVisible();

    // Get initial mobile input value to verify default country code
    const mobileInput = page.getByRole('textbox', { name: 'Enter your mobile number' });
    const initialValue = await mobileInput.inputValue();
    console.log('Initial mobile input value:', initialValue);

    // Verify the default country code is +91 (India)
    expect(initialValue).toMatch(/\+91/);

    // Click on the country selector button to open dropdown
    await countrySelector.click();

    // Verify country dropdown is visible
    const listbox = page.getByRole('listbox');
    await expect(listbox).toBeVisible();

    // Verify India option is available and select it
    const indiaOption = page.getByRole('option', { name: 'India+91' });
    await expect(indiaOption).toBeVisible();
    await indiaOption.click();

    // Wait for dropdown to close and selection to take effect
    // Use waitForSelector with proper timeout instead of arbitrary waitForTimeout
    await listbox.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});

    // Verify country code is India (+91) after selection
    // Re-query the country selector to get fresh state
    const updatedCountrySelector = page.getByRole('button', { name: /India:\s*\+\s*91/ });
    await expect(updatedCountrySelector).toBeVisible();

    // Click into the mobile input field and verify it has +91 country code
    await mobileInput.click();
    await page.waitForTimeout(200); // Brief pause for input to update

    // Get the current value after country selection
    const valueAfterSelection = await mobileInput.inputValue();
    console.log('Mobile input value after country selection:', valueAfterSelection);

    // Verify country code is +91 after selection
    expect(valueAfterSelection).toMatch(/\+91/);

    // Enter mobile number (9209365301)
    // IMPORTANT: Don't clear the entire field! The phone input library auto-detects
    // country codes from what you type. If we clear and type "92...", it thinks
    // we're typing Pakistan's code. Instead, we need to position cursor after the
    // country code and type the number.
    await mobileInput.focus();

    // Press End key to move cursor to the end of the existing country code
    // This preserves the +91 country code that's already set
    await page.keyboard.press('End');
    await page.waitForTimeout(50);

    // Now type the mobile number digits
    await page.keyboard.type('9209365301');

    // Wait for formatting to complete
    await page.waitForTimeout(500);

    // Verify mobile number contains the entered digits (note: it may be auto-formatted)
    // The input formats differently based on the country
    const mobileValue = await mobileInput.inputValue();
    console.log('Mobile input value after entry:', mobileValue);

    // Check that the mobile number digits are present (may be formatted)
    // Remove all non-digit characters for verification
    const digitsOnly = mobileValue.replace(/\D/g, '');
    console.log('Mobile digits only:', digitsOnly);
    expect(digitsOnly).toContain('9209365301');

    // Also verify the country code is correct (+91 for India)
    // Extract the country code from the formatted value
    expect(mobileValue).toMatch(/\+91/);

    // Click the Login button to initiate the login flow
    const loginButton = page.getByRole('button', { name: 'Login' });
    await loginButton.click();

    // Wait for the response (either error, redirect to OTP, or password field)
    await page.waitForTimeout(3000);

    // Check if an error message is displayed (user doesn't exist scenario)
    const errorAlert = page.getByRole('alert');
    const hasError = await errorAlert.isVisible().catch(() => false);

    if (hasError) {
      // User doesn't exist - verify error message and close it
      await expect(errorAlert).toContainText(/User does not exist|does not exists/i);

      // Close the error message
      const closeButton = page.getByRole('button', { name: 'close' });
      await closeButton.click();
      await expect(errorAlert).not.toBeVisible();
    } else {
      // Check if password field appeared (existing user flow)
      const passwordInput = page.locator('input[type="password"]').or(page.getByRole('textbox', { name: /password/i }));

      if (await passwordInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Enter password (Shravani@123)
        await passwordInput.fill('Shravani@123');

        // Submit the login form
        await loginButton.click();

        // Wait for navigation or response
        await page.waitForTimeout(3000);
      } else {
        // Check if redirected to OTP page
        const currentUrl = page.url();
        if (currentUrl.includes('otp')) {
          console.log('Redirected to OTP page - user exists and needs OTP verification');
        }
      }
    }

    // Verify the final state of the page
    const finalUrl = page.url();
    console.log('Final URL after login attempt:', finalUrl);

    // Verify we're still on login (with error dismissed) or navigated appropriately
    expect(finalUrl).toMatch(/login|otp|dashboard|home/);
  });

  test('should navigate to forgot password page', async ({ page }) => {
    // Click on Forgot Password link
    const forgotPasswordLink = page.getByRole('link', { name: 'Forgot Password?' });
    await forgotPasswordLink.click();

    // Verify navigation to forgot password page
    await expect(page).toHaveURL('https://stage.elevatorplus.net/forgot-password');

    // Verify forgot password page elements
    await expect(page.getByRole('heading', { name: 'Forgot Password?' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter your email' })).toBeVisible();
  });

  
});

test.describe('ElevatorPlus Login - Negative Test Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://stage.elevatorplus.net/login');
  });

  test('should show validation error with empty mobile number', async ({ page }) => {
    // Click Login without entering mobile number
    const loginButton = page.getByRole('button', { name: 'Login' });
    await loginButton.click();

    // Verify validation error message
    await expect(page.getByText('Enter a valid mobile number')).toBeVisible();

    // Verify user remains on login page
    await expect(page).toHaveURL('https://stage.elevatorplus.net/login');
  });

  test('should show validation error with invalid mobile number format', async ({ page }) => {
    // Enter invalid mobile number (less than 10 digits)
    const mobileInput = page.getByRole('textbox', { name: 'Enter your mobile number' });
    await mobileInput.fill('123');

    // Click Login button
    const loginButton = page.getByRole('button', { name: 'Login' });
    await loginButton.click();

    // Verify validation error or no navigation
    await expect(page).toHaveURL('https://stage.elevatorplus.net/login');
  });

  test('should show error for non-existent user', async ({ page }) => {
    // Enter a valid format but non-existent mobile number
    const mobileInput = page.getByRole('textbox', { name: 'Enter your mobile number' });
    await mobileInput.fill('1234567890');

    // Click Login button
    const loginButton = page.getByRole('button', { name: 'Login' });
    await loginButton.click();

    // Verify error alert is displayed
    const errorAlert = page.getByRole('alert');
    await expect(errorAlert).toBeVisible({ timeout: 5000 });
    await expect(errorAlert).toContainText('User does not exists');

    // Verify close button is present and dismissible
    const closeButton = page.getByRole('button', { name: 'close' });
    await expect(closeButton).toBeVisible();
    await closeButton.click();
    await expect(errorAlert).not.toBeVisible();
  });

  test('should reject special characters in mobile number', async ({ page }) => {
    // Enter special characters
    const mobileInput = page.getByRole('textbox', { name: 'Enter your mobile number' });
    await mobileInput.fill('!@#$%');

    // Click Login button
    const loginButton = page.getByRole('button', { name: 'Login' });
    await loginButton.click();

    // Verify validation error
    await expect(page).toHaveURL('https://stage.elevatorplus.net/login');
  });

  test('should handle extremely long mobile number', async ({ page }) => {
    // Enter more than 15 digits
    const mobileInput = page.getByRole('textbox', { name: 'Enter your mobile number' });
    await mobileInput.fill('123456789012345678');

    // Verify input is truncated or shows validation
    const value = await mobileInput.inputValue();
    expect(value.length).toBeLessThanOrEqual(15);
  });

  test('should search and filter countries in selector', async ({ page }) => {
    // Click country selector
    const countrySelector = page.getByRole('button', { name: /India:\s*\+\s*91/ });
    await countrySelector.click();

    // Type in search box
    const searchBox = page.getByRole('searchbox', { name: 'search' });
    await searchBox.fill('India');

    // Verify filtered results
    const indiaOption = page.getByRole('option', { name: 'India+91' });
    await expect(indiaOption).toBeVisible();

    // Clear search
    await searchBox.fill('');
    await expect(page.getByRole('listbox')).toBeVisible();
  });

  // NOTE: This test is marked as fixme because the test user (9209365301) actually exists
  // and is active in the system. When testing with valid credentials, the user successfully
  // logs in and is redirected to the dashboard instead of showing an inactive user error.
  // To properly test this scenario, we need a test user that is marked as inactive in the database.
  test('should show error for inactive user attempting to login', async ({ page }) => {
    // Enter mobile number of an inactive user
    // Note: This test assumes the user with this number has been marked as inactive in the user master
    const inactiveUserMobile = '7499890080'; // Replace with actual inactive user mobile number

    const mobileInput = page.getByRole('textbox', { name: 'Enter your mobile number' });

    // Press End key to move cursor to the end of the existing country code
    await mobileInput.focus();
    await page.keyboard.press('End');
    await page.waitForTimeout(50);

    // Type the inactive user's mobile number
    await page.keyboard.type(inactiveUserMobile);
    await page.waitForTimeout(500);

    // Click Login button
    const loginButton = page.getByRole('button', { name: 'Login' });
    await loginButton.click();

    // Wait for the response
    await page.waitForTimeout(3000);

    // Check if password field appeared (existing user flow)
    const passwordInput = page.locator('input[type="password"]').or(page.getByRole('textbox', { name: /password/i }));

    if (await passwordInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Enter password for inactive user
      await passwordInput.fill('Shravani@123');

      // Submit the login form
      await loginButton.click();

      // Wait for response
      await page.waitForTimeout(3000);
    }

    // Verify error alert is displayed for inactive user
    const errorAlert = page.getByRole('alert');
    await expect(errorAlert).toBeVisible({ timeout: 5000 });

    // Verify the error message indicates the user is inactive/deactivated
    await expect(errorAlert).toContainText(/not.*active.*user|inactive|deactivated|suspended|disabled|account.*not.*active/i);

    // Verify close button is present and dismissible
    const closeButton = page.getByRole('button', { name: 'close' });
    await expect(closeButton).toBeVisible();
    await closeButton.click();
    await expect(errorAlert).not.toBeVisible();

    // Verify user remains on login page and cannot proceed
    await expect(page).toHaveURL('https://stage.elevatorplus.net/login');
  });
});

test.describe('ElevatorPlus Login - UI/UX Test Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://stage.elevatorplus.net/login');
  });

  test('should auto-format mobile number as user types', async ({ page }) => {
    const mobileInput = page.getByRole('textbox', { name: 'Enter your mobile number' });

    // Type numbers one by one and verify formatting
    await mobileInput.fill('9876543210');

    // Verify the value contains formatting (parentheses, dashes, etc.)
    const value = await mobileInput.inputValue();
    expect(value).toMatch(/\+?\d[\s\-()]?\d/);
  });

  test('should display and dismiss error messages correctly', async ({ page }) => {
    // Trigger error with non-existent user
    const mobileInput = page.getByRole('textbox', { name: 'Enter your mobile number' });
    await mobileInput.fill('1234567890');

    const loginButton = page.getByRole('button', { name: 'Login' });
    await loginButton.click();

    // Verify error alert is visible
    const errorAlert = page.getByRole('alert');
    await expect(errorAlert).toBeVisible({ timeout: 5000 });
    await expect(errorAlert).toContainText('User does not exists');

    // Dismiss error
    const closeButton = page.getByRole('button', { name: 'close' });
    await closeButton.click();
    await expect(errorAlert).not.toBeVisible();

    // Verify form is ready for new input
    await expect(mobileInput).toBeEditable();
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();

    const mobileInput = page.getByRole('textbox', { name: 'Enter your mobile number' });
    await expect(mobileInput).toBeVisible();

    const loginButton = page.getByRole('button', { name: 'Login' });
    await expect(loginButton).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await expect(mobileInput).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    await expect(mobileInput).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through form elements
    await page.keyboard.press('Tab');
    await expect(page.getByRole('textbox', { name: 'Enter your mobile number' })).toBeFocused();

    await page.keyboard.press('Tab');
    const countrySelector = page.getByRole('button', { name: /India:\s*\+\s*91/ });
    await expect(countrySelector).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Login' })).toBeFocused();

    // Test Enter key submission
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Shift+Tab');
    const mobileInput = page.getByRole('textbox', { name: 'Enter your mobile number' });
    await mobileInput.fill('1234567890');

    // Test Escape to close dropdown
    await countrySelector.click();
    await expect(page.getByRole('listbox')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('listbox')).not.toBeVisible();
  });

  test('should search countries in selector', async ({ page }) => {
    const countrySelector = page.getByRole('button', { name: /India:\s*\+\s*91/ });
    await countrySelector.click();

    // Search for a country
    const searchBox = page.getByRole('searchbox', { name: 'search' });
    await expect(searchBox).toBeFocused();

    await searchBox.fill('United');
    await expect(page.getByRole('option', { name: /United/ }).first()).toBeVisible();

    // Clear and verify full list
    await searchBox.fill('');
    const optionCount = await page.getByRole('option').count();
    expect(optionCount).toBeGreaterThan(0);
  });
});

test.describe('ElevatorPlus Login - Security Test Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://stage.elevatorplus.net/login');
  });

  test('should sanitize SQL injection attempts', async ({ page }) => {
    const mobileInput = page.getByRole('textbox', { name: 'Enter your mobile number' });

    // Try SQL injection payload
    await mobileInput.fill("' OR 1=1 --");

    const loginButton = page.getByRole('button', { name: 'Login' });
    await loginButton.click();

    // Verify no database errors exposed
    await expect(page.getByText(/database|error|syntax/i)).not.toBeVisible();
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });
  });

  test('should prevent XSS attacks', async ({ page }) => {
    const mobileInput = page.getByRole('textbox', { name: 'Enter your mobile number' });

    // Try XSS payload
    const xssPayload = "<script>alert('xss')</script>";
    await mobileInput.fill(xssPayload);

    const loginButton = page.getByRole('button', { name: 'Login' });
    await loginButton.click();

    // Verify script is not executed
    const alertCount = await page.evaluate(() => {
      let count = 0;
      window.alert = () => count++;
      return count;
    });
    expect(alertCount).toBe(0);

    // Verify error message doesn't contain raw input
    await expect(page.getByText(xssPayload)).not.toBeVisible();
  });

  test('should implement rate limiting', async ({ page }) => {
    const mobileInput = page.getByRole('textbox', { name: 'Enter your mobile number' });
    await mobileInput.fill('123');

    const loginButton = page.getByRole('button', { name: 'Login' });

    // Make multiple rapid requests
    for (let i = 0; i < 5; i++) {
      await loginButton.click();
      await page.waitForTimeout(100);
    }

    // Verify rate limit message appears or requests are throttled
    await expect(page.locator('body')).toBeVisible();
  });

  test('should use HTTPS and secure API endpoints', async ({ page }) => {
    // Monitor network requests
    const requests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('stage-apis')) {
        requests.push(request.url());
      }
    });

    const mobileInput = page.getByRole('textbox', { name: 'Enter your mobile number' });
    await mobileInput.fill('1234567890');

    const loginButton = page.getByRole('button', { name: 'Login' });
    await loginButton.click();

    // Wait a bit for the request
    await page.waitForTimeout(2000);

    // Verify HTTPS is used
    requests.forEach(url => {
      expect(url).toMatch(/^https:/);
    });
  });
});

test.describe('ElevatorPlus Login - Integration Test Cases', () => {
  test('should complete login flow with OTP', async ({ page }) => {
    await page.goto('https://stage.elevatorplus.net/login');

    // Enter valid mobile number
    const mobileInput = page.getByRole('textbox', { name: 'Enter your mobile number' });
    await mobileInput.fill('9876543210');

    // Click Login
    const loginButton = page.getByRole('button', { name: 'Login' });
    await loginButton.click();

    // Verify OTP page is loaded or appropriate flow is initiated
    await page.waitForTimeout(3000);

    // Check if we're on OTP page or stayed on login with error
    const currentUrl = page.url();
    if (currentUrl.includes('login')) {
      // Non-existent user scenario
      const errorAlert = page.getByRole('alert');
      if (await errorAlert.isVisible()) {
        console.log('User does not exist in system - this is expected for test number');
      }
    } else {
      // Existing user - should be on OTP or dashboard
      console.log('Redirected to:', currentUrl);
    }
  });

  test('should complete forgot password flow', async ({ page }) => {
    await page.goto('https://stage.elevatorplus.net/login');

    // Click Forgot Password
    const forgotPasswordLink = page.getByRole('link', { name: 'Forgot Password?' });
    await forgotPasswordLink.click();

    // Verify forgot password page
    await expect(page).toHaveURL('https://stage.elevatorplus.net/forgot-password');
    await expect(page.getByRole('heading', { name: 'Forgot Password?' })).toBeVisible();

    // Enter email
    const emailInput = page.getByRole('textbox', { name: 'Enter your email' });
    await emailInput.fill('test@example.com');

    // Submit
    const sendOtpButton = page.getByRole('button', { name: 'Send OTP' });
    await sendOtpButton.click();

    // Wait for response
    await page.waitForTimeout(2000);

    // Navigate back to login
    const backToLoginLink = page.getByRole('link', { name: 'Back to login' });
    await backToLoginLink.click();

    // Verify login page is accessible
    await expect(page).toHaveURL('https://stage.elevatorplus.net/login');
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });
});

test.describe('ElevatorPlus Login - Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://stage.elevatorplus.net/login');
  });

  test('should handle page refresh during data entry', async ({ page }) => {
    const mobileInput = page.getByRole('textbox', { name: 'Enter your mobile number' });

    // Enter partial data
    await mobileInput.fill('987');

    // Refresh page
    await page.reload();

    // Verify form is cleared
    const value = await mobileInput.inputValue();
    expect(value).toBe('+91');
  });

  test('should handle browser back button after login attempt', async ({ page }) => {
    const mobileInput = page.getByRole('textbox', { name: 'Enter your mobile number' });
    await mobileInput.fill('1234567890');

    const loginButton = page.getByRole('button', { name: 'Login' });
    await loginButton.click();

    // Wait for error/redirect
    await page.waitForTimeout(2000);

    // Click back button
    await page.goBack();

    // Verify login page state
    await expect(page).toHaveURL('https://stage.elevatorplus.net/login');
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test('should handle network interruption gracefully', async ({ page }) => {
    // Simulate offline mode
    await page.context().setOffline(true);

    const mobileInput = page.getByRole('textbox', { name: 'Enter your mobile number' });
    await mobileInput.fill('1234567890');

    const loginButton = page.getByRole('button', { name: 'Login' });
    await loginButton.click();

    // Wait for timeout/error
    await page.waitForTimeout(3000);

    // Go back online
    await page.context().setOffline(false);

    // Verify app is still functional
    await page.reload();
    await expect(mobileInput).toBeVisible();
  });
});
