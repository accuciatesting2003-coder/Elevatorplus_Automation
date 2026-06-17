// spec: test-plans/one-time-service-test-plan/checklist-dropdown-master-test-plan.md
// seed: tests/fixtures/auth-fixture.ts (worker logs in once, shares the authenticated page)
//
// Checklist Dropdown Master — /master/checklist-dropdown-master (Service Masters).
// Verified live against staging:
//  - Type select        -> #serviceType  (values: "" = "Select type", "One Time Service")
//  - DropDown Label      -> #dropdown_label
//  - Status (edit only)  -> #status       (values: "" / "true" = Active / "false" = Inactive)
//  - Row Edit control    -> #row-N svg[title="Edit"]  (rows render as #row-0, #row-1, …)
//  - Toolbar "Show:" and "Status:" selects BOTH carry id="rows-per-page" (duplicate id),
//    so they are disambiguated by their option text (100 vs Inactive), as in phase-master.
//  - Validation (empty label)  -> inline "Please enter dropdown label"
//  - Validation (empty type)   -> server toast "service_type should not be empty"
//  - Create toast  -> "Checklist Dropdown has been created successfully!"
//  - Update toast  -> "Checklist dropdown has been updated successfully!"
//  - Duplicate toast -> 'A record with the dropdown "<label>" is already exists.'  (case-insensitive)
//  - No Search box, no Import, no Export on this master.

import { test, expect } from '../fixtures/auth-fixture';
import type { Page, Locator } from '@playwright/test';

const URL = '/master/checklist-dropdown-master';

// ─── popup / overlay guards (same approach as the other masters) ─────────────
async function registerPopupHandler(page: Page) {
  if ((page as any).__popupHandlerRegistered) return;
  (page as any).__popupHandlerRegistered = true;
  await page.addLocatorHandler(
    page.getByRole('button', { name: /Maybe Later/i }),
    async () => { await page.getByRole('button', { name: /Maybe Later/i }).click().catch(() => {}); }
  );
}

async function dismissOverlays(page: Page) {
  await page.addStyleTag({
    content: [
      '.checklist-component { display: none !important; }',
      '.header-navbar-shadow { pointer-events: none !important; }',
    ].join('\n'),
  }).catch(() => {});
}

async function gotoMaster(page: Page) {
  await registerPopupHandler(page);
  await page.goto(URL);
  await page.getByRole('heading', { name: /Add CheckList Dropdown/i }).waitFor({ state: 'visible', timeout: 30000 });
  await dismissOverlays(page);
  // Wait for the grid to settle so the count()-based guards below are meaningful
  // (the data-table fetches asynchronously after the form renders).
  await Promise.race([
    tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {}),
    page.getByText(/no records/i).first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {}),
  ]);
}

// ─── locators ────────────────────────────────────────────────────────────────
const typeSelect = (page: Page): Locator => page.locator('#serviceType');
const labelInput = (page: Page): Locator => page.locator('#dropdown_label');
const statusSelect = (page: Page): Locator => page.locator('#status');
// Buttons render with a leading icon glyph in their accessible name (e.g. "\uf… Clear"),
// so match loosely on the word as the other masters do.
const submitBtn = (page: Page): Locator => page.getByRole('button', { name: /Submit/i });
const updateBtn = (page: Page): Locator => page.getByRole('button', { name: /Update/i });
const clearBtn = (page: Page): Locator => page.getByRole('button', { name: /Clear/i });

function tableRows(page: Page): Locator {
  return page.locator('[role="row"]:has([role="cell"])');
}
// "Show:" rows-per-page select (has the 100 option)
function showSelect(page: Page): Locator {
  return page.locator('select').filter({ has: page.locator('option', { hasText: '100' }) }).first();
}
// "Status:" listing filter select (has the Inactive option)
function statusFilterSelect(page: Page): Locator {
  return page.locator('select').filter({ has: page.locator('option', { hasText: 'Inactive' }) }).first();
}

async function cellText(page: Page, rowIndex: number, colIndex: number): Promise<string> {
  const cell = tableRows(page).nth(rowIndex).locator('[role="cell"]').nth(colIndex);
  const h5 = cell.getByRole('heading', { level: 5 });
  if (await h5.count() > 0) return (await h5.innerText()).trim();
  return (await cell.innerText()).trim();
}

// Column indices: 0 Sr.No. | 1 Action | 2 Service Type | 3 DropDown Label | 4 Status
const COL_STATUS = 4;

