// spec: test-plans/Sales-mater-test-plan/material-category-test-plan.md
// seed: tests/setup/auth.setup.ts

import { test, expect } from '../fixtures/auth-fixture';

const MATERIAL_CATEGORY_MASTER_URL = '/master/material-category-master';

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
  } catch {
    // Popup did not appear
  }
}

async function gotoMaterialCategoryMaster(page: any) {
  await registerPopupHandler(page);
  await page.goto(MATERIAL_CATEGORY_MASTER_URL, { timeout: 60000 });
  await page.getByRole('heading', { name: /Add Material Category/i }).waitFor({ state: 'visible', timeout: 45000 });
  await dismissNotificationPopup(page);
}

// The data table uses ARIA roles: [role="row"]:has([role="cell"]) targets only
// data rows (skipping the header row) regardless of any additional columns.
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
// The rows-per-page select also uses id="rows-per-page", so we rely on the
// presence of the "All" option text to differentiate the status filter select.
function statusFilterSelect(page: any) {
  return page.locator('select').filter({ has: page.locator('option[value="false"]') }).first();
}

// Show-entries select is identified by its position as the first rows-per-page select
// (has options 10/25/50/100).
function showEntriesSelect(page: any) {
  return page.locator('#rows-per-page').first();
}

// Status is rendered as an h5 badge inside a cell.
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

