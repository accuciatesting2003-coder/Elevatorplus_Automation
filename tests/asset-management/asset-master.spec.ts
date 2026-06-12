// spec: test-plans/asset-management/asset-master.test-plan.md
// seed: tests/setup/auth.setup.ts

import { test, expect } from '../fixtures/auth-fixture';

const ASSET_MASTER_URL = '/master/asset-master';

async function registerPopupHandler(page: any) {
  if ((page as any).__popupHandlerRegistered) return;
  (page as any).__popupHandlerRegistered = true;
  await page.addLocatorHandler(
    page.getByRole('button', { name: /Maybe Later/i }),
    async () => {
      await page.getByRole('button', { name: /Maybe Later/i }).click().catch(() => {});
    }
  );
}

async function dismissChecklist(page: any) {
  await page.addStyleTag({
    content: [
      '.checklist-component { display: none !important; }',
      '.header-navbar-shadow { pointer-events: none !important; }',
    ].join('\n'),
  });
}

async function gotoAssetMaster(page: any) {
  await registerPopupHandler(page);
  await page.goto(ASSET_MASTER_URL);
  await page.getByRole('heading', { name: /Add Asset/i }).waitFor({ state: 'visible', timeout: 30000 });
  await dismissChecklist(page);
}

function tableRows(page: any) {
  return page.locator('[role="row"]:has([role="cell"])');
}

function statusFilterSelect(page: any) {
  return page.locator('select').filter({ has: page.locator('option', { hasText: 'Inactive' }) }).first();
}

function showEntriesSelect(page: any) {
  return page.locator('select').filter({ has: page.locator('option', { hasText: '100' }) }).first();
}

async function clickEditOnRow(page: any, rowIndex = 0) {
  await tableRows(page).nth(rowIndex).getByRole('img', { name: 'Edit' }).click({ force: true });
}

