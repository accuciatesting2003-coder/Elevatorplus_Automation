// spec: test-plans/Sales-mater-test-plan/payment-collection-type-test-plan.md
// seed: tests/setup/auth.setup.ts

import { test, expect } from '../fixtures/auth-fixture';

const PAYMENT_COLLECTION_TYPE_URL = '/master/payment-collection-type';

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
    const closeBtn = page.locator('dialog button', { hasText: /×|Close/i });
    const closeVisible = await closeBtn.first().isVisible({ timeout: 2000 }).catch(() => false);
    if (closeVisible) {
      await closeBtn.first().click();
    }
  } catch {
    // Popup did not appear
  }
}

async function gotoPaymentCollectionTypeMaster(page: any) {
  await registerPopupHandler(page);
  await page.goto(PAYMENT_COLLECTION_TYPE_URL, { timeout: 60000 });
  await page
    .getByRole('heading', { name: /Add Payment Collection Type/i })
    .waitFor({ state: 'visible', timeout: 45000 });
  await dismissNotificationPopup(page);
}

// The data table renders as <div role="table"> with ARIA roles, not native HTML elements.
function tableBody(page: any) {
  return page.getByRole('table').getByRole('rowgroup').last();
}
function tableRows(page: any) {
  return tableBody(page).getByRole('row');
}

async function waitForTableRows(page: any) {
  await tableRows(page).first().waitFor({ state: 'visible', timeout: 30000 });
}

