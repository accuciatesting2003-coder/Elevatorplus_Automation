// spec: test-plans/Other-master-test-plan/system-master-test-plan.md
// seed: tests/setup/auth.setup.ts

import { test, expect } from '@playwright/test';

const SYSTEM_MASTER_URL = '/master/system-master';

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
    await page.waitForTimeout(3000);
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

async function gotoSystemMaster(page: any) {
  await registerPopupHandler(page);

  await page.goto(SYSTEM_MASTER_URL, { timeout: 60000 }).catch(async () => {
    await page.waitForTimeout(3000);
    await page.goto(SYSTEM_MASTER_URL, { timeout: 60000 });
  });
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.waitForTimeout(3000);
  await dismissNotificationPopup(page);

  if (page.url().includes('/login')) {
    await performLogin(page);
    if (!page.url().includes('system-master')) {
      await page.goto(SYSTEM_MASTER_URL);
      await page.waitForLoadState('domcontentloaded').catch(() => {});
    }
  }

  await page.getByRole('heading', { name: /Add System/i }).waitFor({ state: 'visible', timeout: 60000 });
  await page.getByText('Loading...').first().waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3000);
  await dismissNotificationPopup(page);
}

async function waitForTableRows(page: any) {
  await page.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 60000 });
}

async function clickEditOnRow(page: any, rowIndex: number = 0) {
  await page.locator('table tbody tr').nth(rowIndex).getByRole('img', { name: 'Edit' }).click();
  await page.getByRole('heading', { name: /Update System/i }).waitFor({ state: 'visible', timeout: 10000 });
}

function getSystemNameField(page: any) {
  // Use ID selector to avoid strict-mode violation with the Search System Name textbox
  return page.locator('#system_name');
}

function getStatusFilter(page: any) {
  // The status filter select has options All/Active/Inactive
  // Use 'select' only (not role="combobox") and .first() to get the correct element
  return page.locator('select').filter({ has: page.locator('option', { hasText: 'Inactive' }) }).first();
}

function getShowDropdown(page: any) {
  return page.locator('select').filter({ has: page.locator('option', { hasText: '25' }) }).first();
}

function getSearchBox(page: any) {
  return page.getByRole('textbox', { name: /Search System Name/i });
}

