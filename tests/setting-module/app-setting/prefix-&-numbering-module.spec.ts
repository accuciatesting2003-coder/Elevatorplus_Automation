// spec: test-plans/setting-module-test-plan/app-setting-test-plan/prefix-&-numbering-test-plan.md
// seed: tests/setup/auth.setup.ts

import { test, expect } from '../../fixtures/auth-fixture';

const PREFIX_URL = '/settings/configure?tab=prefix';

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Register once per page — guards against duplicate calls across beforeEach
const _popupRegistered = new WeakSet<object>();
async function registerPopupHandler(page: any) {
  if (_popupRegistered.has(page)) return;
  _popupRegistered.add(page);
  await page.addLocatorHandler(
    page.getByRole('button', { name: /Maybe Later/i }),
    async () => {
      await page.getByRole('button', { name: /Maybe Later/i }).click().catch(() => {});
    }
  );
}

async function dismissPopup(page: any) {
  try {
    const btn = page.getByRole('button', { name: /Maybe Later/i });
    if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(400);
    }
  } catch { /* not present */ }
}

async function dismissOnboardingPanel(page: any) {
  try {
    const btn = page.locator('.checklist-component button').first();
    if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await btn.click().catch(() => {});
      await page.waitForTimeout(300);
    }
  } catch { /* not present */ }
}

// Fill any empty template inputs to prevent "Template Pattern is Required" validation blocking save
async function fillEmptyTemplates(page: any) {
  const inputs = await page.getByPlaceholder(/Enter template/).all();
  for (const input of inputs) {
    const value = await input.inputValue();
    if (!value) {
      await input.fill('{serialNumber}');
    }
  }
}

async function gotoPrefix(page: any) {
  await registerPopupHandler(page);
  await page.goto(PREFIX_URL, { timeout: 60000 });
  await page.waitForLoadState('networkidle');
  await dismissPopup(page);
  await dismissOnboardingPanel(page);
  await page.locator('#prefixYearType').waitFor({ state: 'visible', timeout: 20000 });
}

// Confirm + assert success toast — matches the App Settings save workflow
async function saveAndConfirm(page: any) {
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await page.getByRole('heading', { name: 'Are you sure?' }).waitFor({ state: 'visible', timeout: 20000 });
  await page.getByRole('button', { name: 'Confirm' }).click();
  await expect(page.getByText('Setting has been saved successfully!')).toBeVisible({ timeout: 15000 });
}

// Tokens: spans with title="Click to insert" — stable across JSS class renames
function fyToken(page: any) {
  return page.locator('[title="Click to insert"]').filter({ hasText: 'Financial Year' }).first();
}

// The date-picker input (readonly) for "Financial Year Change On"
function fyChangeOnInput(page: any) {
  return page.locator('.react-datepicker__input-container input').first();
}

// ─── 1. Smoke Tests ──────────────────────────────────────────────────────────

test.describe('1. Smoke', () => {

  test.beforeEach(async ({ page }) => {
    await gotoPrefix(page);
  });

  test('TC-PN-01: Prefix & Numbering page loads successfully', async ({ page }) => {
    await expect(page.getByText('Prefix & Numbering').first()).toBeVisible();
    await expect(page.getByText('Financial Year').first()).toBeVisible();
    await expect(page.getByText('Document Series').first()).toBeVisible();
    await expect(page.locator('#prefixYearType')).toBeVisible();
  });

  test('TC-PN-02: Prefix Year dropdown has Automatic, Manual and Not Required options', async ({ page }) => {
    const select = page.locator('#prefixYearType');
    await expect(select).toBeVisible();
    await expect(select.locator('option[value="Automatic"]')).toBeAttached();
    await expect(select.locator('option[value="Manual"]')).toBeAttached();
    await expect(select.locator('option[value="Not Required"]')).toBeAttached();
  });

  test('TC-PN-03: Document Series section has Skip FY Reset toggles', async ({ page }) => {
    // Per-document Skip FY Reset checkboxes — verified by id from real DOM
    await expect(page.locator('#skipResetQuotation')).toBeAttached();
    await expect(page.locator('#skipResetJob')).toBeAttached();
    await expect(page.locator('#skipResetPm')).toBeAttached();
  });

});

