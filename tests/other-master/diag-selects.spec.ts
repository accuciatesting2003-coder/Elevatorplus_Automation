import { test } from '../fixtures/auth-fixture';

test('diagnose long name and whitespace', async ({ page }) => {
  await page.goto('/master/controller-master', { timeout: 60000 });
  await page.getByRole('heading', { name: /Add Controller/i }).waitFor({ state: 'visible', timeout: 45000 });
  await page.waitForTimeout(1000);

  // Set up alert capture
  await page.evaluate(() => {
    (window as any).__alerts = [];
    const observer = new MutationObserver(() => {
      document.querySelectorAll('[role="alert"]').forEach(el => {
        const t = el.textContent?.trim();
        if (t && !(window as any).__alerts.includes(t)) (window as any).__alerts.push(t);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });

  // Test 1: Long name
  const longName = `AC Variable Frequency Drive Based Microprocessor Controlled Elevator Controller Unit Model`;
  await page.locator('#controller_name').fill(longName);
  await page.getByRole('button', { name: /Submit/i }).click();
  await page.waitForTimeout(5000);
  
  const alerts1 = await page.evaluate(() => (window as any).__alerts);
  const formValue1 = await page.locator('#controller_name').inputValue();
  const validationMsgs1 = await page.locator('.invalid-feedback, [class*="error"], small, [class*="helper"]').allInnerTexts().catch(() => []);
  console.log('Long name - Alerts:', JSON.stringify(alerts1));
  console.log('Long name - Form value:', formValue1);
  console.log('Long name - Validation msgs:', JSON.stringify(validationMsgs1.filter(t => t.trim())));

  // Reset
  await page.locator('#controller_name').clear();
  await page.evaluate(() => { (window as any).__alerts = []; });

  // Test 2: Whitespace
  await page.locator('#controller_name').fill('   ');
  await page.getByRole('button', { name: /Submit/i }).click();
  await page.waitForTimeout(3000);
  
  const alerts2 = await page.evaluate(() => (window as any).__alerts);
  const formValue2 = await page.locator('#controller_name').inputValue();
  const validationMsgs2 = await page.locator('.invalid-feedback, [class*="error"], small, [class*="helper"]').allInnerTexts().catch(() => []);
  console.log('Whitespace - Alerts:', JSON.stringify(alerts2));
  console.log('Whitespace - Form value:', formValue2);
  console.log('Whitespace - Validation msgs:', JSON.stringify(validationMsgs2.filter(t => t.trim())));
});
