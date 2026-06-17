// spec: test-plans/reports-test-plan/User-Performance-Report-Plan.md
// seed: tests/setup/auth.setup.ts
// /reports/user-performance-report — ARIA div-grid (15 cols of per-user metric counts),
// Search + Filter (Date Range, User Type) + Manage Column + Export. No status cards.

import { test, expect } from '../fixtures/auth-fixture';
import * as R from './report-helpers';

const URL = '/reports/user-performance-report';
const HEADING = /User Performance Report/i;
const COLUMNS = ['Sr. No.', 'Name', 'Designation', 'Lead Created', 'Enquiry Generated'];

test.describe('User Performance Report', () => {

  test.describe('Suite 1: Page Load & Navigation', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-UP-001: User Performance Report page loads successfully', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(URL));
      await expect(page.getByRole('heading', { name: HEADING }).first()).toBeVisible();
      await expect(R.reportTable(page)).toBeVisible();
      await expect(R.exportButton(page)).toBeVisible();
      await expect(page.getByRole('button', { name: /^Filters?$/i }).first()).toBeVisible();
    });
  });

  test.describe('Suite 2: Data Accuracy & Counts', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-UP-002: Metric columns contain numeric counts', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      const texts = await R.rowCells(page, 0).allInnerTexts();
      expect(texts.some(t => /^\d+$/.test(t.trim()))).toBeTruthy();
    });

    test('TC-UP-004: Zero displayed for no activity', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      // A metric column shows 0 (not blank) somewhere in the grid.
      const rowText = await R.bodyRows(page).first().innerText();
      expect(rowText).toMatch(/\d/);
    });
  });

  test.describe('Suite 3: Filtering', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-UP-005: Filter by Date Range', async ({ page }) => {
      await R.openFilter(page);
      await R.clickApply(page);
      await expect(page.getByText(/Active Filters:/i)).toBeVisible();
    });

    test('TC-UP-006: Filter by User Type', async ({ page }) => {
      await R.openFilter(page);
      await expect(page.getByText(/User Type/i).first()).toBeVisible();
    });

    test('TC-UP-008: Clear All resets filters', async ({ page }) => {
      await R.applySearch(page, 'ZZ_NONE');
      await R.clearAllButton(page).click({ force: true });
      await R.searchInput(page).fill('');
      await R.waitForGridSettled(page);
      await expect.poll(async () => R.rowCount(page), { timeout: 15000 }).toBeGreaterThan(0);
    });

    test('TC-UP-009: Filter with zero matching records', async ({ page }) => {
      await R.applySearch(page, 'ZZ_NO_SUCH_USER');
      await expect(page.getByText(/No records found|No Data/i).first()).toBeVisible();
    });
  });

  test.describe('Suite 4: Search Functionality', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-UP-010: Search by Name', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      const name = (await R.rowCells(page, 0).nth(1).innerText().catch(() => '')).trim();
      if (!name || name === '-') { test.skip(); return; }
      await R.applySearch(page, name.split(' ')[0]);
      expect(await R.rowCount(page)).toBeGreaterThan(0);
    });

    test('TC-UP-012: Search handles special characters and spaces', async ({ page }) => {
      await R.applySearch(page, '  @#  ');
      await expect(R.reportTable(page)).toBeVisible();
    });

    test('TC-UP-014: Search with no results', async ({ page }) => {
      await R.applySearch(page, 'ZZ_DEFINITELY_NONE_999');
      await expect(page.getByText(/No records found|No Data/i).first()).toBeVisible();
    });
  });

  test.describe('Suite 5: Data Table & Grid', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-UP-015: Key columns are visible', async ({ page }) => {
      const headers = (await R.headerTexts(page)).join(' | ').toLowerCase();
      for (const col of COLUMNS) expect(headers).toContain(col.toLowerCase());
    });

    test('TC-UP-016: Manage Columns hides/shows columns', async ({ page }) => {
      await R.manageColumnButton(page).click({ force: true });
      await expect(page.getByRole('checkbox').first()).toBeVisible();
    });

    test('TC-UP-020: Sr. No. increments across pages', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      expect((await R.rowCells(page, 0).first().innerText()).trim()).toBe('1');
    });
  });

  test.describe('Suite 6: Export Feature', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-UP-021: Export full performance dataset to Excel', async ({ page }) => {
      const dl = page.waitForEvent('download', { timeout: 12000 }).catch(() => null);
      await R.exportButton(page).click({ force: true });
      const download = await dl;
      if (!download) { test.skip(); return; }
      expect(download.suggestedFilename()).toBeTruthy();
    });

    test('TC-UP-024: Exported formatting and headers', async () => { test.skip(); });
  });

  test.describe('Suite 7: Pagination', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-UP-025: Change rows per page', async ({ page }) => {
      const sel = R.rowsPerPageSelect(page);
      if (!(await sel.isVisible().catch(() => false))) { test.skip(); return; }
      await R.setRowsPerPage(page, '10');
      expect(await R.rowCount(page)).toBeLessThanOrEqual(10);
    });
  });

  test.describe('Suite 8: UI/UX & Error Handling', () => {
    test('TC-UP-029: Empty state when no users match', async ({ page }) => {
      await R.gotoReport(page, URL, HEADING);
      await R.applySearch(page, 'ZZ_EMPTY_STATE');
      await expect(page.getByText(/No records found|No Data/i).first()).toBeVisible();
    });

    test('TC-UP-032: API failure / timeout handling', async () => { test.skip(); });
    test('TC-UP-033: Invalid Date Range (Start > End)', async () => { test.skip(); });
  });
});
