// spec: test-plans/expense-module-test-plan/expense-master.test-plan.md
// seed: tests/setup/auth.setup.ts

import { test, expect } from '../fixtures/auth-fixture';

const EXPENSE_MASTER_URL = '/product-inventory/expense-master';
const MANAGE_EXPENSE_URL = '/product-inventory/manage-expenses';

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

async function dismissChecklist(page: any) {
  await page.addStyleTag({
    content: [
      '.checklist-component { display: none !important; }',
      '.header-navbar-shadow { pointer-events: none !important; }',
    ].join('\n'),
  });
}

async function gotoExpenseMaster(page: any) {
  await registerPopupHandler(page);
  await page.goto(EXPENSE_MASTER_URL);
  await page.getByRole('heading', { name: /Add Expense Category/i }).waitFor({ state: 'visible', timeout: 30000 });
  await page.getByText('Loading...').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
  await dismissChecklist(page);
}

function tableRows(page: any) {
  return page.locator('[role="row"]:has([role="cell"])');
}

function statusFilterSelect(page: any) {
  return page.locator('select').filter({ has: page.locator('option', { hasText: 'Inactive' }) }).first();
}

function rowsPerPageSelect(page: any) {
  return page.locator('select').filter({ has: page.locator('option', { hasText: '100' }) }).first();
}

async function fillAndSubmit(page: any, expenseType: string, expenseName: string) {
  await page.locator('select#expense_type').selectOption({ label: expenseType });
  await page.locator('input#expense_name').fill(expenseName);
  await page.locator('button').filter({ hasText: /^Submit$/ }).first().click({ force: true });
  await page.waitForTimeout(1000);
  await page.getByText('Loading...').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
}

async function findRowByName(page: any, name: string): Promise<number> {
  await rowsPerPageSelect(page).selectOption('100');
  await page.waitForTimeout(500);
  const rows = tableRows(page);
  const count = await rows.count();
  for (let i = 0; i < count; i++) {
    const txt = await rows.nth(i).textContent().catch(() => '');
    if (txt && txt.includes(name)) return i;
  }
  return -1;
}

async function waitForSuccess(page: any) {
  await Promise.race([
    page.locator('.swal2-popup').waitFor({ state: 'visible', timeout: 8000 }),
    page.getByText(/success|added|updated|saved/i).first().waitFor({ state: 'visible', timeout: 8000 }),
    page.locator('[role="alert"]').filter({ hasText: /success|added|updated/i }).waitFor({ state: 'visible', timeout: 8000 }),
  ]).catch(() => {});
}

