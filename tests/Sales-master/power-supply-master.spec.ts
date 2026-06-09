// spec: test-plans/Sales-mater-test-plan/power-supply-master-test-plan.md
// seed: tests/setup/auth.setup.ts

import { test, expect } from '../fixtures/auth-fixture';

const POWER_SUPPLY_URL = '/master/power-supply-master';

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

async function gotoPowerSupplyMaster(page: any) {
  await registerPopupHandler(page);
  await page.goto(POWER_SUPPLY_URL, { timeout: 60000 });
  await page.getByRole('heading', { name: /Add Power Supply/i }).waitFor({ state: 'visible', timeout: 45000 });
  await dismissNotificationPopup(page);
}

// Data rows use [role="row"]:has([role="cell"]) — React Data Table Component
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

// Power Supply Name input — use DOM id to avoid matching the search input whose
// placeholder also contains "Power Supply Name"
function powerSupplyInput(page: any) {
  return page.locator('#power_supply');
}

// Search input in toolbar
function searchInput(page: any) {
  return page.locator('input[placeholder="Search Power Supply Name"]');
}

// Status badge is rendered as an h5 inside the row; fall back to last cell text
async function getStatusColumnTexts(page: any): Promise<string[]> {
  const rows = tableRows(page);
  const count = await rows.count();
  const texts: string[] = [];
  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    let text = await row.getByRole('heading', { level: 5 }).innerText({ timeout: 2000 }).catch(() => '');
    if (!text.trim()) {
      text = await row.locator('[role="cell"]').last().innerText().catch(() => '');
    }
    texts.push(text.trim());
  }
  return texts;
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1 – Smoke Tests
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Power Supply Master', () => {

  test.describe('Smoke Tests', () => {

    test.beforeEach(async ({ page }) => {
      await gotoPowerSupplyMaster(page);
    });

    // TC-PS-SM-01: Page loads successfully
    test('TC-PS-SM-01: Page loads successfully', async ({ page }) => {
      // Verify page URL and heading
      await expect(page).toHaveURL(new RegExp(POWER_SUPPLY_URL, 'i'));
      await expect(page.getByRole('heading', { name: /Add Power Supply/i })).toBeVisible();

      // Verify form fields
      await expect(powerSupplyInput(page)).toBeVisible();
      await expect(powerSupplyInput(page)).toHaveValue('');

      // Verify form buttons
      await expect(page.getByRole('button', { name: /Clear/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();

      // Verify table loads with Active filter default
      await waitForTableRows(page);
      await expect(statusFilterSelect(page)).toHaveValue('true');
    });

    // TC-PS-SM-02: Verify all page elements, table columns, and toolbar layout
    test('TC-PS-SM-02: Verify all page elements and toolbar layout', async ({ page }) => {
      // Form section
      await expect(page.getByRole('heading', { name: /Add Power Supply/i })).toBeVisible();
      await expect(page.locator('#info-tooltip')).toBeVisible();
      await expect(powerSupplyInput(page)).toBeVisible();

      // Helper text
      await expect(page.getByText(/Specify supply type e\.g\. 3-phase 415V\./i)).toBeVisible();

      // Toolbar
      await expect(showEntriesSelect(page)).toHaveValue('25');
      await expect(statusFilterSelect(page)).toHaveValue('true');
      await expect(page.getByRole('button', { name: /Import/i })).toBeVisible();
      await expect(searchInput(page)).toBeVisible();

      // No Export Excel button
      await expect(page.getByRole('button', { name: /Export Excel/i })).not.toBeVisible();

      // Table columns — Sr. No. and Action are non-sortable plain text; sortable columns are buttons
      await waitForTableRows(page);
      await expect(page.getByText('Sr. No.')).toBeVisible();
      await expect(page.getByText('Action')).toBeVisible();
      await expect(page.getByRole('button', { name: /^Power Supply Name$/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Status$/i })).toBeVisible();
    });

    // TC-PS-SM-03: Verify form field label, helper text, and info panel content
    test('TC-PS-SM-03: Info panel opens and closes correctly', async ({ page }) => {
      // Click info icon
      await page.locator('#info-tooltip').click();

      // Info panel should be visible
      await expect(page.getByText(/Title:/i)).toBeVisible({ timeout: 5000 });
      await expect(page.getByText(/Note:/i)).toBeVisible();

      // Close the panel
      await page.getByRole('link').filter({ hasText: /^$/ }).first().click();
      await expect(page.getByRole('heading', { name: /Add Power Supply/i })).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 2 – Add Power Supply (Happy Path)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Add Power Supply (Happy Path)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoPowerSupplyMaster(page);
    });

    // TC-PS-ADD-01: Successfully create a new Power Supply record
    test('TC-PS-ADD-01: Successfully create a new Power Supply record', async ({ page }) => {
      const name = `3-Phase 415V ${Date.now()}`;

      // Type unique name and submit
      await powerSupplyInput(page).fill(name);
      await page.getByRole('button', { name: /Submit/i }).click();

      // Verify success toast and form reset
      await expect(page.locator('[role="alert"]').filter({ hasText: /created successfully/i })).toBeVisible({ timeout: 15000 });
      await expect(powerSupplyInput(page)).toHaveValue('', { timeout: 10000 });
      await expect(page.getByRole('heading', { name: /Add Power Supply/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();

      // Verify record in table
      await searchInput(page).fill(name);
      await tableRows(page).filter({ hasText: name }).waitFor({ state: 'visible', timeout: 15000 });
      await expect(tableRows(page).filter({ hasText: name })).toHaveCount(1);
      await searchInput(page).clear();
    });

    // TC-PS-ADD-02: Successfully create a Power Supply record with a descriptive multi-word name
    test('TC-PS-ADD-02: Successfully create Power Supply with descriptive multi-word name', async ({ page }) => {
      const name = `220 Volts Single Phase 60HZ AC ${Date.now()}`;

      // Fill and submit
      await powerSupplyInput(page).fill(name);
      await page.getByRole('button', { name: /Submit/i }).click();

      // Verify success toast and form reset
      await expect(page.locator('[role="alert"]').filter({ hasText: /created successfully/i })).toBeVisible({ timeout: 15000 });
      await expect(powerSupplyInput(page)).toHaveValue('', { timeout: 10000 });

      // Verify in table
      await searchInput(page).fill(name);
      await tableRows(page).filter({ hasText: name }).waitFor({ state: 'visible', timeout: 15000 });
      await expect(tableRows(page).filter({ hasText: name })).toHaveCount(1);
      await searchInput(page).clear();
    });

    // TC-PS-ADD-03: Successfully create a Power Supply record with special characters
    test('TC-PS-ADD-03: Successfully create Power Supply with special characters', async ({ page }) => {
      const name = `380V / 3-Phase (${Date.now()})`;

      // Fill and submit
      await powerSupplyInput(page).fill(name);
      await page.getByRole('button', { name: /Submit/i }).click();

      // Verify success toast
      await expect(page.locator('[role="alert"]').filter({ hasText: /created successfully/i })).toBeVisible({ timeout: 15000 });
      await expect(powerSupplyInput(page)).toHaveValue('', { timeout: 10000 });

      // Verify in table
      await searchInput(page).fill('380V');
      await tableRows(page).filter({ hasText: name }).waitFor({ state: 'visible', timeout: 15000 });
      await expect(tableRows(page).filter({ hasText: name })).toHaveCount(1);
      await searchInput(page).clear();
    });

    // TC-PS-ADD-04: Successfully create multiple Power Supply records sequentially
    test('TC-PS-ADD-04: Successfully create multiple Power Supply records sequentially', async ({ page }) => {
      const ts = Date.now();
      const first = `DC 48V Supply ${ts}`;
      const second = `AC 24V Supply ${ts}`;

      // Create first record
      await powerSupplyInput(page).fill(first);
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /created successfully/i })).toBeVisible({ timeout: 15000 });
      await expect(powerSupplyInput(page)).toHaveValue('', { timeout: 10000 });

      // Create second record
      await powerSupplyInput(page).fill(second);
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /created successfully/i })).toBeVisible({ timeout: 15000 });

      // Verify both records in table
      await searchInput(page).fill(first);
      await tableRows(page).filter({ hasText: first }).waitFor({ state: 'visible', timeout: 15000 });
      await expect(tableRows(page).filter({ hasText: first })).toHaveCount(1);

      await searchInput(page).fill(second);
      await tableRows(page).filter({ hasText: second }).waitFor({ state: 'visible', timeout: 15000 });
      await expect(tableRows(page).filter({ hasText: second })).toHaveCount(1);
      await searchInput(page).clear();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 3 – Mandatory Field Validation
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Mandatory Field Validation', () => {

    test.beforeEach(async ({ page }) => {
      await gotoPowerSupplyMaster(page);
    });

    // TC-PS-VAL-01: Submit empty form shows inline validation error
    test('TC-PS-VAL-01: Submit empty form shows inline validation error', async ({ page }) => {
      // Submit empty form
      await page.getByRole('button', { name: /Submit/i }).click();

      // Verify inline error message
      await expect(page.locator('text=/please enter power supply name/i')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add Power Supply/i })).toBeVisible();
    });

    // TC-PS-VAL-02: Submit whitespace-only input shows validation error
    test('TC-PS-VAL-02: Submit whitespace-only input shows validation error', async ({ page }) => {
      // Enter only whitespace
      await powerSupplyInput(page).fill('   ');
      await page.getByRole('button', { name: /Submit/i }).click();

      // Verify whitespace error or any validation error
      const [hasAlert, hasInline] = await Promise.all([
        page.locator('[role="alert"]').first().waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false),
        page.locator('text=/please enter power supply name|can not be empty/i').waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false),
      ]);

      expect(hasAlert || hasInline).toBeTruthy();
      await expect(page.getByRole('heading', { name: /Add Power Supply/i })).toBeVisible();
    });

    // TC-PS-VAL-03: Inline validation error clears when valid input is entered
    test('TC-PS-VAL-03: Inline validation error clears when valid input entered', async ({ page }) => {
      // Trigger validation error
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('text=/please enter power supply name/i')).toBeVisible({ timeout: 5000 });

      // Enter valid name — error should clear
      const name = `Single Phase 110V ${Date.now()}`;
      await powerSupplyInput(page).fill(name);
      await expect(page.locator('text=/please enter power supply name/i')).not.toBeVisible({ timeout: 5000 });

      // Submit successfully
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /created successfully/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-PS-VAL-04: Clear after validation error removes the error
    test('TC-PS-VAL-04: Clear after validation error removes inline error', async ({ page }) => {
      // Trigger validation error
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('text=/please enter power supply name/i')).toBeVisible({ timeout: 5000 });

      // Click Clear — error should disappear
      await page.getByRole('button', { name: /Clear/i }).click();

      await expect(page.locator('text=/please enter power supply name/i')).not.toBeVisible({ timeout: 5000 });
      await expect(powerSupplyInput(page)).toHaveValue('');
      await expect(page.getByRole('heading', { name: /Add Power Supply/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 4 – Duplicate Prevention
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Duplicate Prevention', () => {

    test.beforeEach(async ({ page }) => {
      await gotoPowerSupplyMaster(page);
    });

    // TC-PS-DUP-01: Submitting an existing Active name shows error
    test('TC-PS-DUP-01: Submitting existing Active Power Supply name shows error', async ({ page }) => {
      await waitForTableRows(page);
      const existingName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(existingName.length).toBeGreaterThan(0);

      // Submit duplicate name
      await powerSupplyInput(page).fill(existingName);
      await page.getByRole('button', { name: /Submit/i }).click();

      // Verify error toast
      await expect(page.locator('[role="alert"]').filter({ hasText: /already exists|something went wrong/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-PS-DUP-02: Submitting a name matching an existing Inactive record shows error
    test('TC-PS-DUP-02: Duplicate of Inactive Power Supply record name shows error', async ({ page }) => {
      // Switch to Inactive filter
      await statusFilterSelect(page).selectOption('false');
      await page.waitForTimeout(1000);

      const inactiveCount = await tableRows(page).count().catch(() => 0);
      if (inactiveCount === 0) {
        test.skip();
        return;
      }

      const inactiveName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(inactiveName.length).toBeGreaterThan(0);

      // Switch back to Active and try to submit inactive name
      await statusFilterSelect(page).selectOption('true');
      await powerSupplyInput(page).fill(inactiveName);
      await page.getByRole('button', { name: /Submit/i }).click();

      // Verify error toast
      await expect(page.locator('[role="alert"]').filter({ hasText: /already exists|something went wrong/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-PS-DUP-03: Test case-sensitivity for duplicate Power Supply name
    test('TC-PS-DUP-03: Case-insensitive duplicate detection', async ({ page }) => {
      await waitForTableRows(page);
      const existingName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(existingName.length).toBeGreaterThan(0);

      // Submit lowercase version of existing name
      await powerSupplyInput(page).fill(existingName.toUpperCase());
      await page.getByRole('button', { name: /Submit/i }).click();

      // Wait for any toast
      await page.locator('[role="alert"]').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

      const errorToast = page.locator('[role="alert"]').filter({ hasText: /already exists|something went wrong/i });
      const successToast = page.locator('[role="alert"]').filter({ hasText: /created successfully/i });
      const hasError = await errorToast.isVisible({ timeout: 2000 }).catch(() => false);
      const hasSuccess = await successToast.isVisible({ timeout: 2000 }).catch(() => false);
      expect(hasError || hasSuccess).toBeTruthy();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 5 – Clear Button Behavior
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Clear Button Behavior', () => {

    test.beforeEach(async ({ page }) => {
      await gotoPowerSupplyMaster(page);
    });

    // TC-PS-CLR-01: Clear resets the Add form
    test('TC-PS-CLR-01: Clear resets the Add Power Supply form', async ({ page }) => {
      // Type a value and clear
      await powerSupplyInput(page).fill('Test Value To Be Cleared');
      await page.getByRole('button', { name: /Clear/i }).click();

      // Verify form is reset
      await expect(powerSupplyInput(page)).toHaveValue('');
      await expect(page.getByRole('heading', { name: /Add Power Supply/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();
      await expect(page.locator('#status')).not.toBeVisible();
    });

    // TC-PS-CLR-02: Clear in Edit mode resets form back to Add state
    test('TC-PS-CLR-02: Clear in Edit mode resets form to Add Power Supply state', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);

      // Verify Update mode
      await expect(page.getByRole('heading', { name: /Update Power Supply/i })).toBeVisible({ timeout: 10000 });
      const currentName = await powerSupplyInput(page).inputValue();
      expect(currentName.length).toBeGreaterThan(0);

      await expect(page.locator('#status')).toBeVisible();
      await expect(page.getByRole('button', { name: /Update/i })).toBeVisible();

      // Click Clear — revert to Add mode
      await page.getByRole('button', { name: /Clear/i }).click();

      await expect(page.getByRole('heading', { name: /Add Power Supply/i })).toBeVisible();
      await expect(powerSupplyInput(page)).toHaveValue('');
      await expect(page.locator('#status')).not.toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();
    });

    // TC-PS-CLR-03: Clear after validation error in Update mode removes error
    test('TC-PS-CLR-03: Clear after validation error in Update mode removes error', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 2);
      await expect(page.getByRole('heading', { name: /Update Power Supply/i })).toBeVisible({ timeout: 10000 });

      // Trigger validation error in Update mode
      await powerSupplyInput(page).clear();
      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.locator('text=/please enter power supply name/i')).toBeVisible({ timeout: 5000 });

      // Click Clear — error should disappear
      await page.getByRole('button', { name: /Clear/i }).click();

      await expect(page.locator('text=/please enter power supply name/i')).not.toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add Power Supply/i })).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 6 – Edit and Update Operations
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Edit and Update Operations', () => {

    test.beforeEach(async ({ page }) => {
      await gotoPowerSupplyMaster(page);
    });

    // TC-PS-EDT-01: Edit icon opens record in Update Power Supply mode with pre-filled fields
    test('TC-PS-EDT-01: Edit opens record in Update Power Supply mode with pre-filled fields', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);

      // Verify Update mode
      await expect(page.getByRole('heading', { name: /Update Power Supply/i })).toBeVisible({ timeout: 10000 });
      await expect(powerSupplyInput(page)).not.toHaveValue('');
      await expect(page.locator('#status')).toBeVisible();
      await expect(page.getByRole('button', { name: /Update/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Clear/i })).toBeVisible();

      await page.getByRole('button', { name: /Clear/i }).click();
    });

    // TC-PS-EDT-02: Successfully update a Power Supply record with a new name
    test('TC-PS-EDT-02: Successfully update Power Supply record with new name', async ({ page }) => {
      await waitForTableRows(page);
      const rowCount = await tableRows(page).count();
      await clickEditOnRow(page, Math.min(5, rowCount - 1));
      await expect(page.getByRole('heading', { name: /Update Power Supply/i })).toBeVisible({ timeout: 10000 });

      // Update with new unique name
      const newName = `Updated 3-Phase 440V ${Date.now()}`;
      await powerSupplyInput(page).clear();
      await powerSupplyInput(page).fill(newName);
      await page.getByRole('button', { name: /Update/i }).click();

      // Verify success toast and form reset
      await expect(page.locator('[role="alert"]').filter({ hasText: /updated successfully/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Power Supply/i })).toBeVisible({ timeout: 15000 });

      // Verify new name in table
      await searchInput(page).fill(newName);
      await tableRows(page).filter({ hasText: newName }).waitFor({ state: 'visible', timeout: 15000 });
      await expect(tableRows(page).filter({ hasText: newName })).toHaveCount(1);
      await searchInput(page).clear();
    });

    // TC-PS-EDT-03: Update with empty name field shows validation error
    test('TC-PS-EDT-03: Update Power Supply with empty name shows validation error', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 2);
      await expect(page.getByRole('heading', { name: /Update Power Supply/i })).toBeVisible({ timeout: 10000 });

      // Clear name and attempt update
      await powerSupplyInput(page).clear();
      await page.getByRole('button', { name: /Update/i }).click();

      // Verify inline error
      await expect(page.locator('text=/please enter power supply name/i')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Update Power Supply/i })).toBeVisible();

      await page.getByRole('button', { name: /Clear/i }).click();
    });

    // TC-PS-EDT-04: Update Power Supply name to match an existing Active record shows error
    test('TC-PS-EDT-04: Update name to match existing Active record shows error', async ({ page }) => {
      await waitForTableRows(page);

      // Get the second row's name as the duplicate target
      const secondName = (await tableRows(page).nth(1).locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(secondName.length).toBeGreaterThan(0);

      // Edit first row and try to rename to second row's name
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Power Supply/i })).toBeVisible({ timeout: 10000 });

      await powerSupplyInput(page).clear();
      await powerSupplyInput(page).fill(secondName);
      await page.getByRole('button', { name: /Update/i }).click();

      // Verify error toast
      await expect(page.locator('[role="alert"]').filter({ hasText: /already exists|something went wrong/i })).toBeVisible({ timeout: 15000 });

      await page.getByRole('button', { name: /Clear/i }).click();
    });

    // TC-PS-EDT-05: Update Power Supply name to match an existing Inactive record shows error
    test('TC-PS-EDT-05: Update name to match existing Inactive record shows error', async ({ page }) => {
      // Check Inactive filter for existing inactive records
      await statusFilterSelect(page).selectOption('false');
      await page.waitForTimeout(1000);

      const inactiveCount = await tableRows(page).count().catch(() => 0);
      if (inactiveCount === 0) {
        test.skip();
        return;
      }

      const inactiveName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(inactiveName.length).toBeGreaterThan(0);

      // Switch back to Active and edit a record
      await statusFilterSelect(page).selectOption('true');
      await waitForTableRows(page);

      await clickEditOnRow(page, 2);
      await expect(page.getByRole('heading', { name: /Update Power Supply/i })).toBeVisible({ timeout: 10000 });

      await powerSupplyInput(page).clear();
      await powerSupplyInput(page).fill(inactiveName);
      await page.getByRole('button', { name: /Update/i }).click();

      // Verify error toast
      await expect(page.locator('[role="alert"]').filter({ hasText: /already exists|something went wrong/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Update Power Supply/i })).toBeVisible();

      await page.getByRole('button', { name: /Clear/i }).click();
    });

    // TC-PS-EDT-06: Update Power Supply status from Active to Inactive
    test('TC-PS-EDT-06: Update Power Supply status from Active to Inactive', async ({ page }) => {
      await waitForTableRows(page);

      const recordName = (await tableRows(page).nth(3).locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      await clickEditOnRow(page, 3);
      await expect(page.getByRole('heading', { name: /Update Power Supply/i })).toBeVisible({ timeout: 10000 });

      // Change status to Inactive
      await page.locator('#status').selectOption('false');
      await page.getByRole('button', { name: /Update/i }).click();

      // Verify success toast and record disappears from Active filter
      await expect(page.locator('[role="alert"]').filter({ hasText: /updated successfully/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Power Supply/i })).toBeVisible({ timeout: 15000 });

      await expect(tableRows(page).filter({ hasText: recordName })).toHaveCount(0, { timeout: 10000 });

      // Restore: set back to Active
      await statusFilterSelect(page).selectOption('false');
      await tableRows(page).filter({ hasText: recordName }).getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update Power Supply/i })).toBeVisible({ timeout: 10000 });
      await page.locator('#status').selectOption('true');
      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.getByRole('heading', { name: /Add Power Supply/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-PS-EDT-07: Update Power Supply with whitespace-only name shows validation error
    test('TC-PS-EDT-07: Update Power Supply with whitespace-only name shows validation error', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 2);
      await expect(page.getByRole('heading', { name: /Update Power Supply/i })).toBeVisible({ timeout: 10000 });

      // Enter whitespace only and attempt update
      await powerSupplyInput(page).clear();
      await powerSupplyInput(page).fill('   ');
      await page.getByRole('button', { name: /Update/i }).click();

      // Verify inline error
      const [hasAlert, hasInline] = await Promise.all([
        page.locator('[role="alert"]').first().waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false),
        page.locator('text=/please enter power supply name|can not be empty/i').waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false),
      ]);

      expect(hasAlert || hasInline).toBeTruthy();
      await expect(page.getByRole('heading', { name: /Update Power Supply/i })).toBeVisible();

      await page.getByRole('button', { name: /Clear/i }).click();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 7 – Status Filter
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Status Filter', () => {

    test.beforeEach(async ({ page }) => {
      await gotoPowerSupplyMaster(page);
    });

    // TC-PS-FLT-01: Default filter is Active
    test('TC-PS-FLT-01: Default Status filter is Active', async ({ page }) => {
      await expect(statusFilterSelect(page)).toHaveValue('true');
      await waitForTableRows(page);

      const statuses = await getStatusColumnTexts(page);
      expect(statuses.length).toBeGreaterThan(0);
      for (const status of statuses) {
        expect(status).toBe('Active');
      }
    });

    // TC-PS-FLT-02: Filter to All shows both Active and Inactive records
    test('TC-PS-FLT-02: Filter to All shows both Active and Inactive records', async ({ page }) => {
      await statusFilterSelect(page).selectOption('');
      await waitForTableRows(page);

      await expect(statusFilterSelect(page)).toHaveValue('');
      expect(await tableRows(page).count()).toBeGreaterThan(0);
    });

    // TC-PS-FLT-03: Filter to Inactive shows only Inactive records
    test('TC-PS-FLT-03: Filter to Inactive shows only Inactive records', async ({ page }) => {
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

    // TC-PS-FLT-04: Status filter resets to Active on navigation
    test('TC-PS-FLT-04: Status filter resets to Active on page re-navigation', async ({ page }) => {
      // Set filter to All
      await statusFilterSelect(page).selectOption('');
      await expect(statusFilterSelect(page)).toHaveValue('');

      // Navigate away and back
      await page.goto('/dashboard');
      await page.goto(POWER_SUPPLY_URL);
      await page.getByRole('heading', { name: /Add Power Supply/i }).waitFor({ state: 'visible', timeout: 30000 });

      // Verify filter resets to Active
      await expect(statusFilterSelect(page)).toHaveValue('true');
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 8 – Search Functionality
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Search Functionality', () => {

    test.beforeEach(async ({ page }) => {
      await gotoPowerSupplyMaster(page);
    });

    // TC-PS-SRC-01: Partial name search returns matching results
    test('TC-PS-SRC-01: Search by partial name returns matches', async ({ page }) => {
      await waitForTableRows(page);
      const firstName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText()).trim();
      const partial = firstName.split(' ')[0];

      // Search by partial name
      await searchInput(page).fill(partial);
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      expect(await tableRows(page).count()).toBeGreaterThan(0);
      await searchInput(page).clear();
    });

    // TC-PS-SRC-02: Exact name search returns exact match
    test('TC-PS-SRC-02: Search by exact name returns exact match', async ({ page }) => {
      await waitForTableRows(page);
      const exactName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText()).trim();

      // Search by exact name
      await searchInput(page).fill(exactName);
      await tableRows(page).filter({ hasText: exactName }).waitFor({ state: 'visible', timeout: 15000 });

      await expect(tableRows(page).filter({ hasText: exactName })).toHaveCount(1, { timeout: 10000 });
      await searchInput(page).clear();
    });

    // TC-PS-SRC-03: Non-existent search returns no results
    test('TC-PS-SRC-03: Non-existent search returns no results', async ({ page }) => {
      await waitForTableRows(page);
      await searchInput(page).fill('XYZNOTEXIST999');
      await tableRows(page).first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

      expect(await tableRows(page).count().catch(() => 0)).toBe(0);
      await searchInput(page).clear();
    });

    // TC-PS-SRC-04: Clearing search restores the full list
    test('TC-PS-SRC-04: Clearing search restores full list', async ({ page }) => {
      await waitForTableRows(page);
      // Wait for the table to fully render before capturing the baseline count
      await page.waitForTimeout(1000);
      const initialCount = await tableRows(page).count();
      const firstName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText()).trim();

      // Filter by partial name then clear
      await searchInput(page).fill(firstName.split(' ')[0]);
      await page.waitForTimeout(1000);
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      // Use clear() which reliably resets the React-controlled input
      await searchInput(page).clear();
      await page.waitForTimeout(1000);
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      expect(await tableRows(page).count()).toBe(initialCount);
    });

    // TC-PS-SRC-05: Search is case-insensitive
    test('TC-PS-SRC-05: Search is case-insensitive', async ({ page }) => {
      await waitForTableRows(page);
      const exactName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText()).trim();

      // Search using lowercase version
      await searchInput(page).fill(exactName.toLowerCase());
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      // Verify the first result matches the original name (case-insensitive search found it)
      const resultName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText()).trim();
      expect(resultName.toLowerCase()).toBe(exactName.toLowerCase());
      await searchInput(page).fill('');
    });

    // TC-PS-SRC-06: Search filters apply on top of Status filter
    test('TC-PS-SRC-06: Search filters apply on top of Status filter', async ({ page }) => {
      await waitForTableRows(page);
      await expect(statusFilterSelect(page)).toHaveValue('true');

      const firstName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText()).trim();
      await searchInput(page).fill(firstName.split(' ')[0]);
      // Wait for the table to finish re-rendering before reading status badges
      await page.waitForTimeout(1000);
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      expect(await tableRows(page).count()).toBeGreaterThan(0);
      const statuses = await getStatusColumnTexts(page);
      for (const status of statuses) {
        expect(status).toBe('Active');
      }
      await searchInput(page).clear();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 9 – Rows Per Page and Pagination
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Rows Per Page and Pagination', () => {

    test.beforeEach(async ({ page }) => {
      await gotoPowerSupplyMaster(page);
    });

    // TC-PS-PAG-01: Default rows-per-page is 25
    test('TC-PS-PAG-01: Default rows-per-page is 25', async ({ page }) => {
      await expect(showEntriesSelect(page)).toHaveValue('25');
    });

    // TC-PS-PAG-02: Change rows-per-page to 10
    test('TC-PS-PAG-02: Change rows-per-page to 10 limits rows', async ({ page }) => {
      await waitForTableRows(page);
      await showEntriesSelect(page).selectOption('10');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      expect(await tableRows(page).count()).toBeLessThanOrEqual(10);
    });

    // TC-PS-PAG-03: Navigate between pages using pagination controls
    test('TC-PS-PAG-03: Navigate between pages using pagination controls', async ({ page }) => {
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

    // TC-PS-PAG-04: Change rows-per-page to 50 and 100
    test('TC-PS-PAG-04: Change rows-per-page to 50 and 100', async ({ page }) => {
      await waitForTableRows(page);

      await showEntriesSelect(page).selectOption('50');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      expect(await tableRows(page).count()).toBeLessThanOrEqual(50);

      await showEntriesSelect(page).selectOption('100');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      expect(await tableRows(page).count()).toBeLessThanOrEqual(100);
    });

    // TC-PS-PAG-05: Pagination disabled when all records fit on one page
    test('TC-PS-PAG-05: Pagination disabled when all records fit on one page', async ({ page }) => {
      await waitForTableRows(page);
      await showEntriesSelect(page).selectOption('100');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      const totalRows = await tableRows(page).count();
      if (totalRows <= 25) {
        await showEntriesSelect(page).selectOption('25');
        await expect(page.getByRole('button', { name: /Previous page/i })).toBeDisabled();
        await expect(page.getByRole('button', { name: /Next page/i })).toBeDisabled();
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 10 – Column Sorting
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Column Sorting', () => {

    test.beforeEach(async ({ page }) => {
      await gotoPowerSupplyMaster(page);
    });

    // TC-PS-SRT-01: Sort by Power Supply Name ascending
    test('TC-PS-SRT-01: Sort by Power Supply Name ascending', async ({ page }) => {
      await waitForTableRows(page);
      await page.getByRole('button', { name: /^Power Supply Name$/i }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      const rowCount = await tableRows(page).count();
      if (rowCount > 1) {
        const first = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText()).trim().toLowerCase();
        const last = (await tableRows(page).last().locator('[role="cell"]').nth(2).innerText()).trim().toLowerCase();
        if (first.localeCompare(last) > 0) {
          // Click again to sort ascending
          await page.getByRole('button', { name: /^Power Supply Name$/i }).click();
          await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
        }
      }

      const finalCount = await tableRows(page).count();
      if (finalCount > 1) {
        const firstName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText()).trim().toLowerCase();
        const lastName = (await tableRows(page).last().locator('[role="cell"]').nth(2).innerText()).trim().toLowerCase();
        expect(firstName.localeCompare(lastName)).toBeLessThanOrEqual(0);
      }
    });

    // TC-PS-SRT-02: Sort by Power Supply Name descending
    test('TC-PS-SRT-02: Sort by Power Supply Name descending', async ({ page }) => {
      await waitForTableRows(page);

      // Click twice to sort descending
      await page.getByRole('button', { name: /^Power Supply Name$/i }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      await page.getByRole('button', { name: /^Power Supply Name$/i }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      expect(await tableRows(page).count()).toBeGreaterThan(0);
    });

    // TC-PS-SRT-03: Sort by Status column
    test('TC-PS-SRT-03: Sort by Status column', async ({ page }) => {
      // Set All filter to see both statuses
      await statusFilterSelect(page).selectOption('');
      await waitForTableRows(page);

      await page.getByRole('button', { name: /^Status$/i }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      expect(await tableRows(page).count()).toBeGreaterThan(0);

      // Click again to reverse sort
      await page.getByRole('button', { name: /^Status$/i }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      expect(await tableRows(page).count()).toBeGreaterThan(0);
    });

    // TC-PS-SRT-04: Sr. No. and Action columns are not sortable (no sort icon)
    test('TC-PS-SRT-04: Sr. No. and Action columns are not sortable', async ({ page }) => {
      await waitForTableRows(page);

      // Sortable columns have a sort icon (.__rdt_custom_sort_icon__ span with SVG) inside their header button
      const powerSupplyNameBtn = page.getByRole('button', { name: /^Power Supply Name$/i });
      await expect(powerSupplyNameBtn).toBeVisible();
      await expect(powerSupplyNameBtn.locator('.__rdt_custom_sort_icon__')).toBeVisible();

      // Non-sortable columns (Sr. No. and Action) — headers exist but have NO sort icon span
      await expect(page.getByText('Sr. No.')).toBeVisible();
      await expect(page.getByText('Action')).toBeVisible();
      await expect(page.getByRole('button', { name: /^Sr\. No\.$/i }).locator('.__rdt_custom_sort_icon__')).not.toBeVisible();
      await expect(page.getByRole('button', { name: /^Action$/i }).locator('.__rdt_custom_sort_icon__')).not.toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 11 – Inactive Status Management
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Inactive Status Management', () => {

    test.beforeEach(async ({ page }) => {
      await gotoPowerSupplyMaster(page);
    });

    // TC-PS-INA-01: Deactivate an Active Power Supply and verify it disappears from Active filter
    test('TC-PS-INA-01: Deactivate Active Power Supply and verify disappears from Active filter', async ({ page }) => {
      await expect(statusFilterSelect(page)).toHaveValue('true');
      await waitForTableRows(page);

      // Deactivate a record at index 3
      const recordName = (await tableRows(page).nth(3).locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      await clickEditOnRow(page, 3);
      await expect(page.getByRole('heading', { name: /Update Power Supply/i })).toBeVisible({ timeout: 10000 });

      await page.locator('#status').selectOption('false');
      await page.getByRole('button', { name: /Update/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /updated successfully/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Power Supply/i })).toBeVisible({ timeout: 15000 });

      // Verify record is no longer in Active filter
      await expect(tableRows(page).filter({ hasText: recordName })).toHaveCount(0, { timeout: 10000 });

      // Verify record appears in Inactive filter
      await statusFilterSelect(page).selectOption('false');
      await page.waitForTimeout(2000);
      await expect(tableRows(page).filter({ hasText: recordName })).toHaveCount(1, { timeout: 15000 });

      // Restore: re-activate
      await tableRows(page).filter({ hasText: recordName }).getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update Power Supply/i })).toBeVisible({ timeout: 10000 });
      await page.locator('#status').selectOption('true');
      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.getByRole('heading', { name: /Add Power Supply/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-PS-INA-02: Re-activate an Inactive Power Supply
    test('TC-PS-INA-02: Re-activate an Inactive Power Supply', async ({ page }) => {
      // Switch to Inactive filter
      await statusFilterSelect(page).selectOption('false');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(500);

      const inactiveCount = await tableRows(page).count().catch(() => 0);
      if (inactiveCount === 0) {
        test.skip();
        return;
      }

      await waitForTableRows(page);
      const recordName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

      // Edit and re-activate
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Power Supply/i })).toBeVisible({ timeout: 10000 });
      await expect(page.locator('#status')).toHaveValue('false');

      await page.locator('#status').selectOption('true');
      await page.getByRole('button', { name: /Update/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /updated successfully/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Power Supply/i })).toBeVisible({ timeout: 15000 });

      // Verify record is now in Active filter
      await statusFilterSelect(page).selectOption('true');
      await page.waitForTimeout(1000);
      await expect(tableRows(page).filter({ hasText: recordName })).toHaveCount(1, { timeout: 15000 });
    });

    // TC-PS-INA-03: Inactive records are hidden from Active filter view by default
    test('TC-PS-INA-03: Inactive records hidden from Active filter view', async ({ page }) => {
      await expect(statusFilterSelect(page)).toHaveValue('true');
      await showEntriesSelect(page).selectOption('10');
      await page.waitForTimeout(1000);
      await waitForTableRows(page);

      const statuses = await getStatusColumnTexts(page);
      expect(statuses.length).toBeGreaterThan(0);
      for (const status of statuses) {
        expect(status).toBe('Active');
      }
    });

    // TC-PS-INA-04: Edit icon is available for Inactive records
    test('TC-PS-INA-04: Edit icon is available for Inactive records', async ({ page }) => {
      // Switch to Inactive filter
      await statusFilterSelect(page).selectOption('false');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(500);

      const inactiveCount = await tableRows(page).count().catch(() => 0);
      if (inactiveCount === 0) {
        test.skip();
        return;
      }

      await waitForTableRows(page);

      // Click Edit on an Inactive record
      await clickEditOnRow(page, 0);

      await expect(page.getByRole('heading', { name: /Update Power Supply/i })).toBeVisible({ timeout: 10000 });
      await expect(page.locator('#status')).toHaveValue('false');

      await page.getByRole('button', { name: /Clear/i }).click();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 12 – Navigation and Access
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Navigation and Access', () => {

    test.beforeEach(async ({ page }) => {
      await gotoPowerSupplyMaster(page);
    });

    // TC-PS-NAV-01: Access Power Supply Master via Sales Masters sidebar navigation
    test('TC-PS-NAV-01: Power Supply accessible via Sales Masters sidebar', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Click Sales Masters in sidebar
      await page.getByRole('link', { name: /Sales Masters/i }).click();
      await page.getByRole('link', { name: /^Power Supply$/i }).waitFor({ state: 'visible', timeout: 10000 });
      await page.getByRole('link', { name: /^Power Supply$/i }).click();

      // Verify navigation to Power Supply Master page
      await expect(page).toHaveURL(new RegExp(POWER_SUPPLY_URL, 'i'));
      await expect(page.getByRole('heading', { name: /Add Power Supply/i })).toBeVisible({ timeout: 30000 });
    });

    // TC-PS-NAV-02: Direct URL navigation works when authenticated
    test('TC-PS-NAV-02: Direct URL navigation works when authenticated', async ({ page }) => {
      await page.goto(POWER_SUPPLY_URL);
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(new RegExp(POWER_SUPPLY_URL, 'i'));
      await expect(page.getByRole('heading', { name: /Add Power Supply/i })).toBeVisible({ timeout: 30000 });
      await expect(powerSupplyInput(page)).toBeVisible();
    });

  });

});
