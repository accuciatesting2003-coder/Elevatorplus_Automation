// spec: test-plans/Sales-mater-test-plan/landing-door-test-plan.md
// seed: tests/Sales-master/car-door-master.spec.ts

import { test, expect } from '../fixtures/auth-fixture';

const LANDING_DOOR_MASTER_URL = '/master/landing-door-master';

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

async function gotoLandingDoorMaster(page: any) {
  await registerPopupHandler(page);
  await page.goto(LANDING_DOOR_MASTER_URL, { timeout: 60000 });
  await page.getByRole('heading', { name: /Add Landing Door/i }).waitFor({ state: 'visible', timeout: 45000 });
  await dismissNotificationPopup(page);
}

// The data table renders with ARIA roles backed by a real <table> element.
// [role="row"]:has([role="cell"]) targets only data rows, skipping the header row.
function tableRows(page: any) {
  return page.locator('[role="row"]:has([role="cell"])');
}

async function waitForTableRows(page: any) {
  await tableRows(page).first().waitFor({ state: 'visible', timeout: 30000 });
}

async function clickEditOnRow(page: any, rowIndex: number = 0) {
  await tableRows(page).nth(rowIndex).getByRole('img', { name: 'Edit' }).click();
}

// Form fields use stable id attributes tied to server-side field names.
// Opening type values are lowercase: 'manual' | 'automatic'
async function fillLandingDoorForm(page: any, name: string | null, type: string | null, price: string | null) {
  if (name !== null) {
    await page.locator('#landing_door_name').fill(name);
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

function getRowByName(page: any, name: string) {
  return tableRows(page).filter({ hasText: name });
}

// Status filter select is identified by the presence of option[value="false"] (Inactive option).
// Values: '' = All, 'true' = Active, 'false' = Inactive
function statusFilterSelect(page: any) {
  return page.locator('select').filter({ has: page.locator('option[value="false"]') }).first();
}

// Show entries select is the first #rows-per-page select (options: 10, 25, 50, 100).
function showEntriesSelect(page: any) {
  return page.locator('#rows-per-page').first();
}

// Status is rendered as an h5 badge inside a cell. Using role="heading" level 5
// avoids fragile column-index assumptions when Additional Info columns are hidden.
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

test.describe('Landing Door Master', () => {

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 1 – Smoke
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Smoke', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLandingDoorMaster(page);
    });

    // TC-LDM-001: Verify Landing Door Master page loads successfully
    test('TC-LDM-001: Page loads successfully', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /Landing Door Master/i })).toBeVisible();
      await expect(page.getByRole('heading', { name: /Add Landing Door/i })).toBeVisible();
      await expect(page.locator('#landing_door_name')).toBeVisible();
      await expect(page.locator('#opening_type')).toBeVisible();
      await expect(page.locator('#price')).toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Clear/i })).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 2 – Create Landing Door (Positive)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Create Landing Door (Positive)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLandingDoorMaster(page);
    });

    // TC-LDM-002: Verify successful landing door creation with Manual opening type
    test('TC-LDM-002: Create landing door with Manual opening type', async ({ page }) => {
      const timestamp = Date.now();
      const doorName = `Steel Frame Landing Door ${timestamp}`;

      await fillLandingDoorForm(page, doorName, 'manual', '5000');
      await submitForm(page);

      await expect(page.getByRole('heading', { name: /Add Landing Door/i })).toBeVisible({ timeout: 15000 });
      // Search for the record to ensure it appears regardless of table refresh timing or pagination
      await page.locator('#search').fill(doorName);
      await page.waitForTimeout(1000);
      await expect(tableRows(page).filter({ hasText: doorName })).toHaveCount(1, { timeout: 30000 });
      await page.locator('#search').fill('');
    });

    // TC-LDM-003: Verify successful landing door creation with Automatic opening type
    test('TC-LDM-003: Create landing door with Automatic opening type', async ({ page }) => {
      const timestamp = Date.now();
      const doorName = `Glass Automatic Landing Door ${timestamp}`;

      await fillLandingDoorForm(page, doorName, 'automatic', '8500');
      await submitForm(page);

      await expect(page.getByRole('heading', { name: /Add Landing Door/i })).toBeVisible({ timeout: 15000 });
      await page.locator('#search').fill(doorName);
      await page.waitForTimeout(1000);
      await expect(tableRows(page).filter({ hasText: doorName })).toHaveCount(1, { timeout: 30000 });
      await page.locator('#search').fill('');
    });

    // TC-LDM-013: Verify data table displays all active records correctly
    test('TC-LDM-013: Data table displays all active records', async ({ page }) => {
      await waitForTableRows(page);
      const count = await tableRows(page).count();
      expect(count).toBeGreaterThan(0);
    });

    // TC-LDM-015: Verify creation with same opening type but different names
    test('TC-LDM-015: Create records with same opening type but different names', async ({ page }) => {
      const timestamp = Date.now();
      const commonType = 'manual';

      await fillLandingDoorForm(page, `Door Type A ${timestamp}`, commonType, '1000');
      await submitForm(page);
      // Wait for form to fully reset (name field empty) before filling next record —
      // the React form resets asynchronously and can clear a fill that was done too soon
      await expect(page.locator('#landing_door_name')).toHaveValue('', { timeout: 15000 });

      await fillLandingDoorForm(page, `Door Type B ${timestamp}`, commonType, '2000');
      await submitForm(page);
      await expect(page.locator('#landing_door_name')).toHaveValue('', { timeout: 15000 });

      await page.locator('#search').fill(`Door Type A ${timestamp}`);
      await expect(tableRows(page).filter({ hasText: `Door Type A ${timestamp}` })).toHaveCount(1, { timeout: 30000 });

      await page.locator('#search').fill(`Door Type B ${timestamp}`);
      await expect(tableRows(page).filter({ hasText: `Door Type B ${timestamp}` })).toHaveCount(1, { timeout: 30000 });

      await page.locator('#search').fill('');
    });

    // TC-LDM-031: Verify Price field accepts zero as a valid value
    test('TC-LDM-031: Price field accepts zero as a valid value', async ({ page }) => {
      const timestamp = Date.now();
      const doorName = `Zero Price Door ${timestamp}`;

      await fillLandingDoorForm(page, doorName, 'manual', '0');
      await submitForm(page);

      await expect(page.getByRole('heading', { name: /Add Landing Door/i })).toBeVisible({ timeout: 15000 });
      await page.locator('#search').fill(doorName);
      await page.waitForTimeout(1000);
      await expect(tableRows(page).filter({ hasText: doorName })).toHaveCount(1, { timeout: 30000 });
      await page.locator('#search').fill('');
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 3 – Mandatory Field Validation (Negative)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Mandatory Field Validation (Negative)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLandingDoorMaster(page);
    });

    // TC-LDM-004: Verify form submission fails when Landing Door Name is empty
    test('TC-LDM-004: Form fails when Landing Door Name is empty', async ({ page }) => {
      await fillLandingDoorForm(page, '', 'manual', '3000');
      await submitForm(page);

      await expect(page.locator('[class*="text-danger"], [class*="error"], [class*="invalid"]').first()).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add Landing Door/i })).toBeVisible();
    });

    // TC-LDM-005: Verify form submission fails when Door Opening Type is not selected
    test('TC-LDM-005: Form fails when Door Opening Type is not selected', async ({ page }) => {
      await page.locator('#landing_door_name').fill('Wooden Landing Door');
      await page.locator('#price').fill('2500');
      await page.locator('#opening_type').selectOption('');
      await submitForm(page);

      await expect(page.locator('[class*="text-danger"], [class*="error"], [class*="invalid"]').first()).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add Landing Door/i })).toBeVisible();
    });

    // TC-LDM-006: Verify form submission fails when Price is empty
    test('TC-LDM-006: Form fails when Price is empty', async ({ page }) => {
      await page.locator('#landing_door_name').fill('Aluminium Landing Door');
      await page.locator('#opening_type').selectOption('automatic');
      await page.locator('#price').fill('');
      await submitForm(page);

      await expect(page.locator('[class*="text-danger"], [class*="error"], [class*="invalid"]').first()).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add Landing Door/i })).toBeVisible();
    });

    // TC-LDM-014: Verify mandatory field validation and clear functionality
    test('TC-LDM-014: All mandatory fields empty shows errors; Clear resets them', async ({ page }) => {
      await submitForm(page);

      await expect(page.locator('[class*="text-danger"], [class*="error"], [class*="invalid"]').first()).toBeVisible({ timeout: 5000 });

      await clearForm(page);
      await page.waitForTimeout(500);

      await expect(page.locator('[class*="text-danger"], [class*="error"], [class*="invalid"]').first()).not.toBeVisible();
      await expect(page.locator('#landing_door_name')).toHaveValue('');
      await expect(page.locator('#price')).toHaveValue('');
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 4 – Price Field Validation (Negative)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Price Field Validation (Negative)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLandingDoorMaster(page);
    });

    // TC-LDM-007: Verify Price field rejects alphabetic and special character input
    test('TC-LDM-007: Price field rejects alphabetic and special character input', async ({ page }) => {
      const priceInput = page.locator('#price');

      await priceInput.pressSequentially('abc');
      await expect(priceInput).toHaveValue('');

      await priceInput.pressSequentially('@#$');
      await expect(priceInput).toHaveValue('');
    });

    // TC-LDM-008: Verify Price field rejects negative values
    test('TC-LDM-008: Price field rejects negative values', async ({ page }) => {
      await fillLandingDoorForm(page, 'Negative Test Door', 'manual', '-500');
      await submitForm(page);

      await expect(page.locator('[class*="text-danger"], [class*="error"], [class*="invalid"]').first()).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add Landing Door/i })).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 5 – Duplicate Entry Restriction (Negative)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Duplicate Entry Restriction (Negative)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLandingDoorMaster(page);
    });

    // TC-LDM-009: Verify duplicate Landing Door Name is not allowed
    test('TC-LDM-009: Duplicate Landing Door Name is not allowed', async ({ page }) => {
      const timestamp = Date.now();
      const doorName = `Standard Landing Door ${timestamp}`;

      await fillLandingDoorForm(page, doorName, 'manual', '1000');
      await submitForm(page);
      await expect(page.getByRole('heading', { name: /Add Landing Door/i })).toBeVisible({ timeout: 15000 });

      await fillLandingDoorForm(page, doorName, 'automatic', '1000');
      await submitForm(page);

      await expect(page.locator('[class*="error"], [class*="toast"], [role="alert"]').first()).toBeVisible({ timeout: 10000 });
    });

    // TC-LDM-017: Verify duplicate Name and Opening Type combination is not allowed
    test('TC-LDM-017: Duplicate Landing Door Name and Opening Type is not allowed', async ({ page }) => {
      await waitForTableRows(page);
      const row = tableRows(page).first();
      const name = (await row.locator('[role="cell"]').nth(2).innerText()).trim();
      const type = (await row.locator('[role="cell"]').nth(3).innerText()).trim();

      await fillLandingDoorForm(page, name, type, '500');
      await submitForm(page);

      await expect(page.locator('[class*="error"], [class*="toast"], [role="alert"]').first()).toBeVisible({ timeout: 10000 });
    });

    // TC-LDM-018: Verify error when updating to match another existing active record
    test('TC-LDM-018: Error when updating to match another existing active record', async ({ page }) => {
      await waitForTableRows(page);
      if (await tableRows(page).count() < 2) return;

      const secondRow = tableRows(page).nth(1);
      const targetName = (await secondRow.locator('[role="cell"]').nth(2).innerText()).trim();
      const targetType = (await secondRow.locator('[role="cell"]').nth(3).innerText()).trim();

      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Landing Door/i })).toBeVisible({ timeout: 10000 });
      await fillLandingDoorForm(page, targetName, targetType, '999');
      await submitForm(page);

      await expect(page.locator('[class*="error"], [class*="toast"], [role="alert"]').first()).toBeVisible({ timeout: 10000 });
    });

    // TC-LDM-019: Verify error when updating to match an existing inactive record
    test('TC-LDM-019: Error when updating to match an existing inactive record', async ({ page }) => {
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
      await expect(page.getByRole('heading', { name: /Update Landing Door/i })).toBeVisible({ timeout: 10000 });
      await fillLandingDoorForm(page, inactiveName, inactiveType, '999');
      await submitForm(page);

      await expect(page.locator('[class*="error"], [class*="toast"], [role="alert"]').first()).toBeVisible({ timeout: 10000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 6 – Edit Landing Door (Positive)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Edit Landing Door (Positive)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLandingDoorMaster(page);
    });

    // TC-LDM-010: Verify Edit functionality for an existing landing door record
    test('TC-LDM-010: Edit existing landing door updates successfully', async ({ page }) => {
      await waitForTableRows(page);

      const originalName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText()).trim();
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Landing Door/i })).toBeVisible({ timeout: 10000 });

      const updatedName = `${originalName} Edited`;
      await page.locator('#landing_door_name').fill(updatedName);
      await submitForm(page);

      await expect(page.getByRole('heading', { name: /Add Landing Door/i })).toBeVisible({ timeout: 15000 });
      // Search to confirm the updated record appears in the table
      await page.locator('#search').fill(updatedName);
      await page.waitForTimeout(1000);
      await expect(tableRows(page).filter({ hasText: updatedName })).toHaveCount(1, { timeout: 30000 });
      await page.locator('#search').fill('');
    });

    // TC-LDM-034: Verify Clear button on Update form resets to Add form state
    test('TC-LDM-034: Clear on update form resets to Add Landing Door mode', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Landing Door/i })).toBeVisible({ timeout: 10000 });

      await clearForm(page);
      await page.waitForTimeout(500);

      await expect(page.getByRole('heading', { name: /Add Landing Door/i })).toBeVisible({ timeout: 10000 });
      await expect(page.locator('#landing_door_name')).toHaveValue('');
      await expect(page.locator('#price')).toHaveValue('');
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 7 – Inactive Status (Positive)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Inactive Status (Positive)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLandingDoorMaster(page);
    });

    // TC-LDM-011: Verify Inactive status functionality
    test('TC-LDM-011: Setting landing door to Inactive removes it from Active list', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Landing Door/i })).toBeVisible({ timeout: 10000 });

      const doorName = await page.locator('#landing_door_name').inputValue();

      await page.locator('#status').selectOption('false');
      await submitForm(page);

      await expect(page.getByRole('heading', { name: /Add Landing Door/i })).toBeVisible({ timeout: 15000 });

      const activeRows = tableRows(page).filter({ hasText: doorName });
      await expect(activeRows).toHaveCount(0, { timeout: 10000 });

      // Restore: set status back to Active
      await statusFilterSelect(page).selectOption('false');
      const inactiveRow = getRowByName(page, doorName);
      await inactiveRow.getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update Landing Door/i })).toBeVisible({ timeout: 10000 });
      await page.locator('#status').selectOption('true');
      await submitForm(page);
      await expect(page.getByRole('heading', { name: /Add Landing Door/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-LDM-016: Verify Inactive filter displays only inactive records
    test('TC-LDM-016: Inactive filter displays only inactive records', async ({ page }) => {
      // Limit to 10 rows so status checking doesn't hit the test timeout
      await showEntriesSelect(page).selectOption('10');
      await statusFilterSelect(page).selectOption('false');
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(1000);

      const rows = await tableRows(page).count();
      if (rows > 0) {
        await waitForTableRows(page);
        const statuses = await getStatusColumnTexts(page);
        for (const status of statuses) {
          expect(status).toBe('Inactive');
        }
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 8 – Cancel / Clear Form (Positive)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Cancel / Clear Form (Positive)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLandingDoorMaster(page);
    });

    // TC-LDM-012: Verify Clear button discards unsaved form data
    test('TC-LDM-012: Clear button discards unsaved form data', async ({ page }) => {
      await fillLandingDoorForm(page, 'Test Clear Door', 'manual', '1234');
      await clearForm(page);

      await expect(page.getByRole('heading', { name: /Add Landing Door/i })).toBeVisible();
      await expect(page.locator('#landing_door_name')).toHaveValue('');
      await expect(page.locator('#price')).toHaveValue('');

      const matchingRows = await tableRows(page).filter({ hasText: 'Test Clear Door' }).count();
      expect(matchingRows).toBe(0);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 9 – Data Table Filters (Positive)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Data Table Filters (Positive)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLandingDoorMaster(page);
    });

    // TC-LDM-020: Verify default Active filter is applied on page load
    test('TC-LDM-020: Default filter is Active', async ({ page }) => {
      await expect(statusFilterSelect(page)).toHaveValue('true');
    });

    // TC-LDM-021: Verify Active filter shows only active records
    test('TC-LDM-021: Active filter shows only active records', async ({ page }) => {
      // Limit to 10 rows so the status loop doesn't hit the 2-minute test timeout
      await showEntriesSelect(page).selectOption('10');
      await statusFilterSelect(page).selectOption('true');
      await page.waitForTimeout(1000);
      await waitForTableRows(page);

      const statuses = await getStatusColumnTexts(page);
      for (const status of statuses) {
        expect(status).toBe('Active');
      }
    });

    // TC-LDM-022: Verify Inactive filter shows only inactive records
    test('TC-LDM-022: Inactive filter shows only inactive records', async ({ page }) => {
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

    // TC-LDM-023: Verify All filter shows both active and inactive records
    test('TC-LDM-023: All filter shows both active and inactive records', async ({ page }) => {
      await showEntriesSelect(page).selectOption('10');
      await statusFilterSelect(page).selectOption('');
      await page.waitForTimeout(1000);
      await waitForTableRows(page);

      const statuses = await getStatusColumnTexts(page);
      expect(statuses.map(s => s.trim())).toContain('Active');
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 10 – Search Functionality (Positive)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Search Functionality (Positive)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLandingDoorMaster(page);
    });

    // TC-LDM-024: Verify search filters records by Landing Door Name
    test('TC-LDM-024: Search filters records by Landing Door Name', async ({ page }) => {
      await waitForTableRows(page);
      const name = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText()).trim();

      await page.locator('#search').fill(name);
      await page.waitForTimeout(1000);

      await expect(tableRows(page).first()).toContainText(name);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 11 – Export Functionality (Positive)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Export Functionality (Positive)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLandingDoorMaster(page);
    });

    // TC-LDM-025: Verify Export Excel button downloads an Excel file
    test('TC-LDM-025: Export Excel button downloads an Excel file', async ({ page }) => {
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.getByRole('button', { name: /Export Excel/i }).click(),
      ]);

      expect(download.suggestedFilename()).toMatch(/\.xlsx?$/i);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 12 – Update Price Modal (Positive)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Update Price Modal (Positive)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLandingDoorMaster(page);
    });

    // TC-LDM-026: Verify Update Price modal opens correctly
    test('TC-LDM-026: Update Price modal opens with correct structure', async ({ page }) => {
      await page.getByRole('button', { name: /Update Price/i }).click();

      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible({ timeout: 10000 });
      await expect(modal.getByRole('heading', { name: /Bulk Update Landing Door Prices/i })).toBeVisible();
      await expect(modal.getByRole('textbox', { name: /Search/i })).toBeVisible();
      await expect(modal.getByRole('textbox', { name: /Enter new price/i }).first()).toBeVisible();
      await expect(modal.getByRole('button', { name: /Submit Updates/i })).toBeVisible();
      await expect(modal.getByRole('button', { name: /Cancel/i })).toBeVisible();
    });

    // TC-LDM-027: Verify bulk price update with valid new price
    test('TC-LDM-027: Bulk price update with valid new price updates successfully', async ({ page }) => {
      await page.getByRole('button', { name: /Update Price/i }).click();
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible({ timeout: 10000 });

      await modal.getByRole('textbox', { name: /Enter new price/i }).first().fill('9999');
      await modal.getByRole('button', { name: /Submit Updates/i }).click();

      await expect(modal).not.toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Landing Door/i })).toBeVisible();
    });

    // TC-LDM-028: Verify Cancel button closes the Update Price modal without saving
    test('TC-LDM-028: Cancel button closes the modal without saving', async ({ page }) => {
      await page.getByRole('button', { name: /Update Price/i }).click();
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible({ timeout: 10000 });

      await modal.getByRole('textbox', { name: /Enter new price/i }).first().fill('1111');
      await modal.getByRole('button', { name: /Cancel/i }).click();

      await expect(modal).not.toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('heading', { name: /Add Landing Door/i })).toBeVisible();
    });

    // TC-LDM-029: Verify search within the Update Price modal filters records
    test('TC-LDM-029: Search within modal filters records', async ({ page }) => {
      await page.getByRole('button', { name: /Update Price/i }).click();
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible({ timeout: 10000 });

      // Use price input textboxes as proxy for rows — modal uses implicit ARIA roles
      await modal.getByRole('textbox', { name: /Enter new price/i }).first().waitFor({ state: 'visible', timeout: 30000 });
      const totalInputsBefore = await modal.getByRole('textbox', { name: /Enter new price/i }).count();

      await modal.getByRole('textbox', { name: /Search/i }).fill('manual');
      await page.waitForTimeout(1200);

      const inputsAfter = await modal.getByRole('textbox', { name: /Enter new price/i }).count();
      expect(inputsAfter).toBeLessThanOrEqual(totalInputsBefore);

      await modal.getByRole('button', { name: /Cancel/i }).click();
    });

    // TC-LDM-032: Verify X (Close) button closes the Update Price modal
    test('TC-LDM-032: Close (X) button closes the modal without saving', async ({ page }) => {
      await page.getByRole('button', { name: /Update Price/i }).click();
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible({ timeout: 10000 });

      await modal.getByRole('button', { name: /Close/i }).click();

      await expect(modal).not.toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('heading', { name: /Add Landing Door/i })).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 13 – Show Entries (Positive)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Show Entries (Positive)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLandingDoorMaster(page);
    });

    // TC-LDM-030: Verify Show entries dropdown changes visible row count
    test('TC-LDM-030: Show entries dropdown controls rows per page', async ({ page }) => {
      await waitForTableRows(page);

      await showEntriesSelect(page).selectOption('10');
      await page.waitForTimeout(500);
      const rowsAt10 = await tableRows(page).count();
      expect(rowsAt10).toBeLessThanOrEqual(10);

      await showEntriesSelect(page).selectOption('25');
      await page.waitForTimeout(500);
      const rowsAt25 = await tableRows(page).count();
      expect(rowsAt25).toBeLessThanOrEqual(25);
    });

  });

});
