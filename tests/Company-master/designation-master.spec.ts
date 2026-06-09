import { test, expect } from '../fixtures/auth-fixture';

const DESIGNATION_MASTER_URL = '/master/designation-master';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function registerPopupHandler(page: any) {
  await page.addLocatorHandler(
    page.getByRole('button', { name: /Maybe Later/i }),
    async () => {
      await page.getByRole('button', { name: /Maybe Later/i }).click().catch(() => {});
      await page.waitForTimeout(300);
    }
  );
}

async function dismissNotificationPopup(page: any) {
  try {
    const maybeLater = page.getByRole('button', { name: /Maybe Later/i });
    const visible = await maybeLater.isVisible({ timeout: 5000 }).catch(() => false);
    if (visible) {
      await maybeLater.click();
      await page.waitForTimeout(500);
      return;
    }
    const closeBtn = page.locator('dialog button', { hasText: /×|Close/i });
    const closeVisible = await closeBtn.first().isVisible({ timeout: 2000 }).catch(() => false);
    if (closeVisible) {
      await closeBtn.first().click();
      await page.waitForTimeout(500);
    }
  } catch {
    // Popup did not appear
  }
}

async function gotoDesignationMaster(page: any) {
  await registerPopupHandler(page);
  await page.goto(DESIGNATION_MASTER_URL, { timeout: 60000 });
  await page.getByRole('heading', { name: /Add Designation/i }).waitFor({ state: 'visible', timeout: 45000 });
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
  await page.waitForTimeout(1000);
}

/** Fill the Add Designation form with given values */
async function fillDesignationForm(
  page: any,
  designation: string,
  maxDiscount: string,
  casualLeaves: string,
  sickLeaves: string
) {
  await page.locator('#name').fill(designation);
  await page.getByRole('textbox', { name: /Max Discount/i }).fill(maxDiscount);
  await page.getByRole('textbox', { name: /Casual Leaves/i }).fill(casualLeaves);
  await page.getByRole('textbox', { name: /Sick Leaves/i }).fill(sickLeaves);
}

/** Get the row in the table that matches the given designation name */
function getRowByDesignation(page: any, name: string) {
  return tableRows(page).filter({ hasText: name });
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1 – Add Designation (Positive Tests)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Add Designation', () => {

  test.beforeEach(async ({ page }) => {
    await gotoDesignationMaster(page);
  });

  test('1.1 Add designation with all valid fields and verify in table', async ({ page }) => {
    const timestamp = Date.now();
    const designationName = `TestDesig ${timestamp}`;

    await fillDesignationForm(page, designationName, '10', '12', '6');
    await page.getByRole('button', { name: /Submit/i }).click();
    await page.waitForTimeout(3000);

    // Form should reset to Add Designation after success
    await expect(page.getByRole('heading', { name: /Add Designation/i })).toBeVisible({ timeout: 10000 });

    // Reload and search for the new record in the table
    await page.reload();
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);
    await dismissNotificationPopup(page);

    // Search for the newly added designation (newly created records are Active by default)
    const searchBox = page.getByPlaceholder('Search By Designation');
    await searchBox.fill(designationName);
    // Wait for the search API call to complete before asserting
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1000);

    await expect(tableBody(page).getByText(designationName)).toBeVisible({ timeout: 20000 });

    // Verify numeric values in the same row (exact: true to avoid matching timestamp digits)
    const row = getRowByDesignation(page, designationName);
    await expect(row.getByText('10', { exact: true })).toBeVisible({ timeout: 10000 });
    await expect(row.getByText('12', { exact: true })).toBeVisible({ timeout: 10000 });
    await expect(row.getByText('6', { exact: true })).toBeVisible({ timeout: 10000 });
  });

//   test('1.2 Clear button resets all form fields', async ({ page }) => {
//     await fillDesignationForm(page, 'Clear Test Desig', '15', '10', '5');

//     await page.getByRole('button', { name: /Clear/i }).click();
//     await page.waitForTimeout(1000);

//     // Form heading should remain "Add Designation"
//     await expect(page.getByRole('heading', { name: /Add Designation/i })).toBeVisible();

//     // All fields should be empty
//     await expect(page.locator('#name')).toHaveValue('');
//     await expect(page.getByRole('textbox', { name: /Max Discount/i })).toHaveValue('');
//     await expect(page.getByRole('textbox', { name: /Casual Leaves/i })).toHaveValue('');
//     await expect(page.getByRole('textbox', { name: /Sick Leaves/i })).toHaveValue('');
//   });

