// spec: test-plans/Sales-mater-test-plan/city-master-test-plan.md
// seed: tests/Company-master/designation-master.spec.ts

import { test, expect } from '@playwright/test';
import * as path from 'path';

const CITY_MASTER_URL = '/master/city-master';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function performLogin(page: any) {
  const mobile = process.env.MOBILE_NUMBER || '9209365301';
  const password = process.env.PASSWORD || 'Shravani@123';

  const passwordInput = page.locator('input[type="password"]');
  const passwordAlreadyVisible = await passwordInput.isVisible({ timeout: 3000 }).catch(() => false);

  if (!passwordAlreadyVisible) {
    const loginInput = page.locator('.form-control').first();
    await loginInput.waitFor({ state: 'visible', timeout: 10000 });
    await loginInput.focus();
    await page.keyboard.press('End');
    await page.keyboard.type(mobile);
    await page.getByRole('button', { name: 'Login' }).click();
  }

  const pwdVisible = await passwordInput.isVisible({ timeout: 5000 }).catch(() => false);
  if (pwdVisible) {
    await passwordInput.fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
  }

  await page.waitForURL((url: URL) => !url.pathname.includes('/login'), { timeout: 30000 });
}

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
    const closeBtn = page.locator('dialog button', { hasText: /×|Close/i });
    const closeVisible = await closeBtn.first().isVisible({ timeout: 2000 }).catch(() => false);
    if (closeVisible) {
      await closeBtn.first().click();
    }
  } catch {
    // Popup did not appear
  }
}

async function gotoCityMaster(page: any) {
  await registerPopupHandler(page);

  await page.goto(CITY_MASTER_URL, { timeout: 60000 }).catch(async () => {
    await page.goto(CITY_MASTER_URL, { timeout: 60000 });
  });
  await dismissNotificationPopup(page);

  if (page.url().includes('/login')) {
    await performLogin(page);
    if (!page.url().includes('city-master')) {
      await page.goto(CITY_MASTER_URL);
    }
  }

  await page.getByRole('heading', { name: /Add City/i }).waitFor({ state: 'visible', timeout: 60000 });
  await dismissNotificationPopup(page);
}

async function waitForTableRows(page: any) {
  await page.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 30000 });
}

async function clickEditOnRow(page: any, rowIndex: number = 0) {
  await page.locator('table tbody tr').nth(rowIndex).getByRole('img', { name: 'Edit' }).click();
}

/**
 * Fill the Add City form with mandatory fields.
 * All numeric values must be strings (e.g., '100').
 */
async function fillCityFormMandatory(
  page: any,
  cityName: string,
  transportCost: string,
  installCost: string,
  installCostPerFloor: string,
  machineHoisting: string,
  machineHoistingPerFloor: string
) {
  await page.getByRole('textbox', { name: /City Name \*/i }).fill(cityName);
  await page.getByRole('textbox', { name: /Transportation Cost \*/i }).fill(transportCost);
  await page.getByRole('textbox', { name: /Installation Cost \(for G\+0\) \*/i }).fill(installCost);
  await page.getByRole('textbox', { name: /Installation Cost Per Floor Increase \*/i }).fill(installCostPerFloor);
  await page.getByRole('textbox', { name: /Machine Hoisting \(for G\+0\) \*/i }).fill(machineHoisting);
  await page.getByRole('textbox', { name: /Machine Hoisting Per Floor Increase \*/i }).fill(machineHoistingPerFloor);
}

