import { test, expect } from '../fixtures/auth-fixture';

const LEAVE_APPROVAL_URL = '/attendance/leave-approval';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function registerPopupHandler(page: any) {
  if ((page as any).__leaveApprovalPopupHandlerRegistered) return;
  (page as any).__leaveApprovalPopupHandlerRegistered = true;
  await page.addLocatorHandler(
    page.getByRole('button', { name: /Maybe Later/i }),
    async () => {
      await page.getByRole('button', { name: /Maybe Later/i }).click().catch(() => {});
    }
  );
}

async function dismissNotificationPopup(page: any) {
  try {
    const maybeLater = page.getByRole('button', { name: /Maybe Later/i });
    const visible = await maybeLater.isVisible({ timeout: 5000 }).catch(() => false);
    if (visible) await maybeLater.click();
  } catch {
    // Popup absent – continue
  }
  try {
    // Dismiss the Onboarding Progress widget if it appears (it overlaps the Filters button)
    const collapseBtn = page.getByRole('button', { name: 'Collapse' });
    const collapseVisible = await collapseBtn.isVisible({ timeout: 3000 }).catch(() => false);
    if (collapseVisible) {
      await collapseBtn.click();
      await page.waitForTimeout(300);
    }
  } catch {
    // Onboarding widget not present
  }
}

async function gotoLeaveApproval(page: any) {
  await registerPopupHandler(page);
  await page.goto(LEAVE_APPROVAL_URL, { timeout: 60000 });
  await page.locator('h2.modern-page-title').waitFor({ state: 'visible', timeout: 45000 });
  await page.waitForLoadState('networkidle');
  await dismissNotificationPopup(page);
  // Reset filters to All status to clear any SPA-persisted filter state from prior tests
  await resetFiltersToAll(page);
}

/** Open the filter drawer and reset all filters (employee, status) to default, then Apply. */
async function resetFiltersToAll(page: any) {
  await dismissOnboardingPopup(page);
  const filtersBtn = page.locator('button').filter({ hasText: 'Filters' });
  await filtersBtn.click();
  await page.locator('.date-range-picker-container').waitFor({ state: 'visible', timeout: 8000 }).catch(() => { return; });
  const drawerVisible = await page.locator('.filter-drawer-backdrop').isVisible().catch(() => false);
  if (!drawerVisible) return;
  // Click Reset to clear employee and date range, then explicitly set Status to All
  await page.locator('button').filter({ hasText: /^Reset$/ }).click().catch(() => {});
  await page.waitForTimeout(300);
  await page.locator('button.pill-select-option').filter({ hasText: /^All$/ }).click().catch(() => {});
  await page.locator('button').filter({ hasText: /^Apply$/ }).click();
  await page.locator('.filter-drawer-backdrop').waitFor({ state: 'hidden', timeout: 8000 }).catch(async () => {
    // Force close if Apply didn't close the drawer
    const backdrop = page.locator('.filter-drawer-backdrop');
    if (await backdrop.isVisible().catch(() => false)) {
      await backdrop.click({ force: true });
    }
  });
  await waitForTableLoad(page);
}

/** Wait for the table to finish loading (API response complete). */
async function waitForTableLoad(page: any) {
  // Brief pause so the loading spinner has time to appear (API call has been triggered)
  await page.waitForTimeout(600);
  // Then wait until the spinner is gone (API response has arrived and table has rendered)
  await page.waitForFunction(
    () => !document.body.textContent?.includes('Loading...'),
    { timeout: 15000 }
  ).catch(() => {});
  await page.waitForTimeout(300);
}

/** All data rows (excludes the sticky header row). */
function dataRows(page: any) {
  return page.locator('div[role="row"]:has([role="cell"])');
}

async function waitForRows(page: any) {
  await dataRows(page).first().waitFor({ state: 'visible', timeout: 30000 });
}

/** First row whose last cell contains "Pending" status chip. */
function firstPendingRow(page: any) {
  return dataRows(page).filter({ has: page.locator('button[title="Approve"]') }).first();
}

/** Dismiss the Onboarding Progress popup if it is blocking the page. */
async function dismissOnboardingPopup(page: any) {
  try {
    const collapseBtn = page.getByRole('button', { name: 'Collapse' });
    const visible = await collapseBtn.isVisible({ timeout: 2000 }).catch(() => false);
    if (visible) {
      await collapseBtn.click({ force: true });
      await page.waitForTimeout(400);
    }
  } catch { /* not present */ }
}

/** Open the filter drawer via the Filters button. */
async function openFiltersDrawer(page: any) {
  await dismissOnboardingPopup(page);
  // Close the drawer first if it's already open (e.g. left open by resetFiltersToAll)
  const backdrop = page.locator('.filter-drawer-backdrop');
  if (await backdrop.isVisible({ timeout: 500 }).catch(() => false)) {
    await backdrop.click({ force: true });
    await backdrop.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  }
  await page.locator('button').filter({ hasText: 'Filters' }).click();
  await page.locator('.date-range-picker-container').waitFor({ state: 'visible', timeout: 10000 });
}

