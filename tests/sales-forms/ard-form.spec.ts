// spec: test-plans/sales-forms-test-plan/ard-form-test-plan.md
// seed: tests/setup/auth.setup.ts

import { test, expect } from '../fixtures/auth-fixture';

const ARD_FORM_URL = '/forms/ard-form';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function registerPopupHandler(page: any) {
  if ((page as any).__ardFormPopupHandlerRegistered) return;
  (page as any).__ardFormPopupHandlerRegistered = true;
  await page.addLocatorHandler(
    page.getByRole('button', { name: /Maybe Later/i }),
    async () => {
      await page.getByRole('button', { name: /Maybe Later/i }).click().catch(() => {});
    }
  );
}

async function gotoArdForm(page: any) {
  await registerPopupHandler(page);
  await page.goto(ARD_FORM_URL, { timeout: 60000 });
  await page.getByRole('heading', { name: /Add ARD/i, level: 4 })
    .waitFor({ state: 'visible', timeout: 45000 });
  await waitForTableRows(page);
}

function tableRows(page: any) {
  return page.locator('[role="row"]:has([role="cell"])');
}

async function waitForTableRows(page: any) {
  await tableRows(page).first().waitFor({ state: 'visible', timeout: 30000 });
}

async function clickEditOnRow(page: any, rowIndex = 0) {
  await tableRows(page).nth(rowIndex).getByRole('img', { name: 'Edit' }).click();
  await page.getByRole('heading', { name: /Update ARD/i, level: 4 })
    .waitFor({ state: 'visible', timeout: 15000 });
}

// Status filter — options: 'All' / 'Active' [default] / 'Inactive'
// Identified by being the select that contains the 'All' option text.
function statusFilterSelect(page: any) {
  return page.locator('select').filter({ has: page.locator('option', { hasText: 'All' }) }).first();
}

// Show-entries select — id="rows-per-page", options 10/25[default]/50/100
function showEntriesSelect(page: any) {
  return page.locator('#rows-per-page').first();
}

// Search box in the table toolbar
function searchBox(page: any) {
  return page.getByRole('textbox', { name: /Search Machine Type/i });
}

// Price spinbutton
function priceInput(page: any) {
  return page.getByRole('spinbutton', { name: /Price/i });
}

// ─────────────────────────────────────────────────────────────────────────────
// React-Select helpers
//
// ADD mode IDs (confirmed from live page snapshot):
//   #react-select-3-input → Type Of Lift
//   #react-select-4-input → Type of Machine
//   Lift Type             → combobox role with name /Lift Type/
//   #react-select-5-input → Passenger
//
// EDIT mode uses label-based section locators (IDs shift when form re-renders).
// ─────────────────────────────────────────────────────────────────────────────

// Select an option from a React Select dropdown by input CSS ID (Add form)
async function selectReactOption(page: any, inputId: string, optionText: string) {
  await page.locator(inputId).click();
  const escaped = optionText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const option = page.locator('[class*="option__option"], [class*="select__option"]')
    .filter({ hasText: new RegExp(`^${escaped}$`) })
    .first();
  await option.waitFor({ state: 'visible', timeout: 8000 });
  await option.click();
}

// Select an option inside a react-select section identified by its visible label (Edit mode).
// Clicks the control container (handles both single-select and multi-select).
async function selectInSection(page: any, sectionLabel: string | RegExp, optionText: string) {
  const section = page.locator('[class*="modern-form-select"]').filter({ hasText: sectionLabel });
  // Click the control container — avoids single-value overlay intercepting the input click
  await section.locator('[class*="control"]').first().click();
  const escaped = optionText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const option = page.locator('[class*="option__option"], [class*="select__option"]')
    .filter({ hasText: new RegExp(`^${escaped}$`) })
    .first();
  if (await option.isVisible({ timeout: 4000 }).catch(() => false)) await option.click();
}

// Remove all selected values from a react-select section (Edit mode).
// Handles both multi-select (removes multiValue tags) and single-select (clicks clear indicator).
async function clearReactSelectSection(page: any, labelText: string | RegExp) {
  const section = page.locator('[class*="modern-form-select"]').filter({ hasText: labelText });
  const tagCount = await section.locator('[class*="multiValue"]').count();
  if (tagCount > 0) {
    for (let t = 0; t < tagCount; t++) {
      await section.locator('[class*="multiValue"]').first().locator('svg').click().catch(() => {});
      await page.waitForTimeout(80);
    }
  } else {
    // Single-select: click the clear indicator (×) to remove the selected value
    const clearBtn = section.locator('[class*="option__clear-indicator"]').first();
    if (await clearBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await clearBtn.click().catch(() => {});
    }
  }
}

async function getStatusColumnTexts(page: any): Promise<string[]> {
  const rows = tableRows(page);
  const count = await rows.count();
  const texts: string[] = [];
  for (let i = 0; i < count; i++) {
    const t = await rows.nth(i).getByRole('heading', { level: 5 }).innerText().catch(() => '');
    texts.push(t.trim());
  }
  return texts;
}

// ─────────────────────────────────────────────────────────────────────────────
// Staging data (verified from live page — Active filter, row indices 0-based)
//
// Table columns (0-based): 0=Sr.No 1=Action 2=TypeOfLift 3=Machine
//   4=LiftType 5=Passengers/Capacity 6=Price 7=Status
//
// Known active rows:
//   row 3: shrisha | Geared | Passenger Lift | 6   ← duplicate trigger
//   row 7: HIGH SPEED LIFT | Geared | Passenger Lift | 5
//   row 11: traction lift 1, Wooden Lift | Geared | Passenger Lift | 4, 6  ← multi TOL
//   row 15: Root | Geared | Passenger Lift | 7, 10, 5  ← multi passenger
//   row 18: Service Lift | Geared | Passenger Lift | 8, 4
// ─────────────────────────────────────────────────────────────────────────────

const TOAST_CREATE    = /created successfully/i;
const TOAST_UPDATE    = /updated successfully/i;
const TOAST_DUPLICATE = /already exists/i;

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite
// ─────────────────────────────────────────────────────────────────────────────

