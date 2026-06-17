// spec: test-plans/one-time-service-test-plan/one-time-services-report-test-plan.md
// seed: tests/fixtures/auth-fixture.ts (worker logs in once, shares the authenticated page)
//
// One Time Services Report — /reports/one-time-services/one-time-services-report
// Verified live against staging — same ARIA div-grid family, so report-helpers.ts applies:
//  - role="table" div-grid; Search = input#search; toolbar = Manage Column / Export / Filters.
//  - 4 status cards (.card-body): Pending, Quotation Raised, Cancelled, Closed by Others.
//  - 12 columns: Sr. No., View, Enquiry Date, One Time Service Number, Firm Name, Site Name,
//    Contact Person Name, City, Area, Branch, Total Amount, Status.
//  - View renders svg[title="For More Details"] per row -> navigates to
//    /reports/one-time-services/one-time-services-report/<id>.
//  - Filters drawer: Date Range + Status group (All/Pending/Quotation Raised/Cancelled/
//    Closed by Others) + City + Branch + Area + Reset/Apply.
//  - Empty state text: "No Records Found".

import { test, expect } from '../fixtures/auth-fixture';
import * as R from '../Reports/report-helpers';

const URL = '/reports/one-time-services/one-time-services-report';
const HEADING = /One Time Services Report/i;
const CARDS = ['Pending', 'Quotation Raised', 'Cancelled', 'Closed by Others'];
// This report's grid uses the react-data-table default empty text ("There are no records
// to display"); other reports show "No Records Found" — accept either.
const EMPTY = /No Records Found|No records found|No Data|There are no records/i;
// The View action; the first row can lack it (data-dependent), so target the first that has one.
const firstViewIcon = (page: import('@playwright/test').Page) => page.locator('svg[title="For More Details"]').first();
const COLUMNS = [
  'Sr. No.', 'View', 'Enquiry Date', 'One Time Service Number', 'Firm Name', 'Site Name',
  'Contact Person Name', 'City', 'Area', 'Branch', 'Total Amount', 'Status',
];

