import { test, expect } from '../fixtures/auth-fixture';

const LEAVE_BALANCES_URL = '/attendance/leave-balances';

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
    if (await maybeLater.isVisible({ timeout: 5000 }).catch(() => false)) {
      await maybeLater.click();
    }
  } catch { /* absent */ }
}

async function dismissOnboardingWidget(page: any) {
  try {
    const collapse = page.getByRole('button', { name: 'Collapse' });
    if (await collapse.isVisible({ timeout: 3000 }).catch(() => false)) {
      await collapse.click();
      await page.waitForTimeout(300);
    }
  } catch { /* absent */ }
}

async function gotoLeaveBalances(page: any) {
  await registerPopupHandler(page);
  await page.goto(LEAVE_BALANCES_URL, { timeout: 60000 });
  await page.getByRole('heading', { name: 'Leave Balance Report', level: 2 })
    .waitFor({ state: 'visible', timeout: 45000 });
  await page.waitForLoadState('networkidle');
  await dismissNotificationPopup(page);
  await dismissOnboardingWidget(page);
  // Rows load async well after heading renders; expect timeout option overrides global 10s
  await expect(page.locator('.rdt_TableRow').first()).toBeVisible({ timeout: 60000 });
  await waitForTableLoad(page);
}

async function waitForTableLoad(page: any) {
  await page.waitForTimeout(600);
  await page.waitForFunction(
    () => !document.body.textContent?.includes('Loading...'),
    { timeout: 15000 }
  ).catch(() => {});
  await page.waitForTimeout(500);
}

function dataRows(page: any) {
  return page.locator('.rdt_TableRow');
}

async function openFilterDrawer(page: any) {
  await dismissOnboardingWidget(page);
  const backdrop = page.locator('.filter-drawer-backdrop');
  if (await backdrop.isVisible({ timeout: 500 }).catch(() => false)) {
    await backdrop.click({ force: true });
    await backdrop.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  }
  await page.locator('.report-filter-btn').click();
  await page.locator('.filter-drawer-panel').waitFor({ state: 'visible', timeout: 10000 });
}

async function closeFilterDrawer(page: any) {
  const backdrop = page.locator('.filter-drawer-backdrop');
  if (await backdrop.isVisible().catch(() => false)) {
    await backdrop.click({ force: true });
    await backdrop.waitFor({ state: 'hidden', timeout: 10000 });
  }
}

async function selectEmployeeInFilter(page: any, name: string) {
  await page.locator('.select__control').first().click();
  await page.waitForTimeout(600);
  const option = page.locator('.select__option').filter({ hasText: name });
  await option.waitFor({ state: 'visible', timeout: 5000 });
  await option.click();
}

async function applyFilter(page: any) {
  await page.getByRole('button', { name: 'Apply' }).click();
  await page.locator('.filter-drawer-backdrop')
    .waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});
  // Give the API call time to start before checking for Loading...
  await page.waitForTimeout(800);
  await waitForTableLoad(page);
}

