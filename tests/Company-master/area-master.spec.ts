import { test, expect } from '@playwright/test';

const AREA_MASTER_URL = '/master/area-master';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function performLogin(page: any) {
  const mobile = process.env.MOBILE_NUMBER || '9209365301';
  const password = process.env.PASSWORD || 'Shravani@123';

  const passwordInput = page.locator('input[type="password"]');
  const passwordAlreadyVisible = await passwordInput.isVisible({ timeout: 3000 }).catch(() => false);

  if (!passwordAlreadyVisible) {
    // Enter mobile number first
    const loginInput = page.locator('.form-control').first();
    await loginInput.waitFor({ state: 'visible', timeout: 10000 });
    await loginInput.focus();
    await page.keyboard.press('End');
    await page.keyboard.type(mobile);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForTimeout(3000);
  }

  // Fill password if visible
  const pwdVisible = await passwordInput.isVisible({ timeout: 5000 }).catch(() => false);
  if (pwdVisible) {
    await passwordInput.fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
  }

  await page.waitForURL((url: URL) => !url.pathname.includes('/login'), { timeout: 30000 });
  await page.waitForLoadState('networkidle');
  await dismissNotificationPopup(page);
}

async function gotoAreaMaster(page: any) {
  await page.goto(AREA_MASTER_URL);

  // Wait for page to fully settle (including any client-side redirects)
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);
  await dismissNotificationPopup(page);

  // Check if redirected to login page
  if (page.url().includes('/login')) {
    await performLogin(page);
    // Navigate to area-master after login
    if (!page.url().includes('area-master')) {
      await page.goto(AREA_MASTER_URL);
      await page.waitForLoadState('networkidle').catch(() => {});
    }
  }

  // Wait for the Add Area form to load
  await page.getByRole('heading', { name: 'Add Area' }).waitFor({ state: 'visible', timeout: 60000 });
}

async function waitForTableRows(page: any) {
  await page.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 15000 });
}

/**
 * Dismiss the "Enable Notifications" popup if it appears after login.
 * The popup is intermittent – this helper never throws if it is absent.
 */
async function dismissNotificationPopup(page: any) {
  try {
    // Wait briefly for the popup to appear
    const enableBtn = page.getByRole('button', { name: /enable/i });
    const visible = await enableBtn.isVisible({ timeout: 5000 }).catch(() => false);
    if (visible) {
      await enableBtn.click();
      await page.waitForTimeout(500);
    }
  } catch {
    // Popup did not appear – continue normally
  }
}

/**
 * Select a branch from the custom dropdown.
 * DOM: The dropdown has a textbox inside the "Branch Name *" label group.
 * We click the textbox to open options, type to filter, then click the option.
 */
async function selectBranch(page: any, branchName: string) {
  // Click the branch dropdown textbox to open options
  const branchTextbox = page.getByRole('textbox').first();
  await branchTextbox.click();
  await page.waitForTimeout(500);

  // Type to filter and click matching option
  await branchTextbox.fill(branchName);
  await page.waitForTimeout(500);
  await page.locator('[id*="react-select"][id*="option"]').filter({ hasText: branchName }).first().click();
  await page.waitForTimeout(500);
}

/**
 * Get the search textbox inside the banner section.
 * DOM: banner > generic > textbox [ref=e243] (no placeholder, label is "Search Branch Name")
 */
async function getSearchBox(page: any) {
  return page.locator('banner').getByRole('textbox').or(page.getByRole('banner').getByRole('textbox'));
}

/**
 * Click the Edit icon (img "Edit") on a specific table row.
 */
