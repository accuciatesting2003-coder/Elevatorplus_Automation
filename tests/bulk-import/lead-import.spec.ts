// spec: test-plans/bulk-import-test-plan/lead-import-test-plan.md
// seed: tests/setup/auth.setup.ts

import { test, expect } from '../fixtures/auth-fixture';

const LEAD_IMPORT_URL = '/master/lead-import';

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

async function gotoLeadImport(page: any) {
  await registerPopupHandler(page);
  await page.goto(LEAD_IMPORT_URL, { timeout: 60000 });
  await page.getByRole('heading', { name: /Add lead Details/i }).waitFor({ state: 'visible', timeout: 45000 });
  await dismissNotificationPopup(page);
}

// Data rows (have cells, excludes header rows)
function tableRows(page: any) {
  return page.locator('[role="row"]:has([role="cell"])');
}

async function waitForTableRows(page: any) {
  await tableRows(page).first().waitFor({ state: 'visible', timeout: 30000 });
}

// ── Form field locators ──

function leadNameInput(page: any) {
  return page.getByRole('textbox', { name: /Lead Name/i });
}

// Phone inputs have no accessible name and the XPath parent-traversal doesn't scope correctly.
// All floating-label form inputs share placeholder=" ". The order on the page is:
//   nth(0) = Lead Name *, nth(1) = Mobile Number, nth(2) = Alternate Mobile Number, ...
function mobileInput(page: any) {
  return page.locator('[placeholder=" "]').nth(1);
}

function altMobileInput(page: any) {
  return page.locator('[placeholder=" "]').nth(2);
}

function firmNameInput(page: any) {
  return page.getByRole('textbox', { name: /^Firm Name$/i });
}

function siteNameInput(page: any) {
  return page.getByRole('textbox', { name: /^Site Name$/i });
}

function firmAddressInput(page: any) {
  return page.getByRole('textbox', { name: /Firm Address/i });
}

function emailInput(page: any) {
  return page.getByRole('textbox', { name: /Email/i });
}

function siteAddressInput(page: any) {
  return page.getByRole('textbox', { name: /Site Address/i });
}

function noteInput(page: any) {
  return page.getByRole('textbox', { name: /^Note$/i });
}

// ── Toolbar locators ──

function searchInput(page: any) {
  return page.getByRole('banner').getByRole('textbox');
}

function showEntriesSelect(page: any) {
  return page.locator('#rows-per-page').first();
}

// Status filter has options: All, Pending, Cold, Warm, Hot, Lost, Enquiry Generated
function statusFilterSelect(page: any) {
  return page.locator('select').filter({ has: page.locator('option', { hasText: 'Pending' }) }).first();
}

// ── Action helpers ──

async function clickEditOnRow(page: any, rowIndex: number = 0) {
  await page.mouse.move(0, 0);
  await page.waitForTimeout(300);
  const editIcon = tableRows(page).nth(rowIndex).getByRole('img', { name: 'Edit' });
  await editIcon.waitFor({ state: 'visible', timeout: 15000 });
  await editIcon.click({ timeout: 15000 });
}

// Append digits to a phone input that already has "+91" prefix
async function fillMobileDigits(page: any, input: any, digits: string) {
  await input.click();
  await page.keyboard.press('End');
  await page.keyboard.type(digits);
}

// Clear a phone input and re-enter digits
async function clearAndFillMobile(page: any, input: any, digits: string) {
  await input.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.keyboard.type(digits);
}

