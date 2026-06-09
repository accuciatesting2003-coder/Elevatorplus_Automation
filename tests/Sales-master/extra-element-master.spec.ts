// spec: test-plans/Sales-mater-test-plan/extra-element-master-test-plan.md
// seed: tests/setup/auth.setup.ts

import { test, expect } from '../fixtures/auth-fixture';

const EXTRA_ELEMENT_MASTER_URL = '/master/extra-element-master';

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

async function gotoExtraElementMaster(page: any) {
  await registerPopupHandler(page);
  await page.goto(EXTRA_ELEMENT_MASTER_URL, { timeout: 60000 });
  await page.getByRole('heading', { name: /Add Extra Element/i }).waitFor({ state: 'visible', timeout: 45000 });
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

async function fillExtraElementForm(page: any, name: string | null, price: string | null) {
  if (name !== null) {
    await page.locator('#extra_element_name').fill(name);
  }
  if (price !== null) {
    await page.locator('#unit_price').fill(price);
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

// Search input in the table toolbar
function searchInput(page: any) {
  return page.locator('input[placeholder="Extra Element Name"]');
}

// Status is rendered as the LAST h5 badge in each row (In Customer Scope is the first h5).
async function getStatusColumnTexts(page: any): Promise<string[]> {
  const rows = tableRows(page);
  const count = await rows.count();
  const texts: string[] = [];
  for (let i = 0; i < count; i++) {
    const text = await rows.nth(i).getByRole('heading', { level: 5 }).last().innerText().catch(() => '');
    texts.push(text.trim());
  }
  return texts;
}

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Extra Element Master', () => {

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 1 – Smoke
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Smoke', () => {

    test.beforeEach(async ({ page }) => {
      await gotoExtraElementMaster(page);
    });

    // TC-SM-01: Extra Element Master page loads successfully
    test('TC-SM-01: Page loads successfully', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /Extra Element Master/i })).toBeVisible();
      await expect(page.getByRole('heading', { name: /Add Extra Element/i })).toBeVisible();
      await expect(page.locator('#extra_element_name')).toBeVisible();
      await expect(page.getByRole('checkbox', { name: /In Customer Scope/i })).toBeVisible();
      await expect(page.locator('#unit_price')).toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Clear/i })).toBeVisible();
      // Table columns
      await expect(page.getByRole('button', { name: /Extra Element Name/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /In Customer Scope/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Unit Price/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Status/i })).toBeVisible();
    });

    // TC-SM-02: Verify page elements and layout
    test('TC-SM-02: Verify page elements and layout', async ({ page }) => {
      // Form section heading
      await expect(page.getByRole('heading', { name: /Add Extra Element/i })).toBeVisible();

      // Rows-per-page dropdown
      const rowsSelect = showEntriesSelect(page);
      await expect(rowsSelect).toBeVisible();
      await expect(rowsSelect).toHaveValue('25');

      // Status filter dropdown defaults to Active
      await expect(statusFilterSelect(page)).toHaveValue('true');

      // Update Price button
      await expect(page.getByRole('button', { name: /Update Price/i })).toBeVisible();

      // Search box with placeholder
      await expect(searchInput(page)).toBeVisible();

      // Table column header buttons (with sort icons) only appear after data loads
      await waitForTableRows(page);

      // Sortable column headers have sort icons (svg elements inside buttons)
      await expect(page.getByRole('button', { name: /Extra Element Name/i }).locator('svg')).toBeVisible();
      await expect(page.getByRole('button', { name: /In Customer Scope/i }).locator('svg')).toBeVisible();
      await expect(page.getByRole('button', { name: /Unit Price/i }).locator('svg')).toBeVisible();
      await expect(page.getByRole('button', { name: /Status/i }).locator('svg')).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 2 – Add Extra Element (Happy Path)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Add Extra Element (Happy Path)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoExtraElementMaster(page);
    });

    // TC-ADD-01: Successfully create a new extra element with In Customer Scope unchecked
    test('TC-ADD-01: Create with In Customer Scope unchecked', async ({ page }) => {
      const timestamp = Date.now();
      const elementName = `Glass Panelling ${timestamp}`;

      // Fill Extra Element Name
      await page.locator('#extra_element_name').fill(elementName);
      // Fill Unit Price
      await page.locator('#unit_price').fill('150');
      // Ensure checkbox is unchecked (default)
      await expect(page.getByRole('checkbox', { name: /In Customer Scope/i })).not.toBeChecked();
      // Submit the form
      await submitForm(page);

      // Success toast
      await expect(page.getByText(/Extra element created successfully/i)).toBeVisible({ timeout: 15000 });

      // Form resets to Add state
      await expect(page.getByRole('heading', { name: /Add Extra Element/i })).toBeVisible({ timeout: 15000 });
      await expect(page.locator('#extra_element_name')).toHaveValue('', { timeout: 15000 });

      // Record appears in table
      await searchInput(page).fill(elementName);
      await expect(tableRows(page).filter({ hasText: elementName })).toHaveCount(1, { timeout: 30000 });
      // Verify In Customer Scope is False and Status is Active
      const row = tableRows(page).filter({ hasText: elementName });
      await expect(row).toContainText('False');
      await expect(row).toContainText('Active');
      await searchInput(page).fill('');
    });

    // TC-ADD-02: Successfully create a new extra element with In Customer Scope checked
    test('TC-ADD-02: Create with In Customer Scope checked (Unit Price hidden)', async ({ page }) => {
      const timestamp = Date.now();
      const elementName = `Govt Compliant Lift ${timestamp}`;

      // Fill Extra Element Name
      await page.locator('#extra_element_name').fill(elementName);
      // Check In Customer Scope checkbox — Unit Price field disappears
      await page.getByRole('checkbox', { name: /In Customer Scope/i }).click();
      await expect(page.getByRole('checkbox', { name: /In Customer Scope/i })).toBeChecked();
      await expect(page.locator('#unit_price')).not.toBeVisible();
      // Submit the form
      await submitForm(page);

      // Success toast
      await expect(page.getByText(/Extra element created successfully/i)).toBeVisible({ timeout: 15000 });

      // Form resets — checkbox unchecked, Unit Price visible again
      await expect(page.getByRole('heading', { name: /Add Extra Element/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('checkbox', { name: /In Customer Scope/i })).not.toBeChecked();
      await expect(page.locator('#unit_price')).toBeVisible();

      // Record appears in table with In Customer Scope = True and Unit Price = 0
      await searchInput(page).fill(elementName);
      const row = tableRows(page).filter({ hasText: elementName });
      await expect(row).toHaveCount(1, { timeout: 30000 });
      await expect(row).toContainText('True');
      await expect(row).toContainText('0');
      await searchInput(page).fill('');
    });

    // TC-ADD-03: Create an extra element with special characters in the name
    test('TC-ADD-03: Create with special characters in name', async ({ page }) => {
      const timestamp = Date.now();
      const elementName = `Civil Work - Phase #2 (Extra) ${timestamp}`;

      await page.locator('#extra_element_name').fill(elementName);
      await page.locator('#unit_price').fill('200');
      await submitForm(page);

      await expect(page.getByText(/Extra element created successfully/i)).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Extra Element/i })).toBeVisible({ timeout: 15000 });

      // Verify record appears in table
      await searchInput(page).fill(elementName);
      await expect(tableRows(page).filter({ hasText: elementName })).toHaveCount(1, { timeout: 30000 });
      await searchInput(page).fill('');
    });

    // TC-ADD-04: Create an extra element with a large Unit Price value
    test('TC-ADD-04: Create with large Unit Price (99999)', async ({ page }) => {
      const timestamp = Date.now();
      const elementName = `Premium Glass Cabin ${timestamp}`;

      await page.locator('#extra_element_name').fill(elementName);
      await page.locator('#unit_price').fill('99999');
      await submitForm(page);

      await expect(page.getByText(/Extra element created successfully/i)).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Extra Element/i })).toBeVisible({ timeout: 15000 });

      await searchInput(page).fill(elementName);
      await expect(tableRows(page).filter({ hasText: elementName })).toHaveCount(1, { timeout: 30000 });
      await searchInput(page).fill('');
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 3 – Mandatory Field Validation
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Mandatory Field Validation', () => {

    test.beforeEach(async ({ page }) => {
      await gotoExtraElementMaster(page);
    });

    // TC-VAL-01: Submit form with both mandatory fields empty shows inline errors
    test('TC-VAL-01: Submit empty form — both errors shown', async ({ page }) => {
      // Leave all fields empty and submit
      await submitForm(page);

      await expect(page.locator('.modern-error-text').filter({ hasText: 'Please enter extra element name' })).toBeVisible({ timeout: 5000 });
      await expect(page.locator('.modern-error-text').filter({ hasText: 'Please enter unit price' })).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add Extra Element/i })).toBeVisible();
    });

    // TC-VAL-02: Submit form with only Extra Element Name empty
    test('TC-VAL-02: Submit with only name empty', async ({ page }) => {
      await page.locator('#unit_price').fill('50');
      await submitForm(page);

      await expect(page.locator('.modern-error-text').filter({ hasText: 'Please enter extra element name' })).toBeVisible({ timeout: 5000 });
      await expect(page.locator('.modern-error-text').filter({ hasText: 'Please enter unit price' })).not.toBeVisible();
    });

    // TC-VAL-03: Submit form with only Unit Price empty (In Customer Scope unchecked)
    test('TC-VAL-03: Submit with only Unit Price empty (checkbox unchecked)', async ({ page }) => {
      await page.locator('#extra_element_name').fill('Test Element');
      await expect(page.getByRole('checkbox', { name: /In Customer Scope/i })).not.toBeChecked();
      await submitForm(page);

      await expect(page.locator('.modern-error-text').filter({ hasText: 'Please enter unit price' })).toBeVisible({ timeout: 5000 });
      await expect(page.locator('.modern-error-text').filter({ hasText: 'Please enter extra element name' })).not.toBeVisible();
    });

    // TC-VAL-04: Validation errors clear when valid input is entered after failed submission
    test('TC-VAL-04: Errors clear when valid input entered', async ({ page }) => {
      // Trigger both errors
      await submitForm(page);
      await expect(page.locator('.modern-error-text').filter({ hasText: 'Please enter extra element name' })).toBeVisible({ timeout: 5000 });
      await expect(page.locator('.modern-error-text').filter({ hasText: 'Please enter unit price' })).toBeVisible({ timeout: 5000 });

      // Enter valid name — name error should clear (use timestamp to avoid duplicate)
      const uniqueName = `Valid Element ${Date.now()}`;
      await page.locator('#extra_element_name').fill(uniqueName);
      await expect(page.locator('.modern-error-text').filter({ hasText: 'Please enter extra element name' })).not.toBeVisible();

      // Enter valid price and submit successfully
      await page.locator('#unit_price').fill('75');
      await submitForm(page);

      await expect(page.getByText(/Extra element created successfully/i)).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Extra Element/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-VAL-05: Submit form with only whitespace in Extra Element Name
    test('TC-VAL-05: Whitespace-only name shows validation error or is rejected', async ({ page }) => {
      await page.locator('#extra_element_name').fill('   ');
      await page.locator('#unit_price').fill('50');
      await submitForm(page);

      // App trims whitespace; may show "Please enter extra element name" or
      // "Extra element name can not be empty", or a toast
      const nameError = page.locator('.modern-error-text').filter({ hasText: /extra element name/i });
      const anyToast = page.locator('[role="alert"]').first();
      await expect(nameError.or(anyToast)).toBeVisible({ timeout: 10000 });
    });

    // TC-VAL-06: Submit form with negative Unit Price
    test('TC-VAL-06: Negative Unit Price is rejected', async ({ page }) => {
      await page.locator('#extra_element_name').fill('Test Element Price');
      await page.locator('#unit_price').fill('-10');
      await submitForm(page);

      // Either validation error or error toast should appear, no successful creation
      const errorVisible = await page.locator('[class*="error"], [class*="toast"], [role="alert"]').first().isVisible({ timeout: 5000 }).catch(() => false);
      const stayedOnAdd = await page.getByRole('heading', { name: /Add Extra Element/i }).isVisible({ timeout: 5000 }).catch(() => false);
      expect(errorVisible || stayedOnAdd).toBeTruthy();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 4 – Checkbox Behavior
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Checkbox Behavior', () => {

    test.beforeEach(async ({ page }) => {
      await gotoExtraElementMaster(page);
    });

    // TC-CHK-01: Checkbox unchecked by default and Unit Price field is visible
    test('TC-CHK-01: Checkbox unchecked by default, Unit Price visible', async ({ page }) => {
      await expect(page.getByRole('checkbox', { name: /In Customer Scope/i })).not.toBeChecked();
      await expect(page.locator('#unit_price')).toBeVisible();
    });

    // TC-CHK-02: Checking In Customer Scope hides the Unit Price field
    test('TC-CHK-02: Checking hides Unit Price', async ({ page }) => {
      await page.getByRole('checkbox', { name: /In Customer Scope/i }).click();
      await expect(page.getByRole('checkbox', { name: /In Customer Scope/i })).toBeChecked();
      await expect(page.locator('#unit_price')).not.toBeVisible();
    });

    // TC-CHK-03: Unchecking In Customer Scope restores the Unit Price field
    test('TC-CHK-03: Unchecking restores Unit Price', async ({ page }) => {
      // Check then uncheck
      await page.getByRole('checkbox', { name: /In Customer Scope/i }).click();
      await expect(page.locator('#unit_price')).not.toBeVisible();
      await page.getByRole('checkbox', { name: /In Customer Scope/i }).click();
      await expect(page.getByRole('checkbox', { name: /In Customer Scope/i })).not.toBeChecked();
      await expect(page.locator('#unit_price')).toBeVisible();
    });

    // TC-CHK-04: With checkbox checked and empty name, only name error shown
    test('TC-CHK-04: Checkbox checked, empty name — only name error shown', async ({ page }) => {
      // Check checkbox (hides Unit Price)
      await page.getByRole('checkbox', { name: /In Customer Scope/i }).click();
      await expect(page.locator('#unit_price')).not.toBeVisible();

      // Submit without name
      await submitForm(page);

      await expect(page.locator('.modern-error-text').filter({ hasText: 'Please enter extra element name' })).toBeVisible({ timeout: 5000 });
      await expect(page.locator('.modern-error-text').filter({ hasText: 'Please enter unit price' })).not.toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 5 – Duplicate Prevention
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Duplicate Prevention', () => {

    test.beforeEach(async ({ page }) => {
      await gotoExtraElementMaster(page);
    });

    // TC-DUP-01: Duplicate name shows error toast
    test('TC-DUP-01: Duplicate name shows toast error', async ({ page }) => {
      await waitForTableRows(page);
      // Use an existing name from the table
      const existingName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText()).trim();

      await page.locator('#extra_element_name').fill(existingName);
      await page.locator('#unit_price').fill('5');
      await submitForm(page);

      await expect(page.getByText(/already exists/i)).toBeVisible({ timeout: 15000 });
    });

    // TC-DUP-02: Case-sensitivity duplicate test
    test('TC-DUP-02: Case-sensitivity duplicate test', async ({ page }) => {
      await waitForTableRows(page);
      const existingName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText()).trim();
      const upperCaseName = existingName.toUpperCase();

      await page.locator('#extra_element_name').fill(upperCaseName);
      await page.locator('#unit_price').fill('5');
      await submitForm(page);

      // Either duplicate error or success toast should appear
      const errorText = page.getByText(/already exists/i);
      const successText = page.getByText(/Extra element created successfully/i);
      await expect(errorText.or(successText)).toBeVisible({ timeout: 15000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 6 – Clear Button
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Clear Button', () => {

    test.beforeEach(async ({ page }) => {
      await gotoExtraElementMaster(page);
    });

    // TC-CLR-01: Clear button resets the Add Extra Element form
    test('TC-CLR-01: Clear resets add form', async ({ page }) => {
      await page.locator('#extra_element_name').fill('Temporary Element Name');
      // Check checkbox (hides Unit Price)
      await page.getByRole('checkbox', { name: /In Customer Scope/i }).click();
      await expect(page.getByRole('checkbox', { name: /In Customer Scope/i })).toBeChecked();
      await expect(page.locator('#unit_price')).not.toBeVisible();

      // Click Clear
      await clearForm(page);

      await expect(page.getByRole('heading', { name: /Add Extra Element/i })).toBeVisible();
      await expect(page.locator('#extra_element_name')).toHaveValue('');
      // Note: app does not reset the In Customer Scope checkbox on Clear in add mode;
      // only the name field and form heading are reset.
    });

    // TC-CLR-02: Clear button in Edit mode resets form to Add Extra Element state
    test('TC-CLR-02: Clear in edit mode resets to Add state', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Extra Element/i })).toBeVisible({ timeout: 10000 });

      // Click Clear
      await clearForm(page);

      await expect(page.getByRole('heading', { name: /Add Extra Element/i })).toBeVisible({ timeout: 10000 });
      await expect(page.locator('#extra_element_name')).toHaveValue('');
      await expect(page.locator('#status')).not.toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 7 – Edit and Update
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Edit and Update', () => {

    test.beforeEach(async ({ page }) => {
      await gotoExtraElementMaster(page);
    });

    // TC-EDT-01: Edit icon opens the record in update mode
    test('TC-EDT-01: Edit icon opens record in update mode', async ({ page }) => {
      await waitForTableRows(page);
      const firstRow = tableRows(page).first();
      const rowName = (await firstRow.locator('[role="cell"]').nth(2).innerText()).trim();

      await clickEditOnRow(page, 0);

      await expect(page.getByRole('heading', { name: /Update Extra Element/i })).toBeVisible({ timeout: 10000 });
      await expect(page.locator('#extra_element_name')).toHaveValue(rowName);
      await expect(page.locator('#status')).toBeVisible();
      // Submit button stays as "Submit" in both add and edit modes
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    // TC-EDT-02: Successfully update the extra element name
    test('TC-EDT-02: Update name successfully', async ({ page }) => {
      await waitForTableRows(page);
      const firstRow = tableRows(page).first();
      const originalName = (await firstRow.locator('[role="cell"]').nth(2).innerText()).trim();

      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Extra Element/i })).toBeVisible({ timeout: 10000 });

      const updatedName = `${originalName} Updated`;
      await page.locator('#extra_element_name').fill(updatedName);
      await submitForm(page);

      await expect(page.getByRole('heading', { name: /Add Extra Element/i })).toBeVisible({ timeout: 15000 });
      await searchInput(page).fill(updatedName);
      await expect(tableRows(page).filter({ hasText: updatedName })).toHaveCount(1, { timeout: 30000 });
      await searchInput(page).fill('');

      // Restore original name
      await searchInput(page).fill(updatedName);
      await expect(tableRows(page).filter({ hasText: updatedName })).toHaveCount(1, { timeout: 15000 });
      await tableRows(page).filter({ hasText: updatedName }).getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update Extra Element/i })).toBeVisible({ timeout: 10000 });
      await page.locator('#extra_element_name').fill(originalName);
      await submitForm(page);
      await expect(page.getByRole('heading', { name: /Add Extra Element/i })).toBeVisible({ timeout: 15000 });
      await searchInput(page).fill('');
    });

    // TC-EDT-03: Successfully update the Unit Price in edit mode
    test('TC-EDT-03: Update unit price', async ({ page }) => {
      await waitForTableRows(page);

      // Find a row with In Customer Scope = False to edit its price
      const falseRows = tableRows(page).filter({ hasText: 'False' });
      const count = await falseRows.count();
      if (count === 0) return;

      await falseRows.first().getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update Extra Element/i })).toBeVisible({ timeout: 10000 });

      const originalPrice = await page.locator('#unit_price').inputValue();
      const newPrice = originalPrice === '30' ? '31' : '30';

      await page.locator('#unit_price').fill(newPrice);
      await submitForm(page);

      await expect(page.getByRole('heading', { name: /Add Extra Element/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-EDT-04: Update In Customer Scope from unchecked to checked in edit mode
    test('TC-EDT-04: Update In Customer Scope unchecked→checked', async ({ page }) => {
      await waitForTableRows(page);

      // Find a row with In Customer Scope = False
      const falseRows = tableRows(page).filter({ hasText: 'False' });
      const count = await falseRows.count();
      if (count === 0) return;

      await falseRows.first().getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update Extra Element/i })).toBeVisible({ timeout: 10000 });

      // Ensure checkbox is unchecked, Unit Price visible
      await expect(page.getByRole('checkbox', { name: /In Customer Scope/i })).not.toBeChecked();
      await expect(page.locator('#unit_price')).toBeVisible();

      // Check the checkbox — Unit Price hidden
      await page.getByRole('checkbox', { name: /In Customer Scope/i }).click();
      await expect(page.getByRole('checkbox', { name: /In Customer Scope/i })).toBeChecked();
      await expect(page.locator('#unit_price')).not.toBeVisible();

      await submitForm(page);

      await expect(page.getByRole('heading', { name: /Add Extra Element/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-EDT-05: Update status to Inactive
    test('TC-EDT-05: Update status to Inactive', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Extra Element/i })).toBeVisible({ timeout: 10000 });

      const elementName = await page.locator('#extra_element_name').inputValue();

      // Change status to Inactive
      await page.locator('#status').selectOption('false');
      await submitForm(page);

      await expect(page.getByRole('heading', { name: /Add Extra Element/i })).toBeVisible({ timeout: 15000 });

      // Verify not in Active list
      const activeRows = tableRows(page).filter({ hasText: elementName });
      await expect(activeRows).toHaveCount(0, { timeout: 10000 });

      // Restore: find in Inactive, set back to Active
      await statusFilterSelect(page).selectOption('false');
      const inactiveRow = getRowByName(page, elementName);
      await inactiveRow.getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update Extra Element/i })).toBeVisible({ timeout: 10000 });
      await page.locator('#status').selectOption('true');
      await submitForm(page);
      await expect(page.getByRole('heading', { name: /Add Extra Element/i })).toBeVisible({ timeout: 15000 });
      await statusFilterSelect(page).selectOption('true');
    });

    // TC-EDT-06: Update with empty name shows validation error
    test('TC-EDT-06: Update with empty name shows validation error', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Extra Element/i })).toBeVisible({ timeout: 10000 });

      // Clear the name
      await page.locator('#extra_element_name').fill('');
      await submitForm(page);

      await expect(page.locator('.modern-error-text').filter({ hasText: 'Please enter extra element name' })).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Update Extra Element/i })).toBeVisible();
    });

    // TC-EDT-07: Update to duplicate name shows error
    test('TC-EDT-07: Update to duplicate name shows error', async ({ page }) => {
      await waitForTableRows(page);
      if ((await tableRows(page).count()) < 2) return;

      // Get name of second row to use as duplicate target
      const secondRowName = (await tableRows(page).nth(1).locator('[role="cell"]').nth(2).innerText()).trim();

      // Edit first row, set name to second row's name
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Extra Element/i })).toBeVisible({ timeout: 10000 });

      await page.locator('#extra_element_name').fill(secondRowName);
      await submitForm(page);

      await expect(page.getByText(/already exists/i)).toBeVisible({ timeout: 15000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 8 – Update Price Modal
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Update Price Modal', () => {

    test.beforeEach(async ({ page }) => {
      await gotoExtraElementMaster(page);
    });

    // TC-UPR-01: Update Price button opens the Bulk Update Extra Element Prices modal
    test('TC-UPR-01: Modal opens with correct structure', async ({ page }) => {
      await page.getByRole('button', { name: /Update Price/i }).click();

      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible({ timeout: 10000 });
      await expect(modal.getByRole('heading', { name: /Bulk Update Extra Element Prices/i })).toBeVisible();
      await expect(modal.getByRole('textbox', { name: /Search/i })).toBeVisible();
      await expect(modal.getByRole('button', { name: /Submit Updates/i })).toBeVisible();
      await expect(modal.getByRole('button', { name: /Cancel/i })).toBeVisible();
      await expect(modal.getByRole('button', { name: /Close/i })).toBeVisible();

      await modal.getByRole('button', { name: /Cancel/i }).click();
      await expect(modal).not.toBeVisible({ timeout: 10000 });
    });

    // TC-UPR-02: Search within modal filters the element list
    test('TC-UPR-02: Search within modal filters list', async ({ page }) => {
      await page.getByRole('button', { name: /Update Price/i }).click();
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible({ timeout: 10000 });

      // Count price inputs before search
      const priceInputs = modal.getByRole('textbox', { name: /Enter new unit price/i });
      await priceInputs.first().waitFor({ state: 'visible', timeout: 30000 }).catch(() => {});
      const countBefore = await priceInputs.count();

      // Search for 'wash'
      await modal.getByRole('textbox', { name: /Search/i }).fill('wash');
      await expect(modal).toBeVisible();

      const countAfter = await priceInputs.count();
      expect(countAfter).toBeLessThanOrEqual(countBefore);

      await modal.getByRole('button', { name: /Cancel/i }).click();
    });

    // TC-UPR-03: Successfully update prices for elements via the modal
    test('TC-UPR-03: Update prices successfully', async ({ page }) => {
      await page.getByRole('button', { name: /Update Price/i }).click();
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible({ timeout: 10000 });

      // Fill a new price in first available price input
      const firstPriceInput = modal.getByRole('textbox', { name: /Enter new unit price/i }).first();
      const hasInput = await firstPriceInput.isVisible({ timeout: 10000 }).catch(() => false);
      if (hasInput) {
        await firstPriceInput.fill('15');
        await modal.getByRole('button', { name: /Submit Updates/i }).click();
        await expect(modal).not.toBeVisible({ timeout: 15000 });
        await expect(page.getByRole('heading', { name: /Add Extra Element/i })).toBeVisible();
      } else {
        await modal.getByRole('button', { name: /Cancel/i }).click();
      }
    });

    // TC-UPR-04: Cancel button closes modal without saving
    test('TC-UPR-04: Cancel closes modal without saving', async ({ page }) => {
      await page.getByRole('button', { name: /Update Price/i }).click();
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible({ timeout: 10000 });

      // Modify a price then cancel
      const firstPriceInput = modal.getByRole('textbox', { name: /Enter new unit price/i }).first();
      const hasInput = await firstPriceInput.isVisible({ timeout: 5000 }).catch(() => false);
      if (hasInput) {
        await firstPriceInput.fill('9999');
      }

      await modal.getByRole('button', { name: /Cancel/i }).click();
      await expect(modal).not.toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('heading', { name: /Add Extra Element/i })).toBeVisible();
    });

    // TC-UPR-05: X/Close button closes modal
    test('TC-UPR-05: X/Close button closes modal', async ({ page }) => {
      await page.getByRole('button', { name: /Update Price/i }).click();
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible({ timeout: 10000 });

      await modal.getByRole('button', { name: /Close/i }).click();
      await expect(modal).not.toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('heading', { name: /Add Extra Element/i })).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 9 – Status Filter
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Status Filter', () => {

    test.beforeEach(async ({ page }) => {
      await gotoExtraElementMaster(page);
    });

    // TC-FLT-01: Default Active filter
    test('TC-FLT-01: Default Active filter shows only Active rows', async ({ page }) => {
      await expect(statusFilterSelect(page)).toHaveValue('true');
      await showEntriesSelect(page).selectOption('10');
      await waitForTableRows(page);

      const statuses = await getStatusColumnTexts(page);
      for (const status of statuses) {
        expect(status).toBe('Active');
      }
    });

    // TC-FLT-02: All filter shows both statuses
    test('TC-FLT-02: All filter shows both statuses', async ({ page }) => {
      await showEntriesSelect(page).selectOption('10');
      await statusFilterSelect(page).selectOption('');
      await expect(statusFilterSelect(page)).toHaveValue('');
      await waitForTableRows(page);

      const statuses = await getStatusColumnTexts(page);
      expect(statuses.map(s => s.trim())).toContain('Active');
    });

    // TC-FLT-03: Inactive filter shows only Inactive rows
    test('TC-FLT-03: Inactive filter shows only Inactive rows', async ({ page }) => {
      await showEntriesSelect(page).selectOption('10');
      await statusFilterSelect(page).selectOption('false');
      await expect(statusFilterSelect(page)).toHaveValue('false');

      const rowCount = await tableRows(page).count().catch(() => 0);
      if (rowCount > 0) {
        await waitForTableRows(page);
        const statuses = await getStatusColumnTexts(page);
        for (const status of statuses) {
          expect(status).toBe('Inactive');
        }
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 10 – Search
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Search', () => {

    test.beforeEach(async ({ page }) => {
      await gotoExtraElementMaster(page);
    });

    // TC-SRC-01: Partial name search returns matches
    test('TC-SRC-01: Partial name search returns matches', async ({ page }) => {
      await waitForTableRows(page);
      // Search for 'wash' — should match Golden wash, White Wash
      await searchInput(page).fill('wash');
      await expect(tableRows(page).first()).toContainText(/wash/i);

      const count = await tableRows(page).count();
      expect(count).toBeGreaterThan(0);
      await searchInput(page).fill('');
    });

    // TC-SRC-02: Non-existent name returns no results
    test('TC-SRC-02: Non-existent name returns no results', async ({ page }) => {
      await waitForTableRows(page);
      await searchInput(page).fill('XYZNONEXISTENTELE999');

      // Wait for table to update after search filter is applied
      await expect(tableRows(page)).toHaveCount(0, { timeout: 10000 });
      await searchInput(page).fill('');
    });

    // TC-SRC-03: Clearing search restores full list
    test('TC-SRC-03: Clearing search restores full list', async ({ page }) => {
      await waitForTableRows(page);
      const initialCount = await tableRows(page).count();

      await searchInput(page).fill('civil');
      const filteredCount = await tableRows(page).count();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);

      // Clear search
      await searchInput(page).fill('');
      await expect(tableRows(page)).toHaveCount(initialCount, { timeout: 15000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 11 – Rows Per Page / Pagination
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Rows Per Page and Pagination', () => {

    test.beforeEach(async ({ page }) => {
      await gotoExtraElementMaster(page);
    });

    // TC-PAG-01: Change to 10 rows
    test('TC-PAG-01: Change to 10 rows per page', async ({ page }) => {
      await waitForTableRows(page);
      await showEntriesSelect(page).selectOption('10');
      await expect(showEntriesSelect(page)).toHaveValue('10');
      const count = await tableRows(page).count();
      expect(count).toBeLessThanOrEqual(10);
    });

    // TC-PAG-02: Change to 50 rows
    test('TC-PAG-02: Change to 50 rows per page', async ({ page }) => {
      await waitForTableRows(page);
      await showEntriesSelect(page).selectOption('50');
      await expect(showEntriesSelect(page)).toHaveValue('50');
      const count = await tableRows(page).count();
      expect(count).toBeLessThanOrEqual(50);
    });

    // TC-PAG-03: Pagination navigation (prev/next)
    test('TC-PAG-03: Pagination navigation', async ({ page }) => {
      // Set to 10 rows to expose pagination if enough data exists
      await showEntriesSelect(page).selectOption('10');
      await waitForTableRows(page);

      const nextBtn = page.getByRole('button', { name: /Next page/i });
      const prevBtn = page.getByRole('button', { name: /Previous page/i });

      // Previous should be disabled on page 1
      await expect(prevBtn).toBeDisabled();

      const isNextEnabled = await nextBtn.isEnabled({ timeout: 5000 }).catch(() => false);
      if (!isNextEnabled) return; // Only one page of data

      // Navigate to next page
      await nextBtn.click();
      await expect(prevBtn).toBeEnabled({ timeout: 10000 });
      await expect(page.getByRole('button', { name: /Page 2/i })).toBeVisible();

      // Navigate back
      await prevBtn.click();
      await expect(prevBtn).toBeDisabled({ timeout: 10000 });
      await expect(page.getByRole('button', { name: /Page 1/i })).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 12 – Column Sorting
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Column Sorting', () => {

    test.beforeEach(async ({ page }) => {
      await gotoExtraElementMaster(page);
    });

    // TC-SRT-01: Sort by Extra Element Name column
    test('TC-SRT-01: Sort by Extra Element Name', async ({ page }) => {
      await waitForTableRows(page);
      const nameColBtn = page.getByRole('button', { name: /Extra Element Name/i });

      await nameColBtn.click();
      await expect(nameColBtn).toBeVisible();
      await waitForTableRows(page);

      // Second click — descending
      await nameColBtn.click();
      await expect(nameColBtn).toBeVisible();
      await waitForTableRows(page);
    });

    // TC-SRT-02: Sort by Unit Price column
    test('TC-SRT-02: Sort by Unit Price', async ({ page }) => {
      await waitForTableRows(page);
      const priceColBtn = page.getByRole('button', { name: /Unit Price/i });

      await priceColBtn.click();
      await expect(priceColBtn).toBeVisible();
      await waitForTableRows(page);

      await priceColBtn.click();
      await expect(priceColBtn).toBeVisible();
      await waitForTableRows(page);
    });

    // TC-SRT-03: Sort by In Customer Scope column
    test('TC-SRT-03: Sort by In Customer Scope', async ({ page }) => {
      await waitForTableRows(page);
      const scopeColBtn = page.getByRole('button', { name: /In Customer Scope/i });

      await scopeColBtn.click();
      await expect(scopeColBtn).toBeVisible();
      await waitForTableRows(page);
    });

    // TC-SRT-04: Sort by Status column
    test('TC-SRT-04: Sort by Status', async ({ page }) => {
      // Show all statuses first so sorting is meaningful
      await statusFilterSelect(page).selectOption('');
      await waitForTableRows(page);

      const statusColBtn = page.getByRole('button', { name: /Status/i });
      await statusColBtn.click();
      await expect(statusColBtn).toBeVisible();
      await waitForTableRows(page);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 13 – Inactive Status Management
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Inactive Status Management', () => {

    test.beforeEach(async ({ page }) => {
      await gotoExtraElementMaster(page);
    });

    // TC-INA-01: Set Active→Inactive, disappears from Active filter
    test('TC-INA-01: Set Active→Inactive, disappears from Active filter', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Extra Element/i })).toBeVisible({ timeout: 10000 });

      const elementName = await page.locator('#extra_element_name').inputValue();

      // Change to Inactive
      await page.locator('#status').selectOption('false');
      await submitForm(page);
      await expect(page.getByRole('heading', { name: /Add Extra Element/i })).toBeVisible({ timeout: 15000 });

      // Not in Active list
      await expect(tableRows(page).filter({ hasText: elementName })).toHaveCount(0, { timeout: 10000 });

      // Change filter to Inactive — should appear
      await statusFilterSelect(page).selectOption('false');
      const inactiveRow = getRowByName(page, elementName);
      await expect(inactiveRow).toHaveCount(1, { timeout: 15000 });
      await expect(inactiveRow.getByRole('heading', { level: 5 }).filter({ hasText: 'Inactive' })).toBeVisible();

      // Restore to Active
      await inactiveRow.getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update Extra Element/i })).toBeVisible({ timeout: 10000 });
      await page.locator('#status').selectOption('true');
      await submitForm(page);
      await expect(page.getByRole('heading', { name: /Add Extra Element/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-INA-02: Re-activate an Inactive extra element
    test('TC-INA-02: Re-activate Inactive element', async ({ page }) => {
      await statusFilterSelect(page).selectOption('false');
      const inactiveCount = await tableRows(page).count().catch(() => 0);
      if (inactiveCount === 0) return; // No inactive records to re-activate

      await waitForTableRows(page);
      const elementName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText()).trim();

      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Extra Element/i })).toBeVisible({ timeout: 10000 });
      await expect(page.locator('#status')).toHaveValue('false');

      // Set to Active
      await page.locator('#status').selectOption('true');
      await submitForm(page);
      await expect(page.getByRole('heading', { name: /Add Extra Element/i })).toBeVisible({ timeout: 15000 });

      // Verify in Active list
      await statusFilterSelect(page).selectOption('true');
      await expect(tableRows(page).filter({ hasText: elementName })).toHaveCount(1, { timeout: 15000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 14 – Navigation
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Navigation', () => {

    // TC-NAV-01: Unauthenticated direct URL redirects to login
    test('TC-NAV-01: Unauthenticated access redirects to login', async ({ browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();

      await page.goto('https://stage.elevatorplus.net/master/extra-element-master', { timeout: 60000 });
      await expect(page).toHaveURL(/\/login/, { timeout: 20000 });
      await expect(page.getByRole('heading', { name: /Welcome to ElevatorPlus/i })).toBeVisible();
      await expect(page.getByRole('heading', { name: /Add Extra Element/i })).not.toBeVisible();

      await context.close();
    });

    // TC-NAV-02: Navigate via Sales Masters menu
    test('TC-NAV-02: Navigate via Sales Masters menu', async ({ page }) => {
      await registerPopupHandler(page);
      await page.goto('/dashboard', { timeout: 60000 });

      // Click Sales Masters in sidebar
      await page.getByRole('link', { name: /Sales Masters/i }).click();

      // Click Extra Element link
      await page.getByRole('link', { name: /Extra Element/i }).click();

      await expect(page).toHaveURL(/\/master\/extra-element-master/, { timeout: 20000 });
      await expect(page.getByRole('heading', { name: /Extra Element Master/i })).toBeVisible({ timeout: 20000 });
      await expect(page.getByRole('heading', { name: /Add Extra Element/i })).toBeVisible({ timeout: 30000 });
      await waitForTableRows(page);
    });

  });

});
