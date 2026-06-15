import { test } from '../fixtures/auth-fixture';

const MANAGE_EXPENSE_URL = '/product-inventory/manage-expenses';

async function dismissChecklist(page: any) {
  await page.addStyleTag({ content: '.checklist-component { display: none !important; }' });
}

test('ME-STRUCT: check conditional fields per expense type', async ({ page }) => {
  await page.goto(MANAGE_EXPENSE_URL);
  await page.getByRole('heading', { name: /Manage Expense/i }).waitFor({ state: 'visible', timeout: 30000 });
  await page.getByText('Loading...').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
  await dismissChecklist(page);

  for (const expType of ['Against The PM', 'Against The Job', 'Other']) {
    // Clear form
    const clearBtn = page.getByRole('button', { name: /Clear/i });
    if (await clearBtn.isVisible().catch(() => false)) await clearBtn.click();
    await page.waitForTimeout(300);

    await page.locator('select#expense_type').selectOption({ label: expType });
    await page.waitForTimeout(800);

    // List all visible option__controls and their placeholders
    const controls = page.locator('[class*="option__control"]').filter({ visible: true });
    const count = await controls.count();
    console.log(`\n=== ${expType} (${count} option__controls) ===`);
    for (let i = 0; i < count; i++) {
      const placeholder = await controls.nth(i).locator('[class*="__placeholder"]').textContent().catch(() => '(none)');
      const selectedVal = await controls.nth(i).locator('[class*="__single-value"]').textContent().catch(() => '(empty)');
      console.log(`  Control ${i}: placeholder="${placeholder}", value="${selectedVal}"`);
    }
  }
});
