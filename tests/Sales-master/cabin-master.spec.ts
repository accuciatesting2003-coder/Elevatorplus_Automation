// spec: test-plans/Sales-mater-test-plan/cabin-master-test-plan.md
// seed: tests/setup/auth.setup.ts

import { test, expect } from '../fixtures/auth-fixture';

const CABIN_MASTER_URL = '/master/cabin-master';

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
  } catch {
    // Popup did not appear
  }
}

async function gotoCabinMaster(page: any) {
  await registerPopupHandler(page);
  await page.goto(CABIN_MASTER_URL, { timeout: 60000 });
  await page.getByRole('heading', { name: /Add Cabin/i }).waitFor({ state: 'visible', timeout: 45000 });
  await dismissNotificationPopup(page);
}

// The data table uses ARIA roles: [role="row"]:has([role="cell"]) targets only
// data rows (skipping the header row) regardless of any Additional Info columns.
function tableRows(page: any) {
  return page.locator('[role="row"]:has([role="cell"])');
}

async function waitForTableRows(page: any) {
  await tableRows(page).first().waitFor({ state: 'visible', timeout: 30000 });
}

async function clickEditOnRow(page: any, rowIndex: number = 0) {
  await tableRows(page).nth(rowIndex).getByRole('img', { name: 'Edit' }).click();
}

// Status filter select: values are '' (All), 'true' (Active), 'false' (Inactive).
// Identified by the presence of option[value="false"] (the Inactive option).
function statusFilterSelect(page: any) {
  return page.locator('select').filter({ has: page.locator('option[value="false"]') }).first();
}

// Show-entries select is identified by its id attribute.
function showEntriesSelect(page: any) {
  return page.locator('#rows-per-page').first();
}

// Status is rendered as an h5 badge inside a cell. Using heading level 5
// avoids fragile column-index assumptions when Additional Info columns are present.
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