// });

// // ─────────────────────────────────────────────────────────────────────────────
// // Suite 2 – Add Designation Validation (Negative Tests)
// // ─────────────────────────────────────────────────────────────────────────────

// test.describe('Add Designation Validation', () => {

//   test.beforeEach(async ({ page }) => {
//     await gotoDesignationMaster(page);
//   });

//   test('2.1 Submit with empty Designation field shows validation error', async ({ page }) => {
//     // Leave Designation empty, fill numeric fields
//     await page.getByRole('textbox', { name: /Max Discount/i }).fill('10');
//     await page.getByRole('textbox', { name: /Casual Leaves/i }).fill('12');
//     await page.getByRole('textbox', { name: /Sick Leaves/i }).fill('6');

//     await page.getByRole('button', { name: /Submit/i }).click();
//     await page.waitForTimeout(1000);

//     // Validation error for Designation field
//     const designationError = page.locator('text=/please enter designation|designation is required/i');
//     await expect(designationError).toBeVisible({ timeout: 5000 });
//     await expect(page).toHaveURL(new RegExp(DESIGNATION_MASTER_URL));
//   });

//   test('2.2 Submit with empty Max Discount field shows validation error', async ({ page }) => {
//     await page.locator('#name').fill('Validation Test');
//     // Leave Max Discount empty
//     await page.getByRole('textbox', { name: /Casual Leaves/i }).fill('12');
//     await page.getByRole('textbox', { name: /Sick Leaves/i }).fill('6');

//     await page.getByRole('button', { name: /Submit/i }).click();
//     await page.waitForTimeout(1000);

//     await expect(page).toHaveURL(new RegExp(DESIGNATION_MASTER_URL));
//     // Should either show error or not navigate away
//     await expect(page.getByRole('heading', { name: /Add Designation/i })).toBeVisible();
//   });

//   test('2.3 Submit with empty Casual Leaves submits successfully (optional field)', async ({ page }) => {
//     const timestamp = Date.now();
//     const designationName = `OptCasual ${timestamp}`;

//     await page.locator('#name').fill(designationName);
//     await page.getByRole('textbox', { name: /Max Discount/i }).fill('10');
//     // Leave Casual Leaves (nth(1)) empty
//     await page.getByRole('textbox', { name: /Sick Leaves/i }).fill('6');

//     await page.getByRole('button', { name: /Submit/i }).click();
//     await page.waitForTimeout(3000);

//     // Form should reset — no validation error for optional Casual Leaves
//     await expect(page.getByRole('heading', { name: /Add Designation/i })).toBeVisible({ timeout: 10000 });
//     await expect(page).toHaveURL(new RegExp(DESIGNATION_MASTER_URL));
//   });

//   test('2.4 Submit with empty Sick Leaves submits successfully (optional field)', async ({ page }) => {
//     const timestamp = Date.now();
//     const designationName = `OptSick ${timestamp}`;

//     await page.locator('#name').fill(designationName);
//     await page.getByRole('textbox', { name: /Max Discount/i }).fill('10');
//     await page.getByRole('textbox', { name: /Casual Leaves/i }).fill('12');
//     // Leave Sick Leaves (nth(2)) empty

//     await page.getByRole('button', { name: /Submit/i }).click();
//     await page.waitForTimeout(3000);

//     // Form should reset — no validation error for optional Sick Leaves
//     await expect(page.getByRole('heading', { name: /Add Designation/i })).toBeVisible({ timeout: 10000 });
//     await expect(page).toHaveURL(new RegExp(DESIGNATION_MASTER_URL));
//   });

//   test('2.5 Submit with all fields empty shows errors only for mandatory fields', async ({ page }) => {
//     await page.getByRole('button', { name: /Submit/i }).click();
//     await page.waitForTimeout(1000);

//     // Validation errors must appear for mandatory fields only
//     await expect(page).toHaveURL(new RegExp(DESIGNATION_MASTER_URL));
//     await expect(page.getByRole('heading', { name: /Add Designation/i })).toBeVisible();

//     // Designation and Max Discount errors should be visible
//     const designationError = page.locator('text=/please enter designation|designation is required/i');
//     await expect(designationError).toBeVisible({ timeout: 5000 });

