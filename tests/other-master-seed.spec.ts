import { test } from '@playwright/test';

test('seed - other master inspection', async ({ page }) => {
  await page.goto('https://stage.elevatorplus.net/login', { waitUntil: 'domcontentloaded' });

  // Step 1: Enter mobile number
  const mobileInput = page.locator('.form-control').first();
  await mobileInput.waitFor({ state: 'visible', timeout: 60000 });
  await mobileInput.focus();
  await page.keyboard.press('End');
  await page.keyboard.type('9209365301');

  // Click Login button (first step)
  await page.getByRole('button', { name: 'Login' }).click();

  // Step 2: Enter password
  const passwordInput = page.locator('input[type="password"]');
  await passwordInput.waitFor({ state: 'visible', timeout: 30000 });
  await passwordInput.fill('Shravani@123');
  await page.getByRole('button', { name: 'Login' }).click();

  // Wait for redirect after login
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 60000 });

  // Dismiss popup if present
  try {
    const maybeLater = page.getByRole('button', { name: /Maybe Later/i });
    const visible = await maybeLater.isVisible({ timeout: 8000 }).catch(() => false);
    if (visible) await maybeLater.click();
  } catch {}

  await page.goto('https://stage.elevatorplus.net/master/ceiling-master', { waitUntil: 'domcontentloaded' });
});
