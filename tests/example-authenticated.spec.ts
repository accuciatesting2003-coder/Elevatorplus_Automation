import { test, expect } from './fixtures/auth-fixture';

/**
 * Example Authenticated Test
 * This test automatically uses the authenticated session from auth.setup.ts
 * No need to login - the user is already logged in!
 */

test.describe('Example - Authenticated Tests', () => {
  test('should already be logged in and access user master', async ({ page }) => {
    // Navigate directly to a protected page - no login needed!
    await page.goto('/user-master');

    // The user is already authenticated, so this should work
    await page.waitForLoadState('networkidle');

    // Verify we're on the user master page (adjust selector based on actual page)
    const currentUrl = page.url();
    expect(currentUrl).toContain('/user-master');

    // Add your actual test assertions here
    console.log('✓ User Master page loaded while authenticated');
  });

  test('should access employee master without login', async ({ page }) => {
    // Navigate to employee master
    await page.goto('/employee-master');

    await page.waitForLoadState('networkidle');

    // Verify we're on the employee master page
    const currentUrl = page.url();
    expect(currentUrl).toContain('/employee-master');

    console.log('✓ Employee Master page loaded while authenticated');
  });

  test('should access department master without login', async ({ page }) => {
    // Navigate to department master
    await page.goto('/department-master');

    await page.waitForLoadState('networkidle');

    // Verify we're on the department master page
    const currentUrl = page.url();
    expect(currentUrl).toContain('/department-master');

    console.log('✓ Department Master page loaded while authenticated');
  });
});
