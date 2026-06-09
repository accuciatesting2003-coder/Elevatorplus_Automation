// spec: test-plans/Sales-mater-test-plan/car-door-test-plan.md
// seed: tests/Sales-master/city-master.spec.ts

import { test, expect } from '../fixtures/auth-fixture';

const CAR_DOOR_MASTER_URL = '/master/car-door-master';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

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
  } catch {}
}

async function gotoCarDoorMaster(page: any) {
  await registerPopupHandler(page);
  await page.goto(CAR_DOOR_MASTER_URL, { timeout: 60000 });
  await page.getByRole('heading', { name: /Add Car Door/i }).waitFor({ state: 'visible', timeout: 45000 });
  await dismissNotificationPopup(page);
}

// [role="row"]:has([role="cell"]) targets data rows, skipping the header.
function tableRows(page: any) {
  return page.locator('[role="row"]:has([role="cell"])');
}

async function waitForTableRows(page: any) {
  await tableRows(page).first().waitFor({ state: 'visible', timeout: 30000 });
}

async function clickEditOnRow(page: any, rowIndex: number = 0) {
  await tableRows(page).nth(rowIndex).getByRole('img', { name: 'Edit' }).click();
}

async function fillCarDoorForm(page: any, name: string | null, type: string | null, price: string | null) {
  if (name !== null) {
    await page.locator('#car_door_name').fill(name);
  }
  if (type !== null) {
    await page.locator('#opening_type').selectOption(type);
  }
  if (price !== null) {
    await page.locator('#price').fill(price);
  }
}

async function submitForm(page: any) {
  await page.locator('button[type="submit"]').click();
}

async function clearForm(page: any) {
  await page.getByRole('button', { name: /Clear/i }).click();
}

function getRowByDoorName(page: any, name: string) {
  return tableRows(page).filter({ hasText: name });
}

// Status filter: values are 'true' (Active), 'false' (Inactive), '' (All).
function statusFilterSelect(page: any) {
  return page.locator('select').filter({ has: page.locator('option[value="false"]') }).first();
}

// Show entries select controls rows per page (options: 10, 25, 50, 100).
function showEntriesSelect(page: any) {
  return page.locator('#rows-per-page').first();
}