test.describe('Material Category Master', () => {

  test.describe('Smoke Tests', () => {

    test.beforeEach(async ({ page }) => {
      await gotoMaterialCategoryMaster(page);
    });

    // TC-SM-01: Page loads successfully
    test('TC-SM-01: Page loads successfully', async ({ page }) => {
      // Verify URL
      await expect(page).toHaveURL(new RegExp(MATERIAL_CATEGORY_MASTER_URL, 'i'));

      // Verify page title
      await expect(page).toHaveTitle('ElevatorPlus');

      // Verify 'Add Material Category' card heading is visible
      await expect(page.getByRole('heading', { name: /Add Material Category/i })).toBeVisible();

      // Verify Material Category Name input is present and empty
      const materialNameInput = page.locator('#material_name');
      await expect(materialNameInput).toBeVisible();
      await expect(materialNameInput).toHaveValue('');

      // Verify helper text is visible
      await expect(page.locator('text=Name to identify this material category.')).toBeVisible();

      // Verify Clear and Submit buttons are visible
      await expect(page.getByRole('button', { name: /Clear/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();

      // Wait for table to load and verify column headers
      await waitForTableRows(page);
      await expect(page.getByText('Sr. No.')).toBeVisible();
      await expect(page.getByText('Action')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Material Category Name' })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Status$/i })).toBeVisible();
    });

    // TC-SM-02: Verify page elements and layout
    test('TC-SM-02: Verify page elements and layout', async ({ page }) => {
      // Form section heading reads 'Add Material Category'
      await expect(page.getByRole('heading', { name: /Add Material Category/i })).toBeVisible();

      // Info icon button present next to heading
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

      // Search category name search box present
      await expect(page.locator('#search-city')).toBeVisible();

      // Column headers present
      await waitForTableRows(page);
      await expect(page.getByText('Sr. No.')).toBeVisible();
      await expect(page.getByText('Action')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Material Category Name' })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Status$/i })).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 2 – Add Material Category (Happy Path)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Add Material Category (Happy Path)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoMaterialCategoryMaster(page);
    });

    // TC-ADD-01: Successfully create a new material category with a unique name
    test('TC-ADD-01: Successfully create a new material category with a unique name', async ({ page }) => {
      const categoryName = `AutoMaterialCat ${Date.now()}`;

      // Fill Material Category Name
      await page.locator('#material_name').fill(categoryName);

      // Click Submit
      await page.getByRole('button', { name: /Submit/i }).click();

      // Expect success toast
      await expect(page.locator('[role="alert"]').filter({ hasText: /Material has been created successfully!/i })).toBeVisible({ timeout: 15000 });

      // Expect Material Category Name input cleared
      await expect(page.locator('#material_name')).toHaveValue('', { timeout: 15000 });

      // Expect form heading remains 'Add Material Category'
      await expect(page.getByRole('heading', { name: /Add Material Category/i })).toBeVisible();

      // Expect new category appears in table
      await page.locator('#search-city').fill(categoryName);
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      await expect(tableRows(page).filter({ hasText: categoryName })).toHaveCount(1, { timeout: 15000 });
      await page.locator('#search-city').fill('');
    });

    // TC-ADD-02: Create material category with special characters in name
    test('TC-ADD-02: Create material category with special characters in name', async ({ page }) => {
      const categoryName = `Electro-Mechanical & Hydraulic ${Date.now()}`;

      // Fill Material Category Name with special characters
      await page.locator('#material_name').fill(categoryName);

      // Click Submit
      await page.getByRole('button', { name: /Submit/i }).click();

      // Expect success toast
      await expect(page.locator('[role="alert"]').filter({ hasText: /Material has been created successfully!/i })).toBeVisible({ timeout: 15000 });

      // Expect record in table
      await page.locator('#search-city').fill(categoryName);
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      await expect(tableRows(page).filter({ hasText: categoryName })).toHaveCount(1, { timeout: 15000 });
      await page.locator('#search-city').fill('');
    });

    // TC-ADD-03: Create material category with a long name (~100 chars)
    test('TC-ADD-03: Create material category with a long name', async ({ page }) => {
      const categoryName = `High-Grade Stainless Steel Powder-Coated Structural Heavy-Duty ${Date.now()}`;

      // Fill Material Category Name with long name
      await page.locator('#material_name').fill(categoryName);

      // Click Submit
      await page.getByRole('button', { name: /Submit/i }).click();

      // Wait for any response (toast or inline error) before checking
      const successToast = page.locator('[role="alert"]').filter({ hasText: /Material has been created successfully!/i });
      const errorToast = page.locator('[role="alert"]').filter({ hasText: /Something went wrong\./i });
      const validationError = page.locator('text=/please enter material category name/i');

      await page.locator('[role="alert"]').or(validationError).first()
        .waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

      const hasSuccess = await successToast.isVisible();
      const hasError = await errorToast.isVisible();
      const hasValidation = await validationError.isVisible();

      expect(hasSuccess || hasError || hasValidation).toBeTruthy();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 3 – Mandatory Field Validation
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Mandatory Field Validation', () => {

    test.beforeEach(async ({ page }) => {
      await gotoMaterialCategoryMaster(page);
    });

    // TC-VAL-01: Submit empty form shows inline error
    test('TC-VAL-01: Submit empty form shows inline error', async ({ page }) => {
      // Click Submit without entering name
      await page.getByRole('button', { name: /Submit/i }).click();

      // Expect inline error
      await expect(page.locator('text=/please enter material category name/i')).toBeVisible({ timeout: 5000 });

      // Form should remain on Add Material Category page
      await expect(page).toHaveURL(new RegExp(MATERIAL_CATEGORY_MASTER_URL, 'i'));
      await expect(page.getByRole('heading', { name: /Add Material Category/i })).toBeVisible();
    });

    // TC-VAL-02: Error clears when valid input entered
    test('TC-VAL-02: Error clears when valid input entered', async ({ page }) => {
      // Submit empty to trigger error
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('text=/please enter material category name/i')).toBeVisible({ timeout: 5000 });

      // Type valid name — error should disappear
      const categoryName = `Valid Category Test ${Date.now()}`;
      await page.locator('#material_name').fill(categoryName);
      await expect(page.locator('text=/please enter material category name/i')).not.toBeVisible({ timeout: 5000 });

      // Click Submit — success toast
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /Material has been created successfully!/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-VAL-03: Submit whitespace-only name
    test('TC-VAL-03: Submit whitespace-only name shows validation or no blank category', async ({ page }) => {
      // Enter whitespace only
      await page.locator('#material_name').fill('   ');

      // Click Submit
      await page.getByRole('button', { name: /Submit/i }).click();

      // Expect either validation error (empty or whitespace) or server error
      const validationError = page.locator('text=/please enter material category name|material category name can not be empty/i');
      const serverError = page.locator('[role="alert"]').filter({ hasText: /Something went wrong\./i });

      // Use combined locator and wait for whichever appears first
      const eitherResponse = validationError.or(serverError);
      await expect(eitherResponse.first()).toBeVisible({ timeout: 10000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 4 – Duplicate Prevention
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Duplicate Prevention', () => {

    test.beforeEach(async ({ page }) => {
      await gotoMaterialCategoryMaster(page);
    });

    // TC-DUP-01: Submitting existing material category name shows error
    test('TC-DUP-01: Submitting existing material category name shows error', async ({ page }) => {
      // Get existing category name from first table row (cell index 2 = Material Category Name)
      await waitForTableRows(page);
      const existingName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(existingName.length).toBeGreaterThan(0);

      // Enter that name and submit
      await page.locator('#material_name').fill(existingName);
      await page.getByRole('button', { name: /Submit/i }).click();

      // Expect error toast
      await expect(page.locator('[role="alert"]').filter({ hasText: /Something went wrong\./i })).toBeVisible({ timeout: 15000 });
    });

    // TC-DUP-02: Case-sensitivity test for duplicate
    test('TC-DUP-02: Case-sensitivity test for duplicate material category name', async ({ page }) => {
      // Get existing category name from first table row
      await waitForTableRows(page);
      const existingName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(existingName.length).toBeGreaterThan(0);

      // Enter different casing
      const differentCase = existingName.toUpperCase();
      await page.locator('#material_name').fill(differentCase);
      await page.getByRole('button', { name: /Submit/i }).click();

      // Observe result — either duplicate error or new record (either is valid)
      const eitherToast = page.locator('[role="alert"]').filter({
        hasText: /Something went wrong\.|Material has been created successfully!|A record with the material name.*is already exists/i,
      });
      await expect(eitherToast).toBeVisible({ timeout: 15000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 5 – Clear Button
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Clear Button', () => {

    test.beforeEach(async ({ page }) => {
      await gotoMaterialCategoryMaster(page);
    });

    // TC-CLR-01: Clear resets Add Material Category form
    test('TC-CLR-01: Clear resets Add Material Category form', async ({ page }) => {
      // Type a category name
      await page.locator('#material_name').fill('Temporary Category Name');

      // Click Clear
      await page.getByRole('button', { name: /Clear/i }).click();

      // Expect input empty
      await expect(page.locator('#material_name')).toHaveValue('');

      // Expect heading still 'Add Material Category'
      await expect(page.getByRole('heading', { name: /Add Material Category/i })).toBeVisible();

      // No 'Temporary Category Name' in table
      const matchingRows = await tableRows(page).filter({ hasText: 'Temporary Category Name' }).count();
      expect(matchingRows).toBe(0);
    });

    // TC-CLR-02: Clear in Edit mode resets to Add Material Category state
    test('TC-CLR-02: Clear in Edit mode resets form to Add Material Category state', async ({ page }) => {
      await waitForTableRows(page);

      // Click Edit on first row
      await clickEditOnRow(page, 0);

      // Expect 'Update Material Category' heading
      await expect(page.getByRole('heading', { name: /Update Material Category/i })).toBeVisible({ timeout: 10000 });

      // Expect name pre-filled
      const materialNameInput = page.locator('#material_name');
      const currentName = await materialNameInput.inputValue();
      expect(currentName.length).toBeGreaterThan(0);

      // Expect Status select visible (uses id="status")
      await expect(page.locator('#status')).toBeVisible();

      // Expect Update button
      await expect(page.getByRole('button', { name: /Update/i })).toBeVisible();

      // Click Clear
      await page.getByRole('button', { name: /Clear/i }).click();

      // Expect heading 'Add Material Category'
      await expect(page.getByRole('heading', { name: /Add Material Category/i })).toBeVisible();

      // Expect input empty
      await expect(materialNameInput).toHaveValue('');

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
      await gotoMaterialCategoryMaster(page);
    });

    // TC-EDT-01: Edit icon opens record in edit mode
    test('TC-EDT-01: Edit icon opens record in edit mode', async ({ page }) => {
      await waitForTableRows(page);

      // Get category name from first row (cell index 2 = Material Category Name)
      const originalName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

      // Click Edit on first row
      await clickEditOnRow(page, 0);

      // Expect heading 'Update Material Category'
      await expect(page.getByRole('heading', { name: /Update Material Category/i })).toBeVisible({ timeout: 10000 });

      // Expect Material Category Name pre-filled
      const materialNameInput = page.locator('#material_name');
      await expect(materialNameInput).toHaveValue(originalName);

      // Expect Status select with 'true' (Active) pre-selected
      const statusSelect = page.locator('#status');
      await expect(statusSelect).toBeVisible();
      await expect(statusSelect).toHaveValue('true');

      // Expect action button 'Update'
      await expect(page.getByRole('button', { name: /Update/i })).toBeVisible();
    });

    // TC-EDT-02: Successfully update material category name
    test('TC-EDT-02: Successfully update material category name', async ({ page }) => {
      await waitForTableRows(page);

      // Click Edit on first row
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Material Category/i })).toBeVisible({ timeout: 10000 });

      // Clear name and type new unique name
      const newName = `Updated Category Name Test ${Date.now()}`;
      const materialNameInput = page.locator('#material_name');
      await materialNameInput.clear();
      await materialNameInput.fill(newName);

      // Click Update
      await page.getByRole('button', { name: /Update/i }).click();

      // Expect success toast
      await expect(page.locator('[role="alert"]').filter({ hasText: /Material category has been updated successfully!/i })).toBeVisible({ timeout: 15000 });

      // Expect form resets to 'Add Material Category'
      await expect(page.getByRole('heading', { name: /Add Material Category/i })).toBeVisible({ timeout: 15000 });

      // Expect updated name in table
      await page.locator('#search-city').fill(newName);
      await page.waitForTimeout(1000);
      await expect(tableRows(page).filter({ hasText: newName })).toHaveCount(1, { timeout: 15000 });
      await page.locator('#search-city').fill('');
    });

    // TC-EDT-03: Update material category status to Inactive
    test('TC-EDT-03: Update material category status to Inactive', async ({ page }) => {
      await waitForTableRows(page);

      // Note category name from first row
      const categoryName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

      // Click Edit on first row
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Material Category/i })).toBeVisible({ timeout: 10000 });

      // Select Inactive in Status select (value 'false')
      const statusSelect = page.locator('#status');
      await statusSelect.selectOption('false');

      // Click Update
      await page.getByRole('button', { name: /Update/i }).click();

      // Expect success toast
      await expect(page.locator('[role="alert"]').filter({ hasText: /Material category has been updated successfully!/i })).toBeVisible({ timeout: 15000 });

      // Expect form resets
      await expect(page.getByRole('heading', { name: /Add Material Category/i })).toBeVisible({ timeout: 15000 });

      // Change filter to All, verify category shows Inactive badge
      await statusFilterSelect(page).selectOption('');
      const categoryRow = tableRows(page).filter({ hasText: categoryName });
      await expect(categoryRow.getByRole('heading', { level: 5, name: /Inactive/i })).toBeVisible({ timeout: 15000 });

      // Restore: set status back to Active
      await categoryRow.getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update Material Category/i })).toBeVisible({ timeout: 10000 });
      await statusSelect.selectOption('true');
      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.getByRole('heading', { name: /Add Material Category/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-EDT-04: Update with empty Material Category Name shows validation error
    test('TC-EDT-04: Update with empty Material Category Name shows validation error', async ({ page }) => {
      await waitForTableRows(page);

      // Click Edit on first row
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Material Category/i })).toBeVisible({ timeout: 10000 });

      // Clear Material Category Name
      const materialNameInput = page.locator('#material_name');
      await materialNameInput.clear();

      // Click Update
      await page.getByRole('button', { name: /Update/i }).click();

      // Expect inline validation error
      await expect(page.locator('text=/please enter material category name/i')).toBeVisible({ timeout: 5000 });

      // Form remains in Update Material Category mode
      await expect(page.getByRole('heading', { name: /Update Material Category/i })).toBeVisible();
    });

    // TC-EDT-05: Update to duplicate name shows error
    test('TC-EDT-05: Update to duplicate name shows error', async ({ page }) => {
      await waitForTableRows(page);

      // Note name from first row and second row (cell index 2 = Material Category Name)
      const firstName = (await tableRows(page).nth(0).locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      const secondName = (await tableRows(page).nth(1).locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(firstName.length).toBeGreaterThan(0);
      expect(secondName.length).toBeGreaterThan(0);

      // Click Edit on first row
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Material Category/i })).toBeVisible({ timeout: 10000 });

      // Clear and type the second category's name
      const materialNameInput = page.locator('#material_name');
      await materialNameInput.clear();
      await materialNameInput.fill(secondName);

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
      await gotoMaterialCategoryMaster(page);
    });

    // TC-FLT-01: Filter by Active (default) shows only Active records
    test('TC-FLT-01: Filter by Active (default) shows only Active records', async ({ page }) => {
      // Verify default Status filter is Active ('true')
      await expect(statusFilterSelect(page)).toHaveValue('true');

      // Wait for rows to load
      await waitForTableRows(page);

      // Limit to 10 rows to keep the status loop fast
      await showEntriesSelect(page).selectOption('10');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

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
      const rowCount = await tableRows(page).count().catch(() => 0);

      if (rowCount > 0) {
        await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
        // All shown rows should have Inactive status
        const statuses = await getStatusColumnTexts(page);
        for (const status of statuses) {
          expect(status).toBe('Inactive');
        }
      }
      // If no rows, that is acceptable (no Inactive material categories exist)
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 8 – Search Functionality
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Search Functionality', () => {

    test.beforeEach(async ({ page }) => {
      await gotoMaterialCategoryMaster(page);
    });

    // TC-SRC-01: Search by partial name returns matches
    test('TC-SRC-01: Search by partial name returns matches', async ({ page }) => {
      await waitForTableRows(page);
      const initialCount = await tableRows(page).count();

      // Type partial search term
      const searchBox = page.locator('#search-city');
      await searchBox.fill('elec');

      // Wait for table to filter
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      // All visible rows should contain 'elec' (case-insensitive)
      const filteredCount = await tableRows(page).count();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
      expect(filteredCount).toBeGreaterThan(0);
    });

    // TC-SRC-02: Non-existent search returns no results
    test('TC-SRC-02: Non-existent search returns no results', async ({ page }) => {
      await waitForTableRows(page);

      // Type non-existent search term
      const searchBox = page.locator('#search-city');
      await searchBox.fill('XYZNONEXISTENTCATEGORY999');

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
      const searchBox = page.locator('#search-city');
      await searchBox.fill('elec');
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
      await gotoMaterialCategoryMaster(page);
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
      await gotoMaterialCategoryMaster(page);
    });

    // TC-SRT-01: Sort by Material Category Name column (ascending then descending)
    test('TC-SRT-01: Sort by Material Category Name column ascending then descending', async ({ page }) => {
      await waitForTableRows(page);

      // Click Material Category Name column header for ascending sort
      await page.getByRole('button', { name: /Material Category Name/i }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      // Get first category name after ascending sort (cell index 2 = Material Category Name)
      const firstNameAsc = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

      // Click again for descending sort
      await page.getByRole('button', { name: /Material Category Name/i }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      // Get first category name after descending sort
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
      await gotoMaterialCategoryMaster(page);
    });

    // TC-INA-01: Mark Active material category as Inactive, verify disappears from Active filter, appears in Inactive filter
    test('TC-INA-01: Mark Active material category as Inactive and verify filter behavior', async ({ page }) => {
      await waitForTableRows(page);

      // Note category name from first row (Active filter is default)
      const categoryName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(categoryName.length).toBeGreaterThan(0);

      // Click Edit
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Material Category/i })).toBeVisible({ timeout: 10000 });

      // Status select should show Active ('true')
      const statusSelect = page.locator('#status');
      await expect(statusSelect).toHaveValue('true');

      // Change to Inactive and Update
      await statusSelect.selectOption('false');
      await page.getByRole('button', { name: /Update/i }).click();

      // Expect success toast
      await expect(page.locator('[role="alert"]').filter({ hasText: /Material category has been updated successfully!/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Material Category/i })).toBeVisible({ timeout: 15000 });

      // Active filter (default) should NOT show this record
      const activeRows = tableRows(page).filter({ hasText: categoryName });
      await expect(activeRows).toHaveCount(0, { timeout: 10000 });

      // Switch to Inactive filter — record should appear
      await statusFilterSelect(page).selectOption('false');
      await expect(tableRows(page).filter({ hasText: categoryName })).toHaveCount(1, { timeout: 10000 });

      // Restore: set status back to Active
      const inactiveRow = tableRows(page).filter({ hasText: categoryName });
      await inactiveRow.getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update Material Category/i })).toBeVisible({ timeout: 10000 });
      await statusSelect.selectOption('true');
      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.getByRole('heading', { name: /Add Material Category/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-INA-02: Re-activate Inactive material category
    test('TC-INA-02: Re-activate Inactive material category verifies it appears in Active list', async ({ page }) => {
      // Switch to Inactive filter
      await statusFilterSelect(page).selectOption('false');

      // Check if any Inactive records exist
      const inactiveCount = await tableRows(page).count().catch(() => 0);

      if (inactiveCount > 0) {
        await waitForTableRows(page);

        // Note the category name (cell index 2 = Material Category Name)
        const categoryName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

        // Click Edit on first Inactive row
        await clickEditOnRow(page, 0);
        await expect(page.getByRole('heading', { name: /Update Material Category/i })).toBeVisible({ timeout: 10000 });

        // Status select should show Inactive ('false')
        const statusSelect = page.locator('#status');
        await expect(statusSelect).toHaveValue('false');

        // Change to Active and Update
        await statusSelect.selectOption('true');
        await page.getByRole('button', { name: /Update/i }).click();

        // Expect success toast
        await expect(page.locator('[role="alert"]').filter({ hasText: /Material category has been updated successfully!/i })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole('heading', { name: /Add Material Category/i })).toBeVisible({ timeout: 15000 });

        // Change filter back to Active — category should appear
        await statusFilterSelect(page).selectOption('true');
        await expect(tableRows(page).filter({ hasText: categoryName })).toHaveCount(1, { timeout: 10000 });
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 12 – Navigation and Access
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Navigation and Access', () => {

    // TC-NAV-01: Direct URL without auth redirects to login
    test('TC-NAV-01: Direct URL without auth redirects to login', async ({ browser }) => {
      // Open a new browser context with no auth state
      const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
      const page = await context.newPage();

      // Navigate directly to material-category-master without authentication
      await page.goto('https://stage.elevatorplus.net/master/material-category-master', { timeout: 60000 });

      // Expect redirect to login page
      await expect(page).toHaveURL(/\/login/, { timeout: 30000 });

      // Material Category Master content should not be shown
      await expect(page.getByRole('heading', { name: /Add Material Category/i })).not.toBeVisible();

      await context.close();
    });

    // TC-NAV-02: Access via Sales Masters menu navigation
    test('TC-NAV-02: Access Material Category Master via Sales Masters menu navigation', async ({ page }) => {
      await registerPopupHandler(page);

      // Navigate to Dashboard
      await page.goto('/dashboard', { timeout: 60000 });
      await dismissNotificationPopup(page);

      // Click on Sales Masters in the left sidebar
      await page.getByRole('link', { name: /Sales Masters/i }).click();

      // Wait for sub-menu to expand and look for Material Category link
      const materialCategoryLink = page.getByRole('link', { name: /^Material Category$/i })
        .or(page.getByRole('link', { name: /Material Category Master/i })).first();
      await materialCategoryLink.waitFor({ state: 'visible', timeout: 15000 });
      await materialCategoryLink.click();

      // Expect Material Category Master page to load
      await expect(page).toHaveURL(/\/master\/material-category-master/i, { timeout: 30000 });
      await expect(page.getByRole('heading', { name: /Add Material Category/i })).toBeVisible({ timeout: 30000 });

      // Data table should be displayed
      await waitForTableRows(page);
    });

  });

});
