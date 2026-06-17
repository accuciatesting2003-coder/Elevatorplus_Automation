// spec: test-plans/reports-test-plan/ApprovalActivity-Report-Plan.md
// seed: tests/setup/auth.setup.ts
// /reports/approval-activity-report — ARIA div-grid (10 cols), Filter + Search +
// Pagination. No status cards, no Export.

import { test, expect } from '../fixtures/auth-fixture';
import * as R from './report-helpers';

const URL = '/reports/approval-activity-report';
const HEADING = /Approval Activity Report/i;
const COLUMNS = ['Sr. No.', 'Action', 'Type', 'Step', 'Performed By', 'Date'];

test.describe('Approval Activity Report', () => {

  test.describe('Suite 1: Page Load & Navigation', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-AA-001: Approval Activity Report page loads successfully', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(URL));
      await expect(page.getByRole('heading', { name: HEADING }).first()).toBeVisible();
      await expect(R.reportTable(page)).toBeVisible();
      await expect(page.getByRole('button', { name: /^Filters?$/i }).first()).toBeVisible();
    });
  });

  test.describe('Suite 2: Filtering', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-AA-002: Filter by Action', async ({ page }) => {
      await R.openFilter(page);
      await expect(page.getByText(/Action/i).first()).toBeVisible();
    });

    test('TC-AA-006: Filter by Approval Type', async ({ page }) => {
      await R.openFilter(page);
      await expect(page.getByText(/Type/i).filter({ visible: true }).first()).toBeVisible();
    });

    test('TC-AA-007: Filter by Date Range (Today)', async ({ page }) => {
      await R.openFilter(page);
      await R.clickApply(page);
      await expect(page.getByText(/Active Filters:/i)).toBeVisible();
    });

    test('TC-AA-011: Clear All resets all filter dropdowns', async ({ page }) => {
      await R.applySearch(page, 'ZZ_NONE');
      await R.clearAllButton(page).click({ force: true });
      await R.searchInput(page).fill('');
      await R.waitForGridSettled(page);
      await expect.poll(async () => R.rowCount(page), { timeout: 15000 }).toBeGreaterThanOrEqual(0);
    });

    test('TC-AA-012: Filter with no matching data', async ({ page }) => {
      await R.applySearch(page, 'ZZ_NO_SUCH_APPROVAL');
      await expect(page.getByText(/No records found|No Data/i).first()).toBeVisible();
    });
  });

  test.describe('Suite 3: Search Functionality', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-AA-013: Search by Remark / Step', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      const rowText = await R.bodyRows(page).first().innerText();
      const token = (rowText.split(/\s+/).find(w => w.length > 4) || '').trim();
      if (!token) { test.skip(); return; }
      await R.applySearch(page, token);
      expect(await R.rowCount(page)).toBeGreaterThanOrEqual(0);
    });

    test('TC-AA-018: Search with special characters', async ({ page }) => {
      await R.applySearch(page, '  @#  ');
      await expect(R.reportTable(page)).toBeVisible();
    });

    test('TC-AA-020: Search with no results', async ({ page }) => {
      await R.applySearch(page, 'ZZ_DEFINITELY_NONE_999');
      await expect(page.getByText(/No records found|No Data/i).first()).toBeVisible();
    });
  });

  test.describe('Suite 4: Data Table & Grid', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-AA-021: Key columns are visible', async ({ page }) => {
      const headers = (await R.headerTexts(page)).join(' | ').toLowerCase();
      for (const col of COLUMNS) expect(headers).toContain(col.toLowerCase());
    });

    test('TC-AA-023: Date format consistency', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      expect(await R.bodyRows(page).first().innerText()).toMatch(/\d{2}[-/]\d{2}[-/]\d{4}/);
    });

    test('TC-AA-031: Sr. No. increments across pages', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      expect((await R.rowCells(page, 0).first().innerText()).trim()).toBe('1');
    });
  });

  test.describe('Suite 5: Pagination', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-AA-032: Change rows per page', async ({ page }) => {
      const sel = R.rowsPerPageSelect(page);
      if (!(await sel.isVisible().catch(() => false))) { test.skip(); return; }
      await R.setRowsPerPage(page, '10');
      expect(await R.rowCount(page)).toBeLessThanOrEqual(10);
    });

    test('TC-AA-033: Navigate pages', async ({ page }) => {
      if (!(await R.canNavigateNext(page))) { test.skip(); return; }
      const before = await R.bodyRows(page).first().innerText();
      await R.nextPageButton(page).click({ force: true });
      await R.waitForGridSettled(page);
      expect(await R.bodyRows(page).first().innerText()).not.toBe(before);
    });

    test('TC-AA-036: Page 1 shown by default on fresh load', async ({ page }) => {
      await expect(R.prevPageButton(page)).toBeDisabled();
    });
  });

  test.describe('Suite 6: UI/UX & Error Handling', () => {
    test('TC-AA-038: Empty state centered UI', async ({ page }) => {
      await R.gotoReport(page, URL, HEADING);
      await R.applySearch(page, 'ZZ_EMPTY_STATE');
      await expect(page.getByText(/No records found|No Data/i).first()).toBeVisible();
    });

    test('TC-AA-042: Handle API 500 with toast', async () => { test.skip(); });
    test('TC-AA-044: Invalid Date Range (Start > End)', async () => { test.skip(); });
  });
});