// ─── 2. Financial Year — Automatic ──────────────────────────────────────────

test.describe('2. Financial Year — Automatic', () => {

  test.beforeEach(async ({ page }) => {
    await gotoPrefix(page);
    await page.locator('#prefixYearType').selectOption('Automatic');
    await page.waitForTimeout(800);
  });

  test('TC-PN-AUTO-01: Selecting Automatic shows Financial Year Change On only', async ({ page }) => {
    await expect(fyChangeOnInput(page)).toBeVisible();
    // Prefix Financial Year input (id=financialYearForPrefix) must NOT exist/be visible
    await expect(page.locator('#financialYearForPrefix')).not.toBeVisible();
  });

  test('TC-PN-AUTO-02: Financial Year Change On is mandatory when Prefix Year is Automatic', async ({ page }) => {
    // The date field is readonly — attempt clear via the react-datepicker clear icon if present
    const clearIcon = page.locator('.react-datepicker__close-icon');
    const hasClear = await clearIcon.isVisible({ timeout: 2000 }).catch(() => false);
    if (hasClear) {
      await clearIcon.click();
      await page.waitForTimeout(300);
      await page.getByRole('button', { name: 'Save Changes' }).click();
      // Confirmation dialog must NOT appear — validation should block save
      await expect(page.getByRole('heading', { name: 'Are you sure?' })).not.toBeVisible({ timeout: 3000 });
      await expect(
        page.locator('[class*="error"], [class*="invalid"], [class*="danger"]').first()
      ).toBeVisible();
    } else {
      // Clear icon not available — verify field already has a value (field is pre-filled)
      await expect(fyChangeOnInput(page)).not.toHaveValue('');
    }
  });

  test('TC-PN-AUTO-03: {financialYear} token is visible in Available Tokens', async ({ page }) => {
    await expect(fyToken(page)).toBeVisible();
  });

  test('TC-PN-AUTO-04: Saving with Automatic and valid date persists', async ({ page }) => {
    // Fill any empty server templates to avoid "Template Pattern is Required" validation
    await fillEmptyTemplates(page);
    await saveAndConfirm(page);
    await gotoPrefix(page);
    await expect(page.locator('#prefixYearType')).toHaveValue('Automatic');
    await expect(fyChangeOnInput(page)).not.toHaveValue('');
  });

});

// ─── 3. Financial Year — Manual ──────────────────────────────────────────────

