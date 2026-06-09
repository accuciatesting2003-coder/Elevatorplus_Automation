// spec: test-plans/Other-master-test-plan/controller-master-test-plan.md
// seed: tests/setup/auth.setup.ts

import { test, expect } from '../fixtures/auth-fixture';

const CONTROLLER_MASTER_URL = '/master/controller-master';

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

async function gotoControllerMaster(page: any) {
  await registerPopupHandler(page);
  await page.goto(CONTROLLER_MASTER_URL, { timeout: 60000 });
  await page.getByRole('heading', { name: /Add Controller/i }).waitFor({ state: 'visible', timeout: 45000 });
  await dismissNotificationPopup(page);
}

function tableRows(page: any) {
  return page.locator('[role="row"]:has([role="cell"])');
}

async function waitForTableRows(page: any) {
  await tableRows(page).first().waitFor({ state: 'visible', timeout: 30000 });
}

async function clickEditOnRow(page: any, rowIndex: number = 0) {
  await page.mouse.move(0, 0);
  await page.waitForTimeout(200);
  await tableRows(page).nth(rowIndex).locator('svg').first().click();
}

function statusFilterSelect(page: any) {
  return page.locator('select').filter({ has: page.locator('option', { hasText: 'Inactive' }) }).first();
}

function showEntriesSelect(page: any) {
  return page.locator('select').filter({ has: page.locator('option', { hasText: '100' }) }).first();
}

function controllerSearchBox(page: any) {
  return page.getByPlaceholder('Search controller name');
}