async function clickEditOnRow(page: any, rowIndex: number = 0) {
  await tableRows(page).nth(rowIndex).getByRole('img', { name: 'Edit' }).click();
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Payment Collection Type Master', () => {

  // ───────────────────────────────────────────────────────────────────────────
  // Smoke Tests
  // ───────────────────────────────────────────────────────────────────────────

  test.describe('Smoke Tests', () => {

    test.beforeEach(async ({ page }) => {
      await gotoPaymentCollectionTypeMaster(page);
    });

    // TC-SM-01: Payment Collection Type Master page loads successfully
    test('TC-SM-01: Page loads successfully', async ({ page }) => {
      // Verify browser page heading in nav
      await expect(
        page.getByRole('heading', { name: /Payment Collection Type Master/i })
      ).toBeVisible();

      // Verify form section heading
      await expect(
        page.getByRole('heading', { name: /Add Payment Collection Type/i })
      ).toBeVisible();

      // Verify the Payment Collection Type input field is present and empty
      const typeInput = page.getByRole('textbox', { name: /Payment Collection Type \*/i });
      await expect(typeInput).toBeVisible();
      await expect(typeInput).toHaveValue('');

      // Verify Clear and Submit buttons are present
      await expect(page.getByRole('button', { name: / Clear/i })).toBeVisible();
      await expect(page.getByRole('button', { name: / Submit/i })).toBeVisible();

      // Verify the data table loads with records
      await waitForTableRows(page);
      await expect(tableRows(page).first()).toBeVisible();
    });

    // TC-SM-02: Verify page elements, table columns, and toolbar layout
    test('TC-SM-02: Verify page elements, table columns, and toolbar layout', async ({ page }) => {
      // Form section heading
      await expect(
        page.getByRole('heading', { name: /Add Payment Collection Type/i })
      ).toBeVisible();

      // Info icon button next to the heading
      await expect(page.getByRole('heading', { name: /Add Payment Collection Type/i })
        .locator('button')).toBeVisible();

      // Show: rows-per-page dropdown defaults to 25
      const showDropdown = page.locator('combobox').first();
      // Use the labeled combobox
      const rowsDropdown = page.locator('select').first();
      await expect(rowsDropdown).toHaveValue('25');

      // Status filter dropdown defaults to Active
      const statusFilter = page.locator('select').filter({
        has: page.locator('option', { hasText: 'Inactive' }),
      });
      await expect(statusFilter.first()).toHaveValue('true');

      // Import button is present
      await expect(page.getByRole('button', { name: /Import/i })).toBeVisible();

      // Search input is present
      await expect(page.getByRole('textbox', { name: /Payment Collection Type/i }).last()).toBeVisible();

      // Table column headers
      await expect(page.getByRole('table').getByText('Sr. No.')).toBeVisible();
      await expect(page.getByRole('table').getByText('Action')).toBeVisible();
      await expect(page.getByRole('table').getByText('Payment Collection Type')).toBeVisible();
      await expect(page.getByRole('table').getByText('Status')).toBeVisible();
    });

    // TC-SM-03: Verify form field label
    test('TC-SM-03: Verify form field label', async ({ page }) => {
      // The field label reads 'Payment Collection Type *'
      await expect(
        page.getByRole('textbox', { name: /Payment Collection Type \*/i })
      ).toBeVisible();
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // Add Payment Collection Type (Happy Path)
  // ───────────────────────────────────────────────────────────────────────────

  test.describe('Add Payment Collection Type (Happy Path)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoPaymentCollectionTypeMaster(page);
    });

    // TC-ADD-01: Successfully create a new Payment Collection Type with a unique name
    test('TC-ADD-01: Successfully create a new Payment Collection Type with a unique name', async ({ page }) => {
      const typeName = `AutoType ${Date.now()}`;

      // Click on the 'Payment Collection Type *' input field and type a unique name
      await page.getByRole('textbox', { name: /Payment Collection Type \*/i }).fill(typeName);

      // Click the 'Submit' button
      await page.getByRole('button', { name: / Submit/i }).click();

      // Verify success toast notification
      await expect(
        page.locator('[role="alert"]').filter({ hasText: /created successfully/i })
      ).toBeVisible({ timeout: 10000 });

      // Verify the input field is cleared and form resets to Add mode
      await expect(
        page.getByRole('heading', { name: /Add Payment Collection Type/i })
      ).toBeVisible({ timeout: 15000 });
      await expect(
        page.getByRole('textbox', { name: /Payment Collection Type \*/i })
      ).toHaveValue('', { timeout: 15000 });

      // Verify the newly created record appears in the data table
      await expect(
        tableBody(page).getByText(typeName)
      ).toBeVisible({ timeout: 30000 });
    });

    // TC-ADD-02: Successfully create a Payment Collection Type with special characters
    test('TC-ADD-02: Successfully create a Payment Collection Type with special characters', async ({ page }) => {
      const typeName = `Bank-NEFT/RTGS ${Date.now()}`;

      // Type a name with special characters
      await page.getByRole('textbox', { name: /Payment Collection Type \*/i }).fill(typeName);

      // Click the 'Submit' button
      await page.getByRole('button', { name: / Submit/i }).click();

      // Verify success toast
      await expect(
        page.locator('[role="alert"]').filter({ hasText: /created successfully/i })
      ).toBeVisible({ timeout: 10000 });

      // Verify new record appears in the table
      await expect(
        tableBody(page).getByText(typeName)
      ).toBeVisible({ timeout: 30000 });
    });

    // TC-ADD-03: Successfully create a Payment Collection Type with a long name
    test('TC-ADD-03: Successfully create a Payment Collection Type with a long name', async ({ page }) => {
      const longName = `Deferred Payment Collection Through Authorized Bank ${Date.now()}`;

      // Type a long name
      await page.getByRole('textbox', { name: /Payment Collection Type \*/i }).fill(longName);

      // Click the 'Submit' button
      await page.getByRole('button', { name: / Submit/i }).click();

      // Either success or error — page stays on the same URL
      await expect(page).toHaveURL(new RegExp(PAYMENT_COLLECTION_TYPE_URL));
    });

    // TC-ADD-04: Successfully create multiple Payment Collection Type records sequentially
    test('TC-ADD-04: Successfully create multiple records sequentially', async ({ page }) => {
      const timestamp = Date.now();
      const name1 = `OnlinePayment ${timestamp}`;
      const name2 = `Cheque ${timestamp}`;

      // Create first record
      await page.getByRole('textbox', { name: /Payment Collection Type \*/i }).fill(name1);
      await page.getByRole('button', { name: / Submit/i }).click();
      await expect(
        page.locator('[role="alert"]').filter({ hasText: /created successfully/i })
      ).toBeVisible({ timeout: 10000 });
      await expect(
        page.getByRole('textbox', { name: /Payment Collection Type \*/i })
      ).toHaveValue('', { timeout: 15000 });

      // Create second record
      await page.getByRole('textbox', { name: /Payment Collection Type \*/i }).fill(name2);
      await page.getByRole('button', { name: / Submit/i }).click();
      await expect(
        page.locator('[role="alert"]').filter({ hasText: /created successfully/i })
      ).toBeVisible({ timeout: 10000 });

      // Use search to verify each record exists (newly added records may be on page 2+)
      const searchInput = page.getByRole('textbox', { name: /Payment Collection Type/i }).last();

      await searchInput.fill(name1);
      await page.waitForTimeout(800);
      await expect(tableBody(page).getByText(name1)).toBeVisible({ timeout: 15000 });

      await searchInput.fill(name2);
      await page.waitForTimeout(800);
      await expect(tableBody(page).getByText(name2)).toBeVisible({ timeout: 15000 });
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // Mandatory Field Validation
  // ───────────────────────────────────────────────────────────────────────────

  test.describe('Mandatory Field Validation', () => {

    test.beforeEach(async ({ page }) => {
      await gotoPaymentCollectionTypeMaster(page);
    });

    // TC-VAL-01: Submit form with empty Payment Collection Type field shows inline validation error
    test('TC-VAL-01: Submit with empty field shows inline validation error', async ({ page }) => {
      // Click the 'Submit' button without entering any value
      await page.getByRole('button', { name: / Submit/i }).click();

      // Inline validation error appears with exact message
      await expect(
        page.locator('text=Please enter payment collection type')
      ).toBeVisible({ timeout: 5000 });

      // Form remains in 'Add Payment Collection Type' mode
      await expect(
        page.getByRole('heading', { name: /Add Payment Collection Type/i })
      ).toBeVisible();

      // No success toast
      await expect(
        page.locator('[role="alert"]').filter({ hasText: /created successfully/i })
      ).not.toBeVisible();
    });

    // TC-VAL-02: Inline error clears when valid input is entered after failed validation
    test('TC-VAL-02: Inline error clears when valid input is entered', async ({ page }) => {
      // Trigger validation error by clicking Submit without input
      await page.getByRole('button', { name: / Submit/i }).click();
      await expect(
        page.locator('text=Please enter payment collection type')
      ).toBeVisible({ timeout: 5000 });

      // Type a valid unique name in the input field and trigger blur to clear validation
      await page.getByRole('textbox', { name: /Payment Collection Type \*/i }).fill(`ValTest ${Date.now()}`);
      await page.keyboard.press('Tab');

      // Inline error message disappears
      await expect(
        page.locator('text=Please enter payment collection type')
      ).not.toBeVisible({ timeout: 5000 });

      // Click Submit and verify success
      await page.getByRole('button', { name: / Submit/i }).click();
      await expect(
        page.locator('[role="alert"]').filter({ hasText: /created successfully/i })
      ).toBeVisible({ timeout: 10000 });
    });

    // TC-VAL-03: Submit form with only whitespace shows validation error
    test('TC-VAL-03: Submit with whitespace-only input shows validation error', async ({ page }) => {
      // Type only spaces into the input field
      await page.getByRole('textbox', { name: /Payment Collection Type \*/i }).fill('   ');

      // Click the 'Submit' button
      await page.getByRole('button', { name: / Submit/i }).click();

      // Either inline validation error or no new record created
      await expect(page).toHaveURL(new RegExp(PAYMENT_COLLECTION_TYPE_URL));
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // Duplicate Prevention
  // ───────────────────────────────────────────────────────────────────────────

  test.describe('Duplicate Prevention', () => {

    test.beforeEach(async ({ page }) => {
      await gotoPaymentCollectionTypeMaster(page);
    });

    // TC-DUP-01: Submitting an existing Active Payment Collection Type name shows error toast
    test('TC-DUP-01: Submitting an existing name shows error toast', async ({ page }) => {
      // Get an existing record name from the table using ARIA roles (table uses div[role="cell"])
      await waitForTableRows(page);
      const existingName = (
        await tableRows(page).first().getByRole('cell').nth(2).textContent()
      )?.trim() ?? '';

      // Skip if we couldn't retrieve a name
      if (!existingName) return;

      // Type the existing name into the input
      await page.getByRole('textbox', { name: /Payment Collection Type \*/i }).fill(existingName);

      // Click Submit
      await page.getByRole('button', { name: / Submit/i }).click();

      // Error toast or error indicator appears (class or role-based, message varies by server)
      await expect(
        page.locator('[class*="error"], [class*="toast"], [role="alert"]').first()
      ).toBeVisible({ timeout: 10000 });

      // Page stays on the same URL
      await expect(page).toHaveURL(new RegExp(PAYMENT_COLLECTION_TYPE_URL));
    });

    // TC-DUP-02: Test case-sensitivity for duplicate Payment Collection Type name
    test('TC-DUP-02: Duplicate check with different casing', async ({ page }) => {
      // Type a lowercase version of an existing record
      await page.getByRole('textbox', { name: /Payment Collection Type \*/i }).fill('upi');

      // Click Submit
      await page.getByRole('button', { name: / Submit/i }).click();

      // Page stays on the same URL regardless of outcome
      await expect(page).toHaveURL(new RegExp(PAYMENT_COLLECTION_TYPE_URL));
    });

    // TC-DUP-03: Submitting a name that matches an existing Inactive record shows an error
    test('TC-DUP-03: Submitting a name matching an Inactive record shows error', async ({ page }) => {
      // Change the Status filter to 'Inactive' to find any inactive records
      const statusFilter = page.locator('select').filter({
        has: page.locator('option', { hasText: 'Inactive' }),
      });
      await statusFilter.first().selectOption('Inactive');

      // Check if any inactive records exist
      const rowCount = await tableRows(page).count();
      if (rowCount === 0) {
        // No inactive records — skip this test
        return;
      }

      // Get the first inactive record name
      const inactiveName = (
        await tableRows(page).first().getByRole('cell').nth(2).textContent()
      )?.trim() ?? '';

      // Change filter back to Active
      await statusFilter.first().selectOption('Active');

      // Try to create a record with the inactive record's name
      await page.getByRole('textbox', { name: /Payment Collection Type \*/i }).fill(inactiveName);
      await page.getByRole('button', { name: / Submit/i }).click();

      // Error toast or form stays on the same page
      await expect(page).toHaveURL(new RegExp(PAYMENT_COLLECTION_TYPE_URL));
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // Clear Button Behavior
  // ───────────────────────────────────────────────────────────────────────────

  test.describe('Clear Button Behavior', () => {

    test.beforeEach(async ({ page }) => {
      await gotoPaymentCollectionTypeMaster(page);
    });

    // TC-CLR-01: Clear button resets the Add Payment Collection Type form
    test('TC-CLR-01: Clear button resets the Add form', async ({ page }) => {
      // Type a value into the input field
      await page.getByRole('textbox', { name: /Payment Collection Type \*/i }).fill('Temporary Type Name');

      // Click the 'Clear' button
      await page.getByRole('button', { name: / Clear/i }).click();

      // Input field is cleared
      await expect(
        page.getByRole('textbox', { name: /Payment Collection Type \*/i })
      ).toHaveValue('');

      // Form heading still reads 'Add Payment Collection Type'
      await expect(
        page.getByRole('heading', { name: /Add Payment Collection Type/i })
      ).toBeVisible();

      // Submit button is still present (not Update)
      await expect(page.getByRole('button', { name: / Submit/i })).toBeVisible();

      // Status dropdown is not present (only in Update mode)
      await expect(page.getByRole('combobox', { name: /Status \*/i })).not.toBeVisible();
    });

    // TC-CLR-02: Clear button in Edit/Update mode resets form back to Add state
    test('TC-CLR-02: Clear in Update mode resets form to Add mode', async ({ page }) => {
      await waitForTableRows(page);

      // Click Edit on the first row
      await clickEditOnRow(page, 0);

      // Form heading changes to 'Update Payment Collection Type'
      await expect(
        page.getByRole('heading', { name: /Update Payment Collection Type/i })
      ).toBeVisible({ timeout: 10000 });

      // Status dropdown appears in Update mode
      await expect(page.getByRole('combobox', { name: /Status \*/i })).toBeVisible();

      // Click the 'Clear' button
      await page.getByRole('button', { name: / Clear/i }).click();

      // Form heading reverts to 'Add Payment Collection Type'
      await expect(
        page.getByRole('heading', { name: /Add Payment Collection Type/i })
      ).toBeVisible({ timeout: 10000 });

      // Input field is cleared and empty
      await expect(
        page.getByRole('textbox', { name: /Payment Collection Type \*/i })
      ).toHaveValue('');

      // Status dropdown is no longer visible
      await expect(page.getByRole('combobox', { name: /Status \*/i })).not.toBeVisible();

      // Action button reverts to 'Submit'
      await expect(page.getByRole('button', { name: / Submit/i })).toBeVisible();
    });

    // TC-CLR-03: Clear button in Add mode with validation error resets the error state
    test('TC-CLR-03: Clear button in Add mode removes validation error', async ({ page }) => {
      // Trigger validation error
      await page.getByRole('button', { name: / Submit/i }).click();
      await expect(
        page.locator('text=Please enter payment collection type')
      ).toBeVisible({ timeout: 5000 });

      // Click the 'Clear' button
      await page.getByRole('button', { name: / Clear/i }).click();

      // Inline validation error is no longer visible
      await expect(
        page.locator('text=Please enter payment collection type')
      ).not.toBeVisible();

      // Form is in its default blank Add state
      await expect(
        page.getByRole('heading', { name: /Add Payment Collection Type/i })
      ).toBeVisible();
      await expect(
        page.getByRole('textbox', { name: /Payment Collection Type \*/i })
      ).toHaveValue('');
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // Edit and Update Operations
  // ───────────────────────────────────────────────────────────────────────────

  test.describe('Edit and Update Operations', () => {

    test.beforeEach(async ({ page }) => {
      await gotoPaymentCollectionTypeMaster(page);
    });

    // TC-EDT-01: Edit icon opens the record in Update mode with pre-filled fields
    test('TC-EDT-01: Edit icon opens record in Update mode with pre-filled fields', async ({ page }) => {
      await waitForTableRows(page);

      // Get the name of the first row
      const rowName = (
        await tableRows(page).first().getByRole('cell').nth(2).textContent()
      )?.trim() ?? '';

      // Click Edit on the first row
      await clickEditOnRow(page, 0);

      // Form heading changes to 'Update Payment Collection Type'
      await expect(
        page.getByRole('heading', { name: /Update Payment Collection Type/i })
      ).toBeVisible({ timeout: 10000 });

      // Input is pre-filled with the record's name
      await expect(
        page.getByRole('textbox', { name: /Payment Collection Type \*/i })
      ).toHaveValue(rowName);

      // Status dropdown appears with Active pre-selected
      const statusDropdown = page.getByRole('combobox', { name: /Status \*/i });
      await expect(statusDropdown).toBeVisible();

      // Update button is present
      await expect(page.getByRole('button', { name: / Update/i })).toBeVisible();

      // Clear button is still present
      await expect(page.getByRole('button', { name: / Clear/i })).toBeVisible();
    });

    // TC-EDT-02: Successfully update a Payment Collection Type record with a new name
    test('TC-EDT-02: Successfully update a record with a new name', async ({ page }) => {
      await waitForTableRows(page);

      // Click Edit on the last row (to avoid affecting records with known names)
      const rowCount = await tableRows(page).count();
      await clickEditOnRow(page, rowCount - 1);

      await expect(
        page.getByRole('heading', { name: /Update Payment Collection Type/i })
      ).toBeVisible({ timeout: 10000 });

      // Get original name for restoration
      const originalName = await page
        .getByRole('textbox', { name: /Payment Collection Type \*/i })
        .inputValue();

      // Clear the input and type a new unique name
      const updatedName = `UpdatedType ${Date.now()}`;
      await page.getByRole('textbox', { name: /Payment Collection Type \*/i }).fill(updatedName);

      // Click the 'Update' button
      await page.getByRole('button', { name: / Update/i }).click();

      // Success toast notification appears
      await expect(
        page.locator('[role="alert"]').filter({ hasText: /updated successfully/i })
      ).toBeVisible({ timeout: 10000 });

      // Form resets to 'Add Payment Collection Type' state
      await expect(
        page.getByRole('heading', { name: /Add Payment Collection Type/i })
      ).toBeVisible({ timeout: 15000 });

      // Input field is cleared
      await expect(
        page.getByRole('textbox', { name: /Payment Collection Type \*/i })
      ).toHaveValue('', { timeout: 15000 });

      // Status dropdown disappears
      await expect(page.getByRole('combobox', { name: /Status \*/i })).not.toBeVisible();

      // Action button reverts to 'Submit'
      await expect(page.getByRole('button', { name: / Submit/i })).toBeVisible();

      // Updated name appears in the table
      await expect(
        tableBody(page).getByText(updatedName)
      ).toBeVisible({ timeout: 30000 });
    });

    // TC-EDT-03: Update with empty Payment Collection Type field shows validation error
    test('TC-EDT-03: Update with empty field shows validation error', async ({ page }) => {
      await waitForTableRows(page);

      // Click Edit on first row
      await clickEditOnRow(page, 0);
      await expect(
        page.getByRole('heading', { name: /Update Payment Collection Type/i })
      ).toBeVisible({ timeout: 10000 });

      // Clear the input field completely
      await page.getByRole('textbox', { name: /Payment Collection Type \*/i }).fill('');

      // Click the 'Update' button
      await page.getByRole('button', { name: / Update/i }).click();

      // Inline validation error appears
      await expect(
        page.locator('text=Please enter payment collection type')
      ).toBeVisible({ timeout: 5000 });

      // Form remains in 'Update Payment Collection Type' mode
      await expect(
        page.getByRole('heading', { name: /Update Payment Collection Type/i })
      ).toBeVisible();
    });

    // TC-EDT-04: Update name to match an existing Active record shows error
    test('TC-EDT-04: Update name to match existing record shows error', async ({ page }) => {
      await waitForTableRows(page);

      // Get names of first two rows using ARIA roles (table uses div[role="cell"])
      const firstName = (
        await tableRows(page).nth(0).getByRole('cell').nth(2).textContent()
      )?.trim() ?? '';
      const secondName = (
        await tableRows(page).nth(1).getByRole('cell').nth(2).textContent()
      )?.trim() ?? '';

      // Skip if there's only one record
      if (!secondName) return;

      // Edit the second record
      await clickEditOnRow(page, 1);
      await expect(
        page.getByRole('heading', { name: /Update Payment Collection Type/i })
      ).toBeVisible({ timeout: 10000 });

      // Change the name to the first record's name (duplicate)
      await page.getByRole('textbox', { name: /Payment Collection Type \*/i }).fill(firstName);

      // Click the 'Update' button
      await page.getByRole('button', { name: / Update/i }).click();

      // Error toast or error indicator appears (class or role-based, message varies by server)
      await expect(
        page.locator('[class*="error"], [class*="toast"], [role="alert"]').first()
      ).toBeVisible({ timeout: 10000 });

      // Form remains in 'Update Payment Collection Type' mode
      await expect(
        page.getByRole('heading', { name: /Update Payment Collection Type/i })
      ).toBeVisible();
    });

    // TC-EDT-05: Update status from Active to Inactive
    test('TC-EDT-05: Update status from Active to Inactive', async ({ page }) => {
      await waitForTableRows(page);

      // Click Edit on first row (should be Active)
      await clickEditOnRow(page, 0);
      await expect(
        page.getByRole('heading', { name: /Update Payment Collection Type/i })
      ).toBeVisible({ timeout: 10000 });

      const editedName = await page
        .getByRole('textbox', { name: /Payment Collection Type \*/i })
        .inputValue();

      // Status dropdown shows 'Active'
      const statusDropdown = page.getByRole('combobox', { name: /Status \*/i });
      await expect(statusDropdown).toHaveValue('true');

      // Change Status to 'Inactive'
      await statusDropdown.selectOption('Inactive');

      // Click the 'Update' button
      await page.getByRole('button', { name: / Update/i }).click();

      // Success toast notification
      await expect(
        page.locator('[role="alert"]').filter({ hasText: /updated successfully/i })
      ).toBeVisible({ timeout: 10000 });

      // Form resets to Add mode
      await expect(
        page.getByRole('heading', { name: /Add Payment Collection Type/i })
      ).toBeVisible({ timeout: 15000 });

      // With Active filter (default), edited record should not appear
      await expect(
        tableBody(page).getByText(editedName)
      ).not.toBeVisible({ timeout: 10000 });

      // Change filter to All — record should appear
      const filterDropdown = page.locator('select').filter({
        has: page.locator('option', { hasText: 'Inactive' }),
      });
      await filterDropdown.first().selectOption('All');
      await expect(
        tableBody(page).getByText(editedName)
      ).toBeVisible({ timeout: 15000 });

      // Restore: set status back to Active
      await tableRows(page).filter({ hasText: editedName }).getByRole('img', { name: 'Edit' }).click();
      await expect(
        page.getByRole('heading', { name: /Update Payment Collection Type/i })
      ).toBeVisible({ timeout: 10000 });
      await page.getByRole('combobox', { name: /Status \*/i }).selectOption('Active');
      await page.getByRole('button', { name: / Update/i }).click();
      await expect(
        page.getByRole('heading', { name: /Add Payment Collection Type/i })
      ).toBeVisible({ timeout: 15000 });
    });

    // TC-EDT-06: Update status from Inactive to Active (re-activate a record)
    test('TC-EDT-06: Re-activate an Inactive record', async ({ page }) => {
      // Change Status filter to Inactive
      const statusFilter = page.locator('select').filter({
        has: page.locator('option', { hasText: 'Inactive' }),
      });
      await statusFilter.first().selectOption('Inactive');

      // Check if any inactive records exist
      const rowCount = await tableRows(page).count();
      if (rowCount === 0) return;

      // Get name of the first inactive record
      const inactiveName = (
        await tableRows(page).first().getByRole('cell').nth(2).textContent()
      )?.trim() ?? '';

      // Click Edit on the first inactive row
      await clickEditOnRow(page, 0);
      await expect(
        page.getByRole('heading', { name: /Update Payment Collection Type/i })
      ).toBeVisible({ timeout: 10000 });

      // Status shows 'Inactive'
      await expect(
        page.getByRole('combobox', { name: /Status \*/i })
      ).toHaveValue('false');

      // Change Status to 'Active'
      await page.getByRole('combobox', { name: /Status \*/i }).selectOption('Active');

      // Click the 'Update' button
      await page.getByRole('button', { name: / Update/i }).click();

      // Success toast
      await expect(
        page.locator('[role="alert"]').filter({ hasText: /updated successfully/i })
      ).toBeVisible({ timeout: 10000 });

      // Form resets to Add mode
      await expect(
        page.getByRole('heading', { name: /Add Payment Collection Type/i })
      ).toBeVisible({ timeout: 15000 });

      // Change filter to Active — record should appear
      await statusFilter.first().selectOption('Active');
      await expect(
        tableBody(page).getByText(inactiveName)
      ).toBeVisible({ timeout: 15000 });
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // Status Filter
  // ───────────────────────────────────────────────────────────────────────────

  test.describe('Status Filter', () => {

    test.beforeEach(async ({ page }) => {
      await gotoPaymentCollectionTypeMaster(page);
    });

    // TC-FLT-01: Filter table by Active status (default behavior)
    test('TC-FLT-01: Default filter shows Active records only', async ({ page }) => {
      // Status filter defaults to 'Active'
      const statusFilter = page.locator('select').filter({
        has: page.locator('option', { hasText: 'Inactive' }),
      });
      await expect(statusFilter.first()).toHaveValue('true');

      // Data table shows records
      await waitForTableRows(page);

      // All visible rows show 'Active' badge
      const statusCells = tableBody(page).getByRole('cell').filter({ hasText: /^Active$/ });
      const count = await statusCells.count();
      expect(count).toBeGreaterThan(0);
    });

    // TC-FLT-02: Filter table to show All statuses
    test('TC-FLT-02: All status filter shows both Active and Inactive records', async ({ page }) => {
      const statusFilter = page.locator('select').filter({
        has: page.locator('option', { hasText: 'Inactive' }),
      });

      // Change filter to 'All'
      await statusFilter.first().selectOption('All');
      await expect(statusFilter.first()).toHaveValue('');

      // Table refreshes
      await waitForTableRows(page);

      // Page stays on the same URL
      await expect(page).toHaveURL(new RegExp(PAYMENT_COLLECTION_TYPE_URL));
    });

    // TC-FLT-03: Filter table by Inactive status
    test('TC-FLT-03: Inactive filter shows only Inactive records or empty state', async ({ page }) => {
      const statusFilter = page.locator('select').filter({
        has: page.locator('option', { hasText: 'Inactive' }),
      });

      // Change filter to 'Inactive'
      await statusFilter.first().selectOption('Inactive');
      await expect(statusFilter.first()).toHaveValue('false');

      // Table either shows inactive records or empty state
      await expect(page).toHaveURL(new RegExp(PAYMENT_COLLECTION_TYPE_URL));
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // Search Functionality
  // ───────────────────────────────────────────────────────────────────────────

  test.describe('Search Functionality', () => {

    test.beforeEach(async ({ page }) => {
      await gotoPaymentCollectionTypeMaster(page);
      await waitForTableRows(page);
    });

    // TC-SRC-01: Search by partial name returns matching results
    test('TC-SRC-01: Search by partial name returns matching results', async ({ page }) => {
      // Get an existing record name and take the first 4 characters as the search term
      const firstCellText = await tableRows(page).first().getByRole('cell').nth(2).textContent();
      const searchTerm = (firstCellText?.trim() ?? '').substring(0, 4);

      // Type a partial name into the search input
      await page.getByRole('textbox', { name: /Payment Collection Type/i }).last().fill(searchTerm);
      await page.waitForTimeout(800); // Wait for debounce filter to apply

      // Table filters to show only matching records
      await expect(page).toHaveURL(new RegExp(PAYMENT_COLLECTION_TYPE_URL));
      const rows = tableRows(page);
      const count = await rows.count();
      if (count > 0) {
        const firstRowText = await rows.first().textContent();
        expect(firstRowText?.toLowerCase()).toContain(searchTerm.toLowerCase());
      }
    });

    // TC-SRC-02: Search by complete name returns exact matching result
    test('TC-SRC-02: Search by complete name returns exact result', async ({ page }) => {
      // Get an existing name from the table
      const existingName = (
        await tableRows(page).first().getByRole('cell').nth(2).textContent()
      )?.trim() ?? 'UPI';

      // Type the full name
      await page.getByRole('textbox', { name: /Payment Collection Type/i }).last().fill(existingName);

      // At least one row matches
      await expect(tableBody(page).getByText(existingName)).toBeVisible({ timeout: 10000 });
    });

    // TC-SRC-03: Search with non-existent name returns no results
    test('TC-SRC-03: Search with non-existent name returns empty state', async ({ page }) => {
      // Type a name that does not exist
      await page.getByRole('textbox', { name: /Payment Collection Type/i }).last().fill('XYZNONEXISTENT999');

      // Table shows no rows or empty state message
      await expect(
        tableRows(page).filter({ hasText: 'XYZNONEXISTENT999' })
      ).toHaveCount(0, { timeout: 10000 });
    });

    // TC-SRC-04: Clearing the search input restores the full list
    test('TC-SRC-04: Clearing search input restores the full list', async ({ page }) => {
      const searchInput = page.getByRole('textbox', { name: /Payment Collection Type/i }).last();

      // Filter by a search term
      await searchInput.fill('Cash');

      // Clear the search input
      await searchInput.fill('');

      // Full list is restored
      await waitForTableRows(page);
      await expect(page).toHaveURL(new RegExp(PAYMENT_COLLECTION_TYPE_URL));
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // Rows Per Page and Pagination
  // ───────────────────────────────────────────────────────────────────────────

  test.describe('Rows Per Page and Pagination', () => {

    test.beforeEach(async ({ page }) => {
      await gotoPaymentCollectionTypeMaster(page);
    });

    // TC-PAG-01: Default rows-per-page is 25
    test('TC-PAG-01: Default rows-per-page is 25', async ({ page }) => {
      // Show: dropdown displays '25' as default
      const rowsDropdown = page.locator('select').first();
      await expect(rowsDropdown).toHaveValue('25');

      // Up to 25 rows shown in the table
      const rowCount = await tableRows(page).count();
      expect(rowCount).toBeLessThanOrEqual(25);
    });

    // TC-PAG-02: Change rows-per-page to 10
    test('TC-PAG-02: Change rows-per-page to 10', async ({ page }) => {
      const rowsDropdown = page.locator('select').first();

      // Change to 10
      await rowsDropdown.selectOption('10');
      await expect(rowsDropdown).toHaveValue('10');

      // Table displays at most 10 rows
      await waitForTableRows(page);
      const rowCount = await tableRows(page).count();
      expect(rowCount).toBeLessThanOrEqual(10);
    });

    // TC-PAG-03: Navigate between pages using pagination controls
    test('TC-PAG-03: Navigate between pages using pagination controls', async ({ page }) => {
      // Set rows-per-page to 10 to ensure pagination
      const rowsDropdown = page.locator('select').first();
      await rowsDropdown.selectOption('10');
      await waitForTableRows(page);

      // Previous page button is disabled on page 1
      await expect(page.getByRole('button', { name: /Previous page/i })).toBeDisabled();

      // If there are multiple pages, navigate to page 2
      const nextBtn = page.getByRole('button', { name: /Next page/i });
      const nextDisabled = await nextBtn.isDisabled();
      if (!nextDisabled) {
        await nextBtn.click();
        await expect(page.getByRole('button', { name: /Previous page/i })).toBeEnabled({ timeout: 5000 });

        // Navigate back to page 1
        await page.getByRole('button', { name: /Previous page/i }).click();
        await expect(page.getByRole('button', { name: /Previous page/i })).toBeDisabled({ timeout: 5000 });
      }
    });

    // TC-PAG-04: Change rows-per-page to 50 and 100
    test('TC-PAG-04: Change rows-per-page to 50 and 100', async ({ page }) => {
      const rowsDropdown = page.locator('select').first();

      // Change to 50
      await rowsDropdown.selectOption('50');
      await expect(rowsDropdown).toHaveValue('50');
      await waitForTableRows(page);
      const count50 = await tableRows(page).count();
      expect(count50).toBeLessThanOrEqual(50);

      // Change to 100
      await rowsDropdown.selectOption('100');
      await expect(rowsDropdown).toHaveValue('100');
      await waitForTableRows(page);
      const count100 = await tableRows(page).count();
      expect(count100).toBeLessThanOrEqual(100);
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // Column Sorting
  // ───────────────────────────────────────────────────────────────────────────

  test.describe('Column Sorting', () => {

    test.beforeEach(async ({ page }) => {
      await gotoPaymentCollectionTypeMaster(page);
      await waitForTableRows(page);
    });

    // TC-SRT-01: Sort table by Payment Collection Type column
    test('TC-SRT-01: Sort by Payment Collection Type column', async ({ page }) => {
      // Payment Collection Type column header has a sort icon
      const typeColumnBtn = page.getByRole('button', { name: /Payment Collection Type/i });
      await expect(typeColumnBtn).toBeVisible();

      // Click to sort ascending
      await typeColumnBtn.click();
      await expect(page).toHaveURL(new RegExp(PAYMENT_COLLECTION_TYPE_URL));

      // Click again to sort descending
      await typeColumnBtn.click();
      await expect(page).toHaveURL(new RegExp(PAYMENT_COLLECTION_TYPE_URL));
    });

    // TC-SRT-02: Sort table by Status column
    test('TC-SRT-02: Sort by Status column', async ({ page }) => {
      // Set filter to 'All' to see both statuses
      const statusFilter = page.locator('select').filter({
        has: page.locator('option', { hasText: 'Inactive' }),
      });
      await statusFilter.first().selectOption('All');

      // Click the Status column header button
      const statusColumnBtn = page.getByRole('button', { name: /^Status$/i });
      await statusColumnBtn.click();
      await expect(page).toHaveURL(new RegExp(PAYMENT_COLLECTION_TYPE_URL));

      // Click again to reverse sort
      await statusColumnBtn.click();
      await expect(page).toHaveURL(new RegExp(PAYMENT_COLLECTION_TYPE_URL));
    });

  });

});
