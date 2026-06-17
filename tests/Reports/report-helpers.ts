// Shared helpers for the Reports module specs.
//
// Verified against staging (https://stage.elevatorplus.net/reports/*):
//  - The listing reports render a DIV-based ARIA grid, NOT a native <table>:
//      role="table"  ->  two role="rowgroup" (header, body)
//      header row    ->  first rowgroup's role="row"; column labels are <button>s
//      body rows     ->  second rowgroup's role="row"; cells are role="cell"
//  - The report Search box is input#search (NOT the top navbar #filled-search).
//  - Toolbar buttons: "Manage Column", "Export", "Filter"/"Filters", "Clear All".
//  - Status cards are reactstrap cards: a `.card-body` holding a <p> (status name)
//    and an <h3> (count). Cards that are display-only show only statuses with >=1
//    record; the Job report shows all statuses + a clickable "Total" card.
//  - Rows-per-page is a single <select> with options 10/25/50/100.
//  - Pagination exposes "Previous page" / "Next page" buttons and a
//    "Page X of Y" text (most reports) or a numbered pager (Import Logs).
//  - A first-run "Maybe Later" notification popup can intercept clicks.

import type { Page, Locator } from '@playwright/test';

export const REPORTS_BASE = '/reports';

// ─── popup / overlay guards ──────────────────────────────────────────────────

export async function registerPopupHandler(page: Page) {
  if ((page as any).__popupHandlerRegistered) return;
  (page as any).__popupHandlerRegistered = true;
  await page.addLocatorHandler(
    page.getByRole('button', { name: /Maybe Later/i }),
    async () => {
      await page.getByRole('button', { name: /Maybe Later/i }).click().catch(() => {});
    }
  );
}

export async function dismissOverlays(page: Page) {
  await page.addStyleTag({
    content: [
      '.checklist-component { display: none !important; }',
      '.header-navbar-shadow { pointer-events: none !important; }',
    ].join('\n'),
  }).catch(() => {});
}

// ─── navigation ──────────────────────────────────────────────────────────────

/** Navigate to a report and wait until its grid or empty state has settled. */
export async function gotoReport(page: Page, path: string, heading: RegExp) {
  await registerPopupHandler(page);
  await page.goto(path);
  await page.getByRole('heading', { name: heading }).first()
    .waitFor({ state: 'visible', timeout: 30000 });
  await waitForGridSettled(page);
  await dismissOverlays(page);
}

/** Wait until either body rows render or a "No records found" state is shown. */
export async function waitForGridSettled(page: Page) {
  await page.getByText(/Loading\.\.\./i).waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
  await Promise.race([
    bodyRows(page).first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {}),
    page.getByText(/No records found|No Data|There are no records/i).first()
      .waitFor({ state: 'visible', timeout: 15000 }).catch(() => {}),
  ]);
}

// ─── grid ────────────────────────────────────────────────────────────────────

export function reportTable(page: Page): Locator {
  return page.getByRole('table').first();
}

/** Body data rows (second rowgroup). Empty when the grid shows its empty state. */
export function bodyRows(page: Page): Locator {
  return page.getByRole('rowgroup').nth(1).getByRole('row');
}

/** Column header labels (rendered as buttons in the header rowgroup). */
export async function headerTexts(page: Page): Promise<string[]> {
  const headerRow = page.getByRole('rowgroup').first().getByRole('row').first();
  await headerRow.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  const texts = await headerRow.getByRole('button').allInnerTexts().catch(() => [] as string[]);
  return texts.map(t => t.trim()).filter(Boolean);
}

export function rowCells(page: Page, rowIndex: number): Locator {
  return bodyRows(page).nth(rowIndex).getByRole('cell');
}

export async function rowCount(page: Page): Promise<number> {
  return bodyRows(page).count();
}

// ─── toolbar: search / filter / export / clear ───────────────────────────────

export function searchInput(page: Page): Locator {
  return page.locator('input#search');
}

/** Fill the report search box (live-filtered) and wait for the grid to settle. */
export async function applySearch(page: Page, text: string) {
  await searchInput(page).fill(text);
  await page.waitForTimeout(1200);
  await waitForGridSettled(page);
}

export function toolbarButton(page: Page, name: RegExp): Locator {
  return page.getByRole('button', { name }).first();
}

export function exportButton(page: Page): Locator {
  return page.getByRole('button', { name: /^Export/i }).first();
}

export function manageColumnButton(page: Page): Locator {
  return page.getByRole('button', { name: /Manage Column/i }).first();
}

