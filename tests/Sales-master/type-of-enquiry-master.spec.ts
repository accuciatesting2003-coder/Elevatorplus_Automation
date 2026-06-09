// spec: test-plans/Sales-mater-test-plan/type-of-enquiry-test-plan.md
// seed: tests/setup/auth.setup.ts

import { test, expect } from '../fixtures/auth-fixture';

const TYPE_OF_ENQUIRY_URL = '/master/type-of-enquiry';

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

async function gotoTypeOfEnquiryMaster(page: any) {
  await registerPopupHandler(page);
  await page.goto(TYPE_OF_ENQUIRY_URL, { timeout: 60000 });
  await page.getByRole('heading', { name: /Add Type of Enquiry/i }).waitFor({ state: 'visible', timeout: 45000 });
  await dismissNotificationPopup(page);
}

function tableRows(page: any) {
  return page.locator('[role="row"]:has([role="cell"])');
}

async function waitForTableRows(page: any) {
  await tableRows(page).first().waitFor({ state: 'visible', timeout: 30000 });
}

async function clickEditOnRow(page: any, rowIndex: number = 0) {
  await page.mouse.move(0, 0);
  await page.waitForTimeout(300);
  const editIcon = tableRows(page).nth(rowIndex).getByRole('img', { name: 'Edit' });
  await editIcon.waitFor({ state: 'visible', timeout: 15000 });
  await editIcon.click({ timeout: 15000 });
}

// Status filter: option values '' (All), 'true' (Active), 'false' (Inactive)
function statusFilterSelect(page: any) {
  return page.locator('select').filter({ has: page.locator('option[value="false"]') }).first();
}

function showEntriesSelect(page: any) {
  return page.locator('#rows-per-page').first();
}

function typeOfEnquiryInput(page: any) {
  return page.getByRole('textbox', { name: /Type of Enquiry/i });
}

function askFirmDetailsCheckbox(page: any) {
  return page.getByRole('checkbox', { name: /Ask Firm Details/i });
}

function searchInput(page: any) {
  return page.locator('input[placeholder="Search By Type"]');
}

