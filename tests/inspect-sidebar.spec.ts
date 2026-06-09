import { test, expect } from './fixtures/auth-fixture';

test('inspect sidebar', async ({ page }) => {
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');

  console.log('--- SIDEBAR INSPECTION ---');
  // Click on Sales Masters to expand if needed
  const salesMasters = page.getByText(/Sales Masters/i);
  if (await salesMasters.isVisible()) {
      await salesMasters.click();
      await page.waitForTimeout(1000);
  }

  const links = await page.locator('nav a, aside a').all();
  for (const link of links) {
      const text = await link.textContent();
      const href = await link.getAttribute('href');
      console.log(`Link: ${text?.trim()} -> ${href}`);
  }
  console.log('--- END SIDEBAR ---');
});
