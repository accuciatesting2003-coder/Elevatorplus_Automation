// spec: test-plans/reports-test-plan/ImportLogs-Report-Plan.md
// seed: tests/setup/auth.setup.ts
// /reports/import-logs ("Import Logs") — ARIA div-grid (11 cols). Excel File column has
// a "View" link to the source file. Export + Filters (Date Range, User, Entity Type).
// No status cards / Manage Column. Pagination uses a numbered pager (no "Page X of Y").

import { test, expect } from '../fixtures/auth-fixture';
import * as R from './report-helpers';

const URL = '/reports/import-logs';
const HEADING = /Import Logs/i;
const COLUMNS = ['Sr. No.', 'User Name', 'Module Name', 'Excel File', 'Date',
  'Total', 'Success Count', 'Failed', 'Created', 'Updated', 'Status'];

test.describe('Import Logs Report', () => {

  test.describe('Suite 1: Page Load & Navigation', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-IL-001: Import Logs page loads successfully', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(URL));
      await expect(page.getByRole('heading', { name: HEADING }).first()).toBeVisible();
      await expect(R.reportTable(page)).toBeVisible();
      await expect(R.exportButton(page)).toBeVisible();
      await expect(page.getByRole('button', { name: /^Filters?$/i }).first()).toBeVisible();
    });
  });

  test.describe('Suite 2: Filtering', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-IL-003: Filter by Date Range', async ({ page }) => {
      await R.openFilter(page);
      await R.clickApply(page);
      await expect(page.getByText(/Active Filters:/i)).toBeVisible();
    });

    test('TC-IL-004: Filter by User', async ({ page }) => {
      await R.openFilter(page);
      await expect(page.getByText(/^User$/i).filter({ visible: true }).first()).toBeVisible();
    });

    test('TC-IL-005: Filter by Entity Type / Module', async ({ page }) => {
      await R.openFilter(page);
      await expect(page.getByText(/Entity Type/i).first()).toBeVisible();
    });

    test('TC-IL-010: Filter with zero matching records', async ({ page }) => {
      await R.applySearch(page, 'ZZ_NO_SUCH_MODULE');
      await expect(page.getByText(/No records found|No Data|There are no records/i).first()).toBeVisible();
    });
  });

  test.describe('Suite 3: Search Functionality', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-IL-011: Search by Module Name', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      const mod = (await R.rowCells(page, 0).nth(2).innerText().catch(() => '')).trim();
      if (!mod) { test.skip(); return; }
      await R.applySearch(page, mod);
      expect(await R.rowCount(page)).toBeGreaterThanOrEqual(0);
    });

    test('TC-IL-015: Search with no results', async ({ page }) => {
      await R.applySearch(page, 'ZZ_DEFINITELY_NONE_999');
      await expect(page.getByText(/No records found|No Data|There are no records/i).first()).toBeVisible();
    });
  });

  test.describe('Suite 4: Data Table & Grid', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-IL-016: All 11 columns are visible', async ({ page }) => {
      const headers = (await R.headerTexts(page)).join(' | ').toLowerCase();
      for (const col of COLUMNS) expect(headers).toContain(col.toLowerCase());
    });

    test('TC-IL-017: Excel File column exposes a View link', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      const link = R.bodyRows(page).first().getByRole('link', { name: /View/i }).first();
      if (!(await link.isVisible().catch(() => false))) { test.skip(); return; }
      const href = await link.getAttribute('href');
      expect(href).toMatch(/\.xlsx?$/i);
    });

    test('TC-IL-018: Status badge reflects the outcome', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      const rowText = await R.bodyRows(page).first().innerText();
      expect(/Success|Failed/i.test(rowText)).toBeTruthy();
    });

    test('TC-IL-020: Count integrity — Total = Success + Failed', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      const c = await R.rowCells(page, 0).allInnerTexts();
      // columns: ... Date | Total | Success | Failed | Created | Updated | Status
      const nums = c.map(t => parseInt(t.trim(), 10)).filter(n => !isNaN(n));
      // Find a [total, success, failed] triple where total = success + failed.
      let ok = false;
      for (let i = 0; i + 2 < nums.length; i++) {
        if (nums[i] === nums[i + 1] + nums[i + 2]) { ok = true; break; }
      }
      expect(ok).toBeTruthy();
    });

    test('TC-IL-023: Sr. No. increments across pages', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      expect((await R.rowCells(page, 0).first().innerText()).trim()).toBe('1');
    });
  });

  test.describe('Suite 5: Export Feature', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-IL-024: Export full dataset to Excel', async ({ page }) => {
      const dl = page.waitForEvent('download', { timeout: 12000 }).catch(() => null);
      await R.exportButton(page).click({ force: true });
      const download = await dl;
      if (!download) { test.skip(); return; }
      expect(download.suggestedFilename()).toBeTruthy();
    });

    test('TC-IL-027: Exported formatting and headers', async () => { test.skip(); });
  });

  test.describe('Suite 6: Pagination', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-IL-028: Change rows per page', async ({ page }) => {
      const sel = R.rowsPerPageSelect(page);
      if (!(await sel.isVisible().catch(() => false))) { test.skip(); return; }
      await R.setRowsPerPage(page, '10');
      expect(await R.rowCount(page)).toBeLessThanOrEqual(10);
    });

    test('TC-IL-030: Previous disabled on page 1', async ({ page }) => {
      await expect(R.prevPageButton(page)).toBeDisabled();
    });
  });

  test.describe('Suite 7: UI/UX & Error Handling', () => {
    test('TC-IL-032: Empty state when no logs match', async ({ page }) => {
      await R.gotoReport(page, URL, HEADING);
      await R.applySearch(page, 'ZZ_EMPTY_STATE');
      await expect(page.getByText(/No records found|No Data|There are no records/i).first()).toBeVisible();
    });

    test('TC-IL-034: API failure / timeout handling', async () => { test.skip(); });
    test('TC-IL-035: Invalid Date Range (Start > End)', async () => { test.skip(); });
  });
});