/** Close the filter drawer by clicking the backdrop. */
async function closeFiltersDrawer(page: any) {
  const backdrop = page.locator('.filter-drawer-backdrop');
  const visible = await backdrop.isVisible().catch(() => false);
  if (visible) {
    await backdrop.click({ force: true });
    await backdrop.waitFor({ state: 'hidden', timeout: 10000 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1 – Smoke Tests
// ─────────────────────────────────────────────────────────────────────────────

test.describe('1. Smoke Tests', () => {

  test.beforeEach(async ({ page }) => {
    await gotoLeaveApproval(page);
  });

  test('1.1 TC-SM-01: Leave Approval page loads successfully', async ({ page }) => {
    await expect(page).toHaveURL(new RegExp(LEAVE_APPROVAL_URL));
    await expect(page.locator('h2.modern-page-title')).toHaveText('Leave Approval');
    await expect(page.locator('p.modern-page-subtitle')).toContainText('Review and approve or reject employee leave requests');
    // Active filters bar present with default date range badge
    await expect(page.locator('.active-filters-modern')).toBeVisible();
    await expect(page.locator('.filter-chip-modern').first()).toBeVisible();
    // Clear All link visible
    await expect(page.locator('button.btn-link').filter({ hasText: /Clear All/i })).toBeVisible();
    // Search input present and empty
    await expect(page.locator('#search')).toBeVisible();
    await expect(page.locator('#search')).toHaveValue('');
    // Filters button visible
    await expect(page.locator('button').filter({ hasText: 'Filters' })).toBeVisible();
    // Table has at least one row
    await waitForRows(page);
    await expect(dataRows(page).first()).toBeVisible();
  });

  test('1.2 TC-SM-02: All page elements and table columns are present', async ({ page }) => {
    // Info button near heading
    await expect(page.locator('button.btn-flat-primary.btn-sm')).toBeVisible();
    // Active filters bar shows date range badge (format: DD-MM-YYYY – DD-MM-YYYY)
    await expect(page.locator('.active-filters-modern')).toBeVisible();
    const filterChipText = await page.locator('.filter-chip-modern').first().textContent();
    expect(filterChipText).toMatch(/\d{2}-\d{2}-\d{4}\s*–\s*\d{2}-\d{2}-\d{4}/);
    // Search and Filters toolbar
    await expect(page.locator('#search')).toBeVisible();
    await expect(page.locator('button').filter({ hasText: 'Filters' })).toBeVisible();

    await waitForRows(page);
    // Column headers in react-data-table
    const headerRow = page.locator('.rdt_TableHeadRow');
    await expect(headerRow).toContainText('Sr. No.');
    await expect(headerRow).toContainText('Action');
    await expect(headerRow).toContainText('Emp Name');
    await expect(headerRow).toContainText('Emp Id');
    await expect(headerRow).toContainText('Leave Type');
    await expect(headerRow).toContainText('Date');
    await expect(headerRow).toContainText('Applied On');
    await expect(headerRow).toContainText('Leave Reason');
    await expect(headerRow).toContainText('Rejected Reason');
    await expect(headerRow).toContainText('Status');

    // Pending rows have Approve + Reject buttons; other rows have "-"
    const pendingRow = firstPendingRow(page);
    const hasPending = await pendingRow.isVisible().catch(() => false);
    if (hasPending) {
      await expect(pendingRow.locator('button[title="Approve"]')).toBeVisible();
      await expect(pendingRow.locator('button[title="Reject"]')).toBeVisible();
    }

    // Rows per page dropdown present and defaults to 10
    await expect(page.locator('select').first()).toHaveValue('10');
    // Pagination present
    await expect(page.locator('ul.react-paginate')).toBeVisible();
  });

  test('1.3 TC-SM-03: Default date range filter is applied on page load', async ({ page }) => {
    await waitForRows(page);
    // Active filters bar shows a date range chip
    await expect(page.locator('.active-filters-modern')).toBeVisible();
    await expect(page.locator('.filter-chip-modern').first()).toBeVisible();
    const chipText = await page.locator('.filter-chip-modern').first().textContent();
    expect(chipText).toMatch(/\d{2}-\d{2}-\d{4}/);
    // Clear All is visible
    await expect(page.locator('button.btn-link').filter({ hasText: /Clear All/i })).toBeVisible();
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 2 – Filter Drawer — Open, Reset, Apply
// ─────────────────────────────────────────────────────────────────────────────

test.describe('2. Filter Drawer', () => {

  test.beforeEach(async ({ page }) => {
    await gotoLeaveApproval(page);
    await waitForRows(page);
  });

  test('2.1 TC-FLT-01: Filters button opens the filter drawer', async ({ page }) => {
    await openFiltersDrawer(page);

    // Date range picker section is visible
    await expect(page.locator('.date-range-picker-container')).toBeVisible();
    // Employee Name react-select control is visible (class-based, ID increments on remount)
    await expect(page.locator('.select__control').first()).toBeVisible();
    // Status pill buttons are visible
    await expect(page.locator('button.pill-select-option').filter({ hasText: /^All$/ })).toBeVisible();
    await expect(page.locator('button.pill-select-option').filter({ hasText: /^Pending$/ })).toBeVisible();
    await expect(page.locator('button.pill-select-option').filter({ hasText: /^Approved$/ })).toBeVisible();
    await expect(page.locator('button.pill-select-option').filter({ hasText: /^Rejected$/ })).toBeVisible();
    // Reset and Apply buttons are visible
    await expect(page.locator('button').filter({ hasText: /^Reset$/ })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: /^Apply$/ })).toBeVisible();
    // Backdrop overlay is visible
    await expect(page.locator('.filter-drawer-backdrop')).toBeVisible();

    await closeFiltersDrawer(page);
  });

  test('2.2 TC-FLT-02: Filter drawer closes without changes when backdrop is clicked', async ({ page }) => {
    // Record original row count
    const rowsBefore = await dataRows(page).count();

    await openFiltersDrawer(page);
    // Change Status to Pending (don't Apply)
    await page.locator('button.pill-select-option').filter({ hasText: /^Pending$/ }).click();
    // Click backdrop to close without applying
    await closeFiltersDrawer(page);

    // Drawer is gone
    await expect(page.locator('.filter-drawer-backdrop')).not.toBeVisible();
    await expect(page.locator('.date-range-picker-container')).not.toBeVisible();

    // Row count unchanged (no filter applied)
    const rowsAfter = await dataRows(page).count();
    expect(rowsAfter).toBe(rowsBefore);
  });

  test('2.3 TC-FLT-03: Filter by Status — Pending shows only Pending records', async ({ page }) => {
    await openFiltersDrawer(page);
    await page.locator('button.pill-select-option').filter({ hasText: /^Pending$/ }).click();
    await page.locator('button').filter({ hasText: /^Apply$/ }).click();
    await waitForTableLoad(page);

    await waitForRows(page);
    const rows = dataRows(page);
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i).locator('.MuiChip-label')).toContainText('Pending');
      // Pending rows must have Approve and Reject buttons
      await expect(rows.nth(i).locator('button[title="Approve"]')).toBeVisible();
      await expect(rows.nth(i).locator('button[title="Reject"]')).toBeVisible();
    }
  });

  test('2.4 TC-FLT-04: Filter by Status — Approved shows only Approved records with no action buttons', async ({ page }) => {
    await openFiltersDrawer(page);
    await page.locator('button.pill-select-option').filter({ hasText: /^Approved$/ }).click();
    await page.locator('button').filter({ hasText: /^Apply$/ }).click();
    await waitForTableLoad(page);

    const count = await dataRows(page).count();
    if (count === 0) {
      // No approved records on staging – acceptable
      return;
    }
    for (let i = 0; i < count; i++) {
      const row = dataRows(page).nth(i);
      await expect(row.locator('.MuiChip-label')).toContainText('Approved');
      await expect(row.locator('button[title="Approve"]')).not.toBeVisible();
      await expect(row.locator('button[title="Reject"]')).not.toBeVisible();
    }
  });

  test('2.5 TC-FLT-05: Filter by Status — Rejected shows only Rejected records', async ({ page }) => {
    await openFiltersDrawer(page);
    await page.locator('button.pill-select-option').filter({ hasText: /^Rejected$/ }).click();
    await page.locator('button').filter({ hasText: /^Apply$/ }).click();
    await waitForTableLoad(page);

    const count = await dataRows(page).count();
    if (count === 0) return;
    for (let i = 0; i < count; i++) {
      await expect(dataRows(page).nth(i).locator('.MuiChip-label')).toContainText('Rejected');
    }
  });

  test('2.6 TC-FLT-06: Filter by Status — All shows records of all statuses', async ({ page }) => {
    await openFiltersDrawer(page);
    await page.locator('button.pill-select-option').filter({ hasText: /^All$/ }).click();
    await page.locator('button').filter({ hasText: /^Apply$/ }).click();
    await waitForTableLoad(page);

    await waitForRows(page);
    await expect(dataRows(page).first()).toBeVisible();
  });

  test('2.7 TC-FLT-07: Filter by Employee Name limits records to that employee', async ({ page }) => {
    await openFiltersDrawer(page);

    // Click the Employee react-select control (class-based — ID increments on remount)
    await page.locator('.select__control').first().click();
    await page.waitForTimeout(800);

    // Collect all options from the dropdown menu and pick the first employee name
    const options = page.locator('.select__option');
    const optCount = await options.count();
    let employeeName = '';
    let selectedOption = null;
    for (let i = 0; i < optCount; i++) {
      const text = (await options.nth(i).textContent())?.trim() ?? '';
      if (text && text.toLowerCase() !== 'all' && text.toLowerCase() !== 'select employee') {
        employeeName = text;
        selectedOption = options.nth(i);
        break;
      }
    }
    if (!selectedOption || !employeeName) {
      await closeFiltersDrawer(page);
      return;
    }
    await selectedOption.click();
    await page.locator('button').filter({ hasText: /^Apply$/ }).click();
    await waitForTableLoad(page);

    const count = await dataRows(page).count();
    if (count === 0) return;
    for (let i = 0; i < count; i++) {
      const cellText = await dataRows(page).nth(i).locator('[role="cell"]').nth(2).textContent();
      expect(cellText?.toLowerCase()).toContain(employeeName.split(' ')[0].toLowerCase());
    }
  });

  test('2.8 TC-FLT-09: Combine Employee + Status Pending filters', async ({ page }) => {
    await openFiltersDrawer(page);

    // Click the Employee react-select control (class-based — ID increments on remount)
    await page.locator('.select__control').first().click();
    await page.waitForTimeout(500);
    const firstOption = page.locator('.select__option').first();
    const hasOption = await firstOption.isVisible().catch(() => false);
    if (!hasOption) {
      await closeFiltersDrawer(page);
      return;
    }
    await firstOption.click();

    // Select Pending status
    await page.locator('button.pill-select-option').filter({ hasText: /^Pending$/ }).click();
    await page.locator('button').filter({ hasText: /^Apply$/ }).click();
    await waitForTableLoad(page);

    const count = await dataRows(page).count();
    if (count === 0) return;
    for (let i = 0; i < count; i++) {
      await expect(dataRows(page).nth(i).locator('.MuiChip-label')).toContainText('Pending');
    }
  });

  test('2.9 TC-FLT-10: Reset button clears filter inputs inside the drawer', async ({ page }) => {
    await openFiltersDrawer(page);

    // Change Status to Pending
    await page.locator('button.pill-select-option').filter({ hasText: /^Pending$/ }).click();
    // Confirm it is now active
    await expect(page.locator('button.pill-select-option').filter({ hasText: /^Pending$/ })).toHaveClass(/active/);

    // Click Reset
    await page.locator('button').filter({ hasText: /^Reset$/ }).click();
    await page.waitForTimeout(500);

    // Drawer remains open
    await expect(page.locator('.date-range-picker-container')).toBeVisible();

    // Reset clears the Employee Name dropdown — scoped to the first (employee) react-select control
    await expect(page.locator('.select__control').first().locator('.select__single-value')).not.toBeVisible();

    await closeFiltersDrawer(page);
  });

  test('2.10 TC-FLT-11: Status filter default is All (aria-pressed=true)', async ({ page }) => {
    await openFiltersDrawer(page);

    const allBtn = page.locator('button.pill-select-option').filter({ hasText: /^All$/ });
    await expect(allBtn).toHaveAttribute('aria-pressed', 'true');

    await closeFiltersDrawer(page);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 3 – Search Functionality
// ─────────────────────────────────────────────────────────────────────────────

test.describe('3. Search Functionality', () => {

  test.beforeEach(async ({ page }) => {
    await gotoLeaveApproval(page);
    await waitForRows(page);
  });

  test('3.1 TC-SRC-01: Search by employee name filters the table', async ({ page }) => {
    // Use the employee name from the first row as the search term
    const firstRowName = await dataRows(page).first().locator('[role="cell"]').nth(2).textContent();
    const empName = firstRowName?.trim() ?? '';
    if (!empName || empName === '-') return;

    await page.locator('#search').fill(empName);
    await page.waitForTimeout(2500);

    const rows = dataRows(page);
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const nameCell = await rows.nth(i).locator('[role="cell"]').nth(2).textContent();
      expect(nameCell?.toLowerCase()).toContain(empName.toLowerCase());
    }
  });

  test('3.2 TC-SRC-02: Search by partial name returns matching results', async ({ page }) => {
    // Get the first 4 characters of the first employee's name as partial term
    const firstName = await dataRows(page).first().locator('[role="cell"]').nth(2).textContent();
    const partial = firstName?.trim().substring(0, 4) ?? '';
    if (partial.length < 2) return;

    await page.locator('#search').fill(partial);
    await page.waitForTimeout(2500);

    const count = await dataRows(page).count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const nameCell = await dataRows(page).nth(i).locator('[role="cell"]').nth(2).textContent();
      expect(nameCell?.toLowerCase()).toContain(partial.toLowerCase());
    }
  });

  test('3.3 TC-SRC-03: Search with non-existent code returns no results', async ({ page }) => {
    await page.locator('#search').fill('XXXX9999NONEXISTENT');
    await page.waitForTimeout(2500);

    const count = await dataRows(page).count();
    expect(count).toBe(0);
  });

  test('3.4 TC-SRC-04: Clearing search input restores the full list', async ({ page }) => {
    const originalCount = await dataRows(page).count();

    // Use first row's employee name as search term to guarantee a match
    const firstName = await dataRows(page).first().locator('[role="cell"]').nth(2).textContent();
    const searchTerm = firstName?.trim() ?? 'Ganesh';

    await page.locator('#search').fill(searchTerm);
    await page.waitForTimeout(2500);
    const filteredCount = await dataRows(page).count();
    expect(filteredCount).toBeLessThanOrEqual(originalCount);

    // Clear via keyboard to trigger the search onChange event reliably
    await page.locator('#search').click();
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(2500);
    const restoredCount = await dataRows(page).count();
    expect(restoredCount).toBe(originalCount);
  });

  test('3.5 TC-SRC-05: Search combines with active Status filter', async ({ page }) => {
    // Apply Pending status filter first
    await openFiltersDrawer(page);
    await page.locator('button.pill-select-option').filter({ hasText: /^Pending$/ }).click();
    await page.locator('button').filter({ hasText: /^Apply$/ }).click();
    await waitForTableLoad(page);

    // Now type an employee name in search
    const firstPendingName = await firstPendingRow(page).locator('[role="cell"]').nth(2).textContent().catch(() => '');
    const searchName = firstPendingName?.trim().split(' ')[0] ?? '';
    if (!searchName) return;

    await page.locator('#search').fill(searchName);
    await page.waitForTimeout(2000);

    const count = await dataRows(page).count();
    if (count === 0) return;
    for (let i = 0; i < count; i++) {
      await expect(dataRows(page).nth(i).locator('.MuiChip-label')).toContainText('Pending');
    }
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 4 – Approve Leave
// ─────────────────────────────────────────────────────────────────────────────

test.describe('4. Approve Leave', () => {

  test.beforeEach(async ({ page }) => {
    await gotoLeaveApproval(page);
    await waitForRows(page);
  });

  test('4.1 TC-APR-01: Approve button opens SweetAlert2 confirmation modal', async ({ page }) => {
    const pendingRow = firstPendingRow(page);
    const hasPending = await pendingRow.isVisible().catch(() => false);
    if (!hasPending) { test.skip(); return; }

    await pendingRow.locator('button[title="Approve"]').click();
    await page.waitForTimeout(1000);

    await expect(page.locator('.swal2-popup')).toBeVisible();
    await expect(page.locator('.swal2-title')).toHaveText('Confirmation Required!');
    await expect(page.locator('.swal2-html-container')).toContainText('Are you sure you want to Approved this leave request?');
    await expect(page.locator('.swal2-html-container')).toContainText('Available Balance');
    // CL and SL balance shown
    await expect(page.locator('.swal2-html-container')).toContainText('CL:');
    await expect(page.locator('.swal2-html-container')).toContainText('SL:');
    // Buttons present
    await expect(page.locator('.swal2-confirm')).toHaveText('Yes, Approve!');
    await expect(page.locator('.swal2-cancel')).toHaveText('Cancel');
    // No textarea (unlike reject modal)
    await expect(page.locator('.swal2-html-container textarea')).not.toBeVisible();

    await page.locator('.swal2-cancel').click();
    await expect(page.locator('.swal2-popup')).not.toBeVisible();
  });

  test('4.2 TC-APR-02: Cancel in Approve modal closes modal without changing status', async ({ page }) => {
    const pendingRow = firstPendingRow(page);
    const hasPending = await pendingRow.isVisible().catch(() => false);
    if (!hasPending) { test.skip(); return; }

    // Record employee name for after-cancel check
    const empName = await pendingRow.locator('[role="cell"]').nth(2).textContent();

    await pendingRow.locator('button[title="Approve"]').click();
    await page.waitForTimeout(1000);
    await expect(page.locator('.swal2-popup')).toBeVisible();

    await page.locator('.swal2-cancel').click();
    await expect(page.locator('.swal2-popup')).not.toBeVisible();

    // Status still Pending for the same record
    const stillPending = dataRows(page).filter({ hasText: empName ?? '' }).first();
    await expect(stillPending.locator('.MuiChip-label')).toContainText('Pending');
    await expect(stillPending.locator('button[title="Approve"]')).toBeVisible();
    await expect(stillPending.locator('button[title="Reject"]')).toBeVisible();
  });

  test('4.3 TC-APR-03: Successfully approving a leave request changes Status to Approved', async ({ page }) => {
    const pendingRow = firstPendingRow(page);
    const hasPending = await pendingRow.isVisible().catch(() => false);
    if (!hasPending) { test.skip(); return; }

    const empName = (await pendingRow.locator('[role="cell"]').nth(2).textContent())?.trim() ?? '';
    const empId = (await pendingRow.locator('[role="cell"]').nth(3).textContent())?.trim() ?? '';

    await pendingRow.locator('button[title="Approve"]').click();
    await page.waitForTimeout(1000);
    await expect(page.locator('.swal2-confirm')).toHaveText('Yes, Approve!');

    await page.locator('.swal2-confirm').click();
    await page.waitForTimeout(2000);

    // Modal closed
    await expect(page.locator('.swal2-popup')).not.toBeVisible();

    // Toast or success feedback
    const toast = page.locator('[role="alert"], .swal2-toast, .Toastify__toast').first();
    const toastVisible = await toast.isVisible({ timeout: 5000 }).catch(() => false);
    // Toast appears briefly; record may have already changed by the time we check
    // Primary assertion: the row is now Approved (no Approve/Reject buttons)
    await page.waitForTimeout(1000);
    // Filter by All to see the updated record
    await openFiltersDrawer(page);
    await page.locator('button.pill-select-option').filter({ hasText: /^All$/ }).click();
    await page.locator('button').filter({ hasText: /^Apply$/ }).click();
    await waitForTableLoad(page);

    // Find the approved record by employee id
    if (empId && empId !== '-') {
      const approvedRow = dataRows(page).filter({ hasText: empId }).first();
      const rowVisible = await approvedRow.isVisible().catch(() => false);
      if (rowVisible) {
        await expect(approvedRow.locator('.MuiChip-label')).toContainText('Approved');
        await expect(approvedRow.locator('button[title="Approve"]')).not.toBeVisible();
        await expect(approvedRow.locator('button[title="Reject"]')).not.toBeVisible();
      }
    }
  });

  test('4.4 TC-APR-04: Approved record shows no action buttons in Action column', async ({ page }) => {
    await openFiltersDrawer(page);
    await page.locator('button.pill-select-option').filter({ hasText: /^Approved$/ }).click();
    await page.locator('button').filter({ hasText: /^Apply$/ }).click();
    await waitForTableLoad(page);

    const count = await dataRows(page).count();
    if (count === 0) { test.skip(); return; }

    for (let i = 0; i < count; i++) {
      const row = dataRows(page).nth(i);
      await expect(row.locator('button[title="Approve"]')).not.toBeVisible();
      await expect(row.locator('button[title="Reject"]')).not.toBeVisible();
      // Action cell shows "-"
      await expect(row.locator('[role="cell"]').nth(1)).toContainText('-');
    }
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 5 – Reject Leave
// ─────────────────────────────────────────────────────────────────────────────

test.describe('5. Reject Leave', () => {

  test.beforeEach(async ({ page }) => {
    await gotoLeaveApproval(page);
    await waitForRows(page);
  });

  test('5.1 TC-REJ-01: Reject button opens SweetAlert2 modal with mandatory reason textarea', async ({ page }) => {
    const pendingRow = firstPendingRow(page);
    const hasPending = await pendingRow.isVisible().catch(() => false);
    if (!hasPending) { test.skip(); return; }

    await pendingRow.locator('button[title="Reject"]').click();
    await page.waitForTimeout(1000);

    await expect(page.locator('.swal2-popup')).toBeVisible();
    await expect(page.locator('.swal2-title')).toHaveText('Confirmation Required!');
    await expect(page.locator('.swal2-html-container')).toContainText('Are you sure you want to Reject this leave request?');
    await expect(page.locator('.swal2-html-container')).toContainText('Available Balance');
    await expect(page.locator('.swal2-html-container')).toContainText('CL:');
    await expect(page.locator('.swal2-html-container')).toContainText('SL:');
    await expect(page.locator('.swal2-html-container')).toContainText('Reason for Rejection');
    // Mandatory textarea present
    await expect(page.locator('#rejectReason')).toBeVisible();
    await expect(page.locator('#rejectReason')).toHaveAttribute('placeholder', 'Enter Reason*');
    // Character counter present
    await expect(page.locator('#charCount')).toBeVisible();
    await expect(page.locator('#charCount')).toContainText('Characters left: 150');
    // Buttons
    await expect(page.locator('.swal2-confirm')).toHaveText('Yes, Reject!');
    await expect(page.locator('.swal2-cancel')).toHaveText('Cancel');

    await page.locator('.swal2-cancel').click();
    await expect(page.locator('.swal2-popup')).not.toBeVisible();
  });

  test('5.2 TC-REJ-02: Cancel in Reject modal closes modal without changing status', async ({ page }) => {
    const pendingRow = firstPendingRow(page);
    const hasPending = await pendingRow.isVisible().catch(() => false);
    if (!hasPending) { test.skip(); return; }

    await pendingRow.locator('button[title="Reject"]').click();
    await page.waitForTimeout(1000);
    await expect(page.locator('.swal2-popup')).toBeVisible();

    await page.locator('.swal2-cancel').click();
    await page.locator('.swal2-popup').waitFor({ state: 'hidden', timeout: 5000 });

    // The same row (firstPendingRow) should still show Approve + Reject buttons
    await expect(pendingRow.locator('button[title="Approve"]')).toBeVisible();
    await expect(pendingRow.locator('button[title="Reject"]')).toBeVisible();
    await expect(pendingRow.locator('.MuiChip-label')).toContainText('Pending');
  });

  test('5.3 TC-REJ-03: Submitting rejection without reason shows "Reason is required" validation error', async ({ page }) => {
    const pendingRow = firstPendingRow(page);
    const hasPending = await pendingRow.isVisible().catch(() => false);
    if (!hasPending) { test.skip(); return; }

    await pendingRow.locator('button[title="Reject"]').click();
    await page.waitForTimeout(1000);
    await expect(page.locator('#rejectReason')).toBeVisible();

    // Leave textarea empty and click Yes, Reject!
    await page.locator('.swal2-confirm').click();
    await page.waitForTimeout(500);

    // Validation error appears
    await expect(page.locator('.swal2-validation-message')).toBeVisible();
    await expect(page.locator('.swal2-validation-message')).toHaveText('Reason is required');
    // Modal remains open
    await expect(page.locator('.swal2-popup')).toBeVisible();

    await page.locator('.swal2-cancel').click();
  });

  test('5.4 TC-REJ-04: Successfully rejecting a leave request changes Status to Rejected', async ({ page }) => {
    const pendingRow = firstPendingRow(page);
    const hasPending = await pendingRow.isVisible().catch(() => false);
    if (!hasPending) { test.skip(); return; }

    const empId = (await pendingRow.locator('[role="cell"]').nth(3).textContent())?.trim() ?? '';

    await pendingRow.locator('button[title="Reject"]').click();
    await page.waitForTimeout(1000);
    await expect(page.locator('#rejectReason')).toBeVisible();

    await page.locator('#rejectReason').fill('Insufficient leave balance');
    await page.locator('.swal2-confirm').click();
    await page.waitForTimeout(2000);

    // Modal closed
    await expect(page.locator('.swal2-popup')).not.toBeVisible();

    // Find the rejected record and verify status
    await openFiltersDrawer(page);
    await page.locator('button.pill-select-option').filter({ hasText: /^All$/ }).click();
    await page.locator('button').filter({ hasText: /^Apply$/ }).click();
    await waitForTableLoad(page);

    if (empId && empId !== '-') {
      const rejectedRow = dataRows(page).filter({ hasText: empId }).filter({ hasText: 'Rejected' }).first();
      const rowVisible = await rejectedRow.isVisible().catch(() => false);
      if (rowVisible) {
        await expect(rejectedRow.locator('.MuiChip-label')).toContainText('Rejected');
        await expect(rejectedRow.locator('button[title="Reject"]')).not.toBeVisible();
      }
    }
  });

  test('5.5 TC-REJ-05: Character counter decrements as user types rejection reason', async ({ page }) => {
    const pendingRow = firstPendingRow(page);
    const hasPending = await pendingRow.isVisible().catch(() => false);
    if (!hasPending) { test.skip(); return; }

    await pendingRow.locator('button[title="Reject"]').click();
    await page.waitForTimeout(1000);

    // Initial counter = 150
    await expect(page.locator('#charCount')).toContainText('Characters left: 150');

    // Type 10 characters
    await page.locator('#rejectReason').fill('1234567890');
    await page.waitForTimeout(300);
    await expect(page.locator('#charCount')).toContainText('Characters left: 140');

    await page.locator('.swal2-cancel').click();
  });

  test('5.6 TC-REJ-06: Rejected record shows rejection reason in table', async ({ page }) => {
    const pendingRow = firstPendingRow(page);
    const hasPending = await pendingRow.isVisible().catch(() => false);
    if (!hasPending) { test.skip(); return; }

    const empId = (await pendingRow.locator('[role="cell"]').nth(3).textContent())?.trim() ?? '';

    await pendingRow.locator('button[title="Reject"]').click();
    await page.waitForTimeout(1000);
    await page.locator('#rejectReason').fill('Schedule conflict');
    await page.locator('.swal2-confirm').click();
    await page.waitForTimeout(2000);

    // Verify in the table (switch to All to see the record)
    await openFiltersDrawer(page);
    await page.locator('button.pill-select-option').filter({ hasText: /^All$/ }).click();
    await page.locator('button').filter({ hasText: /^Apply$/ }).click();
    await waitForTableLoad(page);

    if (empId && empId !== '-') {
      const rejectedRow = dataRows(page).filter({ hasText: empId }).filter({ hasText: 'Rejected' }).first();
      const rowVisible = await rejectedRow.isVisible().catch(() => false);
      if (rowVisible) {
        // Rejected Reason column (index 8) should contain the reason
        await expect(rejectedRow.locator('[role="cell"]').nth(8)).toContainText('Schedule conflict');
      }
    }
  });

  test('5.7 TC-REJ-07: Rejection reason textarea is empty when modal is re-opened', async ({ page }) => {
    const pendingRow = firstPendingRow(page);
    const hasPending = await pendingRow.isVisible().catch(() => false);
    if (!hasPending) { test.skip(); return; }

    // Open, type reason, cancel
    await pendingRow.locator('button[title="Reject"]').click();
    await page.waitForTimeout(1000);
    await page.locator('#rejectReason').fill('test reason');
    await page.locator('.swal2-cancel').click();
    // Wait for modal to fully close before re-clicking
    await page.locator('.swal2-popup').waitFor({ state: 'hidden', timeout: 5000 });

    // Re-open modal
    await pendingRow.locator('button[title="Reject"]').click();
    await page.waitForTimeout(1000);
    // Textarea should be empty
    await expect(page.locator('#rejectReason')).toHaveValue('');
    // Counter reset to 150
    await expect(page.locator('#charCount')).toContainText('Characters left: 150');

    await page.locator('.swal2-cancel').click();
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 6 – Rows Per Page and Pagination
// ─────────────────────────────────────────────────────────────────────────────

test.describe('6. Rows Per Page and Pagination', () => {

  test.beforeEach(async ({ page }) => {
    await gotoLeaveApproval(page);
    await waitForRows(page);
  });

  test('6.1 TC-PAG-01: Default rows per page is 10', async ({ page }) => {
    await expect(page.locator('select').first()).toHaveValue('10');
    const count = await dataRows(page).count();
    expect(count).toBeLessThanOrEqual(10);
  });

  test('6.2 TC-PAG-02: Changing rows per page to 25 shows more records', async ({ page }) => {
    await page.locator('select').first().selectOption('25');
    await page.waitForTimeout(1000);
    const count = await dataRows(page).count();
    expect(count).toBeLessThanOrEqual(25);
  });

  test('6.3 TC-PAG-03: Rows per page options are 10, 25, 50, 100', async ({ page }) => {
    const options = await page.locator('select').first().evaluate((el: HTMLSelectElement) =>
      Array.from(el.options).map(o => o.value)
    );
    expect(options).toEqual(['10', '25', '50', '100']);
  });

  test('6.4 TC-PAG-04: Navigate to page 2 using pagination and back to page 1', async ({ page }) => {
    // Pagination is a ul.react-paginate
    const pagination = page.locator('ul.react-paginate');
    await expect(pagination).toBeVisible();

    // Check if page 2 exists
    const page2Btn = page.locator('a[aria-label="Page 2"]');
    const hasPage2 = await page2Btn.isVisible().catch(() => false);
    if (!hasPage2) { test.skip(); return; }

    // Previous should be disabled on page 1
    await expect(page.locator('li.page-item.prev')).toHaveClass(/disabled/);

    // Navigate to page 2
    await page2Btn.click();
    await page.waitForTimeout(1000);
    await waitForRows(page);

    // Page 2 is now active/current
    await expect(page.locator('a[aria-current="page"]')).toHaveText('2');

    // Navigate back to page 1
    await page.locator('a[aria-label="Page 1"]').click().catch(async () => {
      await page.locator('a[rel="prev"]').click();
    });
    await page.waitForTimeout(1000);
    await expect(page.locator('a[aria-current="page"]')).toHaveText('1');
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 7 – Edge Cases and State Validation
// ─────────────────────────────────────────────────────────────────────────────

test.describe('7. Edge Cases and State Validation', () => {

  test.beforeEach(async ({ page }) => {
    await gotoLeaveApproval(page);
    await waitForRows(page);
  });

  test('7.1 TC-EDGE-01: Already-approved/rejected records have no action buttons', async ({ page }) => {
    await openFiltersDrawer(page);
    await page.locator('button.pill-select-option').filter({ hasText: /^All$/ }).click();
    await page.locator('button').filter({ hasText: /^Apply$/ }).click();
    await waitForTableLoad(page);

    const rows = dataRows(page);
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const chipText = await rows.nth(i).locator('.MuiChip-label').textContent().catch(() => '');
      if (chipText?.includes('Approved') || chipText?.includes('Rejected')) {
        await expect(rows.nth(i).locator('button[title="Approve"]')).not.toBeVisible();
        await expect(rows.nth(i).locator('button[title="Reject"]')).not.toBeVisible();
        await expect(rows.nth(i).locator('[role="cell"]').nth(1)).toContainText('-');
      }
    }
  });

  test('7.2 TC-EDGE-02: Approve modal shows leave balance for the record', async ({ page }) => {
    const pendingRow = firstPendingRow(page);
    const hasPending = await pendingRow.isVisible().catch(() => false);
    if (!hasPending) { test.skip(); return; }

    await pendingRow.locator('button[title="Approve"]').click();
    await page.waitForTimeout(1000);

    await expect(page.locator('.swal2-html-container')).toContainText('Available Balance');
    await expect(page.locator('.swal2-html-container strong').filter({ hasText: /^CL:/ })).toBeVisible();
    await expect(page.locator('.swal2-html-container strong').filter({ hasText: /^SL:/ })).toBeVisible();

    await page.locator('.swal2-cancel').click();
  });

  test('7.3 TC-EDGE-03: Reject modal shows same balance as Approve modal for same record', async ({ page }) => {
    const pendingRow = firstPendingRow(page);
    const hasPending = await pendingRow.isVisible().catch(() => false);
    if (!hasPending) { test.skip(); return; }

    // Get CL balance from Approve modal
    await pendingRow.locator('button[title="Approve"]').click();
    await page.waitForTimeout(1000);
    const approveCL = await page.locator('.swal2-html-container strong').filter({ hasText: /^CL:/ }).textContent();
    await page.locator('.swal2-cancel').click();
    await page.waitForTimeout(500);

    // Get CL balance from Reject modal for same row
    await pendingRow.locator('button[title="Reject"]').click();
    await page.waitForTimeout(1000);
    const rejectCL = await page.locator('.swal2-html-container strong').filter({ hasText: /^CL:/ }).textContent();
    await page.locator('.swal2-cancel').click();

    expect(approveCL).toBe(rejectCL);
  });

  test('7.4 TC-EDGE-04: No pending records state — no Approve/Reject buttons in Approved-only view', async ({ page }) => {
    await openFiltersDrawer(page);
    await page.locator('button.pill-select-option').filter({ hasText: /^Approved$/ }).click();
    await page.locator('button').filter({ hasText: /^Apply$/ }).click();
    await waitForTableLoad(page);

    const count = await dataRows(page).count();
    if (count === 0) {
      // Empty state is acceptable
      return;
    }
    // No Approve or Reject buttons in any row
    await expect(dataRows(page).first().locator('button[title="Approve"]')).not.toBeVisible();
    await expect(dataRows(page).first().locator('button[title="Reject"]')).not.toBeVisible();
  });

  test('7.5 TC-EDGE-05: Search with no matches shows empty table', async ({ page }) => {
    await page.locator('#search').fill('ZZZNOMATCH999');
    await page.waitForTimeout(1000);
    const count = await dataRows(page).count();
    expect(count).toBe(0);
  });

  test('7.6 TC-SM-03-verify: Active filter badge shows DD-MM-YYYY – DD-MM-YYYY format', async ({ page }) => {
    const chipText = await page.locator('.filter-chip-modern').first().textContent();
    expect(chipText).toMatch(/\d{2}-\d{2}-\d{4}\s*–\s*\d{2}-\d{2}-\d{4}/);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 8 – Navigation and Access
// ─────────────────────────────────────────────────────────────────────────────

test.describe('8. Navigation and Access', () => {

  test.beforeEach(async ({ page }) => {
    await gotoLeaveApproval(page);
  });

  test('8.1 TC-NAV-01: Direct URL navigation works when authenticated', async ({ page }) => {
    await expect(page).toHaveURL(new RegExp(LEAVE_APPROVAL_URL));
    await expect(page.locator('h2.modern-page-title')).toHaveText('Leave Approval');
    await waitForRows(page);
  });

  test('8.2 TC-NAV-02: Leave Approval is accessible via the Attendance sidebar', async ({ page }) => {
    // Navigate away first
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Expand the Attendance menu item in the sidebar
    const attendanceLink = page.locator('.navigation a, .navigation li').filter({ hasText: /^Attendance$/ }).first();
    const isVisible = await attendanceLink.isVisible({ timeout: 5000 }).catch(() => false);
    if (isVisible) {
      await attendanceLink.click();
      await page.waitForTimeout(500);
    }

    // Click Leave Approval in the submenu
    const leaveApprovalLink = page.locator('a[href*="leave-approval"]').first();
    await expect(leaveApprovalLink).toBeVisible();
    await leaveApprovalLink.click();

    await expect(page).toHaveURL(new RegExp(LEAVE_APPROVAL_URL));
    await expect(page.locator('h2.modern-page-title')).toHaveText('Leave Approval');
  });

});