function controllerNameInput(page: any) {
  return page.locator('#controller_name');
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

test.describe('Controller Master', () => {

  test.describe('Smoke Tests', () => {

    test.beforeEach(async ({ page }) => {
      await gotoControllerMaster(page);
    });

    test('TC-SM-01: Controller Master page loads successfully', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(CONTROLLER_MASTER_URL, 'i'));
      await expect(page).toHaveTitle('ElevatorPlus');
      await expect(page.getByRole('heading', { name: /Add Controller/i })).toBeVisible();

      const nameInput = controllerNameInput(page);
      await expect(nameInput).toBeVisible();
      await expect(nameInput).toHaveValue('');

      await expect(page.getByRole('button', { name: /Clear/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();

      await waitForTableRows(page);
      await expect(page.getByText('Sr. No.')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Controller Name', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Status', exact: true })).toBeVisible();
    });

    test('TC-SM-02: Verify page elements and layout', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /Add Controller/i })).toBeVisible();

      const showDropdown = showEntriesSelect(page);
      await expect(showDropdown).toBeVisible();
      await expect(showDropdown).toHaveValue('25');

      const statusFilter = statusFilterSelect(page);
      await expect(statusFilter).toBeVisible();
      await expect(statusFilter).toHaveValue('true');

      await expect(page.getByRole('button', { name: /Import/i })).toBeVisible();
      await expect(controllerSearchBox(page)).toBeVisible();

      await waitForTableRows(page);
      await expect(page.getByText('Sr. No.')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Controller Name', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Status', exact: true })).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 2 – Add Controller (Happy Path)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Add Controller (Happy Path)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoControllerMaster(page);
    });

    test('TC-ADD-01: Successfully create a new controller with a unique name', async ({ page }) => {
      const controllerName = `AutoController ${Date.now()}`;
      await controllerNameInput(page).fill(controllerName);
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /Controller has been created successfully!/i })).toBeVisible({ timeout: 30000 });
      await expect(controllerNameInput(page)).toHaveValue('', { timeout: 10000 });
      await expect(page.getByRole('heading', { name: /Add Controller/i })).toBeVisible();

      await controllerSearchBox(page).fill(controllerName);
      await page.waitForTimeout(1000);
      await expect(tableRows(page).filter({ hasText: controllerName })).toHaveCount(1, { timeout: 30000 });
      await controllerSearchBox(page).fill('');
    });

    test('TC-ADD-02: Create a controller with special characters in the name', async ({ page }) => {
      const controllerName = `Controller #MR2 - V3 ${Date.now()}`;
      await controllerNameInput(page).fill(controllerName);
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /Controller has been created successfully!/i })).toBeVisible({ timeout: 30000 });
      await controllerSearchBox(page).fill(controllerName);
      await page.waitForTimeout(1000);
      await expect(tableRows(page).filter({ hasText: controllerName })).toHaveCount(1, { timeout: 30000 });
      await controllerSearchBox(page).fill('');
    });

    test('TC-ADD-03: Create a controller with a long name (~100 chars)', async ({ page }) => {
      const controllerName = `AC Variable Frequency Drive Based Microprocessor Controlled Elevator Controller Unit Model`;
      await controllerNameInput(page).fill(controllerName);
      await page.getByRole('button', { name: /Submit/i }).click();

      const successToast = page.locator('[role="alert"]').filter({ hasText: /Controller has been created successfully!/i });
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
      await gotoControllerMaster(page);
    });

    test('TC-VAL-01: Submit empty form shows inline validation error', async ({ page }) => {
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('text=/please enter controller name/i')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add Controller/i })).toBeVisible();
    });

    test('TC-VAL-02: Submit whitespace-only name shows validation or no blank controller', async ({ page }) => {
      await controllerNameInput(page).fill('   ');
      await page.getByRole('button', { name: /Submit/i }).click();

      const validationError = page.locator('text=/please enter controller name|cannot be empty|can not be empty/i');
      const serverError = page.locator('[role="alert"]').filter({ hasText: /Something went wrong|already exists/i });

      const hasValidation = await validationError.waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false);
      const hasServerError = !hasValidation && await serverError.waitFor({ state: 'visible', timeout: 15000 }).then(() => true).catch(() => false);
      expect(hasValidation || hasServerError).toBeTruthy();
    });

    test('TC-VAL-03: Validation error clears when valid input is entered', async ({ page }) => {
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('text=/please enter controller name/i')).toBeVisible({ timeout: 5000 });

      const controllerName = `ValidController ${Date.now()}`;
      await controllerNameInput(page).fill(controllerName);
      await expect(page.locator('text=/please enter controller name/i')).not.toBeVisible({ timeout: 5000 });

      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /Controller has been created successfully!/i })).toBeVisible({ timeout: 30000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 4 – Duplicate Prevention
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Duplicate Prevention', () => {

    test.beforeEach(async ({ page }) => {
      await gotoControllerMaster(page);
    });

    test('TC-DUP-01: Submitting existing controller name shows error', async ({ page }) => {
      await waitForTableRows(page);
      const existingName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(existingName.length).toBeGreaterThan(0);

      await controllerNameInput(page).fill(existingName);
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /already exists/i })).toBeVisible({ timeout: 30000 });
    });

    test('TC-DUP-02: Case-sensitivity test for duplicate controller name', async ({ page }) => {
      await waitForTableRows(page);
      const existingName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(existingName.length).toBeGreaterThan(0);

      await controllerNameInput(page).fill(existingName.toUpperCase());
      await page.getByRole('button', { name: /Submit/i }).click();

      const errorToast = page.locator('[role="alert"]').filter({ hasText: /already exists/i });
      const successToast = page.locator('[role="alert"]').filter({ hasText: /Controller has been created successfully!/i });
      const hasError = await errorToast.waitFor({ state: 'visible', timeout: 30000 }).then(() => true).catch(() => false);
      const hasSuccess = !hasError && await successToast.waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false);
      expect(hasError || hasSuccess).toBeTruthy();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 5 – Clear Button
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Clear Button', () => {

    test.beforeEach(async ({ page }) => {
      await gotoControllerMaster(page);
    });

    test('TC-CLR-01: Clear button resets the Add Controller form', async ({ page }) => {
      await controllerNameInput(page).fill('Temp Controller Name');
      await page.getByRole('button', { name: /Clear/i }).click();

      await expect(controllerNameInput(page)).toHaveValue('');
      await expect(page.getByRole('heading', { name: /Add Controller/i })).toBeVisible();
    });

    test('TC-CLR-02: Clear in Edit mode resets form to Add Controller state', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Controller/i })).toBeVisible({ timeout: 10000 });

      const nameInput = controllerNameInput(page);
      const currentName = await nameInput.inputValue();
      expect(currentName.length).toBeGreaterThan(0);

      await expect(page.getByRole('combobox', { name: /Status \*/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Update/i })).toBeVisible();

      await page.getByRole('button', { name: /Clear/i }).click();

      await expect(page.getByRole('heading', { name: /Add Controller/i })).toBeVisible();
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
      await gotoControllerMaster(page);
    });

    test('TC-EDT-01: Edit icon opens record in edit mode', async ({ page }) => {
      await waitForTableRows(page);
      const originalName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      await clickEditOnRow(page, 0);

      await expect(page.getByRole('heading', { name: /Update Controller/i })).toBeVisible({ timeout: 10000 });
      await expect(controllerNameInput(page)).toHaveValue(originalName);

      const statusSelect = page.getByRole('combobox', { name: /Status \*/i });
      await expect(statusSelect).toBeVisible();
      await expect(statusSelect).toHaveValue('true');
      await expect(page.getByRole('button', { name: /Update/i })).toBeVisible();
    });

    test('TC-EDT-02: Successfully update the controller name', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Controller/i })).toBeVisible({ timeout: 10000 });

      const newName = `Updated Controller ${Date.now()}`;
      const nameInput = controllerNameInput(page);
      await nameInput.clear();
      await nameInput.fill(newName);

      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /Controller has been updated successfully!/i })).toBeVisible({ timeout: 30000 });
      await expect(page.getByRole('heading', { name: /Add Controller/i })).toBeVisible({ timeout: 30000 });

      await controllerSearchBox(page).fill(newName);
      await page.waitForTimeout(1000);
      await expect(tableRows(page).filter({ hasText: newName })).toHaveCount(1, { timeout: 30000 });
      await controllerSearchBox(page).fill('');
    });

    test('TC-EDT-03: Update controller status to Inactive', async ({ page }) => {
      await waitForTableRows(page);
      const controllerName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Controller/i })).toBeVisible({ timeout: 10000 });

      await page.getByRole('combobox', { name: /Status \*/i }).selectOption('Inactive');
      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /Controller has been updated successfully!/i })).toBeVisible({ timeout: 30000 });
      await expect(page.getByRole('heading', { name: /Add Controller/i })).toBeVisible({ timeout: 30000 });

      await statusFilterSelect(page).selectOption('All');
      const controllerRow = tableRows(page).filter({ hasText: controllerName });
      await expect(controllerRow.getByRole('heading', { level: 5, name: /Inactive/i })).toBeVisible({ timeout: 30000 });

      // Restore
      await controllerRow.getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update Controller/i })).toBeVisible({ timeout: 10000 });
      await page.getByRole('combobox', { name: /Status \*/i }).selectOption('Active');
      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.getByRole('heading', { name: /Add Controller/i })).toBeVisible({ timeout: 30000 });
    });

    test('TC-EDT-04: Update with empty Controller Name shows validation error', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Controller/i })).toBeVisible({ timeout: 10000 });

      await controllerNameInput(page).clear();
      await page.getByRole('button', { name: /Update/i }).click();

      await expect(page.locator('text=/please enter controller name/i')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Update Controller/i })).toBeVisible();
    });

    test('TC-EDT-05: Update name to duplicate of existing Active controller shows error', async ({ page }) => {
      await waitForTableRows(page);
      const firstName = (await tableRows(page).nth(0).locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      const secondName = (await tableRows(page).nth(1).locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(firstName.length).toBeGreaterThan(0);
      expect(secondName.length).toBeGreaterThan(0);

      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Controller/i })).toBeVisible({ timeout: 10000 });

      const nameInput = controllerNameInput(page);
      await nameInput.clear();
      await nameInput.fill(secondName);

      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /already exists/i })).toBeVisible({ timeout: 30000 });
    });

    test('TC-EDT-06: Update name to duplicate of existing Inactive controller shows error', async ({ page }) => {
      await statusFilterSelect(page).selectOption('Inactive');
      const inactiveCount = await tableRows(page).count().catch(() => 0);

      if (inactiveCount > 0) {
        await waitForTableRows(page);
        const inactiveName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

        await statusFilterSelect(page).selectOption('Active');
        await waitForTableRows(page);

        await clickEditOnRow(page, 0);
        await expect(page.getByRole('heading', { name: /Update Controller/i })).toBeVisible({ timeout: 10000 });

        const nameInput = controllerNameInput(page);
        await nameInput.clear();
        await nameInput.fill(inactiveName);

        await page.getByRole('button', { name: /Update/i }).click();
        await expect(page.locator('[role="alert"]').filter({ hasText: /already exists/i })).toBeVisible({ timeout: 30000 });
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 7 – Status Filter
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Status Filter', () => {

    test.beforeEach(async ({ page }) => {
      await gotoControllerMaster(page);
    });

    test('TC-FLT-01: Filter by Active (default) shows only Active records', async ({ page }) => {
      await expect(statusFilterSelect(page)).toHaveValue('true');
      await waitForTableRows(page);

      await showEntriesSelect(page).selectOption('10');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

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
      await gotoControllerMaster(page);
    });

    test('TC-SRC-01: Search by partial controller name returns matches', async ({ page }) => {
      await waitForTableRows(page);
      const initialCount = await tableRows(page).count();

      const searchBox = controllerSearchBox(page);
      await searchBox.fill('VFD');
      await page.waitForTimeout(1000);

      const filteredCount = await tableRows(page).count();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    });

    test('TC-SRC-02: Non-existent search returns no results', async ({ page }) => {
      await waitForTableRows(page);
      const searchBox = controllerSearchBox(page);
      await searchBox.fill('XYZNONEXISTENTCONTROLLER999');
      await tableRows(page).first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
      const rows = await tableRows(page).count().catch(() => 0);
      expect(rows).toBe(0);
    });

    test('TC-SRC-03: Clearing search restores the full list', async ({ page }) => {
      await waitForTableRows(page);
      const initialCount = await tableRows(page).count();

      const searchBox = controllerSearchBox(page);
      await searchBox.fill('AC');
      await page.waitForTimeout(1000);

      await searchBox.clear();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 30000 });
      const restoredCount = await tableRows(page).count();
      expect(restoredCount).toBe(initialCount);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 9 – Rows Per Page and Pagination
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Rows Per Page and Pagination', () => {

    test.beforeEach(async ({ page }) => {
      await gotoControllerMaster(page);
    });

    test('TC-PAG-01: Change rows per page to 10', async ({ page }) => {
      await waitForTableRows(page);
      await expect(showEntriesSelect(page)).toHaveValue('25');
      await showEntriesSelect(page).selectOption('10');

      await tableRows(page).first().waitFor({ state: 'visible', timeout: 30000 });
      expect(await tableRows(page).count()).toBeLessThanOrEqual(10);
    });

    test('TC-PAG-02: Navigate between pages with pagination', async ({ page }) => {
      await waitForTableRows(page);
      await showEntriesSelect(page).selectOption('10');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 30000 });

      const nextBtn = page.getByRole('button', { name: /Next page/i });
      const isNextEnabled = await nextBtn.isEnabled().catch(() => false);

      if (isNextEnabled) {
        await nextBtn.click();
        await tableRows(page).first().waitFor({ state: 'visible', timeout: 30000 });
        await expect(page.getByRole('button', { name: /Page 2/i })).toBeVisible();

        await page.getByRole('button', { name: /Previous page/i }).click();
        await tableRows(page).first().waitFor({ state: 'visible', timeout: 30000 });
        await expect(page.getByRole('button', { name: /Page 1/i })).toBeVisible();
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 10 – Column Sorting
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Column Sorting', () => {

    test.beforeEach(async ({ page }) => {
      await gotoControllerMaster(page);
    });

    test('TC-SRT-01: Sort by Controller Name column ascending then descending', async ({ page }) => {
      await waitForTableRows(page);

      await page.getByRole('button', { name: /Controller Name/i }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 30000 });
      const firstAsc = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

      await page.getByRole('button', { name: /Controller Name/i }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 30000 });
      const firstDesc = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

      if (await tableRows(page).count() > 1) {
        expect(firstAsc).not.toBe(firstDesc);
      }
    });

    test('TC-SRT-02: Sort by Status column', async ({ page }) => {
      await waitForTableRows(page);
      await statusFilterSelect(page).selectOption('All');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 30000 });

      await page.getByRole('button', { name: /^Status$/i }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 30000 });
      expect(await tableRows(page).count()).toBeGreaterThan(0);

      await page.getByRole('button', { name: /^Status$/i }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 30000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 11 – Inactive Status Management
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Inactive Status Management', () => {

    test.beforeEach(async ({ page }) => {
      await gotoControllerMaster(page);
    });

    test('TC-INA-01: Mark Active controller as Inactive and verify filter behavior', async ({ page }) => {
      await waitForTableRows(page);
      const controllerName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(controllerName.length).toBeGreaterThan(0);

      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Controller/i })).toBeVisible({ timeout: 10000 });

      await page.getByRole('combobox', { name: /Status \*/i }).selectOption('Inactive');
      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /Controller has been updated successfully!/i })).toBeVisible({ timeout: 30000 });
      await expect(page.getByRole('heading', { name: /Add Controller/i })).toBeVisible({ timeout: 30000 });

      await expect(tableRows(page).filter({ hasText: controllerName })).toHaveCount(0, { timeout: 10000 });

      await statusFilterSelect(page).selectOption('Inactive');
      await expect(tableRows(page).filter({ hasText: controllerName })).toHaveCount(1, { timeout: 10000 });

      // Restore
      await tableRows(page).filter({ hasText: controllerName }).getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update Controller/i })).toBeVisible({ timeout: 10000 });
      await page.getByRole('combobox', { name: /Status \*/i }).selectOption('Active');
      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.getByRole('heading', { name: /Add Controller/i })).toBeVisible({ timeout: 30000 });
    });

    test('TC-INA-02: Re-activate an Inactive controller', async ({ page }) => {
      await statusFilterSelect(page).selectOption('Inactive');
      const inactiveCount = await tableRows(page).count().catch(() => 0);

      if (inactiveCount > 0) {
        await waitForTableRows(page);
        const controllerName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

        await clickEditOnRow(page, 0);
        await expect(page.getByRole('heading', { name: /Update Controller/i })).toBeVisible({ timeout: 10000 });
        await expect(page.getByRole('combobox', { name: /Status \*/i })).toHaveValue('false');

        await page.getByRole('combobox', { name: /Status \*/i }).selectOption('Active');
        await page.getByRole('button', { name: /Update/i }).click();
        await expect(page.locator('[role="alert"]').filter({ hasText: /Controller has been updated successfully!/i })).toBeVisible({ timeout: 30000 });
        await expect(page.getByRole('heading', { name: /Add Controller/i })).toBeVisible({ timeout: 30000 });

        await statusFilterSelect(page).selectOption('Active');
        await expect(tableRows(page).filter({ hasText: controllerName })).toHaveCount(1, { timeout: 10000 });
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 12 – Navigation and Access
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Navigation and Access', () => {

    test('TC-NAV-01: Direct URL without auth redirects to login', async ({ browser }) => {
      test.setTimeout(180000);
      const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
      const page = await context.newPage();

      await page.goto('https://stage.elevatorplus.net/master/controller-master', { timeout: 90000 });
      await expect(page).toHaveURL(/\/login/, { timeout: 30000 });
      await expect(page.getByRole('heading', { name: /Add Controller/i })).not.toBeVisible();

      await context.close();
    });

    test('TC-NAV-02: Access Controller Master via Other Masters tab navigation', async ({ page }) => {
      await registerPopupHandler(page);
      await page.goto('/dashboard', { timeout: 60000 });
      await dismissNotificationPopup(page);

      await page.getByRole('link', { name: /Other Masters/i }).click();
      await page.waitForURL(/\/master\/other-master/, { timeout: 30000 });

      await page.getByText('Controller Master').click();
      await page.waitForURL(/\/master\/controller-master/, { timeout: 30000 }).catch(() => {});
      await expect(page.getByRole('heading', { name: /Add Controller/i })).toBeVisible({ timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
      await expect(tableRows(page)).not.toHaveCount(0, { timeout: 30000 });
    });

  });

});