//     // Casual Leaves and Sick Leaves should NOT show validation errors (they are optional)
//     const casualError = page.locator('text=/please enter casual|casual leaves is required/i');
//     const sickError = page.locator('text=/please enter sick|sick leaves is required/i');
//     await expect(casualError).not.toBeVisible();
//     await expect(sickError).not.toBeVisible();
//   });

//   test('2.6 Submit duplicate designation name shows error', async ({ page }) => {
//     // Read an existing designation name from the first table row
//     await waitForTableRows(page);
//     const existingName = await tableRows(page).first().getByRole('cell').nth(2).textContent();
//     const trimmedName = existingName?.trim() ?? '';
//     expect(trimmedName.length).toBeGreaterThan(0);

//     // Try to add the same designation again
//     await page.locator('#name').fill(trimmedName);
//     await page.getByRole('textbox', { name: /Max Discount/i }).fill('5');
//     await page.getByRole('textbox', { name: /Casual Leaves/i }).fill('5');
//     await page.getByRole('textbox', { name: /Sick Leaves/i }).fill('5');

//     await page.getByRole('button', { name: /Submit/i }).click();
//     await page.waitForTimeout(2000);

//     // Page should remain on designation-master (no redirect = duplicate blocked)
//     await expect(page).toHaveURL(new RegExp(DESIGNATION_MASTER_URL));

//     // Verify the table does not have two rows with the same name
//     const matchingRows = await tableRows(page).filter({ hasText: trimmedName }).count();
//     expect(matchingRows).toBeLessThanOrEqual(1);
//   });

//   test('2.7 Max Discount field accepts only numeric input on submit', async ({ page }) => {
//     await page.locator('#name').fill('Type Test Desig');
//     const maxDiscountField = page.getByRole('textbox', { name: /Max Discount/i });
//     await maxDiscountField.fill('abc');

//     // Fields are type="text" — client-side does not strip non-numeric characters.
//     // Validation occurs on submit (server-side or form-level).
//     const val = await maxDiscountField.inputValue();
//     expect(val).toBe('abc');

//     await page.getByRole('button', { name: /Submit/i }).click();
//     await page.waitForTimeout(1000);
//     // Should remain on the page (not redirect) — server rejects non-numeric
//     await expect(page).toHaveURL(new RegExp(DESIGNATION_MASTER_URL));
//   });

//   test('2.8 Casual Leaves field accepts only numeric input on submit', async ({ page }) => {
//     const casualLeavesField = page.getByRole('textbox', { name: /Casual Leaves/i });
//     await casualLeavesField.fill('xyz');

//     // Fields are type="text" — validation on submit only
//     const val = await casualLeavesField.inputValue();
//     expect(val).toBe('xyz');
//   });

//   test('2.9 Sick Leaves field accepts only numeric input on submit', async ({ page }) => {
//     const sickLeavesField = page.getByRole('textbox', { name: /Sick Leaves/i });
//     await sickLeavesField.fill('abc');

//     // Fields are type="text" — validation on submit only
//     const val = await sickLeavesField.inputValue();
//     expect(val).toBe('abc');
//   });

//   test('2.10 Submit with negative numeric values does not save record', async ({ page }) => {
//     const timestamp = Date.now();
//     const designationName = `NegVal ${timestamp}`;

//     await page.locator('#name').fill(designationName);
//     await page.getByRole('textbox', { name: /Max Discount/i }).fill('-5');
//     await page.getByRole('textbox', { name: /Casual Leaves/i }).fill('-3');
//     await page.getByRole('textbox', { name: /Sick Leaves/i }).fill('-2');

//     await page.getByRole('button', { name: /Submit/i }).click();
//     await page.waitForTimeout(2000);

//     // Either validation error is shown or form stays on the same page
//     await expect(page).toHaveURL(new RegExp(DESIGNATION_MASTER_URL));
//   });

// });

// // ─────────────────────────────────────────────────────────────────────────────
// // Suite 3 – Update Designation
// // ─────────────────────────────────────────────────────────────────────────────

// test.describe('Update Designation', () => {

//   test.beforeEach(async ({ page }) => {
//     await gotoDesignationMaster(page);
//   });

//   test('3.1 Edit designation and update with a new valid name', async ({ page }) => {
//     await waitForTableRows(page);

//     // Read original designation name from first row (column index 2 after Sr.No. and Action)
//     const originalName = (await tableRows(page).first().getByRole('cell').nth(2).textContent())?.trim() ?? '';
//     expect(originalName.length).toBeGreaterThan(0);