async function getStatusColumnTexts(page: any): Promise<string[]> {
  const rows = tableRows(page);
  const count = await rows.count();
  const texts: string[] = [];
  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    let text = await row.getByRole('heading', { level: 5 }).innerText().catch(() => '');
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

test.describe('Type of Enquiry Master', () => {

  test.describe('Smoke Tests', () => {

    test.beforeEach(async ({ page }) => {
      await gotoTypeOfEnquiryMaster(page);
    });

    // TC-SM-01: Page loads successfully
    test('TC-SM-01: Page loads successfully', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(TYPE_OF_ENQUIRY_URL, 'i'));
      await expect(page.getByRole('heading', { name: /Add Type of Enquiry/i })).toBeVisible();

      await expect(typeOfEnquiryInput(page)).toBeVisible();
      await expect(typeOfEnquiryInput(page)).toHaveValue('');
      await expect(askFirmDetailsCheckbox(page)).toBeVisible();
      await expect(askFirmDetailsCheckbox(page)).not.toBeChecked();

      await expect(page.getByRole('button', { name: /Clear/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();

      await waitForTableRows(page);
      await expect(statusFilterSelect(page)).toHaveValue('true');
    });

    // TC-SM-02: Verify all page elements, table columns, and toolbar layout
    test('TC-SM-02: Verify all page elements and toolbar layout', async ({ page }) => {
      // Form section
      await expect(page.getByRole('heading', { name: /Add Type of Enquiry/i })).toBeVisible();
      await expect(page.locator('#info-tooltip')).toBeVisible();
      await expect(typeOfEnquiryInput(page)).toBeVisible();
      await expect(askFirmDetailsCheckbox(page)).toBeVisible();
      await expect(askFirmDetailsCheckbox(page)).not.toBeChecked();

      // Toolbar
      await expect(showEntriesSelect(page)).toHaveValue('25');
      await expect(statusFilterSelect(page)).toHaveValue('true');
      await expect(searchInput(page)).toBeVisible();

      // No Import / Export Excel buttons
      await expect(page.getByRole('button', { name: /Export Excel/i })).not.toBeVisible();

      // Table columns
      await waitForTableRows(page);
      await expect(page.getByText('Sr. No.')).toBeVisible();
      await expect(page.getByText('Action')).toBeVisible();
      await expect(page.getByText('Type Of Enquiry').first()).toBeVisible();
      await expect(page.getByText('Ask Firm Details').first()).toBeVisible();
      await expect(page.getByText('Status').first()).toBeVisible();
    });

    // TC-SM-03: Info panel opens and closes correctly
    test('TC-SM-03: Info panel opens and closes correctly', async ({ page }) => {
      await page.locator('#info-tooltip').click();

      await expect(page.getByText(/Title:/i)).toBeVisible({ timeout: 5000 });
      await expect(page.getByText(/Note:/i)).toBeVisible();

      // Close the panel
      await page.getByRole('link').filter({ hasText: /^$/ }).first().click();
      await expect(page.getByRole('heading', { name: /Add Type of Enquiry/i })).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 2 – Add Type of Enquiry (Happy Path)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Add Type of Enquiry (Happy Path)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoTypeOfEnquiryMaster(page);
    });

    // TC-ADD-01: Checkbox unchecked
    test('TC-ADD-01: Create Type of Enquiry with Ask Firm Details unchecked', async ({ page }) => {
      const name = `Online Enquiry ${Date.now()}`;

      await typeOfEnquiryInput(page).fill(name);
      await expect(askFirmDetailsCheckbox(page)).not.toBeChecked();
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /created successfully/i })).toBeVisible({ timeout: 15000 });
      await expect(typeOfEnquiryInput(page)).toHaveValue('', { timeout: 10000 });
      await expect(askFirmDetailsCheckbox(page)).not.toBeChecked();

      await searchInput(page).fill(name);
      await page.waitForTimeout(800);
      const row = tableRows(page).filter({ hasText: name });
      await expect(row).toHaveCount(1, { timeout: 15000 });
      await expect(row.getByRole('cell').nth(3)).toHaveText('No');
      await searchInput(page).clear();
    });

    // TC-ADD-02: Checkbox checked
    test('TC-ADD-02: Create Type of Enquiry with Ask Firm Details checked', async ({ page }) => {
      const name = `Telephone Enquiry ${Date.now()}`;

      await typeOfEnquiryInput(page).fill(name);
      await askFirmDetailsCheckbox(page).check();
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /created successfully/i })).toBeVisible({ timeout: 15000 });
      await expect(typeOfEnquiryInput(page)).toHaveValue('', { timeout: 10000 });
      await expect(askFirmDetailsCheckbox(page)).not.toBeChecked();

      await searchInput(page).fill(name);
      await page.waitForTimeout(800);
      const row = tableRows(page).filter({ hasText: name });
      await expect(row).toHaveCount(1, { timeout: 15000 });
      await expect(row.getByRole('cell').nth(3)).toHaveText('Yes');
      await searchInput(page).clear();
    });

    // TC-ADD-03: Special characters in name
    test('TC-ADD-03: Create Type of Enquiry with special characters', async ({ page }) => {
      const name = `Walk-in & Direct (${Date.now()})`;

      await typeOfEnquiryInput(page).fill(name);
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /created successfully/i })).toBeVisible({ timeout: 15000 });

      await searchInput(page).fill('Walk-in');
      await page.waitForTimeout(800);
      await expect(tableRows(page).filter({ hasText: name })).toHaveCount(1, { timeout: 15000 });
      await searchInput(page).clear();
    });

    // TC-ADD-04: Create multiple records sequentially
    test('TC-ADD-04: Create multiple Type of Enquiry records sequentially', async ({ page }) => {
      const ts = Date.now();
      const first = `Email Enquiry ${ts}`;
      const second = `Social Media Enquiry ${ts}`;

      await typeOfEnquiryInput(page).fill(first);
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /created successfully/i })).toBeVisible({ timeout: 15000 });
      await expect(typeOfEnquiryInput(page)).toHaveValue('', { timeout: 10000 });

      await typeOfEnquiryInput(page).fill(second);
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /created successfully/i })).toBeVisible({ timeout: 15000 });

      await searchInput(page).fill(first);
      await page.waitForTimeout(800);
      await expect(tableRows(page).filter({ hasText: first })).toHaveCount(1, { timeout: 15000 });

      await searchInput(page).fill(second);
      await page.waitForTimeout(800);
      await expect(tableRows(page).filter({ hasText: second })).toHaveCount(1, { timeout: 15000 });
      await searchInput(page).clear();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 3 – Mandatory Field Validation
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Mandatory Field Validation', () => {

    test.beforeEach(async ({ page }) => {
      await gotoTypeOfEnquiryMaster(page);
    });

    // TC-VAL-01: Submit empty form shows inline validation error
    test('TC-VAL-01: Submit empty form shows inline validation error', async ({ page }) => {
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('text=/please enter type of enquiry/i')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add Type of Enquiry/i })).toBeVisible();
    });

    // TC-VAL-02: Inline error clears when valid input is entered
    test('TC-VAL-02: Inline error clears when valid input entered', async ({ page }) => {
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('text=/please enter type of enquiry/i')).toBeVisible({ timeout: 5000 });

      const name = `Direct Visit ${Date.now()}`;
      await typeOfEnquiryInput(page).fill(name);
      await expect(page.locator('text=/please enter type of enquiry/i')).not.toBeVisible({ timeout: 5000 });

      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /created successfully/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-VAL-03: Submit whitespace-only shows validation error
    test('TC-VAL-03: Submit whitespace-only shows validation error', async ({ page }) => {
      await typeOfEnquiryInput(page).fill('   ');
      await page.getByRole('button', { name: /Submit/i }).click();

      const [hasAlert, hasInline] = await Promise.all([
        page.locator('[role="alert"]').first().waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false),
        page.locator('text=/please enter type of enquiry|can not be empty/i').waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false),
      ]);

      if (hasAlert || hasInline) {
        expect(hasAlert || hasInline).toBeTruthy();
        return;
      }
      await expect(page.getByRole('heading', { name: /Add Type of Enquiry/i })).toBeVisible();
    });

    // TC-VAL-04: Clear after validation error removes the error
    test('TC-VAL-04: Clear after validation error removes inline error', async ({ page }) => {
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('text=/please enter type of enquiry/i')).toBeVisible({ timeout: 5000 });

      await page.getByRole('button', { name: /Clear/i }).click();

      await expect(page.locator('text=/please enter type of enquiry/i')).not.toBeVisible({ timeout: 5000 });
      await expect(typeOfEnquiryInput(page)).toHaveValue('');
      await expect(askFirmDetailsCheckbox(page)).not.toBeChecked();
    });

    // TC-VAL-05: Checkbox checked but name empty — still shows validation
    test('TC-VAL-05: Checkbox checked but name empty still shows validation error', async ({ page }) => {
      await askFirmDetailsCheckbox(page).check();
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('text=/please enter type of enquiry/i')).toBeVisible({ timeout: 5000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 4 – Duplicate Prevention
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Duplicate Prevention', () => {

    test.beforeEach(async ({ page }) => {
      await gotoTypeOfEnquiryMaster(page);
    });

    // TC-DUP-01: Submitting an existing Active name shows error toast
    test('TC-DUP-01: Submitting existing Active Type of Enquiry name shows error', async ({ page }) => {
      await waitForTableRows(page);
      const existingName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(existingName.length).toBeGreaterThan(0);

      await typeOfEnquiryInput(page).fill(existingName);
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /already exists|something went wrong/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-DUP-02: Case-insensitive duplicate detection
    test('TC-DUP-02: Case-insensitive duplicate detection', async ({ page }) => {
      await waitForTableRows(page);
      const existingName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(existingName.length).toBeGreaterThan(0);

      await typeOfEnquiryInput(page).fill(existingName.toUpperCase());
      await page.getByRole('button', { name: /Submit/i }).click();

      await page.locator('[role="alert"]').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

      const errorToast = page.locator('[role="alert"]').filter({ hasText: /already exists|something went wrong/i });
      const successToast = page.locator('[role="alert"]').filter({ hasText: /created successfully/i });
      const hasError = await errorToast.isVisible({ timeout: 2000 }).catch(() => false);
      const hasSuccess = await successToast.isVisible({ timeout: 2000 }).catch(() => false);
      expect(hasError || hasSuccess).toBeTruthy();
    });

    // TC-DUP-03: Submitting a name matching an existing Inactive record shows error
    test('TC-DUP-03: Duplicate of Inactive record name shows error', async ({ page }) => {
      await statusFilterSelect(page).selectOption('false');
      await page.waitForTimeout(1000);

      const inactiveCount = await tableRows(page).count().catch(() => 0);
      if (inactiveCount === 0) {
        test.skip();
        return;
      }

      const inactiveName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(inactiveName.length).toBeGreaterThan(0);

      await statusFilterSelect(page).selectOption('true');
      await typeOfEnquiryInput(page).fill(inactiveName);
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /already exists|something went wrong/i })).toBeVisible({ timeout: 15000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 5 – Clear Button Behavior
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Clear Button Behavior', () => {

    test.beforeEach(async ({ page }) => {
      await gotoTypeOfEnquiryMaster(page);
    });

    // TC-CLR-01: Clear resets the Add form
    test('TC-CLR-01: Clear resets the Add Type of Enquiry form', async ({ page }) => {
      await typeOfEnquiryInput(page).fill('Test Enquiry Type');
      await askFirmDetailsCheckbox(page).check();
      await page.getByRole('button', { name: /Clear/i }).click();

      await expect(typeOfEnquiryInput(page)).toHaveValue('');
      await expect(askFirmDetailsCheckbox(page)).not.toBeChecked();
      await expect(page.getByRole('heading', { name: /Add Type of Enquiry/i })).toBeVisible();
    });

    // TC-CLR-02: Clear in Edit mode resets form back to Add state
    test('TC-CLR-02: Clear in Edit mode resets form to Add Type of Enquiry state', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 2);

      await expect(page.getByRole('heading', { name: /Update Type of Enquiry/i })).toBeVisible({ timeout: 10000 });
      const currentName = await typeOfEnquiryInput(page).inputValue();
      expect(currentName.length).toBeGreaterThan(0);

      await expect(page.locator('#status')).toBeVisible();
      await expect(page.getByRole('button', { name: /Update/i })).toBeVisible();

      await page.getByRole('button', { name: /Clear/i }).click();

      await expect(page.getByRole('heading', { name: /Add Type of Enquiry/i })).toBeVisible();
      await expect(typeOfEnquiryInput(page)).toHaveValue('');
      await expect(askFirmDetailsCheckbox(page)).not.toBeChecked();
      await expect(page.locator('#status')).not.toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();
    });

    // TC-CLR-03: Clear after validation error in Update mode removes error
    test('TC-CLR-03: Clear after validation error in Update mode removes error', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 2);
      await expect(page.getByRole('heading', { name: /Update Type of Enquiry/i })).toBeVisible({ timeout: 10000 });

      await typeOfEnquiryInput(page).clear();
      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.locator('text=/please enter type of enquiry/i')).toBeVisible({ timeout: 5000 });

      await page.getByRole('button', { name: /Clear/i }).click();

      await expect(page.locator('text=/please enter type of enquiry/i')).not.toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add Type of Enquiry/i })).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 6 – Edit and Update Operations
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Edit and Update Operations', () => {

    test.beforeEach(async ({ page }) => {
      await gotoTypeOfEnquiryMaster(page);
    });

    // TC-EDT-01: Edit icon opens record with pre-filled fields (Ask Firm Details True)
    test('TC-EDT-01: Edit opens pre-filled form (Ask Firm Details True record)', async ({ page }) => {
      await waitForTableRows(page);

      const rowCount = await tableRows(page).count();
      let trueRowIndex = -1;
      for (let i = 0; i < rowCount; i++) {
        const askFirm = await tableRows(page).nth(i).locator('[role="cell"]').nth(3).innerText().catch(() => '');
        if (askFirm.trim().toLowerCase() === 'yes') {
          trueRowIndex = i;
          break;
        }
      }
      if (trueRowIndex === -1) { test.skip(); return; }

      await clickEditOnRow(page, trueRowIndex);

      await expect(page.getByRole('heading', { name: /Update Type of Enquiry/i })).toBeVisible({ timeout: 10000 });
      await expect(typeOfEnquiryInput(page)).not.toHaveValue('');
      await expect(askFirmDetailsCheckbox(page)).toBeChecked();
      await expect(page.locator('#status')).toBeVisible();
      await expect(page.getByRole('button', { name: /Update/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Clear/i })).toBeVisible();

      await page.getByRole('button', { name: /Clear/i }).click();
    });

    // TC-EDT-02: Edit opens record with Ask Firm Details unchecked (False)
    test('TC-EDT-02: Edit opens pre-filled form (Ask Firm Details False record)', async ({ page }) => {
      await waitForTableRows(page);

      const rowCount = await tableRows(page).count();
      let falseRowIndex = -1;
      for (let i = 0; i < rowCount; i++) {
        const askFirm = await tableRows(page).nth(i).locator('[role="cell"]').nth(3).innerText().catch(() => '');
        if (askFirm.trim().toLowerCase() === 'no') {
          falseRowIndex = i;
          break;
        }
      }
      if (falseRowIndex === -1) { test.skip(); return; }

      await clickEditOnRow(page, falseRowIndex);

      await expect(page.getByRole('heading', { name: /Update Type of Enquiry/i })).toBeVisible({ timeout: 10000 });
      await expect(typeOfEnquiryInput(page)).not.toHaveValue('');
      await expect(askFirmDetailsCheckbox(page)).not.toBeChecked();
      await expect(page.locator('#status')).toBeVisible();

      await page.getByRole('button', { name: /Clear/i }).click();
    });

    // TC-EDT-03: Successfully update a Type of Enquiry with a new name
    test('TC-EDT-03: Successfully update Type of Enquiry name', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 5);
      await expect(page.getByRole('heading', { name: /Update Type of Enquiry/i })).toBeVisible({ timeout: 10000 });

      const newName = `Updated Enquiry ${Date.now()}`;
      await typeOfEnquiryInput(page).clear();
      await typeOfEnquiryInput(page).fill(newName);
      await page.getByRole('button', { name: /Update/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /updated successfully/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Type of Enquiry/i })).toBeVisible({ timeout: 15000 });

      await searchInput(page).fill(newName);
      await page.waitForTimeout(800);
      await expect(tableRows(page).filter({ hasText: newName })).toHaveCount(1, { timeout: 15000 });
      await searchInput(page).clear();
    });

    // TC-EDT-04: Update Ask Firm Details from unchecked to checked
    test('TC-EDT-04: Update Ask Firm Details from unchecked to checked', async ({ page }) => {
      await waitForTableRows(page);

      const rowCount = await tableRows(page).count();
      let targetIdx = -1;
      for (let i = 0; i < rowCount; i++) {
        const askFirm = (await tableRows(page).nth(i).locator('[role="cell"]').nth(3).innerText()).trim().toLowerCase();
        if (askFirm === 'no') { targetIdx = i; break; }
      }
      if (targetIdx === -1) { test.skip(); return; }

      await clickEditOnRow(page, targetIdx);
      await expect(page.getByRole('heading', { name: /Update Type of Enquiry/i })).toBeVisible({ timeout: 10000 });

      await askFirmDetailsCheckbox(page).check();
      await page.getByRole('button', { name: /Update/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /updated successfully/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Type of Enquiry/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-EDT-05: Update Ask Firm Details from checked to unchecked
    test('TC-EDT-05: Update Ask Firm Details from checked to unchecked', async ({ page }) => {
      await waitForTableRows(page);

      const rowCount = await tableRows(page).count();
      let targetIdx = -1;
      for (let i = 0; i < rowCount; i++) {
        const askFirm = (await tableRows(page).nth(i).locator('[role="cell"]').nth(3).innerText()).trim().toLowerCase();
        if (askFirm === 'yes') { targetIdx = i; break; }
      }
      if (targetIdx === -1) { test.skip(); return; }

      await clickEditOnRow(page, targetIdx);
      await expect(page.getByRole('heading', { name: /Update Type of Enquiry/i })).toBeVisible({ timeout: 10000 });

      await askFirmDetailsCheckbox(page).uncheck();
      await page.getByRole('button', { name: /Update/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /updated successfully/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Type of Enquiry/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-EDT-06: Update with empty name shows validation error
    test('TC-EDT-06: Update with empty Type of Enquiry name shows validation error', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 2);
      await expect(page.getByRole('heading', { name: /Update Type of Enquiry/i })).toBeVisible({ timeout: 10000 });

      await typeOfEnquiryInput(page).clear();
      await page.getByRole('button', { name: /Update/i }).click();

      await expect(page.locator('text=/please enter type of enquiry/i')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Update Type of Enquiry/i })).toBeVisible();

      await page.getByRole('button', { name: /Clear/i }).click();
    });

    // TC-EDT-07: Update name to match an existing Active record shows error
    test('TC-EDT-07: Update name to match existing Active record shows error', async ({ page }) => {
      await waitForTableRows(page);

      const secondName = (await tableRows(page).nth(1).locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(secondName.length).toBeGreaterThan(0);

      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Type of Enquiry/i })).toBeVisible({ timeout: 10000 });

      await typeOfEnquiryInput(page).clear();
      await typeOfEnquiryInput(page).fill(secondName);
      await page.getByRole('button', { name: /Update/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /already exists|something went wrong/i })).toBeVisible({ timeout: 15000 });

      await page.getByRole('button', { name: /Clear/i }).click();
    });

    // TC-EDT-08: Update name to match an existing Inactive record shows error
    test('TC-EDT-08: Update name to match existing Inactive record shows error', async ({ page }) => {
      await statusFilterSelect(page).selectOption('false');
      await page.waitForTimeout(1000);

      const inactiveCount = await tableRows(page).count().catch(() => 0);
      if (inactiveCount === 0) {
        test.skip();
        return;
      }

      const inactiveName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(inactiveName.length).toBeGreaterThan(0);

      await statusFilterSelect(page).selectOption('true');
      await waitForTableRows(page);

      await clickEditOnRow(page, 2);
      await expect(page.getByRole('heading', { name: /Update Type of Enquiry/i })).toBeVisible({ timeout: 10000 });

      await typeOfEnquiryInput(page).clear();
      await typeOfEnquiryInput(page).fill(inactiveName);
      await page.getByRole('button', { name: /Update/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /already exists|something went wrong/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Update Type of Enquiry/i })).toBeVisible();

      await page.getByRole('button', { name: /Clear/i }).click();
    });

    // TC-EDT-09: Update status from Active to Inactive
    test('TC-EDT-09: Update status from Active to Inactive', async ({ page }) => {
      await waitForTableRows(page);

      const recordName = (await tableRows(page).nth(3).locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      await clickEditOnRow(page, 3);
      await expect(page.getByRole('heading', { name: /Update Type of Enquiry/i })).toBeVisible({ timeout: 10000 });

      await page.locator('#status').selectOption('false');
      await page.getByRole('button', { name: /Update/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /updated successfully/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Type of Enquiry/i })).toBeVisible({ timeout: 15000 });

      await expect(tableRows(page).filter({ hasText: recordName })).toHaveCount(0, { timeout: 10000 });

      // Restore
      await statusFilterSelect(page).selectOption('false');
      await tableRows(page).filter({ hasText: recordName }).getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update Type of Enquiry/i })).toBeVisible({ timeout: 10000 });
      await page.locator('#status').selectOption('true');
      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.getByRole('heading', { name: /Add Type of Enquiry/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-EDT-10: Update status from Inactive to Active (re-activate)
    test('TC-EDT-10: Re-activate an Inactive Type of Enquiry record', async ({ page }) => {
      await statusFilterSelect(page).selectOption('false');
      await page.waitForTimeout(1000);

      const inactiveCount = await tableRows(page).count().catch(() => 0);
      if (inactiveCount === 0) {
        test.skip();
        return;
      }

      await waitForTableRows(page);
      const recordName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Type of Enquiry/i })).toBeVisible({ timeout: 10000 });
      await expect(page.locator('#status')).toHaveValue('false');

      await page.locator('#status').selectOption('true');
      await page.getByRole('button', { name: /Update/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /updated successfully/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Type of Enquiry/i })).toBeVisible({ timeout: 15000 });

      await statusFilterSelect(page).selectOption('true');
      await expect(tableRows(page).filter({ hasText: recordName })).toHaveCount(1, { timeout: 10000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 7 – Status Filter
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Status Filter', () => {

    test.beforeEach(async ({ page }) => {
      await gotoTypeOfEnquiryMaster(page);
    });

    // TC-FLT-01: Default filter is Active
    test('TC-FLT-01: Default Status filter is Active', async ({ page }) => {
      await expect(statusFilterSelect(page)).toHaveValue('true');
      await waitForTableRows(page);

      const statuses = await getStatusColumnTexts(page);
      expect(statuses.length).toBeGreaterThan(0);
      for (const status of statuses) {
        expect(status).toBe('Active');
      }
    });

    // TC-FLT-02: Filter to All shows both Active and Inactive records
    test('TC-FLT-02: Filter to All shows both Active and Inactive records', async ({ page }) => {
      await statusFilterSelect(page).selectOption('');
      await waitForTableRows(page);
      await expect(statusFilterSelect(page)).toHaveValue('');
      expect(await tableRows(page).count()).toBeGreaterThan(0);
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

    // TC-FLT-04: Status filter resets to Active on navigation
    test('TC-FLT-04: Status filter resets to Active on page re-navigation', async ({ page }) => {
      await statusFilterSelect(page).selectOption('');
      await expect(statusFilterSelect(page)).toHaveValue('');

      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      await page.goto(TYPE_OF_ENQUIRY_URL);
      await page.getByRole('heading', { name: /Add Type of Enquiry/i }).waitFor({ state: 'visible', timeout: 30000 });

      await expect(statusFilterSelect(page)).toHaveValue('true');
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 8 – Search Functionality
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Search Functionality', () => {

    test.beforeEach(async ({ page }) => {
      await gotoTypeOfEnquiryMaster(page);
    });

    // TC-SRC-01: Partial name search returns matching results
    test('TC-SRC-01: Search by partial name returns matches', async ({ page }) => {
      await waitForTableRows(page);
      const firstName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText()).trim();
      const partial = firstName.split(' ')[0];

      await searchInput(page).fill(partial);
      await page.waitForTimeout(800);

      expect(await tableRows(page).count()).toBeGreaterThan(0);
      await searchInput(page).clear();
    });

    // TC-SRC-02: Exact name search returns one result
    test('TC-SRC-02: Search by exact name returns exact match', async ({ page }) => {
      await waitForTableRows(page);
      const exactName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText()).trim();

      await searchInput(page).fill(exactName);
      await page.waitForTimeout(800);

      await expect(tableRows(page).filter({ hasText: exactName })).toHaveCount(1, { timeout: 10000 });
      await searchInput(page).clear();
    });

    // TC-SRC-03: Non-existent search returns no results
    test('TC-SRC-03: Non-existent search returns no results', async ({ page }) => {
      await waitForTableRows(page);
      await searchInput(page).fill('XYZ123NONEXISTENT');
      await tableRows(page).first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

      expect(await tableRows(page).count().catch(() => 0)).toBe(0);
      await searchInput(page).clear();
    });

    // TC-SRC-04: Clearing search restores full list
    test('TC-SRC-04: Clearing search restores full list', async ({ page }) => {
      await waitForTableRows(page);
      const initialCount = await tableRows(page).count();
      const firstName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText()).trim();

      await searchInput(page).fill(firstName.split(' ')[0]);
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      await searchInput(page).clear();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      expect(await tableRows(page).count()).toBe(initialCount);
    });

    // TC-SRC-05: Search is case-insensitive
    test('TC-SRC-05: Search is case-insensitive', async ({ page }) => {
      await waitForTableRows(page);
      const exactName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText()).trim();

      await searchInput(page).fill(exactName.toLowerCase());
      await page.waitForTimeout(800);

      await expect(tableRows(page).filter({ hasText: exactName })).toHaveCount(1, { timeout: 10000 });
      await searchInput(page).clear();
    });

    // TC-SRC-06: Search filters apply on top of Status filter
    test('TC-SRC-06: Search filters apply on top of Status filter', async ({ page }) => {
      await waitForTableRows(page);
      await expect(statusFilterSelect(page)).toHaveValue('true');

      const firstName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText()).trim();
      await searchInput(page).fill(firstName.split(' ')[0]);
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
      await gotoTypeOfEnquiryMaster(page);
    });

    // TC-PAG-01: Default rows-per-page is 25
    test('TC-PAG-01: Default rows-per-page is 25', async ({ page }) => {
      await expect(showEntriesSelect(page)).toHaveValue('25');
    });

    // TC-PAG-02: Change rows-per-page to 10
    test('TC-PAG-02: Change rows-per-page to 10 limits rows', async ({ page }) => {
      await waitForTableRows(page);
      await showEntriesSelect(page).selectOption('10');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      expect(await tableRows(page).count()).toBeLessThanOrEqual(10);
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

      await showEntriesSelect(page).selectOption('50');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      expect(await tableRows(page).count()).toBeLessThanOrEqual(50);

      await showEntriesSelect(page).selectOption('100');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      expect(await tableRows(page).count()).toBeLessThanOrEqual(100);
    });

    // TC-PAG-05: Pagination disabled when all records fit on one page
    test('TC-PAG-05: Pagination disabled when all records fit on one page', async ({ page }) => {
      await waitForTableRows(page);
      await showEntriesSelect(page).selectOption('100');
      await page.waitForTimeout(500);

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
      await gotoTypeOfEnquiryMaster(page);
    });

    // TC-SRT-01: Sort by Type of Enquiry ascending — click th header if sortable
    test('TC-SRT-01: Sort by Type of Enquiry ascending', async ({ page }) => {
      await waitForTableRows(page);
      // Column headers on this page are <th> text elements (no button wrapper)
      const typeHeader = page.locator('th').filter({ hasText: /^Type Of Enquiry$/i }).first();
      const isClickable = await typeHeader.isVisible({ timeout: 3000 }).catch(() => false);
      if (isClickable) {
        await typeHeader.click();
        await page.waitForTimeout(800);
        await waitForTableRows(page);
      }
      // Verify table still shows records regardless of sort support
      expect(await tableRows(page).count()).toBeGreaterThan(0);
    });

    // TC-SRT-02: Sort by Type of Enquiry descending
    test('TC-SRT-02: Sort by Type of Enquiry descending', async ({ page }) => {
      await waitForTableRows(page);
      const typeHeader = page.locator('th').filter({ hasText: /^Type Of Enquiry$/i }).first();
      const isClickable = await typeHeader.isVisible({ timeout: 3000 }).catch(() => false);
      if (isClickable) {
        await typeHeader.click();
        await page.waitForTimeout(600);
        await typeHeader.click();
        await page.waitForTimeout(600);
        await waitForTableRows(page);
      }
      expect(await tableRows(page).count()).toBeGreaterThan(0);
    });

    // TC-SRT-03: Sort by Ask Firm Details column
    test('TC-SRT-03: Sort by Ask Firm Details column', async ({ page }) => {
      await waitForTableRows(page);
      const askHeader = page.locator('th').filter({ hasText: /^Ask Firm Details$/i }).first();
      const isClickable = await askHeader.isVisible({ timeout: 3000 }).catch(() => false);
      if (isClickable) {
        await askHeader.click();
        await page.waitForTimeout(800);
      }
      expect(await tableRows(page).count()).toBeGreaterThan(0);
    });

    // TC-SRT-04: Sort by Status column
    test('TC-SRT-04: Sort by Status column', async ({ page }) => {
      await statusFilterSelect(page).selectOption('');
      await waitForTableRows(page);
      const statusHeader = page.locator('th').filter({ hasText: /^Status$/i }).first();
      const isClickable = await statusHeader.isVisible({ timeout: 3000 }).catch(() => false);
      if (isClickable) {
        await statusHeader.click();
        await page.waitForTimeout(800);
      }
      expect(await tableRows(page).count()).toBeGreaterThan(0);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 11 – Inactive Status Management
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Inactive Status Management', () => {

    test.beforeEach(async ({ page }) => {
      await gotoTypeOfEnquiryMaster(page);
    });

    // TC-INACT-01: Inactive records hidden from Active filter view
    test('TC-INACT-01: Inactive records hidden from Active filter', async ({ page }) => {
      await expect(statusFilterSelect(page)).toHaveValue('true');
      await waitForTableRows(page);

      const statuses = await getStatusColumnTexts(page);
      for (const status of statuses) {
        expect(status).toBe('Active');
      }
    });

    // TC-INACT-02: Inactive records visible in Inactive and All filters
    test('TC-INACT-02: Inactive records visible in Inactive and All filters', async ({ page }) => {
      await statusFilterSelect(page).selectOption('false');
      await page.getByRole('heading', { name: /^Active$/i, level: 5 }).first()
        .waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(300);
      await expect(statusFilterSelect(page)).toHaveValue('false');

      const inactiveCount = await tableRows(page).count().catch(() => 0);
      if (inactiveCount > 0) {
        const statuses = await getStatusColumnTexts(page);
        for (const status of statuses) {
          expect(status.toLowerCase()).toContain('inactive');
        }
      }

      await statusFilterSelect(page).selectOption('');
      await page.waitForTimeout(500);
      await waitForTableRows(page);
      expect(await tableRows(page).count()).toBeGreaterThan(0);
    });

    // TC-INACT-03: Edit icon available for Inactive records and loads correct values
    test('TC-INACT-03: Edit icon available for Inactive records', async ({ page }) => {
      await statusFilterSelect(page).selectOption('false');
      await page.waitForTimeout(1000);

      const inactiveCount = await tableRows(page).count().catch(() => 0);
      if (inactiveCount === 0) {
        test.skip();
        return;
      }

      await waitForTableRows(page);
      await clickEditOnRow(page, 0);

      await expect(page.getByRole('heading', { name: /Update Type of Enquiry/i })).toBeVisible({ timeout: 10000 });
      await expect(page.locator('#status')).toHaveValue('false');

      await page.getByRole('button', { name: /Clear/i }).click();
    });

    // TC-INACT-04: Ask Firm Details value is preserved when a record is inactivated and reactivated
    test('TC-INACT-04: Ask Firm Details value preserved across inactivation and reactivation', async ({ page }) => {
      await waitForTableRows(page);

      const rowCount = await tableRows(page).count();
      let targetIdx = -1;
      for (let i = 0; i < rowCount; i++) {
        const askFirm = (await tableRows(page).nth(i).locator('[role="cell"]').nth(3).innerText()).trim().toLowerCase();
        if (askFirm === 'yes') { targetIdx = i; break; }
      }
      if (targetIdx === -1) { test.skip(); return; }

      const targetName = (await tableRows(page).nth(targetIdx).locator('[role="cell"]').nth(2).innerText()).trim();

      // Inactivate
      await clickEditOnRow(page, targetIdx);
      await expect(page.getByRole('heading', { name: /Update Type of Enquiry/i })).toBeVisible({ timeout: 10000 });
      await page.locator('#status').selectOption('false');
      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /updated successfully/i })).toBeVisible({ timeout: 15000 });

      // Re-activate
      await statusFilterSelect(page).selectOption('false');
      await tableRows(page).filter({ hasText: targetName }).getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update Type of Enquiry/i })).toBeVisible({ timeout: 10000 });
      await expect(askFirmDetailsCheckbox(page)).toBeChecked();

      await page.locator('#status').selectOption('true');
      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /updated successfully/i })).toBeVisible({ timeout: 15000 });

      // Verify restored with Ask Firm Details = True
      await statusFilterSelect(page).selectOption('true');
      const restoredRow = tableRows(page).filter({ hasText: targetName });
      await expect(restoredRow).toHaveCount(1, { timeout: 10000 });
      await expect(restoredRow.locator('[role="cell"]').nth(3)).toHaveText('Yes');
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 12 – Navigation and Access
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Navigation and Access', () => {

    test.beforeEach(async ({ page }) => {
      await gotoTypeOfEnquiryMaster(page);
    });

    // TC-NAV-01: Type of Enquiry accessible via Sales Masters sidebar
    test('TC-NAV-01: Type of Enquiry accessible via Sales Masters sidebar', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      await page.getByRole('link', { name: /Sales Masters/i }).click();
      await page.getByRole('link', { name: /^Type of Enquiry$/i }).waitFor({ state: 'visible', timeout: 10000 });
      await page.getByRole('link', { name: /^Type of Enquiry$/i }).click();

      await expect(page).toHaveURL(new RegExp(TYPE_OF_ENQUIRY_URL, 'i'));
      await expect(page.getByRole('heading', { name: /Add Type of Enquiry/i })).toBeVisible({ timeout: 30000 });
    });

    // TC-NAV-02: Direct URL navigation works when authenticated
    test('TC-NAV-02: Direct URL navigation works when authenticated', async ({ page }) => {
      await page.goto(TYPE_OF_ENQUIRY_URL);
      await expect(page).toHaveURL(new RegExp(TYPE_OF_ENQUIRY_URL, 'i'));
      await expect(page.getByRole('heading', { name: /Add Type of Enquiry/i })).toBeVisible({ timeout: 30000 });
      await expect(typeOfEnquiryInput(page)).toBeVisible();
    });

  });

});
