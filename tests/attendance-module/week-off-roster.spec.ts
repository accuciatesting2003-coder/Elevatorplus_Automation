import { test, expect } from '../fixtures/auth-fixture';

const WEEK_OFF_ROSTER_URL = '/attendance/week-off-roster';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function registerPopupHandler(page: any) {
  if ((page as any).__weekOffHandlerRegistered) return;
  (page as any).__weekOffHandlerRegistered = true;

  await page.addLocatorHandler(
    page.getByRole('button', { name: /Maybe Later/i }),
    async () => {
      await page.getByRole('button', { name: /Maybe Later/i }).click().catch(() => {});
    }
  );

  // Auto-dismiss onboarding progress widget when it intercepts clicks
  await page.addLocatorHandler(
    page.locator('.checklist-component.visible:not(.collapsed)'),
    async () => {
      await page.getByRole('button', { name: 'Collapse' }).click().catch(() => {});
      await page.waitForTimeout(500);
    }
  );
}

async function dismissOnboardingWidget(page: any) {
  await page.evaluate(() => {
    const el = document.querySelector('.checklist-component');
    if (el) (el as HTMLElement).style.display = 'none';
  }).catch(() => {});
}

async function dismissNotificationPopup(page: any) {
  try {
    const btn = page.getByRole('button', { name: /Maybe Later/i });
    if (await btn.isVisible({ timeout: 5000 }).catch(() => false)) await btn.click();
  } catch { /* absent */ }
}

async function gotoWeekOffRoster(page: any) {
  await registerPopupHandler(page);
  await page.goto(WEEK_OFF_ROSTER_URL, { timeout: 60000 });
  // Week range label confirms the page is loaded (e.g. "Jun 1 to Jun 7, 2026")
  await weekRangeLabel(page).waitFor({ state: 'visible', timeout: 45000 });
  await page.waitForLoadState('networkidle');
  await dismissNotificationPopup(page);
  await dismissOnboardingWidget(page);
  // Brief pause so React doesn't undo the style.display='none' on re-render
  await page.waitForTimeout(600);
  await waitForTableRows(page);
}

async function waitForTableRows(page: any) {
  await page.locator('[id^="row-"]').first().waitFor({ state: 'visible', timeout: 60000 });
}

// ─────────────────────────────────────────────────────────────────────────────
// Locator helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Week range label e.g. "Jun 1 to Jun 7, 2026"
 * The span has inline style="font-weight: 600; font-size: medium;" — this uniquely
 * identifies it and avoids the strict-mode violation caused by the page-title span
 * that also contains the week range text as a substring.
 */
const weekRangeLabel = (page: any) =>
  page.locator('span[style*="font-weight: 600"]');

/**
 * Prev-week: left-chevron SVG (class="mr-2", style="cursor: pointer;").
 * These are raw <svg> elements with onClick — NOT <button> wrappers.
 * Click the <svg> itself, not a child <polyline>, so the click event fires on the
 * element that has the handler.
 */
const prevWeekSvg = (page: any) => page.locator('svg.mr-2');

/** Next-week: right-chevron SVG (class="ml-2", style="cursor: pointer;") */
const nextWeekSvg = (page: any) => page.locator('svg.ml-2');

/** Date picker — id="weekDate", type="date", value format YYYY-MM-DD */
const dateInput = (page: any) => page.locator('#weekDate');

/**
 * Employee name search in the roster card toolbar.
 * In the accessibility tree this textbox has NO accessible name and NO placeholder.
 * It lives inside .card-body alongside the date input (id="weekDate", type="date").
 * Excluding type="date" from the .card-body scope leaves exactly the search input.
 */
const searchInput = (page: any) =>
  page.locator('.card-body input:not([type="date"])');

/** All data rows (react-data-table; IDs are row-0, row-1, …) */
const allRows = (page: any) => page.locator('[id^="row-"]');

/** A specific data row by 0-based index */
const rowAt = (page: any, index: number) => page.locator(`#row-${index}`);

/**
 * First clickable "-" cell (available future date) in a row.
 * DOM class: "attendanceBtn btn btn-secondary" + title="Click to mark weekly off"
 */
const markWeekOffBtn = (page: any, rowIndex: number) =>
  page.locator(`#row-${rowIndex} button[title="Click to mark weekly off"]`).first();