//     await clickEditOnRow(page, 0);

//     // Form heading should change to Update Designation
//     await expect(page.getByRole('heading', { name: /Update Designation/i })).toBeVisible({ timeout: 10000 });

//     // Form should be pre-populated
//     const currentName = await page.locator('#name').inputValue();
//     expect(currentName).toBe(originalName);

//     const timestamp = Date.now();
//     const updatedName = `Updated ${timestamp}`;
//     await page.locator('#name').fill(updatedName);
//     await page.getByRole('button', { name: /Update|Submit/i }).click();
//     await page.waitForTimeout(3000);

//     // Form should reset
//     await expect(page.getByRole('heading', { name: /Add Designation/i })).toBeVisible({ timeout: 10000 });

//     // Updated name should be visible in table
//     await expect(tableBody(page).getByText(updatedName)).toBeVisible({ timeout: 15000 });

//     // Restore original name
//     const updatedRow = getRowByDesignation(page, updatedName);
//     await updatedRow.getByRole('img', { name: 'Edit' }).click();
//     await page.waitForTimeout(1000);
//     await page.locator('#name').fill(originalName);
//     await page.getByRole('button', { name: /Update|Submit/i }).click();
//     await page.waitForTimeout(2000);
//   });

//   test('3.2 Edit designation and update numeric values', async ({ page }) => {
//     await waitForTableRows(page);

//     // Read original values
//     const firstRow = tableRows(page).first();
//     const originalMaxDiscount = (await firstRow.getByRole('cell').nth(3).textContent())?.trim() ?? '';
//     const originalCasual = (await firstRow.getByRole('cell').nth(4).textContent())?.trim() ?? '';
//     const originalSick = (await firstRow.getByRole('cell').nth(5).textContent())?.trim() ?? '';

//     await clickEditOnRow(page, 0);
//     await expect(page.getByRole('heading', { name: /Update Designation/i })).toBeVisible({ timeout: 10000 });

//     // Verify required field is pre-populated (Max Discount is required; optional fields may be empty)
//     const maxDiscountField = page.getByRole('textbox', { name: /Max Discount/i });
//     const casualField = page.getByRole('textbox', { name: /Casual Leaves/i });
//     const sickField = page.getByRole('textbox', { name: /Sick Leaves/i });
//     await expect(maxDiscountField).not.toHaveValue('');

//     // Update numeric fields
//     await maxDiscountField.fill('99');
//     await casualField.fill('14');
//     await sickField.fill('9');
//     await page.getByRole('button', { name: /Update|Submit/i }).click();
//     await page.waitForTimeout(3000);

//     await expect(page.getByRole('heading', { name: /Add Designation/i })).toBeVisible({ timeout: 10000 });

//     // Restore original values
//     await clickEditOnRow(page, 0);
//     await page.waitForTimeout(1000);
//     await page.getByRole('textbox', { name: /Max Discount/i }).fill(originalMaxDiscount);
//     await page.getByRole('textbox', { name: /Casual Leaves/i }).fill(originalCasual);
//     await page.getByRole('textbox', { name: /Sick Leaves/i }).fill(originalSick);
//     await page.getByRole('button', { name: /Update|Submit/i }).click();
//     await page.waitForTimeout(2000);
//   });

//   test('3.3 Edit designation and change status to Inactive', async ({ page }) => {
//     await waitForTableRows(page);

//     await clickEditOnRow(page, 0);
//     await expect(page.getByRole('heading', { name: /Update Designation/i })).toBeVisible({ timeout: 10000 });

//     // Status dropdown should be visible only in edit mode
//     const statusDropdown = page.locator('select').filter({ has: page.locator('option', { hasText: /Active|Inactive/ }) }).first();
//     await expect(statusDropdown).toBeVisible({ timeout: 5000 });

//     // Remember the designation name for later restore
//     const designationName = await page.locator('#name').inputValue();

//     await statusDropdown.selectOption('Inactive');
//     await page.getByRole('button', { name: /Update|Submit/i }).click();
//     await page.waitForTimeout(3000);

//     await expect(page.getByRole('heading', { name: /Add Designation/i })).toBeVisible({ timeout: 10000 });

//     // Switch to Inactive filter and confirm record appears
//     const tableFilter = page.locator('select').filter({ has: page.locator('option', { hasText: 'Inactive' }) });
//     await tableFilter.first().selectOption('Inactive');
//     await page.waitForTimeout(2000);
//     await expect(tableBody(page).getByText(designationName)).toBeVisible({ timeout: 10000 });

