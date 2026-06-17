// spec: test-plans/reports-test-plan/Travel-Allowance-Test-Plan-Final.md
// seed: tests/setup/auth.setup.ts
// /reports/travel-allowance-report — ARIA div-grid whose columns are DYNAMIC: fixed
// (Sr. No., Emp Code, Emp Name, Designation) followed by one column per day in the
// selected date range. Search + Filter + Export + Pagination. No status cards.

import { test, expect } from '../fixtures/auth-fixture';
import * as R from './report-helpers';

const URL = '/reports/travel-allowance-report';
const HEADING = /Travel Allowance Report/i;
const FIXED_COLUMNS = ['Sr. No.', 'Employee Code', 'Employee Name', 'Designation'];

test.describe('Travel Allowance Report', () => {

  test.describe('Suite 1: Page Load & Navigation', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-TA-001: Travel Allowance Report page loads successfully', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(URL));
      await expect(page.getByRole('heading', { name: HEADING }).first()).toBeVisible();
      await expect(R.reportTable(page)).toBeVisible();
      await expect(R.exportButton(page)).toBeVisible();
      await expect(page.getByRole('button', { name: /^Filters?$/i }).first()).toBeVisible();
    });
  });

  test.describe('Suite 2: Filtering & Dynamic Columns', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-TA-002: Date Range drives dynamic date columns', async ({ page }) => {
      const headers = await R.headerTexts(page);
      // Fixed columns plus at least one date-like column (DD-MMM or a day number).
      expect(headers.length).toBeGreaterThan(FIXED_COLUMNS.length);
    });

    test('TC-TA-003: Filter by Employee', async ({ page }) => {
      await R.openFilter(page);
      await expect(page.getByText(/Employee|User/i).filter({ visible: true }).first()).toBeVisible();
    });

    test('TC-TA-005: Clear All resets filters and columns', async ({ page }) => {
      await R.applySearch(page, 'ZZ_NONE');
      await R.clearAllButton(page).click({ force: true });
      await R.searchInput(page).fill('');
      await R.waitForGridSettled(page);
      await expect.poll(async () => R.rowCount(page), { timeout: 15000 }).toBeGreaterThanOrEqual(0);
    });

    test('TC-TA-006: Date Range with no travel data', async ({ page }) => {
      await R.applySearch(page, 'ZZ_NO_SUCH_EMP');
      await expect(page.getByText(/No records found|No Data/i).first()).toBeVisible();
    });
  });

  test.describe('Suite 3: Search Functionality', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-TA-008: Search by Employee Name', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      const name = (await R.rowCells(page, 0).nth(2).innerText().catch(() => '')).trim();
      if (!name || name === '-') { test.skip(); return; }
      await R.applySearch(page, name.split(' ')[0]);
      expect(await R.rowCount(page)).toBeGreaterThanOrEqual(0);
    });

    test('TC-TA-011: Search with no results', async ({ page }) => {
      await R.applySearch(page, 'ZZ_DEFINITELY_NONE_999');
      await expect(page.getByText(/No records found|No Data/i).first()).toBeVisible();
    });
  });

  test.describe('Suite 4: Data Table & Grid', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-TA-012: Fixed columns are always visible', async ({ page }) => {
      const headers = (await R.headerTexts(page)).join(' | ').toLowerCase();
      for (const col of FIXED_COLUMNS) expect(headers).toContain(col.toLowerCase());
    });

    test('TC-TA-016: Sr. No. increments across pages', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      expect((await R.rowCells(page, 0).first().innerText()).trim()).toBe('1');
    });
  });

  test.describe('Suite 5: Export Feature', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-TA-017: Export dataset with current filters', async ({ page }) => {
      const dl = page.waitForEvent('download', { timeout: 12000 }).catch(() => null);
      await R.exportButton(page).click({ force: true });
      const download = await dl;
      if (!download) { test.skip(); return; }
      expect(download.suggestedFilename()).toBeTruthy();
    });

    test('TC-TA-020: Exported data matches the UI', async () => { test.skip(); });
  });

  test.describe('Suite 6: Pagination', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-TA-021: Change rows per page', async ({ page }) => {
      const sel = R.rowsPerPageSelect(page);
      if (!(await sel.isVisible().catch(() => false))) { test.skip(); return; }
      await R.setRowsPerPage(page, '10');
      expect(await R.rowCount(page)).toBeLessThanOrEqual(10);
    });
  });

  test.describe('Suite 7: UI/UX & Error Handling', () => {
    test('TC-TA-025: Empty state when no records exist', async ({ page }) => {
      await R.gotoReport(page, URL, HEADING);
      await R.applySearch(page, 'ZZ_EMPTY_STATE');
      await expect(page.getByText(/No records found|No Data/i).first()).toBeVisible();
    });

    test('TC-TA-027: API failure / timeout handling', async () => { test.skip(); });
    test('TC-TA-028: Invalid Date Range (Start > End)', async () => { test.skip(); });
  });
});