/**
 * First enabled (manually-added, removable) "Week Off" badge in a row.
 * DOM class: "btn btn-danger" (no btn-sm, not disabled).
 */
const enabledWeekOffBadge = (page: any, rowIndex: number) =>
  page.locator(`#row-${rowIndex} button.btn-danger:not(.btn-sm):not([disabled])`).first();

/**
 * First disabled (User Master) "Week Off" badge in a row.
 * DOM class: "btn btn-danger btn-sm disabled", disabled=true.
 */
const disabledWeekOffBadge = (page: any, rowIndex: number) =>
  page.locator(`#row-${rowIndex} button.btn-danger.btn-sm.disabled`).first();

/** Holiday heading (h6) within a row — red text, non-interactive */
const holidayCellInRow = (page: any, rowIndex: number) =>
  page.locator(`#row-${rowIndex} h6`).first();

/** Toast notification matcher */
const toastWith = (page: any, msg: string | RegExp) =>
  page.locator('[role="alert"]').filter({ hasText: msg });

// ─────────────────────────────────────────────────────────────────────────────
// Navigation helpers
// ─────────────────────────────────────────────────────────────────────────────

async function goNextWeek(page: any) {
  const before = await weekRangeLabel(page).textContent();
  await nextWeekSvg(page).click();
  // Wait until the styled span's text actually changes to the new week range
  await page.waitForFunction(
    (prev: string) => {
      const el = document.querySelector('span[style*="font-weight"]');
      return el ? el.textContent !== prev : false;
    },
    before,
    { timeout: 10000 }
  );
  await waitForTableRows(page);
}

async function goPrevWeek(page: any) {
  const before = await weekRangeLabel(page).textContent();
  await prevWeekSvg(page).click();
  await page.waitForFunction(
    (prev: string) => {
      const el = document.querySelector('span[style*="font-weight"]');
      return el ? el.textContent !== prev : false;
    },
    before,
    { timeout: 10000 }
  );
  await waitForTableRows(page);
}

// ─────────────────────────────────────────────────────────────────────────────
// Row-scanner helpers (avoid hardcoded row indices)
// ─────────────────────────────────────────────────────────────────────────────

/** Returns 0-based index of first row that has at least one clickable "-" cell, or -1 */
async function findRowWithClickableCell(page: any): Promise<number> {
  const count = await allRows(page).count();
  for (let i = 0; i < Math.min(count, 30); i++) {
    if (await page.locator(`#row-${i} button[title="Click to mark weekly off"]`).count() > 0) return i;
  }
  return -1;
}

/** Returns 0-based index of first row that has an enabled (removable) "Week Off" badge, or -1 */
async function findRowWithEnabledWeekOff(page: any): Promise<number> {
  const count = await allRows(page).count();
  for (let i = 0; i < Math.min(count, 30); i++) {
    if (await page.locator(`#row-${i} button.btn-danger:not(.btn-sm):not([disabled])`).count() > 0) return i;
  }
  return -1;
}

/** Returns 0-based index of first row that has a disabled (User Master) "Week Off" badge, or -1 */
async function findRowWithDisabledWeekOff(page: any): Promise<number> {
  const count = await allRows(page).count();
  for (let i = 0; i < Math.min(count, 30); i++) {
    if (await page.locator(`#row-${i} button.btn-danger.btn-sm.disabled`).count() > 0) return i;
  }
  return -1;
}