//     // Restore: set status back to Active
//     const inactiveRow = getRowByDesignation(page, designationName);
//     await inactiveRow.getByRole('img', { name: 'Edit' }).click();
//     await page.waitForTimeout(1000);
//     await statusDropdown.selectOption('Active');
//     await page.getByRole('button', { name: /Update|Submit/i }).click();
//     await page.waitForTimeout(2000);
//   });

//   test('3.4 Clear in update mode discards changes and resets form', async ({ page }) => {
//     await waitForTableRows(page);

//     const originalName = (await tableRows(page).first().getByRole('cell').nth(2).textContent())?.trim() ?? '';

//     await clickEditOnRow(page, 0);
//     await expect(page.getByRole('heading', { name: /Update Designation/i })).toBeVisible({ timeout: 10000 });

//     // Modify the form
//     await page.locator('#name').fill('Discarded Change');
//     await page.getByRole('textbox', { name: /Max Discount/i }).fill('99');

//     // Click Clear
//     await page.getByRole('button', { name: /Clear/i }).click();
//     await page.waitForTimeout(1000);

//     // Form should reset to Add Designation mode
//     await expect(page.getByRole('heading', { name: /Add Designation/i })).toBeVisible();
//     await expect(page.locator('#name')).toHaveValue('');

//     // Table should still show original name
//     await expect(tableBody(page).getByText(originalName)).toBeVisible({ timeout: 10000 });
//   });

//   test('3.5 Update designation with a duplicate name shows error', async ({ page }) => {
//     await waitForTableRows(page);

//     const rowCount = await tableRows(page).count();
//     if (rowCount < 2) {
//       test.skip();
//       return;
//     }

//     // Get designation name of the second row
//     const secondRowName = (await tableRows(page).nth(1).getByRole('cell').nth(2).textContent())?.trim() ?? '';

//     // Edit the first row and try to change its name to the second row's name
//     await clickEditOnRow(page, 0);
//     await expect(page.getByRole('heading', { name: /Update Designation/i })).toBeVisible({ timeout: 10000 });

//     await page.locator('#name').fill(secondRowName);
//     await page.getByRole('button', { name: /Update|Submit/i }).click();
//     await page.waitForTimeout(2000);

//     // Should remain on the page without redirect
//     await expect(page).toHaveURL(new RegExp(DESIGNATION_MASTER_URL));

//     // Discard changes
//     await page.getByRole('button', { name: /Clear/i }).click();
//     await page.waitForTimeout(500);
//   });

//   test('3.6 Submit update with empty Designation field shows validation error', async ({ page }) => {
//     await waitForTableRows(page);

//     await clickEditOnRow(page, 0);
//     await expect(page.getByRole('heading', { name: /Update Designation/i })).toBeVisible({ timeout: 10000 });

//     // Clear the designation field
//     await page.locator('#name').fill('');

//     await page.getByRole('button', { name: /Update|Submit/i }).click();
//     await page.waitForTimeout(1000);

//     // Should remain in Update mode
//     await expect(page).toHaveURL(new RegExp(DESIGNATION_MASTER_URL));
//     await expect(page.getByRole('heading', { name: /Update Designation/i })).toBeVisible();
//   });

// });

// // ─────────────────────────────────────────────────────────────────────────────
// // Suite 4 – Data Table Verification
// // ─────────────────────────────────────────────────────────────────────────────

// test.describe('Data Table Verification', () => {

//   test.beforeEach(async ({ page }) => {
//     await gotoDesignationMaster(page);
//   });

//   test('4.1 Newly added designation data appears correctly in table', async ({ page }) => {
//     const timestamp = Date.now();
//     const designationName = `VerifyDesig ${timestamp}`;

//     await fillDesignationForm(page, designationName, '20', '10', '7');
//     await page.getByRole('button', { name: /Submit/i }).click();
//     await page.waitForTimeout(3000);

//     await expect(page.getByRole('heading', { name: /Add Designation/i })).toBeVisible({ timeout: 10000 });

//     // Reload and search
//     await page.reload();
//     await page.waitForLoadState('networkidle').catch(() => {});
//     await page.waitForTimeout(2000);
//     await dismissNotificationPopup(page);