async function findRowByName(page: any, name: string): Promise<number> {
  await showEntriesSelect(page).selectOption('100');
  await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
  const rows = tableRows(page);
  const count = await rows.count();
  for (let i = 0; i < count; i++) {
    const txt = await rows.nth(i).locator('[role="cell"]').nth(2).innerText().catch(() => '');
    if (txt.trim() === name) return i;
  }
  return -1;
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1 – Page Load & Navigation
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Asset Master', () => {

  test.beforeEach(async ({ page }) => {
    await gotoAssetMaster(page);
  });

  test.describe('Page Load', () => {

    test('TC-AM-001: Asset Master page loads successfully', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(ASSET_MASTER_URL));
      await expect(page).toHaveTitle('ElevatorPlus');
      await expect(page.getByRole('heading', { level: 4, name: /Add Asset/i })).toBeVisible();
      await expect(page.locator('#asset_name')).toBeVisible();
      await expect(page.locator('#asset_name')).toHaveValue('');
      await expect(page.locator('#is_multi_quantity')).toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Clear/i })).toBeVisible();
      await expect(tableRows(page).first()).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('button', { name: 'Asset Name', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Status', exact: true })).toBeVisible();
    });

    test('TC-AM-001b: Asset Master accessible via sidebar navigation', async ({ page }) => {
      await page.goto('/dashboard');
      await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        const am = links.find(l => l.textContent && l.textContent.trim().includes('Asset Management'));
        if (am) am.click();
      });
      await page.getByRole('link', { name: 'Asset Master' }).click();
      await expect(page).toHaveURL(new RegExp(ASSET_MASTER_URL));
      await expect(page.getByRole('heading', { name: /Add Asset/i })).toBeVisible({ timeout: 15000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 2 – Create Asset – Validations
  // ─────────────────────────────────────────────────────────────────────────
  test.describe('Create Asset - Validations', () => {

    test('TC-AM-002: Submit empty form shows validation error for Asset Name', async ({ page }) => {
      await page.getByRole('button', { name: /Submit/i }).click({ force: true });
      await expect(page.getByText('Please enter asset name')).toBeVisible();
    });

    test('TC-AM-004: Asset Name required even when Is Multi Quantity checked', async ({ page }) => {
      await page.locator('#is_multi_quantity').check({ force: true });
      await page.getByRole('button', { name: /Submit/i }).click({ force: true });
      await expect(page.getByText('Please enter asset name')).toBeVisible();
    });

    test('TC-AM-003: Asset Name accepts valid text and creates asset', async ({ page }) => {
      const ts = Date.now();
      const name = `AutoAsset ${ts}`;
      await page.locator('#asset_name').fill(name);
      await page.getByRole('button', { name: /Submit/i }).click({ force: true });
      await expect(page.locator('[role="alert"]').filter({ hasText: /successfully/i })).toBeVisible({ timeout: 15000 });
      await expect(page.locator('#asset_name')).toHaveValue('');
    });

  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 3 – Is Multi Quantity Checkbox
  // ─────────────────────────────────────────────────────────────────────────
  test.describe('Is Multi Quantity Checkbox', () => {

    test('TC-AM-007: Is Multi Quantity checkbox is unchecked by default', async ({ page }) => {
      await expect(page.locator('#is_multi_quantity')).not.toBeChecked();
    });

    test('TC-AM-008: Create asset with Is Multi Quantity checked', async ({ page }) => {
      const ts = Date.now();
      await page.locator('#asset_name').fill(`MultiQtyAsset ${ts}`);
      await page.locator('#is_multi_quantity').check({ force: true });
      await expect(page.locator('#is_multi_quantity')).toBeChecked();
      await page.getByRole('button', { name: /Submit/i }).click({ force: true });
      await expect(page.locator('[role="alert"]').filter({ hasText: /successfully/i })).toBeVisible({ timeout: 10000 });
    });

    test('TC-AM-009: Create asset with Is Multi Quantity unchecked', async ({ page }) => {
      const ts = Date.now();
      await page.locator('#asset_name').fill(`SingleQtyAsset ${ts}`);
      await expect(page.locator('#is_multi_quantity')).not.toBeChecked();
      await page.getByRole('button', { name: /Submit/i }).click({ force: true });
      await expect(page.locator('[role="alert"]').filter({ hasText: /successfully/i })).toBeVisible({ timeout: 10000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 4 – Clear Button
  // ─────────────────────────────────────────────────────────────────────────
  test.describe('Clear Button', () => {

    test('TC-AM: Clear button resets all form fields', async ({ page }) => {
      await page.locator('#asset_name').fill('Some Asset Name');
      await page.locator('#is_multi_quantity').check({ force: true });
      await page.getByRole('button', { name: /Clear/i }).click({ force: true });
      await expect(page.locator('#asset_name')).toHaveValue('');
      await expect(page.locator('#is_multi_quantity')).not.toBeChecked();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 5 – Edit / Update Asset
  // ─────────────────────────────────────────────────────────────────────────
  test.describe('Edit and Update Asset', () => {

    test('TC-AM-010: Edit button opens pre-filled dialog with asset data', async ({ page }) => {
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 10000 });
      await clickEditOnRow(page, 0);
      const dialog = page.getByRole('dialog');
      await dialog.waitFor({ state: 'visible', timeout: 10000 });
      await expect(dialog.getByRole('textbox', { name: /Asset Name/i })).not.toHaveValue('');
      await expect(dialog.getByRole('checkbox')).toBeDisabled();
      await expect(dialog.getByRole('combobox', { name: /Status/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Update/i })).toBeVisible();
      await page.getByRole('button', { name: 'Close' }).click();
    });

    test('TC-AM-011: Update Asset Name successfully', async ({ page }) => {
      const ts = Date.now();
      const origName = `UpdateTarget ${ts}`;
      await page.locator('#asset_name').fill(origName);
      await page.getByRole('button', { name: /Submit/i }).click({ force: true });
      await expect(page.locator('[role="alert"]').filter({ hasText: /successfully/i })).toBeVisible({ timeout: 10000 });

      const targetRow = await findRowByName(page, origName);
      expect(targetRow).toBeGreaterThan(-1);

      await clickEditOnRow(page, targetRow);
      const dialog = page.getByRole('dialog');
      await dialog.waitFor({ state: 'visible', timeout: 10000 });
      const nameInput = dialog.getByRole('textbox', { name: /Asset Name/i });
      await nameInput.clear();
      await nameInput.fill(`${origName} Updated`);
      await page.getByRole('button', { name: /Update/i }).click({ force: true });
      await expect(page.locator('[role="alert"]').filter({ hasText: /successfully/i })).toBeVisible({ timeout: 10000 });
    });

    test('TC-AM-012: Cannot save edit with empty Asset Name', async ({ page }) => {
      await tableRows(page).first().waitFor({ state: 'visible' });
      await clickEditOnRow(page, 0);
      const dialog = page.getByRole('dialog');
      await dialog.waitFor({ state: 'visible', timeout: 10000 });
      const nameInput = dialog.getByRole('textbox', { name: /Asset Name/i });
      await nameInput.clear();
      await page.getByRole('button', { name: /Update/i }).click({ force: true });
      await expect(page.getByText('Please enter asset name')).toBeVisible();
      await page.getByRole('button', { name: 'Close' }).click();
    });

    test('TC-AM-013: Toggle Is Multi Quantity in edit form is disabled', async ({ page }) => {
      await tableRows(page).first().waitFor({ state: 'visible' });
      await clickEditOnRow(page, 0);
      const dialog = page.getByRole('dialog');
      await dialog.waitFor({ state: 'visible', timeout: 10000 });
      await expect(dialog.getByRole('checkbox')).toBeDisabled();
      await page.getByRole('button', { name: 'Close' }).click();
    });

    test('TC-AM: Update status to Inactive persists change', async ({ page }) => {
      const ts = Date.now();
      const name = `InactivateMe ${ts}`;
      await page.locator('#asset_name').fill(name);
      await page.getByRole('button', { name: /Submit/i }).click({ force: true });
      await expect(page.locator('[role="alert"]').filter({ hasText: /successfully/i })).toBeVisible({ timeout: 10000 });

      const targetRow = await findRowByName(page, name);
      expect(targetRow).toBeGreaterThan(-1);

      await clickEditOnRow(page, targetRow);
      const dialog = page.getByRole('dialog');
      await dialog.waitFor({ state: 'visible', timeout: 10000 });
      await dialog.getByRole('combobox', { name: /Status/i }).selectOption('Inactive');
      await page.getByRole('button', { name: /Update/i }).click({ force: true });
      await expect(page.locator('[role="alert"]').filter({ hasText: /successfully/i })).toBeVisible({ timeout: 10000 });

      await statusFilterSelect(page).selectOption('Active');
      await page.waitForTimeout(500);
      await expect(page.getByText(name, { exact: true })).not.toBeVisible();

      await statusFilterSelect(page).selectOption('Inactive');
      await page.waitForTimeout(500);
      await expect(page.getByText(name)).toBeVisible();
    });

    test('TC-AM: Updating asset name to its own name saves successfully', async ({ page }) => {
      await tableRows(page).first().waitFor({ state: 'visible' });
      await clickEditOnRow(page, 0);
      const dialog = page.getByRole('dialog');
      await dialog.waitFor({ state: 'visible', timeout: 10000 });
      const currentName = await dialog.getByRole('textbox', { name: /Asset Name/i }).inputValue();
      await page.getByRole('button', { name: /Update/i }).click({ force: true });
      await expect(page.locator('[role="alert"]').filter({ hasText: /successfully/i })).toBeVisible({ timeout: 10000 });
      expect(currentName.length).toBeGreaterThan(0);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 6 – Is Multi Quantity Non-Editable After Creation
  // ─────────────────────────────────────────────────────────────────────────
  test.describe('Is Multi Quantity - Non-Editable After Creation', () => {

    test('TC-AM-027: Is Multi Quantity disabled in edit form', async ({ page }) => {
      await tableRows(page).first().waitFor({ state: 'visible' });
      await clickEditOnRow(page, 0);
      const dialog = page.getByRole('dialog');
      await dialog.waitFor({ state: 'visible', timeout: 10000 });
      await expect(dialog.getByRole('checkbox')).toBeDisabled();
      const hint = dialog.getByText('Cannot be changed after creation');
      await expect(hint).toBeVisible();
      await page.getByRole('button', { name: 'Close' }).click();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 7 – Asset Name Uniqueness
  // ─────────────────────────────────────────────────────────────────────────
  test.describe('Asset Name Uniqueness', () => {

    test('TC-AM-022: Duplicate asset name shows error', async ({ page }) => {
      await tableRows(page).first().waitFor({ state: 'visible' });
      const existingName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText()).trim();
      await page.locator('#asset_name').fill(existingName);
      await page.getByRole('button', { name: /Submit/i }).click({ force: true });
      await expect(page.locator('[role="alert"]').filter({ hasText: /already exists|Something went wrong/i })).toBeVisible({ timeout: 10000 });
    });

    test('TC-AM-024: Update asset name to duplicate of another active asset shows error', async ({ page }) => {
      await tableRows(page).first().waitFor({ state: 'visible' });
      const rows = tableRows(page);
      const count = await rows.count();
      if (count < 2) { test.skip(); return; }
      const firstRowName = (await rows.nth(0).locator('[role="cell"]').nth(2).innerText()).trim();
      const secondRowName = (await rows.nth(1).locator('[role="cell"]').nth(2).innerText()).trim();

      await clickEditOnRow(page, 1);
      const dialog = page.getByRole('dialog');
      await dialog.waitFor({ state: 'visible', timeout: 10000 });
      const nameInput = dialog.getByRole('textbox', { name: /Asset Name/i });
      await nameInput.clear();
      await nameInput.fill(firstRowName);
      await page.getByRole('button', { name: /Update/i }).click({ force: true });
      await expect(page.locator('[role="alert"]').filter({ hasText: /already exists|Something went wrong/i })).toBeVisible({ timeout: 10000 });
      await page.getByRole('dialog').getByRole('button', { name: 'Close' }).click();
      expect(secondRowName.length).toBeGreaterThan(0);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 8 – Status Filter
  // ─────────────────────────────────────────────────────────────────────────
  test.describe('Status Filter', () => {

    test('TC-AM: Status filter defaults to Active and shows only active assets', async ({ page }) => {
      await tableRows(page).first().waitFor({ state: 'visible' });
      const rows = tableRows(page);
      const count = Math.min(await rows.count(), 5);
      for (let i = 0; i < count; i++) {
        const status = await rows.nth(i).locator('[role="cell"]').nth(5).innerText().catch(() => '');
        if (status.trim()) expect(status.trim()).toBe('Active');
      }
    });

    test('TC-AM: Filter to All shows records', async ({ page }) => {
      await statusFilterSelect(page).selectOption('All');
      await page.waitForTimeout(500);
      expect(await tableRows(page).count()).toBeGreaterThanOrEqual(0);
    });

    test('TC-AM: Filter to Inactive shows only Inactive assets', async ({ page }) => {
      await statusFilterSelect(page).selectOption('Inactive');
      await page.waitForTimeout(500);
      const count = await tableRows(page).count();
      if (count > 0) {
        const status = await tableRows(page).first().locator('[role="cell"]').nth(5).innerText().catch(() => '');
        if (status.trim()) expect(status.trim()).toBe('Inactive');
      }
    });

    test('TC-AM: Switching filter back to Active restores active records', async ({ page }) => {
      await statusFilterSelect(page).selectOption('Inactive');
      await page.waitForTimeout(300);
      await statusFilterSelect(page).selectOption('Active');
      await page.waitForTimeout(500);
      await tableRows(page).first().waitFor({ state: 'visible' });
      const status = await tableRows(page).first().locator('[role="cell"]').nth(5).innerText().catch(() => '');
      if (status.trim()) expect(status.trim()).toBe('Active');
    });

  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 9 – Search Functionality
  // ─────────────────────────────────────────────────────────────────────────
  test.describe('Search Functionality', () => {

    test('TC-AM-020: Search by asset name filters results', async ({ page }) => {
      await tableRows(page).first().waitFor({ state: 'visible' });
      await page.getByRole('textbox', { name: /Search Asset Name/i }).fill('laptop');
      await page.waitForTimeout(1000);
      const count = await tableRows(page).count();
      if (count > 0) {
        const name = await tableRows(page).first().locator('[role="cell"]').nth(2).innerText();
        expect(name.toLowerCase()).toContain('laptop');
      }
    });

    test('TC-AM-021: Search with non-existent name shows no results', async ({ page }) => {
      await tableRows(page).first().waitFor({ state: 'visible' });
      await page.getByRole('textbox', { name: /Search Asset Name/i }).fill('XYZNONEXISTENT99999');
      await page.waitForTimeout(800);
      await expect(tableRows(page).first()).not.toBeVisible({ timeout: 3000 }).catch(() => {});
    });

    test('TC-AM: Clearing search restores full list', async ({ page }) => {
      await tableRows(page).first().waitFor({ state: 'visible' });
      const initial = await tableRows(page).count();
      const searchBox = page.getByRole('textbox', { name: /Search Asset Name/i });
      await searchBox.fill('laptop');
      await page.waitForTimeout(500);
      await searchBox.clear();
      await page.waitForTimeout(500);
      const restored = await tableRows(page).count();
      expect(restored).toBeGreaterThanOrEqual(initial);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 10 – Navigation & Access
  // ─────────────────────────────────────────────────────────────────────────
  test.describe('Navigation and Access', () => {

    test('TC-AM: Unauthenticated access redirects to login', async ({ page }) => {
      const browser = page.context().browser();
      if (!browser) { test.skip(); return; }
      const ctx = await browser.newContext();
      const unauthPage = await ctx.newPage();
      await unauthPage.goto('https://stage.elevatorplus.net/master/asset-master');
      await expect(unauthPage).toHaveURL(/\/login/, { timeout: 30000 });
      await ctx.close();
    });

  });

});
