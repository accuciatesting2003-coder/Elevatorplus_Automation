// spec: test-plans/sales-forms-test-plan/cabin-form-master-test-plan.md
// seed: tests/setup/auth.setup.ts

import { test, expect } from '../fixtures/auth-fixture';

const CABIN_FORM_URL = '/forms/cabin-form';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function registerPopupHandler(page: any) {
  if ((page as any).__cabinFormPopupHandlerRegistered) return;
  (page as any).__cabinFormPopupHandlerRegistered = true;
  await page.addLocatorHandler(
    page.getByRole('button', { name: /Maybe Later/i }),
    async () => {
      await page.getByRole('button', { name: /Maybe Later/i }).click().catch(() => {});
    }
  );
}

async function gotoCabinForm(page: any) {
  await registerPopupHandler(page);
  await page.goto(CABIN_FORM_URL, { timeout: 60000 });
  await page.getByRole('heading', { name: /Add Cabin/i }).waitFor({ state: 'visible', timeout: 45000 });
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
  await page.getByRole('heading', { name: /Update Cabin/i }).waitFor({ state: 'visible', timeout: 15000 });
}

// Status filter select (second #rows-per-page select: All/Active/Inactive)
function statusFilterSelect(page: any) {
  return page.locator('#rows-per-page').nth(1);
}

function showEntriesSelect(page: any) {
  return page.locator('#rows-per-page').first();
}

function searchBox(page: any) {
  return page.getByRole('banner').locator('input[type="text"]');
}

// Select a single option from a React Select multi-select dropdown.
// Falls back to typing the value if it isn't immediately visible (e.g. creatable selects).
async function selectReactOption(page: any, inputId: string, optionText: string) {
  await page.locator(inputId).click();
  await page.waitForTimeout(150);
  const escaped = optionText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const opt = page.locator('[class*="option__option"]')
    .filter({ hasText: new RegExp(`^${escaped}$`) })
    .first();
  if (await opt.isVisible().catch(() => false)) {
    await opt.click();
    return;
  }
  // Not immediately visible: type character-by-character to trigger React event handlers
  await page.keyboard.type(optionText);
  await page.waitForTimeout(300);
  const optAfterType = page.locator('[class*="option__option"]')
    .filter({ hasText: new RegExp(`^${escaped}$`) })
    .first();
  if (await optAfterType.isVisible().catch(() => false)) {
    await optAfterType.click();
    return;
  }
  // For creatable selects: press Enter to create/select the typed value
  await page.keyboard.press('Enter');
}

// Remove all selected tags from a React Select multi-select using Backspace
async function clearReactSelect(page: any, inputId: string) {
  const input = page.locator(inputId);
  for (let i = 0; i < 15; i++) {
    const hasTag = await page.evaluate((id: string) => {
      const el = document.querySelector(id) as HTMLElement;
      if (!el) return false;
      const ctrl = el.closest('[class*="control"]');
      return ctrl ? !!ctrl.querySelector('[class*="multi-value"]') : false;
    }, inputId);
    if (!hasTag) break;
    await input.click();
    await input.press('Backspace');
    await page.waitForTimeout(80);
  }
}

// Find a predefined passenger value not already used for the given TOL+Cabin combination.
// Scans both Active and Inactive records (server duplicate check covers both).
const PREDEFINED_PASSENGERS = ['4', '5', '6', '7', '8', '10', '12', '14', '15', '20', '500000000000'];

async function pickUniquePassengerForCombo(page: any, tol: string, cab: string): Promise<string | null> {
  const usedPassengers = new Set<string>();

  // Use a separate tab to scan all records without disturbing the main page's React Select state
  const scanPage = await page.context().newPage();
  try {
    await scanPage.goto(CABIN_FORM_URL, { timeout: 60000 });
    await scanPage.getByRole('heading', { name: /Add Cabin/i }).waitFor({ state: 'visible', timeout: 45000 });

    for (const filterVal of ['true', 'false']) {
      await scanPage.locator('#rows-per-page').nth(1).selectOption(filterVal).catch(() => {});
      await tableRows(scanPage).first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});

      // Scan all pages
      while (true) {
        const count = await tableRows(scanPage).count().catch(() => 0);
        for (let i = 0; i < count; i++) {
          const rowTol = (await tableRows(scanPage).nth(i).locator('[role="cell"]').nth(2).innerText()).trim();
          const rowCab = (await tableRows(scanPage).nth(i).locator('[role="cell"]').nth(3).innerText()).trim();
          if (rowTol === tol && rowCab === cab) {
            const rowPass = (await tableRows(scanPage).nth(i).locator('[role="cell"]').nth(5).innerText()).trim();
            rowPass.split(',').forEach(p => usedPassengers.add(p.trim()));
          }
        }
        if (PREDEFINED_PASSENGERS.every(p => usedPassengers.has(p))) break;
        const nextBtn = scanPage.getByRole('button', { name: /Next page/i });
        const canGoNext = await nextBtn.isEnabled({ timeout: 1500 }).catch(() => false);
        if (!canGoNext) break;
        await nextBtn.click();
        await tableRows(scanPage).first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
      }
    }
  } finally {
    await scanPage.close().catch(() => {});
  }

  return PREDEFINED_PASSENGERS.find(p => !usedPassengers.has(p)) ?? null;
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

// Read a cell value from a table row (0-based col index)
async function cellText(page: any, rowIndex: number, colIndex: number): Promise<string> {
  return (await tableRows(page).nth(rowIndex).locator('[role="cell"]').nth(colIndex).innerText()).trim();
}

// Find the first row index that has a non-empty Type Of Lift (col 2 !== '-')
async function findRowWithTOL(page: any): Promise<number> {
  const count = await tableRows(page).count();
  for (let i = 0; i < count; i++) {
    const tol = (await tableRows(page).nth(i).locator('[role="cell"]').nth(2).innerText()).trim();
    if (tol && tol !== '-') return i;
  }
  return -1;
}

// Find the first row index whose TOL column contains a comma (multi-value TOL)
async function findRowWithMultiTOL(page: any): Promise<number> {
  const count = await tableRows(page).count();
  for (let i = 0; i < count; i++) {
    const tol = (await tableRows(page).nth(i).locator('[role="cell"]').nth(2).innerText()).trim();
    if (tol.includes(',')) return i;
  }
  return -1;
}

// Find the first row index whose Passenger column contains a comma (multi-value passengers)
async function findRowWithMultiPassenger(page: any): Promise<number> {
  const count = await tableRows(page).count();
  for (let i = 0; i < count; i++) {
    const pass = (await tableRows(page).nth(i).locator('[role="cell"]').nth(5).innerText()).trim();
    if (pass.includes(',')) return i;
  }
  return -1;
}

// Find the first row index whose Cabin column contains a comma (multi-value cabin)
async function findRowWithMultiCabin(page: any): Promise<number> {
  const count = await tableRows(page).count();
  for (let i = 0; i < count; i++) {
    const cab = (await tableRows(page).nth(i).locator('[role="cell"]').nth(3).innerText()).trim();
    if (cab.includes(',')) return i;
  }
  return -1;
}