//     const searchBox = page.getByPlaceholder('Search By Designation');
//     await searchBox.fill(designationName);
//     await page.waitForLoadState('networkidle').catch(() => {});
//     await page.waitForTimeout(1000);

//     const row = getRowByDesignation(page, designationName);
//     await expect(row).toBeVisible({ timeout: 20000 });

//     // Verify each column value in the row (exact: true to avoid matching timestamp digits)
//     await expect(row.getByText(designationName, { exact: true })).toBeVisible();
//     await expect(row.getByText('20', { exact: true })).toBeVisible();
//     await expect(row.getByText('10', { exact: true })).toBeVisible();
//     await expect(row.getByText('7', { exact: true })).toBeVisible();
//     await expect(row.getByText(/Active/i)).toBeVisible();
//   });

//   test('4.2 Search by designation name filters table correctly', async ({ page }) => {
//     await waitForTableRows(page);

//     const firstRowName = (await tableRows(page).first().getByRole('cell').nth(2).textContent())?.trim() ?? '';
//     expect(firstRowName.length).toBeGreaterThan(0);

//     const searchBox = page.getByPlaceholder('Search By Designation');
//     await searchBox.fill(firstRowName);
//     await page.waitForLoadState('networkidle').catch(() => {});
//     await page.waitForTimeout(1000);

//     // All visible rows should contain the search term
//     const rows = tableRows(page);
//     await expect(rows.first()).toBeVisible({ timeout: 15000 });
//     const rowCount = await rows.count();
//     expect(rowCount).toBeGreaterThan(0);
//     await expect(rows.first().getByText(firstRowName, { exact: true })).toBeVisible();

//     // Clear search and verify all records are restored
//     await searchBox.fill('');
//     await page.waitForLoadState('networkidle').catch(() => {});
//     await expect(tableRows(page).first()).toBeVisible({ timeout: 15000 });
//     const restoredCount = await tableRows(page).count();
//     expect(restoredCount).toBeGreaterThanOrEqual(rowCount);
//   });

//   test('4.3 Search with non-existent term shows empty state', async ({ page }) => {
//     await waitForTableRows(page);

//     const searchBox = page.getByPlaceholder('Search By Designation');
//     await searchBox.fill('XYZNOTEXIST99999');
//     await page.waitForTimeout(2000);

//     // Should show no records or an empty-state message
//     const rowCount = await tableRows(page).count();
//     if (rowCount > 0) {
//       // Some apps render a single "no results" row
//       const cellText = await tableRows(page).first().textContent();
//       expect(cellText?.toLowerCase()).toMatch(/no (data|record|result)/i);
//     } else {
//       expect(rowCount).toBe(0);
//     }
//   });

//   test('4.4 Status filter defaults to Active and all rows are Active', async ({ page }) => {
//     await waitForTableRows(page);

//     const statusFilter = page.locator('select').filter({ has: page.locator('option', { hasText: 'Inactive' }) });
//     // The select value attribute is "true" for Active (not the display text "Active")
//     // Verify Active option is visually selected instead
//     await expect(statusFilter.first()).toBeVisible();
//     const selectedOption = await statusFilter.first().evaluate((el: HTMLSelectElement) => el.options[el.selectedIndex]?.text ?? '');
//     expect(selectedOption.toLowerCase()).toContain('active');

//     const rows = tableRows(page);
//     const count = await rows.count();
//     for (let i = 0; i < Math.min(count, 5); i++) {
//       await expect(rows.nth(i).getByText(/Active/i)).toBeVisible();
//     }
//   });

//   test('4.5 Inactive status filter shows only Inactive records', async ({ page }) => {
//     await waitForTableRows(page);

//     const statusFilter = page.locator('select').filter({ has: page.locator('option', { hasText: 'Inactive' }) });
//     await statusFilter.first().selectOption('Inactive');
//     await page.waitForTimeout(2000);

//     const rows = tableRows(page);
//     const count = await rows.count();

//     if (count === 0) {
//       // Empty state is acceptable
//       return;
//     }

//     // All visible rows should be Inactive
//     for (let i = 0; i < Math.min(count, 5); i++) {
//       await expect(rows.nth(i).getByRole('heading', { name: /Inactive/i })).toBeVisible();
//     }
//   });

//   test('4.6 Changing page size updates visible row count', async ({ page }) => {
//     await waitForTableRows(page);