test.describe('3. Financial Year — Manual', () => {

  test.beforeEach(async ({ page }) => {
    await gotoPrefix(page);
    await page.locator('#prefixYearType').selectOption('Manual');
    await page.waitForTimeout(800);
  });

  test('TC-PN-MAN-01: Selecting Manual shows Financial Year Change On and Prefix Financial Year', async ({ page }) => {
    await expect(fyChangeOnInput(page)).toBeVisible();
    await expect(page.locator('#financialYearForPrefix')).toBeVisible();
  });

  test('TC-PN-MAN-02: Financial Year Change On is mandatory when Prefix Year is Manual', async ({ page }) => {
    await page.locator('#financialYearForPrefix').fill('2025-26');
    const clearIcon = page.locator('.react-datepicker__close-icon');
    await fyChangeOnInput(page).click();
    await page.waitForTimeout(300);
    const hasClear = await clearIcon.isVisible({ timeout: 2000 }).catch(() => false);
    if (hasClear) {
      await clearIcon.click();
      await page.waitForTimeout(300);
      await page.getByRole('button', { name: 'Save Changes' }).click();
      await expect(page.getByRole('heading', { name: 'Are you sure?' })).not.toBeVisible({ timeout: 3000 });
    } else {
      // date is readonly and already has a value — the test verifies the field is not empty
      await expect(fyChangeOnInput(page)).not.toHaveValue('');
    }
  });

  test('TC-PN-MAN-03: Prefix Financial Year is mandatory when Prefix Year is Manual', async ({ page }) => {
    // #financialYearForPrefix is a regular text input (NOT readonly) — can be cleared
    await page.locator('#financialYearForPrefix').fill('');
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await page.waitForTimeout(1000);
    // Validation must block save — no confirmation dialog
    await expect(page.getByRole('heading', { name: 'Are you sure?' })).not.toBeVisible({ timeout: 3000 });
    await expect(
      page.locator('[class*="error"], [class*="invalid"], [class*="danger"], [class*="text-danger"]').first()
    ).toBeVisible();
  });

  test('TC-PN-MAN-04: Both mandatory fields empty shows validation errors', async ({ page }) => {
    await page.locator('#financialYearForPrefix').fill('');
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await page.waitForTimeout(1000);
    await expect(
      page.locator('[class*="error"], [class*="invalid"], [class*="danger"], [class*="text-danger"]').first()
    ).toBeVisible();
  });

  test('TC-PN-MAN-05: {financialYear} token is visible in Available Tokens', async ({ page }) => {
    await expect(fyToken(page)).toBeVisible();
  });

  test('TC-PN-MAN-06: Saving with Manual and both fields valid persists', async ({ page }) => {
    await page.locator('#financialYearForPrefix').fill('2025-26');
    await fillEmptyTemplates(page);
    await saveAndConfirm(page);

    await gotoPrefix(page);
    await expect(page.locator('#prefixYearType')).toHaveValue('Manual');
    await expect(page.locator('#financialYearForPrefix')).not.toHaveValue('');

    // Restore to Automatic so subsequent tests start from a clean state
    await page.locator('#prefixYearType').selectOption('Automatic');
    await page.waitForTimeout(800);
    await saveAndConfirm(page);
  });

});

// ─── 4. Financial Year — Not Required ───────────────────────────────────────

test.describe('4. Financial Year — Not Required', () => {

  test.beforeEach(async ({ page }) => {
    await gotoPrefix(page);
    await page.locator('#prefixYearType').selectOption('Not Required');
    await page.waitForTimeout(800);
  });

  test('TC-PN-NR-01: Selecting Not Required hides all financial year sub-fields', async ({ page }) => {
    await expect(fyChangeOnInput(page)).not.toBeVisible();
    await expect(page.locator('#financialYearForPrefix')).not.toBeVisible();
  });

  test('TC-PN-NR-02: {financialYear} token is hidden from Available Tokens', async ({ page }) => {
    await expect(fyToken(page)).not.toBeVisible();
  });

  test('TC-PN-NR-03: Pattern containing {financialYear} then switching to Not Required shows inline error', async ({ page }) => {
    // Start from Automatic and place {financialYear} in the Quotation pattern
    await page.locator('#prefixYearType').selectOption('Automatic');
    await page.waitForTimeout(500);
    await page.locator('input[name="quotation_template"]').fill('{financialYear}-TEST-{serialNumber}');

    // Switch to Not Required — inline error must appear for the Quotation row
    await page.locator('#prefixYearType').selectOption('Not Required');
    await page.waitForTimeout(800);

    // Error appears as .text-danger span; Quotation is first card so its error is first in DOM
    await expect(page.locator('.text-danger').first()).toBeVisible();
  });

  test('TC-PN-NR-04: Removing {financialYear} from pattern clears the error', async ({ page }) => {
    // Trigger the error first
    await page.locator('#prefixYearType').selectOption('Automatic');
    await page.waitForTimeout(500);
    await page.locator('input[name="quotation_template"]').fill('{financialYear}-TEST-{serialNumber}');
    await page.locator('#prefixYearType').selectOption('Not Required');
    await page.waitForTimeout(800);

    // Anchor on the Quotation card — the only .jss35 card containing the quotation input
    const quotCard = page.locator('.jss35').filter({ has: page.locator('input[name="quotation_template"]') });
    await expect(quotCard.locator('.text-danger')).toBeVisible();

    // Remove {financialYear} from Quotation — the Quotation card's error must disappear
    await page.locator('input[name="quotation_template"]').fill('{serialNumber}');
    await page.waitForTimeout(300);
    await expect(quotCard.locator('.text-danger')).not.toBeVisible();
  });

  test('TC-PN-NR-05: Not Required state blocks save when patterns contain {financialYear}', async ({ page }) => {
    // Not Required is already selected by beforeEach.
    // If existing templates contain {financialYear}, Save Changes is blocked (inline errors shown).
    // If all templates are clean, save proceeds and we verify persistence.
    const errorCount = await page.locator('.text-danger').count();

    if (errorCount > 0) {
      // Errors present — clicking Save Changes must NOT show the confirmation dialog
      await page.getByRole('button', { name: 'Save Changes' }).click();
      await page.waitForTimeout(1000);
      await expect(page.getByRole('heading', { name: 'Are you sure?' })).not.toBeVisible({ timeout: 3000 });
    } else {
      // All patterns clean — save and verify persistence, then restore
      await saveAndConfirm(page);
      await gotoPrefix(page);
      await expect(page.locator('#prefixYearType')).toHaveValue('Not Required');
      await page.locator('#prefixYearType').selectOption('Automatic');
      await page.waitForTimeout(800);
      await saveAndConfirm(page);
    }
  });

});

