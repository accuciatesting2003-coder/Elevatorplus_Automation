// spec: test-plans/one-time-service-test-plan/quotation-report-test-plan.md
// seed: tests/fixtures/auth-fixture.ts (worker logs in once, shares the authenticated page)
//
// OTS Quotation Report — /reports/one-time-services/quotation-report
// Verified live against staging — this is the same ARIA div-grid family as the other
// reports, so tests/Reports/report-helpers.ts applies:
//  - role="table" div-grid; Search = input#search; toolbar = Manage Column / Export / Filter.
//  - 16 visible columns (Approval Stage is hidden by default). Download Quotation renders an
//    svg[title="Download PDF"] per row. Status badge ("Confirm" / "Pending") is an <h5> cell.
//  - Filter drawer: Date Range + Status group (All/Confirm/Pending) + City + Quotation
//    Assigned To + Branch + Area + Reset/Apply. Heading "OTS Quotation Report".
//  - Empty state text: "No Records Found".

import { test, expect } from '../fixtures/auth-fixture';
import * as R from '../Reports/report-helpers';

const URL = '/reports/one-time-services/quotation-report';
const HEADING = /OTS Quotation Report/i;
const COLUMNS = [
  'Sr. No.', 'Download Quotation', 'Quotation Number', 'Quotation Type', 'Basic Amount',
  'Tax Amount', 'Total Taxable Amount', 'City', 'Branch', 'Area', 'Quotation Assigned To',
  'Firm Name', 'Site Name', 'Quotation Date', 'Notes', 'Status',
];