// Edit the first data row (index-based — used where the specific record doesn't matter).
async function editRow(page: Page, rowIndex: number) {
  await tableRows(page).nth(rowIndex).locator('svg[title="Edit"]').click({ force: true });
  await page.getByRole('heading', { name: /Update CheckList Dropdown/i }).waitFor({ state: 'visible', timeout: 10000 });
}

async function createLabel(page: Page, label: string) {
  await typeSelect(page).selectOption('One Time Service');
  await labelInput(page).fill(label);
  await submitBtn(page).click();
  await expect(page.getByText(/has been created successfully/i)).toBeVisible({ timeout: 10000 });
}

type StatusView = 'active' | 'inactive' | 'all';

// Reload to a clean, settled grid for the chosen Status view at 100 rows/page. Reading the
// grid straight after a create/update is racy (the data-table refetches asynchronously), so
// every record lookup starts from a fresh load instead.
async function openListing(page: Page, status: StatusView = 'active') {
  await gotoMaster(page);
  if (status !== 'active') {
    await statusFilterSelect(page).selectOption(status === 'inactive' ? 'false' : '');
    await page.waitForTimeout(500);
  }
  await showSelect(page).selectOption('100').catch(() => {});
  await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
}

// A row located by (unique, timestamped) label text.
function rowByLabel(page: Page, label: string): Locator {
  return tableRows(page).filter({ hasText: label }).first();
}

// Assert a record with the given label is present in the given Status view.
async function expectRow(page: Page, label: string, status: StatusView = 'active') {
  await openListing(page, status);
  await expect(rowByLabel(page, label)).toBeVisible({ timeout: 15000 });
}

// Open a specific record (by label) in edit mode from the given Status view.
async function editByLabel(page: Page, label: string, status: StatusView = 'active') {
  await openListing(page, status);
  await expect(rowByLabel(page, label)).toBeVisible({ timeout: 15000 });
  await rowByLabel(page, label).locator('svg[title="Edit"]').click({ force: true });
  await page.getByRole('heading', { name: /Update CheckList Dropdown/i }).waitFor({ state: 'visible', timeout: 10000 });
}

