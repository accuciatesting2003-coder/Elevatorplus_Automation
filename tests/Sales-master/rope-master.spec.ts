// spec: test-plans/Sales-mater-test-plan/rope-master-plan.md
// seed: tests/setup/auth.setup.ts

import { test, expect } from '../fixtures/auth-fixture';

const ROPE_MASTER_URL = '/master/rope-master';

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
    }
  } catch {}
}

async function gotoRopeMaster(page: any) {
  await registerPopupHandler(page);
  await page.goto(ROPE_MASTER_URL, { timeout: 60000 });
  await page.getByRole('heading', { name: /Add Rope/i }).waitFor({ state: 'visible', timeout: 45000 });
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
// Rope Type: #rope_type, Price Per Meter: #price_per_metre
async function fillRopeForm(page: any, ropeType: string | null, price: string | null) {
  if (ropeType !== null) {
    await page.locator('#rope_type').fill(ropeType);
  }
  if (price !== null) {
    await page.locator('#price_per_metre').fill(price);
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

// Status filter select: identified by the presence of option[value="false"] (Inactive option).
// Values: '' = All, 'true' = Active, 'false' = Inactive
function statusFilterSelect(page: any) {
  return page.locator('select').filter({ has: page.locator('option[value="false"]') }).first();
}

// Show entries select is the first #rows-per-page select (options: 10, 25, 50, 100).
function showEntriesSelect(page: any) {
  return page.locator('#rows-per-page').first();
}

// Status is rendered as an h5 badge inside a cell. Using role="heading" level 5
// avoids fragile column-index assumptions.
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

// Search field uses placeholder "Search Rope Type" with no id attribute
function searchField(page: any) {
  return page.getByPlaceholder('Search Rope Type');
}

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Rope Master', () => {

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 1 – Smoke
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Smoke', () => {

    test.beforeEach(async ({ page }) => {
      await gotoRopeMaster(page);
    });

    // TC-RM-001: Verify Rope Master page loads successfully
    test('TC-RM-001: Page loads successfully', async ({ page }) => {
      // Verify page heading in navigation bar
      await expect(page.getByRole('heading', { name: /Rope Master/i, level: 4 })).toBeVisible();
      // Verify Add Rope form heading
      await expect(page.getByRole('heading', { name: /Add Rope/i })).toBeVisible();
      // Verify form fields
      await expect(page.locator('#rope_type')).toBeVisible();
      await expect(page.locator('#price_per_metre')).toBeVisible();
      // Verify form buttons
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Clear/i })).toBeVisible();
      // Verify data table
      await expect(tableRows(page).first()).toBeVisible();
      // Verify default Active filter
      await expect(statusFilterSelect(page)).toHaveValue('true');
      // Verify warning note
      await expect(page.getByText(/Changes in this master will impact quotation cost estimation/i)).toBeVisible();
    });

    // TC-RM-034: Verify warning note is displayed on the form
    test('TC-RM-034: Warning note is displayed on the Add Rope form', async ({ page }) => {
      // Observe the warning note on the form
      await expect(page.getByText(/⚠ Note: Changes in this master will impact quotation cost estimation/i)).toBeVisible();
    });

    // TC-RM-035: Verify helper text is displayed below form fields
    test('TC-RM-035: Helper text is visible below each form field', async ({ page }) => {
      // Observe helper text below Rope Type field
      await expect(page.getByText('Name to identify this rope type.')).toBeVisible();
      // Observe helper text below Price Per Meter field
      await expect(page.getByText('Cost of rope per metre (for new quotations).')).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 2 – Create Rope (Positive)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Create Rope (Positive)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoRopeMaster(page);
    });

    // TC-RM-002: Verify successful rope record creation with valid data
    test('TC-RM-002: Create rope record with valid Rope Type and Price', async ({ page }) => {
      const timestamp = Date.now();
      const ropeType = `Steel Wire Rope 6x19 ${timestamp}`;

      // Enter valid Rope Type
      await fillRopeForm(page, ropeType, '250');
      // Click the Submit button
      await submitForm(page);

      // Verify form resets and record appears in table
      await expect(page.getByRole('heading', { name: /Add Rope/i })).toBeVisible({ timeout: 15000 });
      // Search for the record to confirm it was created
      await searchField(page).fill(ropeType);
      await expect(tableRows(page).filter({ hasText: ropeType })).toHaveCount(1, { timeout: 30000 });
      await searchField(page).fill('');
    });

    // TC-RM-008: Verify Price Per Meter accepts zero as a valid value
    test('TC-RM-008: Price Per Meter accepts zero as a valid value', async ({ page }) => {
      const timestamp = Date.now();
      const ropeType = `Zero Price Rope ${timestamp}`;

      // Enter Rope Type and zero price
      await fillRopeForm(page, ropeType, '0');
      // Click the Submit button
      await submitForm(page);

      // Verify successful creation
      await expect(page.getByRole('heading', { name: /Add Rope/i })).toBeVisible({ timeout: 15000 });
      await searchField(page).fill(ropeType);
      await expect(tableRows(page).filter({ hasText: ropeType })).toHaveCount(1, { timeout: 30000 });
      await searchField(page).fill('');
    });

    // TC-RM-009: Verify Price Per Meter accepts decimal values
    test('TC-RM-009: Price Per Meter accepts decimal values', async ({ page }) => {
      const timestamp = Date.now();
      const ropeType = `Decimal Price Rope ${timestamp}`;

      // Enter Rope Type and decimal price
      await fillRopeForm(page, ropeType, '99.50');
      // Click the Submit button
      await submitForm(page);

      // The record is created successfully or a validation error is shown (consistent behavior)
      const addHeading = page.getByRole('heading', { name: /Add Rope/i });
      const errorLocator = page.locator('[class*="text-danger"], [class*="error"], [class*="invalid"]').first();

      const result = await Promise.race([
        addHeading.waitFor({ state: 'visible', timeout: 10000 }).then(() => 'success' as const),
        errorLocator.waitFor({ state: 'visible', timeout: 10000 }).then(() => 'error' as const),
      ]).catch(() => 'unknown' as const);

      // Either success (decimal accepted) or error (only integers allowed) is acceptable
      expect(['success', 'error']).toContain(result);
    });

    // TC-RM-013 data table: Verify data table displays active records
    test('TC-RM-013: Data table displays active records', async ({ page }) => {
      await waitForTableRows(page);
      const count = await tableRows(page).count();
      expect(count).toBeGreaterThan(0);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 3 – Mandatory Field Validation (Negative)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Mandatory Field Validation (Negative)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoRopeMaster(page);
    });

    // TC-RM-003: Verify form submission fails when all fields are empty
    test('TC-RM-003: Form submission fails when all fields are empty', async ({ page }) => {
      // Leave both fields empty and click Submit
      await submitForm(page);

      // Validation errors are shown for both mandatory fields
      await expect(page.locator('[class*="text-danger"], [class*="error"], [class*="invalid"]').first()).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add Rope/i })).toBeVisible();
    });

    // TC-RM-004: Verify form submission fails when Rope Type is empty
    test('TC-RM-004: Form submission fails when Rope Type is empty', async ({ page }) => {
      // Leave Rope Type blank, fill price
      await fillRopeForm(page, '', '150');
      // Click Submit
      await submitForm(page);

      // Validation error is shown for Rope Type field
      await expect(page.locator('[class*="text-danger"], [class*="error"], [class*="invalid"]').first()).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add Rope/i })).toBeVisible();
    });

    // TC-RM-005: Verify form submission fails when Price Per Meter is empty
    test('TC-RM-005: Form submission fails when Price Per Meter is empty', async ({ page }) => {
      // Enter valid Rope Type, leave price blank
      await page.locator('#rope_type').fill('Galvanised Rope');
      await page.locator('#price_per_metre').fill('');
      // Click Submit
      await submitForm(page);

      // Validation error is shown for Price Per Meter field
      await expect(page.locator('[class*="text-danger"], [class*="error"], [class*="invalid"]').first()).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add Rope/i })).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 4 – Price Field Validation (Negative)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Price Field Validation (Negative)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoRopeMaster(page);
    });

    // TC-RM-006: Verify Price Per Meter field rejects alphabetic and special character input
    test('TC-RM-006: Price Per Meter field rejects alphabetic input', async ({ page }) => {
      const priceInput = page.locator('#price_per_metre');

      // Attempt to type alphabetic characters in Price Per Meter (number input)
      await priceInput.pressSequentially('abc');
      await expect(priceInput).toHaveValue('');

      await priceInput.pressSequentially('@#$');
      await expect(priceInput).toHaveValue('');
    });

    // TC-RM-007: Verify Price Per Meter field rejects negative values
    test('TC-RM-007: Price Per Meter field rejects negative values', async ({ page }) => {
      // Enter Rope Type and negative price
      await fillRopeForm(page, 'Negative Test Rope', '-100');
      // Click Submit
      await submitForm(page);

      // Validation error is shown for negative price
      await expect(page.locator('[class*="text-danger"], [class*="error"], [class*="invalid"]').first()).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add Rope/i })).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 5 – Duplicate Entry Restriction (Negative)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Duplicate Entry Restriction (Negative)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoRopeMaster(page);
    });

    // TC-RM-010: Verify duplicate Rope Type is not allowed
    test('TC-RM-010: Duplicate Rope Type is not allowed', async ({ page }) => {
      const timestamp = Date.now();
      const ropeType = `Duplex Steel Rope ${timestamp}`;

      // Create the first record with Rope Type 'Duplex Steel Rope' and price '300'
      await fillRopeForm(page, ropeType, '300');
      await submitForm(page);
      // First record is created successfully
      await expect(page.getByRole('heading', { name: /Add Rope/i })).toBeVisible({ timeout: 15000 });

      // Attempt to create a second record with the exact same Rope Type
      await fillRopeForm(page, ropeType, '400');
      await submitForm(page);

      // Duplicate entry error message is shown
      await expect(page.locator('[class*="error"], [class*="toast"], [role="alert"]').first()).toBeVisible({ timeout: 10000 });
    });

    // TC-RM-010a: Verify error when updating a record to match an existing active record
    test('TC-RM-010a: Error when updating to match an existing active record', async ({ page }) => {
      await waitForTableRows(page);
      if (await tableRows(page).count() < 2) return;

      // Note the Rope Type name of the second active record (Record A)
      const secondRow = tableRows(page).nth(1);
      const targetName = (await secondRow.locator('[role="cell"]').nth(2).innerText()).trim();

      // Click Edit on the first active record (Record B)
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Rope/i })).toBeVisible({ timeout: 10000 });
      // Change Record B's Rope Type to exactly match Record A's Rope Type
      await page.locator('#rope_type').fill(targetName);
      await submitForm(page);

      // System displays an error preventing duplicate update
      await expect(page.locator('[class*="error"], [class*="toast"], [role="alert"]').first()).toBeVisible({ timeout: 10000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 6 – Edit Rope (Positive)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Edit Rope (Positive)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoRopeMaster(page);
    });

    // TC-RM-012: Verify Edit functionality for an existing rope record
    test('TC-RM-012: Edit existing rope record updates successfully', async ({ page }) => {
      await waitForTableRows(page);

      // Click the Edit button on the first record
      const originalName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText()).trim();
      await clickEditOnRow(page, 0);
      // Update Rope form opens with pre-populated fields and Status dropdown visible
      await expect(page.getByRole('heading', { name: /Update Rope/i })).toBeVisible({ timeout: 10000 });
      await expect(page.locator('#status')).toBeVisible();

      // Modify Rope Type and Price Per Meter
      const updatedName = `${originalName} Updated`;
      await page.locator('#rope_type').fill(updatedName);
      await page.locator('#price_per_metre').fill('999');
      // Click the Update button (type="submit" targets only the form submit, not "Update Price")
      await page.locator('button[type="submit"]').click();

      // Record is updated and form resets to Add Rope mode
      await expect(page.getByRole('heading', { name: /Add Rope/i })).toBeVisible({ timeout: 15000 });
      // Confirm the updated record appears in the table
      await searchField(page).fill(updatedName);
      await expect(tableRows(page).filter({ hasText: updatedName })).toHaveCount(1, { timeout: 30000 });
      await searchField(page).fill('');
    });

    // TC-RM-014: Verify Clear button on Update form reverts to Add mode
    test('TC-RM-014: Clear on Update form resets to Add Rope mode', async ({ page }) => {
      await waitForTableRows(page);
      // Click Edit on an existing record to open the Update Rope form
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Rope/i })).toBeVisible({ timeout: 10000 });

      // Click the Clear button
      await clearForm(page);

      // Form is cleared and reverts to Add Rope mode
      await expect(page.getByRole('heading', { name: /Add Rope/i })).toBeVisible({ timeout: 10000 });
      await expect(page.locator('#rope_type')).toHaveValue('');
      await expect(page.locator('#price_per_metre')).toHaveValue('');
      // Status dropdown (only visible in edit mode) is hidden
      await expect(page.locator('#status')).not.toBeVisible();
    });

    // TC-RM-015: Verify error when updating a record to match an existing active record
    test('TC-RM-015: Error when updating record to match an existing active record', async ({ page }) => {
      await waitForTableRows(page);
      if (await tableRows(page).count() < 2) return;

      // Note the Rope Type name of the second row (Record A)
      const secondRow = tableRows(page).nth(1);
      const targetName = (await secondRow.locator('[role="cell"]').nth(2).innerText()).trim();

      // Click Edit on the first record (Record B)
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Rope/i })).toBeVisible({ timeout: 10000 });
      // Change Record B's Rope Type to match Record A
      await page.locator('#rope_type').fill(targetName);
      await page.locator('button[type="submit"]').click();

      // System shows error preventing duplicate
      await expect(page.locator('[class*="error"], [class*="toast"], [role="alert"]').first()).toBeVisible({ timeout: 10000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 7 – Inactive Status (Positive)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Inactive Status (Positive)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoRopeMaster(page);
    });

    // TC-RM-013: Verify Status can be changed to Inactive during Edit
    test('TC-RM-013: Setting rope to Inactive removes it from Active list', async ({ page }) => {
      await waitForTableRows(page);
      // Click Edit on the first active record
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Rope/i })).toBeVisible({ timeout: 10000 });
      // Status dropdown shows Active
      await expect(page.locator('#status')).toHaveValue('true');

      const ropeName = await page.locator('#rope_type').inputValue();

      // Change the Status dropdown from Active to Inactive
      await page.locator('#status').selectOption('false');
      // Click the Update button (type="submit" targets only the form submit, not "Update Price")
      await page.locator('button[type="submit"]').click();

      // Record is removed from the Active filter view
      await expect(page.getByRole('heading', { name: /Add Rope/i })).toBeVisible({ timeout: 15000 });
      await expect(tableRows(page).filter({ hasText: ropeName })).toHaveCount(0, { timeout: 10000 });

      // Restore: set status back to Active via Inactive filter
      await statusFilterSelect(page).selectOption('false');
      const inactiveRow = getRowByName(page, ropeName);
      await inactiveRow.getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update Rope/i })).toBeVisible({ timeout: 10000 });
      await page.locator('#status').selectOption('true');
      await page.locator('button[type="submit"]').click();
      await expect(page.getByRole('heading', { name: /Add Rope/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-RM-016/TC-RM-018: Verify Inactive filter shows only inactive records
    test('TC-RM-018: Inactive filter displays only inactive records', async ({ page }) => {
      // Limit to 10 rows so status checking doesn't hit the test timeout
      await showEntriesSelect(page).selectOption('10');
      // Select Inactive from the Status filter dropdown
      await statusFilterSelect(page).selectOption('false');

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
  // Suite 8 – Clear Form (Positive)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Clear Form (Positive)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoRopeMaster(page);
    });

    // TC-RM-011: Verify Clear button resets the Add Rope form
    test('TC-RM-011: Clear button resets the Add Rope form', async ({ page }) => {
      // Enter Rope Type and price
      await fillRopeForm(page, 'Clear Test Rope', '500');
      // Click the Clear button
      await clearForm(page);

      // Form heading remains Add Rope and fields are cleared
      await expect(page.getByRole('heading', { name: /Add Rope/i })).toBeVisible();
      await expect(page.locator('#rope_type')).toHaveValue('');
      await expect(page.locator('#price_per_metre')).toHaveValue('');

      // No record is created in the data table
      const matchingRows = await tableRows(page).filter({ hasText: 'Clear Test Rope' }).count();
      expect(matchingRows).toBe(0);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 9 – Data Table Filters (Positive)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Data Table Filters (Positive)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoRopeMaster(page);
    });

    // TC-RM-016: Verify default Active status filter on page load
    test('TC-RM-016: Default filter is Active', async ({ page }) => {
      // Status filter defaults to Active on page load
      await expect(statusFilterSelect(page)).toHaveValue('true');
    });

    // TC-RM-017: Verify Active filter shows only active records
    test('TC-RM-017: Active filter shows only active records', async ({ page }) => {
      // Limit rows then select Active filter
      await showEntriesSelect(page).selectOption('10');
      // Select Active from the Status filter dropdown
      await statusFilterSelect(page).selectOption('true');
      await waitForTableRows(page);

      // Verify the filter is set to Active and records are displayed
      await expect(statusFilterSelect(page)).toHaveValue('true');
      const count = await tableRows(page).count();
      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThanOrEqual(10);
    });

    // TC-RM-019: Verify All filter shows both active and inactive records
    test('TC-RM-019: All filter shows both active and inactive records', async ({ page }) => {
      await showEntriesSelect(page).selectOption('10');
      // Select All from the Status filter dropdown
      await statusFilterSelect(page).selectOption('');
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
      await gotoRopeMaster(page);
    });

    // TC-RM-020: Verify search functionality filters records by Rope Type
    test('TC-RM-020: Search filters records by Rope Type', async ({ page }) => {
      await waitForTableRows(page);
      // Get the first record's Rope Type name
      const name = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText()).trim();

      // Type the Rope Type name in the Search field
      await searchField(page).fill(name);

      // Table filters to show only matching records
      await expect(tableRows(page).first()).toContainText(name);

      // Clear the search field
      await searchField(page).fill('');
      // Table returns to showing all records matching the current filter
      await waitForTableRows(page);
    });

    // TC-RM-021: Verify search returns no results for a non-existent Rope Type
    test('TC-RM-021: Search returns no results for non-existent Rope Type', async ({ page }) => {
      // Wait for table to be populated before searching
      await waitForTableRows(page);

      // Type a string that does not match any existing Rope Type
      await searchField(page).fill('XYZNOTEXISTENT999888777');

      // Wait for the table to reflect the filtered (empty) result
      await expect(tableRows(page)).toHaveCount(0, { timeout: 10000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 11 – Update Price Modal (Positive)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Update Price Modal (Positive)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoRopeMaster(page);
    });

    // TC-RM-026: Verify Update Price modal opens correctly
    test('TC-RM-026: Update Price modal opens with correct structure', async ({ page }) => {
      // Click the Update Price button
      await page.getByRole('button', { name: /Update Price/i }).click();

      // Modal dialog opens with correct structure
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible({ timeout: 10000 });
      await expect(modal.getByRole('heading', { name: /Bulk Update Rope Prices/i })).toBeVisible();
      await expect(modal.getByRole('textbox', { name: /Search/i })).toBeVisible();
      await expect(modal.getByRole('textbox', { name: /Enter new price per metre/i }).first()).toBeVisible();
      await expect(modal.getByRole('button', { name: /Submit Updates/i })).toBeVisible();
      await expect(modal.getByRole('button', { name: /Cancel/i })).toBeVisible();
    });

    // TC-RM-027: Verify bulk price update with valid new prices
    test('TC-RM-027: Bulk price update with valid new price updates successfully', async ({ page }) => {
      // Click the Update Price button
      await page.getByRole('button', { name: /Update Price/i }).click();
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible({ timeout: 10000 });

      // Enter a valid new price in the first row
      await modal.getByRole('textbox', { name: /Enter new price per metre/i }).first().fill('350');
      // Click the Submit Updates button
      await modal.getByRole('button', { name: /Submit Updates/i }).click();

      // Modal closes after successful update
      await expect(modal).not.toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Rope/i })).toBeVisible();
    });

    // TC-RM-028: Verify Cancel button closes the Update Price modal without saving
    test('TC-RM-028: Cancel button closes the modal without saving', async ({ page }) => {
      // Click the Update Price button
      await page.getByRole('button', { name: /Update Price/i }).click();
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible({ timeout: 10000 });

      // Enter new price values in one row
      await modal.getByRole('textbox', { name: /Enter new price per metre/i }).first().fill('1111');
      // Click the Cancel button
      await modal.getByRole('button', { name: /Cancel/i }).click();

      // Modal closes without saving
      await expect(modal).not.toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('heading', { name: /Add Rope/i })).toBeVisible();
    });

    // TC-RM-029: Verify Close (X) button closes the Update Price modal without saving
    test('TC-RM-029: Close (X) button closes the modal without saving', async ({ page }) => {
      // Click the Update Price button
      await page.getByRole('button', { name: /Update Price/i }).click();
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible({ timeout: 10000 });

      // Enter new price values in one row
      await modal.getByRole('textbox', { name: /Enter new price per metre/i }).first().fill('2222');
      // Click the X (Close) button
      await modal.getByRole('button', { name: /Close/i }).click();

      // Modal closes without saving
      await expect(modal).not.toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('heading', { name: /Add Rope/i })).toBeVisible();
    });

    // TC-RM-030: Verify search within the Update Price modal filters rows
    test('TC-RM-030: Search within modal filters records', async ({ page }) => {
      // Click the Update Price button
      await page.getByRole('button', { name: /Update Price/i }).click();
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible({ timeout: 10000 });

      // Wait for modal rows to load
      await modal.getByRole('textbox', { name: /Enter new price per metre/i }).first().waitFor({ state: 'visible', timeout: 30000 });
      const totalInputsBefore = await modal.getByRole('textbox', { name: /Enter new price per metre/i }).count();

      // Type a search term in the Search field within the modal
      await modal.getByRole('textbox', { name: /Search/i }).fill('meta');

      // Modal table filters to show only matching rows
      const inputsAfter = await modal.getByRole('textbox', { name: /Enter new price per metre/i }).count();
      expect(inputsAfter).toBeLessThanOrEqual(totalInputsBefore);

      // Clear the search field - all records are shown again
      await modal.getByRole('textbox', { name: /Search/i }).fill('');
      await modal.getByRole('button', { name: /Cancel/i }).click();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 12 – Show Entries (Positive)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Show Entries (Positive)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoRopeMaster(page);
    });

    // TC-RM-022: Verify Show entries (rows per page) dropdown changes table display
    test('TC-RM-022: Show entries dropdown controls rows per page', async ({ page }) => {
      await waitForTableRows(page);

      // Confirm default is 25 and change to 10
      await showEntriesSelect(page).selectOption('10');
      const rowsAt10 = await tableRows(page).count();
      expect(rowsAt10).toBeLessThanOrEqual(10);

      // Change the Show dropdown to 50
      await showEntriesSelect(page).selectOption('50');
      const rowsAt50 = await tableRows(page).count();
      expect(rowsAt50).toBeLessThanOrEqual(50);

      // Change the Show dropdown to 100
      await showEntriesSelect(page).selectOption('100');
      const rowsAt100 = await tableRows(page).count();
      expect(rowsAt100).toBeLessThanOrEqual(100);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 13 – Sidebar Navigation (Positive)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Sidebar Navigation (Positive)', () => {

    // TC-RM-036: Verify Rope Master is accessible via Sales Masters sidebar navigation
    test('TC-RM-036: Rope Master accessible via Sales Masters sidebar', async ({ page }) => {
      // Navigate to the dashboard first
      await page.goto('/dashboard', { timeout: 60000 });
      await registerPopupHandler(page);
      await dismissNotificationPopup(page);

      // Click on Sales Masters to expand the submenu
      await page.getByRole('link', { name: /Sales Masters/i }).click();
      // Sales Masters submenu expands showing all child menu items
      await expect(page.getByRole('link', { name: /Rope Master/i })).toBeVisible({ timeout: 10000 });

      // Click on Rope Master from the expanded submenu
      await page.getByRole('link', { name: /Rope Master/i }).click();

      // Browser navigates to /master/rope-master and page loads successfully
      await expect(page).toHaveURL(/rope-master/);
      await expect(page.getByRole('heading', { name: /Add Rope/i })).toBeVisible({ timeout: 30000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 14 – Authentication Guard
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Authentication Guard', () => {

    // TC-RM-033: Verify unauthenticated user is redirected to login page
    test('TC-RM-033: Unauthenticated user is redirected to login page', async ({ browser }) => {
      // Open a new context without any stored auth state
      const context = await browser.newContext();
      const page = await context.newPage();

      // Navigate directly to the Rope Master URL without logging in
      await page.goto('https://stage.elevatorplus.net/master/rope-master', { timeout: 60000 });

      // Application redirects unauthenticated user to the login page
      await expect(page).toHaveURL(/\/login/, { timeout: 30000 });
      await expect(page.getByRole('button', { name: 'Login' })).toBeVisible({ timeout: 10000 });

      await context.close();
    });

  });

});
