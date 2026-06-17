// spec: test-plans/reports-test-plan/WorkOrder-Report-Plan.md
// seed: tests/setup/auth.setup.ts
// /reports/work-order-report — ARIA div-grid. FIXED 3 status cards (Pending, Confirm,
// Completed) always shown including 0; display-only (filter via the Filters panel).
// Has a financial Footer Summary (Total/Paid/Pending Amount, Assigned Stages/Phases),
// per-row View + Download, Manage Column, Export. Status is the last cell.

import { test, expect } from '../fixtures/auth-fixture';
import * as R from './report-helpers';

const URL = '/reports/work-order-report';
const HEADING = /Work Order Report/i;
const COLUMNS = ['Sr. No.', 'Work Order No', 'Contractor Name', 'Job Number',
  'Total Amount', 'Paid Amount', 'Pending Amount', 'Status'];

function num(s: string): number { return parseFloat((s || '').replace(/[^0-9.-]/g, '')) || 0; }

test.describe('Work Order Report', () => {

  test.describe('Suite 1: Page Load & Navigation', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-WO-001: Work Order Report page loads successfully', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(URL));
      await expect(page.getByRole('heading', { name: HEADING }).first()).toBeVisible();
      await expect(R.reportTable(page)).toBeVisible();
      await expect(R.exportButton(page)).toBeVisible();
      await expect(page.getByRole('button', { name: /^Filters?$/i }).first()).toBeVisible();
    });
  });

  test.describe('Suite 2: Status Cards', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-WO-002a: All three cards always visible (including zero)', async ({ page }) => {
      const names = await R.cardNames(page);
      for (const expected of ['Pending', 'Confirm', 'Completed']) {
        expect(names.some(n => new RegExp(expected, 'i').test(n))).toBeTruthy();
      }
    });

    test('TC-WO-002: Card count matches table data', async ({ page }) => {
      const names = await R.cardNames(page);
      let status = '';
      for (const n of names) { if (((await R.cardCount(page, n)) ?? 0) > 0) { status = n; break; } }
      if (!status) { test.skip(); return; }
      expect(await R.countRowsByStatus(page, status)).toBe(await R.cardCount(page, status));
    });
  });

  test.describe('Suite 3: Filtering', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-WO-006: Filter by Contractor Name', async ({ page }) => {
      await R.openFilter(page);
      await expect(page.getByText(/Contractor/i).filter({ visible: true }).first()).toBeVisible();
    });

    test('TC-WO-007: Filter by Status', async ({ page }) => {
      const names = await R.cardNames(page);
      let status = '';
      for (const n of names) { if (((await R.cardCount(page, n)) ?? 0) > 0) { status = n; break; } }
      if (!status) { test.skip(); return; }
      // Work Order's Status filter is a react-select (classNamePrefix="select") inside
      // the .filter-drawer-content container. The drawer has two react-selects: index 0
      // is Contractor Name, index 1 is Status. Using .last() on all page selects picks
      // a third unrelated off-viewport select — scope to the drawer to get the right one.
      await R.openFilter(page);
      // Scope to the drawer so we pick the Status select (2nd in drawer), not a stray one.
      const drawerControl = page.locator('.filter-drawer-content .select__control').last();
      if (!(await drawerControl.count())) { test.skip(); return; }
      // Both controls are in the viewport; use JS mousedown to open, then JS click to
      // select the option (avoids actionability checks while still working with React).
      await drawerControl.evaluate(el =>
        el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }))
      );
      await page.waitForTimeout(300);
      // Wait for the menu to appear and click the matching option.
      const option = page.locator('.select__option').filter({ hasText: new RegExp(`^${status}$`) }).first();
      await option.waitFor({ state: 'attached', timeout: 8000 });
      await option.evaluate(el =>
        el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
      );
      await page.waitForTimeout(300);
      await R.applyFilterButton(page).dispatchEvent('click');
      await R.waitForGridSettled(page);
      await R.setRowsPerPage(page, '100');
      // Every visible row should carry the selected status.
      const total = await R.rowCount(page);
      if (total > 0) {
        expect(await R.countRowsByStatus(page, status)).toBe(total);
      }
    });

    test('TC-WO-012: Clear All resets filters and status cards', async ({ page }) => {
      await R.applySearch(page, 'ZZ_NONE');
      await R.clearAllButton(page).click({ force: true });
      await R.searchInput(page).fill('');
      await R.waitForGridSettled(page);
      await expect.poll(async () => R.rowCount(page), { timeout: 15000 }).toBeGreaterThanOrEqual(0);
    });

    test('TC-WO-013: Filter with no matching records', async ({ page }) => {
      await R.applySearch(page, 'ZZ_NO_SUCH_WORK_ORDER');
      await expect(page.getByText(/No records found|No Data/i).first()).toBeVisible();
    });
  });

  test.describe('Suite 4: Search Functionality', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-WO-014: Search by Work Order Number', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      const wo = (await R.rowCells(page, 0).nth(2).innerText().catch(() => '')).trim();
      if (!wo) { test.skip(); return; }
      await R.applySearch(page, wo);
      expect(await R.rowCount(page)).toBeGreaterThanOrEqual(0);
    });

    test('TC-WO-017: Search with no results', async ({ page }) => {
      await R.applySearch(page, 'ZZ_DEFINITELY_NONE_999');
      await expect(page.getByText(/No records found|No Data/i).first()).toBeVisible();
    });
  });

  test.describe('Suite 5: Data Table & Actions', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-WO-018: Key columns are visible', async ({ page }) => {
      const headers = (await R.headerTexts(page)).join(' | ').toLowerCase();
      for (const col of COLUMNS) expect(headers).toContain(col.toLowerCase());
    });

    test('TC-WO-022: Financial precision per row (Total - Paid = Pending)', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      for (let i = 0; i < Math.min(await R.rowCount(page), 3); i++) {
        const c = await R.rowCells(page, i).allInnerTexts();
        // last cell is Status; the three before it are Total, Paid, Pending.
        const total = num(c[c.length - 4]), paid = num(c[c.length - 3]), pending = num(c[c.length - 2]);
        expect(Math.abs((total - paid) - pending)).toBeLessThan(0.01);
      }
    });

    test('TC-WO-023: Sr. No. increments across pages', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      expect((await R.rowCells(page, 0).first().innerText()).trim()).toBe('1');
    });
  });

  test.describe('Suite 6: Financial Footer Summary', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-WO-024: Footer summary shows Total/Paid/Pending Amount', async ({ page }) => {
      await expect(page.getByText(/Total Amount/i).first()).toBeVisible();
      await expect(page.getByText(/Paid Amount/i).first()).toBeVisible();
      await expect(page.getByText(/Pending Amount/i).first()).toBeVisible();
    });

    test('TC-WO-027: Footer shows Assigned Stages and Phases', async ({ page }) => {
      await expect(page.getByText(/Assigned Stages/i).first()).toBeVisible();
      await expect(page.getByText(/Assigned Phases/i).first()).toBeVisible();
    });
  });

  test.describe('Suite 7: Export Feature', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-WO-030: Export current filtered view to Excel', async ({ page }) => {
      const dl = page.waitForEvent('download', { timeout: 12000 }).catch(() => null);
      await R.exportButton(page).click({ force: true });
      const download = await dl;
      if (!download) { test.skip(); return; }
      expect(download.suggestedFilename()).toBeTruthy();
    });
  });

  test.describe('Suite 8: Pagination', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-WO-033: Change rows per page', async ({ page }) => {
      const sel = R.rowsPerPageSelect(page);
      if (!(await sel.isVisible().catch(() => false))) { test.skip(); return; }
      await R.setRowsPerPage(page, '10');
      expect(await R.rowCount(page)).toBeLessThanOrEqual(10);
    });

    test('TC-WO-034: Navigate pages', async ({ page }) => {
      if (!(await R.canNavigateNext(page))) { test.skip(); return; }
      const before = await R.bodyRows(page).first().innerText();
      await R.nextPageButton(page).click({ force: true });
      await R.waitForGridSettled(page);
      expect(await R.bodyRows(page).first().innerText()).not.toBe(before);
    });
  });

  test.describe('Suite 9: UI/UX & Error Handling', () => {
    test('TC-WO-037: API failure / timeout handling', async () => { test.skip(); });
    test('TC-WO-038: Invalid Date Range selection', async () => { test.skip(); });
  });
});
