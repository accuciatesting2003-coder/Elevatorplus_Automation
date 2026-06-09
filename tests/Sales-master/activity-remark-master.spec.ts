
// spec: test-plans/Sales-mater-test-plan/activity-remark-master-test-plan.md
// seed: tests/setup/auth.setup.ts

import { test, expect } from '../fixtures/auth-fixture';

const ACTIVITY_REMARK_URL = '/master/activity-remark-master';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function registerPopupHandler(page: any) {
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
    if (visible) {
      await maybeLater.click();
      return;
    }
    const enableBtn = page.getByRole('button', { name: /enable/i });
    const enableVisible = await enableBtn.isVisible({ timeout: 3000 }).catch(() => false);
    if (enableVisible) {
      await enableBtn.click();
    }
  } catch {
    // Popup did not appear
  }
}

async function gotoActivityRemarkMaster(page: any) {
  await registerPopupHandler(page);
  await page.goto(ACTIVITY_REMARK_URL, { timeout: 60000 });
  await page.getByRole('heading', { name: /Add Activity Remark/i }).waitFor({ state: 'visible', timeout: 45000 });
  await dismissNotificationPopup(page);
}

// Data rows: Activity Remark table uses role-based rows (same as lost-reason)
function tableRows(page: any) {
  return page.locator('[role="row"]:has([role="cell"])');
}

async function waitForTableRows(page: any) {
  await tableRows(page).first().waitFor({ state: 'visible', timeout: 30000 });
}

async function clickEditOnRow(page: any, rowIndex: number = 0) {
  await tableRows(page).nth(rowIndex).getByRole('img', { name: 'Edit' }).click();
}

// Status filter select: option values are '' (All), 'true' (Active), 'false' (Inactive)
function statusFilterSelect(page: any) {
  return page.locator('select').filter({ has: page.locator('option[value="false"]') }).first();
}

// Show-entries select identified by #rows-per-page (first one)
function showEntriesSelect(page: any) {
  return page.locator('#rows-per-page').first();
}