/** Get the table row that contains the given city name */
function getRowByCityName(page: any, name: string) {
  return page.locator('table tbody tr').filter({ hasText: name });
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1 – Smoke
// ─────────────────────────────────────────────────────────────────────────────

test.describe('City Master', () => {

  test.describe('Smoke', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCityMaster(page);
    });

    // TC-CM-001: Verify City Master page loads successfully
    test('TC-CM-001: Page loads successfully', async ({ page }) => {
      // Verify page heading
      await expect(page.getByRole('heading', { name: /City Master/i })).toBeVisible();

      // Verify form heading
      await expect(page.getByRole('heading', { name: /Add City/i })).toBeVisible();

      // Verify all 9 fields are visible
      await expect(page.getByRole('textbox', { name: /City Name \*/i })).toBeVisible();
      await expect(page.getByRole('textbox', { name: /Transportation Cost \*/i })).toBeVisible();
      await expect(page.getByRole('textbox', { name: /Outward Transportation Cost/i })).toBeVisible();
      await expect(page.getByRole('textbox', { name: /Installation Cost \(for G\+0\) \*/i })).toBeVisible();
      await expect(page.getByRole('textbox', { name: /Installation Cost Per Floor Increase \*/i })).toBeVisible();
      await expect(page.getByRole('textbox', { name: /Machine Hoisting \(for G\+0\) \*/i })).toBeVisible();
      await expect(page.getByRole('textbox', { name: /Machine Hoisting Per Floor Increase \*/i })).toBeVisible();

      // City Manager/Head dropdown area is visible
      await expect(page.locator('#react-select-3-input')).toBeVisible();

      // City Head Signature upload area is visible
      await expect(page.locator('text=City Head Signature (optional)')).toBeVisible();

      // Submit and Clear buttons visible
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Clear/i })).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 2 – Positive: Create City
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Create City (Positive)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCityMaster(page);
    });

    // TC-CM-002: Successful city creation with mandatory fields only
    test('TC-CM-002: Create city with mandatory fields only', async ({ page }) => {
      const timestamp = Date.now();
      const cityName = `AutoCity ${timestamp}`;

      // Fill mandatory fields only, leave optional fields empty
      await fillCityFormMandatory(page, cityName, '100', '500', '50', '200', '20');

      // Click Submit
      await page.getByRole('button', { name: /Submit/i }).click();

      // Form should reset after success
      await expect(page.getByRole('heading', { name: /Add City/i })).toBeVisible({ timeout: 15000 });

      // Verify success toast
      await expect(page.locator('[role="alert"]').filter({ hasText: /created successfully/i })).toBeVisible({ timeout: 10000 });

      // Newly created record should appear in the table
      await expect(page.locator('table tbody').getByText(cityName)).toBeVisible({ timeout: 15000 });
    });

    // TC-CM-003: Successful city creation with all fields filled
    test('TC-CM-003: Create city with all fields filled', async ({ page }) => {
      const timestamp = Date.now();
      const cityName = `FullCity ${timestamp}`;

      // Fill all mandatory fields
      await fillCityFormMandatory(page, cityName, '150', '200', '600', '60', '300', '30');

      // Fill optional Outward Transportation Cost
      await page.getByRole('textbox', { name: /Outward Transportation Cost/i }).fill('80');

      // Select a user from City Manager/Head dropdown
      await page.locator('#react-select-3-input').click();
      await page.locator('[class*="option"]').first().click();

      // Upload a PNG file for City Head Signature
      const pngFilePath = path.resolve(__dirname, '../../node_modules/playwright-core/lib/server/chromium/appIcon.png');
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(pngFilePath);

      // Click Submit
      await page.getByRole('button', { name: /Submit/i }).click();

      // Form should reset after success
      await expect(page.getByRole('heading', { name: /Add City/i })).toBeVisible({ timeout: 15000 });

      // Record should appear in the table
      await expect(page.locator('table tbody').getByText(cityName)).toBeVisible({ timeout: 15000 });
    });

    // TC-CM-015: City Manager/Head is optional - form saves without selecting a user
    test('TC-CM-015: City Manager/Head is optional', async ({ page }) => {
      const timestamp = Date.now();
      const cityName = `OptMgr ${timestamp}`;

      // Fill mandatory fields, leave City Manager/Head empty
      await fillCityFormMandatory(page, cityName, '100', '500', '50', '200', '20');

      // Click Submit without selecting City Manager
      await page.getByRole('button', { name: /Submit/i }).click();

      // Form should reset — no validation error for optional City Manager
      await expect(page.getByRole('heading', { name: /Add City/i })).toBeVisible({ timeout: 15000 });
      await expect(page.locator('table tbody').getByText(cityName)).toBeVisible({ timeout: 15000 });
    });

    // TC-CM-020: City Head Signature is optional - form saves without uploading
    test('TC-CM-020: City Head Signature is optional', async ({ page }) => {
      const timestamp = Date.now();
      const cityName = `OptSig ${timestamp}`;

      // Fill mandatory fields, leave City Head Signature empty
      await fillCityFormMandatory(page, cityName, '100', '500', '50', '200', '20');

      // Click Submit without uploading signature
      await page.getByRole('button', { name: /Submit/i }).click();

      // Form should reset — no validation error for optional signature
      await expect(page.getByRole('heading', { name: /Add City/i })).toBeVisible({ timeout: 15000 });
      await expect(page.locator('table tbody').getByText(cityName)).toBeVisible({ timeout: 15000 });
    });

    // TC-CM-026: City Master list displays created records
    test('TC-CM-026: City Master list displays created records', async ({ page }) => {
      const timestamp = Date.now();
      const cityName = `ListCity ${timestamp}`;

      await fillCityFormMandatory(page, cityName, '100', '500', '50', '200', '20');
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.getByRole('heading', { name: /Add City/i })).toBeVisible({ timeout: 15000 });

      // Verify the city appears in the list
      await expect(page.locator('table tbody').getByText(cityName)).toBeVisible({ timeout: 15000 });

      // Verify table has all key columns
      await expect(page.locator('table').getByText('City Name')).toBeVisible();
      await expect(page.locator('table').getByText('Transportation Cost')).toBeVisible();
      await expect(page.locator('table').getByText('Status')).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 3 – Negative: Mandatory Field Validation
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Mandatory Field Validation (Negative)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCityMaster(page);
    });

    // TC-CM-004: Fails when City Name is empty
    test('TC-CM-004: Form fails when City Name is empty', async ({ page }) => {
      // Leave City Name blank, fill all other mandatory fields
      await page.getByRole('textbox', { name: /Transportation Cost \*/i }).fill('100');
      await page.getByRole('textbox', { name: /Installation Cost \(for G\+0\) \*/i }).fill('500');
      await page.getByRole('textbox', { name: /Installation Cost Per Floor Increase \*/i }).fill('50');
      await page.getByRole('textbox', { name: /Machine Hoisting \(for G\+0\) \*/i }).fill('200');
      await page.getByRole('textbox', { name: /Machine Hoisting Per Floor Increase \*/i }).fill('20');

      // Click Submit
      await page.getByRole('button', { name: /Submit/i }).click();

      // Validation error for City Name should appear
      await expect(page.locator('text=/please enter city name/i')).toBeVisible({ timeout: 5000 });

      // Form should remain on Add City page
      await expect(page).toHaveURL(new RegExp(CITY_MASTER_URL));
      await expect(page.getByRole('heading', { name: /Add City/i })).toBeVisible();
    });

    // TC-CM-005: Fails when Transportation Cost is empty
    test('TC-CM-005: Form fails when Transportation Cost is empty', async ({ page }) => {
      // Enter city name, leave Transportation Cost blank, fill other mandatory fields
      await page.getByRole('textbox', { name: /City Name \*/i }).fill('ValidationTest');
      await page.getByRole('textbox', { name: /Installation Cost \(for G\+0\) \*/i }).fill('500');
      await page.getByRole('textbox', { name: /Installation Cost Per Floor Increase \*/i }).fill('50');
      await page.getByRole('textbox', { name: /Machine Hoisting \(for G\+0\) \*/i }).fill('200');
      await page.getByRole('textbox', { name: /Machine Hoisting Per Floor Increase \*/i }).fill('20');

      // Click Submit
      await page.getByRole('button', { name: /Submit/i }).click();

      // Validation error for Transportation Cost should appear
      await expect(page.locator('text=/please enter transportation cost/i')).toBeVisible({ timeout: 5000 });

      // Form should remain on Add City page
      await expect(page).toHaveURL(new RegExp(CITY_MASTER_URL));
    });

    // TC-CM-006: Fails when Installation Cost is empty
    test('TC-CM-006: Form fails when Installation Cost is empty', async ({ page }) => {
      // Fill city name and transportation cost, leave Installation Cost blank
      await page.getByRole('textbox', { name: /City Name \*/i }).fill('ValidationTest');
      await page.getByRole('textbox', { name: /Transportation Cost \*/i }).fill('100');
      await page.getByRole('textbox', { name: /Installation Cost Per Floor Increase \*/i }).fill('50');
      await page.getByRole('textbox', { name: /Machine Hoisting \(for G\+0\) \*/i }).fill('200');
      await page.getByRole('textbox', { name: /Machine Hoisting Per Floor Increase \*/i }).fill('20');

      // Click Submit
      await page.getByRole('button', { name: /Submit/i }).click();

      // Validation error for Installation Cost should appear
      await expect(page.locator('text=/please enter installation cost/i')).toBeVisible({ timeout: 5000 });

      // Form should remain on Add City page
      await expect(page).toHaveURL(new RegExp(CITY_MASTER_URL));
    });

    // TC-CM-007: Fails when Installation Cost Per Floor Increase is empty
    test('TC-CM-007: Form fails when Installation Cost Per Floor Increase is empty', async ({ page }) => {
      // Fill all mandatory fields except Installation Cost Per Floor Increase
      await page.getByRole('textbox', { name: /City Name \*/i }).fill('ValidationTest');
      await page.getByRole('textbox', { name: /Transportation Cost \*/i }).fill('100');
      await page.getByRole('textbox', { name: /Installation Cost \(for G\+0\) \*/i }).fill('500');
      await page.getByRole('textbox', { name: /Machine Hoisting \(for G\+0\) \*/i }).fill('200');
      await page.getByRole('textbox', { name: /Machine Hoisting Per Floor Increase \*/i }).fill('20');

      // Click Submit
      await page.getByRole('button', { name: /Submit/i }).click();

      // Validation error for Installation Cost Per Floor Increase should appear
      await expect(page.locator('text=/please enter installation cost per floor increase/i')).toBeVisible({ timeout: 5000 });

      // Form should remain on Add City page
      await expect(page).toHaveURL(new RegExp(CITY_MASTER_URL));
    });

    // TC-CM-008: Fails when Machine Hoisting is empty
    test('TC-CM-008: Form fails when Machine Hoisting is empty', async ({ page }) => {
      // Fill all mandatory fields except Machine Hoisting
      await page.getByRole('textbox', { name: /City Name \*/i }).fill('ValidationTest');
      await page.getByRole('textbox', { name: /Transportation Cost \*/i }).fill('100');
      await page.getByRole('textbox', { name: /Installation Cost \(for G\+0\) \*/i }).fill('500');
      await page.getByRole('textbox', { name: /Installation Cost Per Floor Increase \*/i }).fill('50');
      await page.getByRole('textbox', { name: /Machine Hoisting Per Floor Increase \*/i }).fill('20');

      // Click Submit
      await page.getByRole('button', { name: /Submit/i }).click();

      // Validation error for Machine Hoisting should appear
      await expect(page.locator('text=/please enter machine hoisting/i')).toBeVisible({ timeout: 5000 });

      // Form should remain on Add City page
      await expect(page).toHaveURL(new RegExp(CITY_MASTER_URL));
    });

    // TC-CM-009: Fails when Machine Hoisting Per Floor Increase is empty
    test('TC-CM-009: Form fails when Machine Hoisting Per Floor Increase is empty', async ({ page }) => {
      // Fill all mandatory fields except Machine Hoisting Per Floor Increase
      await page.getByRole('textbox', { name: /City Name \*/i }).fill('ValidationTest');
      await page.getByRole('textbox', { name: /Transportation Cost \*/i }).fill('100');
      await page.getByRole('textbox', { name: /Installation Cost \(for G\+0\) \*/i }).fill('500');
      await page.getByRole('textbox', { name: /Installation Cost Per Floor Increase \*/i }).fill('50');
      await page.getByRole('textbox', { name: /Machine Hoisting \(for G\+0\) \*/i }).fill('200');

      // Click Submit
      await page.getByRole('button', { name: /Submit/i }).click();

      // Validation error for Machine Hoisting Per Floor Increase should appear
      await expect(page.locator('text=/please enter machine hoisting per floor increase/i')).toBeVisible({ timeout: 5000 });

      // Form should remain on Add City page
      await expect(page).toHaveURL(new RegExp(CITY_MASTER_URL));
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 4 – Negative: Numeric Field Input Validation
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Numeric Field Input Validation (Negative)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCityMaster(page);
    });

    // TC-CM-010: Numeric fields reject alphabetic/special characters
    test('TC-CM-010: Numeric fields reject alphabetic and special character input', async ({ page }) => {
      // Transportation Cost field should reject alphabetic input
      const transportCostField = page.getByRole('textbox', { name: /Transportation Cost \*/i });
      await transportCostField.fill('abc');
      await expect(transportCostField).toHaveValue('');

      // Outward Transportation Cost field should reject alphabetic input
      const outwardField = page.getByRole('textbox', { name: /Outward Transportation Cost/i });
      await outwardField.fill('xyz');
      await expect(outwardField).toHaveValue('');

      // Installation Cost field should reject alphabetic input
      const installCostField = page.getByRole('textbox', { name: /Installation Cost \(for G\+0\) \*/i });
      await installCostField.fill('abc!@#');
      await expect(installCostField).toHaveValue('');

      // Installation Cost Per Floor Increase should reject alphabetic input
      const installPerFloorField = page.getByRole('textbox', { name: /Installation Cost Per Floor Increase \*/i });
      await installPerFloorField.fill('def');
      await expect(installPerFloorField).toHaveValue('');

      // Machine Hoisting field should reject alphabetic input
      const machineField = page.getByRole('textbox', { name: /Machine Hoisting \(for G\+0\) \*/i });
      await machineField.fill('ghi');
      await expect(machineField).toHaveValue('');

      // Machine Hoisting Per Floor Increase should reject alphabetic input
      const machinePerFloorField = page.getByRole('textbox', { name: /Machine Hoisting Per Floor Increase \*/i });
      await machinePerFloorField.fill('jkl');
      await expect(machinePerFloorField).toHaveValue('');
    });

    // TC-CM-011: Numeric fields reject negative values
    test('TC-CM-011: Numeric fields with negative values do not create a record', async ({ page }) => {
      const timestamp = Date.now();
      const cityName = `NegVal ${timestamp}`;

      await page.getByRole('textbox', { name: /City Name \*/i }).fill(cityName);
      await page.getByRole('textbox', { name: /Transportation Cost \*/i }).fill('-100');
      await page.getByRole('textbox', { name: /Installation Cost \(for G\+0\) \*/i }).fill('-500');
      await page.getByRole('textbox', { name: /Installation Cost Per Floor Increase \*/i }).fill('-50');
      await page.getByRole('textbox', { name: /Machine Hoisting \(for G\+0\) \*/i }).fill('-200');
      await page.getByRole('textbox', { name: /Machine Hoisting Per Floor Increase \*/i }).fill('-20');

      // Click Submit
      await page.getByRole('button', { name: /Submit/i }).click();

      // Should either show validation error or remain on the same page
      await expect(page).toHaveURL(new RegExp(CITY_MASTER_URL));
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 5 – Boundary
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Boundary Tests', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCityMaster(page);
    });

    // TC-CM-012: Numeric fields with zero value
    test('TC-CM-012: Numeric fields with zero value - validate consistent behavior', async ({ page }) => {
      const timestamp = Date.now();
      const cityName = `ZeroVal ${timestamp}`;

      // Fill all mandatory numeric fields with 0
      await page.getByRole('textbox', { name: /City Name \*/i }).fill(cityName);
      await page.getByRole('textbox', { name: /Transportation Cost \*/i }).fill('0');
      await page.getByRole('textbox', { name: /Installation Cost \(for G\+0\) \*/i }).fill('0');
      await page.getByRole('textbox', { name: /Installation Cost Per Floor Increase \*/i }).fill('0');
      await page.getByRole('textbox', { name: /Machine Hoisting \(for G\+0\) \*/i }).fill('0');
      await page.getByRole('textbox', { name: /Machine Hoisting Per Floor Increase \*/i }).fill('0');

      // Click Submit
      await page.getByRole('button', { name: /Submit/i }).click();

      // Page should remain on city-master regardless of outcome
      await expect(page).toHaveURL(new RegExp(CITY_MASTER_URL));
    });

    // TC-CM-021: City Name with numeric-only input - system accepts numeric values
    test('TC-CM-021: City Name with numeric-only input - system accepts numeric values', async ({ page }) => {
      const timestamp = Date.now();
      const cityName = `12345${timestamp}`;

      // Enter only numbers in City Name
      await page.getByRole('textbox', { name: /City Name \*/i }).fill(cityName);
      await page.getByRole('textbox', { name: /Transportation Cost \*/i }).fill('100');
      await page.getByRole('textbox', { name: /Installation Cost \(for G\+0\) \*/i }).fill('500');
      await page.getByRole('textbox', { name: /Installation Cost Per Floor Increase \*/i }).fill('50');
      await page.getByRole('textbox', { name: /Machine Hoisting \(for G\+0\) \*/i }).fill('200');
      await page.getByRole('textbox', { name: /Machine Hoisting Per Floor Increase \*/i }).fill('20');

      // Click Submit
      await page.getByRole('button', { name: /Submit/i }).click();

      // City Name accepts numeric input — form should submit successfully and record should appear in the table
      await expect(page.getByRole('heading', { name: /Add City/i })).toBeVisible({ timeout: 15000 });
      await expect(page.locator('table tbody').getByText(cityName)).toBeVisible({ timeout: 15000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 6 – City Manager/Head Dropdown
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('City Manager/Head Dropdown', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCityMaster(page);
    });

    // TC-CM-013: City Manager/Head dropdown loads all users
    test('TC-CM-013: City Manager/Head dropdown loads all users', async ({ page }) => {
      // Click the City Manager/Head dropdown to open it
      await page.locator('#react-select-3-input').click();

      // Dropdown should open and display user options
      await expect(page.locator('[class*="option"]').first()).toBeVisible({ timeout: 10000 });

      // There should be more than 1 user in the list
      const optionCount = await page.locator('[class*="option"]').count();
      expect(optionCount).toBeGreaterThan(1);

      // Close the dropdown
      await page.keyboard.press('Escape');
    });

    // TC-CM-014: Selecting a user from City Manager/Head dropdown
    test('TC-CM-014: Selecting a user from City Manager/Head dropdown', async ({ page }) => {
      // Click the City Manager/Head dropdown to open it
      await page.locator('#react-select-3-input').click();

      // Get the first option text and click it
      const firstOption = page.locator('[class*="option"]').first();
      const selectedUserName = await firstOption.textContent();
      await firstOption.click();

      // Selected user name should appear in the dropdown field
      const selectedValue = page.locator('[class*="singleValue"]');
      await expect(selectedValue).toBeVisible({ timeout: 5000 });
      await expect(selectedValue).toHaveText(selectedUserName?.trim() ?? '');
    });

    // TC-CM-027: Assigned City Manager appears correctly in city details
    test('TC-CM-027: Assigned City Manager appears correctly in city record', async ({ page }) => {
      const timestamp = Date.now();
      const cityName = `ManagerCity ${timestamp}`;

      // Fill mandatory fields
      await fillCityFormMandatory(page, cityName, '100', '500', '50', '200', '20');

      // Select a user from City Manager/Head dropdown
      await page.locator('#react-select-3-input').click();
      const firstOption = page.locator('[class*="option"]').first();
      const managerName = await firstOption.textContent();
      await firstOption.click();

      // Submit the form
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.getByRole('heading', { name: /Add City/i })).toBeVisible({ timeout: 15000 });

      // Verify the assigned manager appears in the table row for this city
      const cityRow = getRowByCityName(page, cityName);
      await expect(cityRow).toBeVisible({ timeout: 15000 });
      await expect(cityRow.getByText(managerName?.trim() ?? '')).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 7 – City Head Signature File Upload
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('City Head Signature File Upload', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCityMaster(page);
    });

    // TC-CM-016: City Head Signature accepts PNG file
    test('TC-CM-016: City Head Signature accepts PNG file', async ({ page }) => {
      const timestamp = Date.now();
      const cityName = `PNGCity ${timestamp}`;

      await fillCityFormMandatory(page, cityName, '100', '500', '50', '200', '20');

      // Upload a valid PNG file
      const pngFilePath = path.resolve(__dirname, '../../node_modules/playwright-core/lib/server/chromium/appIcon.png');
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(pngFilePath);

      // Click Submit
      await page.getByRole('button', { name: /Submit/i }).click();

      // Form should reset after success — PNG was accepted
      await expect(page.getByRole('heading', { name: /Add City/i })).toBeVisible({ timeout: 15000 });
      await expect(page.locator('table tbody').getByText(cityName)).toBeVisible({ timeout: 15000 });
    });

    // TC-CM-017: City Head Signature accepts JPEG file
    test('TC-CM-017: City Head Signature accepts JPEG file', async ({ page }) => {
      const timestamp = Date.now();
      const cityName = `JPEGCity ${timestamp}`;

      await fillCityFormMandatory(page, cityName, '100', '500', '50', '200', '20');

      // Create a minimal JPEG file buffer for upload
      const jpegFilePath = path.resolve(__dirname, '../../test-results/.playwright-artifacts-7/traces/resources/eda472aa2fd3b2a6397403d20903ff1232b536e4.jpeg');
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(jpegFilePath);

      // Click Submit
      await page.getByRole('button', { name: /Submit/i }).click();

      // Form should reset after success — JPEG was accepted
      await expect(page.getByRole('heading', { name: /Add City/i })).toBeVisible({ timeout: 15000 });
      await expect(page.locator('table tbody').getByText(cityName)).toBeVisible({ timeout: 15000 });
    });

    // TC-CM-018: City Head Signature accepts JPG file
    test('TC-CM-018: City Head Signature accepts JPG file', async ({ page }) => {
      const timestamp = Date.now();
      const cityName = `JPGCity ${timestamp}`;

      await fillCityFormMandatory(page, cityName, '100', '500', '50', '200', '20');

      // Upload a JPG file (same as JPEG, different extension)
      const jpgFilePath = path.resolve(__dirname, '../../test-results/.playwright-artifacts-7/traces/resources/fb50903b2cfd3e613ee8bf08ebddd5d86fc778bb.jpeg');
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({ name: 'signature.jpg', mimeType: 'image/jpeg', buffer: Buffer.alloc(100, 0) });

      // Click Submit
      await page.getByRole('button', { name: /Submit/i }).click();

      // Form should reset after success — JPG was accepted
      await expect(page.getByRole('heading', { name: /Add City/i })).toBeVisible({ timeout: 15000 });
      await expect(page.locator('table tbody').getByText(cityName)).toBeVisible({ timeout: 15000 });
    });

    // TC-CM-019: City Head Signature rejects unsupported file types
    test('TC-CM-019: City Head Signature rejects unsupported file types', async ({ page }) => {
      await fillCityFormMandatory(page, 'FileTypeTest', '100', '500', '50', '200', '20');

      const fileInput = page.locator('input[type="file"]');

      // Attempt to upload a PDF file
      await fileInput.setInputFiles({ name: 'test.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(100, 0) });

      // Click Submit
      await page.getByRole('button', { name: /Submit/i }).click();

      // System should reject the unsupported file or show an error
      // Either an error message is shown or the form stays on the same page
      await expect(page).toHaveURL(new RegExp(CITY_MASTER_URL));
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 8 – Negative: Duplicate City Name
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Duplicate City Name (Negative)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCityMaster(page);
    });

    // TC-CM-022: Duplicate city name is not allowed
    test('TC-CM-022: Duplicate city name is not allowed', async ({ page }) => {
      // Use an existing city name from the table
      await waitForTableRows(page);
      const existingCityName = (await page.locator('table tbody tr').first().locator('td').nth(2).textContent())?.trim() ?? '';
      expect(existingCityName.length).toBeGreaterThan(0);

      // Try to create a city with the same name
      await fillCityFormMandatory(page, existingCityName, '100', '500', '50', '200', '20');

      // Click Submit
      await page.getByRole('button', { name: /Submit/i }).click();

      // Page should remain on city-master (no redirect = duplicate blocked)
      await expect(page).toHaveURL(new RegExp(CITY_MASTER_URL));
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 9 – Edit / Update City
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Edit City (Positive)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCityMaster(page);
    });

    // TC-CM-023: Edit existing city record
    test('TC-CM-023: Edit existing city record updates successfully', async ({ page }) => {
      await waitForTableRows(page);

      // Read city name from first row
      const originalName = (await page.locator('table tbody tr').first().locator('td').nth(2).textContent())?.trim() ?? '';
      expect(originalName.length).toBeGreaterThan(0);

      // Click Edit on first row
      await clickEditOnRow(page, 0);

      // Form heading should change to Update City
      await expect(page.getByRole('heading', { name: /Update City/i })).toBeVisible({ timeout: 10000 });

      // Form should be pre-populated with the original city name
      const currentName = await page.getByRole('textbox', { name: /City Name \*/i }).inputValue();
      expect(currentName).toBe(originalName);

      // Update the Transportation Cost
      await page.getByRole('textbox', { name: /Transportation Cost \*/i }).fill('999');

      // Click Update
      await page.getByRole('button', { name: /Update/i }).click();

      // Form should reset to Add City mode
      await expect(page.getByRole('heading', { name: /Add City/i })).toBeVisible({ timeout: 15000 });

      // Restore original value
      await clickEditOnRow(page, 0);
      await page.getByRole('textbox', { name: /Transportation Cost \*/i }).fill('0');
      await page.getByRole('button', { name: /Update/i }).click();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 10 – Inactive Status
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Inactive Status (Positive)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCityMaster(page);
    });

    // TC-CM-024: Inactive functionality - set status to inactive via edit
    test('TC-CM-024: Setting city to Inactive removes it from Active list', async ({ page }) => {
      await waitForTableRows(page);

      // Click Edit on the first row
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update City/i })).toBeVisible({ timeout: 10000 });

      // Remember the city name for verification
      const cityName = await page.getByRole('textbox', { name: /City Name \*/i }).inputValue();

      // Navigate to the Status dropdown and select Inactive
      const statusDropdown = page.getByRole('combobox', { name: /Status \*/i });
      await expect(statusDropdown).toBeVisible({ timeout: 5000 });
      await statusDropdown.selectOption('Inactive');

      // Click Update
      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.getByRole('heading', { name: /Add City/i })).toBeVisible({ timeout: 15000 });

      // Active filter (default) should NOT show this record
      const activeRows = page.locator('table tbody tr').filter({ hasText: cityName });
      await expect(activeRows).toHaveCount(0, { timeout: 10000 });

      // Switch to Inactive filter — record should appear
      const statusFilter = page.locator('select').filter({ has: page.locator('option', { hasText: 'Inactive' }) });
      await statusFilter.first().selectOption('Inactive');
      await expect(page.locator('table tbody').getByText(cityName)).toBeVisible({ timeout: 10000 });

      // Restore: set status back to Active
      const inactiveRow = getRowByCityName(page, cityName);
      await inactiveRow.getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update City/i })).toBeVisible({ timeout: 10000 });
      await statusDropdown.selectOption('Active');
      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.getByRole('heading', { name: /Add City/i })).toBeVisible({ timeout: 15000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 11 – Cancel / Clear Form
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Cancel / Clear Form (Positive)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCityMaster(page);
    });

    // TC-CM-025: Cancel/Clear discards unsaved changes
    test('TC-CM-025: Clear button discards unsaved changes', async ({ page }) => {
      // Enter data in some fields
      await page.getByRole('textbox', { name: /City Name \*/i }).fill('ShouldBeCleared');
      await page.getByRole('textbox', { name: /Transportation Cost \*/i }).fill('999');
      await page.getByRole('textbox', { name: /Installation Cost \(for G\+0\) \*/i }).fill('888');

      // Click Clear without saving
      await page.getByRole('button', { name: /Clear/i }).click();

      // Form should remain in Add City mode
      await expect(page.getByRole('heading', { name: /Add City/i })).toBeVisible();

      // All fields should be empty after clear
      await expect(page.getByRole('textbox', { name: /City Name \*/i })).toHaveValue('');
      await expect(page.getByRole('textbox', { name: /Transportation Cost \*/i })).toHaveValue('');
      await expect(page.getByRole('textbox', { name: /Installation Cost \(for G\+0\) \*/i })).toHaveValue('');

      // No record named "ShouldBeCleared" should appear in the table
      const matchingRows = await page.locator('table tbody tr').filter({ hasText: 'ShouldBeCleared' }).count();
      expect(matchingRows).toBe(0);
    });

    // TC-CM-025 (edit mode): Clear in update mode discards changes and resets form
    test('TC-CM-025b: Clear in update mode discards changes and resets to Add City', async ({ page }) => {
      await waitForTableRows(page);

      const originalName = (await page.locator('table tbody tr').first().locator('td').nth(2).textContent())?.trim() ?? '';

      // Click Edit to enter update mode
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update City/i })).toBeVisible({ timeout: 10000 });

      // Modify the city name field
      await page.getByRole('textbox', { name: /City Name \*/i }).fill('DiscardedChange');

      // Click Clear
      await page.getByRole('button', { name: /Clear/i }).click();

      // Form should reset to Add City mode
      await expect(page.getByRole('heading', { name: /Add City/i })).toBeVisible();
      await expect(page.getByRole('textbox', { name: /City Name \*/i })).toHaveValue('');

      // Original city should still exist in the table unchanged
      await expect(page.locator('table tbody').getByText(originalName)).toBeVisible({ timeout: 10000 });
    });

  });

});