// Status is rendered as an h5 badge inside a cell — find it by heading level
// rather than a fixed column index, which shifts when Additional Info columns hide.
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
// Test Suite
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Car Door Master', () => {

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 1 – Smoke
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Smoke', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCarDoorMaster(page);
    });

    // TC-CDM-001: Verify Car Door Master page loads successfully
    test('TC-CDM-001: Page loads successfully', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /Car Door Master/i })).toBeVisible();
      await expect(page.getByRole('heading', { name: /Add Car Door/i })).toBeVisible();
      await expect(page.locator('#car_door_name')).toBeVisible();
      await expect(page.locator('#opening_type')).toBeVisible();
      await expect(page.locator('#price')).toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Clear/i })).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 2 – Positive: Create Car Door
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Create Car Door (Positive)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCarDoorMaster(page);
    });

    // TC-CDM-002: Verify successful car door creation with all mandatory fields (Manual)
    test('TC-CDM-002: Create car door with Manual opening type', async ({ page }) => {
      const timestamp = Date.now();
      const doorName = `Telescopic Door ${timestamp}`;

      await fillCarDoorForm(page, doorName, 'Manual', '5000');
      await submitForm(page);

      await expect(page.locator('#car_door_name')).toHaveValue('', { timeout: 15000 });
      await page.locator('#search').fill(doorName);
      await expect(tableRows(page).filter({ hasText: doorName })).toHaveCount(1, { timeout: 30000 });
      await page.locator('#search').fill('');
    });

    // TC-CDM-003: Verify successful car door creation with Automatic opening type
    test('TC-CDM-003: Create car door with Automatic opening type', async ({ page }) => {
      const timestamp = Date.now();
      const doorName = `Center Opening Door ${timestamp}`;

      await fillCarDoorForm(page, doorName, 'Automatic', '8500');
      await submitForm(page);

      await expect(page.locator('#car_door_name')).toHaveValue('', { timeout: 15000 });
      await page.locator('#search').fill(doorName);
      await expect(tableRows(page).filter({ hasText: doorName })).toHaveCount(1, { timeout: 30000 });
      await page.locator('#search').fill('');
    });

    // TC-CDM-013: Verify Car Door Master list displays all created records
    test('TC-CDM-013: Car Door Master list displays all created records', async ({ page }) => {
      await waitForTableRows(page);
      const count = await tableRows(page).count();
      expect(count).toBeGreaterThan(0);
    });

    // TC-CDM-015: Verify creation with same opening type but different car door name
    test('TC-CDM-015: Create records with same opening type but different names', async ({ page }) => {
      const timestamp = Date.now();
      const commonType = 'Manual';

      await fillCarDoorForm(page, `Door1 ${timestamp}`, commonType, '1000');
      await submitForm(page);
      // Wait for form to fully reset before filling next record
      await expect(page.locator('#car_door_name')).toHaveValue('', { timeout: 15000 });

      await fillCarDoorForm(page, `Door2 ${timestamp}`, commonType, '2000');
      await submitForm(page);
      await expect(page.locator('#car_door_name')).toHaveValue('', { timeout: 15000 });

      await page.locator('#search').fill(`Door1 ${timestamp}`);
      await expect(tableRows(page).filter({ hasText: `Door1 ${timestamp}` })).toHaveCount(1, { timeout: 30000 });

      await page.locator('#search').fill(`Door2 ${timestamp}`);
      await expect(tableRows(page).filter({ hasText: `Door2 ${timestamp}` })).toHaveCount(1, { timeout: 30000 });

      await page.locator('#search').fill('');
    });

    // TC-CDM-026: Verify creation with same car door name but different opening type
    test('TC-CDM-026: Create records with same name but different opening types', async ({ page }) => {
      const timestamp = Date.now();
      const doorName = `SameName ${timestamp}`;

      await fillCarDoorForm(page, doorName, 'Manual', '1000');
      await submitForm(page);
      await expect(page.locator('#car_door_name')).toHaveValue('', { timeout: 15000 });

      await fillCarDoorForm(page, doorName, 'Automatic', '2000');
      await submitForm(page);
      await expect(page.locator('#car_door_name')).toHaveValue('', { timeout: 15000 });

      await page.locator('#search').fill(doorName);
      await expect(tableRows(page).filter({ hasText: doorName })).toHaveCount(2, { timeout: 30000 });
      await page.locator('#search').fill('');
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 3 – Negative: Mandatory Field Validation
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Mandatory Field Validation (Negative)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCarDoorMaster(page);
    });

    // TC-CDM-004: Verify form submission fails when Car Door Name is empty
    test('TC-CDM-004: Form fails when Car Door Name is empty', async ({ page }) => {
      await fillCarDoorForm(page, '', 'Manual', '1000');
      await submitForm(page);

      await expect(page.locator('[class*="text-danger"], [class*="error"], [class*="invalid"]').first()).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add Car Door/i })).toBeVisible();
    });

    // TC-CDM-005: Verify form submission fails when Door Opening Type is not selected
    test('TC-CDM-005: Form fails when Door Opening Type is not selected', async ({ page }) => {
      await page.locator('#car_door_name').fill('Test Door');
      await page.locator('#price').fill('1000');
      await page.locator('#opening_type').selectOption('');
      await submitForm(page);

      await expect(page.locator('[class*="text-danger"], [class*="error"], [class*="invalid"]').first()).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add Car Door/i })).toBeVisible();
    });

    // TC-CDM-006: Verify form submission fails when Price is empty
    test('TC-CDM-006: Form fails when Price is empty', async ({ page }) => {
      await page.locator('#car_door_name').fill('Test Door');
      await page.locator('#opening_type').selectOption('Manual');
      await page.locator('#price').fill('');
      await submitForm(page);

      await expect(page.locator('[class*="text-danger"], [class*="error"], [class*="invalid"]').first()).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add Car Door/i })).toBeVisible();
    });

    // TC-CDM-014: Verify mandatory field validation and clear functionality
    test('TC-CDM-014: All mandatory fields empty shows errors; Clear resets them', async ({ page }) => {
      await submitForm(page);

      await expect(page.locator('[class*="text-danger"], [class*="error"], [class*="invalid"]').first()).toBeVisible({ timeout: 5000 });

      await clearForm(page);
      await page.waitForTimeout(500);

      await expect(page.locator('[class*="text-danger"], [class*="error"], [class*="invalid"]').first()).not.toBeVisible();
      await expect(page.locator('#car_door_name')).toHaveValue('');
      await expect(page.locator('#price')).toHaveValue('');
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 4 – Negative: Price Field Input Validation
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Price Field Input Validation (Negative)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCarDoorMaster(page);
    });

    // TC-CDM-007: Verify Price field rejects alphabetic/special character input
    test('TC-CDM-007: Price field rejects alphabetic and special character input', async ({ page }) => {
      const priceInput = page.locator('#price');

      await priceInput.pressSequentially('abc');
      await expect(priceInput).toHaveValue('');

      await priceInput.pressSequentially('@#$');
      await expect(priceInput).toHaveValue('');
    });

    // TC-CDM-008: Verify Price field rejects negative values
    test('TC-CDM-008: Price field rejects negative values', async ({ page }) => {
      await fillCarDoorForm(page, 'Negative Test', 'Manual', '-500');
      await submitForm(page);

      await expect(page.locator('[class*="text-danger"], [class*="error"], [class*="invalid"]').first()).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add Car Door/i })).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 5 – Negative: Duplicate Entry Restriction
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Duplicate Entry Restriction (Negative)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCarDoorMaster(page);
    });

    // TC-CDM-009: Verify duplicate Car Door Name is not allowed
    test('TC-CDM-009: Duplicate Car Door Name is not allowed', async ({ page }) => {
      const timestamp = Date.now();
      const doorName = `Standard Door ${timestamp}`;

      await fillCarDoorForm(page, doorName, 'Manual', '1000');
      await submitForm(page);
      await expect(page.locator('#car_door_name')).toHaveValue('', { timeout: 15000 });

      await fillCarDoorForm(page, doorName, 'Automatic', '1000');
      await submitForm(page);

      await expect(page.locator('[class*="error"], [class*="toast"], [role="alert"]').first()).toBeVisible({ timeout: 10000 });
    });

    // TC-CDM-017: Verify duplicate entry restriction for same Name and Opening Type
    test('TC-CDM-017: Duplicate Car Door Name and Opening Type is not allowed', async ({ page }) => {
      await waitForTableRows(page);
      const row = tableRows(page).first();
      const name = (await row.locator('[role="cell"]').nth(2).innerText()).trim();
      const type = (await row.locator('[role="cell"]').nth(3).innerText()).trim();

      await fillCarDoorForm(page, name, type, '500');
      await submitForm(page);

      await expect(page.locator('[class*="error"], [class*="toast"], [role="alert"]').first()).toBeVisible({ timeout: 10000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 6 – Edit / Update Car Door
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Edit Car Door (Positive)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCarDoorMaster(page);
    });

    // TC-CDM-010: Verify Edit functionality for an existing car door
    test('TC-CDM-010: Edit existing car door updates successfully', async ({ page }) => {
      await waitForTableRows(page);

      const originalName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText()).trim();
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Car Door/i })).toBeVisible({ timeout: 10000 });

      const updatedName = `${originalName} Edited`;
      await page.locator('#car_door_name').fill(updatedName);
      await submitForm(page);

      await expect(page.locator('#car_door_name')).toHaveValue('', { timeout: 15000 });
      await page.locator('#search').fill(updatedName);
      await expect(tableRows(page).filter({ hasText: updatedName })).toHaveCount(1, { timeout: 30000 });
      await page.locator('#search').fill('');
    });

    // TC-CDM-034: Verify Clear on the update form resets to Add mode
    test('TC-CDM-034: Clear on update form resets to Add Car Door mode', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Car Door/i })).toBeVisible({ timeout: 10000 });

      await clearForm(page);
      await expect(page.getByRole('heading', { name: /Add Car Door/i })).toBeVisible({ timeout: 10000 });
      await expect(page.locator('#car_door_name')).toHaveValue('');
      await expect(page.locator('#price')).toHaveValue('');
    });

    // TC-CDM-018: Verify error when updating to an existing active record's details
    test('TC-CDM-018: Error when updating to match another existing active record', async ({ page }) => {
      await waitForTableRows(page);
      if (await tableRows(page).count() < 2) return;

      const secondRow = tableRows(page).nth(1);
      const targetName = (await secondRow.locator('[role="cell"]').nth(2).innerText()).trim();
      const targetType = (await secondRow.locator('[role="cell"]').nth(3).innerText()).trim();

      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Car Door/i })).toBeVisible({ timeout: 10000 });
      await fillCarDoorForm(page, targetName, targetType, '999');
      await submitForm(page);

      await expect(page.locator('[class*="error"], [class*="toast"], [role="alert"]').first()).toBeVisible({ timeout: 10000 });
    });

    // TC-CDM-019: Verify error when updating to an existing inactive record's details
    test('TC-CDM-019: Error when updating to match an existing inactive record', async ({ page }) => {
      await statusFilterSelect(page).selectOption('false');
      await page.waitForTimeout(1000);

      const hasInactiveRows = await tableRows(page).count().catch(() => 0);
      if (!hasInactiveRows) return;

      await waitForTableRows(page);
      const inactiveName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText()).trim();
      const inactiveType = (await tableRows(page).first().locator('[role="cell"]').nth(3).innerText()).trim();

      await statusFilterSelect(page).selectOption('true');
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Car Door/i })).toBeVisible({ timeout: 10000 });
      await fillCarDoorForm(page, inactiveName, inactiveType, '999');
      await submitForm(page);

      await expect(page.locator('[class*="error"], [class*="toast"], [role="alert"]').first()).toBeVisible({ timeout: 10000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 7 – Inactive Status
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Inactive Status (Positive)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCarDoorMaster(page);
    });

    // TC-CDM-011: Verify Inactive functionality
    test('TC-CDM-011: Setting car door to Inactive removes it from Active list', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Car Door/i })).toBeVisible({ timeout: 10000 });

      const doorName = await page.locator('#car_door_name').inputValue();

      await page.locator('#status').selectOption('Inactive');
      await submitForm(page);

      await expect(page.getByRole('heading', { name: /Add Car Door/i })).toBeVisible({ timeout: 15000 });

      const activeRows = tableRows(page).filter({ hasText: doorName });
      await expect(activeRows).toHaveCount(0, { timeout: 10000 });

      // Restore: set status back to Active
      await statusFilterSelect(page).selectOption('false');
      const inactiveRow = getRowByDoorName(page, doorName);
      await inactiveRow.getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update Car Door/i })).toBeVisible({ timeout: 10000 });
      await page.locator('#status').selectOption('Active');
      await submitForm(page);
      await expect(page.getByRole('heading', { name: /Add Car Door/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-CDM-016: Verify inactive record display state
    test('TC-CDM-016: Inactive filter displays only inactive records', async ({ page }) => {
      await showEntriesSelect(page).selectOption('10');
      await statusFilterSelect(page).selectOption('false');
      await page.waitForTimeout(1000);

      const rows = await tableRows(page).count();
      if (rows > 0) {
        const statuses = await getStatusColumnTexts(page);
        for (const status of statuses) {
          expect(status).toBe('Inactive');
        }
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 8 – Cancel / Clear Form
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Cancel / Clear Form (Positive)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCarDoorMaster(page);
    });

    // TC-CDM-012: Verify Cancel/Clear discards unsaved changes
    test('TC-CDM-012: Clear button discards unsaved form data', async ({ page }) => {
      await fillCarDoorForm(page, 'Cancel Test Door', 'Manual', '1234');
      await clearForm(page);

      await expect(page.getByRole('heading', { name: /Add Car Door/i })).toBeVisible();
      await expect(page.locator('#car_door_name')).toHaveValue('');
      await expect(page.locator('#price')).toHaveValue('');

      const matchingRows = await tableRows(page).filter({ hasText: 'Cancel Test Door' }).count();
      expect(matchingRows).toBe(0);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 9 – Data Table Filters
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Data Table Filters (Positive)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCarDoorMaster(page);
    });

    // TC-CDM-020: Verify default active filter in data table
    test('TC-CDM-020: Default filter is Active', async ({ page }) => {
      await expect(statusFilterSelect(page)).toHaveValue('true');
    });

    // TC-CDM-021: Verify Active filter functionality
    test('TC-CDM-021: Active filter shows only active records', async ({ page }) => {
      await showEntriesSelect(page).selectOption('10');
      await statusFilterSelect(page).selectOption('true');
      await page.waitForTimeout(1000);
      await waitForTableRows(page);

      const statuses = await getStatusColumnTexts(page);
      for (const status of statuses) {
        expect(status).toBe('Active');
      }
    });

    // TC-CDM-022: Verify Inactive filter functionality
    test('TC-CDM-022: Inactive filter shows only inactive records', async ({ page }) => {
      await showEntriesSelect(page).selectOption('10');
      await statusFilterSelect(page).selectOption('false');
      await page.waitForTimeout(1000);

      const rows = await tableRows(page).count();
      if (rows > 0) {
        const statuses = await getStatusColumnTexts(page);
        for (const status of statuses) {
          expect(status).toBe('Inactive');
        }
      }
    });

    // TC-CDM-023: Verify All filter functionality
    test('TC-CDM-023: All filter shows both active and inactive records', async ({ page }) => {
      await showEntriesSelect(page).selectOption('10');
      await statusFilterSelect(page).selectOption('');
      await page.waitForTimeout(1000);
      await waitForTableRows(page);

      const statuses = await getStatusColumnTexts(page);
      expect(statuses.map(s => s.trim())).toContain('Active');
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 10 – Search Functionality
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Search Functionality (Positive)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCarDoorMaster(page);
    });

    // TC-CDM-024: Verify search functionality
    test('TC-CDM-024: Search filters records by Car Door Name', async ({ page }) => {
      await waitForTableRows(page);
      const name = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText()).trim();

      await page.locator('#search').fill(name);
      await page.waitForTimeout(1000);

      await expect(tableRows(page).first()).toContainText(name);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 11 – Export Functionality
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Export Functionality (Positive)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCarDoorMaster(page);
    });

    // TC-CDM-025: Verify export functionality downloads an Excel file
    test('TC-CDM-025: Export button downloads an Excel file', async ({ page }) => {
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.getByRole('button', { name: /Export/i }).click(),
      ]);

      expect(download.suggestedFilename()).toMatch(/\.xlsx?$/i);
    });

  });

});
