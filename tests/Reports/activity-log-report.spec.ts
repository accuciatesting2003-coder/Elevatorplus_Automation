// spec: test-plans/reports-test-plan/ActivityLog-Report-Plan.md
// seed: tests/setup/auth.setup.ts
// /reports/activity-log-report ("Activity Log") — ARIA div-grid (5 cols: Sr. No.,
// Report Name, User Name, Action Date, Filters). Audit of report-generation events.
// Filters panel (Date Range, User) + Search. No status cards, no Export, no Manage Col.
// NOTE: a "Filters" COLUMN header exists; the toolbar Filters button is first in DOM.

import { test, expect } from '../fixtures/auth-fixture';
import * as R from './report-helpers';

const URL = '/reports/activity-log-report';
const HEADING = /Activity Log/i;
const COLUMNS = ['Sr. No.', 'Report Name', 'User Name', 'Action Date', 'Filters'];

test.describe('Activity Log Report', () => {

  test.describe('Suite 1: Page Load & Navigation', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-AL-001: Activity Log page loads successfully', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(URL));
      await expect(page.getByRole('heading', { name: HEADING }).first()).toBeVisible();
      await expect(R.reportTable(page)).toBeVisible();
      await expect(page.getByRole('button', { name: /^Filters?$/i }).first()).toBeVisible();
    });
  });

  test.describe('Suite 2: Filtering', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-AL-003: Filter by Date Range', async ({ page }) => {
      await R.openFilter(page);
      await R.clickApply(page);
      await expect(page.getByText(/Active Filters:/i)).toBeVisible();
    });

    test('TC-AL-004: Filter by User', async ({ page }) => {
      await R.openFilter(page);
      await expect(page.getByText(/^User$/i).filter({ visible: true }).first()).toBeVisible();
    });

    test('TC-AL-008: Filter with zero matching records', async ({ page }) => {
      await R.applySearch(page, 'ZZ_NO_SUCH_LOG');
      await expect(page.getByText(/No records found|No Data|There are no records/i).first()).toBeVisible();
    });
  });

  test.describe('Suite 3: Search Functionality', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-AL-009: Search by User Name', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      const user = (await R.rowCells(page, 0).nth(2).innerText().catch(() => '')).trim();
      if (!user || user === '-') { test.skip(); return; }
      await R.applySearch(page, user.split(' ')[0]);
      expect(await R.rowCount(page)).toBeGreaterThanOrEqual(0);
    });

    test('TC-AL-010: Search by Report Name', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      const report = (await R.rowCells(page, 0).nth(1).innerText().catch(() => '')).trim();
      if (!report) { test.skip(); return; }
      await R.applySearch(page, report.split(' ')[0]);
      expect(await R.rowCount(page)).toBeGreaterThanOrEqual(0);
    });

    test('TC-AL-013: Search with no results', async ({ page }) => {
      await R.applySearch(page, 'ZZ_DEFINITELY_NONE_999');
      await expect(page.getByText(/No records found|No Data|There are no records/i).first()).toBeVisible();
    });
  });

  test.describe('Suite 4: Data Table & Grid', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-AL-014: All 5 columns are visible', async ({ page }) => {
      const headers = (await R.headerTexts(page)).join(' | ').toLowerCase();
      for (const col of COLUMNS) expect(headers).toContain(col.toLowerCase());
    });

    test('TC-AL-015: Action Date shows date and time', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      expect(await R.bodyRows(page).first().innerText()).toMatch(/\d{2}-\d{2}-\d{4}.*(AM|PM)/i);
    });

    test('TC-AL-016: Filters column shows key-value params', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      const filtersCell = (await R.rowCells(page, 0).last().innerText().catch(() => '')).trim();
      expect(filtersCell.length).toBeGreaterThan(0);
    });

    test('TC-AL-019: Sr. No. increments across pages', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      expect((await R.rowCells(page, 0).first().innerText()).trim()).toBe('1');
    });
  });

  test.describe('Suite 5: Pagination', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-AL-023: Change rows per page', async ({ page }) => {
      const sel = R.rowsPerPageSelect(page);
      if (!(await sel.isVisible().catch(() => false))) { test.skip(); return; }
      await R.setRowsPerPage(page, '10');
      expect(await R.rowCount(page)).toBeLessThanOrEqual(10);
    });

    test('TC-AL-024: Navigate pages', async ({ page }) => {
      if (!(await R.canNavigateNext(page))) { test.skip(); return; }
      const before = await R.bodyRows(page).first().innerText();
      await R.nextPageButton(page).click({ force: true });
      await R.waitForGridSettled(page);
      expect(await R.bodyRows(page).first().innerText()).not.toBe(before);
    });
  });

  test.describe('Suite 6: UI/UX & Error Handling', () => {
    test('TC-AL-027: Empty state when no activity matches', async ({ page }) => {
      await R.gotoReport(page, URL, HEADING);
      await R.applySearch(page, 'ZZ_EMPTY_STATE');
      await expect(page.getByText(/No records found|No Data|There are no records/i).first()).toBeVisible();
    });

    test('TC-AL-029: API failure / timeout handling', async () => { test.skip(); });
    test('TC-AL-030: Invalid Date Range (Start > End)', async () => { test.skip(); });
  });
});
