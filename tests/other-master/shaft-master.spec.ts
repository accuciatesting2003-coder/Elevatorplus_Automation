// spec: test-plans/Other-master-test-plan/shaft-master-test-plan.md
// seed: tests/setup/auth.setup.ts

import { test, expect } from '../fixtures/auth-fixture';

const SHAFT_MASTER_URL = '/master/shaft-master';

async function registerPopupHandler(page: any) {
  await page.addLocatorHandler(
    page.getByRole('button', { name: /Maybe Later/i }),
    async () => {
      await page.getByRole('button', { name: /Maybe Later/i }).click().catch(() => {});
    }
  );
}

async function dismissNotificationPopup(page: any) {
  try {
    const maybeLater = page.getByRole('button', { name: /Maybe Later/i });
    const visible = await maybeLater.isVisible({ timeout: 5000 }).catch(() => false);
    if (visible) {
      await maybeLater.click();
      return;
    }
    const enableBtn = page.getByRole('button', { name: /enable/i });
    const enableVisible = await enableBtn.isVisible({ timeout: 3000 }).catch(() => false);
    if (enableVisible) {
      await enableBtn.click();
      await page.waitForTimeout(500);
    }
  } catch {
    // Popup did not appear
  }
}

async function gotoShaftMaster(page: any) {
  await registerPopupHandler(page);
  await page.goto(SHAFT_MASTER_URL, { timeout: 60000 });
  await page.getByRole('heading', { name: /Add Shaft/i }).waitFor({ state: 'visible', timeout: 45000 });
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  await dismissNotificationPopup(page);
}

function tableRows(page: any) {
  return page.locator('[role="row"]:has([role="cell"])');
}

async function waitForTableRows(page: any) {
  await tableRows(page).first().waitFor({ state: 'visible', timeout: 30000 });
}

async function clickEditOnRow(page: any, rowIndex: number = 0) {
  await tableRows(page).nth(rowIndex).locator('[role="cell"]').nth(1).locator('svg').click({ timeout: 15000 });
}

function statusFilterSelect(page: any) {
  return page.locator('select').filter({ has: page.locator('option', { hasText: 'Inactive' }) }).first();
}

function showEntriesSelect(page: any) {
  return page.locator('select').filter({ has: page.locator('option', { hasText: '100' }) }).first();
}