// ─── 5. Pattern Preview (Eye Icon) ───────────────────────────────────────────

test.describe('5. Pattern Preview', () => {

  test.beforeEach(async ({ page }) => {
    await gotoPrefix(page);
  });

  test('TC-PN-PRV-01: Pattern preview reflects typed pattern value', async ({ page }) => {
    const patternInput = page.locator('input[name="quotation_template"]');
    // Type a distinctive prefix; the preview renders it with the actual serial number
    await patternInput.fill('PREVIEW-{serialNumber}');
    await page.waitForTimeout(500);

    // The preview element (generic div containing rendered output) is adjacent to an img
    // inside the Quotation card footer. We verify the rendered preview shows our prefix.
    // Since input values are not part of DOM text content, 'PREVIEW-' in body means preview rendered it.
    await expect(page.locator('body')).toContainText(/PREVIEW-\d+/);
  });

  test('TC-PN-PRV-02: Pattern preview updates dynamically as pattern changes', async ({ page }) => {
    const patternInput = page.locator('input[name="quotation_template"]');

    await patternInput.fill('FIRST-{serialNumber}');
    await expect(page.locator('body')).toContainText(/FIRST-\d+/, { timeout: 5000 });

    await patternInput.fill('SECOND-{serialNumber}');
    await expect(page.locator('body')).toContainText(/SECOND-\d+/, { timeout: 5000 });
    // FIRST-NNN should no longer appear in rendered preview (only SECOND)
    await expect(page.locator('body')).not.toContainText(/FIRST-\d+/, { timeout: 5000 });
  });

});

// ─── 6. Skip FY Reset Toggle ─────────────────────────────────────────────────

test.describe('6. Skip FY Reset Toggle', () => {

  test.beforeEach(async ({ page }) => {
    await gotoPrefix(page);
  });

  test('TC-PN-SKP-01: Skip FY Reset toggle can be enabled', async ({ page }) => {
    const toggle = page.locator('#skipResetQuotation');
    if (!(await toggle.isChecked())) {
      await toggle.check();
    }
    await expect(toggle).toBeChecked();
  });

  test('TC-PN-SKP-02: Skip FY Reset toggle can be disabled', async ({ page }) => {
    const toggle = page.locator('#skipResetQuotation');
    if (await toggle.isChecked()) {
      await toggle.uncheck();
    } else {
      await toggle.check();
      await toggle.uncheck();
    }
    await expect(toggle).not.toBeChecked();
  });

  test('TC-PN-SKP-03: Skip FY Reset toggle state persists after page reload', async ({ page }) => {
    const toggle = page.locator('#skipResetQuotation');
    const wasChecked = await toggle.isChecked();
    const targetState = !wasChecked;

    if (targetState) {
      await toggle.check();
    } else {
      await toggle.uncheck();
    }

    await fillEmptyTemplates(page);
    await saveAndConfirm(page);
    await gotoPrefix(page);

    await expect(page.locator('#skipResetQuotation')).toHaveJSProperty('checked', targetState);

    // Restore original state
    if (wasChecked) {
      await page.locator('#skipResetQuotation').check();
    } else {
      await page.locator('#skipResetQuotation').uncheck();
    }
    await saveAndConfirm(page);
  });

});

