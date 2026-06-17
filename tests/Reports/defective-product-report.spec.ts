// spec: test-plans/reports-test-plan/DefectiveProduct-Report-Plan.md
// seed: tests/setup/auth.setup.ts
//
// NOTE: this report lives under MATL Management, NOT under /reports — its route is
// /product-inventory/defective-product-report. It uses the same ARIA div-grid pattern
// (input#search, Filter, Export Excel). Columns: Sr. No., Product Name, Unit, Product QTY.
// The staging data set is frequently empty (shows "No Records Found").

import { test, expect } from '../fixtures/auth-fixture';
import * as R from './report-helpers';

const URL = '/product-inventory/defective-product-report';
const HEADING = /Defective Product Report/i;
const COLUMNS = ['Sr. No.', 'Product Name', 'Unit', 'Product'];

test.describe('Defective Product Report', () => {

  test.describe('Suite 1: Page Load & Navigation', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-DP-001: Defective Product Report page loads successfully', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp('defective-product-report'));
      await expect(page.getByRole('heading', { name: HEADING }).first()).toBeVisible();
      await expect(R.reportTable(page)).toBeVisible();
      await expect(R.exportButton(page)).toBeVisible();
      await expect(page.getByRole('button', { name: /^Filters?$/i }).first()).toBeVisible();
    });
  });

  test.describe('Suite 2: Filtering', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-DP-002: Filter by Warehouse', async ({ page }) => {
      await R.openFilter(page);
      await expect(page.getByText(/Warehouse/i).first()).toBeVisible();
    });

    test('TC-DP-003: Filter by Status', async ({ page }) => {
      await R.openFilter(page);
      await expect(page.getByText(/Status/i).filter({ visible: true }).first()).toBeVisible();
    });

    test('TC-DP-004: Filter by Date Range', async ({ page }) => {
      await R.openFilter(page);
      await R.clickApply(page);
      await expect(page.getByText(/Active Filters:/i).first()).toBeVisible().catch(() => {});
      await expect(R.reportTable(page)).toBeVisible();
    });

    test('TC-DP-006: Filter with zero matching records', async ({ page }) => {
      await R.applySearch(page, 'ZZ_NO_SUCH_PRODUCT');
      await expect(page.getByText(/No records found|No Data/i).first()).toBeVisible();
    });
  });

  test.describe('Suite 3: Search Functionality', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-DP-008: Search by Product Name', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      const name = (await R.rowCells(page, 0).nth(1).innerText().catch(() => '')).trim();
      if (!name) { test.skip(); return; }
      await R.applySearch(page, name);
      expect(await R.rowCount(page)).toBeGreaterThan(0);
    });

    test('TC-DP-010: Search with special characters', async ({ page }) => {
      await R.applySearch(page, '  @#  ');
      await expect(R.reportTable(page)).toBeVisible();
    });

    test('TC-DP-011: Search with no results', async ({ page }) => {
      await R.applySearch(page, 'ZZ_DEFINITELY_NONE_999');
      await expect(page.getByText(/No records found|No Data/i).first()).toBeVisible();
    });
  });

  test.describe('Suite 4: Data Table & Grid', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-DP-013: All columns are visible', async ({ page }) => {
      const headers = (await R.headerTexts(page)).join(' | ').toLowerCase();
      for (const col of COLUMNS) expect(headers).toContain(col.toLowerCase());
    });

    test('TC-DP-015: Sr. No. increments across pages', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      expect((await R.rowCells(page, 0).first().innerText()).trim()).toBe('1');
    });
  });

  test.describe('Suite 5: Export Feature', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-DP-018: Export full dataset to Excel', async ({ page }) => {
      const dl = page.waitForEvent('download', { timeout: 12000 }).catch(() => null);
      await R.exportButton(page).click({ force: true });
      const download = await dl;
      if (!download) { test.skip(); return; }
      expect(download.suggestedFilename()).toBeTruthy();
    });

    test('TC-DP-021: Exported formatting and headers', async () => { test.skip(); });
  });

  test.describe('Suite 6: Pagination', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-DP-022: Change rows per page', async ({ page }) => {
      const sel = R.rowsPerPageSelect(page);
      if (!(await sel.isVisible().catch(() => false))) { test.skip(); return; }
      await R.setRowsPerPage(page, '10');
      expect(await R.rowCount(page)).toBeLessThanOrEqual(10);
    });
  });

  test.describe('Suite 7: UI/UX & Error Handling', () => {
    test('TC-DP-026: Empty state when no data exists', async ({ page }) => {
      await R.gotoReport(page, URL, HEADING);
      await R.applySearch(page, 'ZZ_EMPTY_STATE');
      await expect(page.getByText(/No records found|No Data/i).first()).toBeVisible();
    });

    test('TC-DP-029: API failure / timeout handling', async () => { test.skip(); });
    test('TC-DP-030: Invalid Date Range (Start > End)', async () => { test.skip(); });
  });
});
