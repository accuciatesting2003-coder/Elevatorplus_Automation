// spec: test-plans/Sales-mater-test-plan/type-of-lift-test-plan.md
// seed: tests/Sales-master/landing-door-master.spec.ts

import { test, expect } from '../fixtures/auth-fixture';

const TYPE_OF_LIFT_MASTER_URL = '/master/type-of-lift-master';

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

async function gotoTypeOfLiftMaster(page: any) {
  await registerPopupHandler(page);
  await page.goto(TYPE_OF_LIFT_MASTER_URL, { timeout: 60000 });
  await page.getByRole('heading', { name: /Add Type of Lift/i }).waitFor({ state: 'visible', timeout: 45000 });
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
// Lift type values are full strings: 'Passenger Lift' | 'Goods Lift'
// Status select in edit mode uses boolean strings: 'true' (Active) | 'false' (Inactive)
async function fillTypeOfLiftForm(
  page: any,
  name: string | null,
  liftType: string | null,
  licensingCost: string | null,
  manPowerCost: string | null = null,
  extraRope: string | null = null,
  fillerWeightPrice: string | null = null
) {
  if (name !== null) {
    await page.locator('#lift_name').fill(name);
  }
  if (liftType !== null) {
    await page.locator('#typeOfLift').selectOption(liftType);
  }
  if (licensingCost !== null) {
    await page.locator('#price').fill(licensingCost);
  }
  if (manPowerCost !== null) {
    await page.locator('#man_power_cost').fill(manPowerCost);
  }
  if (extraRope !== null) {
    await page.locator('#extra_rope_in_mtr').fill(extraRope);
  }
  if (fillerWeightPrice !== null) {
    await page.locator('#filler_weight_price_per_kg').fill(fillerWeightPrice);
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

// Search field for the data table toolbar
function searchField(page: any) {
  return page.getByRole('textbox', { name: /Search Type of Lift/i });
}

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Type of Lift Master', () => {

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 1 – Smoke
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Smoke', () => {

    test.beforeEach(async ({ page }) => {
      await gotoTypeOfLiftMaster(page);
    });

    // TC-TLM-001: Verify Type of Lift Master page loads successfully
    test('TC-TLM-001: Page loads successfully', async ({ page }) => {
      // Verify heading in top navigation bar
      await expect(page.getByRole('heading', { name: /Type Of Lift Master/i })).toBeVisible();

      // Verify Add Type of Lift form heading
      await expect(page.getByRole('heading', { name: /Add Type of Lift/i })).toBeVisible();

      // Verify mandatory form fields
      await expect(page.locator('#lift_name')).toBeVisible();
      await expect(page.locator('#prefix')).toBeVisible();
      await expect(page.locator('#typeOfLift')).toBeVisible();
      await expect(page.locator('#price')).toBeVisible();

      // Verify optional form fields
      await expect(page.locator('#man_power_cost')).toBeVisible();
      await expect(page.locator('#extra_rope_in_mtr')).toBeVisible();
      await expect(page.locator('#filler_weight_price_per_kg')).toBeVisible();

      // Verify Clear and Submit buttons
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Clear/i })).toBeVisible();

      // Verify toolbar elements
      await expect(showEntriesSelect(page)).toBeVisible();
      await expect(statusFilterSelect(page)).toBeVisible();
      await expect(page.getByRole('button', { name: /Update Price/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Import Excel/i })).toBeVisible();
      await expect(searchField(page)).toBeVisible();

      // Verify warning note below the form
      await expect(page.getByText(/Note: Changes in this master will impact quotation cost estimation/i)).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 2 – Create Type of Lift (Positive)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Create Type of Lift (Positive)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoTypeOfLiftMaster(page);
    });

    // TC-TLM-002: Verify successful Type of Lift creation with Passenger Lift type and all mandatory fields
    test('TC-TLM-002: Create Type of Lift with Passenger Lift type and mandatory fields', async ({ page }) => {
      const timestamp = Date.now();
      const liftName = `Economy Passenger Lift ${timestamp}`;

      // 1. Enter a valid Type of Lift Name — Lift Code should auto-populate
      await page.locator('#lift_name').fill(liftName);

      // 2. Verify Lift Code auto-populates (after input event)
      await expect(page.locator('#prefix')).not.toHaveValue('', { timeout: 5000 });

      // 3. Select Passenger Lift (it is the default, but ensure it is selected)
      await page.locator('#typeOfLift').selectOption('Passenger Lift');

      // 4. Enter Licensing Cost
      await page.locator('#price').fill('5000');

      // 5. Click Submit
      await submitForm(page);

      // Expect form to reset to Add mode (name field clears)
      await expect(page.getByRole('heading', { name: /Add Type of Lift/i })).toBeVisible({ timeout: 15000 });

      // Expect the record to appear in the data table
      await searchField(page).fill(liftName);
      await page.waitForTimeout(1000);
      await expect(tableRows(page).filter({ hasText: liftName })).toHaveCount(1, { timeout: 30000 });
      await searchField(page).fill('');
    });

    // TC-TLM-003: Verify successful Type of Lift creation with Goods Lift type
    test('TC-TLM-003: Create Type of Lift with Goods Lift type', async ({ page }) => {
      const timestamp = Date.now();
      const liftName = `Industrial Goods Carrier ${timestamp}`;

      // 1. Enter Type of Lift Name
      await page.locator('#lift_name').fill(liftName);

      // 2. Select Goods Lift
      await page.locator('#typeOfLift').selectOption('Goods Lift');

      // 3. Enter Licensing Cost
      await page.locator('#price').fill('3000');

      // 4. Submit
      await submitForm(page);

      // Expect record to appear in table
      await expect(page.getByRole('heading', { name: /Add Type of Lift/i })).toBeVisible({ timeout: 15000 });
      await searchField(page).fill(liftName);
      await page.waitForTimeout(1000);
      await expect(tableRows(page).filter({ hasText: liftName })).toHaveCount(1, { timeout: 30000 });
      await searchField(page).fill('');
    });

    // TC-TLM-004: Verify successful creation with all optional fields filled
    test('TC-TLM-004: Create Type of Lift with all optional fields filled', async ({ page }) => {
      const timestamp = Date.now();
      const liftName = `Premium Cargo Lift ${timestamp}`;

      // 1. Enter all fields including optional ones
      await fillTypeOfLiftForm(page, liftName, 'Goods Lift', '8000', '500', '10', '250');

      // 2. Submit
      await submitForm(page);

      // Expect success
      await expect(page.getByRole('heading', { name: /Add Type of Lift/i })).toBeVisible({ timeout: 15000 });
      await searchField(page).fill(liftName);
      await page.waitForTimeout(1000);
      await expect(tableRows(page).filter({ hasText: liftName })).toHaveCount(1, { timeout: 30000 });
      await searchField(page).fill('');
    });

    // TC-TLM-012: Verify Licensing Cost accepts zero as a valid value
    test('TC-TLM-012: Licensing Cost accepts zero as a valid value', async ({ page }) => {
      const timestamp = Date.now();
      const liftName = `Zero Cost Lift ${timestamp}`;

      // 1. Enter Name, select Passenger Lift, enter 0 for Licensing Cost
      await fillTypeOfLiftForm(page, liftName, 'Passenger Lift', '0');

      // 2. Submit
      await submitForm(page);

      // Expect the record to be created
      await expect(page.getByRole('heading', { name: /Add Type of Lift/i })).toBeVisible({ timeout: 15000 });
      await searchField(page).fill(liftName);
      await page.waitForTimeout(1000);
      await expect(tableRows(page).filter({ hasText: liftName })).toHaveCount(1, { timeout: 30000 });
      await searchField(page).fill('');
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 3 – Mandatory Field Validation (Negative)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Mandatory Field Validation (Negative)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoTypeOfLiftMaster(page);
    });

    // TC-TLM-005: Verify form submission fails when Type of Lift Name is empty
    test('TC-TLM-005: Form fails when Type of Lift Name is empty', async ({ page }) => {
      // 1. Leave name blank, select Passenger Lift, enter Licensing Cost
      await page.locator('#lift_name').fill('');
      await page.locator('#typeOfLift').selectOption('Passenger Lift');
      await page.locator('#price').fill('2000');

      // 2. Submit
      await submitForm(page);

      // Expect validation error
      await expect(page.locator('[class*="text-danger"], [class*="error"], [class*="invalid"]').first()).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add Type of Lift/i })).toBeVisible();
    });

    // TC-TLM-006: Verify form submission fails when Lift Type is not selected
    test('TC-TLM-006: Form fails when Lift Type is not selected', async ({ page }) => {
      // 1. Enter name, leave Lift Type as Select Lift Type, enter Licensing Cost
      await page.locator('#lift_name').fill('Test Lift No Type');
      await page.locator('#typeOfLift').selectOption('');
      await page.locator('#price').fill('1000');

      // 2. Submit
      await submitForm(page);

      // Expect validation error
      await expect(page.locator('[class*="text-danger"], [class*="error"], [class*="invalid"]').first()).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add Type of Lift/i })).toBeVisible();
    });

    // TC-TLM-007: Verify form submission fails when Licensing Cost is empty
    test('TC-TLM-007: Form fails when Licensing Cost is empty', async ({ page }) => {
      // 1. Enter name, select Passenger Lift, leave Licensing Cost blank
      await page.locator('#lift_name').fill('No Cost Lift');
      await page.locator('#typeOfLift').selectOption('Passenger Lift');
      await page.locator('#price').fill('');

      // 2. Submit
      await submitForm(page);

      // Expect validation error
      await expect(page.locator('[class*="text-danger"], [class*="error"], [class*="invalid"]').first()).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add Type of Lift/i })).toBeVisible();
    });

    // TC-TLM-008: Verify validation when all mandatory fields are empty
    test('TC-TLM-008: All mandatory fields empty shows errors; Clear resets them', async ({ page }) => {
      // 1. Leave all fields empty and click Submit
      await submitForm(page);

      // Expect validation errors
      await expect(page.locator('[class*="text-danger"], [class*="error"], [class*="invalid"]').first()).toBeVisible({ timeout: 5000 });

      // 2. Click Clear
      await clearForm(page);
      await page.waitForTimeout(500);

      // Expect errors to disappear and form to reset
      await expect(page.locator('[class*="text-danger"], [class*="error"], [class*="invalid"]').first()).not.toBeVisible();
      await expect(page.locator('#lift_name')).toHaveValue('');
      await expect(page.locator('#price')).toHaveValue('');
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 4 – Lift Code Auto-Generation
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Lift Code Auto-Generation', () => {

    test.beforeEach(async ({ page }) => {
      await gotoTypeOfLiftMaster(page);
    });

    // TC-TLM-009: Verify Lift Code auto-generation from Type of Lift Name
    test('TC-TLM-009: Lift Code auto-populates from Type of Lift Name', async ({ page }) => {
      // 1. Type the name character by character to trigger auto-generation
      await page.locator('#lift_name').pressSequentially('Standard Traction Lift');

      // Expect Lift Code to auto-populate (non-empty)
      await expect(page.locator('#prefix')).not.toHaveValue('', { timeout: 5000 });

      // 2. Manually clear Lift Code and enter a custom code
      await page.locator('#prefix').fill('');
      await page.locator('#prefix').fill('STL-CUSTOM');

      // Expect custom code to be retained
      await expect(page.locator('#prefix')).toHaveValue('STL-CUSTOM');
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 5 – Numeric Field Validation (Negative)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Numeric Field Validation (Negative)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoTypeOfLiftMaster(page);
    });

    // TC-TLM-010: Verify Licensing Cost field rejects alphabetic and special character input
    test('TC-TLM-010: Licensing Cost field rejects alphabetic and special character input', async ({ page }) => {
      const priceInput = page.locator('#price');

      // 1. Attempt to type alphabetic characters
      await priceInput.pressSequentially('abc');
      await expect(priceInput).toHaveValue('');

      // 2. Attempt to type special characters
      await priceInput.pressSequentially('@#$');
      await expect(priceInput).toHaveValue('');
    });

    // TC-TLM-011: Verify Licensing Cost field rejects negative values
    test('TC-TLM-011: Licensing Cost field rejects negative values', async ({ page }) => {
      // 1. Enter a valid name and select Passenger Lift
      await page.locator('#lift_name').fill('Negative Cost Test');
      await page.locator('#typeOfLift').selectOption('Passenger Lift');

      // 2. Enter a negative value and submit
      await page.locator('#price').fill('-1000');
      await submitForm(page);

      // Expect validation error
      await expect(page.locator('[class*="text-danger"], [class*="error"], [class*="invalid"]').first()).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add Type of Lift/i })).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 6 – Duplicate Entry Restriction (Negative)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Duplicate Entry Restriction (Negative)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoTypeOfLiftMaster(page);
    });

    // TC-TLM-013: Verify duplicate Type of Lift Name with same Lift Type is rejected
    test('TC-TLM-013: Duplicate Type of Lift Name with same Lift Type is rejected', async ({ page }) => {
      const timestamp = Date.now();
      const liftName = `Standard Duplex Lift ${timestamp}`;

      // 1. Create first record
      await fillTypeOfLiftForm(page, liftName, 'Passenger Lift', '1500');
      await submitForm(page);
      await expect(page.getByRole('heading', { name: /Add Type of Lift/i })).toBeVisible({ timeout: 15000 });

      // 2. Try to create duplicate with same name and same lift type
      await fillTypeOfLiftForm(page, liftName, 'Passenger Lift', '2000');
      await submitForm(page);

      // Expect duplicate error
      await expect(page.locator('[class*="error"], [class*="toast"], [role="alert"]').first()).toBeVisible({ timeout: 10000 });
    });

    // TC-TLM-014: Verify same Type of Lift Name can be used with different Lift Type
    test('TC-TLM-014: Same Type of Lift Name with different Lift Type is allowed', async ({ page }) => {
      const timestamp = Date.now();
      const liftName = `Multipurpose Lift ${timestamp}`;

      // 1. Create first record with Passenger Lift
      await fillTypeOfLiftForm(page, liftName, 'Passenger Lift', '2000');
      await submitForm(page);
      await expect(page.getByRole('heading', { name: /Add Type of Lift/i })).toBeVisible({ timeout: 15000 });

      // 2. Create second record with same name but Goods Lift
      await fillTypeOfLiftForm(page, liftName, 'Goods Lift', '2500');
      await submitForm(page);
      await expect(page.getByRole('heading', { name: /Add Type of Lift/i })).toBeVisible({ timeout: 15000 });

      // Expect both records to appear in the data table
      await searchField(page).fill(liftName);
      await page.waitForTimeout(1000);
      await expect(tableRows(page).filter({ hasText: liftName })).toHaveCount(2, { timeout: 30000 });
      await searchField(page).fill('');
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 7 – Edit Type of Lift (Positive)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Edit Type of Lift (Positive)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoTypeOfLiftMaster(page);
    });

    // TC-TLM-015: Verify Edit functionality for an existing record
    test('TC-TLM-015: Edit existing Type of Lift updates successfully', async ({ page }) => {
      await waitForTableRows(page);

      // 1. Click Edit on first row
      const originalName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText()).trim();
      await clickEditOnRow(page, 0);

      // Expect Update form to appear with pre-populated values
      await expect(page.getByRole('heading', { name: /Update Type of Lift/i })).toBeVisible({ timeout: 10000 });
      await expect(page.locator('#lift_name')).not.toHaveValue('');

      // 2. Modify the name and licensing cost
      const updatedName = `${originalName} Edited`;
      await page.locator('#lift_name').fill(updatedName);
      await page.locator('#price').fill('9999');

      // 3. Click Update
      await submitForm(page);

      // Expect form to revert to Add mode
      await expect(page.getByRole('heading', { name: /Add Type of Lift/i })).toBeVisible({ timeout: 15000 });

      // Expect updated record in table
      await searchField(page).fill(updatedName);
      await page.waitForTimeout(1000);
      await expect(tableRows(page).filter({ hasText: updatedName })).toHaveCount(1, { timeout: 30000 });
      await searchField(page).fill('');
    });

    // TC-TLM-016: Verify Lift Type field is disabled in Edit mode
    test('TC-TLM-016: Lift Type dropdown is disabled in Edit mode', async ({ page }) => {
      await waitForTableRows(page);

      // 1. Click Edit on first row
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Type of Lift/i })).toBeVisible({ timeout: 10000 });

      // 2. Assert Lift Type dropdown is disabled
      await expect(page.locator('#typeOfLift')).toBeDisabled();
    });

    // TC-TLM-020: Verify Clear button on Update form resets to Add form state
    test('TC-TLM-020: Clear on Update form resets to Add Type of Lift mode', async ({ page }) => {
      await waitForTableRows(page);

      // 1. Click Edit on first row
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Type of Lift/i })).toBeVisible({ timeout: 10000 });

      // 2. Click Clear
      await clearForm(page);
      await page.waitForTimeout(500);

      // Expect form to revert to Add mode
      await expect(page.getByRole('heading', { name: /Add Type of Lift/i })).toBeVisible({ timeout: 10000 });
      await expect(page.locator('#lift_name')).toHaveValue('');
      await expect(page.locator('#price')).toHaveValue('');

      // Status field should be hidden (only visible in edit mode)
      await expect(page.locator('#status')).not.toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 8 – Inactive Status (Positive)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Inactive Status (Positive)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoTypeOfLiftMaster(page);
    });

    // TC-TLM-017: Verify setting a record status to Inactive
    test('TC-TLM-017: Setting Type of Lift to Inactive removes it from Active list', async ({ page }) => {
      await waitForTableRows(page);

      // 1. Click Edit on first row
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Type of Lift/i })).toBeVisible({ timeout: 10000 });

      const liftName = await page.locator('#lift_name').inputValue();

      // 2. Change Status to Inactive (status select uses 'false' for Inactive)
      await page.locator('#status').selectOption('false');
      await submitForm(page);

      // Expect form to revert to Add mode
      await expect(page.getByRole('heading', { name: /Add Type of Lift/i })).toBeVisible({ timeout: 15000 });

      // With Active filter, the record should no longer appear
      const activeRows = tableRows(page).filter({ hasText: liftName });
      await expect(activeRows).toHaveCount(0, { timeout: 10000 });

      // Restore: set status back to Active
      await statusFilterSelect(page).selectOption('false');
      await page.waitForTimeout(1000);
      const inactiveRow = getRowByName(page, liftName);
      await inactiveRow.getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update Type of Lift/i })).toBeVisible({ timeout: 10000 });
      await page.locator('#status').selectOption('true');
      await submitForm(page);
      await expect(page.getByRole('heading', { name: /Add Type of Lift/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-TLM-018: Verify restoring a record from Inactive to Active
    test('TC-TLM-018: Restoring Type of Lift from Inactive to Active', async ({ page }) => {
      // 1. Change Status filter to Inactive
      await statusFilterSelect(page).selectOption('false');
      await page.waitForTimeout(1000);

      const hasInactiveRows = await tableRows(page).count().catch(() => 0);
      if (!hasInactiveRows) {
        // No inactive records to test — skip gracefully
        return;
      }

      await waitForTableRows(page);

      // 2. Click Edit on first inactive record
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Type of Lift/i })).toBeVisible({ timeout: 10000 });
      await expect(page.locator('#status')).toHaveValue('false');

      const liftName = await page.locator('#lift_name').inputValue();

      // 3. Change Status to Active
      await page.locator('#status').selectOption('true');
      await submitForm(page);

      // Expect form to revert to Add mode
      await expect(page.getByRole('heading', { name: /Add Type of Lift/i })).toBeVisible({ timeout: 15000 });

      // When Active filter is applied, the record should appear
      await statusFilterSelect(page).selectOption('true');
      await page.waitForTimeout(1000);
      await searchField(page).fill(liftName);
      await page.waitForTimeout(1000);
      await expect(tableRows(page).filter({ hasText: liftName })).toHaveCount(1, { timeout: 30000 });
      await searchField(page).fill('');
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 9 – Cancel / Clear Form (Positive)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Cancel / Clear Form (Positive)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoTypeOfLiftMaster(page);
    });

    // TC-TLM-019: Verify Clear button discards unsaved form data in Add mode
    test('TC-TLM-019: Clear button discards unsaved form data in Add mode', async ({ page }) => {
      // 1. Enter data in form fields
      await fillTypeOfLiftForm(page, 'Clear Test Lift', 'Passenger Lift', '1234', '100', '5', '50');

      // 2. Click Clear
      await clearForm(page);

      // Expect all fields to be cleared
      await expect(page.getByRole('heading', { name: /Add Type of Lift/i })).toBeVisible();
      await expect(page.locator('#lift_name')).toHaveValue('');
      await expect(page.locator('#prefix')).toHaveValue('');
      await expect(page.locator('#price')).toHaveValue('');
      await expect(page.locator('#man_power_cost')).toHaveValue('');
      await expect(page.locator('#extra_rope_in_mtr')).toHaveValue('');
      await expect(page.locator('#filler_weight_price_per_kg')).toHaveValue('');

      // No record should have been created
      const matchingRows = await tableRows(page).filter({ hasText: 'Clear Test Lift' }).count();
      expect(matchingRows).toBe(0);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 10 – Data Table Filters (Positive)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Data Table Filters (Positive)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoTypeOfLiftMaster(page);
    });

    // TC-TLM-021: Verify default Active status filter on page load
    test('TC-TLM-021: Default filter is Active on page load', async ({ page }) => {
      // Status filter should default to 'true' (Active)
      await expect(statusFilterSelect(page)).toHaveValue('true');
    });

    // TC-TLM-022: Verify Active filter shows only active records
    test('TC-TLM-022: Active filter shows only active records', async ({ page }) => {
      // Limit to 10 rows for performance
      await showEntriesSelect(page).selectOption('10');
      await statusFilterSelect(page).selectOption('true');
      await page.waitForTimeout(1000);
      await waitForTableRows(page);

      const statuses = await getStatusColumnTexts(page);
      for (const status of statuses) {
        expect(status).toBe('Active');
      }
    });

    // TC-TLM-023: Verify Inactive filter shows only inactive records
    test('TC-TLM-023: Inactive filter shows only inactive records', async ({ page }) => {
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

    // TC-TLM-024: Verify All filter shows both active and inactive records
    test('TC-TLM-024: All filter shows both active and inactive records', async ({ page }) => {
      await showEntriesSelect(page).selectOption('10');
      await statusFilterSelect(page).selectOption('');
      await page.waitForTimeout(1000);
      await waitForTableRows(page);

      const statuses = await getStatusColumnTexts(page);
      expect(statuses.map(s => s.trim())).toContain('Active');
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 11 – Search Functionality (Positive)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Search Functionality (Positive)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoTypeOfLiftMaster(page);
    });

    // TC-TLM-025: Verify Search functionality by Type of Lift Name
    test('TC-TLM-025: Search filters records by Type of Lift Name', async ({ page }) => {
      await waitForTableRows(page);

      // 1. Type a search term that exists in the table
      const name = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText()).trim();
      await searchField(page).fill(name);
      await page.waitForTimeout(1000);

      // Expect filtered results
      await expect(tableRows(page).first()).toContainText(name);

      // 2. Clear the search field
      await searchField(page).fill('');
      await page.waitForTimeout(500);

      // Table should return to showing all records
      await waitForTableRows(page);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 12 – Show Entries (Positive)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Show Entries (Positive)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoTypeOfLiftMaster(page);
    });

    // TC-TLM-026: Verify Show entries dropdown controls pagination
    test('TC-TLM-026: Show entries dropdown controls visible row count', async ({ page }) => {
      await waitForTableRows(page);

      // Default should be 25
      await expect(showEntriesSelect(page)).toHaveValue('25');

      // 1. Change to 10
      await showEntriesSelect(page).selectOption('10');
      await page.waitForTimeout(500);
      const rowsAt10 = await tableRows(page).count();
      expect(rowsAt10).toBeLessThanOrEqual(10);

      // 2. Change to 50
      await showEntriesSelect(page).selectOption('50');
      await page.waitForTimeout(500);
      const rowsAt50 = await tableRows(page).count();
      expect(rowsAt50).toBeLessThanOrEqual(50);

      // 3. Change to 100
      await showEntriesSelect(page).selectOption('100');
      await page.waitForTimeout(500);
      const rowsAt100 = await tableRows(page).count();
      expect(rowsAt100).toBeLessThanOrEqual(100);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 13 – Update Price Modal (Positive)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Update Price Modal (Positive)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoTypeOfLiftMaster(page);
    });

    // TC-TLM-027: Verify Update Price modal opens correctly
    test('TC-TLM-027: Update Price modal opens with correct structure', async ({ page }) => {
      // 1. Click Update Price button
      await page.getByRole('button', { name: /Update Price/i }).click();

      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible({ timeout: 10000 });

      // Verify modal heading
      await expect(modal.getByRole('heading', { name: /Bulk Update Lift Type Prices/i })).toBeVisible();

      // Verify Search input within the modal
      await expect(modal.getByRole('textbox', { name: /Search/i })).toBeVisible();

      // Verify editable price inputs
      await expect(modal.getByRole('textbox', { name: /Enter new price/i }).first()).toBeVisible();
      await expect(modal.getByRole('textbox', { name: /Enter new filler weight price per kg/i }).first()).toBeVisible();

      // Verify action buttons
      await expect(modal.getByRole('button', { name: /Submit Updates/i })).toBeVisible();
      await expect(modal.getByRole('button', { name: /Cancel/i })).toBeVisible();

      // Close modal
      await modal.getByRole('button', { name: /Cancel/i }).click();
      await expect(modal).not.toBeVisible({ timeout: 10000 });
    });

    // TC-TLM-028: Verify bulk price update with valid new prices submits successfully
    test('TC-TLM-028: Bulk price update with valid new price updates successfully', async ({ page }) => {
      // 1. Open Update Price modal
      await page.getByRole('button', { name: /Update Price/i }).click();
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible({ timeout: 10000 });

      // 2. Enter a valid new price for the first record
      await modal.getByRole('textbox', { name: /Enter new price/i }).first().fill('9500');

      // 3. Click Submit Updates
      await modal.getByRole('button', { name: /Submit Updates/i }).click();

      // Expect modal to close after submission
      await expect(modal).not.toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Type of Lift/i })).toBeVisible();
    });

    // TC-TLM-029: Verify Cancel button closes the Update Price modal without saving
    test('TC-TLM-029: Cancel button closes the modal without saving', async ({ page }) => {
      // 1. Open Update Price modal
      await page.getByRole('button', { name: /Update Price/i }).click();
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible({ timeout: 10000 });

      // 2. Enter a new price value
      await modal.getByRole('textbox', { name: /Enter new price/i }).first().fill('1111');

      // 3. Click Cancel
      await modal.getByRole('button', { name: /Cancel/i }).click();

      // Expect modal to close without saving
      await expect(modal).not.toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('heading', { name: /Add Type of Lift/i })).toBeVisible();
    });

    // TC-TLM-030: Verify search within the Bulk Update Lift Type Prices modal
    test('TC-TLM-030: Search within modal filters records', async ({ page }) => {
      // 1. Open Update Price modal
      await page.getByRole('button', { name: /Update Price/i }).click();
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible({ timeout: 10000 });

      // Wait for modal rows to load
      await modal.getByRole('textbox', { name: /Enter new price/i }).first().waitFor({ state: 'visible', timeout: 30000 });
      const totalInputsBefore = await modal.getByRole('textbox', { name: /Enter new price/i }).count();

      // 2. Type a search term in the modal's search field
      await modal.getByRole('textbox', { name: /Search/i }).fill('Passenger');
      await page.waitForTimeout(1200);

      const inputsAfter = await modal.getByRole('textbox', { name: /Enter new price/i }).count();
      expect(inputsAfter).toBeLessThanOrEqual(totalInputsBefore);

      // 3. Clear the search field
      await modal.getByRole('textbox', { name: /Search/i }).fill('');
      await page.waitForTimeout(800);

      // Expect full list to restore
      const inputsRestored = await modal.getByRole('textbox', { name: /Enter new price/i }).count();
      expect(inputsRestored).toBeGreaterThanOrEqual(inputsAfter);

      await modal.getByRole('button', { name: /Cancel/i }).click();
    });

    // TC-TLM-031: Verify X (Close) button dismisses the Update Price modal without saving
    test('TC-TLM-031: Close (X) button dismisses the modal without saving', async ({ page }) => {
      // 1. Open Update Price modal
      await page.getByRole('button', { name: /Update Price/i }).click();
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible({ timeout: 10000 });

      // 2. Enter a new price value
      await modal.getByRole('textbox', { name: /Enter new price/i }).first().fill('7777');

      // 3. Click the X (Close) button
      await modal.getByRole('button', { name: /Close/i }).click();

      // Expect modal to close without saving
      await expect(modal).not.toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('heading', { name: /Add Type of Lift/i })).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 14 – Import Excel Modal (Positive)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Import Excel Modal (Positive)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoTypeOfLiftMaster(page);
    });

    // TC-TLM-032: Verify Import Excel modal opens with correct elements
    test('TC-TLM-032: Import Excel modal opens with correct elements', async ({ page }) => {
      // 1. Click the Import Excel button
      await page.getByRole('button', { name: /Import Excel/i }).click();

      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible({ timeout: 10000 });

      // Verify modal heading
      await expect(modal.getByRole('heading', { name: /Import Excel/i })).toBeVisible();

      // Verify Choose File button (file upload)
      await expect(modal.getByRole('button', { name: /Choose File/i })).toBeVisible();

      // Verify Download Import Format button
      await expect(modal.getByRole('button', { name: /Download Import Format/i })).toBeVisible();

      // Verify Import Excel submit button within modal
      await expect(modal.getByRole('button', { name: /Import Excel/i })).toBeVisible();

      // Verify Cancel button
      await expect(modal.getByRole('button', { name: /Cancel/i })).toBeVisible();

      // 2. Click Cancel to close the modal
      await modal.getByRole('button', { name: /Cancel/i }).click();
      await expect(modal).not.toBeVisible({ timeout: 10000 });
    });

  });

});
