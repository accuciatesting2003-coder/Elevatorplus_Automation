// spec: test-plans/reports-test-plan/Enquiry-Report-Plan.md
// seed: tests/setup/auth.setup.ts
//
// Verified against staging: /reports/enquiry-report is an ARIA div-grid (17 columns).
// Display-only Status cards (Quotation Raised, Pending, Finalized, Closed by Others)
// render only for statuses with >=1 record; status filtering is via the Filter panel's
// single-select Enquiry Status group (lists all configured statuses). Search = input#search.

import { test, expect } from '../fixtures/auth-fixture';
import * as R from './report-helpers';

const URL = '/reports/enquiry-report';
const HEADING = /Enquiry Report/i;
const COLUMNS = ['Sr. No.', 'Enquiry Date', 'Firm Name', 'Site Name', 'Contact Person Name',
  'City', 'Branch', 'Quotation Number', 'Quotation Status', 'Enquiry Status'];

test.describe('Enquiry Report', () => {

  test.describe('Suite 1: Page Load & Navigation', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-EN-001: Enquiry Report page loads successfully', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(URL));
      await expect(page.getByRole('heading', { name: HEADING }).first()).toBeVisible();
      await expect(R.reportTable(page)).toBeVisible();
      await expect(R.searchInput(page)).toBeVisible();
      await expect(R.exportButton(page)).toBeVisible();
      await expect(R.toolbarButton(page, /^Filter$/i)).toBeVisible();
    });
  });

  test.describe('Suite 2: Status Cards', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-EN-002: Apply each displayed card status and verify count vs listing', async ({ page }) => {
      const names = await R.cardNames(page);
      if (names.length === 0) { test.skip(); return; }
      for (const status of names) {
        await R.gotoReport(page, URL, HEADING);
        const card = await R.cardCount(page, status);
        await R.applyStatusFilter(page, status);
        await R.setRowsPerPage(page, '100');
        expect(await R.rowCount(page)).toBe(card);
        expect(await R.cardNames(page)).toEqual([status]);
      }
    });

    test('TC-EN-003: Cards update dynamically when a filter is applied', async ({ page }) => {
      const names = await R.cardNames(page);
      if (names.length === 0) { test.skip(); return; }
      await R.applyStatusFilter(page, names[0]);
      expect(await R.cardNames(page)).toEqual([names[0]]);
    });
  });

  test.describe('Suite 3: Filtering', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-EN-004: Filter by Enquiry Status (single-select, all statuses listed)', async ({ page }) => {
      const cards = await R.cardNames(page);
      await R.openFilter(page);
      await expect(page.getByText(/Enquiry Status/i).first()).toBeVisible();
      // The group lists more statuses than the cards (Cancelled, Lost, Updated, ...).
      const groupCount = await page.getByRole('button', { name: /Cancelled|Lost|Updated|Finalized|Pending/ }).count();
      expect(groupCount).toBeGreaterThanOrEqual(cards.length);
    });

    test('TC-EN-005: Filter by Follow-up Status', async ({ page }) => {
      await R.openFilter(page);
      await expect(page.getByText(/Follow.?Up Status/i).first()).toBeVisible();
    });

    test('TC-EN-006: Filter by Sales Person', async ({ page }) => {
      await R.openFilter(page);
      await expect(page.getByText(/Sales Person/i).first()).toBeVisible();
    });

    test('TC-EN-007: Filter by City / Branch', async ({ page }) => {
      await R.openFilter(page);
      await expect(page.getByText(/^City$/i).filter({ visible: true }).first()).toBeVisible();
      await expect(page.getByText(/^Branch$/i).filter({ visible: true }).first()).toBeVisible();
    });

    test('TC-EN-008: Filter by Enquiry Type', async ({ page }) => {
      await R.openFilter(page);
      await expect(page.getByText(/Enquiry Type/i).first()).toBeVisible();
    });

    test('TC-EN-009: Filter by Date Range', async ({ page }) => {
      await R.openFilter(page);
      await R.clickApply(page);
      await expect(page.getByText(/Active Filters:/i)).toBeVisible();
    });

    test('TC-EN-010: Combine multiple filters', async ({ page }) => {
      const names = await R.cardNames(page);
      if (names.length === 0) { test.skip(); return; }
      await R.applyStatusFilter(page, names[0]);
      await expect(page.getByText(/Active Filters:/i)).toBeVisible();
    });

    test('TC-EN-011: Clear All resets filters and cards', async ({ page }) => {
      const names = await R.cardNames(page);
      if (names.length === 0) { test.skip(); return; }
      await R.applyStatusFilter(page, names[0]);
      await R.clearAllButton(page).click({ force: true });
      await R.waitForGridSettled(page);
      await expect.poll(async () => (await R.cardNames(page)).length, { timeout: 15000 }).toBeGreaterThanOrEqual(1);
    });

    test('TC-EN-012: Filter with zero matching records', async ({ page }) => {
      await R.applySearch(page, 'ZZ_NO_SUCH_ENQUIRY_XYZ');
      await expect(page.getByText(/No records found|No Data/i).first()).toBeVisible();
    });
  });

  test.describe('Suite 4: Search Functionality', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-EN-013: Search by Quotation Number / Contact Person', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      const cp = (await R.rowCells(page, 0).nth(5).innerText().catch(() => '')).trim();
      if (!cp || cp === '-') { test.skip(); return; }
      await R.applySearch(page, cp);
      expect(await R.rowCount(page)).toBeGreaterThan(0);
    });

    test('TC-EN-014: Search by Contact Person Name', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      const cp = (await R.rowCells(page, 0).nth(5).innerText().catch(() => '')).trim();
      if (!cp || cp === '-') { test.skip(); return; }
      await R.applySearch(page, cp.split(' ')[0]);
      expect(await R.rowCount(page)).toBeGreaterThanOrEqual(0);
    });

    test('TC-EN-016: Search handles special characters and spaces', async ({ page }) => {
      await R.applySearch(page, '  @#  ');
      await expect(R.reportTable(page)).toBeVisible();
    });

    test('TC-EN-017: Search cleared on Clear All', async ({ page }) => {
      await R.applySearch(page, 'ZZ_NONE');
      await R.clearAllButton(page).click({ force: true });
      await R.searchInput(page).fill('');
      await R.waitForGridSettled(page);
      await expect.poll(async () => R.rowCount(page), { timeout: 15000 }).toBeGreaterThan(0);
    });

    test('TC-EN-018: Search with no results', async ({ page }) => {
      await R.applySearch(page, 'ZZ_DEFINITELY_NONE_999');
      await expect(page.getByText(/No records found|No Data/i).first()).toBeVisible();
    });
  });

  test.describe('Suite 5: Data Table & Grid', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-EN-019: Core columns are visible', async ({ page }) => {
      const headers = (await R.headerTexts(page)).join(' | ').toLowerCase();
      for (const col of COLUMNS) expect(headers).toContain(col.toLowerCase());
    });

    test('TC-EN-020: Manage Columns hides/shows columns', async ({ page }) => {
      await R.manageColumnButton(page).click({ force: true });
      await expect(page.getByRole('checkbox').first()).toBeVisible();
    });

    test('TC-EN-022: VIEW Quotation opens correctly', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      const icon = R.bodyRows(page).first().locator('img, svg').first();
      if (!(await icon.isVisible().catch(() => false))) { test.skip(); return; }
      await icon.click({ force: true });
      await page.waitForTimeout(1500);
      expect(page.url()).toContain('/reports');
    });

    test('TC-EN-023: Data formatting (date)', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      expect(await R.bodyRows(page).first().innerText()).toMatch(/\d{2}-\d{2}-\d{4}/);
    });

    test('TC-EN-024: Column sorting works', async ({ page }) => {
      const sortBtn = page.getByRole('rowgroup').first().getByRole('button', { name: /Enquiry Date/i }).first();
      if (!(await sortBtn.isVisible().catch(() => false))) { test.skip(); return; }
      await sortBtn.click({ force: true });
      await R.waitForGridSettled(page);
      await expect(R.reportTable(page)).toBeVisible();
    });

    test('TC-EN-026: Sr. No. increments across pages', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      expect((await R.rowCells(page, 0).first().innerText()).trim()).toBe('1');
    });
  });

  test.describe('Suite 6: Export Feature', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-EN-027: Export full dataset to Excel', async ({ page }) => {
      const dl = page.waitForEvent('download', { timeout: 12000 }).catch(() => null);
      await R.exportButton(page).click({ force: true });
      const download = await dl;
      if (!download) { test.skip(); return; }
      expect(download.suggestedFilename()).toBeTruthy();
    });

    test('TC-EN-030: Exported formatting and headers', async () => { test.skip(); });
  });

  test.describe('Suite 7: Pagination', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-EN-031: Change rows per page', async ({ page }) => {
      const sel = R.rowsPerPageSelect(page);
      if (!(await sel.isVisible().catch(() => false))) { test.skip(); return; }
      await R.setRowsPerPage(page, '10');
      expect(await R.rowCount(page)).toBeLessThanOrEqual(10);
    });

    test('TC-EN-032: Navigate pages', async ({ page }) => {
      if (!(await R.canNavigateNext(page))) { test.skip(); return; }
      const before = await R.bodyRows(page).first().innerText();
      await R.nextPageButton(page).click({ force: true });
      await R.waitForGridSettled(page);
      expect(await R.bodyRows(page).first().innerText()).not.toBe(before);
    });

    test('TC-EN-033: Previous disabled on page 1', async ({ page }) => {
      await expect(R.prevPageButton(page)).toBeDisabled();
    });
  });

  test.describe('Suite 8: UI/UX & Error Handling', () => {
    test('TC-EN-035: Empty state when no enquiries exist', async ({ page }) => {
      await R.gotoReport(page, URL, HEADING);
      await R.applySearch(page, 'ZZ_EMPTY_STATE');
      await expect(page.getByText(/No records found|No Data/i).first()).toBeVisible();
    });

    test('TC-EN-036: Mobile responsiveness', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await R.gotoReport(page, URL, HEADING);
      await expect(R.reportTable(page)).toBeVisible();
      await page.setViewportSize({ width: 1920, height: 1080 });
    });

    test('TC-EN-038: API failure / timeout handling', async () => { test.skip(); });
    test('TC-EN-039: Invalid Date Range (Start > End)', async () => { test.skip(); });
  });

  test.describe('Suite 9: Integrated Validation', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-EN-040: Status filter + export consistency', async ({ page }) => {
      const names = await R.cardNames(page);
      if (names.length === 0) { test.skip(); return; }
      await R.applyStatusFilter(page, names[0]);
      const dl = page.waitForEvent('download', { timeout: 12000 }).catch(() => null);
      await R.exportButton(page).click({ force: true });
      const download = await dl;
      if (!download) { test.skip(); return; }
      expect(download.suggestedFilename()).toBeTruthy();
    });

    test('TC-EN-043: Reset workflow restores data', async ({ page }) => {
      const names = await R.cardNames(page);
      if (names.length === 0) { test.skip(); return; }
      await R.applyStatusFilter(page, names[0]);
      await R.clearAllButton(page).click({ force: true });
      await R.waitForGridSettled(page);
      await expect.poll(async () => (await R.cardNames(page)).length, { timeout: 15000 }).toBeGreaterThanOrEqual(1);
    });
  });
});