async function clickEditOnRow(page: any, rowIndex: number = 0) {
  await page.locator('table tbody tr').nth(rowIndex).getByRole('img', { name: 'Edit' }).click();
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1 – Add Area
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Add Area', () => {

  test.beforeEach(async ({ page }) => {
    await gotoAreaMaster(page);
  });

  test.only('1.1 Add area with all valid fields', async ({ page }) => {
    // Verify form heading
    await expect(page.getByRole('heading', { name: 'Add Area' })).toBeVisible();

    // Select branch
    await selectBranch(page, 'Pune');

    // Fill Area Name and Area Code
    const timestamp = Date.now();
    await page.getByRole('textbox', { name: 'Area Name' }).fill(`Test Area ${timestamp}`);
    await page.getByRole('textbox', { name: 'Area Code' }).fill(`TA${timestamp.toString().slice(-4)}`);

    // Submit
    await page.getByRole('button', { name: /Submit/ }).click();

    // Wait for success toast or form reset
    await page.waitForTimeout(2000);

    // Verify form resets back to Add Area
    await expect(page.getByRole('heading', { name: 'Add Area' })).toBeVisible();
  });

  test('1.2 Cancel add area form resets fields', async ({ page }) => {
    // Fill the form
    await selectBranch(page, 'Pune');
    await page.getByRole('textbox', { name: 'Area Name' }).fill('Cancel Test Area');
    await page.getByRole('textbox', { name: 'Area Code' }).fill('CTA1');

    // Cancel
    await page.getByRole('button', { name: /Clear/ }).click();

    // Form should reset – heading stays 'Add Area', fields cleared
    await expect(page.getByRole('heading', { name: 'Add Area' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Area Name' })).toHaveValue('');
    await expect(page.getByRole('textbox', { name: 'Area Code' })).toHaveValue('');
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 2 – Add Area Validation
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Add Area Validation', () => {

  test.beforeEach(async ({ page }) => {
    await gotoAreaMaster(page);
  });

  test('2.1 Submit with empty Branch Name shows validation error', async ({ page }) => {
    // Leave Branch Name unselected
    await page.getByRole('textbox', { name: 'Area Name' }).fill('Test Area');
    await page.getByRole('textbox', { name: 'Area Code' }).fill('TA01');
    await page.getByRole('button', { name: /Submit/ }).click();

    // Validation error: "Please select branch name"
    await expect(page.getByText('Please select branch name')).toBeVisible();

    // Still on same page
    await expect(page).toHaveURL(new RegExp(AREA_MASTER_URL));
  });

  test('2.2 Submit with empty Area Name shows validation error', async ({ page }) => {
    await selectBranch(page, 'Pune');
    // Leave Area Name empty
    await page.getByRole('textbox', { name: 'Area Code' }).fill('TA01');
    await page.getByRole('button', { name: /Submit/ }).click();

    // Validation error for Area Name
    await expect(page.getByText('Please enter area name')).toBeVisible();

    await expect(page).toHaveURL(new RegExp(AREA_MASTER_URL));
  });

  test('2.3 Submit with empty Area Code shows validation error', async ({ page }) => {
    await selectBranch(page, 'Pune');
    await page.getByRole('textbox', { name: 'Area Name' }).fill('Test Area');
    // Leave Area Code empty
    await page.getByRole('button', { name: /Submit/ }).click();

    // Validation error for Area Code
    await expect(
      page.locator('text=/area.*code.*required|required.*code|enter.*code|please.*enter/i')
        .or(page.locator('[class*="error"], [class*="invalid"], [class*="danger"]').first())
    ).toBeVisible();

    await expect(page).toHaveURL(new RegExp(AREA_MASTER_URL));
  });

  test('2.4 Submit with all fields empty shows validation errors', async ({ page }) => {
    // Click Submit without filling anything
    await page.getByRole('button', { name: /Submit/ }).click();

    // At least one validation error visible
    await expect(
      page.locator('[class*="error"], [class*="invalid"], [class*="danger"], [class*="text-danger"]').first()
    ).toBeVisible();

    await expect(page).toHaveURL(new RegExp(AREA_MASTER_URL));
  });

  test('2.5 Add duplicate area name for same branch shows error', async ({ page }) => {
    // Use known existing entry: Branch 'Pune', Area Name 'PCMC'
    await selectBranch(page, 'Pune');
    await page.getByRole('textbox', { name: 'Area Name' }).fill('PCMC');
    await page.getByRole('textbox', { name: 'Area Code' }).fill('DUP1');
    await page.getByRole('button', { name: /Submit/ }).click();

    // Error/warning for duplicate
    await expect(
      page.locator('[class*="error"], [class*="alert"], [class*="danger"], [class*="toast"]').first()
    ).toBeVisible();
  });

  test('2.6 Inactivate active record then adding same area name shows error', async ({ page }) => {
    await waitForTableRows(page);

    // Get area name and branch from first active row
    const firstRow = page.locator('table tbody tr').first();
    const branchName = await firstRow.locator('td').nth(2).innerText();
    const areaName = await firstRow.locator('td').nth(3).innerText();
    const areaCode = await firstRow.locator('td').nth(4).innerText();

    // Edit the first row and set it to Inactive
    await clickEditOnRow(page, 0);
    await expect(page.getByRole('heading', { name: 'Update Area' })).toBeVisible();
    const statusDropdown = page.locator('select').filter({ hasText: /Active|Inactive/ }).last();
    await statusDropdown.selectOption('Inactive');
    await page.getByRole('button', { name: /Update/ }).click();
    await expect(page.getByRole('heading', { name: 'Add Area' })).toBeVisible();

    // Now try to add the same area name under the same branch
    await selectBranch(page, branchName);
    await page.getByRole('textbox', { name: 'Area Name' }).fill(areaName);
    await page.getByRole('textbox', { name: 'Area Code' }).fill(areaCode);
    await page.getByRole('button', { name: /Submit/ }).click();
    await page.waitForTimeout(2000);

    // Should show an error/duplicate message
    const errorToast = page.locator('[class*="error"], [class*="alert"], [class*="danger"], [class*="toast"]').first();
    await expect(errorToast).toBeVisible();

    // Wait for toast to disappear and page to fully settle before interacting with the table
    await errorToast.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1000);

    // Restore: switch filter to Inactive and reactivate the record
    const statusFilter = page.locator('select').filter({ hasText: /All.*Active.*Inactive/ });
    await statusFilter.selectOption('Inactive');
    await waitForTableRows(page);
    await page.locator('table tbody tr').filter({ hasText: areaName }).getByRole('img', { name: 'Edit' }).first().click();
    await page.locator('select').filter({ hasText: /Active|Inactive/ }).last().selectOption('Active');
    await page.getByRole('button', { name: /Update/ }).click();
  });

  test('2.8 Should not allow duplicate area name across branches even if original area is inactive', async ({ page }) => {
    const timestamp = Date.now();
    const inactiveAreaName = `InactiveArea${timestamp}`;
    const inactiveAreaCode = `IA${timestamp.toString().slice(-4)}`;

    // Step 1: Create area under 'Pune' branch
    await selectBranch(page, 'Pune');
    await page.getByRole('textbox', { name: 'Area Name' }).fill(inactiveAreaName);
    await page.getByRole('textbox', { name: 'Area Code' }).fill(inactiveAreaCode);
    await page.getByRole('button', { name: /Submit/ }).click();
    await page.waitForTimeout(2000);
    await expect(page.getByRole('heading', { name: 'Add Area' })).toBeVisible();

    // Step 2: Inactivate the newly created area
    await waitForTableRows(page);
    await page.locator('table tbody tr')
      .filter({ hasText: inactiveAreaName })
      .getByRole('img', { name: 'Edit' })
      .first()
      .click();
    await expect(page.getByRole('heading', { name: 'Update Area' })).toBeVisible();
    await page.locator('select').filter({ hasText: /Active|Inactive/ }).last().selectOption('Inactive');
    await page.getByRole('button', { name: /Update/ }).click();
    await expect(page.getByRole('heading', { name: 'Add Area' })).toBeVisible();

    // Step 3: Try to create the same area name under a different branch ('Nagpur')
    await selectBranch(page, 'Nagpur');
    await page.getByRole('textbox', { name: 'Area Name' }).fill(inactiveAreaName);
    await page.getByRole('textbox', { name: 'Area Code' }).fill(`NB${timestamp.toString().slice(-4)}`);
    await page.getByRole('button', { name: /Submit/ }).click();
    await page.waitForTimeout(2000);

    // Error message must be visible
    await expect(
      page.locator('[class*="error"], [class*="alert"], [class*="danger"], [class*="toast"]').first()
    ).toBeVisible();

    // Negative assertion: record must NOT have been created (table should not contain a new row for Nagpur with this name)
    await waitForTableRows(page);
    const nagpurDuplicateRows = page.locator('table tbody tr').filter({ hasText: inactiveAreaName }).filter({ hasText: 'Nagpur' });
    await expect(nagpurDuplicateRows).toHaveCount(0);

    // Step 4: Try to update an existing Nagpur record to use the same inactive area name
    // Switch filter to All to find any Nagpur row
    const statusFilter = page.locator('select').filter({ hasText: /All.*Active.*Inactive/ });
    await statusFilter.selectOption('All');
    await waitForTableRows(page);

    const nagpurRows = page.locator('table tbody tr').filter({ hasText: 'Nagpur' });
    const nagpurCount = await nagpurRows.count();
    if (nagpurCount > 0) {
      await nagpurRows.first().getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: 'Update Area' })).toBeVisible();

      // Change area name to the inactive duplicate name
      await page.getByRole('textbox', { name: 'Area Name' }).fill(inactiveAreaName);
      await page.getByRole('button', { name: /Update/ }).click();
      await page.waitForTimeout(2000);

      // Error message must be visible on update attempt too
      await expect(
        page.locator('[class*="error"], [class*="alert"], [class*="danger"], [class*="toast"]').first()
      ).toBeVisible();

      // Discard changes
      await page.getByRole('button', { name: /Clear/ }).click();
    }

    // Cleanup: restore the original inactive area back to Active
    await statusFilter.selectOption('Inactive');
    await waitForTableRows(page);
    await page.locator('table tbody tr')
      .filter({ hasText: inactiveAreaName })
      .getByRole('img', { name: 'Edit' })
      .first()
      .click();
    await page.locator('select').filter({ hasText: /Active|Inactive/ }).last().selectOption('Active');
    await page.getByRole('button', { name: /Update/ }).click();
  });

  test('2.9 Inactivate an active record and verify its name is blocked on a different branch (add and edit)', async ({ page }) => {
    await waitForTableRows(page);

    // ── Step 1: Read the first active Pune row ────────────────────────────────
    // Filter to Active (default) and find a Pune row to work with
    const puneRow = page.locator('table tbody tr').filter({ hasText: 'Pune' }).first();
    const puneRowCount = await puneRow.count();
    if (puneRowCount === 0) {
      test.skip();
      return;
    }

    const targetAreaName = await puneRow.locator('td').nth(3).innerText();

    // ── Step 2: Inactivate the Pune record ────────────────────────────────────
    await puneRow.getByRole('img', { name: 'Edit' }).click();
    await expect(page.getByRole('heading', { name: 'Update Area' })).toBeVisible();
    await page.locator('select').filter({ hasText: /Active|Inactive/ }).last().selectOption('Inactive');
    await page.getByRole('button', { name: /Update/ }).click();
    await expect(page.getByRole('heading', { name: 'Add Area' })).toBeVisible();
    await waitForTableRows(page);

    // ── Step 3: Try to ADD the same area name under 'Nagpur' ──────────────────
    const timestamp = Date.now();
    await selectBranch(page, 'Nagpur');
    await page.getByRole('textbox', { name: 'Area Name' }).fill(targetAreaName);
    await page.getByRole('textbox', { name: 'Area Code' }).fill(`NX${timestamp.toString().slice(-4)}`);
    await page.getByRole('button', { name: /Submit/ }).click();
    await page.waitForTimeout(2000);

    // Error message must be visible
    await expect(
      page.locator('[class*="error"], [class*="alert"], [class*="danger"], [class*="toast"]').first()
    ).toBeVisible();

    // Negative assertion: the record must NOT appear in the table under Nagpur
    await waitForTableRows(page);
    await expect(
      page.locator('table tbody tr').filter({ hasText: targetAreaName }).filter({ hasText: 'Nagpur' })
    ).toHaveCount(0);

    // ── Step 4: Try to EDIT an existing Nagpur record to the same area name ───
    const statusFilter = page.locator('select').filter({ hasText: /All.*Active.*Inactive/ });
    await statusFilter.selectOption('All');
    await waitForTableRows(page);

    const nagpurRow = page.locator('table tbody tr').filter({ hasText: 'Nagpur' }).first();
    const nagpurExists = await nagpurRow.count();

    if (nagpurExists > 0) {
      await nagpurRow.getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: 'Update Area' })).toBeVisible();

      await page.getByRole('textbox', { name: 'Area Name' }).fill(targetAreaName);
      await page.getByRole('button', { name: /Update/ }).click();
      await page.waitForTimeout(2000);

      // Error message must be visible on update attempt too
      await expect(
        page.locator('[class*="error"], [class*="alert"], [class*="danger"], [class*="toast"]').first()
      ).toBeVisible();

      // Discard changes
      await page.getByRole('button', { name: /Clear/ }).click();
    }

    // ── Cleanup: restore the Pune record back to Active ───────────────────────
    await statusFilter.selectOption('Inactive');
    await waitForTableRows(page);
    await page.locator('table tbody tr')
      .filter({ hasText: targetAreaName })
      .filter({ hasText: 'Pune' })
      .getByRole('img', { name: 'Edit' })
      .first()
      .click();
    await expect(page.getByRole('heading', { name: 'Update Area' })).toBeVisible();
    await page.locator('select').filter({ hasText: /Active|Inactive/ }).last().selectOption('Active');
    await page.getByRole('button', { name: /Update/ }).click();
    await expect(page.getByRole('heading', { name: 'Add Area' })).toBeVisible();
  });

  test('2.7 Add same area name for different branch should succeed', async ({ page }) => {
    // Add an area under 'Pune'
    const timestamp = Date.now();
    const sharedAreaName = `SharedArea${timestamp}`;

    await selectBranch(page, 'Pune');
    await page.getByRole('textbox', { name: 'Area Name' }).fill(sharedAreaName);
    await page.getByRole('textbox', { name: 'Area Code' }).fill(`SA${timestamp.toString().slice(-4)}`);
    await page.getByRole('button', { name: /Submit/ }).click();
    await page.waitForTimeout(2000);
    await expect(page.getByRole('heading', { name: 'Add Area' })).toBeVisible();

    // Now add the same area name under a different branch (e.g. 'Nagpur')
    await selectBranch(page, 'Nagpur');
    await page.getByRole('textbox', { name: 'Area Name' }).fill(sharedAreaName);
    await page.getByRole('textbox', { name: 'Area Code' }).fill(`SB${timestamp.toString().slice(-4)}`);
    await page.getByRole('button', { name: /Submit/ }).click();
    await page.waitForTimeout(2000);

    // Should succeed – form resets back to Add Area (no error)
    await expect(page.getByRole('heading', { name: 'Add Area' })).toBeVisible();
    const errorVisible = await page
      .locator('[class*="error"], [class*="danger"]')
      .first()
      .isVisible()
      .catch(() => false);
    expect(errorVisible).toBe(false);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 3 – Update Area
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Update Area', () => {

  test.beforeEach(async ({ page }) => {
    await gotoAreaMaster(page);
  });

  test('3.1 Edit area and update with valid data', async ({ page }) => {
    await waitForTableRows(page);

    // Get original area name from first row
    const originalName = await page.locator('table tbody tr').first().locator('td').nth(3).innerText();

    // Click Edit on first row
    await clickEditOnRow(page, 0);

    // Form heading changes to 'Update Area'
    await expect(page.getByRole('heading', { name: 'Update Area' })).toBeVisible();

    // Fields are pre-populated
    await expect(page.getByRole('textbox', { name: 'Area Name' })).not.toHaveValue('');
    await expect(page.getByRole('textbox', { name: 'Area Code' })).not.toHaveValue('');

    // Update the Area Name
    const updatedName = `${originalName} Updated`;
    await page.getByRole('textbox', { name: 'Area Name' }).fill(updatedName);

    // Click Update
    await page.getByRole('button', { name: /Update/ }).click();

    // Verify form resets or success shown
    await expect(page.getByRole('heading', { name: 'Add Area' })).toBeVisible();

    // Updated value reflected in table
    await waitForTableRows(page);
    await expect(page.locator('table tbody')).toContainText(updatedName);

    // Restore original name
    await page.locator('table tbody').getByText(updatedName).first().waitFor({ state: 'visible' });
    await page.locator('table tbody tr').filter({ hasText: updatedName }).getByRole('img', { name: 'Edit' }).click();
    await page.getByRole('textbox', { name: 'Area Name' }).fill(originalName);
    await page.getByRole('button', { name: /Update/ }).click();
  });

  test('3.2 Edit area and change status to Inactive', async ({ page }) => {
    await waitForTableRows(page);

    // Click Edit on first row (Active record)
    await clickEditOnRow(page, 0);
    await expect(page.getByRole('heading', { name: 'Update Area' })).toBeVisible();

    // Status dropdown is visible in edit mode
    const statusDropdown = page.locator('select').filter({ hasText: /Active|Inactive/ }).last();
    await expect(statusDropdown).toBeVisible();

    // Change to Inactive
    await statusDropdown.selectOption('Inactive');
    await page.getByRole('button', { name: /Update/ }).click();

    // Success – form resets back to Add Area
    await expect(page.getByRole('heading', { name: 'Add Area' })).toBeVisible();

    // Switch filter to show Inactive records
    const statusFilter = page.locator('select').filter({ hasText: /Active/ });
    await statusFilter.selectOption('Inactive');
    await waitForTableRows(page);

    // Restore back to Active
    await clickEditOnRow(page, 0);
    await page.locator('select').filter({ hasText: /Active|Inactive/ }).last().selectOption('Active');
    await page.getByRole('button', { name: /Update/ }).click();
  });

  test('3.3 Cancel edit form discards changes', async ({ page }) => {
    await waitForTableRows(page);

    // Get original area name from first row
    const originalName = await page.locator('table tbody tr').first().locator('td').nth(3).innerText();

    // Click Edit
    await clickEditOnRow(page, 0);
    await expect(page.getByRole('heading', { name: 'Update Area' })).toBeVisible();

    // Modify field
    await page.getByRole('textbox', { name: 'Area Name' }).fill('Discarded Change');

    // Cancel
    await page.getByRole('button', { name: /Clear/ }).click();

    // Form resets to Add Area
    await expect(page.getByRole('heading', { name: 'Add Area' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Area Name' })).toHaveValue('');

    // Table still shows original name
    await waitForTableRows(page);
    await expect(page.locator('table tbody tr').first()).toContainText(originalName);
  });

  test('3.4 Edit existing record and submit with duplicate area name shows error', async ({ page }) => {
    await waitForTableRows(page);

    // Get the area name from the second row to use as the duplicate target
    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();
    if (rowCount < 2) {
      test.skip();
      return;
    }

    const secondRowAreaName = await rows.nth(1).locator('td').nth(3).innerText();

    // Edit the first row
    await clickEditOnRow(page, 0);
    await expect(page.getByRole('heading', { name: 'Update Area' })).toBeVisible();

    // Change area name to the second row's name (duplicate within same branch)
    await page.getByRole('textbox', { name: 'Area Name' }).fill(secondRowAreaName);
    await page.getByRole('button', { name: /Update/ }).click();
    await page.waitForTimeout(2000);

    // Should show error – duplicate not allowed
    await expect(
      page.locator('[class*="error"], [class*="alert"], [class*="danger"], [class*="toast"]').first()
    ).toBeVisible();

    // Cancel to discard changes
    await page.getByRole('button', { name: /Clear/ }).click();
  });

  test('3.5 Submit Update form with empty Area Name shows validation error', async ({ page }) => {
    await waitForTableRows(page);

    // Click Edit
    await clickEditOnRow(page, 0);
    await expect(page.getByRole('heading', { name: 'Update Area' })).toBeVisible();

    // Clear Area Name
    await page.getByRole('textbox', { name: 'Area Name' }).fill('');

    // Click Update
    await page.getByRole('button', { name: /Update/ }).click();

    // Validation error visible
    await expect(
      page.locator('[class*="error"], [class*="invalid"], [class*="danger"]').first()
    ).toBeVisible();

    // Still in Update Area mode
    await expect(page.getByRole('heading', { name: 'Update Area' })).toBeVisible();
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 4 – Search and Filter
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Search and Filter', () => {

  test.beforeEach(async ({ page }) => {
    await gotoAreaMaster(page);
  });

  test('4.1 Search areas by Branch Name', async ({ page }) => {
    await waitForTableRows(page);

    const searchBox = await getSearchBox(page);

    // Type branch name
    await searchBox.fill('Pune');
    await page.waitForTimeout(1000);

    // Table shows filtered results
    await expect(page.locator('table tbody tr').first()).toBeVisible();
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toContainText('Pune');
    }

    // Clear search – all records restored
    await searchBox.fill('');
    await waitForTableRows(page);
  });

  test('4.2 Search areas by Area Name', async ({ page }) => {
    await waitForTableRows(page);

    const searchBox = await getSearchBox(page);
    await searchBox.fill('PCMC');
    await page.waitForTimeout(1000);

    // At least one result
    await expect(page.locator('table tbody tr').first()).toBeVisible();
    await expect(page.locator('table tbody tr').first()).toContainText('PCMC');

    // Clear
    await searchBox.fill('');
    await waitForTableRows(page);
  });

  test('4.3 Search with no matching results shows empty state', async ({ page }) => {
    await waitForTableRows(page);

    const searchBox = await getSearchBox(page);
    await searchBox.fill('XYZNOTEXIST99999');
    await page.waitForTimeout(1000);

    // No rows visible or empty message shown
    const rowCount = await page.locator('table tbody tr').count();
    expect(rowCount).toBeLessThanOrEqual(1); // 0 rows or 1 "no data" row
  });

  test('4.4 Status filter defaults to Active and shows only Active records', async ({ page }) => {
    await waitForTableRows(page);

    // Default status filter is 'Active'
    const statusFilter = page.locator('select').filter({ hasText: /All.*Active.*Inactive/ });
    await expect(statusFilter).toHaveValue('Active');

    // All rows show Active status
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i).locator('td').last()).toContainText('Active');
    }

    // Change to 'All'
    await statusFilter.selectOption('All');
    await waitForTableRows(page);
  });

  test('4.5 Filter by Status Inactive shows only Inactive records', async ({ page }) => {
    await waitForTableRows(page);

    const statusFilter = page.locator('select').filter({ hasText: /All.*Active.*Inactive/ });
    await statusFilter.selectOption('Inactive');

    // Either rows show Inactive OR empty state
    const rowCount = await page.locator('table tbody tr').count();
    if (rowCount > 0) {
      const rows = page.locator('table tbody tr');
      for (let i = 0; i < rowCount; i++) {
        await expect(rows.nth(i).locator('td').last()).toContainText('Inactive');
      }
    } else {
      await expect(page.locator('table tbody')).toBeVisible();
    }
  });

  test('4.6 Change page size updates visible rows', async ({ page }) => {
    await waitForTableRows(page);

    // Default is 25
    const showDropdown = page.locator('select').filter({ hasText: /10.*25.*50.*100/ });
    await expect(showDropdown).toHaveValue('25');

    // Change to 10 – max 10 rows shown
    await showDropdown.selectOption('10');
    const rowCount10 = await page.locator('table tbody tr').count();
    expect(rowCount10).toBeLessThanOrEqual(10);

    // Change to 50
    await showDropdown.selectOption('50');
    const rowCount50 = await page.locator('table tbody tr').count();
    expect(rowCount50).toBeLessThanOrEqual(50);
  });

  test('4.7 Sort table by Branch Name column', async ({ page }) => {
    await waitForTableRows(page);

    // Click Branch Name header to sort ascending (it's a button)
    await page.getByRole('button', { name: 'Branch Name' }).click();
    await waitForTableRows(page);

    // Collect branch name values
    const branchCells = page.locator('table tbody tr td:nth-child(3)');
    const count = await branchCells.count();
    const values: string[] = [];
    for (let i = 0; i < count; i++) {
      values.push(await branchCells.nth(i).innerText());
    }
    const sorted = [...values].sort((a, b) => a.localeCompare(b));
    expect(values).toEqual(sorted);

    // Click again for descending
    await page.getByRole('button', { name: 'Branch Name' }).click();
    await waitForTableRows(page);
    const valuesDesc: string[] = [];
    for (let i = 0; i < count; i++) {
      valuesDesc.push(await branchCells.nth(i).innerText());
    }
    const sortedDesc = [...valuesDesc].sort((a, b) => b.localeCompare(a));
    expect(valuesDesc).toEqual(sortedDesc);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 5 – UI and UX
// ─────────────────────────────────────────────────────────────────────────────

test.describe('UI and UX', () => {

  test.beforeEach(async ({ page }) => {
    await gotoAreaMaster(page);
  });

  test('5.1 Verify Area Master page layout and elements', async ({ page }) => {
    // Page heading
    await expect(page.getByRole('heading', { name: 'Area Master', level: 4 })).toBeVisible();

    // Add Area form heading and fields
    await expect(page.getByRole('heading', { name: 'Add Area' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Area Name' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Area Code' })).toBeVisible();
    await expect(page.getByText('Branch Name *')).toBeVisible();

    // Submit and Cancel buttons
    await expect(page.getByRole('button', { name: /Submit/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Clear/ })).toBeVisible();

    // Table column headers (they are buttons in the DOM)
    await expect(page.getByRole('button', { name: 'Sr. No.' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Action' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Branch Name' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Area Name' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Area Code' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Status' })).toBeVisible();

    // Filter controls
    await expect(page.getByText('Show:').first()).toBeVisible();
    await expect(page.getByText('Status:').first()).toBeVisible();
    await expect(page.getByRole('banner').getByRole('textbox')).toBeVisible();
  });

  test('5.2 Verify Branch Name dropdown opens and lists branches', async ({ page }) => {
    // Click the branch dropdown textbox to open it
    const branchTextbox = page.getByRole('textbox').first();
    await branchTextbox.click();
    await page.waitForTimeout(500);

    // Options visible
    const options = page.locator('[id*="react-select"][id*="option"]');
    await expect(options.first()).toBeVisible();

    // Select Pune and verify it appears
    await options.filter({ hasText: 'Pune' }).first().click();
    await expect(page.getByText('Pune').first()).toBeVisible();
  });

  test('5.3 Verify table pagination controls', async ({ page }) => {
    await waitForTableRows(page);

    // Pagination buttons (confirmed from DOM snapshot)
    await expect(page.getByRole('button', { name: 'Previous page' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Page 1/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next page' })).toBeVisible();

    // Previous disabled on page 1
    await expect(page.getByRole('button', { name: 'Previous page' })).toBeDisabled();
  });

  test('5.4 Verify Edit icon is present in action column', async ({ page }) => {
    await waitForTableRows(page);

    // Edit icon (img "Edit") is present in first row
    await expect(
      page.locator('table tbody tr').first().getByRole('img', { name: 'Edit' })
    ).toBeVisible();
  });

  test('5.5 Verify Status badge styling in table', async ({ page }) => {
    await waitForTableRows(page);

    // Active badge is an h5 heading in the DOM
    await expect(
      page.locator('table tbody tr').first().getByRole('heading', { name: 'Active' })
    ).toBeVisible();
  });

});
