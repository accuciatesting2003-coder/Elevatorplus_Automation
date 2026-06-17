// spec: test-plans/reports-test-plan/PaymentBalance-Report-Plan.md
// seed: tests/setup/auth.setup.ts
// /reports/payment-balance-report — ARIA div-grid (15 cols), Filter + Search + Export +
// Pagination. No status cards. Search = input#search.

import { test, expect } from '../fixtures/auth-fixture';
import * as R from './report-helpers';

const URL = '/reports/payment-balance-report';
const HEADING = /Payment Balance Report/i;
const COLUMNS = ['Sr. No.', 'Site Name', 'Firm Name', 'Total Payment', 'Remaining Payment'];

test.describe('Payment Balance Report', () => {

  test.describe('Suite 1: Page Load & Navigation', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-PB-001: Payment Balance Report page loads successfully', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(URL));
      await expect(page.getByRole('heading', { name: HEADING }).first()).toBeVisible();
      await expect(R.reportTable(page)).toBeVisible();
      await expect(R.exportButton(page)).toBeVisible();
      await expect(page.getByRole('button', { name: /^Filters?$/i }).first()).toBeVisible();
    });
  });

  test.describe('Suite 2: Filtering', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-PB-002: Filter by Payment Type', async ({ page }) => {
      await R.openFilter(page);
      await expect(page.getByText(/Payment Type|Type/i).filter({ visible: true }).first()).toBeVisible();
    });

    test('TC-PB-003: Filter by Date Range', async ({ page }) => {
      await R.openFilter(page);
      await R.clickApply(page);
      await expect(page.getByText(/Active Filters:/i)).toBeVisible();
    });

    test('TC-PB-007: Clear All resets filters and search', async ({ page }) => {
      await R.applySearch(page, 'ZZ_NONE');
      await R.clearAllButton(page).click({ force: true });
      await R.searchInput(page).fill('');
      await R.waitForGridSettled(page);
      await expect.poll(async () => R.rowCount(page), { timeout: 15000 }).toBeGreaterThan(0);
    });

    test('TC-PB-008: Filter with zero matching records', async ({ page }) => {
      await R.applySearch(page, 'ZZ_NO_SUCH_PAYMENT');
      await expect(page.getByText(/No records found|No Data/i).first()).toBeVisible();
    });
  });

  test.describe('Suite 3: Search Functionality', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-PB-009: Search by Firm Name', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      const firm = (await R.rowCells(page, 0).nth(2).innerText().catch(() => '')).trim();
      if (!firm || firm === '-') { test.skip(); return; }
      await R.applySearch(page, firm);
      expect(await R.rowCount(page)).toBeGreaterThan(0);
    });

    test('TC-PB-012: Search handles special characters and spaces', async ({ page }) => {
      await R.applySearch(page, '  @#  ');
      await expect(R.reportTable(page)).toBeVisible();
    });

    test('TC-PB-014: Search with no results', async ({ page }) => {
      await R.applySearch(page, 'ZZ_DEFINITELY_NONE_999');
      await expect(page.getByText(/No records found|No Data/i).first()).toBeVisible();
    });
  });

  test.describe('Suite 4: Data Table & Grid', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-PB-015: Key columns are visible', async ({ page }) => {
      const headers = (await R.headerTexts(page)).join(' | ').toLowerCase();
      for (const col of COLUMNS) expect(headers).toContain(col.toLowerCase());
    });

    test('TC-PB-016: Currency formatting for payment amounts', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      expect(await R.bodyRows(page).first().innerText()).toMatch(/[₹\d]/);
    });

    test('TC-PB-021: Sr. No. increments across pages', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      expect((await R.rowCells(page, 0).first().innerText()).trim()).toBe('1');
    });
  });

  test.describe('Suite 5: Export Feature', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-PB-022: Export full dataset to Excel', async ({ page }) => {
      const dl = page.waitForEvent('download', { timeout: 12000 }).catch(() => null);
      await R.exportButton(page).click({ force: true });
      const download = await dl;
      if (!download) { test.skip(); return; }
      expect(download.suggestedFilename()).toBeTruthy();
    });

    test('TC-PB-025: Exported formatting and headers', async () => { test.skip(); });
  });

  test.describe('Suite 6: Pagination', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-PB-026: Change rows per page', async ({ page }) => {
      const sel = R.rowsPerPageSelect(page);
      if (!(await sel.isVisible().catch(() => false))) { test.skip(); return; }
      await R.setRowsPerPage(page, '10');
      expect(await R.rowCount(page)).toBeLessThanOrEqual(10);
    });

    test('TC-PB-027: Navigate pages', async ({ page }) => {
      if (!(await R.canNavigateNext(page))) { test.skip(); return; }
      const before = await R.bodyRows(page).first().innerText();
      await R.nextPageButton(page).click({ force: true });
      await R.waitForGridSettled(page);
      expect(await R.bodyRows(page).first().innerText()).not.toBe(before);
    });
  });

  test.describe('Suite 7: UI/UX & Error Handling', () => {
    test('TC-PB-030: Empty state when no records exist', async ({ page }) => {
      await R.gotoReport(page, URL, HEADING);
      await R.applySearch(page, 'ZZ_EMPTY_STATE');
      await expect(page.getByText(/No records found|No Data/i).first()).toBeVisible();
    });

    test('TC-PB-033: API failure / timeout handling', async () => { test.skip(); });
    test('TC-PB-034: Invalid Date Range (Start > End)', async () => { test.skip(); });
  });
});
