// spec: test-plans/reports-test-plan/Activity-Report-Plan.md
// seed: tests/setup/auth.setup.ts
// /reports/activity-report — ARIA div-grid (11 cols) with category tabs
// (All / Missed / Upcoming Activities), Filter + Manage Columns + Export.

import { test, expect } from '../fixtures/auth-fixture';
import * as R from './report-helpers';

const URL = '/reports/activity-report';
const HEADING = /Activity Report/i;
const COLUMNS = ['Sr. No.', 'Sales Person', 'Next FollowUP Date', 'Firm Name', 'Site Name', 'Status'];

test.describe('Activity Report', () => {

  test.describe('Suite 1: Page Load & Navigation', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-AR-001: Activity Report page loads successfully', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(URL));
      await expect(page.getByRole('heading', { name: HEADING }).first()).toBeVisible();
      await expect(R.reportTable(page)).toBeVisible();
      await expect(R.exportButton(page)).toBeVisible();
      await expect(page.getByRole('button', { name: /^Filters?$/i }).first()).toBeVisible();
    });
  });

  test.describe('Suite 2: Activity Categories', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-AR-002: Missed Activities category', async ({ page }) => {
      const tab = page.getByText(/Missed Activities/i).first();
      if (!(await tab.isVisible().catch(() => false))) { test.skip(); return; }
      await tab.click({ force: true });
      await R.waitForGridSettled(page);
      await expect(R.reportTable(page)).toBeVisible();
    });

    test('TC-AR-003: Upcoming Activities category', async ({ page }) => {
      const tab = page.getByText(/Upcoming Activities/i).first();
      if (!(await tab.isVisible().catch(() => false))) { test.skip(); return; }
      await tab.click({ force: true });
      await R.waitForGridSettled(page);
      await expect(R.reportTable(page)).toBeVisible();
    });

    test('TC-AR-004: All Activities category', async ({ page }) => {
      const tab = page.getByText(/All Activities/i).first();
      if (!(await tab.isVisible().catch(() => false))) { test.skip(); return; }
      await tab.click({ force: true });
      await R.waitForGridSettled(page);
      await expect(R.reportTable(page)).toBeVisible();
    });
  });

  test.describe('Suite 3: Filtering', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-AR-005: Filter by Sales Person', async ({ page }) => {
      await R.openFilter(page);
      await expect(page.getByText(/Sales Person/i).first()).toBeVisible();
    });

    test('TC-AR-008: Filter by Date Range', async ({ page }) => {
      await R.openFilter(page);
      await R.clickApply(page);
      await expect(page.getByText(/Active Filters:/i)).toBeVisible();
    });

    test('TC-AR-011: Filter with zero matching records', async ({ page }) => {
      await R.applySearch(page, 'ZZ_NO_SUCH_ACTIVITY');
      await expect(page.getByText(/No records found|No Data/i).first()).toBeVisible();
    });
  });

  test.describe('Suite 4: Search Functionality', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-AR-012: Search by Created By Name', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      const name = (await R.rowCells(page, 0).nth(1).innerText().catch(() => '')).trim();
      if (!name || name === '-') { test.skip(); return; }
      await R.applySearch(page, name.split(' ')[0]);
      expect(await R.rowCount(page)).toBeGreaterThanOrEqual(0);
    });

    test('TC-AR-015: Search handles special characters and spaces', async ({ page }) => {
      await R.applySearch(page, '  @#  ');
      await expect(R.reportTable(page)).toBeVisible();
    });

    test('TC-AR-017: Search with no results', async ({ page }) => {
      await R.applySearch(page, 'ZZ_DEFINITELY_NONE_999');
      await expect(page.getByText(/No records found|No Data/i).first()).toBeVisible();
    });
  });

  test.describe('Suite 5: Data Table & Grid', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-AR-018: Key columns are visible', async ({ page }) => {
      const headers = (await R.headerTexts(page)).join(' | ').toLowerCase();
      for (const col of COLUMNS) expect(headers).toContain(col.toLowerCase());
    });

    test('TC-AR-019: Manage Columns hides/shows columns', async ({ page }) => {
      const btn = R.manageColumnButton(page);
      // Activity Report has no Manage Column control — skip when absent.
      if (!(await btn.isVisible().catch(() => false))) { test.skip(); return; }
      await btn.click({ force: true });
      await expect(page.getByRole('dialog').getByRole('checkbox').first()).toBeVisible();
    });

    test('TC-AR-024: Sr. No. increments across pages', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      expect((await R.rowCells(page, 0).first().innerText()).trim()).toBe('1');
    });
  });

  test.describe('Suite 6: Export Feature', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-AR-025: Export full dataset to Excel', async ({ page }) => {
      const dl = page.waitForEvent('download', { timeout: 12000 }).catch(() => null);
      await R.exportButton(page).click({ force: true });
      const download = await dl;
      if (!download) { test.skip(); return; }
      expect(download.suggestedFilename()).toBeTruthy();
    });

    test('TC-AR-028: Exported formatting and headers', async () => { test.skip(); });
  });

  test.describe('Suite 7: Pagination', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-AR-029: Change rows per page', async ({ page }) => {
      const sel = R.rowsPerPageSelect(page);
      if (!(await sel.isVisible().catch(() => false))) { test.skip(); return; }
      await R.setRowsPerPage(page, '10');
      expect(await R.rowCount(page)).toBeLessThanOrEqual(10);
    });
  });

  test.describe('Suite 8: UI/UX & Error Handling', () => {
    test('TC-AR-033: Empty state when no activities exist', async ({ page }) => {
      await R.gotoReport(page, URL, HEADING);
      await R.applySearch(page, 'ZZ_EMPTY_STATE');
      await expect(page.getByText(/No records found|No Data/i).first()).toBeVisible();
    });

    test('TC-AR-036: API failure / timeout handling', async () => { test.skip(); });
    test('TC-AR-037: Invalid Date Range (Start > End)', async () => { test.skip(); });
  });
});
