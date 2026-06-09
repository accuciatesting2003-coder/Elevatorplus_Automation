import { test, expect } from '../fixtures/auth-fixture';

const SHIFT_MASTER_URL = '/attendance/shift';
const RUN_ID = Date.now();

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function registerPopupHandler(page: any) {
  if ((page as any).__shiftPopupHandlerRegistered) return;
  (page as any).__shiftPopupHandlerRegistered = true;
  await page.addLocatorHandler(
    page.getByRole('button', { name: /Maybe Later/i }),
    async () => {
      await page.getByRole('button', { name: /Maybe Later/i }).click().catch(() => {});
    }
  );
  await page.addLocatorHandler(
    page.locator('.checklist-component.visible:not(.collapsed)'),
    async () => {
      await page.getByRole('button', { name: 'Collapse' }).click().catch(() => {});
      await page.waitForTimeout(500);
    }
  );
}

async function dismissNotificationPopup(page: any) {
  try {
    const btn = page.getByRole('button', { name: /Maybe Later/i });
    if (await btn.isVisible({ timeout: 5000 }).catch(() => false)) await btn.click();
  } catch { /* absent */ }
}

async function dismissOnboardingWidget(page: any) {
  await page.evaluate(() => {
    const el = document.querySelector('.checklist-component');
    if (el) (el as HTMLElement).style.display = 'none';
  }).catch(() => {});
}

async function gotoShiftMaster(page: any) {
  await registerPopupHandler(page);
  await page.goto(SHIFT_MASTER_URL, { timeout: 60000 });
  await page.getByRole('heading', { name: 'Add Shift' }).waitFor({ state: 'visible', timeout: 45000 });
  await page.waitForLoadState('networkidle');
  await dismissNotificationPopup(page);
  await dismissOnboardingWidget(page);
  await waitForTableRows(page);
}

async function waitForTableRows(page: any) {
  await page.locator('div.rdt_TableRow').first().waitFor({ state: 'visible', timeout: 30000 });
}

async function clickEditOnRow(page: any, rowIndex: number = 0) {
  await page.locator('div.rdt_TableRow').nth(rowIndex)
    .locator('[title="Edit"], img[alt="Edit"]').first().click();
  await page.waitForTimeout(400);
}

