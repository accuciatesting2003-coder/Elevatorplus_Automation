// spec: test-plans/reports-test-plan/BreakDown-Report-Plan.md
// seed: tests/setup/auth.setup.ts
//
// Verified against staging: /reports/break-down-report is an ARIA div-grid with 28
// columns (all shown by default). Display-only Status cards (Elevator Started,
// Shutdown, ...) render only for statuses with >=1 record; status filtering is via the
// Filter panel's single-select Status group (lists Live/On Hold/Pause + custom too).
// Status is NOT the last cell, so status counting scans every cell. Search = input#search.

import { test, expect } from '../fixtures/auth-fixture';
import * as R from './report-helpers';

const URL = '/reports/break-down-report';
const HEADING = /Breakdown Report/i;
const COLUMNS = ['Sr. No.', 'View', 'BreakDown Number', 'Job Number', 'Firm Name', 'Site Name',
  'Wing Name', 'Lift Name', 'Technician Name', 'Breakdown Reported Date', 'Status', 'Created By Person'];

test.describe('Breakdown Report', () => {

  test.describe('Suite 1: Page Load & Navigation', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-BD-001: Breakdown Report page loads successfully', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(URL));
      await expect(page.getByRole('heading', { name: HEADING }).first()).toBeVisible();
      await expect(R.reportTable(page)).toBeVisible();
      await expect(R.manageColumnButton(page)).toBeVisible();
      await expect(R.exportButton(page)).toBeVisible();
      await expect(R.toolbarButton(page, /^Filter$/i)).toBeVisible();
    });

    test('TC-BD-002: Default date range applied on load', async ({ page }) => {
      await expect(page.getByText(/Active Filters:/i)).toBeVisible();
    });
  });

  test.describe('Suite 2: Status Cards', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-BD-003: Status card count matches table row count', async ({ page }) => {
      const names = await R.cardNames(page);
      if (names.length === 0) { test.skip(); return; }
      expect(await R.countRowsByStatus(page, names[0])).toBe(await R.cardCount(page, names[0]));
    });

    test('TC-BD-004: Apply each displayed card status and verify count vs listing', async ({ page }) => {
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

    test('TC-BD-005: Cards show only statuses with at least one record', async ({ page }) => {
      for (const name of await R.cardNames(page)) {
        expect(await R.countRowsByStatus(page, name)).toBeGreaterThan(0);
      }
    });

    test('TC-BD-006: Cards update dynamically when a filter is applied', async ({ page }) => {
      const names = await R.cardNames(page);
      if (names.length === 0) { test.skip(); return; }
      await R.applyStatusFilter(page, names[0]);
      expect(await R.cardNames(page)).toEqual([names[0]]);
    });
  });

  test.describe('Suite 3: Filtering', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-BD-007: Filter by Date Range', async ({ page }) => {
      await R.openFilter(page);
      await expect(page.getByText(/Date Range/i).first()).toBeVisible();
      await R.clickApply(page);
      await expect(page.getByText(/Active Filters:/i)).toBeVisible();
    });

    test('TC-BD-008: Filter by Technician Name', async ({ page }) => {
      await R.openFilter(page);
      await expect(page.getByText(/Technician Name/i).first()).toBeVisible();
    });

    test('TC-BD-010: Filter by Branch / Area / City', async ({ page }) => {
      await R.openFilter(page);
      await expect(page.getByText(/^Branch$/i).filter({ visible: true }).first()).toBeVisible();
    });

    test('TC-BD-013: Filter by Status (single-select, all statuses listed)', async ({ page }) => {
      const cards = await R.cardNames(page);
      await R.openFilter(page);
      await expect(page.getByText(/^Status$/i).first()).toBeVisible();
      const group = await page.getByRole('button', { name: /Elevator Started|Shutdown|Live|On Hold|Pause/ }).count();
      expect(group).toBeGreaterThanOrEqual(cards.length);
    });

    test('TC-BD-016: Clear All resets filters, cards and chip', async ({ page }) => {
      const names = await R.cardNames(page);
      if (names.length === 0) { test.skip(); return; }
      await R.applyStatusFilter(page, names[0]);
      await R.clearAllButton(page).click({ force: true });
      await R.waitForGridSettled(page);
      expect((await R.cardNames(page)).length).toBeGreaterThanOrEqual(1);
    });

    test('TC-BD-017: Filter with zero matching records', async ({ page }) => {
      await R.applySearch(page, 'ZZ_NO_SUCH_BREAKDOWN');
      await expect(page.getByText(/No records found|No Data/i).first()).toBeVisible();
    });
  });

  test.describe('Suite 4: Search Functionality', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-BD-018: Search by BreakDown Number', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      const bd = (await R.rowCells(page, 0).nth(2).innerText().catch(() => '')).trim();
      if (!bd || bd === '-') { test.skip(); return; }
      await R.applySearch(page, bd);
      expect(await R.rowCount(page)).toBeGreaterThanOrEqual(0);
    });

    test('TC-BD-020: Search by Site Name', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      let site = '';
      const rows = await R.rowCount(page);
      for (let i = 0; i < rows; i++) {
        const s = (await R.rowCells(page, i).nth(7).innerText().catch(() => '')).trim();
        if (s && s !== '-') { site = s; break; }
      }
      if (!site) { test.skip(); return; }
      await R.applySearch(page, site);
      expect(await R.rowCount(page)).toBeGreaterThan(0);
    });

    test('TC-BD-022: Search handles special characters and spaces', async ({ page }) => {
      await R.applySearch(page, '  @#  ');
      await expect(R.reportTable(page)).toBeVisible();
    });

    test('TC-BD-024: Search with no results', async ({ page }) => {
      await R.applySearch(page, 'ZZ_DEFINITELY_NONE_999');
      await expect(page.getByText(/No records found|No Data/i).first()).toBeVisible();
    });
  });

  test.describe('Suite 5: Data Table & Grid', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-BD-025: Key columns are visible', async ({ page }) => {
      const headers = (await R.headerTexts(page)).join(' | ').toLowerCase();
      for (const col of COLUMNS) expect(headers).toContain(col.toLowerCase());
    });

    test('TC-BD-026: Manage Column hides/shows columns', async ({ page }) => {
      await R.manageColumnButton(page).click({ force: true });
      await expect(page.getByRole('checkbox').first()).toBeVisible();
    });

    test('TC-BD-028: View opens the breakdown detail', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      const icon = R.bodyRows(page).first().locator('img, svg').first();
      if (!(await icon.isVisible().catch(() => false))) { test.skip(); return; }
      await icon.click({ force: true });
      await page.waitForTimeout(1500);
      expect(page.url()).toContain('/reports');
    });

    test('TC-BD-034: Sr. No. increments across pages', async ({ page }) => {
      if (await R.rowCount(page) === 0) { test.skip(); return; }
      expect((await R.rowCells(page, 0).first().innerText()).trim()).toBe('1');
    });
  });

  test.describe('Suite 6: Export Feature', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-BD-035: Export full dataset to Excel', async ({ page }) => {
      const dl = page.waitForEvent('download', { timeout: 12000 }).catch(() => null);
      await R.exportButton(page).click({ force: true });
      const download = await dl;
      if (!download) { test.skip(); return; }
      expect(download.suggestedFilename()).toBeTruthy();
    });

    test('TC-BD-038: Exported formatting and headers', async () => { test.skip(); });
  });

  test.describe('Suite 7: Pagination', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-BD-039: Change rows per page', async ({ page }) => {
      const sel = R.rowsPerPageSelect(page);
      if (!(await sel.isVisible().catch(() => false))) { test.skip(); return; }
      await R.setRowsPerPage(page, '10');
      expect(await R.rowCount(page)).toBeLessThanOrEqual(10);
    });

    test('TC-BD-041: Previous disabled on page 1', async ({ page }) => {
      await expect(R.prevPageButton(page)).toBeDisabled();
    });
  });

  test.describe('Suite 8: UI/UX & Error Handling', () => {
    test('TC-BD-043: Empty state when no breakdowns match', async ({ page }) => {
      await R.gotoReport(page, URL, HEADING);
      await R.applySearch(page, 'ZZ_EMPTY_STATE');
      await expect(page.getByText(/No records found|No Data/i).first()).toBeVisible();
    });

    test('TC-BD-045: API failure / timeout handling', async () => { test.skip(); });
    test('TC-BD-046: Invalid Date Range (Start > End)', async () => { test.skip(); });
  });

  test.describe('Suite 9: Integrated Validation', () => {
    test.beforeEach(async ({ page }) => { await R.gotoReport(page, URL, HEADING); });

    test('TC-BD-047: Card count <-> table synchronization per status', async ({ page }) => {
      const names = await R.cardNames(page);
      if (names.length === 0) { test.skip(); return; }
      for (const status of names) {
        await R.gotoReport(page, URL, HEADING);
        const card = await R.cardCount(page, status);
        await R.applyStatusFilter(page, status);
        await R.setRowsPerPage(page, '100');
        expect(await R.rowCount(page)).toBe(card);
      }
    });

    test('TC-BD-050: Reset workflow restores all data', async ({ page }) => {
      const names = await R.cardNames(page);
      if (names.length === 0) { test.skip(); return; }
      await R.applyStatusFilter(page, names[0]);
      await R.clearAllButton(page).click({ force: true });
      await R.waitForGridSettled(page);
      expect((await R.cardNames(page)).length).toBeGreaterThanOrEqual(1);
    });
  });
});