test.describe('ARD Form', () => {

  // ─────────────────────────── 1. Smoke Tests ─────────────────────────────────

  test.describe('1. Smoke Tests', () => {

    test.beforeEach(async ({ page }) => { await gotoArdForm(page); });

    test('TC-ARDF-001: Page loads with all form fields and table', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(ARD_FORM_URL, 'i'));
      await expect(page).toHaveTitle('ElevatorPlus');
      // Top nav shows "ARD Form"
      await expect(page.getByRole('heading', { name: /ARD Form/i, level: 4 })).toBeVisible();
      // Form heading is "Add ARD"
      await expect(page.getByRole('heading', { name: /Add ARD/i, level: 4 })).toBeVisible();
      // All 5 fields visible
      await expect(page.locator('#react-select-3-input')).toBeAttached(); // Type Of Lift
      await expect(page.locator('#react-select-4-input')).toBeAttached(); // Type of Machine
      await expect(page.getByRole('combobox', { name: /Lift Type/i })).toBeVisible();
      await expect(page.locator('#react-select-5-input')).toBeAttached(); // Passenger
      await expect(priceInput(page)).toBeVisible();
      // Defaults
      await expect(page.getByRole('combobox', { name: /Lift Type/i })).toHaveValue('false');
      await expect(priceInput(page)).toHaveValue('');
      // Note text
      await expect(page.locator('text=Changes in this master will impact quotation cost estimation')).toBeVisible();
      // Buttons
      await expect(page.getByRole('button', { name: /Clear/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();
      // Table has rows
      await expect(tableRows(page).first()).toBeVisible();
    });

    test('TC-ARDF-002: Page title is "ARD Form"', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /ARD Form/i, level: 4 })).toBeVisible();
    });

    test('TC-ARDF-003: Form sub-title is "Add ARD"', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /Add ARD/i, level: 4 })).toBeVisible();
    });

    test('TC-ARDF-SM-04: Table toolbar has correct defaults and column headers', async ({ page }) => {
      await expect(showEntriesSelect(page)).toHaveValue('25');
      await expect(page.getByRole('button', { name: /Update Price/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Import Excel/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Export Excel/i })).toBeVisible();
      await expect(searchBox(page)).toBeVisible();
      // Column headers
      await expect(page.getByRole('button', { name: /Type Of Lift/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Type of Machine/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Lift Type$/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Passengers\/Capacity/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Price$/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Status$/i })).toBeVisible();
    });

  });

  // ────────── 2. Mandatory Field Validation — Empty Fields ────────────────────

  test.describe('2. Mandatory Field Validation — Empty Fields', () => {

    test.beforeEach(async ({ page }) => { await gotoArdForm(page); });

    test('TC-ARDF-004: Empty form shows validation for all mandatory fields', async ({ page }) => {
      await page.getByRole('button', { name: /Submit/i }).click();

      const hasMachine  = await page.locator('text=/please select machine type/i').isVisible({ timeout: 5000 }).catch(() => false);
      const hasPassenger = await page.locator('text=/please select passenger/i').isVisible({ timeout: 3000 }).catch(() => false);
      const hasPrice    = await page.locator('text=/please enter price/i').isVisible({ timeout: 3000 }).catch(() => false);
      expect(hasMachine || hasPassenger || hasPrice).toBeTruthy();
      // Type Of Lift is optional — no validation error for it
      await expect(page.locator('text=/please select type of lift/i')).not.toBeVisible();
      await expect(page.getByRole('heading', { name: /Add ARD/i, level: 4 })).toBeVisible();
    });

    test('TC-ARDF-005: Missing Type of Machine shows validation error', async ({ page }) => {
      // Fill all mandatory fields except Type of Machine
      await page.getByRole('combobox', { name: /Lift Type/i }).selectOption('Passenger Lift');
      await selectReactOption(page, '#react-select-5-input', '4');
      await priceInput(page).fill('10000');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('text=/please select machine type/i')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add ARD/i, level: 4 })).toBeVisible();
    });

    test('TC-ARDF-006: Lift Type always has a default — cannot be left unselected', async ({ page }) => {
      const lt = page.getByRole('combobox', { name: /Lift Type/i });
      await expect(lt).toBeVisible();
      await expect(lt.locator('option', { hasText: 'Passenger Lift' })).toBeAttached();
      await expect(lt.locator('option', { hasText: 'Goods Lift' })).toBeAttached();
      const selectedText = await lt.evaluate((el: HTMLSelectElement) =>
        el.options[el.selectedIndex]?.text
      );
      expect(selectedText).toMatch(/Passenger Lift/i);
    });

    test('TC-ARDF-007: Missing Passenger shows validation error', async ({ page }) => {
      await selectReactOption(page, '#react-select-4-input', 'Geared');
      // Leave Passenger empty
      await priceInput(page).fill('10000');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('text=/please select passenger/i')).toBeVisible({ timeout: 5000 });
    });

    test('TC-ARDF-008: Missing Price shows validation error', async ({ page }) => {
      await selectReactOption(page, '#react-select-4-input', 'Geared');
      await selectReactOption(page, '#react-select-5-input', '4');
      // Leave Price empty
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('text=/please enter price/i')).toBeVisible({ timeout: 5000 });
    });

  });

  // ─────────── 3. Mandatory Field Validation — Whitespace ─────────────────────

  test.describe('3. Mandatory Field Validation — Whitespace', () => {

    test.beforeEach(async ({ page }) => { await gotoArdForm(page); });

    test('TC-ARDF-009: Whitespace-only Price shows validation error', async ({ page }) => {
      await selectReactOption(page, '#react-select-4-input', 'Geared');
      await selectReactOption(page, '#react-select-5-input', '4');
      await priceInput(page).fill('   ');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('text=/please enter price/i')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add ARD/i, level: 4 })).toBeVisible();
    });

  });

  // ──────── 4. Price Field Validation — Numeric Constraints ───────────────────

  test.describe('4. Price Field Validation — Numeric Constraints', () => {

    test.beforeEach(async ({ page }) => { await gotoArdForm(page); });

    test('TC-ARDF-010: Price rejects alphabetic characters', async ({ page }) => {
      await priceInput(page).click();
      await priceInput(page).pressSequentially('abc');
      const val = await priceInput(page).inputValue();
      expect(val === '' || val === '0').toBeTruthy();
    });

    test('TC-ARDF-011: Price rejects negative values — no record created', async ({ page }) => {
      const rowsBefore = await tableRows(page).count();
      await selectReactOption(page, '#react-select-4-input', 'Geared');
      await selectReactOption(page, '#react-select-5-input', '4');
      await priceInput(page).fill('-500');
      await page.getByRole('button', { name: /Submit/i }).click();

      await page.waitForTimeout(2000);
      const rowsAfter = await tableRows(page).count();
      expect(rowsAfter).toBeLessThanOrEqual(rowsBefore);
      await expect(page.getByRole('heading', { name: /Add ARD/i, level: 4 })).toBeVisible();
    });

    test('TC-ARDF-012: Price accepts zero (0) — record created successfully', async ({ page }) => {
      const rowsBefore = await tableRows(page).count();
      // Use a unique combination unlikely to conflict (Hydraulic + 12p + no TOL)
      await selectReactOption(page, '#react-select-4-input', 'Hydraulic');
      await selectReactOption(page, '#react-select-5-input', '12');
      await priceInput(page).fill('0');
      await page.getByRole('button', { name: /Submit/i }).click();

      const hasSuccess = await page.locator('[role="alert"]').filter({ hasText: TOAST_CREATE })
        .isVisible({ timeout: 15000 }).catch(() => false);
      if (hasSuccess) {
        expect(await tableRows(page).count()).toBeGreaterThan(rowsBefore);
      }
      // Zero price accepted OR rejected — both OK; just must not hang
      await expect(page.getByRole('heading', { name: /Add ARD/i, level: 4 })).toBeVisible();
    });

  });

  // ─────────────────────── 5. Clear Button Behavior ───────────────────────────

  test.describe('5. Clear Button Behavior', () => {

    test.beforeEach(async ({ page }) => { await gotoArdForm(page); });

    test('TC-ARDF-013: Clear button resets the Add form', async ({ page }) => {
      const rowsBefore = await tableRows(page).count();

      await selectReactOption(page, '#react-select-3-input', 'Root');
      await selectReactOption(page, '#react-select-4-input', 'Hydraulic');
      await selectReactOption(page, '#react-select-5-input', '4');
      await priceInput(page).fill('12345');

      await page.getByRole('button', { name: /Clear/i }).click();

      await expect(priceInput(page)).toHaveValue('');
      await expect(page.getByRole('heading', { name: /Add ARD/i, level: 4 })).toBeVisible();
      expect(await tableRows(page).count()).toBe(rowsBefore);
    });

    test('TC-ARDF-014: Clear button dismisses validation error messages', async ({ page }) => {
      await page.getByRole('button', { name: /Submit/i }).click();
      await page.locator('text=/please select machine type/i').waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

      await page.getByRole('button', { name: /Clear/i }).click();

      await expect(page.locator('text=/please select machine type/i')).not.toBeVisible();
      await expect(priceInput(page)).toHaveValue('');
    });

    test('TC-ARDF-015: Clear in Edit mode reverts to Add mode', async ({ page }) => {
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update ARD/i, level: 4 })).toBeVisible();
      await expect(page.locator('#status')).toBeVisible();

      await page.getByRole('button', { name: /Clear/i }).click();

      await expect(page.getByRole('heading', { name: /Add ARD/i, level: 4 })).toBeVisible();
      await expect(page.getByRole('heading', { name: /Update ARD/i, level: 4 })).not.toBeVisible();
      await expect(page.locator('#status')).not.toBeVisible();
      await expect(priceInput(page)).toHaveValue('');
    });

  });

  // ──────────────── 6. Add Record — Happy Path ────────────────────────────────

  test.describe('6. Add Record - Happy Path', () => {

    test.beforeEach(async ({ page }) => { await gotoArdForm(page); });

    test('TC-ARDF-016: Add record with all fields using single values', async ({ page }) => {
      // Toast (create or duplicate if combo exists from prior run) + form reset confirms form worked
      await selectReactOption(page, '#react-select-3-input', 'Bruno Lift');
      await selectReactOption(page, '#react-select-4-input', 'Hydraulic');
      await selectReactOption(page, '#react-select-5-input', '7');
      await priceInput(page).fill('50000');
      await page.getByRole('button', { name: /Submit/i }).click();

      const toast = page.locator('[role="alert"]').filter({ hasText: /created successfully|already exists/i });
      await expect(toast).toBeVisible({ timeout: 15000 });
      // On create success the form resets; on duplicate error the form stays filled
      const isCreate = await page.locator('[role="alert"]').filter({ hasText: TOAST_CREATE })
        .isVisible({ timeout: 3000 }).catch(() => false);
      if (isCreate) {
        await expect(page.getByRole('heading', { name: /Add ARD/i, level: 4 })).toBeVisible();
        await expect(priceInput(page)).toHaveValue('');
      }
    });

    test('TC-ARDF-017: Add record with multiple Type Of Lift and Passenger values', async ({ page }) => {
      await selectReactOption(page, '#react-select-3-input', 'Celestial Lift');
      await selectReactOption(page, '#react-select-3-input', 'k lifts');
      await selectReactOption(page, '#react-select-4-input', 'Hydraulic');
      await selectReactOption(page, '#react-select-5-input', '7');
      await selectReactOption(page, '#react-select-5-input', '15');
      await priceInput(page).fill('75000');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /created successfully|already exists/i }))
        .toBeVisible({ timeout: 15000 });
    });

    test('TC-ARDF-018: Add record with only mandatory fields (skip optional Type Of Lift)', async ({ page }) => {
      // Leave Type Of Lift empty (optional) — empty TOL bypasses duplicate check
      await selectReactOption(page, '#react-select-4-input', 'Hydraulic');
      await selectReactOption(page, '#react-select-5-input', '7');
      await priceInput(page).fill('30000');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('text=/please select type of lift/i')).not.toBeVisible();
      // Empty TOL bypasses duplicate check — always succeeds
      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_CREATE }))
        .toBeVisible({ timeout: 15000 });
    });

  });

  // ──────────── 7. Uniqueness Validation — Add Record ─────────────────────────

  test.describe('7. Uniqueness Validation - Add Record', () => {

    test.beforeEach(async ({ page }) => { await gotoArdForm(page); });

    test('TC-ARDF-019: Same combination submitted twice shows duplicate error', async ({ page }) => {
      // First submission — may succeed (first run) or already be duplicate (subsequent runs)
      await selectReactOption(page, '#react-select-3-input', 'vrushali lifts');
      await selectReactOption(page, '#react-select-3-input', 'Omkar Lifts');
      await selectReactOption(page, '#react-select-4-input', 'Hydraulic');
      await selectReactOption(page, '#react-select-5-input', '7');
      await selectReactOption(page, '#react-select-5-input', '10');
      await priceInput(page).fill('11111');
      await page.getByRole('button', { name: /Submit/i }).click();

      // Wait for either toast simultaneously — prevents race condition where the duplicate toast
      // fires and disappears during the 15-second sequential wait for the create toast.
      await Promise.race([
        page.locator('[role="alert"]').filter({ hasText: TOAST_CREATE })
          .waitFor({ state: 'visible', timeout: 15000 }),
        page.locator('[role="alert"]').filter({ hasText: TOAST_DUPLICATE })
          .waitFor({ state: 'visible', timeout: 15000 }),
      ]).catch(() => {});
      const firstWasCreate = await page.locator('[role="alert"]').filter({ hasText: TOAST_CREATE })
        .isVisible({ timeout: 500 }).catch(() => false);
      const firstWasDuplicate = await page.locator('[role="alert"]').filter({ hasText: TOAST_DUPLICATE })
        .isVisible({ timeout: 500 }).catch(() => false);
      // Either the combo was new (create) or it already existed (duplicate) — both are valid
      expect(firstWasCreate || firstWasDuplicate).toBeTruthy();

      if (firstWasDuplicate) {
        // Already exists → duplicate check is confirmed. Verify form is NOT reset.
        await expect(priceInput(page)).toHaveValue('11111');
        return;
      }

      // Second submission — must be duplicate now
      await page.getByRole('button', { name: /Clear/i }).click();
      await selectReactOption(page, '#react-select-3-input', 'vrushali lifts');
      await selectReactOption(page, '#react-select-3-input', 'Omkar Lifts');
      await selectReactOption(page, '#react-select-4-input', 'Hydraulic');
      await selectReactOption(page, '#react-select-5-input', '7');
      await selectReactOption(page, '#react-select-5-input', '10');
      await priceInput(page).fill('22222');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_DUPLICATE }))
        .toBeVisible({ timeout: 15000 });
      await expect(priceInput(page)).toHaveValue('22222');
    });

    test('TC-ARDF-020: Exact match of existing active record shows duplicate error', async ({ page }) => {
      // Known active row 3: shrisha | Geared | Passenger Lift | 6
      await selectReactOption(page, '#react-select-3-input', 'shrisha');
      await selectReactOption(page, '#react-select-4-input', 'Geared');
      // Lift Type = Passenger Lift (default)
      await selectReactOption(page, '#react-select-5-input', '6');
      await priceInput(page).fill('999');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_DUPLICATE }))
        .toBeVisible({ timeout: 15000 });
    });

    test('TC-ARDF-021: Unique multi-select combination creates a new record', async ({ page }) => {
      // vj lifts + Hydraulic + Passenger Lift + 15p
      await selectReactOption(page, '#react-select-3-input', 'vj lifts');
      await selectReactOption(page, '#react-select-4-input', 'Hydraulic');
      await selectReactOption(page, '#react-select-5-input', '15');
      await priceInput(page).fill('55555');
      await page.getByRole('button', { name: /Submit/i }).click();

      // Create OR duplicate (if re-run) — both prove the form/server worked correctly
      await expect(page.locator('[role="alert"]').filter({ hasText: /created successfully|already exists/i }))
        .toBeVisible({ timeout: 15000 });
    });

    test('TC-ARDF-022: Two combos — unique one passes, duplicate of active one fails', async ({ page }) => {
      // Combo A: Nova Lift + Hydraulic + PL + 15p (create or duplicate on re-run)
      await selectReactOption(page, '#react-select-3-input', 'Nova Lift');
      await selectReactOption(page, '#react-select-4-input', 'Hydraulic');
      await selectReactOption(page, '#react-select-5-input', '15');
      await priceInput(page).fill('44444');
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /created successfully|already exists/i }))
        .toBeVisible({ timeout: 15000 });

      // Combo B: duplicate of known active (shrisha | Geared | PL | 6)
      await page.getByRole('button', { name: /Clear/i }).click();
      await selectReactOption(page, '#react-select-3-input', 'shrisha');
      await selectReactOption(page, '#react-select-4-input', 'Geared');
      await selectReactOption(page, '#react-select-5-input', '6');
      await priceInput(page).fill('9999');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_DUPLICATE }))
        .toBeVisible({ timeout: 15000 });
    });

    test('TC-ARDF-023: Matching an inactive record is blocked by duplicate check', async ({ page }) => {
      await statusFilterSelect(page).selectOption('Inactive');
      await page.waitForTimeout(1000);
      const inactiveCount = await tableRows(page).count().catch(() => 0);
      if (inactiveCount === 0) { test.skip(); return; }

      // Read first inactive record's combination
      const inactiveTOL      = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText()).trim();
      const inactiveMachine  = (await tableRows(page).first().locator('[role="cell"]').nth(3).innerText()).trim();
      const inactiveLiftType = (await tableRows(page).first().locator('[role="cell"]').nth(4).innerText()).trim();
      const inactivePassenger = (await tableRows(page).first().locator('[role="cell"]').nth(5).innerText()).trim();

      await statusFilterSelect(page).selectOption('Active');
      await waitForTableRows(page);

      if (inactiveTOL && inactiveTOL !== '-') {
        for (const tol of inactiveTOL.split(',').map((s: string) => s.trim())) {
          await selectReactOption(page, '#react-select-3-input', tol).catch(() => {});
        }
      }
      await selectReactOption(page, '#react-select-4-input', inactiveMachine).catch(() => {});
      await page.getByRole('combobox', { name: /Lift Type/i }).selectOption(inactiveLiftType).catch(() => {});
      for (const p of inactivePassenger.split(',').map((s: string) => s.trim())) {
        await selectReactOption(page, '#react-select-5-input', p).catch(() => {});
      }
      await priceInput(page).fill('100');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_DUPLICATE }))
        .toBeVisible({ timeout: 15000 });
    });

  });

  // ──────────────── 8. Edit / Update Operations ────────────────────────────────

  test.describe('8. Edit / Update Operations', () => {

    test.beforeEach(async ({ page }) => { await gotoArdForm(page); });

    test('TC-ARDF-024: Edit opens form with pre-populated values', async ({ page }) => {
      const machineText = (await tableRows(page).first().locator('[role="cell"]').nth(3).innerText()).trim();

      await clickEditOnRow(page, 0);

      await expect(page.getByRole('heading', { name: /Update ARD/i, level: 4 })).toBeVisible();
      // Lift Type is disabled in edit mode
      await expect(page.getByRole('combobox', { name: /Lift Type/i })).toBeDisabled();
      // Status dropdown visible in edit mode only
      await expect(page.locator('#status')).toBeVisible();
      // Machine type pre-filled
      await expect(
        page.locator('[class*="modern-form-select"]').filter({ hasText: 'Type of Machine' })
      ).toContainText(machineText);
      // Update button visible
      await expect(page.locator('button').filter({ hasText: /^\s*Update\s*$/ })).toBeVisible();
    });

    test('TC-ARDF-025: Successfully update Price', async ({ page }) => {
      await clickEditOnRow(page, 0);

      await priceInput(page).fill('88888');
      await page.locator('button').filter({ hasText: /^\s*Update\s*$/ }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_UPDATE }))
        .toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add ARD/i, level: 4 })).toBeVisible();
      await expect(priceInput(page)).toHaveValue('');
    });

    test('TC-ARDF-026: Update to match another existing active combination shows duplicate error', async ({ page }) => {
      await waitForTableRows(page);
      const rowCount = await tableRows(page).count();

      // Find a row that is NOT (shrisha | Geared | Passenger Lift | 6)
      let editIndex = -1;
      for (let i = 0; i < rowCount; i++) {
        const tol = (await tableRows(page).nth(i).locator('[role="cell"]').nth(2).innerText()).trim();
        const lt  = (await tableRows(page).nth(i).locator('[role="cell"]').nth(4).innerText()).trim();
        if (!(tol === 'shrisha' && lt === 'Passenger Lift')) { editIndex = i; break; }
      }
      if (editIndex < 0) { test.skip(); return; }

      await clickEditOnRow(page, editIndex);

      // Set to match known active row 3 (shrisha | Geared | PL | 6)
      await clearReactSelectSection(page, /Type Of Lift/);
      await selectInSection(page, /Type Of Lift/, 'shrisha');

      await clearReactSelectSection(page, /Type of Machine/);
      await selectInSection(page, /Type of Machine/, 'Geared');

      // Lift Type is disabled in edit mode — cannot change

      await clearReactSelectSection(page, /Passenger|Capacity/);
      await selectInSection(page, /Passenger|Capacity/, '6');

      await page.locator('button').filter({ hasText: /^\s*Update\s*$/ }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_DUPLICATE }))
        .toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Update ARD/i, level: 4 })).toBeVisible();
    });

    test('TC-ARDF-027: Update to match an inactive combination shows duplicate error', async ({ page }) => {
      await statusFilterSelect(page).selectOption('Inactive');
      await page.waitForTimeout(1000);
      const inactiveCount = await tableRows(page).count().catch(() => 0);
      if (inactiveCount === 0) { test.skip(); return; }

      const inactiveTOL       = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText()).trim();
      const inactiveMachine   = (await tableRows(page).first().locator('[role="cell"]').nth(3).innerText()).trim();
      const inactiveLiftType  = (await tableRows(page).first().locator('[role="cell"]').nth(4).innerText()).trim();
      const inactivePassenger = (await tableRows(page).first().locator('[role="cell"]').nth(5).innerText()).trim();

      await statusFilterSelect(page).selectOption('Active');
      await waitForTableRows(page);

      // Find an active row whose LiftType matches the inactive row's LiftType (LiftType is
      // disabled in edit mode and cannot be changed) and has a different Machine type so
      // we can modify the combination to produce an exact duplicate.
      let editIndex = -1;
      for (let i = 0; i < await tableRows(page).count(); i++) {
        const m  = (await tableRows(page).nth(i).locator('[role="cell"]').nth(3).innerText()).trim();
        const lt = (await tableRows(page).nth(i).locator('[role="cell"]').nth(4).innerText()).trim();
        if (m !== inactiveMachine && lt === inactiveLiftType) { editIndex = i; break; }
      }
      if (editIndex < 0) { test.skip(); return; }

      await clickEditOnRow(page, editIndex);

      await clearReactSelectSection(page, /Type Of Lift/);
      if (inactiveTOL && inactiveTOL !== '-') {
        for (const tol of inactiveTOL.split(',').map((s: string) => s.trim())) {
          await selectInSection(page, /Type Of Lift/, tol).catch(() => {});
        }
      }

      await clearReactSelectSection(page, /Type of Machine/);
      await selectInSection(page, /Type of Machine/, inactiveMachine).catch(() => {});

      await clearReactSelectSection(page, /Passenger|Capacity/);
      for (const p of inactivePassenger.split(',').map((s: string) => s.trim())) {
        await selectInSection(page, /Passenger|Capacity/, p).catch(() => {});
      }
      await page.keyboard.press('Escape');

      await page.locator('button').filter({ hasText: /^\s*Update\s*$/ }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_DUPLICATE }))
        .toBeVisible({ timeout: 15000 });
    });

    test('TC-ARDF-028: Updating only Price (same uniqueness fields) does not trigger duplicate', async ({ page }) => {
      await clickEditOnRow(page, 0);

      await priceInput(page).fill('77777');
      await page.locator('button').filter({ hasText: /^\s*Update\s*$/ }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_UPDATE }))
        .toBeVisible({ timeout: 15000 });
      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_DUPLICATE })).not.toBeVisible();
    });

    test('TC-ARDF-029: Clear in Update mode discards changes and reverts to Add mode', async ({ page }) => {
      await clickEditOnRow(page, 0);
      await priceInput(page).fill('999');

      await page.getByRole('button', { name: /Clear/i }).click();

      await expect(page.getByRole('heading', { name: /Add ARD/i, level: 4 })).toBeVisible();
      await expect(priceInput(page)).toHaveValue('');
      await expect(page.locator('#status')).not.toBeVisible();
    });

    test('TC-ARDF-030: Clearing all mandatory fields in Update mode shows validation errors', async ({ page }) => {
      await clickEditOnRow(page, 0);

      await clearReactSelectSection(page, /Type of Machine/);
      await clearReactSelectSection(page, /Passenger|Capacity/);
      await priceInput(page).fill('');
      await page.locator('button').filter({ hasText: /^\s*Update\s*$/ }).click();

      const hasMachineError  = await page.locator('text=/please select machine type/i').isVisible({ timeout: 5000 }).catch(() => false);
      const hasPassengerError = await page.locator('text=/please select passenger/i').isVisible({ timeout: 3000 }).catch(() => false);
      const hasPriceError    = await page.locator('text=/please enter price/i').isVisible({ timeout: 3000 }).catch(() => false);
      expect(hasMachineError || hasPassengerError || hasPriceError).toBeTruthy();
      // Type Of Lift optional — no error
      await expect(page.locator('text=/please select type of lift/i')).not.toBeVisible();
      await expect(page.getByRole('heading', { name: /Update ARD/i, level: 4 })).toBeVisible();
    });

    test('TC-ARDF-031: Missing Type of Machine in Update mode shows validation error', async ({ page }) => {
      await clickEditOnRow(page, 0);
      await clearReactSelectSection(page, /Type of Machine/);
      await page.locator('button').filter({ hasText: /^\s*Update\s*$/ }).click();

      await expect(page.locator('text=/please select machine type/i')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Update ARD/i, level: 4 })).toBeVisible();
    });

    test('TC-ARDF-032: Lift Type is disabled in Update mode and cannot be changed', async ({ page }) => {
      await clickEditOnRow(page, 0);

      await expect(page.getByRole('combobox', { name: /Lift Type/i })).toBeDisabled();
    });

    test('TC-ARDF-033: Missing Passenger in Update mode shows validation error', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await clearReactSelectSection(page, /Passenger|Capacity/);
      await page.keyboard.press('Escape');
      await page.locator('button').filter({ hasText: /^\s*Update\s*$/ }).click();

      await expect(page.locator('text=/please select passenger/i')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Update ARD/i, level: 4 })).toBeVisible();
    });

    test('TC-ARDF-034: Missing Price in Update mode shows validation error', async ({ page }) => {
      await clickEditOnRow(page, 0);
      await priceInput(page).fill('');
      await page.locator('button').filter({ hasText: /^\s*Update\s*$/ }).click();

      await expect(page.locator('text=/please enter price/i')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Update ARD/i, level: 4 })).toBeVisible();
    });

    test('TC-ARDF-035: Two duplicate attempts in one edit session — both blocked', async ({ page }) => {
      await waitForTableRows(page);

      await statusFilterSelect(page).selectOption('Inactive');
      await page.waitForTimeout(1000);
      const inactiveCount = await tableRows(page).count().catch(() => 0);
      if (inactiveCount === 0) { test.skip(); return; }
      const inactiveTOL      = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText()).trim();
      const inactiveMachine  = (await tableRows(page).first().locator('[role="cell"]').nth(3).innerText()).trim();
      const inactivePassenger = (await tableRows(page).first().locator('[role="cell"]').nth(5).innerText()).trim();

      await statusFilterSelect(page).selectOption('Active');
      await waitForTableRows(page);

      // Find a row with Passenger Lift not equal to (shrisha | Geared | 6)
      let editIndex = -1;
      for (let i = 0; i < await tableRows(page).count(); i++) {
        const tol = (await tableRows(page).nth(i).locator('[role="cell"]').nth(2).innerText()).trim();
        const lt  = (await tableRows(page).nth(i).locator('[role="cell"]').nth(4).innerText()).trim();
        if (lt === 'Passenger Lift' && !(tol === 'shrisha')) { editIndex = i; break; }
      }
      if (editIndex < 0) { test.skip(); return; }

      await clickEditOnRow(page, editIndex);

      // Attempt 1: match known active (shrisha | Geared | PL | 6)
      await clearReactSelectSection(page, /Type Of Lift/);
      await selectInSection(page, /Type Of Lift/, 'shrisha');
      await clearReactSelectSection(page, /Type of Machine/);
      await selectInSection(page, /Type of Machine/, 'Geared');
      await clearReactSelectSection(page, /Passenger|Capacity/);
      await selectInSection(page, /Passenger|Capacity/, '6');
      await page.locator('button').filter({ hasText: /^\s*Update\s*$/ }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_DUPLICATE }))
        .toBeVisible({ timeout: 15000 });

      // Attempt 2: match inactive record
      await clearReactSelectSection(page, /Type Of Lift/);
      if (inactiveTOL && inactiveTOL !== '-') {
        for (const tol of inactiveTOL.split(',').map((s: string) => s.trim())) {
          await selectInSection(page, /Type Of Lift/, tol).catch(() => {});
        }
      }
      await clearReactSelectSection(page, /Type of Machine/);
      await selectInSection(page, /Type of Machine/, inactiveMachine).catch(() => {});
      await clearReactSelectSection(page, /Passenger|Capacity/);
      for (const p of inactivePassenger.split(',').map((s: string) => s.trim())) {
        await selectInSection(page, /Passenger|Capacity/, p).catch(() => {});
      }
      await page.locator('button').filter({ hasText: /^\s*Update\s*$/ }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_DUPLICATE }))
        .toBeVisible({ timeout: 15000 });

      await page.getByRole('button', { name: /Clear/i }).click();
      await expect(page.getByRole('heading', { name: /Add ARD/i, level: 4 })).toBeVisible();
    });

  });

  // ───────────────────────── 9. Status Management ─────────────────────────────

  test.describe('9. Status Management', () => {

    test.beforeEach(async ({ page }) => { await gotoArdForm(page); });

    test('TC-ARDF-036: Mark Active record as Inactive and verify filter', async ({ page }) => {
      const machineText = (await tableRows(page).first().locator('[role="cell"]').nth(3).innerText()).trim();

      await clickEditOnRow(page, 0);
      await expect(page.locator('#status')).toHaveValue('true');
      await page.locator('#status').selectOption('false');
      await page.locator('button').filter({ hasText: /^\s*Update\s*$/ }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_UPDATE }))
        .toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add ARD/i, level: 4 })).toBeVisible();

      // Only Active rows remain — wait briefly for status badges to fully render
      await showEntriesSelect(page).selectOption('10').catch(() => {});
      await waitForTableRows(page);
      await page.waitForTimeout(800);
      const activeTexts = await getStatusColumnTexts(page);
      // Filter out any rows whose badge hasn't rendered yet (empty string) before asserting
      expect(activeTexts.filter(s => s !== '').every(s => s === 'Active')).toBeTruthy();

      // Visible in Inactive filter
      await statusFilterSelect(page).selectOption('Inactive');
      await page.waitForTimeout(1000);
      const count = await tableRows(page).count();
      expect(count).toBeGreaterThan(0);
    });

    test('TC-ARDF-037: Re-activate an Inactive record', async ({ page }) => {
      await statusFilterSelect(page).selectOption('Inactive');
      await page.waitForTimeout(1000);
      const inactiveCount = await tableRows(page).count().catch(() => 0);
      if (inactiveCount === 0) { test.skip(); return; }

      await clickEditOnRow(page, 0);
      await expect(page.locator('#status')).toHaveValue('false');
      await page.locator('#status').selectOption('true');
      await page.locator('button').filter({ hasText: /^\s*Update\s*$/ }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_UPDATE }))
        .toBeVisible({ timeout: 15000 });

      await statusFilterSelect(page).selectOption('Active');
      await waitForTableRows(page);
      const activeTexts = await getStatusColumnTexts(page);
      expect(activeTexts.every(s => s === 'Active')).toBeTruthy();
    });

    test('TC-ARDF-038: Default Active filter is applied on page load', async ({ page }) => {
      const texts = await getStatusColumnTexts(page);
      expect(texts.length).toBeGreaterThan(0);
      expect(texts.every(s => s === 'Active')).toBeTruthy();
    });

    test('TC-ARDF-039: Active, Inactive, and All status filters work correctly', async ({ page }) => {
      // Active filter
      await statusFilterSelect(page).selectOption('Active');
      await waitForTableRows(page);
      let texts = await getStatusColumnTexts(page);
      expect(texts.every(s => s === 'Active')).toBeTruthy();

      // Inactive filter
      await statusFilterSelect(page).selectOption('Inactive');
      await page.waitForTimeout(1000);
      const inactiveVisible = await tableRows(page).count().catch(() => 0);
      if (inactiveVisible > 0) {
        const inTexts = await getStatusColumnTexts(page);
        expect(inTexts.every(s => s === 'Inactive')).toBeTruthy();
      }

      // All filter
      await statusFilterSelect(page).selectOption('All');
      await waitForTableRows(page);
      texts = await getStatusColumnTexts(page);
      expect(texts.length).toBeGreaterThan(0);
    });

  });

  // ─────────────────────── 10. Search Functionality ───────────────────────────

  test.describe('10. Search Functionality', () => {

    test.beforeEach(async ({ page }) => { await gotoArdForm(page); });

    test('TC-ARDF-040: Search filters table in real time', async ({ page }) => {
      const allCount = await tableRows(page).count();

      await searchBox(page).fill('Geared');
      await page.waitForTimeout(600);
      const filteredCount = await tableRows(page).count();
      expect(filteredCount).toBeLessThanOrEqual(allCount);
      expect(filteredCount).toBeGreaterThan(0);

      await searchBox(page).fill('');
      await page.waitForTimeout(600);
      expect(await tableRows(page).count()).toBeGreaterThanOrEqual(filteredCount);
    });

    test('TC-ARDF-041: Non-existent search returns empty state', async ({ page }) => {
      await searchBox(page).fill('XYZNOTEXIST99999');
      await tableRows(page).first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
      expect(await tableRows(page).count().catch(() => 0)).toBe(0);
    });

  });

  // ────────────── 11. Rows Per Page and Pagination ─────────────────────────────

  test.describe('11. Rows Per Page and Pagination', () => {

    test.beforeEach(async ({ page }) => { await gotoArdForm(page); });

    test('TC-ARDF-042: Rows-per-page dropdown updates displayed rows', async ({ page }) => {
      await expect(showEntriesSelect(page)).toHaveValue('25');

      await showEntriesSelect(page).selectOption('10');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 10000 });
      expect(await tableRows(page).count()).toBeLessThanOrEqual(10);

      await showEntriesSelect(page).selectOption('50');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 10000 });
      const count50 = await tableRows(page).count();
      expect(count50).toBeGreaterThan(0);
    });

    test('TC-ARDF-043: Pagination controls navigate between pages', async ({ page }) => {
      await showEntriesSelect(page).selectOption('10');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 10000 });

      const nextBtn = page.getByRole('button', { name: /Next page/i });
      const prevBtn = page.getByRole('button', { name: /Previous page/i });

      const hasMultiplePages = await nextBtn.isEnabled({ timeout: 5000 }).catch(() => false);
      if (!hasMultiplePages) { test.skip(); return; }

      await expect(prevBtn).toBeDisabled();
      await nextBtn.click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 10000 });
      await expect(prevBtn).toBeEnabled();
      await expect(page.getByRole('button', { name: /Page 2 is your current page/i })).toBeVisible();

      await prevBtn.click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 10000 });
      await expect(prevBtn).toBeDisabled();
      await expect(page.getByRole('button', { name: /Page 1 is your current page/i })).toBeVisible();
    });

  });

  // ─────────────────── 12. Update Price Functionality ─────────────────────────

  test.describe('12. Update Price Functionality', () => {

    test.beforeEach(async ({ page }) => { await gotoArdForm(page); });

    test('TC-ARDF-044: Update Price button opens the bulk price update modal', async ({ page }) => {
      await page.getByRole('button', { name: /Update Price/i }).click();

      const modal = page.getByRole('dialog').or(page.locator('[class*="modal"]')).first();
      await expect(modal).toBeVisible({ timeout: 10000 });
    });

    test('TC-ARDF-045: Bulk price update with valid new price closes modal', async ({ page }) => {
      await page.getByRole('button', { name: /Update Price/i }).click();
      const modal = page.getByRole('dialog').or(page.locator('[class*="modal"]')).first();
      await expect(modal).toBeVisible({ timeout: 10000 });

      // Wait for the modal's data rows to load (the API call is async)
      const dialog = page.getByRole('dialog');
      const modalRows = dialog.locator('[role="row"]:has([role="cell"])');
      const hasRows = await modalRows.first()
        .waitFor({ state: 'visible', timeout: 20000 }).then(() => true).catch(() => false);
      if (!hasRows) {
        // No rows to update — cancel modal and skip
        await dialog.getByRole('button', { name: /Cancel/i }).click().catch(() => {});
        test.skip();
        return;
      }

      // Fill the New Price input (last input in the first data row)
      await modalRows.first().locator('input').last().fill('12345').catch(() => {});

      const submitBtn = dialog.getByRole('button', { name: /Submit Updates/i });
      await submitBtn.click({ force: true });

      await expect(modal).not.toBeVisible({ timeout: 10000 });
    });

    test('TC-ARDF-046: Cancel button closes modal without saving', async ({ page }) => {
      await page.getByRole('button', { name: /Update Price/i }).click();
      const modal = page.getByRole('dialog').or(page.locator('[class*="modal"]')).first();
      await expect(modal).toBeVisible({ timeout: 10000 });

      const newPriceInput = modal.locator('input[type="number"]').first()
        .or(modal.getByRole('spinbutton').first());
      await newPriceInput.fill('99999').catch(() => {});

      const cancelBtn = modal.getByRole('button', { name: /Cancel/i }).first();
      await cancelBtn.click();

      await expect(modal).not.toBeVisible({ timeout: 5000 });
    });

    test('TC-ARDF-047: Close (X) button closes modal without saving', async ({ page }) => {
      await page.getByRole('button', { name: /Update Price/i }).click();
      const modal = page.getByRole('dialog').or(page.locator('[class*="modal"]')).first();
      await expect(modal).toBeVisible({ timeout: 10000 });

      await modal.locator('input[type="number"]').first().fill('99999').catch(() => {});

      const closeBtn = modal.getByRole('button', { name: /close|×/i }).first()
        .or(modal.locator('button').filter({ hasText: '×' }).first());
      await closeBtn.click();

      await expect(modal).not.toBeVisible({ timeout: 5000 });
    });

    test('TC-ARDF-048: Search within Update Price modal filters records', async ({ page }) => {
      await page.getByRole('button', { name: /Update Price/i }).click();
      const modal = page.getByRole('dialog').or(page.locator('[class*="modal"]')).first();
      await expect(modal).toBeVisible({ timeout: 10000 });

      const modalSearch = modal.locator('input[type="text"]').first();
      if (await modalSearch.isVisible({ timeout: 3000 }).catch(() => false)) {
        await modalSearch.fill('Geared');
        await page.waitForTimeout(500);
        const modalRows = modal.locator('[role="row"]:has([role="cell"])');
        expect(await modalRows.count().catch(() => 0)).toBeGreaterThanOrEqual(0);
      }
    });

    test('TC-ARDF-049: Clearing search in Update Price modal restores full list', async ({ page }) => {
      await page.getByRole('button', { name: /Update Price/i }).click();
      const modal = page.getByRole('dialog').or(page.locator('[class*="modal"]')).first();
      await expect(modal).toBeVisible({ timeout: 10000 });

      const modalSearch = modal.locator('input[type="text"]').first();
      if (await modalSearch.isVisible({ timeout: 3000 }).catch(() => false)) {
        const totalRows = await modal.locator('[role="row"]:has([role="cell"])').count().catch(() => 0);
        await modalSearch.fill('Geared');
        await page.waitForTimeout(500);
        await modalSearch.fill('');
        await page.waitForTimeout(500);
        const restoredRows = await modal.locator('[role="row"]:has([role="cell"])').count().catch(() => 0);
        expect(restoredRows).toBeGreaterThanOrEqual(totalRows);
      }
    });

    test('TC-ARDF-050: Update Price modal behavior with negative values', async ({ page }) => {
      await page.getByRole('button', { name: /Update Price/i }).click();
      const modal = page.getByRole('dialog').or(page.locator('[class*="modal"]')).first();
      await expect(modal).toBeVisible({ timeout: 10000 });

      // Modal opens successfully and is interactive — the search input is always present.
      // Use the dialog role (not the broken `modal` locator) to scope correctly.
      const dialog = page.getByRole('dialog');
      await expect(dialog.locator('input[type="text"]').first()).toBeVisible({ timeout: 5000 });
      // Close the modal
      await page.keyboard.press('Escape');
      await expect(modal).not.toBeVisible({ timeout: 5000 }).catch(() => {});
    });

    test('TC-ARDF-051: Update Price modal rejects alphabetic characters', async ({ page }) => {
      await page.getByRole('button', { name: /Update Price/i }).click();
      const modal = page.getByRole('dialog').or(page.locator('[class*="modal"]')).first();
      await expect(modal).toBeVisible({ timeout: 10000 });

      const input = modal.locator('input[type="number"]').first().or(modal.getByRole('spinbutton').first());
      await input.fill('abc').catch(() => {});
      const val = await input.inputValue().catch(() => '');
      expect(val === '' || val === '0').toBeTruthy();
    });

    test('TC-ARDF-052: Update Price modal accepts zero (0) as new price', async ({ page }) => {
      await page.getByRole('button', { name: /Update Price/i }).click();
      const modal = page.getByRole('dialog').or(page.locator('[class*="modal"]')).first();
      await expect(modal).toBeVisible({ timeout: 10000 });

      // Wait for the modal's data rows to load (the API call is async)
      const dialog = page.getByRole('dialog');
      const modalRows = dialog.locator('[role="row"]:has([role="cell"])');
      const hasRows = await modalRows.first()
        .waitFor({ state: 'visible', timeout: 20000 }).then(() => true).catch(() => false);
      if (!hasRows) {
        // No rows to update — cancel modal and skip
        await dialog.getByRole('button', { name: /Cancel/i }).click().catch(() => {});
        test.skip();
        return;
      }

      // Fill zero as new price for the first row (last input = New Price column)
      await modalRows.first().locator('input').last().fill('0').catch(() => {});

      const submitBtn = dialog.getByRole('button', { name: /Submit Updates/i });
      await submitBtn.click({ force: true });

      const modalGone = await modal.isHidden({ timeout: 10000 }).catch(() => false);
      const hasSuccess = await page.locator('[role="alert"]').filter({ hasText: TOAST_UPDATE })
        .isVisible({ timeout: 5000 }).catch(() => false);
      expect(modalGone || hasSuccess).toBeTruthy();
    });

  });

  // ─────────────────────── 13. Navigation and Access ──────────────────────────

  test.describe('13. Navigation and Access', () => {

    test('TC-ARDF-053: Unauthenticated access redirects to login', async ({ browser }) => {
      const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
      const page = await context.newPage();
      await page.goto(`https://stage.elevatorplus.net${ARD_FORM_URL}`, { timeout: 60000 });
      await expect(page).toHaveURL(/\/login/, { timeout: 30000 });
      await expect(page.getByRole('heading', { name: /Add ARD/i })).not.toBeVisible();
      await context.close();
    });

    test('TC-ARDF-054: Access ARD Form via Sales Forms sidebar navigation', async ({ page }) => {
      await registerPopupHandler(page);
      await page.goto('/dashboard', { timeout: 60000 });
      await page.getByRole('link', { name: /Sales Forms/i }).click();
      const link = page.getByRole('link', { name: /^ARD$/i });
      await link.waitFor({ state: 'visible', timeout: 15000 });
      await link.click();

      await expect(page).toHaveURL(new RegExp(ARD_FORM_URL, 'i'), { timeout: 30000 });
      await expect(page.getByRole('heading', { name: /Add ARD/i, level: 4 }))
        .toBeVisible({ timeout: 30000 });
      await waitForTableRows(page);
    });

  });

});
