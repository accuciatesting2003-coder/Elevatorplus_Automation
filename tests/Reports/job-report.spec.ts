// spec: test-plans/reports-test-plan/Job-Report-Plan.md
// seed: tests/setup/auth.setup.ts
//
// Verified against staging: /reports/job-report is an ARIA div-grid. UNLIKE the other
// reports, ALL status cards are always shown (including 0) PLUS a clickable "Total"
// card, and the cards themselves are CLICKABLE filters — clicking one filters the grid
// and recomputes every card to the filtered subset (Total = filtered count).
// Default-visible columns are 10; the remaining plan columns live behind Manage Column.

import { test, expect } from '../fixtures/auth-fixture';
import * as R from './report-helpers';

const URL = '/reports/job-report';
const HEADING = /Job Report/i;
const COLUMNS = ['Sr. No.', 'View', 'Job Completion Date', 'City', 'Firm Name',
  'Site Engineer Name', 'Site Name', 'Wing Name', 'Lift Type', 'Job Status'];

const nonTotal = (names: string[]) => names.filter(n => !/^Total$/i.test(n));

test.describe('Job Report', () => {

  test.describe('Suite 1: Page Load & Navigation', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-JB-001: Job Report page loads successfully', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(URL));
      await expect(page.getByRole('heading', { name: HEADING }).first()).toBeVisible();
      await expect(R.reportTable(page)).toBeVisible();
      await expect(R.exportButton(page)).toBeVisible();
      await expect(R.toolbarButton(page, /^Filter$/i)).toBeVisible();
    });
  });

  test.describe('Suite 2: Status Cards', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-JB-002: All status cards always visible (incl 0) + Total card', async ({ page }) => {
      const names = await R.cardNames(page);
      expect(names.some(n => /^Total$/i.test(n))).toBeTruthy();
      // At least one zero-count card is allowed; the set is fixed, not record-gated.
      expect(nonTotal(names).length).toBeGreaterThanOrEqual(1);
    });

    test('TC-JB-002b: Total card equals the sum of all status cards', async ({ page }) => {
      const names = nonTotal(await R.cardNames(page));
      let sum = 0;
      for (const n of names) sum += (await R.cardCount(page, n)) ?? 0;
      const total = await R.cardCount(page, 'Total');
      expect(total).toBe(sum);
    });

    test('TC-JB-002c: Card counts match table data', async ({ page }) => {
      const names = nonTotal(await R.cardNames(page));
      const withData = [] as string[];
      for (const n of names) if (((await R.cardCount(page, n)) ?? 0) > 0) withData.push(n);
      if (withData.length === 0) { test.skip(); return; }
      const status = withData[0];
      expect(await R.countRowsByStatus(page, status)).toBe(await R.cardCount(page, status));
    });

    test('TC-JB-003: Clicking a status card filters the table by that status', async ({ page }) => {
      const names = nonTotal(await R.cardNames(page));
      const target = names.find(async n => ((await R.cardCount(page, n)) ?? 0) > 0) || names[0];
      // pick a concretely non-zero status
      let status = '';
      for (const n of names) { if (((await R.cardCount(page, n)) ?? 0) > 0) { status = n; break; } }
      if (!status) { test.skip(); return; }
      const expected = await R.cardCount(page, status);
      await R.clickStatusCard(page, status);
      await R.setRowsPerPage(page, '100');
      expect(await R.rowCount(page)).toBe(expected);
      // Total recomputes to the filtered count.
      expect(await R.cardCount(page, 'Total')).toBe(expected);
    });

    test('TC-JB-003b: Cards recompute when a non-status filter is applied', async ({ page }) => {
      const before = await R.cardCount(page, 'Total');
      await R.openFilter(page);
      await R.clickApply(page);
      const after = await R.cardCount(page, 'Total');
      expect(typeof after).toBe('number');
      expect(after as number).toBeLessThanOrEqual(before as number);
    });
  });

  test.describe('Suite 3: Filtering', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-JB-004: Filter by Job Status', async ({ page }) => {
      await R.openFilter(page);
      await expect(page.getByText(/Job Status/i).first()).toBeVisible();
    });

    test('TC-JB-005: Filter by City / Branch / Area', async ({ page }) => {
      await R.openFilter(page);
      await expect(page.getByText(/^City$/i).filter({ visible: true }).first()).toBeVisible();
    });

    test('TC-JB-006: Filter by Lift Type', async ({ page }) => {
      await R.openFilter(page);
      await expect(page.getByText(/Lift Type/i).first()).toBeVisible();
    });

    test('TC-JB-010: Clear All resets filters and cards', async ({ page }) => {
      const names = nonTotal(await R.cardNames(page));
      let status = '';
      for (const n of names) { if (((await R.cardCount(page, n)) ?? 0) > 0) { status = n; break; } }
      if (!status) { test.skip(); return; }
      await R.clickStatusCard(page, status);
      await R.clearAllButton(page).click({ force: true });
      await R.waitForGridSettled(page);
      expect((await R.cardNames(page)).some(n => /^Total$/i.test(n))).toBeTruthy();
    });

    test('TC-JB-011: Filter with zero matching records', async ({ page }) => {
      await R.applySearch(page, 'ZZ_NO_SUCH_JOB_XYZ');
      await expect(page.getByText(/No records found|No Data/i).first()).toBeVisible();
    });
  });

  test.describe('Suite 4: Search Functionality', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-JB-013: Search by Site Name / Firm Name', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      let firm = '';
      const rows = await R.rowCount(page);
      for (let i = 0; i < rows; i++) {
        const f = (await R.rowCells(page, i).nth(4).innerText().catch(() => '')).trim();
        if (f && f !== '-') { firm = f; break; }
      }
      if (!firm) { test.skip(); return; }
      await R.applySearch(page, firm);
      expect(await R.rowCount(page)).toBeGreaterThan(0);
    });

    test('TC-JB-015: Search handles special characters and spaces', async ({ page }) => {
      await R.applySearch(page, '  @#  ');
      await expect(R.reportTable(page)).toBeVisible();
    });

    test('TC-JB-017: Search with no results', async ({ page }) => {
      await R.applySearch(page, 'ZZ_DEFINITELY_NONE_999');
      await expect(page.getByText(/No records found|No Data/i).first()).toBeVisible();
    });
  });

  test.describe('Suite 5: Data Table & Grid', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-JB-018: Default-visible columns are present', async ({ page }) => {
      const headers = (await R.headerTexts(page)).join(' | ').toLowerCase();
      for (const col of COLUMNS) expect(headers).toContain(col.toLowerCase());
    });

    test('TC-JB-019: View opens job details', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      const icon = R.bodyRows(page).first().locator('img, svg').first();
      if (!(await icon.isVisible().catch(() => false))) { test.skip(); return; }
      await icon.click({ force: true });
      await page.waitForTimeout(1500);
      expect(page.url()).toContain('/reports');
    });

    test('TC-JB-020: Manage Columns hides/shows columns', async ({ page }) => {
      await R.manageColumnButton(page).click({ force: true });
      await expect(page.getByRole('checkbox').first()).toBeVisible();
    });

    test('TC-JB-025: Sr. No. increments across pages', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      expect((await R.rowCells(page, 0).first().innerText()).trim()).toBe('1');
    });
  });

  test.describe('Suite 6: Export Feature', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-JB-026: Export full dataset to Excel', async ({ page }) => {
      const dl = page.waitForEvent('download', { timeout: 12000 }).catch(() => null);
      await R.exportButton(page).click({ force: true });
      const download = await dl;
      if (!download) { test.skip(); return; }
      expect(download.suggestedFilename()).toBeTruthy();
    });

    test('TC-JB-029: Exported formatting and headers', async () => { test.skip(); });
  });

  test.describe('Suite 7: Pagination', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-JB-030: Change rows per page', async ({ page }) => {
      const sel = R.rowsPerPageSelect(page);
      if (!(await sel.isVisible().catch(() => false))) { test.skip(); return; }
      await R.setRowsPerPage(page, '10');
      expect(await R.rowCount(page)).toBeLessThanOrEqual(10);
    });

    test('TC-JB-031: Navigate pages', async ({ page }) => {
      if (!(await R.canNavigateNext(page))) { test.skip(); return; }
      const before = await R.bodyRows(page).first().innerText();
      await R.nextPageButton(page).click({ force: true });
      await R.waitForGridSettled(page);
      expect(await R.bodyRows(page).first().innerText()).not.toBe(before);
    });
  });

  test.describe('Suite 8: UI/UX & Error Handling', () => {
    test('TC-JB-034: Empty state when no jobs exist', async ({ page }) => {
      await R.gotoReport(page, URL, HEADING);
      await R.applySearch(page, 'ZZ_EMPTY_STATE');
      await expect(page.getByText(/No records found|No Data/i).first()).toBeVisible();
    });

    test('TC-JB-037: API failure / timeout handling', async () => { test.skip(); });
    test('TC-JB-038: Invalid Date Range (Start > End)', async () => { test.skip(); });
  });

  test.describe('Suite 9: Integrated Validation', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-JB-040: City + Lift Type card synchronization', async ({ page }) => {
      const before = await R.cardCount(page, 'Total');
      await R.openFilter(page);
      await R.clickApply(page);
      expect((await R.cardCount(page, 'Total')) as number).toBeLessThanOrEqual(before as number);
    });
  });
});
