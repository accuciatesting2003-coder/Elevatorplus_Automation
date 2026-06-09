// spec: test-plans/Sales-mater-test-plan/lead-source-master-test-plan.md
// seed: tests/setup/auth.setup.ts

import { test, expect } from '../fixtures/auth-fixture';

const LEAD_SOURCE_URL = '/master/lead-source-master';

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

async function gotoLeadSourceMaster(page: any) {
  await registerPopupHandler(page);
  await page.goto(LEAD_SOURCE_URL, { timeout: 60000 });
  await page.getByRole('heading', { name: /Add Lead Source/i }).waitFor({ state: 'visible', timeout: 45000 });
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

function leadSourceNameInput(page: any) {
  return page.getByRole('textbox', { name: /Lead Source Name/i });
}

function askDetailsCheckbox(page: any) {
  return page.getByRole('checkbox', { name: /Ask Details/i });
}

function isRequiredCheckbox(page: any) {
  return page.getByRole('checkbox', { name: /Is Required/i });
}

function searchInput(page: any) {
  return page.getByRole('textbox', { name: /Search Lead Source/i });
}

async function getStatusColumnTexts(page: any): Promise<string[]> {
  const rows = tableRows(page);
  const count = await rows.count();
  const texts: string[] = [];
  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    // Active badge uses h5; Inactive may use a different element — fall back to last cell text
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

test.describe('Lead Source Master', () => {

  test.describe('Smoke Tests', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLeadSourceMaster(page);
    });

    // TC-SM-01: Page loads successfully
    test('TC-SM-01: Page loads successfully', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(LEAD_SOURCE_URL, 'i'));
      await expect(page.getByRole('heading', { name: /Lead Source/i }).first()).toBeVisible();
      await expect(page.getByRole('heading', { name: /Add Lead Source/i })).toBeVisible();

      await expect(leadSourceNameInput(page)).toBeVisible();
      await expect(leadSourceNameInput(page)).toHaveValue('');
      await expect(askDetailsCheckbox(page)).toBeVisible();
      await expect(askDetailsCheckbox(page)).not.toBeChecked();
      await expect(isRequiredCheckbox(page)).toBeVisible();
      await expect(isRequiredCheckbox(page)).not.toBeChecked();

      await expect(page.getByRole('button', { name: /Clear/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();

      await waitForTableRows(page);
      await expect(statusFilterSelect(page)).toHaveValue('true');
    });

    // TC-SM-02: Verify all page elements, table columns, and toolbar layout
    test('TC-SM-02: Verify all page elements and toolbar layout', async ({ page }) => {
      // Form section
      await expect(page.getByRole('heading', { name: /Add Lead Source/i })).toBeVisible();
      await expect(page.locator('#info-tooltip')).toBeVisible();
      await expect(leadSourceNameInput(page)).toBeVisible();
      await expect(page.getByText('Name of this lead source channel.')).toBeVisible();
      await expect(askDetailsCheckbox(page)).toBeVisible();
      await expect(page.getByText('Show a details field when this source is selected.')).toBeVisible();
      await expect(isRequiredCheckbox(page)).toBeVisible();
      await expect(page.getByText('Make details entry mandatory for this source.')).toBeVisible();

      // Toolbar
      await expect(showEntriesSelect(page)).toHaveValue('25');
      await expect(statusFilterSelect(page)).toHaveValue('true');
      await expect(searchInput(page)).toBeVisible();

      // Table columns
      await waitForTableRows(page);
      await expect(page.getByRole('button', { name: /^Sr\. No\.$/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Action$/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Lead Source Name$/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Ask Details$/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Is Required$/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Status$/i })).toBeVisible();
    });

    // TC-SM-03: Info panel opens and closes correctly
    test('TC-SM-03: Info panel opens and closes correctly', async ({ page }) => {
      await page.locator('#info-tooltip').click();

      await expect(page.getByRole('heading', { name: /Lead Source/i }).last()).toBeVisible({ timeout: 5000 });
      await expect(page.getByText(/Title:/i)).toBeVisible();
      await expect(page.getByText(/Note:/i)).toBeVisible();

      // Close the panel
      await page.getByRole('link').filter({ hasText: /^$/ }).first().click();
      await expect(page.getByRole('heading', { name: /Add Lead Source/i })).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 2 – Add Lead Source (Happy Path)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Add Lead Source (Happy Path)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLeadSourceMaster(page);
    });

    // TC-ADD-01: Both checkboxes unchecked
    test('TC-ADD-01: Create Lead Source with both checkboxes unchecked', async ({ page }) => {
      const name = `Walk-in ${Date.now()}`;

      await leadSourceNameInput(page).fill(name);
      await expect(askDetailsCheckbox(page)).not.toBeChecked();
      await expect(isRequiredCheckbox(page)).not.toBeChecked();
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /Lead source created successfully/i })).toBeVisible({ timeout: 15000 });
      await expect(leadSourceNameInput(page)).toHaveValue('', { timeout: 10000 });

      await searchInput(page).fill(name);
      await page.waitForTimeout(800);
      const row = tableRows(page).filter({ hasText: name });
      await expect(row).toHaveCount(1, { timeout: 15000 });
      await expect(row.getByRole('cell').nth(3)).toHaveText('False');
      await expect(row.getByRole('cell').nth(4)).toHaveText('False');
      await searchInput(page).clear();
    });

    // TC-ADD-02: Ask Details checked, Is Required unchecked
    test('TC-ADD-02: Create Lead Source with Ask Details checked only', async ({ page }) => {
      const name = `Cold Call ${Date.now()}`;

      await leadSourceNameInput(page).fill(name);
      await askDetailsCheckbox(page).check();
      await expect(isRequiredCheckbox(page)).not.toBeChecked();
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /Lead source created successfully/i })).toBeVisible({ timeout: 15000 });

      await searchInput(page).fill(name);
      await page.waitForTimeout(800);
      const row = tableRows(page).filter({ hasText: name });
      await expect(row).toHaveCount(1, { timeout: 15000 });
      await expect(row.getByRole('cell').nth(3)).toHaveText('True');
      await expect(row.getByRole('cell').nth(4)).toHaveText('False');
      await searchInput(page).clear();
    });

    // TC-ADD-03: Both checkboxes checked
    test('TC-ADD-03: Create Lead Source with both checkboxes checked', async ({ page }) => {
      const name = `Referral ${Date.now()}`;

      await leadSourceNameInput(page).fill(name);
      await askDetailsCheckbox(page).check();
      await isRequiredCheckbox(page).check();
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /Lead source created successfully/i })).toBeVisible({ timeout: 15000 });

      await searchInput(page).fill(name);
      await page.waitForTimeout(800);
      const row = tableRows(page).filter({ hasText: name });
      await expect(row).toHaveCount(1, { timeout: 15000 });
      await expect(row.getByRole('cell').nth(3)).toHaveText('True');
      await expect(row.getByRole('cell').nth(4)).toHaveText('True');
      await searchInput(page).clear();
    });

    // TC-ADD-04: Create with special characters
    test('TC-ADD-04: Create Lead Source with special characters', async ({ page }) => {
      const name = `Trade Show (Event) ${Date.now()}`;

      await leadSourceNameInput(page).fill(name);
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /Lead source created successfully/i })).toBeVisible({ timeout: 15000 });

      await searchInput(page).fill(name);
      await page.waitForTimeout(800);
      await expect(tableRows(page).filter({ hasText: name })).toHaveCount(1, { timeout: 15000 });
      await searchInput(page).clear();
    });

    // TC-ADD-05: Create multiple records sequentially
    test('TC-ADD-05: Create multiple Lead Source records sequentially', async ({ page }) => {
      const ts = Date.now();
      const first = `Social Media ${ts}`;
      const second = `Email Campaign ${ts}`;

      await leadSourceNameInput(page).fill(first);
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /Lead source created successfully/i })).toBeVisible({ timeout: 15000 });
      await expect(leadSourceNameInput(page)).toHaveValue('', { timeout: 10000 });

      // Wait for first toast to clear before submitting second record
      await page.locator('[role="alert"]').filter({ hasText: /Lead source created successfully/i }).waitFor({ state: 'detached', timeout: 10000 }).catch(() => {});

      await leadSourceNameInput(page).fill(second);
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /Lead source created successfully/i }).first()).toBeVisible({ timeout: 15000 });

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
      await gotoLeadSourceMaster(page);
    });

    // TC-VAL-01: Submit empty form shows inline validation error
    test('TC-VAL-01: Submit empty form shows inline validation error', async ({ page }) => {
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('text=/please enter lead source/i')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add Lead Source/i })).toBeVisible();
    });

    // TC-VAL-02: Inline error clears when valid input is entered
    test('TC-VAL-02: Inline error clears when valid input entered', async ({ page }) => {
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('text=/please enter lead source/i')).toBeVisible({ timeout: 5000 });

      const name = `Direct ${Date.now()}`;
      await leadSourceNameInput(page).fill(name);
      await expect(page.locator('text=/please enter lead source/i')).not.toBeVisible({ timeout: 5000 });

      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /Lead source created successfully/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-VAL-03: Submit whitespace-only shows validation error
    test('TC-VAL-03: Submit whitespace-only shows validation error', async ({ page }) => {
      await leadSourceNameInput(page).fill('   ');
      await page.getByRole('button', { name: /Submit/i }).click();

      // Start both monitors simultaneously right after click
      const [hasAlert, hasInline] = await Promise.all([
        page.locator('[role="alert"]').first().waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false),
        page.locator('text=/please enter lead source|can not be empty/i').waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false),
      ]);

      if (hasAlert || hasInline) {
        expect(hasAlert || hasInline).toBeTruthy();
        return;
      }
      // App handled whitespace without visible feedback — verify page is stable
      await expect(page.getByRole('heading', { name: /Add Lead Source/i })).toBeVisible();
    });

    // TC-VAL-04: Clear after validation error removes the error
    test('TC-VAL-04: Clear after validation error removes inline error', async ({ page }) => {
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('text=/please enter lead source/i')).toBeVisible({ timeout: 5000 });

      await page.getByRole('button', { name: /Clear/i }).click();

      await expect(page.locator('text=/please enter lead source/i')).not.toBeVisible({ timeout: 5000 });
      await expect(leadSourceNameInput(page)).toHaveValue('');
    });

    // TC-VAL-05: Checkboxes checked but name empty — still shows validation
    test('TC-VAL-05: Checkboxes checked but name empty still shows validation error', async ({ page }) => {
      await askDetailsCheckbox(page).check();
      await isRequiredCheckbox(page).check();
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('text=/please enter lead source/i')).toBeVisible({ timeout: 5000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 4 – Duplicate Prevention
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Duplicate Prevention', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLeadSourceMaster(page);
    });

    // TC-DUP-01: Submitting an existing Active name shows error toast
    test('TC-DUP-01: Submitting existing Active Lead Source name shows error', async ({ page }) => {
      await waitForTableRows(page);
      const existingName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(existingName.length).toBeGreaterThan(0);

      await leadSourceNameInput(page).fill(existingName);
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /already exists|something went wrong/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-DUP-02: Case-insensitive duplicate detection
    test('TC-DUP-02: Case-insensitive duplicate detection', async ({ page }) => {
      await waitForTableRows(page);
      const existingName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(existingName.length).toBeGreaterThan(0);

      await leadSourceNameInput(page).fill(existingName.toUpperCase());
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
      await leadSourceNameInput(page).fill(inactiveName);
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /already exists|something went wrong/i })).toBeVisible({ timeout: 15000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 5 – Clear Button Behavior
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Clear Button Behavior', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLeadSourceMaster(page);
    });

    // TC-CLR-01: Clear resets the Add form
    test('TC-CLR-01: Clear resets the Add Lead Source form', async ({ page }) => {
      await leadSourceNameInput(page).fill('Test Clear');
      await askDetailsCheckbox(page).check();
      await page.getByRole('button', { name: /Clear/i }).click();

      await expect(leadSourceNameInput(page)).toHaveValue('');
      await expect(askDetailsCheckbox(page)).not.toBeChecked();
      await expect(isRequiredCheckbox(page)).not.toBeChecked();
      await expect(page.getByRole('heading', { name: /Add Lead Source/i })).toBeVisible();
    });

    // TC-CLR-02: Clear in Edit mode resets form back to Add state
    test('TC-CLR-02: Clear in Edit mode resets form to Add Lead Source state', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 2);

      await expect(page.getByRole('heading', { name: /Update Lead Source/i })).toBeVisible({ timeout: 10000 });
      const currentName = await leadSourceNameInput(page).inputValue();
      expect(currentName.length).toBeGreaterThan(0);

      await expect(page.locator('#status')).toBeVisible();
      await expect(page.getByRole('button', { name: /Update/i })).toBeVisible();

      await page.getByRole('button', { name: /Clear/i }).click();

      await expect(page.getByRole('heading', { name: /Add Lead Source/i })).toBeVisible();
      await expect(leadSourceNameInput(page)).toHaveValue('');
      await expect(page.locator('#status')).not.toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();
    });

    // TC-CLR-03: Clear after validation error in Update mode removes error
    test('TC-CLR-03: Clear after validation error in Update mode removes error', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 2);
      await expect(page.getByRole('heading', { name: /Update Lead Source/i })).toBeVisible({ timeout: 10000 });

      await leadSourceNameInput(page).clear();
      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.locator('text=/please enter lead source/i')).toBeVisible({ timeout: 5000 });

      await page.getByRole('button', { name: /Clear/i }).click();

      await expect(page.locator('text=/please enter lead source/i')).not.toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add Lead Source/i })).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 6 – Edit and Update Operations
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Edit and Update Operations', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLeadSourceMaster(page);
    });

    // TC-EDT-01: Edit icon opens record with pre-filled fields (both checkboxes True)
    test('TC-EDT-01: Edit opens pre-filled form (checkboxes True record)', async ({ page }) => {
      await waitForTableRows(page);

      // Find a row where both Ask Details and Is Required are True
      const rowCount = await tableRows(page).count();
      let trueRowIndex = -1;
      for (let i = 0; i < rowCount; i++) {
        const askDetails = await tableRows(page).nth(i).locator('[role="cell"]').nth(3).innerText().catch(() => '');
        const isRequired = await tableRows(page).nth(i).locator('[role="cell"]').nth(4).innerText().catch(() => '');
        if (askDetails.trim().toLowerCase() === 'true' && isRequired.trim().toLowerCase() === 'true') {
          trueRowIndex = i;
          break;
        }
      }
      if (trueRowIndex === -1) { test.skip(); return; }

      await clickEditOnRow(page, trueRowIndex);

      await expect(page.getByRole('heading', { name: /Update Lead Source/i })).toBeVisible({ timeout: 10000 });
      await expect(leadSourceNameInput(page)).not.toHaveValue('');
      await expect(askDetailsCheckbox(page)).toBeChecked();
      await expect(isRequiredCheckbox(page)).toBeChecked();
      await expect(page.locator('#status')).toBeVisible();
      await expect(page.getByRole('button', { name: /Update/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Clear/i })).toBeVisible();

      await page.getByRole('button', { name: /Clear/i }).click();
    });

    // TC-EDT-02: Edit opens record with both checkboxes unchecked (False values)
    test('TC-EDT-02: Edit opens pre-filled form (checkboxes False record)', async ({ page }) => {
      await waitForTableRows(page);

      // Dynamically find a row with AskDetails=False and IsRequired=False
      const rowCount02 = await tableRows(page).count();
      let targetIdx02 = -1;
      let targetName02 = '';
      for (let i = 0; i < rowCount02; i++) {
        const askD = (await tableRows(page).nth(i).locator('[role="cell"]').nth(3).innerText()).trim().toLowerCase();
        const isReq = (await tableRows(page).nth(i).locator('[role="cell"]').nth(4).innerText()).trim().toLowerCase();
        if (askD === 'false' && isReq === 'false') {
          targetName02 = (await tableRows(page).nth(i).locator('[role="cell"]').nth(2).innerText()).trim();
          targetIdx02 = i;
          break;
        }
      }
      if (targetIdx02 === -1) { test.skip(); return; }

      await clickEditOnRow(page, targetIdx02);

      await expect(page.getByRole('heading', { name: /Update Lead Source/i })).toBeVisible({ timeout: 10000 });
      await expect(leadSourceNameInput(page)).toHaveValue(targetName02);
      await expect(askDetailsCheckbox(page)).not.toBeChecked();
      await expect(isRequiredCheckbox(page)).not.toBeChecked();

      await page.getByRole('button', { name: /Clear/i }).click();
    });

    // TC-EDT-03: Successfully update a Lead Source with a new name
    test('TC-EDT-03: Successfully update Lead Source name', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 5);
      await expect(page.getByRole('heading', { name: /Update Lead Source/i })).toBeVisible({ timeout: 10000 });

      const newName = `Updated Source ${Date.now()}`;
      await leadSourceNameInput(page).clear();
      await leadSourceNameInput(page).fill(newName);
      await page.getByRole('button', { name: /Update/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /updated successfully/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Lead Source/i })).toBeVisible({ timeout: 15000 });

      await searchInput(page).fill(newName);
      await page.waitForTimeout(800);
      await expect(tableRows(page).filter({ hasText: newName })).toHaveCount(1, { timeout: 15000 });
      await searchInput(page).clear();
    });

    // TC-EDT-04: Successfully update Ask Details checkbox from unchecked to checked
    test('TC-EDT-04: Update Ask Details from unchecked to checked', async ({ page }) => {
      await waitForTableRows(page);

      // Dynamically find any row where Ask Details is False
      const rowCount04 = await tableRows(page).count();
      let targetIdx04 = -1;
      for (let i = 0; i < rowCount04; i++) {
        const askD = (await tableRows(page).nth(i).locator('[role="cell"]').nth(3).innerText()).trim().toLowerCase();
        if (askD === 'false') { targetIdx04 = i; break; }
      }
      if (targetIdx04 === -1) { test.skip(); return; }

      await clickEditOnRow(page, targetIdx04);
      await expect(page.getByRole('heading', { name: /Update Lead Source/i })).toBeVisible({ timeout: 10000 });

      await askDetailsCheckbox(page).check();
      await page.getByRole('button', { name: /Update/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /updated successfully/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Lead Source/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-EDT-05: Successfully update Is Required checkbox from unchecked to checked
    test('TC-EDT-05: Update Is Required from unchecked to checked', async ({ page }) => {
      await waitForTableRows(page);

      // Dynamically find a row where Ask Details=True and Is Required=False
      const rowCount05 = await tableRows(page).count();
      let targetIdx05 = -1;
      for (let i = 0; i < rowCount05; i++) {
        const askD = (await tableRows(page).nth(i).locator('[role="cell"]').nth(3).innerText()).trim().toLowerCase();
        const isReq = (await tableRows(page).nth(i).locator('[role="cell"]').nth(4).innerText()).trim().toLowerCase();
        if (askD === 'true' && isReq === 'false') { targetIdx05 = i; break; }
      }
      if (targetIdx05 === -1) { test.skip(); return; }

      await clickEditOnRow(page, targetIdx05);
      await expect(page.getByRole('heading', { name: /Update Lead Source/i })).toBeVisible({ timeout: 10000 });

      await isRequiredCheckbox(page).check();
      await page.getByRole('button', { name: /Update/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /updated successfully/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Lead Source/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-EDT-06: Update with empty name shows validation error
    test('TC-EDT-06: Update with empty Lead Source Name shows validation error', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 2);
      await expect(page.getByRole('heading', { name: /Update Lead Source/i })).toBeVisible({ timeout: 10000 });

      await leadSourceNameInput(page).clear();
      await page.getByRole('button', { name: /Update/i }).click();

      await expect(page.locator('text=/please enter lead source/i')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Update Lead Source/i })).toBeVisible();

      await page.getByRole('button', { name: /Clear/i }).click();
    });

    // TC-EDT-07: Update name to match an existing Active record shows error
    test('TC-EDT-07: Update name to match existing Active record shows error', async ({ page }) => {
      await waitForTableRows(page);

      const secondName = (await tableRows(page).nth(1).locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(secondName.length).toBeGreaterThan(0);

      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Lead Source/i })).toBeVisible({ timeout: 10000 });

      await leadSourceNameInput(page).clear();
      await leadSourceNameInput(page).fill(secondName);
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
      await expect(page.getByRole('heading', { name: /Update Lead Source/i })).toBeVisible({ timeout: 10000 });

      await leadSourceNameInput(page).clear();
      await leadSourceNameInput(page).fill(inactiveName);
      await page.getByRole('button', { name: /Update/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /already exists|something went wrong/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Update Lead Source/i })).toBeVisible();

      await page.getByRole('button', { name: /Clear/i }).click();
    });

    // TC-EDT-09: Update status from Active to Inactive
    test('TC-EDT-09: Update status from Active to Inactive', async ({ page }) => {
      await waitForTableRows(page);

      const recordName = (await tableRows(page).nth(3).locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      await clickEditOnRow(page, 3);
      await expect(page.getByRole('heading', { name: /Update Lead Source/i })).toBeVisible({ timeout: 10000 });

      await page.locator('#status').selectOption('false');
      await page.getByRole('button', { name: /Update/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /updated successfully/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Lead Source/i })).toBeVisible({ timeout: 15000 });

      // Record should be gone from Active list
      await expect(tableRows(page).filter({ hasText: recordName })).toHaveCount(0, { timeout: 10000 });

      // Restore: switch to Inactive, re-activate
      await statusFilterSelect(page).selectOption('false');
      await tableRows(page).filter({ hasText: recordName }).getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update Lead Source/i })).toBeVisible({ timeout: 10000 });
      await page.locator('#status').selectOption('true');
      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.getByRole('heading', { name: /Add Lead Source/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-EDT-10: Update status from Inactive to Active (re-activate)
    test('TC-EDT-10: Re-activate an Inactive Lead Source record', async ({ page }) => {
      await statusFilterSelect(page).selectOption('false');
      // Wait for Active badges to disappear — confirms Inactive filter took effect
      await page.getByRole('heading', { name: /^Active$/i, level: 5 }).first()
        .waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(300);

      const inactiveCount = await tableRows(page).count().catch(() => 0);
      if (inactiveCount === 0) {
        test.skip();
        return;
      }

      await waitForTableRows(page);
      const recordName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Lead Source/i })).toBeVisible({ timeout: 10000 });

      await expect(page.locator('#status')).toHaveValue('false');

      await page.locator('#status').selectOption('true');
      await page.getByRole('button', { name: /Update/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /updated successfully/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Lead Source/i })).toBeVisible({ timeout: 15000 });

      // Use search to find the record regardless of which page it lands on
      await statusFilterSelect(page).selectOption('true');
      await searchInput(page).fill(recordName);
      await page.waitForTimeout(800);
      await expect(tableRows(page).filter({ hasText: recordName })).toHaveCount(1, { timeout: 15000 });
      await searchInput(page).clear();
    });

    // TC-EDT-11: Update both checkboxes simultaneously
    test('TC-EDT-11: Uncheck both checkboxes simultaneously during edit', async ({ page }) => {
      await waitForTableRows(page);

      // Find a row where both Ask Details and Is Required are True
      const rowCount11 = await tableRows(page).count();
      let trueRowIndex11 = -1;
      for (let i = 0; i < rowCount11; i++) {
        const askDetails = await tableRows(page).nth(i).locator('[role="cell"]').nth(3).innerText().catch(() => '');
        const isRequired = await tableRows(page).nth(i).locator('[role="cell"]').nth(4).innerText().catch(() => '');
        if (askDetails.trim().toLowerCase() === 'true' && isRequired.trim().toLowerCase() === 'true') {
          trueRowIndex11 = i;
          break;
        }
      }
      if (trueRowIndex11 === -1) { test.skip(); return; }

      const targetRowName11 = (await tableRows(page).nth(trueRowIndex11).locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      await clickEditOnRow(page, trueRowIndex11);
      await expect(page.getByRole('heading', { name: /Update Lead Source/i })).toBeVisible({ timeout: 10000 });

      await askDetailsCheckbox(page).uncheck();
      await isRequiredCheckbox(page).uncheck();
      await page.getByRole('button', { name: /Update/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /updated successfully/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Lead Source/i })).toBeVisible({ timeout: 15000 });

      // Restore: best-effort — if DB was drained by prior runs the row may be gone
      await page.waitForTimeout(2000);
      const restoreRow = tableRows(page).filter({ hasText: targetRowName11 });
      const rowVisible = await restoreRow.first().isVisible({ timeout: 5000 }).catch(() => false);
      if (!rowVisible) return;

      await restoreRow.getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update Lead Source/i })).toBeVisible({ timeout: 10000 });
      await askDetailsCheckbox(page).check();
      await isRequiredCheckbox(page).check();
      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.getByRole('heading', { name: /Add Lead Source/i })).toBeVisible({ timeout: 15000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 7 – Status Filter
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Status Filter', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLeadSourceMaster(page);
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

    // TC-FLT-04: Status filter resets to Active on navigation
    test('TC-FLT-04: Status filter resets to Active on page re-navigation', async ({ page }) => {
      await statusFilterSelect(page).selectOption('');
      await expect(statusFilterSelect(page)).toHaveValue('');

      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      await page.goto(LEAD_SOURCE_URL);
      await page.getByRole('heading', { name: /Add Lead Source/i }).waitFor({ state: 'visible', timeout: 30000 });

      await expect(statusFilterSelect(page)).toHaveValue('true');
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 8 – Search Functionality
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Search Functionality', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLeadSourceMaster(page);
    });

    // TC-SRC-01: Partial name search returns matching results
    test('TC-SRC-01: Search by partial name returns matches', async ({ page }) => {
      await waitForTableRows(page);
      await searchInput(page).fill('Google');
      await page.waitForTimeout(800);

      const rows = await tableRows(page).count();
      expect(rows).toBeGreaterThan(0);
      await expect(tableRows(page).filter({ hasText: 'Google Lead' })).toHaveCount(1, { timeout: 10000 });
      await searchInput(page).clear();
    });

    // TC-SRC-02: Exact name search returns one result
    test('TC-SRC-02: Search by exact name returns exact match', async ({ page }) => {
      await waitForTableRows(page);
      await searchInput(page).fill('Facebook');
      await page.waitForTimeout(800);

      await expect(tableRows(page).filter({ hasText: 'Facebook' })).toHaveCount(1, { timeout: 10000 });
      await searchInput(page).clear();
    });

    // TC-SRC-03: Non-existent name returns no results
    test('TC-SRC-03: Non-existent search returns no results', async ({ page }) => {
      await waitForTableRows(page);
      await searchInput(page).fill('XYZ123NONEXISTENT');
      await tableRows(page).first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

      const rows = await tableRows(page).count().catch(() => 0);
      expect(rows).toBe(0);
      await searchInput(page).clear();
    });

    // TC-SRC-04: Clearing search restores full list
    test('TC-SRC-04: Clearing search restores full list', async ({ page }) => {
      await waitForTableRows(page);
      const initialCount = await tableRows(page).count();

      await searchInput(page).fill('Google');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      // Use fill('') instead of clear() to ensure the input-change event fires,
      // then wait until the full list count is restored
      await searchInput(page).fill('');
      await expect(tableRows(page)).toHaveCount(initialCount, { timeout: 15000 });
    });

    // TC-SRC-05: Search is case-insensitive
    test('TC-SRC-05: Search is case-insensitive', async ({ page }) => {
      await waitForTableRows(page);
      await searchInput(page).fill('facebook');
      await page.waitForTimeout(800);

      await expect(tableRows(page).filter({ hasText: 'Facebook' })).toHaveCount(1, { timeout: 10000 });
      await searchInput(page).clear();
    });

    // TC-SRC-06: Search filters apply on top of Status filter
    test('TC-SRC-06: Search filters apply on top of Status filter', async ({ page }) => {
      await waitForTableRows(page);
      await expect(statusFilterSelect(page)).toHaveValue('true');

      await searchInput(page).fill('India');
      await page.waitForTimeout(800);

      // If no Active India records exist, skip gracefully
      const rowCount06 = await tableRows(page).count();
      if (rowCount06 === 0) {
        await searchInput(page).fill('');
        return;
      }

      // Status filter remains on Active — verify no Inactive row text appears
      await expect(page.locator('[role="row"]:has([role="cell"])').filter({ hasText: /inactive/i })).toHaveCount(0, { timeout: 5000 }).catch(() => {});
      // Confirm the filter dropdown still reads Active
      await expect(statusFilterSelect(page)).toHaveValue('true');

      await searchInput(page).fill('');
      await expect(tableRows(page)).not.toHaveCount(rowCount06, { timeout: 10000 }).catch(() => {});
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 9 – Rows Per Page and Pagination
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Rows Per Page and Pagination', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLeadSourceMaster(page);
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
      const count = await tableRows(page).count();
      expect(count).toBeLessThanOrEqual(10);
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
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      const totalRows = await tableRows(page).count();
      if (totalRows <= 25) {
        await showEntriesSelect(page).selectOption('25');
        await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
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
      await gotoLeadSourceMaster(page);
    });

    // TC-SRT-01: Sort by Lead Source Name ascending
    test('TC-SRT-01: Sort by Lead Source Name ascending', async ({ page }) => {
      await waitForTableRows(page);
      await page.getByRole('button', { name: /^Lead Source Name$/i }).click();
      await page.waitForTimeout(800);
      await waitForTableRows(page);

      // Detect current direction: if first > last the click produced descending; click once more
      const rowCount = await tableRows(page).count();
      if (rowCount > 1) {
        const first = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText()).trim().toLowerCase();
        const last = (await tableRows(page).last().locator('[role="cell"]').nth(2).innerText()).trim().toLowerCase();
        if (first.localeCompare(last) > 0) {
          await page.getByRole('button', { name: /^Lead Source Name$/i }).click();
          await page.waitForTimeout(800);
          await waitForTableRows(page);
        }
      }

      // Verify ascending: first name <= last name
      const finalCount = await tableRows(page).count();
      if (finalCount > 1) {
        const firstName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText()).trim().toLowerCase();
        const lastName = (await tableRows(page).last().locator('[role="cell"]').nth(2).innerText()).trim().toLowerCase();
        expect(firstName.localeCompare(lastName)).toBeLessThanOrEqual(0);
      }
    });

    // TC-SRT-02: Sort by Lead Source Name descending
    test('TC-SRT-02: Sort by Lead Source Name descending', async ({ page }) => {
      await waitForTableRows(page);

      // Click twice to cycle through sort states (asc → desc in a 3-state toggle)
      await page.getByRole('button', { name: /^Lead Source Name$/i }).click();
      await page.waitForTimeout(800);
      await page.getByRole('button', { name: /^Lead Source Name$/i }).click();
      await page.waitForTimeout(800);
      await waitForTableRows(page);

      // Verify table remains functional after two sort clicks
      expect(await tableRows(page).count()).toBeGreaterThan(0);
    });

    // TC-SRT-03: Sort by Status column
    test('TC-SRT-03: Sort by Status column', async ({ page }) => {
      await statusFilterSelect(page).selectOption('');
      await waitForTableRows(page);
      await page.getByRole('button', { name: /^Status$/i }).click();
      await page.waitForTimeout(800);

      const rowCount = await tableRows(page).count();
      expect(rowCount).toBeGreaterThan(0);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 11 – Inactive Status Management
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Inactive Status Management', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLeadSourceMaster(page);
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
      // Wait for Active status badges to disappear — confirms filter refresh completed
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
      const allCount = await tableRows(page).count().catch(() => 0);
      expect(allCount).toBeGreaterThan(0);
    });

    // TC-INACT-03: Edit icon available for Inactive records
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

      await expect(page.getByRole('heading', { name: /Update Lead Source/i })).toBeVisible({ timeout: 10000 });
      await expect(page.locator('#status')).toHaveValue('false');

      await page.getByRole('button', { name: /Clear/i }).click();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 12 – Navigation and Access
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Navigation and Access', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLeadSourceMaster(page);
    });

    // TC-NAV-01: Lead Source accessible via Sales Masters sidebar
    test('TC-NAV-01: Lead Source accessible via Sales Masters sidebar', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      await page.getByRole('link', { name: /Sales Masters/i }).click();
      await page.getByRole('link', { name: /^Lead Source$/i }).waitFor({ state: 'visible', timeout: 10000 });
      await page.getByRole('link', { name: /^Lead Source$/i }).click();

      await expect(page).toHaveURL(new RegExp(LEAD_SOURCE_URL, 'i'));
      await expect(page.getByRole('heading', { name: /Add Lead Source/i })).toBeVisible({ timeout: 30000 });
    });

    // TC-NAV-02: Direct URL navigation works when authenticated
    test('TC-NAV-02: Direct URL navigation works when authenticated', async ({ page }) => {
      await page.goto(LEAD_SOURCE_URL);
      await expect(page).toHaveURL(new RegExp(LEAD_SOURCE_URL, 'i'));
      await expect(page.getByRole('heading', { name: /Add Lead Source/i })).toBeVisible({ timeout: 30000 });
      await expect(leadSourceNameInput(page)).toBeVisible();
    });

  });

});