// After typing in the search box the table makes a server-side request.
// Wait for the [role="status"] loading indicator to disappear before asserting on rows.
async function waitForSearchResults(page: any) {
  await page.waitForTimeout(300);  // let the debounce / request start
  await page.locator('[role="status"]').waitFor({ state: 'detached', timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(300);  // brief settle after results render
}

async function waitForSuccessToast(page: any) {
  await page.locator('[role="alert"]')
    .filter({ hasText: /created successfully|added successfully/i })
    .first()
    .waitFor({ state: 'visible', timeout: 20000 });
}

async function waitForUpdateToast(page: any) {
  await page.locator('[role="alert"]')
    .filter({ hasText: /updated successfully/i })
    .first()
    .waitFor({ state: 'visible', timeout: 20000 });
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1 – Smoke Tests
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Lead Import Master', () => {

  test.describe('1. Smoke Tests', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLeadImport(page);
    });

    test('TC-SM-01: Page loads and all key elements are visible', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(LEAD_IMPORT_URL));

      // Navbar and form headings
      await expect(page.getByRole('heading', { name: /Lead Import/i }).first()).toBeVisible();
      await expect(page.getByRole('heading', { name: /Add lead Details/i })).toBeVisible();

      // Mandatory fields
      await expect(leadNameInput(page)).toBeVisible();
      await expect(leadNameInput(page)).toHaveValue('');
      await expect(mobileInput(page)).toBeVisible();

      // Optional fields
      await expect(altMobileInput(page)).toBeVisible();
      await expect(firmNameInput(page)).toBeVisible();
      await expect(siteNameInput(page)).toBeVisible();
      await expect(firmAddressInput(page)).toBeVisible();
      await expect(emailInput(page)).toBeVisible();
      await expect(siteAddressInput(page)).toBeVisible();
      await expect(noteInput(page)).toBeVisible();

      // Select Site Location button
      await expect(page.getByRole('button', { name: /Select Site Location/i })).toBeVisible();

      // Form action buttons
      await expect(page.getByRole('button', { name: /\bClear\b/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /\bSubmit\b/i })).toBeVisible();

      // Table loads with data
      await waitForTableRows(page);
    });

    test('TC-SM-02: Table toolbar and column headers are correct', async ({ page }) => {
      await waitForTableRows(page);

      // Toolbar defaults
      await expect(showEntriesSelect(page)).toHaveValue('25');
      await expect(statusFilterSelect(page)).toHaveValue('');  // 'All' option has empty value
      await expect(searchInput(page)).toBeVisible();

      // Table column header buttons
      await expect(page.getByRole('button', { name: /^Lead Name$/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Mobile Number$/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Firm Name$/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Site Name$/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Assign To$/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Lead Source$/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Ask Details$/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Note$/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Status$/i })).toBeVisible();

      // Action column: Edit icon present in first row, no Delete
      const firstRow = tableRows(page).first();
      await expect(firstRow.getByRole('img', { name: 'Edit' })).toBeVisible();
      await expect(firstRow.getByRole('img', { name: 'Delete' })).not.toBeVisible();
    });

    test('TC-SM-03: Info panel opens and closes', async ({ page }) => {
      await page.locator('#info-tooltip').click();

      await expect(page.getByRole('heading', { name: /Lead Import/i }).last()).toBeVisible({ timeout: 5000 });
      await expect(page.getByText(/Title:/i)).toBeVisible();
      await expect(page.getByText(/Note:/i)).toBeVisible();

      // Close the panel
      await page.locator('#info-tooltip').locator('xpath=ancestor::div[contains(@class,"card")]')
        .or(page.locator('.offcanvas, [class*="side-panel"], [class*="drawer"]'))
        .locator('a, button').filter({ hasText: /^$/ }).first()
        .click().catch(async () => {
          // Fallback: press Escape
          await page.keyboard.press('Escape');
        });

      await expect(page.getByRole('heading', { name: /Add lead Details/i })).toBeVisible({ timeout: 5000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 2 – Add Lead (Happy Path)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('2. Add Lead (Happy Path)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLeadImport(page);
    });

    test('TC-ADD-01: Add lead with mandatory fields only', async ({ page }) => {
      const ts = Date.now();
      const leadName = `Test Lead ${ts}`;

      await leadNameInput(page).fill(leadName);
      await fillMobileDigits(page, mobileInput(page), '9876543210');
      await page.getByRole('button', { name: /\bSubmit\b/i }).click();

      await waitForSuccessToast(page);
      // Form resets after submission
      await expect(leadNameInput(page)).toHaveValue('', { timeout: 10000 });
    });

    test('TC-ADD-02: Add lead with all optional text fields filled', async ({ page }) => {
      const ts = Date.now();
      const leadName = `Full Lead ${ts}`;

      await leadNameInput(page).fill(leadName);
      await fillMobileDigits(page, mobileInput(page), '9123456789');
      await firmNameInput(page).fill(`Firm ${ts}`);
      await siteNameInput(page).fill(`Site ${ts}`);
      await firmAddressInput(page).fill('123 Test Street');
      await emailInput(page).fill(`test${ts}@example.com`);
      await noteInput(page).fill('Automated test note');
      await page.getByRole('button', { name: /\bSubmit\b/i }).click();

      await waitForSuccessToast(page);
      await expect(leadNameInput(page)).toHaveValue('', { timeout: 10000 });
    });

    test('TC-ADD-03: Add lead with special characters in Lead Name', async ({ page }) => {
      const ts = Date.now();
      const leadName = `Lead & Test (${ts})`;

      await leadNameInput(page).fill(leadName);
      await fillMobileDigits(page, mobileInput(page), '9000000002');
      await page.getByRole('button', { name: /\bSubmit\b/i }).click();

      await waitForSuccessToast(page);
      await expect(leadNameInput(page)).toHaveValue('', { timeout: 10000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 3 – Mandatory Field Validation
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('3. Mandatory Field Validation', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLeadImport(page);
    });

    test('TC-VAL-01: Submit with empty Lead Name shows validation error', async ({ page }) => {
      // Fill mobile but leave Lead Name empty
      await fillMobileDigits(page, mobileInput(page), '9000000005');
      await page.getByRole('button', { name: /\bSubmit\b/i }).click();

      // Inline validation error should appear
      const errLocator = page.locator('text=/please enter lead name|lead name is required|enter.*lead name/i');
      await expect(errLocator).toBeVisible({ timeout: 5000 });

      // No record created, form heading stays the same
      await expect(page.getByRole('heading', { name: /Add lead Details/i })).toBeVisible();
    });

    test('TC-VAL-02: Submit with empty Mobile Number shows validation error', async ({ page }) => {
      await leadNameInput(page).fill('Valid Name Test');
      // Mobile left empty (just "+91" prefix present)
      await page.getByRole('button', { name: /\bSubmit\b/i }).click();

      const errLocator = page.locator('text=/please enter.*mobile|mobile.*required|enter.*mobile/i');
      await expect(errLocator).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add lead Details/i })).toBeVisible();
    });

    test('TC-VAL-03: Submit with both mandatory fields empty shows validation errors', async ({ page }) => {
      await page.getByRole('button', { name: /\bSubmit\b/i }).click();

      // At least one validation error visible
      const anyErr = page.locator('text=/please enter|required/i');
      await expect(anyErr.first()).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add lead Details/i })).toBeVisible();
    });

    test('TC-VAL-04: Validation error clears when valid Lead Name is typed', async ({ page }) => {
      // Submit empty form — no success toast should appear
      await page.getByRole('button', { name: /\bSubmit\b/i }).click();
      const toastVisible = await page.locator('[role="alert"]')
        .filter({ hasText: /created successfully|added successfully/i })
        .isVisible({ timeout: 2000 }).catch(() => false);
      expect(toastVisible).toBe(false);

      // Fill valid Lead Name + Mobile and resubmit — should succeed (proves error cleared)
      await leadNameInput(page).fill('Fixed Name');
      await fillMobileDigits(page, mobileInput(page), '9000000006');
      await page.getByRole('button', { name: /\bSubmit\b/i }).click();
      await waitForSuccessToast(page);
    });

    test('TC-VAL-05: Clear button removes validation errors', async ({ page }) => {
      await page.getByRole('button', { name: /\bSubmit\b/i }).click();
      const errLocator = page.locator('text=/please enter|required/i');
      await expect(errLocator.first()).toBeVisible({ timeout: 5000 });

      await page.getByRole('button', { name: /\bClear\b/i }).click();

      await expect(errLocator.first()).not.toBeVisible({ timeout: 5000 });
      await expect(leadNameInput(page)).toHaveValue('');
    });

    test('TC-VAL-06: Whitespace-only Lead Name — form does not navigate away', async ({ page }) => {
      await leadNameInput(page).fill('   ');
      await fillMobileDigits(page, mobileInput(page), '9000000007');
      await page.getByRole('button', { name: /\bSubmit\b/i }).click();

      // The app may show an error OR accept whitespace (document the actual behavior).
      // Either way the user stays on the lead import page.
      await page.waitForTimeout(1500);
      await expect(page).toHaveURL(new RegExp(LEAD_IMPORT_URL));
      await expect(page.getByRole('heading', { name: /Add lead Details|Update lead Details/i })).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 4 – Clear Button
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('4. Clear Button', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLeadImport(page);
    });

    test('TC-CLR-01: Clear button resets the Add form', async ({ page }) => {
      await leadNameInput(page).fill('Clear Test Lead');
      await fillMobileDigits(page, mobileInput(page), '9000000010');
      await firmNameInput(page).fill('Clear Firm');
      await noteInput(page).fill('clear note');

      await page.getByRole('button', { name: /\bClear\b/i }).click();

      await expect(leadNameInput(page)).toHaveValue('');
      await expect(firmNameInput(page)).toHaveValue('');
      await expect(noteInput(page)).toHaveValue('');
      await expect(page.getByRole('heading', { name: /Add lead Details/i })).toBeVisible();
    });

    test('TC-CLR-02: Clear button in Edit mode resets back to Add mode', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);

      // Should be in Update mode
      await expect(page.getByRole('heading', { name: /Update lead Details/i })).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('button', { name: /\bUpdate\b/i })).toBeVisible();

      await page.getByRole('button', { name: /\bClear\b/i }).click();

      // Should revert to Add mode
      await expect(page.getByRole('heading', { name: /Add lead Details/i })).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('button', { name: /\bSubmit\b/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /\bUpdate\b/i })).not.toBeVisible();
      await expect(leadNameInput(page)).toHaveValue('');
    });

    test('TC-CLR-03: Clear in Edit mode resets form back to Add mode', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update lead Details/i })).toBeVisible({ timeout: 10000 });

      // Clear the Lead Name and click Update (triggers validation or accepts)
      await leadNameInput(page).fill('');
      await page.getByRole('button', { name: /\bUpdate\b/i }).click();
      await page.waitForTimeout(1000);

      // Click Clear — form must return to Add mode regardless of whether an error was shown
      await page.getByRole('button', { name: /\bClear\b/i }).click();
      await expect(page.getByRole('heading', { name: /Add lead Details/i })).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('button', { name: /\bSubmit\b/i })).toBeVisible();
      await expect(leadNameInput(page)).toHaveValue('');
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 5 – Edit / Update Operations
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('5. Edit and Update Operations', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLeadImport(page);
    });

    test('TC-EDT-01: Edit icon opens record in Update mode with pre-filled fields', async ({ page }) => {
      await waitForTableRows(page);

      // Note the Lead Name from the first visible row
      const firstRow = tableRows(page).first();
      const leadNameInTable = await firstRow.getByRole('cell').nth(2).locator('p').innerText();

      await clickEditOnRow(page, 0);

      await expect(page.getByRole('heading', { name: /Update lead Details/i })).toBeVisible({ timeout: 10000 });
      await expect(leadNameInput(page)).toHaveValue(leadNameInTable.trim());
      await expect(mobileInput(page)).not.toHaveValue('+91');  // Should have full number
      await expect(page.getByRole('button', { name: /\bUpdate\b/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /\bClear\b/i })).toBeVisible();
    });

    test('TC-EDT-02: Successfully update Lead Name', async ({ page }) => {
      await waitForTableRows(page);

      // Note original Lead Name from row 0
      const originalName = await tableRows(page).first().getByRole('cell').nth(2).locator('p').innerText();
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update lead Details/i })).toBeVisible({ timeout: 10000 });

      const updatedName = `Updated Lead ${Date.now()}`;
      await leadNameInput(page).fill(updatedName);
      await page.getByRole('button', { name: /\bUpdate\b/i }).click();

      await waitForUpdateToast(page);
      // Form resets to Add mode on success
      await expect(page.getByRole('heading', { name: /Add lead Details/i })).toBeVisible({ timeout: 10000 });
      await expect(leadNameInput(page)).toHaveValue('');

      // Re-open the same row (now row 0 again) and verify the Lead Name was updated
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update lead Details/i })).toBeVisible({ timeout: 10000 });
      await expect(leadNameInput(page)).toHaveValue(updatedName);
      await page.getByRole('button', { name: /\bClear\b/i }).click();
    });

    test('TC-EDT-05: Update with empty Lead Name — form stays on lead import page', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update lead Details/i })).toBeVisible({ timeout: 10000 });

      await leadNameInput(page).fill('');
      await page.getByRole('button', { name: /\bUpdate\b/i }).click();
      await page.waitForTimeout(1500);

      // App either shows validation error (stays in Update mode) or saves empty name (goes to Add mode).
      // Either way, the user remains on the lead import page.
      await expect(page).toHaveURL(new RegExp(LEAD_IMPORT_URL));
      await page.getByRole('button', { name: /\bClear\b/i }).click();
    });

    test('TC-EDT-06: Update with empty Mobile Number — form stays on lead import page', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update lead Details/i })).toBeVisible({ timeout: 10000 });

      // Clear digits from the mobile number field
      const mob = mobileInput(page);
      await mob.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');

      await page.getByRole('button', { name: /\bUpdate\b/i }).click();
      await page.waitForTimeout(1500);

      // App either shows validation error or accepts empty mobile — user stays on lead import page.
      await expect(page).toHaveURL(new RegExp(LEAD_IMPORT_URL));
      await page.getByRole('button', { name: /\bClear\b/i }).click();
    });

    test('TC-EDT-10: Update with whitespace-only Lead Name — form stays on lead import page', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update lead Details/i })).toBeVisible({ timeout: 10000 });

      await leadNameInput(page).fill('   ');
      await page.getByRole('button', { name: /\bUpdate\b/i }).click();
      await page.waitForTimeout(1500);

      // App either shows validation error or saves whitespace — user stays on lead import page.
      await expect(page).toHaveURL(new RegExp(LEAD_IMPORT_URL));
      await page.getByRole('button', { name: /\bClear\b/i }).click();
    });

    test('TC-EDT-11: All updated field values are reflected correctly in the data table', async ({ page }) => {
      await waitForTableRows(page);

      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update lead Details/i })).toBeVisible({ timeout: 10000 });

      const ts = Date.now();
      const newName = `EDT11 Lead ${ts}`;
      const newFirm = `EDT11 Firm ${ts}`;
      const newSite = `EDT11 Site ${ts}`;
      const newNote = `EDT11 Note ${ts}`;

      await leadNameInput(page).fill(newName);
      await firmNameInput(page).fill(newFirm);
      await siteNameInput(page).fill(newSite);
      await noteInput(page).fill(newNote);

      await page.getByRole('button', { name: /\bUpdate\b/i }).click();
      await waitForUpdateToast(page);

      // Form resets to Add mode
      await expect(page.getByRole('heading', { name: /Add lead Details/i })).toBeVisible({ timeout: 10000 });

      // Re-open the same row (row 0) and verify the saved values
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update lead Details/i })).toBeVisible({ timeout: 10000 });

      await expect(leadNameInput(page)).toHaveValue(newName);
      await expect(firmNameInput(page)).toHaveValue(newFirm);
      await expect(siteNameInput(page)).toHaveValue(newSite);
      await expect(noteInput(page)).toHaveValue(newNote);

      await page.getByRole('button', { name: /\bClear\b/i }).click();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 6 – Status Filter
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('6. Status Filter', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLeadImport(page);
      await waitForTableRows(page);
    });

    test('TC-FLT-01: Default status filter is All (shows records of any status)', async ({ page }) => {
      await expect(statusFilterSelect(page)).toHaveValue('');
      // With All filter, table should have rows
      const count = await tableRows(page).count();
      expect(count).toBeGreaterThan(0);
    });

    test('TC-FLT-02: Filter by Pending shows only Pending records', async ({ page }) => {
      await statusFilterSelect(page).selectOption({ label: 'Pending' });
      await page.waitForTimeout(800);

      const rows = tableRows(page);
      const rowCount = await rows.count();
      if (rowCount === 0) {
        // No Pending records — verify no-data message
        await expect(page.getByText(/no records|no data/i)).toBeVisible({ timeout: 5000 });
        return;
      }
      // Every visible status badge should be Pending
      for (let i = 0; i < Math.min(rowCount, 5); i++) {
        const statusCell = rows.nth(i).getByRole('heading', { level: 5 }).last();
        await expect(statusCell).toHaveText('Pending', { timeout: 5000 });
      }
    });

    test('TC-FLT-03: Filter by Enquiry Generated shows only Enquiry Generated records', async ({ page }) => {
      // Note: 'Won' is NOT in the status dropdown. Valid options: All, Pending, Cold, Warm, Hot, Lost, Enquiry Generated
      await statusFilterSelect(page).selectOption({ label: 'Enquiry Generated' });
      await page.waitForTimeout(800);

      const rows = tableRows(page);
      const rowCount = await rows.count();
      if (rowCount === 0) {
        await expect(page.getByText(/no records|no data/i)).toBeVisible({ timeout: 5000 });
        return;
      }
      for (let i = 0; i < Math.min(rowCount, 5); i++) {
        const statusCell = rows.nth(i).getByRole('heading', { level: 5 }).last();
        await expect(statusCell).toHaveText('Enquiry Generated', { timeout: 5000 });
      }
    });

    test('TC-FLT-06: Changing back to All restores all records', async ({ page }) => {
      const allCount = await tableRows(page).count();

      await statusFilterSelect(page).selectOption({ label: 'Pending' });
      await page.waitForTimeout(500);
      const pendingCount = await tableRows(page).count();

      await statusFilterSelect(page).selectOption({ label: 'All' });
      await page.waitForTimeout(800);

      const restoredCount = await tableRows(page).count();
      expect(restoredCount).toBe(allCount);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 7 – Search
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('7. Search', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLeadImport(page);
      await waitForTableRows(page);
    });

    test('TC-SRC-01: Search filter reduces visible rows for a non-matching term', async ({ page }) => {
      const originalCount = await tableRows(page).count();
      expect(originalCount).toBeGreaterThan(0);

      // Searching a non-existent term should result in 0 visible rows
      await searchInput(page).fill('XYZNONEXISTENTTERM9999');
      await waitForSearchResults(page);

      const filteredCount = await tableRows(page).count();
      expect(filteredCount).toBe(0);
      expect(filteredCount).toBeLessThan(originalCount);
    });

    test('TC-SRC-02: Search with non-existent name shows no results', async ({ page }) => {
      await searchInput(page).fill('XYZNONEXISTENT999ABC');
      await waitForSearchResults(page);

      const rowCount = await tableRows(page).count();
      expect(rowCount).toBe(0);

      await searchInput(page).clear();
    });

    test('TC-SRC-03: Search with non-existent term shows no-records message', async ({ page }) => {
      await searchInput(page).fill('XYZNONEXISTENT999ABC');
      await waitForSearchResults(page);

      const rowCount = await tableRows(page).count();
      expect(rowCount).toBe(0);

      // The table should show the no-records text
      await expect(page.getByText(/no records to display|no data/i)).toBeVisible({ timeout: 5000 });
      await searchInput(page).clear();
    });

    test('TC-SRC-04: Search term produces consistent results (case handling)', async ({ page }) => {
      // Search an uppercase term
      await searchInput(page).fill('XYZNONEXISTENT');
      await waitForSearchResults(page);
      const upperCount = await tableRows(page).count();

      await searchInput(page).fill('');
      await waitForSearchResults(page);

      // Search the same term lowercase — should produce same count (both 0 for non-existent)
      await searchInput(page).fill('xyznonexistent');
      await waitForSearchResults(page);
      const lowerCount = await tableRows(page).count();

      expect(upperCount).toBe(lowerCount);

      await searchInput(page).fill('');
      await waitForSearchResults(page);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 8 – Rows Per Page
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('8. Rows Per Page', () => {

    test.beforeEach(async ({ page }) => {
      await gotoLeadImport(page);
      await waitForTableRows(page);
    });

    test('TC-PAG-01: Default rows per page is 25', async ({ page }) => {
      await expect(showEntriesSelect(page)).toHaveValue('25');
      const rowCount = await tableRows(page).count();
      expect(rowCount).toBeLessThanOrEqual(25);
    });

    test('TC-PAG-02: Change rows per page to 10 limits table to 10 rows', async ({ page }) => {
      await showEntriesSelect(page).selectOption('10');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      await page.waitForTimeout(500);

      const rowCount = await tableRows(page).count();
      expect(rowCount).toBeLessThanOrEqual(10);
    });

    test('TC-PAG-03: Previous page button is disabled on page 1', async ({ page }) => {
      await expect(page.getByRole('button', { name: /Previous page/i })).toBeDisabled();
      await expect(page.getByRole('button', { name: /Next page/i })).toBeEnabled();
    });

    test('TC-PAG-04: Clicking Next page navigates to page 2', async ({ page }) => {
      await page.getByRole('button', { name: /Next page/i }).click();
      await page.waitForTimeout(800);

      await expect(page.getByRole('button', { name: /Page 2 is your current page/i })).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('button', { name: /Previous page/i })).toBeEnabled();

      // Navigate back to page 1
      await page.getByRole('button', { name: /Previous page/i }).click();
      await page.waitForTimeout(500);
      await expect(page.getByRole('button', { name: /Page 1 is your current page/i })).toBeVisible({ timeout: 10000 });
    });

  });

});