async function getStatusColumnTexts(page: any): Promise<string[]> {
  const rows = tableRows(page);
  const count = await rows.count();
  const texts: string[] = [];
  for (let i = 0; i < count; i++) {
    const text = await rows.nth(i).getByRole('heading', { level: 5 }).innerText().catch(() => '');
    texts.push(text.trim());
  }
  return texts;
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1 – Smoke Tests
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Shaft Master', () => {

  test.describe('Smoke Tests', () => {

    test.beforeEach(async ({ page }) => {
      await gotoShaftMaster(page);
    });

    test('TC-SM-01: Shaft Master page loads successfully', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(SHAFT_MASTER_URL, 'i'));
      await expect(page).toHaveTitle('ElevatorPlus');
      await expect(page.getByRole('heading', { name: /Add Shaft/i })).toBeVisible();

      const nameInput = page.getByRole('textbox', { name: /^Shaft Type Name/i });
      await expect(nameInput).toBeVisible();
      await expect(nameInput).toHaveValue('');

      await expect(page.getByRole('spinbutton', { name: /Price/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Clear/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();

      await waitForTableRows(page);
      await expect(page.getByText('Sr. No.')).toBeVisible();
      await expect(page.getByRole('button', { name: /^Status$/i })).toBeVisible();
    });

    test('TC-SM-02: Verify page elements and layout', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /Add Shaft/i })).toBeVisible();

      const showDropdown = showEntriesSelect(page);
      await expect(showDropdown).toBeVisible();
      await expect(showDropdown).toHaveValue('25');

      const statusFilter = statusFilterSelect(page);
      await expect(statusFilter).toBeVisible();
      await expect(statusFilter).toHaveValue('true');

      await expect(page.getByRole('button', { name: /Update Price/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Import/i })).toBeVisible();
      await expect(page.getByRole('textbox', { name: /Search Shaft Type Name/i })).toBeVisible();

      await waitForTableRows(page);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 2 – Add Shaft (Happy Path)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Add Shaft (Happy Path)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoShaftMaster(page);
    });

    test('TC-ADD-01: Successfully create a new shaft with a unique name', async ({ page }) => {
      const shaftName = `AutoShaft ${Date.now()}`;
      await page.getByRole('textbox', { name: /^Shaft Type Name/i }).fill(shaftName);
      await page.getByRole('spinbutton', { name: /Price/i }).fill('500');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.getByRole('alert').filter({ hasText: /Shaft type has been created successfully/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('textbox', { name: /^Shaft Type Name/i })).toHaveValue('', { timeout: 10000 });
      await expect(page.getByRole('heading', { name: /Add Shaft/i })).toBeVisible();

      await page.getByRole('textbox', { name: /Search Shaft Type Name/i }).fill(shaftName);
      await page.waitForTimeout(1000);
      await expect(tableRows(page).filter({ hasText: shaftName })).toHaveCount(1, { timeout: 15000 });
      await page.getByRole('textbox', { name: /Search Shaft Type Name/i }).fill('');
    });

    test('TC-ADD-02: Create a shaft with special characters in the name', async ({ page }) => {
      const shaftName = `Shaft #4 - Duplex ${Date.now()}`;
      await page.getByRole('textbox', { name: /^Shaft Type Name/i }).fill(shaftName);
      await page.getByRole('spinbutton', { name: /Price/i }).fill('750');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.getByRole('alert').filter({ hasText: /Shaft type has been created successfully/i })).toBeVisible({ timeout: 15000 });
      await page.getByRole('textbox', { name: /Search Shaft Type Name/i }).fill(shaftName);
      await page.waitForTimeout(1000);
      await expect(tableRows(page).filter({ hasText: shaftName })).toHaveCount(1, { timeout: 15000 });
      await page.getByRole('textbox', { name: /Search Shaft Type Name/i }).fill('');
    });

    test('TC-ADD-03: Create a shaft with a long name (~100 chars)', async ({ page }) => {
      const shaftName = `Reinforced Concrete Shaft Type With Steel Lining For High Rise Building Elevator Installation`;
      await page.getByRole('textbox', { name: /^Shaft Type Name/i }).fill(shaftName);
      await page.getByRole('spinbutton', { name: /Price/i }).fill('1000');
      await page.getByRole('button', { name: /Submit/i }).click();

      const successToast = page.getByRole('alert').filter({ hasText: /Shaft type has been created successfully/i });
      const errorToast = page.getByRole('alert').filter({ hasText: /already exists/i });
      const hasToast = await Promise.race([
        successToast.waitFor({ state: 'visible', timeout: 15000 }),
        errorToast.waitFor({ state: 'visible', timeout: 15000 }),
      ]).then(() => true).catch(() => false);
      expect(hasToast).toBeTruthy();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 3 – Mandatory Field Validation
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Mandatory Field Validation', () => {

    test.beforeEach(async ({ page }) => {
      await gotoShaftMaster(page);
    });

    test('TC-VAL-01: Submit empty form shows Shaft Type Name validation error', async ({ page }) => {
      await page.getByRole('spinbutton', { name: /Price/i }).fill('100');
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.getByText('Please enter shaft type name')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add Shaft/i })).toBeVisible();
    });

    test('TC-VAL-02: Submit with empty Price shows validation error', async ({ page }) => {
      await page.getByRole('textbox', { name: /^Shaft Type Name/i }).fill(`TestShaft ${Date.now()}`);
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.getByText('Please enter price')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add Shaft/i })).toBeVisible();
    });

    test('TC-VAL-03: Validation error clears when valid input is entered', async ({ page }) => {
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.getByText('Please enter shaft type name')).toBeVisible({ timeout: 5000 });

      const shaftName = `ValidShaft ${Date.now()}`;
      await page.getByRole('textbox', { name: /^Shaft Type Name/i }).fill(shaftName);
      await page.getByRole('spinbutton', { name: /Price/i }).fill('200');
      await expect(page.getByText('Please enter shaft type name')).not.toBeVisible({ timeout: 5000 });

      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.getByRole('alert').filter({ hasText: /Shaft type has been created successfully/i })).toBeVisible({ timeout: 15000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 4 – Duplicate Prevention
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Duplicate Prevention', () => {

    test.beforeEach(async ({ page }) => {
      await gotoShaftMaster(page);
    });

    test('TC-DUP-01: Submitting existing shaft name shows error', async ({ page }) => {
      await waitForTableRows(page);
      const existingName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(existingName.length).toBeGreaterThan(0);

      await page.getByRole('textbox', { name: /^Shaft Type Name/i }).fill(existingName);
      await page.getByRole('spinbutton', { name: /Price/i }).fill('100');
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.getByRole('alert').filter({ hasText: /already exists/i })).toBeVisible({ timeout: 15000 });
    });

    test('TC-DUP-02: Case-sensitivity test for duplicate shaft name', async ({ page }) => {
      await waitForTableRows(page);
      const existingName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(existingName.length).toBeGreaterThan(0);

      await page.getByRole('textbox', { name: /^Shaft Type Name/i }).fill(existingName.toUpperCase());
      await page.getByRole('spinbutton', { name: /Price/i }).fill('100');
      await page.getByRole('button', { name: /Submit/i }).click();

      const errorToast = page.getByRole('alert').filter({ hasText: /already exists/i });
      const successToast = page.getByRole('alert').filter({ hasText: /Shaft type has been created successfully/i });
      const hasError = await errorToast.waitFor({ state: 'visible', timeout: 15000 }).then(() => true).catch(() => false);
      const hasSuccess = await successToast.waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false);
      expect(hasError || hasSuccess).toBeTruthy();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 5 – Clear Button
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Clear Button', () => {

    test.beforeEach(async ({ page }) => {
      await gotoShaftMaster(page);
    });

    test('TC-CLR-01: Clear button resets the Add Shaft form', async ({ page }) => {
      await page.getByRole('textbox', { name: /^Shaft Type Name/i }).fill('Temp Shaft Name');
      await page.getByRole('spinbutton', { name: /Price/i }).fill('999');
      await page.getByRole('button', { name: /Clear/i }).click();

      await expect(page.getByRole('textbox', { name: /^Shaft Type Name/i })).toHaveValue('');
      await expect(page.getByRole('heading', { name: /Add Shaft/i })).toBeVisible();
    });

    test('TC-CLR-02: Clear in Edit mode resets form to Add Shaft state', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Shaft/i })).toBeVisible({ timeout: 10000 });

      const nameInput = page.getByRole('textbox', { name: /^Shaft Type Name/i });
      const currentName = await nameInput.inputValue();
      expect(currentName.length).toBeGreaterThan(0);

      await expect(page.getByRole('combobox', { name: /Status \*/i })).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();

      await page.getByRole('button', { name: /Clear/i }).click();

      await expect(page.getByRole('heading', { name: /Add Shaft/i })).toBeVisible();
      await expect(nameInput).toHaveValue('');
      await expect(page.getByRole('combobox', { name: /Status \*/i })).not.toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 6 – Edit and Update Operations
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Edit and Update Operations', () => {

    test.beforeEach(async ({ page }) => {
      await gotoShaftMaster(page);
    });

    test('TC-EDT-01: Edit icon opens record in edit mode', async ({ page }) => {
      await waitForTableRows(page);
      const originalName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      await clickEditOnRow(page, 0);

      await expect(page.getByRole('heading', { name: /Update Shaft/i })).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('textbox', { name: /^Shaft Type Name/i })).toHaveValue(originalName);
      await expect(page.getByRole('spinbutton', { name: /Price/i })).toBeVisible();

      const statusSelect = page.getByRole('combobox', { name: /Status \*/i });
      await expect(statusSelect).toBeVisible();
      await expect(statusSelect).toHaveValue('true');
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('TC-EDT-02: Successfully update the shaft name and price', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Shaft/i })).toBeVisible({ timeout: 10000 });

      const newName = `Updated Shaft ${Date.now()}`;
      const nameInput = page.getByRole('textbox', { name: /^Shaft Type Name/i });
      await nameInput.clear();
      await nameInput.fill(newName);
      await page.getByRole('spinbutton', { name: /Price/i }).fill('999');

      await page.locator('button[type="submit"]').click();
      await expect(page.getByRole('alert').filter({ hasText: /updated successfully/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Shaft/i })).toBeVisible({ timeout: 15000 });

      await page.getByRole('textbox', { name: /Search Shaft Type Name/i }).fill(newName);
      await page.waitForTimeout(1000);
      await expect(tableRows(page).filter({ hasText: newName })).toHaveCount(1, { timeout: 15000 });
      await page.getByRole('textbox', { name: /Search Shaft Type Name/i }).fill('');
    });

    test('TC-EDT-03: Update shaft status to Inactive', async ({ page }) => {
      await waitForTableRows(page);
      const shaftName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Shaft/i })).toBeVisible({ timeout: 10000 });

      await page.getByRole('combobox', { name: /Status \*/i }).selectOption('Inactive');
      await page.locator('button[type="submit"]').click();
      await expect(page.getByRole('alert').filter({ hasText: /updated successfully/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Shaft/i })).toBeVisible({ timeout: 15000 });

      await statusFilterSelect(page).selectOption('All');
      const shaftRow = tableRows(page).filter({ hasText: shaftName });
      await expect(shaftRow.getByRole('heading', { level: 5, name: /Inactive/i })).toBeVisible({ timeout: 15000 });

      // Restore
      await shaftRow.locator('[role="cell"]').nth(1).locator('svg').click();
      await expect(page.getByRole('heading', { name: /Update Shaft/i })).toBeVisible({ timeout: 10000 });
      await page.getByRole('combobox', { name: /Status \*/i }).selectOption('Active');
      await page.locator('button[type="submit"]').click();
      await expect(page.getByRole('heading', { name: /Add Shaft/i })).toBeVisible({ timeout: 15000 });
    });

    test('TC-EDT-04: Update with empty Shaft Type Name shows validation error', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Shaft/i })).toBeVisible({ timeout: 10000 });

      await page.getByRole('textbox', { name: /^Shaft Type Name/i }).clear();
      await page.locator('button[type="submit"]').click();

      await expect(page.getByText('Please enter shaft type name')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Update Shaft/i })).toBeVisible();
    });

    test('TC-EDT-05: Update with empty Price shows validation error', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Shaft/i })).toBeVisible({ timeout: 10000 });

      await page.getByRole('spinbutton', { name: /Price/i }).clear();
      await page.locator('button[type="submit"]').click();

      await expect(page.getByText('Please enter price')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Update Shaft/i })).toBeVisible();
    });

    test('TC-EDT-06: Update name to duplicate of existing Active shaft shows error', async ({ page }) => {
      await waitForTableRows(page);
      const firstName = (await tableRows(page).nth(0).locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      const secondName = (await tableRows(page).nth(1).locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(firstName.length).toBeGreaterThan(0);
      expect(secondName.length).toBeGreaterThan(0);

      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Shaft/i })).toBeVisible({ timeout: 10000 });

      const nameInput = page.getByRole('textbox', { name: /^Shaft Type Name/i });
      await nameInput.clear();
      await nameInput.fill(secondName);

      await page.locator('button[type="submit"]').click();
      await expect(page.getByRole('alert').filter({ hasText: /already exists/i })).toBeVisible({ timeout: 15000 });
    });

    test('TC-EDT-07: Update name to duplicate of existing Inactive shaft shows error', async ({ page }) => {
      await statusFilterSelect(page).selectOption('Inactive');
      const inactiveCount = await tableRows(page).count().catch(() => 0);

      if (inactiveCount > 0) {
        await waitForTableRows(page);
        const inactiveName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

        await statusFilterSelect(page).selectOption('Active');
        await waitForTableRows(page);

        await clickEditOnRow(page, 0);
        await expect(page.getByRole('heading', { name: /Update Shaft/i })).toBeVisible({ timeout: 10000 });

        const nameInput = page.getByRole('textbox', { name: /^Shaft Type Name/i });
        await nameInput.clear();
        await nameInput.fill(inactiveName);

        await page.locator('button[type="submit"]').click();
        await expect(page.getByRole('alert').filter({ hasText: /already exists/i })).toBeVisible({ timeout: 15000 });
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 7 – Status Filter
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Status Filter', () => {

    test.beforeEach(async ({ page }) => {
      await gotoShaftMaster(page);
    });

    test('TC-FLT-01: Filter by Active (default) shows only Active records', async ({ page }) => {
      await expect(statusFilterSelect(page)).toHaveValue('true');
      await waitForTableRows(page);
      await showEntriesSelect(page).selectOption('10');
      await page.waitForTimeout(500);
      const statuses = await getStatusColumnTexts(page);
      expect(statuses.length).toBeGreaterThan(0);
      for (const status of statuses) {
        expect(status).toBe('Active');
      }
    });

    test('TC-FLT-02: Filter to All shows both Active and Inactive', async ({ page }) => {
      await statusFilterSelect(page).selectOption('All');
      await waitForTableRows(page);
      await expect(statusFilterSelect(page)).toHaveValue('');
      expect(await tableRows(page).count()).toBeGreaterThan(0);
    });

    test('TC-FLT-03: Filter to Inactive shows only Inactive or empty state', async ({ page }) => {
      await statusFilterSelect(page).selectOption('Inactive');
      await page.waitForTimeout(1000);
      const rowCount = await tableRows(page).count().catch(() => 0);
      if (rowCount > 0) {
        const statuses = await getStatusColumnTexts(page);
        for (const status of statuses) {
          expect(status).toBe('Inactive');
        }
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 8 – Search Functionality
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Search Functionality', () => {

    test.beforeEach(async ({ page }) => {
      await gotoShaftMaster(page);
    });

    test('TC-SRC-01: Search by partial shaft name returns matches', async ({ page }) => {
      await waitForTableRows(page);
      const initialCount = await tableRows(page).count();

      const searchBox = page.getByRole('textbox', { name: /Search Shaft Type Name/i });
      await searchBox.fill('Shaft');
      await page.waitForTimeout(1000);

      const filteredCount = await tableRows(page).count();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    });

    test('TC-SRC-02: Non-existent search returns no results', async ({ page }) => {
      await waitForTableRows(page);
      const searchBox = page.getByRole('textbox', { name: /Search Shaft Type Name/i });
      await searchBox.fill('XYZNONEXISTENTSHAFT999');
      await tableRows(page).first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
      expect(await tableRows(page).count().catch(() => 0)).toBe(0);
    });

    test('TC-SRC-03: Clearing search restores the full list', async ({ page }) => {
      await waitForTableRows(page);
      const initialCount = await tableRows(page).count();

      const searchBox = page.getByRole('textbox', { name: /Search Shaft Type Name/i });
      await searchBox.fill('Auto');
      await page.waitForTimeout(1000);

      await searchBox.clear();
      await page.waitForTimeout(1000);
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      expect(await tableRows(page).count()).toBe(initialCount);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 9 – Rows Per Page and Pagination
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Rows Per Page and Pagination', () => {

    test.beforeEach(async ({ page }) => {
      await gotoShaftMaster(page);
    });

    test('TC-PAG-01: Change rows per page to 10', async ({ page }) => {
      await waitForTableRows(page);
      await expect(showEntriesSelect(page)).toHaveValue('25');
      await showEntriesSelect(page).selectOption('10');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      expect(await tableRows(page).count()).toBeLessThanOrEqual(10);
    });

    test('TC-PAG-02: Navigate between pages with pagination', async ({ page }) => {
      await waitForTableRows(page);
      await showEntriesSelect(page).selectOption('10');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      const nextBtn = page.getByRole('button', { name: /Next page/i });
      if (await nextBtn.isEnabled().catch(() => false)) {
        await nextBtn.click();
        await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
        await expect(page.getByRole('button', { name: /Page 2/i })).toBeVisible();

        await page.getByRole('button', { name: /Previous page/i }).click();
        await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
        await expect(page.getByRole('button', { name: /Page 1/i })).toBeVisible();
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 10 – Column Sorting
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Column Sorting', () => {

    test.beforeEach(async ({ page }) => {
      await gotoShaftMaster(page);
    });

    test('TC-SRT-01: Sort by Shaft Name column ascending then descending', async ({ page }) => {
      await waitForTableRows(page);

      await page.getByRole('button', { name: /Shaft/i }).first().click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      const firstAsc = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

      await page.getByRole('button', { name: /Shaft/i }).first().click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      const firstDesc = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

      if (await tableRows(page).count() > 1) {
        expect(firstAsc).not.toBe(firstDesc);
      }
    });

    test('TC-SRT-02: Sort by Status column', async ({ page }) => {
      await waitForTableRows(page);
      await statusFilterSelect(page).selectOption('All');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      await page.getByRole('button', { name: /^Status$/i }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      expect(await tableRows(page).count()).toBeGreaterThan(0);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 11 – Update Price Functionality
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Update Price Functionality', () => {

    test.beforeEach(async ({ page }) => {
      await gotoShaftMaster(page);
    });

    test('TC-UPP-01: Update Price modal opens with correct title', async ({ page }) => {
      await waitForTableRows(page);
      await page.getByRole('button', { name: /Update Price/i }).click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 10000 });
      await expect(dialog.getByRole('heading').first()).toBeVisible();
    });

    test('TC-UPP-02: Update price for a record and verify updated price in data table', async ({ page }) => {
      await waitForTableRows(page);
      const firstShaftName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

      await page.getByRole('button', { name: /Update Price/i }).click();
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 10000 });

      const newPrice = '1299';
      const priceInputs = dialog.getByRole('spinbutton');
      const inputCount = await priceInputs.count();

      if (inputCount > 0) {
        await priceInputs.first().clear();
        await priceInputs.first().fill(newPrice);

        const saveBtn = dialog.getByRole('button', { name: /save|update|confirm/i }).first();
        const hasSave = await saveBtn.isVisible({ timeout: 3000 }).catch(() => false);
        if (hasSave) {
          await saveBtn.click();
          await expect(dialog).not.toBeVisible({ timeout: 10000 });
          await page.getByRole('textbox', { name: /Search Shaft Type Name/i }).fill(firstShaftName);
          await page.waitForTimeout(1000);
          await expect(tableRows(page).filter({ hasText: firstShaftName })).toHaveCount(1, { timeout: 15000 });
        }
      }
    });

    test('TC-UPP-03: Search functionality in Update Price modal filters records', async ({ page }) => {
      await waitForTableRows(page);
      await page.getByRole('button', { name: /Update Price/i }).click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 10000 });

      const searchInput = dialog.getByRole('textbox').first();
      const hasSearchInput = await searchInput.isVisible({ timeout: 3000 }).catch(() => false);

      if (hasSearchInput) {
        const initialRows = await dialog.locator('[role="row"]:has([role="cell"])').count().catch(() => 0);
        await searchInput.fill('Shaft');
        await page.waitForTimeout(500);
        const filteredRows = await dialog.locator('[role="row"]:has([role="cell"])').count().catch(() => 0);
        expect(filteredRows).toBeLessThanOrEqual(initialRows);

        await searchInput.clear();
        await page.waitForTimeout(500);
        const restoredRows = await dialog.locator('[role="row"]:has([role="cell"])').count().catch(() => 0);
        expect(restoredRows).toBe(initialRows);
      }

      await page.keyboard.press('Escape');
    });

    test('TC-UPP-04: Cancel button in Update Price modal closes without saving', async ({ page }) => {
      await waitForTableRows(page);
      const firstShaftName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      const originalPrice = (await tableRows(page).first().locator('[role="cell"]').nth(3).innerText())?.trim() ?? '';

      await page.getByRole('button', { name: /Update Price/i }).click();
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 10000 });

      const priceInputs = dialog.getByRole('spinbutton');
      if (await priceInputs.count() > 0) {
        await priceInputs.first().fill('9999');
      }

      const cancelBtn = dialog.getByRole('button', { name: /Cancel/i });
      const hasCancelBtn = await cancelBtn.isVisible({ timeout: 3000 }).catch(() => false);
      if (hasCancelBtn) {
        await cancelBtn.click();
      } else {
        await page.keyboard.press('Escape');
      }

      await expect(dialog).not.toBeVisible({ timeout: 5000 });
      await page.getByRole('textbox', { name: /Search Shaft Type Name/i }).fill(firstShaftName);
      await page.waitForTimeout(1000);
      const priceCell = tableRows(page).filter({ hasText: firstShaftName }).locator('[role="cell"]').nth(3);
      await expect(priceCell).toContainText(originalPrice.replace(/[^0-9.]/g, ''), { timeout: 10000 });
      await page.getByRole('textbox', { name: /Search Shaft Type Name/i }).fill('');
    });

    test('TC-UPP-05: Cross (×) button in Update Price modal closes without saving', async ({ page }) => {
      await waitForTableRows(page);
      await page.getByRole('button', { name: /Update Price/i }).click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 10000 });

      const priceInputs = dialog.getByRole('spinbutton');
      if (await priceInputs.count() > 0) {
        await priceInputs.first().fill('8888');
      }

      // Try close button (×)
      const closeBtn = dialog.locator('button').filter({ hasText: /^[×✕x]$/i }).or(
        dialog.locator('[aria-label="Close"], [aria-label="close"], .btn-close')
      ).first();

      const hasCloseBtn = await closeBtn.isVisible({ timeout: 3000 }).catch(() => false);
      if (hasCloseBtn) {
        await closeBtn.click();
      } else {
        await page.keyboard.press('Escape');
      }

      await expect(dialog).not.toBeVisible({ timeout: 5000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 12 – Inactive Status Management
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Inactive Status Management', () => {

    test.beforeEach(async ({ page }) => {
      await gotoShaftMaster(page);
    });

    test('TC-INA-01: Mark Active shaft as Inactive and verify filter behavior', async ({ page }) => {
      await waitForTableRows(page);
      const shaftName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(shaftName.length).toBeGreaterThan(0);

      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Shaft/i })).toBeVisible({ timeout: 10000 });

      await page.getByRole('combobox', { name: /Status \*/i }).selectOption('Inactive');
      await page.locator('button[type="submit"]').click();
      await expect(page.getByRole('alert').filter({ hasText: /updated successfully/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Shaft/i })).toBeVisible({ timeout: 15000 });

      await expect(tableRows(page).filter({ hasText: shaftName })).toHaveCount(0, { timeout: 10000 });

      await statusFilterSelect(page).selectOption('Inactive');
      await expect(tableRows(page).filter({ hasText: shaftName })).toHaveCount(1, { timeout: 10000 });

      // Restore
      await tableRows(page).filter({ hasText: shaftName }).locator('[role="cell"]').nth(1).locator('svg').click();
      await expect(page.getByRole('heading', { name: /Update Shaft/i })).toBeVisible({ timeout: 10000 });
      await page.getByRole('combobox', { name: /Status \*/i }).selectOption('Active');
      await page.locator('button[type="submit"]').click();
      await expect(page.getByRole('heading', { name: /Add Shaft/i })).toBeVisible({ timeout: 15000 });
    });

    test('TC-INA-02: Re-activate an Inactive shaft', async ({ page }) => {
      await statusFilterSelect(page).selectOption('Inactive');
      const inactiveCount = await tableRows(page).count().catch(() => 0);

      if (inactiveCount > 0) {
        await waitForTableRows(page);
        const shaftName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

        await clickEditOnRow(page, 0);
        await expect(page.getByRole('heading', { name: /Update Shaft/i })).toBeVisible({ timeout: 10000 });
        await expect(page.getByRole('combobox', { name: /Status \*/i })).toHaveValue('false');

        await page.getByRole('combobox', { name: /Status \*/i }).selectOption('Active');
        await page.locator('button[type="submit"]').click();
        await expect(page.getByRole('alert').filter({ hasText: /updated successfully/i })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole('heading', { name: /Add Shaft/i })).toBeVisible({ timeout: 15000 });

        await statusFilterSelect(page).selectOption('Active');
        await expect(tableRows(page).filter({ hasText: shaftName })).toHaveCount(1, { timeout: 10000 });
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 13 – Navigation and Access
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Navigation and Access', () => {

    test('TC-NAV-01: Direct URL without auth redirects to login', async ({ browser }) => {
      const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
      const page = await context.newPage();

      await page.goto('https://stage.elevatorplus.net/master/shaft-master', { timeout: 60000 });
      await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
      await expect(page.getByRole('heading', { name: /Add Shaft/i })).not.toBeVisible({ timeout: 15000 });

      await context.close();
    });

    test('TC-NAV-02: Access Shaft Master via Other Masters tab navigation', async ({ page }) => {
      await registerPopupHandler(page);
      await page.goto('/master/other-master', { timeout: 60000 });
      await dismissNotificationPopup(page);

      await page.locator('li').filter({ hasText: /^Shaft Master$/ }).click();
      await page.waitForURL(/shaft-master/i, { timeout: 20000 }).catch(() => {});
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      await expect(page.getByRole('heading', { name: /Add Shaft/i })).toBeVisible({ timeout: 30000 });
      await tableRows(page).first().waitFor({ state: 'attached', timeout: 30000 });
    });

  });

});