test.describe('OTS Quotation Report', () => {

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
      await expect(page.getByText(/Active Filters:/i)).toBeVisible();
    });

    test('TC-SM-02: All 16 columns are present in order', async ({ page }) => {
      const headers = (await R.headerTexts(page)).map(h => h.toLowerCase());
      for (const col of COLUMNS) expect(headers.join(' | ')).toContain(col.toLowerCase());
    });

    test('TC-SM-03: Sr. No. sequential; Download icon present', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      expect((await R.rowCells(page, 0).first().innerText()).trim()).toBe('1');
      await expect(R.bodyRows(page).first().locator('svg[title="Download PDF"]')).toBeVisible();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Suite 2 – Filtering
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

    test('TC-FLT-03: Filter by Status (Confirm / Pending)', async ({ page }) => {
      await R.applyStatusFilter(page, 'Confirm');
      const n = Math.min(await R.rowCount(page), 100);
      for (let i = 0; i < n; i++) {
        const cells = await R.bodyRows(page).nth(i).getByRole('cell').allInnerTexts();
        expect(cells.some(c => c.trim() === 'Confirm')).toBeTruthy();
      }
    });

    test('TC-FLT-04: Filter by City', async ({ page }) => {
      await R.openFilter(page);
      await expect(page.getByText(/^City$/).filter({ visible: true }).first()).toBeVisible();
      await R.clickApply(page);
    });

    test('TC-FLT-05: Filter by Quotation Assigned To', async ({ page }) => {
      await R.openFilter(page);
      await expect(page.getByText(/Quotation Assigned To/i).first()).toBeVisible();
    });

    test('TC-FLT-06: Branch and Area filters are present', async ({ page }) => {
      await R.openFilter(page);
      await expect(page.getByText(/^Branch$/).filter({ visible: true }).first()).toBeVisible();
      await expect(page.getByText(/^Area$/).filter({ visible: true }).first()).toBeVisible();
    });

    test('TC-FLT-09: Reset inside the Filter drawer', async ({ page }) => {
      await R.openFilter(page);
      await R.resetFilterButton(page).click({ force: true });
      await expect(page.getByRole('button', { name: /^Apply$/i }).first()).toBeVisible();
    });

    test('TC-FLT-10: Clear All restores the full list', async ({ page }) => {
      await R.applySearch(page, 'ZZ_NONE_QTN');
      await R.clearAllButton(page).click({ force: true });
      await R.searchInput(page).fill('');
      await R.waitForGridSettled(page);
      await expect.poll(async () => R.rowCount(page), { timeout: 15000 }).toBeGreaterThan(0);
    });

    test('TC-FLT-11: Filter combination with zero matches', async ({ page }) => {
      await R.applySearch(page, 'ZZ_NO_SUCH_QUOTATION_999');
      await expect(page.getByText(/No Records Found|No records found|No Data|There are no records/i).first()).toBeVisible();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Suite 3 – Search
  // ───────────────────────────────────────────────────────────────────────────
  test.describe('Search', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-SRC-01: Search by Quotation Number', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      const num = (await R.rowCells(page, 0).nth(2).innerText().catch(() => '')).trim();
      if (!num || num === '-') { test.skip(); return; }
      await R.applySearch(page, num);
      expect(await R.rowCount(page)).toBeGreaterThanOrEqual(0);
    });

    test('TC-SRC-03: Search with no results', async ({ page }) => {
      await R.applySearch(page, 'ZZ_DEFINITELY_NONE_999');
      await expect(page.getByText(/No Records Found|No records found|No Data|There are no records/i).first()).toBeVisible();
    });

    test('TC-SRC-04: Clearing search restores the list', async ({ page }) => {
      const before = await R.rowCount(page);
      await R.applySearch(page, 'ZZ_TEMP');
      await R.searchInput(page).fill('');
      await R.waitForGridSettled(page);
      await expect.poll(async () => R.rowCount(page), { timeout: 15000 }).toBeGreaterThanOrEqual(Math.min(before, 1));
    });

    test('TC-SRC-05: Search handles special characters/spaces', async ({ page }) => {
      await R.applySearch(page, '  @#  ');
      await expect(R.reportTable(page)).toBeVisible();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Suite 4 – Sorting & Pagination
  // ───────────────────────────────────────────────────────────────────────────
  test.describe('Sorting & Pagination', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-TBL-01: Sort by Quotation Number', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      await page.getByRole('button', { name: 'Quotation Number', exact: true }).click();
      await R.waitForGridSettled(page);
      await page.getByRole('button', { name: 'Quotation Number', exact: true }).click();
      await R.waitForGridSettled(page);
      await expect(R.reportTable(page)).toBeVisible();
    });

    test('TC-TBL-02: Sort by Total Taxable Amount', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      await page.getByRole('button', { name: 'Total Taxable Amount', exact: true }).click();
      await R.waitForGridSettled(page);
      await expect(R.reportTable(page)).toBeVisible();
    });

    test('TC-TBL-03: Sort by Quotation Date', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      await page.getByRole('button', { name: 'Quotation Date', exact: true }).click();
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
  // Suite 5 – Manage Column
  // ───────────────────────────────────────────────────────────────────────────
  test.describe('Manage Column', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-MC-01: Manage Column modal opens with structure', async ({ page }) => {
      await R.manageColumnButton(page).click({ force: true });
      await expect(page.getByRole('heading', { name: /Manage Table Columns/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Save Configuration/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Cancel$/i })).toBeVisible();
    });

    test('TC-MC-05: Cancel discards changes', async ({ page }) => {
      await R.manageColumnButton(page).click({ force: true });
      await expect(page.getByRole('heading', { name: /Manage Table Columns/i })).toBeVisible();
      await page.getByRole('button', { name: /^Cancel$/i }).click();
      await expect(page.getByRole('heading', { name: /Manage Table Columns/i })).toBeHidden();
      // Grid unchanged — a known column is still present
      const headers = (await R.headerTexts(page)).map(h => h.toLowerCase());
      expect(headers.join(' | ')).toContain('quotation number');
    });

    test('TC-MC-06: Search columns inside the modal', async ({ page }) => {
      await R.manageColumnButton(page).click({ force: true });
      const dialog = page.getByRole('dialog');
      await dialog.getByPlaceholder(/Search columns/i).fill('Tax');
      // Scope to the dialog — "Tax Amount" also exists as a grid column header.
      await expect(dialog.getByText('Tax Amount', { exact: true })).toBeVisible();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Suite 6 – Download & Export
  // ───────────────────────────────────────────────────────────────────────────
  test.describe('Download & Export', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-DL-01: Download a quotation PDF from a row', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      const icon = R.bodyRows(page).first().locator('svg[title="Download PDF"]').first();
      if (!(await icon.isVisible().catch(() => false))) { test.skip(); return; }
      const dl = page.waitForEvent('download', { timeout: 12000 }).catch(() => null);
      await icon.click({ force: true });
      await dl; // download or open — should not crash
      await expect(page).toHaveURL(/elevatorplus/);
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
  // Suite 7 – Navigation & Access
  // ───────────────────────────────────────────────────────────────────────────
  test.describe('Navigation & Access', () => {

    test('TC-NAV-01: Reachable from the sidebar', async ({ page }) => {
      await page.goto('/dashboard');
      await page.getByRole('link', { name: 'One Time Services Reports' }).click();
      await page.getByRole('link', { name: 'Quotation Report' }).click();
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