export function clearAllButton(page: Page): Locator {
  return page.getByRole('button', { name: /Clear All/i }).first();
}

/** Open the Filter / Filters slide-over and wait for its Apply button. */
export async function openFilter(page: Page) {
  await page.getByRole('button', { name: /^Filters?$/i }).first().click({ force: true });
  await page.getByRole('button', { name: /^Apply$/i }).first()
    .waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
}

export function applyFilterButton(page: Page): Locator {
  return page.getByRole('button', { name: /^Apply$/i }).first();
}

export function resetFilterButton(page: Page): Locator {
  return page.getByRole('button', { name: /^Reset$/i }).first();
}

/** Scroll a (possibly off-screen, in the tall filter drawer) element in and click. */
export async function scrollClick(loc: Locator) {
  await loc.scrollIntoViewIfNeeded().catch(() => {});
  await loc.click();
}

/** Click the filter panel's Apply button (scrolls the sticky footer into view first). */
export async function clickApply(page: Page) {
  await scrollClick(applyFilterButton(page));
  await waitForGridSettled(page);
}

/** Click a status button inside the open Filter panel's status group, then Apply. */
export async function applyStatusFilter(page: Page, status: string) {
  await openFilter(page);
  await scrollClick(page.getByRole('button', { name: status, exact: true }).first());
  await clickApply(page);
}

// ─── status cards ─────────────────────────────────────────────────────────────

/** Names of all visible status cards (excludes a "Total" card). */
export async function cardNames(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    return Array.from(document.querySelectorAll('.card-body'))
      .filter(c => c.querySelector('h3'))
      .map(c => (c.querySelector('p')?.textContent || '').trim())
      .filter(Boolean);
  });
}

/** Numeric count shown on the status card with the given name (null if absent). */
export async function cardCount(page: Page, name: string): Promise<number | null> {
  return page.evaluate((n) => {
    const card = Array.from(document.querySelectorAll('.card-body'))
      .find(c => (c.querySelector('p')?.textContent || '').trim() === n);
    if (!card) return null;
    const h3 = card.querySelector('h3');
    if (!h3) return null;
    const v = parseInt((h3.textContent || '').replace(/[^0-9-]/g, ''), 10);
    return isNaN(v) ? null : v;
  }, name);
}

/** A status card locator (the reactstrap .card-body) by its status name. */
export function statusCard(page: Page, name: string): Locator {
  return page.locator('.card-body').filter({ has: page.getByText(name, { exact: true }) }).first();
}

/** Click a (clickable) status card — used by the Job report whose cards filter. */
export async function clickStatusCard(page: Page, name: string) {
  await scrollClick(statusCard(page, name));
  await waitForGridSettled(page);
}

/**
 * Count body rows whose status equals `status`, scanning every cell so it works
 * regardless of which column holds the status badge. Sets 100 rows/page first so
 * all matching rows are on one page (report data sets are well under 100).
 */
export async function countRowsByStatus(page: Page, status: string): Promise<number> {
  await setRowsPerPage(page, '100');
  const rows = await rowCount(page);
  let n = 0;
  for (let i = 0; i < rows; i++) {
    const texts = await bodyRows(page).nth(i).getByRole('cell').allInnerTexts().catch(() => [] as string[]);
    if (texts.some(t => t.trim() === status)) n++;
  }
  return n;
}

// ─── pagination ───────────────────────────────────────────────────────────────

export function rowsPerPageSelect(page: Page): Locator {
  return page.locator('select').filter({ has: page.locator('option', { hasText: '25' }) }).first();
}

export function nextPageButton(page: Page): Locator {
  return page.getByRole('button', { name: /Next page/i }).first();
}

export function prevPageButton(page: Page): Locator {
  return page.getByRole('button', { name: /Previous page/i }).first();
}

export function pageIndicator(page: Page): Locator {
  return page.getByText(/Page\s+\d+\s+of\s+\d+/i).first();
}

export async function canNavigateNext(page: Page): Promise<boolean> {
  const next = nextPageButton(page);
  if (!(await next.isVisible().catch(() => false))) return false;
  return !(await next.isDisabled().catch(() => true));
}

export async function setRowsPerPage(page: Page, value: '10' | '25' | '50' | '100') {
  const sel = rowsPerPageSelect(page);
  if (await sel.isVisible().catch(() => false)) {
    await sel.selectOption(value).catch(() => {});
    await waitForGridSettled(page);
  }
}