//     const showDropdown = page.locator('select').filter({ has: page.locator('option', { hasText: '10' }) });
//     await showDropdown.first().selectOption('10');
//     await page.waitForTimeout(1500);

//     const rowCount10 = await tableRows(page).count();
//     expect(rowCount10).toBeLessThanOrEqual(10);

//     await showDropdown.first().selectOption('50');
//     await page.waitForTimeout(1500);

//     const rowCount50 = await tableRows(page).count();
//     expect(rowCount50).toBeLessThanOrEqual(50);
//   });

//   test('4.7 Clicking Designation column header sorts ascending then descending', async ({ page }) => {
//     await waitForTableRows(page);

//     // Click Designation header for ascending sort
//     await page.getByRole('table').getByRole('rowgroup').first().getByRole('button', { name: 'Designation' }).click();
//     await page.waitForTimeout(1500);

//     const namesAsc: string[] = [];
//     const rows = tableRows(page);
//     const count = await rows.count();
//     for (let i = 0; i < Math.min(count, 5); i++) {
//       const name = (await rows.nth(i).getByRole('cell').nth(2).textContent())?.trim() ?? '';
//       namesAsc.push(name);
//     }

//     // Verify ascending order — server uses case-sensitive byte order, match that with localeCompare sensitivity:'variant'
//     const sortedAsc = [...namesAsc].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'variant', caseFirst: 'upper' }));
//     expect(namesAsc).toEqual(sortedAsc);

//     // Click again for descending sort
//     await page.getByRole('table').getByRole('rowgroup').first().getByRole('button', { name: 'Designation' }).click();
//     await page.waitForTimeout(1500);

//     const namesDesc: string[] = [];
//     for (let i = 0; i < Math.min(count, 5); i++) {
//       const name = (await rows.nth(i).getByRole('cell').nth(2).textContent())?.trim() ?? '';
//       namesDesc.push(name);
//     }

//     const sortedDesc = [...namesDesc].sort((a, b) => b.localeCompare(a, undefined, { sensitivity: 'variant', caseFirst: 'upper' }));
//     expect(namesDesc).toEqual(sortedDesc);
//   });

// });

// // ─────────────────────────────────────────────────────────────────────────────
// // Suite 5 – Export
// // ─────────────────────────────────────────────────────────────────────────────

// test.describe('Export', () => {

//   test.beforeEach(async ({ page }) => {
//     await gotoDesignationMaster(page);
//   });

//   test('5.1 Click Export button triggers Excel file download', async ({ page }) => {
//     await waitForTableRows(page);

//     // Listen for the download event before clicking
//     const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
//     await page.getByRole('button', { name: /Export/i }).click();
//     const download = await downloadPromise;

//     // Verify file was downloaded
//     expect(download.suggestedFilename()).toBeTruthy();

//     // Verify the file has an Excel extension
//     const filename = download.suggestedFilename().toLowerCase();
//     expect(filename.endsWith('.xlsx') || filename.endsWith('.xls') || filename.endsWith('.csv')).toBeTruthy();
//   });

//   test('5.2 Export button is visible on the page', async ({ page }) => {
//     await waitForTableRows(page);
//     await expect(page.getByRole('button', { name: /Export/i })).toBeVisible();
//   });

//   test('5.3 Export with Active filter only downloads Active records', async ({ page }) => {
//     await waitForTableRows(page);

//     // Set Status filter to Active
//     const statusFilter = page.locator('select').filter({ has: page.locator('option', { hasText: 'Inactive' }) });
//     await statusFilter.first().selectOption('Active');
//     await page.waitForTimeout(1500);

//     const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
//     await page.getByRole('button', { name: /Export/i }).click();
//     const download = await downloadPromise;

//     // File should be downloaded with a valid name
//     expect(download.suggestedFilename()).toBeTruthy();
//   });

//   test('5.4 Export does not throw an error when table has data', async ({ page }) => {
//     await waitForTableRows(page);

//     // Verify table has data before export
//     const rowCount = await tableRows(page).count();
//     expect(rowCount).toBeGreaterThan(0);

//     const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
//     await page.getByRole('button', { name: /Export/i }).click();

//     // Should not throw — download must resolve
//     const download = await downloadPromise;
//     expect(download).toBeTruthy();
//   });

// });

// // ─────────────────────────────────────────────────────────────────────────────
// // Suite 6 – UI and UX
// // ─────────────────────────────────────────────────────────────────────────────

// test.describe('Designation Master UI', () => {

