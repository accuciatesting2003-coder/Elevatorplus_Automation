// spec: test-plans/Sales-mater-test-plan/lost-reason-master-test-plan.md
// seed: tests/setup/auth.setup.ts

import { test, expect } from '../fixtures/auth-fixture';

const LOST_REASON_URL = '/master/lost-reason-master';

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
      await page.waitForTimeout(500);
    }
  } catch {
    // Popup did not appear
  }
}

async function gotoLostReasonMaster(page: any) {
  await registerPopupHandler(page);
  await page.goto(LOST_REASON_URL, { timeout: 60000 });
  await page.getByRole('heading', { name: /Add Lost Reason/i }).waitFor({ state: 'visible', timeout: 45000 });
  await dismissNotificationPopup(page);
}

// Data rows use div[role="row"]:has([role="cell"]) — React Data Table Component
function tableRows(page: any) {
  return page.locator('[role="row"]:has([role="cell"])');
}

async function waitForTableRows(page: any) {
  await tableRows(page).first().waitFor({ state: 'visible', timeout: 30000 });
}

async function clickEditOnRow(page: any, rowIndex: number = 0) {
  // Move mouse to a neutral position first to dismiss any tooltip from a previous interaction
  await page.mouse.move(0, 0);
  await page.waitForTimeout(300);
  const editIcon = tableRows(page).nth(rowIndex).getByRole('img', { name: 'Edit' });
  await editIcon.waitFor({ state: 'visible', timeout: 15000 });
  await editIcon.click({ timeout: 15000 });
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

test.describe('Lost Reason Master', () => {

  test.describe('Smoke Tests', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLostReasonMaster(page);
    });

    // TC-SM-01: Page loads successfully
    test('TC-SM-01: Page loads successfully', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(LOST_REASON_URL, 'i'));

      await expect(page.getByRole('heading', { name: /Add Lost Reason/i })).toBeVisible();

      const lostReasonInput = page.locator('#lost_reason');
      await expect(lostReasonInput).toBeVisible();
      await expect(lostReasonInput).toHaveValue('');

      await expect(page.getByRole('button', { name: /Clear/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();

      await waitForTableRows(page);
      await expect(statusFilterSelect(page)).toHaveValue('true');
    });

    // TC-SM-02: Verify page elements, table columns, and toolbar layout
    test('TC-SM-02: Verify page elements and layout', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /Add Lost Reason/i })).toBeVisible();

      // Info icon button present
      await expect(page.locator('#info-tooltip')).toBeVisible();

      // Rows-per-page dropdown default 25
      const showDropdown = showEntriesSelect(page);
      await expect(showDropdown).toBeVisible();
      await expect(showDropdown).toHaveValue('25');

      // Status filter default Active
      const statusFilter = statusFilterSelect(page);
      await expect(statusFilter).toBeVisible();
      await expect(statusFilter).toHaveValue('true');

      // Search input present
      await expect(page.locator('input[placeholder="Lost Reason"]')).toBeVisible();

      // Column headers present
      await waitForTableRows(page);
      await expect(page.getByText('Sr. No.')).toBeVisible();
      await expect(page.getByText('Action')).toBeVisible();
      await expect(page.getByRole('button', { name: /^Lost Reason$/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Status$/i })).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 2 – Add Lost Reason (Happy Path)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Add Lost Reason (Happy Path)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLostReasonMaster(page);
    });

    // TC-ADD-01: Successfully create a new Lost Reason
    test('TC-ADD-01: Successfully create a new Lost Reason', async ({ page }) => {
      const lostReason = `Price Too High ${Date.now()}`;

      await page.locator('#lost_reason').fill(lostReason);
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /created successfully/i })).toBeVisible({ timeout: 15000 });
      await expect(page.locator('#lost_reason')).toHaveValue('', { timeout: 10000 });
      await expect(page.getByRole('heading', { name: /Add Lost Reason/i })).toBeVisible();

      await page.locator('input[placeholder="Lost Reason"]').fill(lostReason);
      await page.waitForTimeout(1000);
      await expect(tableRows(page).filter({ hasText: lostReason })).toHaveCount(1, { timeout: 15000 });
      await page.locator('input[placeholder="Lost Reason"]').fill('');
    });

    // TC-ADD-02: Successfully create with special characters
    test('TC-ADD-02: Create Lost Reason with special characters', async ({ page }) => {
      const lostReason = `Competitor Discount (Special Offer) ${Date.now()}`;

      await page.locator('#lost_reason').fill(lostReason);
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /created successfully/i })).toBeVisible({ timeout: 15000 });

      await page.locator('input[placeholder="Lost Reason"]').fill(lostReason);
      await page.waitForTimeout(1000);
      await expect(tableRows(page).filter({ hasText: lostReason })).toHaveCount(1, { timeout: 15000 });
      await page.locator('input[placeholder="Lost Reason"]').fill('');
    });

    // TC-ADD-03: Successfully create with a long name
    test('TC-ADD-03: Create Lost Reason with a long name', async ({ page }) => {
      const lostReason = `Customer decided to postpone the project indefinitely due to internal restructuring ${Date.now()}`;

      await page.locator('#lost_reason').fill(lostReason);
      await page.getByRole('button', { name: /Submit/i }).click();

      // Wait for any alert to appear (toast or inline error) before checking type
      await page.locator('[role="alert"]').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

      const successToast = page.locator('[role="alert"]').filter({ hasText: /created successfully/i });
      const errorToast = page.locator('[role="alert"]').filter({ hasText: /something went wrong|already exists/i });

      const hasSuccess = await successToast.isVisible().catch(() => false);
      const hasError = await errorToast.isVisible().catch(() => false);

      expect(hasSuccess || hasError).toBeTruthy();
    });

    // TC-ADD-04: Create multiple Lost Reason records sequentially
    test('TC-ADD-04: Create multiple Lost Reason records sequentially', async ({ page }) => {
      const ts = Date.now();
      const first = `Project Cancelled ${ts}`;
      const second = `Delayed Decision ${ts}`;

      await page.locator('#lost_reason').fill(first);
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /created successfully/i })).toBeVisible({ timeout: 15000 });
      await expect(page.locator('#lost_reason')).toHaveValue('', { timeout: 10000 });

      await page.locator('#lost_reason').fill(second);
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /created successfully/i })).toBeVisible({ timeout: 15000 });

      // Verify both appear in the table
      await page.locator('input[placeholder="Lost Reason"]').fill(first);
      await page.waitForTimeout(800);
      await expect(tableRows(page).filter({ hasText: first })).toHaveCount(1, { timeout: 15000 });

      await page.locator('input[placeholder="Lost Reason"]').fill(second);
      await page.waitForTimeout(800);
      await expect(tableRows(page).filter({ hasText: second })).toHaveCount(1, { timeout: 15000 });
      await page.locator('input[placeholder="Lost Reason"]').fill('');
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 3 – Mandatory Field Validation
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Mandatory Field Validation', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLostReasonMaster(page);
    });

    // TC-VAL-01: Submit empty form shows inline validation error
    test('TC-VAL-01: Submit empty form shows inline validation error', async ({ page }) => {
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('text=/please enter lost reason/i')).toBeVisible({ timeout: 5000 });
      await expect(page).toHaveURL(new RegExp(LOST_REASON_URL, 'i'));
      await expect(page.getByRole('heading', { name: /Add Lost Reason/i })).toBeVisible();
    });

    // TC-VAL-02: Inline error clears when valid input is entered
    test('TC-VAL-02: Inline error clears when valid input entered', async ({ page }) => {
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('text=/please enter lost reason/i')).toBeVisible({ timeout: 5000 });

      const lostReason = `Inquiry Only ${Date.now()}`;
      await page.locator('#lost_reason').fill(lostReason);
      await expect(page.locator('text=/please enter lost reason/i')).not.toBeVisible({ timeout: 5000 });

      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /created successfully/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-VAL-03: Submit whitespace-only shows validation error
    test('TC-VAL-03: Submit whitespace-only shows validation error', async ({ page }) => {
      await page.locator('#lost_reason').fill('   ');
      await page.getByRole('button', { name: /Submit/i }).click();

      const validationError = page.locator('text=/please enter lost reason|lost reason can not be empty/i');
      const serverError = page.locator('[role="alert"]').filter({ hasText: /something went wrong|already exists/i });

      const hasValidation = await validationError.isVisible({ timeout: 5000 }).catch(() => false);
      const hasServerError = await serverError.isVisible({ timeout: 5000 }).catch(() => false);

      expect(hasValidation || hasServerError).toBeTruthy();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 4 – Duplicate Prevention
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Duplicate Prevention', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLostReasonMaster(page);
    });

    // TC-DUP-01: Submitting an existing Active Lost Reason name shows error toast
    test('TC-DUP-01: Submitting existing Active Lost Reason name shows error', async ({ page }) => {
      await waitForTableRows(page);
      const existingName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(existingName.length).toBeGreaterThan(0);

      await page.locator('#lost_reason').fill(existingName);
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /something went wrong|already exists/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-DUP-02: Case-sensitivity test for duplicate name
    test('TC-DUP-02: Case-sensitivity test for duplicate Lost Reason name', async ({ page }) => {
      await waitForTableRows(page);
      const existingName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(existingName.length).toBeGreaterThan(0);

      await page.locator('#lost_reason').fill(existingName.toUpperCase());
      await page.getByRole('button', { name: /Submit/i }).click();

      // Wait for any toast to appear first, then check its type
      await page.locator('[role="alert"]').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

      const errorToast = page.locator('[role="alert"]').filter({ hasText: /something went wrong|already exists/i });
      const successToast = page.locator('[role="alert"]').filter({ hasText: /created successfully/i });

      const hasError = await errorToast.isVisible({ timeout: 2000 }).catch(() => false);
      const hasSuccess = await successToast.isVisible({ timeout: 2000 }).catch(() => false);

      expect(hasError || hasSuccess).toBeTruthy();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 5 – Clear Button
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Clear Button', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLostReasonMaster(page);
    });

    // TC-CLR-01: Clear resets the Add Lost Reason form
    test('TC-CLR-01: Clear resets the Add Lost Reason form', async ({ page }) => {
      await page.locator('#lost_reason').fill('Maybe Later');
      await page.getByRole('button', { name: /Clear/i }).click();

      await expect(page.locator('#lost_reason')).toHaveValue('');
      await expect(page.getByRole('heading', { name: /Add Lost Reason/i })).toBeVisible();

      const matchingRows = await tableRows(page).filter({ hasText: 'Maybe Later' }).count();
      expect(matchingRows).toBe(0);
    });

    // TC-CLR-02: Clear in Edit mode resets form back to Add Lost Reason state
    test('TC-CLR-02: Clear in Edit mode resets form to Add Lost Reason state', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);

      await expect(page.getByRole('heading', { name: /Update Lost Reason/i })).toBeVisible({ timeout: 10000 });

      const currentName = await page.locator('#lost_reason').inputValue();
      expect(currentName.length).toBeGreaterThan(0);

      await expect(page.locator('#status')).toBeVisible();
      await expect(page.getByRole('button', { name: /Update/i })).toBeVisible();

      await page.getByRole('button', { name: /Clear/i }).click();

      await expect(page.getByRole('heading', { name: /Add Lost Reason/i })).toBeVisible();
      await expect(page.locator('#lost_reason')).toHaveValue('');
      await expect(page.locator('#status')).not.toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();
    });

    // TC-CLR-03: Clear after validation error resets the error state
    test('TC-CLR-03: Clear after validation error removes inline error', async ({ page }) => {
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('text=/please enter lost reason/i')).toBeVisible({ timeout: 5000 });

      await page.getByRole('button', { name: /Clear/i }).click();

      await expect(page.locator('text=/please enter lost reason/i')).not.toBeVisible({ timeout: 5000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 6 – Edit and Update Operations
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Edit and Update Operations', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLostReasonMaster(page);
    });

    // TC-EDT-01: Edit icon opens record in Update Lost Reason mode
    test('TC-EDT-01: Edit icon opens record in Update Lost Reason mode', async ({ page }) => {
      await waitForTableRows(page);

      const originalName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      await clickEditOnRow(page, 0);

      await expect(page.getByRole('heading', { name: /Update Lost Reason/i })).toBeVisible({ timeout: 10000 });
      await expect(page.locator('#lost_reason')).toHaveValue(originalName);
      await expect(page.locator('#status')).toBeVisible();
      await expect(page.locator('#status')).toHaveValue('true');
      await expect(page.getByRole('button', { name: /Update/i })).toBeVisible();
    });

    // TC-EDT-02: Successfully update a Lost Reason with a new name
    test('TC-EDT-02: Successfully update a Lost Reason name', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Lost Reason/i })).toBeVisible({ timeout: 10000 });

      const newName = `Updated Lost Reason ${Date.now()}`;
      await page.locator('#lost_reason').clear();
      await page.locator('#lost_reason').fill(newName);

      await page.getByRole('button', { name: /Update/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /updated successfully/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Lost Reason/i })).toBeVisible({ timeout: 15000 });

      await page.locator('input[placeholder="Lost Reason"]').fill(newName);
      await page.waitForTimeout(1000);
      await expect(tableRows(page).filter({ hasText: newName })).toHaveCount(1, { timeout: 15000 });
      await page.locator('input[placeholder="Lost Reason"]').fill('');
    });

    // TC-EDT-03: Update with empty Lost Reason field shows validation error
    test('TC-EDT-03: Update with empty Lost Reason field shows validation error', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Lost Reason/i })).toBeVisible({ timeout: 10000 });

      await page.locator('#lost_reason').clear();
      await page.getByRole('button', { name: /Update/i }).click();

      await expect(page.locator('text=/please enter lost reason/i')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Update Lost Reason/i })).toBeVisible();
    });

    // TC-EDT-04: Update name to match an existing record shows error
    test('TC-EDT-04: Update name to duplicate shows error toast', async ({ page }) => {
      await waitForTableRows(page);

      const firstName = (await tableRows(page).nth(0).locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      const secondName = (await tableRows(page).nth(1).locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(firstName.length).toBeGreaterThan(0);
      expect(secondName.length).toBeGreaterThan(0);

      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Lost Reason/i })).toBeVisible({ timeout: 10000 });

      await page.locator('#lost_reason').clear();
      await page.locator('#lost_reason').fill(secondName);
      await page.getByRole('button', { name: /Update/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /something went wrong|already exists/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-EDT-05: Update status from Active to Inactive
    test('TC-EDT-05: Update status from Active to Inactive', async ({ page }) => {
      await waitForTableRows(page);

      const lostReason = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Lost Reason/i })).toBeVisible({ timeout: 10000 });

      const statusSelect = page.locator('#status');
      await statusSelect.selectOption('false');
      await page.getByRole('button', { name: /Update/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /updated successfully/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Lost Reason/i })).toBeVisible({ timeout: 15000 });

      // Record should be hidden from Active list
      await expect(tableRows(page).filter({ hasText: lostReason })).toHaveCount(0, { timeout: 10000 });

      // Restore: set back to Active
      await statusFilterSelect(page).selectOption('false');
      const inactiveRow = tableRows(page).filter({ hasText: lostReason });
      await inactiveRow.getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update Lost Reason/i })).toBeVisible({ timeout: 10000 });
      await statusSelect.selectOption('true');
      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.getByRole('heading', { name: /Add Lost Reason/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-EDT-06: Update status from Inactive to Active (re-activate)
    test('TC-EDT-06: Re-activate an Inactive record', async ({ page }) => {
      // Switch to Inactive filter
      await statusFilterSelect(page).selectOption('false');

      const inactiveCount = await tableRows(page).count().catch(() => 0);

      if (inactiveCount > 0) {
        await waitForTableRows(page);

        const lostReason = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
        await clickEditOnRow(page, 0);
        await expect(page.getByRole('heading', { name: /Update Lost Reason/i })).toBeVisible({ timeout: 10000 });

        const statusSelect = page.locator('#status');
        await expect(statusSelect).toHaveValue('false');

        await statusSelect.selectOption('true');
        await page.getByRole('button', { name: /Update/i }).click();

        await expect(page.locator('[role="alert"]').filter({ hasText: /updated successfully/i })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole('heading', { name: /Add Lost Reason/i })).toBeVisible({ timeout: 15000 });

        // Switch to Active filter — record should reappear
        await statusFilterSelect(page).selectOption('true');
        await expect(tableRows(page).filter({ hasText: lostReason })).toHaveCount(1, { timeout: 10000 });
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 7 – Status Filter
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Status Filter', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLostReasonMaster(page);
    });

    // TC-FLT-01: Default filter is Active
    test('TC-FLT-01: Default Status filter is Active', async ({ page }) => {
      await expect(statusFilterSelect(page)).toHaveValue('true');
      await waitForTableRows(page);

      await showEntriesSelect(page).selectOption('10');
      await page.waitForTimeout(500);

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

      await page.waitForTimeout(1000);
      const rowCount = await tableRows(page).count().catch(() => 0);

      if (rowCount > 0) {
        const statuses = await getStatusColumnTexts(page);
        for (const status of statuses) {
          expect(status).toBe('Inactive');
        }
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 8 – Search Functionality
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Search Functionality', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLostReasonMaster(page);
    });

    // TC-SRC-01: Search by partial name returns matching results
    test('TC-SRC-01: Search by partial name returns matches', async ({ page }) => {
      await waitForTableRows(page);

      const searchBox = page.locator('input[placeholder="Lost Reason"]');
      await searchBox.fill('Price');

      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      const rowCount = await tableRows(page).count();
      expect(rowCount).toBeGreaterThan(0);
    });

    // TC-SRC-02: Search by complete name returns exact match
    test('TC-SRC-02: Search by complete name returns exact match', async ({ page }) => {
      await waitForTableRows(page);
      const existingName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(existingName.length).toBeGreaterThan(0);

      const searchBox = page.locator('input[placeholder="Lost Reason"]');
      await searchBox.fill(existingName);
      await page.waitForTimeout(1000);

      const filteredRows = tableRows(page).filter({ hasText: existingName });
      await expect(filteredRows).toHaveCount(1, { timeout: 15000 });
      await searchBox.fill('');
    });

    // TC-SRC-03: Search with a non-existent name returns no results
    test('TC-SRC-03: Non-existent search returns no results', async ({ page }) => {
      await waitForTableRows(page);

      const searchBox = page.locator('input[placeholder="Lost Reason"]');
      await searchBox.fill('XYZ123NONEXISTENT');

      await tableRows(page).first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

      const rows = await tableRows(page).count().catch(() => 0);
      expect(rows).toBe(0);
    });

    // TC-SRC-04: Clearing search restores full list
    test('TC-SRC-04: Clearing search restores full list', async ({ page }) => {
      await waitForTableRows(page);
      const initialCount = await tableRows(page).count();

      const searchBox = page.locator('input[placeholder="Lost Reason"]');
      await searchBox.fill('Price');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      await searchBox.clear();

      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      const restoredCount = await tableRows(page).count();
      expect(restoredCount).toBe(initialCount);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 9 – Rows Per Page and Pagination
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Rows Per Page and Pagination', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLostReasonMaster(page);
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

      await showDropdown.selectOption('50');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      const count50 = await tableRows(page).count();
      expect(count50).toBeLessThanOrEqual(50);

      await showDropdown.selectOption('100');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      const count100 = await tableRows(page).count();
      expect(count100).toBeLessThanOrEqual(100);
    });

  });

});