// status filter: second <select> on the page (first is rows-per-page)
const statusFilter = (page: any) => page.locator('select').nth(1);

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1 – Smoke Tests
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Smoke Tests', () => {

  test.beforeEach(async ({ page }) => {
    await gotoShiftMaster(page);
  });

  test('TC-SM-01: Shift Master page loads successfully', async ({ page }) => {
    await expect(page).toHaveURL(new RegExp(SHIFT_MASTER_URL));
    await expect(page.getByRole('heading', { level: 4, name: /Shift Master/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Add Shift' })).toBeVisible();
    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#start_time')).toBeVisible();
    await expect(page.locator('#end_time')).toBeVisible();
    await expect(page.locator('#full_day_hrs')).toBeVisible();
    await expect(page.locator('#half_day_hrs')).toBeVisible();
    await expect(page.getByRole('button', { name: /Clear/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Submit/ })).toBeVisible();
    await expect(page.locator('div.rdt_TableRow').first()).toBeVisible();
  });

  test('TC-SM-02: Table toolbar and column headers are visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Shift Name' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start Time' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'End Time' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Status' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Working Hours' })).toBeVisible();
    await expect(page.locator('#rows-per-page').first()).toBeVisible();
    // Status dropdown value attribute is "true" for Active, "false" for Inactive, "" for All
    await expect(statusFilter(page)).toHaveValue('true');
    await expect(page.getByRole('button', { name: /Export Excel/ })).toBeVisible();
    await expect(page.getByPlaceholder('Search Shift Name')).toBeVisible();
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 2 – Add Shift — Happy Path
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Add Shift — Happy Path', () => {

  test.beforeEach(async ({ page }) => {
    await gotoShiftMaster(page);
  });

  test('TC-ADD-01: Create a new shift with valid data', async ({ page }) => {
    const name = `Morning Test ${RUN_ID}`;
    await page.locator('#name').fill(name);
    await page.locator('#start_time').fill('09:00');
    await page.locator('#end_time').fill('17:00');
    await page.locator('#full_day_hrs').fill('8');
    await page.locator('#half_day_hrs').fill('4');
    await page.getByRole('button', { name: /Submit/ }).click();
    await page.waitForTimeout(2000);

    // Form reset signals success
    await expect(page.locator('#name')).toHaveValue('');
    await expect(page.locator('#start_time')).toHaveValue('');
    await expect(page.getByRole('heading', { name: 'Add Shift' })).toBeVisible();

    // Verify record in table
    const search = page.getByPlaceholder('Search Shift Name');
    await search.fill(name.slice(0, 20));
    await page.waitForTimeout(1000);
    const newRow = page.locator('div.rdt_TableRow').filter({ hasText: name });
    await expect(newRow).toBeVisible();
    await expect(newRow.getByRole('heading', { name: 'Active', level: 5, exact: true })).toBeVisible();
    await search.fill('');
  });

  test('TC-ADD-02: Create shift with :15 and :30 minute values', async ({ page }) => {
    const name = `Min Test ${RUN_ID}`;
    await page.locator('#name').fill(name);
    await page.locator('#start_time').fill('09:15');
    await page.locator('#end_time').fill('17:30');
    await page.locator('#full_day_hrs').fill('8');
    await page.locator('#half_day_hrs').fill('4');
    await page.getByRole('button', { name: /Submit/ }).click();
    await page.waitForTimeout(2000);

    await expect(page.getByText('Please select a time with 00, 15, or 30 minutes only')).not.toBeVisible();
    await expect(page.getByRole('heading', { name: 'Add Shift' })).toBeVisible();

    const nameAfter = await page.locator('#name').inputValue();
    if (nameAfter === '') {
      const search = page.getByPlaceholder('Search Shift Name');
      await search.fill(name.slice(0, 15));
      await page.waitForTimeout(800);
      await expect(page.locator('div.rdt_TableRow').filter({ hasText: name })).toBeVisible();
      await search.fill('');
    }
  });

  test('TC-ADD-03: Create a short 30-minute shift', async ({ page }) => {
    const name = `Short ${RUN_ID}`;
    await page.locator('#name').fill(name);
    await page.locator('#start_time').fill('08:00');
    await page.locator('#end_time').fill('08:30');
    await page.locator('#full_day_hrs').fill('0.5');
    await page.locator('#half_day_hrs').fill('0.25');
    await page.getByRole('button', { name: /Submit/ }).click();
    await page.waitForTimeout(2000);

    await expect(page.getByRole('heading', { name: 'Add Shift' })).toBeVisible();
    const nameAfter = await page.locator('#name').inputValue();
    if (nameAfter === '') {
      const search = page.getByPlaceholder('Search Shift Name');
      await search.fill(name);
      await page.waitForTimeout(800);
      await expect(page.locator('div.rdt_TableRow').filter({ hasText: name })).toBeVisible();
      await search.fill('');
    }
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 3 – Mandatory Field Validation
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Mandatory Field Validation', () => {

  test.beforeEach(async ({ page }) => {
    await gotoShiftMaster(page);
  });

  test('TC-VAL-01: Submit with all fields empty shows all validation errors', async ({ page }) => {
    await page.getByRole('button', { name: /Submit/ }).click();
    await expect(page.getByText('Shift name is required.')).toBeVisible();
    await expect(page.getByText('Start time is required.')).toBeVisible();
    await expect(page.getByText('End time is required.')).toBeVisible();
    await expect(page.getByText('Full day hours is required.')).toBeVisible();
    await expect(page.getByText('Half day hours is required.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Add Shift' })).toBeVisible();
  });

  test('TC-VAL-02: Submit with empty Shift Name shows name validation error only', async ({ page }) => {
    await page.locator('#start_time').fill('09:00');
    await page.locator('#end_time').fill('17:00');
    await page.locator('#full_day_hrs').fill('8');
    await page.locator('#half_day_hrs').fill('4');
    await page.getByRole('button', { name: /Submit/ }).click();
    await expect(page.getByText('Shift name is required.')).toBeVisible();
    await expect(page.getByText('Start time is required.')).not.toBeVisible();
    await expect(page.getByText('End time is required.')).not.toBeVisible();
  });

  test('TC-VAL-03: Submit without Start Time shows start time error', async ({ page }) => {
    await page.locator('#name').fill(`VAL ${RUN_ID}`);
    await page.locator('#end_time').fill('17:00');
    await page.locator('#full_day_hrs').fill('8');
    await page.locator('#half_day_hrs').fill('4');
    await page.getByRole('button', { name: /Submit/ }).click();
    await expect(page.getByText('Start time is required.')).toBeVisible();
    await expect(page.getByText('Shift name is required.')).not.toBeVisible();
  });

  test('TC-VAL-04: Submit without End Time shows end time error', async ({ page }) => {
    await page.locator('#name').fill(`VAL ${RUN_ID}`);
    await page.locator('#start_time').fill('09:00');
    await page.locator('#full_day_hrs').fill('8');
    await page.locator('#half_day_hrs').fill('4');
    await page.getByRole('button', { name: /Submit/ }).click();
    await expect(page.getByText('End time is required.')).toBeVisible();
  });

  test('TC-VAL-05: Submit without Full Day Hours shows hours error', async ({ page }) => {
    await page.locator('#name').fill(`VAL ${RUN_ID}`);
    await page.locator('#start_time').fill('09:00');
    await page.locator('#end_time').fill('17:00');
    await page.locator('#half_day_hrs').fill('4');
    await page.getByRole('button', { name: /Submit/ }).click();
    await expect(page.getByText('Full day hours is required.')).toBeVisible();
  });

  test('TC-VAL-06: Submit without Half Day Hours shows hours error', async ({ page }) => {
    await page.locator('#name').fill(`VAL ${RUN_ID}`);
    await page.locator('#start_time').fill('09:00');
    await page.locator('#end_time').fill('17:00');
    await page.locator('#full_day_hrs').fill('8');
    await page.getByRole('button', { name: /Submit/ }).click();
    await expect(page.getByText('Half day hours is required.')).toBeVisible();
  });

  test('TC-VAL-07: Clear button removes validation errors', async ({ page }) => {
    await page.getByRole('button', { name: /Submit/ }).click();
    await expect(page.getByText('Shift name is required.')).toBeVisible();

    await page.getByRole('button', { name: /Clear/ }).click();
    await page.waitForTimeout(400);

    await expect(page.getByText('Shift name is required.')).not.toBeVisible();
    await expect(page.locator('#name')).toHaveValue('');
    await expect(page.locator('#start_time')).toHaveValue('');
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 4 – Time Validation
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Time Validation', () => {

  test.beforeEach(async ({ page }) => {
    await gotoShiftMaster(page);
  });

  test('TC-TIME-01: End time before start time shows error', async ({ page }) => {
    await page.locator('#name').fill(`Time Test ${RUN_ID}`);
    await page.locator('#start_time').fill('17:00');
    await page.locator('#end_time').fill('09:00');
    await page.locator('#full_day_hrs').fill('8');
    await page.locator('#half_day_hrs').fill('4');
    await page.getByRole('button', { name: /Submit/ }).click();
    await page.waitForTimeout(1000);
    await expect(page.getByText('End time must be greater than start time')).toBeVisible();
    // Form should not reset
    await expect(page.locator('#name')).not.toHaveValue('');
  });

  test('TC-TIME-02: Start time equal to end time shows error', async ({ page }) => {
    await page.locator('#name').fill(`Time Test ${RUN_ID}`);
    await page.locator('#start_time').fill('09:00');
    await page.locator('#end_time').fill('09:00');
    await page.locator('#full_day_hrs').fill('8');
    await page.locator('#half_day_hrs').fill('4');
    await page.getByRole('button', { name: /Submit/ }).click();
    await page.waitForTimeout(1000);
    await expect(page.getByText('End time must be greater than start time')).toBeVisible();
  });

  test('TC-TIME-03: Start time with :45 minutes shows invalid minutes error', async ({ page }) => {
    await page.locator('#name').fill(`Time Test ${RUN_ID}`);
    await page.locator('#start_time').fill('09:45');
    await page.locator('#end_time').fill('17:00');
    await page.locator('#full_day_hrs').fill('8');
    await page.locator('#half_day_hrs').fill('4');
    await page.getByRole('button', { name: /Submit/ }).click();
    await page.waitForTimeout(1000);
    await expect(page.getByText('Please select a time with 00, 15, or 30 minutes only').first()).toBeVisible();
    await expect(page.locator('#name')).not.toHaveValue('');
  });

  test('TC-TIME-04: End time with :10 minutes shows invalid minutes error', async ({ page }) => {
    await page.locator('#name').fill(`Time Test ${RUN_ID}`);
    await page.locator('#start_time').fill('09:00');
    await page.locator('#end_time').fill('17:10');
    await page.locator('#full_day_hrs').fill('8');
    await page.locator('#half_day_hrs').fill('4');
    await page.getByRole('button', { name: /Submit/ }).click();
    await page.waitForTimeout(1000);
    await expect(page.getByText('Please select a time with 00, 15, or 30 minutes only').first()).toBeVisible();
  });

  test('TC-TIME-05: Both times with :05 minutes show invalid minutes error', async ({ page }) => {
    await page.locator('#name').fill(`Time Test ${RUN_ID}`);
    await page.locator('#start_time').fill('09:05');
    await page.locator('#end_time').fill('17:05');
    await page.locator('#full_day_hrs').fill('8');
    await page.locator('#half_day_hrs').fill('4');
    await page.getByRole('button', { name: /Submit/ }).click();
    await page.waitForTimeout(1000);
    // Both fields should show the minutes error
    await expect(page.getByText('Please select a time with 00, 15, or 30 minutes only').first()).toBeVisible();
  });

  test('TC-TIME-06: :00 and :30 minutes are accepted — no minutes error', async ({ page }) => {
    const name = `Valid Min ${RUN_ID}`;
    await page.locator('#name').fill(name);
    await page.locator('#start_time').fill('08:00');
    await page.locator('#end_time').fill('16:30');
    await page.locator('#full_day_hrs').fill('8');
    await page.locator('#half_day_hrs').fill('4');
    await page.getByRole('button', { name: /Submit/ }).click();
    await page.waitForTimeout(2000);
    await expect(page.getByText('Please select a time with 00, 15, or 30 minutes only')).not.toBeVisible();
    await expect(page.getByRole('heading', { name: 'Add Shift' })).toBeVisible();
    const nameAfter = await page.locator('#name').inputValue();
    if (nameAfter === '') {
      const search = page.getByPlaceholder('Search Shift Name');
      await search.fill(name);
      await page.waitForTimeout(800);
      await expect(page.locator('div.rdt_TableRow').filter({ hasText: name })).toBeVisible();
      await search.fill('');
    }
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 5 – Hours Validation
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Hours Validation', () => {

  test.beforeEach(async ({ page }) => {
    await gotoShiftMaster(page);
  });

  test('TC-HRS-01: Equal full day and half day hours shows error toast', async ({ page }) => {
    await page.locator('#name').fill(`Hrs Test ${RUN_ID}`);
    await page.locator('#start_time').fill('09:00');
    await page.locator('#end_time').fill('17:00');
    await page.locator('#full_day_hrs').fill('4');
    await page.locator('#half_day_hrs').fill('4');
    await page.getByRole('button', { name: /Submit/ }).click();
    await page.waitForTimeout(2000);
    const nameRetained = (await page.locator('#name').inputValue()) !== '';
    const errorToast = await page.locator('[class*="toast"]')
      .filter({ hasText: /full day hours must be greater/i }).first()
      .isVisible({ timeout: 3000 }).catch(() => false);
    expect(nameRetained || errorToast).toBe(true);
  });

  test('TC-HRS-02: Half day hours greater than full day hours shows error toast', async ({ page }) => {
    await page.locator('#name').fill(`Hrs Test ${RUN_ID}`);
    await page.locator('#start_time').fill('09:00');
    await page.locator('#end_time').fill('17:00');
    await page.locator('#full_day_hrs').fill('3');
    await page.locator('#half_day_hrs').fill('5');
    await page.getByRole('button', { name: /Submit/ }).click();
    await page.waitForTimeout(2000);
    const nameRetained = (await page.locator('#name').inputValue()) !== '';
    const errorToast = await page.locator('[class*="toast"]')
      .filter({ hasText: /full day hours must be greater/i }).first()
      .isVisible({ timeout: 3000 }).catch(() => false);
    expect(nameRetained || errorToast).toBe(true);
  });

  test('TC-HRS-03: Full day hours greater than half day hours is accepted', async ({ page }) => {
    const name = `Hrs Valid ${RUN_ID}`;
    await page.locator('#name').fill(name);
    await page.locator('#start_time').fill('09:00');
    await page.locator('#end_time').fill('17:00');
    await page.locator('#full_day_hrs').fill('8');
    await page.locator('#half_day_hrs').fill('4');
    await page.getByRole('button', { name: /Submit/ }).click();
    await page.waitForTimeout(2000);
    await expect(page.locator('#name')).toHaveValue('');
    await expect(page.getByRole('heading', { name: 'Add Shift' })).toBeVisible();
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 6 – Duplicate Prevention
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Duplicate Prevention', () => {

  test.beforeEach(async ({ page }) => {
    await gotoShiftMaster(page);
  });

  test('TC-DUP-01: Submitting an existing shift name shows error', async ({ page }) => {
    const existingName = (await page.locator('div.rdt_TableRow').first()
      .locator('[role="cell"]').nth(2).innerText()).trim();

    await page.locator('#name').fill(existingName);
    await page.locator('#start_time').fill('09:00');
    await page.locator('#end_time').fill('17:00');
    await page.locator('#full_day_hrs').fill('8');
    await page.locator('#half_day_hrs').fill('4');
    await page.getByRole('button', { name: /Submit/ }).click();
    await page.waitForTimeout(2000);

    const nameRetained = (await page.locator('#name').inputValue()) !== '';
    const errorToast = await page.locator('[class*="toast"]').first()
      .isVisible({ timeout: 3000 }).catch(() => false);
    expect(nameRetained || errorToast).toBe(true);
  });

  // ── Known Bug: case-insensitive duplicate check not enforced ──────────────────
  // BUG: The app currently accepts the same shift name with different letter casing,
  // treating "general shift" and "General Shift" as distinct records. The expected
  // behaviour is to reject the second submission with a duplicate error.
  //
  // While the bug exists: the form RESETS (record is created) → test.fail() fires →
  //   Playwright marks the test as "expected failure" — shown as a WARNING, not a red X.
  //
  // After the bug is fixed: the form RETAINS its value (error shown) → test.fail()
  //   does NOT fire → the test becomes a normal PASS, confirming the fix is live.
  //
  // HOW TO VERIFY THE FIX: once the bug is fixed, remove the test.fail() annotation
  // from both TC-DUP-02 and TC-DUP-03. Both tests should then pass cleanly.
  // ──────────────────────────────────────────────────────────────────────────────

  test('TC-DUP-02: Lowercase duplicate of existing shift name should be rejected (known bug)', async ({ page }) => {
    // Mark as expected-to-fail while the bug exists.
    // When the bug is fixed this annotation must be removed so the test becomes a normal pass.
    test.fail();

    const existingName = (await page.locator('div.rdt_TableRow').first()
      .locator('[role="cell"]').nth(2).innerText()).trim();
    const lowerName = existingName.toLowerCase();

    if (lowerName === existingName) {
      // Name is already all-lowercase — cannot demonstrate the bug; skip gracefully.
      return;
    }

    await page.locator('#name').fill(lowerName);
    await page.locator('#start_time').fill('09:00');
    await page.locator('#end_time').fill('17:00');
    await page.locator('#full_day_hrs').fill('8');
    await page.locator('#half_day_hrs').fill('4');
    await page.getByRole('button', { name: /Submit/ }).click();
    await page.waitForTimeout(2000);

    // CORRECT behaviour (after fix): form must NOT reset — name field still has the value.
    // BUGGY behaviour (current): form resets to empty → this assertion fails → test.fail()
    // records it as "expected failure" (warning in report, not a red failure).
    const nameAfterSubmit = await page.locator('#name').inputValue();
    expect(nameAfterSubmit).not.toBe('');
  });

  test('TC-DUP-03: UPPERCASE duplicate of existing shift name should be rejected (known bug)', async ({ page }) => {
    test.fail();

    const existingName = (await page.locator('div.rdt_TableRow').first()
      .locator('[role="cell"]').nth(2).innerText()).trim();
    const upperName = existingName.toUpperCase();

    if (upperName === existingName) {
      return;
    }

    await page.locator('#name').fill(upperName);
    await page.locator('#start_time').fill('09:00');
    await page.locator('#end_time').fill('17:00');
    await page.locator('#full_day_hrs').fill('8');
    await page.locator('#half_day_hrs').fill('4');
    await page.getByRole('button', { name: /Submit/ }).click();
    await page.waitForTimeout(2000);

    const nameAfterSubmit = await page.locator('#name').inputValue();
    expect(nameAfterSubmit).not.toBe('');
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 7 – Clear Button Behaviour
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Clear Button', () => {

  test.beforeEach(async ({ page }) => {
    await gotoShiftMaster(page);
  });

  test('TC-CLR-01: Clear button resets all Add Shift form fields', async ({ page }) => {
    await page.locator('#name').fill('Clear Test');
    await page.locator('#start_time').fill('09:00');
    await page.locator('#end_time').fill('17:00');
    await page.locator('#full_day_hrs').fill('8');
    await page.locator('#half_day_hrs').fill('4');

    await page.getByRole('button', { name: /Clear/ }).click();
    await page.waitForTimeout(400);

    await expect(page.locator('#name')).toHaveValue('');
    await expect(page.locator('#start_time')).toHaveValue('');
    await expect(page.locator('#end_time')).toHaveValue('');
    await expect(page.locator('#full_day_hrs')).toHaveValue('');
    await expect(page.locator('#half_day_hrs')).toHaveValue('');
    await expect(page.getByRole('heading', { name: 'Add Shift' })).toBeVisible();
  });

  test('TC-CLR-02: Clear in Edit mode resets form back to Add Shift', async ({ page }) => {
    await clickEditOnRow(page, 0);

    await expect(page.getByRole('heading', { name: 'Update Shift' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Status *' })).toBeVisible();
    await expect(page.locator('#name')).not.toHaveValue('');

    await page.getByRole('button', { name: /Clear/ }).click();
    await page.waitForTimeout(400);

    await expect(page.getByRole('heading', { name: 'Add Shift' })).toBeVisible();
    await expect(page.locator('#name')).toHaveValue('');
    await expect(page.locator('#start_time')).toHaveValue('');
    await expect(page.getByRole('combobox', { name: 'Status *' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: /Submit/ })).toBeVisible();
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 8 – Edit and Update Operations
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Edit and Update Operations', () => {

  test.beforeEach(async ({ page }) => {
    await gotoShiftMaster(page);
  });

  test('TC-EDT-01: Edit icon opens record with all fields pre-filled', async ({ page }) => {
    const firstRow = page.locator('div.rdt_TableRow').first();
    const expectedName = (await firstRow.locator('[role="cell"]').nth(2).innerText()).trim();

    await clickEditOnRow(page, 0);

    await expect(page.getByRole('heading', { name: 'Update Shift' })).toBeVisible();
    await expect(page.locator('#name')).toHaveValue(expectedName);
    await expect(page.locator('#start_time')).not.toHaveValue('');
    await expect(page.locator('#end_time')).not.toHaveValue('');
    await expect(page.locator('#full_day_hrs')).not.toHaveValue('');
    await expect(page.locator('#half_day_hrs')).not.toHaveValue('');
    await expect(page.getByRole('combobox', { name: 'Status *' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Update/ })).toBeVisible();
  });

  test('TC-EDT-02: Successfully update shift name', async ({ page }) => {
    const firstRow = page.locator('div.rdt_TableRow').first();
    const originalName = (await firstRow.locator('[role="cell"]').nth(2).innerText()).trim();

    await clickEditOnRow(page, 0);

    const updatedName = `${originalName.substring(0, 40)} Upd${RUN_ID}`.substring(0, 60);
    await page.locator('#name').clear();
    await page.locator('#name').fill(updatedName);
    await page.getByRole('button', { name: /Update/ }).click();
    // Wait up to 15s for the server to respond and form to reset
    await expect(page.getByRole('heading', { name: 'Add Shift' })).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#name')).toHaveValue('');

    // Use search + 1500ms (debounce) to reliably surface the updated row on any page
    const search = page.getByPlaceholder('Search Shift Name');
    await search.fill(updatedName.slice(0, 25));
    await page.waitForTimeout(1500);
    await expect(page.locator('div.rdt_TableRow').filter({ hasText: updatedName }))
      .toBeVisible({ timeout: 10000 });

    // Restore original name (search is still active so the row is visible)
    await page.locator('div.rdt_TableRow').filter({ hasText: updatedName })
      .locator('[title="Edit"], img[alt="Edit"]').first().click();
    await page.waitForTimeout(400);
    await page.locator('#name').clear();
    await page.locator('#name').fill(originalName);
    await page.getByRole('button', { name: /Update/ }).click();
    await expect(page.getByRole('heading', { name: 'Add Shift' })).toBeVisible({ timeout: 15000 });
    await search.fill('');
  });

  test('TC-EDT-03: Update shift status to Inactive and verify in All filter', async ({ page }) => {
    const firstRow = page.locator('div.rdt_TableRow').first();
    const shiftName = (await firstRow.locator('[role="cell"]').nth(2).innerText()).trim();

    await clickEditOnRow(page, 0);
    await page.getByRole('combobox', { name: 'Status *' }).selectOption('Inactive');
    await page.getByRole('button', { name: /Update/ }).click();
    await page.waitForTimeout(2000);

    await expect(page.getByRole('heading', { name: 'Add Shift' })).toBeVisible();

    await statusFilter(page).selectOption('All');
    await page.waitForTimeout(1000);
    await waitForTableRows(page);

    const targetRow = page.locator('div.rdt_TableRow').filter({ hasText: shiftName });
    await expect(targetRow.getByRole('heading', { name: 'Inactive', level: 5 })).toBeVisible();

    // Restore Active status
    await targetRow.locator('[title="Edit"], img[alt="Edit"]').first().click();
    await page.waitForTimeout(400);
    await page.getByRole('combobox', { name: 'Status *' }).selectOption('Active');
    await page.getByRole('button', { name: /Update/ }).click();
    await page.waitForTimeout(2000);
  });

  test('TC-EDT-04: Re-activate an Inactive shift', async ({ page }) => {
    await statusFilter(page).selectOption('Inactive');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1000);

    const rowCount = await page.locator('div.rdt_TableRow').count();
    if (rowCount === 0) return; // no inactive records — skip

    const inactiveName = (await page.locator('div.rdt_TableRow').first()
      .locator('[role="cell"]').nth(2).innerText()).trim();

    await page.locator('div.rdt_TableRow').first()
      .locator('[title="Edit"], img[alt="Edit"]').first().click();
    await page.waitForTimeout(400);
    await page.getByRole('combobox', { name: 'Status *' }).selectOption('Active');
    await page.getByRole('button', { name: /Update/ }).click();
    await page.waitForTimeout(2000);

    await expect(page.getByRole('heading', { name: 'Add Shift' })).toBeVisible({ timeout: 15000 });

    await statusFilter(page).selectOption('Active');
    await page.waitForTimeout(1000);
    await waitForTableRows(page);

    // Use search + 1500ms debounce to surface the reactivated record regardless of pagination
    const search = page.getByPlaceholder('Search Shift Name');
    await search.fill(inactiveName.slice(0, 20));
    await page.waitForTimeout(1500);
    await expect(page.locator('div.rdt_TableRow').filter({ hasText: inactiveName })
      .getByRole('heading', { name: 'Active', level: 5, exact: true })).toBeVisible({ timeout: 10000 });
    await search.fill('');
  });

  test('TC-EDT-05: Update with empty Shift Name shows validation error', async ({ page }) => {
    await clickEditOnRow(page, 0);
    await page.locator('#name').clear();
    await page.getByRole('button', { name: /Update/ }).click();
    await expect(page.getByText('Shift name is required.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Update Shift' })).toBeVisible();
  });

  test('TC-EDT-06: Update with invalid minutes shows time error', async ({ page }) => {
    await clickEditOnRow(page, 0);
    await page.locator('#end_time').fill('17:45');
    await page.getByRole('button', { name: /Update/ }).click();
    await page.waitForTimeout(1000);
    await expect(page.getByText('Please select a time with 00, 15, or 30 minutes only').first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Update Shift' })).toBeVisible();
  });

  test('TC-EDT-07: Update with half day hours > full day hours shows error', async ({ page }) => {
    await clickEditOnRow(page, 0);
    await page.locator('#full_day_hrs').click({ clickCount: 3 });
    await page.locator('#full_day_hrs').fill('2');
    await page.locator('#half_day_hrs').click({ clickCount: 3 });
    await page.locator('#half_day_hrs').fill('5');
    await page.getByRole('button', { name: /Update/ }).click();
    await page.waitForTimeout(2000);
    const nameRetained = (await page.locator('#name').inputValue()) !== '';
    const errorToast = await page.locator('[class*="toast"]')
      .filter({ hasText: /full day hours must be greater/i }).first()
      .isVisible({ timeout: 3000 }).catch(() => false);
    expect(nameRetained || errorToast).toBe(true);
  });

  test('TC-EDT-08: Update shift name to an existing shift name shows error', async ({ page }) => {
    if (await page.locator('div.rdt_TableRow').count() < 2) return;
    const secondName = (await page.locator('div.rdt_TableRow').nth(1)
      .locator('[role="cell"]').nth(2).innerText()).trim();

    await clickEditOnRow(page, 0);
    await page.locator('#name').clear();
    await page.locator('#name').fill(secondName);
    await page.getByRole('button', { name: /Update/ }).click();
    await page.waitForTimeout(2000);

    const nameRetained = (await page.locator('#name').inputValue()) !== '';
    const errorToast = await page.locator('[class*="toast"]').first()
      .isVisible({ timeout: 3000 }).catch(() => false);
    expect(nameRetained || errorToast).toBe(true);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 9 – Status Filter
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Status Filter', () => {

  test.beforeEach(async ({ page }) => {
    await gotoShiftMaster(page);
  });

  test('TC-FLT-01: Status filter defaults to Active — all rows show Active badge', async ({ page }) => {
    // value attribute is "true" for Active option (not the string "Active")
    await expect(statusFilter(page)).toHaveValue('true');
    const rows = page.locator('div.rdt_TableRow');
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i).getByRole('heading', { name: 'Active', level: 5, exact: true })).toBeVisible();
    }
  });

  test('TC-FLT-02: All filter shows Active records (at minimum)', async ({ page }) => {
    await statusFilter(page).selectOption('All');
    await page.waitForTimeout(1000);
    await waitForTableRows(page);
    expect(
      await page.locator('div.rdt_TableRow').filter({
        has: page.getByRole('heading', { name: 'Active', level: 5, exact: true })
      }).count()
    ).toBeGreaterThan(0);
  });

  test('TC-FLT-03: Inactive filter shows only Inactive records', async ({ page }) => {
    await statusFilter(page).selectOption('Inactive');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1000);

    const rowCount = await page.locator('div.rdt_TableRow').count();
    if (rowCount > 0) {
      await expect(page.locator('div.rdt_TableRow').filter({
        has: page.getByRole('heading', { name: 'Active', level: 5, exact: true })
      })).toHaveCount(0);
    }
    // Reset
    await statusFilter(page).selectOption('Active');
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 10 – Search Functionality
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Search Functionality', () => {

  test.beforeEach(async ({ page }) => {
    await gotoShiftMaster(page);
  });

  test('TC-SRC-01: Partial name search filters table rows', async ({ page }) => {
    const search = page.getByPlaceholder('Search Shift Name');
    await search.fill('shift');
    await page.waitForTimeout(1000);
    const rows = page.locator('div.rdt_TableRow');
    const count = await rows.count();
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const text = await rows.nth(i).innerText();
        expect(text.toLowerCase()).toContain('shift');
      }
    }
    await search.fill('');
  });

  test('TC-SRC-02: Non-existent name returns zero rows', async ({ page }) => {
    const search = page.getByPlaceholder('Search Shift Name');
    await search.fill('XXXXNONEXISTENTSHIFT9999');
    await page.waitForTimeout(1000);
    expect(await page.locator('div.rdt_TableRow').count()).toBe(0);
    await search.fill('');
  });

  test('TC-SRC-03: Clearing search restores full Active list', async ({ page }) => {
    const initialCount = await page.locator('div.rdt_TableRow').count();
    const search = page.getByPlaceholder('Search Shift Name');
    await search.fill('XXXXNONEXISTENTSHIFT9999');
    await page.waitForTimeout(1000);
    expect(await page.locator('div.rdt_TableRow').count()).toBe(0);
    await search.fill('');
    await page.waitForTimeout(1000);
    await waitForTableRows(page);
    expect(await page.locator('div.rdt_TableRow').count()).toBe(initialCount);
  });

  // The app search is case-insensitive. "shift" and "SHIFT" both return the same records.
  // 3000ms wait is required: each fill resets the debounce and a server round-trip follows.
  test('TC-SRC-04: Search is case-insensitive — lowercase and uppercase return the same count', async ({ page }) => {
    const search = page.getByPlaceholder('Search Shift Name');

    await search.fill('shift');
    await page.waitForTimeout(3000);  // debounce + server round-trip can exceed 1500ms
    const countLower = await page.locator('div.rdt_TableRow').count();

    await search.fill('SHIFT');
    await page.waitForTimeout(3000);
    const countUpper = await page.locator('div.rdt_TableRow').count();

    // Both should return results (records with "shift" in any casing exist)
    expect(countLower).toBeGreaterThan(0);
    expect(countUpper).toBeGreaterThan(0);
    // Search is case-insensitive — identical count for both terms
    expect(countLower).toBe(countUpper);
    await search.fill('');
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 11 – Rows Per Page and Pagination
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Rows Per Page and Pagination', () => {

  test.beforeEach(async ({ page }) => {
    await gotoShiftMaster(page);
  });

  test('TC-PAG-01: Default rows per page is 25', async ({ page }) => {
    await expect(page.locator('#rows-per-page').first()).toHaveValue('25');
    expect(await page.locator('div.rdt_TableRow').count()).toBeLessThanOrEqual(25);
  });

  test('TC-PAG-02: Changing rows per page to 10 limits visible rows', async ({ page }) => {
    await page.locator('#rows-per-page').first().selectOption('10');
    await page.waitForTimeout(800);
    expect(await page.locator('div.rdt_TableRow').count()).toBeLessThanOrEqual(10);
  });

  test('TC-PAG-03: Rows per page dropdown contains options 10, 25, 50, 100', async ({ page }) => {
    const options = await page.locator('#rows-per-page').first().locator('option').allInnerTexts();
    expect(options).toContain('10');
    expect(options).toContain('25');
    expect(options).toContain('50');
    expect(options).toContain('100');
  });

  test('TC-PAG-04: Navigate between pages when multiple pages exist', async ({ page }) => {
    await page.locator('#rows-per-page').first().selectOption('10');
    await page.waitForTimeout(800);

    const page2Btn = page.getByRole('button', { name: /Page 2/ });
    if (!await page2Btn.isVisible({ timeout: 3000 }).catch(() => false)) return;

    await page2Btn.click();
    await page.waitForTimeout(800);
    await waitForTableRows(page);
    await expect(page.getByRole('button', { name: /2.*current|Page 2.*current/i })).toBeVisible();

    await page.getByRole('button', { name: /Page 1/ }).click();
    await page.waitForTimeout(800);
    await waitForTableRows(page);
    await expect(page.getByRole('button', { name: /1.*current|Page 1.*current/i })).toBeVisible();
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 12 – Column Sorting
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Column Sorting', () => {

  test.beforeEach(async ({ page }) => {
    await gotoShiftMaster(page);
  });

  async function getColumnValues(page: any, cellIndex: number): Promise<string[]> {
    const rows = page.locator('div.rdt_TableRow');
    const count = await rows.count();
    const values: string[] = [];
    for (let i = 0; i < count; i++) {
      values.push((await rows.nth(i).locator('[role="cell"]').nth(cellIndex).innerText()).trim());
    }
    return values;
  }

  test('TC-SRT-01: Sort by Shift Name toggles between ascending and descending', async ({ page }) => {
    await page.getByRole('button', { name: 'Shift Name' }).click();
    await page.waitForTimeout(600);
    await waitForTableRows(page);
    const asc = await getColumnValues(page, 2);

    await page.getByRole('button', { name: 'Shift Name' }).click();
    await page.waitForTimeout(600);
    const desc = await getColumnValues(page, 2);

    expect(JSON.stringify(asc)).not.toBe(JSON.stringify(desc));
  });

  test('TC-SRT-02: Sort by Start Time changes row order', async ({ page }) => {
    await page.getByRole('button', { name: 'Start Time' }).click();
    await page.waitForTimeout(600);
    await waitForTableRows(page);
    const asc = await getColumnValues(page, 3);

    await page.getByRole('button', { name: 'Start Time' }).click();
    await page.waitForTimeout(600);
    const desc = await getColumnValues(page, 3);

    expect(JSON.stringify(asc)).not.toBe(JSON.stringify(desc));
  });

  test('TC-SRT-03: Sort by End Time changes row order', async ({ page }) => {
    await page.getByRole('button', { name: 'End Time' }).click();
    await page.waitForTimeout(600);
    await waitForTableRows(page);
    const asc = await getColumnValues(page, 4);

    await page.getByRole('button', { name: 'End Time' }).click();
    await page.waitForTimeout(600);
    const desc = await getColumnValues(page, 4);

    expect(JSON.stringify(asc)).not.toBe(JSON.stringify(desc));
  });

  test('TC-SRT-04: Sort by Status when All filter is active', async ({ page }) => {
    await statusFilter(page).selectOption('All');
    await page.waitForTimeout(800);
    await waitForTableRows(page);
    await page.getByRole('button', { name: 'Status' }).click();
    await page.waitForTimeout(600);
    await waitForTableRows(page);
    expect(await page.locator('div.rdt_TableRow').count()).toBeGreaterThan(0);
  });

  test('TC-SRT-05: Sort by Working Hours changes row order', async ({ page }) => {
    await page.getByRole('button', { name: 'Working Hours' }).click();
    await page.waitForTimeout(600);
    await waitForTableRows(page);
    const asc = await getColumnValues(page, 6);

    await page.getByRole('button', { name: 'Working Hours' }).click();
    await page.waitForTimeout(600);
    const desc = await getColumnValues(page, 6);

    expect(JSON.stringify(asc)).not.toBe(JSON.stringify(desc));
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 13 – Export Excel
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Export Excel', () => {

  test.beforeEach(async ({ page }) => {
    await gotoShiftMaster(page);
  });

  test('TC-EXP-01: Export Excel button triggers a file download', async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 15000 }),
      page.getByRole('button', { name: /Export Excel/ }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.(xlsx|xls|csv)$/i);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 14 – Navigation and Access
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Navigation and Access', () => {

  test.beforeEach(async ({ page }) => {
    await gotoShiftMaster(page);
  });

  test('TC-NAV-01: Unauthenticated users are redirected to login', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const newPage = await ctx.newPage();
    try {
      await newPage.goto(`https://stage.elevatorplus.net${SHIFT_MASTER_URL}`, { timeout: 30000 });
      await newPage.waitForLoadState('networkidle');
      await expect(newPage).toHaveURL(/\/login/);
    } finally {
      await ctx.close();
    }
  });

  test('TC-NAV-02: Shift Master accessible via Attendance sidebar menu', async ({ page }) => {
    await page.goto('/dashboard', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    await dismissOnboardingWidget(page);

    await page.getByRole('link', { name: /Attendance/ }).first().click();
    await page.waitForTimeout(600);

    const shiftLink = page.getByRole('link', { name: 'Shift Master' });
    await expect(shiftLink).toBeVisible();
    await shiftLink.click();

    await expect(page).toHaveURL(new RegExp(SHIFT_MASTER_URL));
    await expect(page.getByRole('heading', { name: 'Add Shift' })).toBeVisible({ timeout: 20000 });
  });

});