//   test.beforeEach(async ({ page }) => {
//     await gotoDesignationMaster(page);
//   });

//   test('6.1 Page heading and form heading are visible', async ({ page }) => {
//     await expect(page.getByRole('heading', { name: /Designation Master/i })).toBeVisible();
//     await expect(page.getByRole('heading', { name: /Add Designation/i })).toBeVisible();
//   });

//   test('6.2 All four form fields are visible', async ({ page }) => {
//     await expect(page.locator('#name')).toBeVisible();
//     await expect(page.getByRole('textbox', { name: /Max Discount/i })).toBeVisible();
//     await expect(page.getByRole('textbox', { name: /Casual Leaves/i })).toBeVisible();
//     await expect(page.getByRole('textbox', { name: /Sick Leaves/i })).toBeVisible();
//   });

//   test('6.3 Submit and Clear buttons are visible', async ({ page }) => {
//     await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();
//     await expect(page.getByRole('button', { name: /Clear/i })).toBeVisible();
//   });

//   test('6.4 Export button is visible', async ({ page }) => {
//     await expect(page.getByRole('button', { name: /Export/i })).toBeVisible();
//   });

//   test('6.5 Table is visible with correct column headers', async ({ page }) => {
//     await waitForTableRows(page);

//     await expect(page.getByRole('table')).toBeVisible();
//     await expect(page.getByRole('table').getByText('Sr. No.')).toBeVisible();
//     await expect(page.getByRole('table').getByText(/Action/i)).toBeVisible();
//     await expect(page.getByRole('table').getByText('Designation')).toBeVisible();
//     await expect(page.getByRole('table').getByText(/Max\.? Discount/i)).toBeVisible();
//     await expect(page.getByRole('table').getByText(/Casual Leaves/i)).toBeVisible();
//     await expect(page.getByRole('table').getByText(/Sick Leaves/i)).toBeVisible();
//     await expect(page.getByRole('table').getByText('Status')).toBeVisible();
//   });

//   test('6.6 Designation field accepts text and numeric fields accept numeric input', async ({ page }) => {
//     // Text field should accept alphanumeric input
//     const designField = page.locator('#name');
//     await designField.fill('Manager 2024');
//     await expect(designField).toHaveValue('Manager 2024');

//     // Numeric field accepts numeric input (all fields are type="text"; validation on submit)
//     const numField = page.getByRole('textbox', { name: /Max Discount/i });
//     await numField.fill('25');
//     await expect(numField).toHaveValue('25');

//     // Field is type="text" so it accepts any characters — validation enforced on submit
//     await numField.fill('abc');
//     await expect(numField).toHaveValue('abc');
//   });

//   test('6.7 Pagination controls are visible and Previous is disabled on page 1', async ({ page }) => {
//     await waitForTableRows(page);

//     const prevBtn = page.getByRole('button', { name: /previous page/i });
//     await expect(prevBtn).toBeVisible();
//     await expect(prevBtn).toBeDisabled();

//     await expect(page.getByRole('button', { name: /next page/i })).toBeVisible();
//   });

//   test('6.8 Edit icon is visible in the Action column and loads data into form', async ({ page }) => {
//     await waitForTableRows(page);

//     const editIcon = tableRows(page).first().getByRole('img', { name: 'Edit' });
//     await expect(editIcon).toBeVisible();

//     await editIcon.click();
//     await page.waitForTimeout(1500);

//     // Form should switch to Update Designation mode
//     await expect(page.getByRole('heading', { name: /Update Designation/i })).toBeVisible({ timeout: 10000 });

//     // Form fields should be pre-populated
//     const designValue = await page.locator('#name').inputValue();
//     expect(designValue.length).toBeGreaterThan(0);
//   });

//   test('6.9 Status filter and Show dropdown are visible above the table', async ({ page }) => {
//     await waitForTableRows(page);

//     const statusFilter = page.locator('select').filter({ has: page.locator('option', { hasText: 'Inactive' }) });
//     await expect(statusFilter.first()).toBeVisible();

//     const showDropdown = page.locator('select').filter({ has: page.locator('option', { hasText: '10' }) });
//     await expect(showDropdown.first()).toBeVisible();
//   });

//   test('6.10 Table has data rows loaded', async ({ page }) => {
//     await waitForTableRows(page);

//     const rowCount = await tableRows(page).count();
//     expect(rowCount).toBeGreaterThan(0);
//   });

 });