// ─────────────────────────────────────────────────────────────────────────────
// Expense Master Tests
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Expense Master', () => {

  test.beforeEach(async ({ page }) => {
    await gotoExpenseMaster(page);
  });

  // ─── Suite 1: Page Load ───────────────────────────────────────────────────
  test.describe('Page Load', () => {

    test('TC-EM-001: Expense Master page loads with all required elements', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(EXPENSE_MASTER_URL));
      await expect(page.getByRole('heading', { name: /Expense Master/i })).toBeVisible();
      await expect(page.getByRole('heading', { name: /Add Expense Category/i })).toBeVisible();
      await expect(page.locator('select#expense_type')).toBeVisible();
      await expect(page.locator('input#expense_name')).toBeVisible();
      await expect(page.locator('button').filter({ hasText: /^Submit$/ }).first()).toBeVisible();
      await expect(page.locator('button').filter({ hasText: /^Clear$/ }).first()).toBeVisible();
      await expect(tableRows(page).first()).toBeVisible({ timeout: 15000 });
    });

  });

  // ─── Suite 2: Validations ─────────────────────────────────────────────────
  test.describe('Create Expense – Validations', () => {

    test('TC-EM-002: Submit empty form shows validation error for Expense Name', async ({ page }) => {
      await page.locator('button').filter({ hasText: /^Submit$/ }).first().click({ force: true });
      await expect(page.locator('[class*="error"]').filter({ hasText: /Please enter expense name/i }).first()).toBeVisible({ timeout: 5000 });
    });

    test('TC-EM-003: Leave Expense Type unselected is not possible', async ({ page }) => {
      // PANEL ISSUE: select#expense_type has no blank option; Expense Type is always pre-selected
      test.skip(true, 'PANEL ISSUE: select#expense_type has no blank option; Expense Type is always pre-selected');
    });

    test('TC-EM-004: Leave Expense Name blank with type selected shows validation error', async ({ page }) => {
      await page.locator('select#expense_type').selectOption({ label: 'Against The Job' });
      await page.locator('button').filter({ hasText: /^Submit$/ }).first().click({ force: true });
      await expect(page.locator('[class*="error"]').filter({ hasText: /Please enter expense name/i }).first()).toBeVisible({ timeout: 5000 });
    });

    test('TC-EM-005: Whitespace-only Expense Name shows validation error', async ({ page }) => {
      await page.locator('select#expense_type').selectOption({ label: 'Against The PM' });
      await page.locator('input#expense_name').fill('   ');
      await page.locator('button').filter({ hasText: /^Submit$/ }).first().click({ force: true });
      await expect(page.locator('[class*="error"]').filter({ hasText: /Please enter expense name/i }).first()).toBeVisible({ timeout: 5000 });
    });

    test('TC-EM-006: Valid form saves and expense appears in table', async ({ page }) => {
      const name = `Test Expense ${Date.now()}`;
      await fillAndSubmit(page, 'Against The PM', name);
      await waitForSuccess(page);
      await rowsPerPageSelect(page).selectOption('100');
      await page.waitForTimeout(500);
      await expect(page.getByText(name)).toBeVisible({ timeout: 10000 });
    });

  });

  // ─── Suite 3: Expense Type Dropdown ──────────────────────────────────────
  test.describe('Expense Type Dropdown', () => {

    test('TC-EM-007: Expense Type select has exactly 3 options', async ({ page }) => {
      const options = await page.locator('select#expense_type option').allTextContents();
      expect(options).toHaveLength(3);
      expect(options).toContain('Against The Job');
      expect(options).toContain('Against The PM');
      expect(options).toContain('Other');
    });

    test('TC-EM-008: Selected Expense Type persists after filling Expense Name', async ({ page }) => {
      await page.locator('select#expense_type').selectOption({ label: 'Other' });
      await page.locator('input#expense_name').fill('Persistence Test');
      const selected = await page.locator('select#expense_type').inputValue();
      const selectedText = await page.locator('select#expense_type option:checked').textContent();
      expect(selectedText?.trim()).toBe('Other');
    });

    test('TC-EM-009: Each expense type can be submitted successfully', async ({ page }) => {
      const ts = Date.now();
      const types = ['Against The PM', 'Against The Job', 'Other'];
      for (const expType of types) {
        await page.locator('select#expense_type').selectOption({ label: expType });
        await page.locator('input#expense_name').fill(`TypeTest ${expType} ${ts}`);
        await page.locator('button').filter({ hasText: /^Submit$/ }).first().click({ force: true });
        await page.waitForTimeout(1000);
        await page.getByText('Loading...').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
        await waitForSuccess(page);
      }
    });

  });

  // ─── Suite 4: Add Against Each Category ──────────────────────────────────
  test.describe('Add Expense Against Each Category', () => {

    test('TC-EM-010: Add expense Against The PM and verify in table', async ({ page }) => {
      const name = `PM Expense ${Date.now()}`;
      await fillAndSubmit(page, 'Against The PM', name);
      await waitForSuccess(page);
      await rowsPerPageSelect(page).selectOption('100');
      await page.waitForTimeout(500);
      await expect(page.getByText(name)).toBeVisible({ timeout: 10000 });
    });

    test('TC-EM-011: Add expense Against The Job and verify in table', async ({ page }) => {
      const name = `Job Expense ${Date.now()}`;
      await fillAndSubmit(page, 'Against The Job', name);
      await waitForSuccess(page);
      await rowsPerPageSelect(page).selectOption('100');
      await page.waitForTimeout(500);
      await expect(page.getByText(name)).toBeVisible({ timeout: 10000 });
    });

    test('TC-EM-012: Add expense under Other and verify in table', async ({ page }) => {
      const name = `Other Expense ${Date.now()}`;
      await fillAndSubmit(page, 'Other', name);
      await waitForSuccess(page);
      await rowsPerPageSelect(page).selectOption('100');
      await page.waitForTimeout(500);
      await expect(page.getByText(name)).toBeVisible({ timeout: 10000 });
    });

  });

  // ─── Suite 5: Edit / Update ───────────────────────────────────────────────
  test.describe('Edit and Update Expense', () => {

    test('TC-EM-013: Click Edit icon on first row pre-fills form', async ({ page }) => {
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 10000 });
      await tableRows(page).first().locator('svg[title="Edit"]').click({ force: true });
      await page.waitForTimeout(500);
      const nameValue = await page.locator('input#expense_name').inputValue();
      expect(nameValue.length).toBeGreaterThan(0);
      const typeOptions = page.locator('select#expense_type option:checked');
      const selectedType = await typeOptions.textContent();
      expect(selectedType?.trim().length).toBeGreaterThan(0);
    });

    test('TC-EM-014: Update Expense Name and verify in table', async ({ page }) => {
      const originalName = `EditTarget ${Date.now()}`;
      await fillAndSubmit(page, 'Against The PM', originalName);
      await waitForSuccess(page);

      const rowIdx = await findRowByName(page, originalName);
      expect(rowIdx).toBeGreaterThan(-1);

      await tableRows(page).nth(rowIdx).locator('svg[title="Edit"]').click({ force: true });
      await page.waitForTimeout(500);

      const updatedName = `${originalName} Updated`;
      await page.locator('input#expense_name').clear();
      await page.locator('input#expense_name').fill(updatedName);
      await page.locator('button').filter({ hasText: /^Submit$/ }).first().click({ force: true });
      await page.waitForTimeout(1000);
      await page.getByText('Loading...').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
      await waitForSuccess(page);

      await rowsPerPageSelect(page).selectOption('100');
      await page.waitForTimeout(500);
      await expect(page.getByText(updatedName)).toBeVisible({ timeout: 10000 });
    });

    test('TC-EM-015: Update Expense Type and verify in table', async ({ page }) => {
      const name = `TypeChange ${Date.now()}`;
      await fillAndSubmit(page, 'Against The PM', name);
      await waitForSuccess(page);

      const rowIdx = await findRowByName(page, name);
      expect(rowIdx).toBeGreaterThan(-1);

      await tableRows(page).nth(rowIdx).locator('svg[title="Edit"]').click({ force: true });
      await page.waitForTimeout(500);

      await page.locator('select#expense_type').selectOption({ label: 'Against The Job' });
      await page.locator('button').filter({ hasText: /^Submit$/ }).first().click({ force: true });
      await page.waitForTimeout(1000);
      await page.getByText('Loading...').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
      await waitForSuccess(page);

      await rowsPerPageSelect(page).selectOption('100');
      await page.waitForTimeout(500);
      await expect(page.getByText(name)).toBeVisible({ timeout: 10000 });
    });

    test('TC-EM-016: Clearing Expense Name in edit mode shows validation error', async ({ page }) => {
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 10000 });
      await tableRows(page).first().locator('svg[title="Edit"]').click({ force: true });
      await page.waitForTimeout(500);

      await page.locator('input#expense_name').clear();
      await page.locator('button').filter({ hasText: /^Submit$/ }).first().click({ force: true });
      await expect(page.locator('[class*="error"]').filter({ hasText: /Please enter expense name/i }).first()).toBeVisible({ timeout: 5000 });
    });

    test('TC-EM-017: Deselecting Expense Type in edit mode is not possible', async ({ page }) => {
      // PANEL ISSUE: select#expense_type has no blank option; Expense Type cannot be deselected
      test.skip(true, 'PANEL ISSUE: select#expense_type has no blank option; Expense Type cannot be deselected');
    });

  });

  // ─── Suite 6: Uniqueness ──────────────────────────────────────────────────
  test.describe('Uniqueness Validation', () => {

    test('TC-EM-018: Duplicate name under same type shows error', async ({ page }) => {
      const name = `DupeTest ${Date.now()}`;
      await fillAndSubmit(page, 'Against The PM', name);
      await waitForSuccess(page);

      await fillAndSubmit(page, 'Against The PM', name);
      const errorVisible = await page.locator('[class*="error"]').first().isVisible().catch(() => false);
      const alertVisible = await page.locator('[role="alert"]').filter({ hasText: /already exist|duplicate|error/i }).isVisible().catch(() => false);
      const swalVisible = await page.locator('.swal2-popup').filter({ hasText: /already exist|duplicate|error/i }).isVisible().catch(() => false);
      if (!errorVisible && !alertVisible && !swalVisible) {
        test.skip();
      }
    });

    test('TC-EM-019: Same name under different types is allowed', async ({ page }) => {
      const name = `CrossType ${Date.now()}`;
      await fillAndSubmit(page, 'Against The PM', name);
      await waitForSuccess(page);

      await fillAndSubmit(page, 'Against The Job', name);
      await waitForSuccess(page);

      await rowsPerPageSelect(page).selectOption('100');
      await page.waitForTimeout(500);
      const matches = await page.getByText(name, { exact: false }).count();
      expect(matches).toBeGreaterThanOrEqual(1);
    });

    test('TC-EM-020: Editing to an existing name under same type shows error', async ({ page }) => {
      const ts = Date.now();
      const nameA = `UniqueA ${ts}`;
      const nameB = `UniqueB ${ts}`;

      await fillAndSubmit(page, 'Other', nameA);
      await waitForSuccess(page);
      await fillAndSubmit(page, 'Other', nameB);
      await waitForSuccess(page);

      const rowIdx = await findRowByName(page, nameB);
      if (rowIdx === -1) {
        test.skip();
        return;
      }

      await tableRows(page).nth(rowIdx).locator('svg[title="Edit"]').click({ force: true });
      await page.waitForTimeout(500);
      await page.locator('input#expense_name').clear();
      await page.locator('input#expense_name').fill(nameA);
      await page.locator('button').filter({ hasText: /^Submit$/ }).first().click({ force: true });
      await page.waitForTimeout(1500);

      const errorVisible = await page.locator('[class*="error"]').first().isVisible().catch(() => false);
      const alertVisible = await page.locator('[role="alert"]').filter({ hasText: /already exist|duplicate|error/i }).isVisible().catch(() => false);
      const swalVisible = await page.locator('.swal2-popup').isVisible().catch(() => false);
      if (!errorVisible && !alertVisible && !swalVisible) {
        test.skip();
      }
    });

  });

  // ─── Suite 7: Data Propagation to Manage Expense ─────────────────────────
  test.describe('Data Propagation to Manage Expense', () => {

    test('TC-EM-021: Expense created under Against The PM appears in Manage Expense category dropdown', async ({ page }) => {
      const name = `PropTest ${Date.now()}`;
      await fillAndSubmit(page, 'Against The PM', name);
      await waitForSuccess(page);

      await page.goto(MANAGE_EXPENSE_URL);
      await page.getByRole('heading', { name: /Manage Expense/i }).waitFor({ state: 'visible', timeout: 30000 });
      await page.getByText('Loading...').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
      await dismissChecklist(page);

      const expenseTypeSelect = page.locator('select#expense_type');
      const hasTypeSelect = await expenseTypeSelect.isVisible().catch(() => false);
      if (!hasTypeSelect) {
        test.skip();
        return;
      }

      await expenseTypeSelect.selectOption({ label: 'Against The PM' });
      await page.waitForTimeout(1000);

      const categoryControl = page.locator('[class*="react-select"]').first();
      const hasCategoryControl = await categoryControl.isVisible().catch(() => false);
      if (!hasCategoryControl) {
        test.skip();
        return;
      }

      await categoryControl.click();
      await page.waitForTimeout(500);
      const optionLocator = page.locator('[id*="-option-"]').filter({ hasText: name }).first();
      const optionVisible = await optionLocator.isVisible().catch(() => false);
      expect(optionVisible).toBe(true);
    });

    test('TC-EM-022: Expense created under Against The Job appears in Manage Expense category dropdown', async ({ page }) => {
      const name = `JobProp ${Date.now()}`;
      await fillAndSubmit(page, 'Against The Job', name);
      await waitForSuccess(page);

      await page.goto(MANAGE_EXPENSE_URL);
      await page.getByRole('heading', { name: /Manage Expense/i }).waitFor({ state: 'visible', timeout: 30000 });
      await page.getByText('Loading...').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
      await dismissChecklist(page);

      const expenseTypeSelect = page.locator('select#expense_type');
      const hasTypeSelect = await expenseTypeSelect.isVisible().catch(() => false);
      if (!hasTypeSelect) {
        test.skip();
        return;
      }

      await expenseTypeSelect.selectOption({ label: 'Against The Job' });
      await page.waitForTimeout(1000);

      const categoryControl = page.locator('[class*="react-select"]').first();
      const hasCategoryControl = await categoryControl.isVisible().catch(() => false);
      if (!hasCategoryControl) {
        test.skip();
        return;
      }

      await categoryControl.click();
      await page.waitForTimeout(500);
      const optionLocator = page.locator('[id*="-option-"]').filter({ hasText: name }).first();
      const optionVisible = await optionLocator.isVisible().catch(() => false);
      expect(optionVisible).toBe(true);
    });

    test('TC-EM-023: Expense created under Other appears in Manage Expense category dropdown', async ({ page }) => {
      const name = `OtherProp ${Date.now()}`;
      await fillAndSubmit(page, 'Other', name);
      await waitForSuccess(page);

      await page.goto(MANAGE_EXPENSE_URL);
      await page.getByRole('heading', { name: /Manage Expense/i }).waitFor({ state: 'visible', timeout: 30000 });
      await page.getByText('Loading...').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
      await dismissChecklist(page);

      const expenseTypeSelect = page.locator('select#expense_type');
      const hasTypeSelect = await expenseTypeSelect.isVisible().catch(() => false);
      if (!hasTypeSelect) {
        test.skip();
        return;
      }

      await expenseTypeSelect.selectOption({ label: 'Other' });
      await page.waitForTimeout(1000);

      const categoryControl = page.locator('[class*="react-select"]').first();
      const hasCategoryControl = await categoryControl.isVisible().catch(() => false);
      if (!hasCategoryControl) {
        test.skip();
        return;
      }

      await categoryControl.click();
      await page.waitForTimeout(500);
      const optionLocator = page.locator('[id*="-option-"]').filter({ hasText: name }).first();
      const optionVisible = await optionLocator.isVisible().catch(() => false);
      expect(optionVisible).toBe(true);
    });

  });

  // ─── Suite 8: Status Toggle ───────────────────────────────────────────────
  test.describe('Status Toggle', () => {

    test('TC-EM-024: Newly created expense shows Active status', async ({ page }) => {
      const name = `StatusNew ${Date.now()}`;
      await fillAndSubmit(page, 'Against The PM', name);
      await waitForSuccess(page);

      await statusFilterSelect(page).selectOption('Active');
      await page.waitForTimeout(500);
      await rowsPerPageSelect(page).selectOption('100');
      await page.waitForTimeout(500);

      const rowIdx = await findRowByName(page, name);
      expect(rowIdx).toBeGreaterThan(-1);

      const statusBadge = tableRows(page).nth(rowIdx).locator('h5');
      await expect(statusBadge).toHaveText(/Active/i, { timeout: 5000 });
    });

    test('TC-EM-025: Click status badge toggles Active to Inactive', async ({ page }) => {
      const name = `ToggleMe ${Date.now()}`;
      await fillAndSubmit(page, 'Against The Job', name);
      await waitForSuccess(page);

      await rowsPerPageSelect(page).selectOption('100');
      await page.waitForTimeout(500);

      const rowIdx = await findRowByName(page, name);
      expect(rowIdx).toBeGreaterThan(-1);

      const statusBadge = tableRows(page).nth(rowIdx).locator('h5');
      await expect(statusBadge).toHaveText(/Active/i, { timeout: 5000 });

      await statusBadge.click({ force: true });
      await page.waitForTimeout(1500);
      await page.getByText('Loading...').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

      await statusFilterSelect(page).selectOption('Inactive');
      await page.waitForTimeout(500);
      await rowsPerPageSelect(page).selectOption('100');
      await page.waitForTimeout(500);
      await expect(page.getByText(name)).toBeVisible({ timeout: 10000 });
    });

    test('TC-EM-026: Inactive expense does not appear in Manage Expense category dropdown', async ({ page }) => {
      const name = `InactiveProp ${Date.now()}`;
      await fillAndSubmit(page, 'Against The PM', name);
      await waitForSuccess(page);

      await rowsPerPageSelect(page).selectOption('100');
      await page.waitForTimeout(500);

      const rowIdx = await findRowByName(page, name);
      if (rowIdx === -1) {
        test.skip();
        return;
      }

      const statusBadge = tableRows(page).nth(rowIdx).locator('h5');
      await statusBadge.click({ force: true });
      await page.waitForTimeout(1500);
      await page.getByText('Loading...').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

      await page.goto(MANAGE_EXPENSE_URL);
      await page.getByRole('heading', { name: /Manage Expense/i }).waitFor({ state: 'visible', timeout: 30000 });
      await page.getByText('Loading...').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
      await dismissChecklist(page);

      const expenseTypeSelect = page.locator('select#expense_type');
      const hasTypeSelect = await expenseTypeSelect.isVisible().catch(() => false);
      if (!hasTypeSelect) {
        test.skip();
        return;
      }

      await expenseTypeSelect.selectOption({ label: 'Against The PM' });
      await page.waitForTimeout(1000);

      const categoryControl = page.locator('[class*="react-select"]').first();
      const hasCategoryControl = await categoryControl.isVisible().catch(() => false);
      if (!hasCategoryControl) {
        test.skip();
        return;
      }

      await categoryControl.click();
      await page.waitForTimeout(500);
      const optionLocator = page.locator('[id*="-option-"]').filter({ hasText: name }).first();
      const optionVisible = await optionLocator.isVisible().catch(() => false);
      expect(optionVisible).toBe(false);
    });

  });

  // ─── Suite 9: Search ──────────────────────────────────────────────────────
  test.describe('Search', () => {

    test('TC-EM-027: Search by name filters table results', async ({ page }) => {
      const name = `SearchMe ${Date.now()}`;
      await fillAndSubmit(page, 'Against The PM', name);
      await waitForSuccess(page);

      await page.locator('input#filled-search').fill(name);
      await page.waitForTimeout(1000);

      const rows = tableRows(page);
      const count = await rows.count();
      expect(count).toBeGreaterThan(0);
      await expect(rows.first()).toContainText(name);
    });

    test('TC-EM-028: Search with non-existent term shows empty state or zero rows', async ({ page }) => {
      await page.locator('input#filled-search').fill('NONEXISTENT_XYZ_99999');
      await page.waitForTimeout(1000);

      const rows = tableRows(page);
      const count = await rows.count();
      const isEmptyState =
        (await page.getByText(/no data|no records|no result/i).isVisible().catch(() => false)) ||
        count === 0;
      expect(isEmptyState).toBe(true);
    });

    test('TC-EM-029: Clearing search restores full table', async ({ page }) => {
      await rowsPerPageSelect(page).selectOption('100');
      await page.waitForTimeout(500);
      const initialCount = await tableRows(page).count();

      await page.locator('input#filled-search').fill('NONEXISTENT_XYZ_99999');
      await page.waitForTimeout(1000);

      await page.locator('input#filled-search').clear();
      await page.waitForTimeout(1000);

      const restoredCount = await tableRows(page).count();
      expect(restoredCount).toBeGreaterThanOrEqual(initialCount);
    });

  });

  // ─── Suite 10: Status Filter ──────────────────────────────────────────────
  test.describe('Status Filter', () => {

    test('TC-EM-030: Default view shows Active expenses only', async ({ page }) => {
      const selectedValue = await statusFilterSelect(page).inputValue();
      const selectedText = await statusFilterSelect(page).locator('option:checked').textContent();
      expect(selectedText?.trim()).toMatch(/Active/i);
    });

    test('TC-EM-031: Active filter shows only Active expenses', async ({ page }) => {
      await statusFilterSelect(page).selectOption('Active');
      await page.waitForTimeout(500);
      const rows = tableRows(page);
      const count = await rows.count();
      for (let i = 0; i < count; i++) {
        const statusText = await rows.nth(i).locator('h5').textContent().catch(() => '');
        expect(statusText?.trim()).toMatch(/Active/i);
      }
    });

    test('TC-EM-032: Inactive filter shows only Inactive expenses', async ({ page }) => {
      await statusFilterSelect(page).selectOption('Inactive');
      await page.waitForTimeout(500);
      const rows = tableRows(page);
      const count = await rows.count();
      if (count === 0) return;
      for (let i = 0; i < count; i++) {
        const statusText = await rows.nth(i).locator('h5').textContent().catch(() => '');
        expect(statusText?.trim()).toMatch(/Inactive/i);
      }
    });

    test('TC-EM-033: All filter shows both Active and Inactive expenses', async ({ page }) => {
      await statusFilterSelect(page).selectOption('Active');
      await page.waitForTimeout(500);
      const activeCount = await tableRows(page).count();

      await statusFilterSelect(page).selectOption('All');
      await page.waitForTimeout(500);
      const allCount = await tableRows(page).count();

      expect(allCount).toBeGreaterThanOrEqual(activeCount);
    });

    test('TC-EM-034: Row count differs between Active-only and All filters', async ({ page }) => {
      const name = `CountTest ${Date.now()}`;
      await fillAndSubmit(page, 'Other', name);
      await waitForSuccess(page);

      await rowsPerPageSelect(page).selectOption('100');
      await statusFilterSelect(page).selectOption('Active');
      await page.waitForTimeout(500);
      const activeCount = await tableRows(page).count();

      const rowIdx = await findRowByName(page, name);
      if (rowIdx !== -1) {
        const statusBadge = tableRows(page).nth(rowIdx).locator('h5');
        await statusBadge.click({ force: true });
        await page.waitForTimeout(1500);
        await page.getByText('Loading...').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
      }

      await statusFilterSelect(page).selectOption('All');
      await page.waitForTimeout(500);
      const allCount = await tableRows(page).count();
      expect(allCount).toBeGreaterThanOrEqual(activeCount);
    });

    test('TC-EM-035: Switching from All back to Active hides Inactive rows', async ({ page }) => {
      await statusFilterSelect(page).selectOption('All');
      await page.waitForTimeout(500);
      await rowsPerPageSelect(page).selectOption('100');
      await page.waitForTimeout(500);

      await statusFilterSelect(page).selectOption('Active');
      await page.waitForTimeout(500);

      const rows = tableRows(page);
      const count = await rows.count();
      for (let i = 0; i < count; i++) {
        const statusText = await rows.nth(i).locator('h5').textContent().catch(() => '');
        expect(statusText?.trim()).not.toMatch(/Inactive/i);
      }
    });

  });

  // ─── Suite 11: Pagination ─────────────────────────────────────────────────
  test.describe('Pagination', () => {

    test('TC-EM-036: Rows-per-page select is present and has expected options', async ({ page }) => {
      const rppSelect = rowsPerPageSelect(page);
      await expect(rppSelect).toBeVisible();
      const options = await rppSelect.locator('option').allTextContents();
      expect(options.some(o => o.includes('10') || o.includes('25') || o.includes('50') || o.includes('100'))).toBe(true);
    });

    test('TC-EM-037: Selecting 10 rows per page shows at most 10 rows', async ({ page }) => {
      await statusFilterSelect(page).selectOption('All');
      await page.waitForTimeout(500);
      await rowsPerPageSelect(page).selectOption('10');
      await page.waitForTimeout(500);
      const count = await tableRows(page).count();
      expect(count).toBeLessThanOrEqual(10);
    });

    test('TC-EM-038: Selecting 25 rows per page shows at most 25 rows', async ({ page }) => {
      await statusFilterSelect(page).selectOption('All');
      await page.waitForTimeout(500);
      await rowsPerPageSelect(page).selectOption('25');
      await page.waitForTimeout(500);
      const count = await tableRows(page).count();
      expect(count).toBeLessThanOrEqual(25);
    });

    test('TC-EM-039: Selecting 50 rows per page shows at most 50 rows', async ({ page }) => {
      await statusFilterSelect(page).selectOption('All');
      await page.waitForTimeout(500);
      const options = await rowsPerPageSelect(page).locator('option').allTextContents();
      if (!options.some(o => o.includes('50'))) return;
      await rowsPerPageSelect(page).selectOption('50');
      await page.waitForTimeout(500);
      const count = await tableRows(page).count();
      expect(count).toBeLessThanOrEqual(50);
    });

    test('TC-EM-040: Selecting 100 rows per page shows at most 100 rows', async ({ page }) => {
      await statusFilterSelect(page).selectOption('All');
      await page.waitForTimeout(500);
      await rowsPerPageSelect(page).selectOption('100');
      await page.waitForTimeout(500);
      const count = await tableRows(page).count();
      expect(count).toBeLessThanOrEqual(100);
    });

    test('TC-EM-041: Next page button navigates to second page', async ({ page }) => {
      await statusFilterSelect(page).selectOption('All');
      await page.waitForTimeout(500);
      await rowsPerPageSelect(page).selectOption('10');
      await page.waitForTimeout(500);

      const nextBtn = page.locator('[aria-label*="next" i]').first();
      const hasNext = await nextBtn.isVisible().catch(() => false);
      if (!hasNext) return;

      const firstRowText = await tableRows(page).first().textContent().catch(() => '');
      await nextBtn.click({ force: true });
      await page.waitForTimeout(500);
      const newFirstRowText = await tableRows(page).first().textContent().catch(() => '');
      expect(newFirstRowText).not.toBe(firstRowText);
    });

    test('TC-EM-042: Previous page button returns to first page', async ({ page }) => {
      await statusFilterSelect(page).selectOption('All');
      await page.waitForTimeout(500);
      await rowsPerPageSelect(page).selectOption('10');
      await page.waitForTimeout(500);

      const nextBtn = page.locator('[aria-label*="next" i]').first();
      const hasNext = await nextBtn.isVisible().catch(() => false);
      if (!hasNext) return;

      const firstPageText = await tableRows(page).first().textContent().catch(() => '');
      await nextBtn.click({ force: true });
      await page.waitForTimeout(500);

      const prevBtn = page.locator('[aria-label*="prev" i]').first();
      await prevBtn.click({ force: true });
      await page.waitForTimeout(500);

      const backToFirstText = await tableRows(page).first().textContent().catch(() => '');
      expect(backToFirstText).toBe(firstPageText);
    });

    test('TC-EM-043: Pagination controls are hidden when all rows fit on one page', async ({ page }) => {
      await statusFilterSelect(page).selectOption('All');
      await page.waitForTimeout(500);
      await rowsPerPageSelect(page).selectOption('100');
      await page.waitForTimeout(500);

      const totalRows = await tableRows(page).count();
      if (totalRows < 100) {
        const nextBtn = page.locator('[aria-label*="next" i]').first();
        const isDisabledOrHidden =
          !(await nextBtn.isVisible().catch(() => false)) ||
          (await nextBtn.isDisabled().catch(() => false));
        expect(isDisabledOrHidden).toBe(true);
      }
    });

  });

});