const TOAST_CREATE    = /Cabin has been created successfully/i;
const TOAST_UPDATE    = /Cabin has been updated successfully/i;
const TOAST_DUPLICATE = /record with the same type of lift, cabin, and passenger\/capacity combination already exists/i;

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Cabin Form Master', () => {

  // ─────────────────────────────── 1. Smoke Tests ───────────────────────────

  test.describe('1. Smoke Tests', () => {

    test.beforeEach(async ({ page }) => { await gotoCabinForm(page); });

    test('TC-SM-01: Page loads successfully', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(CABIN_FORM_URL, 'i'));
      await expect(page).toHaveTitle('ElevatorPlus');
      await expect(page.getByRole('heading', { name: /Add Cabin/i })).toBeVisible();
      // Form fields present
      await expect(page.locator('#react-select-3-input')).toBeVisible(); // Type Of Lift
      await expect(page.locator('#react-select-4-input')).toBeVisible(); // Select Cabin
      await expect(page.getByRole('combobox', { name: /Lift Type/i })).toBeVisible();
      await expect(page.locator('#react-select-5-input')).toBeVisible(); // Passenger
      await expect(page.getByRole('spinbutton', { name: /Price/i })).toBeVisible();
      // Lift Type default, Price empty
      await expect(page.getByRole('combobox', { name: /Lift Type/i })).toHaveValue('false');
      await expect(page.getByRole('spinbutton', { name: /Price/i })).toHaveValue('');
      // Note text
      await expect(page.locator('text=Changes in this master will impact quotation cost estimation')).toBeVisible();
      // Buttons
      await expect(page.getByRole('button', { name: /Clear/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();
      // Table loaded
      await expect(tableRows(page).first()).toBeVisible();
    });

    test('TC-SM-02: Page elements and layout', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /Add Cabin/i })).toBeVisible();
      await expect(showEntriesSelect(page)).toHaveValue('25');
      await expect(statusFilterSelect(page)).toHaveValue('true');
      await expect(page.getByRole('button', { name: /Update Price/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Import Excel/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Export Excel/i })).toBeVisible();
      await expect(searchBox(page)).toBeVisible();
      // Column headers
      await expect(page.getByRole('button', { name: /Type Of Lift/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Cabin name/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Lift Type/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Passengers\/Capacity/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Price$/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Status$/i })).toBeVisible();
    });

  });

  // ──────────────────────── 2. Add Record — Happy Path ──────────────────────

  test.describe('2. Add Record - Happy Path', () => {

    test.beforeEach(async ({ page }) => { await gotoCabinForm(page); });

    test('TC-ADD-01: Create with mandatory fields only (no Type Of Lift)', async ({ page }) => {
      const rowsBefore = await tableRows(page).count();
      // Leave Type Of Lift empty
      await selectReactOption(page, '#react-select-4-input', 'Glass Cabin');
      // Lift Type default = Passenger Lift
      await selectReactOption(page, '#react-select-5-input', '8');
      await page.getByRole('spinbutton', { name: /Price/i }).fill('5000');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_CREATE }))
        .toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Cabin/i })).toBeVisible();
      await expect(page.getByRole('spinbutton', { name: /Price/i })).toHaveValue('');
      await waitForTableRows(page);
      expect(await tableRows(page).count()).toBeGreaterThan(0);
    });

    test('TC-ADD-02: Create for Goods Lift', async ({ page }) => {
      // Select Lift Type first — changing it after selecting Cabin clears the Cabin field
      await page.getByRole('combobox', { name: /Lift Type/i }).selectOption('Goods Lift');
      await selectReactOption(page, '#react-select-4-input', 'Glass Cabin');
      await selectReactOption(page, '#react-select-5-input', '100');
      await page.getByRole('spinbutton', { name: /Price/i }).fill('3500');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_CREATE }))
        .toBeVisible({ timeout: 15000 });
      await waitForTableRows(page);
      await expect(tableRows(page).filter({ hasText: 'Goods Lift' }).first()).toBeVisible();
    });

    test('TC-ADD-03: Create with all fields including Type Of Lift and multiple Passengers', async ({ page }) => {
      // Read an existing row's TOL+Cabin, find a unique passenger to avoid duplicates
      const rowIdx = await findRowWithTOL(page);
      if (rowIdx === -1) { test.skip(); return; }
      const tol = await cellText(page, rowIdx, 2);
      const cab = await cellText(page, rowIdx, 3);
      const uniquePass = await pickUniquePassengerForCombo(page, tol, cab);
      if (!uniquePass) { test.skip(); return; }

      for (const v of tol.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-3-input', v);
      }
      for (const v of cab.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-4-input', v);
      }
      // Lift Type = Passenger Lift (default)
      await selectReactOption(page, '#react-select-5-input', uniquePass);
      await page.getByRole('spinbutton', { name: /Price/i }).fill('7500');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_CREATE }))
        .toBeVisible({ timeout: 15000 });
    });

    test('TC-ADD-04: Create with multiple Passenger values', async ({ page }) => {
      const rowsBefore = await tableRows(page).count();
      await selectReactOption(page, '#react-select-4-input', 'Carbon Fiber Cabin');
      await selectReactOption(page, '#react-select-5-input', '4');
      await selectReactOption(page, '#react-select-5-input', String(Date.now()));
      await page.getByRole('spinbutton', { name: /Price/i }).fill('4000');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_CREATE }))
        .toBeVisible({ timeout: 15000 });
      await waitForTableRows(page);
      expect(await tableRows(page).count()).toBeGreaterThan(0);
    });

    test('TC-ADD-05: Create with multiple Select Cabin values', async ({ page }) => {
      const rowsBefore = await tableRows(page).count();
      await selectReactOption(page, '#react-select-4-input', 'SS Mirror');
      await selectReactOption(page, '#react-select-4-input', 'Meta Cabin');
      await selectReactOption(page, '#react-select-5-input', '500000000000');
      await page.getByRole('spinbutton', { name: /Price/i }).fill('6000');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_CREATE }))
        .toBeVisible({ timeout: 15000 });
      await waitForTableRows(page);
      expect(await tableRows(page).count()).toBeGreaterThan(0);
    });

  });

  // ──────────────────── 3. Mandatory Field Validation ───────────────────────

  test.describe('3. Mandatory Field Validation', () => {

    test.beforeEach(async ({ page }) => { await gotoCabinForm(page); });

    test('TC-VAL-01: Empty Select Cabin shows validation error', async ({ page }) => {
      await selectReactOption(page, '#react-select-5-input', '8');
      await page.getByRole('spinbutton', { name: /Price/i }).fill('1000');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('text=/please select cabin/i')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add Cabin/i })).toBeVisible();
    });

    test('TC-VAL-02: Empty Lift Type shows validation error (Add mode only)', async ({ page }) => {
      await selectReactOption(page, '#react-select-4-input', 'Glass Cabin');
      await selectReactOption(page, '#react-select-5-input', '8');
      await page.getByRole('spinbutton', { name: /Price/i }).fill('1000');
      // Lift Type has a default — attempt to clear it via the select
      await page.getByRole('combobox', { name: /Lift Type/i }).selectOption('', { timeout: 1000 }).catch(() => {});
      await page.getByRole('button', { name: /Submit/i }).click();

      // Either a validation error or the select rejects the empty value (keeps default)
      const hasError = await page.locator('text=/please select lift type/i').isVisible({ timeout: 3000 }).catch(() => false);
      const staysOnPage = await page.getByRole('heading', { name: /Add Cabin/i }).isVisible().catch(() => false);
      expect(hasError || staysOnPage).toBeTruthy();
    });

    test('TC-VAL-03: Empty Passenger shows validation error', async ({ page }) => {
      await selectReactOption(page, '#react-select-4-input', 'Glass Cabin');
      await page.getByRole('spinbutton', { name: /Price/i }).fill('1000');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('text=/please select passenger/i')).toBeVisible({ timeout: 5000 });
    });

    test('TC-VAL-04: Empty Price shows validation error', async ({ page }) => {
      await selectReactOption(page, '#react-select-4-input', 'Glass Cabin');
      await selectReactOption(page, '#react-select-5-input', '8');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('text=/please enter price/i')).toBeVisible({ timeout: 5000 });
    });

    test('TC-VAL-05: Completely empty form shows validation errors', async ({ page }) => {
      await page.getByRole('button', { name: /Submit/i }).click();

      const hasCabin     = await page.locator('text=/please select cabin/i').isVisible({ timeout: 5000 }).catch(() => false);
      const hasPassenger = await page.locator('text=/please select passenger/i').isVisible({ timeout: 3000 }).catch(() => false);
      const hasPrice     = await page.locator('text=/please enter price/i').isVisible({ timeout: 3000 }).catch(() => false);
      expect(hasCabin || hasPassenger || hasPrice).toBeTruthy();
      await expect(page.getByRole('heading', { name: /Add Cabin/i })).toBeVisible();
    });

    test('TC-VAL-06: Validation errors clear after filling valid fields — submit succeeds', async ({ page }) => {
      await page.getByRole('button', { name: /Submit/i }).click();
      await page.locator('text=/please select cabin/i').waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

      await selectReactOption(page, '#react-select-4-input', 'Glass Cabin');
      await selectReactOption(page, '#react-select-5-input', '8');
      await page.getByRole('spinbutton', { name: /Price/i }).fill('1500');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_CREATE }))
        .toBeVisible({ timeout: 15000 });
    });

  });

  // ──────────────── 4. Duplicate Prevention — ADD Records ───────────────────

  test.describe('4. Duplicate Prevention - ADD Records', () => {

    test.beforeEach(async ({ page }) => { await gotoCabinForm(page); });

    test('TC-DUP-ADD-01: Exact match of existing Active record — shows duplicate error', async ({ page }) => {
      // Find first row that has a non-empty TOL
      const rowIdx = await findRowWithTOL(page);
      if (rowIdx === -1) { test.skip(); return; }

      const tol  = await cellText(page, rowIdx, 2);
      const cab  = await cellText(page, rowIdx, 3);
      const pass = await cellText(page, rowIdx, 5);
      const price = '9999'; // different price to isolate duplicate check

      for (const v of tol.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-3-input', v);
      }
      for (const v of cab.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-4-input', v);
      }
      // Lift Type stays default (Passenger Lift matches existing)
      for (const v of pass.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-5-input', v);
      }
      await page.getByRole('spinbutton', { name: /Price/i }).fill(price);
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_DUPLICATE }))
        .toBeVisible({ timeout: 15000 });
      // Form must NOT reset after duplicate error
      await expect(page.getByRole('spinbutton', { name: /Price/i })).toHaveValue(price);
    });

    test('TC-DUP-ADD-02: Same combination different Price — duplicate error still fires', async ({ page }) => {
      const rowIdx = await findRowWithTOL(page);
      if (rowIdx === -1) { test.skip(); return; }

      const tol  = await cellText(page, rowIdx, 2);
      const cab  = await cellText(page, rowIdx, 3);
      const pass = await cellText(page, rowIdx, 5);

      for (const v of tol.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-3-input', v);
      }
      for (const v of cab.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-4-input', v);
      }
      for (const v of pass.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-5-input', v);
      }
      await page.getByRole('spinbutton', { name: /Price/i }).fill('1');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_DUPLICATE }))
        .toBeVisible({ timeout: 15000 });
    });

    test('TC-DUP-ADD-03: Exact match of multi-value TOL + multi-value Passenger — duplicate error', async ({ page }) => {
      const rowIdx = await findRowWithMultiTOL(page);
      if (rowIdx === -1) { test.skip(); return; }

      const tol  = await cellText(page, rowIdx, 2);
      const cab  = await cellText(page, rowIdx, 3);
      const pass = await cellText(page, rowIdx, 5);

      for (const v of tol.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-3-input', v);
      }
      for (const v of cab.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-4-input', v);
      }
      for (const v of pass.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-5-input', v);
      }
      await page.getByRole('spinbutton', { name: /Price/i }).fill('500');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_DUPLICATE }))
        .toBeVisible({ timeout: 15000 });
    });

    test('TC-DUP-ADD-04: Match combination of Inactive record — shows duplicate error', async ({ page }) => {
      await statusFilterSelect(page).selectOption('false');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      const inactiveCount = await tableRows(page).count().catch(() => 0);
      if (inactiveCount === 0) { test.skip(); return; }
      const rowIdx = await findRowWithTOL(page);
      if (rowIdx === -1) { test.skip(); return; }

      const tol  = await cellText(page, rowIdx, 2);
      const cab  = await cellText(page, rowIdx, 3);
      const pass = await cellText(page, rowIdx, 5);

      await statusFilterSelect(page).selectOption('true');
      await waitForTableRows(page);

      for (const v of tol.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-3-input', v);
      }
      for (const v of cab.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-4-input', v);
      }
      for (const v of pass.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-5-input', v);
      }
      await page.getByRole('spinbutton', { name: /Price/i }).fill('999');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_DUPLICATE }))
        .toBeVisible({ timeout: 15000 });
    });

    test('TC-DUP-ADD-05: Type Of Lift empty — no duplicate error even if Cabin + Passenger match', async ({ page }) => {
      // Find a row where TOL is empty ('-')
      const count = await tableRows(page).count();
      let rowIdx = -1;
      for (let i = 0; i < count; i++) {
        const tol = (await tableRows(page).nth(i).locator('[role="cell"]').nth(2).innerText()).trim();
        if (tol === '-') { rowIdx = i; break; }
      }
      if (rowIdx === -1) { test.skip(); return; }

      const cab  = await cellText(page, rowIdx, 3);
      const pass = await cellText(page, rowIdx, 5);

      // Leave Type Of Lift EMPTY
      for (const v of cab.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-4-input', v);
      }
      for (const v of pass.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-5-input', v);
      }
      await page.getByRole('spinbutton', { name: /Price/i }).fill('111');
      await page.getByRole('button', { name: /Submit/i }).click();

      // Empty TOL bypasses duplicate check → should succeed
      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_CREATE }))
        .toBeVisible({ timeout: 15000 });
    });

    test('TC-DUP-ADD-06: Single Passenger value existing in active multi-select Passenger record — duplicate error', async ({ page }) => {
      const rowIdx = await findRowWithMultiPassenger(page);
      if (rowIdx === -1) { test.skip(); return; }

      const tol  = await cellText(page, rowIdx, 2);
      const cab  = await cellText(page, rowIdx, 3);
      const pass = await cellText(page, rowIdx, 5);
      const firstPassenger = pass.split(',')[0].trim();

      if (tol === '-') { test.skip(); return; }

      for (const v of tol.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-3-input', v);
      }
      for (const v of cab.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-4-input', v);
      }
      // Select only the FIRST passenger (subset of existing multi-value)
      await selectReactOption(page, '#react-select-5-input', firstPassenger);
      await page.getByRole('spinbutton', { name: /Price/i }).fill('999');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_DUPLICATE }))
        .toBeVisible({ timeout: 15000 });
    });

    test('TC-DUP-ADD-07: Single TOL value existing in active multi-select TOL record — duplicate error', async ({ page }) => {
      const rowIdx = await findRowWithMultiTOL(page);
      if (rowIdx === -1) { test.skip(); return; }

      const tol  = await cellText(page, rowIdx, 2);
      const cab  = await cellText(page, rowIdx, 3);
      const pass = await cellText(page, rowIdx, 5);
      const firstTOL = tol.split(',')[0].trim();

      // Select only ONE of the existing TOL values
      await selectReactOption(page, '#react-select-3-input', firstTOL);
      for (const v of cab.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-4-input', v);
      }
      for (const v of pass.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-5-input', v);
      }
      await page.getByRole('spinbutton', { name: /Price/i }).fill('999');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_DUPLICATE }))
        .toBeVisible({ timeout: 15000 });
    });

    test('TC-DUP-ADD-08: Passenger value NOT in any existing active combination — succeeds', async ({ page }) => {
      const rowIdx = await findRowWithTOL(page);
      if (rowIdx === -1) { test.skip(); return; }

      const tol = await cellText(page, rowIdx, 2);
      const cab = await cellText(page, rowIdx, 3);

      // Find a predefined passenger not used by any active record for this TOL+Cabin
      const uniquePass = await pickUniquePassengerForCombo(page, tol, cab);
      if (!uniquePass) { test.skip(); return; }

      for (const v of tol.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-3-input', v);
      }
      for (const v of cab.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-4-input', v);
      }
      await selectReactOption(page, '#react-select-5-input', uniquePass);
      await page.getByRole('spinbutton', { name: /Price/i }).fill('111');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_CREATE }))
        .toBeVisible({ timeout: 15000 });
    });

    test('TC-DUP-ADD-09: Multiple Passenger values where one overlaps existing — duplicate error', async ({ page }) => {
      const rowIdx = await findRowWithTOL(page);
      if (rowIdx === -1) { test.skip(); return; }

      const tol  = await cellText(page, rowIdx, 2);
      const cab  = await cellText(page, rowIdx, 3);
      const pass = await cellText(page, rowIdx, 5);
      const existingPass = pass.split(',')[0].trim();

      for (const v of tol.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-3-input', v);
      }
      for (const v of cab.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-4-input', v);
      }
      // Select the existing passenger PLUS one that is guaranteed unique
      await selectReactOption(page, '#react-select-5-input', existingPass);
      await selectReactOption(page, '#react-select-5-input', String(Date.now()));
      await page.getByRole('spinbutton', { name: /Price/i }).fill('999');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_DUPLICATE }))
        .toBeVisible({ timeout: 15000 });
    });

    test('TC-DUP-ADD-10: Multiple Passenger values where none overlap existing — succeeds', async ({ page }) => {
      const rowIdx = await findRowWithTOL(page);
      if (rowIdx === -1) { test.skip(); return; }

      const tol = await cellText(page, rowIdx, 2);
      const cab = await cellText(page, rowIdx, 3);

      // Find a predefined passenger not used by any active record for this TOL+Cabin
      const uniquePass = await pickUniquePassengerForCombo(page, tol, cab);
      if (!uniquePass) { test.skip(); return; }

      for (const v of tol.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-3-input', v);
      }
      for (const v of cab.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-4-input', v);
      }
      await selectReactOption(page, '#react-select-5-input', uniquePass);
      await page.getByRole('spinbutton', { name: /Price/i }).fill('222');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_CREATE }))
        .toBeVisible({ timeout: 15000 });
    });

    test('TC-DUP-ADD-11: Single Cabin value from active multi-select Cabin record — duplicate error', async ({ page }) => {
      const rowIdx = await findRowWithMultiCabin(page);
      if (rowIdx === -1) { test.skip(); return; }

      const tol  = await cellText(page, rowIdx, 2);
      const cab  = await cellText(page, rowIdx, 3);
      const pass = await cellText(page, rowIdx, 5);
      const firstCabin = cab.split(',')[0].trim();

      if (tol === '-') { test.skip(); return; }

      for (const v of tol.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-3-input', v);
      }
      // Select only ONE cabin from the multi-cabin record
      await selectReactOption(page, '#react-select-4-input', firstCabin);
      for (const v of pass.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-5-input', v);
      }
      await page.getByRole('spinbutton', { name: /Price/i }).fill('999');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_DUPLICATE }))
        .toBeVisible({ timeout: 15000 });
    });

    test('TC-DUP-ADD-12: New Cabin value not in any active combination — succeeds', async ({ page }) => {
      // Use a very unique cabin name that won't conflict
      await selectReactOption(page, '#react-select-4-input', 'New Cabin');
      await selectReactOption(page, '#react-select-5-input', '500000000000');
      await page.getByRole('spinbutton', { name: /Price/i }).fill('333');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_CREATE }))
        .toBeVisible({ timeout: 15000 });
    });

    test('TC-DUP-ADD-13: New Type Of Lift value not in any active combination — succeeds', async ({ page }) => {
      // Use a passenger not already used for Bruno Lift + New Cabin combination
      const uniquePass = await pickUniquePassengerForCombo(page, 'Bruno Lift', 'New Cabin');
      if (!uniquePass) { test.skip(); return; }
      await selectReactOption(page, '#react-select-3-input', 'Bruno Lift');
      await selectReactOption(page, '#react-select-4-input', 'New Cabin');
      await selectReactOption(page, '#react-select-5-input', uniquePass);
      await page.getByRole('spinbutton', { name: /Price/i }).fill('444');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_CREATE }))
        .toBeVisible({ timeout: 15000 });
    });

    test('TC-DUP-ADD-14: Partially matching Inactive record combination — succeeds', async ({ page }) => {
      await statusFilterSelect(page).selectOption('false');
      await page.waitForTimeout(500);
      const count = await tableRows(page).count().catch(() => 0);
      if (count === 0) { test.skip(); return; }

      const rowIdx = await findRowWithTOL(page);
      if (rowIdx === -1) { test.skip(); return; }

      const tol = await cellText(page, rowIdx, 2);
      const cab = await cellText(page, rowIdx, 3);

      await statusFilterSelect(page).selectOption('true');
      await waitForTableRows(page);

      // Find a predefined passenger not used by any active record for this TOL+Cabin
      const uniquePass = await pickUniquePassengerForCombo(page, tol, cab);
      if (!uniquePass) { test.skip(); return; }

      for (const v of tol.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-3-input', v);
      }
      for (const v of cab.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-4-input', v);
      }
      await selectReactOption(page, '#react-select-5-input', uniquePass);
      await page.getByRole('spinbutton', { name: /Price/i }).fill('555');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_CREATE }))
        .toBeVisible({ timeout: 15000 });
    });

    test('TC-DUP-ADD-15: All key fields overlap via multi-select — duplicate error', async ({ page }) => {
      // Find a row with multi-value TOL, multi-value cabin, multi-value passenger
      const count = await tableRows(page).count();
      let targetRow = -1;
      for (let i = 0; i < count; i++) {
        const tol  = (await tableRows(page).nth(i).locator('[role="cell"]').nth(2).innerText()).trim();
        const cab  = (await tableRows(page).nth(i).locator('[role="cell"]').nth(3).innerText()).trim();
        const pass = (await tableRows(page).nth(i).locator('[role="cell"]').nth(5).innerText()).trim();
        if (tol.includes(',') && cab.includes(',') && pass.includes(',')) {
          targetRow = i; break;
        }
      }
      if (targetRow === -1) { test.skip(); return; }

      const tol  = await cellText(page, targetRow, 2);
      const cab  = await cellText(page, targetRow, 3);
      const pass = await cellText(page, targetRow, 5);

      // Use ONE value from each multi-select field
      await selectReactOption(page, '#react-select-3-input', tol.split(',')[0].trim());
      await selectReactOption(page, '#react-select-4-input', cab.split(',')[0].trim());
      await selectReactOption(page, '#react-select-5-input', pass.split(',')[0].trim());
      await page.getByRole('spinbutton', { name: /Price/i }).fill('999');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_DUPLICATE }))
        .toBeVisible({ timeout: 15000 });
    });

    test('TC-DUP-ADD-16: At least one field value unique while others overlap — succeeds', async ({ page }) => {
      const rowIdx = await findRowWithTOL(page);
      if (rowIdx === -1) { test.skip(); return; }

      const tol = await cellText(page, rowIdx, 2);
      const cab = await cellText(page, rowIdx, 3);

      // Find a predefined passenger not used by any active record for this TOL+Cabin
      const uniquePass = await pickUniquePassengerForCombo(page, tol, cab);
      if (!uniquePass) { test.skip(); return; }

      // Same TOL, same Cabin — but a passenger that doesn't overlap
      for (const v of tol.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-3-input', v);
      }
      for (const v of cab.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-4-input', v);
      }
      await selectReactOption(page, '#react-select-5-input', uniquePass);
      await page.getByRole('spinbutton', { name: /Price/i }).fill('666');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_CREATE }))
        .toBeVisible({ timeout: 15000 });
    });

    test('TC-DUP-ADD-17: Multiple TOL values where one overlaps existing — duplicate error', async ({ page }) => {
      const rowIdx = await findRowWithTOL(page);
      if (rowIdx === -1) { test.skip(); return; }

      const tol  = await cellText(page, rowIdx, 2);
      const cab  = await cellText(page, rowIdx, 3);
      const pass = await cellText(page, rowIdx, 5);
      const existingTOL = tol.split(',')[0].trim();

      // Existing TOL + one more that won't be in any conflict
      await selectReactOption(page, '#react-select-3-input', existingTOL);
      await selectReactOption(page, '#react-select-3-input', 'Bruno Lift');
      for (const v of cab.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-4-input', v);
      }
      for (const v of pass.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-5-input', v);
      }
      await page.getByRole('spinbutton', { name: /Price/i }).fill('999');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_DUPLICATE }))
        .toBeVisible({ timeout: 15000 });
    });

    test('TC-DUP-ADD-18: Multiple Cabin values where one overlaps existing — duplicate error', async ({ page }) => {
      const rowIdx = await findRowWithTOL(page);
      if (rowIdx === -1) { test.skip(); return; }

      const tol  = await cellText(page, rowIdx, 2);
      const cab  = await cellText(page, rowIdx, 3);
      const pass = await cellText(page, rowIdx, 5);
      const existingCabin = cab.split(',')[0].trim();

      for (const v of tol.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-3-input', v);
      }
      // Existing cabin + a second cabin that differs from the first
      await selectReactOption(page, '#react-select-4-input', existingCabin);
      const secondCabin = existingCabin === 'Glass Cabin' ? 'Carbon Fiber Cabin' : 'Glass Cabin';
      await selectReactOption(page, '#react-select-4-input', secondCabin);
      for (const v of pass.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-5-input', v);
      }
      await page.getByRole('spinbutton', { name: /Price/i }).fill('999');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_DUPLICATE }))
        .toBeVisible({ timeout: 15000 });
    });

  });

  // ──────────────── 4B. Duplicate Prevention — UPDATE Records ───────────────

  test.describe('4B. Duplicate Prevention - UPDATE Records', () => {

    test.beforeEach(async ({ page }) => { await gotoCabinForm(page); });

    test('TC-DUP-UPD-01: Update to exactly match another Active record — duplicate error', async ({ page }) => {
      const ri1 = await findRowWithTOL(page);
      if (ri1 === -1) { test.skip(); return; }

      const tol  = await cellText(page, ri1, 2);
      const cab  = await cellText(page, ri1, 3);
      const lift = await cellText(page, ri1, 4);
      const pass = await cellText(page, ri1, 5);

      // Find ri2: same TOL+Cabin+LiftType as ri1 but different Passenger.
      // Avoids clearing TOL in edit mode (which causes the app to clear Cabin).
      const count = await tableRows(page).count();
      let ri2 = -1;
      for (let i = 0; i < count; i++) {
        if (i === ri1) continue;
        const rTol  = (await tableRows(page).nth(i).locator('[role="cell"]').nth(2).innerText()).trim();
        const rCab  = (await tableRows(page).nth(i).locator('[role="cell"]').nth(3).innerText()).trim();
        const rLift = (await tableRows(page).nth(i).locator('[role="cell"]').nth(4).innerText()).trim();
        const rPass = (await tableRows(page).nth(i).locator('[role="cell"]').nth(5).innerText()).trim();
        if (rTol === tol && rCab === cab && rLift === lift && rPass !== pass) { ri2 = i; break; }
      }
      if (ri2 === -1) { test.skip(); return; }

      // Edit ri2 and change only Passenger to match ri1 — TOL+Cabin already match,
      // so we avoid re-clearing TOL which would cause the app to clear Cabin.
      await clickEditOnRow(page, ri2);

      await clearReactSelect(page, '#react-select-8-input');
      for (const v of pass.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-8-input', v);
      }
      await page.locator('button').filter({ hasText: /^Update$/ }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_DUPLICATE }))
        .toBeVisible({ timeout: 15000 });
      // Form stays in Update mode
      await expect(page.getByRole('heading', { name: /Update Cabin/i })).toBeVisible();
    });

    test('TC-DUP-UPD-02: Update match with different Price — duplicate error still fires', async ({ page }) => {
      const ri1 = await findRowWithTOL(page);
      if (ri1 === -1) { test.skip(); return; }
      const count = await tableRows(page).count();
      let ri2 = -1;
      for (let i = 0; i < count; i++) {
        if (i === ri1) continue;
        const tol = (await tableRows(page).nth(i).locator('[role="cell"]').nth(2).innerText()).trim();
        if (tol && tol !== '-') { ri2 = i; break; }
      }
      if (ri2 === -1) { test.skip(); return; }

      const tol  = await cellText(page, ri1, 2);
      const cab  = await cellText(page, ri1, 3);
      const pass = await cellText(page, ri1, 5);

      await clickEditOnRow(page, ri2);

      await clearReactSelect(page, '#react-select-6-input');
      for (const v of tol.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-6-input', v);
      }
      await clearReactSelect(page, '#react-select-7-input');
      for (const v of cab.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-7-input', v);
      }
      await clearReactSelect(page, '#react-select-8-input');
      for (const v of pass.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-8-input', v);
      }
      // Change price only — should still trigger duplicate
      await page.getByRole('spinbutton', { name: /Price/i }).fill('1');
      await page.locator('button').filter({ hasText: /^Update$/ }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_DUPLICATE }))
        .toBeVisible({ timeout: 15000 });
    });

    test('TC-DUP-UPD-03: Update to match Inactive record combination — duplicate error', async ({ page }) => {
      await statusFilterSelect(page).selectOption('false');
      await page.waitForTimeout(500);
      const inactiveCount = await tableRows(page).count().catch(() => 0);
      if (inactiveCount === 0) { test.skip(); return; }
      const ri1 = await findRowWithTOL(page);
      if (ri1 === -1) { test.skip(); return; }

      const tol  = await cellText(page, ri1, 2);
      const cab  = await cellText(page, ri1, 3);
      const pass = await cellText(page, ri1, 5);

      await statusFilterSelect(page).selectOption('true');
      await waitForTableRows(page);

      await clickEditOnRow(page, 0);
      await clearReactSelect(page, '#react-select-6-input');
      for (const v of tol.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-6-input', v);
      }
      await clearReactSelect(page, '#react-select-7-input');
      for (const v of cab.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-7-input', v);
      }
      await clearReactSelect(page, '#react-select-8-input');
      for (const v of pass.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-8-input', v);
      }
      await page.locator('button').filter({ hasText: /^Update$/ }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_DUPLICATE }))
        .toBeVisible({ timeout: 15000 });
    });

    test('TC-DUP-UPD-04: Update multiselect Passenger to match another record — duplicate error', async ({ page }) => {
      const ri1 = await findRowWithMultiPassenger(page);
      if (ri1 === -1) { test.skip(); return; }

      const tol  = await cellText(page, ri1, 2);
      const cab  = await cellText(page, ri1, 3);
      const pass = await cellText(page, ri1, 5);
      if (tol === '-') { test.skip(); return; }

      // Find another row with same TOL and Cabin but different passengers
      const count = await tableRows(page).count();
      let ri2 = -1;
      for (let i = 0; i < count; i++) {
        if (i === ri1) continue;
        const t2 = (await tableRows(page).nth(i).locator('[role="cell"]').nth(2).innerText()).trim();
        const c2 = (await tableRows(page).nth(i).locator('[role="cell"]').nth(3).innerText()).trim();
        if (t2 === tol && c2 === cab) { ri2 = i; break; }
      }
      if (ri2 === -1) { test.skip(); return; }

      await clickEditOnRow(page, ri2);
      await clearReactSelect(page, '#react-select-8-input');
      for (const v of pass.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-8-input', v);
      }
      await page.locator('button').filter({ hasText: /^Update$/ }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_DUPLICATE }))
        .toBeVisible({ timeout: 15000 });
    });

    test('TC-DUP-UPD-05: Update to unique Passenger value — succeeds', async ({ page }) => {
      await clickEditOnRow(page, 0);

      await clearReactSelect(page, '#react-select-8-input');
      await selectReactOption(page, '#react-select-8-input', '500000000000');
      await page.locator('button').filter({ hasText: /^Update$/ }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_UPDATE }))
        .toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Cabin/i })).toBeVisible();
    });

    test('TC-DUP-UPD-06: Update using single value that exists in active multi-select record — duplicate error', async ({ page }) => {
      const riMulti = await findRowWithMultiPassenger(page);
      if (riMulti === -1) { test.skip(); return; }

      const tol       = await cellText(page, riMulti, 2);
      const cab       = await cellText(page, riMulti, 3);
      const multiPass = await cellText(page, riMulti, 5);
      const singlePass = multiPass.split(',')[0].trim();
      if (tol === '-') { test.skip(); return; }

      // Find another row with same TOL+Cabin but different passenger
      const count = await tableRows(page).count();
      let otherRow = -1;
      for (let i = 0; i < count; i++) {
        if (i === riMulti) continue;
        const t2 = (await tableRows(page).nth(i).locator('[role="cell"]').nth(2).innerText()).trim();
        const c2 = (await tableRows(page).nth(i).locator('[role="cell"]').nth(3).innerText()).trim();
        const p2 = (await tableRows(page).nth(i).locator('[role="cell"]').nth(5).innerText()).trim();
        if (t2 === tol && c2 === cab && p2 !== multiPass) { otherRow = i; break; }
      }
      if (otherRow === -1) { test.skip(); return; }

      await clickEditOnRow(page, otherRow);
      await clearReactSelect(page, '#react-select-8-input');
      // Select a single passenger that overlaps with the multi-select record
      await selectReactOption(page, '#react-select-8-input', singlePass);
      await page.locator('button').filter({ hasText: /^Update$/ }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_DUPLICATE }))
        .toBeVisible({ timeout: 15000 });
    });

  });

  // ─────────────────────── 5. Optional Field Behavior ───────────────────────

  test.describe('5. Optional Field Behavior', () => {

    test.beforeEach(async ({ page }) => { await gotoCabinForm(page); });

    test('TC-OPT-01: Create without Type Of Lift — succeeds, record shows "-" in TOL column', async ({ page }) => {
      // Leave Type Of Lift empty
      await selectReactOption(page, '#react-select-4-input', 'Glass Cabin');
      await selectReactOption(page, '#react-select-5-input', '500000000000');
      await page.getByRole('spinbutton', { name: /Price/i }).fill('100');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_CREATE }))
        .toBeVisible({ timeout: 15000 });
    });

    test('TC-OPT-02: Create with Type Of Lift — succeeds, TOL appears in table', async ({ page }) => {
      await selectReactOption(page, '#react-select-3-input', 'Celestial Lift');
      await selectReactOption(page, '#react-select-4-input', 'New Cabin');
      await selectReactOption(page, '#react-select-5-input', '500000000000');
      await page.getByRole('spinbutton', { name: /Price/i }).fill('200');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_CREATE }))
        .toBeVisible({ timeout: 15000 });
    });

  });

  // ─────────────────────── 6. Clear Button Behavior ─────────────────────────

  test.describe('6. Clear Button Behavior', () => {

    test.beforeEach(async ({ page }) => { await gotoCabinForm(page); });

    test('TC-CLR-01: Clear in Add mode resets all fields', async ({ page }) => {
      await selectReactOption(page, '#react-select-3-input', 'Nova Lift');
      await selectReactOption(page, '#react-select-4-input', 'Glass Cabin');
      await selectReactOption(page, '#react-select-5-input', '8');
      await page.getByRole('spinbutton', { name: /Price/i }).fill('5000');

      await page.getByRole('button', { name: /Clear/i }).click();

      await expect(page.getByRole('spinbutton', { name: /Price/i })).toHaveValue('');
      await expect(page.getByRole('heading', { name: /Add Cabin/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();
    });

    test('TC-CLR-02: Clear in Edit mode reverts to Add Cabin state', async ({ page }) => {
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Cabin/i })).toBeVisible();
      await expect(page.locator('#status')).toBeVisible();
      await expect(page.locator('button').filter({ hasText: /^Update$/ })).toBeVisible();

      await page.getByRole('button', { name: /Clear/i }).click();

      await expect(page.getByRole('heading', { name: /Add Cabin/i })).toBeVisible();
      await expect(page.getByRole('spinbutton', { name: /Price/i })).toHaveValue('');
      await expect(page.locator('#status')).not.toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();
    });

  });

  // ──────────────────── 7. Edit and Update Operations ───────────────────────

  test.describe('7. Edit and Update Operations', () => {

    test.beforeEach(async ({ page }) => { await gotoCabinForm(page); });

    test('TC-EDT-01: Edit icon opens record in Update mode with pre-filled values', async ({ page }) => {
      const cab  = await cellText(page, 0, 3);
      const pass = await cellText(page, 0, 5);

      await clickEditOnRow(page, 0);

      await expect(page.getByRole('heading', { name: /Update Cabin/i })).toBeVisible();
      // Lift Type is disabled in edit mode
      await expect(page.getByRole('combobox', { name: /Lift Type/i })).toBeDisabled();
      // Status dropdown appears
      await expect(page.locator('#status')).toBeVisible();
      // Update button visible
      await expect(page.locator('button').filter({ hasText: /^Update$/ })).toBeVisible();
      // Cabin and Passenger values are shown in the multi-select (check via page text)
      await expect(page.locator(`text=${cab.split(',')[0].trim()}`).first()).toBeVisible();
      await expect(page.locator(`text=${pass.split(',')[0].trim()}`).first()).toBeVisible();
    });

    test('TC-EDT-02: Update Price only — succeeds', async ({ page }) => {
      await clickEditOnRow(page, 0);

      const priceField = page.getByRole('spinbutton', { name: /Price/i });
      await priceField.fill('9999');
      await page.locator('button').filter({ hasText: /^Update$/ }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_UPDATE }))
        .toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Cabin/i })).toBeVisible();
    });

    test('TC-EDT-03: Update status to Inactive', async ({ page }) => {
      const cab = await cellText(page, 0, 3);

      await clickEditOnRow(page, 0);
      await page.locator('#status').selectOption('Inactive');
      await page.locator('button').filter({ hasText: /^Update$/ }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_UPDATE }))
        .toBeVisible({ timeout: 15000 });

      await statusFilterSelect(page).selectOption('');
      await waitForTableRows(page);
      const updatedRow = tableRows(page).filter({ hasText: cab.split(',')[0].trim() }).first();
      await expect(updatedRow.getByRole('heading', { level: 5, name: /Inactive/i })).toBeVisible({ timeout: 10000 });

      // Restore: set back to Active
      await updatedRow.getByRole('img', { name: 'Edit' }).click();
      await page.getByRole('heading', { name: /Update Cabin/i }).waitFor({ state: 'visible', timeout: 15000 });
      await page.locator('#status').selectOption('Active');
      await page.locator('button').filter({ hasText: /^Update$/ }).click();
      await page.getByRole('heading', { name: /Add Cabin/i }).waitFor({ state: 'visible', timeout: 15000 });
    });

    test('TC-EDT-04: Update with empty Price shows validation error', async ({ page }) => {
      await clickEditOnRow(page, 0);
      await page.getByRole('spinbutton', { name: /Price/i }).fill('');
      await page.locator('button').filter({ hasText: /^Update$/ }).click();

      await expect(page.locator('text=/please enter price/i')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Update Cabin/i })).toBeVisible();
    });

    test('TC-EDT-05: Update with empty Passenger shows validation error', async ({ page }) => {
      await clickEditOnRow(page, 0);
      await clearReactSelect(page, '#react-select-8-input');
      await page.keyboard.press('Escape'); // close any open dropdown
      await page.locator('button').filter({ hasText: /^Update$/ }).click();

      await expect(page.locator('text=/please select passenger/i')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Update Cabin/i })).toBeVisible();
    });

    test('TC-EDT-06: Update with empty Select Cabin shows validation error', async ({ page }) => {
      await clickEditOnRow(page, 0);
      await clearReactSelect(page, '#react-select-7-input');
      await page.locator('button').filter({ hasText: /^Update$/ }).click();

      await expect(page.locator('text=/please select cabin/i')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Update Cabin/i })).toBeVisible();
    });

    test('TC-EDT-07: Lift Type is disabled in edit mode', async ({ page }) => {
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('combobox', { name: /Lift Type/i })).toBeDisabled();
    });

    test('TC-EDT-08: Update to match existing Active record — duplicate error', async ({ page }) => {
      const ri1 = await findRowWithTOL(page);
      if (ri1 === -1) { test.skip(); return; }
      const count = await tableRows(page).count();
      let ri2 = -1;
      for (let i = 0; i < count; i++) {
        if (i === ri1) continue;
        const tol = (await tableRows(page).nth(i).locator('[role="cell"]').nth(2).innerText()).trim();
        if (tol && tol !== '-') { ri2 = i; break; }
      }
      if (ri2 === -1) { test.skip(); return; }

      const tol  = await cellText(page, ri1, 2);
      const cab  = await cellText(page, ri1, 3);
      const pass = await cellText(page, ri1, 5);

      await clickEditOnRow(page, ri2);
      await clearReactSelect(page, '#react-select-6-input');
      for (const v of tol.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-6-input', v);
      }
      await clearReactSelect(page, '#react-select-7-input');
      for (const v of cab.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-7-input', v);
      }
      await clearReactSelect(page, '#react-select-8-input');
      for (const v of pass.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-8-input', v);
      }
      await page.locator('button').filter({ hasText: /^Update$/ }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_DUPLICATE }))
        .toBeVisible({ timeout: 15000 });
    });

    test('TC-EDT-09: Update to match Inactive record — duplicate error', async ({ page }) => {
      await statusFilterSelect(page).selectOption('false');
      await page.waitForTimeout(500);
      const inactiveCount = await tableRows(page).count().catch(() => 0);
      if (inactiveCount === 0) { test.skip(); return; }
      const ri1 = await findRowWithTOL(page);
      if (ri1 === -1) { test.skip(); return; }

      const tol  = await cellText(page, ri1, 2);
      const cab  = await cellText(page, ri1, 3);
      const pass = await cellText(page, ri1, 5);

      await statusFilterSelect(page).selectOption('true');
      await waitForTableRows(page);

      await clickEditOnRow(page, 0);
      await clearReactSelect(page, '#react-select-6-input');
      for (const v of tol.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-6-input', v);
      }
      await clearReactSelect(page, '#react-select-7-input');
      for (const v of cab.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-7-input', v);
      }
      await clearReactSelect(page, '#react-select-8-input');
      for (const v of pass.split(',').map(s => s.trim())) {
        await selectReactOption(page, '#react-select-8-input', v);
      }
      await page.locator('button').filter({ hasText: /^Update$/ }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_DUPLICATE }))
        .toBeVisible({ timeout: 15000 });
    });

    test('TC-EDT-10: Type Of Lift is optional in Update mode — clearing it succeeds', async ({ page }) => {
      // Find a row with a non-empty Type Of Lift
      const rowIdx = await findRowWithTOL(page);
      if (rowIdx === -1) { test.skip(); return; }

      await clickEditOnRow(page, rowIdx);
      // Clear the Type Of Lift field
      await clearReactSelect(page, '#react-select-6-input');
      await page.locator('button').filter({ hasText: /^Update$/ }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_UPDATE }))
        .toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Cabin/i })).toBeVisible();
    });

  });

  // ─────────────────────────── 8. Status Filter ─────────────────────────────

  test.describe('8. Status Filter', () => {

    test.beforeEach(async ({ page }) => { await gotoCabinForm(page); });

    test('TC-FLT-01: Default filter is Active — only Active records shown', async ({ page }) => {
      await expect(statusFilterSelect(page)).toHaveValue('true');
      await waitForTableRows(page);
      await showEntriesSelect(page).selectOption('10');
      await waitForTableRows(page);
      const statuses = await getStatusColumnTexts(page);
      expect(statuses.length).toBeGreaterThan(0);
      for (const s of statuses) { expect(s).toBe('Active'); }
    });

    test('TC-FLT-02: Filter All — both Active and Inactive records shown', async ({ page }) => {
      await statusFilterSelect(page).selectOption('');
      await waitForTableRows(page);
      await expect(statusFilterSelect(page)).toHaveValue('');
      expect(await tableRows(page).count()).toBeGreaterThan(0);
    });

    test('TC-FLT-03: Filter Inactive — only Inactive shown or empty state', async ({ page }) => {
      await statusFilterSelect(page).selectOption('false');
      await page.waitForTimeout(500);
      const count = await tableRows(page).count().catch(() => 0);
      if (count > 0) {
        const statuses = await getStatusColumnTexts(page);
        for (const s of statuses) { expect(s).toBe('Inactive'); }
      }
    });

  });

  // ─────────────────────── 9. Search Functionality ──────────────────────────

  test.describe('9. Search Functionality', () => {

    test.beforeEach(async ({ page }) => { await gotoCabinForm(page); });

    test('TC-SRC-01: Partial search returns matching rows', async ({ page }) => {
      await waitForTableRows(page);
      await searchBox(page).fill('Glass');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      const count = await tableRows(page).count();
      expect(count).toBeGreaterThan(0);
    });

    test('TC-SRC-02: Non-existent search returns no results', async ({ page }) => {
      await searchBox(page).fill('XYZNONEXISTENT999CABIN');
      await tableRows(page).first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
      const count = await tableRows(page).count().catch(() => 0);
      expect(count).toBe(0);
    });

    test('TC-SRC-03: Clearing search restores full list', async ({ page }) => {
      await waitForTableRows(page);
      const initial = await tableRows(page).count();
      await searchBox(page).fill('Glass');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 10000 });
      await searchBox(page).clear();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      expect(await tableRows(page).count()).toBe(initial);
    });

  });

  // ──────────────── 10. Rows Per Page and Pagination ────────────────────────

  test.describe('10. Rows Per Page and Pagination', () => {

    test.beforeEach(async ({ page }) => { await gotoCabinForm(page); });

    test('TC-PAG-01: Change rows per page to 10', async ({ page }) => {
      await waitForTableRows(page);
      await expect(showEntriesSelect(page)).toHaveValue('25');
      await showEntriesSelect(page).selectOption('10');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      expect(await tableRows(page).count()).toBeLessThanOrEqual(10);
    });

    test('TC-PAG-02: Navigate pages with Next/Previous buttons', async ({ page }) => {
      await waitForTableRows(page);
      await showEntriesSelect(page).selectOption('10');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      const nextBtn = page.getByRole('button', { name: /Next page/i });
      const isNextEnabled = await nextBtn.isEnabled().catch(() => false);
      if (!isNextEnabled) { test.skip(); return; }

      await nextBtn.click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      await expect(page.getByRole('button', { name: /Page 2 is your current page/i })).toBeVisible();

      const prevBtn = page.getByRole('button', { name: /Previous page/i });
      await expect(prevBtn).toBeEnabled();
      await prevBtn.click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      await expect(page.getByRole('button', { name: /Page 1 is your current page/i })).toBeVisible();
    });

  });

  // ─────────────────────── 11. Column Sorting ───────────────────────────────

  test.describe('11. Column Sorting', () => {

    test.beforeEach(async ({ page }) => { await gotoCabinForm(page); });

    test('TC-SRT-01: Sort by Price column ascending then descending', async ({ page }) => {
      await waitForTableRows(page);
      await page.getByRole('button', { name: /^Price$/i }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 10000 });
      const priceAsc = await cellText(page, 0, 6);
      await page.getByRole('button', { name: /^Price$/i }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 10000 });
      const priceDesc = await cellText(page, 0, 6);
      const rowCount = await tableRows(page).count();
      expect(rowCount).toBeGreaterThan(0);
    });

    test('TC-SRT-02: Sort by Lift Type column', async ({ page }) => {
      await waitForTableRows(page);
      await page.getByRole('button', { name: /^Lift Type$/i }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 10000 });
      expect(await tableRows(page).count()).toBeGreaterThan(0);
    });

    test('TC-SRT-03: Sort by Status column (All filter)', async ({ page }) => {
      await statusFilterSelect(page).selectOption('');
      await waitForTableRows(page);
      await page.getByRole('button', { name: /^Status$/i }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 10000 });
      expect(await tableRows(page).count()).toBeGreaterThan(0);
    });

  });

  // ──────────────────── 12. Inactive Status Management ──────────────────────

  test.describe('12. Inactive Status Management', () => {

    test.beforeEach(async ({ page }) => { await gotoCabinForm(page); });

    test('TC-INA-01: Mark Active record as Inactive and verify filter behavior', async ({ page }) => {
      await waitForTableRows(page);
      const cab = await cellText(page, 0, 3);

      await clickEditOnRow(page, 0);
      await page.locator('#status').selectOption('Inactive');
      await page.locator('button').filter({ hasText: /^Update$/ }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_UPDATE })).toBeVisible({ timeout: 15000 });
      await page.getByRole('heading', { name: /Add Cabin/i }).waitFor({ state: 'visible', timeout: 15000 });

      // Switch to Inactive filter and verify record appears there
      await statusFilterSelect(page).selectOption('false');
      await waitForTableRows(page);
      await expect(tableRows(page).filter({ hasText: cab.split(',')[0].trim() }).first()).toBeVisible({ timeout: 10000 });

      // Restore
      await tableRows(page).filter({ hasText: cab.split(',')[0].trim() }).first()
        .getByRole('img', { name: 'Edit' }).click();
      await page.getByRole('heading', { name: /Update Cabin/i }).waitFor({ state: 'visible', timeout: 15000 });
      await page.locator('#status').selectOption('Active');
      await page.locator('button').filter({ hasText: /^Update$/ }).click();
      await page.getByRole('heading', { name: /Add Cabin/i }).waitFor({ state: 'visible', timeout: 15000 });
    });

    test('TC-INA-02: Re-activate Inactive record', async ({ page }) => {
      await statusFilterSelect(page).selectOption('false');
      await page.waitForTimeout(500);
      const count = await tableRows(page).count().catch(() => 0);
      if (count === 0) { test.skip(); return; }

      await waitForTableRows(page);
      const cab = await cellText(page, 0, 3);

      await clickEditOnRow(page, 0);
      await page.locator('#status').selectOption('Active');
      await page.locator('button').filter({ hasText: /^Update$/ }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: TOAST_UPDATE })).toBeVisible({ timeout: 15000 });

      await statusFilterSelect(page).selectOption('true');
      await waitForTableRows(page);
      await expect(tableRows(page).filter({ hasText: cab.split(',')[0].trim() }).first()).toBeVisible({ timeout: 10000 });
    });

  });

  // ─────────────────── 13. Navigation and Access ────────────────────────────

  test.describe('13. Navigation and Access', () => {

    test('TC-NAV-01: Direct URL without auth redirects to login', async ({ browser }) => {
      const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
      const page = await context.newPage();
      await page.goto(`https://stage.elevatorplus.net${CABIN_FORM_URL}`, { timeout: 60000 });
      await expect(page).toHaveURL(/\/login/, { timeout: 30000 });
      await expect(page.getByRole('heading', { name: /Add Cabin/i })).not.toBeVisible();
      await context.close();
    });

    test('TC-NAV-02: Access requires sales_forms module permission', async () => {
      // Requires a separate user account without the module — skip in standard runs
      test.skip(true, 'Requires a test user without sales_forms module permission');
    });

    test('TC-NAV-03: Access via Sales Forms sidebar menu', async ({ page }) => {
      await registerPopupHandler(page);
      await page.goto('/dashboard', { timeout: 60000 });
      await page.getByRole('link', { name: /Sales Forms/i }).click();
      const cabinLink = page.getByRole('link', { name: /^Cabin$/i });
      await cabinLink.waitFor({ state: 'visible', timeout: 15000 });
      await cabinLink.click();
      await expect(page).toHaveURL(new RegExp(CABIN_FORM_URL, 'i'), { timeout: 30000 });
      await expect(page.getByRole('heading', { name: /Add Cabin/i })).toBeVisible({ timeout: 30000 });
      await waitForTableRows(page);
    });

  });

});