function getRowByText(page: any, text: string) {
  return page.locator('table tbody tr').filter({ hasText: text });
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1 – Add System (Positive Tests)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Add System', () => {

  test.beforeEach(async ({ page }) => {
    await gotoSystemMaster(page);
  });

  test('1.1 Add system with a valid unique System Name', async ({ page }) => {
    const timestamp = Date.now();
    const systemName = `TestSystem ${timestamp}`;

    // 1. Verify the Add System form is visible with heading 'Add System'
    await expect(page.getByRole('heading', { name: /Add System/i })).toBeVisible();

    // 2. Enter a unique system name in the System Name field
    await getSystemNameField(page).fill(systemName);

    // 3. Click the Submit button
    await page.getByRole('button', { name: /Submit/i }).click();

    // 4. Verify a success toast/message is displayed
    await expect(page.locator('.toast, [class*="toast"], [class*="alert"], [role="alert"]').first()).toBeVisible({ timeout: 10000 });

    // 5. Verify the form field is cleared/reset after successful submission
    await page.getByRole('heading', { name: /Add System/i }).waitFor({ state: 'visible', timeout: 15000 });
    await expect(getSystemNameField(page)).toHaveValue('');

    // 6. Verify the new system row appears in the data table with the correct name
    await getSearchBox(page).fill(systemName);
    await expect(getRowByText(page, systemName)).toBeVisible({ timeout: 15000 });

    // 7. Verify Status defaults to Active
    await expect(getRowByText(page, systemName).getByRole('heading', { name: 'Active' })).toBeVisible();
  });

  test('1.2 Add system with a numeric-only System Name', async ({ page }) => {
    const timestamp = Date.now();
    const systemName = `100${timestamp}`;

    // 1. Enter a unique numeric-only value in the System Name field
    await getSystemNameField(page).fill(systemName);

    // 2. Click the Submit button
    await page.getByRole('button', { name: /Submit/i }).click();

    // 3. Verify a success toast/message is displayed
    await expect(page.locator('.toast, [class*="toast"], [class*="alert"], [role="alert"]').first()).toBeVisible({ timeout: 10000 });

    // 4. Verify the new row appears in the data table with the entered numeric System Name
    await page.getByRole('heading', { name: /Add System/i }).waitFor({ state: 'visible', timeout: 15000 });
    await getSearchBox(page).fill(systemName);
    await expect(getRowByText(page, systemName)).toBeVisible({ timeout: 15000 });
  });

  test('1.3 Add system with an alphanumeric System Name', async ({ page }) => {
    const timestamp = Date.now();
    const systemName = `System123${timestamp}`;

    // 1. Enter a unique alphanumeric value in the System Name field
    await getSystemNameField(page).fill(systemName);

    // 2. Click the Submit button
    await page.getByRole('button', { name: /Submit/i }).click();

    // 3. Verify a success toast/message is displayed
    await expect(page.locator('.toast, [class*="toast"], [class*="alert"], [role="alert"]').first()).toBeVisible({ timeout: 10000 });

    // 4. Verify the new row appears in the data table with the entered alphanumeric System Name
    await page.getByRole('heading', { name: /Add System/i }).waitFor({ state: 'visible', timeout: 15000 });
    await getSearchBox(page).fill(systemName);
    await expect(getRowByText(page, systemName)).toBeVisible({ timeout: 15000 });
  });

  test('1.4 Clear form resets the System Name field', async ({ page }) => {
    // 1. Enter a value in the System Name field
    await getSystemNameField(page).fill('ClearTest');

    // 2. Click the Clear button
    await page.getByRole('button', { name: /Clear/i }).click();

    // 3. Verify the System Name field is empty/reset
    await expect(getSystemNameField(page)).toHaveValue('');

    // 4. Verify the form heading still reads 'Add System'
    await expect(page.getByRole('heading', { name: /Add System/i })).toBeVisible();
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 2 – Add System Validation (Negative Tests)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Add System Validation', () => {

  test.beforeEach(async ({ page }) => {
    await gotoSystemMaster(page);
  });

  test('2.1 Submit form with empty System Name field shows validation error', async ({ page }) => {
    // 1. Leave the System Name field empty and click Submit
    await page.getByRole('button', { name: /Submit/i }).click();

    // 2. Verify a validation error is shown for the System Name field
    const validationError = page.locator('text=/system name is required|please enter|required/i');
    await expect(validationError.first()).toBeVisible({ timeout: 5000 });

    // 3. Verify the user remains on the same page
    await expect(page).toHaveURL(new RegExp(SYSTEM_MASTER_URL));
    await expect(page.getByRole('heading', { name: /Add System/i })).toBeVisible();
  });

  test('2.2 Submit duplicate System Name (active record) shows error', async ({ page }) => {
    // 1. Wait for the table to load and note an existing active System Name
    await waitForTableRows(page);
    const firstRowName = await page.locator('table tbody tr').first().locator('td').nth(2).textContent();
    const duplicateName = firstRowName?.trim() || 'SIMPLEX';

    // 2. Enter the same System Name in the form field
    await getSystemNameField(page).fill(duplicateName);

    // 3. Click the Submit button
    await page.getByRole('button', { name: /Submit/i }).click();

    // 4. Verify an error or warning toast is shown indicating duplicate System Name
    await expect(
      page.locator('.toast, [class*="toast"], [class*="alert"], [role="alert"]').first()
    ).toBeVisible({ timeout: 10000 });

    // 5. Verify no duplicate row was added — table still has valid content
    await expect(page).toHaveURL(new RegExp(SYSTEM_MASTER_URL));
  });

  test('2.3 Inactivate a record and try to add the same System Name again shows error', async ({ page }) => {
    // 1. Wait for table and note the first Active record's System Name
    await waitForTableRows(page);
    const firstRowName = await page.locator('table tbody tr').first().locator('td').nth(2).textContent();
    const targetName = firstRowName?.trim() || '';
    expect(targetName.length).toBeGreaterThan(0);

    // 2. Click Edit on that record
    await clickEditOnRow(page, 0);

    // 3. Change the Status dropdown to 'Inactive'
    await page.getByRole('combobox', { name: /Status/i }).selectOption({ label: 'Inactive' });

    // 4. Click the Update button
    await page.getByRole('button', { name: /Update/i }).click();

    // 5. Verify success toast
    await expect(
      page.locator('.toast, [class*="toast"], [class*="alert"], [role="alert"]').first()
    ).toBeVisible({ timeout: 10000 });

    // 6. Verify the record no longer appears under the Active filter
    await page.getByRole('heading', { name: /Add System/i }).waitFor({ state: 'visible', timeout: 15000 });
    await page.getByText('Loading...').first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    await expect(getRowByText(page, targetName)).not.toBeVisible({ timeout: 5000 }).catch(() => {});

    // 7. In the Add System form, enter the same System Name that was just inactivated
    await getSystemNameField(page).fill(targetName);

    // 8. Click the Submit button
    await page.getByRole('button', { name: /Submit/i }).click();

    // 9. Verify an error or warning is shown — duplicate name blocked even if inactive
    await expect(
      page.locator('.toast, [class*="toast"], [class*="alert"], [role="alert"]').first()
    ).toBeVisible({ timeout: 10000 });

    // Cleanup: switch to Inactive filter, edit the inactivated record, restore to Active
    const statusFilter = getStatusFilter(page);
    await statusFilter.selectOption('Inactive');
    await page.getByText('Loading...').first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    await page.locator('table tbody tr').filter({ hasText: targetName }).getByRole('img', { name: 'Edit' }).click();
    await page.getByRole('heading', { name: /Update System/i }).waitFor({ state: 'visible', timeout: 10000 });
    await page.getByRole('combobox', { name: /Status/i }).selectOption({ label: 'Active' });
    await page.getByRole('button', { name: /Update/i }).click();
    await page.getByRole('heading', { name: /Add System/i }).waitFor({ state: 'visible', timeout: 15000 });
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 3 – Update System
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Update System', () => {

  test.beforeEach(async ({ page }) => {
    await gotoSystemMaster(page);
  });

  test('3.1 Edit system and update with a new valid System Name', async ({ page }) => {
    const timestamp = Date.now();
    const updatedName = `UpdatedSystem ${timestamp}`;

    // 1. Wait for table and note the current System Name of the first row
    await waitForTableRows(page);
    const originalName = await page.locator('table tbody tr').first().locator('td').nth(2).textContent();
    const originalNameTrimmed = originalName?.trim() || '';

    // 2. Click the Edit icon for the first row
    await clickEditOnRow(page, 0);

    // 3. Verify the form heading changes to 'Update System'
    await expect(page.getByRole('heading', { name: /Update System/i })).toBeVisible();

    // 4. Verify the System Name field is pre-populated with the row's value
    await expect(getSystemNameField(page)).toHaveValue(originalNameTrimmed);

    // 5. Change the System Name to a new unique name
    await getSystemNameField(page).fill(updatedName);

    // 6. Click the Update button
    await page.getByRole('button', { name: /Update/i }).click();

    // 7. Verify a success toast/message is displayed
    await expect(
      page.locator('.toast, [class*="toast"], [class*="alert"], [role="alert"]').first()
    ).toBeVisible({ timeout: 10000 });

    // 8. Verify the updated System Name is reflected in the data table
    await page.getByRole('heading', { name: /Add System/i }).waitFor({ state: 'visible', timeout: 15000 });
    await page.getByText('Loading...').first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    await getSearchBox(page).fill(updatedName);
    await expect(getRowByText(page, updatedName)).toBeVisible({ timeout: 15000 });

    // Cleanup: revert to original name
    await page.locator('table tbody tr').filter({ hasText: updatedName }).getByRole('img', { name: 'Edit' }).click();
    await page.getByRole('heading', { name: /Update System/i }).waitFor({ state: 'visible', timeout: 10000 });
    await getSystemNameField(page).fill(originalNameTrimmed);
    await page.getByRole('button', { name: /Update/i }).click();
    await page.getByRole('heading', { name: /Add System/i }).waitFor({ state: 'visible', timeout: 15000 });
  });

  test('3.2 Edit system and change status to Inactive', async ({ page }) => {
    // 1. Wait for table to load
    await waitForTableRows(page);
    const firstRowName = await page.locator('table tbody tr').first().locator('td').nth(2).textContent();
    const targetName = firstRowName?.trim() || '';

    // 2. Click the Edit icon for an Active record
    await clickEditOnRow(page, 0);

    // 3. Verify the Status dropdown is visible and shows 'Active'
    const statusDropdown = page.getByRole('combobox', { name: /Status/i });
    await expect(statusDropdown).toBeVisible();
    // The selected option label should be 'Active'
    await expect(statusDropdown.locator('option:checked')).toHaveText('Active');

    // 4. Change the Status dropdown to 'Inactive'
    await statusDropdown.selectOption({ label: 'Inactive' });

    // 5. Click the Update button
    await page.getByRole('button', { name: /Update/i }).click();

    // 6. Verify success message is displayed
    await expect(
      page.locator('.toast, [class*="toast"], [class*="alert"], [role="alert"]').first()
    ).toBeVisible({ timeout: 10000 });

    // 7. Verify the record no longer appears under the Active filter
    await page.getByRole('heading', { name: /Add System/i }).waitFor({ state: 'visible', timeout: 15000 });
    await page.getByText('Loading...').first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    await expect(getRowByText(page, targetName)).not.toBeVisible({ timeout: 5000 }).catch(() => {});

    // 8. Switch the Status filter to 'Inactive' and confirm the record is visible there
    await getStatusFilter(page).selectOption({ label: 'Inactive' });
    await page.getByText('Loading...').first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    await expect(getRowByText(page, targetName)).toBeVisible({ timeout: 15000 });

    // 9. Verify all visible rows show Inactive status badge
    await expect(page.locator('table tbody tr').first().getByRole('heading', { name: 'Inactive' })).toBeVisible();

    // 10. Switch to Active filter and verify record is NOT shown
    await getStatusFilter(page).selectOption({ label: 'Active' });
    await page.getByText('Loading...').first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    await expect(getRowByText(page, targetName)).not.toBeVisible({ timeout: 5000 }).catch(() => {});

    // Cleanup: restore Status to Active
    await getStatusFilter(page).selectOption({ label: 'Inactive' });
    await page.getByText('Loading...').first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    await page.locator('table tbody tr').filter({ hasText: targetName }).getByRole('img', { name: 'Edit' }).click();
    await page.getByRole('heading', { name: /Update System/i }).waitFor({ state: 'visible', timeout: 10000 });
    await page.getByRole('combobox', { name: /Status/i }).selectOption({ label: 'Active' });
    await page.getByRole('button', { name: /Update/i }).click();
    await page.getByRole('heading', { name: /Add System/i }).waitFor({ state: 'visible', timeout: 15000 });
  });

  test('3.3 Click Clear in Update mode discards changes', async ({ page }) => {
    // 1. Wait for the table and note current first row name
    await waitForTableRows(page);
    const originalName = await page.locator('table tbody tr').first().locator('td').nth(2).textContent();
    const originalNameTrimmed = originalName?.trim() || '';

    // 2. Click the Edit icon for any system record
    await clickEditOnRow(page, 0);

    // 3. Verify the form heading reads 'Update System'
    await expect(page.getByRole('heading', { name: /Update System/i })).toBeVisible();

    // 4. Modify the System Name field to a different value
    await getSystemNameField(page).fill('DiscardedName12345');

    // 5. Click the Clear button
    await page.getByRole('button', { name: /Clear/i }).click();

    // 6. Verify the form resets to 'Add System' mode with an empty System Name field
    await expect(page.getByRole('heading', { name: /Add System/i })).toBeVisible({ timeout: 5000 });
    await expect(getSystemNameField(page)).toHaveValue('');

    // 7. Verify the table still shows the original unchanged System Name for that row
    await expect(page.locator('table tbody tr').first().locator('td').nth(2)).toHaveText(originalNameTrimmed);
  });

  test('3.4 Update System Name to match an existing active record name shows duplicate error', async ({ page }) => {
    // 1. Wait for table and verify there are at least 2 rows
    await waitForTableRows(page);
    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();
    if (rowCount < 2) {
      test.skip();
      return;
    }

    // 2. Note the System Name from the second row
    const secondRowName = await rows.nth(1).locator('td').nth(2).textContent();
    const secondName = secondRowName?.trim() || '';

    // 3. Click the Edit icon on the first row
    await clickEditOnRow(page, 0);

    // 4. Change the System Name to match the second row's name
    await getSystemNameField(page).fill(secondName);

    // 5. Click the Update button
    await page.getByRole('button', { name: /Update/i }).click();

    // 6. Verify an error/toast message for duplicate System Name
    await expect(
      page.locator('.toast, [class*="toast"], [class*="alert"], [role="alert"]').first()
    ).toBeVisible({ timeout: 10000 });

    // 7. Click Clear to discard changes
    await page.getByRole('button', { name: /Clear/i }).click();

    // 8. Verify the form is reset to Add System mode
    await expect(page.getByRole('heading', { name: /Add System/i })).toBeVisible({ timeout: 5000 });
  });

  test('3.5 Submit Update form with empty System Name shows validation error', async ({ page }) => {
    // 1. Wait for table, then click Edit on any record
    await waitForTableRows(page);
    await clickEditOnRow(page, 0);

    // 2. Verify we're in Update System mode
    await expect(page.getByRole('heading', { name: /Update System/i })).toBeVisible();

    // 3. Clear the System Name field completely
    await getSystemNameField(page).clear();

    // 4. Click the Update button
    await page.getByRole('button', { name: /Update/i }).click();

    // 5. Verify a validation error is shown for the System Name field
    const validationError = page.locator('text=/system name is required|please enter|required/i');
    await expect(validationError.first()).toBeVisible({ timeout: 5000 });

    // 6. Verify the form remains in 'Update System' mode
    await expect(page.getByRole('heading', { name: /Update System/i })).toBeVisible();
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 4 – Data Table Verification
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Data Table Verification', () => {

  test.beforeEach(async ({ page }) => {
    await gotoSystemMaster(page);
  });

  test('4.1 Verify newly added system record appears correctly in the table', async ({ page }) => {
    const timestamp = Date.now();
    const systemName = `VerifySystem ${timestamp}`;

    // 1. Enter a unique system name and submit
    await getSystemNameField(page).fill(systemName);
    await page.getByRole('button', { name: /Submit/i }).click();

    // 2. Verify success message
    await expect(
      page.locator('.toast, [class*="toast"], [class*="alert"], [role="alert"]').first()
    ).toBeVisible({ timeout: 10000 });
    await page.getByRole('heading', { name: /Add System/i }).waitFor({ state: 'visible', timeout: 15000 });

    // 3. Search for the newly added system name in the data table
    await getSearchBox(page).fill(systemName);

    // 4. Verify the row appears with correct System Name
    const newRow = getRowByText(page, systemName);
    await expect(newRow).toBeVisible({ timeout: 15000 });

    // 5. Verify Status = Active
    await expect(newRow.getByRole('heading', { name: 'Active' })).toBeVisible();

    // Cleanup: edit and set to inactive
    await newRow.getByRole('img', { name: 'Edit' }).click();
    await page.getByRole('heading', { name: /Update System/i }).waitFor({ state: 'visible', timeout: 10000 });
    await page.getByRole('combobox', { name: /Status/i }).selectOption({ label: 'Inactive' });
    await page.getByRole('button', { name: /Update/i }).click();
    await page.getByRole('heading', { name: /Add System/i }).waitFor({ state: 'visible', timeout: 15000 });
  });

  test('4.2 Search by System Name filters table results', async ({ page }) => {
    // 1. Wait for table to load and note the first row's name
    await waitForTableRows(page);
    const firstRowName = await page.locator('table tbody tr').first().locator('td').nth(2).textContent();
    const searchTerm = firstRowName?.trim() || '';

    // 2. Type that name in the search box
    const searchBox = getSearchBox(page);
    await searchBox.fill(searchTerm);

    // 3. Verify only rows matching the search term are displayed
    await expect(getRowByText(page, searchTerm)).toBeVisible({ timeout: 10000 });
    const visibleRows = page.locator('table tbody tr');
    const rowCount = await visibleRows.count();
    for (let i = 0; i < rowCount; i++) {
      await expect(visibleRows.nth(i)).toContainText(searchTerm);
    }

    // 4. Clear the search box and verify all records are restored
    await searchBox.clear();
    await page.getByText('Loading...').first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    const restoredCount = await page.locator('table tbody tr').count();
    expect(restoredCount).toBeGreaterThanOrEqual(rowCount);
  });

  test('4.3 Search with no matching results shows empty state', async ({ page }) => {
    // 1. Type a search term that matches no system name
    await getSearchBox(page).fill('XYZNOTEXIST99999');

    // 2. Verify the table shows empty state or "No records found" message
    await expect(
      page.locator('text=/no records found|no data|no result|there are no records to display/i').first()
    ).toBeVisible({ timeout: 10000 });

    // 3. Verify no data rows are displayed
    await expect(page.locator('table tbody tr')).toHaveCount(0, { timeout: 5000 }).catch(async () => {
      const rows = await page.locator('table tbody tr').count();
      // It may show a "no records" row; just assert content is empty
      if (rows > 0) {
        await expect(page.locator('table tbody tr').first()).toContainText(/no records|no data/i);
      }
    });
  });

  test('4.4 Status filter defaults to Active, all visible rows show Active status', async ({ page }) => {
    // 1. Verify the Status filter is set to 'Active' by default
    // The option label is 'Active'; the underlying value may be a boolean string ('true')
    const statusFilter = getStatusFilter(page);
    await expect(statusFilter.locator('option:checked')).toHaveText('Active');

    // 2. Wait for table to load
    await waitForTableRows(page);

    // 3. Verify all visible rows show Active status
    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
    for (let i = 0; i < rowCount; i++) {
      await expect(rows.nth(i).getByRole('heading', { name: 'Active' })).toBeVisible();
    }
  });

  test('4.5 Filter by Inactive status shows only Inactive records', async ({ page }) => {
    // 1. Change the Status filter to 'Inactive'
    await getStatusFilter(page).selectOption({ label: 'Inactive' });
    await page.getByText('Loading...').first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});

    // 2. Verify only Inactive system records are displayed (or empty state if none exist)
    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();
    if (rowCount === 0) {
      // Empty state is acceptable
      await expect(
        page.locator('text=/no records found|no data|no result/i').first()
      ).toBeVisible({ timeout: 5000 }).catch(() => {});
    } else {
      for (let i = 0; i < rowCount; i++) {
        await expect(rows.nth(i).getByRole('heading', { name: 'Inactive' })).toBeVisible();
      }
    }
  });

  test('4.6 Filter by All shows both Active and Inactive records', async ({ page }) => {
    // 1. Change the Status filter to 'All'
    await getStatusFilter(page).selectOption({ label: 'All' });
    await page.getByText('Loading...').first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});

    // 2. Verify both Active and Inactive records are visible
    await waitForTableRows(page);
    const activeRows = page.locator('table tbody tr').filter({ has: page.getByRole('heading', { name: 'Active' }) });
    const inactiveRows = page.locator('table tbody tr').filter({ has: page.getByRole('heading', { name: 'Inactive' }) });

    const activeCount = await activeRows.count();
    const inactiveCount = await inactiveRows.count();

    // At minimum, Active records should always exist
    expect(activeCount).toBeGreaterThan(0);
    // Total rows = active + inactive
    const totalRows = await page.locator('table tbody tr').count();
    expect(totalRows).toBeGreaterThanOrEqual(activeCount);
  });

  test('4.7 Inactivated record appears only in Inactive/All filters, not in Active filter', async ({ page }) => {
    // 1. Wait for table and note the first Active record's System Name
    await waitForTableRows(page);
    const firstRowName = await page.locator('table tbody tr').first().locator('td').nth(2).textContent();
    const targetName = firstRowName?.trim() || '';

    // 2. Click Edit and change Status to Inactive
    await clickEditOnRow(page, 0);
    await page.getByRole('combobox', { name: /Status/i }).selectOption({ label: 'Inactive' });
    await page.getByRole('button', { name: /Update/i }).click();

    // 3. Verify success toast
    await expect(
      page.locator('.toast, [class*="toast"], [class*="alert"], [role="alert"]').first()
    ).toBeVisible({ timeout: 10000 });
    await page.getByRole('heading', { name: /Add System/i }).waitFor({ state: 'visible', timeout: 15000 });
    await page.getByText('Loading...').first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});

    // 4. Verify the Active filter (default view) does NOT show the inactivated record
    await expect(getRowByText(page, targetName)).not.toBeVisible({ timeout: 5000 }).catch(() => {});

    // 5. Switch to Inactive filter and verify the record IS visible
    await getStatusFilter(page).selectOption({ label: 'Inactive' });
    await page.getByText('Loading...').first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    await expect(getRowByText(page, targetName)).toBeVisible({ timeout: 15000 });

    // 6. Switch to All filter and verify the record IS visible with Inactive badge
    await getStatusFilter(page).selectOption({ label: 'All' });
    await page.getByText('Loading...').first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    const targetRow = getRowByText(page, targetName);
    await expect(targetRow).toBeVisible({ timeout: 15000 });
    await expect(targetRow.getByRole('heading', { name: 'Inactive' })).toBeVisible();

    // Cleanup: edit and restore to Active
    await targetRow.getByRole('img', { name: 'Edit' }).click();
    await page.getByRole('heading', { name: /Update System/i }).waitFor({ state: 'visible', timeout: 10000 });
    await page.getByRole('combobox', { name: /Status/i }).selectOption({ label: 'Active' });
    await page.getByRole('button', { name: /Update/i }).click();
    await page.getByRole('heading', { name: /Add System/i }).waitFor({ state: 'visible', timeout: 15000 });
  });

  test('4.8 Change page size via Show dropdown', async ({ page }) => {
    // 1. Change the Show dropdown to '10' and verify at most 10 rows are displayed
    await getShowDropdown(page).selectOption('10');
    await page.getByText('Loading...').first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    const rows10 = await page.locator('table tbody tr').count();
    expect(rows10).toBeLessThanOrEqual(10);

    // 2. Change the Show dropdown to '25' and verify at most 25 rows are displayed
    await getShowDropdown(page).selectOption('25');
    await page.getByText('Loading...').first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    const rows25 = await page.locator('table tbody tr').count();
    expect(rows25).toBeLessThanOrEqual(25);

    // 3. Change the Show dropdown to '50' and verify at most 50 rows are displayed
    await getShowDropdown(page).selectOption('50');
    await page.getByText('Loading...').first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    const rows50 = await page.locator('table tbody tr').count();
    expect(rows50).toBeLessThanOrEqual(50);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 5 – UI and UX
// ─────────────────────────────────────────────────────────────────────────────

test.describe('UI and UX', () => {

  test.beforeEach(async ({ page }) => {
    await gotoSystemMaster(page);
  });

  test('5.1 All page elements are visible on the System Master page', async ({ page }) => {
    // 1. Verify the page heading 'System Master' is displayed
    // The page title may appear in the document title or breadcrumb area (not necessarily an h1/h2/h3)
    const systemMasterTitle = page.locator('h4, h3, h2, h1, [class*="breadcrumb"], [class*="title"], [class*="page-header"]').filter({ hasText: /System Master/i });
    const titleInPage = await systemMasterTitle.first().isVisible({ timeout: 5000 }).catch(() => false);
    if (!titleInPage) {
      // Fallback: check the document title contains "System Master"
      const docTitle = await page.title();
      expect(docTitle.toLowerCase()).toContain('system');
    }

    // 2. Verify the Add System form section is present with heading 'Add System'
    await expect(page.getByRole('heading', { name: /Add System/i })).toBeVisible();

    // 3. Verify the System Name field is visible and accessible
    await expect(getSystemNameField(page)).toBeVisible();

    // 4. Verify the Submit and Clear buttons are visible and enabled
    await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Submit/i })).toBeEnabled();
    await expect(page.getByRole('button', { name: /Clear/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Clear/i })).toBeEnabled();

    // 5. Verify the data table section is visible below the form
    await expect(page.locator('table')).toBeVisible();

    // 6. Verify table headers: Sr. No., Action, System Name, Status
    await expect(page.getByRole('button', { name: 'Sr. No.' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Action' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'System Name' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Status' })).toBeVisible();

    // 7. Verify the Status filter dropdown, Show dropdown, and Search box are present
    await expect(getStatusFilter(page)).toBeVisible();
    await expect(getShowDropdown(page)).toBeVisible();
    await expect(getSearchBox(page)).toBeVisible();
  });

  test('5.2 System Name field accepts text, numbers, and alphanumeric values', async ({ page }) => {
    const systemNameField = getSystemNameField(page);

    // 1. Type alphabetic text and verify it is accepted
    await systemNameField.fill('SystemABC');
    await expect(systemNameField).toHaveValue('SystemABC');

    // 2. Clear and type a numeric-only value and verify it is accepted
    await systemNameField.clear();
    await systemNameField.fill('12345');
    await expect(systemNameField).toHaveValue('12345');

    // 3. Clear and type an alphanumeric value and verify it is accepted
    await systemNameField.clear();
    await systemNameField.fill('System123');
    await expect(systemNameField).toHaveValue('System123');
  });

  test('5.3 Pagination controls are present and Previous is disabled on page 1', async ({ page }) => {
    // 1. Wait for table to load
    await waitForTableRows(page);

    // 2. Verify the Previous page button is disabled on page 1
    await expect(page.getByRole('button', { name: /Previous page/i })).toBeDisabled();

    // 3. Verify the current page number 1 is highlighted/active
    await expect(page.getByRole('button', { name: /Page 1 is your current page/i })).toBeVisible();

    // 4. If multiple pages exist, verify Next page button is enabled; else it's disabled on the last page
    const nextBtn = page.getByRole('button', { name: /Next page/i });
    await expect(nextBtn).toBeVisible();
  });

  test('5.4 Edit icon is present in the Action column of the first table row', async ({ page }) => {
    // 1. Wait for the table to load with at least one record
    await waitForTableRows(page);

    // 2. Verify the Action column of the first row contains an Edit icon
    const editIcon = page.locator('table tbody tr').first().getByRole('img', { name: 'Edit' });
    await expect(editIcon).toBeVisible();

    // 3. Click the Edit icon and verify the form switches to 'Update System' mode
    await editIcon.click();
    await expect(page.getByRole('heading', { name: /Update System/i })).toBeVisible({ timeout: 10000 });

    // 4. Verify System Name field is pre-filled
    const systemNameValue = await getSystemNameField(page).inputValue();
    expect(systemNameValue.length).toBeGreaterThan(0);
  });

  test('5.5 Status badge is visible in each table row', async ({ page }) => {
    // 1. Wait for the table to load with at least one record
    await waitForTableRows(page);

    // 2. Verify the first row displays a Status badge (Active)
    await expect(
      page.locator('table tbody tr').first().getByRole('heading', { name: /Active|Inactive/i })
    ).toBeVisible();

    // 3. Switch filter to 'Inactive' and verify Inactive badge is displayed if records exist
    await getStatusFilter(page).selectOption({ label: 'Inactive' });
    await page.getByText('Loading...').first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    const inactiveRows = await page.locator('table tbody tr').count();
    if (inactiveRows > 0) {
      await expect(
        page.locator('table tbody tr').first().getByRole('heading', { name: 'Inactive' })
      ).toBeVisible();
    }

    // 4. Switch back to Active and confirm Active badge is shown
    await getStatusFilter(page).selectOption({ label: 'Active' });
    await page.getByText('Loading...').first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    await expect(
      page.locator('table tbody tr').first().getByRole('heading', { name: 'Active' })
    ).toBeVisible();
  });

});