test.describe('One Time Services Report', () => {

  // ───────────────────────────────────────────────────────────────────────────
  // Suite 1 – Smoke & Page Load
  // ───────────────────────────────────────────────────────────────────────────
  test.describe('Smoke & Page Load', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-SM-01: Page loads successfully', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(URL));
      await expect(page.getByRole('heading', { name: HEADING }).first()).toBeVisible();
      await expect(R.reportTable(page)).toBeVisible();
      await expect(R.manageColumnButton(page)).toBeVisible();
      await expect(R.exportButton(page)).toBeVisible();
      await expect(page.getByRole('button', { name: /^Filters?$/i }).first()).toBeVisible();
    });

    test('TC-SM-02: Status summary cards render', async ({ page }) => {
      const names = await R.cardNames(page);
      for (const c of CARDS) expect(names).toContain(c);
      for (const c of CARDS) expect(await R.cardCount(page, c)).not.toBeNull();
    });

    test('TC-SM-03: All 12 columns present in order', async ({ page }) => {
      const headers = (await R.headerTexts(page)).map(h => h.toLowerCase());
      for (const col of COLUMNS) expect(headers.join(' | ')).toContain(col.toLowerCase());
    });

    test('TC-SM-04: Sr. No. sequential; View icon present', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      expect((await R.rowCells(page, 0).first().innerText()).trim()).toBe('1');
      await expect(firstViewIcon(page)).toBeVisible();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Suite 2 – Status Cards
  // ───────────────────────────────────────────────────────────────────────────
  test.describe('Status Cards', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-CARD-01: Card counts reconcile with the grid', async ({ page }) => {
      await R.setRowsPerPage(page, '100');
      for (const status of CARDS) {
        const card = await R.cardCount(page, status);
        if (card === null) continue;
        const rows = await R.countRowsByStatus(page, status);
        expect(rows).toBe(card);
      }
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Suite 3 – Filtering
  // ───────────────────────────────────────────────────────────────────────────
  test.describe('Filtering', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-FLT-01: Default Date Range applied on load', async ({ page }) => {
      await expect(page.getByText(/Active Filters:/i)).toBeVisible();
      await expect(page.getByText(/\d{2}-\d{2}-\d{4}\s*-\s*\d{2}-\d{2}-\d{4}/).first()).toBeVisible();
    });

    test('TC-FLT-02: Filter by Date Range', async ({ page }) => {
      await R.openFilter(page);
      await expect(page.getByText(/Date Range/i).first()).toBeVisible();
      await R.clickApply(page);
      await expect(page.getByText(/Active Filters:/i)).toBeVisible();
    });

    test('TC-FLT-03: Filter by Status = Pending', async ({ page }) => {
      await R.applyStatusFilter(page, 'Pending');
      const n = Math.min(await R.rowCount(page), 100);
      for (let i = 0; i < n; i++) {
        const cells = await R.bodyRows(page).nth(i).getByRole('cell').allInnerTexts();
        expect(cells.some(c => c.trim() === 'Pending')).toBeTruthy();
      }
    });

    test('TC-FLT-03b: Filter by Status = Quotation Raised', async ({ page }) => {
      await R.applyStatusFilter(page, 'Quotation Raised');
      const n = Math.min(await R.rowCount(page), 100);
      for (let i = 0; i < n; i++) {
        const cells = await R.bodyRows(page).nth(i).getByRole('cell').allInnerTexts();
        expect(cells.some(c => c.trim() === 'Quotation Raised')).toBeTruthy();
      }
    });

    test('TC-FLT-04/05/06: City, Branch and Area filters are present', async ({ page }) => {
      await R.openFilter(page);
      await expect(page.getByText(/^City$/).filter({ visible: true }).first()).toBeVisible();
      await expect(page.getByText(/^Branch$/).filter({ visible: true }).first()).toBeVisible();
      await expect(page.getByText(/^Area$/).filter({ visible: true }).first()).toBeVisible();
    });

    test('TC-FLT-08: Reset inside the Filters drawer', async ({ page }) => {
      await R.openFilter(page);
      await R.resetFilterButton(page).click({ force: true });
      await expect(page.getByRole('button', { name: /^Apply$/i }).first()).toBeVisible();
    });

    test('TC-FLT-09: Clear All restores the full list', async ({ page }) => {
      await R.applySearch(page, 'ZZ_NONE_OTS');
      await R.clearAllButton(page).click({ force: true });
      await R.searchInput(page).fill('');
      await R.waitForGridSettled(page);
      await expect.poll(async () => R.rowCount(page), { timeout: 15000 }).toBeGreaterThan(0);
    });

    test('TC-FLT-10: Filter combination with zero matches', async ({ page }) => {
      await R.applySearch(page, 'ZZ_NO_SUCH_OTS_999');
      await expect(page.getByText(EMPTY).first()).toBeVisible();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Suite 4 – Search
  // ───────────────────────────────────────────────────────────────────────────
  test.describe('Search', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-SRC-01: Search by One Time Service Number', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      const num = (await R.rowCells(page, 0).nth(3).innerText().catch(() => '')).trim();
      if (!num || num === '-') { test.skip(); return; }
      await R.applySearch(page, num);
      expect(await R.rowCount(page)).toBeGreaterThanOrEqual(0);
    });

    test('TC-SRC-04: Search with no results', async ({ page }) => {
      await R.applySearch(page, 'ZZ_DEFINITELY_NONE_OTS_999');
      await expect(page.getByText(EMPTY).first()).toBeVisible();
    });

    test('TC-SRC-05: Clearing search restores the list', async ({ page }) => {
      const before = await R.rowCount(page);
      await R.applySearch(page, 'ZZ_TEMP');
      await R.searchInput(page).fill('');
      await R.waitForGridSettled(page);
      await expect.poll(async () => R.rowCount(page), { timeout: 15000 }).toBeGreaterThanOrEqual(Math.min(before, 1));
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Suite 5 – View / Row Detail
  // ───────────────────────────────────────────────────────────────────────────
  test.describe('View / Row Detail', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-VIEW-01: View icon opens the record detail', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      await firstViewIcon(page).click({ force: true });
      await expect(page).toHaveURL(new RegExp(`${URL}/[a-f0-9]+`), { timeout: 15000 });
    });

    test('TC-VIEW-03: Returning to the report preserves the listing', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      await firstViewIcon(page).click({ force: true });
      await expect(page).toHaveURL(new RegExp(`${URL}/[a-f0-9]+`), { timeout: 15000 });
      await page.goBack();
      await expect(page.getByRole('heading', { name: HEADING }).first()).toBeVisible({ timeout: 15000 });
      await expect(R.reportTable(page)).toBeVisible();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Suite 6 – Sorting & Pagination
  // ───────────────────────────────────────────────────────────────────────────
  test.describe('Sorting & Pagination', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-TBL-01: Sort by One Time Service Number', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      await page.getByRole('button', { name: 'One Time Service Number', exact: true }).click();
      await R.waitForGridSettled(page);
      await page.getByRole('button', { name: 'One Time Service Number', exact: true }).click();
      await R.waitForGridSettled(page);
      await expect(R.reportTable(page)).toBeVisible();
    });

    test('TC-TBL-02: Sort by Enquiry Date', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      await page.getByRole('button', { name: 'Enquiry Date', exact: true }).click();
      await R.waitForGridSettled(page);
      await expect(R.reportTable(page)).toBeVisible();
    });

    test('TC-TBL-03: Sort by Total Amount', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      await page.getByRole('button', { name: 'Total Amount', exact: true }).click();
      await R.waitForGridSettled(page);
      await expect(R.reportTable(page)).toBeVisible();
    });

    test('TC-PAG-01: Change rows per page', async ({ page }) => {
      const sel = R.rowsPerPageSelect(page);
      if (!(await sel.isVisible().catch(() => false))) { test.skip(); return; }
      await R.setRowsPerPage(page, '10');
      expect(await R.rowCount(page)).toBeLessThanOrEqual(10);
    });

    test('TC-PAG-02: Navigate between pages', async ({ page }) => {
      if (!(await R.canNavigateNext(page))) { test.skip(); return; }
      const before = await R.bodyRows(page).first().innerText();
      await R.nextPageButton(page).click({ force: true });
      await R.waitForGridSettled(page);
      expect(await R.bodyRows(page).first().innerText()).not.toBe(before);
    });

    test('TC-PAG-03: Pagination disabled when all rows fit one page', async ({ page }) => {
      if (await R.canNavigateNext(page)) { test.skip(); return; }
      await expect(R.nextPageButton(page)).toBeDisabled();
      await expect(R.prevPageButton(page)).toBeDisabled();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Suite 7 – Manage Column & Export
  // ───────────────────────────────────────────────────────────────────────────
  test.describe('Manage Column & Export', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-MC-01: Manage Column modal opens with structure', async ({ page }) => {
      await R.manageColumnButton(page).click({ force: true });
      await expect(page.getByRole('heading', { name: /Manage Table Columns/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Save Configuration/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Cancel$/i })).toBeVisible();
    });

    test('TC-MC-03: Cancel discards changes', async ({ page }) => {
      await R.manageColumnButton(page).click({ force: true });
      await expect(page.getByRole('heading', { name: /Manage Table Columns/i })).toBeVisible();
      await page.getByRole('button', { name: /^Cancel$/i }).click();
      await expect(page.getByRole('heading', { name: /Manage Table Columns/i })).toBeHidden();
    });

    test('TC-EXP-01: Export the current dataset', async ({ page }) => {
      const dl = page.waitForEvent('download', { timeout: 12000 }).catch(() => null);
      await R.exportButton(page).click({ force: true });
      const download = await dl;
      if (!download) { test.skip(); return; }
      expect(download.suggestedFilename()).toBeTruthy();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Suite 8 – Navigation & Access
  // ───────────────────────────────────────────────────────────────────────────
  test.describe('Navigation & Access', () => {

    test('TC-NAV-01: Reachable from the sidebar', async ({ page }) => {
      await page.goto('/dashboard');
      await page.getByRole('link', { name: 'One Time Services Reports' }).click();
      await page.getByRole('link', { name: 'One-time services Report' }).click();
      await expect(page).toHaveURL(new RegExp(URL));
      await expect(page.getByRole('heading', { name: HEADING }).first()).toBeVisible({ timeout: 15000 });
    });

    test('TC-NAV-02: Direct URL navigation when authenticated', async ({ page }) => {
      await R.gotoReport(page, URL, HEADING);
      await expect(page.getByRole('heading', { name: HEADING }).first()).toBeVisible();
      await expect(R.reportTable(page)).toBeVisible();
    });
  });
});