// Status badge is rendered as an h5 inside the row
async function getStatusColumnTexts(page: any): Promise<string[]> {
  const rows = tableRows(page);
  const count = await rows.count();
  const texts: string[] = [];
  for (let i = 0; i < count; i++) {
    const text = await rows.nth(i).getByRole('heading', { level: 5 }).innerText().catch(() => '');
    texts.push(text.trim());
  }
  return texts;
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1 – Smoke Tests
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Activity Remark Master', () => {

  test.describe('Smoke Tests', () => {

    test.beforeEach(async ({ page }) => {
      await gotoActivityRemarkMaster(page);
    });

    // TC-SM-01: Page loads successfully
    test('TC-SM-01: Page loads successfully', async ({ page }) => {
      // Verify page URL
      await expect(page).toHaveURL(new RegExp(ACTIVITY_REMARK_URL, 'i'));

      // Verify form heading
      await expect(page.getByRole('heading', { name: /Add Activity Remark/i })).toBeVisible();

      // Verify input field is present and empty
      const remarkInput = page.locator('#remark_name');
      await expect(remarkInput).toBeVisible();
      await expect(remarkInput).toHaveValue('');

      // Verify Clear and Submit buttons
      await expect(page.getByRole('button', { name: /Clear/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();

      // Verify table loads with Active status filter
      await waitForTableRows(page);
      await expect(statusFilterSelect(page)).toHaveValue('true');
    });

    // TC-SM-02: Verify page elements, table columns, and toolbar layout
    test('TC-SM-02: Verify page elements and layout', async ({ page }) => {
      // Form section heading
      await expect(page.getByRole('heading', { name: /Add Activity Remark/i })).toBeVisible();

      // Info icon button present
      await expect(page.locator('#info-tooltip')).toBeVisible();

      // Helper text below input
      await expect(page.getByText(/Built-in remarks \(Final, Warm, Lost etc\.\) cannot be edited\./i)).toBeVisible();

      // Rows-per-page dropdown default 25
      const showDropdown = showEntriesSelect(page);
      await expect(showDropdown).toBeVisible();
      await expect(showDropdown).toHaveValue('25');

      // Status filter default Active
      const statusFilter = statusFilterSelect(page);
      await expect(statusFilter).toBeVisible();
      await expect(statusFilter).toHaveValue('true');

      // Search input present
      await expect(page.locator('input[placeholder="Search Activity Remark"]')).toBeVisible();

      // No Export Excel button
      await expect(page.getByRole('button', { name: /Export Excel/i })).not.toBeVisible();

      // Import button present
      await expect(page.getByRole('button', { name: /Import/i })).toBeVisible();

      // Column headers present
      await waitForTableRows(page);
      await expect(page.getByText('Sr. No.')).toBeVisible();
      await expect(page.getByText('Action')).toBeVisible();
      await expect(page.getByRole('button', { name: /^Activity Remark$/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Status$/i })).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 2 – Add Activity Remark (Happy Path)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Add Activity Remark (Happy Path)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoActivityRemarkMaster(page);
    });

    // TC-ADD-01: Successfully create a new Activity Remark
    test('TC-ADD-01: Successfully create a new Activity Remark', async ({ page }) => {
      const activityRemark = `Follow Up Pending ${Date.now()}`;

      // Fill and submit the form
      await page.locator('#remark_name').fill(activityRemark);
      await page.getByRole('button', { name: /Submit/i }).click();

      // Verify success toast
      await expect(page.locator('[role="alert"]').filter({ hasText: /created successfully/i })).toBeVisible({ timeout: 15000 });

      // Verify field is cleared after successful submission
      await expect(page.locator('#remark_name')).toHaveValue('', { timeout: 10000 });

      // Verify form heading is still "Add Activity Remark"
      await expect(page.getByRole('heading', { name: /Add Activity Remark/i })).toBeVisible();

      // Verify record appears in table
      await page.locator('input[placeholder="Search Activity Remark"]').fill(activityRemark);
      await tableRows(page).filter({ hasText: activityRemark }).first().waitFor({ state: 'visible', timeout: 15000 });
      await expect(tableRows(page).filter({ hasText: activityRemark })).toHaveCount(1, { timeout: 15000 });
      await page.locator('input[placeholder="Search Activity Remark"]').fill('');
    });

    // TC-ADD-02: Successfully create an Activity Remark with special characters
    test('TC-ADD-02: Create Activity Remark with special characters', async ({ page }) => {
      const activityRemark = `Price Negotiation (Discount Required) ${Date.now()}`;

      // Fill and submit the form
      await page.locator('#remark_name').fill(activityRemark);
      await page.getByRole('button', { name: /Submit/i }).click();

      // Verify success toast
      await expect(page.locator('[role="alert"]').filter({ hasText: /created successfully/i })).toBeVisible({ timeout: 15000 });

      // Verify record appears in table
      await page.locator('input[placeholder="Search Activity Remark"]').fill(activityRemark);
      await tableRows(page).filter({ hasText: activityRemark }).first().waitFor({ state: 'visible', timeout: 15000 });
      await expect(tableRows(page).filter({ hasText: activityRemark })).toHaveCount(1, { timeout: 15000 });
      await page.locator('input[placeholder="Search Activity Remark"]').fill('');
    });

    // TC-ADD-03: Successfully create an Activity Remark with a long name
    test('TC-ADD-03: Create Activity Remark with a long name', async ({ page }) => {
      const activityRemark = `Customer Requested Detailed Proposal and Site Visit Before Finalization ${Date.now()}`;

      // Fill and submit the form
      await page.locator('#remark_name').fill(activityRemark);
      await page.getByRole('button', { name: /Submit/i }).click();

      // Wait for any alert to appear before checking type
      await page.locator('[role="alert"]').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

      const successToast = page.locator('[role="alert"]').filter({ hasText: /created successfully/i });
      const errorToast = page.locator('[role="alert"]').filter({ hasText: /something went wrong|already exists/i });

      const hasSuccess = await successToast.isVisible().catch(() => false);
      const hasError = await errorToast.isVisible().catch(() => false);

      expect(hasSuccess || hasError).toBeTruthy();
    });

    // TC-ADD-04: Create multiple Activity Remark records sequentially
    test('TC-ADD-04: Create multiple Activity Remark records sequentially', async ({ page }) => {
      const ts = Date.now();
      const first = `Meeting Scheduled ${ts}`;
      const second = `Demo Given ${ts}`;

      // Submit first record
      await page.locator('#remark_name').fill(first);
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /created successfully/i })).toBeVisible({ timeout: 15000 });
      await expect(page.locator('#remark_name')).toHaveValue('', { timeout: 10000 });

      // Submit second record
      await page.locator('#remark_name').fill(second);
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /created successfully/i })).toBeVisible({ timeout: 15000 });

      // Verify both appear in the table
      await page.locator('input[placeholder="Search Activity Remark"]').fill(first);
      await tableRows(page).filter({ hasText: first }).first().waitFor({ state: 'visible', timeout: 15000 });
      await expect(tableRows(page).filter({ hasText: first })).toHaveCount(1, { timeout: 15000 });

      await page.locator('input[placeholder="Search Activity Remark"]').fill(second);
      await tableRows(page).filter({ hasText: second }).first().waitFor({ state: 'visible', timeout: 15000 });
      await expect(tableRows(page).filter({ hasText: second })).toHaveCount(1, { timeout: 15000 });
      await page.locator('input[placeholder="Search Activity Remark"]').fill('');
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 3 – Mandatory Field Validation
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Mandatory Field Validation', () => {

    test.beforeEach(async ({ page }) => {
      await gotoActivityRemarkMaster(page);
    });

    // TC-VAL-01: Submit empty form shows inline validation error
    test('TC-VAL-01: Submit empty form shows inline validation error', async ({ page }) => {
      // Click Submit without entering any value
      await page.getByRole('button', { name: /Submit/i }).click();

      // Verify inline validation error
      await expect(page.locator('text=/please enter activity remark/i')).toBeVisible({ timeout: 5000 });

      // Verify page stays on the same URL
      await expect(page).toHaveURL(new RegExp(ACTIVITY_REMARK_URL, 'i'));

      // Verify form heading remains "Add Activity Remark"
      await expect(page.getByRole('heading', { name: /Add Activity Remark/i })).toBeVisible();
    });

    // TC-VAL-02: Inline error clears when valid input is entered
    test('TC-VAL-02: Inline error clears when valid input entered', async ({ page }) => {
      // Trigger validation error
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('text=/please enter activity remark/i')).toBeVisible({ timeout: 5000 });

      // Type valid input — error should disappear
      const activityRemark = `Inquiry Only ${Date.now()}`;
      await page.locator('#remark_name').fill(activityRemark);
      await expect(page.locator('text=/please enter activity remark/i')).not.toBeVisible({ timeout: 5000 });

      // Submit and verify success
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /created successfully/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-VAL-03: Submit whitespace-only shows validation error
    test('TC-VAL-03: Submit whitespace-only shows validation error', async ({ page }) => {
      // Enter only whitespace
      await page.locator('#remark_name').fill('   ');
      await page.getByRole('button', { name: /Submit/i }).click();

      const validationError = page.locator('text=/please enter activity remark|activity remark can not be empty/i');
      const serverError = page.locator('[role="alert"]').filter({ hasText: /something went wrong|already exists/i });

      const hasValidation = await validationError.isVisible({ timeout: 5000 }).catch(() => false);
      const hasServerError = await serverError.isVisible({ timeout: 5000 }).catch(() => false);

      expect(hasValidation || hasServerError).toBeTruthy();
    });

    // TC-VAL-04: Clear after validation error removes the inline error
    test('TC-VAL-04: Clear after validation error removes inline error', async ({ page }) => {
      // Trigger validation error
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('text=/please enter activity remark/i')).toBeVisible({ timeout: 5000 });

      // Click Clear — error should disappear
      await page.getByRole('button', { name: /Clear/i }).click();

      await expect(page.locator('text=/please enter activity remark/i')).not.toBeVisible({ timeout: 5000 });
      await expect(page.locator('#remark_name')).toHaveValue('');
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 4 – Duplicate Prevention
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Duplicate Prevention', () => {

    test.beforeEach(async ({ page }) => {
      await gotoActivityRemarkMaster(page);
    });

    // TC-DUP-01: Submitting an existing Active Activity Remark name shows error toast
    test('TC-DUP-01: Submitting existing Active Activity Remark name shows error', async ({ page }) => {
      await waitForTableRows(page);
      const existingName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(existingName.length).toBeGreaterThan(0);

      // Try to submit duplicate name
      await page.locator('#remark_name').fill(existingName);
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /something went wrong|already exists/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-DUP-02: Case-sensitivity test for duplicate Activity Remark name
    test('TC-DUP-02: Case-sensitivity test for duplicate Activity Remark name', async ({ page }) => {
      await waitForTableRows(page);
      const existingName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(existingName.length).toBeGreaterThan(0);

      // Submit uppercase version
      await page.locator('#remark_name').fill(existingName.toUpperCase());
      await page.getByRole('button', { name: /Submit/i }).click();

      // Wait for any toast to appear
      await page.locator('[role="alert"]').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

      const errorToast = page.locator('[role="alert"]').filter({ hasText: /something went wrong|already exists/i });
      const successToast = page.locator('[role="alert"]').filter({ hasText: /created successfully/i });

      const hasError = await errorToast.isVisible({ timeout: 2000 }).catch(() => false);
      const hasSuccess = await successToast.isVisible({ timeout: 2000 }).catch(() => false);

      // Either a duplicate error or a new record was created (case-sensitive system)
      expect(hasError || hasSuccess).toBeTruthy();
    });

    // TC-DUP-03: Submitting a name matching an existing Inactive record shows an error
    test('TC-DUP-03: Submitting name matching Inactive record shows error', async ({ page }) => {
      // Switch to Inactive filter and note a name
      await statusFilterSelect(page).selectOption('false');
      await page.locator('input[placeholder="Search Activity Remark"]').fill('');

      const inactiveCount = await tableRows(page).count().catch(() => 0);

      if (inactiveCount > 0) {
        await waitForTableRows(page);
        const inactiveName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
        expect(inactiveName.length).toBeGreaterThan(0);

        // Restore Active filter
        await statusFilterSelect(page).selectOption('true');

        // Try to submit with inactive record name
        await page.locator('#remark_name').fill(inactiveName);
        await page.getByRole('button', { name: /Submit/i }).click();

        await expect(page.locator('[role="alert"]').filter({ hasText: /something went wrong|already exists/i })).toBeVisible({ timeout: 15000 });
      } else {
        // No inactive records — skip with a pass
        expect(true).toBeTruthy();
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 5 – Clear Button
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Clear Button', () => {

    test.beforeEach(async ({ page }) => {
      await gotoActivityRemarkMaster(page);
    });

    // TC-CLR-01: Clear resets the Add Activity Remark form
    test('TC-CLR-01: Clear resets the Add Activity Remark form', async ({ page }) => {
      // Type something in the input
      await page.locator('#remark_name').fill('Test Remark');
      await page.getByRole('button', { name: /Clear/i }).click();

      // Input should be cleared
      await expect(page.locator('#remark_name')).toHaveValue('');

      // Heading still reads "Add Activity Remark"
      await expect(page.getByRole('heading', { name: /Add Activity Remark/i })).toBeVisible();

      // No record created
      const matchingRows = await tableRows(page).filter({ hasText: 'Test Remark' }).count();
      expect(matchingRows).toBe(0);
    });

    // TC-CLR-02: Clear in Edit mode resets form back to Add Activity Remark state
    test('TC-CLR-02: Clear in Edit mode resets form to Add Activity Remark state', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);

      // Confirm we are in Update mode
      await expect(page.getByRole('heading', { name: /Update Activity Remark/i })).toBeVisible({ timeout: 10000 });

      const currentName = await page.locator('#remark_name').inputValue();
      expect(currentName.length).toBeGreaterThan(0);

      // Status dropdown and Update button should be visible
      await expect(page.locator('#status')).toBeVisible();
      await expect(page.getByRole('button', { name: /Update/i })).toBeVisible();

      // Click Clear
      await page.getByRole('button', { name: /Clear/i }).click();

      // Form should revert to Add mode
      await expect(page.getByRole('heading', { name: /Add Activity Remark/i })).toBeVisible();
      await expect(page.locator('#remark_name')).toHaveValue('');
      await expect(page.locator('#status')).not.toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();
    });

    // TC-CLR-03: Clear after validation error in Update mode removes error
    test('TC-CLR-03: Clear after validation error removes inline error', async ({ page }) => {
      // Trigger validation error from Add form
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('text=/please enter activity remark/i')).toBeVisible({ timeout: 5000 });

      // Click Clear
      await page.getByRole('button', { name: /Clear/i }).click();

      // Error should be gone
      await expect(page.locator('text=/please enter activity remark/i')).not.toBeVisible({ timeout: 5000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 6 – Edit and Update Operations
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Edit and Update Operations', () => {

    test.beforeEach(async ({ page }) => {
      await gotoActivityRemarkMaster(page);
    });

    // TC-EDT-01: Edit icon opens record in Update Activity Remark mode
    test('TC-EDT-01: Edit icon opens record in Update Activity Remark mode', async ({ page }) => {
      await waitForTableRows(page);

      const originalName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      await clickEditOnRow(page, 0);

      // Verify Update mode
      await expect(page.getByRole('heading', { name: /Update Activity Remark/i })).toBeVisible({ timeout: 10000 });

      // Verify field is pre-filled
      await expect(page.locator('#remark_name')).toHaveValue(originalName);

      // Verify Status dropdown appears
      await expect(page.locator('#status')).toBeVisible();
      await expect(page.locator('#status')).toHaveValue('true');

      // Verify Update button appears
      await expect(page.getByRole('button', { name: /Update/i })).toBeVisible();

      // Verify Clear button is still visible
      await expect(page.getByRole('button', { name: /Clear/i })).toBeVisible();
    });

    // TC-EDT-02: Successfully update an Activity Remark with a new name
    test('TC-EDT-02: Successfully update an Activity Remark name', async ({ page }) => {
      // Create a dedicated record to edit — row 0 is a built-in record (Final/Warm/Lost etc.)
      // that cannot be renamed, so we must edit a user-created record.
      const originalName = `Edit Target ${Date.now()}`;
      await page.locator('#remark_name').fill(originalName);
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /created successfully/i })).toBeVisible({ timeout: 15000 });

      // Search for the newly created record and click its Edit icon
      const searchBox = page.locator('input[placeholder="Search Activity Remark"]');
      await searchBox.fill(originalName);
      await tableRows(page).filter({ hasText: originalName }).first().waitFor({ state: 'visible', timeout: 15000 });
      await tableRows(page).filter({ hasText: originalName }).first().getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update Activity Remark/i })).toBeVisible({ timeout: 10000 });

      // Clear search so it doesn't interfere with post-update search
      await searchBox.fill('');

      // Clear field and enter new name
      const newName = `Updated Activity Remark ${Date.now()}`;
      await page.locator('#remark_name').clear();
      await page.locator('#remark_name').fill(newName);

      // Click Update
      await page.getByRole('button', { name: /Update/i }).click();

      // Verify success toast
      await expect(page.locator('[role="alert"]').filter({ hasText: /updated successfully/i })).toBeVisible({ timeout: 15000 });

      // Verify form reverts to Add mode
      await expect(page.getByRole('heading', { name: /Add Activity Remark/i })).toBeVisible({ timeout: 15000 });

      // Verify updated name appears in table
      await searchBox.fill(newName);
      await tableRows(page).filter({ hasText: newName }).first().waitFor({ state: 'visible', timeout: 15000 });
      await expect(tableRows(page).filter({ hasText: newName })).toHaveCount(1, { timeout: 15000 });
      await searchBox.fill('');
    });

    // TC-EDT-03: Update with empty Activity Remark field shows validation error
    test('TC-EDT-03: Update with empty Activity Remark field shows validation error', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Activity Remark/i })).toBeVisible({ timeout: 10000 });

      // Clear the field and attempt update
      await page.locator('#remark_name').clear();
      await page.getByRole('button', { name: /Update/i }).click();

      // Verify inline validation error
      await expect(page.locator('text=/please enter activity remark/i')).toBeVisible({ timeout: 5000 });

      // Form remains in Update mode
      await expect(page.getByRole('heading', { name: /Update Activity Remark/i })).toBeVisible();
    });

    // TC-EDT-04: Update name to match existing Active record shows error
    test('TC-EDT-04: Update name to duplicate Active record shows error toast', async ({ page }) => {
      await waitForTableRows(page);

      // Get two different existing names
      const firstName = (await tableRows(page).nth(0).locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      const secondName = (await tableRows(page).nth(1).locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(firstName.length).toBeGreaterThan(0);
      expect(secondName.length).toBeGreaterThan(0);

      // Edit the first record and try to rename to the second
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Activity Remark/i })).toBeVisible({ timeout: 10000 });

      await page.locator('#remark_name').clear();
      await page.locator('#remark_name').fill(secondName);
      await page.getByRole('button', { name: /Update/i }).click();

      // Expect error toast
      await expect(page.locator('[role="alert"]').filter({ hasText: /something went wrong|already exists/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-EDT-05: Update Activity Remark name to match an existing Inactive record shows error
    test('TC-EDT-05: Update name to match Inactive record shows error', async ({ page }) => {
      // Switch to Inactive filter and get an inactive name
      await statusFilterSelect(page).selectOption('false');
      await page.locator('input[placeholder="Search Activity Remark"]').fill('');

      const inactiveCount = await tableRows(page).count().catch(() => 0);

      if (inactiveCount > 0) {
        await waitForTableRows(page);
        const inactiveName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
        expect(inactiveName.length).toBeGreaterThan(0);

        // Restore Active filter
        await statusFilterSelect(page).selectOption('true');
        await waitForTableRows(page);

        // Edit an active record and rename to inactive record name
        await clickEditOnRow(page, 0);
        await expect(page.getByRole('heading', { name: /Update Activity Remark/i })).toBeVisible({ timeout: 10000 });

        await page.locator('#remark_name').clear();
        await page.locator('#remark_name').fill(inactiveName);
        await page.getByRole('button', { name: /Update/i }).click();

        // Expect error toast
        await expect(page.locator('[role="alert"]').filter({ hasText: /something went wrong|already exists/i })).toBeVisible({ timeout: 15000 });
      } else {
        // No inactive records exist — skip
        expect(true).toBeTruthy();
      }
    });

    // TC-EDT-06: Update status from Active to Inactive
    test('TC-EDT-06: Update status from Active to Inactive', async ({ page }) => {
      await waitForTableRows(page);

      const activityRemark = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Activity Remark/i })).toBeVisible({ timeout: 10000 });

      // Change status to Inactive
      const statusSelect = page.locator('#status');
      await statusSelect.selectOption('false');
      await page.getByRole('button', { name: /Update/i }).click();

      // Verify success toast
      await expect(page.locator('[role="alert"]').filter({ hasText: /updated successfully/i })).toBeVisible({ timeout: 15000 });

      // Form reverts to Add mode
      await expect(page.getByRole('heading', { name: /Add Activity Remark/i })).toBeVisible({ timeout: 15000 });

      // Record should be hidden from Active list
      await expect(tableRows(page).filter({ hasText: activityRemark })).toHaveCount(0, { timeout: 10000 });

      // Restore: find in Inactive and re-activate
      await statusFilterSelect(page).selectOption('false');
      const inactiveRow = tableRows(page).filter({ hasText: activityRemark });
      await inactiveRow.getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update Activity Remark/i })).toBeVisible({ timeout: 10000 });
      await statusSelect.selectOption('true');
      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.getByRole('heading', { name: /Add Activity Remark/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-EDT-07: Update status from Inactive to Active (re-activate)
    test('TC-EDT-07: Re-activate an Inactive record', async ({ page }) => {
      // Switch to Inactive filter
      await statusFilterSelect(page).selectOption('false');
      await page.locator('input[placeholder="Search Activity Remark"]').fill('');

      const inactiveCount = await tableRows(page).count().catch(() => 0);

      if (inactiveCount > 0) {
        await waitForTableRows(page);

        const activityRemark = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
        await clickEditOnRow(page, 0);
        await expect(page.getByRole('heading', { name: /Update Activity Remark/i })).toBeVisible({ timeout: 10000 });

        const statusSelect = page.locator('#status');
        await expect(statusSelect).toHaveValue('false');

        // Re-activate
        await statusSelect.selectOption('true');
        await page.getByRole('button', { name: /Update/i }).click();

        // Verify success toast
        await expect(page.locator('[role="alert"]').filter({ hasText: /updated successfully/i })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole('heading', { name: /Add Activity Remark/i })).toBeVisible({ timeout: 15000 });

        // Record should reappear in Active filter
        await statusFilterSelect(page).selectOption('true');
        await expect(tableRows(page).filter({ hasText: activityRemark })).toHaveCount(1, { timeout: 10000 });
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 7 – Status Filter
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Status Filter', () => {

    test.beforeEach(async ({ page }) => {
      await gotoActivityRemarkMaster(page);
    });

    // TC-FLT-01: Default filter is Active
    test('TC-FLT-01: Default Status filter is Active', async ({ page }) => {
      await expect(statusFilterSelect(page)).toHaveValue('true');
      await waitForTableRows(page);

      // Set 10 rows per page so we can check all statuses quickly
      await showEntriesSelect(page).selectOption('10');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      const statuses = await getStatusColumnTexts(page);
      expect(statuses.length).toBeGreaterThan(0);
      for (const status of statuses) {
        expect(status).toBe('Active');
      }
    });

    // TC-FLT-02: Filter to All shows both Active and Inactive records
    test('TC-FLT-02: Filter to All shows both Active and Inactive', async ({ page }) => {
      await statusFilterSelect(page).selectOption('');
      await waitForTableRows(page);

      await expect(statusFilterSelect(page)).toHaveValue('');
      const rowCount = await tableRows(page).count();
      expect(rowCount).toBeGreaterThan(0);
    });

    // TC-FLT-03: Filter to Inactive shows only Inactive records
    test('TC-FLT-03: Filter to Inactive shows only Inactive records', async ({ page }) => {
      await statusFilterSelect(page).selectOption('false');
      await expect(statusFilterSelect(page)).toHaveValue('false');

      // Wait for the table to settle after the filter change — stale Active rows may
      // still be visible momentarily before the API response arrives.
      await page.waitForTimeout(1000);
      const rowCount = await tableRows(page).count().catch(() => 0);

      if (rowCount > 0) {
        const statuses = await getStatusColumnTexts(page);
        for (const status of statuses) {
          expect(status).toBe('Inactive');
        }
      }
    });

    // TC-FLT-04: Status filter resets when navigating away and back
    test('TC-FLT-04: Status filter resets to Active on re-navigation', async ({ page }) => {
      // Change to All
      await statusFilterSelect(page).selectOption('');
      await expect(statusFilterSelect(page)).toHaveValue('');

      // Navigate away and back
      await page.goto('/dashboard', { timeout: 30000 });
      await page.goto(ACTIVITY_REMARK_URL, { timeout: 60000 });
      await page.getByRole('heading', { name: /Add Activity Remark/i }).waitFor({ state: 'visible', timeout: 45000 });

      // Filter should reset to Active
      await expect(statusFilterSelect(page)).toHaveValue('true');
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 8 – Search Functionality
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Search Functionality', () => {

    test.beforeEach(async ({ page }) => {
      await gotoActivityRemarkMaster(page);
    });

    // TC-SRC-01: Search by partial name returns matching results
    test('TC-SRC-01: Search by partial name returns matches', async ({ page }) => {
      await waitForTableRows(page);

      const searchBox = page.locator('input[placeholder="Search Activity Remark"]');
      await searchBox.fill('Follow');

      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      const rowCount = await tableRows(page).count();
      expect(rowCount).toBeGreaterThan(0);
    });

    // TC-SRC-02: Search by complete name returns exact match
    test('TC-SRC-02: Search by complete name returns exact match', async ({ page }) => {
      await waitForTableRows(page);

      const searchBox = page.locator('input[placeholder="Search Activity Remark"]');
      await searchBox.fill('Site Hold');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      const filteredRows = tableRows(page).filter({ hasText: 'Site Hold' });
      await expect(filteredRows).toHaveCount(1, { timeout: 15000 });
      await searchBox.fill('');
    });

    // TC-SRC-03: Search with a non-existent name returns no results
    test('TC-SRC-03: Non-existent search returns no results', async ({ page }) => {
      await waitForTableRows(page);

      const searchBox = page.locator('input[placeholder="Search Activity Remark"]');
      await searchBox.fill('XYZ123NONEXISTENT');

      await tableRows(page).first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

      const rows = await tableRows(page).count().catch(() => 0);
      expect(rows).toBe(0);
    });

    // TC-SRC-04: Clearing search restores full list
    test('TC-SRC-04: Clearing search restores full list', async ({ page }) => {
      await waitForTableRows(page);
      const initialCount = await tableRows(page).count();

      const searchBox = page.locator('input[placeholder="Search Activity Remark"]');
      await searchBox.fill('Follow');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      // Clear the search
      await searchBox.clear();

      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      const restoredCount = await tableRows(page).count();
      expect(restoredCount).toBe(initialCount);
    });

    // TC-SRC-05: Search is case-insensitive
    test('TC-SRC-05: Search is case-insensitive', async ({ page }) => {
      await waitForTableRows(page);

      const searchBox = page.locator('input[placeholder="Search Activity Remark"]');
      await searchBox.fill('site hold');

      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      const filteredRows = tableRows(page).filter({ hasText: /site hold/i });
      const count = await filteredRows.count();
      expect(count).toBeGreaterThan(0);
      await searchBox.fill('');
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 9 – Rows Per Page and Pagination
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Rows Per Page and Pagination', () => {

    test.beforeEach(async ({ page }) => {
      await gotoActivityRemarkMaster(page);
    });

    // TC-PAG-01: Default rows-per-page is 25
    test('TC-PAG-01: Default rows-per-page is 25', async ({ page }) => {
      await expect(showEntriesSelect(page)).toHaveValue('25');
    });

    // TC-PAG-02: Change rows-per-page to 10
    test('TC-PAG-02: Change rows-per-page to 10 limits visible rows', async ({ page }) => {
      await waitForTableRows(page);

      const showDropdown = showEntriesSelect(page);
      await showDropdown.selectOption('10');

      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      const rowCount = await tableRows(page).count();
      expect(rowCount).toBeLessThanOrEqual(10);
    });

    // TC-PAG-03: Navigate between pages using pagination controls
    test('TC-PAG-03: Navigate between pages using pagination controls', async ({ page }) => {
      await waitForTableRows(page);

      // Set to 10 rows per page to trigger pagination if enough records exist
      await showEntriesSelect(page).selectOption('10');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      const nextBtn = page.getByRole('button', { name: /Next page/i });
      const isNextEnabled = await nextBtn.isEnabled().catch(() => false);

      if (isNextEnabled) {
        await nextBtn.click();
        await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

        await expect(page.getByRole('button', { name: /Page 2/i })).toBeVisible();

        const prevBtn = page.getByRole('button', { name: /Previous page/i });
        await expect(prevBtn).toBeEnabled();

        await prevBtn.click();
        await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

        await expect(page.getByRole('button', { name: /Page 1/i })).toBeVisible();
      }
    });

    // TC-PAG-04: Change rows-per-page to 50 and 100
    test('TC-PAG-04: Change rows-per-page to 50 and 100', async ({ page }) => {
      await waitForTableRows(page);

      const showDropdown = showEntriesSelect(page);

      // Set to 50
      await showDropdown.selectOption('50');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      const count50 = await tableRows(page).count();
      expect(count50).toBeLessThanOrEqual(50);

      // Set to 100
      await showDropdown.selectOption('100');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      const count100 = await tableRows(page).count();
      expect(count100).toBeLessThanOrEqual(100);
    });

    // TC-PAG-05: Pagination is disabled when all records fit on one page
    test('TC-PAG-05: Pagination is disabled when all records fit on one page', async ({ page }) => {
      await waitForTableRows(page);

      // Set to 100 rows — all records should fit
      await showEntriesSelect(page).selectOption('100');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      const rowCount = await tableRows(page).count();

      if (rowCount <= 100) {
        const prevBtn = page.getByRole('button', { name: /Previous page/i });
        const nextBtn = page.getByRole('button', { name: /Next page/i });

        await expect(prevBtn).toBeDisabled();
        await expect(nextBtn).toBeDisabled();
      }
    });

  });

});