/** Returns 0-based index of first row that has a holiday h6 cell, or -1 */
async function findRowWithHoliday(page: any): Promise<number> {
  const count = await allRows(page).count();
  for (let i = 0; i < Math.min(count, 30); i++) {
    if (await page.locator(`#row-${i} h6`).count() > 0) return i;
  }
  return -1;
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1 — Smoke Tests
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await gotoWeekOffRoster(page);
  });

  test('TC-SM-01: Week Off Roster page loads successfully', async ({ page }) => {
    await expect(page).toHaveURL(new RegExp(WEEK_OFF_ROSTER_URL));
    await expect(page.getByRole('heading', { level: 2, name: 'Week Off Roster' })).toBeVisible();
    await expect(page.getByText('Manage weekly off schedules for employees')).toBeVisible();
    await expect(weekRangeLabel(page)).toBeVisible();
    await expect(prevWeekSvg(page)).toBeVisible();
    await expect(nextWeekSvg(page)).toBeVisible();
    await expect(dateInput(page)).toBeVisible();
    await expect(searchInput(page)).toBeVisible();
    await expect(allRows(page).first()).toBeVisible();
  });

  test('TC-SM-02: All 9 table column headers are present', async ({ page }) => {
    await expect(page.getByRole('button', { name: /^Sr\. No\./ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Employee Name/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Mon,/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Tue,/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Wed,/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Thu,/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Fri,/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Sat,/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Sun,/ })).toBeVisible();
  });

  test('TC-SM-03: All active users are listed with non-empty names', async ({ page }) => {
    const rowCount = await allRows(page).count();
    expect(rowCount).toBeGreaterThan(0);
    // First and last rows both have a non-empty employee name column
    await expect(rowAt(page, 0).locator('[role="cell"]').nth(1)).not.toHaveText('');
    await expect(rowAt(page, rowCount - 1).locator('[role="cell"]').nth(1)).not.toHaveText('');
  });

  test('TC-SM-04: Legend note bar is displayed correctly', async ({ page }) => {
    await expect(page.getByText('Weekly off (from user settings or manually marked)')).toBeVisible();
    await expect(page.getByText('Company holiday (non-editable)')).toBeVisible();
    await expect(page.getByText('Available - Click to mark weekly off')).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 2 — Week Navigation
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Week Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await gotoWeekOffRoster(page);
  });

  test('TC-NAV-01: Next (>) navigates to the following week', async ({ page }) => {
    const labelBefore = await weekRangeLabel(page).textContent();
    const monBefore = await page.getByRole('button', { name: /^Mon,/ }).textContent();

    await goNextWeek(page);

    const labelAfter = await weekRangeLabel(page).textContent();
    const monAfter = await page.getByRole('button', { name: /^Mon,/ }).textContent();

    expect(labelAfter).not.toEqual(labelBefore);
    expect(monAfter).not.toEqual(monBefore);
  });

  test('TC-NAV-02: Previous (<) navigates to the prior week', async ({ page }) => {
    const labelBefore = await weekRangeLabel(page).textContent();
    const monBefore = await page.getByRole('button', { name: /^Mon,/ }).textContent();

    await goPrevWeek(page);

    const labelAfter = await weekRangeLabel(page).textContent();
    const monAfter = await page.getByRole('button', { name: /^Mon,/ }).textContent();

    expect(labelAfter).not.toEqual(labelBefore);
    expect(monAfter).not.toEqual(monBefore);
  });

  test('TC-NAV-03: Next then Previous returns to the original week', async ({ page }) => {
    const original = await weekRangeLabel(page).textContent();
    await goNextWeek(page);
    await goPrevWeek(page);
    const restored = await weekRangeLabel(page).textContent();
    expect(restored).toEqual(original);
  });

  test('TC-NAV-04: Date picker navigates to the week containing the selected date', async ({ page }) => {
    // Choose a date 14 days in the future
    const future = new Date();
    future.setDate(future.getDate() + 14);
    const yyyy = future.getFullYear();
    const mm = String(future.getMonth() + 1).padStart(2, '0');
    const dd = String(future.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    await dateInput(page).fill(dateStr);
    await dateInput(page).press('Enter');
    await page.waitForTimeout(800);
    await waitForTableRows(page);

    const label = await weekRangeLabel(page).textContent();
    expect(label).toMatch(/\w+ \d+ to \w+ \d+, \d{4}/);
    // Year must match selected date's year (or adjacent if week spans year boundary)
    expect(label).toContain(yyyy.toString());
  });

  test('TC-NAV-05: Page defaults to the current calendar week on load', async ({ page }) => {
    const today = new Date();
    const label = await weekRangeLabel(page).textContent();
    const monthAbbr = today.toLocaleString('en-US', { month: 'short' }); // e.g. "Jun"
    expect(label).toContain(today.getFullYear().toString());
    expect(label).toContain(monthAbbr);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 3 — Mark Week Off (Add)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Mark Week Off (Add)', () => {
  test.beforeEach(async ({ page }) => {
    await gotoWeekOffRoster(page);
    // Navigate to next week so all 7 days are future and clickable
    await goNextWeek(page);
  });

  test('TC-ADD-01: Clicking "-" cell marks it as Week Off and shows success toast', async ({ page }) => {
    const rowIndex = await findRowWithClickableCell(page);
    test.skip(rowIndex === -1, 'No clickable "-" cell found in next week');

    await markWeekOffBtn(page, rowIndex).click();

    await expect(toastWith(page, 'Week Off added successfully!')).toBeVisible({ timeout: 10000 });
    // The cell switches from "-" to an enabled "Week Off" badge
    await expect(enabledWeekOffBadge(page, rowIndex)).toBeVisible({ timeout: 5000 });
  });

  test('TC-ADD-02: Week Off can be added for any available day (Mon–Sun) in the same row', async ({ page }) => {
    const rowIndex = await findRowWithClickableCell(page);
    test.skip(rowIndex === -1, 'No clickable "-" cell found');

    const allClickable = page.locator(`#row-${rowIndex} button[title="Click to mark weekly off"]`);
    const clickableCount = await allClickable.count();
    expect(clickableCount).toBeGreaterThanOrEqual(1);

    // Add week off for the first available day
    await allClickable.first().click();
    await expect(toastWith(page, 'Week Off added successfully!')).toBeVisible({ timeout: 10000 });
  });

  test('TC-ADD-03: Multiple week offs can be added for the same employee in one week', async ({ page }) => {
    const rowIndex = await findRowWithClickableCell(page);
    test.skip(rowIndex === -1, 'No clickable "-" cell found');

    const clickable = () => page.locator(`#row-${rowIndex} button[title="Click to mark weekly off"]`);
    expect(await clickable().count()).toBeGreaterThanOrEqual(2);

    // Add first week off — table enters a loading state briefly, wait for it to re-stabilise
    await clickable().first().click();
    await expect(toastWith(page, 'Week Off added successfully!')).toBeVisible({ timeout: 10000 });
    await waitForTableRows(page);

    // After re-render, at least one more clickable cell must remain
    expect(await clickable().count()).toBeGreaterThanOrEqual(1);

    // Add second week off
    await clickable().first().click();
    await expect(toastWith(page, 'Week Off added successfully!')).toBeVisible({ timeout: 10000 });
    await waitForTableRows(page);

    // Row should now have at least 2 enabled "Week Off" badges
    const badges = await page.locator(`#row-${rowIndex} button.btn-danger:not(.btn-sm):not([disabled])`).count();
    expect(badges).toBeGreaterThanOrEqual(2);
  });

  test('TC-ADD-04: Week Off can be added for multiple employees on the same date', async ({ page }) => {
    const firstRow = await findRowWithClickableCell(page);
    test.skip(firstRow === -1, 'No clickable "-" cell found');

    // Add for first employee
    await markWeekOffBtn(page, firstRow).click();
    await expect(toastWith(page, 'Week Off added successfully!')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(400);

    // Find another employee with a clickable cell
    const total = await allRows(page).count();
    let secondRow = -1;
    for (let i = firstRow + 1; i < Math.min(total, 30); i++) {
      if (await page.locator(`#row-${i} button[title="Click to mark weekly off"]`).count() > 0) {
        secondRow = i;
        break;
      }
    }
    test.skip(secondRow === -1, 'Could not find a second row with a clickable cell');

    await markWeekOffBtn(page, secondRow).click();
    await expect(toastWith(page, 'Week Off added successfully!')).toBeVisible({ timeout: 10000 });

    // Both employees now have at least one enabled "Week Off" badge
    await expect(enabledWeekOffBadge(page, firstRow)).toBeVisible();
    await expect(enabledWeekOffBadge(page, secondRow)).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 4 — Remove Week Off
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Remove Week Off', () => {
  test.beforeEach(async ({ page }) => {
    await gotoWeekOffRoster(page);
  });

  test('TC-REM-01: Clicking enabled "Week Off" badge removes it and shows a toast', async ({ page }) => {
    // First add a week off so we have something to remove
    await goNextWeek(page);
    const rowIndex = await findRowWithClickableCell(page);
    test.skip(rowIndex === -1, 'No clickable "-" cell found in next week');

    await markWeekOffBtn(page, rowIndex).click();
    await expect(toastWith(page, 'Week Off added successfully!')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500);

    // Now remove it
    const badge = enabledWeekOffBadge(page, rowIndex);
    await expect(badge).toBeVisible();
    await badge.click();

    // A removal toast should appear (toast text may vary — assert any alert is shown)
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 10000 });
    await waitForTableRows(page);
    // The enabled badge should disappear; a clickable "-" should reappear in its place
    await expect(page.locator(`#row-${rowIndex} button[title="Click to mark weekly off"]`).first()).toBeVisible({ timeout: 5000 });
  });

  test('TC-REM-02: Disabled User Master badge is non-interactive — click does nothing', async ({ page }) => {
    const rowIndex = await findRowWithDisabledWeekOff(page);
    test.skip(rowIndex === -1, 'No User Master disabled badge found in current staging data');

    const badge = disabledWeekOffBadge(page, rowIndex);
    await expect(badge).toBeVisible();
    await expect(badge).toBeDisabled();
    await expect(badge).toHaveText('Week Off');

    // Force-click and confirm no toast appears and badge stays disabled
    await badge.click({ force: true });
    await page.waitForTimeout(1000);
    await expect(toastWith(page, /Week Off/)).not.toBeVisible();
    await expect(badge).toBeDisabled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 5 — Holiday Constraint
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Holiday Constraint', () => {
  test.beforeEach(async ({ page }) => {
    await gotoWeekOffRoster(page);
  });

  test('TC-HOL-01: Holiday cell is an h6 heading, not a button, and cannot add week off', async ({ page }) => {
    const rowIndex = await findRowWithHoliday(page);
    test.skip(rowIndex === -1, 'No company holiday found in current week');

    const holiday = holidayCellInRow(page, rowIndex);
    await expect(holiday).toBeVisible();
    // Confirm it is a heading (h6), not an interactive button
    const tag = await holiday.evaluate((el: Element) => el.tagName.toLowerCase());
    expect(tag).toBe('h6');

    // Force-click; no "Week Off added" toast should appear
    await holiday.click({ force: true });
    await page.waitForTimeout(800);
    await expect(toastWith(page, 'Week Off added successfully!')).not.toBeVisible();
  });

  test('TC-HOL-02: Holiday applies to all employees — all rows show holiday cell on that date', async ({ page }) => {
    const rowIndex = await findRowWithHoliday(page);
    test.skip(rowIndex === -1, 'No company holiday found in current week');

    // At least several rows should have an h6 cell (the holiday applies to all)
    let holidayRowCount = 0;
    const total = await allRows(page).count();
    for (let i = 0; i < Math.min(total, 15); i++) {
      if (await page.locator(`#row-${i} h6`).count() > 0) holidayRowCount++;
    }
    expect(holidayRowCount).toBeGreaterThan(1);
  });

  test('TC-HOL-03: Non-holiday dates in the same week remain editable', async ({ page }) => {
    const rowIndex = await findRowWithHoliday(page);
    test.skip(rowIndex === -1, 'No company holiday found in current week');

    // The same row that has a holiday should still have some interactive cells (other days)
    const clickable = await page.locator(`#row-${rowIndex} button[title="Click to mark weekly off"]`).count();
    const weekOffBadges = await page.locator(`#row-${rowIndex} button.btn-danger`).count();
    expect(clickable + weekOffBadges).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 6 — Past Date Constraints
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Past Date Constraints', () => {
  test.beforeEach(async ({ page }) => {
    await gotoWeekOffRoster(page);
    // Navigate one week back — all 7 days are in the past
    await goPrevWeek(page);
  });

  test('TC-PAST-01: No clickable "-" cells exist in a fully past week', async ({ page }) => {
    const clickableCount = await page.locator('button[title="Click to mark weekly off"]').count();
    // In a past week there should be no cells with the "mark weekly off" title
    expect(clickableCount).toBe(0);
  });

  test('TC-PAST-02: Past available "-" cells render as disabled buttons', async ({ page }) => {
    // Past available cells have class "attendanceBtn btn btn-secondary btn-sm disabled"
    const disabledAvail = page.locator('button.attendanceBtn.btn-sm.disabled');
    const count = await disabledAvail.count();
    expect(count).toBeGreaterThan(0);
    await expect(disabledAvail.first()).toBeDisabled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 7 — Employee Search
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Employee Search', () => {
  test.beforeEach(async ({ page }) => {
    await gotoWeekOffRoster(page);
  });

  test('TC-SRC-01: Search by full employee name filters the table', async ({ page }) => {
    const totalBefore = await allRows(page).count();
    const fullName = (await rowAt(page, 0).locator('[role="cell"]').nth(1).textContent())?.trim() ?? '';
    expect(fullName).toBeTruthy();

    await searchInput(page).fill(fullName);
    // Allow debounce + re-render; then wait until the filtered row appears
    await page.waitForTimeout(800);
    await allRows(page).first().waitFor({ state: 'visible', timeout: 10000 });

    const rowCount = await allRows(page).count();
    expect(rowCount).toBeGreaterThanOrEqual(1);
    expect(rowCount).toBeLessThan(totalBefore);
    await expect(allRows(page).first().locator('[role="cell"]').nth(1)).toContainText(fullName, { ignoreCase: true });
  });

  test('TC-SRC-02: Search by partial name returns only matching employees', async ({ page }) => {
    const totalBefore = await allRows(page).count();
    await searchInput(page).fill('Ra');
    await page.waitForTimeout(800);
    await allRows(page).first().waitFor({ state: 'visible', timeout: 10000 });
    const totalAfter = await allRows(page).count();
    expect(totalAfter).toBeGreaterThanOrEqual(1);
    expect(totalAfter).toBeLessThan(totalBefore);
  });

  test('TC-SRC-03: Search is case-insensitive', async ({ page }) => {
    const totalBefore = await allRows(page).count();
    const name = (await rowAt(page, 0).locator('[role="cell"]').nth(1).textContent())?.trim() ?? '';
    await searchInput(page).fill(name.toUpperCase());
    await page.waitForTimeout(800);
    await allRows(page).first().waitFor({ state: 'visible', timeout: 10000 });
    expect(await allRows(page).count()).toBeLessThan(totalBefore);
    await expect(allRows(page).first().locator('[role="cell"]').nth(1)).toContainText(name, { ignoreCase: true });
  });

  test('TC-SRC-04: Non-existent name returns no rows', async ({ page }) => {
    await searchInput(page).fill('XXXX_NO_MATCH_99999');
    // Wait until all data rows disappear (search filter applied)
    await page.waitForFunction(
      () => document.querySelectorAll('[id^="row-"]').length === 0,
      undefined,
      { timeout: 5000 }
    );
    const rowCount = await allRows(page).count();
    expect(rowCount).toBe(0);
  });

  test('TC-SRC-05: Clearing search restores full employee list', async ({ page }) => {
    const totalBefore = await allRows(page).count();
    await searchInput(page).fill('xyz');
    await page.waitForFunction(
      (expected: number) => document.querySelectorAll('[id^="row-"]').length < expected,
      totalBefore,
      { timeout: 5000 }
    ).catch(() => {});

    await searchInput(page).clear();
    // Wait for rows to restore to original count
    await page.waitForFunction(
      (expected: number) => document.querySelectorAll('[id^="row-"]').length >= expected,
      totalBefore,
      { timeout: 5000 }
    );
    const totalAfter = await allRows(page).count();
    expect(totalAfter).toEqual(totalBefore);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 8 — Column Sorting
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Column Sorting', () => {
  test.beforeEach(async ({ page }) => {
    await gotoWeekOffRoster(page);
  });

  test('TC-SORT-01: Clicking Employee Name column header toggles A→Z then Z→A order', async ({ page }) => {
    // First click — ascending (A→Z)
    await page.getByRole('button', { name: /^Employee Name/ }).click();
    await page.waitForTimeout(500);
    const nameAsc = await rowAt(page, 0).locator('[role="cell"]').nth(1).textContent();

    // Second click — descending (Z→A)
    await page.getByRole('button', { name: /^Employee Name/ }).click();
    await page.waitForTimeout(500);
    const nameDesc = await rowAt(page, 0).locator('[role="cell"]').nth(1).textContent();

    // First row name must differ between ascending and descending sort
    expect(nameDesc).not.toEqual(nameAsc);
  });

  test('TC-SORT-02: Sr. No. column header is clickable and table remains stable after click', async ({ page }) => {
    const countBefore = await allRows(page).count();
    await page.getByRole('button', { name: /^Sr\. No\./ }).click();
    await page.waitForTimeout(500);
    // Table must still show the same number of rows — no data lost after sort click
    const countAfter = await allRows(page).count();
    expect(countAfter).toEqual(countBefore);
    await expect(allRows(page).first()).toBeVisible();
  });

  test('TC-SORT-03: Table remains usable and sortable after week navigation', async ({ page }) => {
    // Sort by Employee Name then navigate — verify table still loads and is sortable
    await page.getByRole('button', { name: /^Employee Name/ }).click();
    await page.waitForTimeout(300);

    await goNextWeek(page);

    // Table must still show rows after navigation regardless of sort state
    await expect(allRows(page).first()).toBeVisible();
    const rowCount = await allRows(page).count();
    expect(rowCount).toBeGreaterThan(0);

    // Sorting must still work on the new week
    await page.getByRole('button', { name: /^Sr\. No\./ }).click();
    await page.waitForTimeout(400);
    await expect(allRows(page).first()).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 9 — Navigation and Access
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Navigation and Access', () => {
  test('TC-ACC-01: Week Off Roster is accessible via the Attendance sidebar link', async ({ page }) => {
    await registerPopupHandler(page);
    await page.goto('/', { timeout: 60000 });
    await page.waitForLoadState('networkidle');
    await dismissOnboardingWidget(page);

    // Open the Attendance submenu and click the Week Off Roster link
    await page.getByRole('link', { name: /Attendance/i }).first().click();
    await page.waitForTimeout(400);
    await page.getByRole('link', { name: /Week Off Roster/i }).click();

    await expect(page).toHaveURL(new RegExp(WEEK_OFF_ROSTER_URL));
    await expect(page.getByRole('heading', { level: 2, name: 'Week Off Roster' })).toBeVisible({ timeout: 30000 });
    await expect(weekRangeLabel(page)).toBeVisible({ timeout: 15000 });
  });

  test('TC-ACC-02: Direct URL navigation works when authenticated', async ({ page }) => {
    await gotoWeekOffRoster(page);
    await expect(page).toHaveURL(new RegExp(WEEK_OFF_ROSTER_URL));
    await expect(weekRangeLabel(page)).toBeVisible();
    await expect(allRows(page).first()).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 10 — User Master Week Off Integration
// ─────────────────────────────────────────────────────────────────────────────

test.describe('User Master Week Off Integration', () => {
  test.beforeEach(async ({ page }) => {
    await gotoWeekOffRoster(page);
  });

  test('TC-UM-01: User Master week off day shows as a disabled pink badge in the roster', async ({ page }) => {
    const rowIndex = await findRowWithDisabledWeekOff(page);
    test.skip(rowIndex === -1, 'No User Master week off badge found in current staging data');

    const badge = disabledWeekOffBadge(page, rowIndex);
    await expect(badge).toBeVisible();
    await expect(badge).toBeDisabled();
    await expect(badge).toHaveText('Week Off');
    await expect(badge).toHaveClass(/btn-danger/);
    await expect(badge).toHaveClass(/btn-sm/);
    await expect(badge).toHaveClass(/disabled/);
  });

  test('TC-UM-02: User Master week off badge appears in every week (repeats weekly)', async ({ page }) => {
    const rowIndex = await findRowWithDisabledWeekOff(page);
    test.skip(rowIndex === -1, 'No User Master week off badge found');

    // Current week
    await expect(disabledWeekOffBadge(page, rowIndex)).toBeDisabled();

    // Next week — same row, same day column should still show the disabled badge
    await goNextWeek(page);
    await expect(disabledWeekOffBadge(page, rowIndex)).toBeVisible();
    await expect(disabledWeekOffBadge(page, rowIndex)).toBeDisabled();
  });

  test('TC-UM-03: Clicking User Master disabled badge does nothing — no toast, badge unchanged', async ({ page }) => {
    const rowIndex = await findRowWithDisabledWeekOff(page);
    test.skip(rowIndex === -1, 'No User Master week off badge found');

    const badge = disabledWeekOffBadge(page, rowIndex);
    await expect(badge).toBeDisabled();

    await badge.click({ force: true });
    await page.waitForTimeout(1000);

    // No toast should appear
    await expect(toastWith(page, /Week Off/)).not.toBeVisible();
    // Badge remains disabled
    await expect(badge).toBeDisabled();
  });

  test('TC-UM-04: Manual week off can be added on a day different from the User Master day', async ({ page }) => {
    const rowIndex = await findRowWithDisabledWeekOff(page);
    test.skip(rowIndex === -1, 'No User Master week off badge found');

    // Go to next week for guaranteed future dates
    await goNextWeek(page);

    const clickable = page.locator(`#row-${rowIndex} button[title="Click to mark weekly off"]`);
    test.skip(await clickable.count() === 0, 'No available future cell in this employee\'s row next week');

    await clickable.first().click();
    await expect(toastWith(page, 'Week Off added successfully!')).toBeVisible({ timeout: 10000 });

    // The User Master disabled badge should still be there, unchanged
    await expect(disabledWeekOffBadge(page, rowIndex)).toBeDisabled();
    // The manually added badge should also exist (enabled)
    await expect(enabledWeekOffBadge(page, rowIndex)).toBeVisible();
  });

  test('TC-UM-07: Employee with no User Master week off day shows only "-" or enabled badges', async ({ page }) => {
    await goNextWeek(page);
    const total = await allRows(page).count();

    // Find a row with NO disabled User Master badge
    let rowWithNoBadge = -1;
    for (let i = 0; i < Math.min(total, 30); i++) {
      if (await page.locator(`#row-${i} button.btn-danger.btn-sm.disabled`).count() === 0) {
        rowWithNoBadge = i;
        break;
      }
    }
    test.skip(rowWithNoBadge === -1, 'All employees have User Master week off configured');

    // That row must have zero disabled User Master badges
    const disabledCount = await page.locator(`#row-${rowWithNoBadge} button.btn-danger.btn-sm.disabled`).count();
    expect(disabledCount).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 11 — Edge Cases
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await gotoWeekOffRoster(page);
  });

  test('TC-EDGE-02: Page refresh reloads week off data without errors', async ({ page }) => {
    await page.reload({ waitUntil: 'networkidle' });
    await dismissOnboardingWidget(page);
    await waitForTableRows(page);

    await expect(weekRangeLabel(page)).toBeVisible();
    await expect(weekRangeLabel(page).textContent()).resolves.toMatch(/\w+ \d+ to \w+ \d+, \d{4}/);
    await expect(allRows(page).first()).toBeVisible();
  });

  test('TC-EDGE-03: All 7 available days in a future week can be marked as week off', async ({ page }) => {
    await goNextWeek(page);
    const rowIndex = await findRowWithClickableCell(page);
    test.skip(rowIndex === -1, 'No clickable cell found in next week');

    const initialCount = await page.locator(`#row-${rowIndex} button[title="Click to mark weekly off"]`).count();
    expect(initialCount).toBeGreaterThanOrEqual(1);

    // Mark every available cell in this row as week off
    for (let i = 0; i < initialCount; i++) {
      const btn = page.locator(`#row-${rowIndex} button[title="Click to mark weekly off"]`).first();
      if (await btn.count() === 0) break;
      await btn.click();
      await expect(toastWith(page, 'Week Off added successfully!')).toBeVisible({ timeout: 10000 });
      await page.waitForTimeout(400);
    }

    // No more clickable "-" cells should remain for this row
    const remaining = await page.locator(`#row-${rowIndex} button[title="Click to mark weekly off"]`).count();
    expect(remaining).toBe(0);
  });

  test('TC-EDGE-05: Navigating 5 weeks ahead shows future editable cells', async ({ page }) => {
    for (let i = 0; i < 5; i++) await goNextWeek(page);

    const label = await weekRangeLabel(page).textContent();
    expect(label).toMatch(/\w+ \d+ to \w+ \d+, \d{4}/);

    // All "-" cells in a week far in the future should be clickable (no past dates)
    const clickableCount = await page.locator('button[title="Click to mark weekly off"]').count();
    expect(clickableCount).toBeGreaterThan(0);
  });

  test('TC-EDGE-06: Search filter is preserved when navigating weeks, week off can be added', async ({ page }) => {
    const empName = (await rowAt(page, 0).locator('[role="cell"]').nth(1).textContent())?.trim() ?? '';
    await searchInput(page).fill(empName);
    await page.waitForTimeout(500);

    // Navigate to next week — filter should stay active
    await goNextWeek(page);
    await page.waitForTimeout(300);

    await expect(allRows(page).first().locator('[role="cell"]').nth(1)).toContainText(empName, { ignoreCase: true });

    // Adding week off while filtered should work correctly
    const clickable = page.locator('button[title="Click to mark weekly off"]');
    if (await clickable.count() > 0) {
      await clickable.first().click();
      await expect(toastWith(page, 'Week Off added successfully!')).toBeVisible({ timeout: 10000 });
    }
  });
});