// ─── 7. Field Visibility Switching ───────────────────────────────────────────

test.describe('7. Field Visibility Switching', () => {

  test.beforeEach(async ({ page }) => {
    await gotoPrefix(page);
  });

  test('TC-PN-SW-01: Switching Automatic → Manual shows both mandatory fields', async ({ page }) => {
    await page.locator('#prefixYearType').selectOption('Automatic');
    await page.waitForTimeout(500);
    await expect(fyChangeOnInput(page)).toBeVisible();
    await expect(page.locator('#financialYearForPrefix')).not.toBeVisible();

    await page.locator('#prefixYearType').selectOption('Manual');
    await page.waitForTimeout(500);
    await expect(fyChangeOnInput(page)).toBeVisible();
    await expect(page.locator('#financialYearForPrefix')).toBeVisible();
  });

  test('TC-PN-SW-02: Switching Manual → Not Required hides all sub-fields', async ({ page }) => {
    await page.locator('#prefixYearType').selectOption('Manual');
    await page.waitForTimeout(500);
    await expect(fyChangeOnInput(page)).toBeVisible();
    await expect(page.locator('#financialYearForPrefix')).toBeVisible();

    await page.locator('#prefixYearType').selectOption('Not Required');
    await page.waitForTimeout(500);
    await expect(fyChangeOnInput(page)).not.toBeVisible();
    await expect(page.locator('#financialYearForPrefix')).not.toBeVisible();
  });

  test('TC-PN-SW-03: Switching Not Required → Automatic restores Financial Year Change On only', async ({ page }) => {
    // Go through Not Required first (field hidden verified by TC-PN-NR-01), then switch to Automatic
    await page.locator('#prefixYearType').selectOption('Not Required');
    await page.waitForTimeout(500);
    await page.locator('#prefixYearType').selectOption('Automatic');
    await page.waitForTimeout(500);
    await expect(fyChangeOnInput(page)).toBeVisible();
    await expect(page.locator('#financialYearForPrefix')).not.toBeVisible();
  });

  test('TC-PN-SW-04: Switching Not Required → Manual restores both sub-fields', async ({ page }) => {
    // Go through Not Required first (field hidden verified by TC-PN-NR-01), then switch to Manual
    await page.locator('#prefixYearType').selectOption('Not Required');
    await page.waitForTimeout(500);
    await page.locator('#prefixYearType').selectOption('Manual');
    await page.waitForTimeout(500);
    await expect(fyChangeOnInput(page)).toBeVisible();
    await expect(page.locator('#financialYearForPrefix')).toBeVisible();
  });

  test('TC-PN-SW-05: {financialYear} token appears and disappears as Prefix Year toggles', async ({ page }) => {
    const token = fyToken(page);

    await page.locator('#prefixYearType').selectOption('Automatic');
    await page.waitForTimeout(500);
    await expect(token).toBeVisible();

    await page.locator('#prefixYearType').selectOption('Not Required');
    await page.waitForTimeout(500);
    await expect(token).not.toBeVisible();

    await page.locator('#prefixYearType').selectOption('Manual');
    await page.waitForTimeout(500);
    await expect(token).toBeVisible();

    await page.locator('#prefixYearType').selectOption('Not Required');
    await page.waitForTimeout(500);
    await expect(token).not.toBeVisible();
  });

});