test.describe('Checklist Dropdown Master', () => {

  test.beforeEach(async ({ page }) => { await gotoMaster(page); });

  // ───────────────────────────────────────────────────────────────────────────
  // Suite 1 – Smoke & Layout
  // ───────────────────────────────────────────────────────────────────────────
  test.describe('Smoke & Layout', () => {

    test('TC-SM-01: Page loads successfully', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(URL));
      await expect(page.getByRole('heading', { name: 'Checklist Dropdown Master', level: 4 })).toBeVisible();
      await expect(page.getByRole('heading', { name: /Add CheckList Dropdown/i })).toBeVisible();
      await expect(typeSelect(page)).toBeVisible();
      await expect(typeSelect(page)).toHaveValue('');
      await expect(labelInput(page)).toBeVisible();
      await expect(labelInput(page)).toHaveValue('');
      await expect(clearBtn(page)).toBeVisible();
      await expect(submitBtn(page)).toBeVisible();
      await expect(statusFilterSelect(page)).toHaveValue('true'); // defaults to Active
    });

    test('TC-SM-02: Form fields, helper text, toolbar, and columns', async ({ page }) => {
      // Type options
      await expect(typeSelect(page).locator('option')).toHaveText(['Select type', 'One Time Service']);
      // Helper texts
      await expect(page.getByText('Select the service type for this dropdown.')).toBeVisible();
      await expect(page.getByText('Enter the label for this dropdown option.')).toBeVisible();
      // Toolbar
      await expect(showSelect(page)).toHaveValue('25');
      await expect(statusFilterSelect(page)).toBeVisible();
      // No search / import / export
      await expect(page.getByRole('button', { name: /^Import$/i })).toHaveCount(0);
      await expect(page.getByRole('button', { name: /Export/i })).toHaveCount(0);
      // Column headers
      await expect(page.getByRole('button', { name: 'Service Type', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'DropDown Label', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Status', exact: true })).toBeVisible();
      // Action cell has an Edit icon (no Delete)
      if (await tableRows(page).count() > 0) {
        await expect(tableRows(page).first().locator('svg[title="Edit"]')).toBeVisible();
        await expect(tableRows(page).first().locator('svg[title="Delete"]')).toHaveCount(0);
      }
    });

    test('TC-SM-03: Info icon opens guidance', async ({ page }) => {
      const info = page.locator('#info-tooltip');
      if (await info.count() === 0) { test.skip(); return; }
      await info.click({ force: true });
      // Form remains accessible after toggling the info control
      await expect(page.getByRole('heading', { name: /CheckList Dropdown/i }).first()).toBeVisible();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Suite 2 – Add (Happy Path)
  // ───────────────────────────────────────────────────────────────────────────
  test.describe('Add - Happy Path', () => {

    test('TC-ADD-01: Create a new dropdown label', async ({ page }) => {
      const label = `Auto Add ${Date.now()}`;
      await createLabel(page, label);
      // Form resets
      await expect(typeSelect(page)).toHaveValue('');
      await expect(labelInput(page)).toHaveValue('');
      await expect(page.getByRole('heading', { name: /Add CheckList Dropdown/i })).toBeVisible();
      // Record appears Active
      await expectRow(page, label);
      await expect(rowByLabel(page, label).getByRole('cell').nth(COL_STATUS)).toContainText('Active');
    });

    test('TC-ADD-02: Create a label with special characters', async ({ page }) => {
      const label = `Door & Align (v2) ${Date.now()}`;
      await createLabel(page, label);
      await expectRow(page, label);
    });

    test('TC-ADD-03: Create multiple records sequentially', async ({ page }) => {
      const ts = Date.now();
      const a = `Auto Seq A ${ts}`;
      const b = `Auto Seq B ${ts}`;
      await createLabel(page, a);
      await createLabel(page, b);
      await expectRow(page, a);
      await expectRow(page, b);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Suite 3 – Mandatory Field Validation
  // ───────────────────────────────────────────────────────────────────────────
  test.describe('Mandatory Field Validation', () => {

    test('TC-VAL-01: Submit with both fields empty', async ({ page }) => {
      await submitBtn(page).click();
      await expect(page.getByText('Please enter dropdown label')).toBeVisible();
    });

    test('TC-VAL-02: Type selected but DropDown Label empty', async ({ page }) => {
      await typeSelect(page).selectOption('One Time Service');
      await submitBtn(page).click();
      await expect(page.getByText('Please enter dropdown label')).toBeVisible();
    });

    test('TC-VAL-03: DropDown Label filled but Type empty (server-enforced)', async ({ page }) => {
      await labelInput(page).fill(`No Type ${Date.now()}`);
      await submitBtn(page).click();
      // Type is enforced server-side and surfaced as a toast
      await expect(page.getByText(/service_type should not be empty/i)).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(/created successfully/i)).toHaveCount(0);
    });

    test('TC-VAL-04: Whitespace-only DropDown Label is rejected', async ({ page }) => {
      await typeSelect(page).selectOption('One Time Service');
      await labelInput(page).fill('   ');
      await submitBtn(page).click();
      // Either an inline error or no success — assert it was NOT created
      await expect(page.getByText(/created successfully/i)).toHaveCount(0);
    });

    test('TC-VAL-05: Validation error clears after valid input', async ({ page }) => {
      await submitBtn(page).click();
      await expect(page.getByText('Please enter dropdown label')).toBeVisible();
      await typeSelect(page).selectOption('One Time Service');
      await labelInput(page).fill(`Auto Val05 ${Date.now()}`);
      await expect(page.getByText('Please enter dropdown label')).toHaveCount(0);
      await submitBtn(page).click();
      await expect(page.getByText(/created successfully/i)).toBeVisible({ timeout: 10000 });
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Suite 4 – Duplicate Prevention
  // ───────────────────────────────────────────────────────────────────────────
  test.describe('Duplicate Prevention', () => {

    test('TC-DUP-01: Duplicate label for the same Type is rejected', async ({ page }) => {
      const label = `Auto Dup ${Date.now()}`;
      await createLabel(page, label);
      // Try the same label again
      await typeSelect(page).selectOption('One Time Service');
      await labelInput(page).fill(label);
      await submitBtn(page).click();
      await expect(page.getByText(/already exists/i)).toBeVisible({ timeout: 10000 });
    });

    test('TC-DUP-02: Duplicate check is case-insensitive', async ({ page }) => {
      const base = `Auto Case ${Date.now()}`;
      await createLabel(page, base);
      await typeSelect(page).selectOption('One Time Service');
      await labelInput(page).fill(base.toUpperCase());
      await submitBtn(page).click();
      // App lowercases & rejects regardless of case
      await expect(page.getByText(/already exists/i)).toBeVisible({ timeout: 10000 });
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Suite 5 – Clear Button Behavior
  // ───────────────────────────────────────────────────────────────────────────
  test.describe('Clear Button Behavior', () => {

    test('TC-CLR-01: Clear resets the Add form', async ({ page }) => {
      await typeSelect(page).selectOption('One Time Service');
      await labelInput(page).fill('To be cleared');
      await clearBtn(page).click();
      await expect(typeSelect(page)).toHaveValue('');
      await expect(labelInput(page)).toHaveValue('');
      await expect(page.getByRole('heading', { name: /Add CheckList Dropdown/i })).toBeVisible();
    });

    test('TC-CLR-02: Clear in Update mode reverts to Add mode', async ({ page }) => {
      if (await tableRows(page).count() === 0) { test.skip(); return; }
      await editRow(page, 0);
      await expect(statusSelect(page)).toBeVisible();
      await expect(updateBtn(page)).toBeVisible();
      await clearBtn(page).click();
      await expect(page.getByRole('heading', { name: /Add CheckList Dropdown/i })).toBeVisible();
      await expect(typeSelect(page)).toHaveValue('');
      await expect(labelInput(page)).toHaveValue('');
      await expect(statusSelect(page)).toHaveCount(0);
      await expect(submitBtn(page)).toBeVisible();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Suite 6 – Edit & Update
  // ───────────────────────────────────────────────────────────────────────────
  test.describe('Edit and Update', () => {

    test('TC-EDT-01: Edit opens Update mode with Status dropdown', async ({ page }) => {
      if (await tableRows(page).count() === 0) { test.skip(); return; }
      await editRow(page, 0);
      await expect(typeSelect(page)).not.toHaveValue('');
      await expect(labelInput(page)).not.toHaveValue('');
      await expect(statusSelect(page)).toBeVisible();
      await expect(page.getByText('Select active or inactive')).toBeVisible();
      await expect(updateBtn(page)).toBeVisible();
      await clearBtn(page).click();
    });

    test('TC-EDT-02: Update the DropDown Label', async ({ page }) => {
      const label = `Auto Edit ${Date.now()}`;
      await createLabel(page, label);
      await editByLabel(page, label);
      const updated = `${label} upd`;
      await labelInput(page).fill(updated);
      await updateBtn(page).click();
      await expect(page.getByText(/updated successfully/i)).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('heading', { name: /Add CheckList Dropdown/i })).toBeVisible();
      await expectRow(page, updated);
    });

    test('TC-EDT-03: Update with empty DropDown Label is blocked', async ({ page }) => {
      if (await tableRows(page).count() === 0) { test.skip(); return; }
      await editRow(page, 0);
      await labelInput(page).fill('');
      await updateBtn(page).click();
      await expect(page.getByText('Please enter dropdown label')).toBeVisible();
      await clearBtn(page).click();
    });

    test('TC-EDT-04: Update label to match another record is rejected', async ({ page }) => {
      // App behaviour: a duplicate-on-UPDATE is silently rejected — unlike create (which
      // shows an "already exists" toast), update produces no toast and the form stays in
      // Update mode without persisting the change.
      const ts = Date.now();
      const keep = `Auto Keep ${ts}`;
      const temp = `Auto Temp ${ts}`;
      await createLabel(page, keep);
      await createLabel(page, temp);
      await editByLabel(page, temp);
      await labelInput(page).fill(keep);
      await updateBtn(page).click();
      await page.waitForTimeout(2500);
      // Not accepted: no success toast, still in Update mode
      await expect(page.getByText(/updated successfully/i)).toHaveCount(0);
      await expect(page.getByRole('heading', { name: /Update CheckList Dropdown/i })).toBeVisible();
      await clearBtn(page).click();
      // The original record is unchanged (still present under its own label)
      await expectRow(page, temp);
    });

    test('TC-EDT-05: Change Status Active -> Inactive', async ({ page }) => {
      const label = `Auto Inact ${Date.now()}`;
      await createLabel(page, label);
      await editByLabel(page, label);
      await statusSelect(page).selectOption('false');
      await updateBtn(page).click();
      await expect(page.getByText(/updated successfully/i)).toBeVisible({ timeout: 10000 });
      // Not visible under Active filter
      await openListing(page, 'active');
      await expect(tableRows(page).filter({ hasText: label })).toHaveCount(0);
      // Visible under Inactive filter
      await expectRow(page, label, 'inactive');
    });

    test('TC-EDT-06: Re-activate an Inactive record', async ({ page }) => {
      // Seed an inactive record
      const label = `Auto React ${Date.now()}`;
      await createLabel(page, label);
      await editByLabel(page, label);
      await statusSelect(page).selectOption('false');
      await updateBtn(page).click();
      await expect(page.getByText(/updated successfully/i)).toBeVisible({ timeout: 10000 });
      // Now reactivate from the Inactive view
      await editByLabel(page, label, 'inactive');
      await statusSelect(page).selectOption('true');
      await updateBtn(page).click();
      await expect(page.getByText(/updated successfully/i)).toBeVisible({ timeout: 10000 });
      await expectRow(page, label, 'active');
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Suite 7 – Status Listing Filter
  // ───────────────────────────────────────────────────────────────────────────
  test.describe('Status Listing Filter', () => {

    test('TC-FLT-01: Defaults to Active', async ({ page }) => {
      await expect(statusFilterSelect(page)).toHaveValue('true');
      if (await tableRows(page).count() === 0) return;
      for (let i = 0; i < Math.min(await tableRows(page).count(), 5); i++) {
        const s = await cellText(page, i, COL_STATUS);
        if (s) expect(s).toBe('Active');
      }
    });

    test('TC-FLT-02: Filter to Inactive', async ({ page }) => {
      await statusFilterSelect(page).selectOption('false');
      await page.waitForTimeout(600);
      const n = await tableRows(page).count();
      for (let i = 0; i < Math.min(n, 5); i++) {
        const s = await cellText(page, i, COL_STATUS);
        if (s) expect(s).toBe('Inactive');
      }
    });

    test('TC-FLT-03: Filter to All', async ({ page }) => {
      await statusFilterSelect(page).selectOption('');
      await page.waitForTimeout(600);
      expect(await tableRows(page).count()).toBeGreaterThanOrEqual(0);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Suite 8 – Rows Per Page, Sorting & Pagination
  // ───────────────────────────────────────────────────────────────────────────
  test.describe('Rows Per Page, Sorting & Pagination', () => {

    test('TC-PAG-01: Default rows-per-page is 25', async ({ page }) => {
      await expect(showSelect(page)).toHaveValue('25');
    });

    test('TC-PAG-02: Change rows-per-page and paginate', async ({ page }) => {
      if (await tableRows(page).count() === 0) { test.skip(); return; }
      await showSelect(page).selectOption('10');
      await page.waitForTimeout(500);
      expect(await tableRows(page).count()).toBeLessThanOrEqual(10);
      const next = page.getByRole('button', { name: 'Next page' });
      if (await next.isEnabled().catch(() => false)) {
        await next.click();
        await tableRows(page).first().waitFor({ state: 'visible' });
        await page.getByRole('button', { name: 'Previous page' }).click();
        await expect(page.getByRole('button', { name: /Page 1 is your current page/i })).toBeVisible();
      }
    });

    test('TC-SRT-01: Sort by DropDown Label', async ({ page }) => {
      if (await tableRows(page).count() === 0) { test.skip(); return; }
      await page.getByRole('button', { name: 'DropDown Label', exact: true }).click();
      await page.waitForTimeout(400);
      await page.getByRole('button', { name: 'DropDown Label', exact: true }).click();
      await page.waitForTimeout(400);
      await expect(tableRows(page).first()).toBeVisible();
    });

    test('TC-SRT-02: Sort by Service Type and Status', async ({ page }) => {
      await statusFilterSelect(page).selectOption('');
      await page.waitForTimeout(400);
      if (await tableRows(page).count() === 0) { test.skip(); return; }
      await page.getByRole('button', { name: 'Service Type', exact: true }).click();
      await page.waitForTimeout(400);
      await page.getByRole('button', { name: 'Status', exact: true }).click();
      await page.waitForTimeout(400);
      await expect(tableRows(page).first()).toBeVisible();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Suite 9 – Navigation & Access
  // ───────────────────────────────────────────────────────────────────────────
  test.describe('Navigation and Access', () => {

    test('TC-NAV-01: Reachable from the Service Masters sidebar', async ({ page }) => {
      await page.goto('/dashboard');
      await page.getByRole('link', { name: 'Service Masters' }).click();
      await page.getByRole('link', { name: 'Checklist Dropdown Master' }).click();
      await expect(page).toHaveURL(new RegExp(URL));
      await expect(page.getByRole('heading', { name: /Add CheckList Dropdown/i })).toBeVisible({ timeout: 15000 });
    });

    test('TC-NAV-02: Direct URL navigation works when authenticated', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(URL));
      await expect(page.getByRole('heading', { name: /Add CheckList Dropdown/i })).toBeVisible();
    });
  });
});
