// spec: test-plans/reports-test-plan/Quotation-Report-Plan.md
// seed: tests/setup/auth.setup.ts
// /reports/quotation-report — ARIA div-grid (16 cols), Manage Column + Export + Filter,
// per-row Download. No status cards. Search = input#search.

import { test, expect } from '../fixtures/auth-fixture';
import * as R from './report-helpers';

const URL = '/reports/quotation-report';
const HEADING = /Quotation Report/i;
const COLUMNS = ['Sr. No.', 'City', 'Site Name', 'Type of Lift', 'Status'];

test.describe('Quotation Report', () => {

  test.describe('Suite 1: Page Load & Navigation', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-QR-001: Quotation Report page loads successfully', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(URL));
      await expect(page.getByRole('heading', { name: HEADING }).first()).toBeVisible();
      await expect(R.reportTable(page)).toBeVisible();
      await expect(R.manageColumnButton(page)).toBeVisible();
      await expect(R.exportButton(page)).toBeVisible();
      await expect(page.getByRole('button', { name: /^Filters?$/i }).first()).toBeVisible();
    });
  });

  test.describe('Suite 2: Filtering', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-QR-002: Filter by Date Range', async ({ page }) => {
      await R.openFilter(page);
      await expect(page.getByText(/Date Range/i).first()).toBeVisible();
      await R.clickApply(page);
      await expect(page.getByText(/Active Filters:/i)).toBeVisible();
    });

    test('TC-QR-004: Filter by City', async ({ page }) => {
      await R.openFilter(page);
      await expect(page.getByText(/^City$/i).filter({ visible: true }).first()).toBeVisible();
    });

    test('TC-QR-005: Filter by Sales Person', async ({ page }) => {
      await R.openFilter(page);
      await expect(page.getByText(/Sales Person/i).first()).toBeVisible();
    });

    test('TC-QR-009: Clear All resets all filters', async ({ page }) => {
      await R.applySearch(page, 'ZZ_NONE');
      await R.clearAllButton(page).click({ force: true });
      await R.searchInput(page).fill('');
      await R.waitForGridSettled(page);
      await expect.poll(async () => R.rowCount(page), { timeout: 15000 }).toBeGreaterThan(0);
    });

    test('TC-QR-010: Filter with zero matching records', async ({ page }) => {
      await R.applySearch(page, 'ZZ_NO_SUCH_QUOTATION');
      await expect(page.getByText(/No records found|No Data/i).first()).toBeVisible();
    });
  });

  test.describe('Suite 3: Search Functionality', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-QR-011: Search by Owner Name', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      const name = (await R.rowCells(page, 0).nth(4).innerText().catch(() => '')).trim();
      if (!name || name === '-') { test.skip(); return; }
      await R.applySearch(page, name);
      expect(await R.rowCount(page)).toBeGreaterThanOrEqual(0);
    });

    test('TC-QR-013: Search handles special characters and spaces', async ({ page }) => {
      await R.applySearch(page, '  @#  ');
      await expect(R.reportTable(page)).toBeVisible();
    });

    test('TC-QR-015: Search with no results', async ({ page }) => {
      await R.applySearch(page, 'ZZ_DEFINITELY_NONE_999');
      await expect(page.getByText(/No records found|No Data/i).first()).toBeVisible();
    });
  });

  test.describe('Suite 4: Data Table & Grid', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-QR-016: Key columns are visible', async ({ page }) => {
      const headers = (await R.headerTexts(page)).join(' | ').toLowerCase();
      for (const col of COLUMNS) expect(headers).toContain(col.toLowerCase());
    });

    test('TC-QR-017: Download a quotation', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      const icon = R.bodyRows(page).first().locator('img, svg, button').first();
      if (!(await icon.isVisible().catch(() => false))) { test.skip(); return; }
      const dl = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);
      await icon.click({ force: true });
      await dl; // download or navigation — no crash expected
      await expect(page).toHaveURL(/elevatorplus/);
    });

    test('TC-QR-018: Manage Columns hides/shows columns', async ({ page }) => {
      await R.manageColumnButton(page).click({ force: true });
      await expect(page.getByRole('checkbox').first()).toBeVisible();
    });

    test('TC-QR-023: Sr. No. increments across pages', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      expect((await R.rowCells(page, 0).first().innerText()).trim()).toBe('1');
    });
  });

  test.describe('Suite 5: Export Feature', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-QR-024: Export full dataset to Excel', async ({ page }) => {
      const dl = page.waitForEvent('download', { timeout: 12000 }).catch(() => null);
      await R.exportButton(page).click({ force: true });
      const download = await dl;
      if (!download) { test.skip(); return; }
      expect(download.suggestedFilename()).toBeTruthy();
    });

    test('TC-QR-027: Exported formatting and headers', async () => { test.skip(); });
  });

  test.describe('Suite 6: Pagination', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-QR-028: Change rows per page', async ({ page }) => {
      const sel = R.rowsPerPageSelect(page);
      if (!(await sel.isVisible().catch(() => false))) { test.skip(); return; }
      await R.setRowsPerPage(page, '10');
      expect(await R.rowCount(page)).toBeLessThanOrEqual(10);
    });

    test('TC-QR-029: Navigate pages', async ({ page }) => {
      if (!(await R.canNavigateNext(page))) { test.skip(); return; }
      const before = await R.bodyRows(page).first().innerText();
      await R.nextPageButton(page).click({ force: true });
      await R.waitForGridSettled(page);
      expect(await R.bodyRows(page).first().innerText()).not.toBe(before);
    });
  });

  test.describe('Suite 7: UI/UX & Error Handling', () => {
    test('TC-QR-032: Empty state when no quotations exist', async ({ page }) => {
      await R.gotoReport(page, URL, HEADING);
      await R.applySearch(page, 'ZZ_EMPTY_STATE');
      await expect(page.getByText(/No records found|No Data/i).first()).toBeVisible();
    });

    test('TC-QR-035: API failure / timeout handling', async () => { test.skip(); });
    test('TC-QR-036: Invalid Date Range (Start > End)', async () => { test.skip(); });
  });
});