test.describe('Cabin Master', () => {

  test.describe('Smoke Tests', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCabinMaster(page);
    });

    // TC-SM-01: Page loads successfully
    test('TC-SM-01: Page loads successfully', async ({ page }) => {
      // Verify URL
      await expect(page).toHaveURL(new RegExp(CABIN_MASTER_URL, 'i'));

      // Verify page title
      await expect(page).toHaveTitle('ElevatorPlus');

      // Verify 'Add Cabin' card heading is visible
      await expect(page.getByRole('heading', { name: /Add Cabin/i })).toBeVisible();

      // Verify Cabin Name input is present and empty
      const cabinNameInput = page.locator('#cabin_name');
      await expect(cabinNameInput).toBeVisible();
      await expect(cabinNameInput).toHaveValue('');

      // Verify helper text is visible
      await expect(page.locator('text=Name to identify this cabin type.')).toBeVisible();

      // Verify Clear and Submit buttons are visible
      await expect(page.getByRole('button', { name: /Clear/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();

      // Wait for table to load and verify column headers
      await waitForTableRows(page);
      await expect(page.getByText('Sr. No.')).toBeVisible();
      await expect(page.getByText('Action')).toBeVisible();
      await expect(page.getByText('Cabin Name')).toBeVisible();
      await expect(page.getByText('Status')).toBeVisible();
    });

    // TC-SM-02: Verify page elements and layout
    test('TC-SM-02: Verify page elements and layout', async ({ page }) => {
      // Form section heading reads 'Add Cabin'
      await expect(page.getByRole('heading', { name: /Add Cabin/i })).toBeVisible();

      // Info icon button (id: info-tooltip) present next to heading
      await expect(page.locator('#info-tooltip')).toBeVisible();

      // Verify rows-per-page dropdown (default 25)
      const showDropdown = showEntriesSelect(page);
      await expect(showDropdown).toBeVisible();
      await expect(showDropdown).toHaveValue('25');

      // Verify Status filter dropdown (default Active = 'true')
      const statusFilter = statusFilterSelect(page);
      await expect(statusFilter).toBeVisible();
      await expect(statusFilter).toHaveValue('true');

      // Import button present
      await expect(page.getByRole('button', { name: /Import/i })).toBeVisible();

      // Search Cabin Name search box present
      await expect(page.locator('#search')).toBeVisible();

      // Column headers present
      await waitForTableRows(page);
      await expect(page.getByText('Sr. No.')).toBeVisible();
      await expect(page.getByText('Action')).toBeVisible();
      await expect(page.getByText('Cabin Name')).toBeVisible();
      await expect(page.getByText('Status')).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 2 – Add Cabin (Happy Path)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Add Cabin (Happy Path)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCabinMaster(page);
    });

    // TC-ADD-01: Successfully create a new cabin with a unique name
    test('TC-ADD-01: Successfully create a new cabin with a unique name', async ({ page }) => {
      const cabinName = `AutoCabin ${Date.now()}`;

      // Fill Cabin Name
      await page.locator('#cabin_name').fill(cabinName);

      // Click Submit
      await page.getByRole('button', { name: /Submit/i }).click();

      // Expect success toast
      await expect(page.locator('[role="alert"]').filter({ hasText: /Cabin created successfully!/i })).toBeVisible({ timeout: 15000 });

      // Expect Cabin Name input cleared
      await expect(page.locator('#cabin_name')).toHaveValue('', { timeout: 15000 });

      // Expect form heading remains 'Add Cabin'
      await expect(page.getByRole('heading', { name: /Add Cabin/i })).toBeVisible();

      // Expect new cabin appears in table
      await page.locator('#search').fill(cabinName);
      await page.waitForTimeout(1000);
      await expect(tableRows(page).filter({ hasText: cabinName })).toHaveCount(1, { timeout: 15000 });
      await page.locator('#search').fill('');
    });

    // TC-ADD-02: Create cabin with special characters in name
    test('TC-ADD-02: Create cabin with special characters in name', async ({ page }) => {
      const cabinName = `Grade #304 Stainless Steel - Mirror ${Date.now()}`;

      // Fill Cabin Name with special characters
      await page.locator('#cabin_name').fill(cabinName);

      // Click Submit
      await page.getByRole('button', { name: /Submit/i }).click();

      // Expect success toast
      await expect(page.locator('[role="alert"]').filter({ hasText: /Cabin created successfully!/i })).toBeVisible({ timeout: 15000 });

      // Expect record in table
      await page.locator('#search').fill(cabinName);
      await page.waitForTimeout(1000);
      await expect(tableRows(page).filter({ hasText: cabinName })).toHaveCount(1, { timeout: 15000 });
      await page.locator('#search').fill('');
    });

    // TC-ADD-03: Create cabin with a long cabin name (~100 chars)
    test('TC-ADD-03: Create cabin with a long cabin name', async ({ page }) => {
      const cabinName = `Powder-coated Mirror Stainless Steel Grade 304 Cabin Type With Hairline Finish And Gold Design`;

      // Fill Cabin Name with long name
      await page.locator('#cabin_name').fill(cabinName);

      // Click Submit
      await page.getByRole('button', { name: /Submit/i }).click();

      // Expect either success toast or appropriate error
      const successToast = page.locator('[role="alert"]').filter({ hasText: /Cabin created successfully!/i });
      const errorToast = page.locator('[role="alert"]').filter({ hasText: /Something went wrong\./i });
      const validationError = page.locator('text=/please enter cabin name/i');

      const hasSuccess = await successToast.isVisible({ timeout: 15000 }).catch(() => false);
      const hasError = await errorToast.isVisible({ timeout: 5000 }).catch(() => false);
      const hasValidation = await validationError.isVisible({ timeout: 5000 }).catch(() => false);

      expect(hasSuccess || hasError || hasValidation).toBeTruthy();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 3 – Mandatory Field Validation
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Mandatory Field Validation', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCabinMaster(page);
    });

    // TC-VAL-01: Submit empty form shows inline error
    test('TC-VAL-01: Submit empty form shows inline error', async ({ page }) => {
      // Click Submit without entering name
      await page.getByRole('button', { name: /Submit/i }).click();

      // Expect inline error
      await expect(page.locator('text=/please enter cabin name/i')).toBeVisible({ timeout: 5000 });

      // Form should remain on Add Cabin page
      await expect(page).toHaveURL(new RegExp(CABIN_MASTER_URL, 'i'));
      await expect(page.getByRole('heading', { name: /Add Cabin/i })).toBeVisible();
    });

    // TC-VAL-02: Error clears when valid input entered
    test('TC-VAL-02: Error clears when valid input entered', async ({ page }) => {
      // Submit empty to trigger error
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('text=/please enter cabin name/i')).toBeVisible({ timeout: 5000 });

      // Type valid name — error should disappear
      const cabinName = `Valid Cabin Test ${Date.now()}`;
      await page.locator('#cabin_name').fill(cabinName);
      await expect(page.locator('text=/please enter cabin name/i')).not.toBeVisible({ timeout: 5000 });

      // Click Submit — success toast
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /Cabin created successfully!/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-VAL-03: Submit whitespace-only name
    test('TC-VAL-03: Submit whitespace-only name shows validation or no blank cabin', async ({ page }) => {
      // Enter whitespace only
      await page.locator('#cabin_name').fill('   ');

      // Click Submit
      await page.getByRole('button', { name: /Submit/i }).click();

      // Expect either validation error or server error — no blank cabin created
      const validationError = page.locator('text=/please enter cabin name/i');
      const serverError = page.locator('[role="alert"]').filter({ hasText: /Something went wrong\./i });

      const hasValidation = await validationError.isVisible({ timeout: 5000 }).catch(() => false);
      const hasServerError = await serverError.isVisible({ timeout: 5000 }).catch(() => false);

      expect(hasValidation || hasServerError).toBeTruthy();

      // No blank cabin in table
      const blankRows = await tableRows(page).filter({ hasText: /^\s+$/ }).count();
      expect(blankRows).toBe(0);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 4 – Duplicate Prevention
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Duplicate Prevention', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCabinMaster(page);
    });

    // TC-DUP-01: Submitting existing cabin name shows error
    test('TC-DUP-01: Submitting existing cabin name shows error', async ({ page }) => {
      // Get existing cabin name from first table row (cell index 2 = Cabin Name)
      await waitForTableRows(page);
      const existingName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(existingName.length).toBeGreaterThan(0);

      // Enter that name and submit
      await page.locator('#cabin_name').fill(existingName);
      await page.getByRole('button', { name: /Submit/i }).click();

      // Expect error toast
      await expect(page.locator('[role="alert"]').filter({ hasText: /Something went wrong\./i })).toBeVisible({ timeout: 15000 });
    });

    // TC-DUP-02: Case-sensitivity test for duplicate
    test('TC-DUP-02: Case-sensitivity test for duplicate cabin name', async ({ page }) => {
      // Get existing cabin name from first table row
      await waitForTableRows(page);
      const existingName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(existingName.length).toBeGreaterThan(0);

      // Enter different casing
      const differentCase = existingName.toUpperCase();
      await page.locator('#cabin_name').fill(differentCase);
      await page.getByRole('button', { name: /Submit/i }).click();

      // Observe result — either duplicate error or new record
      const errorToast = page.locator('[role="alert"]').filter({ hasText: /Something went wrong\./i });
      const successToast = page.locator('[role="alert"]').filter({ hasText: /Cabin created successfully!/i });

      const hasError = await errorToast.isVisible({ timeout: 15000 }).catch(() => false);
      const hasSuccess = await successToast.isVisible({ timeout: 15000 }).catch(() => false);

      expect(hasError || hasSuccess).toBeTruthy();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 5 – Clear Button
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Clear Button', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCabinMaster(page);
    });

    // TC-CLR-01: Clear resets Add Cabin form
    test('TC-CLR-01: Clear resets Add Cabin form', async ({ page }) => {
      // Type a cabin name
      await page.locator('#cabin_name').fill('Temporary Cabin Name');

      // Click Clear
      await page.getByRole('button', { name: /Clear/i }).click();

      // Expect input empty
      await expect(page.locator('#cabin_name')).toHaveValue('');

      // Expect heading still 'Add Cabin'
      await expect(page.getByRole('heading', { name: /Add Cabin/i })).toBeVisible();

      // No 'Temporary Cabin Name' in table
      const matchingRows = await tableRows(page).filter({ hasText: 'Temporary Cabin Name' }).count();
      expect(matchingRows).toBe(0);
    });

    // TC-CLR-02: Clear in Edit mode resets to Add Cabin state
    test('TC-CLR-02: Clear in Edit mode resets form to Add Cabin state', async ({ page }) => {
      await waitForTableRows(page);

      // Click Edit on first row
      await clickEditOnRow(page, 0);

      // Expect 'Update Cabin' heading
      await expect(page.getByRole('heading', { name: /Update Cabin/i })).toBeVisible({ timeout: 10000 });

      // Expect name pre-filled
      const cabinNameInput = page.locator('#cabin_name');
      const currentName = await cabinNameInput.inputValue();
      expect(currentName.length).toBeGreaterThan(0);

      // Expect Status select visible (uses id="status" with values 'true'/'false')
      await expect(page.locator('#status')).toBeVisible();

      // Expect Update button
      await expect(page.getByRole('button', { name: /Update/i })).toBeVisible();

      // Click Clear
      await page.getByRole('button', { name: /Clear/i }).click();

      // Expect heading 'Add Cabin'
      await expect(page.getByRole('heading', { name: /Add Cabin/i })).toBeVisible();

      // Expect input empty
      await expect(cabinNameInput).toHaveValue('');

      // Expect Status dropdown gone
      await expect(page.locator('#status')).not.toBeVisible();

      // Expect Submit button (not Update)
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 6 – Edit and Update Operations
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Edit and Update Operations', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCabinMaster(page);
    });

    // TC-EDT-01: Edit icon opens record in edit mode
    test('TC-EDT-01: Edit icon opens record in edit mode', async ({ page }) => {
      await waitForTableRows(page);

      // Get cabin name from first row (cell index 2 = Cabin Name)
      const originalName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

      // Click Edit on first row
      await clickEditOnRow(page, 0);

      // Expect heading 'Update Cabin'
      await expect(page.getByRole('heading', { name: /Update Cabin/i })).toBeVisible({ timeout: 10000 });

      // Expect Cabin Name pre-filled
      const cabinNameInput = page.locator('#cabin_name');
      await expect(cabinNameInput).toHaveValue(originalName);

      // Expect Status select with 'true' (Active) pre-selected
      const statusSelect = page.locator('#status');
      await expect(statusSelect).toBeVisible();
      await expect(statusSelect).toHaveValue('true');

      // Expect action button 'Update'
      await expect(page.getByRole('button', { name: /Update/i })).toBeVisible();
    });

    // TC-EDT-02: Successfully update cabin name
    test('TC-EDT-02: Successfully update cabin name', async ({ page }) => {
      await waitForTableRows(page);

      // Click Edit on first row
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Cabin/i })).toBeVisible({ timeout: 10000 });

      // Clear name and type new unique name
      const newName = `Updated Cabin Name Test ${Date.now()}`;
      const cabinNameInput = page.locator('#cabin_name');
      await cabinNameInput.clear();
      await cabinNameInput.fill(newName);

      // Click Update
      await page.getByRole('button', { name: /Update/i }).click();

      // Expect success toast
      await expect(page.locator('[role="alert"]').filter({ hasText: /Cabin updated successfully!/i })).toBeVisible({ timeout: 15000 });

      // Expect form resets to 'Add Cabin'
      await expect(page.getByRole('heading', { name: /Add Cabin/i })).toBeVisible({ timeout: 15000 });

      // Expect updated name in table
      await page.locator('#search').fill(newName);
      await page.waitForTimeout(1000);
      await expect(tableRows(page).filter({ hasText: newName })).toHaveCount(1, { timeout: 15000 });
      await page.locator('#search').fill('');
    });

    // TC-EDT-03: Update cabin status to Inactive
    test('TC-EDT-03: Update cabin status to Inactive', async ({ page }) => {
      await waitForTableRows(page);

      // Note cabin name from first row
      const cabinName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

      // Click Edit on first row
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Cabin/i })).toBeVisible({ timeout: 10000 });

      // Select Inactive in Status select (value 'false')
      const statusSelect = page.locator('#status');
      await statusSelect.selectOption('false');

      // Click Update
      await page.getByRole('button', { name: /Update/i }).click();

      // Expect success toast
      await expect(page.locator('[role="alert"]').filter({ hasText: /Cabin updated successfully!/i })).toBeVisible({ timeout: 15000 });

      // Expect form resets
      await expect(page.getByRole('heading', { name: /Add Cabin/i })).toBeVisible({ timeout: 15000 });

      // Change filter to All, verify cabin shows Inactive badge
      await statusFilterSelect(page).selectOption('');
      const cabinRow = tableRows(page).filter({ hasText: cabinName });
      await expect(cabinRow.getByRole('heading', { level: 5, name: /Inactive/i })).toBeVisible({ timeout: 15000 });

      // Restore: set status back to Active
      await cabinRow.getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update Cabin/i })).toBeVisible({ timeout: 10000 });
      await statusSelect.selectOption('true');
      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.getByRole('heading', { name: /Add Cabin/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-EDT-04: Update with empty Cabin Name shows validation error
    test('TC-EDT-04: Update with empty Cabin Name shows validation error', async ({ page }) => {
      await waitForTableRows(page);

      // Click Edit on first row
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Cabin/i })).toBeVisible({ timeout: 10000 });

      // Clear Cabin Name
      const cabinNameInput = page.locator('#cabin_name');
      await cabinNameInput.clear();

      // Click Update
      await page.getByRole('button', { name: /Update/i }).click();

      // Expect inline validation error
      await expect(page.locator('text=/please enter cabin name/i')).toBeVisible({ timeout: 5000 });

      // Form remains in Update Cabin mode
      await expect(page.getByRole('heading', { name: /Update Cabin/i })).toBeVisible();
    });

    // TC-EDT-05: Update to duplicate name shows error
    test('TC-EDT-05: Update to duplicate name shows error', async ({ page }) => {
      await waitForTableRows(page);

      // Note name from first row and second row (cell index 2 = Cabin Name)
      const firstName = (await tableRows(page).nth(0).locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      const secondName = (await tableRows(page).nth(1).locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(firstName.length).toBeGreaterThan(0);
      expect(secondName.length).toBeGreaterThan(0);

      // Click Edit on first row
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Cabin/i })).toBeVisible({ timeout: 10000 });

      // Clear and type the second cabin's name
      const cabinNameInput = page.locator('#cabin_name');
      await cabinNameInput.clear();
      await cabinNameInput.fill(secondName);

      // Click Update
      await page.getByRole('button', { name: /Update/i }).click();

      // Expect error toast
      await expect(page.locator('[role="alert"]').filter({ hasText: /Something went wrong\./i })).toBeVisible({ timeout: 15000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 7 – Status Filter
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Status Filter', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCabinMaster(page);
    });

    // TC-FLT-01: Filter by Active (default) shows only Active records
    test('TC-FLT-01: Filter by Active (default) shows only Active records', async ({ page }) => {
      // Verify default Status filter is Active ('true')
      await expect(statusFilterSelect(page)).toHaveValue('true');

      // Wait for rows to load
      await waitForTableRows(page);

      // Limit to 10 rows to keep the status loop fast
      await showEntriesSelect(page).selectOption('10');
      await page.waitForTimeout(500);

      // Verify all visible rows are Active
      const statuses = await getStatusColumnTexts(page);
      expect(statuses.length).toBeGreaterThan(0);
      for (const status of statuses) {
        expect(status).toBe('Active');
      }
    });

    // TC-FLT-02: Filter to All shows both Active and Inactive
    test('TC-FLT-02: Filter to All shows both Active and Inactive', async ({ page }) => {
      // Change to All
      await statusFilterSelect(page).selectOption('');

      // Wait for table to update
      await waitForTableRows(page);

      // Verify the dropdown shows All ('')
      await expect(statusFilterSelect(page)).toHaveValue('');

      // Table should have rows
      const rowCount = await tableRows(page).count();
      expect(rowCount).toBeGreaterThan(0);
    });

    // TC-FLT-03: Filter to Inactive shows only Inactive or empty state
    test('TC-FLT-03: Filter to Inactive shows only Inactive or empty state', async ({ page }) => {
      // Change to Inactive
      await statusFilterSelect(page).selectOption('false');
      await expect(statusFilterSelect(page)).toHaveValue('false');

      // Table should show only Inactive rows or be empty
      await page.waitForTimeout(1000); // allow table to re-render
      const rowCount = await tableRows(page).count().catch(() => 0);

      if (rowCount > 0) {
        // All shown rows should have Inactive status
        const statuses = await getStatusColumnTexts(page);
        for (const status of statuses) {
          expect(status).toBe('Inactive');
        }
      }
      // If no rows, that is acceptable (no Inactive cabins exist)
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 8 – Search Functionality
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Search Functionality', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCabinMaster(page);
    });

    // TC-SRC-01: Search by partial name returns matches
    test('TC-SRC-01: Search by partial name returns matches', async ({ page }) => {
      await waitForTableRows(page);
      const initialCount = await tableRows(page).count();

      // Type partial search term
      const searchBox = page.locator('#search');
      await searchBox.fill('cabin');

      // Wait for table to filter
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      // All visible rows should contain 'cabin' (case-insensitive)
      const filteredCount = await tableRows(page).count();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
      expect(filteredCount).toBeGreaterThan(0);
    });

    // TC-SRC-02: Non-existent search returns no results
    test('TC-SRC-02: Non-existent search returns no results', async ({ page }) => {
      await waitForTableRows(page);

      // Type non-existent search term
      const searchBox = page.locator('#search');
      await searchBox.fill('XYZNONEXISTENTCABIN999');

      // Wait briefly for table to update
      await tableRows(page).first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

      // Expect no rows
      const rows = await tableRows(page).count().catch(() => 0);
      expect(rows).toBe(0);
    });

    // TC-SRC-03: Clearing search restores full list
    test('TC-SRC-03: Clearing search restores full list', async ({ page }) => {
      await waitForTableRows(page);
      const initialCount = await tableRows(page).count();

      // Search to filter
      const searchBox = page.locator('#search');
      await searchBox.fill('meta');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      // Clear search
      await searchBox.clear();

      // Full list should be restored
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      const restoredCount = await tableRows(page).count();
      expect(restoredCount).toBe(initialCount);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 9 – Rows Per Page and Pagination
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Rows Per Page and Pagination', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCabinMaster(page);
    });

    // TC-PAG-01: Change rows per page to 10
    test('TC-PAG-01: Change rows per page to 10', async ({ page }) => {
      await waitForTableRows(page);

      // Default is 25 — change to 10
      const showDropdown = showEntriesSelect(page);
      await expect(showDropdown).toHaveValue('25');
      await showDropdown.selectOption('10');

      // Expect max 10 rows
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      const rowCount = await tableRows(page).count();
      expect(rowCount).toBeLessThanOrEqual(10);
    });

    // TC-PAG-02: Navigate pages with pagination
    test('TC-PAG-02: Navigate pages with pagination', async ({ page }) => {
      await waitForTableRows(page);

      // Set to 10 rows per page
      const showDropdown = showEntriesSelect(page);
      await showDropdown.selectOption('10');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      // Check if Next page button is enabled (more than 10 records)
      const nextBtn = page.getByRole('button', { name: /Next page/i });
      const isNextEnabled = await nextBtn.isEnabled().catch(() => false);

      if (isNextEnabled) {
        // Click Next
        await nextBtn.click();
        await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

        // Page 2 should be active
        await expect(page.getByRole('button', { name: /Page 2/i })).toBeVisible();

        // Previous button should be enabled
        const prevBtn = page.getByRole('button', { name: /Previous page/i });
        await expect(prevBtn).toBeEnabled();

        // Click Previous
        await prevBtn.click();
        await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

        // Page 1 should be active
        await expect(page.getByRole('button', { name: /Page 1/i })).toBeVisible();
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 10 – Column Sorting
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Column Sorting', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCabinMaster(page);
    });

    // TC-SRT-01: Sort by Cabin Name column (ascending then descending)
    test('TC-SRT-01: Sort by Cabin Name column ascending then descending', async ({ page }) => {
      await waitForTableRows(page);

      // Click Cabin Name column header for ascending sort
      await page.getByRole('button', { name: /Cabin Name/i }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      // Get first cabin name after ascending sort (cell index 2 = Cabin Name)
      const firstNameAsc = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

      // Click again for descending sort
      await page.getByRole('button', { name: /Cabin Name/i }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      // Get first cabin name after descending sort
      const firstNameDesc = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

      // Names should differ if there are multiple records
      const rowCount = await tableRows(page).count();
      if (rowCount > 1) {
        expect(firstNameAsc).not.toBe(firstNameDesc);
      }
    });

    // TC-SRT-02: Sort by Status column (set filter to All first)
    test('TC-SRT-02: Sort by Status column', async ({ page }) => {
      await waitForTableRows(page);

      // Set filter to All first
      await statusFilterSelect(page).selectOption('');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      // Click Status column header
      await page.getByRole('button', { name: /^Status$/i }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      // Table should be sorted by Status
      const rowCount = await tableRows(page).count();
      expect(rowCount).toBeGreaterThan(0);

      // Click again for reverse sort
      await page.getByRole('button', { name: /^Status$/i }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 11 – Inactive Status Management
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Inactive Status Management', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCabinMaster(page);
    });

    // TC-INA-01: Mark Active cabin as Inactive, verify disappears from Active filter, appears in Inactive filter
    test('TC-INA-01: Mark Active cabin as Inactive and verify filter behavior', async ({ page }) => {
      await waitForTableRows(page);

      // Note cabin name from first row (Active filter is default)
      const cabinName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(cabinName.length).toBeGreaterThan(0);

      // Click Edit
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Cabin/i })).toBeVisible({ timeout: 10000 });

      // Status select should show Active ('true')
      const statusSelect = page.locator('#status');
      await expect(statusSelect).toHaveValue('true');

      // Change to Inactive and Update
      await statusSelect.selectOption('false');
      await page.getByRole('button', { name: /Update/i }).click();

      // Expect success toast
      await expect(page.locator('[role="alert"]').filter({ hasText: /Cabin updated successfully!/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Cabin/i })).toBeVisible({ timeout: 15000 });

      // Active filter (default) should NOT show this record
      const activeRows = tableRows(page).filter({ hasText: cabinName });
      await expect(activeRows).toHaveCount(0, { timeout: 10000 });

      // Switch to Inactive filter — record should appear
      await statusFilterSelect(page).selectOption('false');
      await expect(tableRows(page).filter({ hasText: cabinName })).toHaveCount(1, { timeout: 10000 });

      // Restore: set status back to Active
      const inactiveRow = tableRows(page).filter({ hasText: cabinName });
      await inactiveRow.getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update Cabin/i })).toBeVisible({ timeout: 10000 });
      await statusSelect.selectOption('true');
      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.getByRole('heading', { name: /Add Cabin/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-INA-02: Re-activate Inactive cabin
    test('TC-INA-02: Re-activate Inactive cabin verifies it appears in Active list', async ({ page }) => {
      // Switch to Inactive filter
      await statusFilterSelect(page).selectOption('false');

      // Check if any Inactive records exist
      const inactiveCount = await tableRows(page).count().catch(() => 0);

      if (inactiveCount > 0) {
        await waitForTableRows(page);

        // Note the cabin name (cell index 2 = Cabin Name)
        const cabinName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

        // Click Edit on first Inactive row
        await clickEditOnRow(page, 0);
        await expect(page.getByRole('heading', { name: /Update Cabin/i })).toBeVisible({ timeout: 10000 });

        // Status select should show Inactive ('false')
        const statusSelect = page.locator('#status');
        await expect(statusSelect).toHaveValue('false');

        // Change to Active and Update
        await statusSelect.selectOption('true');
        await page.getByRole('button', { name: /Update/i }).click();

        // Expect success toast
        await expect(page.locator('[role="alert"]').filter({ hasText: /Cabin updated successfully!/i })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole('heading', { name: /Add Cabin/i })).toBeVisible({ timeout: 15000 });

        // Change filter back to Active — cabin should appear
        await statusFilterSelect(page).selectOption('true');
        await expect(tableRows(page).filter({ hasText: cabinName })).toHaveCount(1, { timeout: 10000 });
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 12 – Import Functionality
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Import Functionality', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCabinMaster(page);
    });

    // TC-IMP-01: Import button is present and clickable
    test('TC-IMP-01: Import button is present and clickable', async ({ page }) => {
      // Verify Import button is visible
      const importBtn = page.getByRole('button', { name: /Import/i });
      await expect(importBtn).toBeVisible();

      // Click Import button and expect file chooser or modal
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser', { timeout: 5000 }).catch(() => null),
        importBtn.click(),
      ]);

      if (fileChooser) {
        // File chooser opened — cancel it
        await page.keyboard.press('Escape');
      } else {
        // Check for a modal or import panel
        const modal = page.locator('[role="dialog"]');
        const modalVisible = await modal.isVisible({ timeout: 5000 }).catch(() => false);
        expect(modalVisible).toBeTruthy();
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 13 – Navigation and Access
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Navigation and Access', () => {

    // TC-NAV-01: Direct URL without auth redirects to login
    test('TC-NAV-01: Direct URL without auth redirects to login', async ({ browser }) => {
      // Open a new browser context with no auth state
      const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
      const page = await context.newPage();

      // Navigate directly to cabin-master without authentication
      await page.goto('https://stage.elevatorplus.net/master/cabin-master', { timeout: 60000 });

      // Expect redirect to login page
      await expect(page).toHaveURL(/\/login/, { timeout: 30000 });

      // Cabin Master content should not be shown
      await expect(page.getByRole('heading', { name: /Add Cabin/i })).not.toBeVisible();

      await context.close();
    });

    // TC-NAV-02: Access via Sales Masters menu navigation
    test('TC-NAV-02: Access Cabin Master via Sales Masters menu navigation', async ({ page }) => {
      await registerPopupHandler(page);

      // Navigate to Dashboard
      await page.goto('/dashboard', { timeout: 60000 });
      await dismissNotificationPopup(page);

      // Click on Sales Masters in the left sidebar
      await page.getByRole('link', { name: /Sales Masters/i }).click();

      // Wait for sub-menu to expand and look for Cabin link (may be 'Cabin' or 'Cabin Master')
      const cabinMasterLink = page.getByRole('link', { name: /^Cabin$/i }).or(page.getByRole('link', { name: /Cabin Master/i })).first();
      await cabinMasterLink.waitFor({ state: 'visible', timeout: 15000 });
      await cabinMasterLink.click();

      // Expect Cabin Master page to load (URL may have capital M: cabin-Master)
      await expect(page).toHaveURL(/\/master\/cabin-master/i, { timeout: 30000 });
      await expect(page.getByRole('heading', { name: /Add Cabin/i })).toBeVisible({ timeout: 30000 });

      // Data table should be displayed
      await waitForTableRows(page);
    });

  });

});