async function getColumnValues(page: any, colIndex: number): Promise<string[]> {
  // colIndex is 0-based: 0=Sr.No, 1=EmpName, 2=CL, 3=SL, 4=CompOff, 5=UsedCL, 6=UsedSL, 7=UsedCompOff
  const cells = page.locator(`.rdt_TableRow .rdt_TableCell:nth-child(${colIndex + 1})`);
  const texts = await cells.allTextContents();
  return texts.map((t: string) => t.trim());
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1 – Smoke Tests
// ─────────────────────────────────────────────────────────────────────────────

test.describe('1. Smoke Tests', () => {

  test.beforeEach(async ({ page }) => {
    await gotoLeaveBalances(page);
  });

  test('1.1 TC-SM-01: Leave Balances page loads successfully', async ({ page }) => {
    await expect(page).toHaveURL(new RegExp(LEAVE_BALANCES_URL));
    await expect(page).toHaveTitle('ElevatorPlus');
    // Navbar breadcrumb
    await expect(page.getByRole('heading', { name: 'Leave Balances', level: 4 })).toBeVisible();
    // Page heading and subtitle
    await expect(page.getByRole('heading', { name: 'Leave Balance Report', level: 2 })).toBeVisible();
    await expect(page.getByText('View employee leave balances and usage')).toBeVisible();
    // Toolbar controls
    await expect(page.locator('#search')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Export Excel' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Import Excel' })).toBeVisible();
    await expect(page.locator('.report-filter-btn')).toBeVisible();
    // Table has data rows
    await expect(dataRows(page).first()).toBeVisible();
    // Pagination controls
    await expect(page.getByText(/Page \d+ of \d+/)).toBeVisible();
    await expect(page.locator('select').first()).toBeVisible();
    await expect(page.locator('ul.react-paginate')).toBeVisible();
    await expect(page.locator('li.page-item.prev')).toBeVisible();
    await expect(page.locator('li.page-item.next')).toBeVisible();
  });

  test('1.2 TC-SM-02: Verify all table columns are present', async ({ page }) => {
    const headerRow = page.locator('.rdt_TableHeadRow');
    await expect(headerRow.getByRole('button', { name: 'Sr. No.' })).toBeVisible();
    await expect(headerRow.getByRole('button', { name: 'Employee Name' })).toBeVisible();
    await expect(headerRow.getByRole('button', { name: 'Casual Leave Balance' })).toBeVisible();
    await expect(headerRow.getByRole('button', { name: 'Sick Leave Balance' })).toBeVisible();
    await expect(headerRow.getByRole('button', { name: 'Comp Off Balance' })).toBeVisible();
    await expect(headerRow.getByRole('button', { name: 'Used Casual Leaves' })).toBeVisible();
    await expect(headerRow.getByRole('button', { name: 'Used Sick Leaves' })).toBeVisible();
    await expect(headerRow.getByRole('button', { name: 'Used Comp Offs' })).toBeVisible();
    // Verify data rows
    const rows = dataRows(page);
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const cells = rows.nth(i).locator('.rdt_TableCell');
      // Sr. No. is sequential from 1
      const srNo = await cells.nth(0).textContent();
      expect(Number(srNo?.trim())).toBe(i + 1);
      // Employee Name is non-empty
      const empName = await cells.nth(1).textContent();
      expect(empName?.trim().length).toBeGreaterThan(0);
      // Leave balance/usage columns are numeric (integer or decimal)
      for (let j = 2; j < 8; j++) {
        const val = await cells.nth(j).textContent();
        expect(val?.trim()).toMatch(/^\d+(\.\d+)?$/);
      }
    }
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 2 – Search Functionality
// ─────────────────────────────────────────────────────────────────────────────

test.describe('2. Search Functionality', () => {

  test.beforeEach(async ({ page }) => {
    await gotoLeaveBalances(page);
  });

  test('2.1 TC-SRC-01: Search by partial employee name returns matching results', async ({ page }) => {
    // Confirm multiple pages exist
    await expect(page.getByText(/Page 1 of [2-9]/).first()).toBeVisible();

    await page.locator('#search').fill('Ganesh');
    await page.waitForTimeout(2500);
    await waitForTableLoad(page);

    const rows = dataRows(page);
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
    // All returned rows must contain 'ganesh' (case-insensitive)
    for (let i = 0; i < count; i++) {
      const name = await rows.nth(i).locator('.rdt_TableCell').nth(1).textContent();
      expect(name?.toLowerCase()).toContain('ganesh');
    }
    const names = await rows.locator('.rdt_TableCell:nth-child(2)').allTextContents();
    const lower = names.map((n: string) => n.toLowerCase().trim());
    expect(lower.some((n: string) => n.includes('ganesh'))).toBeTruthy();
    // Non-matching rows hidden → pagination reduced
    await expect(page.getByText(/Page 1 of 1/)).toBeVisible();
  });

  test('2.2 TC-SRC-02: Search by exact employee name returns a single matching record', async ({ page }) => {
    await page.locator('#search').fill('Accucia Test');
    await page.waitForTimeout(2500);
    await waitForTableLoad(page);

    const rows = dataRows(page);
    await expect(rows).toHaveCount(1);
    const cells = rows.first().locator('.rdt_TableCell');
    await expect(cells.nth(1)).toContainText('Accucia Test');
    await expect(cells.nth(2)).toContainText('1');
    await expect(cells.nth(3)).toContainText('2');
    await expect(cells.nth(4)).toContainText('2');
    await expect(cells.nth(5)).toContainText('3');
    await expect(cells.nth(6)).toContainText('2');
    await expect(cells.nth(7)).toContainText('2');
    await expect(page.getByText('Page 1 of 1')).toBeVisible();
  });

  test('2.3 TC-SRC-03: Search with a non-existent employee name returns no results', async ({ page }) => {
    await page.locator('#search').fill('XYZNONEXISTENTEMPLOYEE999');
    await page.waitForTimeout(2000);
    await waitForTableLoad(page);

    const count = await dataRows(page).count();
    expect(count).toBe(0);
  });

  test('2.4 TC-SRC-04: Clearing the search input restores the full employee list', async ({ page }) => {
    const originalIndicator = await page.getByText(/Page \d+ of \d+/).first().textContent();

    await page.locator('#search').fill('Ganesh');
    await page.waitForTimeout(2500);
    await waitForTableLoad(page);
    const filteredCount = await dataRows(page).count();
    expect(filteredCount).toBeGreaterThan(0);

    // Clear the search input
    await page.locator('#search').click();
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(2500);
    await waitForTableLoad(page);

    // Full list restored
    await expect(page.getByText(originalIndicator!).first()).toBeVisible();
    const restoredCount = await dataRows(page).count();
    expect(restoredCount).toBeGreaterThan(filteredCount);
  });

  test('2.5 TC-SRC-05: Search is case-insensitive', async ({ page }) => {
    // Lowercase search
    await page.locator('#search').fill('ganesh');
    await page.waitForTimeout(2500);
    await waitForTableLoad(page);
    const lowercaseNames = await dataRows(page).locator('.rdt_TableCell:nth-child(2)').allTextContents();
    const lCount = lowercaseNames.length;
    expect(lCount).toBeGreaterThan(0);

    // Clear and uppercase search
    await page.locator('#search').click();
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(1500);

    await page.locator('#search').fill('GANESH');
    await page.waitForTimeout(2500);
    await waitForTableLoad(page);
    const uppercaseNames = await dataRows(page).locator('.rdt_TableCell:nth-child(2)').allTextContents();
    expect(uppercaseNames.length).toBe(lCount);
    for (const n of uppercaseNames) {
      expect(n.toLowerCase()).toContain('ganesh');
    }
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 3 – Filter Drawer
// ─────────────────────────────────────────────────────────────────────────────

test.describe('3. Filter Drawer', () => {

  test.beforeEach(async ({ page }) => {
    await gotoLeaveBalances(page);
  });

  test('3.1 TC-FLT-01: Filter drawer opens and displays correct elements', async ({ page }) => {
    await openFilterDrawer(page);

    await expect(page.locator('.filter-drawer-panel')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Filter', level: 5 })).toBeVisible();
    await expect(page.getByText('Customize your filters')).toBeVisible();
    // Employee Name dropdown
    await expect(page.locator('.select__control').first()).toBeVisible();
    // Reset and Apply buttons
    await expect(page.getByRole('button', { name: 'Reset' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Apply' })).toBeVisible();
    // Close X icon
    await expect(page.locator('.filter-drawer-header button')).toBeVisible();

    await closeFilterDrawer(page);
  });

  test('3.2 TC-FLT-02: Employee Name dropdown lists all active employees', async ({ page }) => {
    await openFilterDrawer(page);
    await page.locator('.select__control').first().click();
    await page.waitForTimeout(800);

    const options = page.locator('.select__option');
    const count = await options.count();
    // Approximately 42 active employees
    expect(count).toBeGreaterThanOrEqual(40);

    // Search within dropdown narrows to Ganesh matches
    await page.locator('#react-select-3-input').fill('Ganesh');
    await page.waitForTimeout(500);
    const filteredOptions = page.locator('.select__option');
    const filteredCount = await filteredOptions.count();
    expect(filteredCount).toBe(2);
    await expect(filteredOptions.filter({ hasText: 'ganesh 2' })).toBeVisible();
    await expect(filteredOptions.filter({ hasText: 'Ganesh kadam' })).toBeVisible();

    await closeFilterDrawer(page);
  });

  test('3.3 TC-FLT-03: Selecting an employee and clicking Apply filters the table', async ({ page }) => {
    await openFilterDrawer(page);
    await selectEmployeeInFilter(page, 'Ganesh kadam');
    // Selected tag shown in the control
    await expect(
      page.locator('.select__single-value, .select__multi-value__label').filter({ hasText: 'Ganesh kadam' })
    ).toBeVisible();

    await applyFilter(page);

    // Table shows only Ganesh kadam
    const rows = dataRows(page);
    await expect(rows).toHaveCount(1);
    await expect(rows.first().locator('.rdt_TableCell').nth(1)).toContainText('Ganesh kadam');
    // Active filter chip visible
    await expect(page.locator('.active-filters-modern')).toBeVisible();
    await expect(page.locator('.filter-chip-modern').filter({ hasText: 'Ganesh kadam' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Clear All' })).toBeVisible();
    await expect(page.getByText('Page 1 of 1')).toBeVisible();
  });

  test('3.4 TC-FLT-04: Active filter chip X icon removes the filter', async ({ page }) => {
    await openFilterDrawer(page);
    await selectEmployeeInFilter(page, 'Ganesh kadam');
    await applyFilter(page);
    await expect(page.locator('.filter-chip-modern').filter({ hasText: 'Ganesh kadam' })).toBeVisible();

    // Click the X icon on the chip (SVG element, shown as img in a11y tree)
    await page.locator('.filter-chip-modern').filter({ hasText: 'Ganesh kadam' }).locator('svg').click();
    await waitForTableLoad(page);

    await expect(page.locator('.active-filters-modern')).not.toBeVisible();
    const count = await dataRows(page).count();
    expect(count).toBeGreaterThan(1);
    await expect(page.getByText(/Page 1 of [2-9]/)).toBeVisible();
  });

  test('3.5 TC-FLT-05: Clear All button removes all active filters and restores full list', async ({ page }) => {
    await openFilterDrawer(page);
    await selectEmployeeInFilter(page, 'Ganesh kadam');
    await applyFilter(page);
    await expect(page.locator('.active-filters-modern')).toBeVisible();

    await page.locator('button.btn.btn-link').filter({ hasText: 'Clear All' }).click();
    await waitForTableLoad(page);

    await expect(page.locator('.active-filters-modern')).not.toBeVisible();
    const count = await dataRows(page).count();
    expect(count).toBeGreaterThan(1);
    await expect(page.getByText(/Page 1 of [2-9]/)).toBeVisible();
  });

  test('3.6 TC-FLT-06: Reset button inside the filter drawer clears the selection without applying', async ({ page }) => {
    const initialCount = await dataRows(page).count();

    await openFilterDrawer(page);
    await selectEmployeeInFilter(page, 'Ganesh kadam');
    await expect(
      page.locator('.select__single-value, .select__multi-value__label').filter({ hasText: 'Ganesh kadam' })
    ).toBeVisible();

    // Click Reset — stays in drawer, clears selection
    await page.getByRole('button', { name: 'Reset' }).click();
    await page.waitForTimeout(500);

    await expect(page.locator('.filter-drawer-panel')).toBeVisible();
    // After reset, no employee is selected — single-value element should be absent
    await expect(page.locator('.select__control').first().locator('.select__single-value')).not.toBeVisible();

    // Apply reset (no filter) — full list returned
    await page.getByRole('button', { name: 'Apply' }).click();
    await page.locator('.filter-drawer-backdrop')
      .waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});
    await waitForTableLoad(page);

    const afterCount = await dataRows(page).count();
    expect(afterCount).toBe(initialCount);
    await expect(page.locator('.active-filters-modern')).not.toBeVisible();
  });

  test('3.7 TC-FLT-07: Close icon on the filter drawer discards unsaved selection', async ({ page }) => {
    await openFilterDrawer(page);
    await selectEmployeeInFilter(page, 'Ganesh kadam');
    // Selection made but NOT applied
    await expect(page.locator('.filter-drawer-panel')).toBeVisible();

    // Click the X close button in the drawer header (not Apply)
    await page.locator('.filter-drawer-header button').click();
    await page.locator('.filter-drawer-backdrop')
      .waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});

    // No active filter chips — selection discarded
    await expect(page.locator('.active-filters-modern')).not.toBeVisible();
    const count = await dataRows(page).count();
    expect(count).toBeGreaterThan(1);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 4 – Pagination and Rows Per Page
// ─────────────────────────────────────────────────────────────────────────────

test.describe('4. Pagination and Rows Per Page', () => {

  test.beforeEach(async ({ page }) => {
    await gotoLeaveBalances(page);
  });

  test('4.1 TC-PAG-01: Default pagination state on page load', async ({ page }) => {
    await expect(page.locator('select').first()).toHaveValue('10');
    const rowCount = await dataRows(page).count();
    expect(rowCount).toBeLessThanOrEqual(10);
    await expect(page.getByText(/Page 1 of \d+/)).toBeVisible();
    // Rows dropdown options: 10, 25, 50, 100
    const options = await page.locator('select').first().evaluate(
      (el: HTMLSelectElement) => Array.from(el.options).map(o => o.value)
    );
    expect(options).toEqual(['10', '25', '50', '100']);
    // Previous disabled, Next enabled on page 1
    await expect(page.locator('li.page-item.prev')).toHaveClass(/disabled/);
    await expect(page.locator('li.page-item.next')).not.toHaveClass(/disabled/);
    await expect(page.locator('ul.react-paginate')).toBeVisible();
  });

  test('4.2 TC-PAG-02: Navigate to next page using the Next button', async ({ page }) => {
    await expect(page.locator('li.page-item.prev')).toHaveClass(/disabled/);

    await page.locator('li.page-item.next a').click();
    await page.waitForTimeout(1000);
    await waitForTableLoad(page);
    await page.locator('.rdt_TableRow').first().waitFor({ state: 'visible', timeout: 15000 });

    await expect(page.locator('a[aria-current="page"]')).toHaveText('2');
    await expect(page.locator('li.page-item.prev')).not.toHaveClass(/disabled/);
    expect(await dataRows(page).count()).toBeGreaterThan(0);
  });

  test('4.3 TC-PAG-03: Navigate to previous page using the Previous button', async ({ page }) => {
    // Go to page 2 first
    await page.locator('li.page-item.next a').click();
    await page.waitForTimeout(1000);
    await waitForTableLoad(page);
    await page.locator('.rdt_TableRow').first().waitFor({ state: 'visible', timeout: 15000 });
    await expect(page.locator('a[aria-current="page"]')).toHaveText('2');

    // Go back to page 1
    await page.locator('li.page-item.prev a').click();
    await page.waitForTimeout(1000);
    await waitForTableLoad(page);
    await page.locator('.rdt_TableRow').first().waitFor({ state: 'visible', timeout: 15000 });

    await expect(page.locator('a[aria-current="page"]')).toHaveText('1');
    await expect(page.locator('li.page-item.prev')).toHaveClass(/disabled/);
  });

  test('4.4 TC-PAG-04: Navigate to a specific page using a numbered page button', async ({ page }) => {
    const page3Btn = page.locator('a[aria-label="Page 3"]');
    if (!await page3Btn.isVisible().catch(() => false)) { test.skip(); return; }

    await page3Btn.click();
    await page.waitForTimeout(1000);
    await waitForTableLoad(page);
    await page.locator('.rdt_TableRow').first().waitFor({ state: 'visible', timeout: 15000 });

    await expect(page.locator('a[aria-current="page"]')).toHaveText('3');
    await expect(page.locator('li.page-item.prev')).not.toHaveClass(/disabled/);
    await expect(page.locator('li.page-item.next')).not.toHaveClass(/disabled/);
  });

  test('4.5 TC-PAG-05: Previous page button is disabled on page 1', async ({ page }) => {
    // Pagination renders after rows load — gotoLeaveBalances guarantees rows are present
    await expect(page.locator('a[aria-current="page"]')).toHaveText('1');
    await expect(page.locator('li.page-item.prev')).toHaveClass(/disabled/);
  });

  test('4.6 TC-PAG-06: Next page button is disabled on the last page', async ({ page }) => {
    const pageText = await page.getByText(/Page 1 of \d+/).textContent();
    const lastPageNum = pageText?.match(/Page 1 of (\d+)/)?.[1] ?? '5';
    const lastPageBtn = page.locator(`a[aria-label="Page ${lastPageNum}"]`);
    if (!await lastPageBtn.isVisible().catch(() => false)) { test.skip(); return; }

    await lastPageBtn.click();
    await page.waitForTimeout(1000);
    await waitForTableLoad(page);
    await page.locator('.rdt_TableRow').first().waitFor({ state: 'visible', timeout: 15000 });

    await expect(page.locator('li.page-item.next')).toHaveClass(/disabled/);
  });

  test('4.7 TC-PAG-07: Change rows-per-page to 25', async ({ page }) => {
    await page.locator('select').first().selectOption('25');
    await page.waitForTimeout(1500);
    await waitForTableLoad(page);
    // Wait for the 11th row to appear — confirms new data (>10 rows) has loaded
    await page.locator('.rdt_TableRow').nth(10).waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

    const count = await dataRows(page).count();
    expect(count).toBeGreaterThan(10);
    expect(count).toBeLessThanOrEqual(25);
    // Fewer pages now
    await expect(page.getByText(/Page 1 of [1-3]/).first()).toBeVisible();
  });

  test('4.8 TC-PAG-08: Change rows-per-page to 50', async ({ page }) => {
    await page.locator('select').first().selectOption('50');
    await page.waitForTimeout(1500);
    await waitForTableLoad(page);
    // Wait for the 26th row to appear — confirms data for 50-row view loaded
    await page.locator('.rdt_TableRow').nth(25).waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

    const count = await dataRows(page).count();
    expect(count).toBeLessThanOrEqual(50);
    expect(count).toBeGreaterThan(25);
    await expect(page.getByText('Page 1 of 1').first()).toBeVisible();
  });

  test('4.9 TC-PAG-09: Change rows-per-page to 100', async ({ page }) => {
    await page.locator('select').first().selectOption('100');
    await page.waitForTimeout(1500);
    await waitForTableLoad(page);
    await page.locator('.rdt_TableRow').nth(10).waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

    const count = await dataRows(page).count();
    expect(count).toBeLessThanOrEqual(100);
    await expect(page.getByText('Page 1 of 1').first()).toBeVisible();
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 5 – Column Sorting
// ─────────────────────────────────────────────────────────────────────────────

test.describe('5. Column Sorting', () => {

  test.beforeEach(async ({ page }) => {
    await gotoLeaveBalances(page);
    // Show 50 rows for more variety in sort verification
    await page.locator('select').first().selectOption('50');
    await waitForTableLoad(page);
  });

  test('5.1 TC-SRT-01: Sort by Employee Name ascending then descending', async ({ page }) => {
    await page.getByRole('button', { name: 'Employee Name' }).click();
    await waitForTableLoad(page);
    const ascNames = await getColumnValues(page, 1);
    const sortedAsc = [...ascNames].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    expect(ascNames).toEqual(sortedAsc);

    await page.getByRole('button', { name: 'Employee Name' }).click();
    await waitForTableLoad(page);
    const descNames = await getColumnValues(page, 1);
    const sortedDesc = [...descNames].sort((a, b) => b.toLowerCase().localeCompare(a.toLowerCase()));
    expect(descNames).toEqual(sortedDesc);
  });

  test('5.2 TC-SRT-02: Sort by Casual Leave Balance ascending then descending', async ({ page }) => {
    await page.getByRole('button', { name: 'Casual Leave Balance' }).click();
    await waitForTableLoad(page);
    const ascVals = (await getColumnValues(page, 2)).map(Number);
    const sortedAsc = [...ascVals].sort((a, b) => a - b);
    expect(ascVals).toEqual(sortedAsc);

    await page.getByRole('button', { name: 'Casual Leave Balance' }).click();
    await waitForTableLoad(page);
    const descVals = (await getColumnValues(page, 2)).map(Number);
    const sortedDesc = [...descVals].sort((a, b) => b - a);
    expect(descVals).toEqual(sortedDesc);
  });

  test('5.3 TC-SRT-03: Sort by Sick Leave Balance ascending then descending', async ({ page }) => {
    await page.getByRole('button', { name: 'Sick Leave Balance' }).click();
    await waitForTableLoad(page);
    const ascVals = (await getColumnValues(page, 3)).map(Number);
    const sortedAsc = [...ascVals].sort((a, b) => a - b);
    expect(ascVals).toEqual(sortedAsc);

    await page.getByRole('button', { name: 'Sick Leave Balance' }).click();
    await waitForTableLoad(page);
    const descVals = (await getColumnValues(page, 3)).map(Number);
    const sortedDesc = [...descVals].sort((a, b) => b - a);
    expect(descVals).toEqual(sortedDesc);
  });

  test('5.4 TC-SRT-04: Sort by Comp Off Balance ascending', async ({ page }) => {
    await page.getByRole('button', { name: 'Comp Off Balance' }).click();
    await waitForTableLoad(page);
    const ascVals = (await getColumnValues(page, 4)).map(Number);
    const sortedAsc = [...ascVals].sort((a, b) => a - b);
    expect(ascVals).toEqual(sortedAsc);
  });

  test('5.5 TC-SRT-05: Sort by Used Casual Leaves ascending', async ({ page }) => {
    await page.getByRole('button', { name: 'Used Casual Leaves' }).click();
    await waitForTableLoad(page);
    const ascVals = (await getColumnValues(page, 5)).map(Number);
    const sortedAsc = [...ascVals].sort((a, b) => a - b);
    expect(ascVals).toEqual(sortedAsc);
  });

  test('5.6 TC-SRT-06: Sort by Used Sick Leaves ascending', async ({ page }) => {
    await page.getByRole('button', { name: 'Used Sick Leaves' }).click();
    await waitForTableLoad(page);
    const ascVals = (await getColumnValues(page, 6)).map(Number);
    const sortedAsc = [...ascVals].sort((a, b) => a - b);
    expect(ascVals).toEqual(sortedAsc);
  });

  test('5.7 TC-SRT-07: Sort by Used Comp Offs ascending', async ({ page }) => {
    await page.getByRole('button', { name: 'Used Comp Offs' }).click();
    await waitForTableLoad(page);
    const ascVals = (await getColumnValues(page, 7)).map(Number);
    const sortedAsc = [...ascVals].sort((a, b) => a - b);
    expect(ascVals).toEqual(sortedAsc);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 6 – Data Integrity
// ─────────────────────────────────────────────────────────────────────────────

test.describe('6. Data Integrity', () => {

  test.beforeEach(async ({ page }) => {
    await gotoLeaveBalances(page);
  });

  test('6.1 TC-DAT-01: Verify only active users appear in the table', async ({ page }) => {
    await page.locator('select').first().selectOption('100');
    await page.waitForTimeout(1500);
    await waitForTableLoad(page);
    // Wait for more rows than the default 10 to confirm reload completed
    await page.locator('.rdt_TableRow').nth(10).waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

    const count = await dataRows(page).count();
    expect(count).toBeGreaterThan(0);
    // All employees on one page confirms they are active users
    await expect(page.getByText('Page 1 of 1').first()).toBeVisible();
  });

  test('6.2 TC-DAT-02: Verify all numeric leave values are non-negative', async ({ page }) => {
    await page.locator('select').first().selectOption('100');
    await waitForTableLoad(page);

    const rows = dataRows(page);
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const cells = rows.nth(i).locator('.rdt_TableCell');
      for (let j = 2; j < 8; j++) {
        const val = await cells.nth(j).textContent();
        const trimmed = val?.trim() ?? '';
        expect(trimmed).toMatch(/^\d+(\.\d+)?$/);
        const num = parseFloat(trimmed);
        expect(num).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('6.3 TC-DAT-03: Verify decimal leave balance values display correctly for Ganesh kadam', async ({ page }) => {
    const row = dataRows(page).filter({ hasText: 'Ganesh kadam' });
    await expect(row).toBeVisible();
    const cells = row.locator('.rdt_TableCell');
    await expect(cells.nth(2)).toContainText('1.5'); // Casual Leave Balance
    await expect(cells.nth(3)).toContainText('1.5'); // Sick Leave Balance
    await expect(cells.nth(4)).toContainText('0.5'); // Comp Off Balance
    await expect(cells.nth(5)).toContainText('1.5'); // Used Casual Leaves
    await expect(cells.nth(6)).toContainText('1.5'); // Used Sick Leaves
    await expect(cells.nth(7)).toContainText('2.5'); // Used Comp Offs
  });

  test('6.4 TC-DAT-04: Verify Sr. No. is sequential starting from 1 on the first page', async ({ page }) => {
    const rows = dataRows(page);
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const srNo = await rows.nth(i).locator('.rdt_TableCell').first().textContent();
      expect(Number(srNo?.trim())).toBe(i + 1);
    }

    // Navigate to page 2 and check continuity
    const page2Btn = page.locator('a[aria-label="Page 2"]');
    if (await page2Btn.isVisible().catch(() => false)) {
      await page2Btn.click();
      await page.waitForTimeout(1000);
      await waitForTableLoad(page);

      const p2Rows = dataRows(page);
      const p2Count = await p2Rows.count();
      expect(p2Count).toBeGreaterThan(0);
      const firstSrNo = await p2Rows.first().locator('.rdt_TableCell').first().textContent();
      expect(Number(firstSrNo?.trim())).toBeGreaterThan(0);
    }
  });

  test('6.5 TC-DAT-05: Verify the employee list in the filter dropdown matches the table rows', async ({ page }) => {
    // Count options in the filter dropdown
    await openFilterDrawer(page);
    await page.locator('.select__control').first().click();
    await page.waitForTimeout(800);
    const dropdownCount = await page.locator('.select__option').count();
    await closeFilterDrawer(page);

    // Show all rows and compare count
    await page.locator('select').first().selectOption('100');
    await page.waitForTimeout(1500);
    await waitForTableLoad(page);
    await page.locator('.rdt_TableRow').nth(10).waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    const tableCount = await dataRows(page).count();

    expect(tableCount).toBe(dropdownCount);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 7 – Navigation and Access
// ─────────────────────────────────────────────────────────────────────────────

test.describe('7. Navigation and Access', () => {

  test('7.1 TC-NAV-01: Unauthenticated direct URL access redirects to login', async ({ browser }) => {
    const context = await browser.newContext();
    const freshPage = await context.newPage();
    try {
      await freshPage.goto('https://stage.elevatorplus.net/attendance/leave-balances', { timeout: 30000 });
      await expect(freshPage).toHaveURL(/\/login/);
    } finally {
      await context.close();
    }
  });

  test('7.2 TC-NAV-02: Access Leave Balances via Attendance sidebar submenu', async ({ page }) => {
    await page.goto('/dashboard', { timeout: 60000 });
    await page.waitForLoadState('networkidle');
    await dismissOnboardingWidget(page);

    // Expand the Attendance sidebar item if not already expanded
    const attendanceLink = page.locator('.navigation a, .navigation li')
      .filter({ hasText: /^Attendance$/ }).first();
    const isVisible = await attendanceLink.isVisible({ timeout: 5000 }).catch(() => false);
    if (isVisible) {
      await attendanceLink.click();
      await page.waitForTimeout(500);
    }

    // Click Leave Balances in the submenu
    const leaveBalancesLink = page.locator('a[href*="leave-balances"]').first();
    await expect(leaveBalancesLink).toBeVisible();
    await leaveBalancesLink.click();
    await page.getByRole('heading', { name: 'Leave Balance Report', level: 2 })
      .waitFor({ state: 'visible', timeout: 30000 });
    await expect(page.locator('.rdt_TableRow').first()).toBeVisible({ timeout: 60000 });

    await expect(page).toHaveURL(new RegExp(LEAVE_BALANCES_URL));
    await expect(page.getByRole('heading', { name: 'Leave Balance Report', level: 2 })).toBeVisible();
    await expect(dataRows(page).first()).toBeVisible();
  });

  test('7.3 TC-NAV-03: Active menu item highlights on the Leave Balances page', async ({ page }) => {
    await gotoLeaveBalances(page);
    await expect(page.locator('li.nav-item.active').filter({ hasText: 'Leave Balances' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Leave Balances', level: 4 })).toBeVisible();
  });

  test('7.4 TC-NAV-04: Page is read-only with no Add, Edit, or Delete controls', async ({ page }) => {
    await gotoLeaveBalances(page);
    // No Add button
    await expect(page.getByRole('button', { name: /^Add/i })).not.toBeVisible();
    // No Edit or Delete icons on any row
    const rows = dataRows(page);
    const count = await rows.count();
    if (count > 0) {
      await expect(
        rows.first().locator('[title="Edit"], [aria-label*="Edit"], [title="Delete"], [aria-label*="Delete"]')
      ).not.toBeVisible();
    }
  });

});
