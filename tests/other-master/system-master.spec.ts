// spec: test-plans/Other-master-test-plan/system-master-test-plan.md
// seed: tests/setup/auth.setup.ts

import { test, expect } from '../fixtures/auth-fixture';

const SYSTEM_MASTER_URL = '/master/system-master';

async function registerPopupHandler(page: any) {
  if ((page as any).__popupHandlerRegistered) return;
  (page as any).__popupHandlerRegistered = true;
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

async function gotoSystemMaster(page: any) {
  await registerPopupHandler(page);
  await page.goto(SYSTEM_MASTER_URL, { timeout: 60000 });
  await page.getByRole('heading', { name: /Add System/i }).waitFor({ state: 'visible', timeout: 45000 });
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  await dismissNotificationPopup(page);
}

function systemNameInput(page: any) {
  return page.locator('#system_name');
}

function tableRows(page: any) {
  return page.locator('[role="row"]:has([role="cell"])');
}

async function waitForTableRows(page: any) {
  await tableRows(page).first().waitFor({ state: 'visible', timeout: 30000 });
}

async function clickEditOnRow(page: any, rowIndex: number = 0) {
  await tableRows(page).nth(rowIndex).locator('[role="cell"]').nth(1).locator('svg').click({ timeout: 15000 });
}

// Status filter for Other Masters uses text values: All / Active / Inactive
function statusFilterSelect(page: any) {
  return page.locator('select').filter({ has: page.locator('option', { hasText: 'Inactive' }) }).first();
}

function showEntriesSelect(page: any) {
  return page.locator('select').filter({ has: page.locator('option', { hasText: '100' }) }).first();
}

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

test.describe('System Master', () => {

  test.describe('Smoke Tests', () => {

    test.beforeEach(async ({ page }) => {
      await gotoSystemMaster(page);
    });

    test('TC-SM-01: System Master page loads successfully', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(SYSTEM_MASTER_URL, 'i'));
      await expect(page).toHaveTitle('ElevatorPlus');
      await expect(page.getByRole('heading', { name: /Add System/i })).toBeVisible();

      const nameInput = systemNameInput(page);
      await expect(nameInput).toBeVisible();
      await expect(nameInput).toHaveValue('');

      await expect(page.getByText('Enter your system name')).toBeVisible();
      await expect(page.getByRole('button', { name: /Clear/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();

      await waitForTableRows(page);
      await expect(page.getByText('Sr. No.')).toBeVisible();
      await expect(page.getByRole('button', { name: 'System Name', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Status', exact: true })).toBeVisible();
    });

    test('TC-SM-02: Verify page elements and layout', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /Add System/i })).toBeVisible();

      const showDropdown = showEntriesSelect(page);
      await expect(showDropdown).toBeVisible();
      await expect(showDropdown).toHaveValue('25');

      const statusFilter = statusFilterSelect(page);
      await expect(statusFilter).toBeVisible();
      await expect(statusFilter).toHaveValue('true');

      await expect(page.getByRole('button', { name: /Import/i })).toBeVisible();
      await expect(page.getByPlaceholder('Search System Name')).toBeVisible();

      await waitForTableRows(page);
      await expect(page.getByText('Sr. No.')).toBeVisible();
      await expect(page.getByRole('button', { name: 'System Name', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Status', exact: true })).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 2 – Add System (Happy Path)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Add System (Happy Path)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoSystemMaster(page);
    });

    test('TC-ADD-01: Successfully create a new system with a unique name', async ({ page }) => {
      const systemName = `AutoSystem ${Date.now()}`;
      await systemNameInput(page).fill(systemName);
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /System has been created successfully!/i })).toBeVisible({ timeout: 15000 });
      await expect(systemNameInput(page)).toHaveValue('', { timeout: 10000 });
      await expect(page.getByRole('heading', { name: /Add System/i })).toBeVisible();

      await page.getByPlaceholder('Search System Name').fill(systemName);
      await page.waitForTimeout(1000);
      await expect(tableRows(page).filter({ hasText: systemName })).toHaveCount(1, { timeout: 15000 });
      await page.getByPlaceholder('Search System Name').fill('');
    });

    test('TC-ADD-02: Create a system with special characters in the name', async ({ page }) => {
      const systemName = `System #1 - Hi-Speed ${Date.now()}`;
      await systemNameInput(page).fill(systemName);
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /System has been created successfully!/i })).toBeVisible({ timeout: 15000 });
      await page.getByPlaceholder('Search System Name').fill(systemName);
      await page.waitForTimeout(1000);
      await expect(tableRows(page).filter({ hasText: systemName })).toHaveCount(1, { timeout: 15000 });
      await page.getByPlaceholder('Search System Name').fill('');
    });

    test('TC-ADD-03: Create a system with a long name (~100 chars)', async ({ page }) => {
      const systemName = `Long System Name For Testing Character Limit In ElevatorPlus Other Master Module System`;
      await systemNameInput(page).fill(systemName);
      await page.getByRole('button', { name: /Submit/i }).click();

      const successToast = page.locator('[role="alert"]').filter({ hasText: /System has been created successfully!/i });
      const errorToast = page.locator('[role="alert"]').filter({ hasText: /already exists/i });

      const appeared = await Promise.race([
        successToast.waitFor({ state: 'visible', timeout: 15000 }).then(() => true).catch(() => false),
        errorToast.waitFor({ state: 'visible', timeout: 15000 }).then(() => true).catch(() => false),
      ]);

      expect(appeared).toBeTruthy();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 3 – Mandatory Field Validation
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Mandatory Field Validation', () => {

    test.beforeEach(async ({ page }) => {
      await gotoSystemMaster(page);
    });

    test('TC-VAL-01: Submit empty form shows inline validation error', async ({ page }) => {
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.getByText('Please enter system name')).toBeVisible({ timeout: 5000 });
      await expect(page).toHaveURL(new RegExp(SYSTEM_MASTER_URL, 'i'));
      await expect(page.getByRole('heading', { name: /Add System/i })).toBeVisible();
    });

    test('TC-VAL-02: Submit whitespace-only name shows validation or no blank system', async ({ page }) => {
      await systemNameInput(page).fill('   ');
      await page.getByRole('button', { name: /Submit/i }).click();
      await page.waitForTimeout(3000);

      const hasValidation = await page.getByText('Please enter system name').isVisible({ timeout: 1000 }).catch(() => false);

      if (!hasValidation) {
        // App may silently block the submission — successful creation always clears the input,
        // so if the input still has a value the whitespace was rejected without creating a blank record.
        const inputVal = await systemNameInput(page).inputValue();
        const inputCleared = inputVal === '';
        expect(!inputCleared, 'Whitespace was accepted and created a blank system (input was cleared)').toBeTruthy();
      }
    });

    test('TC-VAL-03: Validation error clears when valid input is entered', async ({ page }) => {
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.getByText('Please enter system name')).toBeVisible({ timeout: 5000 });

      const systemName = `ValidSystem ${Date.now()}`;
      await systemNameInput(page).fill(systemName);
      await expect(page.getByText('Please enter system name')).not.toBeVisible({ timeout: 5000 });

      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /System has been created successfully!/i })).toBeVisible({ timeout: 15000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 4 – Duplicate Prevention
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Duplicate Prevention', () => {

    test.beforeEach(async ({ page }) => {
      await gotoSystemMaster(page);
    });

    test('TC-DUP-01: Submitting existing system name shows error', async ({ page }) => {
      await waitForTableRows(page);
      const existingName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(existingName.length).toBeGreaterThan(0);

      await systemNameInput(page).fill(existingName);
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /already exists/i })).toBeVisible({ timeout: 15000 });
    });

    test('TC-DUP-02: Case-sensitivity test for duplicate system name', async ({ page }) => {
      await waitForTableRows(page);
      const existingName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(existingName.length).toBeGreaterThan(0);

      await systemNameInput(page).fill(existingName.toUpperCase());
      await page.getByRole('button', { name: /Submit/i }).click();

      const errorToast = page.locator('[role="alert"]').filter({ hasText: /already exists/i });
      const successToast = page.locator('[role="alert"]').filter({ hasText: /System has been created successfully!/i });

      const appeared = await Promise.race([
        errorToast.waitFor({ state: 'visible', timeout: 15000 }).then(() => true).catch(() => false),
        successToast.waitFor({ state: 'visible', timeout: 15000 }).then(() => true).catch(() => false),
      ]);
      expect(appeared).toBeTruthy();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 5 – Clear Button
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Clear Button', () => {

    test.beforeEach(async ({ page }) => {
      await gotoSystemMaster(page);
    });

    test('TC-CLR-01: Clear button resets the Add System form', async ({ page }) => {
      await systemNameInput(page).fill('Temp System Name');
      await page.getByRole('button', { name: /Clear/i }).click();

      await expect(systemNameInput(page)).toHaveValue('');
      await expect(page.getByRole('heading', { name: /Add System/i })).toBeVisible();
    });

    test('TC-CLR-02: Clear in Edit mode resets form to Add System state', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update System/i })).toBeVisible({ timeout: 10000 });

      const nameInput = systemNameInput(page);
      const currentName = await nameInput.inputValue();
      expect(currentName.length).toBeGreaterThan(0);

      await expect(page.getByRole('combobox', { name: /Status \*/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Update/i })).toBeVisible();

      await page.getByRole('button', { name: /Clear/i }).click();

      await expect(page.getByRole('heading', { name: /Add System/i })).toBeVisible();
      await expect(nameInput).toHaveValue('');
      await expect(page.getByRole('combobox', { name: /Status \*/i })).not.toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 6 – Edit and Update Operations
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Edit and Update Operations', () => {

    test.beforeEach(async ({ page }) => {
      await gotoSystemMaster(page);
    });

    test('TC-EDT-01: Edit icon opens record in edit mode', async ({ page }) => {
      await waitForTableRows(page);
      const originalName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      await clickEditOnRow(page, 0);

      await expect(page.getByRole('heading', { name: /Update System/i })).toBeVisible({ timeout: 10000 });
      await expect(systemNameInput(page)).toHaveValue(originalName);

      const statusSelect = page.getByRole('combobox', { name: /Status \*/i });
      await expect(statusSelect).toBeVisible();
      await expect(statusSelect).toHaveValue('true');
      await expect(page.getByRole('button', { name: /Update/i })).toBeVisible();
    });

    test('TC-EDT-02: Successfully update the system name', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update System/i })).toBeVisible({ timeout: 10000 });

      const newName = `Updated System ${Date.now()}`;
      const nameInput = systemNameInput(page);
      await nameInput.clear();
      await nameInput.fill(newName);

      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /System has been updated successfully!/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add System/i })).toBeVisible({ timeout: 15000 });

      await page.getByPlaceholder('Search System Name').fill(newName);
      await page.waitForTimeout(1000);
      await expect(tableRows(page).filter({ hasText: newName })).toHaveCount(1, { timeout: 15000 });
      await page.getByPlaceholder('Search System Name').fill('');
    });

    test('TC-EDT-03: Update system status to Inactive', async ({ page }) => {
      await waitForTableRows(page);
      const systemName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update System/i })).toBeVisible({ timeout: 10000 });

      await page.getByRole('combobox', { name: /Status \*/i }).selectOption('Inactive');
      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /System has been updated successfully!/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add System/i })).toBeVisible({ timeout: 15000 });

      await statusFilterSelect(page).selectOption('All');
      const systemRow = tableRows(page).filter({ hasText: systemName });
      await expect(systemRow.getByRole('heading', { level: 5, name: /Inactive/i })).toBeVisible({ timeout: 15000 });

      // Restore: set back to Active
      await systemRow.getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update System/i })).toBeVisible({ timeout: 10000 });
      await page.getByRole('combobox', { name: /Status \*/i }).selectOption('Active');
      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.getByRole('heading', { name: /Add System/i })).toBeVisible({ timeout: 15000 });
    });

    test('TC-EDT-04: Update with empty System Name shows validation error', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update System/i })).toBeVisible({ timeout: 10000 });

      await systemNameInput(page).clear();
      await page.getByRole('button', { name: /Update/i }).click();

      await expect(page.getByText('Please enter system name')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Update System/i })).toBeVisible();
    });

    test('TC-EDT-05: Update name to duplicate of existing Active system shows error', async ({ page }) => {
      await waitForTableRows(page);
      const firstName = (await tableRows(page).nth(0).locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      const secondName = (await tableRows(page).nth(1).locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(firstName.length).toBeGreaterThan(0);
      expect(secondName.length).toBeGreaterThan(0);

      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update System/i })).toBeVisible({ timeout: 10000 });

      const nameInput = systemNameInput(page);
      await nameInput.clear();
      await nameInput.fill(secondName);

      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /already exists/i })).toBeVisible({ timeout: 15000 });
    });

    test('TC-EDT-06: Update name to duplicate of existing Inactive system shows error', async ({ page }) => {
      await statusFilterSelect(page).selectOption('Inactive');
      const inactiveCount = await tableRows(page).count().catch(() => 0);

      if (inactiveCount > 0) {
        await waitForTableRows(page);
        const inactiveName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

        await statusFilterSelect(page).selectOption('Active');
        await waitForTableRows(page);

        await clickEditOnRow(page, 0);
        await expect(page.getByRole('heading', { name: /Update System/i })).toBeVisible({ timeout: 10000 });

        const nameInput = systemNameInput(page);
        await nameInput.clear();
        await nameInput.fill(inactiveName);

        await page.getByRole('button', { name: /Update/i }).click();
        await expect(page.locator('[role="alert"]').filter({ hasText: /already exists/i })).toBeVisible({ timeout: 15000 });
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 7 – Status Filter
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Status Filter', () => {

    test.beforeEach(async ({ page }) => {
      await gotoSystemMaster(page);
    });

    test('TC-FLT-01: Filter by Active (default) shows only Active records', async ({ page }) => {
      await expect(statusFilterSelect(page)).toHaveValue('true');
      await waitForTableRows(page);

      await showEntriesSelect(page).selectOption('10');
      await page.waitForTimeout(500);

      const statuses = await getStatusColumnTexts(page);
      expect(statuses.length).toBeGreaterThan(0);
      for (const status of statuses) {
        expect(status).toBe('Active');
      }
    });

    test('TC-FLT-02: Filter to All shows both Active and Inactive', async ({ page }) => {
      await statusFilterSelect(page).selectOption('All');
      await waitForTableRows(page);
      await expect(statusFilterSelect(page)).toHaveValue('');
      const rowCount = await tableRows(page).count();
      expect(rowCount).toBeGreaterThan(0);
    });

    test('TC-FLT-03: Filter to Inactive shows only Inactive or empty state', async ({ page }) => {
      await statusFilterSelect(page).selectOption('Inactive');
      await expect(statusFilterSelect(page)).toHaveValue('false');
      await page.waitForTimeout(1000);

      const rowCount = await tableRows(page).count().catch(() => 0);
      if (rowCount > 0) {
        const statuses = await getStatusColumnTexts(page);
        for (const status of statuses) {
          expect(status).toBe('Inactive');
        }
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 8 – Search Functionality
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Search Functionality', () => {

    test.beforeEach(async ({ page }) => {
      await gotoSystemMaster(page);
    });

    test('TC-SRC-01: Search by partial system name returns matches', async ({ page }) => {
      await waitForTableRows(page);
      const initialCount = await tableRows(page).count();

      const searchBox = page.getByPlaceholder('Search System Name');
      await searchBox.fill('DUPLEX');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      const filteredCount = await tableRows(page).count();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
      expect(filteredCount).toBeGreaterThan(0);
    });

    test('TC-SRC-02: Non-existent search returns no results', async ({ page }) => {
      await waitForTableRows(page);
      const searchBox = page.getByPlaceholder('Search System Name');
      await searchBox.fill('XYZNONEXISTENTSYSTEM999');
      await tableRows(page).first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

      const rows = await tableRows(page).count().catch(() => 0);
      expect(rows).toBe(0);
    });

    test('TC-SRC-03: Clearing search restores the full list', async ({ page }) => {
      await waitForTableRows(page);
      const initialCount = await tableRows(page).count();

      const searchBox = page.getByPlaceholder('Search System Name');
      await searchBox.fill('SIMPLEX');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      await searchBox.clear();
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
      await gotoSystemMaster(page);
    });

    test('TC-PAG-01: Change rows per page to 10', async ({ page }) => {
      await waitForTableRows(page);
      const showDropdown = showEntriesSelect(page);
      await expect(showDropdown).toHaveValue('25');
      await showDropdown.selectOption('10');

      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      const rowCount = await tableRows(page).count();
      expect(rowCount).toBeLessThanOrEqual(10);
    });

    test('TC-PAG-02: Navigate between pages with pagination', async ({ page }) => {
      await waitForTableRows(page);
      await showEntriesSelect(page).selectOption('10');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      const nextBtn = page.getByRole('button', { name: /Next page/i });
      const isNextEnabled = await nextBtn.isEnabled().catch(() => false);

      if (isNextEnabled) {
        await nextBtn.click();
        await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
        await expect(page.getByRole('button', { name: /Page 2/i })).toBeVisible();

        await page.getByRole('button', { name: /Previous page/i }).click();
        await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
        await expect(page.getByRole('button', { name: /Page 1/i })).toBeVisible();
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 10 – Column Sorting
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Column Sorting', () => {

    test.beforeEach(async ({ page }) => {
      await gotoSystemMaster(page);
    });

    test('TC-SRT-01: Sort by System Name column ascending then descending', async ({ page }) => {
      await waitForTableRows(page);

      await page.getByRole('button', { name: /System Name/i }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      const firstAsc = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

      await page.getByRole('button', { name: /System Name/i }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      const firstDesc = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

      const rowCount = await tableRows(page).count();
      if (rowCount > 1) {
        expect(firstAsc).not.toBe(firstDesc);
      }
    });

    test('TC-SRT-02: Sort by Status column', async ({ page }) => {
      await waitForTableRows(page);
      await statusFilterSelect(page).selectOption('All');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      await page.getByRole('button', { name: /^Status$/i }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      expect(await tableRows(page).count()).toBeGreaterThan(0);

      await page.getByRole('button', { name: /^Status$/i }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 11 – Inactive Status Management
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Inactive Status Management', () => {

    test.beforeEach(async ({ page }) => {
      await gotoSystemMaster(page);
    });

    test('TC-INA-01: Mark Active system as Inactive and verify filter behavior', async ({ page }) => {
      await waitForTableRows(page);
      const systemName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(systemName.length).toBeGreaterThan(0);

      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update System/i })).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('combobox', { name: /Status \*/i })).toHaveValue('true');

      await page.getByRole('combobox', { name: /Status \*/i }).selectOption('Inactive');
      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /System has been updated successfully!/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add System/i })).toBeVisible({ timeout: 15000 });

      await expect(tableRows(page).filter({ hasText: systemName })).toHaveCount(0, { timeout: 10000 });

      await statusFilterSelect(page).selectOption('Inactive');
      await expect(tableRows(page).filter({ hasText: systemName })).toHaveCount(1, { timeout: 10000 });

      // Restore
      const inactiveRow = tableRows(page).filter({ hasText: systemName });
      await inactiveRow.getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update System/i })).toBeVisible({ timeout: 10000 });
      await page.getByRole('combobox', { name: /Status \*/i }).selectOption('Active');
      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.getByRole('heading', { name: /Add System/i })).toBeVisible({ timeout: 15000 });
    });

    test('TC-INA-02: Re-activate an Inactive system', async ({ page }) => {
      await statusFilterSelect(page).selectOption('Inactive');
      const inactiveCount = await tableRows(page).count().catch(() => 0);

      if (inactiveCount > 0) {
        await waitForTableRows(page);
        const systemName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

        await clickEditOnRow(page, 0);
        await expect(page.getByRole('heading', { name: /Update System/i })).toBeVisible({ timeout: 10000 });
        await expect(page.getByRole('combobox', { name: /Status \*/i })).toHaveValue('false');

        await page.getByRole('combobox', { name: /Status \*/i }).selectOption('Active');
        await page.getByRole('button', { name: /Update/i }).click();
        await expect(page.locator('[role="alert"]').filter({ hasText: /System has been updated successfully!/i })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole('heading', { name: /Add System/i })).toBeVisible({ timeout: 15000 });

        await statusFilterSelect(page).selectOption('Active');
        await expect(tableRows(page).filter({ hasText: systemName })).toHaveCount(1, { timeout: 10000 });
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 12 – Navigation and Access
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Navigation and Access', () => {

    test('TC-NAV-01: Direct URL without auth redirects to login', async ({ browser }) => {
      const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
      const page = await context.newPage();

      await page.goto('https://stage.elevatorplus.net/master/system-master', { timeout: 60000 });
      await expect(page).toHaveURL(/\/login/, { timeout: 30000 });
      await expect(page.getByRole('heading', { name: /Add System/i })).not.toBeVisible();

      await context.close();
    });

    test('TC-NAV-02: Access System Master via Other Masters tab navigation', async ({ page }) => {
      await registerPopupHandler(page);
      await page.goto('/dashboard', { timeout: 60000 });
      await dismissNotificationPopup(page);

      await page.getByRole('link', { name: /Other Masters/i }).click();
      await page.waitForURL(/\/master\/other-master/, { timeout: 30000 });

      await page.getByText('System Master').click();
      await page.waitForURL(/\/master\/system-master/, { timeout: 30000 }).catch(() => {});
      await expect(page.getByRole('heading', { name: /Add System/i })).toBeVisible({ timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
      await expect(tableRows(page)).not.toHaveCount(0, { timeout: 30000 });
    });

  });

});
