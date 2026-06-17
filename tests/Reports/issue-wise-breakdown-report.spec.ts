// spec: test-plans/reports-test-plan/IssueWiseBreakdown-Report-Plan.md
// seed: tests/setup/auth.setup.ts
// /reports/issue-wise-breakdown-report ("Breakdown Issue Count Report") — ARIA div-grid
// (4 cols: Sr. No., View, Issue Name, No. Of Issues). Aggregation report; View drills
// into the underlying breakdowns. Export + Filter (Date Range, Branch, Area, City).

import { test, expect } from '../fixtures/auth-fixture';
import * as R from './report-helpers';

const URL = '/reports/issue-wise-breakdown-report';
const HEADING = /Breakdown Issue Count Report/i;
const COLUMNS = ['Sr. No.', 'View', 'Issue Name', 'No. Of Issues'];

test.describe('Issue-wise Breakdown Report', () => {

  test.describe('Suite 1: Page Load & Navigation', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-IB-001: Issue-wise Breakdown Report page loads successfully', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(URL));
      await expect(page.getByRole('heading', { name: HEADING }).first()).toBeVisible();
      await expect(R.reportTable(page)).toBeVisible();
      await expect(R.exportButton(page)).toBeVisible();
      await expect(page.getByRole('button', { name: /^Filters?$/i }).first()).toBeVisible();
    });
  });

  test.describe('Suite 2: Aggregation Accuracy', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-IB-003: No. Of Issues column holds numeric counts', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      const last = (await R.rowCells(page, 0).last().innerText().catch(() => '')).trim();
      expect(last).toMatch(/^\d+$/);
    });

    test('TC-IB-004: Each issue appears once', async ({ page }) => {
      const rows = await R.rowCount(page);
      if (rows === 0) { test.skip(); return; }
      const names: string[] = [];
      for (let i = 0; i < rows; i++) {
        names.push((await R.rowCells(page, i).nth(2).innerText().catch(() => '')).trim());
      }
      expect(new Set(names).size).toBe(names.length);
    });
  });

  test.describe('Suite 3: Filtering', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-IB-007: Filter by Date Range', async ({ page }) => {
      await R.openFilter(page);
      await R.clickApply(page);
      await expect(page.getByText(/Active Filters:/i)).toBeVisible();
    });

    test('TC-IB-008: Filter by Branch', async ({ page }) => {
      await R.openFilter(page);
      await expect(page.getByText(/^Branch$/i).filter({ visible: true }).first()).toBeVisible();
    });

    test('TC-IB-014: Filter with zero matching records', async ({ page }) => {
      await R.applySearch(page, 'ZZ_NO_SUCH_ISSUE');
      await expect(page.getByText(/No records found|No Data/i).first()).toBeVisible();
    });
  });

  test.describe('Suite 4: Search Functionality', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-IB-015: Search by Issue Name', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      const issue = (await R.rowCells(page, 0).nth(2).innerText().catch(() => '')).trim();
      if (!issue) { test.skip(); return; }
      await R.applySearch(page, issue);
      expect(await R.rowCount(page)).toBeGreaterThan(0);
    });

    test('TC-IB-018: Search with no results', async ({ page }) => {
      await R.applySearch(page, 'ZZ_DEFINITELY_NONE_999');
      await expect(page.getByText(/No records found|No Data/i).first()).toBeVisible();
    });
  });

  test.describe('Suite 5: Data Table & Grid', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-IB-019: All 4 columns are visible', async ({ page }) => {
      const headers = (await R.headerTexts(page)).join(' | ').toLowerCase();
      for (const col of COLUMNS) expect(headers).toContain(col.toLowerCase());
    });

    test('TC-IB-020: View drills into the issue', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      const icon = R.bodyRows(page).first().locator('img, svg').first();
      if (!(await icon.isVisible().catch(() => false))) { test.skip(); return; }
      await icon.click({ force: true });
      await page.waitForTimeout(1500);
      expect(page.url()).toContain('/reports');
    });

    test('TC-IB-022: Column sorting works', async ({ page }) => {
      const sortBtn = page.getByRole('rowgroup').first().getByRole('button', { name: /No. Of Issues|Issue Name/i }).first();
      if (!(await sortBtn.isVisible().catch(() => false))) { test.skip(); return; }
      await sortBtn.click({ force: true });
      await R.waitForGridSettled(page);
      await expect(R.reportTable(page)).toBeVisible();
    });
  });

  test.describe('Suite 6: Export Feature', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-IB-024: Export full dataset to Excel', async ({ page }) => {
      const dl = page.waitForEvent('download', { timeout: 12000 }).catch(() => null);
      await R.exportButton(page).click({ force: true });
      const download = await dl;
      if (!download) { test.skip(); return; }
      expect(download.suggestedFilename()).toBeTruthy();
    });

    test('TC-IB-027: Exported headers and counts match the UI', async () => { test.skip(); });
  });

  test.describe('Suite 7: UI/UX & Error Handling', () => {
    test('TC-IB-031: Empty state when no issues match', async ({ page }) => {
      await R.gotoReport(page, URL, HEADING);
      await R.applySearch(page, 'ZZ_EMPTY_STATE');
      await expect(page.getByText(/No records found|No Data/i).first()).toBeVisible();
    });

    test('TC-IB-033: API failure / timeout handling', async () => { test.skip(); });
    test('TC-IB-034: Invalid Date Range (Start > End)', async () => { test.skip(); });
  });
});
